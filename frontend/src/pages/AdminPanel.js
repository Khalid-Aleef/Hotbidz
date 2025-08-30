import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminPanel.css';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await axios.get('http://127.0.0.1:5000/api/users');
      setUsers(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch users');
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axios.delete(`http://127.0.0.1:5000/api/users/${userId}`);
        alert('User deleted successfully');
        fetchUsers(); // Refresh the list
      } catch (err) {
        alert('Failed to delete user');
      }
    }
  };

  if (loading) return <div className="admin-loading">Loading...</div>;
  if (error) return <div className="admin-error">{error}</div>;

  return (
    <div className="admin-panel">
      <div className="admin-header">
        <h1>Admin Panel</h1>
        <p>Manage all users in the system</p>
      </div>

      <div className="users-container">
        <h2>All Users ({users.length})</h2>
        
        <div className="users-list">
          {users.map((user) => (
            <div key={user._id} className="user-card">
              <div className="user-info">
                <div className="user-avatar">
                  <img 
                    src={user.profileImage || '/Userdp/userdp.jpeg'} 
                    alt={user.name}
                    onError={(e) => {
                      e.target.src = '/Userdp/userdp.jpeg';
                    }}
                  />
                </div>
                
                <div className="user-details">
                  <h3>{user.name}</h3>
                  <p><strong>Email:</strong> {user.email}</p>
                  <p><strong>Sex:</strong> {user.sex}</p>
                  <p><strong>Type:</strong> {user.type}</p>
                  <p><strong>Owned Cars:</strong> {user.ownedCar}</p>
                  <p><strong>Total Cars:</strong> {user.totalcar}</p>
                  <p><strong>Total Bids:</strong> {user.totalbid}</p>
                  <p><strong>First Auction:</strong> {user.fauc === 1 ? 'Yes' : 'No'}</p>
                  <p><strong>First Win:</strong> {user.fwon === 1 ? 'Yes' : 'No'}</p>
                  
                  <div className="achievements">
                    <strong>Achievements:</strong>
                    {user.achievements && user.achievements.length > 0 ? (
                      <ul>
                        {user.achievements.map((achievement, index) => (
                          <li key={index}>{achievement}</li>
                        ))}
                      </ul>
                    ) : (
                      <span> No achievements yet</span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="user-actions">
                <button 
                  className="delete-btn"
                  onClick={() => handleDeleteUser(user._id)}
                >
                  Delete User
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
