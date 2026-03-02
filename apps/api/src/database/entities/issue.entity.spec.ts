import { Issue } from './issue.entity';

describe('Issue Entity', () => {
  it('should create an issue instance', () => {
    const issue = new Issue();
    expect(issue).toBeDefined();
  });

  it('should have all required fields', () => {
    const issue = new Issue();
    issue.id = '123e4567-e89b-12d3-a456-426614174000';
    issue.repoId = 'repo-uuid-123';
    issue.number = 42;
    issue.createdAt = new Date('2024-01-15');
    issue.status = 'open';

    expect(issue.id).toBeDefined();
    expect(issue.repoId).toBe('repo-uuid-123');
    expect(issue.number).toBe(42);
    expect(issue.createdAt).toBeInstanceOf(Date);
    expect(issue.status).toBe('open');
  });

  it('should have default status value', () => {
    const issue = new Issue();
    expect(issue.status).toBe('open');
  });

  it('should accept valid status values', () => {
    const issue = new Issue();
    issue.status = 'open';
    expect(issue.status).toBe('open');
    
    issue.status = 'closed';
    expect(issue.status).toBe('closed');
  });
});
