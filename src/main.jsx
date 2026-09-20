import { Component, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'

class AppErrorBoundary extends Component {
  state = { hasError: false }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (this.state.hasError) {
      return (
        <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: '24px', background: '#f5efe5', color: '#294b35' }}>
          <section style={{ maxWidth: '540px', padding: '32px', borderRadius: '18px', background: '#fffaf2', border: '1px solid #d0c4b0', textAlign: 'center' }}>
            <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>GROWTHGRIND</span>
            <h1>Something needs a quick refresh.</h1>
            <p>Your saved work is still stored in your account. Refresh the page to carry on.</p>
            <button onClick={() => window.location.reload()} style={{ border: 0, borderRadius: '9px', padding: '12px 18px', background: '#315b3d', color: '#fffaf2', font: 'inherit', fontWeight: 800, cursor: 'pointer' }}>Refresh GrowthGrind</button>
          </section>
        </main>
      )
    }

    return this.props.children
  }
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
