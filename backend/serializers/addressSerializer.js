/**
 * Address Serializer
 * Cleans and normalizes Address documents for API responses.
 */

/**
 * Serialize a single address document.
 * Strips _id and __v; exposes a string `id` field.
 *
 * @param {Object} address - Mongoose document or lean plain object
 * @returns {Object} clean address object
 */
const serializeAddress = (address) => {
    const obj = address.toObject ? address.toObject({ virtuals: true }) : { ...address };

    // Prefer the virtual `id` if present, else use _id
    const id = obj.id || (obj._id ? obj._id.toString() : undefined);

    delete obj._id;
    delete obj.__v;

    return { ...obj, id };
};

/**
 * Serialize a list of addresses.
 *
 * @param {Array} addresses
 * @returns {Array}
 */
const serializeAddresses = (addresses) => addresses.map(serializeAddress);

/**
 * Serialize an address into a plain, embeddable object (for storing inside orders).
 * Removes Mongoose-specific fields completely.
 *
 * @param {Object} address - Mongoose document or lean plain object
 * @returns {Object} plain address object safe for embedding
 */
const serializeAddressForOrder = (address) => {
    const obj = address.toObject ? address.toObject() : { ...address };

    delete obj._id;
    delete obj.__v;
    delete obj.userId; // Not needed inside the embedded order address
    delete obj.createdAt;
    delete obj.updatedAt;

    return obj;
};

module.exports = { serializeAddress, serializeAddresses, serializeAddressForOrder };
