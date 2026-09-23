// Presentation-only landing page. Every action opens an existing workspace.
export default function HomePage({
  opportunities,
  opportunitiesLoading,
  closingSoon,
  savedCount,
  trackedCount,
  isPremium,
  onNavigate,
}) {
  const featured = opportunities
    .filter((opportunity) => (opportunity.activityType || '').toLowerCase() !== 'opportunity directory')
    .slice(0, 3)

  const steps = [
    { number: '01', eyebrow: 'DISCOVER', title: 'Find your next opportunity', text: 'Search a growing catalogue of academic, creative, career and international experiences.', action: 'Explore opportunities', page: 'Discover' },
    { number: '02', eyebrow: 'MATCH', title: 'Make it feel personal', text: 'Tell GrowthGrind what you enjoy and get a clearer starting point for what to explore next.', action: 'Build my match', page: 'Match' },
    { number: '03', eyebrow: 'BUILD', title: 'Turn activity into evidence', text: 'Save what interests you, track what you did and build a stronger story for applications.', action: isPremium ? 'Open my tracker' : 'See Premium tools', page: isPremium ? 'Track' : 'Premium' },
  ]

  return (
    <main className="home-page">
      <section className="home-hero">
        <div className="home-hero-copy">
          <span className="home-kicker">YOUR NEXT STEP, MADE CLEARER</span>
          <h1>Make your future<br /><em>feel possible.</em></h1>
          <p>GrowthGrind helps students find meaningful opportunities, build real evidence and make stronger university and career decisions.</p>
          <div className="home-hero-actions">
            <button className="home-primary" onClick={() => onNavigate('Match')}>Find my direction <span>→</span></button>
            <button className="home-secondary" onClick={() => onNavigate('Discover')}>Explore opportunities</button>
          </div>
          <div className="home-trust-row">
            <span><b>{opportunitiesLoading ? '…' : opportunities.length.toLocaleString()}</b> live opportunities</span>
            <span><b>{closingSoon.length}</b> closing soon</span>
            <span><b>Free</b> to start</span>
          </div>
        </div>

        <aside className="home-hero-panel" aria-label="Your GrowthGrind journey">
          <div className="home-panel-top"><span>YOUR GROWTH PATH</span><i>● LIVE</i></div>
          <div className="home-path">
            <div><b>01</b><span>Discover</span><small>Find an experience worth pursuing</small></div>
            <div><b>02</b><span>Build</span><small>Turn curiosity into real evidence</small></div>
            <div><b>03</b><span>Apply</span><small>Make confident next decisions</small></div>
          </div>
          <div className="home-panel-footer">
            <div><strong>{savedCount}</strong><span>saved</span></div>
            <div><strong>{trackedCount}</strong><span>tracked</span></div>
            <button onClick={() => onNavigate('Track')}>{isPremium ? 'View progress' : 'Unlock tracking'} →</button>
          </div>
        </aside>
      </section>

      <section className="home-steps-section">
        <div className="home-section-heading">
          <span className="home-kicker">ONE PLACE. A BETTER PLAN.</span>
          <h2>Start where you are.<br />Build from there.</h2>
        </div>
        <div className="home-steps-grid">
          {steps.map((step) => (
            <article className="home-step" key={step.number}>
              <span>{step.number}</span>
              <small>{step.eyebrow}</small>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <button onClick={() => onNavigate(step.page)}>{step.action} <b>→</b></button>
            </article>
          ))}
        </div>
      </section>

      <section className="home-opportunities-section">
        <div className="home-section-heading home-opportunities-heading">
          <div><span className="home-kicker">FRESH THINGS TO EXPLORE</span><h2>Don’t miss your next move.</h2></div>
          <button className="home-secondary" onClick={() => onNavigate('Discover')}>View all opportunities →</button>
        </div>
        <div className="home-preview-grid">
          {opportunitiesLoading ? [1, 2, 3].map((number) => <div className="home-preview-card home-preview-loading" key={number} />) : featured.map((opportunity) => (
            <article className="home-preview-card" key={opportunity.id}>
              <span>{opportunity.category || 'OPPORTUNITY'}</span>
              <h3>{opportunity.title}</h3>
              <p>{opportunity.organisation || 'GrowthGrind opportunity'}</p>
              <div><small>{opportunity.format || 'Details available'}</small><small>{opportunity.deadline || 'Deadline to check'}</small></div>
              <button onClick={() => onNavigate('Discover')}>Explore <b>↗</b></button>
            </article>
          ))}
        </div>
      </section>

      <section className="home-premium-banner">
        <div><span className="home-kicker">GO FURTHER WITH PREMIUM</span><h2>Every great application<br />has a story behind it.</h2></div>
        <div><p>Use specialist workspaces for your personal statement, university choices, admissions tests, interview practice and more.</p><button className="home-primary" onClick={() => onNavigate('Premium')}>{isPremium ? 'Open Premium workspace' : 'Explore Premium'} <span>→</span></button></div>
      </section>
    </main>
  )
}
