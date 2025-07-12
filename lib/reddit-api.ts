import axios, { AxiosInstance } from 'axios';
import { getSession, setSession, SessionToken } from './auth';

class RedditAPI {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: 'https://oauth.reddit.com',
      headers: {
        'User-Agent': 'ReddiPost/1.0',
      },
    });

    // Add request interceptor to include auth token
    this.axiosInstance.interceptors.request.use(async (config) => {
      const session = await getSession();
      if (session) {
        config.headers.Authorization = `Bearer ${session.accessToken}`;
      }
      return config;
    });

    // Add response interceptor to handle token refresh
    this.axiosInstance.interceptors.response.use(
      (response) => response,
      async (error) => {
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) {
          originalRequest._retry = true;

          try {
            const session = await getSession();
            if (session && session.refreshToken) {
              const newSession = await this.refreshToken(session.refreshToken);
              await setSession(newSession);
              originalRequest.headers.Authorization = `Bearer ${newSession.accessToken}`;
              return this.axiosInstance(originalRequest);
            }
          } catch (refreshError) {
            // Refresh failed, redirect to login
            return Promise.reject(refreshError);
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private async refreshToken(refreshToken: string): Promise<SessionToken> {
    const authString = Buffer.from(
      `${process.env.REDDIT_CLIENT_ID}:${process.env.REDDIT_CLIENT_SECRET}`
    ).toString('base64');

    const response = await axios.post(
      'https://www.reddit.com/api/v1/access_token',
      new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
      }),
      {
        headers: {
          'Authorization': `Basic ${authString}`,
          'Content-Type': 'application/x-www-form-urlencoded',
          'User-Agent': 'ReddiPost/1.0',
        },
      }
    );

    const { access_token, refresh_token, expires_in, scope } = response.data;

    return {
      accessToken: access_token,
      refreshToken: refresh_token || refreshToken,
      expiresAt: Date.now() + expires_in * 1000,
      scope: scope,
    };
  }

  async getUser() {
    const response = await this.axiosInstance.get('/api/v1/me');
    return response.data;
  }

  async getUserPosts(limit = 10) {
    const response = await this.axiosInstance.get('/user/me/submitted', {
      params: { limit },
    });
    return response.data;
  }

  async submitPost(subreddit: string, title: string, content: string, kind: 'self' | 'link' = 'self') {
    const params = new URLSearchParams({
      api_type: 'json',
      sr: subreddit,
      title: title,
      kind: kind,
    });

    if (kind === 'self') {
      params.append('text', content);
    } else {
      params.append('url', content);
    }

    const response = await this.axiosInstance.post('/api/submit', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  }

  async submitComment(parentId: string, text: string) {
    const params = new URLSearchParams({
      api_type: 'json',
      thing_id: parentId,
      text: text,
    });

    const response = await this.axiosInstance.post('/api/comment', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  }

  async vote(id: string, direction: 1 | -1 | 0) {
    const params = new URLSearchParams({
      id: id,
      dir: direction.toString(),
    });

    const response = await this.axiosInstance.post('/api/vote', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    return response.data;
  }

  async searchSubreddits(query: string, limit: number = 10) {
    const response = await this.axiosInstance.get('/subreddits/search', {
      params: {
        q: query,
        limit: limit,
        type: 'sr',
        sort: 'relevance',
      },
    });

    return response.data;
  }

  async getSubredditAbout(subredditName: string) {
    const response = await this.axiosInstance.get(`/r/${subredditName}/about`);
    return response.data;
  }

  async getSubredditRules(subredditName: string) {
    try {
      const response = await this.axiosInstance.get(`/r/${subredditName}/about/rules`);
      return response.data;
    } catch (error) {
      return { rules: [] };
    }
  }
}

export const redditAPI = new RedditAPI();