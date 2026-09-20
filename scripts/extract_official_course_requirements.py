"""Cautiously extract standard A-level offers from official university course pages.

This deliberately uses only the course URL already held in GrowthGrind's
catalogue, requests a small rotating batch each day, follows no redirects, and
writes nothing unless it finds both an entry-requirements section and a standard
three A-level offer. It is a convenience layer, not a substitute for the live
official page linked to each student.
"""

import os
import re
from datetime import UTC, datetime
from html.parser import HTMLParser
from urllib.parse import urlparse
from urllib.request import HTTPRedirectHandler, Request, build_opener

from supabase import create_client


# One read-only request per course page. At 100 rotating pages per day the
# catalogue gains coverage materially faster without repeatedly requesting the
# same provider page or accepting unverified content.
BATCH_SIZE = int(os.environ.get('COURSE_REQUIREMENTS_BATCH_SIZE', '100'))
OFFER_PATTERN = re.compile(r'(?<![A-Z*])(?:A\*|[A-E])\s*(?:A\*|[A-E])\s*(?:A\*|[A-E])(?![A-Z*])')


class TextExtractor(HTMLParser):
    def __init__(self):
        super().__init__()
        self.parts = []
        self.skip_depth = 0

    def handle_starttag(self, tag, attrs):
        if tag in {'script', 'style', 'noscript', 'svg'}:
            self.skip_depth += 1

    def handle_endtag(self, tag):
        if tag in {'script', 'style', 'noscript', 'svg'} and self.skip_depth:
            self.skip_depth -= 1

    def handle_data(self, data):
        if not self.skip_depth:
            self.parts.append(data)


class NoRedirect(HTTPRedirectHandler):
    def redirect_request(self, request, fp, code, msg, headers, newurl):
        return None


def allowed_url(value):
    parsed = urlparse(value or '')
    host = parsed.hostname.lower() if parsed.hostname else ''
    return parsed.scheme == 'https' and (host == 'ac.uk' or host.endswith('.ac.uk'))


def page_text(url):
    request = Request(url, headers={'User-Agent': 'GrowthGrindAdmissionsBot/1.0 (+https://growthgrind.vercel.app)'} )
    opener = build_opener(NoRedirect)
    with opener.open(request, timeout=10) as response:
        if not 200 <= response.status < 300:
            return ''
        content_type = response.headers.get('Content-Type', '')
        if 'html' not in content_type.lower():
            return ''
        html = response.read(1_500_000).decode(response.headers.get_content_charset() or 'utf-8', errors='replace')
    parser = TextExtractor()
    parser.feed(html)
    return re.sub(r'\s+', ' ', ' '.join(parser.parts)).strip()


def extract(text):
    start_match = re.search(r'\b(entry requirements?|academic requirements?|typical offer)\b', text, re.I)
    if not start_match:
        return None
    excerpt = text[start_match.start():start_match.start() + 1_400]
    end_match = re.search(r'\b(fees?(?: and funding)?|how to apply|course details|modules?|student life|accommodation)\b', excerpt[100:], re.I)
    if end_match:
        excerpt = excerpt[:end_match.start() + 100]
    offer_match = OFFER_PATTERN.search(excerpt)
    if not offer_match:
        return None
    offer = re.sub(r'\s+', '', offer_match.group(0))
    # Preserve enough surrounding official wording to reveal subject conditions,
    # without copying a whole course page into GrowthGrind.
    return offer, excerpt[:850].strip()


def main():
    service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    url = os.environ.get('SUPABASE_URL')
    if not service_key or not url:
        raise SystemExit('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before running this secure importer.')

    client = create_client(url, service_key)
    count_response = client.table('admissions_intelligence').select('id', count='exact').is_('a_level_offer', 'null').execute()
    pending = count_response.count or 0
    if not pending:
        print('No course records are waiting for a standard A-level offer.')
        return

    offset = (datetime.now(UTC).toordinal() * BATCH_SIZE) % pending
    rows = client.table('admissions_intelligence').select('id, official_source_url').is_('a_level_offer', 'null').order('id').range(offset, min(offset + BATCH_SIZE - 1, pending - 1)).execute().data or []
    if len(rows) < BATCH_SIZE and offset:
        rows += client.table('admissions_intelligence').select('id, official_source_url').is_('a_level_offer', 'null').order('id').range(0, BATCH_SIZE - len(rows) - 1).execute().data or []

    saved = 0
    for row in rows:
        if not allowed_url(row.get('official_source_url')):
            continue
        try:
            extracted = extract(page_text(row['official_source_url']))
        except Exception as error:
            print(f"Skipped {row['id']}: {type(error).__name__}")
            continue
        if not extracted:
            continue
        offer, excerpt = extracted
        client.table('admissions_intelligence').update({
            'a_level_offer': offer,
            'required_subjects': excerpt,
            'last_checked_at': datetime.now(UTC).isoformat(),
        }).eq('id', row['id']).execute()
        saved += 1
    print(f'Checked {len(rows)} official pages; saved {saved} confident standard offers.')


if __name__ == '__main__':
    main()
