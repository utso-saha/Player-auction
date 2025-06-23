import React, { useState } from 'react';
import axios from 'axios';
import { useAuth0 } from '@auth0/auth0-react';
import { useNavigate } from 'react-router-dom';

const API = import.meta.env.VITE_API_URL;

export default function AddAuctionForm() {
    const { user, isAuthenticated } = useAuth0();
    const navigate = useNavigate();

    const [form, setForm] = useState({
        name: "",
        cover_image: "",
        sports_type: "cricket",
        budget_per_team: 100,
        player_count: 11,
        tiers: [],
        base_price_per_tier: {

        },
        min_player_per_tier: {

        },
        color_per_tier: {

        },
        date: "",
    });

    const [newTier, setNewTier] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleTierChange = (tier, value) => {
        setForm((prev) => ({
            ...prev,
            base_price_per_tier: {
                ...prev.base_price_per_tier,
                [tier]: Number(value),
            },
        }));
    };

    const handleMinPlayerChange = (tier, value) => {
        setForm((prev) => ({
            ...prev,
            min_player_per_tier: {
                ...prev.min_player_per_tier,
                [tier]: Number(value),
            },
        }));
    };

    const handleColorChange = (tier, value) => {
        setForm((prev) => ({
            ...prev,
            color_per_tier: {
                ...prev.color_per_tier,
                [tier]: value,
            },
        }));
    };

    const handleAddTier = () => {
        const trimmed = newTier.trim();
        if (trimmed && !form.tiers.includes(trimmed)) {
            setForm((prev) => ({
                ...prev,
                tiers: [...prev.tiers, trimmed],
                base_price_per_tier: {
                    ...prev.base_price_per_tier,
                    [trimmed]: 0,
                },
                min_player_per_tier: {
                    ...prev.min_player_per_tier,
                    [trimmed]: 0,
                },
                color_per_tier: {
                    ...prev.color_per_tier,
                    [trimmed]: "#ffffff",
                },
            }));
            setNewTier("");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            const auctionRes = await axios.post(`${API}/addauction/add`, {
                creator_id: user?.sub ?? "",
                name: form.name,
                cover_image: form.cover_image,
                sports_type: form.sports_type,
                budget_per_team: form.budget_per_team,
                date: form.date,
                player_count: form.player_count,
            });

            const auctionId = auctionRes.data._id;

            const categoryPromises = form.tiers.map((tier) =>
                axios.post(`${API}/category/add`, {
                    auction_id: auctionId,
                    name: tier,
                    base_price: form.base_price_per_tier[tier],
                    min_players: form.min_player_per_tier[tier],
                    color: form.color_per_tier[tier] || "#ffffff",
                })
            );

            await Promise.all(categoryPromises);

            window.alert("✅ Auction created successfully!");
            navigate("/dashboard");
        } catch (err) {
            console.error("❌ Error:", err);
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="w-screen h-screen flex text-white font-raleway overflow-x-hidden">
            <div className="w-1/6 h-full "></div>

            <div className="w-4/6 h-full px-10 pt-10 ">
                <div className="h-1/4 flex justify-start items-end text-4xl font-bold mb-6 font-rubik">
                    Create New Auction
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                    <div className="flex gap-6">
                        {/* Left Column */}
                        <div className="w-1/2 space-y-5">
                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Auction Name</div>
                                <div className="w-2/3">
                                    <input
                                        type="text"
                                        name="name"
                                        value={form.name}
                                        onChange={handleChange}
                                        required
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Cover Image</div>
                                <div className="w-2/3">
                                    <input
                                        type="text"
                                        name="cover_image"
                                        value={form.cover_image}
                                        onChange={handleChange}
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Players / Team</div>
                                <div className="w-2/3">
                                    <input
                                        type="number"
                                        name="player_count"
                                        value={form.player_count}
                                        onChange={handleChange}
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Right Column */}
                        <div className="w-1/2 space-y-5">
                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Sport Type</div>
                                <div className="w-2/3">
                                    <select
                                        name="sports_type"
                                        value={form.sports_type}
                                        onChange={handleChange}
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    >
                                        <option value="cricket">Cricket</option>
                                        <option value="football">Football</option>
                                    </select>
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Budget / Team</div>
                                <div className="w-2/3">
                                    <input
                                        type="number"
                                        name="budget_per_team"
                                        value={form.budget_per_team}
                                        onChange={handleChange}
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    />
                                </div>
                            </div>

                            <div className="bg-zinc-800 rounded-xl p-5 flex">
                                <div className="w-1/3 flex items-center font-bold text-xl pl-5">Auction Date</div>
                                <div className="w-2/3">
                                    <input
                                        type="datetime-local"
                                        name="date"
                                        value={form.date}
                                        onChange={handleChange}
                                        className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tier Settings */}
                    <div className="bg-zinc-800 rounded-xl p-5">
                        <div className="text-xl font-bold mb-3">Tier Settings</div>
                        <div className="w-full flex mb-2">
                            <div className="w-1/3"></div>
                            <div className="w-1/3 flex justify-center">Base Price</div>
                            <div className="w-1/3 flex justify-center">Min Players</div>
                        </div>

                        {form.tiers.map((tier) => (
                            <div key={tier} className="flex items-center mb-2">
                                <div className="w-1/3">{tier}</div>
                                <input
                                    type="number"
                                    value={form.base_price_per_tier[tier]}
                                    onChange={(e) => handleTierChange(tier, e.target.value)}
                                    className="w-1/3 h-8 bg-zinc-700 mx-1 rounded-xl px-3 text-white"
                                />
                                <input
                                    type="number"
                                    value={form.min_player_per_tier[tier]}
                                    onChange={(e) => handleMinPlayerChange(tier, e.target.value)}
                                    className="w-1/3 h-8 bg-zinc-700 mx-1 rounded-xl px-3 text-white"
                                />
                                <input
                                    type="color"
                                    value={form.color_per_tier[tier]}
                                    onChange={(e) => handleColorChange(tier, e.target.value)}
                                    className="w-12 h-8 ml-2 cursor-pointer"
                                />
                            </div>
                        ))}

                        <div className="flex mt-4 gap-2 h-12 items-start">
                            <div className="w-2/3">
                                <input
                                    type="text"
                                    placeholder="New tier name"
                                    value={newTier}
                                    onChange={(e) => setNewTier(e.target.value)}
                                    className="w-full h-10 bg-zinc-700 rounded-xl px-3 text-white"
                                />
                            </div>
                            <div className="w-1/3 flex justify-center">
                                <button
                                    type="button"
                                    onClick={handleAddTier}
                                    className="text-white font-semibold px-4 rounded hover:bg-white hover:text-black"
                                >
                                    + Add Tier
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className='w-full'>
                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={submitting}
                            className="text-white font-semibold px-6 py-2 rounded hover:text-black font-rubik hover:bg-white mb-10 self-center"
                        >
                            {submitting ? "Submitting..." : "Submit Auction"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
