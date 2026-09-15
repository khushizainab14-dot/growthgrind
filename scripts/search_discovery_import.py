#!/usr/bin/env python3
"""Discover new student opportunities from a trusted public-web search.

This is deliberately conservative. It searches for time-sensitive opportunity
pages but only imports a result when it comes from a trusted provider domain or
an official UK university domain. It never scrapes a search-engine results page,
imports PDFs, follows tracking URLs, or imports social-media posts.

Set TAVILY_API_KEY as a GitHub Actions secret to enable the scheduled
run. The key stays server-side; it is never sent to the GrowthGrind browser.
"""

import os
import re
import sys
from datetime import datetime, timezone
from html import unescape
from urllib.parse import urlparse, urlunparse
from urllib.request import Request, urlopen

from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
TAVILY_API_KEY = os.environ.get("TAVILY_API_KEY")

# Official higher-education domains plus organisations already selected for
# GrowthGrind. New domains must be reviewed and added here in source control.
TRUSTED_DOMAIN_SUFFIXES = (
    ".ac.uk",
    ".gov.uk",
    ".lta.org.uk",
    ".badmintonengland.co.uk",
    ".englandnetball.co.uk",
    ".englandathletics.org",
    ".englandrugby.com",
    ".englandhockey.co.uk",
    ".suttontrust.com",
    ".nuffieldresearchplacements.org",
    ".speakersforschools.org",
    ".springpod.com",
    ".theforage.com",
    ".futurelearn.com",
    ".open.edu",
    ".crestawards.org",
    ".ukmt.org.uk",
    ".dofe.org",
    ".youthsporttrust.org",
    ".londonyouthgames.org",
    ".youth.europa.eu",
    ".nationalsaturdayclub.org",
    ".thebrokerage.org.uk",
    ".ther3cruit.co.uk",
    ".futuresforall.org",
    ".prospects.ac.uk",
)

SEARCHES = (
    ("Academic", "Research / Academic Programme", "UK Year 12 Year 13 students research summer school outreach programme application", "UK"),
    ("Careers", "Work Experience", "UK sixth form students work experience insight internship application programme", "UK"),
    ("Volunteering", "Volunteering", "UK students youth volunteering leadership opportunity application", "UK"),
    ("Sport", "Competition", "UK young people junior sport competition leadership volunteering opportunity", "UK"),
    ("Creative", "Creative Programme", "UK students creative arts design film writing competition programme application", "UK"),
    ("International", "International Programme", "international opportunity scholarship exchange competition young people UK students application", "International"),
)

SIGNAL_WORDS = re.compile(
    r"\b(application|apply|award|camp|competition|course|event|experience|internship|"
    r"leadership|opportunit|outreach|placement|programme|research|scholarship|summer|"
    r"taster|volunteer|work experience|workshop)\b",
    re.IGNORECASE,
)


def clean_text(value):
    return re.sub(r"\s+", " ", unescape(re.sub(r"<[^>]+>", "", value or ""))).strip()


def canonical_url(value):
    parsed = urlparse(value)
    return urlunparse((parsed.scheme, parsed.netloc.lower(), parsed.path.rstrip("/"), "", "", ""))


def trusted_url(value):
    parsed = urlparse(value)
    host = parsed.hostname.lower() if parsed.hostname else ""
    if parsed.scheme != "https" or not host or parsed.path.lower().endswith(".pdf"):
        return False
    return any(host == suffix[1:] or host.endswith(suffix) for suffix in TRUSTED_DOMAIN_SUFFIXES)


def provider_name(host):
    return host.removeprefix("www.").replace(".", " ").title()


def search(query):
    import json
    request = Request(
        "https://api.tavily.com/search",
        data=json.dumps({
            "query": query,
            "topic": "general",
            "search_depth": "basic",
            "max_results": 20,
            "time_range": "month",
            "include_answer": False,
            "include_raw_content": False,
        }).encode("utf-8"),
        headers={
            "Accept": "application/json",
            "Content-Type": "application/json",
            "Authorization": f"Bearer {TAVILY_API_KEY}",
        },
    )
    with urlopen(request, timeout=25) as response:
        return json.loads(response.read().decode("utf-8"))


def as_record(item, category, activity_type, location):
    title = clean_text(item.get("title"))
    link = canonical_url(item.get("url", ""))
    description = clean_text(item.get("content"))
    combined = f"{title} {description} {link}"
    if not title or not link or not trusted_url(link) or not SIGNAL_WORDS.search(combined):
        return None
    host = urlparse(link).hostname or ""
    return {
        "title": title[:240],
        "provider": provider_name(host),
        "category": category,
        "activity_type": activity_type,
        "location": location,
        "format": "Check provider",
        "age_range": "Check provider eligibility",
        "cost": "Check provider",
        "description": (description or "Current opportunity page found through GrowthGrind's trusted-source discovery.")[:1200],
        "subjects": "General / All Sectors",
        "link": link,
        "deadline": None,
        "year_groups": None,
        "interests": None,
    }


def main():
    if not TAVILY_API_KEY:
        print("Discovery skipped: set TAVILY_API_KEY to enable trusted web discovery.")
        return
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_KEY before running.")

    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    inserted = skipped = 0
    seen = set()
    for category, activity_type, query, location in SEARCHES:
        try:
            results = search(query).get("results", [])
        except Exception as error:
            print(f"Search failed for {category}: {error}", file=sys.stderr)
            continue
        for item in results:
            record = as_record(item, category, activity_type, location)
            if not record or record["link"] in seen:
                skipped += 1
                continue
            seen.add(record["link"])
            existing = client.table("opportunities").select("id").eq("link", record["link"]).limit(1).execute()
            if existing.data:
                skipped += 1
                continue
            client.table("opportunities").insert(record).execute()
            inserted += 1
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    print(f"Trusted web discovery complete at {stamp}: {inserted} inserted, {skipped} skipped.")


if __name__ == "__main__":
    main()
