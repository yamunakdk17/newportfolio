/* =====================================================================
   DEFAULT SETTINGS
   Everything on the page comes from this object. Edit it here, or press
   Ctrl/Cmd + Shift + E on the page (or add ?edit to the address) to open
   the Customize panel. Panel changes are saved in the browser (localStorage)
   and can be exported as JSON from the Data section.
   ===================================================================== */
export const DEFAULTS = {
  site: {
    name: "Yamuna Khadka",
    role: "Full stack developer",
    roles: ["Full stack developer", "React developer", "Node.js engineer"],
    available: "Available for work",
    chip: "Let's meet!",
    specialization:
      "Full stack developer building with React, Node.js and MySQL",
    location: "Your city, Country",
    intro:
      "I design interfaces, build APIs and shape databases, then ship them as complete web apps.",
    building: "Loksewa Abhyas",
    photo: "",
    email: "you@example.com",
    phone: "",
    github: "https://github.com/your-username",
    linkedin: "https://www.linkedin.com/in/your-username",
    instagram: "",
    cvUrl: "",
    introWord: "hello",
  },
  look: { g1: "#ecc0cc", g2: "#c9bcf2", theme: "dark" },
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
    stats: true,
    skillBars: true,
    contactForm: true,
  },
  sections: [
    {
      id: "work",
      on: true,
      nav: true,
      label: "Portfolio",
      kicker: "Portfolio",
      title: "Projects I've {built}, start to finish.",
      lead: "From the first screen to the last query. Here are a few I'm proud of.",
    },
    {
      id: "about",
      on: true,
      nav: true,
      label: "About Me",
      kicker: "About me",
      title: "Turning ideas into {working software}.",
      lead: "",
    },
    {
      id: "stack",
      on: true,
      nav: true,
      label: "Tech Stack",
      kicker: "Tech stack",
      title: "The tools I reach for {every day}.",
      lead: "From the browser to the server and the database behind it.",
    },
    {
      id: "resume",
      on: true,
      nav: true,
      label: "Resume",
      kicker: "Resume",
      title: "Education and {experience}.",
      lead: "",
    },
    {
      id: "achievements",
      on: true,
      nav: true,
      label: "Achievements",
      kicker: "Achievements",
      title: "Certifications and {milestones}.",
      lead: "Things that back up the work.",
    },
    {
      id: "testimonials",
      on: true,
      nav: false,
      label: "Kind words",
      kicker: "Testimonials",
      title: "What people {say} about working with me.",
      lead: "",
    },
    {
      id: "contact",
      on: true,
      nav: true,
      label: "Contact",
      kicker: "Contact",
      title: "Let's build something {together}.",
      lead: "Have a project in mind, a role to talk about, or just want to say hello? Send a message and I'll get back to you as soon as I can.",
    },
  ],
  marquee: [
    "React",
    "Node.js",
    "Express",
    "MySQL",
    "REST APIs",
    "Tailwind CSS",
    "JavaScript",
    "Git",
    "Docker",
  ],
  stats: [
    { value: 10, suffix: "+", label: "Projects built" },
    { value: 2, suffix: "+", label: "Years of experience" },
    { value: 5, suffix: "+", label: "Happy clients" },
  ],
  about: [
    "I'm a full stack developer who likes owning a feature end to end: the screen, the API behind it and the data model underneath. That keeps every layer simple and consistent.",
    "I care about code a teammate can read six months from now, and interfaces that feel obvious the first time someone uses them.",
    "Right now I'm building Loksewa Abhyas, a study platform for students preparing for Nepal's Public Service Commission exams.",
  ],
  services: [
    {
      t: "Frontend development",
      d: "Responsive, accessible interfaces built with React and Tailwind CSS.",
    },
    {
      t: "Backend and APIs",
      d: "REST APIs with Node.js and Express, with validation and clear errors.",
    },
    {
      t: "Databases",
      d: "Relational schemas in MySQL, designed around the questions an app has to answer.",
    },
    {
      t: "Design to launch",
      d: "From first sketch to a deployed product, with version control and a tidy handoff.",
    },
  ],
  stackLabels: ["What people see", "What makes it work"],
  stack: [
    {
      name: "Frontend",
      side: "front",
      items: [
        "React",
        "React Router",
        "Redux",
        "Tailwind CSS",
        "JavaScript",
        "HTML5",
        "CSS3",
      ],
    },
    {
      name: "Backend",
      side: "back",
      items: ["Node.js", "Express", "REST APIs"],
    },
    { name: "Database", side: "back", items: ["MySQL", "MongoDB"] },
    {
      name: "Tools",
      side: "back",
      items: ["Git and GitHub", "Docker", "Postman", "VS Code"],
    },
  ],
  skills: [
    {
      group: "Languages",
      items: [
        { name: "JavaScript", level: 85 },
        { name: "HTML and CSS", level: 90 },
        { name: "SQL", level: 80 },
      ],
    },
    {
      group: "Frameworks and tools",
      items: [
        { name: "React", level: 85 },
        { name: "Node.js and Express", level: 80 },
        { name: "Git and GitHub", level: 85 },
      ],
    },
  ],
  experience: [
    {
      when: "20XX to Present",
      title: "Your role",
      org: "Company name",
      note: "One or two lines about what you built and the result.",
    },
    {
      when: "20XX to 20XX",
      title: "Previous role or internship",
      org: "Company name",
      note: "What you worked on and what you learned.",
    },
  ],
  education: [
    {
      when: "20XX to 20XX",
      title: "Your degree",
      org: "Your university",
      note: "Focus areas or relevant coursework.",
    },
    {
      when: "20XX to 20XX",
      title: "Higher secondary",
      org: "Your school or college",
      note: "Stream or highlights.",
    },
  ],
  achievements: [
    {
      badge: "01",
      title: "Your certification",
      tags: ["Issuer", "Topic"],
      desc: "What it covers and why it matters for the work you do.",
      link: "",
    },
    {
      badge: "02",
      title: "Another achievement",
      tags: ["Award", "Year"],
      desc: "A competition, course or milestone worth mentioning.",
      link: "",
    },
  ],
  testimonials: [
    {
      name: "Person name",
      role: "Role at Company",
      quote:
        "Add a short, honest quote from a client or colleague about what it was like to work with you.",
      link: "",
    },
    {
      name: "Another person",
      role: "Role at Company",
      quote:
        "A second quote, ideally about a different strength, such as communication or reliability.",
      link: "",
    },
  ],
  /* Loksewa Abhyas is your real project. The other three are samples to replace.
     art: dashboard, api, chat, cubes or orbit. tone: light or dark (tag style).
     color: optional pastel such as "#f8cdb0". image: set from the Customize panel. */
  projects: [
    {
      title: "Loksewa Abhyas",
      cat: "Full stack",
      kind: "Exam-prep web app",
      art: "dashboard",
      tone: "light",
      desc: "An exam-preparation platform for students sitting Nepal's Public Service Commission (Loksewa) exams. Practise questions, review mistakes, work through past papers and see what to study next.",
      tags: ["React", "Tailwind", "Node.js", "MySQL"],
      demo: "#",
      code: "",
    },
    {
      title: "Inventory API",
      cat: "Backend",
      kind: "Backend service",
      art: "api",
      tone: "dark",
      desc: "A REST API with role-based access, pagination and a MySQL schema designed for stock reports.",
      tags: ["Node.js", "Express", "MySQL"],
      demo: "",
      code: "#",
    },
    {
      title: "Team chat",
      cat: "Real-time",
      kind: "Real-time app",
      art: "chat",
      tone: "light",
      desc: "One-to-one messaging with a responsive interface and live updates.",
      tags: ["React", "Node.js", "WebSockets"],
      demo: "#",
      code: "",
    },
    {
      title: "Site manager",
      cat: "Full stack",
      kind: "Content tool",
      art: "cubes",
      tone: "dark",
      desc: "A small content manager that lets non-developers update a website without touching code.",
      tags: ["React", "Node.js", "MySQL"],
      demo: "#",
      code: "",
    },
  ],
};

export const TOOLS = {
  React: ["Re", "#4fd1ee"],
  "React Router": ["RR", "#f4616d"],
  Redux: ["Rx", "#9a6bdc"],
  "Tailwind CSS": ["Tw", "#38bdf8"],
  JavaScript: ["JS", "#f0c814"],
  TypeScript: ["TS", "#3b82f6"],
  HTML5: ["H5", "#f06529"],
  CSS3: ["C3", "#3b82f6"],
  "Node.js": ["No", "#6cc24a"],
  Express: ["Ex", "#a0a8ba"],
  MySQL: ["My", "#3d9bd0"],
  MongoDB: ["Mg", "#4fb45a"],
  PostgreSQL: ["Pg", "#5b8fc7"],
  "REST APIs": ["API", "#ee7ba0"],
  "Git and GitHub": ["Gi", "#f05032"],
  Docker: ["Dk", "#2496ed"],
  Postman: ["Pm", "#ff6c37"],
  "VS Code": ["VS", "#3b9ae8"],
  Python: ["Py", "#f0c814"],
  Java: ["Jv", "#e76f51"],
  AWS: ["AWS", "#ff9900"],
  Figma: ["Fg", "#a259ff"],
};

export const PASTELS = [
  "#f8cdb0",
  "#d4c8f4",
  "#f4c6d6",
  "#c5e4d6",
  "#bfd7f1",
  "#f3e0a8",
];
