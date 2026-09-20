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

    payload = [
        {
            'university': row['provider_name'],
            'course': row['course_title'],
            'official_source_url': row['course_url'],
            'last_checked_at': row.get('source_updated_at'),
        }
        for row in rows
        if row.get('provider_name') and row.get('course_title') and row.get('course_url')
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
