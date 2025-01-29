import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';
import { NotificationType } from '../notification.types';

@Entity()
export class NotificationHistory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  kitId: string;

  @Column({
    type: 'enum',
    enum: NotificationType,
  })
  type: NotificationType;

  @Column('jsonb')
  payload: Record<string, any>;

  @Column({ default: true })
  sent: boolean;

  @CreateDateColumn()
  sentAt: Date;
}
