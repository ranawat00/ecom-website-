/**
 * Cart Serializer
 * Cleans and normalizes Cart documents for API responses.
 * Strips internal Mongoose _ids from sub-documents.
 */

/**
 * Serialize a single cart item.
 * Removes the sub-document _id so it's safe to embed in Order documents.
 *
 * @param {Object} item - Mongoose sub-document or plain object
 * @returns {Object} clean cart item
 */
const serializeCartItem = (item) => {
    const obj = item.toObject ? item.toObject() : { ...item };
    const id = obj._id || obj.itemId;

    delete obj._id;

    return {
        ...obj,
        itemId: id ? id.toString() : undefined
    };
};

/**
 * Serialize a full Cart document for API responses.
 *
 * @param {Object} cart - Mongoose document or lean plain object
 * @returns {Object} clean cart object
 */
const serializeCart = (cart) => {
    const obj = cart.toObject ? cart.toObject() : { ...cart };

    delete obj._id;
    delete obj.__v;

    const items = Array.isArray(obj.items) ? obj.items.map(serializeCartItem) : [];
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    return {
        ...obj,
        items,
        total,
        itemCount: items.reduce((sum, item) => sum + item.quantity, 0)
    };
};

/**
 * Serialize cart items into a clean list safe for embedding in Order documents.
 * Strips sub-document _ids to avoid schema conflicts on insert.
 *
 * @param {Array} items - Array of Mongoose sub-documents
 * @returns {Array} clean plain-object items
 */
const serializeCartItemsForOrder = (items) =>
    items.map((item) => {
        const obj = item.toObject ? item.toObject() : { ...item };
        delete obj._id;
        return obj;
    });

module.exports = { serializeCart, serializeCartItem, serializeCartItemsForOrder };
