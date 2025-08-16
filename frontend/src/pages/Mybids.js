import React, { useState, useEffect } from "react";
import axios from "axios";
import './Mybids.css';

const MyBids = () => {
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const userId = localStorage.getItem('userId'); // Assuming the userId is saved in localStorage

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view your bids.");
      setLoading(false);
      return;
    }

    // Fetch the payments where the user is the highest bidder
    axios.get(`http://localhost:5000/api/payments/mybids/${userId}`)
      .then(res => {
        setMyBids(res.data); // Assuming the response returns an array of bids
        setLoading(false);
      })
      .catch(err => {
        setError("Error fetching your bids.");
        setLoading(false);
      });
  }, [userId]);

  const handlePayment = (auctionId, bidAmount) => {
    // Function to handle payment logic
    alert(`Proceeding to payment for auction: ${auctionId} with bid amount: ${bidAmount}`);
    // You can redirect or trigger a payment process here
  };

  if (loading) {
    return <p>Loading your bids...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="my-bids-container">
      <h2>Your Bids</h2>
      {myBids.length === 0 ? (
        <p>No bids found.</p>
      ) : (
        <div className="my-bids-list">
          {myBids.map((payment) => (
            <div key={payment._id} className="bid-card">
              <h3>{payment.auctionId.carName}</h3>

              {/* Displaying car image */}
              <img
                src={payment.auctionId.image}
                alt={payment.auctionId.carName}
                className="car-image"
              />

              <p><b>Bid Amount:</b> {payment.bidAmount} BDT</p>
              <p><b>Status:</b> {payment.paymentStatus}</p>
              <button
                className="payment-btn"
                onClick={() => handlePayment(payment.auctionId._id, payment.bidAmount)}
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBids;
