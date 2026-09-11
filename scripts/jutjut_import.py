import re
import html
import subprocess
import sys
from urllib.parse import urljoin
from datetime import datetime

from supabase import create_client


# ============================================================
# SUPABASE
# ============================================================

SUPABASE_URL = "https://xqscricumpoiyijottnq.supabase.co"

# IMPORTANT:
# Put the SAME publishable/anon key you already use in
# src/supabaseClient.js here.
SUPABASE_KEY = "sb_publishable_KhTtEuZPlvmuheQqK-TlaQ_L_M5EzfO"

supabase = create_client(
    SUPABASE_URL,
    SUPABASE_KEY,
)


# ============================================================
# JUTJUT
# ============================================================

BASE_URL = "https://jutjut.co.uk"

LISTING_URL = (
    "https://jutjut.co.uk/opportunities"
)


# ============================================================
# SUBJECTS
# ============================================================

SUBJECTS = [
    "Accounting",
    "Art",
    "Biology",
    "Business Studies",
    "Chemistry",
    "Computer Science",
    "Drama",
    "Economics",
    "Education",
    "Engineering",
    "English",
    "Finance",
    "Geography",
    "History",
    "Law",
    "Languages",
    "Mathematics",
    "Medicine",
    "Philosophy",
    "Physics",
    "Politics",
    "Psychology",
    "Sociology",
    "Sport",
    "Technology",
    "Other",
    "General / All Sectors",
    "Science, Research & Sustainability",
    "Health, Medicine & Social Care",
    "Marketing, Content & Creative Industries",
    "Engineering & Manufacturing",
    "Languages, Translation & Culture",
    "Finance, Accounting & Economics",
    "Law, Politics & International Affairs",
]


# ============================================================
# ACTIVITY TYPES
# ============================================================

ACTIVITY_TYPES = [
    "Competition",
    "Course",
    "Event",
    "Insight Day",
    "Open Day",
    "Talk",
    "Webinar",
    "Workshop",
    "Work Experience",
    "Other",
]


# ============================================================
# KNOWN CITIES
# ============================================================

KNOWN_CITIES = [
    "Capel Curig, Betws-y-Coed",
    "Portsmouth",
    "Liverpool",
    "Cambridge",
    "Oxford",
    "London",
    "Dublin",
    "Lille",
    "Manchester",
    "Birmingham",
    "Bristol",
    "Edinburgh",
    "Glasgow",
    "Leeds",
    "Nottingham",
    "Reading",
    "Windsor",
]


COUNTRIES = [
    "United Kingdom",
    "UK",
    "England",
    "Scotland",
    "Wales",
    "Northern Ireland",
    "Ireland",
    "France",
]


# ============================================================
# BASIC HELPERS
# ============================================================

def clean_text(value):

    if not value:
        return ""

    value = html.unescape(value)

    value = value.replace(
        "\xa0",
        " ",
    )

    value = value.replace(
        "\u2022",
        "•",
    )

    value = value.replace(
        "\u2013",
        "–",
    )

    value = value.replace(
        "\u2014",
        "—",
    )

    value = re.sub(
        r"\s+",
        " ",
        value,
    )

    return value.strip()


def unique(items):

    result = []

    for item in items:

        item = clean_text(item)

        if (
            item
            and item not in result
        ):
            result.append(item)

    return result


def strip_tags(value):

    value = re.sub(
        r"<script[\s\S]*?</script>",
        " ",
        value,
        flags=re.I,
    )

    value = re.sub(
        r"<style[\s\S]*?</style>",
        " ",
        value,
        flags=re.I,
    )

    value = re.sub(
        r"<[^>]+>",
        " ",
        value,
    )

    return clean_text(value)


# ============================================================
# FETCH
# ============================================================

def fetch(url):
    """
    Use curl instead of urllib.

    JutJut currently returns a 308 redirect on the
    opportunities URL. curl -L follows it correctly.
    """

    result = subprocess.run(
        [
            "curl",
            "-L",
            "--max-time",
            "30",
            "-sS",
            "-A",
            (
                "Mozilla/5.0 "
                "(Macintosh; Intel Mac OS X 10_15_7) "
                "AppleWebKit/537.36 "
                "(KHTML, like Gecko) "
                "Chrome/140.0.0.0 "
                "Safari/537.36"
            ),
            "-H",
            (
                "Accept: "
                "text/html,application/xhtml+xml,"
                "application/xml;q=0.9,*/*;q=0.8"
            ),
            "-H",
            "Accept-Language: en-GB,en;q=0.9",
            url,
        ],
        capture_output=True,
        text=True,
    )

    if result.returncode != 0:

        raise RuntimeError(
            "curl failed: "
            + result.stderr.strip()
        )

    if not result.stdout.strip():

        raise RuntimeError(
            "JutJut returned an empty page."
        )

    return result.stdout


# ============================================================
# TEXT NODES
# ============================================================

def get_text_nodes(source):

    source = re.sub(
        r"<(script|style|noscript)[^>]*>"
        r"[\s\S]*?</\1>",
        " ",
        source,
        flags=re.I,
    )

    source = re.sub(
        r"<br\s*/?>",
        "\n",
        source,
        flags=re.I,
    )

    source = re.sub(
        r"</(?:p|div|li|section|article|"
        r"h1|h2|h3|h4|h5|h6)>",
        "\n",
        source,
        flags=re.I,
    )

    source = re.sub(
        r"<[^>]+>",
        " ",
        source,
    )

    source = html.unescape(
        source
    )

    lines = []

    for line in source.splitlines():

        line = clean_text(line)

        if line:
            lines.append(line)

    return unique(lines)


# ============================================================
# LINKS
# ============================================================

def extract_links(source):

    links = re.findall(
        r'href=["\']'
        r'([^"\']*?/opportunities/[^"\']+)'
        r'["\']',
        source,
        flags=re.I,
    )

    result = []

    for link in links:

        link = html.unescape(link)

        link = urljoin(
            BASE_URL,
            link,
        )

        if (
            link.rstrip("/")
            == LISTING_URL.rstrip("/")
        ):
            continue

        if (
            "/opportunities/"
            not in link
        ):
            continue

        if link not in result:
            result.append(link)

    return result


def extract_official_link(source, source_url):
    """Return the external provider link shown on a JutJut opportunity page."""

    anchors = re.findall(
        r'<a[^>]+href=["\']([^"\']+)["\'][^>]*>',
        source,
        flags=re.I,
    )

    for link in anchors:
        link = html.unescape(link).strip()

        if not link.startswith(("http://", "https://")):
            continue

        if link.rstrip("/") == source_url.rstrip("/"):
            continue

        if "jutjut.co.uk" in link.lower():
            continue

        return link

    return source_url


# ============================================================
# LISTING CARD
# ============================================================

def get_listing_card(
    source,
    url,
):

    marker = url.split("/")[-1]

    index = source.find(
        marker
    )

    if index == -1:
        return ""

    start = max(
        0,
        index - 5000,
    )

    end = min(
        len(source),
        index + 10000,
    )

    return strip_tags(
        source[start:end]
    )


# ============================================================
# YEAR GROUPS
# ============================================================

def extract_year_groups(text):

    text = clean_text(text)

    match = re.search(
        r"\b("
        r"Y(?:9|10|11|12|13)"
        r"(?:\s*,?\s*(?:Y)?"
        r"(?:9|10|11|12|13))*"
        r")\b",
        text,
        flags=re.I,
    )

    if not match:
        return None

    raw = match.group(1)

    years = re.findall(
        r"Y(?:9|10|11|12|13)",
        raw,
        flags=re.I,
    )

    years = [
        year.upper()
        for year in years
    ]

    years = unique(
        years
    )

    if not years:
        return None

    return ", ".join(
        years
    )


# ============================================================
# LISTING METADATA
# ============================================================

def parse_listing_metadata(
    card_text,
    title,
):

    text = clean_text(
        card_text
    )

    if (
        title
        and text.startswith(title)
    ):
        remainder = text[
            len(title):
        ].strip()
    else:
        remainder = text

    metadata = remainder[:700]

    # --------------------------------------------------------
    # FORMAT
    # --------------------------------------------------------

    format_value = None

    if re.search(
        r"\bRemote\b",
        metadata,
        flags=re.I,
    ):
        format_value = "Online"

    elif re.search(
        r"\bOn-campus\b",
        metadata,
        flags=re.I,
    ):
        format_value = "On-campus"

    elif re.search(
        r"\bIn-person\b",
        metadata,
        flags=re.I,
    ):
        format_value = "In-person"

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    location = None

    if format_value != "Online":

        city_pattern = "|".join(
            re.escape(city)
            for city in sorted(
                KNOWN_CITIES,
                key=len,
                reverse=True,
            )
        )

        match = re.search(
            rf"\b"
            rf"(?:In-person"
            rf"(?:,\s*On-campus)?"
            rf"|On-campus)"
            rf"\s+"
            rf"({city_pattern})"
            rf"(?=\s*(?:•|\bY\d|\bAges\b|$))",
            metadata,
            flags=re.I,
        )

        if match:

            location = clean_text(
                match.group(1)
            )

    if (
        not location
        and format_value == "Online"
    ):
        location = "United Kingdom"

    # --------------------------------------------------------
    # COST
    # --------------------------------------------------------

    cost = None

    if re.search(
        r"\bFREE\b",
        metadata,
        flags=re.I,
    ):
        cost = "Free"

    elif (
        "££" in metadata
        or "£££" in metadata
    ):
        cost = "Paid"

    # Prize does not mean Free.

    # --------------------------------------------------------
    # YEARS
    # --------------------------------------------------------

    year_groups = (
        extract_year_groups(
            metadata
        )
    )

    return {
        "format": format_value,
        "location": location,
        "cost": cost,
        "year_groups": year_groups,
    }


# ============================================================
# ACTIVITY TYPE
# ============================================================

def extract_activity_type(
    nodes
):

    for node in nodes:

        text = clean_text(
            node
        )

        if text in ACTIVITY_TYPES:
            return text

        if re.search(
            r"\bOnline Course\b",
            text,
            flags=re.I,
        ):
            return "Course"

    joined = " ".join(
        nodes[:80]
    )

    for activity in ACTIVITY_TYPES:

        if re.search(
            rf"\b{re.escape(activity)}\b",
            joined,
            flags=re.I,
        ):
            return activity

    return "Other"


# ============================================================
# AGE
# ============================================================

def extract_age_range(
    nodes
):

    for i, node in enumerate(
        nodes
    ):

        text = clean_text(
            node
        )

        match = re.search(
            r"\bAges?\s+"
            r"(\d+)"
            r"\s*[–—-]\s*"
            r"(\d+)",
            text,
            flags=re.I,
        )

        if match:

            return (
                f"{match.group(1)}–"
                f"{match.group(2)}"
            )

        combined = " ".join(
            nodes[i:i + 4]
        )

        match = re.search(
            r"\bAges?\s+"
            r"(\d+)"
            r"\s*[–—-]\s*"
            r"(\d+)",
            combined,
            flags=re.I,
        )

        if match:

            return (
                f"{match.group(1)}–"
                f"{match.group(2)}"
            )

    return None


# ============================================================
# LOCATION
# ============================================================

def extract_location(
    nodes,
    page_format,
):

    location_index = None

    for i, node in enumerate(
        nodes
    ):

        if clean_text(
            node
        ).lower() in {
            "location",
            "where",
            "when & where",
        }:

            location_index = i
            break

    if location_index is not None:

        search_nodes = nodes[
            location_index + 1:
            location_index + 12
        ]

    else:

        search_nodes = nodes

    combined = " ".join(
        search_nodes
    )

    # CITY FIRST.
    for city in sorted(
        KNOWN_CITIES,
        key=len,
        reverse=True,
    ):

        if re.search(
            rf"\b{re.escape(city)}\b",
            combined,
            flags=re.I,
        ):
            return city

    # COUNTRY ONLY AS FALLBACK.
    for country in COUNTRIES:

        if re.search(
            rf"\b{re.escape(country)}\b",
            combined,
            flags=re.I,
        ):

            if country == "UK":
                return "United Kingdom"

            return country

    if page_format == "Online":
        return "United Kingdom"

    return None


# ============================================================
# SUBJECTS
# ============================================================

def extract_subjects(
    nodes
):

    when_index = None

    for i, node in enumerate(
        nodes
    ):

        if (
            clean_text(node).lower()
            == "when & where"
        ):

            when_index = i
            break

    if when_index is None:
        return None

    collected = []

    for i in range(
        when_index - 1,
        max(
            -1,
            when_index - 20,
        ),
        -1,
    ):

        text = clean_text(
            nodes[i]
        )

        if not text:
            continue

        found_here = []

        for subject in SUBJECTS:

            if re.search(
                rf"(?<!\w)"
                rf"{re.escape(subject)}"
                rf"(?!\w)",
                text,
                flags=re.I,
            ):

                found_here.append(
                    subject
                )

        if found_here:

            collected.extend(
                found_here
            )

            continue

        if collected:
            break

    collected = list(
        reversed(
            collected
        )
    )

    collected = unique(
        collected
    )

    if not collected:
        return None

    return ", ".join(
        collected
    )


# ============================================================
# PAGE COST
# ============================================================

def extract_page_cost(
    nodes
):

    joined = " ".join(
        nodes
    )

    # Exact price.
    price_match = re.search(
        r"£\s?"
        r"(\d+(?:\.\d{2})?)",
        joined,
        flags=re.I,
    )

    if price_match:

        return (
            f"£{price_match.group(1)}"
        )

    # Explicit FREE.
    if re.search(
        r"\bFREE\b",
        joined,
        flags=re.I,
    ):
        return "Free"

    if (
        "££" in joined
        or "£££" in joined
    ):
        return "Paid"

    return None


# ============================================================
# DEADLINE
# ============================================================

def extract_deadline(
    nodes
):

    joined = " ".join(
        nodes
    )

    patterns = [

        r"Application Deadline\s*:?\s*"
        r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",

        r"Application Deadline\s*:?\s*"
        r"([A-Za-z]+\s+\d{1,2},\s+\d{4})",

        r"Deadline\s*:?\s*"
        r"(\d{1,2}\s+[A-Za-z]+\s+\d{4})",

        r"Deadline\s*:?\s*"
        r"([A-Za-z]+\s+\d{1,2},\s+\d{4})",
    ]

    for pattern in patterns:

        match = re.search(
            pattern,
            joined,
            flags=re.I,
        )

        if match:

            return normalise_date(
                match.group(1)
            )

    return None


def normalise_date(
    value
):

    value = clean_text(
        value
    )

    formats = [
        "%d %B %Y",
        "%d %b %Y",
        "%B %d, %Y",
        "%b %d, %Y",
    ]

    for fmt in formats:

        try:

            return datetime.strptime(
                value,
                fmt,
            ).strftime(
                "%Y-%m-%d"
            )

        except ValueError:
            pass

    return None


# ============================================================
# DESCRIPTION
# ============================================================

def extract_description(
    nodes
):

    start = None

    for i, node in enumerate(
        nodes
    ):

        if (
            clean_text(node).lower()
            == "what you'll do"
        ):

            start = i + 1
            break

    if start is None:
        return None

    description = []

    stop_words = {
        "when & where",
        "who can apply",
        "money matters",
        "apply now",
        "application deadline",
    }

    for node in nodes[
        start:start + 30
    ]:

        text = clean_text(
            node
        )

        if (
            text.lower()
            in stop_words
        ):
            break

        if len(text) >= 30:

            description.append(
                text
            )

    if not description:
        return None

    return clean_text(
        " ".join(
            description
        )
    )[:3000]


# ============================================================
# PARSE OPPORTUNITY
# ============================================================

def parse_opportunity(
    url,
    listing_text="",
):

    source = fetch(
        url
    )

    official_link = extract_official_link(
        source,
        url,
    )

    nodes = get_text_nodes(
        source
    )

    # --------------------------------------------------------
    # TITLE
    # --------------------------------------------------------

    title = None

    title_match = re.search(
        r"<title[^>]*>"
        r"([\s\S]*?)"
        r"</title>",
        source,
        flags=re.I,
    )

    if title_match:

        title = strip_tags(
            title_match.group(1)
        )

        title = re.sub(
            r"\s*[\-|–—]\s*JutJut.*$",
            "",
            title,
            flags=re.I,
        )

    if not title:

        for node in nodes[:30]:

            if len(node) > 10:

                title = node
                break

    title = clean_text(
        title
    )

    # --------------------------------------------------------
    # PROVIDER
    # --------------------------------------------------------

    provider = None

    for i, node in enumerate(
        nodes[:100]
    ):

        if (
            clean_text(node).lower()
            == "provider"
        ):

            if i + 1 < len(nodes):

                provider = clean_text(
                    nodes[i + 1]
                )

                break

    # --------------------------------------------------------
    # ACTIVITY
    # --------------------------------------------------------

    activity_type = (
        extract_activity_type(
            nodes
        )
    )

    # --------------------------------------------------------
    # FORMAT
    # --------------------------------------------------------

    page_format = None

    joined_start = " ".join(
        nodes[:100]
    )

    if re.search(
        r"\bRemote\b",
        joined_start,
        flags=re.I,
    ):

        page_format = "Online"

    elif re.search(
        r"\bOn-campus\b",
        joined_start,
        flags=re.I,
    ):

        page_format = "On-campus"

    elif re.search(
        r"\bIn-person\b",
        joined_start,
        flags=re.I,
    ):

        page_format = "In-person"

    # --------------------------------------------------------
    # LISTING METADATA
    # --------------------------------------------------------

    listing_meta = (
        parse_listing_metadata(
            listing_text,
            title,
        )
    )

    format_value = (
        listing_meta["format"]
        or page_format
    )

    # --------------------------------------------------------
    # LOCATION
    # --------------------------------------------------------

    location = (
        listing_meta["location"]
    )

    if not location:

        location = extract_location(
            nodes,
            format_value,
        )

    # --------------------------------------------------------
    # YEAR GROUPS
    # --------------------------------------------------------

    year_groups = (
        listing_meta["year_groups"]
    )

    if not year_groups:

        for node in nodes:

            year_groups = (
                extract_year_groups(
                    node
                )
            )

            if year_groups:
                break

    # --------------------------------------------------------
    # AGE
    # --------------------------------------------------------

    age_range = (
        extract_age_range(
            nodes
        )
    )

    # --------------------------------------------------------
    # SUBJECTS
    # --------------------------------------------------------

    subjects = (
        extract_subjects(
            nodes
        )
    )

    # --------------------------------------------------------
    # COST
    # --------------------------------------------------------

    listing_cost = (
        listing_meta["cost"]
    )

    page_cost = (
        extract_page_cost(
            nodes
        )
    )

    if listing_cost:
        cost = listing_cost
    else:
        cost = page_cost

    # --------------------------------------------------------
    # DEADLINE
    # --------------------------------------------------------

    deadline = (
        extract_deadline(
            nodes
        )
    )

    # --------------------------------------------------------
    # DESCRIPTION
    # --------------------------------------------------------

    description = (
        extract_description(
            nodes
        )
    )

    # --------------------------------------------------------
    # FINAL DATA
    # --------------------------------------------------------

    return {
        "title": title or None,
        "provider": provider or None,
        "category": (
            activity_type
            or "Other"
        ),
        "activity_type": (
            activity_type
            or "Other"
        ),
        "location": (
            location
            or "United Kingdom"
        ),
        "format": format_value,
        "age_range": age_range,
        "year_groups": year_groups,
        "deadline": deadline,
        "cost": cost,
        "description": description,
        "interests": None,
        "subjects": subjects,
        "link": official_link,
    }


# ============================================================
# SUPABASE SAVE
# ============================================================

def save_opportunity(
    opportunity,
    source_url,
):

    existing = (
        supabase
        .table("opportunities")
        .select("id")
        .eq(
            "link",
            source_url,
        )
        .limit(1)
        .execute()
    )

    if not existing.data:

        existing = (
            supabase
            .table("opportunities")
            .select("id")
            .eq(
                "title",
                opportunity["title"],
            )
            .limit(1)
            .execute()
        )

    if existing.data:

        opportunity_id = (
            existing.data[0]["id"]
        )

        (
            supabase
            .table("opportunities")
            .update(
                opportunity
            )
            .eq(
                "id",
                opportunity_id,
            )
            .execute()
        )

        return "updated"

    (
        supabase
        .table("opportunities")
        .insert(
            opportunity
        )
        .execute()
    )

    return "inserted"


def repair_official_links():
    """Replace legacy JutJut links in existing records with provider URLs."""

    records = (
        supabase
        .table("opportunities")
        .select("id,link")
        .execute()
        .data
    )

    legacy_records = [
        record
        for record in records
        if "jutjut.co.uk/opportunities/" in (record.get("link") or "")
    ]

    print(f"Repairing {len(legacy_records)} legacy links...")

    repaired = 0
    unchanged = 0
    failed = 0

    for number, record in enumerate(legacy_records, start=1):
        source_url = record["link"]

        try:
            official_link = extract_official_link(
                fetch(source_url),
                source_url,
            )

            if official_link == source_url:
                unchanged += 1
                continue

            (
                supabase
                .table("opportunities")
                .update({"link": official_link})
                .eq("id", record["id"])
                .execute()
            )
            repaired += 1
            print(f"[{number}/{len(legacy_records)}] ✓ {official_link}")
        except Exception as error:
            failed += 1
            print(f"[{number}/{len(legacy_records)}] ✗ {error}")

    print(
        f"Link repair complete: {repaired} repaired, "
        f"{unchanged} without an external link, {failed} failed."
    )


# ============================================================
# MAIN
# ============================================================

def main():

    if "--repair-links" in sys.argv:
        repair_official_links()
        return

    print(
        "Fetching JutJut opportunities..."
    )

    listing_source = fetch(
        LISTING_URL
    )

    links = extract_links(
        listing_source
    )

    links = unique(
        links
    )

    print(
        f"Found {len(links)} opportunities"
    )

    inserted = 0
    updated = 0
    failed = 0

    for number, url in enumerate(
        links,
        start=1,
    ):

        try:

            print(
                f"[{number}/{len(links)}] "
                f"{url}"
            )

            card = get_listing_card(
                listing_source,
                url,
            )

            opportunity = (
                parse_opportunity(
                    url,
                    card,
                )
            )

            result = (
                save_opportunity(
                    opportunity,
                    url,
                )
            )

            if result == "inserted":
                inserted += 1
            else:
                updated += 1

            print(
                "    ✓ "
                f"{opportunity['title']}"
                f" | {opportunity['location']}"
                f" | {opportunity['age_range']}"
                f" | {opportunity['year_groups']}"
                f" | {opportunity['cost']}"
            )

        except Exception as error:

            failed += 1

            print(
                f"    ✗ FAILED: {url}"
            )

            print(
                f"      {error}"
            )

    print()
    print("=" * 60)
    print("IMPORT COMPLETE")
    print("=" * 60)
    print(
        f"Inserted: {inserted}"
    )
    print(
        f"Updated:  {updated}"
    )
    print(
        f"Failed:   {failed}"
    )
    print("=" * 60)


# ============================================================
# RUN
# ============================================================

if __name__ == "__main__":
    main()
