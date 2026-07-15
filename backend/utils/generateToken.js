import jwt from "jsonwebtoken";

const generateToken = (userId, role) => {
  const secret = process.env.JWT_SECRET || "roomatch-dev-secret";
  if (!process.env.JWT_SECRET) {
    console.warn("Using fallback JWT secret. Set JWT_SECRET in backend/.env for production.");
  }

  return jwt.sign({ id: userId, role }, secret, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
};

export default generateToken;
