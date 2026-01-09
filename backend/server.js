const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// Import Routes
const userRoutes = require('./routes/userRoutes');
const tradeRoutes = require('./routes/tradeRoutes');
const stockRoutes = require('./routes/stockRoutes'); // <--- MAKE SURE THIS IS HERE
const aiRoutes = require('./routes/aiRoutes'); // <--- Import this

dotenv.config();
connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Register Routes
app.use('/api/users', userRoutes);
app.use('/api/trade', tradeRoutes);
app.use('/api/stocks', stockRoutes); // <--- THIS IS THE MISSING LINK
app.use('/api/ai', aiRoutes); // <--- Add this line

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));