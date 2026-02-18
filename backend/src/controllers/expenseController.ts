import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import ExcelJS from 'exceljs';
import path from 'path';
import fs from 'fs';

export const getExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment_id } = req.query;

    if (!environment_id) {
      res.status(400).json({ error: 'environment_id is required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, req.person!.personId],
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT e.*, 
              payer.name as payer_name,
              registered.name as registered_by_name,
              cat.id as category_id,
              cat.name as category_name,
              cat.icon as category_icon,
              cat.color as category_color
       FROM expenses e
       INNER JOIN people payer ON e.payer_id = payer.id
       INNER JOIN people registered ON e.registered_by_id = registered.id
       LEFT JOIN expense_categories cat ON e.category_id = cat.id
       WHERE e.environment_id = ?
       ORDER BY e.expense_date DESC, e.created_at DESC`,
      [environment_id],
    );

    res.json({
      expenses: rows.map((r) => ({
        ...r,
        category: r.category_id
          ? {
              id: r.category_id,
              name: r.category_name,
              icon: r.category_icon,
              color: r.category_color,
            }
          : undefined,
      })),
    });
  } catch (error) {
    console.error('Get expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const createExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, description, expense_date, payer_id, environment_id } = req.body;
    console.log('description:', description);
    if (!amount || !expense_date || !payer_id || !environment_id) {
      res.status(400).json({ error: 'All fields are required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, req.person!.personId],
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    // Check if payer is in the environment
    const [payerAccess] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, payer_id],
    );

    if (payerAccess.length === 0) {
      res.status(400).json({ error: 'Payer must be a member of this environment' });
      return;
    }

    const [result] = await db.query<ResultSetHeader>(
      `INSERT INTO expenses (amount, description, expense_date, payer_id, registered_by_id, environment_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [amount, description, expense_date, payer_id, req.person!.personId, environment_id],
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: { id: result.insertId },
    });
  } catch (error) {
    console.error('Create expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const updateExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, description, expense_date, payer_id } = req.body;

    // Check if expense exists and user has access
    const [expenseRows] = await db.query<RowDataPacket[]>(
      `SELECT e.environment_id 
       FROM expenses e
       INNER JOIN environment_person ep ON e.environment_id = ep.environment_id
       WHERE e.id = ? AND ep.person_id = ?`,
      [id, req.person!.personId],
    );

    if (expenseRows.length === 0) {
      res.status(404).json({ error: 'Expense not found or access denied' });
      return;
    }

    // If payer_id is being updated, check if they're in the environment
    if (payer_id) {
      const [payerAccess] = await db.query<RowDataPacket[]>(
        'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
        [expenseRows[0].environment_id, payer_id],
      );

      if (payerAccess.length === 0) {
        res.status(400).json({ error: 'Payer must be a member of this environment' });
        return;
      }
    }

    const updates: string[] = [];
    const values: any[] = [];

    if (amount !== undefined) {
      updates.push('amount = ?');
      values.push(amount);
    }
    if (description !== undefined) {
      updates.push('description = ?');
      values.push(description);
    }
    if (expense_date !== undefined) {
      updates.push('expense_date = ?');
      values.push(expense_date);
    }
    if (payer_id !== undefined) {
      updates.push('payer_id = ?');
      values.push(payer_id);
    }

    if (updates.length === 0) {
      res.status(400).json({ error: 'No fields to update' });
      return;
    }

    values.push(id);

    await db.query(`UPDATE expenses SET ${updates.join(', ')} WHERE id = ?`, values);

    res.json({ message: 'Expense updated successfully' });
  } catch (error) {
    console.error('Update expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const deleteExpense = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Check if expense exists and user has access
    const [expenseRows] = await db.query<RowDataPacket[]>(
      `SELECT 1 
       FROM expenses e
       INNER JOIN environment_person ep ON e.environment_id = ep.environment_id
       WHERE e.id = ? AND ep.person_id = ?`,
      [id, req.person!.personId],
    );

    if (expenseRows.length === 0) {
      res.status(404).json({ error: 'Expense not found or access denied' });
      return;
    }

    await db.query('DELETE FROM expenses WHERE id = ?', [id]);

    res.json({ message: 'Expense deleted successfully' });
  } catch (error) {
    console.error('Delete expense error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const computeExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment_id } = req.body;

    if (!environment_id) {
      res.status(400).json({ error: 'environment_id is required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, req.person!.personId],
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Get all non-computed expenses for this environment
      const [expenses] = await connection.query<RowDataPacket[]>(
        `SELECT e.*, 
                payer.name as payer_name,
                registered.name as registered_by_name
         FROM expenses e
         INNER JOIN people payer ON e.payer_id = payer.id
         INNER JOIN people registered ON e.registered_by_id = registered.id
         WHERE e.environment_id = ?
         ORDER BY e.expense_date ASC`,
        [environment_id],
      );

      if (expenses.length === 0) {
        await connection.rollback();
        res.status(400).json({ error: 'No expenses to compute' });
        return;
      }

      // Move expenses to computed_expenses table
      for (const expense of expenses) {
        await connection.query(
          `INSERT INTO computed_expenses 
           (expense_id, amount, description, expense_date, payer_id, registered_by_id, environment_id, computed_by_id)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
          [
            expense.id,
            expense.amount,
            expense.description,
            expense.expense_date,
            expense.payer_id,
            expense.registered_by_id,
            expense.environment_id,
            req.person!.personId,
          ],
        );
      }

      // Delete computed expenses from expenses table
      await connection.query('DELETE FROM expenses WHERE environment_id = ?', [environment_id]);

      await connection.commit();

      // Generate Excel file
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet('Expenses');

      // Define columns
      worksheet.columns = [
        { header: 'Date', key: 'expense_date', width: 15 },
        { header: 'Amount', key: 'amount', width: 12 },
        { header: 'Description', key: 'description', width: 40 },
        { header: 'Paid By', key: 'payer_name', width: 20 },
        { header: 'Registered By', key: 'registered_by_name', width: 20 },
      ];

      // Style header
      worksheet.getRow(1).font = { bold: true };
      worksheet.getRow(1).fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE0E0E0' },
      };

      // Add data
      expenses.forEach((expense) => {
        worksheet.addRow({
          expense_date: new Date(expense.expense_date).toLocaleDateString(),
          amount: parseFloat(expense.amount),
          description: expense.description,
          payer_name: expense.payer_name,
          registered_by_name: expense.registered_by_name,
        });
      });

      // Add total row
      const totalRow = worksheet.addRow({
        expense_date: '',
        amount: expenses.reduce((sum, exp) => sum + parseFloat(exp.amount), 0),
        description: 'TOTAL',
        payer_name: '',
        registered_by_name: '',
      });
      totalRow.font = { bold: true };
      totalRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFD700' },
      };

      // Format amount column as currency
      worksheet.getColumn('amount').numFmt = '€#,##0.00';

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
      const filename = `expenses_${environment_id}_${timestamp}.xlsx`;
      const exportsDir = path.join(__dirname, '../../exports');

      // Create exports directory if it doesn't exist
      if (!fs.existsSync(exportsDir)) {
        fs.mkdirSync(exportsDir, { recursive: true });
      }

      const filepath = path.join(exportsDir, filename);

      // Write file
      await workbook.xlsx.writeFile(filepath);

      // Send file as response
      res.download(filepath, filename, (err) => {
        if (err) {
          console.error('Error downloading file:', err);
        }
        // Delete file after download
        fs.unlinkSync(filepath);
      });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Compute expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getComputedExpenses = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { environment_id } = req.query;

    if (!environment_id) {
      res.status(400).json({ error: 'environment_id is required' });
      return;
    }

    // Check if user has access to this environment
    const [access] = await db.query<RowDataPacket[]>(
      'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
      [environment_id, req.person!.personId],
    );

    if (access.length === 0) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    const [rows] = await db.query<RowDataPacket[]>(
      `SELECT ce.*, 
              payer.name as payer_name,
              registered.name as registered_by_name,
              computed.name as computed_by_name
       FROM computed_expenses ce
       INNER JOIN people payer ON ce.payer_id = payer.id
       INNER JOIN people registered ON ce.registered_by_id = registered.id
       INNER JOIN people computed ON ce.computed_by_id = computed.id
       WHERE ce.environment_id = ?
       ORDER BY ce.computed_at DESC, ce.expense_date DESC`,
      [environment_id],
    );

    res.json({ computed_expenses: rows });
  } catch (error) {
    console.error('Get computed expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
