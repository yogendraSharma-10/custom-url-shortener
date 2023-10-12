import React, { useState, useEffect } from 'react';
import { shortenUrl, getRecentUrls } from './api'; // Assuming api.js exports these functions
import './styles/main.css'; // Import the main CSS file

/**
 * App Component
 *
 * This is the main application component for the Custom URL Shortener.
 * It provides an intuitive interface for users to:
 * 1. Input a long URL and an optional custom slug.
 * 2. Shorten the URL by interacting with the backend API.
 * 3. Display the generated short URL and allow copying it to the clipboard.
 * 4. View a list of recently shortened URLs.
 *
 * It manages UI state for inputs, loading indicators, error messages,
 * and the list of URLs, ensuring a smooth user experience.
 */
function App() {
  // State for the long URL input field
  const [longUrl, setLongUrl] = useState('');
  // State for the optional custom slug input field
  const [customSlug, setCustomSlug] = useState('');
  // State to store the generated short URL for display
  const [shortUrl, setShortUrl] = useState('');
  // State to store any error messages from API calls or client-side validation
  const [error, setError] = useState('');
  // State to indicate if an API call is currently in progress (e.g., for loading spinners)
  const [loading, setLoading] = useState(false);
  // State to store a list of recently shortened URLs fetched from the backend
  const [recentUrls, setRecentUrls] = useState([]);

  /**
   * Fetches a list of recently shortened URLs from the backend API.
   * This function is called on component mount and after a successful URL shortening operation.
   * It updates the `recentUrls` state.
   */
  const fetchRecentUrls = async () => {
    try {
      // Set loading state for recent URLs section if desired, though not strictly necessary for this simple fetch
      const data = await getRecentUrls();
      setRecentUrls(data);
    } catch (err) {
      console.error('Failed to fetch recent URLs:', err);
      // Optionally, set an error state specifically for the recent URLs section
    }
  };

  // useEffect hook to fetch recent URLs when the component first mounts.
  // The empty dependency array `[]` ensures this effect runs only once.
  useEffect(() => {
    fetchRecentUrls();
  }, []);

  /**
   * Handles the change event for the long URL input field.
   * Updates the `longUrl` state and clears any previous error or short URL display.
   * @param {Object} e - The event object from the input field.
   */
  const handleLongUrlChange = (e) => {
    setLongUrl(e.target.value);
    setError(''); // Clear previous errors
    setShortUrl(''); // Clear previous short URL result
  };

  /**
   * Handles the change event for the custom slug input field.
   * Updates the `customSlug` state and clears any previous error or short URL display.
   * @param {Object} e - The event object from the input field.
   */
  const handleCustomSlugChange = (e) => {
    setCustomSlug(e.target.value);
    setError(''); // Clear previous errors
    setShortUrl(''); // Clear previous short URL result
  };

  /**
   * Handles the form submission event to shorten a URL.
   * Prevents default form submission, performs client-side validation,
   * calls the `shortenUrl` API, and updates the UI state based on the response.
   * @param {Object} e - The event object from the form submission.
   */
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the browser's default form submission behavior

    // Basic client-side validation: ensure the long URL is not empty
    if (!longUrl.trim()) {
      setError('Please enter a URL to shorten.');
      return;
    }

    setLoading(true); // Indicate that an API call is in progress
    setError('');      // Clear any previous error messages
    setShortUrl('');   // Clear any previously displayed short URL

    try {
      const response = await shortenUrl(longUrl, customSlug);

      if (response.shortUrl) {
        // If the API call was successful and returned a short URL
        setShortUrl(response.shortUrl);
        setLongUrl('');     // Clear the long URL input field
        setCustomSlug('');  // Clear the custom slug input field
        fetchRecentUrls();  // Refresh the list of recent URLs to include the new one
      } else if (response.error) {
        // If the API returned an error message (e.g., custom slug taken)
        setError(response.error);
      } else {
        // Fallback for unexpected API response structure
        setError('An unexpected error occurred. Please try again.');
      }
    } catch (err) {
      // Catch network errors or other exceptions during the API call
      console.error('Error shortening URL:', err);
      setError(err.message || 'Failed to shorten URL. Please check your connection and try again.');
    } finally {
      setLoading(false); // Reset loading state regardless of success or failure
    }
  };

  /**
   * Copies the provided text to the user's clipboard.
   * Provides user feedback via an alert.
