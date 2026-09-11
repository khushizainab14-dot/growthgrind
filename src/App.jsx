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

const aiSpecialists = [
  { id: 'general', name: 'GrowthGrind AI', description: 'Ask anything', starter: 'I’m not sure where to begin — can you help me work out my next step?' },
  { id: 'courses', name: 'Course Finder', description: 'Courses and universities', starter: 'I enjoy [subjects/interests]. What university course areas should I explore?' },
  { id: 'admissions', name: 'Admissions Advisor', description: 'Your application strategy', starter: 'I’m considering [course/universities]. What should I focus on next?' },
  { id: 'statement', name: 'Personal Statement', description: 'Reflect on your evidence', starter: 'I want to study [course]. How can I reflect on my experiences without just listing them?' },
  { id: 'tests', name: 'Admissions Tests', description: 'What to investigate', starter: 'I am considering [course/universities]. Which admissions tests should I check?' },
  { id: 'career', name: 'Career Explorer', description: 'Pathways to explore', starter: 'I enjoy [subjects/activities]. What career paths could I explore?' },
  { id: 'research', name: 'Research Builder', description: 'Build a project idea', starter: 'I’m interested in [topic]. Can you help me turn it into a research project?' },
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
    }

    loadOpportunities()
  }, [])
  const [page, setPage] = useState('Discover')

  const [selectedInterests, setSelectedInterests] = useState([])
  const [activeCategory, setActiveCategory] = useState('All')
  const [selectedOpportunity, setSelectedOpportunity] = useState(null)

  const [saved, setSaved] = useState([])
  const [tracked, setTracked] = useState([])
  const [trackedActivities, setTrackedActivities] = useState({})
  const [session, setSession] = useState(null)
  const [authModal, setAuthModal] = useState(false)
  const [authMode, setAuthMode] = useState('signin')
  const [authEmail, setAuthEmail] = useState('')
  const [authPassword, setAuthPassword] = useState('')
  const [authMessage, setAuthMessage] = useState('')
  const [courseProfile, setCourseProfile] = useState({
    subjects: '',
    grades: '',
    interests: '',
    careers: '',
    location: 'No preference yet',
    universityPreferences: '',
    priorities: '',
  })
  const [courseResults, setCourseResults] = useState(null)
  const [courseLoading, setCourseLoading] = useState(false)
  const [courseError, setCourseError] = useState('')
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

  const user = session?.user || null

  useEffect(() => {
    localStorage.setItem('growthgrind_ai_chats', JSON.stringify(aiChats))
  }, [aiChats])

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

  const foundingMembersClaimed = 0
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

  const updateCourseProfile = (field, value) => {
    setCourseProfile((current) => ({ ...current, [field]: value }))
  }

  const findCourses = async (event) => {
    event.preventDefault()
    setCourseError('')
    setCourseResults(null)
    setCourseLoading(true)

    try {
      const response = await fetch('/api/course-finder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(courseProfile),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Something went wrong.')
      setCourseResults(result)
    } catch (error) {
      setCourseError(error.message || 'We could not generate recommendations.')
    } finally {
      setCourseLoading(false)
    }
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
      const result = await response.json()
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
    goTo('AI')
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

  const sendAiChat = async (event) => {
    event.preventDefault()
    const message = aiChatInput.trim()
    if ((!message && !aiAttachment) || aiChatLoading) return
    if (aiAttachment && !user) {
      openAuth()
      return
    }
    const currentMessages = aiChats[activeAiChat] || []
    const attachmentLabel = aiAttachment ? `\n\n[Attached: ${aiAttachment.name}]` : ''
    const userMessage = { role: 'user', content: `${message || 'Please analyse this attachment.'}${attachmentLabel}` }
    setAiChats((current) => ({ ...current, [activeAiChat]: [...currentMessages, userMessage] }))
    saveAiMessage(activeAiChat, userMessage)
    setAiChatInput('')
    setAiChatError('')
    setAiChatLoading(true)
    try {
      const attachment = aiAttachment ? await encodeAiAttachment(aiAttachment) : null
      if (aiAttachment) await uploadAiAttachment(aiAttachment)
      const response = await fetch('/api/ai-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ specialist: activeAiChat, messages: currentMessages, message: message || 'Please analyse this attachment.', attachment }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Something went wrong.')
      const assistantMessage = { role: 'assistant', content: result.reply }
      setAiChats((current) => ({
        ...current,
        [activeAiChat]: [...(current[activeAiChat] || []), assistantMessage],
      }))
      saveAiMessage(activeAiChat, assistantMessage)
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
  }

  const deactivateDemoPremium = () => {
    localStorage.removeItem('growthgrind_demo_premium')
    setIsPremium(false)
  }

  const getMatchScore = (opportunity) => {
    if (selectedInterests.length === 0) return 100

    const matches = (opportunity.interests || []).filter((interest) =>
      selectedInterests.includes(interest)
    )

    if (matches.length === 0) return 0

    return Math.min(
      99,
      Math.round((matches.length / selectedInterests.length) * 100)
    )
  }

  const closingSoonOpportunities = [...opportunities]
    .filter((opportunity) => opportunity.deadlineRaw)
    .filter((opportunity) => {
      const deadline = new Date(opportunity.deadlineRaw)
      const today = new Date()
      today.setHours(0, 0, 0, 0)

      return !Number.isNaN(deadline.getTime()) && deadline >= today
    })
    .sort((a, b) => new Date(a.deadlineRaw) - new Date(b.deadlineRaw))
    .slice(0, 3)

  const getFilteredOpportunities = () => {
    let results = [...opportunities]

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
        const searchable = [opportunity.category, opportunity.activityType]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        return keywords.some((keyword) => searchable.includes(keyword))
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
          return opportunity.format === 'Online' || location.includes('remote')
        }

        return location.includes(locationFilter.toLowerCase())
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
        const aDeadline = a.deadlineRaw ? new Date(a.deadlineRaw).getTime() : Infinity
        const bDeadline = b.deadlineRaw ? new Date(b.deadlineRaw).getTime() : Infinity
        return aDeadline - bDeadline
      })
    }

    if (sort === 'Most relevant' && selectedInterests.length > 0) {
      results.sort((a, b) => getMatchScore(b) - getMatchScore(a))
    }

    return results
  }

  const filteredOpportunities = getFilteredOpportunities()

  const matchedOpportunities = [...opportunities]
    .filter((opportunity) => {
    if (
      activityTypeFilter !== 'Any' &&
      opportunity.activityType !== activityTypeFilter
    ) {
      return false
    }

    if (
      subjectFilter !== 'Any' &&
      !(opportunity.subjects || []).includes(subjectFilter)
    ) {
      return false
    }

    if (
      yearGroupFilter !== 'Any' &&
      !(opportunity.yearGroups || []).includes(yearGroupFilter)
    ) {
      return false
    }

      if (locationFilter !== 'Any') {
        const location = (opportunity.location || '').toLowerCase()
        const isUk = ['uk', 'united kingdom', 'england', 'london', 'oxford', 'cambridge']
          .some((place) => location.includes(place))
        const matchesLocation =
          locationFilter === 'UK'
            ? isUk
            : locationFilter === 'Online' || locationFilter === 'Remote'
              ? opportunity.format === 'Online' || location.includes('remote')
              : location.includes(locationFilter.toLowerCase())

        if (!matchesLocation) return false
      }

    if (
      formatFilter !== 'Any' &&
      opportunity.format !== formatFilter
    ) {
      return false
    }

    if (
      costFilter === 'Free' &&
      opportunity.cost !== 'Free'
    ) {
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
    .map((opportunity) => ({
      ...opportunity,
      matchScore: getMatchScore(opportunity),
    }))
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
        user={user}
        onAuth={() => openAuth()}
        onSignOut={() => supabase.auth.signOut()}
      />

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
                {closingSoonOpportunities.map((opportunity) => (
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
                      openAiWorkspace('admissions')
                    }
                  />

                  <PremiumFeature
                    number="02"
                    title="University & Course Finder"
                    description="Find UK courses and universities that fit you."
                    onClick={() =>
                      openAiWorkspace('courses')
                    }
                  />

                  <PremiumFeature
                    number="03"
                    title="Personal Statement Guidance"
                    description="Develop stronger ideas and improve your own writing."
                    onClick={() =>
                      openAiWorkspace('statement')
                    }
                  />

                  <PremiumFeature
                    number="04"
                    title="Admissions Test Support"
                    description="Personalised guidance for relevant UK admissions tests."
                    onClick={() =>
                      openAiWorkspace('tests')
                    }
                  />

                  <PremiumFeature
                    number="05"
                    title="Career Quiz"
                    description="Discover career and degree pathways suited to you."
                    onClick={() =>
                      openAiWorkspace('career')
                    }
                  />

                  <PremiumFeature
                    number="06"
                    title="AI Research Project Builder"
                    description="Turn an idea into a structured independent research project."
                    onClick={() =>
                      openAiWorkspace('research')
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
      {page === 'AI' && (
        <main>
          <section className="hero-section" style={{ paddingTop: '36px' }}>
            <div className="hero-content" style={{ maxWidth: '1120px' }}>
              <span className="eyebrow">GROWTHGRIND AI</span>
              <h1 style={{ fontSize: 'clamp(34px, 5vw, 58px)' }}>Your student<br />thinking partner.</h1>
              <p>Choose a specialist chat, ask follow-up questions, and build on the conversation as you go.</p>

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'minmax(210px, 0.72fr) minmax(0, 2fr)',
                  minHeight: '620px',
                  marginTop: '32px',
                  border: '1px solid #d0c4b0',
                  borderRadius: '18px',
                  overflow: 'hidden',
                  background: '#f5efe5',
                }}
              >
                <aside style={{ padding: '18px 12px', background: '#e9dfcf', borderRight: '1px solid #d0c4b0' }}>
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
                </aside>

                <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                  <div style={{ padding: '20px 24px', borderBottom: '1px solid #d0c4b0' }}>
                    <div className="days-left">SPECIALIST CHAT</div>
                    <h3 style={{ margin: '8px 0 0' }}>{aiSpecialists.find((item) => item.id === activeAiChat)?.name}</h3>
                  </div>
                  <div style={{ flex: 1, padding: '24px', overflowY: 'auto', maxHeight: '440px' }}>
                    {(aiChats[activeAiChat] || []).length === 0 ? (
                      <div className="closing-card" style={{ boxShadow: 'none' }}>
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
                          <div style={{ maxWidth: '82%', whiteSpace: 'pre-wrap', padding: '13px 15px', borderRadius: '13px', lineHeight: 1.55, background: message.role === 'user' ? '#315b3d' : '#e9dfcf', color: message.role === 'user' ? '#fff' : '#294b35' }}>
                            {message.content}
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
            title="Build your admissions strategy"
            description="Get a structured starting point, then verify requirements directly with universities."
            fields={[
              ['Subjects and grades', 'For example: Maths, Economics, Physics — predicted A*AA'],
              ['Courses or universities you are considering', 'Optional — add anything already on your mind'],
              ['Your goals and current experiences', 'What you enjoy, what you have done, and what you want to develop'],
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
          {!courseResults && <form className="closing-card" onSubmit={findCourses}>
            <h3>Tell us about you</h3>
            <p>
              We’ll suggest course areas worth exploring and the questions to ask on official university pages. This is guidance, not an admissions decision.
            </p>

            <CourseField
              label="Current subjects"
              placeholder="For example: Maths, Economics, Physics"
              value={courseProfile.subjects}
              onChange={(value) => updateCourseProfile('subjects', value)}
            />
            <CourseField
              label="Predicted or current grades"
              placeholder="For example: A*AA, or GCSE grades if you have not started A-levels"
              value={courseProfile.grades}
              onChange={(value) => updateCourseProfile('grades', value)}
            />
            <CourseField
              label="Academic interests"
              placeholder="What topics make you curious?"
              value={courseProfile.interests}
              onChange={(value) => updateCourseProfile('interests', value)}
              required
            />
            <CourseField
              label="Career ideas"
              placeholder="Optional — it is fine if you are unsure"
              value={courseProfile.careers}
              onChange={(value) => updateCourseProfile('careers', value)}
            />
            <CourseField
              label="Location preferences"
              placeholder="For example: London, anywhere in the UK, or close to home"
              value={courseProfile.location}
              onChange={(value) => updateCourseProfile('location', value)}
            />
            <CourseField
              label="University preferences"
              placeholder="Optional — particular universities, campus/city preferences, or Russell Group"
              value={courseProfile.universityPreferences}
              onChange={(value) => updateCourseProfile('universityPreferences', value)}
            />
            <CourseField
              label="What matters most to you?"
              placeholder="For example: course content, placement year, location, graduate prospects"
              value={courseProfile.priorities}
              onChange={(value) => updateCourseProfile('priorities', value)}
            />

            {courseError && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{courseError}</p>}

            <button className="primary-button" disabled={courseLoading} type="submit" style={{ opacity: courseLoading ? 0.65 : 1 }}>
              {courseLoading ? 'Finding your options…' : 'Find course areas →'}
            </button>
          </form>}

          {courseResults && (
            <div>
              <div className="closing-card">
                <div className="days-left">YOUR COURSE EXPLORATION</div>
                <h3>A starting point, tailored to you</h3>
                <p>{courseResults.summary}</p>
              </div>
              <div className="closing-grid" style={{ marginTop: '18px' }}>
                {(courseResults.courseAreas || []).map((course) => (
                  <div className="closing-card" key={course.title}>
                    <h3>{course.title}</h3>
                    <p><strong>Why it could fit:</strong> {course.whyItFits}</p>
                    <p><strong>Explore:</strong> {course.explore}</p>
                    {(course.universitiesToExplore || []).length > 0 && (
                      <div style={{ marginTop: '16px' }}>
                        <strong style={{ color: '#315b3d', fontSize: '12px' }}>Universities to investigate</strong>
                        <ul style={{ paddingLeft: '20px', lineHeight: '1.55', marginBottom: '12px' }}>
                          {course.universitiesToExplore.map((university) => (
                            <li key={university.name}>
                              <strong>{university.name}:</strong> {university.reason}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <a
                      className="view-button"
                      href={`https://digital.ucas.com/coursedisplay/results/courses?search=${encodeURIComponent(course.title.replace(/\s*\([^)]*\)/g, ''))}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ display: 'inline-block', marginTop: '8px', textDecoration: 'none' }}
                    >
                      See all {course.title} courses on UCAS →
                    </a>
                  </div>
                ))}
              </div>
              <div className="closing-card" style={{ marginTop: '18px' }}>
                <h3>What to do next</h3>
                <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
                  {(courseResults.nextSteps || []).map((step) => <li key={step}>{step}</li>)}
                </ul>
                {(courseResults.questionsToConsider || []).length > 0 && (
                  <>
                    <h3 style={{ marginTop: '22px' }}>Questions to consider</h3>
                    <ul style={{ paddingLeft: '20px', lineHeight: '1.7' }}>
                      {courseResults.questionsToConsider.map((question) => <li key={question}>{question}</li>)}
                    </ul>
                  </>
                )}
                <p style={{ marginTop: '22px', fontSize: '12px' }}>
                  Course and university availability changes regularly. UCAS Search is the source of truth for the full current list.
                </p>
                <button
                  className="filter-button"
                  onClick={() => {
                    setCourseResults(null)
                    setCourseError('')
                  }}
                  style={{ marginTop: '10px' }}
                >
                  Start a new search
                </button>
              </div>
            </div>
          )}
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
            title="Reflect on your experiences"
            description="GrowthGrind helps you find your own evidence and ideas; it will not write a statement for you."
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
          <PremiumAiTool
            tool="career"
            title="Explore career pathways"
            description="There is no single right career. Use this to find pathways worth exploring further."
            fields={[
              ['Subjects and topics you enjoy', 'What do you most enjoy learning about?'],
              ['Strengths and working style', 'For example: creative, analytical, working with people, independent research'],
              ['Career ideas or priorities', 'Optional — include anything you want to explore or avoid'],
            ]}
            details={aiDetails.career || {}}
            result={aiResults.career}
            loading={aiLoading === 'career'}
            error={aiError.career}
            onChange={(field, value) => updateAiDetail('career', field, value)}
            onSubmit={(event) => runPremiumTool(event, 'career')}
          />
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
            title="Develop your project idea"
            description="Turn a curiosity into a focused, manageable independent project—without inventing sources or writing it for you."
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
        onClick={user ? onSignOut : onAuth}
      >
        {user ? 'Sign out' : 'Sign in'}
      </button>
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
  title,
  description,
  fields,
  details,
  result,
  loading,
  error,
  onChange,
  onSubmit,
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
        <div>
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
  const isTracked = tracked.includes(opportunity.id)
  const [expanded, setExpanded] = useState(false)

  const description = opportunity.description || 'No description available.'
  const isLongDescription = description.length > 220

  const displayedDescription =
    !isLongDescription || expanded
      ? description
      : `${description.slice(0, 220).trim()}...`

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

      <h3>{opportunity.title}</h3>

      <div className="organisation">
        {opportunity.organisation}
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
