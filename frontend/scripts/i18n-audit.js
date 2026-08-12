#!/usr/bin/env node
/**
 * Audit i18n — repère toute chaîne de langage naturel qui n'passe pas par t().
 *
 *   node scripts/i18n-audit.js            # site public seulement
 *   node scripts/i18n-audit.js --all      # admin inclus
 *   node scripts/i18n-audit.js --json     # sortie machine
 *
 * Le principe : on retire d'abord tout ce qui ne peut pas être du texte visible
 * (imports, classes CSS, URLs, appels de traduction…), puis on signale ce qui
 * ressemble encore à une phrase destinée à un humain.
 */
const fs = require('fs')
const path = require('path')

const ROOT = path.join(__dirname, '..', 'src')
const ARGS = process.argv.slice(2)
const INCLUDE_ADMIN = ARGS.includes('--all')
const AS_JSON = ARGS.includes('--json')

// Fichiers dont le contenu est par nature du texte source (les traductions elles-mêmes)
const SKIP_FILES = [
  /i18n[\\/]translations\.ts$/,   // le fichier de traductions lui-même
  /i18n[\\/]geo\.ts$/,            // tables fuseaux/pays/devises : constantes techniques
  /scripts[\\/]/,
]
const ADMIN_FILES = [/app[\\/]admin[\\/]/]

/**
 * Exceptions légitimes. Une ligne annotée `// i18n-ignore` est également
 * ignorée, ce qui permet de justifier un cas au plus près du code.
 *
 * Les données de repli (affichées seulement si l'API est injoignable) et les
 * noms propres n'ont pas vocation à être traduits.
 */
const ALLOWED = [
  /^Vision Europe Africa/,          // marque
  /^(Français|English|Português|Deutsch)$/, // langues, écrites dans leur langue
  /^Kinshasa/, /^& Europe$/,        // adresse
  /^Jean-Baptiste Kabila$/,         // exemple de saisie
  /^use (client|server)$/,          // directive Next.js
  /^&[a-z]+;/,                      // entités typographiques (&ldquo;)
  /^[\w-]+\s*[;:]\s*[\w-]/,        // liste de politiques (allow, permissions…)
]

// Fragments de code que l'extraction ligne à ligne peut prendre pour du texte
const CODE_NOISE = [
  /[=<>]{1,2}\s|\)\s*\|\||\?\?|=>|\.\w+\(/,
  /^(w|h|text|bg|border|rounded|flex|grid|p|m|gap)-/,   // classes utilitaires
  /dark:|hover:|focus:|sm:|md:|lg:/,                    // variantes Tailwind
]

const FALLBACK_BLOCKS = [
  { file: /useDestinations\.ts$/, from: /FALLBACK_DESTINATIONS/, to: /^\]/m },
  { file: /page\.tsx$/,           from: /STATIC_TESTIMONIALS/,   to: /^\]/m },
  { file: /apply[\\/]page\.tsx$/, from: /FALLBACK_CURRENCIES/,   to: /^\]/m },
]

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir)) {
    const p = path.join(dir, entry)
    if (fs.statSync(p).isDirectory()) walk(p, out)
    else if (/\.tsx?$/.test(p)) out.push(p)
  }
  return out
}

// ── Nettoyage : on neutralise ce qui ne peut pas être du texte affiché ────────
function stripNonText(code) {
  return code
    // commentaires
    .replace(/\/\*[\s\S]*?\*\//g, m => m.replace(/[^\n]/g, ' '))
    .replace(/(^|[^:])\/\/[^\n]*/g, (m, p1) => p1 + ' '.repeat(Math.max(m.length - p1.length, 0)))
    // imports / exports de modules
    .replace(/^\s*(import|export)\s+[^\n]*from\s*['"][^'"]*['"];?/gm, m => ' '.repeat(m.length))
    // appels de traduction : c'est justement ce qu'on veut ignorer
    .replace(/\bt\(\s*(['"`])(?:\\.|(?!\1)[^\\])*\1/g, m => ' '.repeat(m.length))
    .replace(/\btList<[^>]*>\(\s*(['"`])(?:\\.|(?!\1)[^\\])*\1/g, m => ' '.repeat(m.length))
    // classes CSS, styles, identifiants techniques
    .replace(/\b(className|class|style|id|key|htmlFor|type|name|href|src|rel|target|viewBox|d|fill|stroke|sizes|as|method|action|autoComplete|inputMode|pattern|accept)\s*=\s*(['"`])(?:\\.|(?!\2)[^\\])*\2/g,
      m => ' '.repeat(m.length))
    .replace(/\b(className|style)\s*=\s*\{`(?:\\.|[^`\\])*`\}/g, m => ' '.repeat(m.length))
    // journalisation et erreurs techniques
    .replace(/\b(console\.\w+|logger\.\w+|new Error)\([^)]*\)/g, m => ' '.repeat(m.length))
}

// ── Une chaîne est-elle du texte destiné à un humain ? ────────────────────────
const TECHNICAL = [
  /^[a-z0-9_-]+$/i,                    // identifiant simple : student, sort_order
  /^[A-Z_]+$/,                         // CONSTANTE
  /^[\w-]+(\s[\w-]+)*$/u,              // à affiner ci-dessous
]

function looksHuman(value) {
  const v = value.trim()
  if (v.length < 4) return false
  if (/^[\s.·—–\-*|/\\:,;!?()\[\]]+$/.test(v)) return false   // ponctuation seule
  if (/^https?:|^\/|^#|^mailto:|^tel:|^data:/.test(v)) return false      // URL, chemin, couleur
  if (/^[\d\s.,:%€$£+-]+$/.test(v)) return false                          // nombres, montants nus
  if (/^[a-z0-9_.-]+$/i.test(v)) return false                             // slug / identifiant
  if (/^[a-z]+([A-Z][a-z]*)+$/.test(v)) return false                      // camelCase
  if (/^\d{1,2}:\d{2}/.test(v)) return false                              // heure
  if (/^(px|rem|em|vh|vw|%|auto|none|flex|grid|block)\b/.test(v)) return false
  if (/[<>{}]/.test(v) && !/[a-zà-ÿ]{4}/i.test(v)) return false

  // Il faut au moins un mot de 3 lettres, et soit un espace, soit un accent,
  // soit une majuscule initiale suivie de minuscules (« Profil », « Métier »).
  const hasWord = /[A-Za-zÀ-ÿ]{3,}/.test(v)
  const looksLikeSentence = /\s/.test(v) || /[À-ÿ]/.test(v) || /^[A-ZÀ-Ý][a-zà-ÿ]{2,}/.test(v)
  return hasWord && looksLikeSentence
}

// Fragments de code que l'analyse ligne à ligne peut confondre avec du texte
function looksLikeCode(v) {
  return /=>|\)\s*$|\(\s*['"`]|\.\w+\(|\$\{|`|\bconst\b|\breturn\b|\bfunction\b|\bappend\b|\bmap\b\(/.test(v)
    || /\.\w+\s*&&|\.\w+\s*\?\?|\blength\b|\bnull\b|\bundefined\b/.test(v)  // expressions JS
    || /^[a-z]+\.[a-z]/i.test(v)                                                   // accès à une propriété
}

// Clés d'objet dont la valeur est presque toujours affichée à l'écran
const TEXT_KEYS = /\b(label|title|desc|description|text|name|sub|subtitle|caption|placeholder|message|question|answer|q|a|cta|badge|tagline|heading|hint|error|success|tooltip|alt)\s*:\s*/

function auditFile(file) {
  const raw = fs.readFileSync(file, 'utf8')
  let code = stripNonText(raw)

  // neutralise les blocs de données de repli, non destinés à la traduction
  for (const block of FALLBACK_BLOCKS) {
    if (!block.file.test(file)) continue
    const start = code.search(block.from)
    if (start === -1) continue
    const rest = code.slice(start)
    const endMatch = rest.match(block.to)
    const end = endMatch ? start + endMatch.index + endMatch[0].length : code.length
    code = code.slice(0, start) + code.slice(start, end).replace(/[^\n]/g, ' ') + code.slice(end)
  }
  const lines = code.split('\n')
  const rawLines = raw.split('\n')
  const hits = []

  lines.forEach((line, i) => {
    // A. Texte JSX brut entre balises (hors expressions {…})
    const jsxLine = line.replace(/\{[^{}]*\}/g, '\u0000')
    for (const m of jsxLine.matchAll(/>([^<>\n]+)(?:<|$)/g)) {
      const text = m[1].split('\u0000').join(' ').trim()
      if (looksHuman(text) && !looksLikeCode(text)) {
        hits.push({ line: i + 1, kind: 'texte JSX', value: text })
      }
    }

    // B. Toute chaîne littérale restante. C'est volontairement large : les
    //    tableaux (['Profil', 'Projet']) et les ternaires dans le JSX
    //    échappaient aux motifs ciblés précédents.
    for (const m of line.matchAll(/(['"])((?:\\.|(?!\1)[^\\])*)\1/g)) {
      const value = m[2]
      if (!looksHuman(value) || looksLikeCode(value)) continue
      // ignore les valeurs qui servent de clé de traduction
      if (/^[a-z_]+(\.[a-z_]+)+$/i.test(value)) continue
      hits.push({ line: i + 1, kind: 'chaîne', value })
    }
  })

  // déduplique par ligne + valeur
  const seen = new Set()
  return hits.filter(h => {
    const k = `${h.line}|${h.value}`
    if (seen.has(k)) return false
    seen.add(k)
    if (ALLOWED.some(re => re.test(h.value.trim()))) return false
    if (CODE_NOISE.some(re => re.test(h.value))) return false
    if (/\/\/\s*i18n-ignore/.test(rawLines[h.line - 1] || '')) return false
    // ignore si la ligne d'origine contient déjà un appel de traduction sur cette valeur
    return !new RegExp(`t\\(['\`][^'\`]*['\`]\\s*\\)\\s*[^\\n]*${h.value.slice(0, 12).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`).test(rawLines[h.line - 1] || '')
  })
}

const files = walk(ROOT)
  .filter(f => !SKIP_FILES.some(re => re.test(f)))
  .filter(f => INCLUDE_ADMIN || !ADMIN_FILES.some(re => re.test(f)))

const report = []
for (const file of files) {
  const hits = auditFile(file)
  if (hits.length) report.push({ file: path.relative(path.join(__dirname, '..'), file), hits })
}

if (AS_JSON) {
  console.log(JSON.stringify(report, null, 2))
} else {
  const total = report.reduce((n, r) => n + r.hits.length, 0)
  if (!total) {
    console.log(`✅ Aucun texte en dur dans ${files.length} fichiers analysés`)
  } else {
    console.log(`❌ ${total} texte(s) en dur dans ${report.length} fichier(s) :\n`)
    for (const { file, hits } of report) {
      console.log(`  ${file}`)
      for (const h of hits) {
        console.log(`    ${String(h.line).padStart(5)}  [${h.kind}] ${h.value.slice(0, 68)}`)
      }
      console.log('')
    }
  }
  console.log(`(${files.length} fichiers analysés${INCLUDE_ADMIN ? ', admin inclus' : ', admin exclu — utilisez --all'})`)
  process.exit(total ? 1 : 0)
}
