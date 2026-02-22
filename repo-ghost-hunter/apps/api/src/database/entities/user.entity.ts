import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Repository } from './repository.entity';

@Entity('users')
@Index(['githubId'], { unique: true })
@Index(['email'])
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'github_id', unique: true })
  @Index()
  githubId: string;

  @Column()
  @Index()
  email: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true, type: 'varchar', length: 500 })
  avatar: string;

  @Column({ name: 'access_token', type: 'text' })
  accessToken: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  @OneToMany(() => Repository, (repo) => repo.user)
  repositories: Repository[];
}
