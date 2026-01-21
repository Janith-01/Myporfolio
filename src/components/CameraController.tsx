import { useRef, useEffect } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { damp3 } from 'maath/easing'
import * as THREE from 'three'

interface CameraControllerProps {
    targetPosition: THREE.Vector3 | null
    targetLookAt: THREE.Vector3 | null
    isZooming: boolean
    planetSize?: number
    onZoomComplete?: () => void
}

const CameraController: React.FC<CameraControllerProps> = ({
    targetPosition,
    targetLookAt,
    isZooming,
    planetSize = 0.3,
    onZoomComplete
}) => {
    const { camera, controls } = useThree()
    const defaultPosition = useRef(new THREE.Vector3(0, 12, 25))
    const defaultLookAt = useRef(new THREE.Vector3(0, 0, 0))
    const currentLookAt = useRef(new THREE.Vector3(0, 0, 0))
    const hasCalledComplete = useRef(false)
    const smoothness = 0.08 // Lower = smoother but slower

    // Store initial camera position
    useEffect(() => {
        defaultPosition.current.copy(camera.position)
    }, [camera])

    useFrame((_state, delta) => {
        if (!controls) return

        const orbitControls = controls as any

        // Disable orbit controls auto-rotate during zoom
        if (isZooming && targetPosition && targetLookAt) {
            orbitControls.autoRotate = false

            // Calculate target camera position (offset from planet for good view)
            const zoomDistance = planetSize * 6 + 1.5
            const cameraTarget = new THREE.Vector3(
                targetLookAt.x + zoomDistance * 0.6,
                targetLookAt.y + zoomDistance * 0.4,
                targetLookAt.z + zoomDistance * 0.8
            )

            // Smooth interpolation to target position using damp3
            damp3(camera.position, cameraTarget, smoothness, delta)

            // Smooth interpolation of lookAt target
            damp3(currentLookAt.current, targetLookAt, smoothness, delta)

            // Update orbit controls target
            orbitControls.target.copy(currentLookAt.current)

            // Check if camera is close enough to target
            const distanceToTarget = camera.position.distanceTo(cameraTarget)
            if (distanceToTarget < 0.1 && !hasCalledComplete.current) {
                hasCalledComplete.current = true
                if (onZoomComplete) {
                    onZoomComplete()
                }
            }
        } else if (!isZooming) {
            // Return to default position
            hasCalledComplete.current = false

            damp3(camera.position, defaultPosition.current, smoothness * 0.8, delta)
            damp3(currentLookAt.current, defaultLookAt.current, smoothness * 0.8, delta)

            orbitControls.target.copy(currentLookAt.current)

            // Check if camera is back to default
            const distanceToDefault = camera.position.distanceTo(defaultPosition.current)
            if (distanceToDefault < 0.5) {
                orbitControls.autoRotate = true
            }
        }

        // Always update controls
        orbitControls.update()
    })

    return null
}

export default CameraController
