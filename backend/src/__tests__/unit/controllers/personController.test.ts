import { Response } from 'express';
import { getPeople, getPeopleInEnvironment } from '../../../controllers/personController';
import { AuthRequest } from '../../../middleware/auth';
import db from '../../../config/database';

jest.mock('../../../config/database');

const mockQuery = db.query as jest.MockedFunction<typeof db.query>;

describe('Person Controller - Unit Tests', () => {
  let mockReq: Partial<AuthRequest>;
  let mockRes: Partial<Response>;
  let jsonMock: jest.Mock;
  let statusMock: jest.Mock;

  beforeEach(() => {
    jsonMock = jest.fn();
    statusMock = jest.fn(() => ({ json: jsonMock }));
    
    mockReq = {
      person: { personId: 1, email: 'test@example.com' },
      query: {},
    };
    
    mockRes = {
      json: jsonMock,
      status: statusMock as any,
    };
    
    jest.clearAllMocks();
  });

  describe('getPeople', () => {
    it('should return all people', async () => {
      const mockPeople = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockQuery.mockResolvedValueOnce([mockPeople, []] as any);

      await getPeople(mockReq as AuthRequest, mockRes as Response);

      expect(mockQuery).toHaveBeenCalledWith(
        'SELECT id, name, email FROM people ORDER BY name'
      );
      expect(jsonMock).toHaveBeenCalledWith({ people: mockPeople });
    });

    it('should handle database errors', async () => {
      mockQuery.mockRejectedValueOnce(new Error('DB Error'));

      await getPeople(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });

  describe('getPeopleInEnvironment', () => {
    it('should return people in a specific environment', async () => {
      mockReq.query = { environment_id: '1' };

      const mockAccess = [{ id: 1 }];
      const mockPeople = [
        { id: 1, name: 'John Doe', email: 'john@example.com' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
      ];

      mockQuery
        .mockResolvedValueOnce([mockAccess, []] as any)
        .mockResolvedValueOnce([mockPeople, []] as any);

      await getPeopleInEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(jsonMock).toHaveBeenCalledWith({ people: mockPeople });
    });

    it('should return 400 if environment_id is missing', async () => {
      mockReq.query = {};

      await getPeopleInEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(400);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'environment_id is required' });
    });

    it('should return 403 if user has no access to environment', async () => {
      mockReq.query = { environment_id: '1' };
      mockQuery.mockResolvedValueOnce([[], []] as any);

      await getPeopleInEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(403);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Access denied to this environment' });
    });

    it('should handle database errors', async () => {
      mockReq.query = { environment_id: '1' };
      mockQuery.mockRejectedValueOnce(new Error('DB Error'));

      await getPeopleInEnvironment(mockReq as AuthRequest, mockRes as Response);

      expect(statusMock).toHaveBeenCalledWith(500);
      expect(jsonMock).toHaveBeenCalledWith({ error: 'Internal server error' });
    });
  });
});