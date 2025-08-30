import React, { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "./Settings.css";

const Settings = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [nameForm, setNameForm] = useState({ name: "" });
  const [passwordForm, setPasswordForm] = useState({ 
    currentPassword: "", 
    newPassword: "", 
    confirmPassword: "" 
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      navigate('/login');
      return;
    }
    fetchUserData();
  }, [userId, navigate]);

  const fetchUserData = async () => {
    try {
      const response = await axios.get(`http://127.0.0.1:5000/api/users/${userId}`);
      setUser(response.data);
      setNameForm({ name: response.data.name });
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch user data');
      setLoading(false);
    }
  };

  const handleNameChange = (e) => {
    setNameForm({ name: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const updateName = async (e) => {
    e.preventDefault();
    if (!nameForm.name.trim()) {
      setError('Name cannot be empty');
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${userId}/name`, {
        name: nameForm.name
      });
      setMessage('Name updated successfully!');
      setError('');
      fetchUserData(); // Refresh user data
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update name');
      setMessage('');
    }
  };

  const updatePassword = async (e) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    try {
      await axios.put(`http://127.0.0.1:5000/api/users/${userId}/password`, {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword
      });
      
      setMessage('Password updated successfully! You will be logged out in 3 seconds...');
      setError('');
      
      // Clear password form
      setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
      
      // Auto logout after 3 seconds
      setTimeout(() => {
        localStorage.removeItem('userId');
        localStorage.removeItem('isAdmin');
        navigate('/');
      }, 3000);
      
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update password');
      setMessage('');
    }
  };

  if (loading) return <div className="settings-loading">Loading...</div>;

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Settings</h1>
        <p>Manage your account settings</p>
      </div>

      {message && <div className="success-message">{message}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="settings-content">
        {/* Name Update Section */}
        <div className="settings-section">
          <h2>Update Name</h2>
          <form onSubmit={updateName} className="settings-form">
            <div className="form-group">
              <label htmlFor="name">Name:</label>
              <input
                type="text"
                id="name"
                name="name"
                value={nameForm.name}
                onChange={handleNameChange}
                placeholder="Enter your new name"
                required
              />
            </div>
            <button type="submit" className="update-btn">Update Name</button>
          </form>
        </div>

        {/* Password Update Section */}
        <div className="settings-section">
          <h2>Update Password</h2>
          <form onSubmit={updatePassword} className="settings-form">
            <div className="form-group">
              <label htmlFor="currentPassword">Current Password:</label>
              <input
                type="password"
                id="currentPassword"
                name="currentPassword"
                value={passwordForm.currentPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your current password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="newPassword">New Password:</label>
              <input
                type="password"
                id="newPassword"
                name="newPassword"
                value={passwordForm.newPassword}
                onChange={handlePasswordChange}
                placeholder="Enter your new password"
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="confirmPassword">Confirm New Password:</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={passwordForm.confirmPassword}
                onChange={handlePasswordChange}
                placeholder="Confirm your new password"
                required
              />
            </div>
            <button type="submit" className="update-btn">Update Password</button>
          </form>
        </div>

        {/* User Info Section */}
        <div className="settings-section">
          <h2>Account Information</h2>
          <div className="user-info">
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Current Name:</strong> {user?.name}</p>
            <p><strong>User Type:</strong> {user?.type}</p>
            <p><strong>Owned Cars:</strong> {user?.ownedCar}</p>
            <p><strong>Total Cars:</strong> {user?.totalcar}</p>
            <p><strong>Total Bids:</strong> {user?.totalbid}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
