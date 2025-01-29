import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kit } from '../../kit/entities/kit.entity';

export enum ItemCategory {
  MEDICATION = 'medication',
  BANDAGE = 'bandage',
  TOOL = 'tool',
  TOPICAL = 'topical',
  OTHER = 'other',
}

@Entity()
export class Item {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  kitId: string;

  @Column()
  kitName: string;

  @ManyToOne(() => Kit, (kit) => kit.items, { onDelete: 'CASCADE' })
  kit: Kit;

  @Column()
  name: string;

  @Column({
    type: 'enum',
    enum: ItemCategory,
    default: ItemCategory.OTHER,
  })
  category: ItemCategory;

  @Column({ type: 'int' })
  quantity: number;

  @Column({ type: 'int' })
  minimumQuantity: number;

  @Column({ type: 'timestamp', nullable: true })
  expirationDate?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt?: Date;

  @DeleteDateColumn()
  deletedAt?: Date;
}
