import { education, profile } from '@/data/portfolio';

export const siteTitle = `${profile.name} | ${profile.role}`;
export const siteDescription = 'Mohammed Rifky is a Software Developer with project experience in full-stack web development, AI-assisted applications, computer vision, image processing, and mobile and desktop development.';

// Set the final origin at build time; never assume a production domain.
const configuredUrl = process.env.SITE_URL?.trim();
export const siteUrl = configuredUrl ? new URL(configuredUrl) : undefined;
if (siteUrl && (!['https:', 'http:'].includes(siteUrl.protocol) || siteUrl.username || siteUrl.password)) {
  throw new Error('SITE_URL must be a public HTTP(S) URL without credentials.');
}

export const personStructuredData = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: profile.name,
  jobTitle: profile.role,
  description: siteDescription,
  email: `mailto:${profile.email}`,
  sameAs: [profile.github, profile.linkedin],
  affiliation: { '@type': 'EducationalOrganization', name: education.university },
  ...(siteUrl ? { url: siteUrl.href } : {}),
};
