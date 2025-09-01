import { Request, Response } from "express";
import { User } from "../models/userModel";
import { AppDataSource } from "../db/connection";
import bcrypt from "bcrypt";

class UserController {
  constructor() {}

  // List all users
  async getAllUsers(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    try {
      const users = await userRepository.find();
      return res.json(users);
    } catch (error) {
      return res.status(500).json({ message: "Error getting users" });
    }
  }

  // Get a user by id
  async getUser(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const { id } = req.params;
    try {
      const user = await userRepository.findOneBy({ idUser: Number(id) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      return res.json(user);
    } catch (error) {
      return res.status(500).json({ message: "Error getting user" });
    }
  }

  // Create a new user
  async post(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const { userName, email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    try {
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const newUser = userRepository.create({
        userName,
        email,
        password: hashedPassword
      });
      await userRepository.save(newUser);
      return res.status(201).json(newUser);
    } catch (error) {
      return res.status(500).json({ message: "Error creating user" });
    }
  }

  // Update an existing user by id
  async put(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const { id } = req.params;
    const { userName, email, password } = req.body;
    try {
      const user = await userRepository.findOneBy({ idUser: Number(id) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      user.userName = userName ?? user.userName;
      user.email = email ?? user.email;
      user.password = password ?? user.password;
      await userRepository.save(user);
      return res.json(user);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating user" });
    }
  }

  // Delete an existing user by ID
  async delete(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const { id } = req.params;
    try {
      const user = await userRepository.findOneBy({ idUser: Number(id) });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      await userRepository.remove(user);
      return res.json({ message: "User successfully deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting user" });
    }
  }
}

export default new UserController();
