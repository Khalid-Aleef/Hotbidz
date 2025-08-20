import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import './Inventory.css';

const UserInventory = () => {
  const { id } = useParams();
  const [cars, setCars] = useState([]);
  const [showAddCarForm, setShowAddCarForm] = useState(false);
  const [auctionFor, setAuctionFor] = useState(null);
  const [startingBid, setStartingBid] = useState('');
  const [endISO, setEndISO] = useState('');
  const [form, setForm] = useState({
    name: '',
    series: '',
    yearReleased: '',
    color: '',
    image: '',
    rarity: 'Common',
    price: '',
    description: '',
  });
  const [error, setError] = useState('');

  useEffect(() => {
    if (!id) return;
    axios
      .get(`http://localhost:5000/api/inventory/${id}`)
      .then((res) => setCars(res.data))
      .catch((err) => console.error('Error loading inventory', err));
  }, [id]);

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };

  // Open/close the Add Car form modal
  const openAddCarForm = () => setShowAddCarForm(true);
  const closeAddCarForm = () => setShowAddCarForm(false);

  // Open/close Auction modal
  const openAuction = (car) => {
    setAuctionFor(car);
    setStartingBid('');
    setEndISO('');
  };
  const closeAuction = () => setAuctionFor(null);

  // Submit auction
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
      setError(err.response?.data?.message || 'Failed to create auction');
    }
  };

  // Submit Add Car form
  const handleAddCarSubmit = async (e) => {
    e.preventDefault();
    console.log('Form Submitted ✅'); // Debug
    const userId = localStorage.getItem('userId');
    if (!userId) {
      setError('User not logged in');
      return;
    }
    try {
      const res = await axios.post('http://localhost:5000/api/carup/carup', {
        ...form,
        addedBy: userId,
        auc: 0,
        inAuction: false,
      });
      alert("Car added to inventory!");
      setForm({
      name: "",
      series: "",
      yearReleased: "",
      color: "",
      image: "",
      rarity: "",
      price: "",
      description: "",
      addedBy: "",
      auc: "",
      inAuction: false,
    });
      setShowAddCarForm(false);
      setCars((prev) => [...prev, res.data]);
    } catch (err) {
      console.error("Error adding car:", err.response?.data || err.message);
      setError(err.response?.data?.message || 'Error adding car');
    }
  };

  return (
    <>
      <div className="inventory">
        <h2>My Hot Wheels Collection</h2>

        {/* Button to open Add Car form */}
        <button className="add-car-btn" onClick={openAddCarForm}>
          Add to Inventory
        </button>

        {error && <div className="error-message">{error}</div>}

        <div className="inventory-grid">
          {cars.map((car) => (
            <div key={car._id} className="car-card">
              {car.inAuction && <div className="auction-badge">In Auction</div>}

              <img src={car.image} alt={car.carName || car.name} width="200" />
              <h3>{car.carName || car.name}</h3>
              <p>Series: {car.series}</p>
              <p>Year: {car.yearReleased || car.year}</p>
              <p>Rarity: {car.rarity}</p>
              <p>Price: {car.price} BDT</p>
              <p>{car.description}</p>

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

      {/* Add Car Form Modal */}
      {showAddCarForm && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              closeAddCarForm();
            }
          }}
        >
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h3>Add a Car to Inventory</h3>
            <form onSubmit={handleAddCarSubmit} className="modal-form">
              <label>Name:</label>
              <input
                type="text"
                name="name"
               
                value={form.carName}
                onChange={handleInputChange}
                required
              />
              <label>Series:</label>
              <input
                type="text"
                name="series"
                value={form.series}
                onChange={handleInputChange}
                required
              />
              <label>Year Released:</label>
              <input
                type="number"
                name="yearReleased"
                value={form.yearReleased}
                onChange={handleInputChange}
                required
              />
              <label>Color:</label>
              <input
                type="text"
                name="color"
                value={form.color}
                onChange={handleInputChange}
                required
              />
              <label>Image URL:</label>
              <input
                type="url"
                name="image"
                value={form.image}
                onChange={handleInputChange}
                required
              />
              <label>Rarity:</label>
              <select
                name="rarity"
                value={form.rarity}
                onChange={handleInputChange}
                required
              >
                <option value="Common">Common</option>
                <option value="Uncommon">Uncommon</option>
                <option value="Rare">Rare</option>
                <option value="Super Treasure Hunt">Super Treasure Hunt</option>
              </select>
              <label>Price:</label>
              <input
                type="number"
                name="price"
                value={form.price}
                onChange={handleInputChange}
                required
              />
              <label>Description:</label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleInputChange}
                required
              />
              <div className="modal-actions">
                <button 
                    type="submit" 
                    className="modal-submit"
                    onClick={() => console.log("Submit button clicked")}  
                  >
                    Add Car
                  </button>
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={closeAddCarForm}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auction Modal */}
      {auctionFor && (
        <div
          className="modal-backdrop"
          onClick={(e) => {
            if (e.target.classList.contains('modal-backdrop')) {
              closeAuction();
            }
          }}
        >
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
                <button
                  type="button"
                  className="modal-cancel"
                  onClick={closeAuction}
                >
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
