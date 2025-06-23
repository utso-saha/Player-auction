import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import axios from 'axios';
import avatar from "../../assets/playerAvatar.png";

const API = import.meta.env.VITE_API_URL;

export default function AuctionAddPlayers() {
    const { auctionId } = useParams();
    const { user } = useAuth0();
    const navigate = useNavigate();

    const [players, setPlayers] = useState([]);
    const [teams, setTeams] = useState([]);
    const [demoCount, setDemoCount] = useState(5);
    const [groupBy, setGroupBy] = useState("category");

    const [showModal, setShowModal] = useState(false);
    const [selectedPlayer, setSelectedPlayer] = useState(null);
    const [priceMultiplier, setPriceMultiplier] = useState(1);

    const [selectedTeamId, setSelectedTeamId] = useState("");

    const handleGenerateDemo = async () => {
        if (!demoCount || demoCount <= 0) {
            window.alert("Please enter a valid number of demo players.");
            return;
        }

        try {
            await axios.post(`${API}/player/generate-demo`, {
                auction_id: auctionId,
                count: parseInt(demoCount),
            });

            const res = await axios.get(`${API}/player/get`, {
                params: { auction_id: auctionId }
            });
            setPlayers(res.data);

            window.alert(`✅ Successfully added ${demoCount} demo players.`);
        } catch (error) {
            console.error("❌ Error generating demo players:", error.message);
            window.alert("❌ Failed to generate demo players.");
        }
    };

    const calculateAge = (dob) => {
        if (!dob) return '';
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const fetchPlayers = async () => {
        try {
            const res = await axios.get(`${API}/player/get`, {
                params: { auction_id: auctionId }
            });
            setPlayers(res.data);
        } catch (error) {
            console.error("❌ Error fetching players:", error.message);
        }
    };

    const fetchTeams = async () => {
        try {
            const res = await axios.get(`${API}/team/get`, {
                params: { auction_id: auctionId }
            });
            setTeams(res.data);
        } catch (error) {
            console.error("❌ Error fetching teams:", error.message);
        }
    };

    useEffect(() => {
        if (auctionId) {
            fetchPlayers();
            fetchTeams();
        }
    }, [auctionId]);

    const handleDelete = async (playerId) => {
        try {
            await axios.delete(`${API}/player/delete/${playerId}`);
            fetchPlayers();
            window.alert("🗑️ Player deleted successfully!");
        } catch (error) {
            console.error("❌ Error deleting player:", error.message);
            window.alert("❌ Failed to delete player. Please try again.");
        }
    };

    const handleAddPlayer = () => {
        navigate(`/auctionlayout/${auctionId}/add-player/form`);
    };

    const openAssignTeamModal = (player) => {
        setSelectedPlayer(player);
        setSelectedTeamId(player.team_id || "");
        setShowModal(true);
    };

    const assignTeamToPlayer = async () => {
        if (!selectedTeamId) {
            window.alert("Please select a team.");
            return;
        }

        try {
            const player = selectedPlayer;

            // Get fresh team and player category
            const team = teams.find(t => t._id === selectedTeamId);
            const basePrice = player.category?.base_price || 500;
            const finalPrice = Math.round(basePrice * priceMultiplier);

            if (team.budget_remaining < finalPrice) {
                return alert("❌ Not enough budget for selected multiplier.");
            }

            // Send update to backend
            await axios.put(`${API}/player/update/${player._id}`, {
                team_id: selectedTeamId,
                price: finalPrice,
                is_sold: true
            });

            await fetchPlayers();
            setShowModal(false);
            setSelectedPlayer(null);
            setSelectedTeamId("");
            setPriceMultiplier(1);
            alert(`✅ Player assigned at ${finalPrice} (${priceMultiplier}×).`);
        } catch (err) {
            console.error("❌ Error assigning team:", err.message);
            alert("❌ Failed to assign team.");
        }
    };


    return (
        <div className="min-h-screen w-full px-10 py-16 text-white">
            <div className="max-w-7xl mx-auto font-raleway">
                <div className="flex justify-between items-center mb-10 mt-20">
                    <h1 className="text-3xl font-bold">All Players</h1>
                </div>

                {/* Grouping Dropdown */}
                <div className="flex items-center gap-4 mb-6">
                    <label className="text-lg font-semibold">Group players by:</label>
                    <select
                        value={groupBy}
                        onChange={(e) => setGroupBy(e.target.value)}
                        className="bg-gray-700 text-white px-3 py-1 rounded"
                    >
                        <option value="category">Category</option>
                        <option value="role">Role</option>
                    </select>
                </div>

                {/* Grouped Players */}
                <div className="space-y-10">
                    {Object.entries(
                        players.reduce((acc, player) => {
                            const key = groupBy === "category"
                                ? player.category?.name || "Uncategorized"
                                : player.role || "Unassigned";

                            if (!acc[key]) acc[key] = [];
                            acc[key].push(player);
                            return acc;
                        }, {})
                    ).map(([groupName, groupedPlayers]) => (
                        <div key={groupName}>
                            <h2 className="text-3xl font-bold text-yellow-400 mb-4">{groupName}</h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                                {groupedPlayers.map((player) => (
                                    <div
                                        key={player._id}
                                        onClick={() => openAssignTeamModal(player)}
                                        className="cursor-pointer  bg-gray-800 group h-72 w-52 relative rounded-xl shadow-md flex flex-col justify-end"
                                        style={{
                                            backgroundColor: player.category?.color || '#27272a',
                                        }}
                                    >
                                        <div className="w-52 h-72  absolute flex items-center justify-center rounded-xl overflow-hidden">

                                                <img
                                                    src={player.photo_url || avatar}
                                                    alt={player.name}
                                                    className="z-10 p-2 mb-16 rounded-2xl object-cover w-52 h-72"
                                                    onError={(e) => {
                                                        e.target.onerror = null;
                                                        e.target.src = '/default_avatar.png';
                                                    }}
                                                />

                                            <div className="text-8xl top-5 text-black text-opacity-50 font-bebas absolute">
                                                {player.category?.name}
                                            </div>
                                        </div>

                                        <div className="z-10 h-auto bg-gray-900 bg-opacity-70 rounded-b-xl rounded-xl overflow-hidden">
                                            <h2 className="text-xl font-semibold flex justify-center items-center font-bebas p-2 truncate">{player.name}</h2>
                                            <p className="font-bebas relative text-gray-400  h-auto text-2xl flex p-2 bg-gray-900 justify-center bg-opacity-50 items-center">
                                                <div className='mr-2'>
                                                    {calculateAge(player.dob)}
                                                </div>
                                                {/* <span className="text-lg ml-1 font-raleway">years old</span> */}
                                                <div className='border-l-2 border-gray-400 text-gray-200 font-raleway text-sm ml-1 pl-3'>
                                                    {player.category?.name}
                                                </div>
                                            </p>
                                            <div className="w-full flex justify-center items-center px-2 py-2 bg-gray-900">
                                                <div className="text-xl font-raleway">{player.role}</div>
                                            </div>
                                            {player.team_name && (
                                                <div className="text-sm text-center text-green-400 bg-black bg-opacity-40">
                                                    Team: {player.team_name}
                                                </div>
                                            )}
                                            <div className="bg-gray-900 w-full px-2 flex justify-center items-center">
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDelete(player._id);
                                                    }}
                                                    className="hidden group-hover:block p-2 font-rubik font-bold hover:bg-white bg-gray-900 text-white text-sm px-4 rounded hover:text-black transition"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Add New Player */}
                <div className='mt-20'>
                    <button
                        onClick={handleAddPlayer}
                        className="bg-black text-white px-5 py-2 font-bold rounded hover:bg-zinc-800 transition"
                    >
                        + Add New Player
                    </button>
                </div>

                {/* Generate Demo Players */}
                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-2">🎲 Generate Demo Players</h2>
                    <div className="flex gap-4 items-center">
                        <input
                            type="number"
                            min="1"
                            placeholder="Number of players"
                            className="px-4 py-2 rounded text-black w-60"
                            value={demoCount}
                            onChange={(e) => setDemoCount(e.target.value)}
                        />
                        <button
                            onClick={handleGenerateDemo}
                            className="bg-indigo-600 hover:bg-indigo-700 transition px-5 py-2 text-white rounded font-semibold"
                        >
                            Generate
                        </button>
                    </div>
                </div>

                <div className="mt-10">
                    <h2 className="text-2xl font-bold mb-2">📥 Upload Players via Excel</h2>
                    <form
                        onSubmit={async (e) => {
                            e.preventDefault();
                            const file = e.target.elements.file.files[0];
                            if (!file) return alert("Please select a file");

                            const formData = new FormData();
                            formData.append("file", file);
                            formData.append("auction_id", auctionId);

                            try {
                                await axios.post(`${API}/player/upload-xlsx`, formData, {
                                    headers: { "Content-Type": "multipart/form-data" }
                                });
                                fetchPlayers();
                                alert("✅ Players uploaded from Excel.");
                            } catch (error) {
                                console.error("❌ Upload error:", error.message);
                                alert("❌ Failed to upload players.");
                            }
                        }}
                    >
                        <input type="file" name="file" accept=".xlsx" className="mb-2" />
                        <button type="submit" className="bg-green-600 text-white px-4 py-2 rounded">
                            Upload
                        </button>
                    </form>
                </div>

            </div>

            {/* Modal for Assigning Team */}
            {showModal && (
                <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
                    <div className="bg-white text-black p-6 rounded-lg w-[90%] max-w-md">
                        <h2 className="text-2xl font-bold mb-4">Assign Team to {selectedPlayer.name}</h2>

                        {/* Team Selector */}
                        <select
                            value={selectedTeamId}
                            onChange={(e) => setSelectedTeamId(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        >
                            <option value="">Select a team</option>
                            {teams.map(team => (
                                <option key={team._id} value={team._id}>
                                    {team.name}
                                </option>
                            ))}
                        </select>

                        {/* Multiplier Selector */}
                        <label className="block text-lg font-semibold mb-2">Price Multiplier</label>
                        <select
                            value={priceMultiplier}
                            onChange={(e) => setPriceMultiplier(parseFloat(e.target.value))}
                            className="w-full p-2 border border-gray-300 rounded mb-4"
                        >
                            <option value={1}>1× Base Price</option>
                            <option value={1.5}>1.5× Base Price</option>
                            <option value={2}>2× Base Price</option>
                        </select>


                        <div className="flex justify-end gap-4">
                            <button
                                onClick={() => setShowModal(false)}
                                className="px-4 py-2 bg-gray-400 text-white rounded"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={assignTeamToPlayer}
                                className="px-4 py-2 bg-blue-600 text-white rounded"
                            >
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
