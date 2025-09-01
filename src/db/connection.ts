import 'dotenv/config';
import { DataSource } from "typeorm";
import { Book } from "../models/bookModel";
import { PublishingHouse } from "../models/publishingHouseModel";
import { Author } from "../models/authorModel";
import { User } from "../models/userModel";

export const AppDataSource = new DataSource({
  type: "postgres",
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432', 10),
  username: process.env.DB_USERNAME || 'postgres',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'library',
  schema: process.env.DB_SCHEMA || 'public',
  logging: process.env.NODE_ENV !== 'production',
  entities: [Author, Book, PublishingHouse, User],
  synchronize: process.env.NODE_ENV !== 'production',
});
