import express from 'express';
import {addAlbum,listAlbum,removeAlbum} from "../controllers/albumController.js"
import { uploadSingleMiddleware } from "../middleware/multer.js"
import { protectRoute } from "../middleware/authMiddleware.js"

const albumRouter = express.Router();

// All routes are protected with Clerk authentication
albumRouter.post("/add", protectRoute, uploadSingleMiddleware('image'), addAlbum)
albumRouter.get("/list", protectRoute, listAlbum)
albumRouter.delete("/remove/:id", protectRoute, removeAlbum)

export default albumRouter;