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
 *     tags: [People]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of all people
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
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
 *         description: List of people in the environment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 people:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
 *       400:
 *         description: Bad request - environment_id required
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
 *       403:
 *         description: Access denied to this environment
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