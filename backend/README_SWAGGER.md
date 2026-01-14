# API Documentation with Swagger

This document explains how to use and access the Swagger API documentation for the Family Expense Tracker backend.

## 📚 What is Swagger?

Swagger (OpenAPI) is a specification for documenting REST APIs. It provides:
- **Interactive documentation**: Test endpoints directly from the browser
- **Schema validation**: See request/response formats
- **Authentication testing**: Try authenticated endpoints with your token
- **Auto-generated docs**: Documentation stays in sync with code

## 🚀 Accessing Swagger UI

### Development

1. Start the backend server:
```bash
cd backend
npm run dev
```

2. Open your browser and navigate to:
```
http://localhost:3000/api-docs
```

You should see the Swagger UI interface with all your API endpoints documented.

### Production

Once deployed, Swagger will be available at:
```
https://your-api-domain.com/api-docs
```

## 🔐 Testing Authenticated Endpoints

Many endpoints require authentication. Here's how to test them:

### Step 1: Get a JWT Token

1. In Swagger UI, expand the **Authentication** section
2. Try the `POST /api/auth/register` or `POST /api/auth/login` endpoint
3. Click "Try it out"
4. Fill in the request body:
   ```json
   {
     "email": "test@example.com",
     "password": "password123",
     "name": "Test User"  // Only for register
   }
   ```
5. Click "Execute"
6. Copy the `token` from the response

### Step 2: Authorize Swagger

1. Click the **"Authorize"** button at the top of the page (green lock icon)
2. In the dialog, paste your token in this format:
   ```
   Bearer YOUR_TOKEN_HERE
   ```
3. Click "Authorize"
4. Click "Close"

Now all protected endpoints will include your token automatically!

### Step 3: Test Protected Endpoints

You can now test any endpoint with the 🔒 icon:
- GET /api/environments
- POST /api/expenses
- etc.

## 📋 API Sections

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login and get JWT token
- `GET /api/auth/me` - Get current user info (requires auth)

### Environments
- `GET /api/environments` - List user's environments
- `POST /api/environments` - Create new environment
- `GET /api/environments/{id}` - Get environment details
- `POST /api/environments/{id}/people` - Add person to environment

### People
- `GET /api/people` - List all people
- `GET /api/people/environment` - List people in environment

### Expenses
- `GET /api/expenses` - List expenses
- `POST /api/expenses` - Create expense
- `PUT /api/expenses/{id}` - Update expense
- `DELETE /api/expenses/{id}` - Delete expense
- `POST /api/expenses/compute` - Compute and export to Excel
- `GET /api/expenses/computed` - Get computed expenses history

## 🎯 Using Swagger for Testing

### Example: Complete Workflow

1. **Register a user**
   - Endpoint: `POST /api/auth/register`
   - Get token from response

2. **Authorize Swagger**
   - Use the token to authorize

3. **Create an environment**
   - Endpoint: `POST /api/environments`
   - Body: `{"name": "Test Home", "description": "Testing"}`
   - Note the `environment.id` from response

4. **Create an expense**
   - Endpoint: `POST /api/expenses`
   - Body:
     ```json
     {
       "amount": 50.00,
       "description": "Test expense",
       "expense_date": "2024-01-10",
       "payer_id": 1,
       "environment_id": 1
     }
     ```

5. **List expenses**
   - Endpoint: `GET /api/expenses?environment_id=1`
   - See your created expense

6. **Compute expenses**
   - Endpoint: `POST /api/expenses/compute`
   - Body: `{"environment_id": 1}`
   - Download the generated Excel file

## 🛠️ Customizing Swagger

### Update Server URLs

Edit `backend/src/config/swagger.ts` to add your production URL:

```typescript
servers: [
  {
    url: 'http://localhost:3000',
    description: 'Development server',
  },
  {
    url: 'https://your-production-api.com',
    description: 'Production server',
  },
],
```

### Add More Documentation

Swagger documentation is defined using JSDoc comments in route files. Example:

```typescript
/**
 * @swagger
 * /api/your-endpoint:
 *   get:
 *     summary: Brief description
 *     description: Detailed description
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
 *         description: Success
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 */
router.get('/your-endpoint', yourController);
```

## 🔍 Swagger Specification

The Swagger spec is generated from:
- `backend/src/config/swagger.ts` - Base configuration and schemas
- `backend/src/routes/*.ts` - Route documentation via JSDoc comments
- `backend/src/server.ts` - Root endpoint documentation

## 📝 Best Practices

1. **Keep docs in sync**: Update Swagger comments when you change endpoints
2. **Use schemas**: Define reusable schemas in `swagger.ts`
3. **Add examples**: Include example requests/responses
4. **Document errors**: Show all possible error responses
5. **Use tags**: Group related endpoints together
6. **Test regularly**: Use Swagger UI to test your endpoints

## 🚨 Troubleshooting

### Swagger UI not loading

1. Check the server is running on the correct port
2. Make sure dependencies are installed: `npm install`
3. Check console for errors

### Changes not appearing

1. Restart the server (`npm run dev`)
2. Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)
3. Clear browser cache

### Authentication not working

1. Make sure you copied the full token
2. Include "Bearer " before the token
3. Check token hasn't expired (default: 7 days)
4. Try logging in again to get a fresh token

### Schema validation errors

1. Check the request body format matches the schema
2. Ensure required fields are provided
3. Verify data types (string, number, etc.)

## 🔗 Useful Resources

- [Swagger/OpenAPI Specification](https://swagger.io/specification/)
- [swagger-jsdoc Documentation](https://github.com/Surnet/swagger-jsdoc)
- [swagger-ui-express Documentation](https://github.com/scottie1984/swagger-ui-express)

## 💡 Tips

- Use the "Models" section at the bottom to see all schemas
- Click "Authorize" once instead of adding token to each request
- Use the "Try it out" feature to test endpoints interactively
- Download response as JSON for testing
- Copy curl commands for command-line testing
- Swagger UI remembers your auth token between refreshes

## 🎉 Benefits

- **No Postman needed**: Test directly in browser
- **Self-documenting**: Docs stay updated with code
- **Onboarding**: New developers understand API quickly
- **Client generation**: Generate API clients automatically
- **Validation**: Catch errors before implementation

Enjoy your interactive API documentation! 🚀