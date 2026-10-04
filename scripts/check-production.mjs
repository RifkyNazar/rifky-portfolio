import assert from 'node:assert/strict';

const base = process.argv[2] || 'http://127.0.0.1:3000';
const homepage = await fetch(base);
assert.equal(homepage.status, 200);
const html = await homepage.text();
for (const id of ['home', 'about', 'experience', 'projects', 'skills', 'contact']) assert.ok(html.includes(`id="${id}"`), `Missing section ${id}`);
for (const content of ['Mohammed Rifky', 'BSc in Information Technology', 'Faculty of Applied Sciences', '2027', 'Janaza Welfare', 'AI-Guided Drawing', 'Water Logger', 'Sparkling', 'Plant Analysis', 'AI/ML Engineer', 'HP LIFE']) assert.ok(html.includes(content), `Missing content ${content}`);
assert.match(html, /name="twitter:card"/);
assert.match(html, /property="og:title"/);
assert.ok(!html.includes('rifky-cv.pdf'));
assert.match(html, /href="\/Mohammed-Rifky-CV.pdf"[^>]*download="Mohammed-Rifky-CV.pdf"/);
const anchors = [...html.matchAll(/<a\b[^>]*>/g)].map(match => match[0]);
for (const anchor of anchors.filter(tag => tag.includes('target="_blank"'))) assert.ok(anchor.includes('rel="noopener noreferrer"'), `Unsafe external link ${anchor}`);
assert.ok(html.includes('https://github.com/RifkyNazar/janaza-welfare-society.git'));
assert.ok(html.includes('https://github.com/ridhurshan/tata-vision.git'));
assert.ok(html.includes('https://github.com/RifkyNazar/Daily-Water-Intake-Logger.git'));
assert.ok(html.includes('https://github.com/ASMmusaffar/Sparkling-Handwritten-Digits-Recognizer.git'));
console.log('PASS: page, sections, metadata, CV path, supplied repositories, safe external links');

async function chat(body, { status = 200, headers = {}, raw = false } = {}) {
  const response = await fetch(`${base}/api/chat`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: raw ? body : JSON.stringify(body),
  });
  assert.equal(response.status, status);
  return response.json();
}
const topics = [
  ['Tell me about Rifky', /Rajarata/], ['Show me his best projects', /JWS/],
  ['What technologies does he use?', /TypeScript/], ['Tell me about JWS', /GPS/],
  ['What AI/ML work has he done?', /Sparkling/], ['How can I contact Rifky?', /rifky15648@gmail.com/],
  ['Why should I consider Rifky for an internship?', /practical full-stack/],
  ['React frontend', /Next.js/], ['backend Node', /Express/], ['computer vision', /leaf measurements/],
  ['TATA Vision', /JWT/], ['Water Logger', /SQLite/], ['digit recognizer', /0–9/],
  ['education', /2027/], ['certifications', /SLIIT/], ['GitHub', /RifkyNazar/],
  ['LinkedIn', /mohamed-rifky-00a8352a9/], ['plant analysis', /plant-height/],
  ['What is the capital of France?', /only knows information included/],
];
for (const [question, expected] of topics) {
  const data = await chat({ question });
  assert.equal(data.mode, 'local');
  assert.match(data.answer, expected, question);
}
await chat({ question: '' }, { status: 400 });
await chat({ question: 'x'.repeat(1001) }, { status: 400 });
await chat({ question: 42 }, { status: 400 });
await chat('not-json', { status: 400, raw: true });
await chat({ question: 'hello' }, { status: 403, headers: { Origin: 'https://unrelated.example' } });
await chat({ question: 'hello' }, { status: 415, headers: { 'Content-Type': 'text/plain' } });
await chat({ question: 'x'.repeat(9000) }, { status: 413 });
assert.equal((await fetch(`${base}/api/chat`)).status, 405);
console.log(`PASS: ${topics.length} assistant topics, local mode, request validation and body limit`);

for (const path of ['/images/rifky-profile.png', '/Mohammed-Rifky-CV.pdf']) {
  const response = await fetch(`${base}${path}`, { method: 'HEAD' });
  console.log(`${response.ok ? 'AVAILABLE' : 'MISSING (fallback required)'}: ${path}`);
}
