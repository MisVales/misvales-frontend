import { defineConfig } from 'vitest/config';
import * as path from 'path';
import * as fs from 'fs';

function inlineNgTemplates() {
  return {
    name: 'inline-ng-templates',
    transform(code: string, id: string) {
      if (!id.endsWith('.ts') || id.includes('node_modules')) return null;
      let newCode = code;
      const dir = path.dirname(id);
      
      newCode = newCode.replace(/templateUrl:\s*['"](\.[^'"]+)['"]/g, (match, relPath) => {
        const filePath = path.resolve(dir, relPath);
        if (fs.existsSync(filePath)) {
          const content = fs.readFileSync(filePath, 'utf-8');
          return `template: ${JSON.stringify(content)}`;
        }
        return match;
      });

      newCode = newCode.replace(/styleUrl:\s*['"](\.[^'"]+)['"]/g, () => 'styles: []');
      newCode = newCode.replace(/styleUrls:\s*\[[^\]]*\]/g, () => 'styles: []');

      return { code: newCode, map: null };
    }
  };
}

export default defineConfig({
  plugins: [inlineNgTemplates()],
  resolve: {
    alias: {
      '@core': path.resolve(__dirname, 'src/app/core'),
      '@shared': path.resolve(__dirname, 'src/app/shared'),
      '@features': path.resolve(__dirname, 'src/app/features'),
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['src/test-setup.ts'],
  },
});
