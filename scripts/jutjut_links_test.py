import requests
from bs4 import BeautifulSoup
from urllib.parse import urljoin

LISTING_URL = "https://jutjut.co.uk/opportunities"

response = requests.get(LISTING_URL, timeout=20)

print("Status:", response.status_code)

soup = BeautifulSoup(response.text, "html.parser")

links = []

for a in soup.find_all("a", href=True):
    href = urljoin(LISTING_URL, a["href"])

    if "/opportunities/" in href and href not in links:
        links.append(href)

print("\nFound opportunity links:")
print("-------------------------")

for link in links:
    print(link)

print("\nTotal links found:", len(links))