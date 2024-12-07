export const apiKeyMiddleware = (req, res, next) => {
    const apiKey = req.headers['admin-api-key'];  // The API key from the request header
    const storedApiKey = process.env.ADMIN_API_KEY;  // Store API key securely (in .env or database)

    if (!apiKey || apiKey !== storedApiKey) {
        return res.status(403).json({ message: 'Forbidden: Invalid API key' });
    }

    next();  // Proceed if API key is valid
};
