import { Response } from 'express';
import db from '../config/database';
import { AuthRequest } from '../middleware/auth';
import { RowDataPacket, ResultSetHeader } from 'mysql2';
import { PoolConnection } from 'mysql2/promise';
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
       WHERE e.environment_id = ? AND e.is_computed = false
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
    const { amount, description, expense_date, payer_id, environment_id, category_id } = req.body;

    if (!amount || !category_id || !expense_date || !payer_id || !environment_id) {
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
      `INSERT INTO expenses (amount, description, expense_date, payer_id, registered_by_id, environment_id, category_id) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        amount,
        description,
        expense_date,
        payer_id,
        req.person!.personId,
        environment_id,
        category_id,
      ],
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
    const { amount, description, expense_date, payer_id, category_id } = req.body;

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
    if (expense_date !== undefined) {
      updates.push('expense_date = ?');
      values.push(expense_date);
    }
    if (payer_id !== undefined) {
      updates.push('payer_id = ?');
      values.push(payer_id);
    }
    if (category_id !== undefined) {
      updates.push('category_id = ?');
      values.push(category_id);
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
    const { environment_id, excelTexts } = req.body;

    if (!environment_id) {
      res.status(400).json({ error: 'environment_id is required' });
      return;
    }

    if (!excelTexts) {
      res.status(400).json({ error: 'excelTexts is required' });
      return;
    }

    // Check if user has access to this environment
    const hasAccess = await validateUserAccessToEnvironment(environment_id, req.person!.personId);
    if (!hasAccess) {
      res.status(403).json({ error: 'Access denied to this environment' });
      return;
    }

    const connection = await db.getConnection();

    try {
      await connection.beginTransaction();

      // Fetch non-computed expenses
      const expenses = await fetchNonComputedExpenses(connection, environment_id);

      if (expenses.length === 0) {
        await connection.rollback();
        res.status(400).json({ error: 'No expenses to compute' });
        return;
      }

      // Mark expenses as computed with flag and metadata
      await connection.query(
        `UPDATE expenses
      SET is_computed = true,
      computed_at = NOW(),
      computed_by_id = ?
      WHERE environment_id = ? AND is_computed = false`,
        [req.person!.personId, environment_id],
      );

      await connection.commit();

      // Generate workbook
      const workbook = new ExcelJS.Workbook();

      // Calculate totals by category
      const { categoryTotals, grandTotal } = calculateCategoryTotals(expenses);

      // Create sheets
      createSummarySheet(workbook, categoryTotals, grandTotal, excelTexts);
      createDetailsSheet(workbook, expenses, excelTexts);

      // Generate and send Excel
      await generateAndSendExcel(res, workbook, environment_id);
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
      `SELECT e.*, 
              payer.name as payer_name,
              registered.name as registered_by_name,
              computed.name as computed_by_name,
              cat.id as category_id,
              cat.name as category_name,
              cat.icon as category_icon,
              cat.color as category_color
       FROM expenses e
       INNER JOIN people payer ON e.payer_id = payer.id
       INNER JOIN people registered ON e.registered_by_id = registered.id
       INNER JOIN people computed ON e.computed_by_id = computed.id
       LEFT JOIN expense_categories cat ON e.category_id = cat.id
       WHERE e.environment_id = ? AND e.is_computed = true
       ORDER BY e.computed_at DESC, e.expense_date DESC`,
      [environment_id],
    );

    res.json({
      computed_expenses: rows.map((r) => ({
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
    console.error('Get computed expenses error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// ===== HELPER FUNCTIONS AND TYPES FOR COMPUTE EXPENSES =====

interface ExpenseRow extends RowDataPacket {
  id: number;
  amount: string;
  expense_date: string;
  payer_name: string;
  registered_by_name: string;
  category_name: string | null;
  description: string;
}

interface CategoryTotal {
  total: number;
  categoryName: string | null;
}

interface ExcelMessages {
  summary: string;
  details: string;
  category: string;
  amount: string;
  percentage: string;
  date: string;
  description: string;
  paidBy: string;
  total: string;
}

const validateUserAccessToEnvironment = async (
  environment_id: string | number,
  person_id: number,
): Promise<boolean> => {
  const [access] = await db.query<RowDataPacket[]>(
    'SELECT 1 FROM environment_person WHERE environment_id = ? AND person_id = ?',
    [environment_id, person_id],
  );
  return access.length > 0;
};

const fetchNonComputedExpenses = async (
  connection: PoolConnection,
  environment_id: string | number,
): Promise<ExpenseRow[]> => {
  const [expenses] = await connection.query<ExpenseRow[]>(
    `SELECT e.*, 
            payer.name as payer_name,
            registered.name as registered_by_name,
            cat.id as category_id,
            cat.name as category_name
     FROM expenses e
     INNER JOIN people payer ON e.payer_id = payer.id
     INNER JOIN people registered ON e.registered_by_id = registered.id
     LEFT JOIN expense_categories cat ON e.category_id = cat.id
     WHERE e.environment_id = ? AND e.is_computed = false
     ORDER BY cat.name ASC, e.expense_date ASC`,
    [environment_id],
  );
  return expenses;
};

const calculateCategoryTotals = (
  expenses: ExpenseRow[],
): { categoryTotals: Map<string, CategoryTotal>; grandTotal: number } => {
  const categoryTotals = new Map<string, CategoryTotal>();
  let grandTotal = 0;

  expenses.forEach((expense) => {
    const categoryKey = expense.category_name || 'Uncategorized';
    const amount = parseFloat(expense.amount);
    grandTotal += amount;

    if (!categoryTotals.has(categoryKey)) {
      categoryTotals.set(categoryKey, { total: 0, categoryName: expense.category_name });
    }
    const current = categoryTotals.get(categoryKey)!;
    current.total += amount;
  });

  return { categoryTotals, grandTotal };
};

const createSummarySheet = (
  workbook: ExcelJS.Workbook,
  categoryTotals: Map<string, CategoryTotal>,
  grandTotal: number,
  messages: ExcelMessages,
): void => {
  const summarySheet = workbook.addWorksheet(messages.summary);

  summarySheet.columns = [
    { header: messages.category, key: 'category', width: 25 },
    { header: messages.amount, key: 'amount', width: 15 },
    { header: messages.percentage, key: 'percentage', width: 15 },
  ];

  // Style header
  const headerRow = summarySheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  // Add summary rows
  Array.from(categoryTotals.entries())
    .sort((a, b) => a[0].localeCompare(b[0]))
    .forEach(([category, data]) => {
      const percentage = grandTotal > 0 ? ((data.total / grandTotal) * 100).toFixed(2) : '0.00';
      summarySheet.addRow({
        category: category,
        amount: data.total,
        percentage: `${percentage}%`,
      });
    });

  // Add total row
  const totalRow = summarySheet.addRow({
    category: messages.total,
    amount: grandTotal,
    percentage: '100%',
  });
  totalRow.font = { bold: true, size: 11 };
  totalRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFD700' },
  };

  // Format amount columns
  summarySheet.getColumn('amount').numFmt = '€#,##0.00';
};

const createDetailsSheet = (
  workbook: ExcelJS.Workbook,
  expenses: ExpenseRow[],
  messages: ExcelMessages,
): void => {
  const detailsSheet = workbook.addWorksheet(messages.details);

  detailsSheet.columns = [
    { header: messages.category, key: 'category', width: 20 },
    { header: messages.date, key: 'date', width: 12 },
    { header: messages.description, key: 'description', width: 35 },
    { header: messages.amount, key: 'amount', width: 12 },
    { header: messages.paidBy, key: 'payer', width: 18 },
  ];

  // Style header
  const headerRow = detailsSheet.getRow(1);
  headerRow.font = { bold: true, size: 12, color: { argb: 'FFFFFFFF' } };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF4472C4' },
  };

  // Add data rows grouped and sorted by category and date
  expenses.forEach((expense) => {
    detailsSheet.addRow({
      category: expense.category_name || 'Uncategorized',
      date: new Date(expense.expense_date).toLocaleDateString(),
      description: expense.description,
      amount: parseFloat(expense.amount),
      payer: expense.payer_name,
    });
  });

  // Format amount column
  detailsSheet.getColumn('amount').numFmt = '€#,##0.00';
};

const generateAndSendExcel = async (
  res: Response,
  workbook: ExcelJS.Workbook,
  environment_id: string | number,
): Promise<void> => {
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
};
