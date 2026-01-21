import { useRef, useMemo, useState, useEffect, useCallback } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera, useScroll, ScrollControls } from '@react-three/drei'
import * as THREE from 'three'
import { motion, AnimatePresence } from 'framer-motion'
import { allPlanets, identity, socialLinks, asteroidBeltSkills, type ProjectPlanet as PlanetConfig } from '../data/portfolioConfig'
import './ScrollExperienceAdvanced.css'

// Section waypoints for zig-zag camera path
const sections = [
    { id: 'sun', name: 'Welcome', position: [0, 0, 0], camera: [8, 2, 8], planetSide: 'left', textSide: 'right' },
    { id: 'mercury', name: 'Mercury', position: [15, -8, -5], camera: [8, -6, 12], planetSide: 'right', textSide: 'left' },
    { id: 'venus', name: 'Venus', position: [-12, -18, 3], camera: [-5, -16, 14], planetSide: 'left', textSide: 'right' },
    { id: 'earth', name: 'Earth', position: [14, -30, -2], camera: [6, -28, 15], planetSide: 'right', textSide: 'left' },
    { id: 'mars', name: 'Mars', position: [-10, -42, 4], camera: [-3, -40, 13], planetSide: 'left', textSide: 'right' },
    { id: 'jupiter', name: 'Jupiter', position: [18, -58, -4], camera: [8, -54, 22], planetSide: 'right', textSide: 'left' },
    { id: 'saturn', name: 'Saturn', position: [-14, -75, 2], camera: [-5, -72, 18], planetSide: 'left', textSide: 'right' },
    { id: 'neptune', name: 'Neptune', position: [12, -92, -3], camera: [5, -90, 14], planetSide: 'right', textSide: 'left' },
] as const

// Star Warp Effect - motion blur during fast camera movement
const StarWarp: React.FC<{ speed: number }> = ({ speed }) => {
    const pointsRef = useRef<THREE.Points>(null)
    const materialRef = useRef<THREE.PointsMaterial>(null)

    const positions = useMemo(() => {
        const count = 2000
        const positions = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 100
            positions[i * 3 + 1] = (Math.random() - 0.5) * 200
            positions[i * 3 + 2] = (Math.random() - 0.5) * 50 - 30
        }
        return positions
    }, [])

    useFrame(() => {
        if (materialRef.current) {
            // Increase star size and opacity based on scroll speed
            const warpIntensity = Math.min(speed * 3, 1)
            materialRef.current.size = 0.05 + warpIntensity * 0.3
            materialRef.current.opacity = 0.3 + warpIntensity * 0.5
        }
    })

    return (
        <points ref={pointsRef}>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
            </bufferGeometry>
            <pointsMaterial
                ref={materialRef}
                size={0.05}
                color="#ffffff"
                transparent
                opacity={0.3}
                sizeAttenuation
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

// Sun with corona effect
const Sun: React.FC<{ position: [number, number, number] }> = ({ position }) => {
    const sunRef = useRef<THREE.Mesh>(null)
    const coronaRef = useRef<THREE.Points>(null)

    const coronaGeometry = useMemo(() => {
        const positions = new Float32Array(2000 * 3)
        const colors = new Float32Array(2000 * 3)
        for (let i = 0; i < 2000; i++) {
            const theta = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const r = 1.3 + Math.random() * 0.8
            positions[i * 3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i * 3 + 2] = r * Math.cos(phi)
            colors[i * 3] = 1
            colors[i * 3 + 1] = 0.5 + Math.random() * 0.4
            colors[i * 3 + 2] = 0.1 + Math.random() * 0.2
        }
        return { positions, colors }
    }, [])

    useFrame((state) => {
        if (sunRef.current) {
            sunRef.current.rotation.y = state.clock.elapsedTime * 0.03
        }
        if (coronaRef.current) {
            coronaRef.current.rotation.y = state.clock.elapsedTime * 0.02
            coronaRef.current.rotation.z = state.clock.elapsedTime * 0.01
        }
    })

    return (
        <group position={position}>
            <mesh ref={sunRef}>
                <sphereGeometry args={[1.2, 64, 64]} />
                <meshStandardMaterial color="#ffa500" emissive="#ff6600" emissiveIntensity={2.5} />
            </mesh>
            {/* Inner glow */}
            <mesh>
                <sphereGeometry args={[1.5, 32, 32]} />
                <meshBasicMaterial color="#ffcc00" transparent opacity={0.2} side={THREE.BackSide} />
            </mesh>
            {/* Outer glow */}
            <mesh>
                <sphereGeometry args={[2.0, 32, 32]} />
                <meshBasicMaterial color="#ff8800" transparent opacity={0.08} side={THREE.BackSide} />
            </mesh>
            {/* Corona particles */}
            <points ref={coronaRef}>
                <bufferGeometry>
                    <bufferAttribute attach="attributes-position" args={[coronaGeometry.positions, 3]} />
                    <bufferAttribute attach="attributes-color" args={[coronaGeometry.colors, 3]} />
                </bufferGeometry>
                <pointsMaterial size={0.03} vertexColors transparent opacity={0.9} blending={THREE.AdditiveBlending} />
            </points>
            <pointLight color="#ffd500" intensity={100} distance={60} decay={2} />
        </group>
    )
}

// Enhanced Planet with Fresnel Rim Lighting and Atmospheric Effects
interface PlanetProps {
    config: PlanetConfig
    position: [number, number, number]
    isLawnova?: boolean
}

// Fresnel Atmosphere Shader - creates realistic rim lighting
const FresnelAtmosphere: React.FC<{
    radius: number
    color: string
    secondaryColor?: string
    intensity?: number
    power?: number
}> = ({ radius, color, secondaryColor, intensity = 1.0, power = 3.0 }) => {
    const meshRef = useRef<THREE.Mesh>(null)
    const { camera } = useThree()

    const atmosphereMaterial = useMemo(() => {
        return new THREE.ShaderMaterial({
            uniforms: {
                glowColor: { value: new THREE.Color(color) },
                secondaryColor: { value: new THREE.Color(secondaryColor || color) },
                viewVector: { value: new THREE.Vector3() },
                intensity: { value: intensity },
                power: { value: power },
                time: { value: 0 }
            },
            vertexShader: `
                uniform vec3 viewVector;
                varying float vIntensity;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                void main() {
                    vNormal = normalize(normalMatrix * normal);
                    vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
                    vViewPosition = -mvPosition.xyz;
                    
                    // Fresnel calculation - dot product between view direction and surface normal
                    vec3 viewDir = normalize(viewVector - position);
                    vIntensity = pow(1.0 - abs(dot(vNormal, normalize(vViewPosition))), 2.0);
                    
                    gl_Position = projectionMatrix * mvPosition;
                }
            `,
            fragmentShader: `
                uniform vec3 glowColor;
                uniform vec3 secondaryColor;
                uniform float intensity;
                uniform float power;
                uniform float time;
                varying float vIntensity;
                varying vec3 vNormal;
                varying vec3 vViewPosition;
                
                void main() {
                    // Enhanced Fresnel effect with power curve
                    float fresnel = pow(1.0 - abs(dot(normalize(vNormal), normalize(vViewPosition))), power);
                    
                    // Gradient between two colors based on fresnel
                    vec3 finalColor = mix(secondaryColor, glowColor, fresnel);
                    
                    // Pulsing effect for living atmosphere
                    float pulse = 0.85 + 0.15 * sin(time * 1.5);
                    
                    // Alpha based on fresnel intensity
                    float alpha = fresnel * intensity * pulse;
                    
                    gl_FragColor = vec4(finalColor, alpha);
                }
            `,
            transparent: true,
            side: THREE.BackSide,
            blending: THREE.AdditiveBlending,
            depthWrite: false
        })
    }, [color, secondaryColor, intensity, power])

    useFrame((state) => {
        if (meshRef.current && atmosphereMaterial.uniforms) {
            atmosphereMaterial.uniforms.viewVector.value = camera.position
            atmosphereMaterial.uniforms.time.value = state.clock.elapsedTime
        }
    })

    return (
        <mesh ref={meshRef} material={atmosphereMaterial}>
            <sphereGeometry args={[radius, 64, 64]} />
        </mesh>
    )
}

const Planet: React.FC<PlanetProps> = ({ config, position, isLawnova = false }) => {
    const groupRef = useRef<THREE.Group>(null)
    const planetRef = useRef<THREE.Mesh>(null)
    const ringsRef = useRef<THREE.Mesh>(null)
    const ringsRef2 = useRef<THREE.Mesh>(null)
    const moonRef = useRef<THREE.Mesh>(null)
    const moonOrbitRef = useRef<THREE.Group>(null)

    const size = isLawnova ? config.size * 7 : config.size * 4.5

    // Planet-specific atmosphere colors
    const atmosphereConfig = useMemo(() => {
        const configs: Record<string, { primary: string; secondary: string; intensity: number; power: number }> = {
            mercury: { primary: '#a0a0a0', secondary: '#606060', intensity: 0.3, power: 4.0 },
            venus: { primary: '#ffd580', secondary: '#ff9933', intensity: 0.6, power: 2.5 },
            earth: { primary: '#4da6ff', secondary: '#00ccff', intensity: 0.8, power: 3.0 },
            mars: { primary: '#ff6b35', secondary: '#cc4400', intensity: 0.5, power: 3.5 },
            jupiter: { primary: '#ffaa66', secondary: '#ff8844', intensity: 0.6, power: 2.5 },
            saturn: { primary: '#ffd700', secondary: '#ff9900', intensity: 0.7, power: 2.5 },
            neptune: { primary: '#0066ff', secondary: '#00ccff', intensity: 0.9, power: 2.5 }
        }
        return configs[config.id] || { primary: config.color, secondary: config.emissive, intensity: 0.5, power: 3.0 }
    }, [config.id, config.color, config.emissive])

    // Check if planet has moons (Saturn = PipChat)
    const hasMoon = config.id === 'saturn' || config.id === 'earth'
    const moonColor = config.id === 'saturn' ? '#c9aa6b' : '#aaaaaa'
    const moonSize = size * 0.15

    useFrame((state) => {
        if (planetRef.current) {
            planetRef.current.rotation.y = state.clock.elapsedTime * 0.06
        }
        if (ringsRef.current) {
            ringsRef.current.rotation.z = state.clock.elapsedTime * 0.1
        }
        if (ringsRef2.current) {
            ringsRef2.current.rotation.z = -state.clock.elapsedTime * 0.05
        }
        // Orbit the moon around the planet
        if (moonOrbitRef.current) {
            moonOrbitRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
        // Moon self-rotation
        if (moonRef.current) {
            moonRef.current.rotation.y = state.clock.elapsedTime * 0.2
        }
    })

    return (
        <group ref={groupRef} position={position}>
            {/* Directional light for shadow casting - positioned like the Sun */}
            <directionalLight
                position={[-position[0], -position[1] + 10, -position[2] + 15]}
                intensity={1.5}
                castShadow
                shadow-mapSize-width={1024}
                shadow-mapSize-height={1024}
                shadow-camera-near={0.5}
                shadow-camera-far={50}
                shadow-camera-left={-size * 2}
                shadow-camera-right={size * 2}
                shadow-camera-top={size * 2}
                shadow-camera-bottom={-size * 2}
                shadow-bias={-0.0001}
            />

            {/* Main planet surface - receives shadows */}
            <mesh ref={planetRef} castShadow receiveShadow>
                <sphereGeometry args={[size, 64, 64]} />
                <meshStandardMaterial
                    color={config.color}
                    emissive={config.emissive}
                    emissiveIntensity={isLawnova ? 0.5 : 0.25}
                    roughness={0.6}
                    metalness={0.05}
                />
            </mesh>

            {/* Fresnel Rim Light - Primary Atmosphere Layer */}
            <FresnelAtmosphere
                radius={size * 1.02}
                color={atmosphereConfig.primary}
                secondaryColor={atmosphereConfig.secondary}
                intensity={atmosphereConfig.intensity}
                power={atmosphereConfig.power}
            />

            {/* Outer Atmospheric Glow */}
            <FresnelAtmosphere
                radius={size * 1.08}
                color={atmosphereConfig.primary}
                secondaryColor={atmosphereConfig.secondary}
                intensity={atmosphereConfig.intensity * 0.4}
                power={atmosphereConfig.power + 1}
            />

            {/* LAWNOVA (Jupiter) - Clean, Elegant AI Glow */}
            {isLawnova && (
                <>
                    {/* Soft warm outer glow */}
                    <mesh>
                        <sphereGeometry args={[size * 1.08, 64, 64]} />
                        <meshBasicMaterial
                            color="#ff8c42"
                            transparent
                            opacity={0.15}
                            side={THREE.BackSide}
                        />
                    </mesh>
                    {/* Subtle point light for soft illumination */}
                    <pointLight color="#ff7b35" intensity={15} distance={35} decay={2} />
                </>
            )}

            {/* Orbiting Moon (PipChat for Saturn, Luna for Earth) - Casts shadows */}
            {hasMoon && (
                <group ref={moonOrbitRef}>
                    {/* Moon positioned at orbital distance */}
                    <mesh
                        ref={moonRef}
                        position={[size * 2.8, size * 0.3, 0]}
                        castShadow
                    >
                        <sphereGeometry args={[moonSize, 32, 32]} />
                        <meshStandardMaterial
                            color={moonColor}
                            roughness={0.8}
                            metalness={0.1}
                        />
                    </mesh>
                    {/* Moon glow */}
                    <mesh position={[size * 2.8, size * 0.3, 0]}>
                        <sphereGeometry args={[moonSize * 1.1, 16, 16]} />
                        <meshBasicMaterial
                            color={moonColor}
                            transparent
                            opacity={0.1}
                            side={THREE.BackSide}
                        />
                    </mesh>
                </group>
            )}

            {/* Saturn's enhanced ring system */}
            {config.hasRings && (
                <>
                    {/* Extra atmosphere for Saturn */}
                    <FresnelAtmosphere
                        radius={size * 1.12}
                        color="#ffd700"
                        secondaryColor="#ffaa00"
                        intensity={0.6}
                        power={2.0}
                    />
                    {/* Inner bright ring - receives shadows */}
                    <mesh ref={ringsRef} rotation={[Math.PI / 2 + (config.tilt || 0), 0, 0]} receiveShadow>
                        <ringGeometry args={[size * 1.4, size * 1.9, 128]} />
                        <meshStandardMaterial
                            color={config.ringColor || '#e8d5a0'}
                            transparent
                            opacity={0.8}
                            side={THREE.DoubleSide}
                            roughness={0.9}
                        />
                    </mesh>
                    {/* Outer diffuse ring */}
                    <mesh ref={ringsRef2} rotation={[Math.PI / 2 + (config.tilt || 0) + 0.05, 0, 0]} receiveShadow>
                        <ringGeometry args={[size * 2.0, size * 2.6, 128]} />
                        <meshStandardMaterial
                            color="#c9b896"
                            transparent
                            opacity={0.4}
                            side={THREE.DoubleSide}
                            roughness={0.9}
                        />
                    </mesh>
                </>
            )}
        </group>
    )
}

// Background starfield
const Starfield: React.FC = () => {
    const { positions, colors } = useMemo(() => {
        const count = 4000
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 200
            positions[i * 3 + 1] = (Math.random() - 0.5) * 250
            positions[i * 3 + 2] = (Math.random() - 0.5) * 100 - 50
            const brightness = 0.5 + Math.random() * 0.5
            colors[i * 3] = brightness
            colors[i * 3 + 1] = brightness * (0.8 + Math.random() * 0.2)
            colors[i * 3 + 2] = brightness
        }
        return { positions, colors }
    }, [])

    return (
        <points>
            <bufferGeometry>
                <bufferAttribute attach="attributes-position" args={[positions, 3]} />
                <bufferAttribute attach="attributes-color" args={[colors, 3]} />
            </bufferGeometry>
            <pointsMaterial size={0.08} vertexColors transparent opacity={0.9} sizeAttenuation />
        </points>
    )
}

// Asteroid Belt - Skills floating between Mars and Jupiter
const AsteroidBelt: React.FC = () => {
    const beltRef = useRef<THREE.Group>(null)

    // Position belt between Mars (-42) and Jupiter (-58)
    const beltY = -50
    const beltRadius = 12

    // Create asteroids for each skill
    const asteroids = useMemo(() => {
        return asteroidBeltSkills.map((skill, i) => {
            const angle = (i / asteroidBeltSkills.length) * Math.PI * 2
            const radiusVariation = beltRadius + (Math.random() - 0.5) * 4
            const x = Math.cos(angle) * radiusVariation
            const z = Math.sin(angle) * radiusVariation
            const yOffset = (Math.random() - 0.5) * 3
            const size = 0.3 + Math.random() * 0.4
            const rotationSpeed = 0.5 + Math.random() * 1

            return {
                ...skill,
                position: [x, beltY + yOffset, z] as [number, number, number],
                size,
                rotationSpeed,
                color: `hsl(${30 + Math.random() * 30}, 30%, ${40 + Math.random() * 20}%)`
            }
        })
    }, [])

    // Additional random asteroids for visual density
    const decorativeAsteroids = useMemo(() => {
        const count = 60
        const asteroids = []
        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const radiusVariation = beltRadius + (Math.random() - 0.5) * 8
            const x = Math.cos(angle) * radiusVariation
            const z = Math.sin(angle) * radiusVariation
            const yOffset = (Math.random() - 0.5) * 4
            asteroids.push({
                position: [x, beltY + yOffset, z] as [number, number, number],
                size: 0.1 + Math.random() * 0.2,
                rotationSpeed: 0.3 + Math.random() * 0.7
            })
        }
        return asteroids
    }, [])

    useFrame((state) => {
        if (beltRef.current) {
            beltRef.current.rotation.y = state.clock.elapsedTime * 0.02
        }
    })

    return (
        <group ref={beltRef}>
            {/* Skill asteroids with labels */}
            {asteroids.map((asteroid) => (
                <group key={asteroid.name} position={asteroid.position}>
                    <mesh castShadow>
                        <dodecahedronGeometry args={[asteroid.size, 0]} />
                        <meshStandardMaterial
                            color={asteroid.color}
                            roughness={0.8}
                            metalness={0.2}
                        />
                    </mesh>
                    {/* Skill label - simple glow sphere */}
                    <mesh>
                        <sphereGeometry args={[asteroid.size * 1.3, 8, 8]} />
                        <meshBasicMaterial
                            color="#ff6b35"
                            transparent
                            opacity={0.1}
                        />
                    </mesh>
                </group>
            ))}
            {/* Decorative asteroids */}
            {decorativeAsteroids.map((asteroid, i) => (
                <mesh key={`deco-${i}`} position={asteroid.position}>
                    <dodecahedronGeometry args={[asteroid.size, 0]} />
                    <meshStandardMaterial
                        color="#8b7355"
                        roughness={0.9}
                        metalness={0.1}
                    />
                </mesh>
            ))}
        </group>
    )
}

// Camera controller with lerp and scroll offset
interface CameraRigProps {
    onSectionChange: (index: number) => void
    onScrollSpeed: (speed: number) => void
}

const CameraRig: React.FC<CameraRigProps> = ({ onSectionChange, onScrollSpeed }) => {
    const { camera } = useThree()
    const scroll = useScroll()
    const targetPosition = useRef(new THREE.Vector3(...sections[0].camera))
    const targetLookAt = useRef(new THREE.Vector3(...sections[0].position))
    const currentLookAt = useRef(new THREE.Vector3(...sections[0].position))
    const lastOffset = useRef(0)
    const currentSection = useRef(0)

    useFrame(() => {
        const offset = scroll.offset // 0 to 1

        // Calculate scroll speed for warp effect
        const scrollSpeed = Math.abs(offset - lastOffset.current) * 60
        onScrollSpeed(scrollSpeed)
        lastOffset.current = offset

        // Calculate current and next section
        const totalSections = sections.length - 1
        const progress = offset * totalSections
        const sectionIndex = Math.floor(progress)
        const sectionProgress = progress - sectionIndex

        const currentSec = sections[Math.min(sectionIndex, totalSections)]
        const nextSec = sections[Math.min(sectionIndex + 1, totalSections)]

        // Smooth easing for section transitions
        const ease = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
        const t = ease(sectionProgress)

        // Lerp target camera position
        targetPosition.current.set(
            THREE.MathUtils.lerp(currentSec.camera[0], nextSec.camera[0], t),
            THREE.MathUtils.lerp(currentSec.camera[1], nextSec.camera[1], t),
            THREE.MathUtils.lerp(currentSec.camera[2], nextSec.camera[2], t)
        )

        // Lerp target lookAt
        targetLookAt.current.set(
            THREE.MathUtils.lerp(currentSec.position[0], nextSec.position[0], t),
            THREE.MathUtils.lerp(currentSec.position[1], nextSec.position[1], t),
            THREE.MathUtils.lerp(currentSec.position[2], nextSec.position[2], t)
        )

        // Smooth camera movement with lerp (0.1 factor as specified)
        camera.position.lerp(targetPosition.current, 0.1)
        currentLookAt.current.lerp(targetLookAt.current, 0.1)
        camera.lookAt(currentLookAt.current)

        // Notify section change
        const newSection = Math.round(offset * totalSections)
        if (newSection !== currentSection.current) {
            currentSection.current = newSection
            onSectionChange(newSection)
        }
    })

    return null
}

// 3D Scene content
interface SceneContentProps {
    onSectionChange: (index: number) => void
    onScrollSpeed: (speed: number) => void
    scrollSpeed: number
}

const SceneContent: React.FC<SceneContentProps> = ({ onSectionChange, onScrollSpeed, scrollSpeed }) => {
    return (
        <>
            <PerspectiveCamera makeDefault position={sections[0].camera} fov={55} near={0.1} far={400} />
            <CameraRig onSectionChange={onSectionChange} onScrollSpeed={onScrollSpeed} />

            <ambientLight intensity={0.03} />
            <Starfield />
            <StarWarp speed={scrollSpeed} />

            {/* Sun */}
            <Sun position={sections[0].position as [number, number, number]} />

            {/* Planets */}
            {sections.slice(1).map((section) => {
                const planet = allPlanets.find(p => p.id === section.id)
                if (!planet) return null
                return (
                    <Planet
                        key={section.id}
                        config={planet}
                        position={section.position as [number, number, number]}
                        isLawnova={section.id === 'jupiter'}
                    />
                )
            })}

            {/* Asteroid Belt between Mars and Jupiter */}
            <AsteroidBelt />

            <fog attach="fog" args={['#000008', 40, 150]} />
        </>
    )
}

// Text overlay with Framer Motion
interface TextOverlayProps {
    activeSection: number
}

const TextOverlay: React.FC<TextOverlayProps> = ({ activeSection }) => {
    const section = sections[activeSection]
    const planet = allPlanets.find(p => p.id === section?.id)
    const isSun = section?.id === 'sun'
    const slideFrom = section?.textSide === 'left' ? -100 : 100

    return (
        <div className={`text-overlay ${section?.textSide}`}>
            <AnimatePresence mode="wait">
                <motion.div
                    key={activeSection}
                    initial={{ opacity: 0, x: slideFrom }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -slideFrom * 0.5 }}
                    transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                    className="text-content"
                >
                    {isSun ? (
                        <div className="hero-section">
                            <motion.span
                                className="badge"
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                ✨ Full Stack & AI Overview
                            </motion.span>
                            <motion.h1
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                <span className="greeting">Hi, it's me</span>
                                <span className="name">{identity.name}</span>
                            </motion.h1>
                            <motion.div
                                className="roles"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <span className="role ai">AI Engineer</span>
                                <span className="divider">•</span>
                                <span className="role fullstack">Full Stack Developer</span>
                            </motion.div>
                            <motion.p
                                className="tagline"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.5 }}
                            >
                                Crafting intelligent AI systems and scalable full-stack solutions
                                that transform ideas into impactful digital experiences.
                            </motion.p>
                            <motion.div
                                className="social-links"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="social-link github" aria-label="GitHub">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
                                    </svg>
                                </a>
                                <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin" aria-label="LinkedIn">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                                    </svg>
                                </a>
                                <a href={socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook" aria-label="Facebook">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                                    </svg>
                                </a>
                                <a href={socialLinks.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter" aria-label="X (Twitter)">
                                    <svg viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                                    </svg>
                                </a>
                            </motion.div>
                            <motion.div
                                className="scroll-cta"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.8 }}
                            >
                                <span className="arrow">↓</span>
                                <span>Scroll to explore projects</span>
                            </motion.div>
                        </div>
                    ) : planet ? (
                        <div className="project-section">
                            <motion.div
                                className="planet-badge"
                                style={{ borderColor: planet.color, backgroundColor: `${planet.color}15` }}
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.1 }}
                            >
                                <span className="dot" style={{ backgroundColor: planet.color }} />
                                {planet.name}
                            </motion.div>
                            <motion.h2
                                initial={{ y: 30, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                            >
                                {planet.projectName}
                            </motion.h2>
                            <motion.p
                                className="description"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {planet.description}
                            </motion.p>
                            <motion.div
                                className="tech-stack"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                {planet.techStack.map((tech, i) => (
                                    <motion.span
                                        key={tech}
                                        className="tech"
                                        initial={{ scale: 0.8, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        transition={{ delay: 0.4 + i * 0.05 }}
                                    >
                                        {tech}
                                    </motion.span>
                                ))}
                            </motion.div>
                            {planet.moons && planet.moons.length > 0 && (
                                <motion.div
                                    className="features"
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    transition={{ delay: 0.5 }}
                                >
                                    <h4>Key Features</h4>
                                    {planet.moons.slice(0, 3).map((moon) => (
                                        <div key={moon.name} className="feature">
                                            <span className="moon-icon">🌙</span>
                                            <span>{moon.name}</span>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                            <motion.div
                                className="links"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.6 }}
                            >
                                {planet.githubUrl && (
                                    <a href={planet.githubUrl} target="_blank" rel="noopener noreferrer" className="btn github">
                                        <svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" /></svg>
                                        GitHub
                                    </a>
                                )}
                                {planet.liveUrl && (
                                    <a href={planet.liveUrl} target="_blank" rel="noopener noreferrer" className="btn live">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M2 12h20M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z" /></svg>
                                        Live Demo
                                    </a>
                                )}
                            </motion.div>
                        </div>
                    ) : null}
                </motion.div>
            </AnimatePresence>
        </div>
    )
}

// Progress indicator
interface ProgressIndicatorProps {
    activeSection: number
    onNavigate: (index: number) => void
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({ activeSection, onNavigate }) => {
    return (
        <div className="progress-indicator">
            {sections.map((section, index) => (
                <motion.button
                    key={section.id}
                    className={`dot ${index === activeSection ? 'active' : ''}`}
                    onClick={() => onNavigate(index)}
                    whileHover={{ scale: 1.3 }}
                    whileTap={{ scale: 0.9 }}
                    aria-label={section.name}
                >
                    <span className="tooltip">{section.name}</span>
                </motion.button>
            ))}
        </div>
    )
}

// Spatial Audio System - Ambient Space Music
// NOTE: Add your space ambient audio file to /public/space-ambient.mp3
const useSpaceAudio = (activeSection: number, scrollSpeed: number) => {
    const audioRef = useRef<HTMLAudioElement | null>(null)
    const audioContextRef = useRef<AudioContext | null>(null)
    const gainNodeRef = useRef<GainNode | null>(null)
    const [isAudioEnabled, setIsAudioEnabled] = useState(false)

    // Initialize audio
    const initAudio = useCallback(() => {
        if (audioRef.current) return

        // Create audio element
        const audio = new Audio('/space-ambient.mp3')
        audio.loop = true
        audio.volume = 0.3
        audioRef.current = audio

        // Create audio context for advanced control
        const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
        audioContextRef.current = ctx

        // Create gain node for volume control
        const gainNode = ctx.createGain()
        gainNode.gain.value = 0.3
        gainNode.connect(ctx.destination)
        gainNodeRef.current = gainNode

        // Connect audio to context
        const source = ctx.createMediaElementSource(audio)
        source.connect(gainNode)

        // Start playing
        audio.play().catch(() => {
            console.log('Audio autoplay blocked - click the audio button to enable')
        })

        setIsAudioEnabled(true)
    }, [])

    // Adjust volume based on section (deeper in space = more ethereal)
    useEffect(() => {
        if (!gainNodeRef.current || !audioContextRef.current) return

        const currentTime = audioContextRef.current.currentTime

        // Volume varies slightly by position
        // Sun (0) = fuller sound, Neptune (7) = slightly softer, more distant
        const progress = activeSection / (sections.length - 1)
        const baseVolume = 0.35 - progress * 0.1 // 0.35 near Sun, 0.25 near Neptune

        gainNodeRef.current.gain.setTargetAtTime(baseVolume, currentTime, 0.5)
    }, [activeSection])

    // Modulate based on scroll speed (warp effect - volume boost)
    useEffect(() => {
        if (!gainNodeRef.current || !audioContextRef.current) return

        const currentTime = audioContextRef.current.currentTime

        // Increase volume during fast scroll for dramatic warp effect
        const warpBoost = Math.min(scrollSpeed * 3, 0.4)
        const progress = activeSection / (sections.length - 1)
        const baseVolume = 0.35 - progress * 0.1
        const targetVolume = baseVolume + warpBoost

        gainNodeRef.current.gain.setTargetAtTime(targetVolume, currentTime, 0.1)
    }, [scrollSpeed, activeSection])

    // Cleanup
    useEffect(() => {
        return () => {
            if (audioRef.current) {
                audioRef.current.pause()
                audioRef.current = null
            }
            if (audioContextRef.current) {
                audioContextRef.current.close()
            }
        }
    }, [])

    // Toggle audio
    const toggleAudio = useCallback(() => {
        if (!audioRef.current) {
            initAudio()
        } else {
            if (audioRef.current.paused) {
                audioRef.current.play()
                setIsAudioEnabled(true)
            } else {
                audioRef.current.pause()
                setIsAudioEnabled(false)
            }
        }
    }, [initAudio])

    return { toggleAudio, isAudioEnabled, initAudio }
}

// Audio Toggle Button Component
const AudioToggle: React.FC<{ isEnabled: boolean; onToggle: () => void }> = ({ isEnabled, onToggle }) => {
    return (
        <motion.button
            className="audio-toggle"
            onClick={onToggle}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            aria-label={isEnabled ? 'Mute audio' : 'Enable audio'}
        >
            {isEnabled ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
                </svg>
            ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 5L6 9H2v6h4l5 4V5z" />
                    <line x1="23" y1="9" x2="17" y2="15" />
                    <line x1="17" y1="9" x2="23" y2="15" />
                </svg>
            )}
        </motion.button>
    )
}

// Contact Form with Space Transmission Effect
const ContactForm: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
    const [formData, setFormData] = useState({ name: '', email: '', message: '' })
    const [isTransmitting, setIsTransmitting] = useState(false)
    const [transmitted, setTransmitted] = useState(false)

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsTransmitting(true)

        // Create mailto link with form data
        const mailtoLink = `mailto:janithviranga2001@gmail.com?subject=Portfolio Contact from ${encodeURIComponent(formData.name)}&body=${encodeURIComponent(
            `Name: ${formData.name}\nEmail: ${formData.email}\n\nMessage:\n${formData.message}`
        )}`

        // Simulate transmission animation then open mail client
        setTimeout(() => {
            window.open(mailtoLink, '_blank')
            setIsTransmitting(false)
            setTransmitted(true)
            setTimeout(() => {
                setTransmitted(false)
                onClose()
                setFormData({ name: '', email: '', message: '' })
            }, 2000)
        }, 1500)
    }

    if (!isOpen) return null

    return (
        <motion.div
            className="contact-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
        >
            <motion.div
                className="contact-form"
                initial={{ scale: 0.8, y: 50 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.8, y: 50 }}
            >
                <button className="close-btn" onClick={onClose}>×</button>

                <div className="form-header">
                    <span className="transmission-icon">📡</span>
                    <h2>Contact Mission Control</h2>
                    <p>Send a transmission across the cosmos</p>
                </div>

                {transmitted ? (
                    <motion.div
                        className="success-message"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                    >
                        <span className="success-icon">✓</span>
                        <h3>Transmission Successful!</h3>
                        <p>Your message is traveling through space...</p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label>Sender ID</label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                placeholder="Your name"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Communication Frequency</label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="your@email.com"
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Transmission Data</label>
                            <textarea
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                placeholder="Your message..."
                                rows={4}
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            className={`submit-btn ${isTransmitting ? 'transmitting' : ''}`}
                            disabled={isTransmitting}
                        >
                            {isTransmitting ? (
                                <>
                                    <span className="loading-dots">Transmitting</span>
                                    <span className="signal-waves">◠◠◠</span>
                                </>
                            ) : (
                                <>Send Transmission 🚀</>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </motion.div>
    )
}

// Easter Egg: Solar Flare on Sun clicks
const useSolarFlareEasterEgg = () => {
    const [sunClicks, setSunClicks] = useState(0)
    const [showFlare, setShowFlare] = useState(false)

    const handleSunClick = useCallback(() => {
        setSunClicks(prev => {
            const newCount = prev + 1
            if (newCount >= 5) {
                setShowFlare(true)
                setTimeout(() => setShowFlare(false), 3000)
                return 0
            }
            return newCount
        })
    }, [])

    return { sunClicks, showFlare, handleSunClick }
}

// Mobile Touch Controls Hook
const useMobileControls = () => {
    const [isMobile, setIsMobile] = useState(false)
    const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null)

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 768 || 'ontouchstart' in window)
        }
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        setTouchStart({
            x: e.touches[0].clientX,
            y: e.touches[0].clientY
        })
    }, [])

    const handleTouchEnd = useCallback((e: React.TouchEvent, onSwipeUp?: () => void, onSwipeDown?: () => void) => {
        if (!touchStart) return

        const deltaY = touchStart.y - e.changedTouches[0].clientY
        const deltaX = touchStart.x - e.changedTouches[0].clientX

        // Only trigger if vertical swipe is dominant
        if (Math.abs(deltaY) > Math.abs(deltaX) && Math.abs(deltaY) > 50) {
            if (deltaY > 0 && onSwipeUp) {
                onSwipeUp()
            } else if (deltaY < 0 && onSwipeDown) {
                onSwipeDown()
            }
        }
        setTouchStart(null)
    }, [touchStart])

    return { isMobile, handleTouchStart, handleTouchEnd }
}

// Main component
const ScrollExperienceAdvanced: React.FC = () => {
    const [activeSection, setActiveSection] = useState(0)
    const [scrollSpeed, setScrollSpeed] = useState(0)
    const [showContact, setShowContact] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    // Spatial audio system
    const { toggleAudio, isAudioEnabled } = useSpaceAudio(activeSection, scrollSpeed)

    // Easter eggs
    const { showFlare, handleSunClick } = useSolarFlareEasterEgg()

    // Mobile controls
    const { isMobile, handleTouchStart, handleTouchEnd } = useMobileControls()

    const handleNavigate = (index: number) => {
        // Scroll to section programmatically
        if (scrollRef.current) {
            const scrollContainer = scrollRef.current.querySelector('[data-scroll-container]')
            if (scrollContainer) {
                const targetScroll = (index / (sections.length - 1)) * (scrollContainer.scrollHeight - window.innerHeight)
                scrollContainer.scrollTo({ top: targetScroll, behavior: 'smooth' })
            }
        }
    }

    const handleSwipeUp = () => {
        if (activeSection < sections.length - 1) {
            handleNavigate(activeSection + 1)
        }
    }

    const handleSwipeDown = () => {
        if (activeSection > 0) {
            handleNavigate(activeSection - 1)
        }
    }

    return (
        <div
            ref={scrollRef}
            className={`scroll-experience-advanced ${isMobile ? 'mobile' : ''}`}
            onTouchStart={handleTouchStart}
            onTouchEnd={(e) => handleTouchEnd(e, handleSwipeUp, handleSwipeDown)}
        >
            <Canvas
                shadows
                dpr={[1, 2]}
                gl={{
                    antialias: true,
                    alpha: true,
                    powerPreference: 'high-performance',
                }}
            >
                <ScrollControls pages={sections.length} damping={0.25}>
                    <SceneContent
                        onSectionChange={setActiveSection}
                        onScrollSpeed={setScrollSpeed}
                        scrollSpeed={scrollSpeed}
                    />
                </ScrollControls>
            </Canvas>

            <TextOverlay activeSection={activeSection} />
            <ProgressIndicator activeSection={activeSection} onNavigate={handleNavigate} />

            {/* Audio toggle button */}
            <AudioToggle isEnabled={isAudioEnabled} onToggle={toggleAudio} />

            {/* Contact button */}
            <motion.button
                className="contact-toggle"
                onClick={() => setShowContact(true)}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label="Contact"
            >
                📡
            </motion.button>

            {/* Easter Egg: Sun click detector (invisible overlay on Sun section) */}
            {activeSection === 0 && (
                <div
                    className="sun-click-zone"
                    onClick={handleSunClick}
                    aria-hidden="true"
                />
            )}

            {/* Solar Flare Easter Egg Effect */}
            <AnimatePresence>
                {showFlare && (
                    <motion.div
                        className="solar-flare"
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1.5 }}
                        exit={{ opacity: 0, scale: 2 }}
                        transition={{ duration: 1.5 }}
                    />
                )}
            </AnimatePresence>

            {/* Contact Form Modal */}
            <AnimatePresence>
                {showContact && (
                    <ContactForm isOpen={showContact} onClose={() => setShowContact(false)} />
                )}
            </AnimatePresence>

            {/* Mobile swipe hint */}
            {isMobile && activeSection === 0 && (
                <motion.div
                    className="mobile-hint"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 2 }}
                >
                    <span>Swipe up to explore</span>
                    <span className="swipe-icon">👆</span>
                </motion.div>
            )}

            {/* Vignette overlay for cinematic effect */}
            <div className="vignette" />
        </div>
    )
}

export default ScrollExperienceAdvanced
