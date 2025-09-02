import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navigbar from "./components/Navigbar";
import Chatbot from "./components/Chatbot";   

import UserProfile from "./pages/UserProfile";
import Auctions from "./pages/Auctions";
import MyBids from "./pages/Mybids";
import Settings from "./pages/Settings";
import Userinventory from "./pages/Userinventory";
import Signup from "./pages/signup"; 
import Login from "./pages/login";
import AuthPage from "./pages/AuthPage";
import MyAuction from "./pages/myauction";
import AdminPanel from "./pages/AdminPanel";
import ComingSoon from "./pages/ComingSoon";

function AppWrapper() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(res => setMessage(res.data))
      .catch(err => setMessage("API error"));
  }, []);

  // Routes where we don't want the navbar
  const hideNavbarRoutes = ["/", "/admin"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideNavbar && <Navigbar />}

      <div className="app-body">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/coming-soon" element={<ComingSoon />} />
          <Route path="/mybids/:id" element={<MyBids />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/userinventory/:id" element={<Userinventory />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
          <Route path="/myauction/:id" element={<MyAuction />} />
          <Route path="/admin" element={<AdminPanel />} />
        </Routes>
      </div>

      {/* Chatbot is always visible */}
      {!hideNavbar && <Chatbot />}
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AppWrapper />
    </Router>
  );
}
