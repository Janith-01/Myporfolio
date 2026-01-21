import { useRef, useMemo, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere, Html } from '@react-three/drei'
import * as THREE from 'three'
import { identity } from '../data/portfolioConfig'

const Sun: React.FC = () => {
    const coronaRef = useRef<THREE.Mesh>(null)
    const glowRef = useRef<THREE.Mesh>(null)
    const outerGlowRef = useRef<THREE.Mesh>(null)
    const [hovered, setHovered] = useState(false)

    // Procedural sun texture
    const sunTexture = useMemo(() => {
        const canvas = document.createElement('canvas')
        canvas.width = 512
        canvas.height = 256
        const ctx = canvas.getContext('2d')!

        // Base gradient - hot yellow to orange
        const gradient = ctx.createRadialGradient(256, 128, 0, 256, 128, 256)
        gradient.addColorStop(0, '#fff8e1')
        gradient.addColorStop(0.2, '#ffeb3b')
        gradient.addColorStop(0.5, '#ff9800')
        gradient.addColorStop(0.8, '#ff5722')
        gradient.addColorStop(1, '#e65100')
        ctx.fillStyle = gradient
        ctx.fillRect(0, 0, 512, 256)

        // Add solar flares / granulation
        for (let i = 0; i < 1000; i++) {
            const x = Math.random() * 512
            const y = Math.random() * 256
            const radius = Math.random() * 8 + 2

            const flareGradient = ctx.createRadialGradient(x, y, 0, x, y, radius)
            flareGradient.addColorStop(0, `rgba(255, 255, 200, ${Math.random() * 0.5})`)
            flareGradient.addColorStop(0.5, `rgba(255, 200, 100, ${Math.random() * 0.3})`)
            flareGradient.addColorStop(1, 'rgba(255, 150, 50, 0)')

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = flareGradient
            ctx.fill()
        }

        // Add darker spots (sunspots)
        for (let i = 0; i < 15; i++) {
            const x = Math.random() * 512
            const y = Math.random() * 256
            const radius = Math.random() * 10 + 5

            ctx.beginPath()
            ctx.arc(x, y, radius, 0, Math.PI * 2)
            ctx.fillStyle = `rgba(100, 50, 0, ${Math.random() * 0.4})`
            ctx.fill()
        }

        const texture = new THREE.CanvasTexture(canvas)
        texture.wrapS = THREE.RepeatWrapping
        texture.wrapT = THREE.RepeatWrapping
        return texture
    }, [])

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (coronaRef.current) {
            const scale = 1 + Math.sin(time * 3) * 0.05
            coronaRef.current.scale.set(scale, scale, scale)
            coronaRef.current.rotation.y = time * 0.1
        }

        if (glowRef.current) {
            const scale = 1.3 + Math.sin(time * 2) * 0.08
            glowRef.current.scale.set(scale, scale, scale)
        }

        if (outerGlowRef.current) {
            const scale = 1.8 + Math.cos(time * 1.5) * 0.1
            outerGlowRef.current.scale.set(scale, scale, scale)
            const material = outerGlowRef.current.material as THREE.MeshBasicMaterial
            material.opacity = 0.08 + Math.sin(time * 2) * 0.03
        }
    })

    return (
        <group>
            {/* Interaction group */}
            <group
                onPointerOver={() => setHovered(true)}
                onPointerOut={() => setHovered(false)}
            >
                {/* Main sun sphere */}
                <Sphere args={[0.8, 64, 64]} position={[0, 0, 0]}>
                    <meshStandardMaterial
                        map={sunTexture}
                        emissive="#ff9800"
                        emissiveIntensity={hovered ? 2 : 1.5}
                        metalness={0}
                        roughness={1}
                    />
                </Sphere>
            </group>

            {/* Corona layer 1 */}
            <Sphere ref={coronaRef} args={[0.85, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#ffcc00"
                    transparent
                    opacity={0.3}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Inner glow */}
            <Sphere ref={glowRef} args={[0.8, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#ff6600"
                    transparent
                    opacity={0.2}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Outer glow */}
            <Sphere ref={outerGlowRef} args={[0.8, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#ff9900"
                    transparent
                    opacity={0.08}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Corona flare ring */}
            <mesh rotation={[Math.PI / 2, 0, 0]}>
                <torusGeometry args={[1.2, 0.02, 8, 64]} />
                <meshBasicMaterial
                    color="#ffaa00"
                    transparent
                    opacity={0.15}
                />
            </mesh>

            {/* Identity Label on Hover */}
            {hovered && (
                <Html position={[0, 1.8, 0]} center distanceFactor={8}>
                    <div className="sun-label">
                        <h2>{identity.name}</h2>
                        <p>{identity.title}</p>
                        <div className="core-stack">
                            {identity.coreStack.map((tech) => (
                                <span key={tech} className="stack-tag">{tech}</span>
                            ))}
                        </div>
                    </div>
                </Html>
            )}

            {/* Sun light - main illumination for the scene */}
            <pointLight
                position={[0, 0, 0]}
                color="#fff5e6"
                intensity={5}
                distance={50}
                decay={2}
            />

            {/* Secondary warm light */}
            <pointLight
                position={[0, 0, 0]}
                color="#ff9900"
                intensity={2}
                distance={20}
                decay={2}
            />
        </group>
    )
}

export default Sun
