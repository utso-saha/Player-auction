import React from 'react';
import Sidebar from '../../components/Sidebar';
import AuctionOverview from './AuctionOverview';
import AuctionAddTeams from './AuctionAddTeams';
import { Outlet } from 'react-router-dom';
export default function AuctionLayout() {
    return (
        <div className='w-screen h-screen flex overflow-x-hidden'>
            <div className='w-1/6 bg-zinc-950 fixed h-full flex justify-center flex-col'>
                <Sidebar />
            </div>
            <div className='w-1/6'>

            </div>
            <div className=' h-full  w-4/6'>
                <Outlet/>
            </div>

        </div>
    )
};
