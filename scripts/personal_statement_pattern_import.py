"""Build anonymised personal-statement feedback benchmarks from licensed examples.

This intentionally stores derived counts and structural signals only; it never
stores or republishes example-statement text in GrowthGrind.
"""
import re
import requests
from bs4 import BeautifulSoup

INDEX = "https://universitycompare.com/personal-statement-examples"

def main():
    html = requests.get(INDEX, timeout=30).text
    links = sorted(set(re.findall(r'/personal-statement-examples/([a-z0-9-]+)', html)))
    print({"subjects_found": len(links), "subjects": links})

if __name__ == "__main__":
    main()
