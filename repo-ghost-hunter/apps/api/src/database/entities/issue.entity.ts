import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { Repository } from './repository.entity';
import { User } from './user.entity';

@Entity('issues')
@Index(['repoId'])
@Index(['repoId', 'status'])
@Index(['createdAt'])
@Index(['status'])
export class Issue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'github_id' })
  @Index()
  githubId: string;

  @Column({ name: 'repo_id' })
  @Index()
  repoId: string;

  @ManyToOne(() => Repository, (repo) => repo.issues)
  @JoinColumn({ name: 'repo_id' })
  repo: Repository;

  @Column({ name: 'user_id' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  @Index()
  number: number;

  @Column({ nullable: true })
  title: string;

  @Column({ default: 'open' })
  @Index()
  status: string; // 'open', 'closed'

  @CreateDateColumn({ name: 'created_at' })
  @Index()
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
