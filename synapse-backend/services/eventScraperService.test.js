import test from 'node:test';
import assert from 'node:assert/strict';
import { extractEventMetadata, normalizeEventUrl, detectPlatform, externalEventUrlPattern } from './eventScraperService.js';

const url = 'https://example.com/events/demo';
test('nested JSON-LD event wins over site metadata, with array images and address', () => {
    const event = { '@type': ['Thing', 'EducationEvent'], name: 'Real Workshop', description: '<p>Build real things.</p>', startDate: '2026-12-10T10:00:00+05:30', image: [{ url: '/images/event.png' }], location: { name: 'Main Hall', address: { addressLocality: 'Bengaluru', addressCountry: 'IN' } }, offers: { price: 500 } };
    const result = extractEventMetadata(`<meta property="og:title" content="Generic site"><script type="application/ld+json">${JSON.stringify({ '@graph': [{ '@type': 'Organization', name: 'Site' }, event] })}</script>`, url);
    assert.equal(result.title, 'Real Workshop');
    assert.equal(result.description, 'Build real things.');
    assert.equal(result.date, '2026-12-10T04:30:00.000Z');
    assert.equal(result.imageUrl, 'https://example.com/images/event.png');
    assert.equal(result.location, 'Main Hall, Bengaluru, IN');
    assert.equal(result.category, 'Workshop');
    assert.equal(result.prize, '');
});
test('missing values stay missing rather than fabricated', () => {
    const result = extractEventMetadata('<meta property="og:title" content="Community gathering"><meta name="description" content="Meet local builders">', url);
    assert.equal(result.date, null);
    assert.equal(result.location, '');
    assert.equal(result.imageUrl, '');
    assert.equal(result.category, '');
    assert.equal(result.maxTeamSize, null);
    assert.ok(result.missingFields.includes('date'));
});
test('blocked, empty and generic platform pages cannot become events', () => {
    for (const html of ['', '<title>Just a moment...</title>', '<title>Access denied</title><h1>Error</h1>', '<title>404 Not Found</title>']) assert.throws(() => extractEventMetadata(html, url));
    assert.throws(() => extractEventMetadata('<title>Devfolio</title><meta name="description" content="Discover hackathons">', 'https://devfolio.co'));
});
test('embedded Devfolio data and relative social image are extracted', () => {
    const data = { props: { pageProps: { hackathon: { name: 'Actual Hackathon', tagline: 'A real event', starts_at: '2026-12-20', is_online: true, team_min: 2, team_max: 6 } } } };
    const result = extractEventMetadata(`<meta property="og:image" content="//cdn.example.com/banner.jpg"><script id="__NEXT_DATA__">${JSON.stringify(data)}</script>`, 'https://actual.devfolio.co');
    assert.equal(result.title, 'Actual Hackathon');
    assert.equal(result.location, 'Online');
    assert.equal(result.maxTeamSize, 6);
    assert.equal(result.minTeamSize, 2);
    assert.equal(result.imageUrl, 'https://cdn.example.com/banner.jpg');
});
test('unrelated numbers and ticket prices are never treated as teams or prizes', () => {
    const result = extractEventMetadata('<h1>Hackathon</h1><p>Dates 10-12 November; 500 participants; tickets $20</p><time datetime="2020-01-01">Page published</time><meta name="description" content="Join us">', url);
    assert.equal(result.maxTeamSize, null);
    assert.equal(result.prize, '');
    assert.equal(result.date, null);
});
test('URLs preserve case-sensitive paths and remove tracking, private links are refused', () => {
    assert.equal(normalizeEventUrl('https://Example.com/Event/AbC?utm_source=share&ticket=One#top'), 'https://example.com/Event/AbC?ticket=One');
    for (const bad of ['file:///etc/passwd', 'http://localhost/a', 'http://127.0.0.1/a', 'http://[::1]/', 'http://169.254.169.254/', 'https://user:pass@example.com']) assert.throws(() => normalizeEventUrl(bad));
    assert.equal(detectPlatform('https://unstop.com.evil.example/test'), 'Other');
    assert.equal(detectPlatform('https://demo.devfolio.co'), 'Devfolio');
});

test('Unstop short, full and older domain URLs identify the same event', () => {
    const short = 'https://unstop.com/o/1760407';
    const full = 'https://unstop.com/hackathons/axion-hackathon-stampers-1760407';
    assert.equal(normalizeEventUrl(full + '?utm_source=share'), short);
    assert.equal(normalizeEventUrl('https://api.unstop.com/o/1760407'), short);
    assert.equal(normalizeEventUrl('https://dare2compete.com/hackathons/axion-1760407'), short);
    const pattern = externalEventUrlPattern(short);
    assert.ok(pattern.test(full));
    assert.ok(pattern.test(short));
    assert.ok(!pattern.test('https://unstop.com/o/17604070'));
    assert.ok(!pattern.test('https://unstop.com.evil.example/o/1760407'));
    assert.ok(!externalEventUrlPattern('https://example.com/Event/AbC').test('https://example.com/event/abc'));
});

test('Unstop reads labelled event date and mode instead of registration dates or recommendations', () => {
    const html = `<title>AXION Hackathon</title><meta property="og:image" content="/banner.png">
        <div class="details"><div class="default-editor"><p>Date: 11 October 2026<br>Mode: Online<br>Team Size: 2–4 Members</p></div></div>
        <div id="dates-tab">Registration Deadline 10 October 2026</div><div class="featured-opp">Offline workshop 20 December 2026</div>`;
    const result = extractEventMetadata(html, 'https://unstop.com/o/1760407');
    assert.equal(result.date, '2026-10-11T00:00:00.000Z');
    assert.equal(result.location, 'Online');
    assert.equal(result.minTeamSize, 2);
    assert.equal(result.maxTeamSize, 4);
    assert.equal(result.imageUrl, 'https://unstop.com/banner.png');
});

test('ordinal Unstop dates are extracted but unrelated Online labels never become the event mode', () => {
    const result = extractEventMetadata('<title>AI Hackathon</title><div class="details"><div class="default-editor"><li>Dates: 31st Oct, 2026 (Saturday)</li></div></div><div class="featured-opp">Online</div>', 'https://unstop.com/o/1771427');
    assert.equal(result.date, '2026-10-31T00:00:00.000Z');
    assert.equal(result.location, '');
});

test('Devpost encoded descriptions are cleaned and attendance mode wins over placeholder location names', () => {
    const event = { '@type': 'Event', name: 'SASEhack 2026', description: '&lt;p&gt;A hackathon. Teams are 1 to 4 people.&lt;/p&gt;', startDate: '2026-09-18T20:00:00-04:00', location: { name: 'SASEhack 2026' }, eventAttendanceMode: 'https://schema.org/OnlineEventAttendanceMode' };
    const result = extractEventMetadata(`<script type="application/ld+json">${JSON.stringify(event)}</script>`, 'https://sasehack-2026.devpost.com/');
    assert.equal(result.description, 'A hackathon. Teams are 1 to 4 people.');
    assert.equal(result.location, 'Online');
    assert.equal(result.minTeamSize, 1);
    assert.equal(result.maxTeamSize, 4);
});
