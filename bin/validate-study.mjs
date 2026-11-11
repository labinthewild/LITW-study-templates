#!/usr/bin/env node
/**
 * Validate one study directory against the v2 rules.
 *
 *   node bin/validate-study.mjs src/starters/study-cats
 *   node bin/validate-study.mjs src/studies/<id> --json
 *
 * Exit codes: 0 valid, 1 has errors, 2 the arguments are wrong.
 *
 * Findings are grouped by rule so the explanation is printed once per rule,
 * not once per problem: a study with thirty v1 keys has one thing wrong with
 * it, said thirty times.
 */
import { validateStudy } from '../src/engine/validator/index.mjs'

const args = process.argv.slice(2)
const dir = args.find((arg) => !arg.startsWith('--'))
const json = args.includes('--json')

if (!dir) {
  console.error('usage: node bin/validate-study.mjs <study-dir> [--json]')
  process.exit(2)
}

const report = await validateStudy(dir)

if (json) {
  console.log(JSON.stringify(report, null, 2))
  process.exit(report.ok ? 0 : 1)
}

const bySeverity = (severity) => report.findings.filter((finding) => finding.severity === severity)
const errors = bySeverity('error')
const warnings = bySeverity('warning')
const infos = bySeverity('info')

const parts = [report.ok ? 'valid' : `${errors.length} error(s)`]
if (warnings.length) parts.push(`${warnings.length} warning(s)`)
if (infos.length) parts.push(`${infos.length} note(s)`)

console.log(`${dir} — ${parts.join(', ')}`)

const groups = new Map()
for (const finding of [...errors, ...warnings, ...infos]) {
  if (!groups.has(finding.id)) groups.set(finding.id, [])
  groups.get(finding.id).push(finding)
}

for (const findings of groups.values()) {
  const { id, severity, title, fix } = findings[0]
  console.log(`\n${severity}  ${id} — ${title}`)

  const limit = 20
  for (const finding of findings.slice(0, limit)) {
    console.log(`  • ${finding.message}`)
  }
  if (findings.length > limit) {
    console.log(`  • …and ${findings.length - limit} more`)
  }

  console.log(`\n  fix: ${fix}`)
}

process.exit(report.ok ? 0 : 1)
