const fs = require('fs');
const { JSDOM } = require('jsdom');
const html = fs.readFileSync('index.html', 'utf8');
const dom = new JSDOM(html, { runScripts: 'dangerously', resources: 'usable', url: 'http://localhost:5064' });
const window = dom.window;
let errors = [];
window.addEventListener('error', e => {
  errors.push({message:e.message, filename:e.filename, lineno:e.lineno, colno:e.colno});
});
window.addEventListener('unhandledrejection', e => {
  errors.push({message:(e.reason && e.reason.message ? e.reason.message : String(e.reason)), type:'unhandledrejection'});
});
setTimeout(() => {
  if (errors.length) {
    console.log('ERRORS');
    console.log(JSON.stringify(errors, null, 2));
  } else {
    console.log('OK');
    console.log('BODYLEN', window.document.body.innerHTML.length);
  }
  process.exit(0);
}, 1000);
