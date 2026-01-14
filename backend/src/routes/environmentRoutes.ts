import { Router } from 'express';
import {
  getEnvironments,
  createEnvironment,
  getEnvironmentDetails,
  addPersonToEnvironment,
} from '../controllers/environmentController';
import { authMiddleware } from '../middleware/auth';

const router = Router();

router.use(authMiddleware);

/**
 * @swagger
 * /api/environments:
 *   get:
 *     summary: Get all environments for the authenticated user
 *     description: Retrieve all family environments that the authenticated user belongs to
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Environments retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 environments:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Environment'
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
router.get('/', getEnvironments);

/**
 * @swagger
 * /api/environments:
 *   post:
 *     summary: Create a new environment
 *     description: Create a new family environment. The creator is automatically added to the environment.
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Main Home
 *               description:
 *                 type: string
 *                 example: Our primary family residence
 *     responses:
 *       201:
 *         description: Environment created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Environment created successfully
 *                 environment:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                       example: 1
 *                     name:
 *                       type: string
 *                       example: Main Home
 *                     description:
 *                       type: string
 *                       example: Our primary family residence
 *       400:
 *         description: Name is required
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
router.post('/', createEnvironment);

/**
 * @swagger
 * /api/environments/{id}:
 *   get:
 *     summary: Get environment details
 *     description: Retrieve detailed information about a specific environment including all members
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     responses:
 *       200:
 *         description: Environment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 environment:
 *                   $ref: '#/components/schemas/Environment'
 *                 people:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Person'
 *       403:
 *         description: Access denied to this environment
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Environment not found
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
router.get('/:id', getEnvironmentDetails);

/**
 * @swagger
 * /api/environments/{id}/people:
 *   post:
 *     summary: Add a person to an environment
 *     description: Add an existing person to a family environment
 *     tags: [Environments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Environment ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - person_id
 *             properties:
 *               person_id:
 *                 type: integer
 *                 example: 2
 *     responses:
 *       201:
 *         description: Person added to environment successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Person added to environment successfully
 *       400:
 *         description: Invalid input or person already in environment
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
 *       404:
 *         description: Person or environment not found
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
router.post('/:id/people', addPersonToEnvironment);

export default router;