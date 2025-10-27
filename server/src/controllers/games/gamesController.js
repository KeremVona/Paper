import { db } from "../firebase_admin";

const APP_ID = process.env.VITE_FIREBASE_APP_ID;

export const newGame = async (req, res) => {
  const gameData = req.body;

  const requiredFields = [
    "title",
    "date",
    "modPack",
    "discordServer",
    "discordInvite",
    "status",
  ];
  const missingFields = requiredFields.filter((field) => !gameData[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Missing required fields: ${missingFields.join(", ")}`,
    });
  }

  const newGame = {
    title: gameData.title,
    date: gameData.date,
    modPack: gameData.modPack,
    discordServer: gameData.discordServer,
    discordInvite: gameData.discordInvite,
    status: gameData.status || "Scheduled",
    madeAt: new Date().toISOString(),
  };

  try {
    const collectionPath = `artifacts/${APP_ID}/public/data/games`;
    const gameRef = db.collection(collectionPath);

    const docRef = await gameRef.add(newGame);

    const gameLink = `http://localhost:5173/game/${docRef.id}`;
    return res.status(200).json({
      success: true,
      message: "Game announcement successfully posted.",
      gameId: docRef.id,
      gameLink: gameLink,
    });
  } catch (error) {
    console.error("Firestore write failed:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error: Could not save data to Firestore.",
    });
  }
};
