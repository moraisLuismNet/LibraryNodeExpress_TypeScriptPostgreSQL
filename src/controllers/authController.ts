import { Request, Response } from "express";
import { User } from "../models/userModel";
import { AppDataSource } from "../db/connection";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";

const SECRET = "my_secret_key";

class AuthController {
  constructor() {}

  // User login
  async login(req: Request, res: Response) {
    const userRepository = AppDataSource.getRepository(User);
    const { email, password } = req.body;
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }
    try {
      const user = await userRepository.findOneBy({ email });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      // Generate JWT
      const token = jwt.sign({ email: user.email, id: user.idUser }, SECRET, {
         expiresIn: "1h",
       });
       return res.json({ user: userWithoutPassword, token });
    } catch (error) {
      return res.status(500).json({ message: "Login error" });
    }
  }
}

export default new AuthController();
