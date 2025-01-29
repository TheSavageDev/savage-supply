import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { ItemCategory } from '../../item/entities/item.entity';

interface TemplateItem {
  name: string;
  category: ItemCategory;
  quantity: number;
  minimumQuantity: number;
}

@Entity()
export class KitTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  description: string;

  @Column('jsonb')
  items: TemplateItem[];

  @CreateDateColumn()
  createdAt: Date;
}
