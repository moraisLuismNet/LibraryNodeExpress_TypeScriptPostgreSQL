import express from "express";
import bookController from "../controllers/bookController";
import { upload } from "../controllers/bookController";
const router = express.Router();

// Route to list all books with their relationships
router.get("/", bookController.getAllBooks);

// Route to get books sorted by title
router.get("/sorted", bookController.getBooksSortedByTitle);

// Route to search for books whose title contains a text
router.get("/contains", bookController.getBooksByTitleContain);

/**
 * @swagger
 * /books/prices:
 *   get:
 *     summary: Get only id, title and price of all books
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: List of books with id, title and price
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   title:
 *                     type: string
 *                   price:
 *                     type: number
 */
router.get("/prices", bookController.getBooksAndPrices);

/**
 * @swagger
 * /books/grouped/discontinued:
 *   get:
 *     summary: Get books grouped by the discontinued field
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Books grouped by discontinued status
 */
router.get(
  "/grouped/discontinued",
  bookController.getBooksGroupedByDiscontinued
);

/**
 * @swagger
 * /books/by-price:
 *   get:
 *     summary: Get books within a price range
 *     tags: [Books]
 *     parameters:
 *       - in: query
 *         name: min
 *         schema:
 *           type: number
 *         required: true
 *         description: Minimum price
 *       - in: query
 *         name: max
 *         schema:
 *           type: number
 *         required: true
 *         description: Maximum price
 *     responses:
 *       200:
 *         description: List of books within the price range
 */
router.get("/by-price", bookController.getBooksByPrice);

/**
 * @swagger
 * /books/withTotalAuthors:
 *   get:
 *     summary: Get all books with total authors and total books count
 *     tags: [Books]
 *     responses:
 *       200:
 *         description: Books with author and total counts
 */
router.get("/withTotalAuthors", bookController.getBooksWithTotalAuthors);

/**
 * @swagger
 * /books:
 *   post:
 *     summary: Create a new book
 *     tags: [Books]
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               pages:
 *                 type: number
 *               price:
 *                 type: number
 *               discontinued:
 *                 type: boolean
 *               authorId:
 *                 type: integer
 *               publishingHouseId:
 *                 type: integer
 *               photoCover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       201:
 *         description: Book created successfully
 */
router.post("/", upload.single("photoCover"), bookController.post);

/**
 * @swagger
 * /books/{isbn}:
 *   put:
 *     summary: Update a book by isbn
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               title:
 *                 type: string
 *               pages:
 *                 type: number
 *               price:
 *                 type: number
 *               discontinued:
 *                 type: boolean
 *               authorId:
 *                 type: integer
 *               publishingHouseId:
 *                 type: integer
 *               photoCover:
 *                 type: string
 *                 format: binary
 *     responses:
 *       200:
 *         description: Book updated successfully
 */
router.put("/:id", upload.single("photoCover"), bookController.put);

/**
 * @swagger
 * /books/{isbn}:
 *   delete:
 *     summary: Delete a book by isbn
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book deleted successfully
 */
router.delete("/:id", bookController.delete);

/**
 * @swagger
 * /books/{isbn}:
 *   get:
 *     summary: Get a book by isbn
 *     tags: [Books]
 *     parameters:
 *       - in: path
 *         name: isbn
 *         required: true
 *         schema:
 *           type: integer
 *         description: Book ID
 *     responses:
 *       200:
 *         description: Book details
 */
router.get("/:id", bookController.getBook);

export default router;
