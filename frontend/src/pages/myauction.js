import React, { useEffect, useState } from "react";
import axios from "axios";
import './myauction.css';

const MyAuction = () => {
  const [auctionCars, setAuctionCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId');

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view your auctions.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/api/myauctions?userId=${userId}`)
      .then(res => {
        const auctionData = res.data;
        const sellerPromises = auctionData.map(car =>
          axios.get(`http://localhost:5000/api/users/${car.sellerId}`)
            .then(response => ({
              ...car,
              sellerName: response.data.name
            }))
            .catch(() => ({ ...car, sellerName: "Unknown" }))
        );

        Promise.all(sellerPromises)
          .then(carsWithSeller => {
            setAuctionCars(carsWithSeller);
            setLoading(false);
          });
      })
      .catch(err => {
        setError('Error fetching your auctions');
        setLoading(false);
        console.error("Error fetching my auctions", err);
      });
  }, [userId]);

  // Calculate remaining time
  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return "N/A";

    const now = new Date();
    const end = new Date(endTime);
    const timeDiff = end - now;

    if (timeDiff <= 0) return "Auction Ended";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  if (loading) return <p>Loading your auctions...</p>;
  if (error) return <p>{error}</p>;


return (
  <div className="my-auction-container">
    <h2>My Auctions</h2>
    <div className="my-auction-grid">
      {auctionCars.length === 0 && <p>No auctions found.</p>}
      {auctionCars.map((car) => (
        <div key={car._id} className="my-auction-card">
          <p><b>End:</b> {car.end ? new Date(car.end).toLocaleDateString() : "N/A"}</p>
          <p><b>Time Remaining:</b> {calculateTimeRemaining(car.end)}</p>
          <img src={car.image || "default-image.jpg"} alt={car.carName} className="my-auction-img" />
          <h3>{car.carName}</h3>
          <p><b>Series:</b> {car.series}</p>
          <p><b>Year:</b> {car.year}</p>
          <p><b>Rarity:</b> {car.rarity}</p>
          <p><b>Starting Bid:</b> {car.startingBid} BDT</p>
          <p><b>Current Bid:</b> {car.currentBid} BDT</p>
        </div>
      ))}
    </div>
  </div>
);
};

export default MyAuction;
