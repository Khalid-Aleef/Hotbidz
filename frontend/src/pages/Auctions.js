
import React, { useEffect, useState } from "react";
import axios from "axios";
import './Auctions.css'; 

const Auctions = () => {
  const [auctionCars, setAuctionCars] = useState([]);

  useEffect(() => {
    axios.get("http://localhost:5000/api/auctions")
      .then(res => setAuctionCars(res.data))
      .catch(err => console.error("Error fetching auction cars", err));
  }, []);

  return (
    <div className="auction-container">
      <h2>Hot Wheels Auctions</h2>
      <div className="auction-grid">
        {auctionCars.length === 0 && <p>No cars currently up for auction.</p>}
        {auctionCars.map(car => (
          <div key={car._id} className="auction-card">
            <p><b>End:</b> {car.end ? new Date(car.end).toLocaleDateString() : "N/A"}</p>
            <img src={car.image} alt={car.carName} className="auction-img" />
            <h3>{car.carName}</h3>
            <p><b>Series:</b> {car.series}</p>
            <p><b>Year:</b> {car.yearReleased}</p>
            <p><b>Rarity:</b> {car.rarity}</p>
            <p><b>Starting Bid:</b> {car.price} BDT</p>
            <div className="auction-actions">
              <button className="bid-btn">Bid</button>
              <button className="auction-trade-btn">Trade Req.</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Auctions;
