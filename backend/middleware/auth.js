// middleware/auth.js
const jwt = require('jsonwebtoken');

// --- CRITICAL SECURITY CHECK ---
// We retrieve the secret exclusively from the environment.
const JWT_SECRET = process.env.JWT_SECRET;

// Fail Fast: If the secret is missing, stop the server immediately.
// This ensures you never accidentally run in production with a weak or missing key.
if (!JWT_SECRET) {
  console.error("FATAL ERROR: JWT_SECRET is not defined in environment variables.");
  process.exit(1); 
}

const auth = (req, res, next) => {
  // 1. Get the token from the header (Format: "Bearer <token>")
  const token = req.headers.authorization?.split(' ')[1];

  // 2. If no token is present, deny access immediately
  if (!token) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  try {
    // 3. Verify the token using the secure secret
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // 4. Attach the user data (id, role) to the request object
    req.user = decoded;
    
    // 5. Allow the request to proceed
    next();
  } catch (error) {
    // 6. If verification fails (expired or fake token), return 401
    res.status(401).json({ message: 'Invalid or expired token.' });
  }
};

module.exports = auth;