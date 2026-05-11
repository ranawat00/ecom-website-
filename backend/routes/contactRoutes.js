const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// POST /api/contact - Submit a contact enquiry
router.post('/', contactController.submitEnquiry);

module.exports = router;
