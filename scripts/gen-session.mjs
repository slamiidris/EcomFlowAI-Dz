// Dev helper: print a valid dzads_session cookie for a given user.
// Usage: node scripts/gen-session.mjs <sub> <email> <name>
import 'dotenv/config';
import crypto from 'crypto';

const secret = process.env.SESSION_SECRET || (process.env.NODE_ENV === 'production' ? '' : 'dzads-dev-session-secret');
const [sub = '4d80f382-29c4-44fa-9fa0-f24b2c7e76c9', email = 'anisou756@gmail.com', name = 'AnIs F5'] = process.argv.slice(2);
const body = Buffer.from(JSON.stringify({ sub, email, name })).toString('base64url');
const sig = crypto.createHmac('sha256', secret).update(body).digest('base64url');
console.log(`${body}.${sig}`);
