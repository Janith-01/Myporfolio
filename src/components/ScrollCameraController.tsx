import { useEffect, useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import * as THREE from 'three'

// Section waypoints defining the zig-zag camera journey
// Each section has: camera position, look-at target, planet side (left/right)
export interface SectionWaypoint {
    id: string
    name: string
    cameraPosition: [number, number, number]
    lookAt: [number, number, number]
    planetPosition: 'left' | 'right'
    textPosition: 'left' | 'right'
}

export const sectionWaypoints: SectionWaypoint[] = [
    {
        id: 'sun',
        name: 'Welcome',
        cameraPosition: [0, 0, 10],
        lookAt: [-3, 0, 0],
        planetPosition: 'left',
        textPosition: 'right',
    },
    {
        id: 'mercury',
        name: 'Mercury - Mobile To-Do',
        cameraPosition: [0, -10, 20],
        lookAt: [3, -10, 0],
        planetPosition: 'right',
        textPosition: 'left',
    },
    {
        id: 'venus',
        name: 'Venus - Weather App',
        cameraPosition: [0, -20, 18],
        lookAt: [-4, -20, 0],
        planetPosition: 'left',
        textPosition: 'right',
    },
    {
        id: 'earth',
        name: 'Earth - EduTimeSync',
        cameraPosition: [0, -30, 22],
        lookAt: [5, -30, 0],
        planetPosition: 'right',
        textPosition: 'left',
    },
    {
        id: 'mars',
        name: 'Mars - Garage Management',
        cameraPosition: [0, -40, 20],
        lookAt: [-4, -40, 0],
        planetPosition: 'left',
        textPosition: 'right',
    },
    {
        id: 'jupiter',
        name: 'Jupiter - LAWNOVA',
        cameraPosition: [0, -50, 25],
        lookAt: [6, -50, 0],
        planetPosition: 'right',
        textPosition: 'left',
    },
    {
        id: 'saturn',
        name: 'Saturn - PipChat',
        cameraPosition: [0, -60, 24],
        lookAt: [-5, -60, 0],
        planetPosition: 'left',
        textPosition: 'right',
    },
    {
        id: 'uranus',
        name: 'Uranus - Codex',
        cameraPosition: [0, -70, 22],
        lookAt: [4, -70, 0],
        planetPosition: 'right',
        textPosition: 'left',
    },
    {
        id: 'neptune',
        name: 'Neptune - LawnovaWebApp',
        cameraPosition: [0, -80, 20],
        lookAt: [-4, -80, 0],
        planetPosition: 'left',
        textPosition: 'right',
    },
]

interface ScrollCameraControllerProps {
    scrollProgress: number // 0 to 1 representing scroll position
    onSectionChange?: (sectionIndex: number, section: SectionWaypoint) => void
    smoothness?: number
}

const ScrollCameraController: React.FC<ScrollCameraControllerProps> = ({
    scrollProgress,
    onSectionChange,
    smoothness = 0.05,
}) => {
    const { camera, controls } = useThree()
    const currentLookAt = useRef(new THREE.Vector3(...sectionWaypoints[0].lookAt))
    const lastSectionIndex = useRef(-1)

    // Calculate which section we're in and interpolation between sections
    const getSectionData = (progress: number) => {
        const totalSections = sectionWaypoints.length
        const sectionLength = 1 / (totalSections - 1)
        const currentSectionIndex = Math.min(
            Math.floor(progress / sectionLength),
            totalSections - 2
        )
        const localProgress = (progress - currentSectionIndex * sectionLength) / sectionLength

        return {
            fromIndex: currentSectionIndex,
            toIndex: Math.min(currentSectionIndex + 1, totalSections - 1),
            progress: Math.max(0, Math.min(1, localProgress)),
        }
    }

    // Ease function for smoother transitions
    const easeInOutCubic = (t: number): number => {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2
    }

    useFrame((_state, delta) => {
        if (!controls) return

        const orbitControls = controls as any

        // Disable orbit controls during scroll animation
        orbitControls.enabled = false
        orbitControls.autoRotate = false

        const { fromIndex, toIndex, progress } = getSectionData(scrollProgress)
        const easedProgress = easeInOutCubic(progress)

        const fromSection = sectionWaypoints[fromIndex]
        const toSection = sectionWaypoints[toIndex]

        // Interpolate camera position
        const targetCameraPosition = new THREE.Vector3(
            THREE.MathUtils.lerp(fromSection.cameraPosition[0], toSection.cameraPosition[0], easedProgress),
            THREE.MathUtils.lerp(fromSection.cameraPosition[1], toSection.cameraPosition[1], easedProgress),
            THREE.MathUtils.lerp(fromSection.cameraPosition[2], toSection.cameraPosition[2], easedProgress)
        )

        // Interpolate look-at target
        const targetLookAt = new THREE.Vector3(
            THREE.MathUtils.lerp(fromSection.lookAt[0], toSection.lookAt[0], easedProgress),
            THREE.MathUtils.lerp(fromSection.lookAt[1], toSection.lookAt[1], easedProgress),
            THREE.MathUtils.lerp(fromSection.lookAt[2], toSection.lookAt[2], easedProgress)
        )

        // Smooth camera movement using damp3
        damp3(camera.position, targetCameraPosition, smoothness, delta)
        damp3(currentLookAt.current, targetLookAt, smoothness, delta)

        // Make camera look at the target
        camera.lookAt(currentLookAt.current)

        // Update orbit controls target
        orbitControls.target.copy(currentLookAt.current)

        // Notify section changes
        const currentSection = progress > 0.5 ? toIndex : fromIndex
        if (currentSection !== lastSectionIndex.current) {
            lastSectionIndex.current = currentSection
            onSectionChange?.(currentSection, sectionWaypoints[currentSection])
        }

        orbitControls.update()
    })

    // Initialize camera on mount
    useEffect(() => {
        const initialSection = sectionWaypoints[0]
        camera.position.set(...initialSection.cameraPosition)
        camera.lookAt(new THREE.Vector3(...initialSection.lookAt))
    }, [camera])

    return null
}

export default ScrollCameraController
