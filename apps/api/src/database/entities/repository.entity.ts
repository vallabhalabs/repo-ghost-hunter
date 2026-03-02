import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { PullRequest } from './pullrequest.entity';
import { Issue } from './issue.entity';

@Entity('repositories')
@Index(['userId'])
@Index(['owner', 'name'])
@Index(['healthScore'])
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'github_id' })
  @Index()
  githubId: string;

  @Column({ name: 'user_id' })
  @Index()
  userId: string;

  @ManyToOne(() => User, (user) => user.repositories)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column()
  name: string;

  @Column()
  @Index()
  owner: string;

  @Column({ name: 'full_name' })
  fullName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ default: false })
  private: boolean;

  @Column({ name: 'last_commit', type: 'timestamp', nullable: true })
  @Index()
  lastCommit: Date;

  @Column({ name: 'health_score', type: 'int', default: 0 })
  @Index()
  healthScore: number;

  @Column({ name: 'open_pr_count', type: 'int', default: 0 })
  openPrCount: number;

  @Column({ name: 'open_issue_count', type: 'int', default: 0 })
  openIssueCount: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => PullRequest, (pr) => pr.repo)
  pullRequests: PullRequest[];

  @OneToMany(() => Issue, (issue) => issue.repo)
  issues: Issue[];
}
