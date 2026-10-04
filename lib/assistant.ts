import { certifications, education, profile, projects, skills, jwsFeatures } from '@/data/portfolio';

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
  if (/\b(?:intern\w*|hire|hiring|consider|recruit\w*)\b/.test(q)) return 'Rifky brings a practical full-stack foundation, university project experience and curiosity about intelligent applications. JWS demonstrates role-based workflows, validation and privacy-conscious development; his other projects explore Android and computer vision. He is an IT undergraduate, with expected graduation in 2027. This portfolio does not claim professional employment or internship experience.';
  if (/jws|janaza|welfare/.test(q)) return `${projects[0].solution} His role is Full-Stack Web Developer. Core functionality includes ${jwsFeatures.join(', ')}. Repository: ${projects[0].url}`;
  if (/tata|draw|color|colour|artistic/.test(q)) return `${projects[1].solution} This is a final-year university web application using ${projects[1].technologies.join(', ')}. Individual responsibilities are not detailed in this portfolio. Repository: ${projects[1].url}`;
  if (/water|hydrat|android/.test(q)) return `${projects[2].solution} It uses SQLite and CRUD operations to maintain local intake records. Repository: ${projects[2].url}`;
  if (/spark|digit|handwrit/.test(q)) return `${projects[3].solution} It explores image processing and classification as a university group project. Repository: ${projects[3].url}`;
  if (/plant|leaf|leaves/.test(q)) return `${projects[4].solution} It is a university group project. No repository URL has been supplied.`;
  if (/certif|course|credential/.test(q)) return `His certifications include ${certifications.map(([title, issuer]) => `${title} (${issuer})`).join('; ')}.`;
  if (/education|university|degree|graduat|faculty|study|studies/.test(q)) return `Rifky is studying ${education.degree} at ${education.university}, ${education.faculty}. ${education.period}; expected graduation: ${education.graduation}.`;
  if (/linkedin/.test(q)) return `Find Rifky on LinkedIn: ${profile.linkedin}`;
  if (/github|repositor/.test(q)) return `Rifky's GitHub: ${profile.github}. JWS, the drawing assistant, Water Logger and Sparkling have repository links in the Projects section.`;
  if (/contact|email|phone|reach/.test(q)) return `Email: ${profile.email}. Phone: ${profile.phone}. LinkedIn: ${profile.linkedin}. GitHub: ${profile.github}.`;
  if (/\bai\b|\bml\b|machine|vision|image|data analysis|python/.test(q)) return 'Rifky explores machine learning fundamentals, computer vision and image processing. His university projects include AI-Guided Drawing and Coloring (shape extraction, outlines, shading and colorization), Sparkling (digit classification), and Plant Analysis (leaf measurements, height estimation and health indicators). His toolkit includes Python, Jupyter Notebook and Google Colab.';
  if (/react|frontend|front end|next|tailwind|responsive|interface/.test(q)) return `His frontend toolkit includes ${skills.Frontend.join(', ')} alongside HTML, CSS, JavaScript and TypeScript. The drawing assistant uses React; this portfolio uses Next.js, Tailwind CSS and Motion for React.`;
  if (/\b(?:backend|back end|node(?: js)?|express(?: js)?|apis?|server)\b/.test(q)) return `His backend skills include ${skills.Backend.join(', ')}. JWS covers server-side validation, role-based workflows, email notifications and privacy controls; the drawing assistant uses Node.js, Express.js and JWT authentication.`;
  if (/\b(?:databases?|mysql|mariadb|sqlite|prisma|sql)\b/.test(q)) return `Database skills: ${skills.Database.join(', ')}. The drawing assistant uses MySQL; Water Logger uses SQLite. His concepts include database design, authentication and role-based access control.`;
  if (/technolog|skill|stack|language|tool/.test(q)) return Object.entries(skills).map(([label, items]) => `${label}: ${items.join(', ')}`).join('\n\n');
  if (/project|best work|portfolio/.test(q)) return `JWS is his featured full-stack case study. Other projects include ${projects.slice(1).map(p => p.title).join('; ')}. Explore the Projects section for problems, solutions, contributions and repositories.`;
  if (/experience|employment|job/.test(q)) return 'His featured development work is Janaza Welfare Society as a Full-Stack Web Developer, supported by university projects in web development, Android and machine learning. No company employment history is supplied in this portfolio.';
  if (/about (?:mohammed )?rifky|who is (?:mohammed )?rifky|^(?:mohammed )?rifky\s*$|^(?:hello|hi|hey)(?: there)?\s*$/.test(q)) return `Mohammed Rifky is a Full-Stack Developer and Information Technology undergraduate at ${education.university}, based in ${profile.location}. He builds responsive, database-backed applications and explores AI-assisted applications, computer vision and image processing.`;
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
