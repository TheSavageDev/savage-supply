import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Item } from '../../item/entities/item.entity';

export enum HistoryActionType {
  CREATED = 'created',
  UPDATED = 'updated',
  DELETED = 'deleted',
  QUANTITY_CHANGED = 'quantity_changed',
  EXPIRED = 'expired',
}

@Entity()
export class InventoryHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  itemId: string;

  @Column({ type: 'uuid' })
  kitId: string;

  @Column({
    type: 'enum',
    enum: HistoryActionType,
  })
  action: HistoryActionType;

  @Column('jsonb')
  changes: Record<string, any>;

  @CreateDateColumn()
  timestamp: Date;

  @ManyToOne(() => Item)
  @JoinColumn({ name: 'itemId' })
  item: Item;
}
