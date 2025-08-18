import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import "./Navigbar.css";

const Navigbar = () => {
  const userId = localStorage.getItem('userId');
  const navigate = useNavigate();
  const location = useLocation(); // <-- get current route
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

  // helper function to check if the link is active
  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav className="navbar">
        <h2 className="logo">Hotbidz</h2>
        <ul className="nav-links">
          <li>
            <Link 
              to={userId ? `/user/${userId}` : "/login"} 
              className={isActive(userId ? `/user/${userId}` : "/login") ? "active-link" : ""}
            >
              Profile
            </Link>
          </li>
          <li>
            <Link 
              to={userId ? `/userinventory/${userId}` : "/login"} 
              className={isActive(userId ? `/userinventory/${userId}` : "/login") ? "active-link" : ""}
            >
              Inventory
            </Link>
          </li>
          <li>
            <Link 
              to="/auctions" 
              className={isActive("/auctions") ? "active-link" : ""}
            >
              Auction Store
            </Link>
          </li>
          <li>
            <Link 
              to={userId ? `/myauction/${userId}` : "/login"} 
              className={isActive(userId ? `/myauction/${userId}` : "/login") ? "active-link" : ""}
            >
              My Auction
            </Link>
          </li>
          <li>
            <Link 
              to={userId ? `/mybids/${userId}` : "/mybids"} 
              className={isActive(userId ? `/mybids/${userId}` : "/mybids") ? "active-link" : ""}
            >
              My Won Bids
            </Link>
          </li>
          <li>
            <Link 
              to="/settings" 
              className={isActive("/settings") ? "active-link" : ""}
            >
              Settings
            </Link>
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
