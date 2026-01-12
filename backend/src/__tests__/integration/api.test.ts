import { Request, Response } from 'express';
import db from '../../config/database';
import { getEnvironments, createEnvironment } from '../../controllers/environmentController';
import { getExpenses, createExpense } from '../../controllers/expenseController';
import { AuthRequest } from '../../middleware/auth';

jest.mock('../../config/database');

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
const mockGetConnection = db.getConnection as jest.MockedFunction<typeof db.getConnection>;

describe('API Integration Tests', () => {
  describe('Environment and Expense Flow', () => {
    let mockReq: Partial<AuthRequest>;
    let mockRes: Partial<Response>;
    let jsonMock: jest.Mock;
    let statusMock: jest.Mock;

    beforeEach(() => {
      jsonMock = jest.fn();
      statusMock = jest.fn(() => ({ json: jsonMock }));
      
      mockReq = {
        person: { personId: 1, email: 'test@example.com' },
        body: {},
        query: {},
        params: {},
      };
      
      mockRes = {
        json: jsonMock,
        status: statusMock as any,
      };
      
      jest.clearAllMocks();
    });

    it('should create environment, then create expense for that environment', async () => {
      // Step 1: Create environment
      mockReq.body = { name: 'Test Home', description: 'Integration test' };

      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        query: jest.fn()
          .mockResolvedValueOnce([{ insertId: 1 }, []] as any)
          .mockResolvedValueOnce([{}, []] as any),
        commit: jest.fn().mockResolvedValue(undefined),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
      };

      mockGetConnection.mockResolvedValueOnce(mockConnection as any);

      await createEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Environment created successfully',
        environment: { id: 1, name: 'Test Home', description: 'Integration test' },
      });

      // Step 2: Get environments (should include the new one)
      jsonMock.mockClear();
      const mockEnvironments = [
        { id: 1, name: 'Test Home', description: 'Integration test', created_at: new Date() },
      ];

      mockQuery.mockResolvedValueOnce([mockEnvironments, []] as any);

      await getEnvironments(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ environments: mockEnvironments });

      // Step 3: Create expense for this environment
      jsonMock.mockClear();
      statusMock.mockClear();
      
      mockReq.body = {
        amount: 100.0,
        description: 'Test expense',
        expense_date: '2024-01-10',
        payer_id: 1,
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

      // Step 4: Get expenses for this environment
      jsonMock.mockClear();
      mockReq.query = { environment_id: '1' };

      const mockExpenses = [
        {
          id: 1,
          amount: 100.0,
          description: 'Test expense',
          expense_date: '2024-01-10',
          payer_name: 'Test User',
          registered_by_name: 'Test User',
        },
      ];

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([mockExpenses, []] as any);

      await getExpenses(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ expenses: mockExpenses });
    });

    it('should handle complete expense lifecycle', async () => {
      // 1. Create expense
      mockReq.body = {
        amount: 50.0,
        description: 'Groceries',
        expense_date: '2024-01-10',
        payer_id: 1,
        environment_id: 1,
      };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([{ insertId: 1 }, []] as any);

      await createExpense(mockReq as AuthRequest, mockRes as Response);
      expect(statusMock).toHaveBeenCalledWith(201);

      // 2. Verify expense exists
      jsonMock.mockClear();
      mockReq.query = { environment_id: '1' };

      const mockExpenses = [
        {
          id: 1,
          amount: 50.0,
          description: 'Groceries',
          expense_date: '2024-01-10',
          payer_id: 1,
          registered_by_id: 1,
          environment_id: 1,
        },
      ];

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([mockExpenses, []] as any);

      await getExpenses(mockReq as AuthRequest, mockRes as Response);
      expect(jsonMock).toHaveBeenCalledWith({ expenses: mockExpenses });
    });

    it('should enforce access control across operations', async () => {
      // Attempt to create expense in environment without access
      mockReq.body = {
        amount: 50.0,
        description: 'Unauthorized',
        expense_date: '2024-01-10',
        payer_id: 1,
        environment_id: 999,
      };

      mockQuery.mockResolvedValueOnce([[], []] as any);

      await createExpense(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied to this environment' });
    });
  });
});