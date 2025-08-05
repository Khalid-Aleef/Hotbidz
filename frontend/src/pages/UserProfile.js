import React, { useEffect, useState } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import './UserProfile.css';

const UserProfile = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [cars, setCars] = useState([]); 

  // user
  useEffect(() => {
    axios.get(`http://localhost:5000/api/users/${id}`)
      .then(res => setUser(res.data))
      .catch(err => console.error("Error fetching user", err));
  }, [id]);

  // user's cars
  useEffect(() => {
    axios.get(`http://localhost:5000/api/inventory/${id}`)
      .then(res => setCars(res.data))
      .catch(err => console.error("Error fetching cars", err));
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
        
        <div className="car-showcase">
          <h4>My Cars:</h4>
          <div className="car-tile-list">
            {cars.length === 0 ? (
              <p style={{ fontSize: '1rem', opacity: 0.7 }}>No cars to show.</p>
            ) : (
              cars.map((car, idx) => (
                <div className="car-tile" key={car._id || idx}>
                  <img
                    src={car.image?.startsWith('http') ? car.image : `${process.env.PUBLIC_URL}/${car.image}`}
                    alt={car.carName}
                    className="car-tile-img"
                  />

                  
                  <div className="car-tile-rarity">{car.rarity}</div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
