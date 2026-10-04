// Offline tests: mocked SMTP only. No real credentials, network, or emails.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(path, requireMock, globals = {}) {
  const source = fs.readFileSync(path, 'utf8');
  const { outputText } = ts.transpileModule(source, { compilerOptions: {
    module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
    esModuleInterop: true, jsx: ts.JsxEmit.ReactJSX,
  } });
  const compiledModule = { exports: {} };
  vm.runInNewContext(outputText, { module: compiledModule, exports: compiledModule.exports, require: requireMock,
    Request, Response, Uint8Array, TextDecoder, URL, ...globals }, { filename: path });
  return compiledModule.exports;
}
const valid = { name: 'Visitor', email: 'visitor@example.test', subject: 'Project enquiry', message: 'Hello Rifky!', website: '' };
const config = { GMAIL_USER: 'owner@example.test', GMAIL_APP_PASSWORD: 'offline-test-placeholder', CONTACT_TO_EMAIL: 'inbox@example.test' };
function server({ env = {}, send, clock } = {}) {
  const mail = [], transports = [];
  let closed = 0;
  const route = load('app/api/contact/route.ts', name => {
    assert.equal(name, 'nodemailer');
    return { createTransport: options => {
      transports.push(options);
      return { sendMail: async message => { mail.push(message); return send ? send(message) : { accepted: [config.CONTACT_TO_EMAIL], rejected: [] }; }, close: () => { closed++; } };
    } };
  }, { process: { env }, ...(clock ? { Date: { now: clock } } : {}) });
  return { ...route, mail, transports, get closed() { return closed; } };
}
function request(data = valid, headers = {}, raw = false) {
  return new Request('http://localhost:3000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: raw ? data : JSON.stringify(data) });
}
let checks = 0;
async function expectFailure(route, req, status) {
  const response = await route.POST(req);
  assert.equal(response.status, status);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.ok(body.message);
  assert.equal(route.mail.length, 0);
  checks++;
}
for (const [data, status] of [
  ['{', 400], [null, 400], [[], 400], ['null', 400],
  ...['name', 'email', 'subject', 'message'].flatMap(field => [
    [{ ...valid, [field]: undefined }, 400], [{ ...valid, [field]: '  ' }, 400],
    [{ ...valid, [field]: 42 }, 400],
  ]),
  [{ ...valid, email: 'invalid' }, 400], [{ ...valid, email: 'a@example.test,b@example.test' }, 400],
  [{ ...valid, subject: 'Hello\r\nBcc: other@example.test' }, 400],
  [{ ...valid, name: 'x'.repeat(101) }, 400], [{ ...valid, email: 'x'.repeat(255) }, 400],
  [{ ...valid, subject: 'x'.repeat(151) }, 400], [{ ...valid, message: 'x'.repeat(2001) }, 400],
  [{ ...valid, website: 'https://bot.example.test' }, 400], [{ ...valid, website: 42 }, 400],
  ['x'.repeat(16_385), 413],
]) await expectFailure(server({ env: config }), request(data, {}, typeof data === 'string'), status);
await expectFailure(server(), request(), 503);
for (const field of Object.keys(config)) await expectFailure(server({ env: { ...config, [field]: '' } }), request(), 503);
await expectFailure(server({ env: config }), request(valid, { 'Content-Type': 'text/plain' }), 415);
await expectFailure(server({ env: config }), request(valid, { origin: 'https://unrelated.example.test' }), 403);
await expectFailure(server({ env: config }), request(valid, { 'sec-fetch-site': 'cross-site' }), 403);
await expectFailure(server({ env: config }), request(valid, { 'content-length': '16385' }), 413);
await expectFailure(server({ env: config }), new Request('http://localhost:3000/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json' } }), 400);

const escaped = server({ env: config });
const response = await escaped.POST(request({ ...valid, name: '  <Visitor> & "Guest"  ', subject: "<Enquiry> & 'quote'", message: '<script>alert(1)</script>\nSecond line' }));
assert.equal(response.status, 200);
assert.equal((await response.json()).success, true);
assert.equal(escaped.mail[0].from.address, config.GMAIL_USER);
assert.equal(escaped.mail[0].to, config.CONTACT_TO_EMAIL);
assert.equal(escaped.mail[0].replyTo.address, valid.email);
assert.equal(escaped.mail[0].replyTo.name, '<Visitor> & "Guest"');
assert.match(escaped.mail[0].subject, /^Portfolio Contact: /);
assert.ok(!escaped.mail[0].html.includes('<script>'));
assert.ok(escaped.mail[0].html.includes('&lt;script&gt;'));
assert.ok(escaped.mail[0].html.includes('&quot;Guest&quot;'));
assert.ok(escaped.mail[0].html.includes('&#39;quote&#39;'));
assert.ok(escaped.mail[0].text.includes('<script>alert(1)</script>\nSecond line'));
assert.equal(escaped.transports[0].service, 'gmail');
assert.equal(escaped.transports[0].secure, true);
assert.equal(escaped.closed, 1);
checks++;
for (const send of [() => { throw new Error('Private SMTP error offline-test-placeholder'); }, () => ({ accepted: [], rejected: [] }), () => ({ accepted: ['other@example.test'], rejected: [] }), () => ({ accepted: [config.CONTACT_TO_EMAIL], rejected: ['other@example.test'] })]) {
  const route = server({ env: config, send });
  const result = await route.POST(request());
  assert.equal(result.status, 502);
  const body = await result.text();
  assert.ok(!body.includes('Private SMTP'));
  assert.ok(!body.includes(config.GMAIL_APP_PASSWORD));
  assert.equal(JSON.parse(body).success, false);
  assert.equal(route.closed, 1);
  checks++;
}
let now = 1000;
const limited = server({ env: config, clock: () => now });
for (let i = 0; i < 3; i++) assert.equal((await limited.POST(request())).status, 200);
const throttled = await limited.POST(request());
assert.equal(throttled.status, 429);
assert.equal(throttled.headers.get('Retry-After'), '600');
assert.equal(limited.mail.length, 3);
now += 600_001;
assert.equal((await limited.POST(request())).status, 200);
checks++;
let accept;
const delayed = server({ env: config, send: () => new Promise(resolve => { accept = resolve; }) });
let finished = false;
const waiting = delayed.POST(request()).then(result => { finished = true; return result; });
await new Promise(resolve => setTimeout(resolve, 0));
assert.equal(finished, false, 'Success must wait for SMTP acceptance');
accept({ accepted: [config.CONTACT_TO_EMAIL], rejected: [] });
assert.equal((await waiting).status, 200);
checks++;

function client(fetchMock) {
  const states = [], calls = [];
  let resets = 0;
  const profile = load('data/portfolio.ts', () => { throw new Error('Unexpected import'); }).profile;
  const jsx = (type, props) => ({ type, props });
  const component = load('components/sections/contact.tsx', name => {
    if (name === 'react') return { useState: initial => [initial, state => states.push(state)], useRef: value => ({ current: value }) };
    if (name === 'react/jsx-runtime') return { jsx, jsxs: jsx, Fragment: 'fragment' };
    if (name === 'lucide-react') return new Proxy({}, { get: (_, key) => key });
    if (name === '@/data/portfolio') return { profile };
    if (name === '@/components/ui/glass') return { Glass: 'glass', Reveal: 'reveal' };
    if (name === '@/components/ui/section-heading') return { SectionHeading: 'heading' };
    throw new Error(`Unexpected import ${name}`);
  }, { FormData: class { constructor(form) { this.values = form.values; } get(key) { return this.values[key]; } }, fetch: async (...args) => { calls.push(args); return fetchMock(...args); } });
  function find(node) {
    if (!node || typeof node !== 'object') return;
    if (node?.type === 'form') return node;
    for (const child of [node?.props?.children].flat()) { const form = find(child); if (form) return form; }
  }
  const form = find(component.default());
  const event = { preventDefault() {}, currentTarget: { values: { ...valid }, reportValidity: () => true, reset: () => { resets++; } } };
  return { submit: () => form.props.onSubmit(event), states, calls, get resets() { return resets; } };
}
for (const fetchMock of [() => Response.json({ success: false }, { status: 503 }), () => Response.json({ success: true }, { status: 500 }), () => Response.json({ success: 'true' }), () => { throw new Error('Offline'); }]) {
  const form = client(fetchMock);
  await form.submit();
  assert.equal(form.states[0].kind, 'loading');
  assert.equal(form.states.at(-1).kind, 'error');
  assert.equal(form.resets, 0);
  assert.ok(!form.states.some(state => state.kind === 'success'));
  checks++;
}
let finishSend;
const form = client(() => new Promise(resolve => { finishSend = resolve; }));
const submission = form.submit();
await form.submit();
assert.equal(form.calls.length, 1, 'Double submit must be blocked synchronously');
assert.equal(form.resets, 0);
assert.equal(form.calls[0][0], '/api/contact');
assert.deepEqual(JSON.parse(form.calls[0][1].body), valid);
finishSend(Response.json({ success: true }));
await submission;
assert.equal(form.resets, 1);
assert.equal(form.states.at(-1).kind, 'success');
const retry = form.submit();
assert.equal(form.calls.length, 2, 'A completed request must allow another submission');
finishSend(Response.json({ success: false }, { status: 502 }));
await retry;
assert.equal(form.states.at(-1).kind, 'error');
assert.equal(form.resets, 1);
checks++;
console.log(`PASS: ${checks} contact cases; mocked SMTP acceptance/errors, sanitization, reply-to, throttle, client failure/success and duplicate prevention`);
