import type { Request, Response } from "express";
import { asyncHandler } from "../../utils/catchAsync.js";
import * as sessionsService from "./sessions.service.js";
import { audit } from "../../utils/auditLogger.js";

export const createSession = asyncHandler(
  async (req: Request, res: Response) => {
    const session = await sessionsService.createSession(req.body, req.user!.id);

    audit({
      userId: req.user!.id,
      action: "SESSION_CREATED",
      entity: "SESSION",
      entityId: session.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      // FIX: Used null coalescing `?? null` to prevent dropping the academicYear key silently if omitted (Issue 2)
      payload: {
        formationId: session.formationId,
        academicYear: session.academicYear ?? null,
      },
    }).catch(() => {});

    res
      .status(201)
      .json({ success: true, message: "Session created", data: session });
  },
);

export const getSessions = asyncHandler(
  async (_req: Request, res: Response) => {
    const sessions = await sessionsService.getSessions();
    res.status(200).json({ success: true, data: sessions });
  },
);

export const getSessionById = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;

    const session = await sessionsService.getSessionById(id);
    res.status(200).json({ success: true, data: session });
  },
);

export const updateSession = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const result = await sessionsService.updateSession(id, req.body);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SESSION_UPDATED",
      entity: "SESSION",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { fieldsChanged: Object.keys(req.body) },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Session updated", data: result });
  },
);

export const getSessionStaff = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }

    // Read 'func' from the query string (e.g., /api/v1/sessions/:id/staff?func=CORRECTOR)
    const func = req.query.func as string | undefined;

    // Pass both the session ID and the optional function filter to the service
    const result = await sessionsService.getSessionStaff(id, func);

    res
      .status(200)
      .json({ success: true, message: "Staff retrieved", data: result });
  },
);

export const getSubjects = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const result = await sessionsService.getSubjects(id);
  res
    .status(200)
    .json({ success: true, message: "Subjects retrieved", data: result });
});

export const addSubject = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    res.status(400);
    throw new Error("Session ID is required");
  }
  const result = await sessionsService.addSubject(id, req.body);

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "SUBJECT_ADDED",
    entity: "SUBJECT",
    entityId: result.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { name: result.name, coefficient: result.coefficient },
  }).catch(() => {});

  res
    .status(201)
    .json({ success: true, message: "Subject added", data: result });
});

export const updateSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const subjectId = req.params.subjectId as string;
    if (!subjectId) {
      res.status(400);
      throw new Error("subject ID is required");
    }
    const result = await sessionsService.updateSubject(id, subjectId, req.body);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SUBJECT_UPDATED",
      entity: "SUBJECT",
      entityId: subjectId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { subjectId },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Subject updated", data: result });
  },
);

export const deleteSubject = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }
    const subjectId = req.params.subjectId as string;
    if (!subjectId) {
      res.status(400);
      throw new Error("subject ID is required");
    }
    await sessionsService.deleteSubject(id, subjectId);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SUBJECT_DELETED",
      entity: "SUBJECT",
      entityId: subjectId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { subjectId },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Subject deleted", data: null });
  },
);

export const getGradingConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await sessionsService.getGradingConfig(id);
    res.status(200).json({
      success: true,
      message: "Grading config retrieved",
      data: result,
    });
  },
);

export const setGradingConfig = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const result = await sessionsService.setGradingConfig(
      id,
      req.body,
      req.user!.id,
    );

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "GRADING_CONFIG_SET",
      entity: "GRADING_CONFIG",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { discrepancyThreshold: req.body.discrepancyThreshold },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Grading config saved", data: result });
  },
);

export const openSession = asyncHandler(async (req: Request, res: Response) => {
  const result = await sessionsService.openSession(req.params.id as string);
  res
    .status(200)
    .json({ success: true, message: "Session opened", data: result });
});

// ─── MISSING SESSION CONTROLLERS ──────────────────────────────────────────────

export const deleteSession = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }

    const result = await sessionsService.deleteSession(id);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SESSION_DELETED",
      entity: "SESSION",
      entityId: id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { sessionId: id },
    }).catch(() => {});

    res
      .status(200)
      .json({ success: true, message: "Session deleted", data: result });
  },
);

// ─── MISSING SPECIALIZATION CONTROLLERS ───────────────────────────────────────

export const getSessionSpecializations = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }

    const result = await sessionsService.getSessionSpecializations(id);

    res.status(200).json({
      success: true,
      message: "Specializations retrieved",
      data: result,
    });
  },
);

export const addSessionSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    if (!id) {
      res.status(400);
      throw new Error("Session ID is required");
    }

    const result = await sessionsService.addSessionSpecialization(id, req.body);

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SESSION_SPECIALIZATION_ADDED",
      entity: "SESSION_SPECIALIZATION",
      entityId: result.id,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: {
        formationSpecializationId: req.body.formationSpecializationId,
      },
    }).catch(() => {});

    res.status(201).json({
      success: true,
      message: "Specialization added to session",
      data: result,
    });
  },
);

export const updateSessionSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const specId = req.params.specId as string;
    if (!id || !specId) {
      res.status(400);
      throw new Error("Session ID and Specialization ID are required");
    }

    const result = await sessionsService.updateSessionSpecialization(
      id,
      specId,
      req.body,
    );

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SESSION_SPECIALIZATION_UPDATED",
      entity: "SESSION_SPECIALIZATION",
      entityId: specId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { fieldsChanged: Object.keys(req.body) },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Session specialization updated",
      data: result,
    });
  },
);

export const removeSessionSpecialization = asyncHandler(
  async (req: Request, res: Response) => {
    const id = req.params.id as string;
    const specId = req.params.specId as string;

    if (!id || !specId) {
      res.status(400);
      throw new Error("Session ID and Specialization ID are required");
    }

    const result = await sessionsService.removeSessionSpecialization(
      id,
      specId,
    );

    // ✅ AUDIT
    audit({
      userId: req.user!.id,
      action: "SESSION_SPECIALIZATION_REMOVED",
      entity: "SESSION_SPECIALIZATION",
      entityId: specId,
      ipAddress: req.ip,
      userAgent: req.headers["user-agent"] as string,
      payload: { specializationId: specId },
    }).catch(() => {});

    res.status(200).json({
      success: true,
      message: "Session specialization removed",
      data: result,
    });
  },
);

// ─── MISSING STAFF CONTROLLERS ────────────────────────────────────────────────

export const assignStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  if (!id) {
    res.status(400);
    throw new Error("Session ID is required");
  }

  const result = await sessionsService.assignStaff(id, req.body, req.user!.id);

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "STAFF_ASSIGNED",
    entity: "SESSION_STAFF",
    entityId: result.id,
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: { assignedUserId: req.body.userId, function: req.body.function },
  }).catch(() => {});

  res.status(201).json({
    success: true,
    message: "Staff assigned successfully",
    data: result,
  });
});

export const removeStaff = asyncHandler(async (req: Request, res: Response) => {
  const id = req.params.id as string;
  const userId = req.params.userId as string;
  const func = req.params.function as string;
  // For CORRECTOR removals, caller must supply ?subjectId=<uuid> to identify
  // which subject assignment to remove (a corrector can be on multiple subjects)
  const subjectId = req.query.subjectId as string | undefined;

  if (!id || !userId || !func) {
    res.status(400);
    throw new Error("Session ID, User ID, and Function are required");
  }

  await sessionsService.removeStaff(id, userId, func, subjectId);

  // ✅ AUDIT
  audit({
    userId: req.user!.id,
    action: "STAFF_REMOVED",
    entity: "SESSION_STAFF",
    entityId: userId, // Logging the affected user's ID
    ipAddress: req.ip,
    userAgent: req.headers["user-agent"] as string,
    payload: {
      removedUserId: userId,
      function: func,
      subjectId: subjectId ?? null,
    },
  }).catch(() => {});

  res
    .status(200)
    .json({ success: true, message: "Staff removed successfully", data: null });
});
