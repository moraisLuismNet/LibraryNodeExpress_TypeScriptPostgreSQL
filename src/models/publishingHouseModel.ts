import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Book } from './bookModel'; 

@Entity()
export class PublishingHouse {
    @PrimaryGeneratedColumn()
    idPublishingHouse: number;

    @Column()
    namePublishingHouse: string;

    // Relationship with books: a publisher may have several books
    @OneToMany(() => Book, book => book.publishingHouse)
    books: Book[];
}