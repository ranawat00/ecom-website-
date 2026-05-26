const express = require('express');
const router = express.Router();
const { verifyToken, verifyAdmin } = require('../middlewares/authMiddleware');
const adminController = require('../controllers/adminController');
const productController = require('../controllers/productController');

// All routes here require token verification and admin role check
router.use(verifyToken, verifyAdmin);

// Analytics Statistics
router.get('/stats', adminController.getStatsSummary);

// Product Catalog CRUD
router.get('/products', productController.getAllProductsAdmin);
router.post('/products', productController.createProduct);
router.put('/products/:id', productController.editProduct);
router.delete('/products/:id', productController.deleteProduct);

// Orders Fulfillment
router.get('/orders', adminController.getAllOrders);
router.put('/orders/:id/status', adminController.updateOrderStatus);

// Financial Payments Audit
router.get('/payments', adminController.getAllPayments);

// Customer Reviews Moderation
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:productId/:reviewIndex', adminController.deleteReview);
router.put('/reviews/:productId/:reviewIndex/publish', adminController.publishReview);

// Contact Enquiries Management
router.get('/enquiries', adminController.getAllEnquiries);
router.put('/enquiries/:id/status', adminController.updateEnquiryStatus);

module.exports = router;
