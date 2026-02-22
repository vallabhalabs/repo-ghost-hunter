import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { User } from './user.entity';
import { PullRequest } from './pullrequest.entity';
import { Issue } from './issue.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  githubId: string;

  @Column()
  userId: string;

  @ManyToOne(() => User, (user) => user.repositories)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column()
  name: string;

  @Column()
  owner: string;

  @Column()
  fullName: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  url: string;

  @Column({ default: false })
  private: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastCommit: Date;

  @Column({ type: 'int', default: 0 })
  healthScore: number;

  @Column({ type: 'int', default: 0 })
  openPrCount: number;

  @Column({ type: 'int', default: 0 })
  openIssueCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => PullRequest, (pr) => pr.repo)
  pullRequests: PullRequest[];

  @OneToMany(() => Issue, (issue) => issue.repo)
  issues: Issue[];
}
