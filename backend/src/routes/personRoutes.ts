import { Router } from 'express';
import { getPeople, getPeopleInEnvironment } from '../controllers/personController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/people:
 *   get:
 *     summary: Get all people
 *     description: Retrieve a list of all registered people in the system
 *     tags: [People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: People retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/', getPeople);

/**
 * @swagger
 * /api/people/environment:
 *   get:
 *     summary: Get people in a specific environment
 *     description: Retrieve all people belonging to a specific family environment
 *     tags: [People]
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
 *         description: People retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                         example: 1
 *                       name:
 *                         type: string
 *                         example: John Doe
 *                       email:
 *                         type: string
 *                         example: john@example.com
 *       400:
 *         description: environment_id is required
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       403:
 *         description: Access denied to this environment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.get('/environment', getPeopleInEnvironment);

export default router;