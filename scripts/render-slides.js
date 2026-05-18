#!/usr/bin/env node
// scripts/render-slides.js
'use strict';

const path = require('path');
const fs = require('fs');
const http = require('http');
const { execFileSync } = require('child_process');
const { chromium } = require(path.join(__dirname, '../node_modules/@playwright/test'));

const ROOT        = path.resolve(__dirname, '..');
const FFMPEG      = `${process.env.HOME}/.nvm/versions/node/v24.15.0/lib/node_modules/ffmpeg-static/ffmpeg`;
const WEBM        = path.join(ROOT, 'video-assets/ghars-demo-1080p.webm');
const AUDIO_FILE  = path.join(ROOT, 'docs/video/ElevenLabs_2026-05-18T05_43_14_Victoria - Warm, Trustworthy, and Relatable_pvc_sp70_s100_sb100_se44_b_m2.mp3');
const PHONE_FRAME = path.join(ROOT, 'scripts/assets/phone-frame.png');
const SLIDES_DIR  = path.join(ROOT, 'slides');
const TMP         = path.join(ROOT, 'tmp/slides-render');
const OUT         = path.join(ROOT, 'video-assets/ghars-hackathon-slides.mp4');

const SLIDES = [
  { id: '01', type: 'png',  file: '01-title.html',           duration: 8  },
  { id: '02', type: 'png',  file: '02-problem.html',          duration: 26 },
  { id: '03', type: 'png',  file: '03-thesis.html',           duration: 15 },
  { id: '04', type: 'demo', file: '04-demo-verse.html',       duration: 12, seek: 49  },
  { id: '05', type: 'demo', file: '05-demo-tafsir.html',      duration: 10, seek: 61  },
  { id: '06', type: 'demo', file: '06-demo-reflection.html',  duration: 19, seek: 71  },
  { id: '07', type: 'demo', file: '07-demo-plant.html',       duration: 6,  seek: 90  },
  { id: '08', type: 'demo', file: '08-demo-grove.html',       duration: 14, seek: 96  },
  { id: '09', type: 'demo', file: '09-demo-bookmarks.html',   duration: 17, seek: 110 },
  { id: '10', type: 'png',  file: '10-api-beat.html',         duration: 12 },
  { id: '11', type: 'png',  file: '11-close.html',            duration: 11 },
  { id: '12', type: 'png',  file: '12-outro.html',            duration: 7  },
];

// ── helpers ──────────────────────────────────────────────────────────────────

function ff(args) {
  execFileSync(FFMPEG, ['-y', ...args], { stdio: 'pipe' });
}

function startServer(port) {
  const server = http.createServer((req, res) => {
    const url  = req.url === '/' ? '/index.html' : req.url;
    const file = path.join(SLIDES_DIR, url);
    const ext  = path.extname(file);
    const ct   = ext === '.css' ? 'text/css' : 'text/html';
    try {
      res.writeHead(200, { 'Content-Type': ct });
      res.end(fs.readFileSync(file));
    } catch {
      res.writeHead(404);
      res.end('not found');
    }
  });
  server.listen(port);
  return server;
}

async function screenshotSlide(page, slide) {
  await page.goto(`http://localhost:3333/${slide.file}`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(300);
  const out = path.join(TMP, `${slide.id}.png`);
  await page.screenshot({ path: out, type: 'png' });
  return out;
}

function pngToClip(pngPath, duration, outPath) {
  ff([
    '-loop', '1', '-i', pngPath,
    '-t', String(duration), '-r', '25',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    outPath,
  ]);
}

function compositeDemo(bgPng, seek, duration, outPath) {
  ff([
    '-ss', String(seek), '-t', String(duration), '-i', WEBM,
    '-loop', '1', '-i', bgPng,
    '-loop', '1', '-i', PHONE_FRAME,
    '-filter_complex',
      '[1:v]scale=1920:1080[bg];' +
      '[0:v]scale=390:844[app];' +
      '[bg][app]overlay=1105:118[with_app];' +
      '[with_app][2:v]overlay=0:0:format=auto[out]',
    '-map', '[out]',
    '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
    '-t', String(duration), '-r', '25',
    outPath,
  ]);
}

function xfadeAll(clips) {
  const FADE = 0.5;
  let current    = clips[0].path;
  let currentDur = clips[0].duration;

  for (let i = 1; i < clips.length; i++) {
    const merged = path.join(TMP, `merged_${i}.mp4`);
    const offset = +(currentDur - FADE).toFixed(3);

    console.log(`  xfade ${i}/${clips.length - 1}  offset=${offset}s`);
    ff([
      '-i', current, '-i', clips[i].path,
      '-filter_complex',
        `xfade=transition=fade:duration=${FADE}:offset=${offset}`,
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p',
      merged,
    ]);

    currentDur = +(currentDur + clips[i].duration - FADE).toFixed(3);
    current    = merged;
  }
  return { path: current, duration: currentDur };
}

function mixAudio(videoPath, audioPath, outPath) {
  ff([
    '-i', videoPath,
    '-i', audioPath,
    '-map', '0:v:0', '-map', '1:a:0',
    '-c:v', 'copy',
    '-c:a', 'aac', '-b:a', '192k',
    '-shortest',
    '-movflags', '+faststart',
    outPath,
  ]);
}

// ── main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log('→ cleaning tmp...');
  fs.rmSync(TMP, { recursive: true, force: true });
  fs.mkdirSync(TMP, { recursive: true });

  const server  = startServer(3333);
  const browser = await chromium.launch();
  const page    = await browser.newPage();
  await page.setViewportSize({ width: 1920, height: 1080 });

  const clips = [];

  for (const slide of SLIDES) {
    console.log(`→ [${slide.id}] ${slide.file}`);
    const pngPath  = await screenshotSlide(page, slide);
    const clipPath = path.join(TMP, `${slide.id}.mp4`);

    if (slide.type === 'png') {
      pngToClip(pngPath, slide.duration, clipPath);
    } else {
      compositeDemo(pngPath, slide.seek, slide.duration, clipPath);
    }

    clips.push({ path: clipPath, duration: slide.duration });
  }

  await browser.close();
  server.close();

  console.log('\n→ applying xfades...');
  const merged = xfadeAll(clips);

  console.log('\n→ mixing audio...');
  mixAudio(merged.path, AUDIO_FILE, OUT);

  console.log('\n→ cleaning tmp...');
  fs.rmSync(TMP, { recursive: true, force: true });

  console.log(`\nDone → ${OUT}`);
}

main().catch(err => { console.error(err.message); process.exit(1); });
