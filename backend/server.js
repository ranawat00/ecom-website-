const express = require('express');
const cors = require('cors');
const path = require('path');
const dotenv = require('dotenv');
const compression = require('compression');
const connectDB = require('./config/db');
const cluster = require('cluster');
const os = require('os');

// Load env vars
dotenv.config();

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
const adminRoutes = require('./routes/adminRoutes');
const couponRoutes = require('./routes/couponRoutes');

const PORT = process.env.PORT || 5000;

if (cluster.isPrimary && process.env.NODE_ENV === 'production') {
    const numCPUs = os.cpus().length;
    console.log(`[Cluster Master] Spawning ${numCPUs} parallel worker processes to support 1,000+ high concurrency users...`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`[Cluster Master] Worker process ${worker.process.pid} terminated. Spawning replacement worker...`);
        cluster.fork();
    });
} else {
    // Connect to Database per worker process
    connectDB();

    const app = express();

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
app.use(express.json({ limit: '10mb' })); // Allow larger JSON payloads for Base64 image uploads
app.use(express.urlencoded({ limit: '10mb', extended: true }));

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
app.use('/api/admin', adminRoutes);
app.use('/api/coupons', couponRoutes);


// ==========================================
// Static Files & Frontend Hosting
// ==========================================
// Serve the static files from the React app with custom browser caching rules
app.use(express.static(path.join(__dirname, '../frontend/build'), {
  maxAge: '1d', // Default fallback
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html')) {
      // Never cache index.html so users always get the latest version
      res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    } else if (filePath.match(/\.(js|css|woff2?|eot|ttf|otf)$/)) {
      // Fingerprinted bundle files and web fonts can be cached forever (1 year)
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    } else if (filePath.match(/\.(png|jpe?g|gif|webp|svg|ico)$/)) {
      // Cache image assets for 30 days
      res.setHeader('Cache-Control', 'public, max-age=2592000');
    }
  }
}));

// Health check / API status
app.get('/api-status', (req, res) => {
    res.send('Backend API is running. Structured with MVC Pattern.');
});

// The catch-all handler: for any request that doesn't
// match one above, send back React's index.html file if it exists, 
// otherwise return a clean API status JSON.
app.use((req, res) => {
  const indexPath = path.join(__dirname, '../frontend/build', 'index.html');
  if (require('fs').existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(200).json({
      success: true,
      message: 'MaaPoshan Heritage API Server is live and fully operational. Ready for orders!'
    });
  }
});

// ==========================================
// Start the server
// ==========================================
app.listen(PORT, () => {
    console.log(`[Worker ${process.pid}] Server is running on port ${PORT}`);
});
}
