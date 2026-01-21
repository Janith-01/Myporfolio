import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Sphere } from '@react-three/drei'
import * as THREE from 'three'

const BlackHoleCore: React.FC = () => {
    const glowRef = useRef<THREE.Mesh>(null)
    const coreRef = useRef<THREE.Mesh>(null)
    const ringRef = useRef<THREE.Mesh>(null)

    useFrame((state) => {
        const time = state.clock.elapsedTime

        if (glowRef.current) {
            // Pulsing glow effect
            const scale = 1 + Math.sin(time * 2) * 0.1
            glowRef.current.scale.set(scale, scale, scale)
        }

        if (ringRef.current) {
            ringRef.current.rotation.z = time * 0.5
            ringRef.current.rotation.x = Math.PI / 2 + Math.sin(time * 0.3) * 0.1
        }
    })

    return (
        <group>
            {/* Dark core (Black Hole) */}
            <Sphere ref={coreRef} args={[0.15, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial color="#000000" />
            </Sphere>

            {/* Glowing accretion disk glow */}
            <Sphere ref={glowRef} args={[0.25, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#ff6b35"
                    transparent={true}
                    opacity={0.4}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Outer glow */}
            <Sphere args={[0.4, 32, 32]} position={[0, 0, 0]}>
                <meshBasicMaterial
                    color="#ff4500"
                    transparent={true}
                    opacity={0.15}
                    side={THREE.BackSide}
                />
            </Sphere>

            {/* Accretion ring */}
            <mesh ref={ringRef} position={[0, 0, 0]}>
                <torusGeometry args={[0.5, 0.05, 16, 100]} />
                <meshStandardMaterial
                    color="#ff6030"
                    emissive="#ff4500"
                    emissiveIntensity={2}
                    transparent={true}
                    opacity={0.8}
                />
            </mesh>

            {/* Point light emanating from the core */}
            <pointLight
                position={[0, 0, 0]}
                color="#ff6b35"
                intensity={3}
                distance={15}
                decay={2}
            />
        </group>
    )
}

export default BlackHoleCore
