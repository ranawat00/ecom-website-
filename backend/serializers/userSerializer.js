/**
 * User Serializer
 * Cleans and normalizes User documents for API responses.
 * The password field is ALWAYS stripped — never exposed.
 */

/**
 * Serialize a single user for API responses.
 * Strips password, __v, and internal fields.
 *
 * @param {Object} user - Mongoose document or lean plain object
 * @returns {Object} safe user object
 */
const serializeUser = (user) => {
    const obj = user.toObject ? user.toObject({ virtuals: true }) : { ...user };

    const id = obj.id || (obj._id ? obj._id.toString() : undefined);

    // Security — never expose these fields
    delete obj.password;
    delete obj.resetPasswordToken;
    delete obj.resetPasswordExpires;
    delete obj._id;
    delete obj.__v;

    return { ...obj, id };
};

/**
 * Serialize a list of users (e.g. admin listings).
 *
 * @param {Array} users
 * @returns {Array}
 */
const serializeUsers = (users) => users.map(serializeUser);

module.exports = { serializeUser, serializeUsers };
