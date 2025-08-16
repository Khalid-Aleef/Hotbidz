import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navigbar.css";

const Navigbar = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleLogout = () => {
    setShowModal(true); 
  };

  const confirmLogout = () => {
    localStorage.removeItem('userId');
    setShowModal(false);
    navigate("/");
  };

  const cancelLogout = () => {
    setShowModal(false);
  };

  return (
    <>
      <nav className="navbar">
        <h2 className="logo">Hotbidz</h2>
        <ul className="nav-links">
          <li>
            <Link to={userId ? `/user/${userId}` : "/login"}>Profile</Link>
          </li>
          <li>
            <Link to={userId ? `/userinventory/${userId}` : "/login"}>Inventory</Link>
          </li>
          <li>
            <Link to="/auctions">Auctions</Link>
          </li>
          <li>
            <Link to={userId ? `/mybids/${userId}`: "/mybids"}>My Won Bids</Link>
          </li>
          <li>
            <Link to="/settings">Settings</Link>
          </li>
          <li>
            <button onClick={handleLogout} className="logout-btn">Logout</button>
          </li>
        </ul>
      </nav>
     
      {showModal && (
        <div className="modal-overlay" onClick={cancelLogout}>
          <div className="logout-modal" onClick={e => e.stopPropagation()}>
            <p>Are you sure you want to logout?</p>
            <div className="logout-modal-btns">
              <button onClick={confirmLogout} className="yes-btn">Yes</button>
              <button onClick={cancelLogout} className="no-btn">No</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navigbar;
