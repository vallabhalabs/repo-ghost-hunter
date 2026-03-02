import { User } from './user.entity';

describe('User Entity', () => {
  it('should create a user instance', () => {
    const user = new User();
    expect(user).toBeDefined();
  });

  it('should have all required fields', () => {
    const user = new User();
    user.id = '123e4567-e89b-12d3-a456-426614174000';
    user.githubId = '12345678';
    user.email = 'test@example.com';
    user.name = 'Test User';
    user.avatar = 'https://example.com/avatar.jpg';
    user.accessToken = 'ghp_test_token';

    expect(user.id).toBeDefined();
    expect(user.githubId).toBe('12345678');
    expect(user.email).toBe('test@example.com');
    expect(user.name).toBe('Test User');
    expect(user.avatar).toBe('https://example.com/avatar.jpg');
    expect(user.accessToken).toBe('ghp_test_token');
  });
});
