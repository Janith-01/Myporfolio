import { useState, useEffect, useMemo } from 'react'

interface PerformanceSettings {
    isMobile: boolean
    isLowEnd: boolean
    starCount: number
    asteroidCount: number
    textureSize: number
    geometryDetail: number
    enablePostProcessing: boolean
    enableShadows: boolean
}

export const usePerformanceSettings = (): PerformanceSettings => {
    const [deviceInfo, setDeviceInfo] = useState({
        isMobile: false,
        isLowEnd: false,
        gpuTier: 'high' as 'low' | 'medium' | 'high'
    })

    useEffect(() => {
        // Detect mobile devices
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
            navigator.userAgent
        ) || window.innerWidth < 768

        // Detect low-end devices based on hardware concurrency and memory
        const cores = navigator.hardwareConcurrency || 4
        const memory = (navigator as any).deviceMemory || 8
        const isLowEnd = cores < 4 || memory < 4 || isMobile

        // Determine GPU tier (simplified detection)
        let gpuTier: 'low' | 'medium' | 'high' = 'high'

        try {
            const canvas = document.createElement('canvas')
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
            if (gl) {
                const debugInfo = (gl as WebGLRenderingContext).getExtension('WEBGL_debug_renderer_info')
                if (debugInfo) {
                    const renderer = (gl as WebGLRenderingContext).getParameter(debugInfo.UNMASKED_RENDERER_WEBGL)
                    // Check for integrated graphics or low-end GPUs
                    if (/Intel|Mali|Adreno 3|Adreno 4|PowerVR/i.test(renderer)) {
                        gpuTier = isMobile ? 'low' : 'medium'
                    }
                }
            }
        } catch (e) {
            console.warn('GPU detection failed, using defaults')
        }

        setDeviceInfo({ isMobile, isLowEnd, gpuTier })
    }, [])

    const settings = useMemo<PerformanceSettings>(() => {
        const { isMobile, isLowEnd, gpuTier } = deviceInfo

        if (gpuTier === 'low' || (isMobile && isLowEnd)) {
            return {
                isMobile: true,
                isLowEnd: true,
                starCount: 3000,
                asteroidCount: 500,
                textureSize: 256,
                geometryDetail: 32,
                enablePostProcessing: false,
                enableShadows: false
            }
        }

        if (gpuTier === 'medium' || isMobile) {
            return {
                isMobile,
                isLowEnd: false,
                starCount: 8000,
                asteroidCount: 1500,
                textureSize: 512,
                geometryDetail: 48,
                enablePostProcessing: false,
                enableShadows: false
            }
        }

        // High-end desktop
        return {
            isMobile: false,
            isLowEnd: false,
            starCount: 15000,
            asteroidCount: 3000,
            textureSize: 1024,
            geometryDetail: 64,
            enablePostProcessing: true,
            enableShadows: true
        }
    }, [deviceInfo])

    return settings
}

export default usePerformanceSettings
