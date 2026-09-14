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
  { id: 'research', name: 'Research Builder', description: 'Build a project idea', starter: 'I’m interested in [topic]. Can you help me turn it into a research project?' },
  { id: 'study', name: 'GrowthGrind Study', description: 'Your AI exam tutor', starter: 'I need help with [subject/topic]. Please guide me one step at a time instead of giving the answer immediately.' },
]

const premiumRoadmap = [
  { id: 'tariff', stage: 'EXPLORE', title: 'Tariff & grade calculator', description: 'Convert qualifications and understand how grades compare with course requirements.' },
  { id: 'contextual', stage: 'EXPLORE', title: 'Contextual support finder', description: 'Explore bursaries, contextual offers and eligibility checks with official sources.' },
  { id: 'statement-builder', stage: 'APPLY', title: 'Interactive personal statement builder', description: 'Plan responses, track characters and receive feedback that preserves your own voice.' },
  { id: 'test-planner', stage: 'APPLY', title: 'Admissions test planner', description: 'Identify tests to investigate, build practice habits and track registration dates.' },
  { id: 'interview', stage: 'APPLY', title: 'Interview practice hub', description: 'Prepare for interviews with structured question practice and reflection.' },
  { id: 'portfolio', stage: 'APPLY', title: 'Creative portfolio hub', description: 'Organise portfolio work, requirements and feedback for creative applications.' },
  { id: 'multi-course', stage: 'APPLY', title: 'Multi-course statement analyser', description: 'Check whether one statement gives the right weight to every course you are applying for.' },
  { id: 'circumstances', stage: 'APPLY', title: 'Extenuating-circumstances guide', description: 'Turn a difficult situation into a factual timeline to discuss with a trusted referee.' },
  { id: 'balance', stage: 'DECIDE', title: 'Choice balance dashboard', description: 'Review whether your university choices are balanced around your own goals and grades.' },
  { id: 'firm-insurance', stage: 'DECIDE', title: 'Firm & insurance planner', description: 'Compare offer conditions and map realistic results-day scenarios.' },
  { id: 'accommodation', stage: 'DECIDE', title: 'Campus & accommodation comparison', description: 'Compare course, living and travel priorities in one structured view.' },
  { id: 'clearing', stage: 'DECIDE', title: 'Clearing & Extra planner', description: 'Save a prepared plan for late applications and results-day options.' },
  { id: 'timeline', stage: 'STAY ON TRACK', title: 'Smart deadline timeline', description: 'Bring course, test, finance, open-day and portfolio deadlines into one plan.' },
  { id: 'progress', stage: 'STAY ON TRACK', title: 'Application progress tracker', description: 'Track decisions, next steps and your personal application timeline.' },
  { id: 'international-quals', stage: 'STAY ON TRACK', title: 'International qualification guide', description: 'Understand qualification terminology and conditions to verify with each university.' },
  { id: 'career-quiz', stage: 'EXPLORE', title: 'Career Quiz', description: 'Answer quick yes/no questions to discover your top three career sectors and job routes.' },
  { id: 'study', stage: 'GROWTHGRIND STUDY', title: 'GrowthGrind Study — AI exam tutor', description: 'Scan questions, get Socratic help, save mistakes and build a weakness profile.' },
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
  const [courseQuery, setCourseQuery] = useState('')
  const [courseRegion, setCourseRegion] = useState('All UK')
  const [courseMode, setCourseMode] = useState('All study modes')
  const [courseResults, setCourseResults] = useState([])
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

  const [premiumModal, setPremiumModal] = useState(null)
  const [showPremiumWelcome, setShowPremiumWelcome] = useState(false)
  const [checkoutLoading, setCheckoutLoading] = useState('')
  const [activePremiumWorkspace, setActivePremiumWorkspace] = useState(null)
  const [statementAnswers, setStatementAnswers] = useState(['', '', ''])
  const [statementCourse, setStatementCourse] = useState('')
  const [statementFeedback, setStatementFeedback] = useState(null)
  const [statementFeedbackLoading, setStatementFeedbackLoading] = useState(false)
  const [statementFeedbackError, setStatementFeedbackError] = useState('')
  const [premiumWorkspaceData, setPremiumWorkspaceData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('growthgrind_premium_workspace_data') || '{}') } catch { return {} }
  })

  const [isPremium, setIsPremium] = useState(
    localStorage.getItem('growthgrind_demo_premium') === 'true'
  )
  const [foundingMembersClaimed, setFoundingMembersClaimed] = useState(0)

  const user = session?.user || null

  useEffect(() => {
    const loadPremiumStatus = async () => {
      const headers = session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {}
      const response = await fetch('/api/premium-status', { headers })
      if (!response.ok) return
      const status = await response.json()
      setFoundingMembersClaimed(status.foundingMembersClaimed || 0)
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
    localStorage.setItem('growthgrind_premium_workspace_data', JSON.stringify(premiumWorkspaceData))
  }, [premiumWorkspaceData])

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

  const findCourses = async (event) => {
    event.preventDefault()
    setCourseError('')
    setCourseLoading(true)
    setCourseSearched(true)

    try {
      const safeQuery = courseQuery.trim().replace(/[(),]/g, ' ')
      let request = supabase
        .from('university_courses')
        .select('id, course_title, provider_name, campus_name, country, qualification, study_mode, duration, subjects_text, course_url, source_updated_at')
        .order('course_title', { ascending: true })
        .limit(60)
      if (safeQuery) request = request.or(`course_title.ilike.%${safeQuery}%,provider_name.ilike.%${safeQuery}%,subjects_text.ilike.%${safeQuery}%`)
      if (courseRegion !== 'All UK') request = request.eq('country', courseRegion)
      if (courseMode !== 'All study modes') request = request.eq('study_mode', courseMode)
      const { data, error } = await request
      if (error) throw error
      setCourseResults(data || [])
    } catch (error) {
      setCourseError('The course catalogue is being updated. Please try again shortly.')
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
    goTo('Specialist')
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
        body: JSON.stringify({ answers: statementAnswers, course: statementCourse }),
      })
      const result = await response.json()
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
        body: JSON.stringify({ specialist: chatId, messages: currentMessages, message: message || 'Please analyse this attachment.', attachment, stream: true }),
      })
      if (!response.ok) {
        const result = await response.json()
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
    setCheckoutLoading(plan)
    try {
      const response = await fetch('/api/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan, userId: user.id }),
      })
      const result = await response.json()
      if (!response.ok) throw new Error(result.error || 'Checkout could not be opened.')
      window.location.assign(result.url)
    } catch (error) {
      setAuthMessage(error.message || 'Checkout could not be opened.')
    } finally {
      setCheckoutLoading('')
    }
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

  const toggleMatchChoice = (setChoices, choice, resetChoice = 'Any') => {
    if (choice === resetChoice || choice === 'All opportunities') {
      setChoices([])
      return
    }
    setChoices((current) => current.includes(choice)
      ? current.filter((item) => item !== choice)
      : [...current, choice])
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
    if (matchActivityTypes.length && !matchActivityTypes.includes(opportunity.activityType)) {
      return false
    }

    if (matchSubjects.length && !matchSubjects.some((subject) => (opportunity.subjects || []).includes(subject))) {
      return false
    }

    if (matchYearGroups.length && !matchYearGroups.some((year) => (opportunity.yearGroups || []).includes(year))) {
      return false
    }

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

    if (matchFormats.length && !matchFormats.includes(opportunity.format)) {
      return false
    }

    if (matchCosts.length && !matchCosts.some((cost) =>
      cost === 'Free' ? opportunity.cost === 'Free' : cost === 'Financial support' ? opportunity.support : true
    )) {
      return false
    }

      return true
    })
    .map((opportunity) => ({
      ...opportunity,
      matchScore: getMatchScore(opportunity),
    }))
    .sort((a, b) => b.matchScore - a.matchScore)

  const journeySuggestions = opportunities
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
    .slice(0, 6)

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
                  const selected = matchYearGroups.includes(option)

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
                  const selected = matchActivityTypes.includes(option)

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
                  const selected = matchSubjects.includes(option)

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
                    const selected = matchLocations.includes(option)

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
                    const selected = matchFormats.includes(option)

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
                  const selected = matchCosts.includes(option)

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
                            <button className="view-button" onClick={() => setSelectedOpportunity(opportunity)}>
                              See why it connects →
                            </button>
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
          workspaceData={premiumWorkspaceData[activePremiumWorkspace.id] || {}}
          setWorkspaceData={(value) => setPremiumWorkspaceData((current) => ({ ...current, [activePremiumWorkspace.id]: value }))}
          onBack={() => goTo('Pricing')}
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
                  First 30 students get Premium for £2.99/month.
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
                    ['founding', 'Founding Member — £2.99/month'],
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
                    onClick={() => goTo('CourseFinder')}
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
                    onClick={() => openPremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'career-quiz'))}
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

                  <PremiumFeature
                    number="08"
                    title="GrowthGrind Study"
                    description="Scan questions, get step-by-step tutoring and build a mistake bank."
                    onClick={() => openPremiumWorkspace(premiumRoadmap.find((feature) => feature.id === 'study'))}
                  />
                </div>

                <div style={{ marginTop: '48px' }}>
                  <div className="section-heading">
                    <div>
                      <span className="eyebrow">THE ADMISSIONS JOURNEY</span>
                      <h2>More ways Premium supports you</h2>
                      <p>These specialist workspaces are being added in stages, with official-source checking where a detail can affect an application.</p>
                    </div>
                  </div>
                  <div
                    className="pricing-features"
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}
                  >
                    {premiumRoadmap.map((feature, index) => (
                      <div className="closing-card" key={feature.title} style={{ boxShadow: 'none', border: '1px solid #d8cdbb' }}>
                        <div className="days-left">{feature.stage}</div>
                        <h3 style={{ marginTop: '12px' }}>{feature.title}</h3>
                        <p style={{ marginBottom: 0 }}>{feature.description}</p>
                        <span style={{ display: 'inline-block', marginTop: '13px', color: '#777065', fontWeight: '750', fontSize: '10px' }}>
                          PREMIUM WORKSPACE
                        </span>
                        <button className="filter-button" style={{ marginTop: '12px', width: '100%' }} onClick={() => openPremiumWorkspace(feature)}>
                          Open workspace →
                        </button>
                      </div>
                    ))}
                  </div>
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
      {(page === 'AI' || page === 'Specialist') && (
        <main>
          <section className="hero-section" style={{ paddingTop: '36px' }}>
            <div className="hero-content" style={{ maxWidth: '1120px' }}>
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
                    <h3 style={{ margin: '8px 0 0' }}>{aiSpecialists.find((item) => item.id === activeAiChat)?.name}</h3>
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
                          <div style={{ maxWidth: '82%', whiteSpace: 'pre-wrap', padding: '13px 15px', borderRadius: '13px', lineHeight: 1.55, background: message.role === 'user' ? '#315b3d' : '#e9dfcf', color: message.role === 'user' ? '#fff' : '#294b35' }}>
                            <MathText text={message.content} />
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
              <span>PUBLIC COURSE CATALOGUE</span>
              <a href="https://www.ucas.com/explore/search/courses" target="_blank" rel="noreferrer">Compare on UCAS ↗</a>
            </div>
            <form onSubmit={findCourses} className="course-search-form">
              <label className="course-search-input"><span>⌕</span><input value={courseQuery} onChange={(event) => setCourseQuery(event.target.value)} placeholder="Search courses, subjects or universities" /></label>
              <select value={courseRegion} onChange={(event) => setCourseRegion(event.target.value)}><option>All UK</option><option>England</option><option>Scotland</option><option>Wales</option><option>Northern Ireland</option></select>
              <select value={courseMode} onChange={(event) => setCourseMode(event.target.value)}><option>All study modes</option><option value="Full time">Full time</option><option value="Part time">Part time</option></select>
              <button className="primary-button" disabled={courseLoading} type="submit">{courseLoading ? 'Searching…' : 'Search courses'}</button>
            </form>
            <p className="course-search-note">Search the GrowthGrind catalogue, then open the university’s own course page for current modules, fees and requirements.</p>
          </section>

          {courseError && <p style={{ color: '#9d3c2e', fontWeight: '700' }}>{courseError}</p>}
          {courseSearched && !courseLoading && <section className="course-results-section">
            <div className="course-results-header"><strong>{courseResults.length ? `${courseResults.length}${courseResults.length === 60 ? '+' : ''} courses found` : 'No matching courses found'}</strong><span>Source: HESA Discover Uni · updated weekly</span></div>
            {courseResults.map((course) => <article className="course-result-card" key={course.id}>
              <div><span className="course-result-kicker">{course.qualification || 'UNDERGRADUATE'} · {course.study_mode || 'Study mode not listed'}</span><h3>{course.course_title}</h3><strong>{course.provider_name}</strong><p>{[course.campus_name, course.country, course.duration].filter(Boolean).join(' · ') || 'Details on official course page'}</p>{course.subjects_text && <div className="course-subject-tags">{course.subjects_text.split('|').slice(0, 4).map((subject) => <span key={subject}>{subject}</span>)}</div>}</div>
              <a className="view-button" href={course.course_url} target="_blank" rel="noreferrer">Official course page ↗</a>
            </article>)}
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
  workspaceData,
  setWorkspaceData,
  onBack,
  onOpenAi,
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
        <div className="hero-content">
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
            </div>
            <aside className="statement-feedback-panel">
              <div className="days-left">DRAFT FEEDBACK</div>
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
                      <strong style={{ fontSize: '11px', color: '#294b35' }}>{flag.type}</strong>
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
            <TariffWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenAi={onOpenAi} />
          ) : feature.id === 'study' ? (
            <StudyWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenAi={onOpenAi} />
          ) : feature.id === 'career-quiz' ? (
            <CareerQuizWorkspace workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} />
          ) : (
            <InSitePlanner feature={feature} workspaceData={workspaceData} setWorkspaceData={setWorkspaceData} onOpenAi={onOpenAi} />
          )}
        </div>
      </section>
    </main>
  )
}

function TariffWorkspace({ workspaceData, setWorkspaceData, onOpenAi }) {
  const grades = ['A*', 'A', 'B', 'C', 'D', 'E']
  const points = { 'A*': 56, A: 48, B: 40, C: 32, D: 24, E: 16 }
  const selectedGrades = workspaceData.grades || ['', '', '']
  const total = selectedGrades.reduce((sum, grade) => sum + (points[grade] || 0), 0)
  const updateGrade = (index, grade) => setWorkspaceData({ ...workspaceData, grades: selectedGrades.map((item, itemIndex) => itemIndex === index ? grade : item) })
  return (
    <div className="premium-studio tariff-studio">
      <section className="tariff-form-panel">
        <div className="days-left">A-LEVEL SCENARIO</div>
        <h2>Model your predicted grades</h2>
        <p>Change a grade to see an indicative UCAS Tariff total. Universities can set subject-specific requirements and do not have to use Tariff points.</p>
        <div className="grade-picker">{selectedGrades.map((grade, index) => <label key={index}><span>A-level {index + 1}</span><select value={grade} onChange={(event) => updateGrade(index, event.target.value)}><option value="">Choose grade</option>{grades.map((item) => <option key={item}>{item}</option>)}</select></label>)}</div>
      </section>
      <aside className="tariff-result-panel">
        <span>YOUR INDICATIVE TOTAL</span>
        <strong>{total}</strong><em>UCAS Tariff points</em>
        <div className="tariff-divider" />
        <h3>Before you shortlist a course</h3>
        <ul><li>Check whether the university uses Tariff points.</li><li>Check required subjects and individual grades.</li><li>Record contextual and admissions-test requirements.</li></ul>
        <button className="view-button" onClick={onOpenAi}>Compare requirements →</button>
      </aside>
    </div>
  )
}

function StudyWorkspace({ workspaceData, setWorkspaceData, onOpenAi }) {
  const mistake = workspaceData.mistake || ''
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
        <p style={{ fontSize: '12px' }}>This is saved on this device. The next build will turn each saved item into a searchable question library and weakness profile.</p>
      </section>
    </div>
  )
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
    if (!answers[question.id]) return result
    question.sectors.forEach((sector) => { result[sector] = (result[sector] || 0) + 1 })
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
          <button className={`career-answer${answers[currentQuestion?.id] === false ? ' selected' : ''}`} onClick={() => setAnswer(false)}>No</button>
        </div>
        <div className="career-navigation"><button className="filter-button" disabled={currentStep === 0} onClick={() => setWorkspaceData({ ...workspaceData, answers, currentStep: currentStep - 1, careerQuizComplete: false })}>← Back</button><button className="view-button" disabled={!currentHasAnswer} onClick={moveNext}>{currentStep >= questionOrder.length - 1 ? 'See my direction →' : 'Next question →'}</button></div>
      </section>
      {workspaceData.careerQuizComplete && topThree.length > 0 && <section className="career-results"><div className="days-left">YOUR TOP THREE DIRECTIONS</div><div className="career-result-grid">{topThree.map(([sector], index) => <div className="career-result-card" key={sector}><span>0{index + 1}</span><h3>{sector}</h3><ul>{jobs[sector].map((job) => <li key={job}>{job}</li>)}</ul></div>)}</div><button className="filter-button" onClick={() => setWorkspaceData({})} style={{ marginTop: '20px' }}>Start again</button></section>}
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
        <button className="view-button" onClick={onOpenAi}>Analyse this plan →</button>
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
