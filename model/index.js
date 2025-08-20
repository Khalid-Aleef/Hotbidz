const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

// Routes  
const userRoutes = require('./routes/userroutes');
const inventoryRoutes = require('./routes/userinventoryroutes');
const authRoutes = require('./routes/auth');
const auctionRoutes = require('./routes/auctionroute');
const paymentRoute = require('./routes/paymentroute'); 
const myAuctionRoutes = require('./routes/myaucroute');
const payUpdateRoute = require('./routes/payupdate');
const carUpdateRoute = require('./routes/carupdate'); // Import car update route

// Use routes
app.use('/api/val', payUpdateRoute);
app.use('/api/myauctions', myAuctionRoutes);
app.use('/api/auctions', auctionRoutes);
app.use('/api', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/payments', paymentRoute);
app.use('/api/carup', carUpdateRoute); // Use the new car update route for adding a car

app.get('/', (req, res) => res.send('Backend is Running'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
