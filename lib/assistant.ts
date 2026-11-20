import { certifications, education, profile, projects, skills, jwsFeatures } from '@/data/portfolio';

import { financeProject } from '@/data/portfolio';

export const suggestions = [
  'Tell me about Rifky', 'Show me his best projects', 'What technologies does he use?',
  'Tell me about JWS', 'What AI/ML work has he done?', 'How can I contact Rifky?',
  'Why should I consider Rifky for an internship?',
];
export type ChatMessage = { role: 'assistant' | 'user'; content: string };
export const welcome = "Hi! I'm Rifky's portfolio assistant. Ask me about his projects, skills, experience, or technologies.";

// Deterministic portfolio-grounded responses, shared by fallback and server route.
export function getLocalResponse(question: string): string {
  const q = question.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
  const professionalSummary = `Mohammed Rifky is a ${profile.role} based in ${profile.location}. Full-stack web development is a core strength, demonstrated by Janaza Welfare Society. His projects also include Android and C++/Qt desktop applications, along with university work in AI-assisted applications, computer vision, and image processing.`;
  if (/\b(?:intern\w*|hire|hiring|consider|recruit\w*)\b/.test(q)) return `Rifky brings a practical full-stack foundation and project experience across web, Android, desktop, and intelligent applications. JWS demonstrates role-based workflows, validation, and privacy-conscious development. ${education.status} for his ${education.degree}.`;
  if (/jws|janaza|welfare/.test(q)) return `${projects[0].solution} His role is Full-Stack Web Developer. Core functionality includes ${jwsFeatures.join(', ')}. Repository: ${projects[0].url}`;
  if (/tata|draw|color|colour|artistic/.test(q)) return `${projects[1].solution} This is a final-year university web application using ${projects[1].technologies.join(', ')}. Individual responsibilities are not detailed in this portfolio. Repository: ${projects[1].url}`;
  if (/water|hydrat|android|\bmobile\b/.test(q)) return `Rifky has Android development experience through ${projects[2].title}. ${projects[2].solution} It uses SQLite and CRUD operations to maintain local intake records. Repository: ${projects[2].url}`;
  if (/spark|digit|handwrit/.test(q)) return `${projects[3].solution} It explores image processing and classification as a university group project. Repository: ${projects[3].url}`;
  if (/plant|leaf|leaves/.test(q)) return `${projects[4].solution} It is a university group project. No repository URL has been supplied.`;
  if (/\b(?:finance|financial|budget\w*|desktop|qt|schedule management|qmake|mingw)\b/.test(q) || /\bc\s*\+\+/i.test(question)) {
    return `Rifky developed the ${financeProject.title}, a ${financeProject.subtitle}. ${financeProject.description}\n\nKey features: ${financeProject.features.join(', ')}.\n\nTechnology stack: ${financeProject.technologies.join(', ')}. ${financeProject.contribution}`;
  }
  if (/certif|course|credential/.test(q)) return `His certifications include ${certifications.map(([title, issuer]) => `${title} (${issuer})`).join('; ')}.`;
  if (/education|university|degree|graduat|faculty|study|studies/.test(q)) return `${education.status}. Rifky studied Information Technology at ${education.university}, ${education.faculty}, in the ${education.degree} program.`;
  if (/linkedin/.test(q)) return `Find Rifky on LinkedIn: ${profile.linkedin}`;
  if (/github|repositor/.test(q)) return `Rifky's GitHub: ${profile.github}. JWS, the drawing assistant, Water Logger and Sparkling have repository links in the Projects section.`;
  if (/contact|email|phone|reach/.test(q)) return `Email: ${profile.email}. Phone: ${profile.phone}. LinkedIn: ${profile.linkedin}. GitHub: ${profile.github}.`;
  if (/\bai\b|\bml\b|machine|vision|image|data analysis|python/.test(q)) return 'Rifky has university project experience in AI-assisted applications, computer vision, and image processing, with foundational machine learning knowledge. He participated in AI-Guided Drawing and Coloring (shape extraction, outlines, shading and colorization), Sparkling (digit classification), and Plant Analysis (leaf measurements, height estimation and health indicators). His toolkit includes Python, Jupyter Notebook and Google Colab.';
  if (/react|frontend|front end|next|tailwind|responsive|interface/.test(q)) return `His frontend toolkit includes ${skills['Frontend & UI Design'].join(', ')} alongside JavaScript and TypeScript. The drawing assistant uses React; this portfolio uses Next.js, Tailwind CSS and Motion for React.`;
  if (/\b(?:backend|back end|node(?: js)?|express(?: js)?|apis?|server)\b/.test(q)) return `His backend skills include ${skills['Backend Development'].join(', ')}. JWS covers server-side validation, role-based workflows, email notifications and privacy controls; the drawing assistant uses Node.js, Express.js and JWT authentication.`;
  if (/\b(?:databases?|mysql|mariadb|sqlite|prisma|sql)\b/.test(q)) return `Database skills: ${skills.Databases.join(', ')}. The drawing assistant uses MySQL; Water Logger uses SQLite. His concepts include database design, authentication and role-based access control.`;
  if (/\b(?:strengths?|speciali\w*|full\s+stack|kind of developer|type of developer|software developer)\b/.test(q)) return professionalSummary;
  if (/technolog|skill|stack|language|tool/.test(q)) return Object.entries(skills).map(([label, items]) => `${label}: ${items.join(', ')}`).join('\n\n');
  if (/project|best work|portfolio/.test(q)) return `JWS is his featured full-stack case study. Other projects include ${projects.slice(1).map(p => p.title).join('; ')}. Explore the Projects section for problems, solutions, contributions and repositories.`;
  if (/experience|employment|job/.test(q)) return `${professionalSummary} The portfolio documents project experience.`;
  if (/about (?:mohammed )?rifky|who is (?:mohammed )?rifky|^(?:mohammed )?rifky\s*$|^(?:hello|hi|hey)(?: there)?\s*$/.test(q)) return `${professionalSummary} His academic background is in Information Technology at ${education.university}.`;
  return "The current local assistant only knows information included in Rifky's portfolio. I can help with his projects, skills, education, certifications and contact details. Try asking about JWS or his AI/ML work.";
}

export async function getPortfolioResponse(question: string): Promise<string> {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question }), signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) throw new Error('Assistant unavailable');
    const data: unknown = await response.json();
    if (typeof data === 'object' && data !== null && 'answer' in data && typeof data.answer === 'string') return data.answer;
  } catch { /* Network/server failure preserves the local experience. */ }
  return getLocalResponse(question);
}
