"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const models_1 = require("../models");
const express_1 = require("express");
const argon2 = tslib_1.__importStar(require("argon2"));
const userRouter = (0, express_1.Router)();
userRouter.get("/session", async (req, res) => {
    if (req.session.user)
        res.send({ user: req.session.user.email, status: "200" });
    else
        res.send({ status: "404" });
});
userRouter.post("/login", async (req, res) => {
    try {
        const user = req.body;
        const existingUser = await models_1.User.findOne({ email: user.email });
        if (existingUser) {
            const verified = await verifyPassword(user, existingUser.password);
            if (verified) {
                req.session.user = {
                    email: existingUser.email,
                };
                res.send({ message: "Login successful", status: "200" });
            }
            else {
                res.send({ message: "Login failed", status: "404" });
            }
        }
        else {
            res.send({ message: "User not found", status: "404" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});
userRouter.post("/register", async (req, res) => {
    try {
        const user = req.body;
        const existingUser = await models_1.User.findOne({ email: user.email });
        if (existingUser) {
            res.send({ message: "User already exists", status: "400" });
        }
        else {
            const hashedPassword = await hashPassword(user);
            await models_1.User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                password: hashedPassword,
            });
            res.send({ message: "User Created", status: "201" });
        }
    }
    catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal server error" });
    }
});
userRouter.get("/logout", async (req, res) => {
    if (req.session.user === undefined) {
        res.send({ message: "No user logged in", status: "200" });
        return;
    }
    req.session.destroy((err) => {
        if (err) {
            console.error(err);
            res.status(500).send({ message: "Internal server error" });
        }
        else {
            res.send({ message: "User logged out", status: "200" });
        }
    });
});
userRouter.get("/getUser", async (req, res) => {
    var _a;
    try {
        if (!((_a = req.session) === null || _a === void 0 ? void 0 : _a.user))
            return res.send({ message: "User not logged in", status: "403" });
        const user = await models_1.User.findOne({ email: req.session.user.email });
        if (!user)
            return res.send({ message: "User not found", status: "404" });
        res.json(user);
    }
    catch (err) {
        res.send({ message: err, status: "500" });
    }
});
/* Password hashing helper functions */
// Use when creating a new user
let hashPassword = async (user) => {
    try {
        return await argon2.hash(user.password);
    }
    catch (err) {
        console.error(err);
        throw new Error("Error hashing password");
    }
};
// Use when trying to login
let verifyPassword = async (user, hashedPassword) => {
    try {
        return await argon2.verify(hashedPassword, user.password);
    }
    catch (err) {
        console.error(err);
        throw new Error("Error verifying password");
    }
};
exports.default = userRouter;
