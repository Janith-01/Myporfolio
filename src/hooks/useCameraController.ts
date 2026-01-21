import { useRef, useCallback } from 'react'
import { useThree } from '@react-three/fiber'
import gsap from 'gsap'
import * as THREE from 'three'

export const useCameraController = () => {
    const { camera, controls } = useThree()
    const isAnimating = useRef(false)
    const originalPosition = useRef<THREE.Vector3>(new THREE.Vector3(0, 12, 25))
    const originalTarget = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))

    // Store original camera position on first render
    const storeOriginalPosition = useCallback(() => {
        if (!originalPosition.current.equals(camera.position)) {
            originalPosition.current.copy(camera.position)
        }
    }, [camera])

    // Zoom to a specific planet
    const zoomToPlanet = useCallback((planetPosition: THREE.Vector3, planetSize: number) => {
        if (isAnimating.current) return

        isAnimating.current = true
        storeOriginalPosition()

        // Disable controls during animation
        if (controls) {
            (controls as any).enabled = false
        }

        // Calculate target camera position (offset from planet)
        const zoomDistance = planetSize * 8 + 2
        const targetPosition = new THREE.Vector3(
            planetPosition.x + zoomDistance * 0.5,
            planetPosition.y + zoomDistance * 0.3,
            planetPosition.z + zoomDistance * 0.8
        )

        // Animate camera position
        gsap.to(camera.position, {
            x: targetPosition.x,
            y: targetPosition.y,
            z: targetPosition.z,
            duration: 1.5,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.lookAt(planetPosition)
            },
            onComplete: () => {
                isAnimating.current = false
                // Re-enable controls with new target
                if (controls) {
                    (controls as any).target.copy(planetPosition);
                    (controls as any).enabled = true;
                    (controls as any).update();
                }
            }
        })
    }, [camera, controls, storeOriginalPosition])

    // Reset camera to original position
    const resetCamera = useCallback(() => {
        if (isAnimating.current) return

        isAnimating.current = true

        // Disable controls during animation
        if (controls) {
            (controls as any).enabled = false
        }

        gsap.to(camera.position, {
            x: originalPosition.current.x,
            y: originalPosition.current.y,
            z: originalPosition.current.z,
            duration: 1.2,
            ease: 'power2.inOut',
            onUpdate: () => {
                camera.lookAt(originalTarget.current)
            },
            onComplete: () => {
                isAnimating.current = false
                if (controls) {
                    (controls as any).target.copy(originalTarget.current);
                    (controls as any).enabled = true;
                    (controls as any).update();
                }
            }
        })
    }, [camera, controls])

    return {
        zoomToPlanet,
        resetCamera,
        isAnimating: isAnimating.current
    }
}

export default useCameraController
