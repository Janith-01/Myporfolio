import { useState, useEffect, useCallback } from 'react'
import ScrollScene from './components/ScrollScene'
import ScrollSections from './components/ScrollSections'
import { sectionWaypoints, type SectionWaypoint } from './components/ScrollCameraController'
import './ScrollApp.css'

function ScrollApp() {
    const [scrollProgress, setScrollProgress] = useState(0)
    const [activeSection, setActiveSection] = useState(0)


    // Calculate scroll progress (0 to 1) and derive active section
    const handleScroll = useCallback(() => {
        const scrollTop = window.scrollY
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight

        // Prevent division by zero
        if (scrollHeight <= 0) return

        const progress = Math.min(1, Math.max(0, scrollTop / scrollHeight))
        setScrollProgress(progress)

        // Calculate active section from progress
        const totalSections = sectionWaypoints.length
        const sectionIndex = Math.min(
            Math.floor(progress * totalSections),
            totalSections - 1
        )
        setActiveSection(sectionIndex)
    }, [])

    // Handle section changes from the camera controller (optional, for external updates)
    const handleSectionChange = useCallback((_sectionIndex: number, _section: SectionWaypoint) => {
        // Section changes are now primarily driven by scroll handler
        // This can be used for any additional side effects
    }, [])

    // Scroll to a specific section
    const scrollToSection = useCallback((sectionIndex: number) => {
        const totalSections = sectionWaypoints.length
        const sectionProgress = sectionIndex / (totalSections - 1)
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
        const targetScroll = sectionProgress * scrollHeight

        window.scrollTo({
            top: targetScroll,
            behavior: 'smooth'
        })
    }, [])

    // Attach scroll listener
    useEffect(() => {
        window.addEventListener('scroll', handleScroll, { passive: true })
        handleScroll() // Initial call
        return () => window.removeEventListener('scroll', handleScroll)
    }, [handleScroll])

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'ArrowDown' || e.key === ' ') {
                if (activeSection < sectionWaypoints.length - 1) {
                    e.preventDefault()
                    scrollToSection(activeSection + 1)
                }
            } else if (e.key === 'ArrowUp') {
                if (activeSection > 0) {
                    e.preventDefault()
                    scrollToSection(activeSection - 1)
                }
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [activeSection, scrollToSection])

    return (
        <div className="scroll-app">
            {/* Fixed 3D Scene */}
            <div className="scroll-scene-container">
                <ScrollScene
                    scrollProgress={scrollProgress}
                    activeSection={activeSection}
                    onSectionChange={handleSectionChange}
                />
            </div>

            {/* Scroll Area - Creates the scroll height */}
            <div className="scroll-area">
                {sectionWaypoints.map((waypoint) => (
                    <div
                        key={waypoint.id}
                        className="scroll-section-trigger"
                        id={`section-${waypoint.id}`}
                    />
                ))}
            </div>

            {/* Text Content Sections */}
            <ScrollSections activeSection={activeSection} />

            {/* Progress Indicator */}
            <div className="scroll-progress">
                {sectionWaypoints.map((waypoint, index) => (
                    <button
                        key={waypoint.id}
                        className={`progress-dot ${index === activeSection ? 'active' : ''}`}
                        onClick={() => scrollToSection(index)}
                        data-label={waypoint.name}
                        aria-label={`Go to ${waypoint.name}`}
                    />
                ))}
            </div>

            {/* Bottom Navigation Dots */}
            <div className="section-nav">
                {sectionWaypoints.map((waypoint, index) => (
                    <button
                        key={waypoint.id}
                        className={`nav-dot ${index === activeSection ? 'active' : ''}`}
                        onClick={() => scrollToSection(index)}
                        aria-label={`Go to ${waypoint.name}`}
                    />
                ))}
            </div>
        </div>
    )
}

export default ScrollApp
