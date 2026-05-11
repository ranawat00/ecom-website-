const Address = require('../models/addressModel');

/**
 * @desc    Get all addresses for the logged-in user
 * @route   GET /api/address
 */
const getAddresses = async (req, res) => {
    try {
        const userAddresses = await Address.find({ userId: req.user.id });
        return res.status(200).json({ success: true, addresses: userAddresses });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Add a new address
 * @route   POST /api/address
 */
const addAddress = async (req, res) => {
    const { type, street, city, state, pincode } = req.body;

    if (!street || !city || !state || !pincode) {
        return res.status(400).json({
            success: false,
            message: 'Street, City, State, and Pincode are required.'
        });
    }

    try {
        const newAddress = await Address.create({
            userId: req.user.id,
            type: type || 'Home',
            street,
            city,
            state,
            pincode
        });

        return res.status(201).json({
            success: true,
            message: 'Address added successfully.',
            address: newAddress
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Update an existing address
 * @route   PUT /api/address/:id
 */
const updateAddress = async (req, res) => {
    const addressId = req.params.id;

    try {
        const existing = await Address.findById(addressId);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Address not found.' });
        }

        if (existing.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to edit this address.' });
        }

        const { type, street, city, state, pincode } = req.body;
        const updated = await Address.findByIdAndUpdate(
            addressId, 
            { type, street, city, state, pincode },
            { new: true }
        );

        return res.status(200).json({
            success: true,
            message: 'Address updated successfully.',
            address: updated
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

/**
 * @desc    Delete an address
 * @route   DELETE /api/address/:id
 */
const deleteAddress = async (req, res) => {
    const addressId = req.params.id;

    try {
        const existing = await Address.findById(addressId);
        if (!existing) {
            return res.status(404).json({ success: false, message: 'Address not found.' });
        }

        if (existing.userId.toString() !== req.user.id.toString()) {
            return res.status(403).json({ success: false, message: 'Unauthorized to delete this address.' });
        }

        await Address.findByIdAndDelete(addressId);

        return res.status(200).json({
            success: true,
            message: 'Address deleted successfully.'
        });
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Server error' });
    }
};

module.exports = { getAddresses, addAddress, updateAddress, deleteAddress };
