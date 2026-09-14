#!/usr/bin/env python3
"""Refresh GrowthGrind's vetted public opportunity sources.

This deliberately imports only named providers and direct programme pages. It
does not scrape Google results, AI answers, social posts, or arbitrary sites.
Evergreen entries point students to a provider's current opportunities page;
the daily run updates them and leaves deadline fields empty rather than inventing
dates. Add a provider only after checking its public terms and student fit.
"""
import os
from supabase import create_client

SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

SOURCES = [
    {"title": "Forage virtual job simulations", "provider": "Forage", "category": "Careers", "activity_type": "Virtual Work Experience", "location": "International / online", "format": "Online", "age_range": "Check provider eligibility", "cost": "Free", "subjects": "Business, Technology, Law, Finance", "link": "https://www.theforage.com/", "description": "Free employer-designed virtual job simulations. Browse current programmes and complete one at your own pace; availability and eligibility are shown by the provider."},
    {"title": "Springpod virtual work experience", "provider": "Springpod", "category": "Careers", "activity_type": "Virtual Work Experience", "location": "UK / online", "format": "Online", "age_range": "Check provider eligibility", "cost": "Free / check provider", "subjects": "Medicine, Business, Law, Technology, Engineering", "link": "https://www.springpod.com/virtual-work-experience", "description": "Browse current virtual work-experience programmes and provider eligibility directly with Springpod."},
    {"title": "Speakers for Schools work experience", "provider": "Speakers for Schools", "category": "Careers", "activity_type": "Work Experience", "location": "UK", "format": "Online and in-person", "age_range": "Check provider eligibility", "cost": "Free", "subjects": "General / All Sectors", "link": "https://www.speakersforschools.org/experience/", "description": "Current work-experience opportunities for young people. Check the provider page for open placements, dates and eligibility."},
    {"title": "Nuffield Research Placements", "provider": "Nuffield Foundation", "category": "Academic", "activity_type": "Research", "location": "UK", "format": "In-person and hybrid", "age_range": "Post-16 / check provider", "cost": "Free", "subjects": "Science, Research & Sustainability", "link": "https://www.nuffieldresearchplacements.org/", "description": "Research placements for eligible post-16 students. Check regional availability, timetable and application criteria on the official page."},
    {"title": "FutureLearn short courses and certificates", "provider": "FutureLearn", "category": "Academic", "activity_type": "Course / Programme", "location": "International / online", "format": "Online", "age_range": "Check provider eligibility", "cost": "Free and paid options", "subjects": "General / All Sectors", "link": "https://www.futurelearn.com/courses", "description": "Explore current online short courses from universities and cultural institutions. Course access and certificate options vary."},
    {"title": "OpenLearn free courses", "provider": "The Open University", "category": "Academic", "activity_type": "Course / Programme", "location": "International / online", "format": "Online", "age_range": "Open access / check course", "cost": "Free", "subjects": "General / All Sectors", "link": "https://www.open.edu/openlearn/free-courses", "description": "Free online courses across subjects. Check individual course pages for study time and digital badges."},
    {"title": "National Saturday Club", "provider": "National Saturday Club", "category": "Creative", "activity_type": "Course / Programme", "location": "UK", "format": "In-person", "age_range": "13-16", "cost": "Free", "subjects": "Art, Design, Technology", "link": "https://www.nationalsaturdayclub.org/", "description": "Saturday clubs in art, design, science, technology and performance. Check local club availability and current application details."},
    {"title": "Duke of Edinburgh's Award", "provider": "DofE", "category": "Leadership", "activity_type": "Leadership Programme", "location": "International", "format": "In-person and hybrid", "age_range": "14+", "cost": "Check provider", "subjects": "Leadership, Volunteering, Sport", "link": "https://www.dofe.org/", "description": "Structured volunteering, physical, skills and expedition challenges. Check local centre availability and participation costs."},
    {"title": "Do-it volunteering opportunities", "provider": "Do-it", "category": "Volunteering", "activity_type": "Volunteering", "location": "UK", "format": "Online and in-person", "age_range": "Check organisation eligibility", "cost": "Free", "subjects": "General / All Sectors", "link": "https://doit.life/", "description": "Search current volunteering roles by location and cause. Each organisation sets its own age and safeguarding requirements."},
    {"title": "British Science Association CREST Awards", "provider": "British Science Association", "category": "Academic", "activity_type": "Research", "location": "UK and international", "format": "Online and in-person", "age_range": "11-19", "cost": "Check provider", "subjects": "Science, Research & Sustainability", "link": "https://www.crestawards.org/", "description": "Student-led STEM project awards. Check current project formats, costs and school participation guidance."},
    {"title": "UK Mathematics Trust competitions", "provider": "UK Mathematics Trust", "category": "Academic", "activity_type": "Competition", "location": "UK", "format": "School-based", "age_range": "Check competition", "cost": "Check school / provider", "subjects": "Mathematics", "link": "https://ukmt.org.uk/competitions", "description": "Current mathematics challenges, olympiads and team competitions. Check the relevant competition’s year-group and entry details."},
    {"title": "Erasmus+ Youth opportunities", "provider": "European Youth Portal", "category": "International", "activity_type": "International Programme", "location": "International", "format": "Online and in-person", "age_range": "Check opportunity", "cost": "Varies", "subjects": "Languages, Leadership, Volunteering", "link": "https://youth.europa.eu/go-abroad_en", "description": "Explore current international youth exchanges, volunteering and mobility opportunities. Eligibility depends on residence, age and host programme."},
]


def record(source):
    return {**source, "deadline": None, "year_groups": None, "interests": None}


def main():
    if not SUPABASE_URL or not SUPABASE_KEY:
        raise SystemExit("Set SUPABASE_URL and SUPABASE_KEY GitHub secrets before running.")
    client = create_client(SUPABASE_URL, SUPABASE_KEY)
    inserted, updated = 0, 0
    for source in SOURCES:
        data = record(source)
        existing = client.table("opportunities").select("id").eq("link", source["link"]).limit(1).execute()
        if existing.data:
            client.table("opportunities").update(data).eq("id", existing.data[0]["id"]).execute()
            updated += 1
        else:
            client.table("opportunities").insert(data).execute()
            inserted += 1
    print(f"Verified public-source refresh complete: {inserted} inserted, {updated} updated.")


if __name__ == "__main__":
    main()
