import { validationResult } from "express-validator";
import User from "../models/user.model.js";
import redisClient from "../services/redis.service.js";
import * as userService from "../services/services.js";

export const createUserController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password, name } = req.body;
        const existing = await User.findOne({ email });
        if (existing) return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await User.hashPassword(password);
        const user = await User.create({name, email, password: hashedPassword });
        const token = user.generateJWT();

        res.status(201).json({ message: "User registered successfully", user: {name: user.name, email: user.email }, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const loginUserController = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const { email, password } = req.body;
        const user = await User.findOne({ email }).select("+password");
        if (!user) return res.status(400).json({ message: "User not found" });

        const isMatch = await user.isValidPassword(password);
        if (!isMatch) return res.status(400).json({ message: "Incorrect password" });

        const token = user.generateJWT();
        res.status(200).json({ message: "Login successful", user: { email: user.email }, token });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const profileController = async (req, res) => {
    res.status(200).json({ user: req.user });
};


export const logoutController = async (req, res) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader) return res.status(400).json({ message: "Authorization header missing" });

        const token = authHeader.split(" ")[1];

        // Add token to Redis blacklist for 24 hours
        await redisClient.set(token, "blacklisted", "EX", 60*60*24);

        res.status(200).json({ message: "Logged out successfully" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

export const getAllUsersController = async (req, res) => {
    try {
        const loggedInUser = await User.findOne({ email: req.user.email });

        if (!loggedInUser) {
            return res.status(404).json({ message: "User not found" });
        }

        const allUsers = await userService.getAllUsers({ userId: loggedInUser._id });

        return res.status(200).json({ users: allUsers });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
};

