import { Request, Response } from "express";
import { PublishingHouse } from "../models/publishingHouseModel";
import { AppDataSource } from "../db/connection";
import { ILike } from "typeorm";

class PublishingHouseController {
  constructor() {}

  // List all publishers with their books
  async getAllPublishingHouses(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    try {
      const publishingHouses = await publishingHouseRepository.find({
        relations: ["books"],
      });
      return res.json(publishingHouses);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Get a publisher for ID with your books
  async getPublishingHouse(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id || isNaN(idNum)) {
      return res
        .status(400)
        .json({
          message: "The 'id' parameter is required and must be a valid number",
        });
    }
    try {
      const publishingHouse = await publishingHouseRepository.findOne({
        where: { idPublishingHouse: idNum },
        relations: ["books"],
      });
      if (!publishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      return res.json(publishingHouse);
    } catch (error) {
      return res.status(500).json({ message: "Server error" });
    }
  }

  // Create a new publishing house
  async post(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    const { namePublishingHouse } = req.body;
    try {
      const newPublishingHouse = publishingHouseRepository.create({
        namePublishingHouse,
      });
      await publishingHouseRepository.save(newPublishingHouse);
      return res.status(201).json(newPublishingHouse);
    } catch (error) {
      return res.status(500).json({ message: "Error creating publisher" });
    }
  }

  // Update an existing publisher by id
  async put(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    const { id } = req.params;
    const idNum = Number(id);
    const { namePublishingHouse } = req.body;
    if (!id || isNaN(idNum)) {
      return res
        .status(400)
        .json({
          message: "The 'id' parameter is required and must be a valid number",
        });
    }
    try {
      const publishingHouse = await publishingHouseRepository.findOneBy({
        idPublishingHouse: idNum,
      });
      if (!publishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      publishingHouse.namePublishingHouse =
        namePublishingHouse ?? publishingHouse.namePublishingHouse;
      await publishingHouseRepository.save(publishingHouse);
      return res.json(publishingHouse);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error updating the publisher" });
    }
  }

  // Delete an existing publisher by id
  async delete(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    const { id } = req.params;
    const idNum = Number(id);
    if (!id || isNaN(idNum)) {
      return res
        .status(400)
        .json({
          message: "The 'id' parameter is required and must be a valid number",
        });
    }
    try {
      const publishingHouse = await publishingHouseRepository.findOneBy({
        idPublishingHouse: idNum,
      });
      if (!publishingHouse) {
        return res.status(404).json({ message: "Publisher not found" });
      }
      await publishingHouseRepository.remove(publishingHouse);
      return res.json({ message: "Editorial successfully removed" });
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error deleting publisher" });
    }
  }

  // Get publishers sorted by name (ascending or descending)
  async getPublishingHousesSortedByName(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    // up can come as a query param: /publishingHouse/sorted?up=true
    const up = req.query.up === "false" ? false : true; // ascending default

    try {
      const publishingHouses = await publishingHouseRepository.find({
        order: { namePublishingHouse: up ? "ASC" : "DESC" },
        relations: ["books"],
      });
      return res.json(publishingHouses);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error getting the ordered publishers" });
    }
  }

  // Get publishers whose name contains text (case insensitive)
  async getPublishingHousesByNameContain(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    const { text } = req.query;
    if (typeof text !== "string" || !text.trim()) {
      return res
        .status(400)
        .json({ message: "The 'text' parameter is required" });
    }
    try {
      const publishingHouses = await publishingHouseRepository.find({
        where: { namePublishingHouse: ILike(`%${text}%`) },
        relations: ["books"],
      });
      return res.json(publishingHouses);
    } catch (error) {
      return res
        .status(500)
        .json({ message: "Error searching for publishers" });
    }
  }

  // Get all publishers with the total number of books from each one
  async getPublishingHousesWithTotalBooks(req: Request, res: Response) {
    const publishingHouseRepository =
      AppDataSource.getRepository(PublishingHouse);
    try {
      const publishingHouses = await publishingHouseRepository.find({
        relations: ["books"],
      });
      const result = publishingHouses.map((ph) => ({
        idPublishingHouse: ph.idPublishingHouse,
        namePublishingHouse: ph.namePublishingHouse,
        totalBooks: ph.books ? ph.books.length : 0,
      }));
      return res.json(result);
    } catch (error) {
      return res.status(500).json({
        message: "Error getting publishers with total books",
      });
    }
  }
}

export default new PublishingHouseController();
