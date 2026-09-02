import { execFileSync } from 'node:child_process'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(import.meta.dirname, '../..')

describe('CI template matrix', () => {
  it('keeps build and HMR evidence rooted in the registered template source', () => {
    const output = execFileSync(process.execPath, ['scripts/ci-matrix.mjs'], {
      cwd: repoRoot,
      encoding: 'utf8',
    })
    const matrix = JSON.parse(output) as {
      build: Array<{ source?: string }>
      hmr: Array<{ source?: string }>
    }

    expect(matrix.build).not.toHaveLength(0)
    expect(matrix.hmr).not.toHaveLength(0)
    expect([...matrix.build, ...matrix.hmr].every(entry => entry.source === 'packages/template')).toBe(true)
  })
})
