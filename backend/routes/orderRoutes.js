const express = require('express');
const { placeOrder, getOrders, getOrderById, cancelOrder } = require('../controllers/orderController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/', verifyToken, placeOrder);
router.get('/', verifyToken, getOrders);
router.post('/:id/cancel', verifyToken, cancelOrder);
router.get('/:id', verifyToken, getOrderById);

module.exports = router;
