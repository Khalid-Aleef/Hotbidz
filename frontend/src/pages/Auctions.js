import React, { useEffect, useState } from "react";
import axios from "axios";
import './Auctions.css';

const Auctions = () => {
  const [auctionCars, setAuctionCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closedAuctions, setClosedAuctions] = useState(new Set()); 

  
  const [showBidForm, setShowBidForm] = useState(false); 
  const [selectedCar, setSelectedCar] = useState(null); 
  const [bidAmount, setBidAmount] = useState(""); 
  const [bidError, setBidError] = useState(""); 

  const userId = localStorage.getItem('userId');  

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view auction cars.");
      setLoading(false);
      return;
    }

    axios.get(`http://localhost:5000/api/auctions?userId=${userId}`) 
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
        setError('Error fetching auction cars');
        setLoading(false);
        console.error("Error fetching auction cars", err);
      });
  }, [userId]); 

  
  const calculateTimeRemaining = (endTime, status, auctionId) => {
    const now = new Date();
    const end = new Date(endTime);
    const timeDiff = end - now;

    if (status === 'closed' || timeDiff <= 0) {
      if (!closedAuctions.has(auctionId)) {
        closeAuctionAndRecordPayment(auctionId);
        setClosedAuctions(prev => new Set(prev.add(auctionId)));
      }
      return "Auction Ended";
    }

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    return `${days}d ${hours}h ${minutes}m remaining`;
  };

  const closeAuctionAndRecordPayment = async (auctionId) => {
    try {
      const response = await axios.post(`http://localhost:5000/api/auctions/end/${auctionId}`);
      console.log("Auction ended and payment recorded:", response.data);
    } catch (err) {
      console.error("Error ending auction and recording payment:", err);
    }
  };

  const handleBidClick = (car) => {
    setSelectedCar(car);
    setBidAmount(car.currentBid + 50);
    setShowBidForm(true);
  };

  const handleSubmitBid = async (e) => {
    e.preventDefault();

    if (parseInt(bidAmount) < selectedCar.currentBid + selectedCar.minIncBid) {
      setBidError(`Bid must be higher than ${selectedCar.currentBid + selectedCar.minIncBid} BDT.`);
      return;
    }

    try {
      const userId = localStorage.getItem('userId');
      if (!userId) {
        setBidError("You need to be logged in to place a bid.");
        return;
      }

      const response = await axios.post(`http://localhost:5000/api/auctions/bid/${selectedCar._id}`, {
        userId,
        bidAmount
      });

      alert(response.data.message);
      setShowBidForm(false); 
    } catch (err) {
      setBidError(err.response?.data?.message || "Error placing bid");
    }
  };

  const closeBidForm = () => {
    setShowBidForm(false);
    setBidError("");
  };

  if (loading) {
    return <p>Loading auctions...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  return (
    <div className="auction-container">
      <h2>Hot Wheels Auctions</h2>
      <div className="auction-grid">
        {auctionCars.length === 0 && <p>No cars currently up for auction.</p>}

        {auctionCars.map((car) => (
          <div key={car._id} className="auction-card">
            <p><b>End:</b> {car.end ? new Date(car.end).toLocaleDateString() : "N/A"}</p>
            <p><b>Time Remaining:</b> {calculateTimeRemaining(car.end, car.status, car._id)}</p>

            <img src={car.image || "default-image.jpg"} alt={car.carName || car.name} className="auction-img" />

            <h3>{car.carName || car.name}</h3>
            <p><b>Series:</b> {car.series}</p>
            <p><b>Year:</b> {car.year}</p>
            <p><b>Rarity:</b> {car.rarity}</p>
            <p><b>Starting Bid:</b> {car.startingBid} BDT</p>
            <p><b>Current Bid:</b> {car.currentBid} BDT</p>
            <p><b>Seller:</b> {car.sellerName}</p>

            <button className="bid-btn" onClick={() => handleBidClick(car)} disabled={car.status === 'closed'}>
              Bid
            </button>
          </div>
        ))}
      </div>

      {showBidForm && selectedCar && (
        <div className="bid-form-modal">
          <div className="bid-form-modal-content">
            <h4>Place Your Bid</h4>
            <p>Bid amount should be at least {selectedCar.currentBid + selectedCar.minIncBid} BDT</p>
            <form onSubmit={handleSubmitBid}>
              <input
                type="number"
                value={bidAmount}
                onChange={(e) => setBidAmount(e.target.value)}
                min={selectedCar.currentBid + selectedCar.minIncBid}
                required
              />
              {bidError && <p className="error">{bidError}</p>}
              <button type="submit">Place Bid</button>
              <button type="button" onClick={closeBidForm}>Cancel</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Auctions;
