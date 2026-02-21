import { Response } from 'express';
import db from '../config/database';
import { RowDataPacket } from 'mysql2';
import { AuthRequest } from '../middleware/auth';

// Helper: comprobar que el usuario pertenece al entorno
async function userInEnvironment(userId: number, environmentId: number): Promise<boolean> {
  const [rows]: any = await db.query(
    'SELECT 1 FROM environment_person WHERE person_id = ? AND environment_id = ? LIMIT 1',
    [userId, environmentId],
  );
  return Array.isArray(rows) ? rows.length > 0 : Object.keys(rows).length > 0;
}

export const listByEnvironment = async (req: AuthRequest, res: Response) => {
  const environmentId = Number(req.params.id);
  const userId = req.person!.personId;

  if (!(await userInEnvironment(userId, environmentId)))
    return res.status(403).json({ message: 'Access denied' });

  const [rows]: any = await db.query(
    'SELECT id, name, color, icon, created_at FROM expense_categories WHERE environment_id = ? ORDER BY name',
    [environmentId],
  );
  res.json(rows);
};

export const createCategoryByEnvironment = async (req: AuthRequest, res: Response) => {
  const environmentId = Number(req.params.id);
  // const userId = (req as any).user.id;
  const userId = req.person!.personId;
  const { name, color, icon } = req.body;

  // Check if user has access to this environment
  const [access] = await db.query<RowDataPacket[]>(
    'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
    [environmentId, userId],
  );

  if (access.length === 0) {
    res.status(403).json({ error: 'Access denied to this environment' });
    return;
  }

  if (!name || !name.trim()) return res.status(400).json({ message: 'Name required' });

  if (!(await userInEnvironment(userId, environmentId)))
    return res.status(403).json({ message: 'Access denied' });
  try {
    const [result]: any = await db.query(
      'INSERT INTO expense_categories (environment_id, name, color, icon) VALUES (?, ?, ?, ?)',
      [environmentId, name.trim(), color || null, icon || null],
    );
    const insertId = result.insertId;
    const [rows]: any = await db.query(
      'SELECT id, name, color, icon, created_at FROM expense_categories WHERE id = ?',
      [insertId],
    );
    res.status(201).json(rows[0]);
  } catch (err: any) {
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      return res.status(409).json({ message: 'Category name already exists in this environment' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const update = async (req: AuthRequest, res: Response) => {
  const categoryId = Number(req.params.id);
  const userId = req.person!.personId;
  const { name, color, icon } = req.body;

  const [catRows]: any = await db.query(
    'SELECT environment_id FROM expense_categories WHERE id = ?',
    [categoryId],
  );
  const cat = Array.isArray(catRows) && catRows.length ? catRows[0] : null;
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  const environmentId = cat.environment_id;
  if (!(await userInEnvironment(userId, environmentId)))
    return res.status(403).json({ message: 'Access denied' });

  try {
    await db.query('UPDATE expense_categories SET name = ?, color = ?, icon = ? WHERE id = ?', [
      name.trim(),
      color || null,
      icon || null,
      categoryId,
    ]);
    const [rows]: any = await db.query(
      'SELECT id, name, color, icon, created_at FROM expense_categories WHERE id = ?',
      [categoryId],
    );
    res.json(rows[0]);
  } catch (err: any) {
    if (err && (err.code === 'ER_DUP_ENTRY' || err.errno === 1062)) {
      return res.status(409).json({ message: 'Category name already exists in this environment' });
    }
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

export const remove = async (req: AuthRequest, res: Response) => {
  const categoryId = Number(req.params.id);
  const userId = req.person!.personId;

  const [catRows]: any = await db.query(
    'SELECT environment_id FROM expense_categories WHERE id = ?',
    [categoryId],
  );
  const cat = Array.isArray(catRows) && catRows.length ? catRows[0] : null;
  if (!cat) return res.status(404).json({ message: 'Category not found' });

  const environmentId = cat.environment_id;
  if (!(await userInEnvironment(userId, environmentId)))
    return res.status(403).json({ message: 'Access denied' });

  await db.query('DELETE FROM expense_categories WHERE id = ?', [categoryId]);
  res.status(204).send();
};
