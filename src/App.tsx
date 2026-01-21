import { useState, useEffect, useCallback } from 'react'
import * as THREE from 'three'
import Scene from './components/Scene'
import { type ProjectPlanet } from './data/portfolioConfig'
import './App.css'

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ProjectPlanet | null>(null)
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null)

  // Handle planet selection with position for camera zoom
  const handlePlanetSelect = useCallback((planet: ProjectPlanet | null, position?: THREE.Vector3) => {
    setSelectedPlanet(planet)
    if (planet && position) {
      setCameraTarget(position.clone())
    } else {
      setCameraTarget(null)
    }
  }, [])

  // Handle keyboard events (Escape to close panel and zoom out)
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape' && selectedPlanet) {
      setSelectedPlanet(null)
      setCameraTarget(null)
    }
  }, [selectedPlanet])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  // Close panel when clicking outside
  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if ((e.target as HTMLElement).classList.contains('project-panel')) {
      setSelectedPlanet(null)
      setCameraTarget(null)
    }
  }, [])

  return (
    <div className="app">
      {/* 3D Solar System Scene */}
      <div className="scene-container">
        <Scene
          onPlanetSelect={handlePlanetSelect}
          selectedPlanet={selectedPlanet}
          cameraTarget={cameraTarget}
        />
      </div>

      {/* Overlay Content */}
      <div className="overlay">
        <header className="hero">
          <div className="hero-content">
            <p className="greeting">Hi, it's me</p>
            <h1 className="name">
              <span className="first-name">Janith</span>
              <span className="last-name">Viranga</span>
            </h1>
            <div className="title-wrapper">
              <span className="title">AI Engineer</span>
              <span className="divider">•</span>
              <span className="title">Full Stack Developer</span>
            </div>
            <p className="tagline">
              Building intelligent systems and beautiful interfaces
              <br />
              that push the boundaries of technology.
            </p>
            <div className="cta-buttons">
              <a href="#projects" className="btn btn-primary">
                <span>Explore Projects</span>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7" />
                </svg>
              </a>
              <a href="mailto:janith@example.com" className="btn btn-secondary">
                <span>Contact Me</span>
              </a>
            </div>
          </div>
        </header>

        {/* Scroll indicator */}
        <div className="scroll-indicator">
          <div className="mouse">
            <div className="wheel"></div>
          </div>
          <p>Scroll to explore</p>
        </div>

        {/* Project info panel */}
        {selectedPlanet && (
          <div className="project-panel" onClick={handleOverlayClick}>
            <div className="project-panel-content">
              <button
                className="panel-close"
                onClick={() => {
                  setSelectedPlanet(null)
                  setCameraTarget(null)
                }}
              >
                ×
              </button>
              <div className="planet-indicator">
                <span className="planet-icon" style={{ backgroundColor: selectedPlanet.color }}></span>
                <span className="planet-type">{selectedPlanet.name}</span>
              </div>
              <h2 className="project-title">{selectedPlanet.projectName}</h2>
              <p className="project-description">{selectedPlanet.description}</p>
              <div className="project-tech-stack">
                {selectedPlanet.techStack.map((tech) => (
                  <span key={tech} className="tech-tag">{tech}</span>
                ))}
              </div>
              {selectedPlanet.moons && (
                <div className="project-features">
                  <h4>Key Features</h4>
                  <div className="feature-list">
                    {selectedPlanet.moons.map((moon) => (
                      <div key={moon.name} className="feature-item">
                        <span className="feature-icon">🌙</span>
                        <div>
                          <strong>{moon.name}</strong>
                          <p>{moon.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className="project-links">
                {selectedPlanet.githubUrl && (
                  <a
                    href={selectedPlanet.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-primary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                    </svg>
                    View on GitHub
                  </a>
                )}
                {selectedPlanet.liveUrl && (
                  <a
                    href={selectedPlanet.liveUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-secondary"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <circle cx="12" cy="12" r="10" />
                      <line x1="2" y1="12" x2="22" y2="12" />
                      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                    </svg>
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Floating hint for interaction */}
      <div className="interaction-hint">
        <span>🌞</span> Hover over the Sun or click on planets to explore
      </div>

      {/* Legend */}
      <div className="legend">
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ff9800' }}></span>
          <span>Inner Planets (Mobile & Web)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#ffa500' }}></span>
          <span>Gas Giants (AI & Real-time)</span>
        </div>
        <div className="legend-item">
          <span className="legend-color" style={{ backgroundColor: '#00bfff' }}></span>
          <span>Ice Giants (Specialized)</span>
        </div>
      </div>
    </div>
  )
}

export default App
