import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;

export default function AuctionOverview() {

    const { auctionId } = useParams();
    const [auction, setAuction] = useState(null);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [showModal, setShowModal] = useState(false);

    const handleUpdateCategory = async () => {
        try {
            await axios.put(`${API}/category/update/${selectedCategory._id}`, selectedCategory);
            setShowModal(false);
            // Refresh categories
            const res = await axios.get(`${API}/category/getCategory/${auctionId}`, {
                params: { auction_id: auctionId }
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    const handleDeleteCategory = async () => {
        try {
            await axios.delete(`${API}/category/delete/${selectedCategory._id}`);
            setShowModal(false);
            // Refresh categories
            const res = await axios.get(`${API}/category/getCategory/${auctionId}`, {
                params: { auction_id: auctionId }
            });
            setCategories(res.data);
        } catch (err) {
            console.error("Delete failed", err);
        }
    };



    const handleCategoryClick = (category) => {
        setSelectedCategory(category);
        setShowModal(true);
    };

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
                console.log(res.data[0]?.name);
            } catch (error) {
                console.error("Error as always" + error.message);
            }
        }
        getAuctionDetails(auctionId);
    }, [auctionId]);





    useEffect(() => {
        const getCategories = async (auctionId) => {
            console.log("Fetching details for category:", auctionId);
            try {
                const res = await axios.get(`${API}/category/getCategory/${auctionId}`, {
                    params: {
                        auction_id: auctionId
                    }
                });
                console.log("result for fetching category :");
                setCategories(res.data);
                console.log(res.data);

            } catch (error) {
                console.error("Error in category fetching" + error.message);
            }
        }
        if (auctionId) {
            console.log("📌 Auction available. Fetching categories...");
            getCategories(auctionId);
        }
    }, [auctionId]);






    return (
        <div className='h-full w-full flex flex-col items-center'>
            <div className='w-full h-2/6 '>

            </div>
            <div className='w-3/4  flex '>
                <div className='w-1/2 h-full '>


                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>name</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.name || "name"}</div>
                    </div>

                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>sports_type</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.sports_type || "sports_type"}</div>
                    </div>

                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>date</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.date ? new Date(auction.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: 'numeric',
                            minute: '2-digit',
                            hour12: true
                        }) : "date"}</div>
                    </div>

                </div>
                <div className='w-1/2 h-full '>


                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>team_count</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.team_count ?? "team_count"}</div>
                    </div>

                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>player_per_team</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.player_count ?? "player_count"}</div>
                    </div>

                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl'>budget_per_team</div>
                        <div className='font-raleway font-bold text-2xl'>{auction?.budget_per_team ?? "budget"}</div>
                    </div>

                    <div className='bg-zinc-800 rounded-xl m-3 p-3 pl-10'>
                        <div className='font-raleway text-xl mb-2'>Categories</div>

                        {categories.length === 0 ? (
                            <div className='text-gray-400'>No categories found.</div>
                        ) : (
                            categories.map((cat) => (
                                <div
                                    key={cat._id}
                                    onClick={() => handleCategoryClick(cat)}
                                    className='cursor-pointer flex justify-between font-raleway items-center p-2 rounded-lg my-1'
                                    style={{ backgroundColor: cat.color || "#ffffff" }}
                                >
                                    <div className='font-semibold text-white w-1/3'>{cat.name}</div>
                                    <div className='text-white w-1/3'>💰 {cat.base_price}</div>
                                    <div className='text-white w-1/3'>👥 Min: {cat.min_players}</div>
                                </div>
                            ))
                        )}

                    </div>


                    {/* Player Count Dynamic Kora Lagbe */}


                </div>

            </div>

            {showModal && selectedCategory && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-gray-900 rounded-xl p-6 w-[400px]">
                        <h2 className="text-xl font-bold mb-4">Edit Category</h2>

                        <label className="block mb-2">Name</label>
                        <input
                            type="text"
                            value={selectedCategory.name}
                            onChange={(e) =>
                                setSelectedCategory({ ...selectedCategory, name: e.target.value })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <label className="block mb-2">Base Price</label>
                        <input
                            type="number"
                            value={selectedCategory.base_price}
                            onChange={(e) =>
                                setSelectedCategory({ ...selectedCategory, base_price: e.target.value })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <label className="block mb-2">Min Players</label>
                        <input
                            type="number"
                            value={selectedCategory.min_players}
                            onChange={(e) =>
                                setSelectedCategory({ ...selectedCategory, min_players: e.target.value })
                            }
                            className="w-full border p-2 rounded mb-3"
                        />

                        <div className="flex justify-between mt-4">
                            <button
                                onClick={handleUpdateCategory}
                                className="bg-green-600 text-white px-4 py-2 rounded"
                            >
                                Save
                            </button>
                            <button
                                onClick={handleDeleteCategory}
                                className="bg-red-600 text-white px-4 py-2 rounded"
                            >
                                Delete
                            </button>
                            <button
                                onClick={() => setShowModal(false)}
                                className="bg-gray-500 text-white px-4 py-2 rounded"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    )
};
