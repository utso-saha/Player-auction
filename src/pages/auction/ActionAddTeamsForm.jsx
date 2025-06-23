import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
const API = import.meta.env.VITE_API_URL;

export default function AddTeamForm() {
    const { auctionId } = useParams();
    const navigate = useNavigate();
    const [auction, setAuction] = useState(null);
    const [category, setCategories] = useState([]);


    const [form, setForm] = useState({
        auction_id: auctionId,
        name: '',
        logo_url: '',
        color_code: '',
        budget_remaining: '',
        tier_summary: {},
    });

    useEffect(() => {
        const getAuctionDetails = async (auctionId) => {
            console.log("Fetching details for auction:", auctionId);
            try {
                const res = await axios.get(`${API}/addauction/getAuction`, {
                    params: {
                        _id: auctionId
                    }
                });
                const data = res.data[0];
                console.log(data);
                setAuction(data);
                setForm(prev => ({
                    ...prev,
                    budget_remaining: data.budget_per_team

                }));
            } catch (error) {
                console.error("Error fetching auction details: " + error.message);
            }
        };
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

                // Initialize tier_summary with 0 for each category
                const initialTierSummary = {};
                res.data.forEach(cat => {
                    initialTierSummary[cat.name] = 0;  // assuming `name` is the key for tier
                });

                setForm(prev => ({
                    ...prev,
                    tier_summary: initialTierSummary
                }));

            } catch (error) {
                console.error("Error in category fetching" + error.message);
            }
        }
        if (auctionId) {
            console.log("📌 Auction available. Fetching categories...");
            getCategories(auctionId);
        }
    }, [auctionId]);



    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/team/add`, form);
            console.log("✅ Team Created:", res.data);
            window.alert("✅ Team created successfully!");
            navigate(`/auctionlayout/${auctionId}/add-team`);
        } catch (err) {
            console.error("❌ Error creating team:", err);
            window.alert("❌ Failed to create team.");
        }
    };

    return (
        <div className='w-full h-full p-10 text-white font-raleway flex pt-40'>
            <div className='w-1/5'>

            </div>
            <div className='w-3/6'>
                <h1 className='text-3xl font-bold mb-6 font-rubik'>Add New Team</h1>
                <form onSubmit={handleSubmit} className='space-y-6'>
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-xl pl-5'>Team Name</label>
                        <input
                            type='text'
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            className='w-2/3 h-10 bg-zinc-700 rounded-xl px-3 text-white'
                            required
                        />
                    </div>

                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-xl pl-5'>Logo URL</label>
                        <input
                            type='text'
                            name='logo_url'
                            value={form.logo_url}
                            onChange={handleChange}
                            className='w-2/3 h-10 bg-zinc-700 rounded-xl px-3 text-white'
                        />
                    </div>

                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-xl pl-5'>Team Color</label>
                        <input
                            type='color'
                            name='color_code'
                            value={form.color_code}
                            onChange={handleChange}
                            placeholder='#ffffff'
                            className='w-2/3 h-10 bg-zinc-700  text-white'
                        />
                    </div>

                    <button
                        type='submit'
                        className='text-white font-semibold px-6 py-2 rounded hover:text-black hover:bg-white font-rubik'
                    >
                        Submit Team
                    </button>
                </form>
            </div>
            <div className='w-2/6'>

            </div>
        </div >
    );
}
