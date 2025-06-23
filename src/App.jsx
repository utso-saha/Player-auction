import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import AuctionLayout from "./pages/auction/AuctionLayout";
import AddAuctionForm from "./pages/AddAuctionForm";
import { useAuth0 } from "@auth0/auth0-react";
import AuctionOverview from "./pages/auction/AuctionOverview";
import AuctionAddTeams from "./pages/auction/AuctionAddTeams";
import AuctionAddTeamsForm from "./pages/auction/ActionAddTeamsForm";
import AuctionAddPlayers from "./pages/auction/AuctionAddPlayers";
import AuctionAddPlayersForm from "./pages/auction/AuctionAddPlayersForm";
import AuctionMainPage from "./pages/auction/AuctionMainPage";

export default function App() {

  const { user, isAuthenticated, isLoading, loginWithRedirect, logout } = useAuth0();
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route
          path="/dashboard"
          element={isAuthenticated ? <Dashboard /> : <Login />} />
        <Route
          path="/login"
          element={isAuthenticated ? <Dashboard /> : <Login />} />
        {/* <Route
          path="/auctionlayout/:auctionId"
          element={isAuthenticated ? < AuctionLayout /> : <Home />} /> */}
        <Route
          path="/addAuction"
          element={isAuthenticated ? <AddAuctionForm /> : <Home />} />

        <Route path="/auctionlayout/:auctionId" element={<AuctionLayout />}>
          <Route index element={<AuctionOverview />} />
          <Route path="add-team" element={<AuctionAddTeams />} />
          <Route path="add-team/form" element={<AuctionAddTeamsForm />} />
          <Route path="add-player" element={<AuctionAddPlayers />} />
          <Route path="add-player/form" element={<AuctionAddPlayersForm />} />
          <Route path="auctionMainPage" element={<AuctionMainPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
