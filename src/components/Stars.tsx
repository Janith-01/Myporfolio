import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface StarsProps {
    count?: number
    radius?: number
}

const Stars: React.FC<StarsProps> = ({ count = 5000, radius = 50 }) => {
    const starsRef = useRef<THREE.Points>(null)

    const { positions, colors, sizes } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)
        const sizes = new Float32Array(count)

        const starColors = [
            new THREE.Color('#ffffff'), // White
            new THREE.Color('#ffe4c4'), // Bisque (warm white)
            new THREE.Color('#add8e6'), // Light blue
            new THREE.Color('#ffd700'), // Gold
            new THREE.Color('#87ceeb'), // Sky blue
        ]

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Spherical distribution for background stars
            const theta = Math.random() * Math.PI * 2
            const phi = Math.acos(2 * Math.random() - 1)
            const r = radius + Math.random() * 20

            positions[i3] = r * Math.sin(phi) * Math.cos(theta)
            positions[i3 + 1] = r * Math.sin(phi) * Math.sin(theta)
            positions[i3 + 2] = r * Math.cos(phi)

            // Random star color
            const starColor = starColors[Math.floor(Math.random() * starColors.length)]
            colors[i3] = starColor.r
            colors[i3 + 1] = starColor.g
            colors[i3 + 2] = starColor.b

            // Random sizes with some variation
            sizes[i] = Math.random() * 1.5 + 0.5
        }

        return { positions, colors, sizes }
    }, [count, radius])

    useFrame((state) => {
        if (starsRef.current) {
            starsRef.current.rotation.y = state.clock.elapsedTime * 0.01
            starsRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.005) * 0.02
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
                size={0.1}
                sizeAttenuation={true}
                depthWrite={false}
                vertexColors={true}
                blending={THREE.AdditiveBlending}
                transparent={true}
                opacity={0.9}
            />
        </points>
    )
}

export default Stars
