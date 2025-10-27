import express from "express";
import { json, urlencoded } from "body-parser";
import dotenv from "dotenv";
import "./db/firebase_admin.js";

import gamesRouter from "./routes/games";

dotenv.config();
const PORT = process.env.PORT || 5000;
const WEB_API_KEY = process.env.WEB_API_KEY;
const APP_ID = process.env.VITE_FIREBASE_APP_ID;

if (!WEB_API_KEY) {
  console.error(
    "FATAL ERROR: WEB_API_KEY is not defined in .env. API is insecure."
  );
  process.exit(1);
}
if (!APP_ID) {
  console.error(
    "FATAL ERROR: APP_ID is not defined in .env. Cannot determine Firestore path."
  );
  process.exit(1);
}

const apiKeyAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Authorization header missing or invalid format." });
  }

  const token = authHeader.split(" ")[1];

  if (token === WEB_API_KEY) {
    next();
  } else {
    res.status(403).json({ message: "Invalid API Key." });
  }
};

const app = express();

app.use(json());
app.use(urlencoded({ extended: true }));

app.get("/health", (req, res) => {
  res.status(200).json({
    status: "API running",
    message: "Ready to receive announcements.",
  });
});

app.use("/api/v1/games", apiKeyAuth, gamesRouter);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`API Key set to: ${WEB_API_KEY.substring(0, 8)}...`);
});
