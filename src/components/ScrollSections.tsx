import React from 'react'
import { sectionWaypoints } from './ScrollCameraController'
import { allPlanets } from '../data/portfolioConfig'
import { identity } from '../data/portfolioConfig'

interface ScrollSectionProps {
    sectionIndex: number
    activeSection: number
}

const ScrollSection: React.FC<ScrollSectionProps> = ({ sectionIndex, activeSection }) => {
    const waypoint = sectionWaypoints[sectionIndex]
    const isActive = sectionIndex === activeSection

    // Get planet data for this section
    const planet = allPlanets.find(p => p.id === waypoint.id)
    const isSunSection = waypoint.id === 'sun'

    // Determine animation state
    const getAnimationClass = () => {
        if (isActive) return 'section-active'
        if (sectionIndex < activeSection) return 'section-passed'
        return 'section-upcoming'
    }

    // Only render content if active (or near active for transitions)
    // We use CSS to handle the fade effect
    return (
        <div
            className={`scroll-section ${getAnimationClass()}`}
            style={{
                opacity: isActive ? 1 : 0,
                visibility: isActive ? 'visible' : 'hidden',
                transition: 'opacity 0.4s ease-out, visibility 0.4s ease-out',
            }}
        >
            <div className={`section-content ${waypoint.textPosition === 'left' ? 'content-left' : 'content-right'}`}>
                {isSunSection ? (
                    // Sun/Welcome section - Hero content
                    <div className="hero-section">
                        <div className="hero-badge">
                            <span className="badge-glow"></span>
                            <span>✨ Welcome to my Universe</span>
                        </div>
                        <h1 className="hero-title">
                            <span className="title-greeting">Hello, I'm</span>
                            <span className="title-name">{identity.name}</span>
                        </h1>
                        <div className="hero-roles">
                            <span className="role-tag primary">AI Engineer</span>
                            <span className="role-divider">•</span>
                            <span className="role-tag secondary">Full Stack Developer</span>
                        </div>
                        <p className="hero-description">
                            Building intelligent systems and beautiful interfaces
                            that push the boundaries of technology.
                        </p>
                        <div className="hero-cta">
                            <div className="scroll-prompt">
                                <div className="scroll-icon">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                        <path d="M12 5v14M19 12l-7 7-7-7" />
                                    </svg>
                                </div>
                                <span>Scroll to explore my projects</span>
                            </div>
                        </div>
                    </div>
                ) : planet ? (
                    // Planet/Project section
                    <div className="project-section">
                        <div className="planet-badge" style={{ backgroundColor: planet.color + '20', borderColor: planet.color }}>
                            <span className="planet-dot" style={{ backgroundColor: planet.color }}></span>
                            <span className="planet-label">{planet.name}</span>
                        </div>
                        <h2 className="project-name">{planet.projectName}</h2>
                        <p className="project-desc">{planet.description}</p>
                        <div className="tech-stack">
                            {planet.techStack.map((tech) => (
                                <span key={tech} className="tech-chip">{tech}</span>
                            ))}
                        </div>
                        {planet.moons && planet.moons.length > 0 && (
                            <div className="features-preview">
                                <h4 className="features-title">Key Features</h4>
                                <div className="features-list">
                                    {planet.moons.slice(0, 3).map((moon) => (
                                        <div key={moon.name} className="feature-item">
                                            <span className="feature-icon">🌙</span>
                                            <span className="feature-name">{moon.name}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                        <div className="project-links">
                            {planet.githubUrl && (
                                <a href={planet.githubUrl} target="_blank" rel="noopener noreferrer" className="link-btn github">
                                    <svg viewBox="0 0 24 24" fill="currentColor" width="18" height="18">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                    GitHub
                                </a>
                            )}
                            {planet.liveUrl && (
                                <a href={planet.liveUrl} target="_blank" rel="noopener noreferrer" className="link-btn live">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="18" height="18">
                                        <circle cx="12" cy="12" r="10" />
                                        <line x1="2" y1="12" x2="22" y2="12" />
                                        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                                    </svg>
                                    Live Demo
                                </a>
                            )}
                        </div>
                    </div>
                ) : null}
            </div>
        </div>
    )
}

interface ScrollSectionsProps {
    activeSection: number
}

const ScrollSections: React.FC<ScrollSectionsProps> = ({ activeSection }) => {
    return (
        <div className="scroll-sections-container">
            {sectionWaypoints.map((_, index) => (
                <ScrollSection
                    key={index}
                    sectionIndex={index}
                    activeSection={activeSection}
                />
            ))}
        </div>
    )
}

export default ScrollSections
