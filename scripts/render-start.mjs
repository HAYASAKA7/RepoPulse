import { execFileSync, spawn } from 'child_process'
import { mkdirSync, readFileSync, writeFileSync } from 'fs'
import path from 'path'

const cacheDir = process.env.PUPPETEER_CACHE_DIR || path.join(process.cwd(), '.cache', 'puppeteer')
const chromePathFile = path.join(cacheDir, 'chrome-path.txt')

mkdirSync(cacheDir, { recursive: true })

let chromePath = process.env.PUPPETEER_EXECUTABLE_PATH || process.env.CHROME_PATH || process.env.PUPPETEER_CHROME_PATH

if (!chromePath) {
  try {
    chromePath = readFileSync(chromePathFile, 'utf8').trim()
  } catch {
    chromePath = ''
  }
}

if (!chromePath) {
  const output = execFileSync(
    'npx',
    ['puppeteer', 'browsers', 'install', 'chrome', '--path', cacheDir, '--format={{path}}'],
    { encoding: 'utf8' }
  ).trim()

  chromePath = output.split(/\r?\n/).pop()?.trim() || ''
  if (chromePath) {
    writeFileSync(chromePathFile, chromePath)
  }
}

if (chromePath) {
  process.env.PUPPETEER_EXECUTABLE_PATH = chromePath
}

const child = spawn(process.execPath, ['server/index.js'], {
  stdio: 'inherit',
  env: process.env,
})

child.on('exit', (code, signal) => {
  if (signal) {
    process.kill(process.pid, signal)
    return
  }
  process.exit(code ?? 1)
})
