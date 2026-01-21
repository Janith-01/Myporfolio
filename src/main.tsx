import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
// Switch between different app modes:
// import App from './App.tsx'                           // Click-to-zoom mode
// import ScrollApp from './ScrollApp.tsx'               // Basic scroll mode
// import ScrollExperience from './components/ScrollExperience' // GSAP mode
import ScrollExperienceAdvanced from './components/ScrollExperienceAdvanced' // Advanced with Framer Motion

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ScrollExperienceAdvanced />
  </StrictMode>,
)
