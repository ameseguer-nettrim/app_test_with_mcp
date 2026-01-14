import swaggerJsdoc from 'swagger-jsdoc';
import { SwaggerDefinition } from 'swagger-jsdoc';

const swaggerDefinition: SwaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'Family Expense Tracker API',
    version: '1.0.0',
    description: 'API documentation for the Family Expense Tracker application. This API allows you to manage family expenses, environments, and users.',
    contact: {
      name: 'API Support',
    },
    license: {
      name: 'MIT',
    },
  },
  servers: [
    {
      url: 'http://localhost:3000',
      description: 'Development server',
    },
    {
      url: 'https://your-production-url.com',
      description: 'Production server',
    },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'Enter your JWT token in the format: Bearer <token>',
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
            example: 'Our main family home',
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
            example: 50.00,
          },
          description: {
            type: 'string',
            description: 'Expense description',
            example: 'Groceries for the week',
          },
          expense_date: {
            type: 'string',
            format: 'date',
            description: 'Date of the expense',
            example: '2024-01-10',
          },
          payer_id: {
            type: 'integer',
            description: 'ID of the person who paid',
            example: 1,
          },
          payer_name: {
            type: 'string',
            description: 'Name of the person who paid',
            example: 'John Doe',
          },
          registered_by_id: {
            type: 'integer',
            description: 'ID of the person who registered the expense',
            example: 2,
          },
          registered_by_name: {
            type: 'string',
            description: 'Name of the person who registered',
            example: 'Jane Smith',
          },
          environment_id: {
            type: 'integer',
            description: 'ID of the environment',
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
            example: 1,
          },
          amount: {
            type: 'number',
            format: 'decimal',
            description: 'Expense amount',
            example: 50.00,
          },
          description: {
            type: 'string',
            description: 'Expense description',
            example: 'Groceries for the week',
          },
          expense_date: {
            type: 'string',
            format: 'date',
            description: 'Date of the expense',
            example: '2024-01-10',
          },
          payer_name: {
            type: 'string',
            description: 'Name of the person who paid',
            example: 'John Doe',
          },
          registered_by_name: {
            type: 'string',
            description: 'Name of the person who registered',
            example: 'Jane Smith',
          },
          computed_by_name: {
            type: 'string',
            description: 'Name of the person who computed',
            example: 'Admin User',
          },
          computed_at: {
            type: 'string',
            format: 'date-time',
            description: 'Computation timestamp',
          },
          environment_id: {
            type: 'integer',
            description: 'ID of the environment',
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
            example: 'Invalid credentials',
          },
        },
      },
    },
  },
  tags: [
    {
      name: 'Authentication',
      description: 'User authentication endpoints',
    },
    {
      name: 'Environments',
      description: 'Family environment management',
    },
    {
      name: 'People',
      description: 'People management',
    },
    {
      name: 'Expenses',
      description: 'Expense tracking and management',
    },
  ],
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/*.ts', './src/server.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);