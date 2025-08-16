import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inventory.css';

const UserInventory = () => {
  const { id } = useParams();  // current user id
  const [cars, setCars] = useState([]);

  // modal state
  const [auctionFor, setAuctionFor] = useState(null); // car selected for auction
  const [startingBid, setStartingBid] = useState('');
  const [endISO, setEndISO] = useState('');

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:5000/api/inventory/${id}`)
      .then((res) => setCars(res.data))  // Set cars with inAuction status
      .catch((err) => console.error('Error loading inventory', err));
  }, [id]);

  // open/close modal
  const openAuction = (car) => {
    setAuctionFor(car);
    setStartingBid('');
    setEndISO('');
  };
  const closeAuction = () => setAuctionFor(null);

  // submit auction
  const submitAuction = async (e) => {
    e.preventDefault();
    try {
      await axios.post('http://localhost:5000/api/auctions', {
        carId: auctionFor._id,
        sellerId: id,
        startingBid,
        endISO,
      });
      alert('Auction created!');
      closeAuction();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create auction');
    }
  };

  return (
    <>
      <div className="inventory">
        <h2>My Hot Wheels Collection</h2>
        <div className="inventory-grid">
          {cars.map((car) => (
            <div key={car._id} className="car-card">
              {/* Show "In Auction" Badge if the car is in auction */}
              {car.inAuction && (
                <div className="auction-badge">In Auction</div>
              )}

              <img src={car.image} alt={car.carName || car.name} width="200" />
              <h3>{car.carName || car.name}</h3>
              <p>Series: {car.series}</p>
              <p>Year: {car.yearReleased || car.year}</p>
              <p>Rarity: {car.rarity}</p>
              <p>Price: {car.price} BDT</p>
              <p>{car.description}</p>

              {/* Show Auction Button only if the car is NOT in auction */}
              {!car.inAuction && (
                <div className="car-actions">
                  <button className="auction-btn" onClick={() => openAuction(car)}>
                    Start Auction
                  </button>
                  <button className="trade-btn">Trade</button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Auction Modal */}
      {auctionFor && (
        <div className="modal-backdrop" onClick={closeAuction}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Start Auction for {auctionFor.carName || auctionFor.name}</h3>

            <form onSubmit={submitAuction} className="modal-form">
              <label>Starting bid (BDT)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={startingBid}
                onChange={(e) => setStartingBid(e.target.value)}
                required
              />

              <label>End time</label>
              <input
                type="datetime-local"
                value={endISO}
                onChange={(e) => setEndISO(e.target.value)}
                required
              />

              <div className="modal-actions">
                <button type="button" className="modal-cancel" onClick={closeAuction}>
                  Cancel
                </button>
                <button type="submit" className="modal-submit">
                  Create Auction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default UserInventory;
