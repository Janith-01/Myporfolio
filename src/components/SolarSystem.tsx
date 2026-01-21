import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'
import ProjectPlanet from './ProjectPlanet'
import { allPlanets, type ProjectPlanet as PlanetConfig } from '../data/portfolioConfig'

// Enhanced Orbital Path with animated glow and dashed effect
interface OrbitPathProps {
    radius: number
    color?: string
    opacity?: number
    planetType: 'inner' | 'gas-giant' | 'ice-giant'
    orbitSpeed: number
}

const OrbitPath: React.FC<OrbitPathProps> = ({
    radius,
    color = '#ffffff',
    opacity = 0.1,
    planetType,
    orbitSpeed
}) => {
    const pathRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const markerRef = useRef<THREE.Mesh>(null)

    // Animate the orbital marker
    useFrame((state) => {
        const time = state.clock.elapsedTime

        // Animate the glowing ring slightly
        if (glowRef.current) {
            const material = glowRef.current.material as THREE.MeshBasicMaterial
            material.opacity = 0.03 + Math.sin(time * 2 + radius) * 0.02
        }

        // Animate orbital position marker
        if (markerRef.current) {
            const angle = time * orbitSpeed * 0.1
            markerRef.current.position.x = Math.cos(angle) * radius
            markerRef.current.position.z = Math.sin(angle) * radius
        }
    })

    // Get styling based on planet type
    const getGlowColor = () => {
        switch (planetType) {
            case 'gas-giant': return '#ffa500'
            case 'ice-giant': return '#00bfff'
            default: return '#ffffff'
        }
    }

    return (
        <group>
            {/* Main orbit line */}
            <mesh ref={pathRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.008, 8, 256]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={opacity}
                />
            </mesh>

            {/* Outer glow effect */}
            <mesh ref={glowRef} rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[radius, 0.025, 8, 128]} />
                <meshBasicMaterial
                    color={getGlowColor()}
                    transparent
                    opacity={0.03}
                />
            </mesh>

            {/* Animated position marker on orbit */}
            <mesh ref={markerRef} position={[radius, 0, 0]}>
                <sphereGeometry args={[0.015, 8, 8]} />
                <meshBasicMaterial color={getGlowColor()} transparent opacity={0.6} />
            </mesh>
        </group>
    )
}

// Ecliptic plane indicator - subtle grid showing the orbital plane
const EclipticPlane: React.FC = () => {
    const gridRef = useRef<THREE.Group>(null)

    const gridLines = useMemo(() => {
        const lines: { start: THREE.Vector3; end: THREE.Vector3 }[] = []

        // Create radial lines from center
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2
            const innerRadius = 1.5
            const outerRadius = 14
            lines.push({
                start: new THREE.Vector3(
                    Math.cos(angle) * innerRadius,
                    0,
                    Math.sin(angle) * innerRadius
                ),
                end: new THREE.Vector3(
                    Math.cos(angle) * outerRadius,
                    0,
                    Math.sin(angle) * outerRadius
                )
            })
        }

        return lines
    }, [])

    useFrame((state) => {
        if (gridRef.current) {
            // Very slow rotation
            gridRef.current.rotation.y = state.clock.elapsedTime * 0.005
        }
    })

    return (
        <group ref={gridRef}>
            {gridLines.map((line, index) => {
                const points = [line.start, line.end]
                const geometry = new THREE.BufferGeometry().setFromPoints(points)

                return (
                    <line key={index}>
                        <bufferGeometry attach="geometry" {...geometry} />
                        <lineBasicMaterial
                            attach="material"
                            color="#ffffff"
                            transparent
                            opacity={0.03}
                        />
                    </line>
                )
            })}
        </group>
    )
}

// Skill Asteroid Belt - representing foundational skills
const SkillAsteroidBelt: React.FC = () => {
    const asteroidsRef = useRef<THREE.Points>(null)

    const { positions, colors } = useMemo(() => {
        const count = 3000
        const posArray = new Float32Array(count * 3)
        const colorArray = new Float32Array(count * 3)
        const skillColors = [
            new THREE.Color('#ff6b6b'), // Java - red
            new THREE.Color('#4ecdc4'), // C++ - teal
            new THREE.Color('#ffe66d'), // PHP - yellow
            new THREE.Color('#95e1d3'), // Python - mint
            new THREE.Color('#dfe6e9'), // SQL - gray
        ]

        for (let i = 0; i < count; i++) {
            const angle = Math.random() * Math.PI * 2
            const radius = 4.8 + Math.random() * 0.6
            const y = (Math.random() - 0.5) * 0.25

            posArray[i * 3] = Math.cos(angle) * radius
            posArray[i * 3 + 1] = y
            posArray[i * 3 + 2] = Math.sin(angle) * radius

            const skillColor = skillColors[i % skillColors.length]
            colorArray[i * 3] = skillColor.r
            colorArray[i * 3 + 1] = skillColor.g
            colorArray[i * 3 + 2] = skillColor.b
        }

        return { positions: posArray, colors: colorArray }
    }, [])

    useFrame((state) => {
        if (asteroidsRef.current) {
            // Differential rotation - inner asteroids move faster
            asteroidsRef.current.rotation.y = state.clock.elapsedTime * 0.018
        }
    })

    return (
        <group>
            {/* Asteroid belt particles */}
            <points ref={asteroidsRef}>
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
                    size={0.015}
                    vertexColors
                    transparent
                    opacity={0.8}
                    sizeAttenuation={true}
                    blending={THREE.AdditiveBlending}
                />
            </points>

            {/* Asteroid belt orbital rings */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[4.8, 0.003, 8, 128]} />
                <meshBasicMaterial color="#888888" transparent opacity={0.1} />
            </mesh>
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[5.4, 0.003, 8, 128]} />
                <meshBasicMaterial color="#888888" transparent opacity={0.1} />
            </mesh>
        </group>
    )
}

// Orbital period indicator - shows time markers on orbits
const OrbitalMarkers: React.FC = () => {
    const markersRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        if (markersRef.current) {
            markersRef.current.children.forEach((marker, index) => {
                const speed = 0.5 / (index + 1)
                marker.rotation.y = state.clock.elapsedTime * speed
            })
        }
    })

    return (
        <group ref={markersRef}>
            {allPlanets.slice(0, 4).map((planet) => (
                <group key={`marker-group-${planet.id}`}>
                    {/* Perihelion marker */}
                    <mesh
                        position={[planet.orbitRadius, 0, 0]}
                        rotation={[Math.PI / 2, 0, 0]}
                    >
                        <ringGeometry args={[0.02, 0.04, 16]} />
                        <meshBasicMaterial
                            color={planet.color}
                            transparent
                            opacity={0.3}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                </group>
            ))}
        </group>
    )
}

interface SolarSystemProps {
    onPlanetSelect?: (planet: PlanetConfig | null, position?: THREE.Vector3) => void
    selectedPlanet?: string | null
}

const SolarSystem: React.FC<SolarSystemProps> = ({ onPlanetSelect, selectedPlanet }) => {
    const systemRef = useRef<THREE.Group>(null)

    const handlePlanetClick = (planet: PlanetConfig, position: THREE.Vector3) => {
        if (selectedPlanet === planet.id) {
            onPlanetSelect?.(null)
        } else {
            onPlanetSelect?.(planet, position)
        }
    }

    return (
        <group ref={systemRef}>
            {/* Ecliptic plane indicator */}
            <EclipticPlane />

            {/* Enhanced orbit paths for all project planets */}
            {allPlanets.map((planet) => (
                <OrbitPath
                    key={`orbit-${planet.id}`}
                    radius={planet.orbitRadius}
                    color={planet.type === 'gas-giant' ? '#ffa500' : planet.type === 'ice-giant' ? '#00bfff' : '#ffffff'}
                    opacity={0.12}
                    planetType={planet.type}
                    orbitSpeed={planet.orbitSpeed}
                />
            ))}

            {/* Orbital markers */}
            <OrbitalMarkers />

            {/* All project planets with orbital mechanics */}
            {allPlanets.map((planet) => (
                <ProjectPlanet
                    key={planet.id}
                    config={planet}
                    onClick={(position) => handlePlanetClick(planet, position)}
                    isActive={selectedPlanet === planet.id}
                />
            ))}

            {/* Skill Asteroid Belt between Mars and Jupiter */}
            <SkillAsteroidBelt />
        </group>
    )
}

export default SolarSystem

