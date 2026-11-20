export const profile = {
  name: 'Mohammed Rifky', role: 'Software Developer', location: 'Sri Lanka',
  specializations: ['Full-Stack Development', 'AI & Intelligent Systems', 'Computer Vision'],
  email: 'rifky15648@gmail.com', phone: '+94 75 386 2747', phoneHref: 'tel:+94753862747',
  github: 'https://github.com/RifkyNazar',
  linkedin: 'https://www.linkedin.com/in/mohamed-rifky-00a8352a9',
  portrait: '/images/rifky-profile.png', cv: '/Mohammed-Rifky-CV.pdf',
  description: 'I build practical software, from full-stack web systems to intelligent applications and computer vision tools.',
} as const;
export const education = {
  degree: 'BSc in Information Technology', university: 'Rajarata University of Sri Lanka',
  faculty: 'Faculty of Applied Sciences', period: '2023 – Present', status: 'Formal graduation pending',
} as const;
export const focus = ['Full-stack web development', 'AI-assisted applications', 'Computer vision', 'Image processing', 'Android development', 'Desktop development', 'Machine learning fundamentals'];
export const navigation = ['Home', 'About', 'Experience', 'Projects', 'Skills', 'Contact'] as const;
export type Project = {
  title: string; subtitle: string; category: string; problem: string; solution: string;
  contribution: string; outcome: string; technologies: string[]; url?: string;
  visual: 'jws' | 'drawing' | 'water' | 'digits' | 'plant' | 'finance';
  description?: string;
  features?: string[];
  media?: ProjectMediaData;
};
export type ProjectMediaData = {
  layout: 'desktop' | 'mobile' | 'pipeline' | 'comparison';
  images: { src: string; label: string; alt: string }[];
};
export const financeProject = {
  title: 'Personal Finance & Schedule Management System',
  subtitle: 'Windows Desktop Application',
  category: 'FINANCE & PRODUCTIVITY MANAGEMENT',
  problem: 'Personal finances and deadlines are easier to stay on top of when records, budgets, and schedules are accessible in one place.',
  solution: 'A C++ and Qt-based desktop application for managing personal finances, budgets, schedules, and upcoming deadlines through a graphical interface.',
  description: 'A desktop-based personal finance and productivity management application designed to help users organize their income, expenses, budgets, schedules, and upcoming deadlines. Developed using C++17 and Qt 6.8.0, the system features user authentication, automated financial calculations, category-wise budget monitoring, financial reports, and personalized data management using local file-based storage.',
  contribution: 'Desktop application development for Windows using an event-driven, object-oriented architecture.',
  outcome: 'A Windows application that brings personal finance and schedule management together with locally stored user records.',
  technologies: ['C++17', 'Qt 6.8.0', 'Qt Widgets', 'Qt Designer', 'QSS', 'qmake', 'MinGW-w64', 'TXT Files'],
  features: [
    'User Registration & Authentication',
    'Income & Expense Management',
    'Category-wise Budget Monitoring',
    'Automated Financial Reports',
    'Schedule Management',
    'Upcoming Deadline Tracking',
    'Local File-Based Data Storage',
    'Personalized User Records',
  ],
  visual: 'finance',
} satisfies Project;

export const projects: Project[] = [
  {
    title: 'Janaza Welfare Society', subtitle: 'Technology in service of community.', category: 'FULL-STACK WEB APPLICATION',
    problem: 'Welfare services need clear request tracking and coordinated public, employee and admin workflows, while protecting sensitive requester information.',
    solution: 'A mobile-first platform for Janaza and transportation requests, task management and verified donations.',
    contribution: 'Full-stack web development across service requests, role-based workflows, server-side validation and privacy controls.',
    outcome: 'A connected application bringing public service requests and internal operational workflows into one place.',
    technologies: ['Role-based access', 'Database-backed workflows', 'SMTP email', 'PDF confirmations', 'Server-side validation'],
    url: 'https://github.com/RifkyNazar/janaza-welfare-society.git', visual: 'jws',
    media: { layout: 'desktop', images: [
      { src: '/images/projects/janaza/main.png', label: 'Main interface', alt: 'Janaza Welfare Society main interface' },
      { src: '/images/projects/janaza/workflow.png', label: 'Request workflow', alt: 'Janaza Welfare Society request workflow' },
    ] },
  },
  {
    title: 'AI-Guided Drawing and Coloring Assistant', subtitle: 'From visual input to creative possibility.', category: 'FINAL-YEAR UNIVERSITY WEB APPLICATION',
    problem: 'Turning visual inputs into useful drawing and coloring guidance requires several connected image-processing stages.',
    solution: 'A web application exploring shape extraction, outline refinement, shading, colorization and artistic rendering.',
    contribution: 'University project participation in an AI-assisted drawing and coloring application. Specific individual responsibilities are not documented in this portfolio.',
    outcome: 'An exploration of intelligent image processing within an authenticated web experience.',
    technologies: ['React', 'Node.js', 'Express.js', 'MySQL', 'JWT authentication', 'AI-assisted image processing'],
    url: 'https://github.com/ridhurshan/tata-vision.git', visual: 'drawing',
    media: { layout: 'pipeline', images: ['Reference', 'Basic Shapes', 'Curves', 'Shading', 'Coloring'].map(label => ({ src: `/images/projects/tata-vision/${label.toLowerCase().replaceAll(' ', '-')}.png`, label, alt: `Drawing assistant: ${label.toLowerCase()} stage` })) },
  },
  {
    title: 'Water Logger — Daily Hydration Tracker', subtitle: 'A little progress, every day.', category: 'ANDROID APPLICATION',
    problem: 'Daily hydration habits are easier to understand when water intake is recorded consistently.',
    solution: 'An Android application for recording daily water intake and viewing hydration progress.',
    contribution: 'Android application development using SQLite and CRUD operations.',
    outcome: 'A daily hydration tracker with locally stored intake records.', technologies: ['Android', 'SQLite', 'CRUD operations'],
    url: 'https://github.com/RifkyNazar/Daily-Water-Intake-Logger.git', visual: 'water',
    media: { layout: 'mobile', images: ['Home', 'Add Water', 'Statistics'].map(label => ({ src: `/images/projects/water-logger/${label.toLowerCase().replaceAll(' ', '-')}.png`, label, alt: `Water Logger ${label.toLowerCase()} screen` })) },
  },
  {
    title: 'Sparkling — Handwritten Digits Recognizer', subtitle: 'Finding patterns in a handwritten world.', category: 'MACHINE LEARNING · UNIVERSITY GROUP PROJECT',
    problem: 'Handwritten digits vary in shape and need image processing before classification.',
    solution: 'A university group project focused on recognizing handwritten digits from 0–9.',
    contribution: 'Participation in a machine-learning group project exploring image processing and digit classification.',
    outcome: 'A practical exploration of handwritten digit recognition.', technologies: ['Machine learning', 'Image processing', 'Classification'],
    url: 'https://github.com/ASMmusaffar/Sparkling-Handwritten-Digits-Recognizer.git', visual: 'digits',
    media: { layout: 'comparison', images: ['Input', 'Result', 'Model'].map(label => ({ src: `/images/projects/digit-recognizer/${label.toLowerCase()}.png`, label, alt: `Handwritten digit recognizer ${label.toLowerCase()}` })) },
  },
  {
    title: 'Plant Analysis / Computer Vision', subtitle: 'A closer look at the living world.', category: 'COMPUTER VISION · UNIVERSITY GROUP PROJECT',
    problem: 'Plant characteristics require careful measurement and interpretation of visual information.',
    solution: 'Image analysis exploring leaf counting, leaf area, plant-height estimation, image dimensions and plant-health indicators.',
    contribution: 'University group project work exploring edge detection and plant-image analysis.',
    outcome: 'An exploration of computer vision for observing plant characteristics.', technologies: ['Computer Vision', 'Edge detection', 'Image dimensions', 'Image analysis'], visual: 'plant',
  },
  financeProject,
];
export const skills: Record<string, string[]> = {
  'Programming Languages': ['JavaScript', 'TypeScript', 'Python', 'Java', 'SQL', 'C++17'],
  'Frontend & UI Design': ['HTML', 'CSS', 'React.js', 'Next.js', 'Tailwind CSS', 'Responsive Design'],
  'Backend Development': ['Node.js', 'Express.js', 'REST APIs'],
  Databases: ['MySQL', 'MariaDB', 'SQLite', 'Prisma ORM'],
  'Mobile & Desktop': ['Android', 'Qt 6.8.0', 'Qt Widgets', 'Qt Designer'],
  'AI, Data & Computer Vision': ['Machine Learning fundamentals', 'AI-assisted image processing', 'Computer Vision', 'Edge Detection', 'Data Analysis'],
  'Development Tools': ['Git', 'GitHub', 'Visual Studio Code', 'Android Studio', 'Jupyter Notebook', 'Google Colab', 'XAMPP'],
  'Software Engineering': ['Authentication', 'Role-Based Access Control', 'Database Design', 'File Validation', 'CRUD operations', 'Event-driven development', 'Object-oriented programming'],
};
export const certifications: ReadonlyArray<readonly [string, string]> = [
  ['AI/ML Engineer – Stage 1', 'SLIIT Faculty of Computing'],
  ['Python for Beginners', 'University of Moratuwa CODL'],
  ['Web Design for Beginners', 'University of Moratuwa CODL'],
  ['AI for Beginners', 'HP LIFE'], ['AI for Business Professionals', 'HP LIFE'],
  ['Data Science & Analytics', 'HP LIFE'], ['Introduction to Cybersecurity Awareness', 'HP LIFE'],
];
export const jwsFeatures = [
  'Mobile-first public service platform', 'Janaza and transportation service requests', 'Request tracking',
  'Admin and Employee workflows', 'Role-based access and employee approval',
  'Task assignment and lifecycle management', 'Secure task-photo review', 'Public operations publishing',
  'Vehicle management', 'Employee profile controls', 'Donation confirmation and verification',
  'PDF confirmations', 'SMTP email notifications', 'Server-side validation',
  'Privacy controls for requester information, GPS, uploads, receipts and internal records',
];
