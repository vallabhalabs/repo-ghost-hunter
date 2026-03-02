import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Repository } from './repository.entity';

@Entity('activity_logs')
export class ActivityLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  repoId: string;

  @ManyToOne(() => Repository)
  @JoinColumn({ name: 'repoId' })
  repo: Repository;

  @Column({ type: 'int', default: 0 })
  commitCount: number;

  @Column({ type: 'date' })
  week: Date;

  @Column({ type: 'int', default: 0 })
  activeContributors: number;

  @CreateDateColumn()
  createdAt: Date;
}
