require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

// Import database connection function
const connectDB = require('./config/db');

// Import API routes
const urlRoutes = require('./routes/urlRoutes');

// Initialize Express app
const app = express();

// Connect to the database
connectDB();

// --- Middleware ---

// Security middleware: Sets various HTTP headers to help protect your app
app.use(helmet());

// CORS middleware: Allows cross-origin requests from the client application.
// In a microservice architecture, this might also include other service origins
// if they need to directly communicate with this service (e.g., for analytics or integration).
// Example: process.env.WEATHER_DASHBOARD_URL, process.env.ECOMMERCE_CATALOG_URL
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000', // Allow requests from the React frontend
  methods: ['GET', 'POST', 'PUT', 'DELETE'], // Allowed HTTP methods
  allowedHeaders: ['Content-Type', 'Authorization'], // Allowed headers
  credentials: true // Allow cookies to be sent (if session management is implemented)
}));

// Body parser middleware: Parses incoming request bodies in JSON format
app.use(express.json());

// Body parser middleware: Parses incoming request bodies in URL-encoded format
// `extended: false` uses the querystring library, `extended: true` uses the qs library.
// `false` is sufficient for simple key-value pairs.
app.use(express.urlencoded({ extended: false }));

// HTTP request logger middleware: Logs requests to the console.
// 'dev' format is concise and color-coded for development.
// 'combined' is standard Apache combined log format, suitable for production.
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// --- API Routes ---

// URL shortening and management routes
app.use('/api/urls', urlRoutes);

// --- Static Assets & Frontend Serving (for production) ---
// In a production environment, the Node.js server will serve the React build files.
// This setup assumes the client build output is located at `client/build` relative to the server root.
if (process.env.NODE_ENV === 'production') {
  // Serve static files from the React build directory
  app.use(express.static(path.join(__dirname, '../../client/build')));

  // For any other GET request not handled by API routes, serve the React app's index.html.
  // This allows client-side routing to work correctly (e.g., refreshing a /short-link page).
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../../client/build', 'index.html'));
  });
}

// --- Error Handling Middleware ---

// 404 Not Found Handler: Catches requests that fall through all other routes.
app.use((req, res, next) => {
  res.status(404).json({ message: 'Resource not found. Please check the URL or API endpoint.' });
});

// Global Error Handler: Catches any errors thrown by previous middleware or route handlers.
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the full error stack for debugging purposes

  // Determine the status code (default to 500 Internal Server Error if not specified)
  const statusCode = err.statusCode || 500;

  // Send a generic error response.
  // In development, send more error details; in production, keep it minimal for security.
  res.status(statusCode).json({
    message: err.message || 'An unexpected server error occurred.',
    error: process.env.NODE_ENV === 'production' ? {} : {
      name: err.name,
      message: err.message,
      stack: err.stack
    }
  });
});

// --- Server Initialization ---

const PORT = process.env.PORT || 5000; // Use port from environment variables or default to 5000

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
  // Cross-project context: If this service were part of a larger microservice ecosystem,
  // this would be an ideal place to initiate service registration with a discovery service
  // (e.g., Eureka, Consul) or an API Gateway.
  // Example: registerService('url-shortener', `http://localhost:${PORT}/api`);
});

// Export the app for testing purposes (e.g., with Supertest)
module.exports = app;