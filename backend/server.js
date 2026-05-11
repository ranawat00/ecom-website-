const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const connectDB = require('./config/db');

// Load env vars
dotenv.config();

// Connect to Database
connectDB();

// Import routes
const authRoutes = require('./routes/authRoutes');
const addressRoutes = require('./routes/addressRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const contactRoutes = require('./routes/contactRoutes');
const productRoutes = require('./routes/productRoutes');
const subscriberRoutes = require('./routes/subscriberRoutes');
const searchRoutes = require('./routes/searchRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const aiRoutes = require('./routes/aiRoutes');


const app = express();
const PORT = process.env.PORT || 5000;

// ==========================================
// Global Middlewares
// ==========================================
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:5000',
  'http://localhost:5173',
  'http://localhost:5174'
].filter(Boolean);


app.use(cors({
  origin: true, // In dev, allow all to fix connectivity issues
  credentials: true
}));

app.use(compression()); // Compress all responses
app.use(express.json()); // Built-in middleware for parsing JSON

// ==========================================
// Routes
// ==========================================
// Mount the routes
app.use('/api/auth', authRoutes);
app.use('/api/address', addressRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/products', productRoutes);
app.use('/api/subscribers', subscriberRoutes);
app.use('/api/search', searchRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/ai', aiRoutes);


// ==========================================
// Static Files & Frontend Hosting
// ==========================================
// Serve the static files from the React app
app.use(express.static(path.join(__dirname, '../frontend/build')));

// Health check / API status
app.get('/api-status', (req, res) => {
    res.send('Backend API is running. Structured with MVC Pattern.');
});

// The catch-all handler: for any request that doesn't
// match one above, send back React's index.html file.
app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
});

// ==========================================
// Start the server
// ==========================================
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
