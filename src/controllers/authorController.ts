import { Request, Response } from "express";
import { Author } from "../models/authorModel";
import { AppDataSource } from "../db/connection";
import { ILike } from "typeorm";

class AuthorController {
  constructor() {}

  // List all authors with their books
  async getAllAuthorsWithBooks(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    try {
      const authors = await authorRepository.find({
        relations: ["books"],
      });
      return res.json(authors);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Get an author ID with their books
  async getAuthorWithBooks(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id || isNaN(idNum)) {
      return res.status(400).json({
        message: "The 'id' parameter is required and must be a valid number",
      });
    }
    try {
      const author = await authorRepository.findOne({
        where: { idAuthor: idNum },
        relations: ["books"],
      });
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      return res.json(author);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Get authors sorted by name (ascending or descending)
  async getAuthorsSortedByName(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const up = req.query.up === "false" ? false : true; // ascending default
    try {
      const authors = await authorRepository.find({
        order: { nameAuthor: up ? "ASC" : "DESC" },
        relations: ["books"],
      });
      return res.json(authors);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting the sorted authors" });
    }
  }

  // Get authors whose name contains a text (case insensitive)
  async getAuthorsByNameContain(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const { text } = req.query;
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "The 'text' parameter is required" });
    }
    try {
      const authors = await authorRepository.find({
        where: { nameAuthor: ILike(`%${text}%`) },
        relations: ["books"],
      });
      return res.json(authors);
    } catch (error) {
      return res.status(500).json({ message: "Error searching for authors" });
    }
  }

  // Get authors with total books
  async getAuthorsWithTotalBooks(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    try {
      const authors = await authorRepository.find({ relations: ["books"] });
      const result = authors.map((ph) => ({
        idAuthor: ph.idAuthor,
        nameAuthor: ph.nameAuthor,
        totalBooks: ph.books ? ph.books.length : 0,
      }));
      return res.json(result);

    } catch (error) {
      console.error("Error in getAuthorsWithTotalBooks:", error);
      return res
        .status(500)
        .json({ message: "Error getting authors with total books" });
    }
  }

  // Create a new author
  async post(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const { nameAuthor } = req.body;
    if (typeof nameAuthor !== "string" || !nameAuthor.trim()) {
      return res
        .status(400)
        .json({ message: "The 'nameAuthor' field is required" });
    }
    try {
      const newAuthor = authorRepository.create({ nameAuthor });
      await authorRepository.save(newAuthor);
      return res.status(201).json(newAuthor);
    } catch (error) {
      return res.status(500).json({ message: "Error creating author" });
    }
  }

  // Update an existing author by id
  async put(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const { id } = req.params;
    const { nameAuthor } = req.body;
    try {
      const author = await authorRepository.findOneBy({ idAuthor: Number(id) });
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      author.nameAuthor = nameAuthor ?? author.nameAuthor;
      await authorRepository.save(author);
      return res.json(author);
    } catch (error) {
      return res.status(500).json({ message: "Error updating author" });
    }
  }

  // Delete an existing author by id
  async delete(req: Request, res: Response) {
    const authorRepository = AppDataSource.getRepository(Author);
    const { id } = req.params;
    try {
      const author = await authorRepository.findOneBy({ idAuthor: Number(id) });
      if (!author) {
        return res.status(404).json({ message: "Author not found" });
      }
      await authorRepository.remove(author);
      return res.json({ message: "Author successfully removed" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting author" });
    }
  }
}

export default new AuthorController();
