import fs from 'node:fs';
import path from 'node:path';

import ts from 'typescript';

const workspace = process.cwd();
const guidePath = path.join(workspace, 'docs', 'GUIA-ENDPOINTS-API.md');
const openApiPath = path.join(workspace, 'docs', 'openapi.yaml');
const sourceRoot = path.join(workspace, 'src', 'app');
const allowedMethods = new Set(['DELETE', 'GET', 'PATCH', 'POST', 'PUT']);

const guideOperations = parseGuideOperations(read(guidePath));
const openApiOperations = parseOpenApiOperations(read(openApiPath));
assertEqualOperationSets(
  guideOperations,
  openApiOperations,
  'GUIA-ENDPOINTS-API.md',
  'openapi.yaml',
);

const frontendOperations = collectFrontendOperations(sourceRoot);
const guideCanonical = canonicalSet(guideOperations);
const unpublished = [...frontendOperations].filter((operation) => !guideCanonical.has(operation));
if (unpublished.length > 0) {
  fail(`Angular consume operaciones no publicadas:\n${unpublished.join('\n')}`);
}

verifyProductionConfiguration();
verifyClientSource();

const documentedWithoutConsumer = guideOperations.size - frontendOperations.size;
process.stdout.write(
  [
    'RELEASE_AUDIT=PASS',
    `GUIDE_OPERATIONS=${guideOperations.size}`,
    `OPENAPI_OPERATIONS=${openApiOperations.size}`,
    `FRONTEND_API_OPERATIONS=${frontendOperations.size}`,
    'TRANSVERSAL_CSRF_OPERATIONS=1',
    `DOCUMENTED_WITHOUT_FRONTEND_CONSUMER=${documentedWithoutConsumer}`,
    'PRODUCTION_CONFIGURATION=PASS',
    'CLIENT_SECURITY_STATIC_CHECKS=PASS',
  ].join('\n') + '\n',
);

function parseGuideOperations(contents) {
  return new Set(
    [...contents.matchAll(/^## (DELETE|GET|PATCH|POST|PUT) (\/api\/v1\/[^\r\n]+)/gm)].map(
      (match) => `${match[1]} ${match[2]}`,
    ),
  );
}

function parseOpenApiOperations(contents) {
  const operations = new Set();
  let currentPath = null;
  for (const line of contents.split(/\r?\n/)) {
    const pathMatch = line.match(/^  (\/api\/v1\/.*):\s*$/);
    if (pathMatch) {
      currentPath = pathMatch[1];
      continue;
    }
    const methodMatch = line.match(/^    (delete|get|patch|post|put):\s*$/);
    if (currentPath && methodMatch) {
      operations.add(`${methodMatch[1].toUpperCase()} ${currentPath}`);
    }
  }
  return operations;
}

function assertEqualOperationSets(left, right, leftName, rightName) {
  const leftCanonical = canonicalSet(left);
  const rightCanonical = canonicalSet(right);
  const leftOnly = [...leftCanonical].filter((operation) => !rightCanonical.has(operation));
  const rightOnly = [...rightCanonical].filter((operation) => !leftCanonical.has(operation));
  if (leftOnly.length > 0 || rightOnly.length > 0) {
    fail(
      `${leftName} y ${rightName} difieren. Solo ${leftName}: ${leftOnly.join(', ') || 'ninguna'}. ` +
        `Solo ${rightName}: ${rightOnly.join(', ') || 'ninguna'}.`,
    );
  }
}

function collectFrontendOperations(root) {
  const operations = new Set();
  for (const file of filesUnder(
    root,
    (name) => name.endsWith('.service.ts') || name.endsWith('.gateway.ts'),
  )) {
    const source = ts.createSourceFile(
      file,
      read(file),
      ts.ScriptTarget.Latest,
      true,
      ts.ScriptKind.TS,
    );
    visit(source, source, file, operations, collectEndpointConstants(source));
  }

  for (const operation of manualDynamicOperations()) {
    operations.add(canonicalOperation(operation));
  }
  return operations;
}

function visit(node, source, file, operations, endpointConstants) {
  if (ts.isCallExpression(node) && ts.isPropertyAccessExpression(node.expression)) {
    const method = node.expression.name.text.toUpperCase();
    const argument = node.arguments[0];
    if (allowedMethods.has(method) && argument) {
      const endpoint = endpointFrom(argument, source, endpointConstants);
      if (endpoint?.startsWith('/')) {
        const versionedEndpoint = endpoint.startsWith('/api/v1/') ? endpoint : `/api/v1${endpoint}`;
        const operation = canonicalOperation(`${method} ${versionedEndpoint}`);
        if (!isExpandedDynamicOperation(operation, file)) {
          operations.add(operation);
        }
      }
    }
  }
  ts.forEachChild(node, (child) => visit(child, source, file, operations, endpointConstants));
}

function collectEndpointConstants(source) {
  const constants = new Map();
  function collect(node) {
    if (
      ts.isPropertyDeclaration(node) &&
      ts.isIdentifier(node.name) &&
      node.initializer &&
      ts.isStringLiteralLike(node.initializer)
    ) {
      constants.set(node.name.text, node.initializer.text);
    }
    ts.forEachChild(node, collect);
  }
  collect(source);
  return constants;
}

function endpointFrom(argument, source, endpointConstants) {
  if (ts.isStringLiteralLike(argument)) return argument.text;
  const constant = endpointConstantFrom(argument, endpointConstants);
  if (constant) return constant;
  if (!ts.isTemplateExpression(argument)) return null;
  let endpoint = argument.head.text;
  for (const span of argument.templateSpans) {
    endpoint +=
      (endpointConstantFrom(span.expression, endpointConstants) ??
        `{${span.expression.getText(source)}}`) + span.literal.text;
  }
  return endpoint;
}

function endpointConstantFrom(expression, endpointConstants) {
  if (
    ts.isPropertyAccessExpression(expression) &&
    expression.expression.kind === ts.SyntaxKind.ThisKeyword
  ) {
    return endpointConstants.get(expression.name.text) ?? null;
  }
  return null;
}

function isExpandedDynamicOperation(operation, file) {
  const normalizedFile = file.replaceAll('\\', '/');
  return (
    (normalizedFile.endsWith('/accounts-api.service.ts') &&
      operation === 'POST /api/v1/account-requests/{}/{}') ||
    (normalizedFile.endsWith('/organization-api.service.ts') &&
      operation === 'GET /api/v1/m02/{}/{}')
  );
}

function manualDynamicOperations() {
  return [
    'GET /api/v1/account-requests',
    'POST /api/v1/account-requests/{accountRequest}/approve',
    'POST /api/v1/account-requests/{accountRequest}/reject',
    ...['assignments', 'branches', 'permissions', 'roles', 'scopes', 'users'].map(
      (resource) => `GET /api/v1/m02/${resource}`,
    ),
    ...['assignments', 'branches', 'roles', 'users'].map(
      (resource) => `GET /api/v1/m02/${resource}/{id}`,
    ),
  ];
}

function verifyProductionConfiguration() {
  const packageJson = JSON.parse(read(path.join(workspace, 'package.json')));
  const angular = JSON.parse(read(path.join(workspace, 'angular.json')));
  const environment = read(
    path.join(workspace, 'src', 'environments', 'environment.production.ts'),
  );
  const production = angular.projects?.misvales?.architect?.build?.configurations?.production;
  const versions = {
    '@angular/core': '22.1.0',
    '@angular/cli': '22.1.2',
    typescript: '6.0.3',
    rxjs: '7.8.2',
    '@angular/material': '22.1.0',
    '@angular/cdk': '22.1.0',
    'decimal.js': '10.6.0',
  };
  for (const [name, expected] of Object.entries(versions)) {
    const actual = packageJson.dependencies?.[name] ?? packageJson.devDependencies?.[name];
    if (actual !== expected) fail(`Versión no reproducible para ${name}: ${actual ?? 'ausente'}.`);
  }
  if (read(path.join(workspace, '.nvmrc')).trim() !== '24.15.0') {
    fail('.nvmrc no fija Node.js 24.15.0.');
  }
  if (packageJson.packageManager !== 'npm@11.19.0') {
    fail('package.json no fija npm 11.19.0.');
  }
  if (production?.sourceMap !== false || !Array.isArray(production?.budgets)) {
    fail('La compilación production debe desactivar sourcemaps y conservar budgets explícitos.');
  }
  for (const expectation of [
    /production:\s*true/,
    /apiBaseUrl:\s*['"]\/api\/v1['"]/,
    /csrfUrl:\s*['"]\/sanctum\/csrf-cookie['"]/,
    /sourceMaps:\s*false/,
    /logPayloads:\s*false/,
    /businessTimezone:\s*['"]America\/Monterrey['"]/,
  ]) {
    if (!expectation.test(environment)) fail(`environment.production.ts no cumple ${expectation}.`);
  }
}

function verifyClientSource() {
  const files = [
    ...filesUnder(path.join(workspace, 'src'), (name) => /\.(html|ts)$/.test(name)),
    ...filesUnder(path.join(workspace, 'e2e'), (name) => name.endsWith('.ts')),
  ];
  const forbidden = [
    ['localStorage', /\blocalStorage\b/],
    ['sessionStorage', /\bsessionStorage\b/],
    ['console.log', /\bconsole\.log\s*\(/],
    ['HTML no confiable', /\bbypassSecurityTrust|\[innerHTML\]/],
    ['pruebas enfocadas u omitidas', /\b(?:fit|fdescribe|xit|xdescribe)\s*\(|\.(?:only|skip)\s*\(/],
    [
      'credenciales E2E incrustadas',
      /page\.fill\([^,\n]*(?:password|mfa-code)[^,\n]*,\s*['"][^'"]+['"]\s*\)/i,
    ],
    ['secreto TOTP incrustado', /authenticator\.generate\(\s*['"][A-Z2-7]+['"]\s*\)/],
  ];
  for (const file of files) {
    const contents = read(file);
    for (const [label, pattern] of forbidden) {
      if (pattern.test(contents)) {
        fail(`${label} detectado en ${path.relative(workspace, file)}.`);
      }
    }
  }
}

function canonicalSet(operations) {
  return new Set([...operations].map(canonicalOperation));
}

function canonicalOperation(operation) {
  return operation.replace(/\{[^}]+\}/g, '{}');
}

function filesUnder(root, predicate) {
  const files = [];
  if (!fs.existsSync(root)) return files;
  for (const entry of fs.readdirSync(root, { withFileTypes: true })) {
    const absolute = path.join(root, entry.name);
    if (entry.isDirectory()) files.push(...filesUnder(absolute, predicate));
    else if (predicate(entry.name)) files.push(absolute);
  }
  return files;
}

function read(file) {
  return fs.readFileSync(file, 'utf8');
}

function fail(message) {
  process.stderr.write(`RELEASE_AUDIT=FAIL\n${message}\n`);
  process.exit(1);
}
