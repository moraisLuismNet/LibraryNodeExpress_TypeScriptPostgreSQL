import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { Book } from "./bookModel";

@Entity()
export class Author {
  @PrimaryGeneratedColumn()
  idAuthor: number;

  @Column()
  nameAuthor: string;

  @OneToMany(() => Book, (book) => book.author)
  books: Book[];
}
