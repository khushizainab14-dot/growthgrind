"""Import recent live apprenticeship adverts from the official DfE API.

The Display Advert API is designed for services which periodically collect
vacancies into their own datastore.  This importer deliberately fetches only
the adverts posted in the last seven days: that keeps the daily job well under
the documented rate limit while giving students a genuinely fresh feed.

Required GitHub Actions secrets:
  SUPABASE_URL
  SUPABASE_SERVICE_ROLE_KEY
  APPRENTICESHIPS_API_KEY
"""

import json
import os
import subprocess
import sys
from datetime import datetime, timezone
from urllib.parse import urlencode

from supabase import create_client


API_URL = "https://api.apprenticeships.education.gov.uk/vacancies/vacancy"
SOURCE_KEY = "find-an-apprenticeship-api"
LOOKBACK_DAYS = int(os.environ.get("APPRENTICESHIPS_LOOKBACK_DAYS", "7"))
PAGE_SIZE = 100

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")
API_KEY = os.environ.get("APPRENTICESHIPS_API_KEY")


def required(value, name):
    if not value:
        raise SystemExit(f"Set {name} before running this importer.")
    return value


def fetch_json(url):
    """Fetch JSON without ever printing the subscription key."""
    result = subprocess.run(
        [
            "curl",
            "--fail-with-body",
            "--max-time",
            "45",
            "-sS",
            "-H",
            "Accept: application/json; ver=2",
            "-H",
            "X-Version: 2",
            "-H",
            f"Ocp-Apim-Subscription-Key: {API_KEY}",
            url,
        ],
        capture_output=True,
        text=True,
        check=False,
    )
    if result.returncode:
        message = (result.stderr or result.stdout or "request failed").strip()
        raise RuntimeError(f"DfE API request failed ({result.returncode}): {message[:500]}")
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError as error:
        raise RuntimeError("DfE API returned invalid JSON") from error


def clean(value):
    return " ".join(str(value or "").split()).strip()


def first_present(*values):
    return next((clean(value) for value in values if clean(value)), "")


def route_subject(route):
    route = clean(route)
    mappings = {
        "agriculture, environmental and animal care": "Biology, Geography, Science, Research & Sustainability",
        "business and administration": "Business Studies, Finance, Accounting & Economics",
        "care services": "Health, Medicine & Social Care, Psychology, Sociology",
        "catering and hospitality": "Business Studies, General / All Sectors",
        "construction and the built environment": "Engineering, Geography",
        "creative and design": "Art, Drama, Marketing, Content & Creative Industries",
        "digital": "Computer Science, Technology",
        "education and early years": "Education, Psychology",
        "engineering and manufacturing": "Engineering, Mathematics, Physics",
        "health and science": "Biology, Chemistry, Health, Medicine & Social Care",
        "legal, finance and accounting": "Law, Finance, Accounting & Economics",
        "protective services": "Politics, Sociology",
        "sales, marketing and procurement": "Business Studies, Marketing, Content & Creative Industries",
        "transport and logistics": "Business Studies, Geography",
    }
    return mappings.get(route.lower(), route or "General / All Sectors")


def location_for(vacancy):
    if vacancy.get("isNationalVacancy"):
        return first_present(vacancy.get("isNationalVacancyDetails"), "England / national")
    addresses = vacancy.get("addresses") or []
    parts = []
    for address in addresses[:2]:
        line = ", ".join(
            clean(address.get(key))
            for key in ("addressLine4", "addressLine3", "addressLine2", "postcode")
            if clean(address.get(key))
        )
        if line and line not in parts:
            parts.append(line)
    return " / ".join(parts) or "England"


def record_for(vacancy, checked_at):
    course = vacancy.get("course") or {}
    title = clean(vacancy.get("title"))
    reference = clean(vacancy.get("vacancyReference"))
    link = first_present(vacancy.get("vacancyUrl"), vacancy.get("applicationUrl"))
    if not title or not reference or not link:
        raise RuntimeError("DfE vacancy is missing its title, reference or public URL")

    wage = vacancy.get("wage") or {}
    wage_text = first_present(wage.get("wageAdditionalInformation"), wage.get("wageType"))
    description = clean(vacancy.get("description"))
    course_title = clean(course.get("title"))
    route = clean(course.get("route"))
    details = [description]
    if course_title:
        details.append(f"Apprenticeship standard: {course_title}.")
    if vacancy.get("expectedDuration"):
        details.append(f"Expected duration: {clean(vacancy['expectedDuration'])}.")
    if wage_text:
        details.append(f"Pay information: {wage_text}.")

    return {
        "title": title,
        "provider": first_present(vacancy.get("employerName"), vacancy.get("providerName"), "Find an Apprenticeship"),
        "category": "Careers",
        "activity_type": "Apprenticeship",
        "location": location_for(vacancy),
        "format": "In-person" if not vacancy.get("isNationalVacancy") else "Online and in-person",
        "age_range": "16+",
        "year_groups": "Year 12, Year 13",
        "deadline": vacancy.get("closingDate"),
        "cost": "Paid",
        "description": " ".join(part for part in details if part),
        "interests": route or None,
        "subjects": route_subject(route),
        "link": link,
        "source_key": SOURCE_KEY,
        "source_kind": "official_api",
        "source_checked_at": checked_at,
        "source_seen_at": checked_at,
        "is_active": True,
        "missing_refreshes": 0,
    }


def start_run(supabase):
    result = supabase.table("opportunity_source_runs").insert({"source_key": SOURCE_KEY}).execute()
    return result.data[0]["id"]


def complete_run(supabase, run_id, status, discovered, inserted, updated, deactivated=0, error_message=None):
    supabase.table("opportunity_source_runs").update({
        "completed_at": datetime.now(timezone.utc).isoformat(),
        "status": status,
        "discovered_count": discovered,
        "inserted_count": inserted,
        "updated_count": updated,
        "deactivated_count": deactivated,
        "error_message": error_message,
    }).eq("id", run_id).execute()


def save(supabase, record):
    existing = supabase.table("opportunities").select("id").eq("link", record["link"]).limit(1).execute()
    if existing.data:
        supabase.table("opportunities").update(record).eq("id", existing.data[0]["id"]).execute()
        return "updated"
    supabase.table("opportunities").insert(record).execute()
    return "inserted"


def deactivate_expired(supabase, checked_at):
    expired = (
        supabase.table("opportunities")
        .select("id")
        .eq("source_key", SOURCE_KEY)
        .eq("is_active", True)
        .lt("deadline", checked_at)
        .execute()
        .data
        or []
    )
    for row in expired:
        supabase.table("opportunities").update({
            "is_active": False,
            "source_checked_at": checked_at,
        }).eq("id", row["id"]).execute()
    return len(expired)


def fetch_recent_vacancies():
    vacancies = []
    page = 1
    total_pages = 1
    while page <= total_pages:
        query = urlencode({
            "PageNumber": page,
            "PageSize": PAGE_SIZE,
            "PostedInLastNumberOfDays": LOOKBACK_DAYS,
            "Sort": "AgeDesc",
            "ExcludeRecruitingNationally": "false",
        })
        payload = fetch_json(f"{API_URL}?{query}")
        vacancies.extend(payload.get("vacancies") or [])
        total_pages = int(payload.get("totalPages") or 1)
        page += 1
    return vacancies


def main():
    # A missing DfE key should not make a scheduled refresh look broken. Other
    # sources continue to run until the account holder chooses to enable this one.
    if not API_KEY:
        print("Skipping Find an Apprenticeship import: APPRENTICESHIPS_API_KEY is not configured.")
        return

    supabase = create_client(required(SUPABASE_URL, "SUPABASE_URL"), required(SUPABASE_KEY, "SUPABASE_KEY"))
    run_id = start_run(supabase)
    checked_at = datetime.now(timezone.utc).isoformat()
    try:
        vacancies = fetch_recent_vacancies()
        inserted = updated = 0
        for vacancy in vacancies:
            result = save(supabase, record_for(vacancy, checked_at))
            inserted += result == "inserted"
            updated += result == "updated"
        deactivated = deactivate_expired(supabase, checked_at)
        complete_run(supabase, run_id, "success", len(vacancies), inserted, updated, deactivated)
        print(f"Find an Apprenticeship import complete: {inserted} inserted, {updated} updated, {deactivated} expired.")
    except Exception as error:
        complete_run(supabase, run_id, "failed", 0, 0, 0, error_message=str(error))
        raise


if __name__ == "__main__":
    main()
