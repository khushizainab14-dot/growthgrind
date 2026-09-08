import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

LISTING_URL = "https://jutjut.co.uk/opportunities"

HEADERS = {
    "User-Agent": "Mozilla/5.0"
}

print("Checking JutJut opportunity links...")
print("=" * 50)

try:
    response = requests.get(
        LISTING_URL,
        headers=HEADERS,
        timeout=20
    )

    print("Status:", response.status_code)

    soup = BeautifulSoup(response.text, "html.parser")

    links = []

    for a in soup.find_all("a", href=True):
        href = urljoin(LISTING_URL, a["href"])

        if "/opportunities/" in href and href not in links:
            links.append(href)

    print("\nFound opportunity links:")
    print("-" * 50)

    for number, link in enumerate(links, 1):
        print(f"{number}. {link}")

    print("\n" + "=" * 50)
    print("Total links found:", len(links))
    print("=" * 50)

except Exception as e:
    print("\nERROR:")
    print(e)