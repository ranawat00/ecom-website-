/**
 * Serializers barrel export
 * Import all serializers from a single point:
 *
 * const { serializeOrder } = require('../serializers');
 * const { serializeCart }  = require('../serializers');
 */

const { serializeOrder, serializeOrders }                    = require('./orderSerializer');
const { serializeCart, serializeCartItem, serializeCartItemsForOrder } = require('./cartSerializer');
const { serializeAddress, serializeAddresses, serializeAddressForOrder } = require('./addressSerializer');
const { serializeUser, serializeUsers }                      = require('./userSerializer');
const { serializeProduct, serializeProducts }                = require('./productSerializer');

module.exports = {
    // Order
    serializeOrder,
    serializeOrders,

    // Cart
    serializeCart,
    serializeCartItem,
    serializeCartItemsForOrder,

    // Address
    serializeAddress,
    serializeAddresses,
    serializeAddressForOrder,

    // User
    serializeUser,
    serializeUsers,

    // Product
    serializeProduct,
    serializeProducts
};
