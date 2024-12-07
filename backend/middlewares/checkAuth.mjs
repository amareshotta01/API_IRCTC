import jwt from "jsonwebtoken";

export const checkAuth = (requiredRole) => (req, res, next) => {
    // Extract token from cookies
    const token = req.cookies['auth_token']; // Extract 'auth_token' from cookies

    if (!token) {
        console.error('No token found in cookies');
        return res.status(401).json({ message: 'Access denied. Token missing.' });
    }

    try {
        // Verify the token using the secret key
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY); // Replace with your secret key

        // Check user role
        if (decoded.role !== requiredRole) {
            console.error(`Insufficient permissions: Expected ${requiredRole}, got ${decoded.role}`);
            return res.status(403).json({ message: 'Access denied. Insufficient permissions.' });
        }

        req.user = decoded; // Attach decoded token data to the request object
        next(); // Proceed to the next middleware or route handler
    } catch (error) {
        console.error('Token validation failed:', error);
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};
