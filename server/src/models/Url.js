const mongoose = require('mongoose');

/**
 * @file Defines the Mongoose schema and model for URL documents.
 * @module models/Url
 */

const urlSchema = new mongoose.Schema({
  /**
   * The original long URL to be shortened.
   * @type {string}
   * @required
   * @unique
   * @index
   */
  longUrl: {
    type: String,
    required: [true, 'Long URL is required'],
    unique: true, // Ensures no two short codes point to the exact same long URL (unless custom alias is used)
    trim: true,
    match: [
      /^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i,
      'Please provide a valid URL'
    ]
  },
  /**
   * The unique short code generated for the URL.
   * This is used in the short URL (e.g., yourdomain.com/shortCode).
   * @type {string}
   * @required
   * @unique
   * @index
   */
  shortCode: {
    type: String,
    required: [true, 'Short code is required'],
    unique: true,
    trim: true,
    minlength: 6, // A reasonable minimum length for short codes
    maxlength: 12, // A reasonable maximum length
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Short code can only contain alphanumeric characters, hyphens, and underscores'
    ]
  },
  /**
   * An optional custom alias provided by the user.
   * If provided, it must also be unique.
   * @type {string}
   * @unique
   * @sparse
   */
  customAlias: {
    type: String,
    unique: true,
    sparse: true, // Allows multiple documents to have a null value for customAlias
    trim: true,
    minlength: 3, // A reasonable minimum length for custom aliases
    maxlength: 20, // A reasonable maximum length
    match: [
      /^[a-zA-Z0-9_-]+$/,
      'Custom alias can only contain alphanumeric characters, hyphens, and underscores'
    ]
  },
  /**
   * The number of times the short URL has been clicked/redirected.
   * @type {number}
   * @default 0
   */
  clicks: {
    type: Number,
    default: 0
  },
  /**
   * The date and time when the short URL is set to expire.
   * If null, the URL does not expire.
   * @type {Date}
   */
  expiresAt: {
    type: Date,
    // Mongoose TTL index for automatic document deletion after expiresAt.
    // '0s' means documents will expire at the exact time specified in expiresAt.
    index: { expires: '0s' },
    default: null
  },
  /**
   * Optional ID of the user who created this short URL.
   * This can be a simple string or a reference to a User model if authentication is implemented.
   * @type {string}
   */
  userId: {
    type: String, // Using String for simplicity, could be mongoose.Schema.Types.ObjectId if a User model exists
    default: null
  },
  /**
   * The service that initiated the URL shortening request.
   * Useful for cross-service analytics and integration within the larger system.
   * @type {string}
   * @enum ['URL_SHORTENER', 'WEATHER_DASHBOARD', 'ECOMMERCE_CATALOG', 'AI_CONTENT_ASSISTANT']
   * @default 'URL_SHORTENER'
   */
  sourceService: {
    type: String,
    enum: ['URL_SHORTENER', 'WEATHER_DASHBOARD', 'ECOMMERCE_CATALOG', 'AI_CONTENT_ASSISTANT'],
    default: 'URL_SHORTENER',
    required: true
  },
  /**
   * An optional ID linking this short URL to a specific entity in the source service.
   * E.g., a product ID from the E-commerce Catalog, or a report ID from the Weather Dashboard.
   * @type {string}
   */
  relatedEntityId: {
    type: String,
    default: null
  },
  /**
   * An array of tags for categorization or search.
   * Can be used for analytics or integration with the AI-Powered Content Assistant.
   * @type {string[]}
   */
  tags: {
    type: [String],
    default: []
  }
}, {
  timestamps: true, // Adds createdAt and updatedAt fields automatically
  collection: 'urls' // Explicitly names the MongoDB collection
});

// Create indexes for efficient querying
urlSchema.index({ shortCode: 1 }); // For fast lookups during redirection
urlSchema.index({ customAlias: 1 }, { unique: true, sparse: true }); // For custom alias lookups
urlSchema.index({ longUrl: 1 }, { unique: true }); // For checking if a URL has already been shortened

/**
 * Mongoose model for URL documents.
 * @typedef {mongoose.Model<UrlDocument>} UrlModel
 */
const Url = mongoose.model('Url', urlSchema);

module.exports = Url;