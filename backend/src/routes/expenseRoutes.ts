import { Router } from 'express';
import {
  getExpenses,
  createExpense,
  updateExpense,
  deleteExpense,
  computeExpenses,
  getComputedExpenses,
} from '../controllers/expenseController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/expenses:
 *   get:
 *     summary: Get expenses for an environment
 *     description: Retrieve all non-computed expenses for a specific environment
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: environment_id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *         example: 1
 *     responses:
 *       200:
 *         description: Expenses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 expenses:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Expense'
 *       400:
 *         description: environment_id is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getExpenses);

/**
 * @swagger
 * /api/expenses:
 *   post:
 *     summary: Create a new expense
 *     description: Register a new expense in a family environment
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - amount
 *               - description
 *               - expense_date
 *               - payer_id
 *               - environment_id
 *             properties:
 *               amount:
 *                 type: number
 *                 example: 50.00
 *               description:
 *                 type: string
 *                 example: Groceries
 *               expense_date:
 *                 type: string
 *                 format: date
 *                 example: 2024-01-10
 *               payer_id:
 *                 type: integer
 *                 example: 1
 *               environment_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       201:
 *         description: Expense created successfully
 */
router.post('/', createExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   put:
 *     summary: Update an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               amount:
 *                 type: number
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Updated successfully
 */
router.put('/:id', updateExpense);

/**
 * @swagger
 * /api/expenses/{id}:
 *   delete:
 *     summary: Delete an expense
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Deleted successfully
 */
router.delete('/:id', deleteExpense);

/**
 * @swagger
 * /api/expenses/compute:
 *   post:
 *     summary: Compute expenses and generate Excel
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               environment_id:
 *                 type: integer
 *                 example: 1
 *     responses:
 *       200:
 *         description: Excel file generated
 */
router.post('/compute', computeExpenses);

/**
 * @swagger
 * /api/expenses/computed:
 *   get:
 *     summary: Get computed expenses
 *     tags: [Expenses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: environment_id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Computed expenses retrieved
 */
router.get('/computed', getComputedExpenses);

export default router;