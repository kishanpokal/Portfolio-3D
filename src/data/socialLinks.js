// Social Links Configuration
// Wired directly to your actual profiles!

export const socialLinks = [
  {
    id: 'github',
    type: 'github',
    label: 'GitHub',
    color: '#8B5CF6',
    url: 'https://github.com/kishanpokal',
  },
  {
    id: 'linkedin',
    type: 'linkedin',
    label: 'LinkedIn',
    color: '#0077B5',
    url: 'https://linkedin.com/in/kishanpokal956',
  },
  {
    id: 'instagram',
    type: 'instagram',
    label: 'Instagram',
    color: '#E1306C',
    url: 'https://instagram.com/kishan._.pokal',
  },
  {
    id: 'email',
    type: 'email',
    label: 'Email Me',
    color: '#10B981',
    url: 'mailto:contact@kishanpokal.com',
  },
  {
    id: 'resume',
    type: 'resume',
    label: 'Resume',
    color: '#F59E0B',
    url: '/Kishan_resume.pdf',
  },
]

// Pedestal positions — pentagonal ring around island center [38, Y, 0]
// Exactly aligned above each statue_column pedestal
export const cubePositions = [
  [-4.0,   2.55, -2.59],  // GitHub      (pillar at [34, 0.66, -2.59])
  [5.04,   2.65, -1.55],  // LinkedIn    (pillar at [43.04, 0.65, -1.55])
  [0.0,    2.58, -2.9],   // Instagram   (pillar at [38, 0.66, -2.9])
  [2.87,   2.65,  1.86],  // Email       (pillar at [40.87, 0.65, 1.86])
  [-3.23,  2.54,  2.33],  // Resume      (pillar at [34.77, 0.65, 2.33])
]
