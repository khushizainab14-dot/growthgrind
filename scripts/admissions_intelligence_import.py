"""Seed verified course-source records from the existing public catalogue.

Requirement fields remain blank until extracted from an official course page;
this avoids inventing admissions requirements.
"""
import os
from supabase import create_client

client = create_client(os.environ['SUPABASE_URL'], os.environ['SUPABASE_KEY'])
rows = client.table('university_courses').select('provider_name,course_title,course_url,source_updated_at').limit(1000).execute().data or []
for row in rows:
    client.table('admissions_intelligence').upsert({
        'university': row['provider_name'], 'course': row['course_title'],
        'official_source_url': row['course_url'], 'last_checked_at': row.get('source_updated_at') or 'now()',
    }, on_conflict='university,course').execute()
print(f'Seeded {len(rows)} official course sources.')
