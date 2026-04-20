import { Router } from "express";
import { protect } from "../../middleware/authMiddleware.js";
import { restrictTo } from "../../middleware/rbac.middleware.js";
import { validate } from "../../middleware/validate.middleware.js";
import { createRoomSchema, updateRoomSchema } from "./rooms.types.js";
import * as ctrl from "./rooms.controller.js";

const router = Router();

router.use(protect);

router.post(
  "/",
  restrictTo("ADMIN"),
  validate(createRoomSchema),
  ctrl.createRoom,
);
router.get("/", ctrl.listRooms);
router.patch(
  "/:id",
  restrictTo("ADMIN"),
  validate(updateRoomSchema),
  ctrl.updateRoom,
);
router.delete("/:id", restrictTo("ADMIN"), ctrl.deactivateRoom);

export { router as roomsRouter };
