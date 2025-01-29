import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Item } from '../../item/entities/item.entity';

@Entity()
export class Kit {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToMany(() => Item, (item) => item.kit)
  items: Item[];

  @Column()
  name: string;

  @Column()
  location: string;

  @Column({ nullable: true })
  description?: string;

  @Column()
  ownerId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
