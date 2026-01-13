# Family Expense Tracker

A full-stack application for tracking and managing family expenses.

## Tech Stack

### Frontend

- Vue 3 (Composition API)
- TypeScript
- Tailwind CSS
- Axios for API calls

### Backend

- Node.js with Express
- TypeScript
- JWT Authentication
- MySQL Database
- ExcelJS for Excel generation

## Project Structure

```
.
├── backend/          # Express TypeScript API
│   ├── src/
│   │   ├── config/   # Database and app configuration
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── server.ts
│   └── package.json
├── frontend/         # Vue 3 application
│   ├── src/
│   │   ├── assets/
│   │   ├── components/
│   │   ├── composables/
│   │   ├── router/
│   │   ├── services/
│   │   ├── stores/
│   │   ├── types/
│   │   ├── views/
│   │   ├── App.vue
│   │   └── main.ts
│   └── package.json
└── database/         # SQL scripts
    └── schema.sql
```

## Setup Instructions

### Prerequisites

- Node.js (v18 or higher)
- MySQL (v8 or higher)
- npm or yarn

### Database Setup

1. Create a MySQL database:

```sql
CREATE DATABASE family_expenses;
```

2. Run the schema script:

```bash
mysql -u your_username -p family_expenses < database/schema.sql
```

### Backend Setup

1. Navigate to backend directory:

```bash
cd backend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
PORT=3000
DB_HOST=localhost
DB_PORT=3306
DB_USER=your_username
DB_PASSWORD=your_password
DB_NAME=family_expenses
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
```

4. Start the development server:

```bash
npm run dev
```

The API will be available at `http://localhost:3000`

### Frontend Setup

1. Navigate to frontend directory:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
```

3. Create a `.env` file:

```env
VITE_API_URL=http://localhost:3000/api
```

4. Start the development server:

```bash
npm run dev
```

The application will be available at `http://localhost:5173`

## Features

### Authentication

- User registration and login
- JWT-based authentication
- Password hashing with bcrypt

### Environment Management

- Create and manage family environments
- Add multiple people to environments
- Switch between different environments

### Expense Tracking

- Add expenses with amount, description, and payer
- View all non-computed expenses in selected environment
- Edit and delete expenses
- Quick expense entry with pre-populated person selector

### Expense Computing

- Generate Excel reports of all expenses
- Archive computed expenses to historical table
- Maintain complete expense history
- Track who computed expenses and when

### Invitations

- Generate unique invitation links for environments
- Secure token-based system with expiration
- Seamless onboarding: invitees can join by logging in or creating a new account

## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Environments

- `GET /api/environments` - Get user's environments
- `POST /api/environments` - Create new environment
- `GET /api/environments/:id` - Get environment details
- `POST /api/environments/:id/people` - Add person to environment

### People

- `GET /api/people` - Get all people
- `POST /api/people` - Create new person

### Expenses

- `GET /api/expenses?environment_id=:id` - Get expenses for environment
- `POST /api/expenses` - Create new expense
- `PUT /api/expenses/:id` - Update expense
- `DELETE /api/expenses/:id` - Delete expense
- `POST /api/expenses/compute` - Compute expenses and generate Excel

### Invitations

- `POST /api/environments/:id/invite` - Generate an invitation link
- `GET /api/invitations/:token` - Validate an invitation token
- `POST /api/invitations/:token/accept` - Join the environment using a token

### Computed Expenses

- `GET /api/computed-expenses?environment_id=:id` - Get computed expense history

## Database Schema

See `database/schema.sql` for complete database structure.

## Development

### Backend Development

```bash
cd backend
npm run dev    # Start with nodemon (auto-reload)
npm run build  # Build for production
npm start      # Run production build
```

### Frontend Development

```bash
cd frontend
npm run dev    # Start development server
npm run build  # Build for production
npm run preview # Preview production build
```

## License

MIT
