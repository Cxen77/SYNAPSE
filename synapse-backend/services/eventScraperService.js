import axios from 'axios';
import * as cheerio from 'cheerio';

// ─── Platform Detection ────────────────────────────────────────────────────
function detectPlatform(url) {
    const host = new URL(url).hostname.toLowerCase();
    if (host.includes('unstop.com') || host.includes('dare2compete.com')) return 'Unstop';
    if (host.includes('devfolio.co')) return 'Devfolio';
    if (host.includes('devpost.com')) return 'Devpost';
    if (host.includes('hackerearth.com')) return 'HackerEarth';
    if (host.includes('mlh.io')) return 'MLH';
    if (host.includes('eventbrite.com')) return 'Eventbrite';
    if (host.includes('lu.ma') || host.includes('luma.com')) return 'Luma';
    return 'Other';
}

// ─── HTTP Fetch with realistic headers ─────────────────────────────────────
async function fetchPage(url) {
    const response = await axios.get(url, {
        timeout: 15000,
        maxRedirects: 5,
        headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
            'Accept-Language': 'en-US,en;q=0.9',
            'sec-ch-ua': '"Google Chrome";v="131", "Chromium";v="131", "Not_A Brand";v="24"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'Sec-Fetch-Dest': 'document',
            'Sec-Fetch-Mode': 'navigate',
            'Sec-Fetch-Site': 'none',
            'Sec-Fetch-User': '?1',
            'Upgrade-Insecure-Requests': '1',
        },
        decompress: true,
    });
    return response.data;
}

// ─── Utility: Clean text ───────────────────────────────────────────────────
function cleanText(text) {
    if (!text) return '';
    return text.replace(/\s+/g, ' ').trim();
}

function truncate(text, max = 500) {
    if (!text) return '';
    return text.length > max ? text.substring(0, max) + '…' : text;
}

// ─── Parse date string loosely ─────────────────────────────────────────────
function parseDate(dateStr) {
    if (!dateStr) return null;
    try {
        const d = new Date(dateStr);
        if (!isNaN(d.getTime())) return d.toISOString();
    } catch (_) { }

    // Try common patterns like "Jan 15, 2025" or "15 Jan 2025"
    const cleaned = dateStr.replace(/(\d+)(st|nd|rd|th)/gi, '$1').trim();
    try {
        const d = new Date(cleaned);
        if (!isNaN(d.getTime())) return d.toISOString();
    } catch (_) { }
    return null;
}

// ─── Guess category from text ──────────────────────────────────────────────
function guessCategory(title, description) {
    const text = `${title} ${description}`.toLowerCase();
    if (text.includes('hackathon') || text.includes('hack')) return 'Hackathon';
    if (text.includes('workshop') || text.includes('bootcamp')) return 'Workshop';
    if (text.includes('seminar') || text.includes('webinar') || text.includes('conference') || text.includes('talk')) return 'Seminar';
    if (text.includes('tournament') || text.includes('competition') || text.includes('contest') || text.includes('challenge')) return 'Tournament';
    if (text.includes('meetup') || text.includes('networking')) return 'Meetup';
    if (text.includes('game') || text.includes('gaming') || text.includes('esport')) return 'Game';
    if (text.includes('sport') || text.includes('athletic') || text.includes('cricket') || text.includes('football')) return 'Sport';
    return 'Hackathon'; // Default for external platform events
}

// ─── Extract team size from text ───────────────────────────────────────────
function extractTeamSize(text) {
    if (!text) return { min: 1, max: 4 };

    // "team of 2-5" or "2 to 5 members" or "team size: 1-4"
    const rangeMatch = text.match(/(?:team\s*(?:size|of)?[\s:]*)?(\d+)\s*[-–to]+\s*(\d+)\s*(?:members?|people|participants?)?/i);
    if (rangeMatch) {
        return { min: parseInt(rangeMatch[1]), max: parseInt(rangeMatch[2]) };
    }

    // "max team size 4" or "maximum 5 members"
    const maxMatch = text.match(/(?:max(?:imum)?)\s*(?:team\s*size)?[\s:]*(\d+)/i);
    if (maxMatch) {
        return { min: 1, max: parseInt(maxMatch[1]) };
    }

    // "team of 4" or "4 members"
    const singleMatch = text.match(/(?:team\s*(?:size|of)?[\s:]*)?(\d+)\s*(?:members?|people|participants?)/i);
    if (singleMatch) {
        const n = parseInt(singleMatch[1]);
        return { min: 1, max: n };
    }

    return { min: 1, max: 4 };
}

// ─── OpenGraph / Meta Tag Fallback ─────────────────────────────────────────
function extractMetaTags($) {
    const getMeta = (name) => {
        return $(`meta[property="${name}"]`).attr('content')
            || $(`meta[name="${name}"]`).attr('content')
            || '';
    };

    return {
        title: getMeta('og:title') || getMeta('twitter:title') || $('title').text() || '',
        description: getMeta('og:description') || getMeta('twitter:description') || getMeta('description') || '',
        imageUrl: getMeta('og:image') || getMeta('twitter:image') || '',
        siteName: getMeta('og:site_name') || '',
        url: getMeta('og:url') || '',
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//  PLATFORM-SPECIFIC SCRAPERS
// ═══════════════════════════════════════════════════════════════════════════

// ─── Unstop (dare2compete) ─────────────────────────────────────────────────
async function scrapeUnstop(url, html) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    // Unstop renders heavily with JS, so we primarily rely on meta tags
    // but also try to extract from JSON-LD and visible HTML
    let title = meta.title || '';
    let description = meta.description || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;
    let location = 'Online';
    let prize = '';
    let teamSize = { min: 1, max: 4 };

    // Clean up Unstop title (often has " | Unstop" suffix)
    title = title.replace(/\s*\|?\s*Unstop.*$/i, '').replace(/\s*\|?\s*Dare2Compete.*$/i, '').trim();

    // Try JSON-LD structured data
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json['@type'] === 'Event' || json['@type'] === 'HackathonEvent') {
                title = title || json.name || '';
                description = description || json.description || '';
                imageUrl = imageUrl || json.image || '';
                if (json.startDate) date = parseDate(json.startDate);
                if (json.location) {
                    if (typeof json.location === 'string') location = json.location;
                    else if (json.location.name) location = json.location.name;
                    else if (json.location.address) location = json.location.address;
                }
                if (json.offers?.price) prize = `₹${json.offers.price}`;
            }
        } catch (_) { }
    });

    // Try extracting from visible page content
    const pageText = $('body').text();
    if (!date) {
        // Look for date patterns in the page
        const dateMatch = pageText.match(/(?:starts?|begins?|date)[\s:]*(\w+\s+\d{1,2},?\s+\d{4})/i);
        if (dateMatch) date = parseDate(dateMatch[1]);
    }

    // Extract prize info
    if (!prize) {
        const prizeMatch = pageText.match(/(?:prize|reward|worth|pool)[\s:]*(?:₹|INR|Rs\.?|USD|\$)?\s*([\d,]+(?:\.\d+)?(?:\s*(?:lakh|lac|lakhs|k|cr|crore))?)/i);
        if (prizeMatch) prize = `₹${prizeMatch[1]}`;
    }

    // Extract team size
    teamSize = extractTeamSize(pageText);

    // Try to get location/mode
    if (pageText.match(/\b(?:offline|in[\s-]?person|on[\s-]?site|venue)\b/i)) {
        const locMatch = pageText.match(/(?:venue|location|city|place)[\s:]+([A-Za-z\s,]+?)(?:\.|$|\n)/i);
        if (locMatch) location = cleanText(locMatch[1]);
        else location = 'Offline';
    } else if (pageText.match(/\bonline\b/i)) {
        location = 'Online';
    } else if (pageText.match(/\bhybrid\b/i)) {
        location = 'Hybrid';
    }

    // Fallback date: 3 weeks from now
    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'Unstop Competition',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location,
        prize,
        maxTeamSize: teamSize.max,
        minTeamSize: teamSize.min,
        category: guessCategory(title, description),
        platform: 'Unstop',
        externalUrl: url,
    };
}

// ─── Devfolio ──────────────────────────────────────────────────────────────
async function scrapeDevfolio(url, html) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    let title = meta.title || '';
    let description = meta.description || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;
    let location = 'Online';
    let prize = '';
    let teamSize = { min: 1, max: 4 };

    // Clean title
    title = title.replace(/\s*[-|]\s*Devfolio.*$/i, '').trim();

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json.name) title = title || json.name;
            if (json.description) description = description || json.description;
            if (json.image) imageUrl = imageUrl || json.image;
            if (json.startDate) date = parseDate(json.startDate);
            if (json.location?.name) location = json.location.name;
        } catch (_) { }
    });

    // Devfolio often embeds data in __NEXT_DATA__
    $('script#__NEXT_DATA__').each((_, el) => {
        try {
            const nextData = JSON.parse($(el).html());
            const hackathon = nextData?.props?.pageProps?.hackathon
                || nextData?.props?.pageProps?.data
                || null;
            if (hackathon) {
                title = title || hackathon.name || hackathon.title || '';
                description = description || hackathon.tagline || hackathon.description || '';
                imageUrl = imageUrl || hackathon.cover_img || hackathon.logo || '';
                if (hackathon.starts_at || hackathon.start_date) {
                    date = parseDate(hackathon.starts_at || hackathon.start_date);
                }
                if (hackathon.is_online === false) location = hackathon.city || 'Offline';
                else location = 'Online';
                if (hackathon.prize_amount) prize = `$${hackathon.prize_amount}`;
                if (hackathon.team_max) teamSize.max = hackathon.team_max;
                if (hackathon.team_min) teamSize.min = hackathon.team_min;
            }
        } catch (_) { }
    });

    const pageText = $('body').text();
    teamSize = teamSize.max > 1 ? teamSize : extractTeamSize(pageText);

    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'Devfolio Hackathon',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location,
        prize,
        maxTeamSize: teamSize.max,
        minTeamSize: teamSize.min,
        category: guessCategory(title, description),
        platform: 'Devfolio',
        externalUrl: url,
    };
}

// ─── Devpost ───────────────────────────────────────────────────────────────
async function scrapeDevpost(url, html) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    let title = meta.title || $('h1').first().text() || '';
    let description = meta.description || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;
    let location = 'Online';
    let prize = '';
    let teamSize = { min: 1, max: 5 };

    // Clean title
    title = title.replace(/\s*[-|]\s*Devpost.*$/i, '').trim();

    // Devpost has cleaner HTML, try direct selectors
    const headerText = $('#challenge-header, .challenge-header, [class*="challenge"]').text();
    if (!description) {
        description = $('#challenge-description, .challenge-description, [class*="description"]').text();
    }

    // Try to find cover image
    if (!imageUrl) {
        imageUrl = $('#challenge-header img, .cover-image img, [class*="banner"] img').first().attr('src') || '';
    }

    // Dates
    const dateText = $('.date, .dates, [class*="date"], [class*="deadline"]').text();
    const dateMatch = dateText.match(/(\w+\s+\d{1,2},?\s+\d{4})/);
    if (dateMatch) date = parseDate(dateMatch[1]);

    // Prizes
    const prizeText = $('.prize, .prizes, [class*="prize"]').text();
    const prizeMatch = prizeText.match(/\$?([\d,]+)/);
    if (prizeMatch) prize = `$${prizeMatch[1]}`;

    const pageText = $('body').text();
    teamSize = extractTeamSize(pageText);

    // Online/offline
    if (pageText.match(/\b(?:in[\s-]?person|offline|venue)\b/i)) {
        location = 'Offline';
    }

    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'Devpost Hackathon',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location,
        prize,
        maxTeamSize: teamSize.max,
        minTeamSize: teamSize.min,
        category: guessCategory(title, description),
        platform: 'Devpost',
        externalUrl: url,
    };
}

// ─── HackerEarth ───────────────────────────────────────────────────────────
async function scrapeHackerEarth(url, html) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    let title = meta.title || $('h1').first().text() || '';
    let description = meta.description || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;
    let location = 'Online';
    let prize = '';

    title = title.replace(/\s*[-|]\s*HackerEarth.*$/i, '').trim();

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json.name) title = title || json.name;
            if (json.description) description = description || json.description;
            if (json.image) imageUrl = imageUrl || json.image;
            if (json.startDate) date = parseDate(json.startDate);
        } catch (_) { }
    });

    const pageText = $('body').text();
    const teamSize = extractTeamSize(pageText);

    const prizeMatch = pageText.match(/(?:prize|reward)[\s:]*(?:\$|₹|€)?\s*([\d,]+)/i);
    if (prizeMatch) prize = prizeMatch[0];

    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'HackerEarth Challenge',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location,
        prize,
        maxTeamSize: teamSize.max,
        minTeamSize: teamSize.min,
        category: guessCategory(title, description),
        platform: 'HackerEarth',
        externalUrl: url,
    };
}

// ─── MLH ───────────────────────────────────────────────────────────────────
async function scrapeMLH(url, html) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    let title = meta.title || $('h1, h2').first().text() || '';
    let description = meta.description || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;
    let location = 'Online';

    title = title.replace(/\s*[-|]\s*MLH.*$/i, '').trim();

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json.name) title = title || json.name;
            if (json.startDate) date = parseDate(json.startDate);
            if (json.location?.name) location = json.location.name;
            if (json.location?.address?.addressLocality) {
                location = `${json.location.address.addressLocality}, ${json.location.address.addressRegion || ''}`.trim();
            }
        } catch (_) { }
    });

    // MLH event pages often have dates in specific elements
    const dateEl = $('[class*="date"], .event-date, time').first();
    if (dateEl.length) {
        date = parseDate(dateEl.attr('datetime') || dateEl.text());
    }

    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'MLH Hackathon',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location,
        prize: '',
        maxTeamSize: 4,
        minTeamSize: 1,
        category: 'Hackathon',
        platform: 'MLH',
        externalUrl: url,
    };
}

// ─── Generic / Fallback Scraper ────────────────────────────────────────────
async function scrapeGeneric(url, html, platform) {
    const $ = cheerio.load(html);
    const meta = extractMetaTags($);

    let title = meta.title || $('h1').first().text() || '';
    let description = meta.description || $('p').first().text() || '';
    let imageUrl = meta.imageUrl || '';
    let date = null;

    // JSON-LD
    $('script[type="application/ld+json"]').each((_, el) => {
        try {
            const json = JSON.parse($(el).html());
            if (json['@type'] === 'Event') {
                title = title || json.name || '';
                description = description || json.description || '';
                imageUrl = imageUrl || json.image || '';
                if (json.startDate) date = parseDate(json.startDate);
            }
        } catch (_) { }
    });

    const pageText = $('body').text();
    const teamSize = extractTeamSize(pageText);

    if (!date) {
        date = new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString();
    }

    return {
        title: cleanText(title) || 'External Event',
        description: truncate(cleanText(description)),
        imageUrl,
        date,
        location: 'Online',
        prize: '',
        maxTeamSize: teamSize.max,
        minTeamSize: teamSize.min,
        category: guessCategory(title, description),
        platform: platform || 'External',
        externalUrl: url,
    };
}

// ═══════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Scrape event metadata from a given URL.
 * @param {string} url - The event page URL
 * @returns {Promise<Object>} - Extracted event metadata
 */
export async function scrapeEventFromUrl(url) {
    // Validate URL
    let parsedUrl;
    try {
        parsedUrl = new URL(url);
    } catch (_) {
        throw new Error('Invalid URL format');
    }

    // Only allow http/https
    if (!['http:', 'https:'].includes(parsedUrl.protocol)) {
        throw new Error('Only HTTP/HTTPS URLs are supported');
    }

    const platform = detectPlatform(url);
    let html;

    try {
        html = await fetchPage(url);
    } catch (fetchErr) {
        console.error(`[EventScraper] Failed to fetch ${url}:`, fetchErr.message);
        throw new Error(`Could not fetch the page. The site may be blocking automated requests. Status: ${fetchErr.response?.status || 'Network Error'}`);
    }

    // If the response is not string (e.g. JSON from an API), handle it
    if (typeof html !== 'string') {
        // Some sites return JSON directly — try to extract from it
        if (typeof html === 'object') {
            return {
                title: html.name || html.title || 'External Event',
                description: truncate(html.description || html.tagline || ''),
                imageUrl: html.image || html.cover_image || html.logo || '',
                date: parseDate(html.start_date || html.starts_at || html.date) || new Date(Date.now() + 21 * 24 * 60 * 60 * 1000).toISOString(),
                location: html.location || html.city || 'Online',
                prize: html.prize || '',
                maxTeamSize: html.team_max || html.max_team_size || 4,
                minTeamSize: html.team_min || html.min_team_size || 1,
                category: guessCategory(html.name || html.title || '', html.description || ''),
                platform,
                externalUrl: url,
            };
        }
        html = String(html);
    }

    // Route to platform-specific scraper
    switch (platform) {
        case 'Unstop':
            return scrapeUnstop(url, html);
        case 'Devfolio':
            return scrapeDevfolio(url, html);
        case 'Devpost':
            return scrapeDevpost(url, html);
        case 'HackerEarth':
            return scrapeHackerEarth(url, html);
        case 'MLH':
            return scrapeMLH(url, html);
        default:
            return scrapeGeneric(url, html, platform);
    }
}

export { detectPlatform };
