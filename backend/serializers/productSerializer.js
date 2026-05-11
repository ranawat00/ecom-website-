/**
 * Product Serializer
 * Cleans and normalizes Product documents for API responses.
 */

/**
 * Serialize a single product.
 *
 * @param {Object} product - Mongoose document or lean plain object
 * @returns {Object} clean product object
 */
const serializeProduct = (product) => {
    const obj = product.toObject ? product.toObject({ virtuals: true }) : { ...product };

    const id = obj.id || (obj._id ? obj._id.toString() : undefined);

    delete obj._id;
    delete obj.__v;

    return { ...obj, id };
};

/**
 * Serialize a list of products.
 *
 * @param {Array} products
 * @returns {Array}
 */
const serializeProducts = (products) => products.map(serializeProduct);

module.exports = { serializeProduct, serializeProducts };
