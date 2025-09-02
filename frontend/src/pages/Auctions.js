import React, { useEffect, useState } from "react";
import axios from "axios";
import './Auctions.css';

const Auctions = () => {
  const [auctionCars, setAuctionCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [closedAuctions, setClosedAuctions] = useState(new Set());
  const [currentTime, setCurrentTime] = useState(new Date());

  const [showBidForm, setShowBidForm] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidError, setBidError] = useState("");

  const [showDetails, setShowDetails] = useState(false); 
  const [commentText, setCommentText] = useState("");

  const [search, setSearch] = useState("");
  const [rarity, setRarity] = useState("");
  const [sortBy, setSortBy] = useState("");

  const userId = localStorage.getItem("userId");

  useEffect(() => {
    if (!userId) {
      setError("You must be logged in to view auction cars.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://localhost:5000/api/auctions?userId=${userId}`)
      .then((res) => {
        const auctionData = res.data;

        const sellerPromises = auctionData.map(async (car) => {
          try {
            const sellerResponse = await axios.get(`http://localhost:5000/api/users/${car.sellerId}`);
            const sellerName = sellerResponse.data.name;
            
            // Get highest bidder name if exists
            let highestBidderName = "No bids yet";
            if (car.highestBidder && car.highestBidder !== car.sellerId) {
              try {
                const bidderResponse = await axios.get(`http://localhost:5000/api/users/${car.highestBidder}`);
                highestBidderName = bidderResponse.data.name;
              } catch (err) {
                highestBidderName = "Unknown bidder";
              }
            }
            
            return {
              ...car,
              sellerName,
              highestBidderName
            };
          } catch (err) {
            return { 
              ...car, 
              sellerName: "Unknown",
              highestBidderName: "Unknown bidder"
            };
          }
        });

        Promise.all(sellerPromises).then((carsWithSeller) => {
          setAuctionCars(carsWithSeller);
          setLoading(false);
        });
      })
      .catch((err) => {
        setError("Error fetching auction cars");
        setLoading(false);
        console.error("Error fetching auction cars", err);
      });
  }, [userId]);

  // Live time update every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const filteredAndSortedCars = auctionCars
    .filter((car) => {
      const matchesSearch =
        car.name?.toLowerCase().includes(search.toLowerCase()) ||
        car.series?.toLowerCase().includes(search.toLowerCase()) ||
        car.carName?.toLowerCase().includes(search.toLowerCase());
      const matchesRarity = rarity ? car.rarity === rarity : true;
      return matchesSearch && matchesRarity;
    })
         .sort((a, b) => {
       if (sortBy === "highestBid") return b.currentBid - a.currentBid;
       if (sortBy === "lowestBid") return a.currentBid - b.currentBid;
       if (sortBy === "endingSoon") return new Date(a.end) - new Date(b.end);
       if (sortBy === "mostLiked") return (b.likes || 0) - (a.likes || 0);
       return 0;
     });

  const calculateTimeRemaining = (endTime, status, auctionId, highestBidder, sellerId) => {
    const end = new Date(endTime);
    const timeDiff = end - currentTime;

    if (status === "closed" || timeDiff <= 0) {
      if (!closedAuctions.has(auctionId)) {
        if (highestBidder && String(highestBidder) === String(sellerId)) {
          removeAuction(auctionId);
        } else {
          closeAuctionAndRecordPayment(auctionId);
        }
        setClosedAuctions((prev) => new Set(prev.add(auctionId)));
      }
      return "Auction Ended";
    }

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

  const closeAuctionAndRecordPayment = async (auctionId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auctions/end/${auctionId}`
      );
      console.log("Auction ended and payment recorded:", response.data);
    } catch (err) {
      console.error("Error ending auction and recording payment:", err);
    }
  };

  const removeAuction = async (auctionId) => {
    try {
      const response = await axios.delete(
        `http://localhost:5000/api/auctions/remove/${auctionId}`
      );
      console.log("Auction removed:", response.data);
      // Remove from local state so UI updates immediately
      setAuctionCars(prevCars => prevCars.filter(car => car._id !== auctionId));
      setClosedAuctions((prev) => new Set(prev.add(auctionId)));
    } catch (err) {
      console.error("Error removing auction:", err);
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
      setBidError(
        `Bid must be higher than ${
          selectedCar.currentBid + selectedCar.minIncBid
        } BDT.`
      );
      return;
    }

    try {
      const userId = localStorage.getItem("userId");
      if (!userId) {
        setBidError("You need to be logged in to place a bid.");
        return;
      }

      const response = await axios.post(
        `http://localhost:5000/api/auctions/bid/${selectedCar._id}`,
        { userId, bidAmount }
      );

      // Get current user name for highest bidder
      const currentUser = await axios.get(`http://localhost:5000/api/users/${userId}`);
      const bidderName = currentUser.data.name;

      // Update the auction data with the new bid and highest bidder
      setAuctionCars(prevCars => 
        prevCars.map(car => 
          car._id === selectedCar._id 
            ? { 
                ...car, 
                currentBid: parseInt(bidAmount),
                highestBidder: userId,
                highestBidderName: bidderName
              }
            : car
        )
      );

      // Update the selected car for the details modal
      setSelectedCar(prev => 
        prev ? { 
          ...prev, 
          currentBid: parseInt(bidAmount),
          highestBidder: userId,
          highestBidderName: bidderName
        } : null
      );

      alert(response.data.message);
      setShowBidForm(false);
      setBidError("");
    } catch (err) {
      setBidError(err.response?.data?.message || "Error placing bid");
    }
  };

  const closeBidForm = () => {
    setShowBidForm(false);
    setBidError("");
  };

  //  Handle opening details modal
  const handleCarClick = (car, e) => {
    if (e.target.tagName === "BUTTON") return; 
    setSelectedCar(car);
    setShowDetails(true);
  };

  //  Handle adding a comment
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

  // Handle adding/removing a like
  const handleLike = async (carId) => {
    try {
      const response = await axios.post(
        `http://localhost:5000/api/auctions/${carId}/like`,
        { userId }
      );
      
      // Update the auction data with the new like count and likedBy array
      setAuctionCars(prevCars => 
        prevCars.map(car => 
          car._id === carId 
            ? { 
                ...car, 
                likes: response.data.auction.likes,
                likedBy: response.data.auction.likedBy
              }
            : car
        )
      );

      // Update the selected car for the details modal
      setSelectedCar(prev => 
        prev && prev._id === carId 
          ? { 
              ...prev, 
              likes: response.data.auction.likes,
              likedBy: response.data.auction.likedBy
            }
          : prev
      );
    } catch (err) {
      console.error("Error toggling like:", err);
    }
  };

  if (loading) return <p>Loading auctions...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="auction-container">
      <h2>Hot Wheels Auctions</h2>

      {/* Filter & Sort Controls */}
      <div className="auction-filters">
        <input
          type="text"
          placeholder="Search cars..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={rarity} onChange={(e) => setRarity(e.target.value)}>
          <option value="">All Rarities</option>
          <option value="Common">Common</option>
          <option value="Uncommon">Uncommon</option>
          <option value="Rare">Rare</option>
          <option value="Super Treasure Hunt">Super Treasure Hunt</option>
        </select>
                 <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
           <option value="">Sort By</option>
           <option value="endingSoon">Ending Soon</option>
           <option value="highestBid">Highest Bid</option>
           <option value="lowestBid">Lowest Bid</option>
           <option value="mostLiked">Most Liked</option>
         </select>
      </div>

      <div className="auction-grid">
        {filteredAndSortedCars.length === 0 && (
          <p>No cars currently up for auction.</p>
        )}

        {filteredAndSortedCars.map((car) => (
          <div
            key={car._id}
            className="auction-card"
            onClick={(e) => handleCarClick(car, e)} // 
          >
            <p>
              <b>End:</b> {car.end ? new Date(car.end).toLocaleDateString() : "N/A"}
            </p>
            <p>
              <b>Time Remaining:</b>{" "}
              {calculateTimeRemaining(car.end, car.status, car._id, car.highestBidder, car.sellerId)}
            </p>

            <img
              src={car.image || "default-image.jpg"}
              alt={car.carName || car.name}
              className="auction-img"
            />

            <h3>{car.carName || car.name}</h3>
            <p><b>Series:</b> {car.series}</p>
            <p><b>Year:</b> {car.year}</p>
            <p><b>Rarity:</b> {car.rarity}</p>
            <p><b>Starting Bid:</b> {car.startingBid} BDT</p>
            <p><b>Current Bid:</b> {car.currentBid} BDT</p>
            <p><b>Highest Bidder:</b> {car.highestBidderName}</p>
            <p><b>Seller:</b> {car.sellerName}</p>
            <p><b>Likes:</b> {car.likes || 0}</p>

            <div className="auction-card-buttons">
              <button
                className="bid-btn"
                onClick={() => handleBidClick(car)}
                disabled={car.status === "closed"}
              >
                Bid
              </button>
                             <button
                 className={`like-btn ${car.likedBy?.includes(userId) ? 'liked' : ''}`}
                 onClick={(e) => {
                   e.stopPropagation();
                   handleLike(car._id);
                 }}
               >
                 {car.likedBy?.includes(userId) ? 'Unlike' : 'Like'}
               </button>
            </div>
          </div>
        ))}
      </div>

      {/*  Details Modal */}
      {showDetails && selectedCar && (
        <div className="details-modal">
          <div className="details-modal-content">
            <h2>{selectedCar.carName || selectedCar.name}</h2>
            <img
              src={selectedCar.image || "default-image.jpg"}
              alt={selectedCar.carName || selectedCar.name}
            />
            <p><b>Series:</b> {selectedCar.series}</p>
            <p><b>Year:</b> {selectedCar.year}</p>
            <p><b>Rarity:</b> {selectedCar.rarity}</p>
            <p><b>Description:</b> {selectedCar.description}</p>
            <p><b>Current Bid:</b> {selectedCar.currentBid} BDT</p>
            <p><b>Highest Bidder:</b> {selectedCar.highestBidderName}</p>
            <p><b>Seller:</b> {selectedCar.sellerName}</p>
            <p><b>Likes:</b> {selectedCar.likes || 0}</p>
            
                         <button
               className={`like-btn ${selectedCar.likedBy?.includes(userId) ? 'liked' : ''}`}
               onClick={() => handleLike(selectedCar._id)}
             >
               {selectedCar.likedBy?.includes(userId) ? 'Unlike' : 'Like'}
             </button>

            {/*  Comments Section */}
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

      {showBidForm && selectedCar && (
        <div className="bid-form-modal">
          <div className="bid-form-modal-content">
            <h4>Place Your Bid</h4>
            <p>
              Bid amount should be at least{" "}
              {selectedCar.currentBid + selectedCar.minIncBid} BDT
            </p>
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
