# Reddit OAuth Authentication Demo

This project demonstrates how to authenticate with Reddit using OAuth 2.0 to access user account information and posts.

## Features

- ✅ Reddit OAuth 2.0 authentication flow
- ✅ Access token management with refresh capability
- ✅ User profile information retrieval
- ✅ User posts retrieval
- ✅ Simple web interface for testing
- ✅ Automatic token refresh on expiration

## Prerequisites

1. **Reddit App Registration**: You need to create a Reddit app at https://www.reddit.com/prefs/apps
2. **Node.js**: Version 14 or higher
3. **npm**: For package management

## Setup Instructions

### 1. Create a Reddit App

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Fill in the details:
   - **Name**: Your app name (e.g., "ReddiPost")
   - **App type**: Select "web app"
   - **Description**: Brief description of your app
   - **About URL**: Your app's homepage (optional)
   - **Redirect URI**: `http://localhost:3000/auth/callback`
4. Click "Create app"
5. Note down your **Client ID** (the string under your app name) and **Client Secret**

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the project root:

```bash
cp env.example .env
```

Edit the `.env` file with your Reddit app credentials:

```env
# Reddit OAuth Credentials
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_client_secret_here
REDDIT_REDIRECT_URI=http://localhost:3000/auth/callback

# Server Configuration
PORT=3000
```

### 4. Start the Server

```bash
npm start
```

Or for development with auto-restart:

```bash
npm run dev
```

The server will start on `http://localhost:3000`

## How It Works

### OAuth Flow

1. **Authorization Request**: User clicks "Login with Reddit" → redirects to Reddit's authorization page
2. **User Authorization**: User grants permissions to your app on Reddit
3. **Callback**: Reddit redirects back to your app with an authorization code
4. **Token Exchange**: Your app exchanges the authorization code for access and refresh tokens
5. **API Access**: Your app can now make authenticated requests to Reddit's API

### API Endpoints

- `GET /auth/login` - Generate Reddit authorization URL
- `GET /auth/callback` - Handle Reddit OAuth callback
- `GET /api/user` - Get authenticated user's profile information
- `GET /api/user/posts` - Get user's recent posts
- `POST /auth/logout` - Clear stored tokens
- `GET /health` - Check authentication status

### Available Scopes

The current implementation uses these scopes:
- `identity` - Access to user's identity information
- `read` - Read access to user's posts and comments

You can add more scopes as needed:
- `submit` - Submit posts and comments
- `edit` - Edit posts and comments
- `modposts` - Moderate posts and comments
- `modflair` - Manage user flair
- `modlog` - Access moderation logs
- `modwiki` - Edit wiki pages
- `modconfig` - Manage subreddit settings
- `modmail` - Access modmail
- `modcontributors` - Manage contributors
- `modtraffic` - View traffic stats
- `modusertalk` - Manage user talk pages
- `modselfmail` - Send modmail
- `modselflog` - Access self moderation logs
- `modselfconfig` - Manage self subreddit settings
- `modselfwiki` - Edit self wiki pages
- `modselfmail` - Send self modmail
- `modselflog` - Access self moderation logs
- `modselfconfig` - Manage self subreddit settings
- `modselfwiki` - Edit self wiki pages

## Usage

1. Open your browser and go to `http://localhost:3000`
2. Click "Login with Reddit"
3. Authorize your app on Reddit's website
4. You'll be redirected back to your app
5. Use the buttons to:
   - Get your user information
   - View your recent posts
   - Logout

## Security Considerations

⚠️ **Important**: This is a demo application. For production use:

1. **Store tokens securely**: Use a database or secure session storage instead of in-memory storage
2. **Use HTTPS**: Always use HTTPS in production
3. **Validate state parameter**: Implement proper state validation to prevent CSRF attacks
4. **Rate limiting**: Implement rate limiting for API endpoints
5. **Error handling**: Add comprehensive error handling
6. **Logging**: Add proper logging for debugging and monitoring

## Troubleshooting

### Common Issues

1. **"Invalid client" error**
   - Check that your `REDDIT_CLIENT_ID` and `REDDIT_CLIENT_SECRET` are correct
   - Ensure your app is properly registered on Reddit

2. **"Invalid redirect URI" error**
   - Verify that the redirect URI in your Reddit app settings matches `http://localhost:3000/auth/callback`
   - Check that the `REDDIT_REDIRECT_URI` in your `.env` file matches

3. **"Access denied" error**
   - Make sure your Reddit app is set to "web app" type
   - Check that you're using the correct client credentials

4. **CORS errors**
   - The server includes CORS middleware, but ensure your frontend is making requests to the correct URL

### Debug Mode

To see detailed error messages, check the server console output. The application logs all API requests and responses for debugging purposes.

## API Reference

### Reddit API Endpoints Used

- `GET /api/v1/me` - Get current user information
- `GET /user/me/submitted` - Get user's submitted posts
- `POST /api/v1/access_token` - Exchange authorization code for tokens
- `POST /api/v1/access_token` (refresh) - Refresh access token

### Response Examples

**User Information Response:**
```json
{
  "name": "username",
  "id": "t2_abc123",
  "created_utc": 1234567890,
  "link_karma": 1000,
  "comment_karma": 500,
  "is_gold": false,
  "is_mod": false
}
```

**Posts Response:**
```json
{
  "data": {
    "children": [
      {
        "data": {
          "title": "Post Title",
          "subreddit": "subreddit_name",
          "score": 42,
          "permalink": "/r/subreddit/comments/abc123/post_title/",
          "created_utc": 1234567890
        }
      }
    ]
  }
}
```

## Contributing

Feel free to submit issues and enhancement requests!

## License

MIT License - see LICENSE file for details. 