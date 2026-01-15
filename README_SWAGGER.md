# Swagger API Documentation

This document explains the Swagger/OpenAPI documentation for the Family Expense Tracker API.

## Overview

The API is documented using **Swagger/OpenAPI 3.0** specification, providing:
- 📚 Interactive API documentation
- 🧪 Live testing interface
- 📋 Schema definitions
- ✅ Request/response examples
- 🔒 Authentication requirements

## Accessing the Documentation

### Swagger UI
Once the server is running, access the interactive documentation at:

```
http://localhost:3000/api-docs
```

### JSON Specification
Download the raw OpenAPI spec at:

```
http://localhost:3000/api-docs.json
```

## Features

### Interactive Testing
- 📤 **Try it out**: Test endpoints directly from the browser
- 🔑 **Authentication**: Add JWT token for protected endpoints
- 📝 **Request Builder**: Automatically generated request bodies
- 📊 **Response Preview**: See actual API responses

### Complete Documentation
- ✅ All endpoints documented
- ✅ Request/response schemas
- ✅ Authentication requirements
- ✅ Error responses
- ✅ Example values
- ✅ Parameter descriptions

## API Structure

### Tags (Categories)

1. **Authentication**
   - Register new user
   - Login
   - Get current user info

2. **Environments**
   - List user environments
   - Create environment
   - Get environment details
   - Add person to environment

3. **People**
   - List all people
   - List people in environment

4. **Expenses**
   - List expenses
   - Create expense
   - Update expense
   - Delete expense
   - Compute expenses (generate Excel)
   - List computed expenses

## Using the Swagger UI

### 1. Start the Server

```bash
cd backend
npm install
npm run dev
```

### 2. Open Swagger UI

Navigate to: `http://localhost:3000/api-docs`

### 3. Authenticate

For protected endpoints:

1. **Register or Login** first:
   - Expand `POST /api/auth/register` or `POST /api/auth/login`
   - Click "Try it out"
   - Fill in the request body
   - Click "Execute"
   - Copy the `token` from the response

2. **Authorize**:
   - Click the 🔒 **Authorize** button at the top
   - Enter: `Bearer YOUR_TOKEN_HERE`
   - Click "Authorize"
   - Click "Close"

3. **Test Protected Endpoints**:
   - All subsequent requests will include the token
   - Try any protected endpoint (marked with 🔒)

### 4. Test Endpoints

1. Expand any endpoint
2. Click "Try it out"
3. Fill in parameters/body
4. Click "Execute"
5. View response below

## Schemas

### Person
```json
{
  "id": 1,
  "name": "John Doe",
  "email": "john@example.com",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Environment
```json
{
  "id": 1,
  "name": "Main Home",
  "description": "Primary family home",
  "created_at": "2024-01-15T10:00:00Z"
}
```

### Expense
```json
{
  "id": 1,
  "amount": 50.75,
  "description": "Groceries for the week",
  "expense_date": "2024-01-15",
  "payer_id": 1,
  "payer_name": "John Doe",
  "registered_by_id": 2,
  "registered_by_name": "Jane Doe",
  "environment_id": 1,
  "created_at": "2024-01-15T10:00:00Z"
}
```

### ComputedExpense
```json
{
  "id": 1,
  "expense_id": 5,
  "amount": 50.75,
  "description": "Groceries for the week",
  "expense_date": "2024-01-15",
  "payer_name": "John Doe",
  "registered_by_name": "Jane Doe",
  "computed_by_name": "Admin User",
  "computed_at": "2024-01-20T15:30:00Z",
  "environment_id": 1
}
```

## Example Workflow

### Complete Flow: Register → Create Environment → Add Expense → Compute

#### 1. Register
```http
POST /api/auth/register
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

Response:
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "person": { "id": 1, "name": "John Doe", "email": "john@example.com" }
}
```

#### 2. Authorize with Token
Click 🔒 Authorize and enter: `Bearer YOUR_TOKEN`

#### 3. Create Environment
```http
POST /api/environments
{
  "name": "Main Home",
  "description": "Primary family home"
}
```

#### 4. Add Expense
```http
POST /api/expenses
{
  "amount": 50.75,
  "description": "Groceries",
  "expense_date": "2024-01-15",
  "payer_id": 1,
  "environment_id": 1
}
```

#### 5. Compute Expenses
```http
POST /api/expenses/compute
{
  "environment_id": 1
}
```

Response: Excel file download

#### 6. View Computed Expenses
```http
GET /api/expenses/computed?environment_id=1
```

## Configuration

### Swagger Configuration File

`backend/src/config/swagger.ts`

Key settings:
- **OpenAPI Version**: 3.0.0
- **API Title**: Family Expense Tracker API
- **Servers**: Development and Production
- **Security**: Bearer JWT Authentication
- **Tags**: Organized by feature
- **Schemas**: Reusable data models

### Customization

To modify Swagger settings:

1. Edit `backend/src/config/swagger.ts`
2. Update server URLs for production
3. Add/modify schemas as needed
4. Restart server to see changes

## Adding Documentation to New Endpoints

When creating new routes:

### 1. Add JSDoc Comments

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     tags: [YourTag]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: param_name
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Success response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/YourSchema'
 *       401:
 *         description: Unauthorized
 */
router.get('/your-endpoint', yourController);
```

### 2. Define Schema (if needed)

In `swagger.ts`:

```typescript
schemas: {
  YourSchema: {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      name: { type: 'string', example: 'Example' },
    },
  },
}
```

### 3. Restart Server

Swagger will automatically pick up changes.

## Best Practices

1. **Complete Descriptions**: Write clear, concise descriptions
2. **Examples**: Always provide example values
3. **Error Responses**: Document all possible error codes
4. **Required Fields**: Mark required parameters/properties
5. **Authentication**: Clearly indicate protected endpoints
6. **Schemas**: Reuse schemas via `$ref` for consistency
7. **Tags**: Group related endpoints together

## Common Response Codes

- **200**: Success
- **201**: Created
- **400**: Bad Request (validation error)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (no access to resource)
- **404**: Not Found
- **500**: Internal Server Error

## Troubleshooting

### Swagger UI not loading

1. Check server is running on correct port
2. Verify `/api-docs` route is accessible
3. Check console for errors
4. Clear browser cache

### Changes not reflecting

1. Restart the server
2. Hard refresh browser (Ctrl+Shift+R)
3. Check for syntax errors in JSDoc comments

### Authentication not working

1. Register/login first to get token
2. Click 🔒 Authorize button
3. Enter `Bearer YOUR_TOKEN` (with "Bearer " prefix)
4. Token expires after 7 days - get a new one

### Endpoints missing

1. Verify JSDoc comments are correct
2. Check `apis` path in `swagger.ts` points to routes
3. Restart server

## Tools & Integrations

### Postman
Import the OpenAPI spec:
1. Open Postman
2. Import → Link
3. Enter: `http://localhost:3000/api-docs.json`

### Insomnia
Import the spec:
1. Open Insomnia
2. Import/Export → Import Data
3. From URL: `http://localhost:3000/api-docs.json`

### Code Generation
Generate client SDKs:
```bash
# Using openapi-generator
openapi-generator generate -i http://localhost:3000/api-docs.json -g typescript-axios -o ./client
```

## Benefits

✅ **Developer Experience**: Easy to understand and test API
✅ **Documentation**: Always up-to-date with code
✅ **Testing**: Interactive testing without Postman
✅ **Client Generation**: Auto-generate API clients
✅ **Onboarding**: New developers understand API quickly
✅ **Standards**: Following OpenAPI specification

## Resources

- [Swagger Official Docs](https://swagger.io/docs/)
- [OpenAPI Specification](https://spec.openapis.org/oas/v3.0.0)
- [swagger-jsdoc](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express](https://github.com/scottie1984/swagger-ui-express)

## Future Enhancements

- 📝 Add request/response examples to all endpoints
- 🌐 Multi-language documentation
- 📄 PDF export of documentation
- 🧩 Mock server for frontend development
- ⚙️ OpenAPI spec validation in CI/CD
