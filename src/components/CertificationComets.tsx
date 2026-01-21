import { useRef, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Trail } from '@react-three/drei'
import * as THREE from 'three'
import { certifications } from '../data/portfolioConfig'

interface CometProps {
    name: string
    orbitRadius: number
    orbitSpeed: number
    orbitTilt: number
    offset: number
    color: string
}

const Comet: React.FC<CometProps> = ({
    orbitRadius,
    orbitSpeed,
    orbitTilt,
    offset,
    color
}) => {
    const cometRef = useRef<THREE.Group>(null)
    const meshRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (cometRef.current) {
            // Elliptical orbit
            const angle = time * orbitSpeed + offset
            const a = orbitRadius // semi-major axis
            const b = orbitRadius * 0.4 // semi-minor axis (eccentric orbit)

            cometRef.current.position.x = Math.cos(angle) * a
            cometRef.current.position.z = Math.sin(angle) * b
            cometRef.current.position.y = Math.sin(angle) * orbitTilt
        }

        if (meshRef.current) {
            // Point comet towards direction of travel
            meshRef.current.rotation.z = Math.atan2(
                Math.cos((state.clock.elapsedTime * orbitSpeed + offset)),
                -Math.sin((state.clock.elapsedTime * orbitSpeed + offset)) * 0.4
            )
        }
    })

    return (
        <group ref={cometRef}>
            <Trail
                width={0.15}
                length={12}
                color={color}
                attenuation={(t) => t * t * t}
            >
                <mesh ref={meshRef}>
                    <sphereGeometry args={[0.03, 8, 8]} />
                    <meshBasicMaterial color="#ffffff" />
                </mesh>
            </Trail>

            {/* Comet coma (glow) */}
            <mesh>
                <sphereGeometry args={[0.06, 8, 8]} />
                <meshBasicMaterial
                    color={color}
                    transparent
                    opacity={0.4}
                />
            </mesh>
        </group>
    )
}

// Container for all certification comets
const CertificationComets: React.FC = () => {
    const cometConfigs = useMemo(() => [
        {
            name: certifications[0]?.name || 'AWS Security',
            orbitRadius: 16,
            orbitSpeed: 0.15,
            orbitTilt: 3,
            offset: 0,
            color: '#ff6b35'
        },
        {
            name: certifications[1]?.name || 'AWS Migration',
            orbitRadius: 18,
            orbitSpeed: 0.12,
            orbitTilt: -4,
            offset: Math.PI * 0.7,
            color: '#00d4aa'
        },
        {
            name: certifications[2]?.name || 'AWS IaC',
            orbitRadius: 20,
            orbitSpeed: 0.1,
            orbitTilt: 2,
            offset: Math.PI * 1.4,
            color: '#ffd700'
        },
    ], [])

    return (
        <group>
            {cometConfigs.map((config) => (
                <Comet key={config.name} {...config} />
            ))}
        </group>
    )
}

export default CertificationComets
