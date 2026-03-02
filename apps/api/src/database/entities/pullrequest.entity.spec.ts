import { PullRequest } from './pullrequest.entity';

describe('PullRequest Entity', () => {
  it('should create a pull request instance', () => {
    const pr = new PullRequest();
    expect(pr).toBeDefined();
  });

  it('should have all required fields', () => {
    const pr = new PullRequest();
    pr.id = '123e4567-e89b-12d3-a456-426614174000';
    pr.repoId = 'repo-uuid-123';
    pr.number = 42;
    pr.createdAt = new Date('2024-01-15');
    pr.status = 'open';

    expect(pr.id).toBeDefined();
    expect(pr.repoId).toBe('repo-uuid-123');
    expect(pr.number).toBe(42);
    expect(pr.createdAt).toBeInstanceOf(Date);
    expect(pr.status).toBe('open');
  });

  it('should have default status value', () => {
    const pr = new PullRequest();
    expect(pr.status).toBe('open');
  });

  it('should accept valid status values', () => {
    const pr = new PullRequest();
    pr.status = 'open';
    expect(pr.status).toBe('open');
    
    pr.status = 'closed';
    expect(pr.status).toBe('closed');
    
    pr.status = 'merged';
    expect(pr.status).toBe('merged');
  });
});
