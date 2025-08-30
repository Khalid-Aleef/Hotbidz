import React, { useEffect, useState } from "react";
import axios from "axios";
import './myauction.css';

const MyAuction = () => {
  const [auctionCars, setAuctionCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showDetails, setShowDetails] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [commentText, setCommentText] = useState("");

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

  // Live time update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Calculate remaining time
  const calculateTimeRemaining = (endTime) => {
    if (!endTime) return "N/A";

    const end = new Date(endTime);
    const timeDiff = end - currentTime;

    if (timeDiff <= 0) return "Auction Ended";

    const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${seconds}s remaining`;
    } else if (hours > 0) {
      return `${hours}h ${minutes}m ${seconds}s remaining`;
    } else if (minutes > 0) {
      return `${minutes}m ${seconds}s remaining`;
    } else {
      return `${seconds}s remaining`;
    }
  };

  // Handle opening details modal
  const handleCarClick = (car, e) => {
    if (e.target.tagName === "BUTTON") return;
    setSelectedCar(car);
    setShowDetails(true);
  };

  // Handle adding a comment
  const handleAddComment = async () => {
    if (!commentText.trim()) return;

    try {
      const response = await axios.post(
        `http://localhost:5000/api/auctions/${selectedCar._id}/comment`,
        { userId, text: commentText }
      );
      setSelectedCar(response.data.auction);
      setCommentText("");
    } catch (err) {
      console.error("Error adding comment:", err);
    }
  };

  if (loading) return <p>Loading your auctions...</p>;
  if (error) return <p>{error}</p>;


return (
  <div className="my-auction-container">
    <h2>My Auctions</h2>
    <div className="my-auction-grid">
      {auctionCars.length === 0 && <p>No auctions found.</p>}
             {auctionCars.map((car) => (
         <div 
           key={car._id} 
           className="my-auction-card"
           onClick={(e) => handleCarClick(car, e)}
         >
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

     {/* Details Modal */}
     {showDetails && selectedCar && (
       <div className="details-modal">
         <div className="details-modal-content">
           <h2>{selectedCar.carName}</h2>
           <img
             src={selectedCar.image || "default-image.jpg"}
             alt={selectedCar.carName}
           />
           <p><b>Series:</b> {selectedCar.series}</p>
           <p><b>Year:</b> {selectedCar.year}</p>
           <p><b>Rarity:</b> {selectedCar.rarity}</p>
           <p><b>Description:</b> {selectedCar.description}</p>
           <p><b>Current Bid:</b> {selectedCar.currentBid} BDT</p>
           <p><b>Seller:</b> {selectedCar.sellerName}</p>

           {/* Comments Section */}
           <div className="comments-section">
             <h3>Comments</h3>
             {selectedCar.cmnt?.length > 0 ? (
               <ul>
                 {selectedCar.cmnt.map((c, idx) => (
                   <li key={idx}>
                     <b>{c.userName || "User"}:</b> {c.text}
                   </li>
                 ))}
               </ul>
             ) : (
               <p>No comments yet.</p>
             )}
             <div className="add-comment">
               <input
                 type="text"
                 placeholder="Write a comment..."
                 value={commentText}
                 onChange={(e) => setCommentText(e.target.value)}
               />
               <button onClick={handleAddComment}>Add Comment</button>
             </div>
           </div>

           <button onClick={() => setShowDetails(false)}>Close</button>
         </div>
       </div>
     )}
   </div>
 );
};

export default MyAuction;
