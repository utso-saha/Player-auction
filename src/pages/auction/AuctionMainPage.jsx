import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth0 } from "@auth0/auth0-react";
import html2pdf from "html2pdf.js";
import { useRef } from "react";

import avatar from "../../assets/playerAvatar.png";


const API = import.meta.env.VITE_API_URL;



export default function AuctionMainPage() {
    const { auctionId } = useParams();
    const { user, isAuthenticated } = useAuth0();



    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);
    const [players, setPlayers] = useState([]);
    const [currentPlayer, setCurrentPlayer] = useState(null);
    const [selectedTeamId, setSelectedTeamId] = useState("");
    const [bidAmount, setBidAmount] = useState(null);
    const [bidStatus, setBidStatus] = useState("");
    const [highestBid, setHighestBid] = useState(0);
    const [isCustomBid, setIsCustomBid] = useState(false);

    const bidIncrement = 1000;



    const sellPlayer = async () => {
        if (!currentPlayer) {
            setBidStatus("❌ No player to sell.");
            return;
        }

        try {
            const res = await axios.get(`${API}/bid/playerBids`, {
                params: { auction_id: auctionId, player_id: currentPlayer._id }
            });

            const highestBidEntry = res.data.length > 0 ? res.data[0] : null;

            if (!highestBidEntry) {
                setBidStatus("❌ No bids to sell this player.");
                return;
            }

            const teamId = highestBidEntry.team_id?._id || highestBidEntry.team_id; // Fallback if populated or not
            const finalPrice = highestBidEntry.price;

            await axios.post(`${API}/bid/sellPlayer`, {
                auction_id: auctionId,
                player_id: currentPlayer._id,
                team_id: teamId
            });

            setBidStatus(`✅ ${currentPlayer.name} sold to ${highestBidEntry.team_id.name || 'team'} for $${finalPrice}`);
            // await selectRandomUnsoldPlayer(); // ✅ auto-pick next player
        } catch (err) {
            console.error("❌ Failed to sell player:", err.message);
            setBidStatus("❌ Failed to sell player.");
        }
    };




    const calculateAge = (dob) => {
        if (!dob) return "";
        const birthDate = new Date(dob);
        const today = new Date();
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
            age--;
        }
        return age;
    };

    const selectRandomUnsoldPlayer = async () => {
        try {
            // ✅ Always fetch the latest players from the server
            const res = await axios.get(`${API}/player/get`, {
                params: { auction_id: auctionId }
            });

            const freshPlayers = res.data;
            setPlayers(freshPlayers); // Update state

            const unsoldPlayers = freshPlayers.filter(player => !player.is_sold);

            if (unsoldPlayers.length === 0) {
                setCurrentPlayer(null);
                setBidStatus("✅ All players are sold.");
                return;
            }

            const selected = unsoldPlayers[Math.floor(Math.random() * unsoldPlayers.length)];
            setCurrentPlayer(selected);
            setIsCustomBid(false);

            await axios.post(`${API}/auctionDetails/setCurrentPlayer`, {
                auction_id: auctionId,
                player_id: selected._id
            });
        } catch (err) {
            console.error("❌ Failed to select unsold player:", err.message);
        }
    };


    const placeBid = async () => {
        if (!selectedTeamId || !currentPlayer) {
            setBidStatus("Please select a team.");
            return;
        }

        try {
            // 🔁 Fetch the latest bids before placing
            const res = await axios.get(`${API}/bid/playerBids`, {
                params: { auction_id: auctionId, player_id: currentPlayer._id }
            });

            let latestHighest = 0;
            if (res.data.length > 0) {
                latestHighest = res.data[0].price;
            } else if (currentPlayer?.category?.base_price) {
                latestHighest = currentPlayer.category.base_price - bidIncrement;
            }
            const autoBid = latestHighest + bidIncrement;


            await axios.post(`${API}/bid/place`, {
                auction_id: auctionId,
                player_id: currentPlayer._id,
                team_id: selectedTeamId,
                price: autoBid
            });

            setBidStatus(`✅ Bid placed: $${autoBid}`);
        } catch (err) {
            console.error("❌ Failed to place bid:", err.message);
            setBidStatus("❌ Failed to place bid.");
        }
    };

    useEffect(() => {
        const fetchAuction = async () => {
            try {
                const res = await axios.get(`${API}/addauction/getAuction`, {
                    params: { _id: auctionId }
                });
                setAuction(res.data[0]);
            } catch (err) {
                console.error("❌ Error fetching auction:", err.message);
            }
        };
        if (auctionId) fetchAuction();
    }, [auctionId]);

    useEffect(() => {
        const fetchTeams = async () => {
            try {
                const res = await axios.get(`${API}/team/get`, {
                    params: { auction_id: auctionId }
                });
                setTeams(res.data);
            } catch (err) {
                console.error("❌ Error fetching teams:", err.message);
            }
        };
        if (auctionId) fetchTeams();
    }, [auctionId]);

    useEffect(() => {
        let intervalId;

        const fetchCurrentPlayer = async () => {
            try {
                const res = await axios.get(`${API}/auctionDetails/getCurrentPlayer`, {
                    params: { auction_id: auctionId }
                });
                if (res.data && res.data._id) {
                    setCurrentPlayer(res.data);
                } else {
                    setCurrentPlayer(null);
                }
            } catch (err) {
                console.error("❌ Error fetching current player:", err.message);
            }
        };

        if (auctionId) {
            fetchCurrentPlayer();
            intervalId = setInterval(fetchCurrentPlayer, 3000);
        }

        return () => clearInterval(intervalId);
    }, [auctionId]);


    useEffect(() => {
        let intervalId;

        const fetchCurrentPlayer = async () => {
            try {
                const res = await axios.get(`${API}/auctionDetails/getCurrentPlayer`, {
                    params: { auction_id: auctionId }
                });
                if (res.data && res.data._id) {
                    setCurrentPlayer(res.data);
                } else {
                    // Optionally: set to null if no active player
                    setCurrentPlayer(null);
                }
            } catch (err) {
                console.error("❌ Error fetching current player:", err.message);
            }
        };

        if (auctionId) {
            fetchCurrentPlayer(); // ✅ get current player on initial load
            intervalId = setInterval(fetchCurrentPlayer, 3000); // 🔁 keep polling
        }

        return () => clearInterval(intervalId);
    }, [auctionId]);


    if (!isAuthenticated || !auction) return null;

    return (
        <div className="p-10 text-white">
            <h1 className="text-3xl font-bold mb-5">{auction.name}</h1>

            {user.sub === auction.creator_id ? (
                <div className="mb-10 p-5 border rounded border-green-600">
                    <h2 className="text-xl font-bold mb-2 text-green-300">Creator Controls</h2>
                    <button
                        onClick={selectRandomUnsoldPlayer}
                        className="bg-blue-600 px-4 py-2 rounded hover:bg-blue-700"
                    >
                        🎲 Pick Random Unsold Player
                    </button>

                    {currentPlayer && (
                        <div className="mt-6 bg-gray-900 text-white p-4 rounded">
                            <h3 className="text-xl font-bold">Current Player</h3>
                            <p>Name: {currentPlayer.name}</p>
                            <p>Role: {currentPlayer.role}</p>
                            <p>Tier: {currentPlayer.category?.name}</p>
                            <p>Starting Price: ${currentPlayer.category?.base_price}</p>

                            <div className="mt-4">
                                {!currentPlayer.is_sold && (
                                    <>
                                        <label className="block mb-1">Select Team</label>
                                        <select
                                            value={selectedTeamId}
                                            onChange={(e) => setSelectedTeamId(e.target.value)}
                                            className="bg-gray-800 p-2 rounded text-white w-full"
                                        >
                                            <option value="">Select Team</option>
                                            {teams.map(team => (
                                                <option key={team._id} value={team._id}>
                                                    {team.name}
                                                </option>
                                            ))}
                                        </select>
                                    </>
                                )}


                                {/* <label className="block mt-4 mb-1">Bid Amount</label>
                                <input
                                    type="number"
                                    // min={highestBid + bidIncrement}
                                    min={highestBid + 500}
                                    onChange={(e) => {
                                        setIsCustomBid(true);
                                        setBidAmount(Number(e.target.value));
                                    }}
                                    className="bg-gray-800 p-2 rounded text-white w-full"
                                /> */}

                                {!currentPlayer.is_sold && (
                                    <button
                                        onClick={placeBid}
                                        className="bg-yellow-600 px-4 py-2 mt-4 rounded hover:bg-yellow-700"
                                    >
                                        💸 Place Bid (Next: ${highestBid + 500})
                                    </button>
                                )}


                                {!currentPlayer.is_sold && (
                                    <button
                                        onClick={sellPlayer}
                                        className="bg-green-600 px-4 py-2 mt-2 rounded hover:bg-green-700"
                                    >
                                        ✅ Sell Player
                                    </button>
                                )}


                                <p className="mt-2 text-sm text-green-400">{bidStatus}</p>
                            </div>
                        </div>
                    )}
                </div>
            ) : (
                <div className="mt-6 p-5">
                    {/* <h2 className="text-xl font-bold mb-3">Auction Viewer</h2> */}
                    {currentPlayer ? (
                        <div className="flex justify-evenly">
                            <div className="flex justify-center p-5 border rounded-xl border-gray-600 bg-gray-800">
                                <div
                                    className="bg-gray-800 group h-72 w-52 relative rounded-xl shadow-md flex flex-col justify-end"
                                    style={{
                                        backgroundColor: currentPlayer.category?.color || '#27272a',
                                    }}
                                >
                                    <div className="w-52 h-72 absolute flex items-center justify-center rounded-xl overflow-hidden">
                                        <img
                                            src={currentPlayer.photo_url || avatar}
                                            alt={currentPlayer.name}
                                            className="z-10 mb-16 object-cover w-52 h-72"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/default_avatar.png';
                                            }}
                                        />
                                        <div className="text-8xl top-5 text-white text-opacity-50 font-bebas absolute">
                                            {currentPlayer.category?.name}
                                        </div>
                                    </div>

                                    <div className="z-10 h-auto bg-gray-900 bg-opacity-70 rounded-b-xl overflow-hidden">
                                        <h2 className="text-xl font-semibold flex justify-center items-center font-bebas p-2 truncate">
                                            {currentPlayer.name}
                                        </h2>
                                        <p className="font-bebas relative text-gray-400  h-auto text-2xl flex p-2 bg-gray-900 justify-center bg-opacity-50 items-center">
                                            <div className='mr-2'>
                                                {calculateAge(currentPlayer.dob)}
                                            </div>
                                            {/* <span className="text-lg ml-1 font-raleway">years old</span> */}
                                            <div className='border-l-2 border-gray-400 text-gray-200 font-raleway text-sm ml-1 pl-3'>
                                                {currentPlayer.category?.name}
                                            </div>
                                        </p>
                                        <div className="w-full flex justify-center items-center px-2 py-2 bg-gray-900">
                                            <div className="text-xl font-raleway">{currentPlayer.role}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="ml-4 text-white w-full max-w-md   border rounded-xl border-gray-600 bg-gray-800">
                                {/* <h3 className="text-lg font-semibold mb-2">📝 Bids for {currentPlayer.name}</h3> */}
                                <p className="text-white rounded-xl h-12 font-raleway font-bold mb-2 text-center text-2xl w-full bg-gray-950 flex justify-center items-center">
                                    🟢 Starting Price: ${currentPlayer.category?.base_price || 1000}
                                </p>

                                <div className="p-5">
                                    {/* ✅ Always show bid list */}
                                    <BidList
                                        auctionId={auctionId}
                                        playerId={currentPlayer._id}
                                        isSold={currentPlayer.is_sold}
                                        soldTo={currentPlayer.team_id}
                                        onHighestBid={(val) => {
                                            const base = currentPlayer?.category?.base_price || 1000;
                                            const next = val > 0 ? val + bidIncrement : base;

                                            setHighestBid(val);
                                            if (!isCustomBid) {
                                                setBidAmount(next);
                                            }
                                        }}
                                    />
                                </div>

                                {/* ✅ Only creator sees buttons */}
                                {user.sub === auction.creator_id && (
                                    !currentPlayer.is_sold ? (
                                        <>
                                            <button
                                                onClick={placeBid}
                                                disabled={!selectedTeamId}
                                                className="bg-yellow-600 px-4 py-2 mt-4 rounded hover:bg-yellow-700 disabled:opacity-50"
                                            >
                                                💸 Place Bid (Next: ${highestBid + 1000})
                                            </button>


                                            <button
                                                onClick={sellPlayer}
                                                className="bg-green-600 px-4 py-2 mt-2 rounded hover:bg-green-700"
                                            >
                                                ✅ Sell Player
                                            </button>
                                        </>
                                    ) : (
                                        <button
                                            onClick={selectRandomUnsoldPlayer}
                                            className="bg-blue-600 px-4 py-2 mt-4 rounded hover:bg-blue-700"
                                        >
                                            ➡️ Next Player
                                        </button>
                                    )
                                )}
                            </div>
                            <div>
                                <BudgetList auctionId={auctionId} />
                            </div>


                        </div>
                    ) : (
                        <p className="text-gray-300">No player selected yet.</p>
                    )}
                </div>
            )}


        </div>
    );
}

function BidList({ auctionId, playerId, onHighestBid, isSold, soldTo }) {
    const [bids, setBids] = useState([]);

    useEffect(() => {
        const fetchBids = async () => {
            try {
                const res = await axios.get(`${API}/bid/playerBids`, {
                    params: { auction_id: auctionId, player_id: playerId }
                });
                setBids(res.data);

                const highest = res.data.length > 0 ? res.data[0].price : 0;

                // Ensure starting bid shown if no bids
                if (onHighestBid) {
                    onHighestBid(highest);
                }

            } catch (err) {
                console.error("❌ Error fetching bids:", err.message);
            }
        };

        if (auctionId && playerId) {
            fetchBids();
            const interval = setInterval(fetchBids, 3000);
            return () => clearInterval(interval);
        }
    }, [auctionId, playerId, onHighestBid]);


    if (isSold && soldTo) {
        return (
            <div className="text-green-400 font-semibold text-center">
                <div className="font-rubik text-gray-400 italic font-bold text-2xl">
                    ✅ Sold to:
                </div>

                <div className="rounded-full overflow-hidden m-4">

                    <img src={soldTo.logo_url}>
                    </img>
                </div>
                <div className="font-rubik font-bold text-white text-2xl bg-slate-900 rounded-xl p-4">
                    {soldTo.name || "a team"}
                </div>
                <div className="font-rubik text-gray-400 italic font-bold text-2xl">
                    for
                </div>
                <div className="font-rubik text-white font-bold text-2xl bg-slate-900 rounded-xl p-4">
                    ${bids?.[0]?.price || "N/A"}
                </div>
            </div>
        );
    }

    if (bids.length === 0) {
        return <p className="text-gray-400 text-sm">No bids yet.</p>;
    }


    return (
        <ul className="space-y-2">
            {bids.map((bid, index) => (
                <li
                    key={index}
                    className=" p-2 relative overflow-hidden rounded-xl shadow flex justify-between items-center"
                    style={{ backgroundColor: bid.team_id?.color_code || '#1f2937' }} // fallback to Tailwind gray-800
                >
                    <div className="z-10 text-white absolute w-40 rounded-full overflow-hidden  flex-shrink-0">
                        <img
                            src={bid.team_id?.logo_url || "/default_team_logo.png"}
                            alt={bid.team_id?.name || "Team Logo"}
                            className="object-cover opacity-30 w-full h-full"
                            onError={(e) => {
                                e.target.onerror = null;
                                e.target.src = "/default_team_logo.png"; // fallback image
                            }}
                        />
                    </div>
                    <div className="z-10">
                        <p className="font-bold font-rubik text-2xl text-white">{bid.team_id?.name || "Unnamed Team"}</p>
                        <p className="text-sm text-white">{new Date(bid.timestamp).toLocaleTimeString()}</p>
                    </div>
                    <span className="text-white font-bold text-4xl">${bid.price}</span>
                </li>
            ))}
        </ul>

    );
}


function BudgetList({ auctionId }) {
    const [budgets, setBudgets] = useState([]);
    const [selectedTeam, setSelectedTeam] = useState(null);
    const [safeBids, setSafeBids] = useState({});

    const fetchSafeBids = async (teams) => {
        const results = {};

        for (const team of teams) {
            try {
                const res = await axios.get(`${API}/bid/maxSafeBid`, {
                    params: { auction_id: auctionId, team_id: team._id }
                });
                results[team._id] = res.data.maxSafeBid;
            } catch (err) {
                console.error(`❌ Error fetching max bid for team ${team.name}:`, err.message);
                results[team._id] = null;
            }
        }

        setSafeBids(results);
    };

    useEffect(() => {
        const fetchBudgets = async () => {
            try {
                const res = await axios.get(`${API}/team/remainingBudgets`, {
                    params: { auction_id: auctionId }
                });
                setBudgets(res.data);
                await fetchSafeBids(res.data);

            } catch (err) {
                console.error("❌ Error fetching team budgets:", err.message);
            }
        };

        if (auctionId) {
            fetchBudgets();
            const interval = setInterval(fetchBudgets, 3000);
            return () => clearInterval(interval);
        }
    }, [auctionId]);

    return (
        <div className="ml-4 w-64 bg-gray-800 rounded-xl border border-gray-700">
            <h3 className=" font-bold w-full h-12 bg-slate-950 text-2xl font-raleway rounded-xl flex justify-center items-center mb-3 text-white text-center">💰 Budgets</h3>
            <div>
                <ul className="space-y-2 p-4 ">
                    {budgets.map(team => (
                        <li
                            key={team._id}
                            className="cursor-pointer px-2 py-1 rounded text-white font-semibold"
                            style={{ backgroundColor: team.color_code || '#333' }}
                            onClick={() => setSelectedTeam(team)}
                        >
                            <div className="flex justify-between items-center text-white">
                                <div>
                                    <div>{team.name}</div>
                                    <div className="text-sm text-white">Safe Max Bid: ${safeBids[team._id] ?? '...'}</div>
                                </div>
                                <span className="text-xl font-bold">${team.remaining}</span>
                            </div>
                        </li>

                    ))}
                </ul>
            </div>
            <TeamModal team={selectedTeam} auctionId={auctionId} onClose={() => setSelectedTeam(null)} />

        </div>
    );
}


function TeamModal({ team, auctionId, onClose }) {
    const [players, setPlayers] = useState([]);
    const hiddenPrintRef = useRef();
    const visibleRef = useRef();     // for the modal shown to user
    const printRef = useRef();


    useEffect(() => {
        const fetchPlayers = async () => {
            try {
                const res = await axios.get(`${API}/player/byTeam`, {
                    params: {
                        team_id: team._id,
                        auction_id: auctionId   // ✅ fallback to parent scope value
                    }
                });

                setPlayers(res.data);
            } catch (err) {
                console.error("❌ Error fetching players:", err.message);
            }
        };

        if (team?._id) {
            fetchPlayers();
        }
    }, [team, auctionId]);

    if (!team) return null;

    return (
        <div className="fixed inset-0 bg-white bg-opacity-60 flex justify-center items-center z-50">
            <div ref={visibleRef} className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-2xl relative  max-h-[90vh] overflow-y-auto">
                {/* <div  className="bg-gray-900 text-white p-6 rounded-xl w-full max-w-2xl relative max-h-[90vh] overflow-y-auto"> */}
                <button
                    onClick={onClose}
                    className="absolute w-10 h-10 flex justify-center items-center top-2 right-2 text-white hover:bg-white hover:text-white text-2xl"
                >
                    &times;
                </button>

                <button
                    onClick={() => {
                        // Small delay ensures content is rendered before export
                        setTimeout(() => {
                            html2pdf().set({
                                margin: 0.5,
                                filename: `${team.name}_summary.pdf`,
                                image: { type: 'jpeg', quality: 0.98 },
                                html2canvas: { scale: 2 },
                                jsPDF: { unit: 'in', format: 'letter', orientation: 'portrait' }
                            }).from(printRef.current).save();
                        }, 100); // 100ms delay helps prevent blank PDF
                    }}
                    className="absolute w-10 h-10 flex justify-center items-center top-2 right-20 text-white hover:bg-white hover:text-white text-2xl"
                >
                    📄
                </button>




                <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
                <p><strong>Remaining Budget:</strong> ${team.remaining}</p>

                <p className="mt-2"><strong>Tier Summary:</strong></p>
                <ul className="ml-4 list-disc">
                    {team.tier_summary && Object.entries(team.tier_summary).map(([tier, count]) => (
                        <li key={tier}>{tier}: {count}</li>
                    ))}
                </ul>

                <h3 className="text-xl font-semibold mt-4 mb-2">📋 Players Bought:</h3>
                {players.length === 0 ? (
                    <p className="text-sm text-gray-600">No players bought yet.</p>
                ) : (
                    (() => {
                        const groupedByRole = players.reduce((acc, player) => {
                            const role = player.role || "Unknown";
                            if (!acc[role]) acc[role] = [];
                            acc[role].push(player);
                            return acc;
                        }, {});

                        return (
                            <>
                                {Object.entries(groupedByRole).map(([role, group]) => (
                                    <div key={role} className="mb-6">
                                        <h4 className="text-xl font-bold mb-3 border-b border-gray-400 pb-1">{role}</h4>
                                        <div className="grid grid-cols-2 gap-4">
                                            {group.map(player => (
                                                <div
                                                    key={player._id}
                                                    className="rounded-lg  text-white shadow-md flex items-center"
                                                    style={{ backgroundColor: player.category?.color || '#f3f4f6' }}
                                                >
                                                    <div className="w-24  h-24 ml-2 rounded-xl overflow-hidden ">
                                                        <img
                                                            src={player.photo_url || avatar}
                                                            alt={player.name}
                                                            className="w-full h-full object-cover"
                                                            onError={(e) => {
                                                                e.target.onerror = null;
                                                                e.target.src = "/default_avatar.png";
                                                            }}
                                                        />
                                                    </div>
                                                    <div className="flex-grow m-4">
                                                        <p className="font-bold text-lg font-raleway">{player.name}</p>
                                                        <p className="text-sm font-raleway">{player.role}</p>
                                                        <p className="text-xl font-raleway font-bold">
                                                            ${player.price}
                                                        </p>
                                                        {/* <p className="text-sm font-raleway">
                                                            {player.category?.name || "Unknown Tier"} – ${player.price}
                                                        </p> */}
                                                    </div>

                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </>
                        );
                    })()
                )}

            </div>

            <div className="hidden">
                <div ref={printRef} className="p-6 w-[600px] text-black text-base">
                    <h2 className="text-2xl font-bold mb-4">{team.name}</h2>
                    <p><strong>Remaining Budget:</strong> ${team.remaining}</p>

                    <p className="mt-2"><strong>Tier Summary:</strong></p>
                    <ul className="ml-4 list-disc">
                        {team.tier_summary && Object.entries(team.tier_summary).map(([tier, count]) => (
                            <li key={tier}>{tier}: {count}</li>
                        ))}
                    </ul>

                    <h3 className="text-xl font-semibold mt-4 mb-2">📋 Players Bought:</h3>
                    {players.length === 0 ? (
                        <p>No players bought yet.</p>
                    ) : (
                        Object.entries(
                            players.reduce((acc, player) => {
                                const role = player.role || "Unknown";
                                if (!acc[role]) acc[role] = [];
                                acc[role].push(player);
                                return acc;
                            }, {})
                        ).map(([role, group]) => (
                            <div key={role}>
                                <h4 className="text-lg font-bold mt-4 mb-2">{role}</h4>
                                <ul className="ml-4 list-disc">
                                    {group.map(player => (
                                        <li key={player._id}>
                                            {player.name} — ${player.price} — {player.category?.name}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))
                    )}
                </div>
            </div>


        </div>
        // </div>
    );
}

