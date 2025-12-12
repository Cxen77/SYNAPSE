import rateLimit from 'express-rate-limit';

// Global Limiter - Prevent DDoS / Heavy Spam
export const globalLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 1000, // Limit each IP to 1000 requests per window
    message: { message: 'Too many requests from this IP, please try again after 10 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Auth Limiter - Prevent Brute Force Attacks on Login/Register
export const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 15, // Limit each IP to 15 requests per window (strict!)
    message: { message: 'Too many login attempts, please try again after 15 minutes' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Search Limiter - Prevent Scraping
export const searchLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 50, // 50 searches per minute is generous for human, hard for scraper
    message: { message: 'Search query limit exceeded, please slow down' },
    standardHeaders: true,
    legacyHeaders: false,
});

// Standard API Limiter - For general data fetching
export const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 300,
    message: { message: 'API rate limit exceeded' },
    standardHeaders: true,
    legacyHeaders: false,
});
