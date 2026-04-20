import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as roomsService from "./rooms.service.js";

// ─── GLOBAL ROOMS ─────────────────────────────────────────────────────────────
export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomsService.createRoom(req.body, req.user!.id);
  res
    .status(201)
    .json({ success: true, message: "Room created", data: result });
});

export const listRooms = asyncHandler(async (_req: Request, res: Response) => {
  const result = await roomsService.listRooms();
  res
    .status(200)
    .json({ success: true, message: "Rooms retrieved", data: result });
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomsService.updateRoom(
    req.params.id as string,
    req.body,
  );
  res
    .status(200)
    .json({ success: true, message: "Room updated", data: result });
});

export const deactivateRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roomsService.deactivateRoom(req.params.id as string);
    res
      .status(200)
      .json({ success: true, message: "Room deactivated", data: result });
  },
);

// ─── SESSION ROOMS ────────────────────────────────────────────────────────────
export const addRoomToSession = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roomsService.addRoomToSession(
      req.params.id as string,
      req.body,
    );
    res
      .status(201)
      .json({ success: true, message: "Room added to session", data: result });
  },
);

export const getSessionRooms = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roomsService.getSessionRooms(req.params.id as string);
    res
      .status(200)
      .json({
        success: true,
        message: "Session rooms retrieved",
        data: result,
      });
  },
);

export const updateSessionRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roomsService.updateSessionRoom(
      req.params.id as string,
      req.params.sessionRoomId as string,
      req.body,
    );
    res
      .status(200)
      .json({ success: true, message: "Session room updated", data: result });
  },
);

export const removeRoomFromSession = asyncHandler(
  async (req: Request, res: Response) => {
    await roomsService.removeRoomFromSession(
      req.params.id as string,
      req.params.sessionRoomId as string,
    );
    res
      .status(200)
      .json({
        success: true,
        message: "Room removed from session",
        data: null,
      });
  },
);

export const autoAssign = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomsService.autoAssign(req.params.id as string);
  res
    .status(200)
    .json({ success: true, message: "Candidates auto-assigned", data: result });
});

export const assignSurveillant = asyncHandler(
  async (req: Request, res: Response) => {
    const result = await roomsService.assignSurveillant(
      req.params.id as string,
      req.params.sessionRoomId as string,
      req.body,
    );
    res
      .status(201)
      .json({ success: true, message: "Surveillant assigned", data: result });
  },
);

export const removeSurveillant = asyncHandler(
  async (req: Request, res: Response) => {
    await roomsService.removeSurveillant(
      req.params.id as string,
      req.params.sessionRoomId as string,
      req.params.userId as string,
    );
    res
      .status(200)
      .json({ success: true, message: "Surveillant removed", data: null });
  },
);

export const lockRoom = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomsService.lockRoom(
    req.params.id as string,
    req.params.sessionRoomId as string,
    req.user!.id,
  );
  res.status(200).json({ success: true, message: "Room locked", data: result });
});
