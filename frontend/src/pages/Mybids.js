import React, { useState, useEffect } from "react";
import axios from "axios";
import './Mybids.css';

const MyBids = () => {
  const [myBids, setMyBids] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedBid, setSelectedBid] = useState(null);
  const [enteredAmount, setEnteredAmount] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [paymentError, setPaymentError] = useState("");

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

  const handlePayment = (bid) => {
    setSelectedBid(bid);
    setEnteredAmount(bid.bidAmount); // Default bid amount
    setShowPaymentModal(true); // Show payment modal
  };

  const handlePaymentSubmit = (e) => {
    e.preventDefault();

    // Check if entered amount matches the bid amount
    if (enteredAmount !== selectedBid.bidAmount) {
      setPaymentError("The entered amount does not match the bid amount.");
      return;
    }

    // Check if password and confirm password match
    if (password !== confirmPassword) {
      setPaymentError("Passwords do not match.");
      return;
    }

    // Send the data to the backend to validate (password and amount)
    axios.post(`http://localhost:5000/api/val/validate`, {
      auctionId: selectedBid.auctionId._id,
      enteredAmount,
      password
    })
      .then(response => {
        alert("Payment successful!");
        setShowPaymentModal(false); // Close the modal
      })
      .catch(err => {
        setPaymentError(err.response?.data?.message || "Error processing payment");
      });
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
                onClick={() => handlePayment(payment)}
              >
                Pay Now
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Payment Modal */}
      {showPaymentModal && (
        <div className="payment-modal-overlay">
          <div className="payment-modal-content">
            <h4>Complete Your Payment</h4>
            <form onSubmit={handlePaymentSubmit}>
              <label>
                Amount:
                <input
                  type="number"
                  value={enteredAmount}
                  disabled
                  readOnly
                />
              </label>
              <label>
                Enter Amount:
                <input
                  type="number"
                  value={enteredAmount}
                  onChange={(e) => setEnteredAmount(e.target.value)}
                  required
                />
              </label>
              <label>
                Enter Password:
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <label>
                Re-enter Password:
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </label>
              {paymentError && <p className="error">{paymentError}</p>}
              <button type="submit">Pay Now</button>
              <button type="button" onClick={() => setShowPaymentModal(false)}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyBids;
