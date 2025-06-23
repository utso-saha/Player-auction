import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';

import axios from 'axios';
const API = import.meta.env.VITE_API_URL;

export default function AuctionAddTeams() {
    const { auctionId } = useParams();
    const { user, isAuthenticated, getAccessTokenSilently } = useAuth0();
    const [auction, setAuction] = useState(null);
    const [teams, setTeams] = useState([]);

    const navigate = useNavigate();

    useEffect(() => {
        const getAuctionDetails = async (auctionId) => {
            console.log("Fetching details for auction:", auctionId);
            try {
                const res = await axios.get(`${API}/addauction/getAuction`, {
                    params: {
                        _id: auctionId
                    }
                });
                console.log(res.data[0]);
                setAuction(res.data[0]);
                console.log(auction.name);
            } catch (error) {
                console.error("Error as always" + error.message);
            }
        }
        getAuctionDetails(auctionId);
    }, [auctionId]);


    const handleDelete = async (teamId) => {
        try {
            await axios.delete(`${API}/team/delete/${teamId}`);
            console.log("✅ Team deleted");

            // Refresh teams
            const res = await axios.get(`${API}/team/get`, {
                params: { auction_id: auctionId }
            });
            setTeams(res.data);

            window.alert("🗑️ Team deleted successfully!");
        } catch (error) {
            console.error("❌ Error deleting team:", error.message);
            window.alert("❌ Failed to delete team. Please try again.");
        }
    };


    useEffect(() => {
        const fetchFilteredTeams = async () => {
            try {
                const res = await axios.get(`${API}/team/get`, {
                    params: {
                        auction_id: auctionId
                    }
                });
                setTeams(res.data); // Assuming you're storing teams here
            } catch (error) {
                console.error("❌ Error fetching filtered teams:", error.message);
            }
        };

        if (auctionId) {
            fetchFilteredTeams();
        }
    }, [auctionId]);



    const handleAuctionclick = (auctionId) => {
        navigate(`/auctionlayout/${auctionId}`); // Fixed: Added backticks for template literal
    }
    const handleAddAuction = () => {
        navigate(`/auctionlayout/${auctionId}/add-team/form`);

    }

    return (
        <div className='flex justify-center items-center h-full w-full'>
            <div className='w-4/6 mt-40'>
                <div className=" mt-40  font-kanit ">
                    <h1 className="text-4xl font-rubik font-bold text-white mb-6">all teams</h1>

                    <div className="space-y-4 h-auto">
                        {teams.map(team => (
                            <div key={team._id} className="overflow-hidden  relative p-4 rounded-xl flex justify-between items-center text-white"
                                // onClick={() => handleAuctionclick(team._id)}
                                style={{ backgroundColor: team.color_code || "#27272a" }}
                            >
                                <div className=" flex justify-center w-full overflow-hidden rounded-full absolute flex-shrink-0 mr-4">
                                    <img
                                        src={team.logo_url || "/default_team_logo.png"}
                                        alt={`${team.name} Logo`}
                                        className="w-40 opacity-35 h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = "/default_team_logo.png"; // fallback image
                                        }}
                                    />
                                </div>

                                <div className='z-10'>
                                    <h3 className="text-xl font-bold font-raleway">{team.name}</h3>
                                    {/* <p className="text-sm text-gray-400 font-raleway">Status: {auction.status}</p> */}
                                </div>
                                <div className="space-x-2 z-10">
                                    {/* <button className=" hover:bg-white px-3 py-1 rounded text-white hover:text-black font-rubik">Modify</button> */}
                                    {/* <button className=" hover:bg-white px-3 py-1 rounded text-white hover:text-black font-rubik"
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(auction._id)
                                        }}>Delete</button> */}
                                </div>
                                <button
                                    className="z-10 hover:bg-white px-3 py-1 rounded text-white hover:text-black font-rubik"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleDelete(team._id);
                                    }}
                                >
                                    Delete
                                </button>

                            </div>
                        ))}
                    </div>

                    <div className="flex justify-between items-center mt-20">
                        <button className=" hover:bg-white text-white hover:text-black px-5 py-2 rounded font-rubik font-bold shadow"
                            onClick={() => handleAddAuction()}>
                            + add new team
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}