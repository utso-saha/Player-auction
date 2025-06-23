import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function AddPlayerForm() {
    const { auctionId } = useParams();
    const navigate = useNavigate();

    const [auction, setAuction] = useState(null);
    const [categories, setCategories] = useState([]);

    const [form, setForm] = useState({
        auction_id: auctionId,
        name: '',
        photo_url: '',
        category: '',
        role: '',
        dob: '',
        price: 0,
        is_sold: false,
        stat: {}
    });

    useEffect(() => {
        const getAuction = async () => {
            try {
                const res = await axios.get(`${API}/addauction/getAuction`, {
                    params: { _id: auctionId }
                });
                setAuction(res.data[0]);
            } catch (error) {
                console.error("❌ Error fetching auction:", error.message);
            }
        };
        getAuction();
    }, [auctionId]);

    useEffect(() => {
        const getCategories = async () => {
            try {
                const res = await axios.get(`${API}/category/getCategory/${auctionId}`, {
                    params: { auction_id: auctionId }
                });
                setCategories(res.data);
            } catch (error) {
                console.error("❌ Error fetching categories:", error.message);
            }
        };
        if (auctionId) getCategories();
    }, [auctionId]);

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name === "category") {
            const selected = categories.find(cat => cat.name === value);
            const basePrice = selected?.base_price || 0;

            setForm(prev => ({
                ...prev,
                category: value,
                price: basePrice
            }));
        } else {
            setForm(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API}/player/add`, form);
            console.log("✅ Player Created:", res.data);
            window.alert("✅ Player created successfully!");
            navigate(`/auctionlayout/${auctionId}/add-player`);
        } catch (err) {
            console.error("❌ Error creating player:", err);
            window.alert("❌ Failed to create player.");
        }
    };

    const roleOptions = {
        football: [
            'Goalkeeper',
            'Defender',
            'Midfielder',
            'Striker',
            'Winger',
            'Fullback'
        ],
        cricket: [
            'Opening Batsman',
            'Middle-order Batsman',
            'Wicketkeeper',
            'Fast Bowler',
            'Spin Bowler',
            'All-Rounder'
        ]
    };

return (
        <div className='w-full h-full p-10 text-white font-raleway flex pt-40'>
            <div className='w-1/6'></div>

            <div className='w-5/6 '>
                <h1 className='text-3xl font-bold mb-6 font-rubik'>Add New Player</h1>
                <form onSubmit={handleSubmit} className='grid grid-cols-2 gap-6'>

                    {/* Name */}
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-lg'>Name</label>
                        <input
                            type='text'
                            name='name'
                            value={form.name}
                            onChange={handleChange}
                            required
                            className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10'
                        />
                    </div>

                    {/* Photo URL */}
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-lg'>Photo</label>
                        <input
                            type='text'
                            name='photo_url'
                            value={form.photo_url}
                            onChange={handleChange}
                            className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10'
                        />
                    </div>

                    {/* Role */}
                    {auction?.sports_type && (
                        <div className='bg-zinc-800 p-5 rounded-xl flex col-span-1'>
                            <label className='w-1/3 font-bold text-lg'>Role</label>
                            <select
                                name='role'
                                value={form.role}
                                onChange={handleChange}
                                required
                                className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10'
                            >
                                <option value="">Select Role</option>
                                {roleOptions[auction.sports_type]?.map(role => (
                                    <option key={role} value={role}>{role}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    {/* Date of Birth */}
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-lg'>DOB</label>
                        <input
                            type='date'
                            name='dob'
                            value={form.dob}
                            onChange={handleChange}
                            className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10'
                        />
                    </div>

                    {/* Category */}
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-lg'>Category</label>
                        <select
                            name='category'
                            value={form.category}
                            onChange={handleChange}
                            required
                            className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10'
                        >
                            <option value="">Select Category</option>
                            {categories.map(cat => (
                                <option key={cat._id} value={cat.name}>{cat.name}</option>
                            ))}
                        </select>
                    </div>

                    {/* Price */}
                    <div className='bg-zinc-800 p-5 rounded-xl flex'>
                        <label className='w-1/3 font-bold text-lg'>Base Price</label>
                        <input
                            type='number'
                            name='price'
                            value={form.price}
                            readOnly
                            className='w-2/3 bg-zinc-700 rounded px-3 text-white h-10 cursor-not-allowed'
                        />
                    </div>

                    {/* Submit button (full width) */}
                    <div className='w-full  flex justify-start'>
                        <button
                            type='submit'
                            className=' text-white px-6 py-2 rounded font-semibold hover:bg-white hover:text-black font-rubik'
                        >
                            Submit Player
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
