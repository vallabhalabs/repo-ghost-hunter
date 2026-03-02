import { Repository } from './repository.entity';

describe('Repository Entity', () => {
  it('should create a repository instance', () => {
    const repo = new Repository();
    expect(repo).toBeDefined();
  });

  it('should have all required fields', () => {
    const repo = new Repository();
    repo.id = '123e4567-e89b-12d3-a456-426614174000';
    repo.name = 'my-repo';
    repo.owner = 'username';
    repo.lastCommit = new Date('2024-01-15');
    repo.healthScore = 85;
    repo.openPrCount = 3;
    repo.openIssueCount = 7;

    expect(repo.id).toBeDefined();
    expect(repo.name).toBe('my-repo');
    expect(repo.owner).toBe('username');
    expect(repo.lastCommit).toBeInstanceOf(Date);
    expect(repo.healthScore).toBe(85);
    expect(repo.openPrCount).toBe(3);
    expect(repo.openIssueCount).toBe(7);
  });

  it('should have default values', () => {
    const repo = new Repository();
    expect(repo.healthScore).toBe(0);
    expect(repo.openPrCount).toBe(0);
    expect(repo.openIssueCount).toBe(0);
    expect(repo.private).toBe(false);
  });
});
