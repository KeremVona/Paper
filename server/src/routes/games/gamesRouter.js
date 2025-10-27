import { newGame } from "../../controllers/games/gamesController.js";
import { Router } from "express";

const router = Router();

router.post("/new", newGame);

export default router;
