#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const https = require('https');

const BASE_URL = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights';
const OUT_DIR = path.join(__dirname, '..', 'client', 'public', 'models');

const FILES = [
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1'
];

const download = (url, dest) =>
  new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode === 301 || res.statusCode === 302) {
          res.resume();
          return download(res.headers.location, dest).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          res.resume();
          return reject(new Error(`${res.statusCode} for ${url}`));
        }
        const file = fs.createWriteStream(dest);
        res.pipe(file);
        file.on('finish', () => file.close(resolve));
        file.on('error', reject);
      })
      .on('error', reject);
  });

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  for (const name of FILES) {
    const dest = path.join(OUT_DIR, name);
    if (fs.existsSync(dest) && fs.statSync(dest).size > 0) {
      console.log(`skip  ${name}`);
      continue;
    }
    process.stdout.write(`fetch ${name} ... `);
    await download(`${BASE_URL}/${name}`, dest);
    console.log('done');
  }
  console.log(`\nModels ready in ${OUT_DIR}`);
}

main().catch((err) => {
  console.error(`\nFailed to download face-api models: ${err.message}`);
  process.exit(1);
});
