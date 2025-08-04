import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/688f37b0562b67f3bdd8e0b8`)
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching user", err));
  }, [id]);
      

  if (!user) return <p>Loading...</p>;

  return (
    <div className="profile-container">
      <div className="profile-card">
        <img
          src={`${process.env.PUBLIC_URL}/${user.profileImage}`}
          alt="Profile"
          className="profile-img"
        />

        <h1>COLLECTOR'S PROFILE</h1>
        <p>Name: {user.name}</p>
        <p>Sex: {user.sex}</p>
        <p>Owned Cars: {user.ownedCar}</p>
        <p>Email: {user.email}</p>
        <p>Type: {user.type}</p>
        <p>Badges: {user.badges?.length ? user.badges.join(', ') : "N/A"}</p>

        <div className="achievements">
          <h4>Achievements:</h4>
          {user.achievements?.length > 0 ? (
            <div className="achievement-list">
              {user.achievements.map((ach, index) => (
                <p key={index}>{ach}</p>
              ))}
            </div>
          ) : (
            <p>N/A</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
