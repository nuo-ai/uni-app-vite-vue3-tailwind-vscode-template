import type { Plugin } from 'vite'
import process from 'node:process'
import postcssCalc from '@weapp-tailwindcss/postcss-calc'
import postcss from 'postcss'

const spacingVariables = /var\(--spacing\)/g
const spaceReverseVariables = /var\(--tw-space-y-reverse\)/g

function resolveLegacySpacing(value: string) {
  if (!value.includes('var(--spacing)')) {
    return
  }

  return value
    .replace(spacingVariables, '0.25rem')
    .replace(spaceReverseVariables, '0')
}

export function appWebviewCssCompat(): Plugin {
  return {
    name: 'app-webview-css-compat',
    apply() {
      return process.env.UNI_PLATFORM === 'app'
    },
    enforce: 'post',
    generateBundle: {
      order: 'post',
      async handler(_options, bundle) {
        for (const output of Object.values(bundle)) {
          if (output.type !== 'asset' || !output.fileName.endsWith('.css')) {
            continue
          }

          const root = postcss.parse(output.source.toString())

          root.walkDecls('background-clip', (declaration) => {
            if (declaration.value === 'text') {
              declaration.cloneBefore({ prop: '-webkit-background-clip' })
            }
          })

          root.walkDecls((declaration) => {
            const resolved = resolveLegacySpacing(declaration.value)
            if (resolved) {
              declaration.value = resolved
            }
          })

          const result = await postcss([
            postcssCalc({
              preserve: false,
              warnWhenCannotResolve: false,
            }),
          ]).process(root, { from: undefined })

          output.source = result.css
        }
      },
    },
  }
}
