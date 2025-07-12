const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Reddit OAuth Configuration
const REDDIT_CLIENT_ID = process.env.REDDIT_CLIENT_ID;
const REDDIT_CLIENT_SECRET = process.env.REDDIT_CLIENT_SECRET;
const REDIRECT_URI = process.env.REDDIT_REDIRECT_URI || 'http://localhost:3000/auth/callback';

// Store tokens in memory (in production, use a database)
let accessToken = null;
let refreshToken = null;

// Store state for CSRF protection
let currentState = null;

// Step 1: Generate authorization URL
app.get('/auth/login', (req, res) => {
  const state = Math.random().toString(36).substring(7);
  currentState = state; // Store for validation
  const scope = 'identity read submit edit'; // Add more scopes as needed

  const authUrl = `https://www.reddit.com/api/v1/authorize?` +
    `client_id=${REDDIT_CLIENT_ID}&` +
    `response_type=code&` +
    `state=${state}&` +
    `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
    `duration=permanent&` +
    `scope=${encodeURIComponent(scope)}`;

  res.json({ authUrl });
});

// Step 2: Handle the callback from Reddit
app.get('/auth/callback', async (req, res) => {
  const { code, state, error } = req.query;

  if (error) {
    return res.status(400).json({ error: 'Authorization failed', details: error });
  }

  if (!code) {
    return res.status(400).json({ error: 'No authorization code received' });
  }

  // Validate state parameter to prevent CSRF attacks
  if (state !== currentState) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  try {
    // Exchange authorization code for access token
    const tokenData = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: REDIRECT_URI
    });

    const tokenResponse = await axios.post('https://www.reddit.com/api/v1/access_token',
      tokenData.toString(),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
        }
      }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    accessToken = access_token;
    refreshToken = refresh_token;

    res.json({
      success: true,
      message: 'Authentication successful',
      expires_in
    });

  } catch (error) {
    console.error('Token exchange error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to exchange authorization code for token',
      details: error.response?.data || error.message
    });
  }
});

// Step 3: Get user information
app.get('/api/user', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
  }

  try {
    const userResponse = await axios.get('https://oauth.reddit.com/api/v1/me', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
      }
    });

    res.json(userResponse.data);

  } catch (error) {
    console.error('User info error:', error.response?.data || error.message);

    // If token is expired, try to refresh
    if (error.response?.status === 401 && refreshToken) {
      try {
        await refreshAccessToken();
        // Retry the request
        const userResponse = await axios.get('https://oauth.reddit.com/api/v1/me', {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
          }
        });
        return res.json(userResponse.data);
      } catch (refreshError) {
        return res.status(401).json({ error: 'Token refresh failed. Please re-authenticate.' });
      }
    }

    res.status(500).json({
      error: 'Failed to get user information',
      details: error.response?.data || error.message
    });
  }
});

// Refresh access token
async function refreshAccessToken() {
  try {
    const refreshData = new URLSearchParams({
      grant_type: 'refresh_token',
      refresh_token: refreshToken
    });

    const response = await axios.post('https://www.reddit.com/api/v1/access_token',
      refreshData.toString(),
      {
        headers: {
          'Authorization': `Basic ${Buffer.from(`${REDDIT_CLIENT_ID}:${REDDIT_CLIENT_SECRET}`).toString('base64')}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
        }
      }
    );

    accessToken = response.data.access_token;
    if (response.data.refresh_token) {
      refreshToken = response.data.refresh_token;
    }

    console.log('Access token refreshed successfully');

  } catch (error) {
    console.error('Token refresh failed:', error.response?.data || error.message);
    throw error;
  }
}

// Example: Get user's posts
app.get('/api/user/posts', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
  }

  try {
    const postsResponse = await axios.get('https://oauth.reddit.com/user/me/submitted', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
      },
      params: {
        limit: 10
      }
    });

    res.json(postsResponse.data);

  } catch (error) {
    console.error('Posts fetch error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to fetch user posts',
      details: error.response?.data || error.message
    });
  }
});

// Submit a post
app.post('/api/submit', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
  }

  const { subreddit, title, content, kind = 'self' } = req.body;

  if (!subreddit || !title) {
    return res.status(400).json({ error: 'Subreddit and title are required' });
  }

  try {
    const submitData = new URLSearchParams({
      sr: subreddit,
      title: title,
      kind: kind, // 'self' for text posts, 'link' for URL posts
      api_type: 'json'
    });

    // Add content based on post type
    if (kind === 'self') {
      submitData.append('text', content || '');
    } else if (kind === 'link') {
      submitData.append('url', content || '');
    }

    const submitResponse = await axios.post('https://oauth.reddit.com/api/submit',
      submitData.toString(),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (submitResponse.data.json && submitResponse.data.json.errors.length > 0) {
      return res.status(400).json({
        error: 'Failed to submit post',
        details: submitResponse.data.json.errors
      });
    }

    res.json({
      success: true,
      message: 'Post submitted successfully',
      data: submitResponse.data
    });

  } catch (error) {
    console.error('Submit error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to submit post',
      details: error.response?.data || error.message
    });
  }
});

// Submit a comment
app.post('/api/comment', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
  }

  const { parent, text } = req.body;

  if (!parent || !text) {
    return res.status(400).json({ error: 'Parent (post/comment ID) and text are required' });
  }

  try {
    const commentData = new URLSearchParams({
      parent: parent,
      text: text,
      api_type: 'json'
    });

    const commentResponse = await axios.post('https://oauth.reddit.com/api/comment',
      commentData.toString(),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    if (commentResponse.data.json && commentResponse.data.json.errors.length > 0) {
      return res.status(400).json({
        error: 'Failed to submit comment',
        details: commentResponse.data.json.errors
      });
    }

    res.json({
      success: true,
      message: 'Comment submitted successfully',
      data: commentResponse.data
    });

  } catch (error) {
    console.error('Comment error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to submit comment',
      details: error.response?.data || error.message
    });
  }
});

// Vote on a post or comment
app.post('/api/vote', async (req, res) => {
  if (!accessToken) {
    return res.status(401).json({ error: 'No access token available. Please authenticate first.' });
  }

  const { id, dir } = req.body; // dir: 1 for upvote, -1 for downvote, 0 for remove vote

  if (!id || dir === undefined) {
    return res.status(400).json({ error: 'ID and direction are required' });
  }

  try {
    const voteData = new URLSearchParams({
      id: id,
      dir: dir,
      api_type: 'json'
    });

    const voteResponse = await axios.post('https://oauth.reddit.com/api/vote',
      voteData.toString(),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)',
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );

    res.json({
      success: true,
      message: 'Vote submitted successfully',
      data: voteResponse.data
    });

  } catch (error) {
    console.error('Vote error:', error.response?.data || error.message);
    res.status(500).json({
      error: 'Failed to submit vote',
      details: error.response?.data || error.message
    });
  }
});

// Logout endpoint
app.post('/auth/logout', (req, res) => {
  accessToken = null;
  refreshToken = null;
  res.json({ message: 'Logged out successfully' });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    authenticated: !!accessToken,
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
  console.log('Make sure to set up your .env file with REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET');
}); 