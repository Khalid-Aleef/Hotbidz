import './App.css';
import React, { useEffect, useState } from "react";
import axios from "axios";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navigbar from "./components/Navigbar";
import UserProfile from "./pages/UserProfile";
import Auctions from "./pages/Auctions";
import MyBids from "./pages/Mybids";
import Settings from "./pages/Settings";
import Userinventory from "./pages/Userinventory";
import Signup from "./pages/signup"; 

function App() {
  const [message, setMessage] = useState("");

  useEffect(() => {
    axios.get("http://localhost:5000/")
      .then(res => setMessage(res.data))
      .catch(err => setMessage("API error"));
  }, []);

  return (
    <Router>
      <div className="App">
        <Navigbar />

        <div className="app-body">
          <p className="server-message">Backend says: {message}</p>

          <Routes>
            <Route path="/user/:id" element={<UserProfile />} />
            <Route path="/auctions" element={<Auctions />} />
            <Route path="/mybids" element={<MyBids />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/userinventory" element={<Userinventory/>} />
            <Route path="/signup" element={<Signup />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
