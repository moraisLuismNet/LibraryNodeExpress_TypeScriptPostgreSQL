import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  idUser: number;

  @Column({ nullable: true })
  userName?: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;
}
