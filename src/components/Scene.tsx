import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import * as THREE from 'three'
import SolarSystem from './SolarSystem'
import Sun from './Sun'
import Stars from './Stars'
import CertificationComets from './CertificationComets'
import CameraController from './CameraController'
import { usePerformanceSettings } from '../hooks/usePerformanceSettings'
import type { ProjectPlanet } from '../data/portfolioConfig'

interface SceneProps {
    onPlanetSelect?: (planet: ProjectPlanet | null, position?: THREE.Vector3) => void
    selectedPlanet?: ProjectPlanet | null
    cameraTarget?: THREE.Vector3 | null
}

const Scene: React.FC<SceneProps> = ({
    onPlanetSelect,
    selectedPlanet,
    cameraTarget
}) => {
    const perfSettings = usePerformanceSettings()

    return (
        <Canvas
            className="galaxy-canvas"
            dpr={perfSettings.isMobile ? [1, 1.5] : [1, 2]}
            gl={{
                antialias: !perfSettings.isLowEnd,
                alpha: true,
                powerPreference: perfSettings.isLowEnd ? 'low-power' : 'high-performance'
            }}
        >
            {/* Camera setup - adjusted for Solar System view */}
            <PerspectiveCamera
                makeDefault
                position={[0, 12, 25]}
                fov={55}
                near={0.1}
                far={200}
            />

            {/* Controls */}
            <OrbitControls
                enablePan={true}
                enableZoom={true}
                minDistance={2}
                maxDistance={60}
                autoRotate={!selectedPlanet}
                autoRotateSpeed={0.1}
                minPolarAngle={Math.PI / 6}
                maxPolarAngle={Math.PI / 2.2}
                enableDamping={true}
                dampingFactor={0.05}
            />

            {/* Camera Controller for smooth zoom */}
            <CameraController
                targetPosition={cameraTarget || null}
                targetLookAt={cameraTarget || null}
                isZooming={!!selectedPlanet}
                planetSize={selectedPlanet?.size || 0.3}
            />

            {/* Subtle ambient light for space */}
            <ambientLight intensity={0.06} color="#4a5568" />

            {/* Sun at the center - Your Identity */}
            <Sun />

            {/* Solar System with project planets */}
            <SolarSystem
                onPlanetSelect={onPlanetSelect}
                selectedPlanet={selectedPlanet?.id || null}
            />

            {/* AWS Certification Comets */}
            {!perfSettings.isLowEnd && <CertificationComets />}

            {/* Background stars - adaptive count */}
            <Stars count={perfSettings.starCount} radius={100} />

            {/* Deep space fog */}
            <fog attach="fog" args={['#000008', 40, 120]} />
        </Canvas>
    )
}

export default Scene
