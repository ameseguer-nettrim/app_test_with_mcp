import { Response } from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  computeExpenses,
  getComputedExpenses,
} from '../../../controllers/expenseController';
import { AuthRequest } from '../../../middleware/auth';
import db from '../../../config/database';
import ExcelJS from 'exceljs';
import fs from 'fs';

jest.mock('../../../config/database');
jest.mock('exceljs');
jest.mock('fs');

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
const mockGetConnection = db.getConnection as jest.MockedFunction<typeof db.getConnection>;

describe('Expense Controller - Unit Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;
  let downloadMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    downloadMock = jest.fn((path, filename, callback) => {
      if (callback) callback(null);
    });
    
    mockReq = {
      person: { personId: 1, email: 'test@example.com' },
      query: {},
      body: {},
      params: {},
    };
    
    mockRes = {
      json: jsonMock,
      status: statusMock as any,
      download: downloadMock as any,
    };
    
    jest.clearAllMocks();
  });

  describe('getExpenses', () => {
    it('should return expenses for an environment', async () => {
      mockReq.query = { environment_id: '1' };

      const mockExpenses = [
        {
          id: 1,
          amount: 50.0,
          description: 'Groceries',
          expense_date: '2024-01-10',
          payer_name: 'John',
          registered_by_name: 'Jane',
        },
      ];

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([mockExpenses, []] as any);

      await getExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ expenses: mockExpenses });
    });

    it('should return 400 if environment_id is missing', async () => {
      mockReq.query = {};

      await getExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'environment_id is required' });
    });

    it('should return 403 if user has no access', async () => {
      mockReq.query = { environment_id: '1' };
      mockQuery.mockResolvedValueOnce([[], []] as any);

      await getExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied to this environment' });
    });
  });

  describe('createExpense', () => {
    it('should create an expense successfully', async () => {
      mockReq.body = {
        amount: 50.0,
        description: 'Groceries',
        expense_date: '2024-01-10',
        payer_id: 2,
        environment_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([{ insertId: 1 }, []] as any);

      await createExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Expense created successfully',
        expense: { id: 1 },
      });
    });

    it('should return 400 if required fields are missing', async () => {
      mockReq.body = { amount: 50.0 };

      await createExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'All fields are required' });
    });

    it('should return 400 if payer not in environment', async () => {
      mockReq.body = {
        amount: 50.0,
        description: 'Groceries',
        expense_date: '2024-01-10',
        payer_id: 999,
        environment_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[], []] as any);

      await createExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Payer must be a member of this environment' });
    });
  });

  describe('updateExpense', () => {
    it('should update an expense successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { amount: 75.0, description: 'Updated groceries' };

      mockQuery
        .mockResolvedValueOnce([[{ environment_id: 1 }], []] as any)
        .mockResolvedValueOnce([{}, []] as any);

      await updateExpense(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'Expense updated successfully' });
    });

    it('should return 404 if expense not found', async () => {
      mockReq.params = { id: '999' };
      mockReq.body = { amount: 75.0 };

      mockQuery.mockResolvedValueOnce([[], []] as any);

      await updateExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Expense not found or access denied' });
    });

    it('should return 400 if no fields to update', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {};

      mockQuery.mockResolvedValueOnce([[{ environment_id: 1 }], []] as any);

      await updateExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'No fields to update' });
    });
  });

  describe('deleteExpense', () => {
    it('should delete an expense successfully', async () => {
      mockReq.params = { id: '1' };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([{}, []] as any);

      await deleteExpense(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ message: 'Expense deleted successfully' });
    });

    it('should return 404 if expense not found', async () => {
      mockReq.params = { id: '999' };
      mockQuery.mockResolvedValueOnce([[], []] as any);

      await deleteExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Expense not found or access denied' });
    });
  });

  describe('computeExpenses', () => {
    it('should compute expenses and generate Excel', async () => {
      mockReq.body = { environment_id: 1 };

      const mockExpenses = [
        {
          id: 1,
          amount: 50.0,
          description: 'Groceries',
          expense_date: '2024-01-10',
          payer_id: 2,
          registered_by_id: 1,
          environment_id: 1,
          payer_name: 'John',
          registered_by_name: 'Jane',
        },
      ];

      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        query: jest.fn()
          .mockResolvedValueOnce([mockExpenses, []] as any)
          .mockResolvedValueOnce([{}, []] as any)
          .mockResolvedValueOnce([{}, []] as any),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
      };

      mockQuery.mockResolvedValueOnce([[{ id: 1 }], []] as any);
      mockGetConnection.mockResolvedValueOnce(mockConnection as any);

      const mockWorkbook = {
        addWorksheet: jest.fn().mockReturnValue({
          columns: [],
          getRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
          addRow: jest.fn().mockReturnValue({ font: {}, fill: {} }),
          getColumn: jest.fn().mockReturnValue({ numFmt: '' }),
        }),
        xlsx: {
          writeFile: jest.fn().mockResolvedValue(undefined),
        },
      };

      (ExcelJS.Workbook as jest.Mock).mockImplementation(() => mockWorkbook);
      (fs.existsSync as jest.Mock).mockReturnValue(true);
      (fs.unlinkSync as jest.Mock).mockReturnValue(undefined);

      await computeExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockWorkbook.addWorksheet).toHaveBeenCalledWith('Expenses');
      expect(downloadMock).toHaveBeenCalled();
    });

    it('should return 400 if environment_id is missing', async () => {
      mockReq.body = {};

      await computeExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'environment_id is required' });
    });

    it('should return 400 if no expenses to compute', async () => {
      mockReq.body = { environment_id: 1 };

      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        query: jest.fn().mockResolvedValueOnce([[], []] as any),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
      };

      mockQuery.mockResolvedValueOnce([[{ id: 1 }], []] as any);
      mockGetConnection.mockResolvedValueOnce(mockConnection as any);

      await computeExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'No expenses to compute' });
    });
  });

  describe('getComputedExpenses', () => {
    it('should return computed expenses for an environment', async () => {
      mockReq.query = { environment_id: '1' };

      const mockComputedExpenses = [
        {
          id: 1,
          amount: 50.0,
          description: 'Groceries',
          expense_date: '2024-01-10',
          payer_name: 'John',
          registered_by_name: 'Jane',
          computed_by_name: 'Admin',
          computed_at: '2024-01-15',
        },
      ];

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([mockComputedExpenses, []] as any);

      await getComputedExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ computed_expenses: mockComputedExpenses });
    });

    it('should return 400 if environment_id is missing', async () => {
      mockReq.query = {};

      await getComputedExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'environment_id is required' });
    });
  });
});