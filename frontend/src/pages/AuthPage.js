import React, { useState } from 'react';
import Login from './login';     
import Signup from './signup';   
import './AuthPage.css';         

const AuthPage = () => {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);

  return (
    <div className="auth-page">
      <h1 className="auth-title">Welcome to Hotbidz</h1>

      <div className="auth-buttons">
        <button onClick={() => { setShowLogin(true); setShowSignup(false); }}>Login</button>
        <button onClick={() => { setShowSignup(true); setShowLogin(false); }}>Sign Up</button>
      </div>

     
      
      {showLogin && (
        <div className="auth-modal">
          <button className="close-btn" onClick={() => setShowLogin(false)}>✖</button>  
          <Login />
        </div>
      )}

      {showSignup && (
        <div className="auth-modal">
          <button className="close-btn" onClick={() => setShowSignup(false)}>✖</button>  
          <Signup />
        </div>
      )}
    </div>
  );
};

export default AuthPage;
