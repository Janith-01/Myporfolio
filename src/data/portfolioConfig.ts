// Portfolio Solar System Configuration
// Maps your projects and skills to celestial bodies

export interface ProjectMoon {
    name: string
    description: string
}

export interface ProjectPlanet {
    id: string
    name: string
    projectName: string
    description: string
    techStack: string[]
    githubUrl?: string
    liveUrl?: string
    type: 'inner' | 'gas-giant' | 'ice-giant'
    orbitRadius: number
    orbitSpeed: number
    size: number
    color: string
    emissive: string
    hasRings?: boolean
    ringColor?: string
    moons?: ProjectMoon[]
    tilt?: number
}

export interface Skill {
    name: string
    category: 'foundation' | 'certification'
}

export interface SocialLinks {
    github: string
    linkedin: string
    facebook: string
    twitter: string
}

// The Sun - Your Core Identity
export const identity = {
    name: 'Janith Viranga',
    title: 'Full Stack Developer',
    coreStack: ['React', 'Next.js', 'Node.js', 'TypeScript'],
    subtitle: 'AI Engineer & Full Stack Developer'
}

// Social Media Links
export const socialLinks: SocialLinks = {
    github: 'https://github.com/Janith-01',
    linkedin: 'https://www.linkedin.com/in/janith-viranga-100479385/',
    facebook: 'https://www.facebook.com/profile.php?id=61582216499744',
    twitter: 'https://x.com/stefer_janith'
}

// Inner Planets - Core Full-Stack & Mobile Projects
export const innerPlanets: ProjectPlanet[] = [
    {
        id: 'mercury',
        name: 'Mercury',
        projectName: 'Mobile To-Do',
        description: 'A fast, essential mobile utility app built with native mobile technologies for task management on the go.',
        techStack: ['React Native', 'SQLite', 'Mobile SDK', 'Material Design'],
        githubUrl: 'https://github.com/Janith-01/my-todo',
        type: 'inner',
        orbitRadius: 1.8,
        orbitSpeed: 4.5,
        size: 0.08,
        color: '#8c8c8c',
        emissive: '#4a4a4a',
    },
    {
        id: 'venus',
        name: 'Venus',
        projectName: 'Weather App',
        description: 'A polished weather application demonstrating API integration with OpenWeatherMap and beautiful data visualization.',
        techStack: ['JavaScript', 'OpenWeatherMap API', 'Chart.js', 'CSS3'],
        githubUrl: 'https://github.com/Janith-01/WhetherApp',
        type: 'inner',
        orbitRadius: 2.5,
        orbitSpeed: 3.5,
        size: 0.12,
        color: '#e6c87a',
        emissive: '#8b6914',
    },
    {
        id: 'earth',
        name: 'Earth',
        projectName: 'EduTimeSync',
        description: 'Academic timetable management system with conflict-free scheduling. Team-lead project with complex scheduling algorithms.',
        techStack: ['React', 'Node.js', 'MongoDB', 'Express', 'Algorithms'],
        githubUrl: 'https://github.com/NRCPerera/EduTimeSync',
        type: 'inner',
        orbitRadius: 3.2,
        orbitSpeed: 3.0,
        size: 0.14,
        color: '#4a90d9',
        emissive: '#1a4080',
    },
    {
        id: 'mars',
        name: 'Mars',
        projectName: 'Garage Management',
        description: 'Robust MERN stack application with CRUD dashboards and comprehensive inventory management for auto shops.',
        techStack: ['MongoDB', 'Express', 'React', 'Node.js', 'REST API'],
        githubUrl: 'https://github.com/Janith-01/Garage-Management-project',
        type: 'inner',
        orbitRadius: 4.0,
        orbitSpeed: 2.4,
        size: 0.10,
        color: '#c75a3a',
        emissive: '#8b3a2a',
    },
]

// Gas Giants - High-Tech & AI Projects
export const gasGiants: ProjectPlanet[] = [
    {
        id: 'jupiter',
        name: 'Jupiter',
        projectName: 'LAWNOVA',
        description: 'AI-powered legal platform for Sri Lankan law with judgment prediction, document analysis, and interactive mock trials.',
        techStack: ['React', 'Node.js', 'TypeScript', 'AI/ML', 'Supabase', 'RAG'],
        githubUrl: 'https://github.com/Janith-01/LawnovaWebapp',
        type: 'gas-giant',
        orbitRadius: 6.0,
        orbitSpeed: 1.2,
        size: 0.40,
        color: '#d4a574',
        emissive: '#8b6940',
        moons: [
            { name: 'Judgment AI', description: 'Case Judgment Prediction System' },
            { name: 'RolePlay', description: 'Interactive Legal Role-Playing Tool' },
            { name: 'DocAnalyzer', description: 'Legal Document Analysis' },
        ],
    },
    {
        id: 'saturn',
        name: 'Saturn',
        projectName: 'PipChat',
        description: 'Real-time messaging application with Socket.IO, featuring instant messaging, presence indicators, and real-time updates.',
        techStack: ['Socket.IO', 'MERN Stack', 'Node.js', 'React', 'MongoDB'],
        githubUrl: 'https://github.com/Janith-01/Real_Time-ChatApp-using-MERN',
        type: 'gas-giant',
        orbitRadius: 8.0,
        orbitSpeed: 0.9,
        size: 0.35,
        color: '#e8d5a0',
        emissive: '#a89060',
        hasRings: true,
        ringColor: '#c9b896',
        tilt: 0.4,
    },
    {
        id: 'uranus',
        name: 'Uranus',
        projectName: 'Codex',
        description: 'AI-powered code generation and assistance tool showcasing modern development practices and clean architecture.',
        techStack: ['TypeScript', 'AI Integration', 'Clean Code', 'Design Patterns'],
        githubUrl: 'https://github.com/Janith-01/codex',
        type: 'ice-giant',
        orbitRadius: 10.5,
        orbitSpeed: 0.65,
        size: 0.22,
        color: '#a8e6e6',
        emissive: '#5ab8b8',
        hasRings: true,
        ringColor: '#7ac5c5',
        tilt: 1.7,
    },
    {
        id: 'neptune',
        name: 'Neptune',
        projectName: 'Ceylux',
        description: 'An ongoing innovative project pushing the boundaries of modern web development. Currently in active development.',
        techStack: ['React', 'Node.js', 'TypeScript', 'Modern Web'],
        githubUrl: 'https://github.com/Janith-01/Ceylux',
        type: 'ice-giant',
        orbitRadius: 13.0,
        orbitSpeed: 0.5,
        size: 0.20,
        color: '#4169e1',
        emissive: '#1a3080',
    },
]

// All planets combined
export const allPlanets: ProjectPlanet[] = [...innerPlanets, ...gasGiants]

// Asteroid Belt - Foundational Skills
export const asteroidBeltSkills: Skill[] = [
    { name: 'Java', category: 'foundation' },
    { name: 'C++', category: 'foundation' },
    { name: 'PHP', category: 'foundation' },
    { name: 'Python', category: 'foundation' },
    { name: 'SQL', category: 'foundation' },
]

// Comets - AWS Certifications
export const certifications: Skill[] = [
    { name: 'AWS Cloud Security', category: 'certification' },
    { name: 'AWS Migration', category: 'certification' },
    { name: 'AWS IaC', category: 'certification' },
]

export default {
    identity,
    socialLinks,
    innerPlanets,
    gasGiants,
    allPlanets,
    asteroidBeltSkills,
    certifications,
}
