import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Repository } from './repository.entity';
import { User } from './user.entity';

@Entity('issues')
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  githubId: string;

  @Column()
  repoId: string;

  @ManyToOne(() => Repository, (repo) => repo.issues)
  @JoinColumn({ name: 'repoId' })
  repo: Repository;

  @Column()
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  number: number;

  @Column()
  title: string;

  @Column()
  status: string; // 'open', 'closed'

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
