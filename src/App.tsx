import { useState, useEffect, useCallback, useRef } from 'react'
import * as THREE from 'three'
import Scene from './components/Scene'
import { type ProjectPlanet } from './data/portfolioConfig'
import './App.css'

// Skills data
const skills = [
  { name: 'React', icon: '⚛️', color: '#61DAFB' },
  { name: 'Python', icon: '🐍', color: '#3776AB' },
  { name: 'TypeScript', icon: '📘', color: '#3178C6' },
  { name: 'Node.js', icon: '🟢', color: '#339933' },
  { name: 'TensorFlow', icon: '🧠', color: '#FF6F00' },
  { name: 'MongoDB', icon: '🍃', color: '#47A248' },
  { name: 'Three.js', icon: '🎨', color: '#000000' },
  { name: 'AWS', icon: '☁️', color: '#FF9900' },
]

// Experience data
const experiences = [
  {
    id: 1,
    type: 'work',
    title: 'AI Engineer Intern',
    company: 'Tech Solutions Ltd',
    period: '2025 - Present',
    description: 'Developing machine learning models and AI-powered applications using Python, TensorFlow, and cloud services.',
    icon: '💼',
  },
  {
    id: 2,
    type: 'education',
    title: 'BSc in Software Engineering',
    company: 'University of Colombo',
    period: '2022 - 2026',
    description: 'Pursuing a degree in Software Engineering with focus on AI and Full Stack Development.',
    icon: '🎓',
  },
  {
    id: 3,
    type: 'project',
    title: 'Freelance Developer',
    company: 'Self-employed',
    period: '2023 - Present',
    description: 'Building custom web applications and AI solutions for clients worldwide.',
    icon: '🚀',
  },
]

// Achievements data
const achievements = [
  {
    id: 1,
    title: 'Hackathon Winner',
    event: 'TechFest 2025',
    description: 'First place in AI/ML category for developing an innovative healthcare solution.',
    icon: '🏆',
  },
  {
    id: 2,
    title: 'AWS Certified',
    event: 'Cloud Practitioner',
    description: 'Certified AWS Cloud Practitioner with expertise in cloud architecture.',
    icon: '☁️',
  },
  {
    id: 3,
    title: 'Open Source Contributor',
    event: 'GitHub',
    description: 'Active contributor to popular open-source projects with 500+ contributions.',
    icon: '⭐',
  },
]

// Featured projects for the Work section
const featuredProjects = [
  {
    id: 1,
    title: 'AI Legal Assistant',
    description: 'An intelligent legal research platform powered by NLP and machine learning, helping lawyers analyze cases and find relevant precedents.',
    tech: ['React', 'Python', 'TensorFlow', 'MongoDB'],
    image: '/project-1.png',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  },
  {
    id: 2,
    title: 'Real-time Collaboration Platform',
    description: 'A WebSocket-powered collaborative document editor with real-time sync, version control, and team management features.',
    tech: ['Next.js', 'Socket.io', 'PostgreSQL', 'Redis'],
    image: '/project-2.png',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  },
  {
    id: 3,
    title: 'Smart IoT Dashboard',
    description: 'A comprehensive IoT monitoring solution with real-time data visualization, alerts, and predictive maintenance using AI.',
    tech: ['React', 'Node.js', 'InfluxDB', 'MQTT'],
    image: '/project-3.png',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  },
]

function App() {
  const [selectedPlanet, setSelectedPlanet] = useState<ProjectPlanet | null>(null)
  const [cameraTarget, setCameraTarget] = useState<THREE.Vector3 | null>(null)
  const [activeSection, setActiveSection] = useState('hero')
  const [isNavVisible, setIsNavVisible] = useState(false)
  const [formData, setFormData] = useState({ name: '', email: '', message: '' })
  const [typingText, setTypingText] = useState('')
  const [typingIndex, setTypingIndex] = useState(0)

  const heroRef = useRef<HTMLElement>(null)
  const workRef = useRef<HTMLElement>(null)
  const experienceRef = useRef<HTMLElement>(null)
  const skillsRef = useRef<HTMLElement>(null)
  const achievementsRef = useRef<HTMLElement>(null)
  const contactRef = useRef<HTMLElement>(null)

  const typingTexts = ['Shaping Ideas', 'Building AI Systems', 'Creating Web Apps', 'Solving Problems']

  // Typing animation effect
  useEffect(() => {
    const currentText = typingTexts[typingIndex]
    let charIndex = 0
    let isDeleting = false

    const typeInterval = setInterval(() => {
      if (!isDeleting) {
        setTypingText(currentText.substring(0, charIndex + 1))
        charIndex++
        if (charIndex === currentText.length) {
          isDeleting = true
          setTimeout(() => { }, 2000)
        }
      } else {
        setTypingText(currentText.substring(0, charIndex - 1))
        charIndex--
        if (charIndex === 0) {
          isDeleting = false
          setTypingIndex((prev) => (prev + 1) % typingTexts.length)
          clearInterval(typeInterval)
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearInterval(typeInterval)
  }, [typingIndex])

  // Handle scroll to show/hide nav and track active section
  useEffect(() => {
    const handleScroll = () => {
      setIsNavVisible(window.scrollY > 100)

      const sections = [
        { ref: heroRef, id: 'hero' },
        { ref: workRef, id: 'work' },
        { ref: experienceRef, id: 'experience' },
        { ref: skillsRef, id: 'skills' },
        { ref: achievementsRef, id: 'achievements' },
        { ref: contactRef, id: 'contact' },
      ]

      for (const section of sections) {
        if (section.ref.current) {
          const rect = section.ref.current.getBoundingClientRect()
          if (rect.top <= 150 && rect.bottom >= 150) {
            setActiveSection(section.id)
            break
          }
        }
      }
    }

    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

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

  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
    // Add your form submission logic here
    alert('Message sent! (Demo)')
    setFormData({ name: '', email: '', message: '' })
  }

  // Scroll to section
  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="app-redesign">
      {/* Blue Glow Border Effect */}
      <div className="glow-border"></div>

      {/* Navigation */}
      <nav className={`nav ${isNavVisible ? 'nav--visible' : ''}`}>
        <div className="nav-logo">
          <span className="nav-logo-text">JV</span>
        </div>
        <ul className="nav-links">
          {['work', 'experience', 'skills', 'achievements'].map((section) => (
            <li key={section}>
              <button
                className={`nav-link ${activeSection === section ? 'nav-link--active' : ''}`}
                onClick={() => scrollToSection(section)}
              >
                {section.charAt(0).toUpperCase() + section.slice(1)}
              </button>
            </li>
          ))}
        </ul>
        <button className="nav-contact-btn" onClick={() => scrollToSection('contact')}>
          Contact me
        </button>
      </nav>

      {/* Hero Section with 3D Solar System */}
      <section id="hero" ref={heroRef} className="hero-section">
        <div className="hero-scene">
          <Scene
            onPlanetSelect={handlePlanetSelect}
            selectedPlanet={selectedPlanet}
            cameraTarget={cameraTarget}
          />
        </div>

        <div className="hero-overlay">
          <div className="hero-text">
            <h1 className="hero-title">
              <span className="typing-text">{typingText}</span>
              <span className="typing-cursor">|</span>
            </h1>
            <h2 className="hero-subtitle">Into Real Projects That Deliver Results</h2>
            <p className="hero-bio">
              Hi, I'm <strong>Janith Viranga</strong>, a passionate AI Engineer and Full Stack Developer
              from Sri Lanka. I transform innovative ideas into impactful digital solutions.
            </p>
            <button className="hero-cta" onClick={() => scrollToSection('work')}>
              <span>SEE MY WORK</span>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>

            <div className="hero-social">
              <a href="https://github.com/Janith-01" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                </svg>
              </a>
              <a href="https://linkedin.com/in/janith-viranga" target="_blank" rel="noopener noreferrer" className="social-link">
                <svg viewBox="0 0 24 24" fill="currentColor" width="24" height="24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="scroll-indicator">
          <div className="scroll-mouse">
            <div className="scroll-wheel"></div>
          </div>
          <span>Scroll to explore</span>
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
                  <a href={selectedPlanet.githubUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View on GitHub
                  </a>
                )}
                {selectedPlanet.liveUrl && (
                  <a href={selectedPlanet.liveUrl} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                    Live Demo
                  </a>
                )}
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Work Section */}
      <section id="work" ref={workRef} className="section work-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="section-label">Featured Projects</span>
            My Work
          </h2>

          <div className="projects-grid">
            {featuredProjects.map((project, index) => (
              <div key={project.id} className={`project-card ${index % 2 === 1 ? 'project-card--reverse' : ''}`}>
                <div className="project-image">
                  <img src={project.image} alt={project.title} />
                </div>
                <div className="project-info">
                  <h3 className="project-name">{project.title}</h3>
                  <p className="project-desc">{project.description}</p>
                  <div className="project-tech">
                    {project.tech.map((t) => (
                      <span key={t} className="tech-badge">{t}</span>
                    ))}
                  </div>
                  <a href="#" className="project-link">
                    View Project
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M5 12h14M12 5l7 7-7 7" />
                    </svg>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section id="experience" ref={experienceRef} className="section experience-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="section-label">My Journey</span>
            Experience
          </h2>

          <div className="timeline">
            {experiences.map((exp) => (
              <div key={exp.id} className="timeline-item">
                <div className="timeline-icon">{exp.icon}</div>
                <div className="timeline-content">
                  <span className="timeline-period">{exp.period}</span>
                  <h3 className="timeline-title">{exp.title}</h3>
                  <p className="timeline-company">{exp.company}</p>
                  <p className="timeline-desc">{exp.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Skills Section */}
      <section id="skills" ref={skillsRef} className="section skills-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="section-label">Technologies</span>
            How I Can Contribute & My Key Skills
          </h2>

          <div className="skills-grid">
            {skills.map((skill) => (
              <div key={skill.name} className="skill-card">
                <span className="skill-icon">{skill.icon}</span>
                <span className="skill-name">{skill.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements Section */}
      <section id="achievements" ref={achievementsRef} className="section achievements-section">
        <div className="section-container">
          <h2 className="section-title">
            <span className="section-label">Recognition</span>
            Achievements
          </h2>

          <div className="achievements-grid">
            {achievements.map((achievement) => (
              <div key={achievement.id} className="achievement-card">
                <span className="achievement-icon">{achievement.icon}</span>
                <h3 className="achievement-title">{achievement.title}</h3>
                <p className="achievement-event">{achievement.event}</p>
                <p className="achievement-desc">{achievement.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" ref={contactRef} className="section contact-section">
        <div className="section-container contact-container">
          <div className="contact-form-wrapper">
            <h2 className="section-title">
              <span className="section-label">Get in Touch</span>
              Let's Connect
            </h2>

            <form className="contact-form" onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="name">Your name</label>
                <input
                  type="text"
                  id="name"
                  placeholder="What's your good name?"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">Your Email</label>
                <input
                  type="email"
                  id="email"
                  placeholder="What's your email address?"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="message">Your Message</label>
                <textarea
                  id="message"
                  placeholder="How can I help you?"
                  rows={5}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  required
                ></textarea>
              </div>
              <button type="submit" className="submit-btn">
                SEND MESSAGE
              </button>
            </form>
          </div>

          <div className="contact-visual">
            <img src="/contact-workspace.png" alt="3D Workspace" className="contact-image" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <p className="footer-text">Terms & Conditions</p>
          <div className="footer-social">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>
            <a href="https://github.com/Janith-01" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
              </svg>
            </a>
            <a href="https://linkedin.com/in/janith-viranga" target="_blank" rel="noopener noreferrer" className="footer-link">
              <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
              </svg>
            </a>
          </div>
          <p className="footer-copyright">© 2026 Janith Viranga. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

export default App
