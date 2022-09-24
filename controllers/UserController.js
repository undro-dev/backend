import * as dotenv from 'dotenv';
dotenv.config();
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
const SECRET_KEY = process.env.SECRET_KEY;

import { validationResult } from 'express-validator';
import UserModel from '../models/User.js';

export const register = async (req, res) => {
	try {
		const errors = validationResult(req);
		if (!errors.isEmpty()) {
			return res.status(400).json(errors.array());
		}
		const password = req.body.password;
		const salt = await bcrypt.genSalt(10);
		const hash = await bcrypt.hash(password, salt);

		const doc = new UserModel({
			email: req.body.email,
			fullName: req.body.fullName,
			avatarUrl: req.body.avatarUrl,
			passwordHash: hash,
			isChoice: false,
			isBlock: false,
		});

		const user = await doc.save();
		const token = jwt.sign({ _id: user._id }, `${SECRET_KEY}`, {
			expiresIn: '30d',
		});
		const { passwordHash, ...userData } = user._doc;

		res.json({ ...userData, token });
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Failed to register!!!' });
	}
};

export const login = async (req, res) => {
	try {
		const user = await UserModel.findOneAndUpdate(
			{ email: req.body.email },
			{ lastLogin: Date.now() }
		);
		if (!user) {
			return res.json({ data: null, message: 'User is not found!!' });
		}
		if (user.isBlock) {
			return res.json({ data: null, message: 'User is blocked!!!' });
		}

		const isValidPassword = await bcrypt.compare(
			req.body.password,
			user._doc.passwordHash
		);

		if (!isValidPassword) {
			return res.json({ data: null, message: 'Invalid login or password' });
		}

		const token = jwt.sign({ _id: user._id }, `${SECRET_KEY}`, {
			expiresIn: '30d',
		});

		const { passwordHash, ...userData } = user._doc;
		const data = { ...userData, token };

		res.json({ data, message: 'Success!!!' });
	} catch (error) {
		console.log(error);
		res.status(404).json({ message: 'Failed to login!!!' });
	}
};

export const getMe = async (req, res) => {
	try {
		const user = await UserModel.findById(req.userId);

		if (!user) {
			return res.status(404).json({
				message: 'User is not found!!!',
			});
		}

		const { passwordHash, ...userData } = user._doc;

		res.json(userData);
	} catch (err) {
		console.log(err);
		res.status(500).json({
			message: 'No access!!!',
		});
	}
};

export const getAllUsers = async (req, res) => {
	try {
		const users = await UserModel.find();
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Failed to get users!!!' });
	}
};
export const getBlockUsers = async (req, res) => {
	try {
		await UserModel.updateMany({ isChoice: true }, { $set: { isBlock: true } });
		const users = await UserModel.find();
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Failed to get users!!!' });
	}
};
export const getUnBlockUsers = async (req, res) => {
	try {
		await UserModel.updateMany(
			{ isChoice: true },
			{ $set: { isBlock: false } }
		);
		const users = await UserModel.find();
		res.json(users);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Failed to get users!!!' });
	}
};

export const toChangeChoice = async (req, res) => {
	try {
		const { id } = req.params;
		await UserModel.findByIdAndUpdate(id, {
			isChoice: req.body.isChoice,
		});

		const users = await UserModel.find();
		res.json(users);
	} catch (error) {
		console.log(error);
	}
};
export const toChangeChoiceAll = async (req, res) => {
	try {
		const { params } = req.body;
		if (params.isChoice) {
			await UserModel.updateMany(
				{ isChoice: false },
				{ $set: { isChoice: params.isChoice } }
			);
			const users = await UserModel.find();
			await res.json(users);
		} else {
			await UserModel.updateMany(
				{ isChoice: true },
				{ $set: { isChoice: params.isChoice } }
			);
			const users = await UserModel.find();
			await res.json(users);
		}
	} catch (error) {
		console.log(error);
	}
};

export const deleteUsers = async (req, res) => {
	try {
		await UserModel.deleteMany({ isChoice: true });
		const userLasts = await UserModel.find();
		res.json(userLasts);
	} catch (error) {
		console.log(error);
		res.status(500).json({ message: 'Failed to delete users!!!' });
	}
};
