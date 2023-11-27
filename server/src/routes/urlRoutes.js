const express = require('express');
const router = express.Router();
const Url = require('../models/Url');
const { nanoid } = require('nanoid'); // nanoid is excellent for generating short, unique IDs

/**
 * Helper function to validate if a string is a valid URL.
 * @param {string} url - The URL string to validate.
 * @returns {boolean} - True if the URL is valid, false otherwise.
 */
const isValidUrl = (url) => {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
};

/**
 * @route POST /api/shorten
 * @description Creates a new short URL from a given long URL.
 *              Checks for existing long URLs to prevent duplicates and generates a unique short code.
 * @access Public
 * @body {string} longUrl - The original long URL to be shortened.
 * @returns {object} - JSON object containing the short URL, long URL, and short code.
 * @status 201 - URL shortened successfully.
 * @status 200 - URL already exists and its short version is returned.
 * @status 400 - Invalid request (e.g., missing or invalid longUrl).
 * @status 500 - Server error.
 */
router.post('/shorten', async (req, res) => {
    const { longUrl } = req.body;

    // Input validation
    if (!longUrl) {
        return res.status(400).json({ error: 'Long URL is required.' });
    }

    if (!isValidUrl(longUrl)) {
        return res.status(400).json({ error: 'Invalid URL provided. Please ensure it includes http:// or https://' });
    }

    try {
        // Check if the long URL has already been shortened to avoid creating duplicate entries
        let existingUrl = await Url.findOne({ longUrl });
        if (existingUrl) {
            // If found, return the existing short URL
            return res.status(200).json({
                shortUrl: `${process.env.BASE_URL}/${existingUrl.shortCode}`,
                longUrl: existingUrl.longUrl,
                shortCode: existingUrl.shortCode,
                message: 'URL already shortened.',
            });
        }

        // Generate a unique short code
        let shortCode;
        let isUnique = false;
        // Loop until a truly unique short code is generated
        while (!isUnique) {
            shortCode = nanoid(7); // Generates a 7-character URL-friendly unique ID
            const found = await Url.findOne({ shortCode });
            if (!found) {
                isUnique = true;
            }
        }

        // Create a new URL document
        const newUrl = new Url({
            longUrl,
            shortCode,
            createdAt: new Date(),
        });

        // Save the new URL to the database
        await newUrl.save();

        // Respond with the newly created short URL details
        res.status(201).json({
            shortUrl: `${process.env.BASE_URL}/${newUrl.shortCode}`,
            longUrl: newUrl.longUrl,
            shortCode: newUrl.shortCode,
            message: 'URL shortened successfully.',
        });

    } catch (error) {
        console.error('Error shortening URL:', error);
        res.status(500).json({ error: 'Server error during URL shortening. Please try again later.' });
    }
});

/**
 * @route GET /:shortCode
 * @description Redirects to the original long URL associated with the given short code.
 *              Increments the click count for the short URL.
 * @access Public
 * @param {string} shortCode - The short code to look up.
 * @returns {void} - Redirects the client to the long URL or sends a 404/500 response.
 *
 * IMPORTANT NOTE ON MOUNTING:
 * For a URL shortener, this route should typically be mounted at the root level in `server/src/app.js`
 * (e.g., `app.use('/', urlRoutes);`) to allow direct access like `yourdomain.com/shortCode`.
 * If mounted under `/api` (e.g., `app.use('/api', urlRoutes);`), it would require
 * `yourdomain.com/api/shortCode` for redirection, which is not standard for shorteners.
 * Ensure `app.js` handles this route appropriately, potentially before other `/api` routes.
 */
router.get('/:shortCode', async (req, res) => {
    const { shortCode } = req.params;

    try {
        // Find the URL entry by its short code
        const urlEntry = await Url.findOne({ shortCode });

        if (urlEntry) {
            // Increment the click count for analytics
            urlEntry.clicks++;
            await urlEntry.save();

            // Redirect the client to the original long URL
            return res.redirect(urlEntry.longUrl);
        } else {
            // If the short code is not found, respond with a 404.
            // For a user-friendly experience, consider redirecting to a client-side 404 page
            // if a `BASE_CLIENT_URL` is configured.
            if (process.env.BASE_CLIENT_URL) {
                return res.redirect(`${process.env.BASE_CLIENT_URL}/404`);
            }
            // Fallback for API-only or no client-side 404 page
            return res.status(404).send('Short URL not found.');
        }
    } catch (error) {
        console.error(`Error redirecting for shortCode "${shortCode}":`, error);
        res.status(5