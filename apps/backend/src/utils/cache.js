import NodeCache from 'node-cache';

// Cache items for 5 minutes (300 seconds) by default
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

/**
 * Express middleware to cache responses based on the request URL and query string.
 * This should ONLY be applied to GET requests.
 */
export const cacheMiddleware = (durationInSeconds = 300) => {
  return (req, res, next) => {
    if (req.method !== 'GET') {
      console.error('Cannot cache non-GET methods!');
      return next();
    }
    
    // Create a unique cache key for this user and route
    // e.g., "64f1c9c8e4b0a..._/api/student/matched-alumni"
    const userId = req.user ? req.user.id : 'public';
    const key = `${userId}_${req.originalUrl || req.url}`;
    
    const cachedResponse = cache.get(key);
    
    if (cachedResponse) {
      return res.status(200).json(cachedResponse);
    } else {
      // Intercept the res.json() to save the response body to cache before sending
      const originalJson = res.json;
      res.json = (body) => {
        // Only cache successful requests
        if (res.statusCode === 200 && body.success) {
          cache.set(key, body, durationInSeconds);
        }
        return originalJson.call(res, body);
      };
      next();
    }
  };
};

/**
 * Function to manually clear a specific user's cache.
 * Useful after they upload a resume or change target role.
 */
export const clearUserCache = (userId) => {
  const keys = cache.keys();
  const userKeys = keys.filter(k => k.startsWith(`${userId}_`));
  if (userKeys.length > 0) {
    cache.del(userKeys);
  }
};
