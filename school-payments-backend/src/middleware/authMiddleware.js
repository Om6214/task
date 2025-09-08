import jwt from "jsonwebtoken";

export const protect = (req, res, next) => {
  // Check if Authorization header exists
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, token missing" });
  }

  try {
    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Attach user info to request
    req.user = decoded;

    next(); // pass control to next handler
  } catch (err) {
    return res.status(401).json({ message: "Token invalid", error: err.message });
  }
};
