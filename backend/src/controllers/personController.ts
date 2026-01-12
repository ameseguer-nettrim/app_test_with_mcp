import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket } from 'mysql2';

export const getPeople = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email FROM people ORDER BY name'
    );

    res.json({ people: rows });
  } catch (error) {
    console.error('Get people error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getPeopleInEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment_id } = req.query;

    if (!environment_id) {
      res.status(400).json({ error: 'environment_id is required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, req.person!.personId]
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.email 
       FROM people p
       INNER JOIN environment_person ep ON p.id = ep.person_id
       WHERE ep.environment_id = ?
       ORDER BY p.name`,
      [environment_id]
    );

    res.json({ people: rows });
  } catch (error) {
    console.error('Get people in environment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};