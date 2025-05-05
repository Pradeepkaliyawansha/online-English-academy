require("dotenv").config();

export const PORT = 5555;

export const mongoDBURL = process.env.MONGO_URI;

export const JWT_SECRET = process.env.JWT_SECRET;
export const JWT_EXPIRE = "24h";
