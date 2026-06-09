/**
 * @file api.js
 * @description Centralized API client for interacting with the URL Shortener backend.
 *              Handles requests for creating short URLs and fetching existing ones.
 *              Designed for production-quality, maintainable code with proper error handling.
 */

// Determine the API base URL based on environment variables.
// In a production environment, REACT_APP_API_BASE_URL should be set to your backend's domain
// (e.g., 'https://api.yourshortener.com').
// For local development, it defaults to http://localhost:5000, assuming the Node.js backend
// is running on that port.
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000';

/**
 * Helper function to process API responses.
 * Checks if the response was successful (status 2xx) and parses the JSON body.
 * Throws an error with a descriptive message if the response indicates a failure.
 *
 * @param {Response} response - The fetch API Response object.
 * @returns {Promise<Object>} A promise that resolves with the JSON data from the response.
 * @throws {Error} If the network request failed or the server returned an error status.
 */
async function handleApiResponse(response) {
  if (!response.ok) {
    // Attempt to parse error details from the response body
    let errorData = {};
    try {
      errorData = await response.json();
    } catch (e) {
      // If JSON parsing fails, use a generic message
      errorData = { message: 'An unknown error occurred on the server.' };
    }

    const errorMessage = errorData.message || `API Error: ${response.status} ${response.statusText}`;
    const error = new Error(errorMessage);
    error.status = response.status;
    error.data = errorData; // Attach original error data for more context
    throw error;
  }
  return response.json();
}

/**
 * Creates a new short URL by sending a POST request to the backend.
 *
 * @param {string} longUrl - The original long URL to be shortened.
 * @param {string} [customAlias=''] - An optional custom alias (short code) for the URL.
 *                                    If not provided, the backend will generate one.
 * @returns {Promise<Object>} A promise that resolves with the created short URL object,
 *                            including its short code and original URL.
 * @throws {Error} If the API request fails (e.g., network error, server validation error).
 */
export async function createShortUrl(longUrl, customAlias = '') {
  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // In a microservices context, you might include an Authorization header here
        // if user authentication is handled by a central service (e.g., from the
        // 'AI-Powered Content Assistant' or a shared user service).
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
      body: JSON.stringify({ longUrl, customAlias }),
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Failed to create short URL:', error.message, error.data);
    throw error; // Re-throw to allow the calling component to handle the error
  }
}

/**
 * Fetches a list of all short URLs currently stored in the system.
 * This might be used for an administrative dashboard or a user's personal history page.
 *
 * @returns {Promise<Array<Object>>} A promise that resolves with an array of short URL objects.
 * @throws {Error} If the API request fails.
 */
export async function getShortUrls() {
  try {
    const response = await fetch(`${API_BASE_URL}/api/urls`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // 'Authorization': `Bearer ${localStorage.getItem('authToken')}`, // If authentication is required
      },
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Failed to fetch short URLs:', error.message);
    throw error;
  }
}

// --- Cross-Project Context / Future Integration Points ---
// In a larger interconnected system, this API client might eventually interact
// with other services or an API Gateway that routes to them.

// Example: If the URL Shortener needed to log detailed usage analytics to a
// central analytics service, potentially part of the 'AI-Powered Content Assistant's'
// data processing pipeline or a shared logging infrastructure.
/*
export async function sendAnalyticsEvent(eventName, payload) {
  try {
    const analyticsServiceUrl = process.env.REACT_APP_ANALYTICS_SERVICE_URL || `${API_BASE_URL}/api/analytics`;
    const response = await fetch(analyticsServiceUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        service: 'URL_SHORTENER',
        event: eventName,
        timestamp: new Date().toISOString(),
        ...payload,
      }),
    });
    if (!response.ok) {
      console.warn('Failed to send analytics event:', await response.text());
    }
  } catch (error) {
    console.warn('Error sending analytics event:', error);
  }
}
*/

// Example: If user-specific settings for URL shortening (e.g., preferred domain,
// default expiration) were managed by a shared user profile service, which might
// also be used by the 'Interactive E-commerce Product Catalog' for user accounts.
/*
export async function fetchUserShortenerSettings(userId) {
  try {
    const userProfileServiceUrl = process.env.REACT_APP_USER_PROFILE_SERVICE_URL || `${API_BASE_URL}/api/user-profiles`;
    const response = await fetch(`${userProfileServiceUrl}/${userId}/shortener-settings`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
      },
    });
    return await handleApiResponse(response);
  } catch (error) {
    console.error('Failed to fetch user shortener settings:', error.message);
    return {}; // Return default settings on error
  }
}
*/