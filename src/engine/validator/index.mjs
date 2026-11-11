/**
 * Validate one study directory against the v2 rules.
 *
 * The result is a report, not an exception: a study that fails is a study to
 * fix, and the report is the list of fixes. `ok` is reserved for "no errors",
 * so warnings never block a deployment.
 */
import { openStudy } from './tree.mjs'
import { RULES } from './rules.mjs'

export async function validateStudy(dir) {
  const ctx = await openStudy(dir)
  const findings = []

  for (const rule of RULES) {
    for (const message of await rule.check(ctx)) {
      findings.push({
        id: rule.id,
        severity: rule.severity,
        title: rule.title,
        message,
        fix: rule.fix,
      })
    }
  }

  const order = { error: 0, warning: 1, info: 2 }
  findings.sort((a, b) => order[a.severity] - order[b.severity] || a.id.localeCompare(b.id))

  return {
    dir,
    ok: !findings.some((finding) => finding.severity === 'error'),
    findings,
  }
}
