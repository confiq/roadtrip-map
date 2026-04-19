import { webcrypto as crypto } from 'node:crypto';
import { readFileSync, writeFileSync } from 'node:fs';
import { createInterface } from 'node:readline';

const ITERATIONS = 600_000;
const PLAIN_PATH = './data/trip.json';
const OUT_PATH = './data/trip.enc.json';

function promptHidden(question) {
  return new Promise((resolve, reject) => {
    process.stdout.write(question);
    const stdin = process.stdin;
    const wasRaw = stdin.isRaw;
    if (!stdin.isTTY) {
      reject(new Error('stdin is not a TTY — pass password via arg or TRIP_PASSWORD env'));
      return;
    }
    stdin.setRawMode(true);
    stdin.resume();
    stdin.setEncoding('utf8');
    let input = '';
    const onData = (ch) => {
      if (ch === '\r' || ch === '\n' || ch === '\u0004') {
        stdin.setRawMode(wasRaw);
        stdin.pause();
        stdin.removeListener('data', onData);
        process.stdout.write('\n');
        resolve(input);
      } else if (ch === '\u0003') {
        stdin.setRawMode(wasRaw);
        process.stdout.write('\n');
        process.exit(130);
      } else if (ch === '\u007f' || ch === '\b') {
        input = input.slice(0, -1);
      } else {
        input += ch;
      }
    };
    stdin.on('data', onData);
  });
}

async function main() {
  let plaintext;
  try {
    plaintext = readFileSync(PLAIN_PATH, 'utf-8');
  } catch (err) {
    console.error(`✗ Can't read ${PLAIN_PATH}: ${err.message}`);
    process.exit(1);
  }
  try {
    JSON.parse(plaintext);
  } catch (err) {
    console.error(`✗ ${PLAIN_PATH} is not valid JSON: ${err.message}`);
    process.exit(1);
  }

  const password =
    process.argv[2] ||
    process.env.TRIP_PASSWORD ||
    (await promptHidden('Password: '));

  if (!password || password.length < 4) {
    console.error('✗ Password too short (min 4 chars).');
    process.exit(1);
  }

  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));

  const baseKey = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(password),
    { name: 'PBKDF2' },
    false,
    ['deriveKey']
  );
  const key = await crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: ITERATIONS, hash: 'SHA-256' },
    baseKey,
    { name: 'AES-GCM', length: 256 },
    false,
    ['encrypt']
  );
  const ciphertext = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    new TextEncoder().encode(plaintext)
  );

  const b64 = (buf) => Buffer.from(buf).toString('base64');
  const payload = {
    v: 1,
    alg: 'AES-GCM',
    kdf: 'PBKDF2',
    hash: 'SHA-256',
    iterations: ITERATIONS,
    salt: b64(salt),
    iv: b64(iv),
    ciphertext: b64(ciphertext),
  };
  writeFileSync(OUT_PATH, JSON.stringify(payload));
  const sizeKB = (JSON.stringify(payload).length / 1024).toFixed(1);
  console.log(`✓ Wrote ${OUT_PATH} (${sizeKB} KB)`);
  console.log(`  Password length: ${password.length} chars`);
  console.log(`  Iterations: ${ITERATIONS.toLocaleString()}`);
}

main().catch(err => {
  console.error('✗', err.message);
  process.exit(1);
});
