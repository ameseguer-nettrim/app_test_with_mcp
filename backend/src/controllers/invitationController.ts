import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import crypto from 'crypto';

export const createInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment_id } = req.params;
    const userId = req.person!.personId;

    const [env] = await db.query<RowDataPacket[]>('SELECT id FROM environments WHERE id = ?', [
      environment_id,
    ]);

    if (env.length === 0) {
      res.status(404).json({ error: 'Environment not found' });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 48);

    await db.query<ResultSetHeader>(
      `INSERT INTO environment_invitations 
       (environment_id, token, expires_at, created_by) 
       VALUES (?, ?, ?, ?)`,
      [environment_id, token, expiresAt, userId],
    );

    res.json({
      token,
      expires_at: expiresAt,
      message: 'Invitation link generated successfully',
    });
  } catch (error) {
    console.error('Create invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getInvitationDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT i.token, i.expires_at, e.name as environment_name, i.used_at
       FROM environment_invitations i
       JOIN environments e ON i.environment_id = e.id
       WHERE i.token = ?`,
      [token],
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'Invalid invitation link' });
      return;
    }

    const invitation = rows[0];

    if (invitation.used_at || new Date(invitation.expires_at) < new Date()) {
      res.status(410).json({ error: 'Invitation has expired or already been used' });
      return;
    }

    res.json(invitation);
  } catch (error) {
    console.error('Get invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const acceptInvitation = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { token } = req.params;
    const personId = req.person!.personId;

    const [invitations] = await db.query<RowDataPacket[]>(
      'SELECT environment_id, used_at, expires_at FROM environment_invitations WHERE token = ?',
      [token],
    );

    if (
      invitations.length === 0 ||
      invitations[0].used_at ||
      new Date(invitations[0].expires_at) < new Date()
    ) {
      res.status(400).json({ error: 'Invitation invalid or expired' });
      return;
    }

    const { environment_id } = invitations[0];

    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, personId],
    );

    if (existing.length === 0) {
      await db.query('INSERT INTO environment_person (environment_id, person_id) VALUES (?, ?)', [
        environment_id,
        personId,
      ]);
    }

    await db.query('UPDATE environment_invitations SET used_at = NOW() WHERE token = ?', [token]);

    res.json({ message: 'Successfully joined the environment', environment_id });
  } catch (error) {
    console.error('Accept invitation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
