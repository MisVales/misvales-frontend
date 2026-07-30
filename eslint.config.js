// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');
const prettier = require('eslint-config-prettier');
const fs = require('node:fs');
const path = require('node:path');

const SOURCE_ROOT = path.resolve(__dirname, 'src/app');
const ALIASES = {
  '@core/': path.join(SOURCE_ROOT, 'core'),
  '@features/': path.join(SOURCE_ROOT, 'features'),
  '@layouts/': path.join(SOURCE_ROOT, 'layouts'),
  '@shared/': path.join(SOURCE_ROOT, 'shared'),
};

function resolveImport(source, importer) {
  const alias = Object.entries(ALIASES).find(([prefix]) => source.startsWith(prefix));
  const base = alias
    ? path.join(alias[1], source.slice(alias[0].length))
    : source.startsWith('.')
      ? path.resolve(path.dirname(importer), source)
      : null;

  if (!base) {
    return null;
  }

  return [base, `${base}.ts`, path.join(base, 'index.ts')].find((candidate) =>
    fs.existsSync(candidate),
  );
}

function importedSources(filename) {
  const text = fs.readFileSync(filename, 'utf8');
  return [...text.matchAll(/(?:from\s+|import\s*\()\s*['"]([^'"]+)['"]/g)].map((match) => match[1]);
}

function reachesFile(current, target, visited = new Set()) {
  if (path.normalize(current) === path.normalize(target)) {
    return true;
  }

  if (visited.has(current)) {
    return false;
  }
  visited.add(current);

  return importedSources(current).some((source) => {
    const resolved = resolveImport(source, current);
    return resolved ? reachesFile(resolved, target, visited) : false;
  });
}

const architecturePlugin = {
  rules: {
    'no-circular-dependencies': {
      meta: {
        type: 'problem',
        schema: [],
        messages: {
          circular: 'This import creates a circular dependency.',
        },
      },
      create(context) {
        const filename = context.filename;
        return {
          ImportDeclaration(node) {
            const imported = resolveImport(node.source.value, filename);
            if (imported && reachesFile(imported, filename)) {
              context.report({ node, messageId: 'circular' });
            }
          },
        };
      },
    },
  },
};

module.exports = defineConfig([
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    plugins: {
      architecture: architecturePlugin,
    },
    rules: {
      'architecture/no-circular-dependencies': 'error',
      '@typescript-eslint/no-explicit-any': 'error',
      'no-console': 'error',
      'no-restricted-syntax': [
        'error',
        {
          selector:
            "CallExpression[callee.property.name='skip'], CallExpression[callee.name='xit'], CallExpression[callee.name='xdescribe']",
          message: 'Skipped tests are not allowed.',
        },
      ],
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'mv',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'mv',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['src/app/shared/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*', '../features/*', '../../features/*'],
              message: 'Shared code cannot import feature internals.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['src/app/features/**/*.ts'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@features/*'],
              message: 'A feature cannot import another feature through its internal alias.',
            },
          ],
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
  prettier,
]);
