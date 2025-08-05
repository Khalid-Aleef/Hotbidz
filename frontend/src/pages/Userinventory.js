import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inventory.css';

const UserInventory = () => {
  const { id } = useParams();
  const [cars, setCars] = useState([]);

  useEffect(() => {
    axios.get(`http://localhost:5000/api/inventory/${id}`)
      .then(res => setCars(res.data))
      .catch(err => console.error("Error loading inventory", err));
  }, [id]);

  return (
  <div className="inventory">
    <h2>My Hot Wheels Collection</h2>
    <div className="inventory-grid">
      {cars.map(car => (
        <div key={car._id} className="car-card">
          <img src={car.image} alt={car.carName} width="200" />
          <h3>{car.name}</h3>
          <p>Series: {car.series}</p>
          <p>Year: {car.yearReleased}</p>
          <p>Rarity: {car.rarity}</p>
          <p>Price:  {car.price} BDT</p>
          
          <p>{car.description}</p>
          
          <div className="car-actions">
            <button className="auction-btn">Auction</button>
            <button className="trade-btn">Trade</button>
          </div>
        </div>
      ))}
    </div>
  </div>
);

};

export default UserInventory;
