import axios from 'axios';
import * as cheerio from 'cheerio';
import { lookup } from 'node:dns/promises';
import { isIP, BlockList } from 'node:net';
import http from 'node:http';
import https from 'node:https';

const blocked = new BlockList();
for (const [ip, prefix] of [['0.0.0.0', 8], ['10.0.0.0', 8], ['100.64.0.0', 10], ['127.0.0.0', 8], ['169.254.0.0', 16], ['172.16.0.0', 12], ['192.168.0.0', 16], ['192.0.0.0', 24], ['192.0.2.0', 24], ['198.18.0.0', 15], ['198.51.100.0', 24], ['203.0.113.0', 24], ['224.0.0.0', 3]]) blocked.addSubnet(ip, prefix, 'ipv4');
const globalV6 = new BlockList();
globalV6.addSubnet('2000::', 3, 'ipv6');
blocked.addSubnet('2001::', 23, 'ipv6');
blocked.addSubnet('2001:db8::', 32, 'ipv6');
blocked.addSubnet('2002::', 16, 'ipv6');
const publicIP = ip => isIP(ip) === 4 ? !blocked.check(ip, 'ipv4') : isIP(ip) === 6 && globalV6.check(ip, 'ipv6') && !blocked.check(ip, 'ipv6');

export function normalizeEventUrl(value) {
    let url;
    try { url = new URL(value); } catch { throw new Error('Please paste a valid event page URL.'); }
    if (!['https:', 'http:'].includes(url.protocol) || url.username || url.password) throw new Error('Only public HTTP/HTTPS event links are supported.');
    const host = url.hostname.replace(/^\[|\]$/g, '');
    if (host === 'localhost' || (isIP(host) && !publicIP(host))) throw new Error('Only public event links are supported.');
    url.hash = '';
    for (const key of [...url.searchParams.keys()]) if (/^utm_|^(fbclid|gclid)$/i.test(key)) url.searchParams.delete(key);
    if (/^(?:(?:www|api)\.)?(?:unstop\.com|dare2compete\.com)$/.test(host)) {
        const id = url.pathname.match(/^\/o\/(\d+)\/?$/)?.[1]
            || url.pathname.match(/^\/(?:hackathons|competitions|workshops|conferences|quizzes|events)\/[^/]+-(\d+)\/?$/)?.[1];
        if (id) return `https://unstop.com/o/${id}`;
    }
    return url.href.replace(/\/$/, '');
}

export function externalEventUrlPattern(value) {
    const url = normalizeEventUrl(value);
    const unstopId = url.match(/^https:\/\/unstop\.com\/o\/(\d+)$/)?.[1];
    if (unstopId) return new RegExp(`^https?://(?:(?:www|api)\\.)?(?:unstop\\.com|dare2compete\\.com)/(?:o/|[^?#]*-)${unstopId}/?(?:[?#].*)?$`, 'i');
    return new RegExp('^' + url.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '/?$');
}

export function detectPlatform(value) {
    const host = new URL(value).hostname.toLowerCase();
    const platforms = { 'unstop.com': 'Unstop', 'dare2compete.com': 'Unstop', 'devfolio.co': 'Devfolio', 'devpost.com': 'Devpost', 'hackerearth.com': 'HackerEarth', 'mlh.io': 'MLH', 'eventbrite.com': 'Eventbrite', 'lu.ma': 'Luma', 'luma.com': 'Luma' };
    return Object.entries(platforms).find(([domain]) => host === domain || host.endsWith(`.${domain}`))?.[1] || 'Other';
}

async function fetchPage(value, { unstopPublicPage = false } = {}) {
    let url = normalizeEventUrl(value);
    // Unstop's public HTML/AMP page exposes the same event without needing
    // its JavaScript app. Always derive this address from a verified event ID.
    // Resolve and pin each connection, including redirects, to a public address.
    for (let redirect = 0; redirect <= 5; redirect++) {
        if (unstopPublicPage && /^https:\/\/unstop\.com\/o\/\d+$/.test(url)) url = url.replace('https://unstop.com/', 'https://api.unstop.com/');
        const host = new URL(url).hostname.replace(/^\[|\]$/g, '');
        const addresses = await lookup(host, { all: true });
        if (!addresses.length || addresses.some(({ address }) => !publicIP(address))) throw new Error('Only public event links are supported.');
        const pinnedLookup = (_host, options, callback) => options.all
            ? callback(null, [addresses[0]]) : callback(null, addresses[0].address, addresses[0].family);
        const response = await axios.get(url, {
            timeout: 15000, maxRedirects: 0, maxContentLength: 5 * 1024 * 1024,
            proxy: false,
            httpAgent: new http.Agent({ lookup: pinnedLookup }),
            httpsAgent: new https.Agent({ lookup: pinnedLookup }),
            headers: { Accept: 'application/json, text/plain, */*' },
            validateStatus: status => status >= 200 && status < 400,
        });
        if (response.status >= 300) {
            if (!response.headers.location) throw new Error('The event page returned an invalid redirect.');
            url = normalizeEventUrl(new URL(response.headers.location, url).href);
            continue;
        }
        return { html: response.data, url };
    }
    throw new Error('The event link redirects too many times.');
}

const text = value => {
    if (typeof value !== 'string') return '';
    let cleaned = cheerio.load(value).text();
    // Some providers HTML-encode their JSON-LD descriptions a second time.
    if (/<\/?[a-z][^>]*>/i.test(cleaned)) cleaned = cheerio.load(cleaned).text();
    return cleaned.replace(/\\n|\s+/g, ' ').trim();
};
const dateValue = value => {
    if (!value || !['string', 'number'].includes(typeof value)) return null;
    const date = new Date(typeof value === 'number' && value < 1e12 ? value * 1000 : value);
    return Number.isNaN(date.getTime()) ? null : date.toISOString();
};
function imageValue(value, base) {
    if (Array.isArray(value)) value = value[0];
    if (value && typeof value === 'object') value = value.url || value.contentUrl || value.secure_url;
    if (typeof value !== 'string' || !value.trim()) return '';
    try { const url = new URL(value, base); return ['http:', 'https:'].includes(url.protocol) ? url.href : ''; } catch { return ''; }
}
function locationValue(value) {
    if (Array.isArray(value)) return value.map(locationValue).filter(Boolean).join(' / ');
    if (typeof value === 'string') return text(value);
    if (!value || typeof value !== 'object') return '';
    if (value['@type'] === 'VirtualLocation') return 'Online';
    const address = value.address;
    return [...new Set([text(value.name), typeof address === 'string' ? text(address) : [address?.streetAddress, address?.addressLocality, address?.addressRegion, address?.addressCountry?.name || address?.addressCountry].map(text).filter(Boolean).join(', ')].filter(Boolean))].join(', ');
}
function findEvent(value, depth = 0) {
    if (!value || typeof value !== 'object' || depth > 15) return null;
    const types = [value['@type']].flat();
    if (types.some(type => typeof type === 'string' && /Event$/.test(type))) return value;
    for (const child of Object.values(value)) { const event = findEvent(child, depth + 1); if (event) return event; }
    return null;
}
function categoryValue(title, description) {
    const content = `${title} ${description}`;
    for (const [pattern, category] of [[/hackathon/i, 'Hackathon'], [/workshop|bootcamp/i, 'Workshop'], [/seminar|webinar|conference|\btalk\b/i, 'Seminar'], [/tournament|competition|contest|challenge/i, 'Tournament'], [/meetup|networking/i, 'Meetup'], [/gaming|esport/i, 'Game'], [/sport|cricket|football/i, 'Sport']]) if (pattern.test(content)) return category;
    return '';
}

function unstopDetails($) {
    const details = $('.details .default-editor, .details .detail-page').first().clone();
    details.find('br').replaceWith('\n');
    details.find('p, li').append('\n');
    const lines = details.text().split(/\n+/).map(line => line.trim()).filter(Boolean);
    const labelledDate = lines.find(line => /^(?:event\s+date|dates?|starts?\s+on)\s*:/i.test(line));
    const datePart = labelledDate?.match(/\b(\d{1,2})(?:st|nd|rd|th)?\s+([A-Za-z]+),?\s+(\d{4})\b/i);
    const date = datePart ? dateValue(`${datePart[1]} ${datePart[2]} ${datePart[3]} UTC`) : null;
    const locationLine = lines.find(line => /^(?:venue|location)\s*:/i.test(line))
        || lines.find(line => /^(?:mode|event\s+mode)\s*:/i.test(line));
    const location = locationLine ? locationLine.replace(/^[^:]+:\s*/, '').trim() : '';
    return { description: text(details.html()), date, location };
}

// Pure extraction is shared by every platform: Event JSON-LD takes precedence
// over site-wide metadata, followed by embedded event state and visible content.
export function extractEventMetadata(html, url) {
    const $ = cheerio.load(typeof html === 'string' ? html : '');
    const meta = name => $(`meta[property="${name}"], meta[name="${name}"]`).first().attr('content') || '';
    let structured = null;
    $('script[type="application/ld+json"]').each((_, element) => {
        try { structured ||= findEvent(JSON.parse($(element).html())); } catch { /* Ignore malformed unrelated scripts. */ }
    });
    let embedded = typeof html === 'object' && html ? html : {};
    try {
        const props = JSON.parse($('#__NEXT_DATA__').html() || '{}')?.props?.pageProps;
        embedded = props?.hackathon || props?.event || props?.data?.hackathon || props?.data?.event || (props?.data?.name ? props.data : embedded);
    } catch { /* Metadata may still be available. */ }
    const event = structured || {};
    const platform = detectPlatform(url);
    const platformDetails = platform === 'Unstop' ? unstopDetails($) : {};
    const title = text(event.name || embedded.name || embedded.title || meta('og:title') || meta('twitter:title') || $('h1').first().text() || $('title').text())
        .replace(/\s*[|–-]\s*(Unstop|Dare2Compete|Devfolio|Devpost|HackerEarth|MLH|Eventbrite|Luma).*$/i, '').trim();
    const description = text(event.description || embedded.description || embedded.tagline || platformDetails.description || meta('og:description') || meta('twitter:description') || meta('description') || $('[itemprop="description"]').first().text());
    const pageTitle = text($('title').text());
    if (!title || /^(just a moment|access denied|attention required|security check|sign in|log in|page not found|404|enable javascript)/i.test(title) || /just a moment|access denied|attention required|page not found/i.test(pageTitle) || (platform !== 'Other' && title.toLowerCase() === platform.toLowerCase())) {
        throw new Error('This page does not expose event details. It may require JavaScript, sign-in, or block automated access. Please use the direct public event page.');
    }
    if (!structured && !embedded.name && !embedded.title && !description) throw new Error('No event details were found. Please paste a direct public event page link.');
    const date = dateValue(event.startDate || embedded.starts_at || embedded.start_date || embedded.startDate || platformDetails.date || $('[itemprop="startDate"]').first().attr('content') || $('time[itemprop="startDate"], time.event-date, time.start-date').first().attr('datetime') || meta('event:start_time'));
    const location = embedded.is_online === true || /OnlineEventAttendanceMode$/.test(event.eventAttendanceMode || '')
        ? 'Online' : locationValue(event.location || embedded.location || embedded.city) || platformDetails.location || '';
    const imageUrl = imageValue(event.image, url) || imageValue(embedded.cover_img || embedded.cover_image || embedded.image || embedded.logo, url) || imageValue(meta('og:image') || meta('twitter:image') || $('[itemprop="image"]').first().attr('src'), url);
    const category = categoryValue(title, description);
    const positiveInt = value => Number.isInteger(Number(value)) && Number(value) > 0 && Number(value) <= 50 ? Number(value) : null;
    const body = $('body').clone();
    body.find('script, style, nav, footer, .featured-opp, .similar-opp, .related-opp').remove();
    const teamPattern = /teams?\s*(?:size|of|are|must\s+have|consist\s+of)\s*:?\s*(\d+)\s*(?:-|–|to)\s*(\d+)/i;
    const team = description.match(teamPattern) || body.text().match(teamPattern);
    const maxTeamSize = positiveInt(embedded.team_max || embedded.max_team_size || team?.[2]);
    const minTeamSize = positiveInt(embedded.team_min || embedded.min_team_size || team?.[1]);
    return {
        title, description, imageUrl, date, location, category,
        // Ticket prices (Event.offers.price) are not prize money.
        prize: text(embedded.prize), maxTeamSize, minTeamSize, platform, externalUrl: url,
        missingFields: Object.entries({ description, date, location, category, imageUrl }).filter(([, value]) => !value).map(([key]) => key),
    };
}

export async function scrapeEventFromUrl(value) {
    try {
        const normalized = normalizeEventUrl(value);
        const unstop = /^https:\/\/unstop\.com\/o\/\d+$/.test(normalized);
        const { html, url } = await fetchPage(normalized, { unstopPublicPage: unstop });
        return extractEventMetadata(html, unstop ? normalized : url);
    } catch (error) {
        if (error.isAxiosError) throw new Error(`Could not read the event page${error.response?.status ? ` (HTTP ${error.response.status})` : ''}. The site may block automated access. Please try a direct public event link.`);
        throw error;
    }
}
