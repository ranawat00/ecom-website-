/**
 * Middleware to validate sign up request body
 */
const validateSignup = (req, res, next) => {
    const { username, mobileNo, email, address, password } = req.body;

    // Check if required fields are present
    if (!username || !mobileNo || !email || !address || !password) {
        return res.status(400).json({
            success: false,
            message: 'All fields are required (username, mobileNo, email, address, password).'
        });
    }

    // Call next() to proceed to the controller if validation passes
    next();
};

const validateLogin = (req, res, next) => {
    const { email, mobileNo, password } = req.body;

    if ((!email && !mobileNo) || !password) {
        return res.status(400).json({
            success: false,
            message: 'Please provide either an email or mobile number, along with your password to login.'
        });
    }

    next();
};

module.exports = {
    validateSignup,
    validateLogin
};
