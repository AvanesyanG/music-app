import express from 'express';
import {addAlbum,listAlbum,removeAlbum,addSpotifyAlbum} from "../controllers/albumController.js"
import { uploadMiddleware } from "../middleware/multer.js"
import { protectRoute } from "../middleware/authMiddleware.js"

const albumRouter = express.Router();

// All routes are protected with Clerk authentication
albumRouter.post("/add", protectRoute, uploadMiddleware, addAlbum)
albumRouter.post("/add-spotify", protectRoute, addSpotifyAlbum)
albumRouter.get("/list", protectRoute, listAlbum)
albumRouter.delete("/remove/:id", protectRoute, removeAlbum)

export default albumRouter;