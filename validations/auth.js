import { body } from 'express-validator';

export const registerValidation = [
	body('email').isEmail(),
	body('password').isLength({ min: 1 }),
	body('fullName').isLength({ min: 1 }),
	body('avatarUrl').optional().isURL(),
];
