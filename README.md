# ReddiPost - Reddit Post Generator

A Next.js application that helps users discover relevant subreddits and generate posts that match community guidelines.

## Features

- ✅ Reddit OAuth 2.0 authentication
- ✅ Subreddit discovery and saving
- ✅ AI-powered post generation with GPT
- ✅ Draft management
- ✅ Post tracking and history
- ✅ Billing integration with Flowglad

## Tech Stack

- **Framework**: Next.js 15 with App Router
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Custom Reddit OAuth
- **AI**: OpenAI GPT API
- **Billing**: Flowglad
- **Styling**: Tailwind CSS + shadcn/ui

## Prerequisites

1. **Reddit App Registration**: You need to create a Reddit app at https://www.reddit.com/prefs/apps
2. **Node.js**: Version 18 or higher
3. **npm**: For package management
4. **Supabase Account**: For database
5. **OpenAI API Key**: For post generation
6. **Flowglad Account**: For billing integration

## Deployment on Vercel

### Quick Deploy

1. **Fork or clone this repository** to your GitHub account

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com)
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Environment Variables** in Vercel dashboard:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   REDDIT_CLIENT_ID=your_reddit_client_id
   REDDIT_CLIENT_SECRET=your_reddit_client_secret
   REDDIT_REDIRECT_URI=https://your-app.vercel.app/auth/callback
   SESSION_SECRET=generate_a_random_32_char_string
   OPENAI_API_KEY=your_openai_api_key
   FLOWGLAD_SECRET_KEY=your_flowglad_secret_key
   ```

4. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete
   - Your app will be live at `https://your-app.vercel.app`

### Post-Deployment Steps

1. **Update Reddit App**:
   - Go to your Reddit app settings
   - Update the redirect URI to `https://your-app.vercel.app/auth/callback`

2. **Configure Supabase**:
   - Ensure your Supabase project URL is accessible
   - Check that RLS policies are properly configured

3. **Test the deployment**:
   - Visit your deployed URL
   - Try logging in with Reddit
   - Test all features

## Local Development Setup

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
npm install --legacy-peer-deps
```

Note: We use `--legacy-peer-deps` due to peer dependency conflicts with some packages.

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Reddit OAuth
REDDIT_CLIENT_ID=your_reddit_client_id
REDDIT_CLIENT_SECRET=your_reddit_client_secret
REDDIT_REDIRECT_URI=http://localhost:3000/auth/callback

# Session
SESSION_SECRET=your_session_secret_32_chars

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# Flowglad
FLOWGLAD_SECRET_KEY=your_flowglad_secret_key
```

### 4. Set up Supabase Database

Run the following SQL in your Supabase SQL editor:

```sql
-- Create saved_subreddits table
CREATE TABLE saved_subreddits (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  subreddit_name TEXT NOT NULL,
  subreddit_display_name TEXT NOT NULL,
  subreddit_icon_url TEXT,
  subreddit_description TEXT,
  subscriber_count INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subreddit_name)
);

-- Create posts table
CREATE TABLE posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id TEXT NOT NULL,
  reddit_post_id TEXT,
  reddit_post_url TEXT,
  title TEXT NOT NULL,
  body TEXT NOT NULL,
  tldr TEXT,
  subreddit_name TEXT NOT NULL,
  subreddit_display_name TEXT NOT NULL,
  tone TEXT,
  status TEXT NOT NULL CHECK (status IN ('draft', 'published', 'scheduled')),
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  submitted_at TIMESTAMP WITH TIME ZONE,
  scheduled_for TIMESTAMP WITH TIME ZONE
);

-- Enable RLS
ALTER TABLE saved_subreddits ENABLE ROW LEVEL SECURITY;
ALTER TABLE posts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can manage their own saved subreddits" ON saved_subreddits
  FOR ALL USING (true);

CREATE POLICY "Users can manage their own posts" ON posts
  FOR ALL USING (true);
```

### 5. Start the Development Server

```bash
npm run dev
```

The app will start on `http://localhost:3000`

## Project Structure

```
/
├── app/                    # Next.js App Router
│   ├── api/               # API routes
│   │   ├── auth/          # Reddit OAuth endpoints
│   │   ├── generate-post/ # GPT post generation
│   │   ├── posts/         # Post management
│   │   └── subreddits/    # Subreddit management
│   ├── dashboard/         # Main app pages
│   │   ├── create/        # Post creation
│   │   ├── discover/      # Subreddit discovery
│   │   ├── drafts/        # Draft management
│   │   └── settings/      # User settings & billing
│   └── layout.tsx         # Root layout
├── components/            # React components
├── lib/                   # Utility functions
│   ├── auth.ts           # Reddit auth helpers
│   ├── reddit-api.ts     # Reddit API client
│   ├── supabase.ts       # Supabase client
│   ├── openai.ts         # OpenAI integration
│   └── flowglad.ts       # Billing integration
└── vercel.json           # Vercel configuration
```

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