import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { supabase } from './supabaseClient'
import HomePage from './HomePage'

import './App.css'

async function readApiJson(response, fallback = 'The service returned an unexpected response. Please try again.') {
  const body = await response.text()
  if (!body) return {}
  try {
    return JSON.parse(body)
  } catch {
    return { error: fallback }
  }
}

const courseSearchAliases = {
  maths: ['mathematics', 'mathematical'],
  math: ['mathematics', 'mathematical'],
  cs: ['computer science'],
  econ: ['economics'],
  lse: ['london school of economics'],
  ucl: ['university college london'],
  kcl: ["king's college london"],
  imperial: ['imperial college london'],
  warwick: ['university of warwick'],
  oxford: ['university of oxford'],
  cambridge: ['university of cambridge'],
}

function expandCourseSearchTerms(value) {
  const cleaned = value.trim().replace(/[(),]/g, ' ')
  return [...new Set([cleaned, ...(courseSearchAliases[cleaned.toLowerCase()] || [])].filter(Boolean))]
}

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

const aiSpecialists = [
  { id: 'general', name: 'GrowthGrind AI', description: 'Ask anything', starter: 'I’m not sure where to begin — can you help me work out my next step?' },
  { id: 'courses', name: 'Course Finder', description: 'Courses and universities', starter: 'I enjoy [subjects/interests]. What university course areas should I explore?' },
  { id: 'admissions', name: 'Admissions Advisor', description: 'Your application strategy', starter: 'I’m considering [course/universities]. What should I focus on next?' },
  { id: 'statement', name: 'Personal Statement', description: 'Reflect on your evidence', starter: 'I want to study [course]. How can I reflect on my experiences without just listing them?' },
  { id: 'tests', name: 'Admissions Tests', description: 'What to investigate', starter: 'I am considering [course/universities]. Which admissions tests should I check?' },
  { id: 'research', name: 'Research Builder', description: 'Build a project idea', starter: 'I’m interested in [topic]. Can you help me turn it into a research project?' },
  { id: 'study', name: 'GrowthGrind Study', description: 'Your AI exam tutor', starter: 'I need help with [subject/topic]. Please guide me one step at a time instead of giving the answer immediately.' },
]

const premiumRoadmap = [
  { id: 'tariff', stage: 'EXPLORE', title: 'Tariff & grade calculator', description: 'Convert qualifications and understand how grades compare with course requirements.' },
  { id: 'contextual', stage: 'EXPLORE', title: 'Contextual support finder', description: 'Answer a short eligibility questionnaire, then check a university’s live contextual-admissions policy.' },
  { id: 'statement-builder', stage: 'APPLY', title: 'Interactive personal statement builder', description: 'Plan responses, track characters and receive feedback that preserves your own voice.' },
  { id: 'test-planner', stage: 'APPLY', title: 'Admissions test planner', description: 'Identify tests to investigate, build practice habits and track registration dates.' },
  { id: 'interview', stage: 'APPLY', title: 'Interview practice hub', description: 'Prepare for interviews with structured question practice and reflection.' },
  { id: 'portfolio', stage: 'APPLY', title: 'Creative portfolio hub', description: 'Organise portfolio work, requirements and feedback for creative applications.' },
  { id: 'multi-course', stage: 'APPLY', title: 'Multi-course statement analyser', description: 'Check whether one statement gives the right weight to every course you are applying for.' },
  { id: 'circumstances', stage: 'APPLY', title: 'Extenuating circumstances guide', description: 'Turn a difficult situation into a factual timeline to discuss with a trusted referee.' },
  { id: 'balance', stage: 'DECIDE', title: 'Choice balance dashboard', description: 'Review whether your university choices are balanced around your own goals and grades.' },
  { id: 'firm-insurance', stage: 'DECIDE', title: 'Firm & insurance planner', description: 'Compare offer conditions and map realistic results-day scenarios.' },
  { id: 'clearing', stage: 'DECIDE', title: 'Clearing & Extra planner', description: 'Save a prepared plan for late applications and results-day options.' },
  { id: 'timeline', stage: 'STAY ON TRACK', title: 'Smart deadline timeline', description: 'Bring course, test, finance, open-day and portfolio deadlines into one plan.' },
  { id: 'progress', stage: 'STAY ON TRACK', title: 'Application progress tracker', description: 'Track decisions, next steps and your personal application timeline.' },
  { id: 'international-quals', stage: 'STAY ON TRACK', title: 'International qualification guide', description: 'Understand qualification terminology and conditions to verify with each university.' },
  { id: 'career-quiz', stage: 'EXPLORE', title: 'Career Quiz', description: 'Answer quick yes/no questions to discover your top three career sectors and job routes.' },
  { id: 'study', stage: 'GROWTHGRIND STUDY', title: 'GrowthGrind Study — AI exam tutor', description: 'Scan questions, get Socratic help, save mistakes and build a weakness profile.' },
]

const premiumFeatureGroups = [
  {
    label: 'PLAN & EXPLORE',
    features: ['GrowthGrind AI', 'AI Admissions Advisor', 'University & Course Finder', 'Career Quiz', 'Tariff & Grade Calculator', 'Contextual Support Finder', 'International Qualification Guide'],
  },
  {
    label: 'BUILD YOUR APPLICATION',
    features: ['Personal Statement Guidance', 'Interactive Personal Statement Builder', 'Multi-course Statement Analyser', 'AI Research Project Builder', 'Admissions Test Support', 'Admissions Test Planner', 'Interview Practice Hub', 'Creative Portfolio Hub'],
  },
  {
    label: 'MAKE SMARTER CHOICES',
    features: ['Super & Extra-Curricular Tracker', 'GrowthGrind Study & Mistake Bank', 'Extenuating Circumstances Guide', 'Choice Balance Dashboard', 'Firm & Insurance Planner', 'Clearing & Extra Planner', 'Smart Deadline Timeline', 'Application Progress Tracker'],
  },
]

function App() {
    const [theme, setTheme] = useState(() => localStorage.getItem('growthgrind_theme') || 'light')
    const [opportunities, setOpportunities] = useState([])
    const [opportunitiesLoading, setOpportunitiesLoading] = useState(true)
    const [opportunitiesError, setOpportunitiesError] = useState('')
    const [catalogueRefresh, setCatalogueRefresh] = useState(0)
    const courseSuggestionCache = useRef(new Map())

  useEffect(() => {
    const loadOpportunities = async () => {
      const catalogueCacheKey = 'growthgrind_opportunity_catalogue_v1'
      const cacheMaxAge = 10 * 60 * 1000
      setOpportunitiesLoading(true)
      setOpportunitiesError('')
      try {
        const cached = JSON.parse(sessionStorage.getItem(catalogueCacheKey) || 'null')
        if (catalogueRefresh === 0 && cached?.savedAt && Array.isArray(cached.rows) && Date.now() - cached.savedAt < cacheMaxAge) {
          setOpportunities(cached.rows)
          setOpportunitiesLoading(false)
          return
        }
      } catch {
        // A missing or full browser storage area should never block Discover.
      }

      const pageSize = 1000
      let from = 0
      let allRows = []
      let error = null

      // Supabase returns at most 1,000 rows per request by default. Keep
      // fetching until the final short page so Discover reflects the full
      // GrowthGrind catalogue rather than silently stopping at 1,000.
      while (true) {
        const response = await supabase
          .from('opportunities')
          // Keep the public catalogue payload lean: Discover only receives
          // fields it actually renders or filters, not every database column.
          .select('id,category,activity_type,title,provider,description,location,format,age_range,year_groups,deadline,cost,interests,subjects,link')
          // Source collectors retire listings when their official deadline
          // passes. Never show a retired listing in Discover or Match.
          .eq('is_active', true)
          .order('id', { ascending: true })
          .range(from, from + pageSize - 1)

        if (response.error) {
          error = response.error
          break
        }

        const rows = response.data || []
        allRows = allRows.concat(rows)
        if (rows.length < pageSize) break
        from += pageSize
      }

      if (error) {
        console.error('Error loading opportunities:', error)
        setOpportunitiesError('We could not refresh the opportunity catalogue right now. Your connection may be temporary — try again in a moment.')
        setOpportunitiesLoading(false)
        return
      }

      const uniqueRows = Array.from(new Map(allRows.map((item) => [item.link || item.id, item])).values())
      const formattedOpportunities = uniqueRows.map((item) => ({
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
        deadlineRaw: item.deadline || null,
        deadline: item.deadline
          ? new Date(item.deadline).toLocaleDateString('en-GB')
          : '',
        days: item.deadline
          ? (() => {
              const today = new Date()
              today.setHours(0, 0, 0, 0)

              const deadline = new Date(item.deadline)
              deadline.setHours(0, 0, 0, 0)

              const difference = Math.ceil(
                (deadline - today) / (1000 * 60 * 60 * 24)
              )

              if (difference < 0) return 'Closed'
              if (difference === 0) return 'Today'
              if (difference === 1) return '1 day left'

              return `${difference} days left`
            })()
          : '',
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
      setOpportunitiesLoading(false)
      try {
        sessionStorage.setItem(catalogueCacheKey, JSON.stringify({ savedAt: Date.now(), rows: formattedOpportunities }))
      } catch {
        // Some private browsers restrict storage. The live catalogue still works.
      }
    }

    loadOpportunities()
  }, [catalogueRefresh])
  const [page, setPage] = useState('Home')

  const [selectedInterests, setSelectedInterests] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)

  const [saved, setSaved] = useState([])
  const [tracked, setTracked] = useState([])
  const [trackedActivities, setTrackedActivities] = useState({})
  const [journeyExplanations, setJourneyExplanations] = useState({})
  const [journeyExplanationLoading, setJourneyExplanationLoading] = useState('')
  const [session, setSession] = useState(null)
  const [authModal, setAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [courseQuery, setCourseQuery] = useState('')
  const [selectedCourseTitles, setSelectedCourseTitles] = useState([])
  const [courseSuggestions, setCourseSuggestions] = useState([])
  const [courseRegion, setCourseRegion] = useState('All UK')
  const [courseMode, setCourseMode] = useState('All study modes')
  const [courseProvider, setCourseProvider] = useState('')
  const [selectedProviders, setSelectedProviders] = useState([])
  const [providerSuggestions, setProviderSuggestions] = useState([])
  const [courseAbroad, setCourseAbroad] = useState('UK only')
  const [courseGradeProfile, setCourseGradeProfile] = useState('')
  const [courseProfileGrades, setCourseProfileGrades] = useState([])
  const [coursePlanning, setCoursePlanning] = useState(false)
  const [courseShortlist, setCourseShortlist] = useState(() => {
    try { return JSON.parse(localStorage.getItem('growthgrind_course_shortlist') || '{}') } catch { return {} }
  })
  const [courseResults, setCourseResults] = useState([])
  const [courseIntelligence, setCourseIntelligence] = useState({})
  const [courseLoading, setCourseLoading] = useState(false)
  const [courseError, setCourseError] = useState('')
  const [courseSearched, setCourseSearched] = useState(false)
  const [aiDetails, setAiDetails] = useState({})
  const [aiResults, setAiResults] = useState({})
  const [aiLoading, setAiLoading] = useState('')
  const [aiError, setAiError] = useState({})
  const [activeAiChat, setActiveAiChat] = useState('general')
  const [aiChats, setAiChats] = useState(() => {
    const savedChats = localStorage.getItem('growthgrind_ai_chats')
    if (savedChats) return JSON.parse(savedChats)
    return Object.fromEntries(aiSpecialists.map((specialist) => [specialist.id, []]))
  })
  const [aiChatInput, setAiChatInput] = useState('')
  const [aiChatLoading, setAiChatLoading] = useState(false)
  const [aiChatError, setAiChatError] = useState('')
  const [aiAttachment, setAiAttachment] = useState(null)
  const [aiGoal, setAiGoal] = useState(() => localStorage.getItem('growthgrind_ai_goal') || 'Explore my next best step')
  const [studyMistakeBank, setStudyMistakeBank] = useState(() => {
    try { return JSON.parse(localStorage.getItem('growthgrind_study_mistakes') || '[]') } catch { return [] }
  })

  const [showFilters, setShowFilters] = useState(false)
  const [sort, setSort] = useState('Most relevant')
  const [showMore, setShowMore] = useState(false)
  const closingSoonScroller = useRef(null)

  const [ageFilter, setAgeFilter] = useState('Any')
  const [yearGroupFilter, setYearGroupFilter] = useState('Any')
  const [locationFilter, setLocationFilter] = useState('Any')
  const [formatFilter, setFormatFilter] = useState('Any')
  const [costFilter, setCostFilter] = useState('All opportunities')
  const [activityTypeFilter, setActivityTypeFilter] = useState('Any')
  const [subjectFilter, setSubjectFilter] = useState('Any')
  const [opportunitySearch, setOpportunitySearch] = useState('')
  const [discoverVisibleCount, setDiscoverVisibleCount] = useState(60)
  const [matchYearGroups, setMatchYearGroups] = useState([])
  const [matchActivityTypes, setMatchActivityTypes] = useState([])
  const [matchSubjects, setMatchSubjects] = useState([])
  const [matchLocations, setMatchLocations] = useState([])
  const [matchFormats, setMatchFormats] = useState([])
  const [matchCosts, setMatchCosts] = useState([])

  const [applicationStatus, setApplicationStatus] = useState({})

  const [showWeeklyPopup, setShowWeeklyPopup] = useState(false)
  const [weeklyEmail, setWeeklyEmail] = useState('')
  const [weeklySubscribed, setWeeklySubscribed] = useState(false)
  const [weeklySignupLoading, setWeeklySignupLoading] = useState(false)
  const [weeklySignupError, setWeeklySignupError] = useState('')

  const [premiumModal, setPremiumModal] = useState(null)
  const [showPremiumWelcome, setShowPremiumWelcome] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState('')
  const [checkoutError, setCheckoutError] = useState('')
  const [activePremiumWorkspace, setActivePremiumWorkspace] = useState(null)
  const [statementAnswers, setStatementAnswers] = useState(['', '', ''])
  const [statementCourse, setStatementCourse] = useState('')
  const [statementFeedback, setStatementFeedback] = useState(null)
  const [statementFeedbackLoading, setStatementFeedbackLoading] = useState(false)
  const [statementFeedbackError, setStatementFeedbackError] = useState('')
  const [premiumWorkspaceData, setPremiumWorkspaceData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('growthgrind_premium_workspace_data') || '{}') } catch { return {} }
  })
  const [careerQuizData, setCareerQuizData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('growthgrind_career_quiz_data') || '{}') } catch { return {} }
  })
  const [workspaceStateHydrated, setWorkspaceStateHydrated] = useState(false)
  const [studentIntelligence, setStudentIntelligence] = useState({})
  const [experienceIntelligence, setExperienceIntelligence] = useState([])

  const [isPremium, setIsPremium] = useState(
    localStorage.getItem('growthgrind_demo_premium') === 'true'
  )
  const [foundingMembersClaimed, setFoundingMembersClaimed] = useState(0)
  const [billingPortalAvailable, setBillingPortalAvailable] = useState(false)
  const [billingPortalLoading, setBillingPortalLoading] = useState(false)
  const [billingPortalError, setBillingPortalError] = useState('')

  const user = session?.user || null
  const shortlistEntries = Object.values(courseShortlist)
  const shortlistCounts = Object.fromEntries(['Safety', 'Target', 'Dream'].map((level) => [level, shortlistEntries.filter((item) => item.level === level).length]))

  useEffect(() => {
    const loadPremiumStatus = async () => {
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      const response = await fetch('/api/premium-status', { headers })
      if (!response.ok) return
      const status = await readApiJson(response)
      setFoundingMembersClaimed(status.foundingMembersClaimed || 0)
      setBillingPortalAvailable(Boolean(status.billingPortalAvailable))
      if (status.active) {
        setIsPremium(true)
        if (new URLSearchParams(window.location.search).get('premium') === 'success') {
          setShowPremiumWelcome(true)
          window.history.replaceState({}, '', window.location.pathname)
        }
      }
    }
    loadPremiumStatus()
  }, [user, session])

  useEffect(() => {
    localStorage.setItem('growthgrind_ai_chats', JSON.stringify(aiChats))
  }, [aiChats])

  useEffect(() => {
    localStorage.setItem('growthgrind_ai_goal', aiGoal)
  }, [aiGoal])

  useEffect(() => {
    localStorage.setItem('growthgrind_study_mistakes', JSON.stringify(studyMistakeBank))
  }, [studyMistakeBank])

  useEffect(() => {
    localStorage.setItem('growthgrind_premium_workspace_data', JSON.stringify(premiumWorkspaceData))
  }, [premiumWorkspaceData])

  useEffect(() => {
    localStorage.setItem('growthgrind_career_quiz_data', JSON.stringify(careerQuizData))
  }, [careerQuizData])

  useEffect(() => {
    localStorage.setItem('growthgrind_course_shortlist', JSON.stringify(courseShortlist))
  }, [courseShortlist])

  useEffect(() => {
    if (!user) {
      setWorkspaceStateHydrated(false)
      return
    }
    let cancelled = false
    const loadWorkspaceState = async () => {
      const profileRequest = supabase.from('student_intelligence').select('profile').eq('user_id', user.id).maybeSingle()
      const { data, error } = await supabase
        .from('user_workspace_state')
        .select('workspace_key, data')
        .eq('user_id', user.id)
      if (cancelled) return
      if (!error) {
        const state = Object.fromEntries((data || []).map((row) => [row.workspace_key, row.data]))
        if (state.premium_workspaces && typeof state.premium_workspaces === 'object') setPremiumWorkspaceData(state.premium_workspaces)
        if (state.course_shortlist && typeof state.course_shortlist === 'object') setCourseShortlist(state.course_shortlist)
        if (state.career_quiz && typeof state.career_quiz === 'object') setCareerQuizData(state.career_quiz)
        if (Array.isArray(state.study_mistakes)) setStudyMistakeBank(state.study_mistakes)
      }
      const { data: profileRow } = await profileRequest
      if (!cancelled && profileRow?.profile && typeof profileRow.profile === 'object') setStudentIntelligence(profileRow.profile)
      setWorkspaceStateHydrated(true)
    }
    loadWorkspaceState()
    return () => { cancelled = true }
  }, [user])

  useEffect(() => {
    if (!user) { setExperienceIntelligence([]); return }
    supabase.from('experience_intelligence').select('title, subjects, evidence, reflection, outcome').eq('user_id', user.id).then(({ data }) => setExperienceIntelligence(data || []))
  }, [user, trackedActivities])

  const saveWorkspaceState = async (workspaceKey, data) => {
    if (!user || !workspaceStateHydrated) return
    const { error } = await supabase.from('user_workspace_state').upsert({
      user_id: user.id,
      workspace_key: workspaceKey,
      data,
    }, { onConflict: 'user_id,workspace_key' })
    if (error) console.error('Could not save workspace state:', error.message)
  }

  useEffect(() => {
    if (!user || !workspaceStateHydrated) return
    const timer = window.setTimeout(() => supabase.from('student_intelligence').upsert({ user_id: user.id, profile: studentIntelligence }, { onConflict: 'user_id' }), 900)
    return () => window.clearTimeout(timer)
  }, [user, workspaceStateHydrated, studentIntelligence])

  useEffect(() => {
    if (!user || !workspaceStateHydrated) return
    const timer = window.setTimeout(() => saveWorkspaceState('premium_workspaces', premiumWorkspaceData), 900)
    return () => window.clearTimeout(timer)
  }, [user, workspaceStateHydrated, premiumWorkspaceData])

  useEffect(() => {
    if (!user || !workspaceStateHydrated) return
    const timer = window.setTimeout(() => saveWorkspaceState('course_shortlist', courseShortlist), 900)
    return () => window.clearTimeout(timer)
  }, [user, workspaceStateHydrated, courseShortlist])

  useEffect(() => {
    if (!user || !workspaceStateHydrated) return
    const timer = window.setTimeout(() => saveWorkspaceState('career_quiz', careerQuizData), 900)
    return () => window.clearTimeout(timer)
  }, [user, workspaceStateHydrated, careerQuizData])

  useEffect(() => {
    if (!user || !workspaceStateHydrated) return
    const timer = window.setTimeout(() => saveWorkspaceState('study_mistakes', studyMistakeBank), 900)
    return () => window.clearTimeout(timer)
  }, [user, workspaceStateHydrated, studyMistakeBank])

  useEffect(() => {
    if (!user) return

    let cancelled = false
    const migrationKey = `growthgrind_ai_chats_migrated_${user.id}`

    const loadAiChats = async () => {
      const localChats = aiChats
      const { data: remoteMessages, error } = await supabase
        .from('ai_chat_messages')
        .select('specialist, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error || cancelled) return

      const hasRemoteMessages = (remoteMessages || []).length > 0
      const hasLocalMessages = Object.values(localChats).some((messages) => messages.length > 0)

      if (!hasRemoteMessages && hasLocalMessages && !localStorage.getItem(migrationKey)) {
        const rows = Object.entries(localChats).flatMap(([specialist, messages]) =>
          messages.map((message) => ({
            user_id: user.id,
            specialist,
            role: message.role,
            content: message.content,
          }))
        )
        const { error: migrationError } = await supabase.from('ai_chat_messages').insert(rows)
        if (!migrationError) localStorage.setItem(migrationKey, 'true')
        if (cancelled) return
      }

      const { data: freshMessages, error: freshError } = await supabase
        .from('ai_chat_messages')
        .select('specialist, role, content, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (freshError || cancelled) return
      const organised = Object.fromEntries(aiSpecialists.map((specialist) => [specialist.id, []]))
      ;(freshMessages || []).forEach((message) => {
        if (organised[message.specialist]) {
          organised[message.specialist].push({ role: message.role, content: message.content })
        }
      })
      setAiChats(organised)
    }

    loadAiChats()
    return () => {
      cancelled = true
    }
  }, [user])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session))

    const { data: listener } = supabase.auth.onAuthStateChange(
      (_event, nextSession) => setSession(nextSession)
    )

    return () => listener.subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!user) {
      setSaved([])
      setTracked([])
      setTrackedActivities({})
      return
    }

    const loadUserData = async () => {
      const [savedResult, trackedResult] = await Promise.all([
        supabase
          .from('saved_opportunities')
          .select('opportunity_id')
          .eq('user_id', user.id),
        supabase
          .from('tracked_activities')
          .select('opportunity_id, reflection, status')
          .eq('user_id', user.id),
      ])

      if (!savedResult.error) {
        setSaved((savedResult.data || []).map((item) => item.opportunity_id))
      }

      if (!trackedResult.error) {
        const activities = (trackedResult.data || []).reduce(
          (result, item) => ({ ...result, [item.opportunity_id]: item }),
          {}
        )
        setTracked(Object.keys(activities).map(Number))
        setTrackedActivities(activities)
      }
    }

    loadUserData()
  }, [user])

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

  const subscribeWeekly = async () => {
    if (!weeklyEmail.trim() || weeklySignupLoading) return
    setWeeklySignupLoading(true)
    setWeeklySignupError('')
    try {
      const response = await fetch('/api/subscribe-weekly', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: weeklyEmail }),
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'We could not save your Weekly sign-up right now.')
      localStorage.setItem('growthgrind_weekly_seen', 'true')
      localStorage.setItem('growthgrind_weekly_subscribed', 'true')
      setWeeklySubscribed(true)
      setShowWeeklyPopup(false)
      setWeeklyEmail('')
    } catch (error) {
      setWeeklySignupError(error.message || 'We could not save your Weekly sign-up right now.')
    } finally {
      setWeeklySignupLoading(false)
    }
  }

  const toggleInterest = (interest) => {
    setSelectedInterests((current) =>
      current.includes(interest)
        ? current.filter((item) => item !== interest)
        : [...current, interest]
    )
  }

  const openAuth = (mode = 'signin') => {
    setAuthMode(mode)
    setAuthMessage('')
    setAuthModal(true)
  }

  const toggleSaved = async (opportunity) => {
    if (!user) {
      openAuth()
      return
    }

    if (saved.includes(opportunity.id)) {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)
      if (!error) setSaved((current) => current.filter((id) => id !== opportunity.id))
      return
    }

    const { error } = await supabase.from('saved_opportunities').insert({
      user_id: user.id,
      opportunity_id: opportunity.id,
    })
    if (!error) setSaved((current) => [...current, opportunity.id])
  }

  const attemptTrack = async (opportunity) => {
    if (!user) {
      openAuth()
      return
    }

    if (!isPremium) {
      setPremiumModal('tracker')
      return
    }

    if (tracked.includes(opportunity.id)) {
      const { error } = await supabase
        .from('tracked_activities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunity.id)
      if (!error) {
        setTracked((current) => current.filter((id) => id !== opportunity.id))
        setTrackedActivities((current) => {
          const next = { ...current }
          delete next[opportunity.id]
          return next
        })
      }
      return
    }

    const activity = {
      user_id: user.id,
      opportunity_id: opportunity.id,
      title: opportunity.title,
      provider: opportunity.organisation,
      category: opportunity.category,
    }
    const { data, error } = await supabase
      .from('tracked_activities')
      .insert(activity)
      .select('opportunity_id, reflection, status')
      .single()
    if (!error) {
      setTracked((current) => [...current, opportunity.id])
      setTrackedActivities((current) => ({ ...current, [opportunity.id]: data }))
    }
  }

  const saveReflection = async (opportunityId) => {
    if (!user || !trackedActivities[opportunityId]) return
    await supabase
      .from('tracked_activities')
      .update({ reflection: trackedActivities[opportunityId].reflection })
      .eq('user_id', user.id)
      .eq('opportunity_id', opportunityId)
    const opportunity = opportunities.find((item) => item.id === opportunityId)
    const reflection = trackedActivities[opportunityId].reflection || ''
    if (opportunity && (reflection.trim() || trackedActivities[opportunityId].evidence?.trim() || trackedActivities[opportunityId].outcome?.trim())) {
      const { data: existing } = await supabase.from('experience_intelligence').select('id').eq('user_id', user.id).eq('opportunity_id', opportunityId).limit(1)
      const record = { user_id: user.id, opportunity_id: opportunityId, title: opportunity.title, subjects: opportunity.subjects || [], reflection, evidence: trackedActivities[opportunityId].evidence || '', outcome: trackedActivities[opportunityId].outcome || '', updated_at: new Date().toISOString() }
      if (existing?.[0]) await supabase.from('experience_intelligence').update(record).eq('id', existing[0].id)
      else await supabase.from('experience_intelligence').insert(record)
    }
  }

  const explainJourneyConnection = async (opportunity, linkedActivities) => {
    if (journeyExplanations[opportunity.id] || journeyExplanationLoading) return
    setJourneyExplanationLoading(opportunity.id)
    try {
      const response = await fetch('/api/journey-connection', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          activity: linkedActivities[0] && { title: linkedActivities[0].title, category: linkedActivities[0].category, type: linkedActivities[0].activityType, subjects: linkedActivities[0].subjects },
          nextOpportunity: { title: opportunity.title, category: opportunity.category, type: opportunity.activityType, subjects: opportunity.subjects },
        }),
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not explain this connection.')
      setJourneyExplanations((current) => ({ ...current, [opportunity.id]: result.explanation }))
    } catch (error) {
      setJourneyExplanations((current) => ({ ...current, [opportunity.id]: 'This is a relevant next step because it develops a related interest or skill. Open both opportunities and consider what you could learn or explore next.' }))
    } finally {
      setJourneyExplanationLoading('')
    }
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setAuthMessage('')
    const action = authMode === 'signin'
      ? supabase.auth.signInWithPassword({ email: authEmail, password: authPassword })
      : supabase.auth.signUp({ email: authEmail, password: authPassword })
    const { error } = await action
    if (error) {
      setAuthMessage(error.message)
      return
    }
    if (authMode === 'signup') {
      setAuthMessage('Check your email to confirm your account, then sign in.')
      return
    }
    setAuthModal(false)
    setAuthEmail('')
    setAuthPassword('')
  }

  const findCourses = async (event) => {
    event?.preventDefault()
    setCourseError('')
    setCourseLoading(true)
    setCourseSearched(true)

    try {
      const terms = expandCourseSearchTerms(courseQuery)
      const providerTerms = expandCourseSearchTerms(courseProvider)
      let request = supabase
        .from('university_courses')
        .select('id, course_title, provider_name, campus_name, country, qualification, study_mode, duration, subjects_text, course_url, source_updated_at')
        .order('course_title', { ascending: true })
        .limit(60)
      if (selectedCourseTitles.length) request = request.in('course_title', selectedCourseTitles)
      else if (terms.length) request = request.or(terms.flatMap((term) => [`course_title.ilike.%${term}%,subjects_text.ilike.%${term}%`]).join(','))
      if (selectedProviders.length) request = request.in('provider_name', selectedProviders)
      else if (providerTerms.length) request = request.or(providerTerms.map((term) => `provider_name.ilike.%${term}%`).join(','))
      if (courseRegion !== 'All UK') request = request.eq('country', courseRegion)
      if (courseMode !== 'All study modes') request = request.eq('study_mode', courseMode)
      if (courseAbroad === 'Study abroad option') request = request.ilike('course_title', '%study abroad%')
      const { data, error } = await request
      if (error) throw error
      const results = data || []
      setCourseResults(results)
      setCourseIntelligence({})

      // Fetch any saved, official-source requirement data once for the whole
      // result set rather than asking each course card to make its own request.
      if (results.length) {
        const universities = [...new Set(results.map((course) => course.provider_name).filter(Boolean))]
        const courses = [...new Set(results.map((course) => course.course_title).filter(Boolean))]
        const { data: intelligence } = await supabase
          .from('admissions_intelligence')
          .select('*')
          .in('university', universities)
          .in('course', courses)

        const byCourse = Object.fromEntries(
          (intelligence || []).map((item) => [`${item.university}::${item.course}`, item])
        )
        setCourseIntelligence(byCourse)
      }
    } catch (error) {
      setCourseError('The course catalogue is being updated. Please try again shortly.')
    } finally {
      setCourseLoading(false)
    }
  }

  useEffect(() => {
    let active = true
    const searchCatalogue = async () => {
      const courseTerms = expandCourseSearchTerms(courseQuery)
      const providerTerms = expandCourseSearchTerms(courseProvider)
      const courseTerm = courseTerms[0] || ''
      const providerTerm = providerTerms[0] || ''
      if (courseTerm.length < 2 && providerTerm.length < 2) { setCourseSuggestions([]); setProviderSuggestions([]); return }
      const cacheKey = `${courseTerms.join('|').toLowerCase()}::${providerTerms.join('|').toLowerCase()}`
      const cached = courseSuggestionCache.current.get(cacheKey)
      if (cached) {
        if (active) {
          setCourseSuggestions(cached.courses)
          setProviderSuggestions(cached.providers)
        }
        return
      }
      const requests = []
      if (courseTerm.length >= 2) requests.push(supabase.from('university_courses').select('course_title').or(courseTerms.map((term) => `course_title.ilike.%${term}%`).join(',')).order('course_title').limit(12))
      else requests.push(Promise.resolve({ data: [] }))
      if (providerTerm.length >= 2) requests.push(supabase.from('university_courses').select('provider_name').or(providerTerms.map((term) => `provider_name.ilike.%${term}%`).join(',')).order('provider_name').limit(30))
      else requests.push(Promise.resolve({ data: [] }))
      const [courseResponse, providerResponse] = await Promise.all(requests)
      const courses = [...new Set((courseResponse.data || []).map((item) => item.course_title))]
      const providers = [...new Set((providerResponse.data || []).map((item) => item.provider_name))]
      courseSuggestionCache.current.set(cacheKey, { courses, providers })
      if (active) {
        setCourseSuggestions(courses)
        setProviderSuggestions(providers)
      }
    }
    const timer = setTimeout(searchCatalogue, 320)
    return () => { active = false; clearTimeout(timer) }
  }, [courseQuery, courseProvider])

  const openGradeCourseFinder = (entries) => {
    const aLevels = entries.filter((entry) => entry.qualification === 'A level' && entry.grade).slice(0, 3)
    setCourseGradeProfile(aLevels.length ? `Predicted A-level profile: ${aLevels.map((entry) => `${entry.subject?.trim() ? `${entry.subject.trim()} ` : ''}${entry.grade}`).join(', ')}` : 'Add your predicted grades to personalise this search.')
    setCoursePlanning(false)
    setCourseProfileGrades(aLevels.map((entry) => entry.grade))
    goTo('CourseFinder')
  }

  useEffect(() => {
    if (page !== 'CourseFinder' || !studentIntelligence.targetCourses) return
    if (!courseQuery.trim()) setCourseQuery(studentIntelligence.targetCourses.split(',')[0].trim())
    if (studentIntelligence.predictedGrades && !courseGradeProfile) setCourseGradeProfile(`Predicted profile: ${studentIntelligence.predictedGrades}`)
    if (studentIntelligence.targetUniversities && !courseProvider.trim()) setCourseProvider(studentIntelligence.targetUniversities.split(',')[0].trim())
  }, [page, studentIntelligence])

  useEffect(() => {
    if (!statementCourse && studentIntelligence.targetCourses) {
      setStatementCourse(studentIntelligence.targetCourses)
    }
  }, [statementCourse, studentIntelligence.targetCourses])

  const addCourseToShortlist = (course, level) => {
    setCourseShortlist((current) => {
      const alreadyShortlisted = Boolean(current[course.id])
      if (!alreadyShortlisted && Object.keys(current).length >= 5) return current
      return {
        ...current,
        [course.id]: { id: course.id, title: course.course_title, provider: course.provider_name, level },
      }
    })
  }

  const runPremiumTool = async (event, tool) => {
    event.preventDefault()
    setAiLoading(tool)
    setAiError((current) => ({ ...current, [tool]: '' }))
    try {
      const response = await fetch('/api/premium-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool, details: aiDetails[tool] || {} }),
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Something went wrong.')
      setAiResults((current) => ({ ...current, [tool]: result }))
    } catch (error) {
      setAiError((current) => ({ ...current, [tool]: error.message }))
    } finally {
      setAiLoading('')
    }
  }

  const updateAiDetail = (tool, field, value) => {
    setAiDetails((current) => ({
      ...current,
      [tool]: { ...current[tool], [field]: value },
    }))
  }

  const openAiWorkspace = (specialist) => {
    if (!isPremium) {
      setPremiumModal(specialist === 'courses' ? 'CourseFinder' : 'recommendations')
      return
    }
    setActiveAiChat(specialist)
    goTo('Specialist')
  }

  const saveStudyMistake = (question, response) => {
    const text = question.toLowerCase()
    const subject = /integrat|algebra|equation|trigon|calculus|math/.test(text) ? 'Mathematics' : /biology|cell|genetic/.test(text) ? 'Biology' : /chemistry|mole|reaction/.test(text) ? 'Chemistry' : /physics|force|energy/.test(text) ? 'Physics' : 'Uncategorised'
    const topic = /integrat/.test(text) ? 'Integration' : /algebra|equation/.test(text) ? 'Algebra' : /trigon/.test(text) ? 'Trigonometry' : /calculus/.test(text) ? 'Calculus' : 'Review and tag later'
    const entry = { id: `${Date.now()}-${Math.random()}`, question: question.slice(0, 900), response: response.slice(0, 1400), subject, topic, mistakeType: 'Concept or method', savedAt: new Date().toISOString(), reviews: 0, nextReview: new Date().toISOString() }
    setStudyMistakeBank((current) => [entry, ...current.filter((item) => item.question !== entry.question)].slice(0, 25))
  }

  const reviewStudyMistake = (id) => {
    const intervals = [1, 3, 7, 14, 30]
    setStudyMistakeBank((current) => current.map((item) => {
      if (item.id !== id) return item
      const reviews = (item.reviews || 0) + 1
      const nextReview = new Date()
      nextReview.setDate(nextReview.getDate() + intervals[Math.min(reviews - 1, intervals.length - 1)])
      return { ...item, reviews, nextReview: nextReview.toISOString() }
    }))
  }

  const openPremiumWorkspace = (feature) => {
    if (!isPremium) {
      setPremiumModal('subscription')
      return
    }
    setActivePremiumWorkspace(feature)
    goTo('PremiumWorkspace')
  }

  const reviewStatementAnswers = async () => {
    if (statementAnswers.join('').trim().length < 40) {
      setStatementFeedbackError('Write a little more before asking for feedback.')
      return
    }
    setStatementFeedbackLoading(true)
    setStatementFeedbackError('')
    try {
      const response = await fetch('/api/statement-feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: statementAnswers, course: statementCourse, experiences: experienceIntelligence }),
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'We could not review this right now.')
      setStatementFeedback(result)
    } catch (error) {
      setStatementFeedbackError(error.message || 'We could not review this right now.')
    } finally {
      setStatementFeedbackLoading(false)
    }
  }


  const saveAiMessage = async (specialist, message) => {
    if (!user) return
    const { error } = await supabase.from('ai_chat_messages').insert({
      user_id: user.id,
      specialist,
      role: message.role,
      content: message.content,
    })
    if (error) console.error('Could not save AI chat message:', error.message)
  }

  const chooseAiAttachment = (event) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return
    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      setAiChatError('Please choose a PDF, JPG, PNG or WebP image.')
      return
    }
    if (file.size > 3 * 1024 * 1024) {
      setAiChatError('Attachments must be 3 MB or smaller for AI analysis.')
      return
    }
    setAiChatError('')
    setAiAttachment(file)
  }

  const uploadAiAttachment = async (file) => {
    if (!user) throw new Error('Please sign in before attaching a file.')
    const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '-')
    const path = `${user.id}/${Date.now()}-${safeName}`
    const { error } = await supabase.storage.from('ai-uploads').upload(path, file, {
      contentType: file.type,
      upsert: false,
    })
    if (error) throw new Error('Your attachment could not be uploaded. Please try again.')
  }

  const encodeAiAttachment = (file) => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve({
      name: file.name,
      mimeType: file.type,
      data: String(reader.result).split(',')[1],
    })
    reader.onerror = () => reject(new Error('Your attachment could not be read.'))
    reader.readAsDataURL(file)
  })

  const getAiStudentContext = () => {
    const opportunityById = new Map(opportunities.map((opportunity) => [opportunity.id, opportunity]))
    const compactOpportunity = (id) => {
      const opportunity = opportunityById.get(id)
      if (!opportunity) return null
      return {
        title: opportunity.title,
        category: opportunity.category,
        activity: opportunity.activityType,
        subjects: (opportunity.subjects || []).slice(0, 4),
      }
    }

    return {
      goal: aiGoal,
      academicProfile: {
        subjects: studentIntelligence.subjects || '',
        predictedGrades: studentIntelligence.predictedGrades || '',
        targetCourses: studentIntelligence.targetCourses || '',
        targetUniversities: studentIntelligence.targetUniversities || '',
      },
      matchPreferences: {
        yearGroups: matchYearGroups.slice(0, 4),
        activities: matchActivityTypes.slice(0, 6),
        subjects: matchSubjects.slice(0, 6),
        locations: matchLocations.slice(0, 4),
      },
      savedOpportunities: saved.map(compactOpportunity).filter(Boolean).slice(0, 6),
      trackedActivities: tracked.map((id) => {
        const activity = compactOpportunity(id)
        return activity ? { ...activity, status: applicationStatus[id] || 'Tracking', hasReflection: Boolean(trackedActivities[id]?.reflection?.trim()) } : null
      }).filter(Boolean).slice(0, 8),
    }
  }

  const sendAiChat = async (event) => {
    event.preventDefault()
    const message = aiChatInput.trim()
    if ((!message && !aiAttachment) || aiChatLoading) return
    if (aiAttachment && !user) {
      openAuth()
      return
    }
    const chatId = activeAiChat
    const currentMessages = aiChats[chatId] || []
    const attachmentLabel = aiAttachment ? `\n\n[Attached: ${aiAttachment.name}]` : ''
    const userMessage = { role: 'user', content: `${message || 'Please analyse this attachment.'}${attachmentLabel}` }
    setAiChats((current) => ({ ...current, [chatId]: [...currentMessages, userMessage] }))
    saveAiMessage(chatId, userMessage)
    setAiChatInput('')
    setAiChatError('')
    setAiChatLoading(true)
    try {
      const attachment = aiAttachment ? await encodeAiAttachment(aiAttachment) : null
      if (aiAttachment) await uploadAiAttachment(aiAttachment)
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialist: chatId, messages: currentMessages, message: message || 'Please analyse this attachment.', attachment, studentContext: getAiStudentContext(), stream: true }),
      })
      if (!response.ok) {
        const result = await readApiJson(response)
        throw new Error(result.error || 'Something went wrong.')
      }
      if (!response.body) throw new Error('Streaming is unavailable. Please try again.')
      const assistantMessage = { role: 'assistant', content: '' }
      setAiChats((current) => ({
        ...current,
        [chatId]: [...(current[chatId] || []), assistantMessage],
      }))
      const reader = response.body.getReader()
      const decoder = new TextDecoder()
      let buffer = ''
      let reply = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() || ''
        lines.forEach((line) => {
          if (!line.startsWith('data: ')) return
          const data = line.slice(6).trim()
          if (!data || data === '[DONE]') return
          try {
            const payload = JSON.parse(data)
            const text = payload.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('') || ''
            if (text) reply += text
          } catch {
            // A partial server-sent event will be completed by the next chunk.
          }
        })
        if (reply) {
          setAiChats((current) => ({
            ...current,
            [chatId]: [...(current[chatId] || []).slice(0, -1), { role: 'assistant', content: reply }],
          }))
        }
      }
      if (!reply) throw new Error('GrowthGrind AI returned no response.')
      saveAiMessage(chatId, { role: 'assistant', content: reply })
      setAiAttachment(null)
    } catch (error) {
      setAiChatError(error.message || 'GrowthGrind AI could not reply.')
    } finally {
      setAiChatLoading(false)
    }
  }

  const activateDemoPremium = () => {
    localStorage.setItem('growthgrind_demo_premium', 'true')
    setIsPremium(true)
    setPremiumModal(null)
    setShowPremiumWelcome(true)
  }

  const deactivateDemoPremium = () => {
    localStorage.removeItem('growthgrind_demo_premium')
    setIsPremium(false)
  }

  const startCheckout = async (plan) => {
    if (!user) {
      openAuth()
      return
    }
    setCheckoutError('')
    setCheckoutLoading(plan)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session?.access_token || ''}`,
        },
        body: JSON.stringify({ plan }),
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Checkout could not be opened.')
      window.location.assign(result.url)
    } catch (error) {
      setCheckoutError(error.message || 'Checkout could not be opened.')
    } finally {
      setCheckoutLoading('')
    }
  }

  const openBillingPortal = async () => {
    setBillingPortalLoading(true)
    setBillingPortalError('')
    try {
      const response = await fetch('/api/create-billing-portal', {
        method: 'POST',
        headers: { Authorization: `Bearer ${session?.access_token || ''}` },
      })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Billing management could not be opened.')
      window.location.assign(result.url)
    } catch (error) {
      setBillingPortalError(error.message || 'Billing management could not be opened.')
    } finally {
      setBillingPortalLoading(false)
    }
  }

  const getMatchScore = useCallback((opportunity) => {
    if (selectedInterests.length === 0) return 100

    const matches = (opportunity.interests || []).filter((interest) =>
      selectedInterests.includes(interest)
    )

    if (matches.length === 0) return 0

    return Math.min(
      99,
      Math.round((matches.length / selectedInterests.length) * 100)
    )
  }, [selectedInterests])

  const toggleMatchChoice = (setChoices, choice, resetChoice = 'Any') => {
    if (choice === resetChoice || choice === 'All opportunities') {
      setChoices([])
      return
    }
    setChoices((current) => current.includes(choice)
      ? current.filter((item) => item !== choice)
      : [...current, choice])
  }

  // Match filters are stored as arrays because students can select more than
  // one option in a row. An empty array is deliberately the "Any" state.
  // Keeping that state explicit here prevents Any from looking unclickable.
  const isMatchOptionSelected = (choices, option, resetChoice = 'Any') =>
    option === resetChoice || option === 'All opportunities'
      ? choices.length === 0
      : choices.includes(option)

  const clearMatchFilters = () => {
    setMatchYearGroups([])
    setMatchActivityTypes([])
    setMatchSubjects([])
    setMatchLocations([])
    setMatchFormats([])
    setMatchCosts([])
  }

  // Directory cards are useful fallbacks, but they should not crowd out a
  // named programme, placement or competition when students first open
  // Discover. They remain searchable and available in every relevant category.
  const isOpportunityDirectory = (opportunity) =>
    (opportunity.activityType || '').toLowerCase() === 'opportunity directory'

  const hasFinancialSupport = (opportunity) =>
    Boolean(opportunity.support) || /scholarship|bursar|grant|funding|financial support/.test(
      [opportunity.title, opportunity.description, opportunity.cost].filter(Boolean).join(' ').toLowerCase()
    )

  const closingSoonOpportunities = useMemo(() => ([...opportunities]
    .filter((opportunity) => opportunity.deadlineRaw)
    .filter((opportunity) => {
      const deadline = new Date(opportunity.deadlineRaw)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return !Number.isNaN(deadline.getTime()) && deadline >= today
    })
    .sort((a, b) => new Date(a.deadlineRaw) - new Date(b.deadlineRaw))), [opportunities])

  const getFilteredOpportunities = useCallback(() => {
    let results = [...opportunities]

    if (opportunitySearch.trim()) {
      const terms = opportunitySearch.toLowerCase().trim().split(/\s+/).filter(Boolean)
      results = results.filter((opportunity) => {
        const searchable = [opportunity.title, opportunity.organisation, opportunity.description, opportunity.category, opportunity.activityType, ...(opportunity.subjects || [])].filter(Boolean).join(' ').toLowerCase()
        return terms.every((term) => searchable.includes(term))
      })
    }

    if (activeCategory !== 'All') {
      const categoryMatches = {
        academic: ['academic', 'competition', 'olympiad', 'research', 'course', 'summer school', 'scholarship'],
        careers: ['careers', 'work experience', 'internship', 'insight day', 'workshop'],
        leadership: ['leadership', 'leadership programme'],
        volunteering: ['volunteering', 'volunteer'],
        sport: ['sport'],
        creative: ['creative', 'film', 'photography', 'art', 'writing', 'design'],
        international: ['international', 'abroad'],
      }
      const keywords = categoryMatches[activeCategory.toLowerCase()] || []

      results = results.filter((opportunity) => {
        const targetCategory = activeCategory.toLowerCase()
        // The importer assigns every new record a category. Treat that as the
        // source of truth so, for example, an academic outreach page that
        // mentions sport does not appear in the Sport tab merely because sport
        // is one of many subjects it references.
        if ((opportunity.category || '').trim().toLowerCase() === targetCategory) return true

        // Keep a narrow fallback for older/legacy records whose category was
        // absent or overly broad. Subjects and descriptions are intentionally
        // excluded here because those fields are too broad for a category tab.
        const searchable = [opportunity.activityType, opportunity.title, opportunity.organisation]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return keywords.some((keyword) => {
          const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
          return new RegExp(`(^|[^a-z])${escaped}([^a-z]|$)`, 'i').test(searchable)
        })
      })
    }

    if (ageFilter !== 'Any') {
      results = results.filter((opportunity) => {
        if (ageFilter === '13–15') {
          const age = opportunity.age || ''
          return (
            age.includes('13') || age.includes('14') || age.includes('15')
          )
        }

        if (ageFilter === '16–18') {
          const age = opportunity.age || ''
          return (
            age.includes('16') || age.includes('17') || age.includes('18')
          )
        }

        if (ageFilter === '18+') {
          return (opportunity.age || '').includes('18')
        }

        return true
      })
    }

    if (yearGroupFilter !== 'Any') {
      results = results.filter((opportunity) =>
        (opportunity.yearGroups || []).includes(yearGroupFilter)
      )
    }

    if (locationFilter !== 'Any') {
      results = results.filter((opportunity) => {
        const location = (opportunity.location || '').toLowerCase()
        if (locationFilter === 'UK') {
          return (
            location.includes('uk') ||
            location.includes('united kingdom') ||
            location.includes('england') ||
            location.includes('london') ||
            location.includes('oxford') ||
            location.includes('cambridge')
          )
        }

        if (locationFilter === 'Online' || locationFilter === 'Remote') {
          return (opportunity.format || '').toLowerCase().includes('online') || location.includes('remote')
        }

        return location.includes(locationFilter.toLowerCase())
      })
    }

    if (formatFilter !== 'Any') {
      results = results.filter((opportunity) => {
        const format = (opportunity.format || '').toLowerCase()
        if (formatFilter === 'Online') return format.includes('online') || format.includes('remote')
        if (formatFilter === 'In-person') return /in-person|in person|school-based|on campus/.test(format)
        if (formatFilter === 'Hybrid') return format.includes('hybrid') || (format.includes('online') && /in-person|in person/.test(format))
        return format.includes(formatFilter.toLowerCase())
      })
    }

    if (activityTypeFilter !== 'Any') {
      results = results.filter((opportunity) => {
        const activity = (opportunity.activityType || '').toLowerCase()
        if (activity === activityTypeFilter.toLowerCase()) return true
        if (activityTypeFilter === 'Sport') return activity.includes('sport')
        if (activityTypeFilter === 'Creative') return /creative|art|film|theatre|music|writing|design/.test(activity)
        if (activityTypeFilter === 'Work Experience') return activity.includes('work experience')
        if (activityTypeFilter === 'Internship') return activity.includes('intern')
        if (activityTypeFilter === 'Competition') return /competition|olympiad|essay/.test(activity)
        if (activityTypeFilter === 'Course / Programme') return /course|programme|outreach|event|workshop/.test(activity)
        return activity.includes(activityTypeFilter.toLowerCase())
      })
    }

    if (subjectFilter !== 'Any') {
      results = results.filter((opportunity) => {
        const opportunitySubjects = (opportunity.subjects || []).map((subject) => subject.toLowerCase())
        const selectedSubject = subjectFilter.toLowerCase()
        if (opportunitySubjects.some((item) => item === selectedSubject || item.includes(selectedSubject))) return true
        if (subjectFilter === 'Science') return opportunitySubjects.some((item) => /stem|physics|chemistry|biology|biochem|genetics|medicine|science/.test(item))
        if (subjectFilter === 'Mathematics') return opportunitySubjects.some((item) => /math|quantitative|statistics/.test(item))
        if (subjectFilter === 'Computer Science') return opportunitySubjects.some((item) => /computer|coding|technology|cyber/.test(item))
        return false
      })
    }

    if (costFilter === 'Free') {
      results = results.filter((opportunity) => (opportunity.cost || '').toLowerCase().includes('free'))
    }

    if (costFilter === 'Financial support') {
      results = results.filter(hasFinancialSupport)
    }

    if (sort === 'Deadline soonest') {
      results.sort((a, b) => {
        const aDeadline = a.deadlineRaw ? new Date(a.deadlineRaw).getTime() : Infinity
        const bDeadline = b.deadlineRaw ? new Date(b.deadlineRaw).getTime() : Infinity
        return aDeadline - bDeadline
      })
    }

    if (sort === 'Newest' || sort === 'Recently updated') {
      results.sort((a, b) => Number(b.id || 0) - Number(a.id || 0))
    }

    if (sort === 'Most relevant') {
      results.sort((a, b) => {
        const scoreDifference = selectedInterests.length > 0 ? getMatchScore(b) - getMatchScore(a) : 0
        if (scoreDifference !== 0) return scoreDifference
        return Number(isOpportunityDirectory(a)) - Number(isOpportunityDirectory(b))
      })
    }

    return results
  }, [opportunities, opportunitySearch, activeCategory, ageFilter, yearGroupFilter, locationFilter, formatFilter, costFilter, activityTypeFilter, subjectFilter, sort, selectedInterests, getMatchScore])

  const filteredOpportunities = useMemo(
    () => (page === 'Discover' ? getFilteredOpportunities() : []),
    [page, getFilteredOpportunities]
  )

  useEffect(() => { setDiscoverVisibleCount(60) }, [activeCategory, opportunitySearch, ageFilter, yearGroupFilter, locationFilter, formatFilter, costFilter, activityTypeFilter, subjectFilter, sort])

  const matchedOpportunities = useMemo(() => (page === 'Results' ? [...opportunities]
    .filter((opportunity) => {
    if (matchActivityTypes.length) {
      const activity = (opportunity.activityType || '').toLowerCase()
      const matchesActivity = matchActivityTypes.some((choice) => {
        const selectedActivity = choice.toLowerCase()
        if (activity === selectedActivity) return true
        if (choice === 'Sport') return activity.includes('sport')
        if (choice === 'Creative') return /creative|art|film|theatre|music|writing|design/.test(activity)
        if (choice === 'Work Experience') return activity.includes('work experience')
        if (choice === 'Internship') return activity.includes('intern')
        if (choice === 'Competition') return /competition|olympiad|essay/.test(activity)
        if (choice === 'Course / Programme') return /course|programme|outreach|event|workshop/.test(activity)
        return activity.includes(selectedActivity)
      })
      if (!matchesActivity) return false
    }

    if (matchSubjects.length) {
      const opportunitySubjects = (opportunity.subjects || []).map((subject) => subject.toLowerCase())
      const matchesSubject = matchSubjects.some((subject) => {
        const selectedSubject = subject.toLowerCase()
        if (opportunitySubjects.some((item) => item === selectedSubject || item.includes(selectedSubject))) return true
        if (subject === 'Science') return opportunitySubjects.some((item) => /stem|physics|chemistry|biology|biochem|genetics|medicine|science/.test(item))
        if (subject === 'Mathematics') return opportunitySubjects.some((item) => /math|quantitative|statistics/.test(item))
        if (subject === 'Computer Science') return opportunitySubjects.some((item) => /computer|coding|technology|cyber/.test(item))
        return false
      })
      if (!matchesSubject) return false
    }

    // A missing year group means the provider asks students to check eligibility;
    // do not hide a potentially suitable opportunity solely because a source did
    // not publish a standard school-year label.
    if (matchYearGroups.length && opportunity.yearGroups?.length && !matchYearGroups.some((year) => (opportunity.yearGroups || []).includes(year))) return false

      if (matchLocations.length) {
        const location = (opportunity.location || '').toLowerCase()
        const isUk = ['uk', 'united kingdom', 'england', 'london', 'oxford', 'cambridge']
          .some((place) => location.includes(place))
        const matchesLocation = matchLocations.some((locationChoice) =>
          locationChoice === 'UK'
            ? isUk
            : locationChoice === 'Online' || locationChoice === 'Remote'
              ? opportunity.format === 'Online' || location.includes('remote')
              : location.includes(locationChoice.toLowerCase())
        )

        if (!matchesLocation) return false
      }

    if (matchFormats.length) {
      const format = (opportunity.format || '').toLowerCase()
      const matchesFormat = matchFormats.some((choice) => {
        if (choice === 'Online') return format.includes('online') || format.includes('remote')
        if (choice === 'In-person') return /in-person|in person|school-based|on campus/.test(format)
        if (choice === 'Hybrid') return format.includes('hybrid') || (format.includes('online') && /in-person|in person/.test(format))
        return format.includes(choice.toLowerCase())
      })
      if (!matchesFormat) return false
    }

    if (matchCosts.length && !matchCosts.some((cost) => {
      if (cost === 'Free') return (opportunity.cost || '').toLowerCase().includes('free')
      if (cost === 'Financial support') {
        return Boolean(opportunity.support) || /scholarship|bursar|grant|funding|financial support/.test(
          [opportunity.title, opportunity.description, opportunity.cost].filter(Boolean).join(' ').toLowerCase()
        )
      }
      return true
    })) {
      return false
    }

      return true
    })
    .map((opportunity) => ({
      ...opportunity,
      matchScore: getMatchScore(opportunity),
    }))
    .sort((a, b) => b.matchScore - a.matchScore) : []), [page, opportunities, matchActivityTypes, matchSubjects, matchYearGroups, matchLocations, matchFormats, matchCosts, getMatchScore])

  const journeySuggestions = useMemo(() => (page === 'Track' ? opportunities
    .filter((opportunity) => !tracked.includes(opportunity.id))
    .map((opportunity) => {
      const opportunityTerms = [
        opportunity.category,
        opportunity.activityType,
        ...(opportunity.subjects || []),
        opportunity.title,
        opportunity.description,
      ].filter(Boolean).join(' ').toLowerCase()

      const linkedActivities = opportunities.filter((activity) => {
        if (!tracked.includes(activity.id)) return false
        const activityTerms = [
          activity.category,
          activity.activityType,
          ...(activity.subjects || []),
          activity.title,
          activity.description,
        ].filter(Boolean).join(' ').toLowerCase()
        const sharedSubjects = (activity.subjects || []).filter((subject) =>
          (opportunity.subjects || []).includes(subject)
        ).length
        return sharedSubjects > 0 || (
          activity.category && opportunity.category && activity.category === opportunity.category
        ) || activityTerms.split(/\W+/).some((term) => term.length > 5 && opportunityTerms.includes(term))
      })

      return { opportunity, linkedActivities, score: linkedActivities.length }
    })
    .filter((item) => item.score > 0)
    .sort((first, second) => second.score - first.score)
    .slice(0, 6) : []), [page, opportunities, tracked])

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

  return (
    <div className={`app theme-${theme}`}>
      <Navbar
        page={page}
        setPage={goTo}
        saved={saved}
        tracked={tracked}
        showMore={showMore}
        setShowMore={setShowMore}
        isPremium={isPremium}
        user={user}
        onAuth={() => openAuth()}
        onSignOut={() => supabase.auth.signOut()}
        theme={theme}
        onToggleTheme={() => setTheme((current) => { const next = current === 'light' ? 'dark' : 'light'; localStorage.setItem('growthgrind_theme', next); return next })}
      />

      {page === 'Home' && (
        <HomePage
          opportunities={opportunities}
          opportunitiesLoading={opportunitiesLoading}
          closingSoon={closingSoonOpportunities}
          savedCount={saved.length}
          trackedCount={tracked.length}
          isPremium={isPremium}
          onNavigate={goTo}
        />
      )}

      {/* MATCH SETUP */}
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
                className="ai-workspace"
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '8px',
                }}
              >
                {yearGroups.map((option) => {
                  const selected = isMatchOptionSelected(matchYearGroups, option)

                  return (
                    <button
                      key={option}
                      onClick={() => toggleMatchChoice(setMatchYearGroups, option)}
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
                  const selected = isMatchOptionSelected(matchActivityTypes, option)

                  return (
                    <button
                      key={option}
                      onClick={() => toggleMatchChoice(setMatchActivityTypes, option)}
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
                  const selected = isMatchOptionSelected(matchSubjects, option)

                  return (
                    <button
                      key={option}
                      onClick={() => toggleMatchChoice(setMatchSubjects, option)}
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
                    const selected = isMatchOptionSelected(matchLocations, option)

                    return (
                      <button
                        key={option}
                        onClick={() => toggleMatchChoice(setMatchLocations, option)}
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
                    const selected = isMatchOptionSelected(matchFormats, option)

                    return (
                      <button
                        key={option}
                        onClick={() => toggleMatchChoice(setMatchFormats, option)}
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
                  const selected = isMatchOptionSelected(matchCosts, option, 'All opportunities')

                  return (
                    <button
                      key={option}
                      onClick={() => toggleMatchChoice(setMatchCosts, option, 'All opportunities')}
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
            onClick={clearMatchFilters}
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

                <p style={{ marginTop: '14px', color: '#315b3d', fontWeight: '700' }}>
                  Build the experiences, curiosity and evidence that can strengthen your higher-education journey.
                </p>
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
                {!opportunitiesLoading && closingSoonOpportunities.length > 3 && (
                  <div className="closing-carousel-controls">
                    <button
                      type="button"
                      aria-label="Show earlier closing opportunities"
                      onClick={() => closingSoonScroller.current?.scrollBy({ left: -(closingSoonScroller.current.clientWidth * 0.86), behavior: 'smooth' })}
                    >
                      ←
                    </button>
                    <button
                      type="button"
                      aria-label="Show more closing opportunities"
                      onClick={() => closingSoonScroller.current?.scrollBy({ left: closingSoonScroller.current.clientWidth * 0.86, behavior: 'smooth' })}
                    >
                      →
                    </button>
                  </div>
                )}
              </div>

              <div className="closing-carousel" ref={closingSoonScroller}>
              <div className="closing-grid">
                {opportunitiesLoading ? [1, 2, 3].map((item) => (
                  <div className="catalogue-skeleton closing-card" key={item} aria-label="Loading closing opportunities" />
                )) : closingSoonOpportunities.map((opportunity) => (
                  <button
                    className="closing-card"
                    key={opportunity.id}
                    onClick={() => setSelectedOpportunity(opportunity)}
                  >
                    <div className="days-left">
                      {opportunity.days || 'Deadline not listed'}
                    </div>
                    <h3>{opportunity.title}</h3>
                    <p>{opportunity.organisation}</p>
                    <div className="deadline">
                      Deadline: {opportunity.deadline || 'Not listed'}
                    </div>
                  </button>
                ))}
              </div>
              </div>
            </section>

            <section className="opportunities-section">
              <div className="toolbar">
                <label className="opportunity-search"><span>⌕</span><input value={opportunitySearch} onChange={(event) => setOpportunitySearch(event.target.value)} placeholder="Search opportunities, providers or subjects" /></label>
                <div>
                  <strong>{opportunitiesLoading ? 'Updating' : filteredOpportunities.length}</strong>{' '}
                  {opportunitiesLoading ? 'opportunity catalogue…' : 'opportunities found'}
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

              {opportunitiesError ? (
                <div className="catalogue-retry-card" role="alert">
                  <span className="eyebrow">CATALOGUE TEMPORARILY UNAVAILABLE</span>
                  <h3>Your opportunities are still there.</h3>
                  <p>{opportunitiesError}</p>
                  <button className="view-button" onClick={() => setCatalogueRefresh((count) => count + 1)}>Try again →</button>
                </div>
              ) : opportunitiesLoading ? (
                <div className="opportunity-grid" aria-live="polite" aria-label="Loading opportunities">
                  {[1, 2, 3, 4, 5, 6].map((item) => <div className="catalogue-skeleton opportunity-card" key={item} />)}
                </div>
              ) : filteredOpportunities.length === 0 ? (
                <NoResultsCard
                  onChangeFilters={clearFilters}
                  onPremium={() =>
                    setPremiumModal('recommendations')
                  }
                />
              ) : (
                <>
                <div className="opportunity-grid">
                  {filteredOpportunities.slice(0, discoverVisibleCount).map((opportunity) => (
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
                {filteredOpportunities.length > discoverVisibleCount && <button className="view-button" style={{ display: 'block', margin: '28px auto 0' }} onClick={() => setDiscoverVisibleCount((count) => count + 60)}>Show 60 more opportunities</button>}
                </>
              )}
            </section>

            {!weeklySubscribed && (
              <section className="closing-section">
                <WeeklyPromotion
                  email={weeklyEmail}
                  setEmail={setWeeklyEmail}
                  onSubscribe={subscribeWeekly}
                  loading={weeklySignupLoading}
                  error={weeklySignupError}
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
                    saved.includes(opportunity.id)
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
                  loading={weeklySignupLoading}
                  error={weeklySignupError}
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
                <h3>Student Intelligence</h3>
                <p>Used across Premium to personalise course, admissions and test guidance.</p>
                <input value={studentIntelligence.subjects || ''} onChange={(e) => setStudentIntelligence((p) => ({ ...p, subjects: e.target.value }))} placeholder="Subjects, e.g. Maths, Economics, Physics" />
                <input value={studentIntelligence.predictedGrades || ''} onChange={(e) => setStudentIntelligence((p) => ({ ...p, predictedGrades: e.target.value }))} placeholder="Predicted grades, e.g. A* A* A" style={{ marginTop: '10px' }} />
                <input value={studentIntelligence.targetCourses || ''} onChange={(e) => setStudentIntelligence((p) => ({ ...p, targetCourses: e.target.value }))} placeholder="Target courses" style={{ marginTop: '10px' }} />
                <input value={studentIntelligence.targetUniversities || ''} onChange={(e) => setStudentIntelligence((p) => ({ ...p, targetUniversities: e.target.value }))} placeholder="Target universities" style={{ marginTop: '10px' }} />
                <p style={{ marginTop: '12px' }}><small>{user ? 'Saved securely to your account.' : 'Sign in to save this securely.'}</small></p>

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
                {isPremium && billingPortalAvailable && (
                  <button
                    className="filter-button"
                    onClick={openBillingPortal}
                    disabled={billingPortalLoading}
                    style={{ marginTop: '12px' }}
                  >
                    {billingPortalLoading ? 'Opening billing…' : 'Manage subscription →'}
                  </button>
                )}
                {billingPortalError && <p style={{ marginTop: '10px', color: '#9d3c2e', fontSize: '12px', fontWeight: '700' }}>{billingPortalError}</p>}
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
                          tracked.includes(opportunity.id)
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
                                  attemptTrack(opportunity)
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
                                value={
                                  trackedActivities[opportunity.id]
                                    ?.reflection || ''
                                }
                                onChange={(event) =>
                                  setTrackedActivities((current) => ({
                                    ...current,
                                    [opportunity.id]: {
                                      ...current[opportunity.id],
                                      reflection: event.target.value,
                                    },
                                  }))
                                }
                                onBlur={() => saveReflection(opportunity.id)}
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
                              <textarea value={trackedActivities[opportunity.id]?.evidence || ''} onChange={(event) => setTrackedActivities((current) => ({ ...current, [opportunity.id]: { ...current[opportunity.id], evidence: event.target.value } }))} onBlur={() => saveReflection(opportunity.id)} placeholder="What did you actually do? Add a specific task, project, result or example." style={{ width: '100%', minHeight: '68px', marginTop: '10px', padding: '11px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }} />
                              <textarea value={trackedActivities[opportunity.id]?.outcome || ''} onChange={(event) => setTrackedActivities((current) => ({ ...current, [opportunity.id]: { ...current[opportunity.id], outcome: event.target.value } }))} onBlur={() => saveReflection(opportunity.id)} placeholder="What happened next? Add an outcome, award, insight or next step." style={{ width: '100%', minHeight: '68px', marginTop: '10px', padding: '11px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }} />
                            </div>
                          </div>
                        ))}
                    </div>
                  )}
                </div>

                {tracked.length > 0 && (
                  <div style={{ marginTop: '50px' }}>
                    <div className="section-heading">
                      <div>
                        <span className="eyebrow">BUILD THE STORY</span>
                        <h2>What could this lead to?</h2>
                        <p style={{ maxWidth: '650px' }}>
                          Strong applications show a journey: an interest, the action you took, and how it led to your next step. These opportunities connect with what you have already tracked.
                        </p>
                      </div>
                    </div>

                    {journeySuggestions.length === 0 ? (
                      <div className="closing-card">
                        <h3>Keep exploring your next step.</h3>
                        <p>As you track more activities, GrowthGrind will surface related opportunities that help you build a more connected story.</p>
                      </div>
                    ) : (
                      <div className="opportunity-grid">
                        {journeySuggestions.map(({ opportunity, linkedActivities }) => (
                          <article className="opportunity-card" key={`journey-${opportunity.id}`}>
                            <span className="category-tag">POSSIBLE NEXT STEP</span>
                            <h3>{opportunity.title}</h3>
                            <div className="organisation">{opportunity.organisation}</div>
                            <p>
                              This could build on {linkedActivities.slice(0, 2).map((activity) => activity.title).join(' and ')}.
                            </p>
                            <div className="details">
                              <span>{opportunity.category}</span>
                              <span>{opportunity.format || 'Format not listed'}</span>
                              <span>{opportunity.deadline || 'Deadline not listed'}</span>
                            </div>
                            {!journeyExplanations[opportunity.id] ? <button className="view-button" disabled={journeyExplanationLoading === opportunity.id} onClick={() => explainJourneyConnection(opportunity, linkedActivities)}>
                              {journeyExplanationLoading === opportunity.id ? 'Explaining the connection…' : 'See why it connects →'}
                            </button> : <div className="journey-connection">
                              <div className="journey-map">
                                <div className="journey-map-node"><span>YOU TRACKED</span><strong>{linkedActivities[0]?.title}</strong></div>
                                <div className="journey-map-arrow">↓<small>builds towards</small></div>
                                <div className="journey-map-node next"><span>POSSIBLE NEXT STEP</span><strong>{opportunity.title}</strong></div>
                              </div>
                              <p><strong>Why this connects:</strong> {journeyExplanations[opportunity.id]}</p>
                              <button className="filter-button" onClick={() => setSelectedOpportunity(opportunity)}>View opportunity →</button>
                            </div>}
                          </article>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      )}

      {page === 'PremiumWorkspace' && activePremiumWorkspace && (
        <PremiumWorkspacePage
          feature={activePremiumWorkspace}
          statementAnswers={statementAnswers}
          setStatementAnswers={setStatementAnswers}
          statementCourse={statementCourse}
          setStatementCourse={setStatementCourse}
          statementFeedback={statementFeedback}
          statementFeedbackLoading={statementFeedbackLoading}
          statementFeedbackError={statementFeedbackError}
          onReviewStatement={reviewStatementAnswers}
          studyMistakeBank={studyMistakeBank}
          onReviewStudyMistake={reviewStudyMistake}
          onOpenInternational={() => { setActivePremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'international-quals')); goTo('PremiumWorkspace') }}
          onOpenCourseFinder={openGradeCourseFinder}
          onOpenMultiCourse={() => { setActivePremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'multi-course')); goTo('PremiumWorkspace') }}
          applicationChoices={premiumWorkspaceData.application_choices || []}
          courseShortlist={courseShortlist}
          setApplicationChoices={(choices) => setPremiumWorkspaceData((current) => ({ ...current, application_choices: choices }))}
          workspaceData={premiumWorkspaceData[activePremiumWorkspace.id] || {}}
          setWorkspaceData={(value) => setPremiumWorkspaceData((current) => ({ ...current, [activePremiumWorkspace.id]: value }))}
          onScheduleTest={(test) => setPremiumWorkspaceData((current) => { const timeline = current.timeline || {}; const items = Array.isArray(timeline.items) ? timeline.items : []; const date = test.registration_deadline || test.test_date; if (!date || items.some((item) => item.title === `${test.test_name} deadline`)) return current; return { ...current, timeline: { ...timeline, items: [...items, { id: `test-${test.id}`, title: `${test.test_name} deadline`, date, type: 'Admissions test', note: `Check official requirements and prepare: ${test.official_resource_url}`, complete: false }] } } })}
          onBack={() => goTo('Premium')}
          onOpenAi={() => {
            const specialist = activePremiumWorkspace.id.includes('statement') ? 'statement'
              : activePremiumWorkspace.id.includes('test') ? 'tests'
                : activePremiumWorkspace.id === 'study' ? 'study'
                : activePremiumWorkspace.id.includes('tariff') || activePremiumWorkspace.id.includes('international') ? 'courses'
                  : 'admissions'
            openAiWorkspace(specialist)
          }}
        />
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
                  First 30 students get Premium for a one-off £2.99.
                </h3>

                <p>
                  Join GrowthGrind early and lock in the founding-member
                  monthly price before the first 30 places are gone.
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

                <div style={{ display: 'grid', gap: '8px', marginTop: '15px' }}>
                  {[
                    ['founding', 'Founding Member — £2.99 one-off'],
                    ['monthly', 'Monthly — £8.99/month'],
                    ['annual', 'One Year — £89.99'],
                    ['twoYear', 'Two Years — £169.99'],
                  ].map(([plan, label]) => (
                    <button
                      key={plan}
                      className="filter-button"
                      disabled={Boolean(checkoutLoading) || isPremium}
                      onClick={() => startCheckout(plan)}
                    >
                      {checkoutLoading === plan ? 'Opening secure checkout…' : label}
                    </button>
                  ))}
                </div>

                {checkoutError && (
                  <p role="alert" style={{ color: '#9d3128', fontSize: '13px', lineHeight: 1.45, margin: '12px 0 0' }}>
                    {checkoutError}
                  </p>
                )}

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
                    without a payment while Stripe is being finalised.
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
                    <span className="eyebrow">EVERYTHING INCLUDED</span>
                    <h2>23 Premium features. One application system.</h2>
                    <p>Your dedicated Premium page is where you open and use each workspace.</p>
                  </div>
                  <button className="filter-button" onClick={() => goTo('Premium')}>
                    Explore Premium tools →
                  </button>
                </div>
                <div className="premium-summary-grid">
                  {premiumFeatureGroups.map((group) => (
                    <div className="closing-card" key={group.label} style={{ boxShadow: 'none' }}>
                      <div className="days-left">{group.label}</div>
                      <ul className="premium-summary-list">
                        {group.features.map((feature) => <li key={feature}>{feature}</li>)}
                      </ul>
                    </div>
                  ))}
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
                  loading={weeklySignupLoading}
                  error={weeklySignupError}
              />
            </section>
          )}
        </main>
      )}

      {page === 'Premium' && (
        <main>
          <section className="hero-section">
            <div className="hero-content">
              <span className="eyebrow">{isPremium ? 'YOUR PREMIUM WORKSPACE' : 'PREMIUM WORKSPACE'}</span>
              <h1>{isPremium ? 'Everything to build your application.' : 'Your university journey, unlocked.'}</h1>
              <p>
                {isPremium
                  ? 'Open your specialist tools, keep your plans together and build a stronger application step by step.'
                  : 'Explore every GrowthGrind Premium workspace. Upgrade to unlock the tools and your experience portfolio.'}
              </p>
              {!isPremium && (
                <button className="view-button" onClick={() => goTo('Pricing')}>
                  🔒 Unlock Premium →
                </button>
              )}
            </div>
          </section>

          <section className="opportunities-section" style={{ paddingTop: 0 }}>
            <div className="section-heading">
              <div>
                <span className="eyebrow">START HERE</span>
                <h2>Core Premium tools</h2>
              </div>
            </div>
            <div className="pricing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              <PremiumFeature number="01" title="AI Admissions Advisor" description="Personalised UK university and admissions guidance." isLocked={!isPremium} onClick={() => isPremium ? openAiWorkspace('admissions') : setPremiumModal('subscription')} />
              <PremiumFeature number="02" title="University & Course Finder" description="Find UK courses and universities that fit you." isLocked={!isPremium} onClick={() => isPremium ? goTo('CourseFinder') : setPremiumModal('subscription')} />
              <PremiumFeature number="03" title="Personal Statement Guidance" description="Develop stronger ideas and improve your own writing." isLocked={!isPremium} onClick={() => isPremium ? openAiWorkspace('statement') : setPremiumModal('subscription')} />
              <PremiumFeature number="04" title="Admissions Test Support" description="Plan relevant tests and get tailored preparation guidance." isLocked={!isPremium} onClick={() => isPremium ? openAiWorkspace('tests') : setPremiumModal('subscription')} />
              <PremiumFeature number="05" title="Career Quiz" description="Discover career and degree pathways suited to you." isLocked={!isPremium} onClick={() => isPremium ? openPremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'career-quiz')) : setPremiumModal('subscription')} />
              <PremiumFeature number="06" title="AI Research Project Builder" description="Turn an idea into a structured independent research project." isLocked={!isPremium} onClick={() => isPremium ? openAiWorkspace('research') : setPremiumModal('subscription')} />
              <PremiumFeature number="07" title="Super & Extra-Curricular Tracker" description="Turn activities into a connected, reflective experience portfolio." isLocked={!isPremium} onClick={() => isPremium ? goTo('Track') : setPremiumModal('tracker')} />
              <PremiumFeature number="08" title="GrowthGrind Study" description="Get tutoring help and build a personal mistake bank." isLocked={!isPremium} onClick={() => isPremium ? openPremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'study')) : setPremiumModal('subscription')} />
            </div>

            <div className="section-heading" style={{ marginTop: '55px' }}>
              <div>
                <span className="eyebrow">THE ADMISSIONS JOURNEY</span>
                <h2>Specialist Premium workspaces</h2>
                <p>From choices and grades to interviews, contextual support and results day.</p>
              </div>
            </div>
            <div className="pricing-features" style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
              {premiumRoadmap.map((feature, index) => (
                <PremiumFeature
                  key={feature.id}
                  number={String(index + 9).padStart(2, '0')}
                  title={feature.title}
                  description={feature.description}
                  isLocked={!isPremium}
                  onClick={() => isPremium ? openPremiumWorkspace(feature) : setPremiumModal('subscription')}
                />
              ))}
            </div>
          </section>
        </main>
      )}

      {/* PREMIUM FEATURE PAGES */}
      {(page === 'AI' || page === 'Specialist') && (
        <main>
          <section className={`hero-section${activeAiChat === 'study' ? ' study-ai-section' : ''}`} style={{ paddingTop: '36px' }}>
            <div className="hero-content" style={{ maxWidth: activeAiChat === 'study' ? 'none' : '1120px' }}>
              <span className="eyebrow">GROWTHGRIND AI</span>
              <h1 style={{ fontSize: 'clamp(34px, 5vw, 58px)' }}>{page === 'Specialist' ? aiSpecialists.find((item) => item.id === activeAiChat)?.name : 'Your student'}<br />{page === 'Specialist' ? 'workspace.' : 'thinking partner.'}</h1>
              <p>{page === 'Specialist' ? 'A dedicated workspace that remembers this conversation and stays focused on one task.' : 'Choose a specialist chat, ask follow-up questions, and build on the conversation as you go.'}</p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: page === 'Specialist' ? 'minmax(0, 1fr)' : 'minmax(210px, 0.72fr) minmax(0, 2fr)',
                  minHeight: '620px',
                  marginTop: '32px',
                  border: '1px solid #d0c4b0',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#f5efe5',
                }}
              >
                {page === 'AI' && <aside style={{ padding: '18px 12px', background: '#e9dfcf', borderRight: '1px solid #d0c4b0' }}>
                  <div className="eyebrow" style={{ padding: '0 8px 12px' }}>FEATURED CHATS</div>
                  {aiSpecialists.map((specialist) => {
                    const isActive = activeAiChat === specialist.id
                    const messageCount = (aiChats[specialist.id] || []).filter((message) => message.role === 'user').length
                    return (
                      <button
                        key={specialist.id}
                        onClick={() => { setActiveAiChat(specialist.id); setAiChatError('') }}
                        style={{
                          display: 'block', width: '100%', textAlign: 'left', padding: '12px', marginBottom: '7px',
                          border: isActive ? '1px solid #315b3d' : '1px solid transparent', borderRadius: '10px',
                          background: isActive ? '#f5efe5' : 'transparent', color: '#294b35', cursor: 'pointer', font: 'inherit',
                        }}
                      >
                        <strong style={{ display: 'block', fontSize: '13px' }}>{specialist.name}</strong>
                        <span style={{ display: 'block', marginTop: '3px', fontSize: '10px', color: '#777065' }}>
                          {messageCount ? `${messageCount} message${messageCount === 1 ? '' : 's'}` : specialist.description}
                        </span>
                      </button>
                    )
                  })}
                </aside>}

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #d0c4b0' }}>
                    <div className="days-left">SPECIALIST CHAT</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', gap: '16px', alignItems: 'end', flexWrap: 'wrap' }}>
                      <h3 style={{ margin: '8px 0 0' }}>{aiSpecialists.find((item) => item.id === activeAiChat)?.name}</h3>
                      <label style={{ display: 'grid', gap: '4px', minWidth: '230px', color: '#777065', fontSize: '10px', fontWeight: '700', letterSpacing: '0.08em' }}>
                        CURRENT GOAL
                        <select value={aiGoal} onChange={(event) => setAiGoal(event.target.value)} style={{ padding: '8px 10px', border: '1px solid #d0c4b0', borderRadius: '8px', color: '#294b35', background: '#fffaf2', font: 'inherit', letterSpacing: 0 }}>
                          <option>Explore my next best step</option>
                          <option>Find opportunities that build my application</option>
                          <option>Plan my university application</option>
                          <option>Develop my academic interests</option>
                          <option>Prepare for a course or admissions test</option>
                        </select>
                      </label>
                    </div>
                    <p style={{ margin: '10px 0 0', color: '#777065', fontSize: '12px' }}>Personalised using your match preferences and saved or tracked opportunities. Your private reflections are not sent automatically.</p>
                  </div>
                  <div style={{ flex: 1, padding: '24px', overflowY: 'auto', maxHeight: '440px' }}>
                    {(aiChats[activeAiChat] || []).length === 0 ? (
                      activeAiChat === 'statement' ? <div className="statement-ai-welcome">
                        <span className="days-left">PERSONAL STATEMENT PLANNING</span>
                        <h3>I can help you plan your personal statement before you start writing.</h3>
                        <p>Tell me the course you are considering and the experiences, books, projects or ideas you want to explore. We will turn rough thoughts into a clear direction — in your own voice.</p>
                        <div className="statement-ai-actions">
                          <button className="view-button" onClick={() => setAiChatInput('I am considering [course]. I have explored [experiences/ideas]. Help me identify the strongest themes for my personal statement plan.')}>Plan with GrowthGrind AI →</button>
                          <button className="filter-button" onClick={() => { setActivePremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'statement-builder')); goTo('PremiumWorkspace') }}>Start side-by-side builder →</button>
                        </div>
                        <p className="statement-ai-note">Plan first, then build: use the side-by-side builder to draft your three UCAS answers and receive feedback.</p>
                      </div> : activeAiChat === 'tests' ? <div className="statement-ai-welcome test-ai-welcome">
                        <span className="days-left">ADMISSIONS TEST PLANNING</span>
                        <h3>Let’s work out which admissions tests you may need before you start preparing.</h3>
                        <p>Tell me the courses and universities you are considering. I can help you identify what to check, map registration and preparation deadlines, and separate official requirements from things to research.</p>
                        <div className="statement-ai-actions">
                          <button className="view-button" onClick={() => setAiChatInput('I am considering [courses] at [universities]. Help me work out which admissions tests I should check, the official pages to verify, and a realistic preparation plan.')}>Plan my admissions tests →</button>
                          <button className="filter-button" onClick={() => { setActivePremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'test-planner')); goTo('PremiumWorkspace') }}>Build my test timeline →</button>
                          <button className="filter-button" onClick={() => { setActiveAiChat('study'); goTo('Specialist') }}>Open GrowthGrind Study →</button>
                        </div>
                        <p className="statement-ai-note">Plan first, practise second: once you know what matters, GrowthGrind Study can guide you through individual questions, working and mistakes.</p>
                      </div> : <div className="closing-card" style={{ boxShadow: 'none' }}>
                        <h3>Start the conversation</h3>
                        <p>Tell me what you are thinking about. You can keep asking questions here and I’ll use this conversation as context.</p>
                        <button
                          className="filter-button"
                          onClick={() => setAiChatInput(aiSpecialists.find((item) => item.id === activeAiChat)?.starter || '')}
                          style={{ marginTop: '8px' }}
                        >
                          Use a conversation starter →
                        </button>
                      </div>
                    ) : (
                      (aiChats[activeAiChat] || []).map((message, index) => (
                        <div key={`${message.role}-${index}`} style={{ display: 'flex', justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: '14px' }}>
                          <div style={{ maxWidth: '82%' }}>
                            <div style={{ whiteSpace: 'pre-wrap', padding: '13px 15px', borderRadius: '13px', lineHeight: 1.55, background: message.role === 'user' ? '#315b3d' : '#e9dfcf', color: message.role === 'user' ? '#fff' : '#294b35' }}>
                              <MathText text={message.content} />
                            </div>
                            {activeAiChat === 'study' && message.role === 'assistant' && <button className="save-mistake-button" onClick={() => {
                              const priorQuestion = (aiChats.study || []).slice(0, index).reverse().find((item) => item.role === 'user')?.content || 'Study question'
                              saveStudyMistake(priorQuestion, message.content)
                            }}>＋ Save to mistake bank</button>}
                          </div>
                        </div>
                      ))
                    )}
                    {aiChatLoading && <p style={{ color: '#777065', fontSize: '13px' }}>GrowthGrind AI is thinking…</p>}
                  </div>
                  <form onSubmit={sendAiChat} style={{ padding: '16px 20px', borderTop: '1px solid #d0c4b0', background: '#fffaf2' }}>
                    {aiChatError && <p style={{ margin: '0 0 8px', color: '#9d3c2e', fontWeight: '700', fontSize: '12px' }}>{aiChatError}</p>}
                    {aiAttachment && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px', marginBottom: '9px', padding: '8px 10px', borderRadius: '8px', background: '#e9dfcf', color: '#294b35', fontSize: '12px' }}>
                        <span>Attached: {aiAttachment.name}</span>
                        <button type="button" onClick={() => setAiAttachment(null)} style={{ border: 0, background: 'transparent', color: '#294b35', cursor: 'pointer', fontWeight: '700' }}>Remove ×</button>
                      </div>
                    )}
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                      <label title="Attach a PDF or image" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '44px', minWidth: '44px', border: '1px solid #d0c4b0', borderRadius: '9px', background: '#f5efe5', color: '#315b3d', cursor: 'pointer', fontSize: '20px' }}>
                        +
                        <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" onChange={chooseAiAttachment} style={{ display: 'none' }} />
                      </label>
                      <textarea
                        value={aiChatInput}
                        onChange={(event) => setAiChatInput(event.target.value)}
                        placeholder="Ask about an attachment or anything about this topic…"
                        rows="3"
                        style={{ flex: 1, minHeight: '82px', boxSizing: 'border-box', padding: '13px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }}
                      />
                      <button className="primary-button" type="submit" disabled={aiChatLoading} style={{ width: '96px', padding: '10px', alignSelf: 'stretch', opacity: aiChatLoading ? 0.65 : 1 }}>Send →</button>
                    </div>
                  </form>
                </div>
              </div>
            </div>
          </section>
        </main>
      )}

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
          <PremiumAiTool
            tool="admissions"
            variant="admissions-audit"
            title="Build your admissions strategy"
            description="Get a clear admissions audit: what is already working, what to develop and what to verify urgently."
            fields={[
              ['Subjects and predicted grades', 'For example: Maths, Economics, Physics — predicted A*AA'],
              ['Target courses and universities', 'For example: Economics at Warwick, UCL and LSE'],
              ['Academic evidence so far', 'Books, lectures, courses, competitions, research or projects you have explored'],
              ['Your biggest question or goal', 'For example: What should I improve before applying?'],
            ]}
            details={aiDetails.admissions || {}}
            result={aiResults.admissions}
            loading={aiLoading === 'admissions'}
            error={aiError.admissions}
            onChange={(field, value) => updateAiDetail('admissions', field, value)}
            onSubmit={(event) => runPremiumTool(event, 'admissions')}
          />
        </PremiumToolPage>
      )}

      {page === 'CourseFinder' && (
        <PremiumToolPage
          wide
          eyebrow="UNIVERSITY & COURSE FINDER"
          title={
            <>
              Find courses
              <br />
              that fit you.
            </>
          }
          description="Search real UK undergraduate courses, providers and official course pages in one place."
          isPremium={isPremium}
          onUpgrade={() => goTo('Pricing')}
        >
          <section className="course-search-shell">
            <div className="course-search-topline">
              <span>PUBLIC UK COURSE CATALOGUE</span>
              <a href="https://www.ucas.com/explore/search/courses" target="_blank" rel="noreferrer">Compare on UCAS ↗</a>
            </div>
            <form onSubmit={findCourses} className="course-search-form">
              <label className="course-search-input course-autocomplete"><span>⌕</span><input value={courseQuery} onChange={(event) => setCourseQuery(event.target.value)} placeholder="Search course name or subject" />{courseSuggestions.length > 0 && <div className="catalogue-options">{courseSuggestions.map((title) => <button key={title} type="button" onClick={() => { setSelectedCourseTitles((current) => current.includes(title) ? current : [...current, title]); setCourseQuery('') }}>{title}</button>)}</div>}</label>
              <select value={courseRegion} onChange={(event) => setCourseRegion(event.target.value)}><option>All UK</option><option>England</option><option>Scotland</option><option>Wales</option><option>Northern Ireland</option></select>
              <select value={courseMode} onChange={(event) => setCourseMode(event.target.value)}><option>All study modes</option><option value="Full time">Full time</option><option value="Part time">Part time</option></select>
              <button className="primary-button" disabled={courseLoading} type="submit">{courseLoading ? 'Searching…' : 'Search courses'}</button>
            </form>
            <div className="course-extra-filters">
              <label className="course-autocomplete">University <input value={courseProvider} onChange={(event) => setCourseProvider(event.target.value)} placeholder="Search every university" />{providerSuggestions.length > 0 && <div className="catalogue-options">{providerSuggestions.map((provider) => <button key={provider} type="button" onClick={() => { setSelectedProviders((current) => current.includes(provider) ? current : [...current, provider]); setCourseProvider('') }}>{provider}</button>)}</div>}</label>
              <label>Location <select value={courseAbroad} onChange={(event) => setCourseAbroad(event.target.value)}><option>UK only</option><option>Study abroad option</option></select></label>
              <button className="filter-button" type="button" onClick={findCourses}>Apply filters</button>
            </div>
            {(selectedCourseTitles.length > 0 || selectedProviders.length > 0) && <div className="course-selected-filters">{selectedCourseTitles.map((title) => <button key={title} onClick={() => setSelectedCourseTitles((current) => current.filter((item) => item !== title))}>{title} ×</button>)}{selectedProviders.map((provider) => <button key={provider} onClick={() => setSelectedProviders((current) => current.filter((item) => item !== provider))}>{provider} ×</button>)}</div>}
            {courseGradeProfile && <p className="course-grade-profile">{courseGradeProfile} <span>Use published requirements before deciding whether a course is safety, target or dream.</span></p>}
            <p className="course-search-note">Search the GrowthGrind catalogue, then open the university’s own course page for current modules, fees and entry requirements.</p>
          </section>

          {courseError && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{courseError}</p>}
          {courseSearched && !courseLoading && <section className="course-results-section">
            <div className="course-results-header"><strong>{courseResults.length ? `${courseResults.length}${courseResults.length === 60 ? '+' : ''} courses found` : 'No matching courses found'}</strong><span>Source: public HESA Discover Uni catalogue</span></div>
            <div className="course-data-notice"><strong>Requirements and historic grade data</strong><span>are shown on the current university and UCAS course pages. UCAS does not provide its course-level acceptance and matching-grade dataset for reuse in this public catalogue, so GrowthGrind will never invent those figures.</span><a href="https://www.ucas.com/applying/before-you-apply/what-and-where-to-study/entry-requirements/understanding-historical-entry" target="_blank" rel="noreferrer">How UCAS historical grades work ↗</a></div>
            <div className="course-planner-bar"><div><strong>Build a five-choice shortlist <em>{shortlistEntries.length}/5 selected</em></strong><span>{shortlistEntries.length ? `${shortlistCounts.Safety} safety · ${shortlistCounts.Target} target · ${shortlistCounts.Dream} dream` : 'Mark courses after checking their current published requirements.'}</span></div><button className="view-button" onClick={() => setCoursePlanning((current) => !current)}>{coursePlanning ? 'Hide shortlist' : 'Organise safety / target / dream →'}</button></div>
            {coursePlanning && <><p className="course-shortlist-guidance">A balanced list often includes a mix of realistic and ambitious choices. GrowthGrind’s labels are planning aids, not admission predictions — check each current official requirement.</p><div className="course-shortlist-grid">{['Safety', 'Target', 'Dream'].map((level) => <section key={level}><span>{level.toUpperCase()} · {shortlistCounts[level]}</span>{shortlistEntries.filter((item) => item.level === level).length ? shortlistEntries.filter((item) => item.level === level).map((item) => <div key={item.id}>{item.title}<small>{item.provider}</small><button type="button" onClick={() => setCourseShortlist((current) => Object.fromEntries(Object.entries(current).filter(([id]) => id !== item.id)))}>Remove</button></div>) : <p>No courses marked yet.</p>}</section>)}</div></>}
            {courseResults.map((course) => <CourseResultCard key={course.id} course={course} verified={courseIntelligence[`${course.provider_name}::${course.course_title}`]} profileGrades={courseProfileGrades} planning={coursePlanning} shortlist={courseShortlist} shortlistFull={shortlistEntries.length >= 5} onShortlist={addCourseToShortlist} onRemoveShortlist={(id) => setCourseShortlist((current) => Object.fromEntries(Object.entries(current).filter(([entryId]) => entryId !== id)))} />)}
            {!courseResults.length && <p>Try a broader course title, a subject such as “Economics”, or remove a filter.</p>}
          </section>}
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
          <PremiumAiTool
            tool="statement"
            variant="statement-plan"
            title="Reflect on your experiences"
            description="Build a clear planning direction before drafting. GrowthGrind helps you find your own evidence and ideas; it will not write a statement for you."
            fields={[
              ['Course interests', 'What you may want to study and why'],
              ['Experiences to reflect on', 'Activities, books, projects, work experience, volunteering or competitions'],
              ['What you learned', 'Optional — rough notes are completely fine'],
            ]}
            details={aiDetails.statement || {}}
            result={aiResults.statement}
            loading={aiLoading === 'statement'}
            error={aiError.statement}
            onChange={(field, value) => updateAiDetail('statement', field, value)}
            onSubmit={(event) => runPremiumTool(event, 'statement')}
            onOpenBuilder={() => { setActivePremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'statement-builder')); goTo('PremiumWorkspace') }}
          />
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
          <PremiumAiTool
            tool="tests"
            title="Explore admissions tests"
            description="We’ll help you identify what to check; always confirm the current policy on each official course page."
            fields={[
              ['Courses you are considering', 'For example: Economics, Medicine, Law or Computer Science'],
              ['Universities you are considering', 'Optional'],
              ['Subjects, grades and preparation so far', 'Include any test you already know about'],
            ]}
            details={aiDetails.tests || {}}
            result={aiResults.tests}
            loading={aiLoading === 'tests'}
            error={aiError.tests}
            onChange={(field, value) => updateAiDetail('tests', field, value)}
            onSubmit={(event) => runPremiumTool(event, 'tests')}
          />
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
          <CareerQuizWorkspace workspaceData={careerQuizData} setWorkspaceData={setCareerQuizData} />
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
          <PremiumAiTool
            tool="research"
            variant="research-plan"
            title="Develop your project idea"
            description="Turn a curiosity into a focused question, method, reading plan and realistic milestones—without inventing sources or writing the project for you."
            fields={[
              ['Your topic or curiosity', 'For example: I am interested in the economics of football'],
              ['Subjects or links to your interests', 'What makes this topic meaningful to you?'],
              ['Time and format', 'For example: four weeks, a presentation, an essay or a podcast'],
            ]}
            details={aiDetails.research || {}}
            result={aiResults.research}
            loading={aiLoading === 'research'}
            error={aiError.research}
            onChange={(field, value) => updateAiDetail('research', field, value)}
            onSubmit={(event) => runPremiumTool(event, 'research')}
          />
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
            onClick={() => {
              setActiveAiChat('general')
              goTo('AI')
            }}
          >
            GrowthGrind AI
          </button>

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

      {showPremiumWelcome && (
        <div className="premium-welcome" role="dialog" aria-modal="true">
          <div className="premium-confetti" aria-hidden="true">
            {Array.from({ length: 42 }, (_, index) => (
              <i key={index} style={{ left: `${(index * 19) % 100}%`, animationDelay: `${(index % 11) * 0.16}s` }} />
            ))}
          </div>
          <div className="premium-welcome-card">
            <span className="category-tag">GROWTHGRIND PREMIUM</span>
            <h2>Welcome to Premium! 🎉</h2>
            <p>Your personal admissions workspace is ready. Start with a specialist chat, build your experience story, and keep your next steps together.</p>
            <button className="primary-button" onClick={() => setShowPremiumWelcome(false)}>Let’s get started →</button>
          </div>
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
              disabled={!weeklyEmail.trim() || weeklySignupLoading}
              style={{
                opacity: weeklyEmail.trim() && !weeklySignupLoading ? 1 : 0.5,
              }}
            >
              {weeklySignupLoading ? 'Saving your sign-up…' : 'Get GrowthGrind Weekly →'}
            </button>
            {weeklySignupError && <p style={{ color: '#9d3c2e', fontWeight: '700', marginTop: '12px' }}>{weeklySignupError}</p>}

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

      {authModal && (
        <AuthModal
          mode={authMode}
          email={authEmail}
          password={authPassword}
          message={authMessage}
          onClose={() => setAuthModal(false)}
          onModeChange={setAuthMode}
          onEmailChange={setAuthEmail}
          onPasswordChange={setAuthPassword}
          onSubmit={submitAuth}
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
  user,
  onAuth,
  onSignOut,
  theme,
  onToggleTheme,
}) {
  return (
    <header className="navbar">
      <button className="brand brand-button" onClick={() => setPage('Home')} aria-label="GrowthGrind home">
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
      </button>

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
          {!isPremium && '🔒 '}Track

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
            page === 'Premium' || page === 'PremiumWorkspace'
              ? 'nav-link active'
              : 'nav-link'
          }
          onClick={() => setPage('Premium')}
        >
          {!isPremium && '🔒 '}Premium
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
        onClick={user ? onSignOut : onAuth}
      >
        {user ? 'Sign out' : 'Sign in'}
      </button>
      <button className="theme-toggle" onClick={onToggleTheme} aria-label="Toggle dark mode"><span className={theme === 'dark' ? 'toggle-knob dark' : 'toggle-knob'}>{theme === 'dark' ? '☾' : '☀'}</span></button>
    </header>
  )
}

function AuthModal({
  mode,
  email,
  password,
  message,
  onClose,
  onModeChange,
  onEmailChange,
  onPasswordChange,
  onSubmit,
}) {
  const isSignUp = mode === 'signup'

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <form className="modal" onSubmit={onSubmit} onClick={(event) => event.stopPropagation()}>
        <button type="button" className="close-modal" onClick={onClose}>×</button>
        <span className="category-tag">GROWTHGRIND ACCOUNT</span>
        <h2>{isSignUp ? 'Create your account' : 'Welcome back'}</h2>
        <p>
          {isSignUp
            ? 'Save opportunities and keep your portfolio on any device.'
            : 'Sign in to access your saved opportunities and portfolio.'}
        </p>
        <input
          type="email"
          required
          autoComplete="email"
          placeholder="Email address"
          value={email}
          onChange={(event) => onEmailChange(event.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', font: 'inherit', marginTop: '12px' }}
        />
        <input
          type="password"
          required
          minLength="6"
          autoComplete={isSignUp ? 'new-password' : 'current-password'}
          placeholder="Password (at least 6 characters)"
          value={password}
          onChange={(event) => onPasswordChange(event.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', font: 'inherit', marginTop: '10px' }}
        />
        {message && <p style={{ color: '#315b3d', fontWeight: '650' }}>{message}</p>}
        <button className="primary-button" type="submit">
          {isSignUp ? 'Create account →' : 'Sign in →'}
        </button>
        <button
          className="filter-button"
          type="button"
          onClick={() => onModeChange(isSignUp ? 'signin' : 'signup')}
          style={{ width: '100%', marginTop: '10px' }}
        >
          {isSignUp ? 'Already have an account? Sign in' : 'New here? Create an account'}
        </button>
      </form>
    </div>
  )
}

const aLevelScore = { 'A*': 6, A: 5, B: 4, C: 3, D: 2, E: 1 }

function suggestionFromVerifiedOffer(profileGrades, offer) {
  if (!Array.isArray(profileGrades) || profileGrades.length !== 3 || !offer) return null
  const required = String(offer).match(/A\*|[A-E]/g)
  if (!required || required.length !== 3 || required.some((grade) => !aLevelScore[grade])) return null
  const predictedScore = profileGrades.reduce((total, grade) => total + (aLevelScore[String(grade).toUpperCase()] || 0), 0)
  if (!predictedScore) return null
  const requiredScore = required.reduce((total, grade) => total + aLevelScore[grade], 0)
  const suggestion = predictedScore >= requiredScore + 2 ? 'Safety' : predictedScore >= requiredScore ? 'Target' : 'Dream'
  return {
    suggestion,
    reason: `Compared with the verified typical offer ${required.join('')}. This is a planning aid only: required subjects, contextual offers and selection factors still matter.`,
  }
}

function CourseResultCard({ course, verified, profileGrades, planning, shortlist, shortlistFull, onShortlist, onRemoveShortlist }) {
  const [requirements, setRequirements] = useState(null)
  const [loading, setLoading] = useState(false)
  const gradeSuggestion = requirements?.suggestion
    ? { suggestion: requirements.suggestion, reason: requirements.reason }
    : suggestionFromVerifiedOffer(profileGrades, verified?.a_level_offer)

  const loadRequirements = async () => {
    if (loading || requirements) return
    setLoading(true)
    try {
      if (verified?.a_level_offer || verified?.required_subjects || verified?.admissions_tests) {
        setRequirements({ text: verified.a_level_offer || 'See listed subject or test requirements', suggestion: '', reason: [verified.required_subjects, verified.admissions_tests, verified.contextual_offer].filter(Boolean).join(' · '), verified: true, checked: verified.last_checked_at })
        return
      }
      const response = await fetch('/api/course-requirements', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ url: course.course_url, title: course.course_title, provider: course.provider_name, grades: profileGrades }) })
      const rawResult = await response.text()
      let result = {}
      try { result = rawResult ? JSON.parse(rawResult) : {} } catch { /* A hosting error can be HTML/plain text rather than JSON. */ }
      if (!response.ok) throw new Error(result.error || 'We could not check this official course page right now. Please use the official link and try again later.')
      if (!result.text) throw new Error('No readable entry requirement was returned. Use the official course link to check directly.')
      setRequirements(result)
    } catch (error) {
      setRequirements({ error: error.message || 'Could not read the official course page.' })
    } finally {
      setLoading(false)
    }
  }


  return <article className="course-result-card">
    <div>
      <span className="course-result-kicker">{course.qualification || 'UNDERGRADUATE'} · {course.study_mode || 'Study mode not listed'}</span>
      <h3>{course.course_title}</h3><strong>{course.provider_name}</strong>
      <p>{[course.campus_name, course.country, course.duration].filter(Boolean).join(' · ') || 'Details on official course page'}</p>
      <small>Source: official course page{course.source_updated_at ? ` · catalogue checked ${new Date(course.source_updated_at).toLocaleDateString('en-GB')}` : ''}</small>
      {course.subjects_text && <div className="course-subject-tags">{course.subjects_text.split('|').slice(0, 4).map((subject) => <span key={subject}>{subject}</span>)}</div>}
      <div className="course-admissions-row"><span><b>Entry requirements</b> {requirements?.text || verified?.a_level_offer || 'Load from official course page'}</span><span><b>Historic acceptance / grade match</b> Check UCAS</span></div>
      {verified && <p className="course-verified-note">Verified source record · {verified.last_checked_at ? `checked ${new Date(verified.last_checked_at).toLocaleDateString('en-GB')}` : 'official course page linked'}{[verified.required_subjects, verified.admissions_tests].filter(Boolean).length ? ` · ${[verified.required_subjects, verified.admissions_tests].filter(Boolean).join(' · ')}` : ''}</p>}
      {!requirements && <button className="course-requirements-button" onClick={loadRequirements} disabled={loading}>{loading ? 'Checking live requirements…' : verified ? 'Show verification detail' : 'Show entry requirements'}</button>}
      {requirements?.error && <p className="course-requirements-error">{requirements.error} Use the official link to check directly.</p>}
      {planning && <div className="course-choice-actions">{gradeSuggestion && !shortlist[course.id] && <button className="use-suggested-choice" disabled={shortlistFull} onClick={() => onShortlist(course, gradeSuggestion.suggestion)}>Use suggested: {gradeSuggestion.suggestion} →</button>}{['Safety', 'Target', 'Dream'].map((level) => <button disabled={shortlistFull && !shortlist[course.id]} className={shortlist[course.id]?.level === level ? 'selected' : ''} key={level} onClick={() => onShortlist(course, level)}>{level}</button>)}{shortlist[course.id] && <button className="remove-choice" onClick={() => onRemoveShortlist(course.id)}>Remove</button>}</div>}
    </div>
    <div className="course-card-links"><div className="course-grade-panel"><span>GRADE-BASED SUGGESTION</span>{gradeSuggestion ? <><strong className={gradeSuggestion.suggestion.toLowerCase().replace(' ', '-')}>Suggested: {gradeSuggestion.suggestion}</strong><p>{gradeSuggestion.reason}</p></> : <p>{profileGrades.length === 3 ? 'This will appear when a comparable official entry offer is verified.' : 'Add three predicted A-level grades in the Tariff Calculator first.'}</p>}</div><a className="view-button" href={course.course_url} target="_blank" rel="noreferrer">Official requirements ↗</a><a className="filter-button" href={`https://www.ucas.com/explore/search/courses?query=${encodeURIComponent(`${course.course_title} ${course.provider_name}`)}`} target="_blank" rel="noreferrer">UCAS historic data ↗</a></div>
  </article>
}

function CourseField({ label, placeholder, value, onChange, required = false }) {
  return (
    <label style={{ display: 'block', marginTop: '18px' }}>
      <span style={{ display: 'block', marginBottom: '7px', color: '#315b3d', fontSize: '12px', fontWeight: '750' }}>
        {label}{required ? ' *' : ''}
      </span>
      <textarea
        required={required}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        style={{ width: '100%', minHeight: '52px', boxSizing: 'border-box', padding: '11px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }}
      />
    </label>
  )
}

function PremiumAiTool({
  variant,
  title,
  description,
  fields,
  details,
  result,
  loading,
  error,
  onChange,
  onSubmit,
  onOpenBuilder,
}) {
  return (
    <>
      {!result && (
        <form className="closing-card" onSubmit={onSubmit}>
          <h3>{title}</h3>
          <p>{description}</p>
          {fields.map(([label, placeholder]) => (
            <CourseField
              key={label}
              label={label}
              placeholder={placeholder}
              value={details[label] || ''}
              onChange={(value) => onChange(label, value)}
              required={label === fields[0][0]}
            />
          ))}
          {error && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{error}</p>}
          <button className="primary-button" type="submit" disabled={loading} style={{ opacity: loading ? 0.65 : 1 }}>
            {loading ? 'Building your guidance…' : 'Get my guidance →'}
          </button>
        </form>
      )}
      {result && (
        variant === 'admissions-audit' ? <div className="admissions-audit">
          <div className="closing-card">
            <div className="days-left">YOUR ADMISSIONS AUDIT</div>
            <h3>{title}</h3>
            <p>{result.summary}</p>
          </div>
          <div className="closing-grid" style={{ marginTop: '18px' }}>
            <div className="closing-card">
              <div className="days-left">ALREADY WORKING</div>
              <h3>Strengths to build on</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.strengths || []).map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <div className="closing-card">
              <div className="days-left">DEVELOP NEXT</div>
              <h3>Evidence to strengthen</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.develop || []).map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
            <div className="closing-card">
              <div className="days-left">CHECK URGENTLY</div>
              <h3>Official details to verify</h3>
              <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.urgentChecks || []).map((point) => <li key={point}>{point}</li>)}</ul>
            </div>
          </div>
          <div className="closing-card" style={{ marginTop: '18px', borderLeft: '5px solid #315b3d' }}>
            <div className="days-left">ONE NEXT ACTION</div>
            <h3>{result.nextAction || 'Choose one action to complete this week.'}</h3>
            {(result.questionsToConsider || []).length > 0 && <><h3 style={{ marginTop: '22px' }}>Questions to consider</h3><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{result.questionsToConsider.map((question) => <li key={question}>{question}</li>)}</ul></>}
          </div>
        </div> : variant === 'statement-plan' ? <div className="statement-plan-result">
          <div className="closing-card">
            <div className="days-left">YOUR PLANNING DIRECTION</div>
            <h3>{title}</h3>
            <p>{result.summary}</p>
          </div>
          <div className="closing-grid" style={{ marginTop: '18px' }}>
            <div className="closing-card"><div className="days-left">STRONGEST THEMES</div><h3>What your statement could show</h3><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.themes || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="closing-card"><div className="days-left">DEVELOP THE EVIDENCE</div><h3>What to explore further</h3><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.evidenceToDevelop || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
            <div className="closing-card"><div className="days-left">REFLECT, DON'T LIST</div><h3>Questions to answer in your own words</h3><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.reflectionPrompts || []).map((item) => <li key={item}>{item}</li>)}</ul></div>
          </div>
          <div className="closing-card" style={{ marginTop: '18px', borderLeft: '5px solid #315b3d' }}><div className="days-left">FIRST NEXT STEP</div><h3>{result.nextAction || 'Choose one experience and write down what it changed in your thinking.'}</h3><p>When you have your direction, use the Interactive Personal Statement Builder to draft the three UCAS responses side by side.</p>{onOpenBuilder && <button className="view-button" onClick={onOpenBuilder}>Open the Interactive Builder →</button>}</div>
        </div> : variant === 'research-plan' ? <div className="research-plan-result">
          <div className="closing-card"><div className="days-left">YOUR PROJECT BLUEPRINT</div><h3>{title}</h3><p>{result.summary}</p><div className="research-question"><span>FOCUSED RESEARCH QUESTION</span><strong>{result.researchQuestion || 'Refine your question with the scope below.'}</strong></div></div>
          <div className="closing-grid" style={{ marginTop: '18px' }}>
            {[["A MANAGEABLE SCOPE", "Scope", result.scope], ["A SIMPLE METHOD", "Method", result.method], ["WHAT TO READ", "Source plan", result.sourcePlan]].map(([eyebrow, heading, items]) => <div className="closing-card" key={heading}><div className="days-left">{eyebrow}</div><h3>{heading}</h3><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(items || []).map((item) => <li key={item}>{item}</li>)}</ul></div>)}
          </div>
          <div className="closing-card" style={{ marginTop: '18px', borderLeft: '5px solid #315b3d' }}><div className="days-left">MILESTONES & FIRST MOVE</div><ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>{(result.milestones || []).map((item) => <li key={item}>{item}</li>)}</ul><h3>{result.nextAction || 'Write down your first source-search terms and a realistic finishing date.'}</h3></div>
        </div> : <div>
          <div className="closing-card">
            <div className="days-left">PERSONALISED STARTING POINT</div>
            <h3>{title}</h3>
            <p>{result.summary}</p>
          </div>
          <div className="closing-grid" style={{ marginTop: '18px' }}>
            {(result.sections || []).map((section) => (
              <div className="closing-card" key={section.title}>
                <h3>{section.title}</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>
                  {(section.points || []).map((point) => <li key={point}>{point}</li>)}
                </ul>
              </div>
            ))}
          </div>
          <div className="closing-card" style={{ marginTop: '18px' }}>
            <h3>Next steps</h3>
            <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>
              {(result.nextSteps || []).map((step) => <li key={step}>{step}</li>)}
            </ul>
            {(result.questionsToConsider || []).length > 0 && (
              <>
                <h3 style={{ marginTop: '22px' }}>Questions to consider</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.65' }}>
                  {result.questionsToConsider.map((question) => <li key={question}>{question}</li>)}
                </ul>
              </>
            )}
          </div>
        </div>
      )}
    </>
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

function PremiumWorkspacePage({
  feature,
  statementAnswers,
  setStatementAnswers,
  statementCourse,
  setStatementCourse,
  statementFeedback,
  statementFeedbackLoading,
  statementFeedbackError,
  onReviewStatement,
  studyMistakeBank,
  onReviewStudyMistake,
  onOpenInternational,
  onOpenCourseFinder,
  onOpenMultiCourse,
  applicationChoices,
  courseShortlist,
  setApplicationChoices,
  workspaceData,
  setWorkspaceData,
  onBack,
  onOpenAi,
  onScheduleTest,
}) {
  const characterTotal = statementAnswers.reduce((total, answer) => total + answer.length, 0)
  const officialSources = {
    tariff: { label: 'UCAS Tariff calculator', url: 'https://www.ucas.com/undergraduate/applying-university/entry-requirements/calculate-your-ucas-tariff-points' },
    'statement-builder': { label: 'UCAS personal statement guidance', url: 'https://www.ucas.com/applying/applying-to-university/writing-your-personal-statement/the-new-personal-statement-for-2026-entry' },
    timeline: { label: 'UCAS dates and deadlines', url: 'https://www.ucas.com/applying/applying-to-university/dates-and-deadlines-for-uni-applications' },
    clearing: { label: 'UCAS course search', url: 'https://www.ucas.com/explore/search/courses-beta' },
    contextual: { label: 'UCAS entry requirements guidance', url: 'https://www.ucas.com/applying/you-apply/what-and-where-study/entry-requirements' },
  }
  const source = officialSources[feature.id] || { label: 'UCAS application guidance', url: 'https://www.ucas.com/applying/applying-to-university' }

  return (
    <main>
      <section className="hero-section">
        <div className="hero-content premium-tool-wide">
          <button className="filter-button" onClick={onBack}>← All Premium tools</button>
          <span className="eyebrow" style={{ display: 'block', marginTop: '24px' }}>{feature.stage}</span>
          <h1>{feature.title}</h1>
          <p>{feature.description}</p>

          <div className="premium-source-banner">
            <div>
              <span>VERIFIED STARTING POINT</span>
              <strong>Built-in planning, backed by the official source.</strong>
              <p>Use GrowthGrind to organise and reflect. Always confirm final requirements and dates with the provider.</p>
            </div>
            <a className="source-link" href={source.url} target="_blank" rel="noreferrer">Open {source.label} ↗</a>
          </div>

          {feature.id === 'statement-builder' ? (
            <div className="statement-workspace premium-studio">
            <div className="statement-editor-panel">
              <div className="days-left">2026 ENTRY FORMAT</div>
              <h2 style={{ marginTop: '12px' }}>Build your three answers</h2>
              <p>{characterTotal.toLocaleString()} / 4,000 characters used across all answers, including spaces.</p>
              <input
                value={statementCourse}
                onChange={(event) => setStatementCourse(event.target.value)}
                placeholder="Course you are applying for, e.g. Economics"
                style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit' }}
              />
              {[
                'Why do you want to study this course or subject?',
                'How have your qualifications and studies helped you prepare for this course or subject?',
                'What else have you done to prepare outside education, and why are these experiences useful?',
              ].map((prompt, index) => (
                <div key={prompt} style={{ marginTop: '22px' }}>
                  <label style={{ display: 'block', fontWeight: '750', color: '#294b35', marginBottom: '8px' }}>Question {index + 1}: {prompt}</label>
                  <textarea
                    value={statementAnswers[index]}
                    onChange={(event) => setStatementAnswers((answers) => answers.map((answer, answerIndex) => answerIndex === index ? event.target.value.slice(0, 4000) : answer))}
                    placeholder="Write in your own words. Start with specific evidence, then explain what it taught you."
                    style={{ width: '100%', minHeight: '150px', boxSizing: 'border-box', padding: '13px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }}
                  />
                  <span style={{ color: statementAnswers[index].length >= 350 ? '#315b3d' : '#9d3c2e', fontSize: '12px', fontWeight: '700' }}>
                    {statementAnswers[index].length} characters {statementAnswers[index].length >= 350 ? '✓' : '— minimum 350'}
                  </span>
                </div>
              ))}
              {statementFeedbackError && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{statementFeedbackError}</p>}
              <button className="view-button" disabled={statementFeedbackLoading} onClick={onReviewStatement}>
                {statementFeedbackLoading ? 'Reviewing your draft…' : 'Review draft side by side →'}
              </button>
              <button className="multi-course-link" onClick={onOpenMultiCourse}>Applying to more than one course? Try the Multi-course Statement Analyser →</button>
            </div>
            <aside className={`statement-feedback-panel ${statementFeedbackLoading ? 'statement-feedback-loading' : ''}`}>
              <div className="days-left">DRAFT FEEDBACK</div>
              {statementFeedbackLoading && <div className="statement-dot-loader" aria-label="GrowthGrind is reviewing your draft"><div className="statement-dot-field" /> <p>Mapping your ideas, evidence and academic connections…</p></div>}
              {!statementFeedback ? (
                <>
                  <h3 style={{ marginTop: '13px' }}>Feedback that keeps your voice</h3>
                  <p>Review grammar and expression, clarity, clichés, evidence, reflection, specificity, relevance, academic depth, repetition and course alignment.</p>
                  <p style={{ fontSize: '12px' }}>It does not write a statement for you or claim it can reliably identify AI writing.</p>
                </>
              ) : (
                <>
                  <p style={{ fontWeight: '700', color: '#294b35' }}>{statementFeedback.summary}</p>
                  <h4>What is working</h4>
                  <ul style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{(statementFeedback.strengths || []).map((item) => <li key={item}>{item}</li>)}</ul>
                  <h4>Specific improvements</h4>
                  {(statementFeedback.flags || []).map((flag, index) => (
                    <div key={`${flag.excerpt}-${index}`} style={{ marginTop: '12px', padding: '11px', borderRadius: '8px', background: '#f5efe5', borderLeft: `3px solid ${flag.priority === 'high' ? '#9d3c2e' : '#d6a343'}` }}>
                      <strong style={{ fontSize: '11px', color: '#294b35' }}>{flag.question ? `Question ${flag.question} · ` : ''}{flag.type} · {flag.priority || 'medium'} priority</strong>
                      {flag.excerpt && <p style={{ margin: '5px 0', fontStyle: 'italic', fontSize: '12px' }}>“{flag.excerpt}”</p>}
                      <p style={{ margin: 0, fontSize: '12px' }}>{flag.advice}</p>
                    </div>
                  ))}
                  {(statementFeedback.connections || []).length > 0 && <><h4>Connections to strengthen</h4><ul style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{statementFeedback.connections.map((item) => <li key={item}>{item}</li>)}</ul></>}
                  <h4>Next steps</h4>
                  <ol style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{(statementFeedback.nextSteps || []).map((item) => <li key={item}>{item}</li>)}</ol>
                </>
              )}
            </aside>
            </div>
          ) : feature.id === 'tariff' ? (
            <TariffWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenCourseFinder={onOpenCourseFinder} onOpenInternational={onOpenInternational} />
          ) : feature.id === 'international-quals' ? (
            <InternationalQualificationsWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'study' ? (
            <StudyWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenAi={onOpenAi} mistakeBank={studyMistakeBank} onReviewMistake={onReviewStudyMistake} />
          ) : feature.id === 'career-quiz' ? (
            <CareerQuizWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'contextual' ? (
            <ContextualEligibilityWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'circumstances' ? (
            <ContextualSupportWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'interview' ? (
            <InterviewPracticeWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'portfolio' ? (
            <PortfolioHubWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'multi-course' ? (
            <MultiCourseStatementWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'timeline' ? (
            <TimelineWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : feature.id === 'test-planner' ? (
            <AdmissionsTestPlannerWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} courseShortlist={courseShortlist} onScheduleTest={onScheduleTest} />
          ) : ['progress', 'balance', 'firm-insurance'].includes(feature.id) ? (
            <ApplicationChoicesWorkspace mode={feature.id} choices={applicationChoices} setChoices={setApplicationChoices} />
          ) : (
            <InSitePlanner feature={feature} workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenAi={onOpenAi} />
          )}
        </div>
      </section>
    </main>
  )
}

function AdmissionsTestPlannerWorkspace({ workspaceData, setWorkspaceData, courseShortlist, onScheduleTest }) {
  const [tests, setTests] = useState([])
  useEffect(() => { supabase.from('admissions_test_intelligence').select('*').order('test_name').then(({ data }) => setTests(data || [])) }, [])
  const selected = workspaceData.selectedTests || []
  const courseText = Object.values(courseShortlist || {}).map((item) => item.title).join(' ').toLowerCase()
  const suggestedNames = tests.filter((test) => (test.test_name === 'UCAT' && /medicine|dentistry/.test(courseText)) || (test.test_name === 'LNAT' && /law/.test(courseText)) || (test.test_name === 'TMUA' && /math|economics|computer science/.test(courseText)) || (test.test_name === 'ESAT' && /engineering|natural science|physics|chemistry/.test(courseText)) || (test.test_name === 'STEP' && /mathematics/.test(courseText))).map((test) => test.test_name)
  const toggle = (test) => { const adding = !selected.some((item) => item.id === test.id); setWorkspaceData({ ...workspaceData, selectedTests: adding ? [...selected, test] : selected.filter((item) => item.id !== test.id) }); if (adding) onScheduleTest?.(test) }
  return <div className="test-planner-studio premium-studio"><section><span className="days-left">OFFICIAL TEST INTELLIGENCE</span><h2>Plan every admissions test.</h2><p>{suggestedNames.length ? `Suggested from your shortlist: ${suggestedNames.join(', ')}.` : 'Select tests relevant to your courses.'} GrowthGrind keeps official resources, topics and dates together.</p><div className="test-intelligence-grid">{tests.map((test) => <article key={test.id}><strong>{test.test_name}{suggestedNames.includes(test.test_name) ? ' · Suggested' : ''}</strong><p>{test.course_area}</p><small>{test.university}</small><p>{test.registration_deadline && `Register by ${test.registration_deadline}`} {test.test_date && ` · Test from ${test.test_date}`}</p><div>{(test.topics || []).map((topic) => <span className="category-tag" key={topic}>{topic}</span>)}</div><a className="filter-button" href={test.official_resource_url} target="_blank" rel="noreferrer">Official preparation ↗</a><button className="view-button" onClick={() => toggle(test)}>{selected.some((item) => item.id === test.id) ? 'Added to plan ✓' : 'Add to test plan'}</button></article>)}</div></section><aside><span className="days-left">YOUR TEST PLAN</span><h3>{selected.length ? `${selected.length} test${selected.length === 1 ? '' : 's'} selected` : 'Select a test to begin'}</h3>{selected.map((test) => <p key={test.id}><strong>{test.test_name}</strong> · {test.course_area}</p>)}</aside></div>
}

function MultiCourseStatementWorkspace({ workspaceData, setWorkspaceData }) {
  const [feedback, setFeedback] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const answers = Array.isArray(workspaceData.answers) ? workspaceData.answers : ['', '', '']
  const courses = workspaceData.courses || ''
  const total = answers.reduce((sum, answer) => sum + answer.length, 0)
  const updateAnswer = (index, value) => setWorkspaceData({ ...workspaceData, answers: answers.map((answer, answerIndex) => answerIndex === index ? value.slice(0, 4000) : answer) })
  const review = async () => {
    if (answers.join('').trim().length < 40) { setError('Write a little more before asking for feedback.'); return }
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/statement-feedback', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ answers, course: courses, multiCourse: true }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'We could not review this right now.')
      setFeedback(result)
    } catch (requestError) { setError(requestError.message || 'We could not review this right now.') } finally { setLoading(false) }
  }
  const prompts = ['Why do you want to study these related courses or subjects?', 'How have your qualifications and studies helped you prepare for these courses?', 'What else have you done to prepare outside education, and how does it connect your choices?']
  return <div className="statement-workspace premium-studio multi-statement-workspace"><div className="statement-editor-panel"><div className="days-left">MULTI-COURSE UCAS FORMAT</div><h2 style={{ marginTop: '12px' }}>Build one coherent story</h2><p>{total.toLocaleString()} / 4,000 characters used across all answers, including spaces.</p><input value={courses} onChange={(event) => setWorkspaceData({ ...workspaceData, courses: event.target.value })} placeholder="Courses you are applying for, e.g. Economics; Economics & Politics" style={{ width: '100%', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit' }} />{prompts.map((prompt, index) => <div key={prompt} style={{ marginTop: '22px' }}><label style={{ display: 'block', fontWeight: '750', color: '#294b35', marginBottom: '8px' }}>Question {index + 1}: {prompt}</label><textarea value={answers[index] || ''} onChange={(event) => updateAnswer(index, event.target.value)} placeholder="Write in your own words. Show the academic connection between your choices." style={{ width: '100%', minHeight: '150px', boxSizing: 'border-box', padding: '13px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }} /><span style={{ color: (answers[index] || '').length >= 350 ? '#315b3d' : '#9d3c2e', fontSize: '12px', fontWeight: '700' }}>{(answers[index] || '').length} characters {(answers[index] || '').length >= 350 ? '✓' : '— minimum 350'}</span></div>)}{error && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{error}</p>}<button className="view-button" disabled={loading} onClick={review}>{loading ? 'Checking course fit…' : 'Review multi-course balance →'}</button></div><aside className="statement-feedback-panel"><div className="days-left">COURSE-BALANCE FEEDBACK</div>{!feedback ? <><h3 style={{ marginTop: '13px' }}>One statement, more than one direction</h3><p>GrowthGrind checks whether your academic interests form a clear bridge across each course, rather than feeling like separate applications.</p><p style={{ fontSize: '12px' }}>It checks current official guidance and course information when it helps, but never invents requirements or writes a statement for you.</p></> : <><p style={{ fontWeight: '700', color: '#294b35' }}>{feedback.summary}</p><h4>What is working</h4><ul style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{(feedback.strengths || []).map((item) => <li key={item}>{item}</li>)}</ul><h4>Specific improvements</h4>{(feedback.flags || []).map((flag, index) => <div key={`${flag.excerpt}-${index}`} style={{ marginTop: '12px', padding: '11px', borderRadius: '8px', background: '#f5efe5', borderLeft: `3px solid ${flag.priority === 'high' ? '#9d3c2e' : '#d6a343'}` }}><strong style={{ fontSize: '11px', color: '#294b35' }}>{flag.question ? `Question ${flag.question} · ` : ''}{flag.type} · {flag.priority || 'medium'} priority</strong>{flag.excerpt && <p style={{ margin: '5px 0', fontStyle: 'italic', fontSize: '12px' }}>“{flag.excerpt}”</p>}<p style={{ margin: 0, fontSize: '12px' }}>{flag.advice}</p></div>)}{(feedback.connections || []).length > 0 && <><h4>Connections to strengthen</h4><ul style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{feedback.connections.map((item) => <li key={item}>{item}</li>)}</ul></>}<h4>Next steps</h4><ol style={{ paddingLeft: '18px', lineHeight: 1.5 }}>{(feedback.nextSteps || []).map((item) => <li key={item}>{item}</li>)}</ol></>}</aside></div>
}

function TariffWorkspace({ workspaceData, setWorkspaceData, onOpenCourseFinder, onOpenInternational }) {
  const grades = ['A*', 'A', 'B', 'C', 'D', 'E']
  const points = { 'A level': { 'A*': 56, A: 48, B: 40, C: 32, D: 24, E: 16 }, EPQ: { 'A*': 28, A: 24, B: 20, C: 16, D: 12, E: 8 } }
  const rawEntries = workspaceData.grades || ['', '', '']
  const entries = rawEntries.map((entry) => typeof entry === 'string' ? { qualification: 'A level', grade: entry, subject: '' } : { subject: '', ...entry })
  const aLevelEntries = entries.filter((entry) => entry.qualification === 'A level')
  const standardAlevelPoints = aLevelEntries.slice(0, 3).reduce((sum, entry) => sum + (points['A level'][entry.grade] || 0), 0)
  const enteredTariff = entries.reduce((sum, entry) => sum + (points[entry.qualification]?.[entry.grade] || 0), 0)
  const namedAlevels = aLevelEntries.filter((entry) => entry.subject?.trim())
  const completeAlevels = aLevelEntries.filter((entry) => entry.grade)
  const updateEntry = (index, field, value) => setWorkspaceData({ ...workspaceData, grades: entries.map((entry, entryIndex) => entryIndex === index ? { ...entry, [field]: value } : entry) })
  const addEntry = (qualification) => setWorkspaceData({ ...workspaceData, grades: [...entries, { qualification, grade: '' }] })
  return (
    <div className="premium-studio tariff-studio">
      <section className="tariff-form-panel">
        <div className="days-left">A-LEVEL SCENARIO</div>
        <h2>Model your predicted grades</h2>
        <p>Add your predicted qualifications to see an indicative UCAS Tariff total and a subject-aware profile for your course search. Universities can set subject-specific requirements and do not have to use Tariff points.</p>
        <div className="tariff-entry-list">{entries.map((entry, index) => <div className="tariff-entry" key={index}><label><span>Qualification</span><select value={entry.qualification} onChange={(event) => updateEntry(index, 'qualification', event.target.value)}><option>A level</option><option>EPQ</option></select></label><label><span>{entry.qualification === 'EPQ' ? 'EPQ topic (optional)' : 'A-level subject'}</span><input value={entry.subject} onChange={(event) => updateEntry(index, 'subject', event.target.value)} placeholder={entry.qualification === 'EPQ' ? 'e.g. Prison economics' : 'e.g. Mathematics'} /></label><label><span>{entry.qualification} grade</span><select value={entry.grade} onChange={(event) => updateEntry(index, 'grade', event.target.value)}><option value="">Choose grade</option>{grades.map((item) => <option key={item}>{item}</option>)}</select></label>{entries.length > 3 && <button className="tariff-remove" onClick={() => setWorkspaceData({ ...workspaceData, grades: entries.filter((_, entryIndex) => entryIndex !== index) })}>Remove</button>}</div>)}</div>
        <div className="tariff-add-actions"><button className="filter-button" onClick={() => addEntry('A level')}>＋ Add A-level</button><button className="filter-button" onClick={() => addEntry('EPQ')}>＋ Add EPQ</button></div>
        {aLevelEntries.length > 3 && <p className="tariff-warning">You have added more than three A-levels. Many standard offers are based on three A-levels and may not count extra A-levels, so check each course’s published requirements.</p>}
        <div className="tariff-profile-check"><strong>Application profile check</strong><span>{completeAlevels.length < 3 ? `Add ${3 - completeAlevels.length} more predicted A-level grade${3 - completeAlevels.length === 1 ? '' : 's'} to compare a standard three-grade profile.` : namedAlevels.length < Math.min(3, completeAlevels.length) ? 'Add your A-level subject names too — courses can require specific subjects, not just grades.' : `Ready to search with ${completeAlevels.slice(0, 3).map((entry) => `${entry.subject || 'Subject'} ${entry.grade}`).join(', ')}.`}</span></div>
      </section>
      <aside className="tariff-result-panel">
        <span>YOUR INDICATIVE TOTAL</span>
        <strong>{enteredTariff}</strong><em>UCAS Tariff points from all entered qualifications</em>
        <p className="tariff-standard-total">First three A-levels: <strong>{standardAlevelPoints} points</strong></p>
        <div className="tariff-divider" />
        <h3>Before you shortlist a course</h3>
        <ul><li>Check whether the university uses Tariff points.</li><li>Check required subjects and individual grades.</li><li>Record contextual and admissions-test requirements.</li></ul>
        <button className="view-button" onClick={() => onOpenCourseFinder(entries)}>Find matching courses →</button>
        <button className="tariff-international-button" onClick={onOpenInternational}>Applying with international qualifications? →</button>
        <a className="tariff-other-qualifications" href="https://www.ucas.com/undergraduate/applying-university/entry-requirements/calculate-your-ucas-tariff-points" target="_blank" rel="noreferrer">Using BTEC, IB, Scottish or another qualification? Check the official UCAS calculator ↗</a>
      </aside>
    </div>
  )
}

function InternationalQualificationsWorkspace({ workspaceData, setWorkspaceData }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const countries = {
    'International Baccalaureate': 'Use the International Baccalaureate Diploma name and your actual Higher Level subjects/grades. Universities often state an overall Diploma score and may set individual Higher Level requirements.',
    'India — CBSE': 'Search each university’s international entry-requirements page for CBSE guidance. Requirements are usually stated as an overall percentage and may specify a higher mark in a relevant subject.',
    'India — CISCE/ISC': 'Search each university’s international entry-requirements page for ISC guidance. Check whether the course expects specific subjects as well as an overall percentage.',
    'United States': 'Check the university’s US qualifications guidance for the exact combination it accepts, which may include a high-school diploma alongside AP, SAT/ACT, dual-enrolment or other study.',
    'China': 'Search the course provider’s China/international qualifications page. Confirm the accepted school-leaving qualification, any subject requirements and English-language evidence.',
    'Pakistan': 'Check the university’s Pakistan guidance for your exact qualification, such as HSSC or A-levels. Competitive courses may require higher results in relevant subjects.',
    'Nigeria': 'Check the provider’s Nigeria guidance for your exact qualification. Confirm subject requirements and whether separate English-language evidence is required.',
    'France': 'Look for Baccalauréat requirements on the university’s international page, including any expected subject specialisms or overall result.',
    'Germany': 'Check for Abitur guidance and the subject combination required for the course. Individual universities set their own comparison and English-language requirements.',
    'Canada': 'Check the province-specific qualification guidance on the university page and confirm required Grade 12 subjects, not only the overall average.',
    'Other country': 'Use the exact qualification name shown on your certificate or predicted-grade document. Search the university’s country/qualification page and ask its admissions team if the qualification is not listed.',
  }
  const country = workspaceData.country || 'International Baccalaureate'
  const searched = workspaceData.searchedInternational
  const askFollowUp = async (event) => {
    event.preventDefault()
    const text = question.trim()
    if (!text || loading) return
    const userMessage = { role: 'user', content: text }
    setQuestion('')
    setLoading(true)
    setError('')
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialist: 'international', message: `The student is applying with ${country} qualifications. ${text}`, messages }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not search right now.')
      setMessages((current) => [...current, userMessage, { role: 'assistant', content: result.reply }])
    } catch (requestError) {
      setError(requestError.message || 'Could not search right now.')
      setQuestion(text)
    } finally {
      setLoading(false)
    }
  }
  return <div className="international-quals-studio"><section><span className="days-left">INTERNATIONAL QUALIFICATIONS</span><h2>Understand your qualification in a UK application.</h2><p>Which country are your current or completed qualifications from?</p><div className="international-search"><select value={country} onChange={(event) => { setWorkspaceData({ ...workspaceData, country: event.target.value, searchedInternational: false }); setMessages([]) }}>{Object.keys(countries).map((item) => <option key={item}>{item}</option>)}</select><button className="view-button" onClick={() => setWorkspaceData({ ...workspaceData, searchedInternational: true })}>Search guidance →</button></div></section>{searched && <section className="international-result"><span>GUIDANCE FOR {country.toUpperCase()}</span><h3>How to compare your grades</h3><p>{countries[country]}</p><ul><li>There is no single UK-wide “competitive grade” conversion: each university and course decides its own entry requirements.</li><li>Use the original qualification and grades on your application, not a self-created A-level conversion.</li><li>Check the exact course page, required subjects and English-language requirement before applying.</li></ul><div className="international-links"><a href="https://www.ucas.com/international/international-students/applying-university-international-student/entry-requirements-uk-courses" target="_blank" rel="noreferrer">UCAS international entry requirements ↗</a><a href="https://www.ucas.com/sites/default/files/international_qips_18-11-2024_0.pdf" target="_blank" rel="noreferrer">UCAS qualification profiles ↗</a></div><div className="international-followups"><div><span>LIVE OFFICIAL-SOURCE SEARCH</span><h4>Ask a follow-up question</h4><p>The assistant searches current UCAS, university and qualification-body pages before replying.</p></div>{messages.map((message, index) => <div className={`international-message ${message.role}`} key={`${message.role}-${index}`}><b>{message.role === 'user' ? 'You' : 'GrowthGrind guide'}</b><p>{message.content}</p></div>)}{error && <p className="international-chat-error">{error}</p>}<form onSubmit={askFollowUp}><textarea value={question} onChange={(event) => setQuestion(event.target.value)} placeholder={`For example: Which UK universities accept ${country} for Computer Science?`} /><button className="view-button" disabled={loading}>{loading ? 'Checking official sources…' : 'Ask with live search →'}</button></form></div></section>}</div>
}

function ContextualEligibilityWorkspace({ workspaceData, setWorkspaceData }) {
  const [policy, setPolicy] = useState('')
  const [policyLoading, setPolicyLoading] = useState(false)
  const [policyError, setPolicyError] = useState('')
  const questions = [
    { id: 'stateSchool', text: 'Do you attend or have you attended a UK state school or college?' },
    { id: 'fsm', text: 'Have you been eligible for Free School Meals during secondary education?' },
    { id: 'care', text: 'Have you spent time in local-authority care or are you care-experienced?' },
    { id: 'carer', text: 'Do you have unpaid caring responsibilities?' },
    { id: 'estranged', text: 'Are you estranged from your parents or independent of family support?' },
    { id: 'firstGen', text: 'Would you be the first in your family to enter higher education?' },
    { id: 'outreach', text: 'Have you completed a university outreach or widening-participation programme?' },
    { id: 'area', text: 'Do you think you live in an area of low higher-education participation or high deprivation?' },
  ]
  const answers = workspaceData.answers || {}
  const current = Math.min(workspaceData.currentQuestion || 0, questions.length - 1)
  const question = questions[current]
  const answered = Object.prototype.hasOwnProperty.call(answers, question.id)
  const score = Object.values(answers).reduce((total, value) => total + (value === 'yes' ? 1 : value === 'sometimes' ? .5 : 0), 0)
  const cleanIndicator = (text) => text.replace(/^Do you |^Have you |^Are you |^Would you |^I /, '').replace(/\?$/, '')
  const indicatorsToCheck = questions.filter((item) => answers[item.id] === 'yes').map((item) => cleanIndicator(item.text))
  const indicatorsToClarify = questions.filter((item) => answers[item.id] === 'sometimes').map((item) => cleanIndicator(item.text))
  const complete = workspaceData.complete
  const setAnswer = (value) => setWorkspaceData({ ...workspaceData, answers: { ...answers, [question.id]: value }, complete: false })
  const next = () => { if (!answered) return; setWorkspaceData({ ...workspaceData, answers, currentQuestion: current >= questions.length - 1 ? current : current + 1, complete: current >= questions.length - 1 }) }
  const searchPolicy = async () => {
    const university = (workspaceData.university || '').trim()
    if (!university) { setPolicyError('Search for a university first.'); return }
    setPolicyLoading(true); setPolicyError('')
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialist: 'contextual-research', message: `Find the current official contextual admissions guidance for ${university}.` }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not find the policy.')
      setPolicy(result.reply)
    } catch (error) { setPolicyError(error.message || 'Could not find the policy.') } finally { setPolicyLoading(false) }
  }
  return <div className="contextual-eligibility"><header><span className="days-left">CONTEXTUAL OFFER CHECKER</span><h2>See what may be worth checking.</h2><p>This is not an eligibility decision. Universities use different criteria and can assess information automatically from a UCAS application.</p><div className="quiz-progress"><i style={{ width: `${Math.round((Object.keys(answers).length / questions.length) * 100)}%` }} /></div><div className="quiz-progress-copy"><span>{Math.round((Object.keys(answers).length / questions.length) * 100)}% complete</span><span>Question {current + 1} of {questions.length}</span></div></header><section className="contextual-question"><span className="career-question-number">{current + 1}</span><h3>{question.text}</h3>{question.id === 'area' && <a className="tundra-link" href="https://www.officeforstudents.org.uk/data-and-analysis/young-participation-by-area/search-by-postcode/" target="_blank" rel="noreferrer">Check your postcode with the official TUNDRA / POLAR4 lookup ↗</a>}<div className="career-answer-buttons">{[['yes', 'Yes'], ['sometimes', 'Not sure'], ['no', 'No']].map(([value, label]) => <button key={value} className={`career-answer ${answers[question.id] === value ? 'selected' : ''}`} onClick={() => setAnswer(value)}>{label}</button>)}</div><div className="career-navigation"><button className="filter-button" disabled={current === 0} onClick={() => setWorkspaceData({ ...workspaceData, answers, currentQuestion: current - 1, complete: false })}>← Back</button><button className="view-button" disabled={!answered} onClick={next}>{current === questions.length - 1 ? 'See my next steps →' : 'Next question →'}</button></div></section>{complete && <section className="contextual-result"><div><span className="days-left">YOUR INDICATIVE RESULT</span><h3>{score >= 2 ? 'You have indicators worth checking.' : 'It is still worth checking each policy.'}</h3><p>{score >= 2 ? 'Your answers include factors that many universities may consider, but no result here confirms eligibility.' : 'Some universities use criteria that this short checker cannot assess, including postcode and school data.'}</p>{indicatorsToCheck.length > 0 && <div className="contextual-indicator-list"><strong>Based on your answers, check whether the policy considers:</strong><ul>{indicatorsToCheck.map((item) => <li key={item}>{item}</li>)}</ul></div>}{indicatorsToClarify.length > 0 && <div className="contextual-indicator-list unsure"><strong>Worth clarifying with a school adviser or the university:</strong><ul>{indicatorsToClarify.map((item) => <li key={item}>{item}</li>)}</ul></div>}<ul><li>Answer contextual questions in UCAS accurately and completely.</li><li>Check each course and university’s policy before relying on a contextual offer.</li><li>Ask a teacher or adviser for help if you are unsure how to share circumstances.</li></ul><button className="filter-button" onClick={() => setWorkspaceData({})}>Start again</button></div><div className="contextual-policy-search"><label>Search a university’s current policy<input value={workspaceData.university || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, university: event.target.value })} placeholder="e.g. University of Bristol" /></label><button className="view-button" disabled={policyLoading} onClick={searchPolicy}>{policyLoading ? 'Searching official guidance…' : 'Find official guidance →'}</button><a href={`https://www.google.com/search?q=${encodeURIComponent(`${workspaceData.university || 'UK university'} contextual admissions official`)}`} target="_blank" rel="noreferrer">Open a direct official-policy search ↗</a>{policy && <p>{policy}</p>}{policyError && <p className="contextual-error">{policyError}</p>}</div></section>}</div>
}

function ContextualSupportWorkspace({ workspaceData, setWorkspaceData }) {
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const details = workspaceData.details || ''
  const review = async () => {
    if (details.trim().length < 25) { setError('Add a little factual detail before requesting feedback.'); return }
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialist: 'contextual', message: details }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not review this right now.')
      setFeedback(result.reply)
    } catch (requestError) { setError(requestError.message || 'Could not review this right now.') } finally { setLoading(false) }
  }
  return <div className="contextual-studio"><section className="contextual-editor"><span className="days-left">FACTS, NOT EXCUSES</span><h2>Describe your context in your own words.</h2><p>Include what happened, when it affected your education, and what evidence a school or professional could confirm. Avoid uploading medical evidence or unnecessary sensitive details here.</p><textarea value={details} onChange={(event) => setWorkspaceData({ ...workspaceData, details: event.target.value })} placeholder="For example: In Year 12, I had caring responsibilities for a family member for several months. This affected my attendance and meant I missed…" /><button className="view-button" disabled={loading} onClick={review}>{loading ? 'Reviewing your wording…' : 'Get side-by-side guidance →'}</button>{error && <p className="contextual-error">{error}</p>}</section><aside className="contextual-feedback"><span className="days-left">FORMALITY & IMPACT CHECK</span>{feedback ? <><h3>How to make this clearer</h3><p>{feedback}</p></> : <><h3>What GrowthGrind will check</h3><ul><li>Factual timeline and specific educational impact.</li><li>Clear, professional language without overstating a claim.</li><li>Evidence to discuss with a referee or support team.</li><li>Whether to check the university’s own contextual-offer policy.</li></ul><p className="contextual-note">This does not decide eligibility or replace a school reference, medical professional, or university admissions team.</p></>}</aside></div>
}

function InterviewPracticeWorkspace({ workspaceData, setWorkspaceData }) {
  const [question, setQuestion] = useState(workspaceData.currentQuestion || '')
  const [answer, setAnswer] = useState('')
  const [feedback, setFeedback] = useState('')
  const [loading, setLoading] = useState(false)
  const [listening, setListening] = useState(false)
  const [error, setError] = useState('')
  const course = workspaceData.course || ''
  const university = workspaceData.university || ''
  const tone = workspaceData.tone || 'Friendly'
  const voice = workspaceData.voice || ''
  const parseInterviewReply = (reply, hasAnswer) => {
    const questionMatch = reply.match(/(?:^|\n)QUESTION:\s*([\s\S]*)/i)
    const feedbackMatch = reply.match(/(?:^|\n)FEEDBACK:\s*([\s\S]*?)(?=\nQUESTION:|$)/i)
    return {
      question: (questionMatch?.[1] || (hasAnswer ? '' : reply)).trim(),
      feedback: (feedbackMatch?.[1] || (hasAnswer ? reply : '')).trim(),
    }
  }
  const speak = (text) => {
    if (!window.speechSynthesis) return
    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text.replace(/https?:\/\/\S+/g, ''))
    const voices = window.speechSynthesis.getVoices()
    const selected = voices.find((item) => item.name === voice)
    if (selected) utterance.voice = selected
    utterance.rate = tone === 'Stern' ? 0.96 : tone === 'Friendly' ? 1.03 : 1
    window.speechSynthesis.speak(utterance)
  }
  const askAi = async (message, savingAnswer = '') => {
    setLoading(true); setError('')
    try {
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialist: 'interview', message }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not continue the interview.')
      const parsed = parseInterviewReply(result.reply, Boolean(savingAnswer))
      if (!parsed.question) throw new Error('The interviewer did not return a next question. Please try again.')
      setFeedback(savingAnswer ? parsed.feedback : '')
      setQuestion(parsed.question)
      setWorkspaceData({ ...workspaceData, currentQuestion: parsed.question, savedFeedback: savingAnswer ? [...(workspaceData.savedFeedback || []), { id: Date.now(), question, answer: savingAnswer, feedback: parsed.feedback }] : (workspaceData.savedFeedback || []) })
      speak(parsed.question)
    } catch (requestError) { setError(requestError.message || 'Could not continue the interview.') } finally { setLoading(false) }
  }
  const start = () => {
    if (!course.trim() || !university.trim()) { setError('Add both a course and university before starting.'); return }
    askAi(`Research the current official interview/course guidance for ${course} at ${university}, then start a ${tone.toLowerCase()} mock interview. Return exactly one line in this format: QUESTION: [one realistic open question]. Do not include research notes, feedback, links or anything else.`)
  }
  const submitAnswer = () => {
    if (!answer.trim() || !question) return
    const spokenAnswer = answer
    setAnswer('')
    askAi(`Continue this ${tone.toLowerCase()} mock interview for ${course} at ${university}. Use live official guidance if you need to verify an interview-specific detail. Previous question: ${question}\nStudent answer: ${spokenAnswer}\nReturn exactly two labels: FEEDBACK: [two or three specific sentences] then QUESTION: [one next realistic open question].`, spokenAnswer)
  }
  const startListening = () => {
    const Recognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!Recognition) { setError('Voice input is not supported in this browser. You can type your answer instead.'); return }
    const recognition = new Recognition(); recognition.lang = 'en-GB'; recognition.interimResults = true; recognition.continuous = false
    recognition.onstart = () => setListening(true)
    recognition.onresult = (event) => setAnswer(Array.from(event.results).map((item) => item[0].transcript).join(' '))
    recognition.onerror = () => { setListening(false); setError('Microphone input was unavailable. You can type your answer instead.') }
    recognition.onend = () => setListening(false)
    recognition.start()
  }
  const savedFeedback = workspaceData.savedFeedback || []
  return <div className="interview-studio"><section className="interview-setup"><span className="days-left">LIVE MOCK INTERVIEW</span><h2>Set your interview context.</h2><div className="interview-fields"><input value={course} onChange={(event) => setWorkspaceData({ ...workspaceData, course: event.target.value })} placeholder="Course, e.g. Medicine" /><input value={university} onChange={(event) => setWorkspaceData({ ...workspaceData, university: event.target.value })} placeholder="University, e.g. Bristol" /><label>Tone<select value={tone} onChange={(event) => setWorkspaceData({ ...workspaceData, tone: event.target.value })}><option>Friendly</option><option>Serious</option><option>Stern</option></select></label><label>AI voice<select value={voice} onChange={(event) => setWorkspaceData({ ...workspaceData, voice: event.target.value })}><option value="">Default device voice</option>{typeof window !== 'undefined' && window.speechSynthesis?.getVoices().filter((item) => item.lang.startsWith('en')).slice(0, 12).map((item) => <option value={item.name} key={item.name}>{item.name}</option>)}</select></label></div><button className="view-button" onClick={start} disabled={loading}>{loading ? 'Checking official guidance…' : question ? 'Start a new interview' : 'Start mock interview →'}</button><p className="interview-disclaimer">GrowthGrind checks official university guidance where it is available, then creates original practice questions. Voice input uses your browser’s microphone permission; you can always type instead.</p></section><section className="interview-stage"><span className="days-left">INTERVIEW ROOM</span>{question ? <><div className="interviewer-question"><b>Interviewer</b><p>{question}</p></div><textarea value={answer} onChange={(event) => setAnswer(event.target.value)} placeholder="Answer by voice or type here…" /><div className="interview-actions"><button className="filter-button" onClick={startListening} disabled={listening}>{listening ? 'Listening…' : '🎙 Answer by voice'}</button><button className="view-button" onClick={submitAnswer} disabled={loading || !answer.trim()}>{loading ? 'Reviewing…' : 'Submit answer →'}</button></div>{feedback && <div className="interview-feedback"><b>Instant feedback</b><p>{feedback}</p></div>}</> : <p className="interview-empty">Choose your course, university, tone and voice, then begin. The interviewer will ask one question at a time.</p>}{error && <p className="contextual-error">{error}</p>}</section><aside className="interview-saves"><span className="days-left">SAVED FEEDBACK</span><h3>{savedFeedback.length ? `${savedFeedback.length} response${savedFeedback.length === 1 ? '' : 's'} to review` : 'Review your practice'}</h3>{savedFeedback.length ? savedFeedback.slice(-5).reverse().map((item) => <details key={item.id}><summary>{item.question}</summary><p><b>Your answer:</b> {item.answer}</p><p><b>Feedback:</b> {item.feedback}</p></details>) : <p>Completed answers and feedback are saved to your signed-in GrowthGrind account.</p>}</aside></div>
}

function PortfolioHubWorkspace({ workspaceData, setWorkspaceData }) {
  const [messages, setMessages] = useState(() => workspaceData.messages || [{ role: 'assistant', content: 'Welcome to your Creative Portfolio Hub. I can help you choose work, research requirements, plan your presentation and build a realistic submission timeline. What course, university and creative medium are you preparing for?' }])
  const [input, setInput] = useState('')
  const [projectTitle, setProjectTitle] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const send = async (event) => {
    event.preventDefault()
    const text = input.trim()
    if (!text || loading) return
    const userMessage = { role: 'user', content: text }
    setInput(''); setLoading(true); setError('')
    try {
      const context = [workspaceData.course, workspaceData.university, workspaceData.medium].filter(Boolean).join(' · ')
      const response = await fetch('/api/ai-chat', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ specialist: 'portfolio', message: `${context ? `Portfolio context: ${context}. ` : ''}${text}`, messages }) })
      const result = await readApiJson(response)
      if (!response.ok) throw new Error(result.error || 'Could not continue the portfolio plan.')
      setMessages((current) => {
        const next = [...current, userMessage, { role: 'assistant', content: result.reply }]
        setWorkspaceData({ ...workspaceData, messages: next })
        return next
      })
    } catch (requestError) { setError(requestError.message || 'Could not continue the portfolio plan.'); setInput(text) } finally { setLoading(false) }
  }
  const projects = workspaceData.projects || []
  const addProject = () => { if (!projectTitle.trim()) return; setWorkspaceData({ ...workspaceData, projects: [...projects, { id: `${Date.now()}`, title: projectTitle.trim(), caption: '', stage: 'Developing' }] }); setProjectTitle('') }
  return <div className="portfolio-studio"><section className="portfolio-brief"><span className="days-left">CREATIVE PORTFOLIO HUB</span><h2>Plan the work you want to show.</h2><p>Set a context so the guide can help you organise work, captions, presentation and practical next steps.</p><div className="portfolio-fields"><input value={workspaceData.course || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, course: event.target.value })} placeholder="Course, e.g. Architecture" /><input value={workspaceData.university || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, university: event.target.value })} placeholder="University, optional" /><select value={workspaceData.medium || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, medium: event.target.value })}><option value="">Choose creative medium</option><option>Fine art / drawing</option><option>Design</option><option>Architecture</option><option>Photography</option><option>Film / animation</option><option>Fashion / textiles</option><option>Music / performance</option><option>Other</option></select></div><div className="portfolio-checklist"><span>Select and sequence work</span><span>Document your process</span><span>Write concise captions</span><span>Check submission format</span></div><div className="portfolio-projects"><strong>Project board</strong><div><input value={projectTitle} onChange={(event) => setProjectTitle(event.target.value)} placeholder="Add a portfolio piece" /><button className="filter-button" onClick={addProject}>Add</button></div>{projects.map((project) => <article key={project.id}><input value={project.title} onChange={(event) => setWorkspaceData({ ...workspaceData, projects: projects.map((item) => item.id === project.id ? { ...item, title: event.target.value } : item) })} /><select value={project.stage} onChange={(event) => setWorkspaceData({ ...workspaceData, projects: projects.map((item) => item.id === project.id ? { ...item, stage: event.target.value } : item) })}><option>Developing</option><option>Ready to select</option><option>Final piece</option></select><textarea value={project.caption} onChange={(event) => setWorkspaceData({ ...workspaceData, projects: projects.map((item) => item.id === project.id ? { ...item, caption: event.target.value } : item) })} placeholder="Caption: idea, process and what you learned" /><button onClick={() => setWorkspaceData({ ...workspaceData, projects: projects.filter((item) => item.id !== project.id) })}>Remove</button></article>)}</div></section><section className="portfolio-chat"><span className="days-left">YOUR PORTFOLIO GUIDE</span><div className="portfolio-messages">{messages.map((message, index) => <div className={`portfolio-message ${message.role}`} key={`${message.role}-${index}`}><b>{message.role === 'assistant' ? 'GrowthGrind portfolio guide' : 'You'}</b><p>{message.content}</p></div>)}{loading && <div className="portfolio-message assistant"><b>GrowthGrind portfolio guide</b><p>Thinking through your next step…</p></div>}</div><form onSubmit={send}><textarea value={input} onChange={(event) => setInput(event.target.value)} placeholder="Tell the guide what you have so far, or what you are unsure about…" /><button className="view-button" disabled={loading}>{loading ? 'Thinking…' : 'Send →'}</button></form>{error && <p className="contextual-error">{error}</p>}</section></div>
}

function StudyWorkspace({ workspaceData, setWorkspaceData, onOpenAi, mistakeBank = [], onReviewMistake }) {
  const mistake = workspaceData.mistake || ''
  const now = new Date().toISOString()
  const dueMistakes = mistakeBank.filter((entry) => !entry.nextReview || entry.nextReview <= now)
  return (
    <div className="premium-studio study-studio">
      <section className="study-action-panel">
        <div className="days-left">AI EXAM TUTOR</div>
        <h2>Practise with a method, not another blank chat.</h2>
        <p>Upload a question, your working, a screenshot or a PDF. Choose how much help you want and get clear mathematical notation, fractions and roots.</p>
        <div className="study-modes"><span>Hint only</span><span>Guide me</span><span>Exam solution</span><span>Find my error</span></div>
        <button className="view-button" onClick={onOpenAi}>Start a guided question →</button>
      </section>
      <section className="mistake-bank-panel">
        <div className="days-left">MISTAKE BANK</div>
        <h3>Save an error to revisit</h3>
        <textarea value={mistake} onChange={(event) => setWorkspaceData({ ...workspaceData, mistake: event.target.value })} placeholder="Example: A-level Maths — integration — I forgot to adjust the limits after substitution. What will I do differently?" style={{ width: '100%', minHeight: '140px', boxSizing: 'border-box', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit' }} />
        <p style={{ fontSize: '12px' }}>Saved on this device. Use the button beneath any GrowthGrind Study reply to add a question and its guidance here.</p>
        {mistakeBank.length > 0 && <div className="saved-mistakes"><strong>{dueMistakes.length ? `${dueMistakes.length} review now` : 'You are up to date'} · {mistakeBank.length} saved question{mistakeBank.length === 1 ? '' : 's'}</strong>{(dueMistakes.length ? dueMistakes : mistakeBank).slice(0, 3).map((entry) => <div key={entry.id}><span>{entry.question}</span><small>{entry.subject || 'Uncategorised'} · {entry.topic || 'Review and tag later'} · {entry.reviews ? `Reviewed ${entry.reviews} time${entry.reviews === 1 ? '' : 's'}` : 'First review'}</small>{onReviewMistake && <button className="filter-button" onClick={() => onReviewMistake(entry.id)}>I reviewed this →</button>}</div>)}</div>}
      </section>
    </div>
  )
}

function TimelineWorkspace({ workspaceData, setWorkspaceData }) {
  const [title, setTitle] = useState('')
  const [date, setDate] = useState('')
  const [type, setType] = useState('UCAS')
  const [note, setNote] = useState('')
  const items = Array.isArray(workspaceData.items) ? workspaceData.items : []
  const sortedItems = [...items].sort((first, second) => (first.date || '9999-12-31').localeCompare(second.date || '9999-12-31'))
  const today = new Date().toISOString().slice(0, 10)
  const addItem = (event) => {
    event.preventDefault()
    if (!title.trim() || !date) return
    setWorkspaceData({ ...workspaceData, items: [...items, { id: `${Date.now()}-${Math.random()}`, title: title.trim(), date, type, note: note.trim(), complete: false }] })
    setTitle(''); setDate(''); setNote('')
  }
  const toggleItem = (id) => setWorkspaceData({ ...workspaceData, items: items.map((item) => item.id === id ? { ...item, complete: !item.complete } : item) })
  const removeItem = (id) => setWorkspaceData({ ...workspaceData, items: items.filter((item) => item.id !== id) })
  const upcoming = sortedItems.filter((item) => !item.complete && item.date >= today)
  const overdue = sortedItems.filter((item) => !item.complete && item.date < today)
  return <div className="timeline-workspace premium-studio"><section className="timeline-form"><span className="days-left">YOUR DEADLINE TIMELINE</span><h2>Put every important date in one place.</h2><p>Add dates you know now. GrowthGrind keeps the plan in your account, but official providers remain the source of truth for changing deadlines.</p><form onSubmit={addItem}><input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="e.g. UCAS application complete" /><div className="timeline-input-row"><input type="date" value={date} onChange={(event) => setDate(event.target.value)} required /><select value={type} onChange={(event) => setType(event.target.value)}><option>UCAS</option><option>Admissions test</option><option>Open day</option><option>Portfolio</option><option>Student finance</option><option>Scholarship</option><option>Personal deadline</option></select></div><textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Optional: what needs doing before this date?" /><button className="view-button" type="submit">Add to timeline →</button></form></section><section className="timeline-list"><div className="days-left">UPCOMING ACTIONS</div><h3>{upcoming.length ? `${upcoming.length} date${upcoming.length === 1 ? '' : 's'} to manage` : 'Your timeline is clear.'}</h3>{overdue.length > 0 && <div className="timeline-overdue"><strong>{overdue.length} overdue item{overdue.length === 1 ? '' : 's'}</strong>{overdue.map((item) => <span key={item.id}>{item.title} · {item.date}</span>)}</div>}<div className="timeline-items">{sortedItems.length ? sortedItems.map((item) => <article className={item.complete ? 'complete' : item.date < today ? 'late' : ''} key={item.id}><button aria-label={`Mark ${item.title} complete`} onClick={() => toggleItem(item.id)}>{item.complete ? '✓' : ''}</button><div><span>{item.type.toUpperCase()} · {item.date}</span><strong>{item.title}</strong>{item.note && <p>{item.note}</p>}</div><button className="timeline-delete" onClick={() => removeItem(item.id)}>Remove</button></article>) : <p className="timeline-empty">Start with the next deadline you already know.</p>}</div></section></div>
}

function ApplicationChoicesWorkspace({ mode, choices, setChoices }) {
  const [university, setUniversity] = useState('')
  const [course, setCourse] = useState('')
  const [condition, setCondition] = useState('')
  const addChoice = (event) => {
    event.preventDefault()
    if (!university.trim() || !course.trim()) return
    setChoices([...choices, { id: `${Date.now()}-${Math.random()}`, university: university.trim(), course: course.trim(), condition: condition.trim(), status: 'Researching', role: '' }])
    setUniversity(''); setCourse(''); setCondition('')
  }
  const update = (id, patch) => setChoices(choices.map((choice) => choice.id === id ? { ...choice, ...patch } : choice))
  const remove = (id) => setChoices(choices.filter((choice) => choice.id !== id))
  const firm = choices.find((choice) => choice.role === 'Firm')
  const insurance = choices.find((choice) => choice.role === 'Insurance')
  const sameConditions = firm && insurance && firm.condition && insurance.condition && firm.condition.trim().toLowerCase() === insurance.condition.trim().toLowerCase()
  const title = mode === 'progress' ? 'Track every application choice.' : mode === 'balance' ? 'Check the balance of your choices.' : 'Choose a sensible Firm and Insurance.'
  return <div className="application-choices premium-studio"><section><span className="days-left">YOUR APPLICATION CHOICES</span><h2>{title}</h2><p>Add up to five choices with the published condition you need to verify. This is a planning tool, not an admissions prediction.</p><form onSubmit={addChoice}><input value={university} onChange={(event) => setUniversity(event.target.value)} placeholder="University" /><input value={course} onChange={(event) => setCourse(event.target.value)} placeholder="Course" /><input value={condition} onChange={(event) => setCondition(event.target.value)} placeholder="Published condition, e.g. AAA" /><button className="view-button" disabled={choices.length >= 5}>Add choice →</button></form></section><section className="application-choice-list"><div className="days-left">{choices.length}/5 SAVED</div>{choices.length ? choices.map((choice) => <article key={choice.id}><div><strong>{choice.university} — {choice.course}</strong><span>{choice.condition || 'Add the published condition after checking the official page.'}</span></div><select value={choice.status} onChange={(event) => update(choice.id, { status: event.target.value })}><option>Researching</option><option>Applied</option><option>Interview</option><option>Offer received</option><option>Unsuccessful</option></select>{mode === 'firm-insurance' && <select value={choice.role} onChange={(event) => update(choice.id, { role: event.target.value })}><option value="">No role</option><option>Firm</option><option>Insurance</option></select>}<button onClick={() => remove(choice.id)}>Remove</button></article>) : <p>Add your first choice to begin.</p>}{mode === 'balance' && choices.length > 0 && <div className="choice-insight"><strong>Balance check</strong><p>{choices.length < 5 ? `You have ${5 - choices.length} choice${5 - choices.length === 1 ? '' : 's'} left to research.` : 'You have a full five-choice list. Verify every grade and subject requirement before submitting.'}</p></div>}{mode === 'firm-insurance' && <div className="choice-insight"><strong>Firm / Insurance check</strong><p>{!firm || !insurance ? 'Choose one Firm and one Insurance after offers arrive.' : sameConditions ? 'Your Firm and Insurance currently show the same condition. Check whether your Insurance gives you a realistic alternative.' : 'Your choices have different recorded conditions. Compare required subjects and course fit before deciding.'}</p></div>}</section></div>
}

function CareerQuizWorkspace({ workspaceData, setWorkspaceData }) {
  const questions = [
    { id: 'patterns', text: 'I enjoy using numbers, data or patterns to solve problems.', sectors: ['Finance', 'Technology'] },
    { id: 'people', text: 'I enjoy explaining ideas and working closely with other people.', sectors: ['Healthcare', 'Education'] },
    { id: 'build', text: 'I would enjoy building, testing or improving a product or system.', sectors: ['Technology', 'Engineering'] },
    { id: 'ideas', text: 'I like writing, visual ideas, storytelling or creating content.', sectors: ['Creative & Media', 'Marketing'] },
    { id: 'research', text: 'I enjoy science experiments, research or finding out why something works.', sectors: ['Science', 'Healthcare'] },
    { id: 'rules', text: 'I enjoy arguing a case, analysing rules or persuading others.', sectors: ['Law', 'Business'] },
    { id: 'markets', text: 'I am interested in markets, companies and investment.', sectors: ['Finance', 'Business'] },
    { id: 'systems', text: 'I would rather work through a difficult problem than avoid it.', sectors: ['Engineering', 'Technology'] },
    { id: 'health', text: 'I am curious about health, biology or helping people directly.', sectors: ['Healthcare', 'Science'] },
    { id: 'policy', text: 'I care about public issues, policy, fairness or global events.', sectors: ['Public Policy', 'Law'] },
    { id: 'commercial-creative', text: 'I want work that combines creativity with commercial thinking.', sectors: ['Marketing', 'Creative & Media'] },
    { id: 'leadership', text: 'I enjoy taking responsibility for decisions that affect a group.', sectors: ['Business', 'Public Policy'] },
    { id: 'detail', text: 'I notice small details and like making something accurate or dependable.', sectors: ['Engineering', 'Finance'] },
    { id: 'care', text: 'I would find it meaningful to make a direct difference to someone’s wellbeing.', sectors: ['Healthcare', 'Education'] },
  ]
  const rawAnswers = workspaceData.answers || {}
  const answers = Array.isArray(rawAnswers)
    ? rawAnswers.reduce((result, answer, index) => (answer === undefined ? result : { ...result, [questions[index]?.id]: answer }), {})
    : rawAnswers
  const scores = questions.reduce((result, question) => {
    const weight = answers[question.id] === true ? 1 : answers[question.id] === 'sometimes' ? 0.5 : 0
    if (!weight) return result
    question.sectors.forEach((sector) => { result[sector] = (result[sector] || 0) + weight })
    return result
  }, {})
  const jobs = {
    Finance: ['Investment banking', 'Asset management', 'Hedge-fund analysis', 'Corporate finance'],
    Technology: ['Software engineering', 'Data science', 'Cyber security', 'Product management'],
    Business: ['Consulting', 'Entrepreneurship', 'Operations', 'Strategy'],
    Engineering: ['Civil engineering', 'Mechanical engineering', 'Aerospace engineering', 'Renewable energy'],
    Healthcare: ['Medicine', 'Nursing', 'Physiotherapy', 'Clinical research'],
    Science: ['Research scientist', 'Pharmaceutical science', 'Environmental science', 'Laboratory analytics'],
    Law: ['Solicitor', 'Barrister', 'Commercial law', 'Policy advisory'],
    'Creative & Media': ['Film production', 'Design', 'Journalism', 'Animation'],
    Marketing: ['Brand management', 'Digital marketing', 'Market research', 'Communications'],
    'Public Policy': ['Civil service', 'International development', 'Think-tank research', 'Public affairs'],
    Education: ['Teaching', 'Educational psychology', 'Learning design', 'Youth work'],
  }
  const degreeRoutes = {
    Finance: ['Economics', 'Finance', 'Mathematics', 'Business'],
    Technology: ['Computer Science', 'Data Science', 'Software Engineering'],
    Business: ['Business Management', 'Economics', 'Management', 'Marketing'],
    Engineering: ['Engineering', 'Physics', 'Design Engineering'],
    Healthcare: ['Medicine', 'Nursing', 'Biomedical Science', 'Physiotherapy'],
    Science: ['Biology', 'Chemistry', 'Physics', 'Environmental Science'],
    Law: ['Law', 'Politics', 'History', 'Philosophy'],
    'Creative & Media': ['Design', 'Film', 'Animation', 'English'],
    Marketing: ['Marketing', 'Business', 'Psychology', 'Media'],
    'Public Policy': ['Politics', 'International Relations', 'Economics', 'Sociology'],
    Education: ['Education', 'Psychology', 'Subject degree + teacher training'],
  }
  const rankedSectors = Object.entries(scores).sort((first, second) => second[1] - first[1])
  const coreIds = questions.slice(0, 6).map((question) => question.id)
  const answerCount = Object.keys(answers).length
  const lead = (rankedSectors[0]?.[1] || 0) - (rankedSectors[1]?.[1] || 0)
  const adaptiveCount = answerCount >= coreIds.length ? (lead >= 3 ? 2 : lead >= 2 ? 4 : 6) : 6
  const relevantFollowUps = questions.slice(6)
    .map((question) => ({ question, relevance: question.sectors.reduce((total, sector) => total + (scores[sector] || 0), 0) }))
    .sort((first, second) => second.relevance - first.relevance || first.question.id.localeCompare(second.question.id))
    .slice(0, adaptiveCount)
    .map(({ question }) => question.id)
  const questionOrder = answerCount >= coreIds.length ? [...coreIds, ...relevantFollowUps] : coreIds
  const currentStep = Math.min(workspaceData.currentStep || 0, questionOrder.length - 1)
  const currentQuestion = questions.find((question) => question.id === questionOrder[currentStep])
  const currentHasAnswer = Object.prototype.hasOwnProperty.call(answers, currentQuestion?.id)
  const estimatedTotal = answerCount >= coreIds.length ? questionOrder.length : 8 + (lead < 2 ? 4 : lead < 3 ? 2 : 0)
  const progress = Math.min(100, Math.round((answerCount / estimatedTotal) * 100))
  const topThree = rankedSectors.slice(0, 3)
  const signalsFor = (sector) => questions
    .filter((question) => question.sectors.includes(sector) && (answers[question.id] === true || answers[question.id] === 'sometimes'))
    .slice(0, 2)
    .map((question) => question.text.replace(/^I /, 'You ').replace(/\.$/, ''))
  const setAnswer = (value) => setWorkspaceData({ ...workspaceData, answers: { ...answers, [currentQuestion.id]: value }, careerQuizComplete: false })
  const moveNext = () => {
    if (!currentHasAnswer) return
    if (currentStep >= questionOrder.length - 1) {
      setWorkspaceData({ ...workspaceData, answers, currentStep, careerQuizComplete: true })
      return
    }
    setWorkspaceData({ ...workspaceData, answers, currentStep: currentStep + 1, careerQuizComplete: false })
  }
  return (
    <div className="career-quiz-studio">
      <header><span className="days-left">ADAPTIVE YES / NO CAREER QUIZ</span><h2>Find career sectors worth exploring</h2><p>Questions adapt to your answers. Most students answer around {estimatedTotal} questions; a clearer match can finish sooner.</p><div className="quiz-progress"><i style={{ width: `${progress}%` }} /></div><div className="quiz-progress-copy"><span>{progress}% complete</span><span>Question {currentStep + 1} of about {estimatedTotal}</span></div></header>
      <section className="career-question-stage">
        <span className="career-question-number">{String(currentStep + 1).padStart(2, '0')}</span>
        <h3>{currentQuestion?.text}</h3>
        <p>Choose the answer that feels most true right now.</p>
        <div className="career-answer-buttons">
          <button className={`career-answer${answers[currentQuestion?.id] === true ? ' selected' : ''}`} onClick={() => setAnswer(true)}>Yes</button>
          <button className={`career-answer${answers[currentQuestion?.id] === 'sometimes' ? ' selected' : ''}`} onClick={() => setAnswer('sometimes')}>Sometimes</button>
          <button className={`career-answer${answers[currentQuestion?.id] === false ? ' selected' : ''}`} onClick={() => setAnswer(false)}>No</button>
        </div>
        <div className="career-navigation"><button className="filter-button" disabled={currentStep === 0} onClick={() => setWorkspaceData({ ...workspaceData, answers, currentStep: currentStep - 1, careerQuizComplete: false })}>← Back</button><button className="view-button" disabled={!currentHasAnswer} onClick={moveNext}>{currentStep >= questionOrder.length - 1 ? 'See my direction →' : 'Next question →'}</button></div>
      </section>
      {workspaceData.careerQuizComplete && <section className="career-results"><div className="days-left">YOUR TOP THREE DIRECTIONS</div>{topThree.length ? <><p className="career-results-intro">These are directions to test, not a prediction of your future. Each card explains the signals behind it and gives a low-risk way to explore it further.</p><div className="career-result-grid">{topThree.map(([sector], index) => <div className="career-result-card" key={sector}><span>0{index + 1} · {Math.round((scores[sector] / Math.max(1, rankedSectors[0]?.[1] || 1)) * 100)}% match signal</span><h3>{sector}</h3><p className="career-fit-reason"><b>Why it appeared:</b> {signalsFor(sector).join('; ') || 'your overall answer pattern points here.'}</p><div><b>Degree routes to explore</b><p>{degreeRoutes[sector].join(' · ')}</p></div><div><b>Specific jobs to investigate</b><ul>{jobs[sector].map((job) => <li key={job}>{job}</li>)}</ul></div><p className="career-next-test"><b>Try it next:</b> find one relevant student society, online insight day, short course or interview with someone in this sector.</p></div>)}</div></> : <div className="career-no-match"><h3>No strong direction yet — that is useful too.</h3><p>Your answers suggest it would help to explore more broadly. Try the quiz again and use “Sometimes” where an interest is still developing.</p></div>}<button className="filter-button" onClick={() => setWorkspaceData({})} style={{ marginTop: '20px' }}>Start again</button></section>}
    </div>
  )
}

function InSitePlanner({ feature, workspaceData, setWorkspaceData, onOpenAi }) {
  const prompts = {
    contextual: ['Your chosen indicators', 'For example: care experience, Free School Meals, postcode, school context — share only what you choose.', 'Potential support to research'],
    'test-planner': ['Potential tests and courses', 'For example: TMUA — Economics at LSE, UCL and Warwick.', 'Practice target or next deadline'],
    interview: ['Course and interview type', 'For example: Economics — Oxford tutorial-style interview.', 'Concepts or questions to practise'],
    portfolio: ['Portfolio project', 'Initial idea → research → experimentation → development → final outcome → reflection.', 'University requirement to verify'],
    'multi-course': ['Your course choices', 'For example: Economics; Economics and Management; Economics and Finance.', 'Shared themes to explore'],
    circumstances: ['Factual timeline', 'What happened, when, affected studies, possible evidence and who could verify it.', 'Question to discuss with your school/referee'],
    balance: ['Your choices', 'University — course — published grades — subject requirements — admissions test.', 'Balance concern to investigate'],
    'firm-insurance': ['Offers received', 'University — course — conditions — key subject requirements.', 'Results-day scenario to model'],
    accommodation: ['Your priorities', 'Rank: course, cost, distance, campus/city, accommodation, transport, sport/societies.', 'Accommodation or cost note'],
    clearing: ['Results-day ready plan', 'Alternative courses, contacts, documents, questions to ask and preferred routes.', 'Plan A / B / C next action'],
    timeline: ['Deadline or milestone', 'UCAS, tests, open day, scholarship, interview, portfolio, finance or accommodation.', 'What must happen before this date'],
    progress: ['Application update', 'Choice, current status, date and the next action you control.', 'Next step'],
    'international-quals': ['Qualification and country', 'For example: Indian CBSE; US AP; French Baccalaureate.', 'Published course condition to verify'],
  }
  const [title, placeholder, followUp] = prompts[feature.id] || ['Your plan', 'Add your notes here.', 'Next action']
  const [showGuidance, setShowGuidance] = useState(false)
  return (
    <div className="planner-studio">
      <section className="planner-main-panel">
        <div className="days-left">YOUR IN-SITE WORKSPACE</div>
        <h2>{title}</h2>
        <p>Capture the facts first. GrowthGrind turns those facts into useful, practical next steps — without hiding the work behind a generic link.</p>
        <textarea value={workspaceData.notes || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, notes: event.target.value })} placeholder={placeholder} style={{ width: '100%', minHeight: '185px', boxSizing: 'border-box', padding: '13px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit', resize: 'vertical' }} />
        <input value={workspaceData.nextAction || ''} onChange={(event) => setWorkspaceData({ ...workspaceData, nextAction: event.target.value })} placeholder={followUp} style={{ width: '100%', boxSizing: 'border-box', marginTop: '10px', padding: '12px', borderRadius: '9px', border: '1px solid #d0c4b0', background: '#f5efe5', color: '#315b3d', font: 'inherit' }} />
      </section>
      <aside className="planner-guide-panel">
        <div className="days-left">GUIDED ANALYSIS</div>
        <h3>Turn notes into a plan</h3>
        <p>Get a focused analysis of the notes in this workspace, including what to verify and your most useful next move.</p>
        <div className="planner-steps"><span>01 Facts</span><span>02 Check</span><span>03 Act</span></div>
        {showGuidance ? <div className="planner-analysis"><strong>Your built-in next-step checklist</strong><p>1. Verify every requirement or deadline on the provider’s official page. 2. Turn your notes into one specific, dated next action. 3. Keep evidence, documents and contact details together before you submit or decide.</p><button className="filter-button" onClick={() => setShowGuidance(false)}>Edit my plan</button></div> : <button className="view-button" onClick={() => setShowGuidance(true)}>Show my next-step checklist →</button>}
      </aside>
    </div>
  )
}

function MathText({ text }) {
  const formatLine = (line, lineIndex) => {
    const plainLine = String(line)
      .replace(/^\s{0,3}#{1,6}\s+/, '')
      .replace(/^\s*[-*+]\s+/, '• ')
      .replace(/\*\*([^*]+)\*\*/g, '$1')
      .replace(/__([^_]+)__/g, '$1')
      .replace(/`([^`]+)`/g, '$1')
    const fractionPattern = /\\frac\{([^{}]+)\}\{([^{}]+)\}|\(([^()]+)\)\/\(([^()]+)\)/g
    const parts = []
    let cursor = 0
    let match
    while ((match = fractionPattern.exec(plainLine))) {
      if (match.index > cursor) parts.push(plainLine.slice(cursor, match.index))
      parts.push(<span className="math-fraction" key={`${lineIndex}-${match.index}`}><span>{match[1] || match[3]}</span><span>{match[2] || match[4]}</span></span>)
      cursor = match.index + match[0].length
    }
    parts.push(plainLine.slice(cursor))
    return parts.map((part, index) => typeof part === 'string'
      ? part.replace(/\\sqrt\{([^{}]+)\}|sqrt\(([^()]+)\)/g, '√($1$2)').split(/(\^\{?[-+]?\d+\}?)/g).map((piece, pieceIndex) => piece.startsWith('^') ? <sup key={`${index}-${pieceIndex}`}>{piece.replace(/[^{\d+-]/g, '').replace('}', '')}</sup> : piece)
      : part)
  }
  return <>{String(text || '').split('\n').map((line, index) => <span key={index}>{formatLine(line, index)}{index < String(text || '').split('\n').length - 1 && <br />}</span>)}</>
}

function PremiumFeature({
  number,
  title,
  description,
  onClick,
  isLocked = false,
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
        opacity: isLocked ? 0.76 : 1,
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
            {isLocked ? '🔒 LOCKED' : 'PREMIUM'}
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
  const isTracked = tracked.includes(opportunity.id)
  const [expanded, setExpanded] = useState(false)
  const [logoUnavailable, setLogoUnavailable] = useState(false)

  const description = opportunity.description || 'No description available.'
  const isLongDescription = description.length > 220

  const displayedDescription =
    !isLongDescription || expanded
      ? description
      : `${description.slice(0, 220).trim()}...`

  const providerName = opportunity.organisation || 'Opportunity provider'
  const providerInitials = providerName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
  let providerIcon = ''
  try {
    const hostname = new URL(opportunity.link).hostname.replace(/^www\./, '')
    providerIcon = `https://${hostname}/favicon.ico`
  } catch {
    // Some legacy records have no usable official URL; their initials badge is
    // intentionally used instead of sending a request to a third party.
  }

  return (
    <article className="opportunity-card">
      <div className="card-top">
        <span className="category-tag">
          {opportunity.category}
        </span>

        <button
          className="save-button"
          onClick={() =>
            toggleSaved(opportunity)
          }
        >
          {saved.includes(opportunity.id)
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

      <div className="opportunity-provider">
        <span className="provider-logo" aria-hidden="true">
          {providerIcon && !logoUnavailable ? (
            <img
              src={providerIcon}
              alt=""
              onError={() => setLogoUnavailable(true)}
            />
          ) : (
            providerInitials || 'GG'
          )}
        </span>
        <div>
          <h3>{opportunity.title}</h3>
          <div className="organisation">{providerName}</div>
        </div>
      </div>

      <div className="opportunity-description">
        <p>{displayedDescription}</p>
        {isLongDescription && (
          <button
            onClick={() => setExpanded((current) => !current)}
            style={{
              display: 'inline',
              marginTop: '-10px',
              padding: 0,
              border: 0,
              background: 'none',
              color: '#315b3d',
              fontWeight: '800',
              fontSize: '12px',
              cursor: 'pointer',
            }}
          >
            {expanded ? 'See less' : 'See more…'}
          </button>
        )}
      </div>

      <div className="details">
        <span>⌖ {opportunity.location || 'Location not listed'}</span>
        <span>◉ {opportunity.format || 'Format not listed'}</span>
        <span>♙ Ages {opportunity.age || 'Age not listed'}</span>
        <span>{opportunity.activityType || 'Activity type not listed'}</span>
        {opportunity.subjects?.length > 0 && (
          <span>📚 {opportunity.subjects.join(', ')}</span>
        )}
      </div>

      <div className="deadline-row">
        <span>{opportunity.deadline || 'Deadline not listed'}</span>
        {opportunity.days && <span>{opportunity.days}</span>}
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
          attemptTrack(opportunity)
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
  const [descriptionExpanded, setDescriptionExpanded] = useState(false)
  const description = opportunity.description || 'No description available.'
  const isLongDescription = description.length > 300
  const displayedDescription =
    isLongDescription && !descriptionExpanded
      ? `${description.slice(0, 300).trim()}...`
      : description

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

        <div className="modal-description">
          <p>{displayedDescription}</p>
          {isLongDescription && (
            <button
              className="filter-button"
              onClick={() =>
                setDescriptionExpanded((current) => !current)
              }
              style={{ marginBottom: '18px' }}
            >
              {descriptionExpanded ? 'View less' : 'View more'}
            </button>
          )}
        </div>

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
            toggleSaved(opportunity)
          }
        >
          {saved.includes(opportunity.id)
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
            attemptTrack(opportunity)
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
  loading,
  error,
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
          disabled={!email.trim() || loading}
        >
          {loading ? 'Saving…' : 'Sign me up'}
        </button>
      </div>
      {error && <p style={{ color: '#9d3c2e', fontWeight: '700', marginTop: '12px' }}>{error}</p>}
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
  wide = false,
  children,
}) {
  return (
    <main>
      <section className="hero-section">
        <div className={`hero-content${wide ? ' premium-tool-wide' : ''}`}>
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
