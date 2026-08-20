// ─── Skill Galaxy Data ─────────────────────────────────────────
// Comprehensive skills categorized into 5 cosmic constellations.

export const constellations = [
  {
    id: 'ai-ml',
    name: 'AI & Machine Learning',
    color: '#a855f7',      // Purple
    glowColor: '#c084fc',
    skills: [
      { name: 'Python',          icon: 'python',       color: '#3776AB', description: 'AI/ML modeling, automation, and core data science.' },
      { name: 'TensorFlow',      icon: 'tensorflow',   color: '#FF6F00', description: 'End-to-end open source platform for machine learning.' },
      { name: 'PyTorch',         icon: 'pytorch',      color: '#EE4C2C', description: 'Deep learning framework for computer vision and NLP.' },
      { name: 'Scikit-learn',    icon: 'scikitlearn',  color: '#F7931E', description: 'Data mining, statistical modeling, and machine learning.' },
      { name: 'OpenCV',          icon: 'opencv',       color: '#5C3EE8', description: 'Real-time computer vision and image processing.' },
      { name: 'Pandas',          icon: 'pandas',       color: '#150458', description: 'High-performance data manipulation and analysis.' },
      { name: 'NumPy',           icon: 'numpy',        color: '#013243', description: 'Scientific computing and multi-dimensional array operations.' },
      { name: 'Keras',           icon: 'keras',        color: '#D00000', description: 'High-level neural network API running on top of TensorFlow.' },
      { name: 'Machine Learning', icon: 'ml',          color: '#c084fc', description: 'Supervised, unsupervised, and reinforcement learning models.' },
      { name: 'Deep Learning',   icon: 'dl',           color: '#38bdf8', description: 'Convolutional & Recurrent Neural Networks, Transformers.' },
    ],
  },
  {
    id: 'mobile-game',
    name: 'Mobile & Game Dev',
    color: '#10b981',      // Emerald
    glowColor: '#34d399',
    skills: [
      { name: 'Java',              icon: 'java',            color: '#ED8B00', description: 'Object-oriented programming for robust backend and Android applications.' },
      { name: 'Kotlin',            icon: 'kotlin',          color: '#7F52FF', description: 'Modern, concise language for Android and multiplatform development.' },
      { name: 'C++',               icon: 'cpp',             color: '#00599C', description: 'System programming, performance-critical apps, and game development.' },
      { name: 'C',                 icon: 'c',               color: '#A8B9CC', description: 'Low-level system development and fundamental computer science.' },
      { name: 'C#',                icon: 'csharp',          color: '#239120', description: 'Primary language for game development in the Unity Engine.' },
      { name: 'Android Studio',    icon: 'androidstudio',   color: '#3DDC84', description: 'IDE for native Android application building and emulation.' },
      { name: 'Jetpack Compose',   icon: 'jetpackcompose',  color: '#4285F4', description: "Android's modern declarative UI toolkit for native layouts." },
      { name: 'Unity',             icon: 'unity',           color: '#FFFFFF', description: 'Cross-platform game development engine for 2D/3D games.' },
    ],
  },
  {
    id: 'web-3d',
    name: 'Modern Web & 3D',
    color: '#06b6d4',      // Cyan
    glowColor: '#22d3ee',
    skills: [
      { name: 'React',          icon: 'react',       color: '#61DAFB', description: 'Component-based library for building interactive user interfaces.' },
      { name: 'JavaScript',     icon: 'javascript',  color: '#F7DF1E', description: 'Core scripting language for dynamic web app development.' },
      { name: 'TypeScript',     icon: 'typescript',  color: '#3178C6', description: 'Strict syntactical superset of JavaScript adding static typing.' },
      { name: 'HTML5',          icon: 'html',         color: '#E34F26', description: 'Standard markup language for structuring responsive web pages.' },
      { name: 'CSS3',           icon: 'css',          color: '#1572B6', description: 'Styling and layout design for modern responsive websites.' },
      { name: 'Tailwind CSS',   icon: 'tailwind',     color: '#06B6D4', description: 'Utility-first CSS framework for custom responsive designs.' },
      { name: 'Bootstrap',      icon: 'bootstrap',    color: '#7952B3', description: 'Rapid styling framework with responsive grid components.' },
      { name: 'Three.js / R3F', icon: 'threejs',      color: '#049EF4', description: 'WebGL 3D rendering engine powering this interactive portfolio.' },
    ],
  },
  {
    id: 'backend-db',
    name: 'Backend & Database',
    color: '#f59e0b',      // Amber
    glowColor: '#fbbf24',
    skills: [
      { name: 'Firebase',    icon: 'firebase',    color: '#FFCA28', description: 'Backend-as-a-service platform for real-time data sync and auth.' },
      { name: 'MongoDB',     icon: 'mongodb',     color: '#47A248', description: 'Source-available cross-platform document-oriented NoSQL database.' },
      { name: 'PostgreSQL',  icon: 'postgresql',  color: '#4169E1', description: 'Powerful, open-source object-relational database system.' },
      { name: 'MySQL',       icon: 'mysql',       color: '#4479A1', description: 'Relational database management system for structured data.' },
      { name: 'SQL',         icon: 'sql',         color: '#CC2927', description: 'Structured Query Language for querying and managing databases.' },
      { name: 'Docker',      icon: 'docker',      color: '#2496ED', description: 'Containerization platform to build, ship, and run apps anywhere.' },
      { name: 'REST APIs',   icon: 'restapi',     color: '#FF6C37', description: 'Design and testing of network endpoints and web services.' },
      { name: 'PHP',         icon: 'php',         color: '#777BB4', description: 'Server-side scripting language for dynamic web development.' },
    ],
  },
  {
    id: 'tools-creative',
    name: 'Tools & Creative',
    color: '#8b5cf6',      // Violet
    glowColor: '#a78bfa',
    skills: [
      { name: 'Git',           icon: 'git',       color: '#F05032', description: 'Distributed version control system for tracking codebase changes.' },
      { name: 'GitHub',        icon: 'github',    color: '#ffffff', description: 'Platform for remote hosting, collaboration, and CI/CD.' },
      { name: 'VS Code',       icon: 'vscode',    color: '#007ACC', description: 'Preferred lightweight code editor for web and script files.' },
      { name: 'Linux',         icon: 'linux',     color: '#FCC624', description: 'Command-line operations, shell scripting, and server setup.' },
      { name: 'Figma',         icon: 'figma',     color: '#F24E1E', description: 'Collaborative design tool for UI/UX wireframing and prototyping.' },
      { name: 'Postman',       icon: 'postman',   color: '#FF6C37', description: 'API client for designing, building, and testing API requests.' },
      { name: 'Eclipse',       icon: 'eclipse',   color: '#2C2255', description: 'Classic extensible Java IDE for building desktop/web applications.' },
      { name: 'NetBeans',      icon: 'netbeans',  color: '#1B6AC6', description: "Oracle's official Java IDE for desktop and enterprise apps." },
      { name: 'Premiere Pro',  icon: 'premiere',  color: '#9999FF', description: 'Professional video editing and post-production software.' },
      { name: 'Canva',         icon: 'canva',     color: '#00C4CC', description: 'Graphic design platform for creating visuals and templates.' },
    ],
  },
]

export const allSkills = constellations.flatMap(c =>
  c.skills.map(s => ({ ...s, constellation: c.id, constellationName: c.name, constellationColor: c.color }))
)
