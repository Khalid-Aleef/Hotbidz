import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route, useLocation } from "react-router-dom";

import Navigbar from "./components/Navigbar";
import UserProfile from "./pages/UserProfile";
import Auctions from "./pages/Auctions";
import MyBids from "./pages/Mybids";
import Settings from "./pages/Settings";
import Userinventory from "./pages/Userinventory";
import Signup from "./pages/signup"; 
import Login from "./pages/login";
import AuthPage from "./pages/AuthPage";

function AppWrapper() {
  const location = useLocation();
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(res => setMessage(res.data))
      .catch(err => setMessage("API error"));
  }, []);

  
  const hideNavbarRoutes = ["/"];
  const hideNavbar = hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="App">
      {!hideNavbar && <Navigbar />}

      <div className="app-body">
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route path="/user/:id" element={<UserProfile />} />
          <Route path="/auctions" element={<Auctions />} />
          <Route path="/mybids" element={<MyBids />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/userinventory/:id" element={<Userinventory />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/login" element={<Login />} />
        </Routes>
      </div>
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
