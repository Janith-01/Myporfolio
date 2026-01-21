import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html, Trail } from '@react-three/drei'
import * as THREE from 'three'

interface PipChatMoonProps {
    parentPosition?: [number, number, number]
    orbitRadius?: number
    orbitSpeed?: number
    onClick?: () => void
    isActive?: boolean
}

const PipChatMoon: React.FC<PipChatMoonProps> = ({
    parentPosition: _parentPosition = [4, 0.5, -2], // Kept for API compatibility, position calculated dynamically
    orbitRadius = 2.0,
    orbitSpeed = 0.35,
    onClick,
    isActive = false,
}) => {
    const moonRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)
    const pulseRef = useRef<THREE.Mesh>(null)
    const signalRef = useRef<THREE.Group>(null)
    const dataPacketsRef = useRef<THREE.Points>(null)
    const [hovered, setHovered] = useState(false)

    // Procedural moon texture with real-time/communication theme
    const moonTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 256
        const ctx = canvas.getContext('2d')!

        // Base color - cyan/teal for real-time communication
        const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256)
        gradient.addColorStop(0, '#00ffd4')
        gradient.addColorStop(0.3, '#00d4aa')
        gradient.addColorStop(0.6, '#0a9f8a')
        gradient.addColorStop(1, '#064e42')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)

        // Add circuit-like patterns (representing WebSocket connections)
        ctx.strokeStyle = 'rgba(0, 255, 200, 0.3)'
        ctx.lineWidth = 1
        for (let i = 0; i < 30; i++) {
            ctx.beginPath()
            let x = Math.random() * 512
            let y = Math.random() * 256
            ctx.moveTo(x, y)

            // Draw angular paths like circuit traces
            for (let j = 0; j < 6; j++) {
                if (Math.random() > 0.5) {
                    x += (Math.random() > 0.5 ? 1 : -1) * (20 + Math.random() * 40)
                } else {
                    y += (Math.random() > 0.5 ? 1 : -1) * (10 + Math.random() * 20)
                }
                ctx.lineTo(x, y)
            }
            ctx.stroke()
        }

        // Add node points (connection endpoints)
        for (let i = 0; i < 60; i++) {
            const x = Math.random() * 512
            const y = Math.random() * 256
            const radius = Math.random() * 4 + 2

            // Glowing node
            const nodeGradient = ctx.createRadialGradient(x, y, 0, x, y, radius * 2)
            nodeGradient.addColorStop(0, 'rgba(0, 255, 220, 0.9)')
            nodeGradient.addColorStop(0.5, 'rgba(0, 212, 170, 0.4)')
            nodeGradient.addColorStop(1, 'rgba(0, 212, 170, 0)')

            ctx.beginPath()
            ctx.arc(x, y, radius * 2, 0, Math.PI * 2)
            ctx.fillStyle = nodeGradient
            ctx.fill()

            // Center dot
            ctx.beginPath()
            ctx.arc(x, y, radius * 0.5, 0, Math.PI * 2)
            ctx.fillStyle = '#00fff0'
            ctx.fill()
        }

        // Add data stream lines
        for (let i = 0; i < 15; i++) {
            ctx.beginPath()
            const y = Math.random() * 256
            ctx.moveTo(0, y)
            ctx.lineTo(512, y + (Math.random() - 0.5) * 20)
            ctx.strokeStyle = `rgba(0, 255, 200, ${Math.random() * 0.15})`
            ctx.lineWidth = Math.random() * 2 + 0.5
            ctx.stroke()
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        return texture
    }, [])

    // Data packets geometry for particle effect
    const dataPackets = useMemo(() => {
        const count = 50
        const positions = new Float32Array(count * 3)
        const speeds = new Float32Array(count)
        const offsets = new Float32Array(count)

        for (let i = 0; i < count; i++) {
            positions[i * 3] = (Math.random() - 0.5) * 0.8
            positions[i * 3 + 1] = (Math.random() - 0.5) * 0.8
            positions[i * 3 + 2] = (Math.random() - 0.5) * 0.8
            speeds[i] = Math.random() * 2 + 1
            offsets[i] = Math.random() * Math.PI * 2
        }

        return { positions, speeds, offsets, count }
    }, [])

    // Animation - orbital motion around parent (which is also orbiting the sun)
    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (moonRef.current) {
            // Calculate parent's current position (LawnovaPlanet orbits at radius 14, speed 0.08)
            const parentOrbitSpeed = 0.08
            const parentOrbitRadius = 14
            const parentAngle = time * parentOrbitSpeed

            const parentX = Math.cos(parentAngle) * parentOrbitRadius
            const parentZ = Math.sin(parentAngle) * parentOrbitRadius
            const parentY = Math.sin(time * 0.5) * 0.15

            // Moon's orbital motion around the moving parent
            const moonAngle = time * orbitSpeed
            const x = parentX + Math.cos(moonAngle) * orbitRadius
            const z = parentZ + Math.sin(moonAngle) * orbitRadius
            const y = parentY + Math.sin(moonAngle * 2) * 0.15

            moonRef.current.position.set(x, y, z)
        }

        if (meshRef.current) {
            // Self rotation
            meshRef.current.rotation.y = time * 0.5
            meshRef.current.rotation.x = Math.sin(time * 0.3) * 0.1

            // Scale on hover
            const targetScale = hovered ? 1.15 : 1
            meshRef.current.scale.lerp(
                new THREE.Vector3(targetScale, targetScale, targetScale),
                0.1
            )
        }

        if (pulseRef.current) {
            // Pulsing effect for real-time indicator
            const pulseScale = 1 + Math.sin(time * 5) * 0.15
            pulseRef.current.scale.set(pulseScale, pulseScale, pulseScale)
            const material = pulseRef.current.material as THREE.MeshBasicMaterial
            material.opacity = 0.1 + Math.sin(time * 5) * 0.08
        }

        if (signalRef.current) {
            // Signal wave animation - faster spin when hovered
            signalRef.current.rotation.z = time * (hovered ? 4 : 2)
            signalRef.current.rotation.x = Math.sin(time) * 0.2
        }

        // Animate data packets
        if (dataPacketsRef.current) {
            const positions = dataPacketsRef.current.geometry.attributes.position.array as Float32Array
            for (let i = 0; i < dataPackets.count; i++) {
                const i3 = i * 3
                const speed = dataPackets.speeds[i]
                const offset = dataPackets.offsets[i]

                // Orbit around the moon
                const packetAngle = time * speed + offset
                const radius = 0.3 + Math.sin(time * 2 + offset) * 0.05
                positions[i3] = Math.cos(packetAngle) * radius
                positions[i3 + 1] = Math.sin(packetAngle * 0.5) * 0.15
                positions[i3 + 2] = Math.sin(packetAngle) * radius
            }
            dataPacketsRef.current.geometry.attributes.position.needsUpdate = true
        }
    })

    return (
        <group ref={moonRef}>
            <group
                onClick={onClick}
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Main moon sphere */}
                <mesh ref={meshRef} castShadow>
                    <sphereGeometry args={[0.25, 32, 32]} />
                    <meshStandardMaterial
                        map={moonTexture}
                        metalness={0.5}
                        roughness={0.4}
                        emissive="#00d4aa"
                        emissiveIntensity={hovered ? 0.4 : 0.25}
                    />
                </mesh>

                {/* Real-time pulse effect */}
                <mesh ref={pulseRef} scale={1.4}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshBasicMaterial
                        color="#00ffcc"
                        transparent
                        opacity={0.12}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Outer glow */}
                <mesh scale={1.6}>
                    <sphereGeometry args={[0.25, 16, 16]} />
                    <meshBasicMaterial
                        color="#00aa88"
                        transparent
                        opacity={0.05}
                        side={THREE.BackSide}
                    />
                </mesh>

                {/* Data packets particles */}
                <points ref={dataPacketsRef}>
                    <bufferGeometry>
                        <bufferAttribute
                            attach="attributes-position"
                            args={[dataPackets.positions, 3]}
                        />
                    </bufferGeometry>
                    <pointsMaterial
                        size={0.02}
                        color="#00ffcc"
                        transparent
                        opacity={0.8}
                        sizeAttenuation={true}
                        blending={THREE.AdditiveBlending}
                    />
                </points>

                {/* Signal rings (representing real-time data transmission) */}
                <group ref={signalRef}>
                    {[0, 1, 2, 3].map((i) => (
                        <mesh key={i} rotation={[Math.PI / 2, 0, (i * Math.PI) / 4]}>
                            <torusGeometry args={[0.32 + i * 0.06, 0.006, 8, 32]} />
                            <meshBasicMaterial
                                color={i % 2 === 0 ? "#00ffcc" : "#00ffaa"}
                                transparent
                                opacity={0.5 - i * 0.1}
                            />
                        </mesh>
                    ))}
                </group>

                {/* Connection status indicator */}
                <mesh position={[0.18, 0.18, 0]}>
                    <sphereGeometry args={[0.035, 12, 12]} />
                    <meshBasicMaterial color="#00ff88" />
                </mesh>

                {/* Secondary indicator - blinking */}
                <mesh position={[-0.15, 0.2, 0.1]}>
                    <sphereGeometry args={[0.02, 8, 8]} />
                    <meshBasicMaterial
                        color="#ffcc00"
                        transparent
                    />
                </mesh>

                {/* Subtle glow lights */}
                <pointLight
                    color="#00d4aa"
                    intensity={hovered ? 0.6 : 0.35}
                    distance={2.5}
                    decay={2}
                />
                <pointLight
                    color="#00ffcc"
                    intensity={0.15}
                    distance={1}
                    decay={2}
                    position={[0, 0.3, 0]}
                />

                {/* Label */}
                {isActive && (
                    <Html
                        position={[0, 0.7, 0]}
                        center
                        distanceFactor={8}
                        style={{
                            transition: 'all 0.3s ease',
                            pointerEvents: 'none',
                        }}
                    >
                        <div className="planet-label moon-label">
                            <h3>PipChat</h3>
                            <p>Real-Time Messaging</p>
                            <span className="tech-stack">Socket.IO • WebRTC • Node.js • MongoDB</span>
                        </div>
                    </Html>
                )}
            </group>

            {/* Orbital trail */}
            <Trail
                width={0.4}
                length={10}
                color="#00d4aa"
                attenuation={(t) => t * t * t}
            >
                <mesh visible={false}>
                    <sphereGeometry args={[0.01]} />
                </mesh>
            </Trail>
        </group>
    )
}

export default PipChatMoon
