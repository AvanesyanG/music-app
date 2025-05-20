import express from 'express'
import {addSong, listSong,removeSong} from "../controllers/songController.js";
import { uploadFieldsMiddleware } from "../middleware/multer.js";
import { protectRoute } from "../middleware/authMiddleware.js";

const songRouter = express.Router()

songRouter.post("/add", protectRoute, uploadFieldsMiddleware, addSong)
songRouter.get("/list", protectRoute, listSong)
songRouter.delete("/remove/:id", protectRoute, removeSong)

export default songRouter