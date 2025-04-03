import { IUser, ISessionUser } from "../interfaces";
import { DailyWeather, WeatherData, User } from "../models";
import { Router } from "express";
import * as argon2 from "argon2";
import crypto from "crypto";

const nodemailer = require("nodemailer");

const userRouter = Router();

/* User routes */

declare module "express-session" {
  interface Session {
    user?: IUser;
  }
}

userRouter.get("/session", async (req, res) => {
  if (req.session.user)
    res.send({ user: req.session.user.email, status: "200" });
  else
    res.send({ status: "404" });
});

userRouter.post("/login", async (req, res) => {
  try {
    const user: IUser = req.body;
    const existingUser = await User.findOne({ email: user.email });
    if (existingUser) {
      const verified = await verifyPassword(user, existingUser.password);

      if (verified) {
        (req.session.user as ISessionUser) = {
          email: existingUser.email,
        };
        res.send({ message: "Login successful", status: "200" });
      } else {
        res.send({ message: "Login failed", status: "404" });
      }
    } else {
      res.send({ message: "User not found", status: "404" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.post("/register", async (req, res) => {
  try {
    const user: IUser = req.body;
    const existingUser = await User.findOne({ email: user.email });

    if (existingUser) {
      res.send({ message: "User already exists", status: "400" });
    } else {
      const hashedPassword = await hashPassword(user);

      await User.create({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: hashedPassword,
      });

      res.send({ message: "User Created", status: "201" });
    }
  } catch (error) {
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
    } else {
      res.send({ message: "User logged out", status: "200" });
    }
  });
});

userRouter.get("/getUser", async (req, res) => {
  try {
    if (!req.session?.user) return res.send({ message: "User not logged in", status: "403" });

    const user = await User.findOne({ email: req.session.user.email });
    if (!user) return res.send({ message: "User not found", status: "404" });

    res.json(user);
  } catch (err) {
    res.send({ message: err, status: "500" });
  }
});

userRouter.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).send({ message: "Email is required" });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).send({ message: "If this email is registered, a reset link has been sent" });
    }

    const resetToken = crypto.randomBytes(20).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = new Date(Date.now() + 3600000);
    await user.save();

    const resetLink = `${req.headers.origin || "http://localhost:3000"}/reset-password/${resetToken}`;

    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: Number(process.env.EMAIL_PORT),
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const mailOptions = {
      from: `"GateMate Support" <gatemate35@gmail.com>`,
      to: email,
      subject: "Password Reset Request",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
          <h2 style="color: #333; text-align: center;">Password Reset Request</h2>
          <p style="font-size: 16px; color: #555;">
            You are receiving this because you (or someone else) have requested the reset of the password for your account.
          </p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${resetLink}" 
               style="display: inline-block; background-color: #4CAF50; color: white; padding: 12px 20px; text-decoration: none; font-size: 18px; border-radius: 5px;">
              Reset Password
            </a>
          </p>
          <p style="font-size: 14px; color: #777;">
            If you did not request this, please ignore this email and your password will remain unchanged.
          </p>
          <p style="font-size: 14px; color: #777; text-align: center; margin-top: 20px;">
            &copy; ${new Date().getFullYear()} GateMate
          </p>
        </div>
      `,
    };    

    await transporter.sendMail(mailOptions);
    return res.status(200).send({
      message: "If this email is registered, a reset link has been sent"
    });
  } catch (err) {
    console.error("Error during forgot-password", err);
    return res.status(500).send({ message: "Internal server error" });
  }
});

userRouter.post("/reset-password", async (req, res) => {
  const { token, newPassword } = req.body;

  if (!token || !newPassword) {
    return res.status(400).send({ message: "Token and new password are required." });
  }

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).send({ message: "Password reset token is invalid or has expired." });
    }

    const hashedPassword = await argon2.hash(newPassword);
    user.password = hashedPassword;

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.send({ message: "Password has been reset successfully." });
  } catch (error) {
    console.error("Error in password reset:", error);
    res.status(500).send({ message: "Internal server error." });
  }
});

/* Password hashing helper functions */

// Use when creating a new user
let hashPassword = async (user: IUser): Promise<string> => {
  try {
    return await argon2.hash(user.password);
  } catch (err) {
    console.error(err);
    throw new Error("Error hashing password");
  }
};

// Use when trying to login
let verifyPassword = async (user: IUser, hashedPassword: string): Promise<boolean> => {
  try {
    return await argon2.verify(hashedPassword, user.password);
  } catch (err) {
    console.error(err);
    throw new Error("Error verifying password");
  }
};

export default userRouter;
