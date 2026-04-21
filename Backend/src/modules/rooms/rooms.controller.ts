import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import { audit } from "../../utils/auditLogger.js";
import * as roomsService from "./rooms.service.js";

// ─── GLOBAL ROOMS ─────────────────────────────────────────────────────────────

export const createRoom = asyncHandler(async (req: Request, res: Response) => {
  const result = await roomsService.createRoom(req.body, req.user!.id);

  audit({
    userId: req.user!.id,
    action: "ROOM_CREATED",
    entity: "ROOM",
    entityId: result.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: {
      name: result.name,
      capacity: result.capacity,
      building: result.building,
    },
  }).catch(() => {});

  res
    .status(201)
    .json({ success: true, message: "Room created", data: result });
});

export const listRooms = asyncHandler(async (req: Request, res: Response) => {
  const showInactive = req.query.showInactive === "true";
  const result = await roomsService.listRooms(showInactive);
  res
    .status(200)
    .json({ success: true, message: "Rooms retrieved", data: result });
});

export const updateRoom = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await roomsService.updateRoom(id, req.body);

  audit({
    userId: req.user!.id,
    action: "ROOM_UPDATED",
    entity: "ROOM",
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: req.body,
  }).catch(() => {});

  res
    .status(200)
    .json({ success: true, message: "Room updated", data: result });
});

export const deactivateRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roomsService.deactivateRoom(id);

    audit({
      userId: req.user!.id,
      action: "ROOM_DEACTIVATED",
      entity: "ROOM",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { roomId: id },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Room deactivated", data: result });
  },
);

// ─── SESSION ROOMS ────────────────────────────────────────────────────────────

export const addRoomToSession = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roomsService.addRoomToSession(id, req.body);

    audit({
      userId: req.user!.id,
      action: "SESSION_ROOM_ADDED",
      entity: "SESSION_ROOM",
      entityId: result.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { sessionId: id, roomId: req.body.roomId },
    }).catch(() => {});

    res
      .status(201)
      .json({ success: true, message: "Room added to session", data: result });
  },
);

export const getSessionRooms = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await roomsService.getSessionRooms(id);
    res.status(200).json({
      success: true,
      message: "Session rooms retrieved",
      data: result,
    });
  },
);

export const updateSessionRoom = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const sessionRoomId = req.params.sessionRoomId as string;
    const result = await roomsService.updateSessionRoom(
      id,
      sessionRoomId,
      req.body,
    );

    audit({
      userId: req.user!.id,
      action: "SESSION_ROOM_UPDATED",
      entity: "SESSION_ROOM",
      entityId: sessionRoomId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { sessionId: req.params.id, ...req.body },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Session room updated", data: result });
  },
);

export const removeRoomFromSession = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const sessionRoomId = req.params.sessionRoomId as string;

    await roomsService.removeRoomFromSession(id, sessionRoomId);

    audit({
      userId: req.user!.id,
      action: "SESSION_ROOM_REMOVED",
      entity: "SESSION_ROOM",
      entityId: sessionRoomId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { sessionId: req.params.id },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Room removed from session",
      data: null,
    });
  },
);

export const autoAssign = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await roomsService.autoAssign(id);

  audit({
    userId: req.user!.id,
    action: "CANDIDATES_AUTO_ASSIGNED",
    entity: "SESSION_ROOM",
    entityId: id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: {
      sessionId: id,
      assigned: result.assigned,
      rooms: result.rooms,
    },
  }).catch(() => {});

  res
    .status(200)
    .json({ success: true, message: "Candidates auto-assigned", data: result });
});

export const assignSurveillant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const sessionRoomId = req.params.sessionRoomId as string;

    const result = await roomsService.assignSurveillant(
      id,
      sessionRoomId,
      req.body,
    );

    audit({
      userId: req.user!.id,
      action: "SURVEILLANT_ASSIGNED",
      entity: "ROOM_SURVEILLANT_ASSIGNMENT",
      entityId: sessionRoomId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: {
        sessionId: req.params.id,
        sessionRoomId: req.params.sessionRoomId,
        userId: req.body.userId,
      },
    }).catch(() => {});

    res
      .status(201)
      .json({ success: true, message: "Surveillant assigned", data: result });
  },
);

export const removeSurveillant = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const sessionRoomId = req.params.sessionRoomId as string;
    const userId = req.params.userId as string;

    await roomsService.removeSurveillant(id, sessionRoomId, userId);

    audit({
      userId: req.user!.id,
      action: "SURVEILLANT_REMOVED",
      entity: "ROOM_SURVEILLANT_ASSIGNMENT",
      entityId: sessionRoomId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: {
        sessionId: req.params.id,
        sessionRoomId: req.params.sessionRoomId,
        userId: req.params.userId,
      },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Surveillant removed", data: null });
  },
);

export const lockRoom = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const sessionRoomId = req.params.sessionRoomId as string;
  const result = await roomsService.lockRoom(id, sessionRoomId, req.user!.id);

  audit({
    userId: req.user!.id,
    action: "ROOM_LOCKED",
    entity: "SESSION_ROOM",
    entityId: sessionRoomId,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: {
      sessionId: req.params.id,
      sessionRoomId: req.params.sessionRoomId,
      lockedAt: new Date().toISOString(),
    },
  }).catch(() => {});

  res.status(200).json({ success: true, message: "Room locked", data: result });
});
