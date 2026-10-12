import { AuditLog } from '../models/AuditLog.js';

export const recordAuditLog = async ({ actor, action, entity, entityId, severity = 'Info', details, ip, metadata }) => {
  try {
    const actorData = actor ? {
      id: actor._id || actor.id,
      name: actor.name || 'Admin',
      email: actor.email || '',
      role: actor.role || 'Admin'
    } : {
      name: 'System Admin',
      role: 'Admin'
    };

    return await AuditLog.create({
      actor: actorData,
      action,
      entity,
      entityId: entityId ? String(entityId) : null,
      severity,
      details: details || `${action} performed on ${entity}`,
      ip: ip || '127.0.0.1',
      metadata: metadata || {},
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Failed to write audit log:', error.message);
    return null;
  }
};
