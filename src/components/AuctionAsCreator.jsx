import axios from "axios";
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom"; // ✅ Needed for useParams
import { useAuth0 } from "@auth0/auth0-react";
const API = import.meta.env.VITE_API_URL;


export default function AuctionAsCreator({ auctionId }) {

    


    return (
        <div className="p-4">
            HELLO
        </div>
    );
};
