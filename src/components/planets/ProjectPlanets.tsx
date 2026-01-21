import { useState, useCallback } from 'react'
import LawnovaPlanet from './LawnovaPlanet'
import PipChatMoon from './PipChatMoon'

interface Project {
    id: string
    name: string
    description: string
    techStack: string[]
    githubUrl: string
    liveUrl?: string
}

const projects: Record<string, Project> = {
    lawnova: {
        id: 'lawnova',
        name: 'LAWNOVA',
        description: 'AI-powered legal platform for Sri Lankan law with judgment prediction, document analysis, and interactive mock trials.',
        techStack: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'Supabase'],
        githubUrl: 'https://github.com/yourusername/lawnova',
        liveUrl: 'https://lawnova.app',
    },
    pipchat: {
        id: 'pipchat',
        name: 'PipChat',
        description: 'Real-time messaging application with Socket.IO, featuring instant messaging, presence indicators, and collaborative editing.',
        techStack: ['Socket.IO', 'WebRTC', 'Node.js', 'React', 'MongoDB'],
        githubUrl: 'https://github.com/yourusername/pipchat',
    },
}

interface ProjectPlanetsProps {
    onProjectSelect?: (project: Project | null) => void
}

const ProjectPlanets: React.FC<ProjectPlanetsProps> = ({ onProjectSelect }) => {
    const [activeProject, setActiveProject] = useState<string | null>(null)

    const handlePlanetClick = useCallback((projectId: string) => {
        const newActive = activeProject === projectId ? null : projectId
        setActiveProject(newActive)
        onProjectSelect?.(newActive ? projects[newActive] : null)
    }, [activeProject, onProjectSelect])

    return (
        <group>
            {/* LAWNOVA Planet - Outer orbit beyond Neptune (like a newly discovered exoplanet) */}
            <LawnovaPlanet
                position={[14, 0, 0]}
                onClick={() => handlePlanetClick('lawnova')}
                isActive={activeProject === 'lawnova'}
            />

            {/* PipChat Moon - Orbiting LAWNOVA */}
            <PipChatMoon
                parentPosition={[14, 0, 0]}
                orbitRadius={2.0}
                orbitSpeed={0.35}
                onClick={() => handlePlanetClick('pipchat')}
                isActive={activeProject === 'pipchat'}
            />
        </group>
    )
}

export { projects }
export type { Project }
export default ProjectPlanets
