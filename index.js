import * as dotenv from 'dotenv';
dotenv.config();
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';

const PORT = process.env.PORT || 3000;

import { registerValidation } from './validations/auth.js';

import checkAuth from './utils/checkAuth.js';
import {
	register,
	login,
	getMe,
	getAllUsers,
	toChangeChoice,
	deleteUsers,
	toChangeChoiceAll,
	getBlockUsers,
	getUnBlockUsers,
} from './controllers/UserController.js';

mongoose
	.connect(process.env.MONGODB_URI, {
		useNewUrlParser: true,
		useUnifiedTopology: true,
	})
	.then(() => console.log('DB is OK'))
	.catch(() => console.log('DB error'));

const app = express();

app.use(express.json());
app.use(cors());

app.post('/auth/login', login);
app.post('/auth/register', registerValidation, register);
app.get('/auth/me', checkAuth, getMe);
app.get('/users', getAllUsers);
app.get('/users/blockUsers', getBlockUsers);
app.get('/users/unBlockUsers', getUnBlockUsers);
app.patch('/users/:id', toChangeChoice);
app.post('/users/all', toChangeChoiceAll);
app.get('/users/delete', deleteUsers);

app.listen(PORT, err =>
	err ? console.log(err) : console.log(`Server started on post ${PORT}`)
);
