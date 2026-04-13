import { identityDb } from '../config/db.js'
import { Prisma } from '../generated/identity/client.js'

interface AuditParams {
  userId:    string
  action:    string
  entity:    string
  entityId?: string
  ipAddress?: string
  userAgent?: string
  payload?:  Prisma.InputJsonValue
}

export const audit = async (params: AuditParams): Promise<void> => {
  try {
    await identityDb.auditLog.create({
      data: {
        userId:    params.userId,
        action:    params.action,
        entity:    params.entity,
        entityId:  params.entityId  ?? null,
        ipAddress: params.ipAddress ?? null,
        userAgent: params.userAgent ?? null,
        ...(params.payload !== undefined && { payload: params.payload }),
      }
    })
  } catch {
    // audit failure must never crash the main request
    console.error('[AuditLog] Failed to write audit entry:', params)
  }
}