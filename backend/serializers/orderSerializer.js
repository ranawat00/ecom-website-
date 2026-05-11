/**
 * Order Serializer
 * Cleans and normalizes Order documents for API responses.
 * Uses .lean() output (plain JS object) for best performance.
 */

/**
 * Serialize a single order for the API response.
 * Strips internal Mongoose meta-fields and normalizes the id.
 *
 * @param {Object} order - Mongoose document or lean plain object
 * @returns {Object} clean order object safe for JSON response
 */
const serializeOrder = (order) => {
    const obj = order.toObject ? order.toObject() : { ...order };

    // Remove internal Mongoose fields
    delete obj._id;
    delete obj.__v;

    // Normalize nested item _ids
    if (Array.isArray(obj.items)) {
        obj.items = obj.items.map(item => {
            const i = { ...item };
            delete i._id;
            return i;
        });
    }

    // Normalize address _id if present
    if (obj.address) {
        const a = { ...obj.address };
        delete a._id;
        obj.address = a;
    }

    // Expose orderId as `id` for frontend compatibility
    obj.id = obj.orderId;

    return obj;
};

/**
 * Serialize a list of orders.
 *
 * @param {Array} orders - Array of Mongoose documents or lean objects
 * @returns {Array} array of clean order objects
 */
const serializeOrders = (orders) => orders.map(serializeOrder);

module.exports = { serializeOrder, serializeOrders };
