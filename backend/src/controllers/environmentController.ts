import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

export const getEnvironments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT e.id, e.name, e.description, e.created_at 
       FROM environments e
       INNER JOIN environment_person ep ON e.id = ep.environment_id
       WHERE ep.person_id = ?
       ORDER BY e.name`,
      [req.person!.personId]
    );

    res.json({ environments: rows });
  } catch (error) {
    console.error('Get environments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, description } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Name is required' });
      return;
    }

    const connection = await db.getConnection();
    
    try {
      await connection.beginTransaction();

      // Create environment
      const [result] = await connection.query<ResultSetHeader>(
        'INSERT INTO environments (name, description) VALUES (?, ?)',
        [name, description || null]
      );

      const environmentId = result.insertId;

      // Add creator to environment
      await connection.query(
        'INSERT INTO environment_person (environment_id, person_id) VALUES (?, ?)',
        [environmentId, req.person!.personId]
      );

      await connection.commit();

      res.status(201).json({
        message: 'Environment created successfully',
        environment: { id: environmentId, name, description },
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Create environment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getEnvironmentDetails = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [id, req.person!.personId]
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    // Get environment details
    const [envRows] = await db.query<RowDataPacket[]>(
      'SELECT id, name, description, created_at FROM environments WHERE id = ?',
      [id]
    );

    if (envRows.length === 0) {
      res.status(404).json({ error: 'Environment not found' });
      return;
    }

    // Get people in this environment
    const [peopleRows] = await db.query<RowDataPacket[]>(
      `SELECT p.id, p.name, p.email 
       FROM people p
       INNER JOIN environment_person ep ON p.id = ep.person_id
       WHERE ep.environment_id = ?
       ORDER BY p.name`,
      [id]
    );

    res.json({
      environment: envRows[0],
      people: peopleRows,
    });
  } catch (error) {
    console.error('Get environment details error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const addPersonToEnvironment = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { person_id } = req.body;

    if (!person_id) {
      res.status(400).json({ error: 'person_id is required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [id, req.person!.personId]
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    // Check if person exists
    const [personExists] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM people WHERE id = ?',
      [person_id]
    );

    if (personExists.length === 0) {
      res.status(404).json({ error: 'Person not found' });
      return;
    }

    // Check if already added
    const [alreadyAdded] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [id, person_id]
    );

    if (alreadyAdded.length > 0) {
      res.status(400).json({ error: 'Person already in this environment' });
      return;
    }

    // Add person to environment
    await db.query(
      'INSERT INTO environment_person (environment_id, person_id) VALUES (?, ?)',
      [id, person_id]
    );

    res.status(201).json({ message: 'Person added to environment successfully' });
  } catch (error) {
    console.error('Add person to environment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};