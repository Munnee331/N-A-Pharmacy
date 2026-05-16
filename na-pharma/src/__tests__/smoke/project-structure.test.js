import { existsSync } from 'fs'
import { resolve } from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Resolve the src directory relative to this test file (two levels up from __tests__/smoke/)
const srcDir = resolve(__dirname, '..', '..')

describe('Project Structure', () => {
  const requiredDirectories = [
    'components',
    'pages',
    'layouts',
    'assets',
    'styles',
    'routes',
    'hooks',
    'utils',
  ]

  it.each(requiredDirectories)(
    'src/%s directory exists',
    (dir) => {
      const dirPath = resolve(srcDir, dir)
      expect(existsSync(dirPath)).toBe(true)
    }
  )
})
