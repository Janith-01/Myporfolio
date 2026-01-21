import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface GalaxyProps {
    count?: number
    radius?: number
    branches?: number
    spin?: number
    randomness?: number
    randomnessPower?: number
    insideColor?: string
    outsideColor?: string
}

const Galaxy: React.FC<GalaxyProps> = ({
    count = 15000,
    radius = 5,
    branches = 5,
    spin = 1,
    randomness = 0.3,
    randomnessPower = 3,
    insideColor = '#ff6030',
    outsideColor = '#1b3984',
}) => {
    const pointsRef = useRef<THREE.Points>(null)

    // Generate galaxy geometry with spiral arms
    const { positions, colors } = useMemo(() => {
        const positions = new Float32Array(count * 3)
        const colors = new Float32Array(count * 3)

        const colorInside = new THREE.Color(insideColor)
        const colorOutside = new THREE.Color(outsideColor)

        for (let i = 0; i < count; i++) {
            const i3 = i * 3

            // Position calculations for spiral galaxy
            const radiusValue = Math.random() * radius
            const spinAngle = radiusValue * spin
            const branchAngle = ((i % branches) / branches) * Math.PI * 2

            // Add randomness with power curve for more concentration near center
            const randomX = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusValue
            const randomY = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusValue
            const randomZ = Math.pow(Math.random(), randomnessPower) * (Math.random() < 0.5 ? 1 : -1) * randomness * radiusValue

            // Calculate spiral position
            positions[i3] = Math.cos(branchAngle + spinAngle) * radiusValue + randomX
            positions[i3 + 1] = randomY * 0.3 // Flatten the galaxy
            positions[i3 + 2] = Math.sin(branchAngle + spinAngle) * radiusValue + randomZ

            // Color gradient from center to edge
            const mixedColor = colorInside.clone()
            mixedColor.lerp(colorOutside, radiusValue / radius)

            colors[i3] = mixedColor.r
            colors[i3 + 1] = mixedColor.g
            colors[i3 + 2] = mixedColor.b
        }

        return { positions, colors }
    }, [count, radius, branches, spin, randomness, randomnessPower, insideColor, outsideColor])

    // Animate rotation
    useFrame((state) => {
        if (pointsRef.current) {
            pointsRef.current.rotation.y = state.clock.elapsedTime * 0.05
        }
    })

    return (
        <points ref={pointsRef}>
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
                size={0.02}
                sizeAttenuation={true}
                depthWrite={false}
                vertexColors={true}
                blending={THREE.AdditiveBlending}
                transparent={true}
                opacity={0.8}
            />
        </points>
    )
}

export default Galaxy
