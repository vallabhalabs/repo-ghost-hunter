# GitHub OAuth Flow - Quick Reference

## Endpoint: `GET /api/auth/github`

This endpoint initiates the GitHub OAuth authentication flow.

### How It Works

1. **User visits**: `GET /api/auth/github`
2. **Server redirects** to GitHub authorization page
3. **User authorizes** the application on GitHub
4. **GitHub redirects** back to `/api/auth/github/callback`
5. **Server processes** callback and creates JWT token
6. **User redirected** to dashboard with authentication cookie

### Usage

#### From Frontend (Browser)

```typescript
// Simple redirect
window.location.href = 'http://localhost:3001/api/auth/github';

// Or with state parameter for CSRF protection
const state = generateRandomString();
window.location.href = `http://localhost:3001/api/auth/github?state=${state}`;
```

#### From Frontend (React/Next.js)

```tsx
import Link from 'next/link';

function LoginButton() {
  return (
    <Link href="http://localhost:3001/api/auth/github">
      Sign in with GitHub
    </Link>
  );
}

// Or with button
function LoginButton() {
  const handleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/github';
  };

  return (
    <button onClick={handleLogin}>
      Sign in with GitHub
    </button>
  );
}
```

#### From Backend (Server-side redirect)

```typescript
// Express/NestJS
res.redirect('/api/auth/github');

// Or with state
const state = crypto.randomBytes(32).toString('hex');
res.redirect(`/api/auth/github?state=${state}`);
```

### Query Parameters

- **state** (optional): CSRF protection token. Will be passed through to callback.

### Response

The endpoint does not return JSON. Instead, it:
- **Redirects** (HTTP 302) to GitHub's authorization page
- GitHub URL format: `https://github.com/login/oauth/authorize?client_id=...&redirect_uri=...&scope=...`

### Example Flow

```
1. User clicks "Sign in with GitHub"
   ↓
2. Browser navigates to: GET http://localhost:3001/api/auth/github
   ↓
3. Server responds with 302 redirect to:
   https://github.com/login/oauth/authorize?
     client_id=YOUR_CLIENT_ID&
     redirect_uri=http://localhost:3001/api/auth/github/callback&
     scope=user:email%20repo&
     state=optional_state
   ↓
4. User sees GitHub authorization page
   ↓
5. User clicks "Authorize"
   ↓
6. GitHub redirects to:
   GET http://localhost:3001/api/auth/github/callback?code=AUTHORIZATION_CODE&state=optional_state
   ↓
7. Server exchanges code for access token
   ↓
8. Server creates/updates user in database
   ↓
9. Server generates JWT token
   ↓
10. Server sets HTTP-only cookie and redirects to dashboard
```

### Configuration

Ensure these environment variables are set:

```env
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_CALLBACK_URL=http://localhost:3001/api/auth/github/callback
FRONTEND_URL=http://localhost:3000
```

### Testing

1. **Start the server**: `npm run dev`
2. **Visit**: `http://localhost:3001/api/auth/github`
3. **You should be redirected** to GitHub authorization page
4. **After authorization**, you'll be redirected back to your dashboard

### Troubleshooting

**Issue**: Not redirecting to GitHub
- Check `GITHUB_CLIENT_ID` is set correctly
- Verify GitHub OAuth app is configured
- Check server logs for errors

**Issue**: "Invalid redirect_uri"
- Ensure callback URL in GitHub OAuth app matches exactly
- Check `GITHUB_CALLBACK_URL` environment variable
- URL must match exactly (including http/https, port, path)

**Issue**: "Invalid client"
- Verify `GITHUB_CLIENT_ID` and `GITHUB_CLIENT_SECRET` are correct
- Check GitHub OAuth app is active

### Security Notes

- The endpoint uses Passport.js GitHub strategy
- OAuth flow follows OAuth 2.0 best practices
- State parameter can be used for CSRF protection
- Access tokens are stored securely in database
- JWT tokens are signed and have expiration
