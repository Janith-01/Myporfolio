import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Ring } from '@react-three/drei'
import * as THREE from 'three'
import type { ProjectPlanet as PlanetConfig } from '../data/portfolioConfig'

interface ProjectPlanetProps {
    config: PlanetConfig
    onClick?: (position: THREE.Vector3) => void
    isActive?: boolean
    onPositionUpdate?: (id: string, position: THREE.Vector3) => void
}

// Feature moon component for Jupiter
const FeatureMoon: React.FC<{
    name: string
    orbitRadius: number
    orbitSpeed: number
    offset: number
    size: number
    color: string
}> = ({ name, orbitRadius, orbitSpeed, offset, size, color }) => {
    const moonRef = useRef<THREE.Group>(null)

    useFrame((state) => {
        const time = state.clock.elapsedTime
        if (moonRef.current) {
            const angle = time * orbitSpeed + offset
            moonRef.current.position.x = Math.cos(angle) * orbitRadius
            moonRef.current.position.z = Math.sin(angle) * orbitRadius
            moonRef.current.position.y = Math.sin(angle * 2) * 0.05
        }
    })

    return (
        <group ref={moonRef}>
            <mesh>
                <sphereGeometry args={[size, 16, 16]} />
                <meshStandardMaterial
                    color={color}
                    emissive={color}
                    emissiveIntensity={0.3}
                    metalness={0.3}
                    roughness={0.7}
                />
            </mesh>
        </group>
    )
}

const ProjectPlanet: React.FC<ProjectPlanetProps> = ({ config, onClick, isActive = false }) => {
    const planetRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const ringRef = useRef<THREE.Group>(null)
    const [hovered, setHovered] = useState(false)

    // Generate procedural texture based on planet type
    const texture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 256
        const ctx = canvas.getContext('2d')!

        // Base color
        ctx.fillStyle = config.color
        ctx.fillRect(0, 0, 512, 256)

        // Add surface variation based on type
        if (config.type === 'gas-giant') {
            // Gas giant bands
            for (let i = 0; i < 30; i++) {
                const y = (i / 30) * 256
                const alpha = Math.random() * 0.3
                ctx.fillStyle = i % 2 === 0
                    ? `rgba(255, 255, 255, ${alpha})`
                    : `rgba(0, 0, 0, ${alpha})`
                ctx.fillRect(0, y, 512, 8 + Math.random() * 4)
            }
        } else if (config.type === 'ice-giant') {
            // Ice giant swirls
            for (let i = 0; i < 20; i++) {
                ctx.beginPath()
                const x = Math.random() * 512
                const y = Math.random() * 256
                ctx.arc(x, y, 20 + Math.random() * 40, 0, Math.PI * 1.5)
                ctx.strokeStyle = `rgba(255, 255, 255, ${Math.random() * 0.2})`
                ctx.lineWidth = 3
                ctx.stroke()
            }
        } else {
            // Inner planet surface details
            for (let i = 0; i < 500; i++) {
                const x = Math.random() * 512
                const y = Math.random() * 256
                const radius = Math.random() * 5 + 1
                ctx.beginPath()
                ctx.arc(x, y, radius, 0, Math.PI * 2)
                ctx.fillStyle = Math.random() > 0.5
                    ? `rgba(255, 255, 255, ${Math.random() * 0.2})`
                    : `rgba(0, 0, 0, ${Math.random() * 0.3})`
                ctx.fill()
            }
        }

        // Add unique identifier patterns
        if (config.id === 'earth') {
            // Grid pattern for EduTimeSync
            ctx.strokeStyle = 'rgba(100, 200, 255, 0.2)'
            ctx.lineWidth = 1
            for (let i = 0; i < 20; i++) {
                ctx.beginPath()
                ctx.moveTo(0, i * 13)
                ctx.lineTo(512, i * 13)
                ctx.stroke()
            }
        } else if (config.id === 'jupiter') {
            // AI neural patterns for LAWNOVA
            ctx.strokeStyle = 'rgba(255, 200, 100, 0.15)'
            for (let i = 0; i < 30; i++) {
                const x = Math.random() * 512
                const y = Math.random() * 256
                ctx.beginPath()
                ctx.arc(x, y, 5 + Math.random() * 15, 0, Math.PI * 2)
                ctx.stroke()
            }
        }

        return new THREE.CanvasTexture(canvas)
    }, [config])

    // Ring texture for Saturn-like planets
    const ringTexture = useMemo(() => {
        if (!config.hasRings) return null

        const canvas = document.createElement('canvas')
        canvas.width = 256
        canvas.height = 1
        const ctx = canvas.getContext('2d')!

        const gradient = ctx.createLinearGradient(0, 0, 256, 0)
        gradient.addColorStop(0, 'rgba(200, 180, 150, 0)')
        gradient.addColorStop(0.2, 'rgba(200, 180, 150, 0.7)')
        gradient.addColorStop(0.5, 'rgba(255, 255, 255, 0.9)')
        gradient.addColorStop(0.8, 'rgba(200, 180, 150, 0.7)')
        gradient.addColorStop(1, 'rgba(200, 180, 150, 0)')

        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 256, 1)

        return new THREE.CanvasTexture(canvas)
    }, [config])

    // Calculate rotation speed based on planet size (smaller = faster rotation)
    const rotationSpeed = useMemo(() => {
        const baseSpeed = 0.2
        // Smaller planets rotate faster
        return baseSpeed * (0.8 / config.size)
    }, [config.size])

    // Orbital inclination for realism
    const orbitalInclination = useMemo(() => {
        const inclinations: Record<string, number> = {
            mercury: 0.022,
            venus: 0.059,
            earth: 0,
            mars: 0.032,
            jupiter: 0.022,
            saturn: 0.043,
            uranus: 0.013,
            neptune: 0.031
        }
        return inclinations[config.id] || 0
    }, [config.id])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (planetRef.current) {
            // Orbital motion with slight inclination
            const angle = time * config.orbitSpeed * 0.1
            const x = Math.cos(angle) * config.orbitRadius
            const z = Math.sin(angle) * config.orbitRadius
            // Y position includes orbital inclination effect
            const y = Math.sin(angle) * orbitalInclination + Math.sin(time * 0.3) * 0.05

            planetRef.current.position.set(x, y, z)
        }

        if (meshRef.current) {
            // Self-rotation at planet-specific speed
            meshRef.current.rotation.y += rotationSpeed * 0.01

            // Subtle axial wobble
            meshRef.current.rotation.x = Math.sin(time * 0.2) * 0.02 + (config.tilt || 0)

            // Scale on hover
            const targetScale = hovered ? 1.15 : 1
            meshRef.current.scale.lerp(new THREE.Vector3(targetScale, targetScale, targetScale), 0.1)
        }

        if (ringRef.current) {
            // Ring precession effect
            ringRef.current.rotation.z = time * 0.03
            ringRef.current.rotation.x = Math.PI / 2.5 + Math.sin(time * 0.1) * 0.02
        }
    })

    // Moon colors for Jupiter's features
    const moonColors = ['#ff9800', '#4caf50', '#2196f3', '#9c27b0']

    // Handle click with current world position
    const handleClick = () => {
        if (planetRef.current && onClick) {
            const worldPosition = new THREE.Vector3()
            planetRef.current.getWorldPosition(worldPosition)
            onClick(worldPosition)
        }
    }

    return (
        <group ref={planetRef}>
            <group
                onClick={handleClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Main planet */}
                <group rotation={[config.tilt || 0, 0, 0]}>
                    <mesh ref={meshRef} castShadow receiveShadow>
                        <sphereGeometry args={[config.size, 64, 64]} />
                        <meshStandardMaterial
                            map={texture}
                            metalness={0.2}
                            roughness={0.7}
                            emissive={config.emissive}
                            emissiveIntensity={hovered ? 0.3 : 0.1}
                        />
                    </mesh>

                    {/* Rings for Saturn/Uranus */}
                    {config.hasRings && ringTexture && (
                        <group ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
                            <Ring args={[config.size * 1.4, config.size * 2.2, 128]}>
                                <meshBasicMaterial
                                    map={ringTexture}
                                    transparent
                                    opacity={0.8}
                                    side={THREE.DoubleSide}
                                />
                            </Ring>
                        </group>
                    )}
                </group>

                {/* Atmosphere glow */}
                <mesh scale={1.1}>
                    <sphereGeometry args={[config.size, 32, 32]} />
                    <meshBasicMaterial
                        color={config.color}
                        transparent
                        opacity={hovered ? 0.2 : 0.1}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Hover highlight - white outline glow */}
                {hovered && (
                    <mesh scale={1.18}>
                        <sphereGeometry args={[config.size, 32, 32]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.25}
                            side={THREE.BackSide}
                        />
                    </mesh>
                )}

                {/* Outer hover glow ring */}
                {hovered && (
                    <mesh scale={1.3}>
                        <sphereGeometry args={[config.size, 24, 24]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.08}
                            side={THREE.BackSide}
                        />
                    </mesh>
                )}

                {/* Active selection indicator */}
                {isActive && (
                    <mesh rotation={[Math.PI / 2, 0, 0]}>
                        <ringGeometry args={[config.size * 1.5, config.size * 1.55, 64]} />
                        <meshBasicMaterial
                            color="#ffffff"
                            transparent
                            opacity={0.6}
                            side={THREE.DoubleSide}
                        />
                    </mesh>
                )}

                {/* Feature moons for Jupiter (LAWNOVA) */}
                {config.moons && config.moons.map((moon, index) => (
                    <FeatureMoon
                        key={moon.name}
                        name={moon.name}
                        orbitRadius={config.size * 2 + index * 0.15}
                        orbitSpeed={1.5 - index * 0.2}
                        offset={(index * Math.PI * 2) / config.moons!.length}
                        size={0.04}
                        color={moonColors[index % moonColors.length]}
                    />
                ))}

                {/* Moon orbit paths */}
                {config.moons && config.moons.map((moon, index) => (
                    <mesh key={`orbit-${moon.name}`} rotation={[Math.PI / 2, 0, 0]}>
                        <torusGeometry args={[config.size * 2 + index * 0.15, 0.002, 8, 64]} />
                        <meshBasicMaterial
                            color={moonColors[index % moonColors.length]}
                            transparent
                            opacity={0.2}
                        />
                    </mesh>
                ))}

                {/* Point light */}
                <pointLight
                    color={config.color}
                    intensity={hovered ? 0.4 : 0.15}
                    distance={3}
                    decay={2}
                />

                {/* Label */}
                {isActive && (
                    <Html position={[0, config.size + 0.8, 0]} center distanceFactor={10}>
                        <div className={`planet-label ${config.id}-label`}>
                            <h3>{config.projectName}</h3>
                            <p className="planet-name">{config.name}</p>
                            <p>{config.description.substring(0, 80)}...</p>
                            <div className="tech-stack">
                                {config.techStack.slice(0, 4).map((tech) => (
                                    <span key={tech} className="tech-tag">{tech}</span>
                                ))}
                            </div>
                        </div>
                    </Html>
                )}
            </group>
        </group>
    )
}

export default ProjectPlanet
