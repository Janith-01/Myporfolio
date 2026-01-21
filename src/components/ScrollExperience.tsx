import { useRef, useEffect, useMemo, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { allPlanets, identity, type ProjectPlanet as PlanetConfig } from '../data/portfolioConfig'
import Stars from './Stars'
import './ScrollExperience.css'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

// Section waypoints for zig-zag pattern (8 sections as specified)
const sections = [
    { id: 'sun', name: 'Welcome', camera: [0, 0, 12], lookAt: [-3, 0, 0], planetSide: 'left', textSide: 'right' },
    { id: 'mercury', name: 'Mercury', camera: [0, -15, 18], lookAt: [4, -15, 0], planetSide: 'right', textSide: 'left' },
    { id: 'venus', name: 'Venus', camera: [0, -30, 16], lookAt: [-4, -30, 0], planetSide: 'left', textSide: 'right' },
    { id: 'earth', name: 'Earth', camera: [0, -45, 20], lookAt: [5, -45, 0], planetSide: 'right', textSide: 'left' },
    { id: 'mars', name: 'Mars', camera: [0, -60, 18], lookAt: [-4, -60, 0], planetSide: 'left', textSide: 'right' },
    { id: 'jupiter', name: 'Jupiter', camera: [0, -75, 28], lookAt: [7, -75, 0], planetSide: 'right', textSide: 'left' }, // Larger view for LAWNOVA
    { id: 'saturn', name: 'Saturn', camera: [0, -95, 24], lookAt: [-6, -95, 0], planetSide: 'left', textSide: 'right' },
    { id: 'neptune', name: 'Neptune', camera: [0, -115, 20], lookAt: [5, -115, 0], planetSide: 'right', textSide: 'left' },
] as const

// Camera controller with lerp movement
interface CameraRigProps {
    scrollProgress: { value: number }
}

const CameraRig: React.FC<CameraRigProps> = ({ scrollProgress }) => {
    const { camera } = useThree()
    const currentLookAt = useRef(new THREE.Vector3(...sections[0].lookAt))

    useFrame(() => {
        const progress = scrollProgress.value
        const totalSections = sections.length - 1
        const sectionProgress = progress * totalSections
        const currentIndex = Math.floor(sectionProgress)
        const nextIndex = Math.min(currentIndex + 1, totalSections)
        const t = sectionProgress - currentIndex

        const currentSection = sections[currentIndex]
        const nextSection = sections[nextIndex]

        // Lerp camera position
        const targetX = THREE.MathUtils.lerp(currentSection.camera[0], nextSection.camera[0], t)
        const targetY = THREE.MathUtils.lerp(currentSection.camera[1], nextSection.camera[1], t)
        const targetZ = THREE.MathUtils.lerp(currentSection.camera[2], nextSection.camera[2], t)

        camera.position.x += (targetX - camera.position.x) * 0.1
        camera.position.y += (targetY - camera.position.y) * 0.1
        camera.position.z += (targetZ - camera.position.z) * 0.1

        // Lerp lookAt target
        const targetLookAtX = THREE.MathUtils.lerp(currentSection.lookAt[0], nextSection.lookAt[0], t)
        const targetLookAtY = THREE.MathUtils.lerp(currentSection.lookAt[1], nextSection.lookAt[1], t)
        const targetLookAtZ = THREE.MathUtils.lerp(currentSection.lookAt[2], nextSection.lookAt[2], t)

        currentLookAt.current.x += (targetLookAtX - currentLookAt.current.x) * 0.1
        currentLookAt.current.y += (targetLookAtY - currentLookAt.current.y) * 0.1
        currentLookAt.current.z += (targetLookAtZ - currentLookAt.current.z) * 0.1

        camera.lookAt(currentLookAt.current)
    })

    return null
}

// Sun component
const Sun: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const sunRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)

    const coronaGeometry = useMemo(() => {
        const positions = new Float32Array(1500 * 3)
        const colors = new Float32Array(1500 * 3)
        for (let i = 0; i < 1500; i++) {
            const angle = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const radius = 1.2 + Math.random() * 0.6
            positions[i * 3] = Math.sin(phi) * Math.cos(angle) * radius
            positions[i * 3 + 1] = Math.sin(phi) * Math.sin(angle) * radius
            positions[i * 3 + 2] = Math.cos(phi) * radius
            colors[i * 3] = 1
            colors[i * 3 + 1] = 0.6 + Math.random() * 0.3
            colors[i * 3 + 2] = 0.2
        }
        return { positions, colors }
    }, [])

    useFrame((state) => {
        if (sunRef.current) sunRef.current.rotation.y = state.clock.elapsedTime * 0.05
        if (glowRef.current) {
            const scale = 1 + Math.sin(state.clock.elapsedTime * 2) * 0.03
            glowRef.current.scale.set(scale, scale, scale)
        }
    })

    return (
        <group position={position}>
            <mesh ref={sunRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial color="#ffa500" emissive="#ff6600" emissiveIntensity={2} />
            </mesh>
            <mesh ref={glowRef}>
                <sphereGeometry args={[1.3, 32, 32]} />
                <meshBasicMaterial color="#ffaa00" transparent opacity={0.25} side={THREE.BackSide} />
            </mesh>
            <points>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[coronaGeometry.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[coronaGeometry.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.025} vertexColors transparent opacity={0.8} blending={THREE.AdditiveBlending} />
            </points>
            <pointLight color="#ffd500" intensity={80} distance={50} decay={2} />
        </group>
    )
}

// Planet component
interface PlanetProps {
    config: PlanetConfig
    position: [number, number, number]
    isJupiter?: boolean // Make Jupiter larger for LAWNOVA
}

const Planet: React.FC<PlanetProps> = ({ config, position, isJupiter = false }) => {
    const planetRef = useRef<THREE.Mesh>(null)
    const ringsRef = useRef<THREE.Mesh>(null)
    const ringsRef2 = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        if (planetRef.current) {
            planetRef.current.rotation.y = state.clock.elapsedTime * 0.1 * config.orbitSpeed
        }
        // Animate Saturn's rings - rotating continuously
        if (ringsRef.current) {
            ringsRef.current.rotation.z = state.clock.elapsedTime * 0.15
        }
        if (ringsRef2.current) {
            ringsRef2.current.rotation.z = -state.clock.elapsedTime * 0.08
        }
    })

    // Jupiter (LAWNOVA) is 1.5x larger to represent complexity
    const sizeMultiplier = isJupiter ? 6 : 4
    const size = config.size * sizeMultiplier

    return (
        <group position={position}>
            <mesh ref={planetRef}>
                <sphereGeometry args={[size, 64, 64]} />
                <meshStandardMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={isJupiter ? 0.5 : 0.3}
                    roughness={0.6}
                />
            </mesh>
            {/* Glow effect */}
            <mesh>
                <sphereGeometry args={[size * 1.12, 32, 32]} />
                <meshBasicMaterial color={config.color} transparent opacity={0.15} side={THREE.BackSide} />
            </mesh>
            {/* Saturn's animated rings */}
            {config.hasRings && (
                <>
                    <mesh ref={ringsRef} rotation={[Math.PI / 2 + (config.tilt || 0), 0, 0]}>
                        <ringGeometry args={[size * 1.4, size * 1.8, 64]} />
                        <meshBasicMaterial color={config.ringColor || '#c9b896'} transparent opacity={0.7} side={THREE.DoubleSide} />
                    </mesh>
                    <mesh ref={ringsRef2} rotation={[Math.PI / 2 + (config.tilt || 0) + 0.05, 0, 0]}>
                        <ringGeometry args={[size * 1.9, size * 2.3, 64]} />
                        <meshBasicMaterial color={config.ringColor || '#a89060'} transparent opacity={0.4} side={THREE.DoubleSide} />
                    </mesh>
                </>
            )}
            {/* Jupiter's Great Red Spot indicator */}
            {isJupiter && (
                <pointLight color="#ff6b35" intensity={20} distance={15} decay={2} />
            )}
        </group>
    )
}

// All celestial bodies
const CelestialBodies: React.FC = () => {
    return (
        <group>
            <ambientLight intensity={0.04} />

            {/* Sun at first section */}
            <Sun position={[-3, 0, 0]} />

            {/* Planets at their section positions */}
            {sections.slice(1).map((section) => {
                const planet = allPlanets.find(p => p.id === section.id)
                if (!planet) return null
                const isJupiter = section.id === 'jupiter'
                // Jupiter needs more offset due to larger size
                const xPos = section.planetSide === 'left' ? -5 : (isJupiter ? 6 : 5)
                const yPos = section.lookAt[1]
                return (
                    <Planet
                        key={section.id}
                        config={planet}
                        position={[xPos, yPos, 0]}
                        isJupiter={isJupiter}
                    />
                )
            })}

            {/* Starfield */}
            <Stars count={3000} radius={150} />
        </group>
    )
}

// Three.js Scene
interface SceneProps {
    scrollProgress: { value: number }
}

const Scene: React.FC<SceneProps> = ({ scrollProgress }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={sections[0].camera} fov={60} near={0.1} far={300} />
            <CameraRig scrollProgress={scrollProgress} />
            <CelestialBodies />
            <fog attach="fog" args={['#000010', 50, 180]} />
        </>
    )
}

// Main ScrollExperience component
const ScrollExperience: React.FC = () => {
    const containerRef = useRef<HTMLDivElement>(null)
    const scrollProgress = useRef({ value: 0 })
    const activeSectionRef = useRef(0)
    const [activeSection, setActiveSection] = useState(0)

    useEffect(() => {
        const container = containerRef.current
        if (!container) return

        // Create ScrollTrigger
        const trigger = ScrollTrigger.create({
            trigger: container,
            start: 'top top',
            end: 'bottom bottom',
            scrub: 1,
            onUpdate: (self) => {
                scrollProgress.current.value = self.progress
                const newSection = Math.min(
                    Math.floor(self.progress * sections.length),
                    sections.length - 1
                )
                if (newSection !== activeSectionRef.current) {
                    activeSectionRef.current = newSection
                    setActiveSection(newSection)
                }
            },
        })

        // Animate text sections
        sections.forEach((section, index) => {
            const element = document.getElementById(`section-text-${section.id}`)
            if (element) {
                gsap.fromTo(element,
                    { opacity: 0, x: section.textSide === 'left' ? -50 : 50 },
                    {
                        opacity: 1,
                        x: 0,
                        scrollTrigger: {
                            trigger: container,
                            start: `${(index / sections.length) * 100}% top`,
                            end: `${((index + 0.5) / sections.length) * 100}% top`,
                            scrub: true,
                        },
                    }
                )
                gsap.to(element, {
                    opacity: 0,
                    x: section.textSide === 'left' ? -30 : 30,
                    scrollTrigger: {
                        trigger: container,
                        start: `${((index + 0.7) / sections.length) * 100}% top`,
                        end: `${((index + 1) / sections.length) * 100}% top`,
                        scrub: true,
                    },
                })
            }
        })

        return () => {
            trigger.kill()
            ScrollTrigger.getAll().forEach(t => t.kill())
        }
    }, [])

    return (
        <div ref={containerRef} className="scroll-experience">
            {/* Fixed 3D Canvas */}
            <div className="canvas-container">
                <Canvas dpr={[1, 2]} gl={{ antialias: true, alpha: true }}>
                    <Scene scrollProgress={scrollProgress.current} />
                </Canvas>
            </div>

            {/* Scroll sections for height */}
            <div className="scroll-sections">
                {sections.map((section) => (
                    <section key={section.id} className="scroll-section" />
                ))}
            </div>

            {/* Text overlays */}
            <div className="text-overlays">
                {sections.map((section, index) => {
                    const planet = allPlanets.find(p => p.id === section.id)
                    const isSun = section.id === 'sun'

                    return (
                        <div
                            key={section.id}
                            id={`section-text-${section.id}`}
                            className={`text-section ${section.textSide}`}
                            style={{ opacity: index === 0 ? 1 : 0 }}
                        >
                            {isSun ? (
                                <div className="hero-content">
                                    <span className="badge">✨ Full Stack & AI Overview</span>
                                    <h1>
                                        <span className="greeting">Hello, I'm</span>
                                        <span className="name">{identity.name}</span>
                                    </h1>
                                    <div className="roles">
                                        <span className="role primary">AI Engineer</span>
                                        <span className="divider">•</span>
                                        <span className="role secondary">Full Stack Developer</span>
                                    </div>
                                    <p className="tagline">
                                        Crafting intelligent AI systems and scalable full-stack solutions
                                        that transform ideas into impactful digital experiences.
                                    </p>
                                    <div className="scroll-hint">
                                        <span className="arrow">↓</span>
                                        <span>Scroll to explore my projects</span>
                                    </div>
                                </div>
                            ) : planet ? (
                                <div className="project-content">
                                    <span className="planet-badge" style={{ borderColor: planet.color, backgroundColor: `${planet.color}20` }}>
                                        <span className="dot" style={{ backgroundColor: planet.color }} />
                                        {planet.name}
                                    </span>
                                    <h2>{planet.projectName}</h2>
                                    <p>{planet.description}</p>
                                    <div className="tech-stack">
                                        {planet.techStack.map(tech => (
                                            <span key={tech} className="tech">{tech}</span>
                                        ))}
                                    </div>
                                    {planet.moons && planet.moons.length > 0 && (
                                        <div className="features">
                                            <h4>Key Features</h4>
                                            {planet.moons.slice(0, 3).map(moon => (
                                                <div key={moon.name} className="feature">
                                                    <span>🌙</span> {moon.name}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                    <div className="links">
                                        {planet.githubUrl && (
                                            <a href={planet.githubUrl} target="_blank" rel="noopener noreferrer" className="btn github">
                                                GitHub
                                            </a>
                                        )}
                                        {planet.liveUrl && (
                                            <a href={planet.liveUrl} target="_blank" rel="noopener noreferrer" className="btn live">
                                                Live Demo
                                            </a>
                                        )}
                                    </div>
                                </div>
                            ) : null}
                        </div>
                    )
                })}
            </div>

            {/* Progress indicator */}
            <div className="progress-indicator">
                {sections.map((section, index) => (
                    <button
                        key={section.id}
                        className={`dot ${index === activeSection ? 'active' : ''}`}
                        onClick={() => {
                            const scrollHeight = document.documentElement.scrollHeight - window.innerHeight
                            window.scrollTo({ top: (index / (sections.length - 1)) * scrollHeight, behavior: 'smooth' })
                        }}
                        aria-label={section.name}
                    />
                ))}
            </div>
        </div>
    )
}

export default ScrollExperience
