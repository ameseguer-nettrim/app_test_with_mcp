import swaggerJsdoc from 'swagger-jsdoc';
import { Options } from 'swagger-jsdoc';

const options: Options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Family Expense Tracker API',
      version: '1.0.0',
      description: 'REST API for managing family expenses with multi-environment support',
      contact: {
        name: 'API Support',
        email: 'support@example.com',
      },
      license: {
        name: 'MIT',
        url: 'https://opensource.org/licenses/MIT',
      },
    },
    servers: [
      {
        url: 'http://localhost:3000',
        description: 'Development server',
      },
      {
        url: 'https://api.production.com',
        description: 'Production server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token obtained from login/register',
        },
      },
      schemas: {
        Person: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Person ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Person name',
              example: 'John Doe',
            },
            email: {
              type: 'string',
              format: 'email',
              description: 'Person email',
              example: 'john@example.com',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        Environment: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Environment ID',
              example: 1,
            },
            name: {
              type: 'string',
              description: 'Environment name',
              example: 'Main Home',
            },
            description: {
              type: 'string',
              nullable: true,
              description: 'Environment description',
              example: 'Primary family home',
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        Expense: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Expense ID',
              example: 1,
            },
            amount: {
              type: 'number',
              format: 'decimal',
              description: 'Expense amount',
              example: 50.75,
            },
            description: {
              type: 'string',
              description: 'Expense description',
              example: 'Groceries for the week',
            },
            expense_date: {
              type: 'string',
              format: 'date',
              description: 'Date of expense',
              example: '2024-01-15',
            },
            payer_id: {
              type: 'integer',
              description: 'ID of person who paid',
              example: 1,
            },
            payer_name: {
              type: 'string',
              description: 'Name of person who paid',
              example: 'John Doe',
            },
            registered_by_id: {
              type: 'integer',
              description: 'ID of person who registered the expense',
              example: 2,
            },
            registered_by_name: {
              type: 'string',
              description: 'Name of person who registered',
              example: 'Jane Doe',
            },
            environment_id: {
              type: 'integer',
              description: 'Environment ID',
              example: 1,
            },
            created_at: {
              type: 'string',
              format: 'date-time',
              description: 'Creation timestamp',
            },
          },
        },
        ComputedExpense: {
          type: 'object',
          properties: {
            id: {
              type: 'integer',
              description: 'Computed expense ID',
              example: 1,
            },
            expense_id: {
              type: 'integer',
              description: 'Original expense ID',
              example: 5,
            },
            amount: {
              type: 'number',
              format: 'decimal',
              description: 'Expense amount',
              example: 50.75,
            },
            description: {
              type: 'string',
              description: 'Expense description',
              example: 'Groceries for the week',
            },
            expense_date: {
              type: 'string',
              format: 'date',
              description: 'Date of expense',
              example: '2024-01-15',
            },
            payer_name: {
              type: 'string',
              description: 'Name of person who paid',
              example: 'John Doe',
            },
            registered_by_name: {
              type: 'string',
              description: 'Name of person who registered',
              example: 'Jane Doe',
            },
            computed_by_name: {
              type: 'string',
              description: 'Name of person who computed',
              example: 'Admin User',
            },
            computed_at: {
              type: 'string',
              format: 'date-time',
              description: 'Computation timestamp',
            },
            environment_id: {
              type: 'integer',
              description: 'Environment ID',
              example: 1,
            },
          },
        },
        Error: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error message',
              example: 'Resource not found',
            },
          },
        },
      },
    },
    tags: [
      {
        name: 'Authentication',
        description: 'User authentication and registration',
      },
      {
        name: 'Environments',
        description: 'Family environment management',
      },
      {
        name: 'People',
        description: 'Person/user management',
      },
      {
        name: 'Expenses',
        description: 'Expense tracking and computation',
      },
    ],
  },
  apis: ['./src/routes/*.ts'], // Path to the API routes
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;