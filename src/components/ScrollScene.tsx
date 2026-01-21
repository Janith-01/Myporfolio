import { Canvas } from '@react-three/fiber'
import { OrbitControls, PerspectiveCamera } from '@react-three/drei'
import ScrollCameraController, { sectionWaypoints, type SectionWaypoint } from './ScrollCameraController'
import ScrollPlanets from './ScrollPlanets'
import Stars from './Stars'
import { usePerformanceSettings } from '../hooks/usePerformanceSettings'

interface ScrollSceneProps {
    scrollProgress: number
    activeSection: number
    onSectionChange?: (sectionIndex: number, section: SectionWaypoint) => void
}

const ScrollScene: React.FC<ScrollSceneProps> = ({
    scrollProgress,
    activeSection,
    onSectionChange,
}) => {
    const perfSettings = usePerformanceSettings()

    return (
        <Canvas
            className="galaxy-canvas"
            dpr={perfSettings.isMobile ? [1, 1.5] : [1, 2]}
            gl={{
                antialias: !perfSettings.isLowEnd,
                alpha: true,
                powerPreference: perfSettings.isLowEnd ? 'low-power' : 'high-performance',
            }}
        >
            {/* Camera setup - initial position from first waypoint */}
            <PerspectiveCamera
                makeDefault
                position={sectionWaypoints[0].cameraPosition}
                fov={60}
                near={0.1}
                far={300}
            />

            {/* Disabled orbit controls - camera controlled by scroll */}
            <OrbitControls
                enabled={false}
                enablePan={false}
                enableZoom={false}
                enableRotate={false}
            />

            {/* Scroll-driven camera controller */}
            <ScrollCameraController
                scrollProgress={scrollProgress}
                onSectionChange={onSectionChange}
                smoothness={0.08}
            />

            {/* Very subtle ambient light */}
            <ambientLight intensity={0.03} color="#1a1a2e" />

            {/* All scroll planets (sun + planets at their scroll positions) */}
            <ScrollPlanets activeSection={activeSection} />

            {/* Background stars - fewer since we have section-specific stars */}
            <Stars count={perfSettings.isLowEnd ? 500 : 1500} radius={150} />

            {/* Deep space gradient fog */}
            <fog attach="fog" args={['#000010', 60, 200]} />
        </Canvas>
    )
}

export default ScrollScene
