#!/usr/bin/env python3
"""Import current individual opportunities from The R3cruit's 16–18 page.

The directory includes historic listings, so this importer skips entries marked
closed and entries whose deadline or dated event has passed. It stores a short
summary and the direct application/details link rather than one generic card.
"""
import argparse
import os
import re
from datetime import date, datetime
from html.parser import HTMLParser
from urllib.parse import urljoin, urlparse
from urllib.request import Request, urlopen

SOURCE_URL = 'https://ther3cruit.co.uk/16-18-opportunities/'
MONTHS = 'january|february|march|april|may|june|july|august|september|october|november|december'
DATE_PATTERN = re.compile(rf'\b(\d{{1,2}})(?:st|nd|rd|th)?\s+({MONTHS})\s+(20\d{{2}})\b', re.I)
MONTH_FIRST_DATE_PATTERN = re.compile(rf'\b({MONTHS})\s+(\d{{1,2}})(?:st|nd|rd|th)?[,]?\s+(20\d{{2}})\b', re.I)

def clean(value):
    return re.sub(r'\s+', ' ', (value or '').replace('Ξ', 'E').replace('Λ', 'A').replace('Я', 'R')).strip()

def date_values(value):
    values = []
    for day, month, year in DATE_PATTERN.findall(value or ''):
        try:
            values.append(datetime.strptime(f'{day} {month} {year}', '%d %B %Y').date())
        except ValueError:
            pass
    for month, day, year in MONTH_FIRST_DATE_PATTERN.findall(value or ''):
        try:
            values.append(datetime.strptime(f'{day} {month} {year}', '%d %B %Y').date())
        except ValueError:
            pass
    return values

class DirectoryParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.entries = []; self.current = None; self.in_heading = False; self.heading = []; self.link_href = None; self.link_text = []; self.skip = 0
    def finish_current(self):
        if self.current and self.current['title'] and self.current['links']: self.entries.append(self.current)
        self.current = None
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript'): self.skip += 1
        if tag == 'h3': self.in_heading, self.heading = True, []
        if tag == 'a' and self.current: self.link_href, self.link_text = dict(attrs).get('href'), []
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript') and self.skip: self.skip -= 1
        if tag == 'h3' and self.in_heading:
            title = clean(' '.join(self.heading)); self.in_heading = False
            if title:
                self.finish_current(); self.current = {'title': title, 'text': [], 'links': []}
        if tag == 'a' and self.current and self.link_href:
            self.current['links'].append((clean(' '.join(self.link_text)), self.link_href)); self.link_href, self.link_text = None, []
    def handle_data(self, data):
        if self.skip: return
        if self.in_heading: self.heading.append(data)
        elif self.link_href is not None: self.link_text.append(data)
        elif self.current: self.current['text'].append(data)
    def close(self):
        super().close(); self.finish_current()

class VisibleTextParser(HTMLParser):
    def __init__(self):
        super().__init__(); self.parts = []; self.skip = 0
    def handle_starttag(self, tag, attrs):
        if tag in ('script', 'style', 'noscript', 'svg'): self.skip += 1
    def handle_endtag(self, tag):
        if tag in ('script', 'style', 'noscript', 'svg') and self.skip: self.skip -= 1
    def handle_data(self, data):
        if not self.skip: self.parts.append(data)

class DetailParser(VisibleTextParser):
    def __init__(self):
        super().__init__(); self.links = []; self.href = None; self.label = []
    def handle_starttag(self, tag, attrs):
        super().handle_starttag(tag, attrs)
        if tag == 'a' and not self.skip:
            self.href, self.label = dict(attrs).get('href'), []
    def handle_data(self, data):
        super().handle_data(data)
        if self.href is not None and not self.skip: self.label.append(data)
    def handle_endtag(self, tag):
        if tag == 'a' and self.href:
            self.links.append((clean(' '.join(self.label)), self.href)); self.href, self.label = None, []
        super().handle_endtag(tag)

def between(text, label, next_labels):
    position = text.upper().find(label)
    if position < 0: return ''
    start, end = position + len(label), len(text)
    for next_label in next_labels:
        found = text.upper().find(next_label, start)
        if found >= 0: end = min(end, found)
    return clean(text[start:end].lstrip(':'))

def activity_type(value):
    text = value.lower()
    if 'insight' in text: return 'Insight Day'
    if 'virtual' in text: return 'Virtual Work Experience'
    if 'work experience' in text: return 'Work Experience'
    return 'Careers Programme'

def subjects(value):
    text, tags = value.lower(), []
    for word, label in (('finance', 'Finance'), ('bank', 'Finance'), ('audit', 'Finance'), ('account', 'Finance'), ('technology', 'Technology'), ('stem', 'STEM'), ('engineering', 'Engineering'), ('law', 'Law')):
        if word in text and label not in tags: tags.append(label)
    return ', '.join(tags or ['Careers', 'Business'])

def years(value):
    found = sorted({int(item) for item in re.findall(r'YEAR\s*(\d{1,2})', value.upper())})
    return ', '.join(f'Year {item}' for item in found) or None

def detail_page(url):
    request = Request(url, headers={'User-Agent': 'GrowthGrindOpportunityBot/1.0 (+https://growthgrind.co.uk)'})
    with urlopen(request, timeout=20) as response:
        html = response.read().decode(response.headers.get_content_charset() or 'utf-8', errors='replace')
    parser = DetailParser(); parser.feed(html)
    return clean(' '.join(parser.parts)), parser.links

def provider_link(detail_url, links):
    social_hosts = ('twitter.com', 'facebook.com', 'instagram.com', 'linkedin.com', 'youtube.com')
    for label, href in links:
        full = urljoin(detail_url, href)
        host = (urlparse(full).hostname or '').lower().removeprefix('www.')
        if not host or host.endswith('ther3cruit.co.uk') or any(host.endswith(social) for social in social_hosts):
            continue
        if re.search(r'apply|register|application|sign up|how to apply|more details', label, re.I):
            return full
    return detail_url

def expiration_dates(text):
    match = re.search(r'expiration\s+date\s*:\s*(.{0,80})', text, re.I)
    return date_values(match.group(1)) if match else []

def parse_entries(html):
    parser = DirectoryParser(); parser.feed(html); parser.close(); today = date.today(); output = []
    for entry in parser.entries:
        text = clean(' '.join(entry['text']))
        links = [(label, urljoin(SOURCE_URL, href)) for label, href in entry['links'] if href]
        labels = ' '.join(label for label, _ in links).lower()
        if re.search(r'\b(closed|now closed)\b', labels): continue
        direct = next(((label, href) for label, href in links if re.search(r'apply|register|details|learn more', label, re.I)), None)
        if not direct: continue
        try:
            details, detail_links = detail_page(direct[1])
        except Exception:
            # Do not create a listing we cannot verify at the individual page.
            continue
        if re.search(r'\b(closed|applications?\s+closed)\b', details, re.I):
            continue
        deadline_text = between(text, 'DEADLINE', ('DURATION', 'OPEN TO', 'TYPE'))
        all_dates, deadline_dates = date_values(text), date_values(deadline_text)
        exact_expiry = expiration_dates(details)
        if exact_expiry and max(exact_expiry) < today:
            continue
        if deadline_dates and max(deadline_dates) < today: continue
        if not deadline_dates and all_dates and max(all_dates) < today: continue
        type_text = between(text, 'TYPE', ('DEADLINE', 'DURATION', 'OPEN TO'))
        open_to = between(text, 'OPEN TO', ('TYPE', 'DEADLINE', 'DURATION'))
        summary = text
        for field in (type_text, deadline_text, open_to):
            if field: summary = summary.replace(field, '')
        summary = clean(re.sub(r'(TYPE|DEADLINE|DURATION|OPEN TO)\s*:', '', summary))
        if len(summary) > 350: summary = summary[:347].rsplit(' ', 1)[0] + '…'
        live_dates = exact_expiry or deadline_dates
        destination = provider_link(direct[1], detail_links)
        output.append({'title': f"{entry['title'].title()} — {type_text.title() if type_text else 'Opportunity'}", 'provider': entry['title'].title(), 'category': 'Careers', 'activity_type': activity_type(type_text), 'location': 'UK', 'format': 'Online and in-person / check provider', 'age_range': open_to or 'Check provider eligibility', 'year_groups': years(open_to), 'deadline': max(live_dates).isoformat() if live_dates else None, 'cost': 'Check provider', 'interests': None, 'subjects': subjects(f'{entry["title"]} {type_text} {summary}'), 'link': destination, 'description': summary or 'Individual opportunity listed by The R3cruit. Check the provider page for current details and eligibility.', 'is_active': True})
    return list({row['link']: row for row in output}.values())

def fetch_page():
    request = Request(SOURCE_URL, headers={'User-Agent': 'GrowthGrindOpportunityBot/1.0 (+https://growthgrind.co.uk)'})
    with urlopen(request, timeout=20) as response:
        return response.read().decode(response.headers.get_content_charset() or 'utf-8', errors='replace')

def upload(rows):
    from supabase import create_client
    url, key = os.environ.get('SUPABASE_URL'), os.environ.get('SUPABASE_KEY')
    if not url or not key: raise SystemExit('Set SUPABASE_URL and SUPABASE_KEY before importing.')
    client = create_client(url, key)
    # Retire the generic card and older detail-page cards from previous runs.
    # The refreshed records below use the actual provider/application URL.
    client.table('opportunities').update({'is_active': False}).like('link', 'https://ther3cruit.co.uk/%').execute()
    for row in rows:
        existing = client.table('opportunities').select('id').eq('link', row['link']).limit(1).execute()
        if existing.data: client.table('opportunities').update(row).eq('id', existing.data[0]['id']).execute()
        else: client.table('opportunities').insert(row).execute()

def main():
    parser = argparse.ArgumentParser(); parser.add_argument('--dry-run', action='store_true'); args = parser.parse_args()
    rows = parse_entries(fetch_page())
    print(f'Prepared {len(rows)} current individual R3cruit opportunities.')
    for row in rows: print(f"- {row['title']} → {row['link']}")
    if not args.dry_run: upload(rows)

if __name__ == '__main__': main()
