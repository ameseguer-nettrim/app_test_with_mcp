import { Request, Response } from 'express';
import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import db from '../config/database';
import { Person, JwtPayload } from '../types';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import type { StringValue } from 'ms';

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ error: 'Name, email, and password are required' });
      return;
    }

    // Check if user already exists
    const [existing] = await db.query<RowDataPacket[]>(
      'SELECT id FROM people WHERE email = ?',
      [email]
    );

    if (existing.length > 0) {
      res.status(400).json({ error: 'Email already registered' });
      return;
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert user
    const [result] = await db.query<ResultSetHeader>(
      'INSERT INTO people (name, email, password) VALUES (?, ?, ?)',
      [name, email, hashedPassword]
    );

    const personId = result.insertId;

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
    };

    if (!jwtSecret) {
      res.status(500).json({ error: 'Secreto JWT no configurado' });
      return;
    }

    const token = jwt.sign(
      { personId, email },
      jwtSecret,
      signOptions
    );

    res.status(201).json({
      message: 'User registered successfully',
      token,
      person: { id: personId, name, email },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, password FROM people WHERE email = ?',
      [email]
    );

    if (rows.length === 0) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    const person = rows[0] as Person;

    // Check password
    const isValidPassword = await bcrypt.compare(password, person.password);

    if (!isValidPassword) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }

    // Generate token
    const jwtSecret = process.env.JWT_SECRET;
    
    const signOptions: SignOptions = {
      expiresIn: (process.env.JWT_EXPIRES_IN || '7d') as StringValue,
    };

    if (!jwtSecret) {
      res.status(500).json({ error: 'Secreto JWT no configurado' });
      return;
    }
    const token = jwt.sign(
      { personId: person.id, email: person.email } as JwtPayload,
      jwtSecret,
      signOptions
    );

    res.json({
      message: 'Login successful',
      token,
      person: { id: person.id, name: person.name, email: person.email },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getMe = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const [rows] = await db.query<RowDataPacket[]>(
      'SELECT id, name, email, created_at FROM people WHERE id = ?',
      [req.person!.personId]
    );

    if (rows.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    res.json({ person: rows[0] });
  } catch (error) {
    console.error('Get me error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};