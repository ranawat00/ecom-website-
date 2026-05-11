const express = require('express');
const { getAddresses, addAddress, updateAddress, deleteAddress } = require('../controllers/addressController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

// All address routes are protected — require JWT
router.get('/', verifyToken, getAddresses);       // GET    /api/address
router.post('/', verifyToken, addAddress);         // POST   /api/address
router.put('/:id', verifyToken, updateAddress);    // PUT    /api/address/:id
router.delete('/:id', verifyToken, deleteAddress); // DELETE /api/address/:id

module.exports = router;
