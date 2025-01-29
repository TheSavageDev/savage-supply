import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Kit } from '../../kit/entities/kit.entity';

@Entity()
export class NotificationPreferences {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  kitId: string;

  @ManyToOne(() => Kit)
  kit: Kit;

  @Column({ default: true })
  lowStockEnabled: boolean;

  @Column({ default: true })
  expirationEnabled: boolean;

  @Column({ default: 30 })
  expirationWarningDays: number;

  @Column({ default: 5 })
  lowStockThreshold: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
