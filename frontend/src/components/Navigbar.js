import React from "react";
import { Link } from "react-router-dom";
import "./Navigbar.css"; 

const Navigbar = () => {
  return (
    <nav className="navbar">
      <h2 className="logo">Hotbidz</h2>
      <ul className="nav-links">
        <li><Link to="/user/688f20ed562b67f3bdd8e0aa">Profile</Link></li>
        <li><Link to="/userinventory">Inventory</Link></li>
        <li><Link to="/auctions">Auctions</Link></li>
        <li><Link to="/my-bids">My Bids</Link></li>
        <li><Link to="/settings">Settings</Link></li>
        
      </ul>
    </nav>
  );
};

export default Navigbar;
