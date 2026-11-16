/* =====================================================================
   DEFAULT SETTINGS
   Everything on the page comes from this object. Edit it here, or press
   Ctrl/Cmd + Shift + E on the page (or add ?edit to the address) to open
   the Customize panel. Panel changes are saved in the browser (localStorage)
   and can be exported as JSON from the Data section.
   ===================================================================== */
export const DEFAULTS = {
  site: {
    name: 'Yamuna Khadka',
    role: 'Full Stack Developer',
    roles: ['Frontend Developer', 'Backend Developer', 'MERN Stack Developer'],
    available: '',
    chip: "Let's meet!",
    specialization: 'Full Stack Developer',
    location: 'Kathmandu, Nepal',
    intro:
      'I design interfaces, build APIs and shape databases, then ship them as complete web apps.',
    building: '',
    photo: '',
    email: 'yamunakdk7@gmail.com',
    phone: '',
    github: 'https://github.com/yamunakdk17',
    linkedin: 'https://www.linkedin.com/in/yamuna-khadka-299602373/',
    instagram: '',
    cvUrl: '',
    introWord: 'hello',
  },
  look: { g1: '#ecc0cc', g2: '#c9bcf2', theme: 'dark' },
  features: {
    intro: true,
    particles: true,
    aurora: true,
    cursor: false,
    marquee: true,
    progress: true,
    themeToggle: true,
    toTop: true,
    projectFilter: true,
    scrollToolkit: true,
    stats: false,
    skillBars: true,
    contactForm: true,
  },
  sections: [
    {
      id: 'work',
      on: true,
      nav: true,
      label: 'Portfolio',
      kicker: 'Portfolio',
      title: "Projects I've {built}, start to finish.",
      lead: "From the first screen to the last query. Here are a few I'm proud of.",
    },
    {
      id: 'about',
      on: true,
      nav: true,
      label: 'About Me',
      kicker: 'About me',
      title: 'Turning ideas into {working software}.',
      lead: '',
    },
    {
      id: 'stack',
      on: true,
      nav: true,
      label: 'Tech Stack',
      kicker: 'Tech stack',
      title: 'The tools I reach for {every day}.',
      lead: 'From the browser to the server and the database behind it.',
    },
    {
      id: 'resume',
      on: true,
      nav: true,
      label: 'Resume',
      kicker: 'Resume',
      title: 'Education and {experience}.',
      lead: '',
    },
    {
      id: 'achievements',
      on: true,
      nav: true,
      label: 'Achievements',
      kicker: 'Achievements',
      title: 'Certifications and {milestones}.',
      lead: 'Things that back up the work.',
    },
    {
      id: 'contact',
      on: true,
      nav: true,
      label: 'Contact',
      kicker: 'Contact',
      title: "Let's build something {together}.",
      lead: "Have a project in mind, a role to talk about, or just want to say hello? Send a message and I'll get back to you as soon as I can.",
    },
  ],
  marquee: [
    'React',
    'Node.js',
    'Express',
    'MySQL',
    'REST APIs',
    'Tailwind CSS',
    'JavaScript',
    'Git',
    'Docker',
  ],
  stats: [],
  about: [],
  services: [],
  stackLabels: ['What people see', 'What makes it work'],
  stack: [
    {
      name: 'Frontend',
      side: 'front',
      items: [
        'React',
        'React',
        'JavaScript',
        'HTML',
        'CSS',
      ],
    },
    {
      name: 'Backend',
      side: 'back',
      items: ['Node.js', 'Express.js', 'Python', 'REST API'],
    },
    { name: 'Database', side: 'back', items: ['MySQL', 'MongoDB'] },
    {
      name: 'Tools',
      side: 'back',
      items: ['Git', 'GitHub', 'Docker'],
    },
  ],
  skills: [
    {
      group: 'Languages',
      items: [
        { name: 'JavaScript', level: 85 },
        { name: 'HTML and CSS', level: 90 },
        { name: 'SQL', level: 80 },
      ],
    },
    {
      group: 'Frameworks and tools',
      items: [
        { name: 'React', level: 85 },
        { name: 'Node.js and Express', level: 80 },
        { name: 'Git and GitHub', level: 85 },
      ],
    },
  ],
  experience: [
    { when: '2026 — Present', title: 'Intern', org: 'Smart GK', note: '' },
  ],
  education: [
    { when: '2026 — Present', title: 'BSc CSIT', org: 'KFA College', note: 'Expected completion: 2029' },
  ],
  achievements: [],
  /* Loksewa Abhyas is your real project. The other three are samples to replace.
     art: dashboard, api, chat, cubes or orbit. tone: light or dark (tag style).
     color: optional pastel such as "#f8cdb0". image: set from the Customize panel. */
  projects: [],
};

export const TOOLS = {
  React: ['Re', '#4fd1ee'],
  'React Router': ['RR', '#f4616d'],
  Redux: ['Rx', '#9a6bdc'],
  'Tailwind CSS': ['Tw', '#38bdf8'],
  JavaScript: ['JS', '#f0c814'],
  TypeScript: ['TS', '#3b82f6'],
  HTML5: ['H5', '#f06529'],
  CSS3: ['C3', '#3b82f6'],
  'Node.js': ['No', '#6cc24a'],
  Express: ['Ex', '#a0a8ba'],
  MySQL: ['My', '#3d9bd0'],
  MongoDB: ['Mg', '#4fb45a'],
  PostgreSQL: ['Pg', '#5b8fc7'],
  'REST APIs': ['API', '#ee7ba0'],
  'Git and GitHub': ['Gi', '#f05032'],
  Docker: ['Dk', '#2496ed'],
  Postman: ['Pm', '#ff6c37'],
  'VS Code': ['VS', '#3b9ae8'],
  Python: ['Py', '#f0c814'],
  Java: ['Jv', '#e76f51'],
  AWS: ['AWS', '#ff9900'],
  Figma: ['Fg', '#a259ff'],
};

export const PASTELS = ['#f8cdb0', '#d4c8f4', '#f4c6d6', '#c5e4d6', '#bfd7f1', '#f3e0a8'];
