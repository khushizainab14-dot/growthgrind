import { useEffect, useState } from 'react'
import { supabase } from './supabaseClient'

import './App.css'

const categories = [
  'All',
  'Academic',
  'Careers',
  'Leadership',
  'Volunteering',
  'Sport',
  'Creative',
  'International',
]

const interests = [
  'Economics',
  'Mathematics',
  'Science',
  'Medicine',
  'Law',
  'Politics',
  'Business',
  'Technology',
  'Writing',
  'Sport',
  'Environment',
  'Entrepreneurship',
  'Leadership',
]

const activityTypes = [
  'Any',
  'Essay Competition',
  'Competition',
  'Work Experience',
  'Internship',
  'Volunteering',
  'Research',
  'Summer School',
  'Scholarship',
  'Leadership Programme',
  'Sport',
  'Creative',
  'Debate',
  'Olympiad',
  'Course / Programme',
]

const subjects = [
  'Any',
  'Economics',
  'Mathematics',
  'Science',
  'Biology',
  'Medicine',
  'Law',
  'Politics',
  'Business',
  'Computer Science',
  'Writing',
  'Sport',
]

const yearGroups = [
  'Any',
  'Year 9',
  'Year 10',
  'Year 11',
  'Year 12',
  'Year 13',
  '18+',
]

function App() {
    const [opportunities, setOpportunities] = useState([])

  useEffect(() => {
    const loadOpportunities = async () => {
      const { data, error } = await supabase
        .from('opportunities')
        .select('*')

      if (error) {
        console.error('Error loading opportunities:', error)
        return
      }

      const formattedOpportunities = (data || []).map((item) => ({
        id: item.id,
        category: item.category,
        activityType: item.activity_type,
        title: item.title,
        organisation: item.provider,
        description: item.description,
        location: item.location,
        format: item.format,
        age: item.age_range,
        yearGroups: item.year_groups
          ? item.year_groups.split(',').map((year) => year.trim())
          : [],
        deadline: item.deadline
          ? new Date(item.deadline).toLocaleDateString('en-GB', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })
          : '',
        days: '',
        cost: item.cost,
        interests: item.interests
          ? item.interests.split(',').map((interest) => interest.trim())
          : [],
        subjects: item.subjects
          ? item.subjects.split(',').map((subject) => subject.trim())
          : [],
        link: item.link,
      }))

      setOpportunities(formattedOpportunities)
    }

    loadOpportunities()
  }, [])
  const [page, setPage] = useState('Discover')

  const [selectedInterests, setSelectedInterests] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)

  const [saved, setSaved] = useState([])
  const [tracked, setTracked] = useState([])

  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('Most relevant')
  const [showMore, setShowMore] = useState(false)

  const [ageFilter, setAgeFilter] = useState('Any')
  const [yearGroupFilter, setYearGroupFilter] = useState('Any')
  const [locationFilter, setLocationFilter] = useState('Any')
  const [formatFilter, setFormatFilter] = useState('Any')
  const [costFilter, setCostFilter] = useState('All opportunities')
  const [activityTypeFilter, setActivityTypeFilter] = useState('Any')
  const [subjectFilter, setSubjectFilter] = useState('Any')

  const [applicationStatus, setApplicationStatus] = useState({})

  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)
  const [weeklyEmail, setWeeklyEmail] = useState('')
  const [weeklySubscribed, setWeeklySubscribed] = useState(false)

  const [premiumModal, setPremiumModal] = useState(null)

  const [isPremium, setIsPremium] = useState(
    localStorage.getItem('growthgrind_demo_premium') === 'true'
  )

  const foundingMembersClaimed = 6
  const foundingMemberLimit = 30
  const foundingSpotsLeft = Math.max(
    0,
    foundingMemberLimit - foundingMembersClaimed
  )

  useEffect(() => {
    const hasSeenWeeklyPopup =
      localStorage.getItem('growthgrind_weekly_seen') === 'true'

    const hasSubscribed =
      localStorage.getItem('growthgrind_weekly_subscribed') === 'true'

    if (hasSubscribed) {
      setWeeklySubscribed(true)
    }

    if (!hasSeenWeeklyPopup && !hasSubscribed) {
      const timer = setTimeout(() => {
        setShowWeeklyPopup(true)
      }, 3500)

      return () => clearTimeout(timer)
    }
  }, [])

  const closeWeeklyPopup = () => {
    localStorage.setItem('growthgrind_weekly_seen', 'true')
    setShowWeeklyPopup(false)
  }

  const subscribeWeekly = () => {
    if (!weeklyEmail.trim()) return

    localStorage.setItem('growthgrind_weekly_seen', 'true')
    localStorage.setItem('growthgrind_weekly_subscribed', 'true')

    setWeeklySubscribed(true)
    setShowWeeklyPopup(false)
    setWeeklyEmail('')
  }

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  const toggleSaved = (title) => {
    setSaved((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    )
  }

  const attemptTrack = (title) => {
    if (!isPremium) {
      setPremiumModal('tracker')
      return
    }

    setTracked((current) =>
      current.includes(title)
        ? current.filter((item) => item !== title)
        : [...current, title]
    )
  }

  const activateDemoPremium = () => {
    localStorage.setItem('growthgrind_demo_premium', 'true')
    setIsPremium(true)
    setPremiumModal(null)
  }

  const deactivateDemoPremium = () => {
    localStorage.removeItem('growthgrind_demo_premium')
    setIsPremium(false)
  }

  const getMatchScore = (opportunity) => {
    if (selectedInterests.length === 0) return 0

    const matches = opportunity.interests.filter((interest) =>
      selectedInterests.includes(interest)
    )

    if (matches.length === 0) return 0

    return Math.min(
      99,
      Math.round((matches.length / selectedInterests.length) * 100)
    )
  }

  const getFilteredOpportunities = () => {
    let results = [...opportunities]

    if (activeCategory !== 'All') {
      results = results.filter(
        (opportunity) => opportunity.category === activeCategory
      )
    }

    if (ageFilter !== 'Any') {
      results = results.filter((opportunity) => {
        if (ageFilter === '13–15') {
          return (
            opportunity.age.includes('13') ||
            opportunity.age.includes('14') ||
            opportunity.age.includes('15')
          )
        }

        if (ageFilter === '16–18') {
          return (
            opportunity.age.includes('16') ||
            opportunity.age.includes('17') ||
            opportunity.age.includes('18')
          )
        }

        if (ageFilter === '18+') {
          return opportunity.age.includes('18')
        }

        return true
      })
    }

    if (yearGroupFilter !== 'Any') {
      results = results.filter((opportunity) =>
        opportunity.yearGroups.includes(yearGroupFilter)
      )
    }

    if (locationFilter !== 'Any') {
      results = results.filter((opportunity) => {
        if (locationFilter === 'UK') {
          return (
            opportunity.location.includes('UK') ||
            opportunity.location.includes('London') ||
            opportunity.location.includes('England')
          )
        }

        if (locationFilter === 'Online') {
          return opportunity.format === 'Online'
        }

        return opportunity.location.includes(locationFilter)
      })
    }

    if (formatFilter !== 'Any') {
      results = results.filter(
        (opportunity) => opportunity.format === formatFilter
      )
    }

    if (activityTypeFilter !== 'Any') {
      results = results.filter(
        (opportunity) =>
          opportunity.activityType === activityTypeFilter
      )
    }

    if (subjectFilter !== 'Any') {
      results = results.filter((opportunity) =>
        opportunity.subjects?.includes(subjectFilter)
      )
    }

    if (costFilter === 'Free') {
      results = results.filter((opportunity) => opportunity.cost === 'Free')
    }

    if (costFilter === 'Financial support') {
      results = results.filter((opportunity) => opportunity.support)
    }

    if (sort === 'Deadline soonest') {
      results.sort((a, b) => {
        const getDay = (text) =>
          parseInt(text.match(/\d+/)?.[0] || '99')

        return getDay(a.deadline) - getDay(b.deadline)
      })
    }

    if (sort === 'Most relevant' && selectedInterests.length > 0) {
      results.sort((a, b) => getMatchScore(b) - getMatchScore(a))
    }

    return results
  }

  const filteredOpportunities = getFilteredOpportunities()

  const matchedOpportunities = [...opportunities]
    .map((opportunity) => ({
      ...opportunity,
      matchScore: getMatchScore(opportunity),
    }))
    .filter((opportunity) => opportunity.matchScore > 0)
    .filter((opportunity) => {
      if (
        activityTypeFilter !== 'Any' &&
        opportunity.activityType !== activityTypeFilter
      ) {
        return false
      }

      if (
        subjectFilter !== 'Any' &&
        !opportunity.subjects?.includes(subjectFilter)
      ) {
        return false
      }

      if (
        yearGroupFilter !== 'Any' &&
        !opportunity.yearGroups.includes(yearGroupFilter)
      ) {
        return false
      }

      if (locationFilter !== 'Any') {
        if (locationFilter === 'UK') {
          if (
            !(
              opportunity.location.includes('UK') ||
              opportunity.location.includes('London') ||
              opportunity.location.includes('England')
            )
          ) {
            return false
          }
        }

        if (locationFilter === 'England') {
          if (!opportunity.location.includes('England')) {
            return false
          }
        }

        if (locationFilter === 'Online') {
          if (opportunity.format !== 'Online') {
            return false
          }
        }
      }

      if (formatFilter !== 'Any' && opportunity.format !== formatFilter) {
        return false
      }

      if (costFilter === 'Free' && opportunity.cost !== 'Free') {
        return false
      }

      if (
        costFilter === 'Financial support' &&
        !opportunity.support
      ) {
        return false
      }

      return true
    })
    .sort((a, b) => b.matchScore - a.matchScore)

  const clearFilters = () => {
    setActiveCategory('All')
    setAgeFilter('Any')
    setYearGroupFilter('Any')
    setLocationFilter('Any')
    setFormatFilter('Any')
    setCostFilter('All opportunities')
    setActivityTypeFilter('Any')
    setSubjectFilter('Any')
  }

  const goTo = (destination) => {
    setShowMore(false)
    setPage(destination)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const openPremium = (feature) => {
    if (isPremium) {
      goTo(feature)
      return
    }

    setPremiumModal(feature)
  }

  return (
    <div className="app">
      <Navbar
        page={page}
        setPage={goTo}
        saved={saved}
        tracked={tracked}
        showMore={showMore}
        setShowMore={setShowMore}
        isPremium={isPremium}
      />

      {/* MATCH SETUP */}
      ```jsx
{page === 'Match' && (
  <main>
    <section className="hero-section">
      <div className="hero-content">
        <h1>
          Find opportunities
          <br />
          that fit you.
        </h1>

        <p>
          Use the filters below to find opportunities that fit
          your year group, activity type, subject, location and
          more.
        </p>

        <div
          style={{
            marginTop: '45px',
            padding: '22px',
            border: '1px solid #d8cdbb',
            borderRadius: '15px',
            background: '#ddd1bc',
          }}
        >
          <div className="eyebrow">
            REFINE YOUR RESULTS
          </div>

          <div style={{ marginTop: '12px' }}>

            {/* YEAR GROUP */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Year group
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {yearGroups.map((option) => {
                  const selected =
                    yearGroupFilter === option

                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setYearGroupFilter(option)
                      }
                      style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        border: selected
                          ? '1px solid #315b3d'
                          : '1px solid #cfc2ad',
                        background: selected
                          ? '#315b3d'
                          : '#f5efe5',
                        color: selected
                          ? '#fff'
                          : '#315b3d',
                        fontWeight: selected
                          ? '700'
                          : '500',
                        cursor: 'pointer',
                      }}
                    >
                      {selected && option !== 'Any'
                        ? '✓ '
                        : ''}
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* ACTIVITY TYPE */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Activity type
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {activityTypes.map((option) => {
                  const selected =
                    activityTypeFilter === option

                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setActivityTypeFilter(option)
                      }
                      style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        border: selected
                          ? '1px solid #315b3d'
                          : '1px solid #cfc2ad',
                        background: selected
                          ? '#315b3d'
                          : '#f5efe5',
                        color: selected
                          ? '#fff'
                          : '#315b3d',
                        fontWeight: selected
                          ? '700'
                          : '500',
                        cursor: 'pointer',
                      }}
                    >
                      {selected && option !== 'Any'
                        ? '✓ '
                        : ''}
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* SUBJECT */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Subject
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {subjects.map((option) => {
                  const selected =
                    subjectFilter === option

                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setSubjectFilter(option)
                      }
                      style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        border: selected
                          ? '1px solid #315b3d'
                          : '1px solid #cfc2ad',
                        background: selected
                          ? '#315b3d'
                          : '#f5efe5',
                        color: selected
                          ? '#fff'
                          : '#315b3d',
                        fontWeight: selected
                          ? '700'
                          : '500',
                        cursor: 'pointer',
                      }}
                    >
                      {selected && option !== 'Any'
                        ? '✓ '
                        : ''}
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* LOCATION */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Location
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {['Any', 'UK', 'England', 'Online'].map(
                  (option) => {
                    const selected =
                      locationFilter === option

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          setLocationFilter(option)
                        }
                        style={{
                          padding: '9px 14px',
                          borderRadius: '999px',
                          border: selected
                            ? '1px solid #315b3d'
                            : '1px solid #cfc2ad',
                          background: selected
                            ? '#315b3d'
                            : '#f5efe5',
                          color: selected
                            ? '#fff'
                            : '#315b3d',
                          fontWeight: selected
                            ? '700'
                            : '500',
                          cursor: 'pointer',
                        }}
                      >
                        {selected && option !== 'Any'
                          ? '✓ '
                          : ''}
                        {option}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* FORMAT */}
            <div style={{ marginBottom: '22px' }}>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Format
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {['Any', 'Online', 'In-person', 'Hybrid'].map(
                  (option) => {
                    const selected =
                      formatFilter === option

                    return (
                      <button
                        key={option}
                        onClick={() =>
                          setFormatFilter(option)
                        }
                        style={{
                          padding: '9px 14px',
                          borderRadius: '999px',
                          border: selected
                            ? '1px solid #315b3d'
                            : '1px solid #cfc2ad',
                          background: selected
                            ? '#315b3d'
                            : '#f5efe5',
                          color: selected
                            ? '#fff'
                            : '#315b3d',
                          fontWeight: selected
                            ? '700'
                            : '500',
                          cursor: 'pointer',
                        }}
                      >
                        {selected && option !== 'Any'
                          ? '✓ '
                          : ''}
                        {option}
                      </button>
                    )
                  }
                )}
              </div>
            </div>

            {/* COST */}
            <div>
              <label
                style={{
                  display: 'block',
                  marginBottom: '10px',
                  color: '#294b35',
                  fontSize: '12px',
                  fontWeight: '700',
                }}
              >
                Cost
              </label>

              <div
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {[
                  'All opportunities',
                  'Free',
                  'Financial support',
                ].map((option) => {
                  const selected =
                    costFilter === option

                  return (
                    <button
                      key={option}
                      onClick={() =>
                        setCostFilter(option)
                      }
                      style={{
                        padding: '9px 14px',
                        borderRadius: '999px',
                        border: selected
                          ? '1px solid #315b3d'
                          : '1px solid #cfc2ad',
                        background: selected
                          ? '#315b3d'
                          : '#f5efe5',
                        color: selected
                          ? '#fff'
                          : '#315b3d',
                        fontWeight: selected
                          ? '700'
                          : '500',
                        cursor: 'pointer',
                      }}
                    >
                      {selected &&
                      option !== 'All opportunities'
                        ? '✓ '
                        : ''}
                      {option}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>

          <button
            className="filter-button"
            onClick={clearFilters}
            style={{ marginTop: '15px' }}
          >
            Clear all filters
          </button>
        </div>

        <button
          className="view-button"
          style={{
            maxWidth: '280px',
            marginTop: '25px',
          }}
          onClick={() => goTo('Results')}
        >
          Find my matches →
        </button>
      </div>
    </section>
  </main>
)}
```

      {/* MATCH RESULTS */}
      {page === 'Results' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">
                YOUR RESULTS
              </span>

              <h1>
                Your matches
                <br />
                are ready.
              </h1>

              <p>
                We've found {matchedOpportunities.length}{' '}
                opportunities that match your interests and filters.
              </p>

              <div
                style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  marginTop: '25px',
                }}
              >
                {selectedInterests.map((interest) => (
                  <span key={interest} className="category-tag">
                    {interest}
                  </span>
                ))}
              </div>

              <button
                className="view-button"
                style={{
                  maxWidth: '230px',
                  marginTop: '20px',
                }}
                onClick={() => goTo('Match')}
              >
                Change filters
              </button>
            </div>
          </section>

          <section className="opportunities-section">
            {matchedOpportunities.length === 0 ? (
              <NoResultsCard
                onChangeFilters={() => goTo('Match')}
                onPremium={() => setPremiumModal('recommendations')}
              />
            ) : (
              <div className="opportunity-grid">
                {matchedOpportunities.map((opportunity) => (
                  <OpportunityCard
                    key={opportunity.title}
                    opportunity={opportunity}
                    saved={saved}
                    tracked={tracked}
                    toggleSaved={toggleSaved}
                    attemptTrack={attemptTrack}
                    onView={() =>
                      setSelectedOpportunity(opportunity)
                    }
                    matchScore={opportunity.matchScore}
                    isPremium={isPremium}
                  />
                ))}
              </div>
            )}
          </section>
        </main>
      )}

      {/* DISCOVER */}
      {page === 'Discover' && (
        <>
          <main>
            <section className="hero-section">
              <div className="hero-content">
                <span className="eyebrow">
                  YOUR NEXT OPPORTUNITY
                </span>

                <h1>
                  Discover opportunities
                  <br />
                  you didn't know existed.
                </h1>

                <p>
                  Find competitions, work experience, research,
                  volunteering, leadership, sport, creative and
                  international opportunities — matched to where you
                  are and where you want to go.
                </p>
              </div>
            </section>

            <section className="category-section">
              <div className="category-list">
                {categories.map((category) => (
                  <button
                    key={category}
                    className={
                      activeCategory === category
                        ? 'category active'
                        : 'category'
                    }
                    onClick={() => setActiveCategory(category)}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </section>

            <section className="closing-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">
                    DON'T MISS OUT
                  </span>
                  <h2>Closing soon</h2>
                </div>
              </div>

              <div className="closing-grid">
                {opportunities.slice(3, 6).map((opportunity) => (
                  <button
                    className="closing-card"
                    key={opportunity.title}
                    onClick={() =>
                      setSelectedOpportunity(opportunity)
                    }
                  >
                    <div className="days-left">
                      {opportunity.days}
                    </div>

                    <h3>{opportunity.title}</h3>

                    <p>{opportunity.organisation}</p>

                    <div className="deadline">
                      Deadline: {opportunity.deadline}
                    </div>
                  </button>
                ))}
              </div>
            </section>

            <section className="opportunities-section">
              <div className="toolbar">
                <div>
                  <strong>{filteredOpportunities.length}</strong>{' '}
                  opportunities found
                </div>

                <div className="toolbar-right">
                  <button
                    className="filter-button"
                    onClick={() => setShowFilters(!showFilters)}
                  >
                    ☷ Filters
                  </button>

                  <select
                    className="sort-select"
                    value={sort}
                    onChange={(event) =>
                      setSort(event.target.value)
                    }
                  >
                    <option>Most relevant</option>
                    <option>Newest</option>
                    <option>Deadline soonest</option>
                    <option>Recently updated</option>
                  </select>
                </div>
              </div>

              {showFilters && (
                <div className="filter-panel">
                  <FilterSelect
                    label="Category"
                    value={activeCategory}
                    setValue={setActiveCategory}
                    options={categories}
                  />

                  <FilterSelect
                    label="Year group"
                    value={yearGroupFilter}
                    setValue={setYearGroupFilter}
                    options={yearGroups}
                  />

                  <FilterSelect
                    label="Activity type"
                    value={activityTypeFilter}
                    setValue={setActivityTypeFilter}
                    options={activityTypes}
                  />

                  <FilterSelect
                    label="Subject"
                    value={subjectFilter}
                    setValue={setSubjectFilter}
                    options={subjects}
                  />

                  <FilterSelect
                    label="Age"
                    value={ageFilter}
                    setValue={setAgeFilter}
                    options={[
                      'Any',
                      '13–15',
                      '16–18',
                      '18+',
                    ]}
                  />

                  <FilterSelect
                    label="Location"
                    value={locationFilter}
                    setValue={setLocationFilter}
                    options={[
                      'Any',
                      'UK',
                      'England',
                      'Online',
                    ]}
                  />

                  <FilterSelect
                    label="Format"
                    value={formatFilter}
                    setValue={setFormatFilter}
                    options={[
                      'Any',
                      'Online',
                      'In-person',
                      'Hybrid',
                    ]}
                  />

                  <FilterSelect
                    label="Cost"
                    value={costFilter}
                    setValue={setCostFilter}
                    options={[
                      'All opportunities',
                      'Free',
                      'Financial support',
                    ]}
                  />

                  <button
                    className="filter-button"
                    onClick={clearFilters}
                    style={{
                      gridColumn: '1 / -1',
                      marginTop: '5px',
                    }}
                  >
                    Clear filters
                  </button>
                </div>
              )}

              {filteredOpportunities.length === 0 ? (
                <NoResultsCard
                  onChangeFilters={clearFilters}
                  onPremium={() =>
                    setPremiumModal('recommendations')
                  }
                />
              ) : (
                <div className="opportunity-grid">
                  {filteredOpportunities.map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.title}
                      opportunity={opportunity}
                      saved={saved}
                      tracked={tracked}
                      toggleSaved={toggleSaved}
                      attemptTrack={attemptTrack}
                      onView={() =>
                        setSelectedOpportunity(opportunity)
                      }
                      matchScore={getMatchScore(opportunity)}
                      isPremium={isPremium}
                    />
                  ))}
                </div>
              )}
            </section>

            {!weeklySubscribed && (
              <section className="closing-section">
                <WeeklyPromotion
                  email={weeklyEmail}
                  setEmail={setWeeklyEmail}
                  onSubscribe={subscribeWeekly}
                />
              </section>
            )}
          </main>

          <footer>
            <div className="footer-brand">GrowthGrind</div>

            <p>
              Explore more. Experience more. Become more.
            </p>
          </footer>
        </>
      )}

      {/* SAVED */}
      {page === 'Saved' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">
                YOUR SAVED LIST
              </span>

              <h1>
                Opportunities
                <br />
                worth remembering.
              </h1>

              <p>
                Keep track of the opportunities you don't want to lose.
              </p>
            </div>
          </section>

          <section className="opportunities-section">
            {saved.length === 0 ? (
              <div className="closing-card">
                <h3>No saved opportunities yet.</h3>

                <p>
                  Save opportunities from Discover or your Match results.
                </p>

                <button
                  className="view-button"
                  onClick={() => goTo('Discover')}
                >
                  Discover opportunities →
                </button>
              </div>
            ) : (
              <div className="opportunity-grid">
                {opportunities
                  .filter((opportunity) =>
                    saved.includes(opportunity.title)
                  )
                  .map((opportunity) => (
                    <OpportunityCard
                      key={opportunity.title}
                      opportunity={opportunity}
                      saved={saved}
                      tracked={tracked}
                      toggleSaved={toggleSaved}
                      attemptTrack={attemptTrack}
                      onView={() =>
                        setSelectedOpportunity(opportunity)
                      }
                      isPremium={isPremium}
                    />
                  ))}
              </div>
            )}

            {!weeklySubscribed && (
              <div style={{ marginTop: '35px' }}>
                <WeeklyPromotion
                  email={weeklyEmail}
                  setEmail={setWeeklyEmail}
                  onSubscribe={subscribeWeekly}
                />
              </div>
            )}
          </section>
        </main>
      )}

      {/* PROFILE */}
      {page === 'Profile' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">YOUR PROFILE</span>

              <h1>
                Build your
                <br />
                opportunity profile.
              </h1>

              <p>
                Your interests help GrowthGrind recommend
                opportunities that suit you.
              </p>

              <div
                className="closing-card"
                style={{ marginTop: '35px' }}
              >
                <h3>Your interests</h3>

                {selectedInterests.length > 0 ? (
                  <div
                    style={{
                      display: 'flex',
                      flexWrap: 'wrap',
                      gap: '8px',
                      marginTop: '15px',
                    }}
                  >
                    {selectedInterests.map((interest) => (
                      <span
                        key={interest}
                        className="category-tag"
                      >
                        {interest}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p>No interests selected yet.</p>
                )}

                <button
                  className="view-button"
                  onClick={() => goTo('Match')}
                >
                  Edit interests →
                </button>
              </div>

              <div
                className="closing-card"
                style={{
                  marginTop: '20px',
                  border: isPremium
                    ? '1px solid #b9c9b9'
                    : '1px solid #d8cdbb',
                }}
              >
                <div className="days-left">
                  {isPremium ? 'PREMIUM MEMBER' : 'FREE MEMBER'}
                </div>

                <h3>
                  {isPremium
                    ? 'Your Premium membership is active.'
                    : "You're currently using GrowthGrind Free."}
                </h3>

                <p>
                  {isPremium
                    ? 'Your Premium tools and experience portfolio are unlocked.'
                    : 'Upgrade when you want personalised admissions guidance, the experience tracker and other Premium tools.'}
                </p>

                {!isPremium && (
                  <button
                    className="view-button"
                    onClick={() => goTo('Pricing')}
                  >
                    Explore Premium →
                  </button>
                )}
              </div>
            </div>
          </section>
        </main>
      )}

      {/* TRACK */}
      {page === 'Track' && (
        <main>
          {!isPremium ? (
            <section className="hero-section">
              <div className="hero-content">
                <span className="eyebrow">
                  PREMIUM FEATURE
                </span>

                <h1>
                  Build your
                  <br />
                  experience portfolio.
                </h1>

                <p>
                  Keep your supercurriculars, extracurriculars,
                  volunteering, work experience, sport and projects
                  all in one place.
                </p>

                <div
                  className="closing-card"
                  style={{
                    marginTop: '35px',
                    border: '1px solid #b9c9b9',
                  }}
                >
                  <div className="days-left">
                    PREMIUM
                  </div>

                  <h3>
                    Your whole student journey, in one place.
                  </h3>

                  <p>
                    The GrowthGrind experience tracker is available
                    to Premium members. Track what you've done,
                    reflect on what you learned and build a record
                    you can use when preparing for university
                    applications.
                  </p>

                  <button
                    className="view-button"
                    onClick={() => goTo('Pricing')}
                  >
                    Unlock my portfolio →
                  </button>
                </div>
              </div>
            </section>
          ) : (
            <section className="hero-section">
              <div className="hero-content">
                <span className="eyebrow">
                  YOUR PORTFOLIO
                </span>

                <h1>
                  Build your
                  <br />
                  experience portfolio.
                </h1>

                <p>
                  Keep your supercurriculars, extracurriculars,
                  volunteering, work experience and projects all in one
                  place.
                </p>

                <div
                  className="closing-grid"
                  style={{ marginTop: '40px' }}
                >
                  <div className="closing-card">
                    <div className="days-left">
                      TRACKED
                    </div>

                    <h3>{tracked.length}</h3>

                    <p>
                      Activities in your portfolio
                    </p>
                  </div>

                  <div className="closing-card">
                    <div className="days-left">
                      SAVED
                    </div>

                    <h3>{saved.length}</h3>

                    <p>
                      Opportunities you're considering
                    </p>
                  </div>

                  <div className="closing-card">
                    <div className="days-left">
                      APPLIED
                    </div>

                    <h3>
                      {
                        Object.values(applicationStatus).filter(
                          (status) => status === 'Applied'
                        ).length
                      }
                    </h3>

                    <p>
                      Applications started
                    </p>
                  </div>
                </div>

                <div style={{ marginTop: '50px' }}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">
                        YOUR ACTIVITIES
                      </span>

                      <h2>
                        {tracked.length === 0
                          ? 'Start building your portfolio'
                          : 'Your tracked experience'}
                      </h2>
                    </div>
                  </div>

                  {tracked.length === 0 ? (
                    <div className="closing-card">
                      <h3>
                        Nothing tracked yet.
                      </h3>

                      <p>
                        When you complete an opportunity, use
                        + Track to add it to your GrowthGrind
                        portfolio.
                      </p>

                      <button
                        className="view-button"
                        onClick={() => goTo('Discover')}
                      >
                        Find opportunities →
                      </button>
                    </div>
                  ) : (
                    <div
                      style={{
                        display: 'grid',
                        gap: '12px',
                      }}
                    >
                      {opportunities
                        .filter((opportunity) =>
                          tracked.includes(opportunity.title)
                        )
                        .map((opportunity) => (
                          <div
                            className="closing-card"
                            key={opportunity.title}
                          >
                            <div className="card-top">
                              <span className="category-tag">
                                {opportunity.category}
                              </span>

                              <button
                                className="filter-button"
                                onClick={() =>
                                  attemptTrack(
                                    opportunity.title
                                  )
                                }
                              >
                                ✓ Tracked
                              </button>
                            </div>

                            <h3
                              style={{
                                marginTop: '15px',
                              }}
                            >
                              {opportunity.title}
                            </h3>

                            <p>
                              {opportunity.organisation}
                            </p>

                            <div className="details">
                              <span>
                                {opportunity.category}
                              </span>

                              <span>
                                {opportunity.format}
                              </span>

                              <span>
                                {opportunity.location}
                              </span>
                            </div>

                            <div
                              style={{
                                marginTop: '18px',
                              }}
                            >
                              <label
                                style={{
                                  display: 'block',
                                  marginBottom: '7px',
                                  color: '#69655b',
                                  fontSize: '11px',
                                  fontWeight: '650',
                                }}
                              >
                                What did you learn?
                              </label>

                              <textarea
                                placeholder="Add notes about what you learned, skills you developed or what you could mention in a personal statement..."
                                style={{
                                  width: '100%',
                                  minHeight: '90px',
                                  padding: '11px',
                                  borderRadius: '9px',
                                  border:
                                    '1px solid #d0c4b0',
                                  background: '#f5efe5',
                                  color: '#315b3d',
                                  font: 'inherit',
                                  resize: 'vertical',
                                }}
                              />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </div>
            </section>
          )}
        </main>
      )}

      {/* PRICING */}
      {page === 'Pricing' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">
                GROWTHGRIND PREMIUM
              </span>

              <h1>
                Your personal
                <br />
                admissions advisor.
              </h1>

              <p>
                Go beyond finding opportunities. Get personalised
                guidance to help you make better university,
                admissions and career decisions.
              </p>

              <div
                className="closing-card"
                style={{
                  marginTop: '35px',
                  border: '1px solid #b9c9b9',
                }}
              >
                <div className="days-left">
                  🚀 FOUNDING MEMBER OFFER
                </div>

                <h3>
                  First 30 students get their first month FREE.
                </h3>

                <p>
                  Join GrowthGrind early and claim your free first
                  month of Premium before the founding-member places
                  are gone.
                </p>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: '15px',
                    flexWrap: 'wrap',
                    marginTop: '18px',
                    padding: '14px',
                    borderRadius: '10px',
                    background: '#dce8dc',
                    color: '#315b3d',
                    fontWeight: '750',
                  }}
                >
                  <span>
                    {foundingMembersClaimed}/
                    {foundingMemberLimit} claimed
                  </span>

                  <span>
                    {foundingSpotsLeft} spots remaining
                  </span>
                </div>
              </div>
            </div>
          </section>

          <section className="opportunities-section">
            <div
              className="pricing-layout"
              style={{
                display: 'grid',
                gridTemplateColumns:
                  'minmax(280px, 0.8fr) minmax(0, 1.6fr)',
                gap: '25px',
                alignItems: 'start',
              }}
            >
              <div
                className="closing-card"
                style={{
                  position: 'sticky',
                  top: '95px',
                }}
              >
                <div className="days-left">
                  PREMIUM MEMBERSHIP
                </div>

                <h3
                  style={{
                    fontSize: '24px',
                    marginBottom: '20px',
                  }}
                >
                  Choose your plan
                </h3>

                <div
                  style={{
                    padding: '17px',
                    border: '1px solid #d8cdbb',
                    borderRadius: '12px',
                    background: '#f5efe5',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      color: '#294b35',
                      fontSize: '16px',
                      fontWeight: '700',
                    }}
                  >
                    Monthly
                  </div>

                  <div
                    style={{
                      marginTop: '5px',
                      color: '#315b3d',
                      fontSize: '25px',
                      fontWeight: '750',
                    }}
                  >
                    £8.99
                    <span
                      style={{
                        fontSize: '12px',
                        color: '#777166',
                        fontWeight: '500',
                      }}
                    >
                      {' '}
                      / month
                    </span>
                  </div>
                </div>

                <div
                  style={{
                    padding: '17px',
                    border: '1px solid #b9c9b9',
                    borderRadius: '12px',
                    background: '#f5efe5',
                    marginBottom: '10px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#294b35',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      1 Year
                    </div>

                    <span
                      style={{
                        padding: '4px 7px',
                        borderRadius: '5px',
                        background: '#dce8dc',
                        color: '#315b3d',
                        fontSize: '9px',
                        fontWeight: '800',
                      }}
                    >
                      SAVE 15%
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '7px',
                      color: '#315b3d',
                      fontSize: '25px',
                      fontWeight: '750',
                    }}
                  >
                    £89.99
                  </div>

                  <div
                    style={{
                      marginTop: '7px',
                      color: '#315b3d',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}
                  >
                    For students finishing in September 2027
                  </div>
                </div>

                <div
                  style={{
                    padding: '17px',
                    border: '1px solid #b9c9b9',
                    borderRadius: '12px',
                    background: '#f5efe5',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div
                      style={{
                        color: '#294b35',
                        fontSize: '16px',
                        fontWeight: '700',
                      }}
                    >
                      2 Years
                    </div>

                    <span
                      style={{
                        padding: '4px 7px',
                        borderRadius: '5px',
                        background: '#dce8dc',
                        color: '#315b3d',
                        fontSize: '9px',
                        fontWeight: '800',
                      }}
                    >
                      SAVE 15%
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: '7px',
                      color: '#315b3d',
                      fontSize: '25px',
                      fontWeight: '750',
                    }}
                  >
                    £169.99
                  </div>

                  <div
                    style={{
                      marginTop: '7px',
                      color: '#315b3d',
                      fontSize: '11px',
                      fontWeight: '700',
                    }}
                  >
                    For students finishing in September 2028
                  </div>
                </div>

                <button
                  className="view-button"
                  onClick={() =>
                    setPremiumModal('subscription')
                  }
                >
                  {isPremium
                    ? 'Premium active ✓'
                    : 'Choose a plan →'}
                </button>

                <div
                  style={{
                    marginTop: '15px',
                    paddingTop: '15px',
                    borderTop: '1px solid #ded3c1',
                  }}
                >
                  <div
                    style={{
                      color: '#777065',
                      fontSize: '10px',
                      fontWeight: '800',
                      letterSpacing: '0.7px',
                    }}
                  >
                    DEVELOPMENT PREVIEW
                  </div>

                  <p
                    style={{
                      margin: '6px 0 10px',
                      fontSize: '11px',
                    }}
                  >
                    This lets you test the Premium experience
                    before Stripe is connected.
                  </p>

                  <button
                    className="filter-button"
                    onClick={
                      isPremium
                        ? deactivateDemoPremium
                        : activateDemoPremium
                    }
                  >
                    {isPremium
                      ? 'Switch back to Free'
                      : 'Preview as Premium'}
                  </button>
                </div>
              </div>

              <div>
                <div className="section-heading">
                  <div>
                    <span className="eyebrow">
                      WHAT YOU GET
                    </span>

                    <h2>
                      Premium features
                    </h2>
                  </div>
                </div>

                <div
                  className="pricing-features"
                  style={{
                    display: 'grid',
                    gridTemplateColumns:
                      'repeat(2, minmax(0, 1fr))',
                    gap: '12px',
                  }}
                >
                  <PremiumFeature
                    number="01"
                    title="AI Admissions Advisor"
                    description="Personalised UK university and admissions guidance."
                    onClick={() =>
                      openPremium('AdmissionsAdvisor')
                    }
                  />

                  <PremiumFeature
                    number="02"
                    title="University & Course Finder"
                    description="Find UK courses and universities that fit you."
                    onClick={() =>
                      openPremium('CourseFinder')
                    }
                  />

                  <PremiumFeature
                    number="03"
                    title="Personal Statement Guidance"
                    description="Develop stronger ideas and improve your own writing."
                    onClick={() =>
                      openPremium('PersonalStatement')
                    }
                  />

                  <PremiumFeature
                    number="04"
                    title="Admissions Test Support"
                    description="Personalised guidance for relevant UK admissions tests."
                    onClick={() =>
                      openPremium('AdmissionsTests')
                    }
                  />

                  <PremiumFeature
                    number="05"
                    title="Career Quiz"
                    description="Discover career and degree pathways suited to you."
                    onClick={() =>
                      openPremium('CareerQuiz')
                    }
                  />

                  <PremiumFeature
                    number="06"
                    title="AI Research Project Builder"
                    description="Turn an idea into a structured independent research project."
                    onClick={() =>
                      openPremium('ResearchBuilder')
                    }
                  />

                  <PremiumFeature
                    number="07"
                    title="Super & Extra-Curricular Tracker"
                    description="Keep your competitions, projects, volunteering, sport, work experience and more in one place."
                    onClick={() => goTo('Track')}
                  />
                </div>

                <div
                  className="closing-card"
                  style={{
                    marginTop: '25px',
                    border: '1px solid #b9c9b9',
                  }}
                >
                  <div className="days-left">
                    COMING SOON
                  </div>

                  <h3>
                    GrowthGrind Exclusive Events
                  </h3>

                  <p>
                    As the GrowthGrind community grows, Premium
                    members will get access to exclusive events
                    designed to help build stronger supercurricular
                    and extracurricular portfolios.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {!weeklySubscribed && (
            <section className="closing-section">
              <WeeklyPromotion
                email={weeklyEmail}
                setEmail={setWeeklyEmail}
                onSubscribe={subscribeWeekly}
              />
            </section>
          )}
        </main>
      )}

      {/* PREMIUM FEATURE PAGES */}
      {page === 'AdmissionsAdvisor' && (
        <PremiumToolPage
          eyebrow="AI ADMISSIONS ADVISOR"
          title={
            <>
              Your personal
              <br />
              admissions advisor.
            </>
          }
          description="Get personalised guidance based on your academic interests, goals and the universities you are considering."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-grid">
            <ToolCard
              title="University choices"
              text="Explore how your interests, academic profile and goals could shape your university choices."
            />

            <ToolCard
              title="Supercurriculars"
              text="Get ideas for activities that genuinely develop your academic interests."
            />

            <ToolCard
              title="Admissions strategy"
              text="Build a stronger understanding of what different UK universities and courses look for."
            />
          </div>
        </PremiumToolPage>
      )}

      {page === 'CourseFinder' && (
        <PremiumToolPage
          eyebrow="UNIVERSITY & COURSE FINDER"
          title={
            <>
              Find courses
              <br />
              that fit you.
            </>
          }
          description="Explore UK university and course options using your interests, subjects and goals."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-card">
            <h3>What do you want to study?</h3>

            <p>
              This tool will eventually combine your academic profile,
              interests, admissions tests and preferences to recommend
              suitable UK courses.
            </p>

            <div className="details">
              <span>Subject</span>
              <span>University</span>
              <span>Entry requirements</span>
              <span>Admissions tests</span>
              <span>Course content</span>
            </div>
          </div>
        </PremiumToolPage>
      )}

      {page === 'PersonalStatement' && (
        <PremiumToolPage
          eyebrow="PERSONAL STATEMENT GUIDANCE"
          title={
            <>
              Turn your experiences
              <br />
              into stronger ideas.
            </>
          }
          description="GrowthGrind will help you reflect on what you have actually learned and developed, rather than simply generating a statement for you."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-card">
            <h3>Your strongest experiences</h3>

            <p>
              Your tracked activities can eventually be analysed to
              identify themes, academic interests, reflections and
              evidence you could discuss in your application.
            </p>

            <button
              className="view-button"
              onClick={() => goTo('Track')}
            >
              Open my experience portfolio →
            </button>
          </div>
        </PremiumToolPage>
      )}

      {page === 'AdmissionsTests' && (
        <PremiumToolPage
          eyebrow="ADMISSIONS TEST SUPPORT"
          title={
            <>
              Prepare with
              <br />
              purpose.
            </>
          }
          description="Get personalised guidance for relevant UK admissions tests and understand how they fit into your university choices."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-grid">
            <ToolCard
              title="TMUA"
              text="Personalised preparation guidance for students applying to courses where TMUA is relevant."
            />

            <ToolCard
              title="TSA"
              text="Understand how TSA preparation can fit into your wider admissions strategy."
            />

            <ToolCard
              title="Other tests"
              text="Future support can cover other relevant UK admissions tests."
            />
          </div>
        </PremiumToolPage>
      )}

      {page === 'CareerQuiz' && (
        <PremiumToolPage
          eyebrow="CAREER QUIZ"
          title={
            <>
              Discover where
              <br />
              your interests could lead.
            </>
          }
          description="Explore career and degree pathways based on the subjects, activities and interests you enjoy."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-card">
            <h3>Career quiz</h3>

            <p>
              The full interactive quiz will ask about your interests,
              strengths, preferred working styles and subjects before
              producing personalised career and degree suggestions.
            </p>

            <button
              className="view-button"
              onClick={() =>
                alert(
                  'The full Career Quiz will be connected here next.'
                )
              }
            >
              Start quiz →
            </button>
          </div>
        </PremiumToolPage>
      )}

      {page === 'ResearchBuilder' && (
        <PremiumToolPage
          eyebrow="AI RESEARCH PROJECT BUILDER"
          title={
            <>
              Turn an idea
              <br />
              into research.
            </>
          }
          description="Develop your own independent research project with structured help from GrowthGrind AI."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <div className="closing-card">
            <h3>What are you interested in?</h3>

            <textarea
              placeholder="For example: I'm interested in the economics of football..."
              style={{
                width: '100%',
                minHeight: '120px',
                marginTop: '12px',
                padding: '12px',
                borderRadius: '9px',
                border: '1px solid #d0c4b0',
                background: '#f5efe5',
                color: '#315b3d',
                font: 'inherit',
                resize: 'vertical',
              }}
            />

            <button
              className="view-button"
              onClick={() =>
                alert(
                  'The AI Research Project Builder will be connected to the AI model next.'
                )
              }
            >
              Develop my idea →
            </button>
          </div>
        </PremiumToolPage>
      )}

      {/* ABOUT */}
      {page === 'About' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">
                ABOUT GROWTHGRIND
              </span>

              <h1>
                Explore more.
                <br />
                Experience more.
                <br />
                Become more.
              </h1>

              <p>
                GrowthGrind exists to help students discover
                opportunities they might never have found
                themselves — and turn those experiences into
                meaningful personal and academic growth.
              </p>
            </div>
          </section>

          <section className="opportunities-section">
            <div className="closing-grid">
              <div className="closing-card">
                <div className="days-left">
                  DISCOVER
                </div>

                <h3>
                  Find opportunities beyond the obvious.
                </h3>

                <p>
                  Competitions, work experience, research,
                  volunteering, leadership, sport and more —
                  brought together in one place.
                </p>
              </div>

              <div className="closing-card">
                <div className="days-left">
                  DEVELOP
                </div>

                <h3>
                  Build experiences that matter.
                </h3>

                <p>
                  GrowthGrind is designed to help students
                  actively develop their interests rather than
                  simply collect activities.
                </p>
              </div>

              <div className="closing-card">
                <div className="days-left">
                  GROW
                </div>

                <h3>
                  Make better decisions about your future.
                </h3>

                <p>
                  From opportunities today to university and
                  career decisions tomorrow, GrowthGrind aims
                  to support the whole journey.
                </p>
              </div>
            </div>
          </section>
        </main>
      )}

      {/* HELP */}
      {page === 'Help' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">
                HELP & SUPPORT
              </span>

              <h1>
                How can we
                <br />
                help?
              </h1>

              <p>
                Find answers to common questions about
                GrowthGrind and its features.
              </p>
            </div>
          </section>

          <section className="opportunities-section">
            <div
              style={{
                display: 'grid',
                gap: '15px',
              }}
            >
              <HelpQuestion
                question="What is GrowthGrind?"
                answer="GrowthGrind is a platform designed to help students discover opportunities, build experience and make better decisions about their future."
              />

              <HelpQuestion
                question="What is free on GrowthGrind?"
                answer="Opportunity discovery, searching, filtering, saving, personalised matching and GrowthGrind Weekly are designed to be free."
              />

              <HelpQuestion
                question="What does Premium include?"
                answer="Premium adds personalised admissions guidance, university and course guidance, personal statement support, admissions test support, career exploration, an AI research project builder and the experience portfolio."
              />

              <HelpQuestion
                question="Why can't I use + Track?"
                answer="The experience tracker is a Premium feature. Free members can save opportunities, while Premium members can track completed experiences in their personal portfolio."
              />

              <HelpQuestion
                question="Do I need Premium for GrowthGrind Weekly?"
                answer="No. GrowthGrind Weekly is completely free. Anyone can sign up to receive new opportunities and opportunities closing soon."
              />

              <HelpQuestion
                question="How much does Premium cost?"
                answer="GrowthGrind Premium is planned at £8.99 per month, with discounted longer-term plans."
              />

              <HelpQuestion
                question="What countries does GrowthGrind cover?"
                answer="GrowthGrind is initially focused on opportunities and university guidance in the UK."
              />

              <HelpQuestion
                question="How do I contact GrowthGrind?"
                answer="A dedicated support contact system will be added as the platform develops."
              />
            </div>
          </section>
        </main>
      )}

      {/* MORE MENU */}
      {showMore && (
        <div
          style={{
            position: 'fixed',
            top: '62px',
            right: '90px',
            zIndex: 200,
            background: '#f5efe5',
            border: '1px solid #d5c9b5',
            borderRadius: '12px',
            padding: '8px',
            boxShadow:
              '0 10px 30px rgba(50, 47, 40, 0.15)',
            display: 'flex',
            flexDirection: 'column',
            minWidth: '210px',
          }}
        >
          <button
            className="nav-link"
            onClick={() => goTo('Match')}
          >
            Personalised matching
          </button>

          <button
            className="nav-link"
            onClick={() => goTo('Profile')}
          >
            My profile
          </button>

          <button
            className="nav-link"
            onClick={() => goTo('About')}
          >
            About GrowthGrind
          </button>

          <button
            className="nav-link"
            onClick={() => goTo('Help')}
          >
            Help & support
          </button>
        </div>
      )}

      {/* WEEKLY POPUP */}
      {showWeeklyPopup && !weeklySubscribed && (
        <div
          className="modal-backdrop"
          onClick={closeWeeklyPopup}
        >
          <div
            className="modal"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="close-modal"
              onClick={closeWeeklyPopup}
            >
              ×
            </button>

            <span className="category-tag">
              FREE FOR EVERYONE
            </span>

            <h2>
              Never miss an opportunity.
            </h2>

            <h4>
              Get GrowthGrind Weekly.
            </h4>

            <p>
              Once a week, we'll send you a simple roundup of new
              opportunities and opportunities that are closing soon.
            </p>

            <p>
              <strong>
                No Premium subscription required.
              </strong>
            </p>

            <input
              type="email"
              placeholder="Your email address"
              value={weeklyEmail}
              onChange={(event) =>
                setWeeklyEmail(event.target.value)
              }
              style={{
                width: '100%',
                padding: '12px',
                borderRadius: '9px',
                border: '1px solid #d0c4b0',
                background: '#f5efe5',
                color: '#315b3d',
                font: 'inherit',
                marginTop: '10px',
              }}
            />

            <button
              className="primary-button"
              onClick={subscribeWeekly}
              disabled={!weeklyEmail.trim()}
              style={{
                opacity: weeklyEmail.trim() ? 1 : 0.5,
              }}
            >
              Get GrowthGrind Weekly →
            </button>

            <button
              className="filter-button"
              onClick={closeWeeklyPopup}
              style={{
                width: '100%',
                marginTop: '10px',
              }}
            >
              Maybe later
            </button>
          </div>
        </div>
      )}

      {/* PREMIUM MODAL */}
      {premiumModal && (
        <PremiumModal
          type={premiumModal}
          onClose={() => setPremiumModal(null)}
          onUpgrade={() => {
            setPremiumModal(null)
            goTo('Pricing')
          }}
        />
      )}

      {/* OPPORTUNITY MODAL */}
      {selectedOpportunity && (
        <OpportunityModal
          opportunity={selectedOpportunity}
          onClose={() => setSelectedOpportunity(null)}
          saved={saved}
          toggleSaved={toggleSaved}
          attemptTrack={attemptTrack}
          isPremium={isPremium}
        />
      )}
    </div>
  )
}

function Navbar({
  page,
  setPage,
  saved,
  tracked,
  showMore,
  setShowMore,
  isPremium,
}) {
  return (
    <header className="navbar">
      <div className="brand">
        <div
          className="brand-mark"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0px',
            overflow: 'hidden',
          }}
        >
          <span
            style={{
              display: 'inline-block',
              transform: 'translateX(2px)',
            }}
          >
            G
          </span>

          <span
            style={{
              display: 'inline-block',
              transform:
                'rotate(180deg) translateX(2px)',
              marginLeft: '-7px',
            }}
          >
            G
          </span>
        </div>

        <span>GrowthGrind</span>
      </div>

      <nav className="nav-links">
        <button
          className={
            page === 'Discover'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Discover')}
        >
          Discover
        </button>

        <button
          className={
            page === 'Match' || page === 'Results'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Match')}
        >
          Match
        </button>

        <button
          className={
            page === 'Track'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Track')}
        >
          Track

          {isPremium && tracked.length > 0 && (
            <span className="saved-count">
              {tracked.length}
            </span>
          )}
        </button>

        <button
          className={
            page === 'Saved'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Saved')}
        >
          Saved

          {saved.length > 0 && (
            <span className="saved-count">
              {saved.length}
            </span>
          )}
        </button>

        <button
          className={
            page === 'Profile'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Profile')}
        >
          Profile
        </button>

        <button
          className={
            page === 'Pricing'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Pricing')}
        >
          Pricing
        </button>

        <button
          className="more-button"
          onClick={() => setShowMore(!showMore)}
        >
          More <span>⌄</span>
        </button>
      </nav>

      <button
        className="sign-out"
        onClick={() => setPage('Profile')}
      >
        {isPremium ? 'Premium ✓' : 'Free account'}
      </button>
    </header>
  )
}

function FilterSelect({
  label,
  value,
  setValue,
  options,
}) {
  return (
    <div>
      <label>{label}</label>

      <select
        value={value}
        onChange={(event) => setValue(event.target.value)}
      >
        {options.map((option) => (
          <option key={option}>{option}</option>
        ))}
      </select>
    </div>
  )
}

function PremiumFeature({
  number,
  title,
  description,
  onClick,
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '16px',
        padding: '17px 19px',
        border: '1px solid #d8cdbb',
        borderRadius: '12px',
        background: '#f5efe5',
        boxShadow:
          '0 3px 12px rgba(50, 47, 40, 0.05)',
        textAlign: 'left',
        cursor: 'pointer',
      }}
    >
      <div
        style={{
          minWidth: '38px',
          height: '38px',
          display: 'grid',
          placeItems: 'center',
          borderRadius: '9px',
          background: '#dce8dc',
          color: '#315b3d',
          fontSize: '11px',
          fontWeight: '800',
        }}
      >
        {number}
      </div>

      <div style={{ flex: 1 }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            flexWrap: 'wrap',
          }}
        >
          <h3
            style={{
              margin: 0,
              color: '#294b35',
              fontSize: '16px',
              letterSpacing: '-0.3px',
            }}
          >
            {title}
          </h3>

          <span
            style={{
              padding: '3px 6px',
              borderRadius: '5px',
              background: '#dce8dc',
              color: '#315b3d',
              fontSize: '8px',
              fontWeight: '800',
              letterSpacing: '0.5px',
            }}
          >
            PREMIUM
          </span>
        </div>

        <p
          style={{
            margin: '5px 0 0',
            color: '#777065',
            fontSize: '12px',
            lineHeight: '1.45',
          }}
        >
          {description}
        </p>
      </div>
    </button>
  )
}

function OpportunityCard({
  opportunity,
  saved,
  tracked,
  toggleSaved,
  attemptTrack,
  onView,
  matchScore,
  isPremium,
}) {
  const isTracked = tracked.includes(opportunity.title)

  return (
    <article className="opportunity-card">
      <div className="card-top">
        <span className="category-tag">
          {opportunity.category}
        </span>

        <button
          className="save-button"
          onClick={() =>
            toggleSaved(opportunity.title)
          }
        >
          {saved.includes(opportunity.title)
            ? '♥'
            : '♡'}
        </button>
      </div>

      {matchScore > 0 && (
        <div
          style={{
            marginTop: '12px',
            color: '#315b3d',
            fontSize: '11px',
            fontWeight: '800',
          }}
        >
          {matchScore}% MATCH
        </div>
      )}

      <h3>{opportunity.title}</h3>

      <div className="organisation">
        {opportunity.organisation}
      </div>

      <p>{opportunity.description}</p>

      <div className="details">
        <span>⌖ {opportunity.location}</span>
        <span>◉ {opportunity.format}</span>
        <span>♙ Ages {opportunity.age}</span>
        <span>{opportunity.activityType}</span>
      </div>

      <div className="deadline-row">
        <span>{opportunity.deadline}</span>
        <span>{opportunity.days}</span>
      </div>

      <div className="card-bottom">
        <span className="free">
          {opportunity.cost}
        </span>

        {opportunity.support && (
          <span className="support">
            {opportunity.support}
          </span>
        )}
      </div>

      <button
        className="view-button"
        onClick={onView}
      >
        View opportunity
      </button>

      <button
        onClick={() =>
          attemptTrack(opportunity.title)
        }
        style={{
          width: '100%',
          marginTop: '8px',
          padding: '10px',
          borderRadius: '9px',
          border: isTracked
            ? '1px solid #315b3d'
            : '1px solid #cfc2ad',
          background: isTracked
            ? '#dce8dc'
            : '#e9dfcf',
          color: '#315b3d',
          fontSize: '12px',
          fontWeight: '700',
        }}
      >
        {isTracked ? '✓ Tracked' : '+ Track'}

        {!isPremium && !isTracked && (
          <span
            style={{
              marginLeft: '5px',
              fontSize: '9px',
              opacity: 0.7,
            }}
          >
            🔒 PREMIUM
          </span>
        )}
      </button>
    </article>
  )
}

function OpportunityModal({
  opportunity,
  onClose,
  saved,
  toggleSaved,
  attemptTrack,
  isPremium,
}) {
  const isTracked = false

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        <span className="category-tag">
          {opportunity.category}
        </span>

        <h2>{opportunity.title}</h2>

        <h4>{opportunity.organisation}</h4>

        <p>{opportunity.description}</p>

        <div className="modal-details">
          <span>📍 {opportunity.location}</span>
          <span>◉ {opportunity.format}</span>
          <span>♙ Ages {opportunity.age}</span>
          <span>{opportunity.activityType}</span>
          <span>£ {opportunity.cost}</span>
        </div>

        <div className="modal-deadline">
          Deadline: {opportunity.deadline}
        </div>

        <button
          className="primary-button"
          onClick={() =>
            toggleSaved(opportunity.title)
          }
        >
          {saved.includes(opportunity.title)
            ? '♥ Saved'
            : '♡ Save opportunity'}
        </button>

        <button
          style={{
            width: '100%',
            marginTop: '10px',
            border: isPremium
              ? '1px solid #315b3d'
              : '1px solid #cfc2ad',
            borderRadius: '9px',
            background: isPremium
              ? '#dce8dc'
              : '#e9dfcf',
            color: '#315b3d',
            padding: '13px',
            fontWeight: '650',
          }}
          onClick={() =>
            attemptTrack(opportunity.title)
          }
        >
          {isTracked
            ? '✓ Tracked in my portfolio'
            : '+ Track this activity'}

          {!isPremium && (
            <span
              style={{
                marginLeft: '6px',
                fontSize: '9px',
              }}
            >
              🔒 PREMIUM
            </span>
          )}
        </button>

        <a
          className="view-button"
          style={{
            marginTop: '10px',
            display: 'block',
            textAlign: 'center',
            textDecoration: 'none',
          }}
          href={opportunity.link}
          target="_blank"
          rel="noopener noreferrer"
        >
          Visit opportunity →
        </a>
      </div>
    </div>
  )
}

function NoResultsCard({
  onChangeFilters,
  onPremium,
}) {
  return (
    <div
      className="closing-card"
      style={{
        textAlign: 'center',
        padding: '40px 25px',
      }}
    >
      <div className="days-left">
        NO CURRENT MATCHES
      </div>

      <h3>
        No current opportunities match those filters.
      </h3>

      <p>
        Try broadening your search or removing one or two
        filters. New opportunities are added regularly.
      </p>

      <button
  className="filter-button"
  onClick={onChangeFilters}
>
  Broaden my search
</button>

      <div
        style={{
          marginTop: '25px',
          paddingTop: '25px',
          borderTop: '1px solid #ded3c1',
        }}
      >
        <h3>
          Want more personalised recommendations?
        </h3>

        <p>
          Premium gives you detailed recommendations and guidance
          tailored to your interests, academic goals and future
          plans.
        </p>

        <button
          className="view-button"
          onClick={onPremium}
          style={{
            maxWidth: '330px',
            margin: '15px auto 0',
          }}
        >
          Explore Premium →
        </button>
      </div>
    </div>
  )
}

function WeeklyPromotion({
  email,
  setEmail,
  onSubscribe,
}) {
  return (
    <div className="closing-card">
      <div className="days-left">
        FREE FOR EVERYONE
      </div>

      <h3>
        GrowthGrind Weekly
      </h3>

      <p>
        Get new opportunities and opportunities closing soon
        delivered to your inbox once a week.
      </p>

      <div
        style={{
          display: 'flex',
          gap: '10px',
          flexWrap: 'wrap',
          marginTop: '20px',
        }}
      >
        <input
          type="email"
          placeholder="Your email address"
          value={email}
          onChange={(event) =>
            setEmail(event.target.value)
          }
          style={{
            flex: '1 1 250px',
            minWidth: '220px',
            padding: '12px',
            borderRadius: '9px',
            border: '1px solid #d0c4b0',
            background: '#f5efe5',
            color: '#315b3d',
            font: 'inherit',
          }}
        />

        <button
          className="filter-button"
          onClick={onSubscribe}
          disabled={!email.trim()}
        >
          Sign me up
        </button>
      </div>
    </div>
  )
}

function PremiumModal({
  type,
  onClose,
  onUpgrade,
}) {
  const content = {
    tracker: {
      title: 'Track your whole student journey.',
      description:
        'The experience portfolio is a Premium feature. Track competitions, research, volunteering, sport, work experience, projects and more — all in one place.',
    },
    recommendations: {
      title: 'Get recommendations built around you.',
      description:
        'Premium gives you detailed recommendations and guidance tailored to your interests, academic goals and future plans.',
    },
    subscription: {
      title: 'Premium is coming next.',
      description:
        'The £8.99/month Premium membership will be connected to secure payments when Stripe is added. The first 30 students will be eligible for the launch free-month offer.',
    },
    AdmissionsAdvisor: {
      title: 'Your personal AI admissions advisor.',
      description:
        'Premium gives you personalised UK university, admissions and supercurricular guidance.',
    },
    CourseFinder: {
      title: 'Find the right university course.',
      description:
        'Premium will help you compare UK courses and universities based on your academic profile and goals.',
    },
    PersonalStatement: {
      title: 'Build a stronger personal statement.',
      description:
        'Premium helps you reflect on your own experiences and develop stronger ideas for your application.',
    },
    AdmissionsTests: {
      title: 'Get personalised admissions test support.',
      description:
        'Premium will help you understand which admissions tests matter and how to approach preparation.',
    },
    CareerQuiz: {
      title: 'Discover career pathways.',
      description:
        'Premium will use your interests and preferences to explore potential careers and degree pathways.',
    },
    ResearchBuilder: {
      title: 'Turn your idea into a research project.',
      description:
        'Premium will help you develop an idea into a structured independent research project.',
    },
  }

  const selected =
    content[type] || content.recommendations

  return (
    <div
      className="modal-backdrop"
      onClick={onClose}
    >
      <div
        className="modal"
        onClick={(event) =>
          event.stopPropagation()
        }
      >
        <button
          className="close-modal"
          onClick={onClose}
        >
          ×
        </button>

        <span className="category-tag">
          PREMIUM
        </span>

        <h2>{selected.title}</h2>

        <p>{selected.description}</p>

        <div
          className="modal-details"
          style={{ marginTop: '20px' }}
        >
          <span>£8.99 / month</span>
          <span>UK-focused</span>
          <span>Personalised</span>
        </div>

        <button
          className="primary-button"
          onClick={onUpgrade}
        >
          Explore Premium →
        </button>

        <button
          className="filter-button"
          onClick={onClose}
          style={{
            width: '100%',
            marginTop: '10px',
          }}
        >
          Maybe later
        </button>
      </div>
    </div>
  )
}

function PremiumToolPage({
  eyebrow,
  title,
  description,
  isPremium,
  onUpgrade,
  children,
}) {
  return (
    <main>
      <section className="hero-section">
        <div className="hero-content">
          <span className="eyebrow">
            {eyebrow}
          </span>

          <h1>{title}</h1>

          <p>{description}</p>

          {!isPremium ? (
            <div
              className="closing-card"
              style={{
                marginTop: '35px',
                border: '1px solid #b9c9b9',
              }}
            >
              <div className="days-left">
                PREMIUM FEATURE
              </div>

              <h3>
                Unlock this with GrowthGrind Premium.
              </h3>

              <p>
                Get personalised guidance designed around your
                interests, goals and future plans.
              </p>

              <button
                className="view-button"
                onClick={onUpgrade}
              >
                Unlock Premium →
              </button>
            </div>
          ) : (
            <div style={{ marginTop: '40px' }}>
              {children}
            </div>
          )}
        </div>
      </section>
    </main>
  )
}

function ToolCard({
  title,
  text,
}) {
  return (
    <div className="closing-card">
      <div className="days-left">
        PREMIUM
      </div>

      <h3>{title}</h3>

      <p>{text}</p>

      <button
        className="filter-button"
        onClick={() =>
          alert(
            'This tool will be connected to the AI system next.'
          )
        }
      >
        Open tool →
      </button>
    </div>
  )
}

function HelpQuestion({
  question,
  answer,
}) {
  return (
    <div className="closing-card">
      <h3>{question}</h3>

      <p
        style={{
          marginBottom: 0,
        }}
      >
        {answer}
      </p>
    </div>
  )
}

export default App

