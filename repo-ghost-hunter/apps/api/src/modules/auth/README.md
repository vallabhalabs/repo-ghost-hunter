# Authentication Module

GitHub OAuth authentication implementation using Passport.js and JWT tokens.

## Overview

This module implements GitHub OAuth 2.0 authentication flow:
1. User clicks "Sign in with GitHub"
2. Redirected to GitHub authorization page
3. User authorizes the application
4. GitHub redirects back with authorization code
5. Server exchanges code for access token
6. Server creates/updates user and generates JWT
7. User is redirected to dashboard with authentication cookie

## Setup

### 1. Create GitHub OAuth App

1. Go to [GitHub Developer Settings](https://github.com/settings/developers)
2. Click "New OAuth App"
3. Fill in:
   - **Application name**: Repo Ghost Hunter
   - **Homepage URL**: `http://localhost:3000` (or your frontend URL)
   - **Authorization callback URL**: `http://localhost:3001/api/auth/github/callback`
4. Copy **Client ID** and **Client Secret**

### 2. Configure Environment Variables

Add to `.env`:

```env
GITHUB_CLIENT_ID=your_client_id
GITHUB_CLIENT_SECRET=your_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
JWT_SECRET=your_jwt_secret_minimum_32_characters
FRONTEND_URL=http://localhost:3000
```

## API Endpoints

### `GET /api/auth/github`
Initiates GitHub OAuth flow. Redirects user to GitHub authorization page.

**Response**: Redirects to GitHub

### `GET /api/auth/github/callback`
GitHub OAuth callback endpoint. Handles the callback after user authorization.

**Response**: Redirects to `/dashboard` with authentication cookie set

### `GET /api/auth/me`
Get current authenticated user profile.

**Headers**: 
- `Authorization: Bearer <token>` OR
- Cookie: `access_token=<token>`

**Response**:
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "User Name",
  "avatar": "https://avatars.githubusercontent.com/...",
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

### `GET /api/auth/status`
Check authentication status.

**Headers**: Same as `/me`

**Response**:
```json
{
  "authenticated": true,
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### `POST /api/auth/logout`
Logout and clear authentication cookie.

**Headers**: Same as `/me`

**Response**:
```json
{
  "message": "Logged out successfully"
}
```

## Usage in Frontend

### Initiate Login

```typescript
// Redirect user to GitHub OAuth
window.location.href = 'http://localhost:3001/api/auth/github';
```

### Check Authentication

```typescript
// Using fetch with cookie
const response = await fetch('http://localhost:3001/api/auth/me', {
  credentials: 'include',
});

if (response.ok) {
  const user = await response.json();
  console.log('Authenticated user:', user);
} else {
  console.log('Not authenticated');
}
```

### Using Axios

```typescript
import axios from 'axios';

// Configure axios to send cookies
axios.defaults.withCredentials = true;

// Get current user
const getUser = async () => {
  try {
    const response = await axios.get('http://localhost:3001/api/auth/me');
    return response.data;
  } catch (error) {
    console.error('Not authenticated');
    return null;
  }
};
```

### Logout

```typescript
await fetch('http://localhost:3001/api/auth/logout', {
  method: 'POST',
  credentials: 'include',
});
```

## Protecting Routes

### Using JWT Guard

```typescript
import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { User } from '../database/entities/user.entity';

@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtectedData(@CurrentUser() user: User) {
    return { message: 'This is protected', user };
  }
}
```

### Making Routes Public

```typescript
import { Public } from '../auth/decorators/public.decorator';

@Controller('public')
export class PublicController {
  @Get()
  @Public()
  getPublicData() {
    return { message: 'This is public' };
  }
}
```

## Flow Diagram

```
User → Frontend → GET /api/auth/github
                    ↓
              GitHub OAuth Page
                    ↓
              User Authorizes
                    ↓
         GET /api/auth/github/callback
                    ↓
         Create/Update User in DB
                    ↓
         Generate JWT Token
                    ↓
         Set Cookie & Redirect
                    ↓
         Frontend Dashboard
```

## Security Features

- **HTTP-only cookies**: Prevents XSS attacks
- **Secure cookies in production**: HTTPS only
- **JWT tokens**: Stateless authentication
- **Token expiration**: 7 days default
- **User validation**: Validates user exists on each request

## Error Handling

- Invalid GitHub callback → Redirects to `/login?error=authentication_failed`
- Missing user data → Returns 400 Bad Request
- Database errors → Logged and handled gracefully
- Invalid JWT → Returns 401 Unauthorized

## Testing

### Manual Testing

1. Start the API server: `npm run dev`
2. Visit: `http://localhost:3001/api/auth/github`
3. Authorize on GitHub
4. Should redirect to dashboard with cookie set
5. Test `/api/auth/me` endpoint

### Unit Tests

```bash
npm test -- auth.service.spec.ts
npm test -- github.strategy.spec.ts
```

## Troubleshooting

### "Invalid GitHub user data"
- Check GitHub OAuth app configuration
- Verify callback URL matches exactly
- Check environment variables

### "User not found" after login
- Check database connection
- Verify User entity is properly configured
- Check database migrations

### Cookie not being set
- Verify `FRONTEND_URL` matches frontend domain
- Check CORS configuration
- Ensure `credentials: 'include'` in frontend requests
