const { defineConfig } = require('eslint/config');
const expo = require('eslint-config-expo/flat');
module.exports = defineConfig([
  expo,
  { ignores: ['dist/**', '.expo/**', 'src/screens/**', 'src/navigation/**', 'src/context/**', 'src/api/**', 'src/components/**', 'src/theme/**', 'src/hooks/**', 'src/utils/**', 'App.js', 'index.js'] },
  { files: ['src/shell/*.test.mjs'], languageOptions: { globals: { process: 'readonly' } } },
]);
