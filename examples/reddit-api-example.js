const axios = require('axios');

// Example: How to use Reddit API with obtained tokens
class RedditAPI {
  constructor(clientId, clientSecret, accessToken = null, refreshToken = null) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
    this.baseURL = 'https://oauth.reddit.com';
  }

  // Set tokens after OAuth flow
  setTokens(accessToken, refreshToken) {
    this.accessToken = accessToken;
    this.refreshToken = refreshToken;
  }

  // Get headers for authenticated requests
  getHeaders() {
    return {
      'Authorization': `Bearer ${this.accessToken}`,
      'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)',
      'Content-Type': 'application/json'
    };
  }

  // Refresh access token
  async refreshAccessToken() {
    try {
      const response = await axios.post('https://www.reddit.com/api/v1/access_token',
        `grant_type=refresh_token&refresh_token=${this.refreshToken}`,
        {
          headers: {
            'Authorization': `Basic ${Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'ReddiPost/1.0.0 (by /u/your_username)'
          }
        }
      );

      this.accessToken = response.data.access_token;
      if (response.data.refresh_token) {
        this.refreshToken = response.data.refresh_token;
      }

      return true;
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      return false;
    }
  }

  // Make authenticated request with automatic token refresh
  async makeRequest(method, endpoint, data = null) {
    try {
      const config = {
        method,
        url: `${this.baseURL}${endpoint}`,
        headers: this.getHeaders()
      };

      // Handle form data for POST requests
      if (method === 'POST' && data) {
        config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
        config.data = data;
      } else if (data) {
        config.data = data;
      }

      const response = await axios(config);
      return response.data;
    } catch (error) {
      if (error.response?.status === 401 && this.refreshToken) {
        // Token expired, try to refresh
        const refreshed = await this.refreshAccessToken();
        if (refreshed) {
          // Retry the request with new token
          const config = {
            method,
            url: `${this.baseURL}${endpoint}`,
            headers: this.getHeaders()
          };

          if (method === 'POST' && data) {
            config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
            config.data = data;
          } else if (data) {
            config.data = data;
          }

          const response = await axios(config);
          return response.data;
        }
      }
      throw error;
    }
  }

  // Get current user information
  async getCurrentUser() {
    return await this.makeRequest('GET', '/api/v1/me');
  }

  // Get user's posts
  async getUserPosts(limit = 10) {
    return await this.makeRequest('GET', `/user/me/submitted?limit=${limit}`);
  }

  // Get user's comments
  async getUserComments(limit = 10) {
    return await this.makeRequest('GET', `/user/me/comments?limit=${limit}`);
  }

  // Get user's saved posts
  async getUserSaved(limit = 10) {
    return await this.makeRequest('GET', `/user/me/saved?limit=${limit}`);
  }

  // Get user's upvoted posts
  async getUserUpvoted(limit = 10) {
    return await this.makeRequest('GET', `/user/me/upvoted?limit=${limit}`);
  }

  // Get user's downvoted posts
  async getUserDownvoted(limit = 10) {
    return await this.makeRequest('GET', `/user/me/downvoted?limit=${limit}`);
  }

  // Get user's hidden posts
  async getUserHidden(limit = 10) {
    return await this.makeRequest('GET', `/user/me/hidden?limit=${limit}`);
  }

  // Get user's gilded posts
  async getUserGilded(limit = 10) {
    return await this.makeRequest('GET', `/user/me/gilded?limit=${limit}`);
  }

  // Get user's trophies
  async getUserTrophies() {
    return await this.makeRequest('GET', '/api/v1/user/username/trophies');
  }

  // Get user's karma breakdown
  async getUserKarma() {
    return await this.makeRequest('GET', '/api/v1/user/username/karma');
  }

  // Get user's preferences
  async getUserPreferences() {
    return await this.makeRequest('GET', '/api/v1/me/prefs');
  }

  // Get user's friends
  async getUserFriends() {
    return await this.makeRequest('GET', '/api/v1/me/friends');
  }

  // Get user's blocked users
  async getUserBlocked() {
    return await this.makeRequest('GET', '/api/v1/me/blocked');
  }

  // Get user's trusted users
  async getUserTrusted() {
    return await this.makeRequest('GET', '/api/v1/me/trusted');
  }

  // Get user's private messages
  async getPrivateMessages(limit = 10) {
    return await this.makeRequest('GET', `/message/inbox?limit=${limit}`);
  }

  // Get user's sent messages
  async getSentMessages(limit = 10) {
    return await this.makeRequest('GET', `/message/sent?limit=${limit}`);
  }

  // Get user's unread messages
  async getUnreadMessages(limit = 10) {
    return await this.makeRequest('GET', `/message/unread?limit=${limit}`);
  }

  // Get user's modmail
  async getModmail(limit = 10) {
    return await this.makeRequest('GET', `/message/moderator?limit=${limit}`);
  }

  // Get user's mentions
  async getMentions(limit = 10) {
    return await this.makeRequest('GET', `/message/mentions?limit=${limit}`);
  }

  // Get user's comments (with context)
  async getCommentContext(commentId) {
    return await this.makeRequest('GET', `/api/v1/comment/${commentId}`);
  }

  // Get user's post context
  async getPostContext(postId) {
    return await this.makeRequest('GET', `/api/v1/post/${postId}`);
  }

  // Get user's subreddits
  async getUserSubreddits(limit = 10) {
    return await this.makeRequest('GET', `/user/me/subreddits?limit=${limit}`);
  }

  // Get user's moderated subreddits
  async getUserModeratedSubreddits(limit = 10) {
    return await this.makeRequest('GET', `/user/me/moderated?limit=${limit}`);
  }

  // Get user's subscribed subreddits
  async getUserSubscribedSubreddits(limit = 10) {
    return await this.makeRequest('GET', `/subreddits/mine/subscriber?limit=${limit}`);
  }

  // Get user's contributed subreddits
  async getUserContributedSubreddits(limit = 10) {
    return await this.makeRequest('GET', `/subreddits/mine/contributor?limit=${limit}`);
  }

  // Submit a post
  async submitPost(subreddit, title, content, kind = 'self') {
    const data = new URLSearchParams({
      sr: subreddit,
      title: title,
      kind: kind,
      api_type: 'json'
    });

    // Add content based on post type
    if (kind === 'self') {
      data.append('text', content || '');
    } else if (kind === 'link') {
      data.append('url', content || '');
    }

    return await this.makeRequest('POST', '/api/submit', data.toString());
  }

  // Submit a comment
  async submitComment(parentId, text) {
    const data = new URLSearchParams({
      parent: parentId,
      text: text,
      api_type: 'json'
    });

    return await this.makeRequest('POST', '/api/comment', data.toString());
  }

  // Vote on a post or comment
  async vote(id, direction) {
    const data = new URLSearchParams({
      id: id,
      dir: direction, // 1 for upvote, -1 for downvote, 0 for remove vote
      api_type: 'json'
    });

    return await this.makeRequest('POST', '/api/vote', data.toString());
  }

  // Edit a post or comment
  async edit(thingId, text) {
    const data = {
      thing_id: thingId,
      text: text,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/editusertext', data);
  }

  // Delete a post or comment
  async delete(thingId) {
    const data = {
      id: thingId,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/del', data);
  }

  // Save a post
  async save(thingId) {
    const data = {
      id: thingId,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/save', data);
  }

  // Unsave a post
  async unsave(thingId) {
    const data = {
      id: thingId,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/unsave', data);
  }

  // Hide a post
  async hide(thingId) {
    const data = {
      id: thingId,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/hide', data);
  }

  // Unhide a post
  async unhide(thingId) {
    const data = {
      id: thingId,
      api_type: 'json'
    };

    return await this.makeRequest('POST', '/api/unhide', data);
  }
}

// Example usage
async function example() {
  // Initialize with your credentials
  const redditAPI = new RedditAPI(
    process.env.REDDIT_CLIENT_ID,
    process.env.REDDIT_CLIENT_SECRET
  );

  // After OAuth flow, set the tokens
  // redditAPI.setTokens(accessToken, refreshToken);

  try {
    // Get current user info
    const user = await redditAPI.getCurrentUser();
    console.log('Current user:', user.name);

    // Get user's posts
    const posts = await redditAPI.getUserPosts(5);
    console.log('Recent posts:', posts.data.children.length);

    // Get user's karma
    const karma = await redditAPI.getUserKarma();
    console.log('Karma breakdown:', karma);

    // Get user's preferences
    const prefs = await redditAPI.getUserPreferences();
    console.log('User preferences:', prefs);

    // Example: Submit a post (uncomment to test)
    // const postResult = await redditAPI.submitPost('test', 'Test Post Title', 'This is a test post content', 'self');
    // console.log('Post submitted:', postResult);

    // Example: Submit a comment (uncomment to test)
    // const commentResult = await redditAPI.submitComment('t3_abc123', 'This is a test comment');
    // console.log('Comment submitted:', commentResult);

    // Example: Vote on a post (uncomment to test)
    // const voteResult = await redditAPI.vote('t3_abc123', 1); // 1 for upvote
    // console.log('Vote submitted:', voteResult);

  } catch (error) {
    console.error('API Error:', error.response?.data || error.message);
  }
}

// Export for use in other files
module.exports = RedditAPI;

// Run example if this file is executed directly
if (require.main === module) {
  require('dotenv').config();
  example();
} 