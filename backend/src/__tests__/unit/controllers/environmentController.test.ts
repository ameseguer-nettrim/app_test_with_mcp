import { Request, Response } from 'express';
import {
  getEnvironments,
  createEnvironment,
  getEnvironmentDetails,
  addPersonToEnvironment,
} from '../../../controllers/environmentController';
import { AuthRequest } from '../../../middleware/auth';
import db from '../../../config/database';

jest.mock('../../../config/database');

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;
const mockGetConnection = db.getConnection as jest.MockedFunction<typeof db.getConnection>;

describe('Environment Controller - Unit Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    
    mockReq = {
      person: { personId: 1, email: 'test@example.com' },
      params: {},
      body: {},
    };
    
    mockRes = {
      json: jsonMock,
      status: statusMock as any,
    };
    
    jest.clearAllMocks();
  });

  describe('getEnvironments', () => {
    it('should return environments for authenticated user', async () => {
      const mockEnvironments = [
        { id: 1, name: 'Home', description: 'Main home', created_at: new Date() },
        { id: 2, name: 'Summer House', description: 'Vacation home', created_at: new Date() },
      ];

      mockQuery.mockResolvedValueOnce([mockEnvironments, []] as any);

      await getEnvironments(mockReq as AuthRequest, mockRes as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        expect.stringContaining('SELECT e.id, e.name, e.description'),
        [1]
      );
      expect(jsonMock).toHaveBeenCalledWith({ environments: mockEnvironments });
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB Error'));

      await getEnvironments(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('createEnvironment', () => {
    it('should create a new environment successfully', async () => {
      mockReq.body = { name: 'New Home', description: 'Test home' };

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

      expect(mockConnection.beginTransaction).toHaveBeenCalled();
      expect(mockConnection.commit).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({
        message: 'Environment created successfully',
        environment: { id: 1, name: 'New Home', description: 'Test home' },
      });
    });

    it('should return 400 if name is missing', async () => {
      mockReq.body = { description: 'Test home' };

      await createEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Name is required' });
    });

    it('should rollback transaction on error', async () => {
      mockReq.body = { name: 'New Home' };

      const mockConnection = {
        beginTransaction: jest.fn().mockResolvedValue(undefined),
        query: jest.fn().mockRejectedValueOnce(new Error('DB Error')),
        rollback: jest.fn().mockResolvedValue(undefined),
        release: jest.fn(),
      };

      mockGetConnection.mockResolvedValueOnce(mockConnection as any);

      await createEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(mockConnection.rollback).toHaveBeenCalled();
      expect(mockConnection.release).toHaveBeenCalled();
      expect(statusMock).toHaveBeenCalledWith(500);
    });
  });

  describe('getEnvironmentDetails', () => {
    it('should return environment details with people', async () => {
      mockReq.params = { id: '1' };

      const mockAccess = [{ id: 1 }];
      const mockEnvironment = [{ id: 1, name: 'Home', description: 'Main home', created_at: new Date() }];
      const mockPeople = [
        { id: 1, name: 'John', email: 'john@example.com' },
        { id: 2, name: 'Jane', email: 'jane@example.com' },
      ];

      mockQuery
        .mockResolvedValueOnce([mockAccess, []] as any)
        .mockResolvedValueOnce([mockEnvironment, []] as any)
        .mockResolvedValueOnce([mockPeople, []] as any);

      await getEnvironmentDetails(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({
        environment: mockEnvironment[0],
        people: mockPeople,
      });
    });

    it('should return 403 if user has no access', async () => {
      mockReq.params = { id: '1' };
      mockQuery.mockResolvedValueOnce([[], []] as any);

      await getEnvironmentDetails(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied to this environment' });
    });

    it('should return 404 if environment not found', async () => {
      mockReq.params = { id: '1' };
      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[], []] as any);

      await getEnvironmentDetails(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Environment not found' });
    });
  });

  describe('addPersonToEnvironment', () => {
    it('should add person to environment successfully', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { person_id: 2 };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[], []] as any)
        .mockResolvedValueOnce([{}, []] as any);

      await addPersonToEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(201);
      expect(jsonMock).toHaveBeenCalledWith({ message: 'Person added to environment successfully' });
    });

    it('should return 400 if person_id is missing', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = {};

      await addPersonToEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'person_id is required' });
    });

    it('should return 404 if person not found', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { person_id: 999 };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[], []] as any);

      await addPersonToEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(404);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Person not found' });
    });

    it('should return 400 if person already in environment', async () => {
      mockReq.params = { id: '1' };
      mockReq.body = { person_id: 2 };

      mockQuery
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[{ id: 1 }], []] as any)
        .mockResolvedValueOnce([[{ id: 1 }], []] as any);

      await addPersonToEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Person already in this environment' });
    });
  });
});