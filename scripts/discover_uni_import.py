#!/usr/bin/env python3
"""Import the public HESA Discover Uni ZIP into Supabase.

Usage:
  SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
    python3 scripts/discover_uni_import.py --file DiscoverUni.zip

The raw data is HESA Discover Uni data, used under CC BY 4.0. This importer
intentionally stores university course-page URLs rather than copying course copy.
"""
import argparse
import csv
import io
import json
import os
import sys
import urllib.parse
import urllib.request
import zipfile
from datetime import datetime, timezone


def pick(row, *names):
    lowered = {str(key).lower().replace('.', '').replace('_', ''): value for key, value in row.items()}
    for name in names:
        value = lowered.get(name.lower().replace('.', '').replace('_', ''))
        if value:
            return str(value).strip()
    return ''


def read_csv(archive, contains):
    candidates = [name for name in archive.namelist() if name.lower().endswith('.csv') and contains.lower() in name.lower()]
    if not candidates:
        return []
    with archive.open(candidates[0]) as raw:
        return list(csv.DictReader(io.TextIOWrapper(raw, encoding='utf-8-sig', newline='')))


def provider_names(rows):
    names = {}
    for row in rows:
        key = pick(row, 'PUBUKPRN', 'UKPRN', 'Institution.PUBUKPRN', 'Institution.UKPRN')
        name = pick(row, 'INSTNAME', 'INSTITUTIONNAME', 'PROVIDERNAME', 'Institution.INSTNAME', 'Institution.PROVIDERNAME')
        if key and name:
            names[key] = name
    return names


def mode(value):
    return {'01': 'Full time', '1': 'Full time', '02': 'Part time', '2': 'Part time', '03': 'Both', '3': 'Both'}.get(value, value)


def build_courses(archive):
    providers = provider_names(read_csv(archive, 'Institution'))
    courses = read_csv(archive, 'KISCourse')
    now = datetime.now(timezone.utc).isoformat()
    output = []
    for row in courses:
        title = pick(row, 'TITLE', 'KISCourse.TITLE')
        provider_id = pick(row, 'PUBUKPRN', 'UKPRN', 'KISCourse.PUBUKPRN', 'Institution.PUBUKPRN')
        course_id = pick(row, 'KISCOURSEID', 'KISCourse.KISCOURSEID')
        url = pick(row, 'CRSEURL', 'KISCourse.CRSEURL')
        if not (title and course_id and url):
            continue
        course_mode = mode(pick(row, 'KISMODE', 'KISCourse.KISMODE'))
        provider = providers.get(provider_id) or pick(row, 'INSTNAME', 'PROVIDERNAME') or f'UK provider {provider_id}'
        subjects = [item for item in [pick(row, 'SBJ', 'KISCourse.SBJ'), pick(row, 'HECOS', 'KISCourse.HECOS')] if item]
        output.append({
            'source_course_id': f'{provider_id}-{course_id}-{course_mode or "all"}',
            'course_title': title,
            'provider_name': provider,
            'campus_name': pick(row, 'LOCNAME', 'LOCATIONNAME', 'CourseLocation.LOCNAME') or None,
            'country': {'E': 'England', 'S': 'Scotland', 'W': 'Wales', 'N': 'Northern Ireland'}.get(pick(row, 'COUNTRY', 'Institution.COUNTRY'), pick(row, 'COUNTRY', 'Institution.COUNTRY') or None),
            'qualification': pick(row, 'KISAIMLABEL', 'KISCourse.KISAIMLABEL', 'KISAIM') or None,
            'study_mode': course_mode or None,
            'duration': pick(row, 'NUMSTAGE', 'KISCourse.NUMSTAGE') or None,
            'subjects_text': '|'.join(subjects) or None,
            'course_url': url,
            'source_updated_at': now,
        })
    return output


def upload(url, key, courses):
    endpoint = url.rstrip('/') + '/rest/v1/university_courses?on_conflict=source_course_id'
    headers = {'apikey': key, 'Authorization': f'Bearer {key}', 'Content-Type': 'application/json', 'Prefer': 'resolution=merge-duplicates'}
    for start in range(0, len(courses), 500):
        payload = json.dumps(courses[start:start + 500]).encode()
        request = urllib.request.Request(endpoint, data=payload, headers=headers, method='POST')
        with urllib.request.urlopen(request) as response:
            if response.status not in (200, 201):
                raise RuntimeError(f'Supabase returned {response.status}')
        print(f'Imported {min(start + 500, len(courses))}/{len(courses)} courses')


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--file', required=True, help='Path to the HESA Discover Uni ZIP download')
    args = parser.parse_args()
    url = os.environ.get('SUPABASE_URL')
    key = os.environ.get('SUPABASE_SERVICE_ROLE_KEY')
    if not url or not key:
        sys.exit('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY before importing.')
    with zipfile.ZipFile(args.file) as archive:
        courses = build_courses(archive)
    if not courses:
        sys.exit('No courses found. Check that this is a current HESA Discover Uni ZIP.')
    upload(url, key, courses)


if __name__ == '__main__':
    main()
