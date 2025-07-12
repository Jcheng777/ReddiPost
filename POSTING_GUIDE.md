# Reddit Posting Guide with OAuth

This guide explains how to post content to Reddit using OAuth authentication.

## 🔐 Required OAuth Scopes

To post content, you need these scopes in your OAuth request:

- `submit` - Submit posts and comments
- `edit` - Edit posts and comments
- `identity` - Access user identity (required for any OAuth)

## 📝 Types of Posts

### 1. Text Posts (`kind: 'self'`)
- Self-contained text posts
- No external links
- Content goes in the `text` field

### 2. Link Posts (`kind: 'link'`)
- Posts that link to external URLs
- Content should be a valid URL
- Content goes in the `url` field

## 🚀 API Endpoints

### Submit a Post
```javascript
POST /api/submit
{
  "subreddit": "subreddit_name",
  "title": "Post Title",
  "content": "Post content or URL",
  "kind": "self" // or "link"
}
```

### Submit a Comment
```javascript
POST /api/comment
{
  "parent": "t3_abc123", // Post or comment ID
  "text": "Comment text"
}
```

### Vote on Content
```javascript
POST /api/vote
{
  "id": "t3_abc123", // Post or comment ID
  "dir": 1 // 1=upvote, -1=downvote, 0=remove vote
}
```

## 💻 Usage Examples

### Using the Web Interface

1. **Authenticate**: Login with Reddit using the web interface
2. **Submit Post**: Fill out the form with:
   - Subreddit name (e.g., "test")
   - Post title
   - Content (text for self posts, URL for link posts)
   - Select post type

### Using the API Programmatically

```javascript
const RedditAPI = require('./examples/reddit-api-example.js');

// Initialize with your credentials
const redditAPI = new RedditAPI(
    process.env.REDDIT_CLIENT_ID,
    process.env.REDDIT_CLIENT_SECRET
);

// Set tokens after OAuth flow
redditAPI.setTokens(accessToken, refreshToken);

// Submit a text post
const postResult = await redditAPI.submitPost(
    'test', 
    'My Test Post', 
    'This is the content of my test post', 
    'self'
);

// Submit a link post
const linkResult = await redditAPI.submitPost(
    'programming', 
    'Check out this cool website', 
    'https://example.com', 
    'link'
);

// Submit a comment
const commentResult = await redditAPI.submitComment(
    't3_abc123', // Post ID
    'Great post! Thanks for sharing.'
);

// Vote on a post
const voteResult = await redditAPI.vote('t3_abc123', 1); // Upvote
```

## 🔧 Advanced Features

### Available Methods

```javascript
// Posting
redditAPI.submitPost(subreddit, title, content, kind)
redditAPI.submitComment(parentId, text)

// Voting
redditAPI.vote(id, direction)

// Editing
redditAPI.edit(thingId, text)

// Deleting
redditAPI.delete(thingId)

// Saving/Unsaving
redditAPI.save(thingId)
redditAPI.unsave(thingId)

// Hiding/Unhiding
redditAPI.hide(thingId)
redditAPI.unhide(thingId)
```

### Error Handling

```javascript
try {
    const result = await redditAPI.submitPost('test', 'Title', 'Content', 'self');
    console.log('Success:', result);
} catch (error) {
    if (error.response?.status === 403) {
        console.error('Permission denied - check your OAuth scopes');
    } else if (error.response?.status === 400) {
        console.error('Invalid request - check your parameters');
    } else {
        console.error('Unexpected error:', error.message);
    }
}
```

## ⚠️ Important Considerations

### Rate Limiting
- Reddit has rate limits to prevent spam
- Be respectful and don't post too frequently
- Follow Reddit's API guidelines

### Content Guidelines
- Follow subreddit rules
- Don't post spam or inappropriate content
- Respect Reddit's content policies

### Error Codes
- `403 Forbidden`: Insufficient permissions or invalid scopes
- `400 Bad Request`: Invalid parameters or subreddit doesn't exist
- `429 Too Many Requests`: Rate limit exceeded

### Subreddit Requirements
- Some subreddits require karma to post
- Some subreddits have specific posting rules
- Check subreddit requirements before posting

## 🧪 Testing

### Test Subreddit
Use `r/test` for testing your posting functionality:
- No karma requirements
- Designed for testing
- Posts are automatically removed after a while

### Example Test Post
```javascript
// Test in r/test subreddit
const testPost = await redditAPI.submitPost(
    'test',
    'API Test Post',
    'This is a test post from my Reddit API application.',
    'self'
);
```

## 🔒 Security Best Practices

1. **Store tokens securely**: Use environment variables or secure storage
2. **Validate input**: Sanitize user input before posting
3. **Handle errors gracefully**: Implement proper error handling
4. **Respect rate limits**: Don't overwhelm Reddit's servers
5. **Follow Reddit's terms**: Ensure your app complies with Reddit's API terms

## 📚 Additional Resources

- [Reddit API Documentation](https://www.reddit.com/dev/api/)
- [Reddit API Terms](https://www.redditinc.com/policies/api-terms)
- [Reddit Content Policy](https://www.redditinc.com/policies/content-policy)

## 🚨 Common Issues

### "Forbidden" Error
- Check that you have the `submit` scope
- Verify the subreddit exists and allows posting
- Ensure your account has sufficient karma

### "Bad Request" Error
- Verify subreddit name is correct
- Check that title is not empty
- Ensure content meets subreddit requirements

### Rate Limiting
- Implement delays between posts
- Use exponential backoff for retries
- Monitor your posting frequency

Remember: Always test in `r/test` first before posting to other subreddits! 