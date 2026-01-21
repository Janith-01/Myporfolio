import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import { sectionWaypoints, type SectionWaypoint } from './ScrollCameraController'
import { allPlanets, type ProjectPlanet as PlanetConfig } from '../data/portfolioConfig'

// Enhanced Sun component positioned for scroll view
const ScrollSun: React.FC<{ waypoint: SectionWaypoint; isActive: boolean }> = ({ waypoint, isActive }) => {
    const sunRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const coronaRef = useRef<THREE.Points>(null)

    // Position sun on the specified side
    const sunPosition = useMemo(() => {
        const xOffset = waypoint.planetPosition === 'left' ? -3 : 3
        return new THREE.Vector3(xOffset, waypoint.lookAt[1], 0)
    }, [waypoint])

    // Corona particles
    const coronaGeometry = useMemo(() => {
        const positions = new Float32Array(2000 * 3)
        const colors = new Float32Array(2000 * 3)

        for (let i = 0; i < 2000; i++) {
            const angle = Math.random() * Math.PI * 2
            const phi = Math.random() * Math.PI
            const radius = 1.2 + Math.random() * 0.8

            positions[i * 3] = Math.sin(phi) * Math.cos(angle) * radius
            positions[i * 3 + 1] = Math.sin(phi) * Math.sin(angle) * radius
            positions[i * 3 + 2] = Math.cos(phi) * radius

            const intensity = 0.7 + Math.random() * 0.3
            colors[i * 3] = intensity
            colors[i * 3 + 1] = intensity * 0.6
            colors[i * 3 + 2] = intensity * 0.2
        }

        return { positions, colors }
    }, [])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (sunRef.current) {
            sunRef.current.rotation.y = time * 0.05
        }

        if (glowRef.current) {
            const scale = 1 + Math.sin(time * 2) * 0.05
            glowRef.current.scale.set(scale, scale, scale)
        }

        if (coronaRef.current) {
            coronaRef.current.rotation.y = time * 0.02
            coronaRef.current.rotation.z = time * 0.01
        }
    })

    return (
        <group position={sunPosition}>
            {/* Main Sun sphere */}
            <mesh ref={sunRef}>
                <sphereGeometry args={[1, 64, 64]} />
                <meshStandardMaterial
                    color="#ffa500"
                    emissive="#ff6600"
                    emissiveIntensity={isActive ? 2 : 1.5}
                    roughness={0.8}
                />
            </mesh>

            {/* Sun glow */}
            <mesh ref={glowRef}>
                <sphereGeometry args={[1.3, 32, 32]} />
                <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Corona particles */}
            <points ref={coronaRef}>
                <bufferGeometry>
                    <bufferAttribute
                        attach="attributes-position"
                        args={[coronaGeometry.positions, 3]}
                    />
                    <bufferAttribute
                        attach="attributes-color"
                        args={[coronaGeometry.colors, 3]}
                    />
                </bufferGeometry>
                <pointsMaterial
                    size={0.03}
                    vertexColors
                    transparent
                    opacity={0.8}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Sun light */}
            <pointLight
                color="#ffd500"
                intensity={isActive ? 80 : 60}
                distance={50}
                decay={2}
            />
        </group>
    )
}

// Individual planet component for scroll view
interface ScrollPlanetProps {
    planet: PlanetConfig
    waypoint: SectionWaypoint
    isActive: boolean
}

const ScrollPlanet: React.FC<ScrollPlanetProps> = ({ planet, waypoint, isActive }) => {
    const planetRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const atmosphereRef = useRef<THREE.Mesh>(null)
    const ringsRef = useRef<THREE.Mesh>(null)

    // Position planet on the specified side
    const planetPosition = useMemo(() => {
        const xOffset = waypoint.planetPosition === 'left' ? -4 : 4
        // Each section is offset vertically
        const sectionIndex = sectionWaypoints.findIndex(w => w.id === waypoint.id)
        const yOffset = -sectionIndex * 10
        return new THREE.Vector3(xOffset, yOffset, 0)
    }, [waypoint])

    // Planet surface procedural texture simulation
    const planetMaterial = useMemo(() => {
        return {
            color: planet.color,
            emissive: planet.emissive,
            emissiveIntensity: isActive ? 0.4 : 0.2,
            roughness: planet.type === 'gas-giant' ? 0.7 : 0.5,
            metalness: 0.1,
        }
    }, [planet, isActive])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (planetRef.current) {
            // Slow rotation
            planetRef.current.rotation.y = time * 0.1 * planet.orbitSpeed

            // Slight wobble when active
            if (isActive) {
                planetRef.current.position.y = planetPosition.y + Math.sin(time * 2) * 0.05
            }
        }

        if (glowRef.current) {
            const glowMaterial = glowRef.current.material as THREE.MeshBasicMaterial
            glowMaterial.opacity = isActive ? 0.25 + Math.sin(time * 3) * 0.1 : 0.15
        }

        if (ringsRef.current) {
            ringsRef.current.rotation.z = time * 0.03
        }
    })

    const scaleFactor = isActive ? 1.1 : 1
    const size = planet.size * 3 // Scale up for visibility

    return (
        <group position={planetPosition}>
            {/* Main planet sphere */}
            <mesh
                ref={planetRef}
                scale={[scaleFactor, scaleFactor, scaleFactor]}
            >
                <sphereGeometry args={[size, 64, 64]} />
                <meshStandardMaterial {...planetMaterial} />
            </mesh>

            {/* Atmosphere/Glow */}
            <mesh ref={glowRef} scale={[1.15, 1.15, 1.15]}>
                <sphereGeometry args={[size, 32, 32]} />
                <meshBasicMaterial
                    color={planet.color}
                    transparent
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </mesh>

            {/* Ice giants get atmosphere effect */}
            {planet.type === 'ice-giant' && (
                <mesh ref={atmosphereRef} scale={[1.08, 1.08, 1.08]}>
                    <sphereGeometry args={[size, 32, 32]} />
                    <meshBasicMaterial
                        color="#87ceeb"
                        transparent
                        opacity={0.1}
                        side={THREE.BackSide}
                    />
                </mesh>
            )}

            {/* Rings for Saturn, Uranus */}
            {planet.hasRings && (
                <mesh
                    ref={ringsRef}
                    rotation={[Math.PI / 2 + (planet.tilt || 0), 0, 0]}
                >
                    <ringGeometry args={[size * 1.4, size * 2.2, 64]} />
                    <meshBasicMaterial
                        color={planet.ringColor || '#c9b896'}
                        transparent
                        opacity={0.6}
                        side={THREE.DoubleSide}
                    />
                </mesh>
            )}

            {/* Moons orbiting (feature indicators) */}
            {planet.moons && planet.moons.length > 0 && (
                <Moons planetSize={size} moons={planet.moons} isActive={isActive} />
            )}
        </group>
    )
}

// Moons component
interface MoonsProps {
    planetSize: number
    moons: { name: string; description: string }[]
    isActive: boolean
}

const Moons: React.FC<MoonsProps> = ({ planetSize, moons, isActive }) => {
    const groupRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (groupRef.current) {
            groupRef.current.rotation.y = state.clock.elapsedTime * 0.3
        }
    })

    return (
        <group ref={groupRef}>
            {moons.slice(0, 4).map((moon, index) => {
                const angle = (index / Math.min(moons.length, 4)) * Math.PI * 2
                const orbitRadius = planetSize * 2 + index * 0.3
                return (
                    <mesh
                        key={moon.name}
                        position={[
                            Math.cos(angle) * orbitRadius,
                            0,
                            Math.sin(angle) * orbitRadius,
                        ]}
                    >
                        <sphereGeometry args={[0.08, 16, 16]} />
                        <meshStandardMaterial
                            color="#d4d4d4"
                            emissive="#ffffff"
                            emissiveIntensity={isActive ? 0.3 : 0.1}
                        />
                    </mesh>
                )
            })}
        </group>
    )
}

// Main scroll planets component
interface ScrollPlanetsProps {
    activeSection: number
}

const ScrollPlanets: React.FC<ScrollPlanetsProps> = ({ activeSection }) => {
    return (
        <group>
            {sectionWaypoints.map((waypoint, index) => {
                const isActive = index === activeSection

                if (waypoint.id === 'sun') {
                    return (
                        <ScrollSun
                            key={waypoint.id}
                            waypoint={waypoint}
                            isActive={isActive}
                        />
                    )
                }

                const planet = allPlanets.find(p => p.id === waypoint.id)
                if (!planet) return null

                return (
                    <ScrollPlanet
                        key={waypoint.id}
                        planet={planet}
                        waypoint={waypoint}
                        isActive={isActive}
                    />
                )
            })}

            {/* Ambient starfield in each section */}
            <ScrollStarfield />
        </group>
    )
}

// Background starfield that extends through all sections
const ScrollStarfield: React.FC = () => {
    const starsRef = useRef<THREE.Points>(null)

    const { positions, colors } = useMemo(() => {
        const count = 5000
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        for (let i = 0; i < count; i++) {
            // Spread stars across all sections
            const x = (Math.random() - 0.5) * 100
            const y = -Math.random() * 100 // Extending down through sections
            const z = (Math.random() - 0.5) * 50 - 20 // Behind the planets

            positions[i * 3] = x
            positions[i * 3 + 1] = y
            positions[i * 3 + 2] = z

            // Varied star colors
            const colorChoice = Math.random()
            if (colorChoice < 0.7) {
                // White/blue stars
                colors[i * 3] = 0.8 + Math.random() * 0.2
                colors[i * 3 + 1] = 0.8 + Math.random() * 0.2
                colors[i * 3 + 2] = 1
            } else if (colorChoice < 0.85) {
                // Yellow stars
                colors[i * 3] = 1
                colors[i * 3 + 1] = 0.9
                colors[i * 3 + 2] = 0.5
            } else {
                // Red stars
                colors[i * 3] = 1
                colors[i * 3 + 1] = 0.5
                colors[i * 3 + 2] = 0.5
            }
        }

        return { positions, colors }
    }, [])

    useFrame((state) => {
        if (starsRef.current) {
            // Subtle twinkling effect
            const material = starsRef.current.material as THREE.PointsMaterial
            material.opacity = 0.8 + Math.sin(state.clock.elapsedTime * 0.5) * 0.1
        }
    })

    return (
        <points ref={starsRef}>
            <bufferGeometry>
                <bufferAttribute
                    attach="attributes-position"
                    args={[positions, 3]}
                />
                <bufferAttribute
                    attach="attributes-color"
                    args={[colors, 3]}
                />
            </bufferGeometry>
            <pointsMaterial
                size={0.08}
                vertexColors
                transparent
                opacity={0.8}
                sizeAttenuation={true}
                blending={THREE.AdditiveBlending}
            />
        </points>
    )
}

export default ScrollPlanets
