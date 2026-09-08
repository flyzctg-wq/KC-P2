import fs from 'fs';

const filePath = 'src/theme.js';
let code = fs.readFileSync(filePath, 'utf8');
const beforeLen = code.length;

code = code.replace(/export const LOGO_MARK = "data:image\/png;base64,[^"]+";[^\n]*/, 'export const LOGO_MARK = "/logo-mark.png";');
code = code.replace(/export const LOGO_FULL = "data:image\/png;base64,[^"]+";/, 'export const LOGO_FULL = "/logo-full.png";');

console.log(`Before: ${beforeLen}, After: ${code.length}`);
fs.writeFileSync(filePath, code, 'utf8');
