import { Request, Response } from "express";
import { Book } from "../models/bookModel";
import { AppDataSource } from "../db/connection";
import { ILike, Between } from "typeorm";
import multer, { StorageEngine } from "multer";
import { Request as ExpressRequest } from "express";

// Configuring multer to save files to the 'uploads/' folder
const storage: StorageEngine = multer.diskStorage({
  destination: function (req: ExpressRequest, file: Express.Multer.File, cb) {
    cb(null, "uploads/");
  },
  filename: function (req: ExpressRequest, file: Express.Multer.File, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});
export const upload = multer({ storage });

class BookController {
  constructor() {}

  // List all books with their relationships
  async getAllBooks(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    try {
      const books = await bookRepository.find({
        relations: ["author", "publishingHouse"],
      });
      return res.json(books);
    } catch (error) {
      return res.status(500).json({ message: "Error getting books" });
    }
  }

  // Get a book by id
  async getBook(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id || isNaN(idNum)) {
      return res.status(400).json({
        message: "The 'id' parameter is required and must be a valid number",
      });
    }
    try {
      const book = await bookRepository.findOne({
        where: { isbn: idNum },
        relations: ["author", "publishingHouse"],
      });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      return res.json(book);
    } catch (error) {
      return res.status(500).json({ message: "Error getting the book" });
    }
  }

  // Create a new book
  async post(
    req: ExpressRequest & { file?: Express.Multer.File },
    res: Response
  ) {
    // Extract text and file fields
    let { title, pages, price, discontinued, authorId, publishingHouseId } =
      req.body;
    let photoCover = req.file ? req.file.filename : undefined;

    // Convert types
    pages = pages !== undefined ? Number(pages) : undefined;
    price = price !== undefined ? Number(price) : undefined;
    authorId = authorId !== undefined ? Number(authorId) : undefined;
    publishingHouseId =
      publishingHouseId !== undefined ? Number(publishingHouseId) : undefined;
    discontinued = discontinued === "true" || discontinued === true;

    // Validate required fields
    if (
      !title ||
      pages === undefined ||
      price === undefined ||
      authorId === undefined ||
      publishingHouseId === undefined
    ) {
      return res
        .status(400)
        .json({ message: "Required fields are missing from the body" });
    }

    const bookRepository = AppDataSource.getRepository(Book);
    try {
      const newBook = bookRepository.create({
        title,
        pages,
        price,
        photoCover,
        discontinued,
        authorId,
        publishingHouseId,
      });
      await bookRepository.save(newBook);
      return res.status(201).json(newBook);
    } catch (error) {
      return res.status(500).json({ message: "Error creating book" });
    }
  }

  // Update an existing workbook by ID
  async put(
    req: ExpressRequest & { file?: Express.Multer.File },
    res: Response
  ) {
    if (!req.body || typeof req.body !== "object") {
      return res
        .status(400)
        .json({
          message:
            "The request body is required and must be a JSON or form-data object.",
        });
    }
    const { id } = req.params;
    const idNum = Number(id);
    // Extract text and file fields
    let { title, pages, price, discontinued, authorId, publishingHouseId } =
      req.body;
    let photoCover = req.file ? req.file.filename : undefined;
    // Convert types
    pages = pages !== undefined ? Number(pages) : undefined;
    price = price !== undefined ? Number(price) : undefined;
    authorId = authorId !== undefined ? Number(authorId) : undefined;
    publishingHouseId =
      publishingHouseId !== undefined ? Number(publishingHouseId) : undefined;
    discontinued = discontinued === "true" || discontinued === true;
    if (!id || isNaN(idNum)) {
      return res
        .status(400)
        .json({
          message: "The 'id' parameter is required and must be a valid number",
        });
    }
    try {
      const bookRepository = AppDataSource.getRepository(Book);
      const book = await bookRepository.findOneBy({ isbn: idNum });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      // Only update submitted fields
      book.title = title ?? book.title;
      book.pages = pages ?? book.pages;
      book.price = price ?? book.price;
      book.photoCover = photoCover ?? book.photoCover;
      book.discontinued = discontinued ?? book.discontinued;
      book.authorId = authorId ?? book.authorId;
      book.publishingHouseId = publishingHouseId ?? book.publishingHouseId;
      await bookRepository.save(book);
      return res.json(book);
    } catch (error) {
      return res.status(500).json({ message: "Error updating the book" });
    }
  }

  // Delete an existing book by ID
  async delete(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id || isNaN(idNum)) {
      return res.status(400).json({
        message: "The 'id' parameter is required and must be a valid number",
      });
    }
    try {
      const book = await bookRepository.findOneBy({ isbn: idNum });
      if (!book) {
        return res.status(404).json({ message: "Book not found" });
      }
      await bookRepository.remove(book);
      return res.json({ message: "Book successfully deleted" });
    } catch (error) {
      return res.status(500).json({ message: "Error deleting book" });
    }
  }

  // Get books sorted by title (ascending or descending)
  async getBooksSortedByTitle(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    const up = req.query.up === "false" ? false : true; // ascending default
    try {
      const books = await bookRepository.find({
        order: { title: up ? "ASC" : "DESC" },
        relations: ["author", "publishingHouse"],
      });
      return res.json(books);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting the sorted books" });
    }
  }

  // Get books whose title contains text (case insensitive)
  async getBooksByTitleContain(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    const { text } = req.query;
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "The 'text' parameter is required" });
    }
    try {
      const books = await bookRepository.find({
        where: { title: ILike(`%${text}%`) },
        relations: ["author", "publishingHouse"],
      });
      return res.json(books);
    } catch (error) {
      return res.status(500).json({ message: "Error searching for books" });
    }
  }

  // Get only isbn, title and price of all books
  async getBooksAndPrices(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    try {
      const books = await bookRepository.find({
        select: ["isbn", "title", "price"],
      });
      return res.json(books);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting books and prices" });
    }
  }

  // Get books grouped by the discontinued field
  async getBooksGroupedByDiscontinued(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    try {
      const books = await bookRepository.find({
        relations: ["author", "publishingHouse"],
      });
      const discontinued = books.filter((book) => book.discontinued);
      const available = books.filter((book) => !book.discontinued);
      return res.json({ discontinued, available });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting grouped books" });
    }
  }

  // Get books whose price is between min and max
  async getBooksByPrice(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    const min = parseFloat(req.query.min as string);
    const max = parseFloat(req.query.max as string);
    if (isNaN(min) || isNaN(max)) {
      return res.status(400).json({
        message:
          "The 'min' and 'max' parameters are required and must be numbers.",
      });
    }
    try {
      const books = await bookRepository.find({
        where: { price: Between(min, max) },
        relations: ["author", "publishingHouse"],
      });
      return res.json(books);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error searching for books by price" });
    }
  }

  // Get all books with total authors
  async getBooksWithTotalAuthors(req: Request, res: Response) {
    const bookRepository = AppDataSource.getRepository(Book);
    try {
      const books = await bookRepository.find({ relations: ["author"] });
      const result = books.map((book) => ({
        idBook: book.isbn,
        title: book.title,
        totalAuthors: book.author ? 1 : 0,
      }));
      return res.json(result);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting books with total authors" });
    }
  }
}

export default new BookController();
