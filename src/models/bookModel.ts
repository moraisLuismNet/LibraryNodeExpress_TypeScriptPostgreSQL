import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Author } from './authorModel';
import { PublishingHouse } from './publishingHouseModel';

@Entity()
export class Book {
    @PrimaryGeneratedColumn()
    isbn: number;

    @Column()
    title: string;

    @Column()
    pages: number;

    @Column({ type: 'decimal', precision: 9, scale: 2 })
    price: number;

    @Column({ nullable: true })
    photoCover: string;
    

    @Column()
    discontinued: boolean;

    // Relationship with Author
    @ManyToOne(() => Author, author => author.books)
    @JoinColumn({ name: 'authorId' })
    author: Author;

    @Column()
    authorId: number;

    // Relationship with Publisher
    @ManyToOne(() => PublishingHouse, publishingHouse => publishingHouse.books)
    @JoinColumn({ name: 'publishingHouseId' })
    publishingHouse: PublishingHouse;

    @Column()
    publishingHouseId: number;
}