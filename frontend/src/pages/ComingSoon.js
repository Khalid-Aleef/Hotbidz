import React, { useEffect, useState } from "react";
import axios from "axios";
import './Auctions.css';

const ComingSoon = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [now, setNow] = useState(new Date());
  const [isPromoting, setIsPromoting] = useState(false);

  

  const fetchItems = () => {
    axios
      .get(`http://localhost:5000/api/comingsoon`)
      .then(res => {
        setItems(res.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Error fetching coming soon items');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchItems();
  }, []);

  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  
  useEffect(() => {
    const due = items.filter(i => new Date(i.start) <= now);
    if (due.length === 0 || isPromoting) return;
    
    const promoteAll = async () => {
      setIsPromoting(true);
      try {
        
        for (const item of due) {
          try {
            await axios.post(`http://localhost:5000/api/comingsoon/promote/${item._id}`);
          } catch (error) {
            
            console.log(`Failed to promote auction ${item._id}:`, error.response?.data?.message || error.message);
          }
        }
        fetchItems();
      } catch (e) {
        
        fetchItems();
      } finally {
        setIsPromoting(false);
      }
    };
    promoteAll();
    
    
  }, [items, now]);

  const formatRemaining = (start) => {
    const startDate = new Date(start);
    const diff = startDate - now;
    if (diff <= 0) return 'Starting soon';
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m ${seconds}s`;
    if (hours > 0) return `${hours}h ${minutes}m ${seconds}s`;
    if (minutes > 0) return `${minutes}m ${seconds}s`;
    return `${seconds}s`;
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="auction-container">
      <h2>Coming Soon</h2>
      <div className="auction-grid">
        {items.length === 0 && <p>No scheduled auctions.</p>}
        {items.map(item => (
          <div key={item._id} className="auction-card">
            <p><b>Starts:</b> {item.start ? new Date(item.start).toLocaleString() : 'N/A'}</p>
            <p><b>Starts In:</b> {formatRemaining(item.start)}</p>
            <img src={item.image || 'default-image.jpg'} alt={item.carName} className="auction-img" />
            <h3>{item.carName}</h3>
            <p><b>Series:</b> {item.series}</p>
            <p><b>Year:</b> {item.year}</p>
            <p><b>Rarity:</b> {item.rarity}</p>
            <p><b>Starting Bid:</b> {item.startingBid} BDT</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ComingSoon;


