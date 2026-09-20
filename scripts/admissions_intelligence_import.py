"""Seed verified course-source records from the existing public catalogue.

Requirement fields remain blank until extracted from an official course page;
this avoids inventing admissions requirements.
"""
import os
from supabase import create_client

service_key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
if not service_key:
    raise SystemExit('Set SUPABASE_SERVICE_ROLE_KEY before running this secure importer.')

client = create_client(os.environ['SUPABASE_URL'], service_key)
page_size = 1000
offset = 0
seeded = 0

while True:
    result = (
        client.table('university_courses')
        .select('provider_name,course_title,course_url,source_updated_at')
        .range(offset, offset + page_size - 1)
        .execute()
    )
    rows = result.data or []
    if not rows:
        break

    # The public catalogue can contain the same university/course combination
    # more than once. PostgreSQL rejects duplicate conflict keys in one upsert,
    # so retain one current official URL per combination.
    unique_rows = {}
    for row in rows:
        if not (row.get('provider_name') and row.get('course_title') and row.get('course_url')):
            continue
        key = (row['provider_name'].strip().casefold(), row['course_title'].strip().casefold())
        current = unique_rows.get(key)
        if not current or (row.get('source_updated_at') or '') >= (current.get('source_updated_at') or ''):
            unique_rows[key] = row

    payload = [
        {
            'university': row['provider_name'],
            'course': row['course_title'],
            'official_source_url': row['course_url'],
            'last_checked_at': row.get('source_updated_at'),
        }
        for row in unique_rows.values()
    ]
    if payload:
        client.table('admissions_intelligence').upsert(
            payload, on_conflict='university,course'
        ).execute()
        seeded += len(payload)

    if len(rows) < page_size:
        break
    offset += page_size

print(f'Seeded or updated {seeded} official course-source records.')
