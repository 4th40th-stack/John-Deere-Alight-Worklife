/**
 * Node/sharp alternative — same outputs as generate-brand-assets.py (favicon only).
 *
 * Usage:
 *   npm install --save-dev sharp to-ico
 *   node scripts/generate-brand-assets.mjs
 *   node scripts/generate-brand-assets.mjs public/favicon-source.png
 *   node scripts/generate-brand-assets.mjs --from-logo public/PeakOne-Logo.jpg
 *
 * Source priority: CLI path → favicon-source.* → favicon.ico → logo-source.*
 */

import { spawnSync } from 'node:child_process'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import toIco from 'to-ico'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const publicDir = path.join(__dirname, '..', 'public')

const FAVICON_SOURCE_NAMES = ['favicon-source.ico', 'favicon-source.png', 'favicon-source.jpg']
const FAVICON_FALLBACK_NAMES = [
  'favicon.ico',
  'favicon.png',
  'favicon-32x32.png',
  'favicon wealthcare.ico',
  'images/favicon.ico',
  'images/favicon.png',
]
const LOGO_SOURCE_NAMES = ['logo-source.png', 'logo-source.jpg', 'logo-source.svg']

function parseArgs(argv) {
  let cliPath = null
  let forceLogo = false
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (arg === '--from-logo') {
      forceLogo = true
      cliPath = argv[i + 1]
      if (!cliPath) {
        console.error('--from-logo requires a path argument')
        process.exit(1)
      }
      i++
      continue
    }
    if (arg.startsWith('-')) {
      console.error(`Unknown option: ${arg}`)
      process.exit(1)
    }
    cliPath = arg
  }
  return { cliPath, forceLogo }
}

function rasterizeSvg(svgPath) {
  const outPng = path.join(publicDir, 'logo-source-raster.png')
  const result = spawnSync('qlmanage', ['-t', '-s', '512', '-o', publicDir, svgPath], {
    encoding: 'utf-8',
  })
  if (result.status !== 0) {
    console.error(
      `Cannot rasterize SVG without qlmanage (macOS): ${svgPath}\n` +
        'Export logo-source.png manually or pass a .png/.jpg path.'
    )
    process.exit(1)
  }
  const generated = path.join(publicDir, `${path.basename(svgPath)}.png`)
  if (fs.existsSync(generated)) {
    fs.renameSync(generated, outPng)
    return outPng
  }
  console.error(`SVG rasterize failed: ${svgPath}`)
  process.exit(1)
}

function prepareSource(sourcePath) {
  if (sourcePath.toLowerCase().endsWith('.svg')) {
    return rasterizeSvg(sourcePath)
  }
  return sourcePath
}

function classifyKind(sourcePath, forceLogo) {
  if (forceLogo) return 'logo fallback'
  const name = path.basename(sourcePath).toLowerCase()
  if (name.includes('favicon') || FAVICON_SOURCE_NAMES.includes(name)) return 'favicon'
  if (name.includes('logo') || LOGO_SOURCE_NAMES.includes(name)) return 'logo fallback'
  return 'favicon'
}

function globFaviconCandidates() {
  const found = []
  for (const name of fs.readdirSync(publicDir)) {
    const lower = name.toLowerCase()
    if (!lower.includes('favicon')) continue
    if (!lower.endsWith('.ico') && !lower.endsWith('.png')) continue
    if (FAVICON_SOURCE_NAMES.includes(name)) continue
    found.push(path.join(publicDir, name))
  }
  return found.sort()
}

function resolveSource(cliPath, forceLogo) {
  if (cliPath) {
    const p = path.isAbsolute(cliPath) ? cliPath : path.join(process.cwd(), cliPath)
    if (!fs.existsSync(p)) {
      console.error(`Source not found: ${p}`)
      process.exit(1)
    }
    const prepared = prepareSource(p)
    return { source: prepared, kind: classifyKind(p, forceLogo) }
  }

  for (const name of FAVICON_SOURCE_NAMES) {
    const p = path.join(publicDir, name)
    if (fs.existsSync(p)) {
      return { source: prepareSource(p), kind: 'favicon' }
    }
  }

  for (const name of FAVICON_FALLBACK_NAMES) {
    const p = path.join(publicDir, name)
    if (fs.existsSync(p)) {
      return { source: prepareSource(p), kind: 'favicon' }
    }
  }

  for (const p of globFaviconCandidates()) {
    return { source: prepareSource(p), kind: 'favicon' }
  }

  for (const name of LOGO_SOURCE_NAMES) {
    const p = path.join(publicDir, name)
    if (fs.existsSync(p)) {
      return { source: prepareSource(p), kind: 'logo fallback' }
    }
  }

  console.error(
    'Missing source. Add public/favicon-source.ico, public/favicon.ico, or pass a path.\n' +
      'See BRAND_ICONS.md'
  )
  process.exit(1)
}

async function resizePng(source, size, outName) {
  const out = path.join(publicDir, outName)
  await sharp(source).resize(size, size, { fit: 'fill' }).png({ compressionLevel: 9 }).toFile(out)
  console.log(`Wrote ${outName} (${size}x${size})`)
}

async function resizeBuffer(source, size) {
  return sharp(source).resize(size, size, { fit: 'fill' }).png().toBuffer()
}

async function main() {
  const { cliPath, forceLogo } = parseArgs(process.argv.slice(2))
  const { source, kind } = resolveSource(cliPath, forceLogo)
  console.log(`Source: ${source} (${kind})`)

  await resizePng(source, 32, 'favicon.png')
  await resizePng(source, 32, 'favicon-32x32.png')
  await resizePng(source, 32, 'icon-32x32.png')
  await resizePng(source, 48, 'icon-48x48.png')
  await resizePng(source, 180, 'apple-touch-icon.png')

  const icoPngs = await Promise.all([
    resizeBuffer(source, 16),
    resizeBuffer(source, 32),
    resizeBuffer(source, 48),
  ])
  fs.writeFileSync(path.join(publicDir, 'favicon.ico'), await toIco(icoPngs))
  console.log('Wrote favicon.ico (16, 32, 48)')
  console.log(
    '\nSocial preview: point openGraph.images at your header logo (see BRAND_ICONS.md).'
  )
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
