import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes';
import environmentRoutes from './routes/environmentRoutes';
import personRoutes from './routes/personRoutes';
import expenseRoutes from './routes/expenseRoutes';
import db from './config/database';
import invitationRoutes from './routes/invitationRoutes';
import categoryRoutes from './routes/categoryRoutes';

// Load environment variables
dotenv.config();

const app: Application = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
//TODO: CORS
/**
 * const allowedOrigins = [
  'http://localhost:5173',          // Desarrollo local
  'https://tu-app.vercel.app',      // Tu URL de producción en Vercel
  /\.vercel\.app$/                  // Permite cualquier preview de Vercel (opcional pero útil)
];

app.use(cors({
  origin: (origin, callback) => {
    // Permitir peticiones sin origen (como Postman o herramientas de servidor)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.some(allowed => 
      typeof allowed === 'string' ? allowed === origin : allowed.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true // Necesario si en el futuro decides usar cookies
}));
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req: Request, res: Response, next: NextFunction) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/environments', environmentRoutes);
app.use('/api/people', personRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/invitations', invitationRoutes);
app.use('/api/categories', categoryRoutes);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'Family Expense Tracker API',
    version: '1.0.0',
    endpoints: {
      auth: '/api/auth',
      environments: '/api/environments',
      people: '/api/people',
      expenses: '/api/expenses',
    },
  });
});

// Error handling middleware
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Test database connection and start server
const startServer = async () => {
  try {
    // Test database connection
    await db.query('SELECT 1');
    console.log('✓ Database connection established');

    app.listen(PORT, () => {
      console.log(`✓ Server is running on port ${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`✓ API available at http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

export default app;
