/**
 * Combines Tailwind @import statements with ui-component utility rules
 * from src/styles.css into a single output file for publishing.
 *
 * Tokens are referenced via @reference instead of @import so tokens are available
 * for resolving @utility rules at build time, but are not re-emmitted in the output.
 * Consuming apps need to import @Quartermaster-Inc/ui-tokens themselves anyway, since the
 * components rely on token-based CSS variables (ie. --color-brand-background) that
 * only resolve if the tokens are loaded in the apps CSS.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';

const header = [
  '@import "tailwindcss";',
  '@import "tw-animate-css";',
  '@reference "@Quartermaster-Inc/ui-tokens/css/tokens";',
  '@reference "@Quartermaster-Inc/ui-tokens/css/tokens-pro";',
].join('\n');

const styles = readFileSync('src/styles.css', 'utf8');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/styles.entry.css', header + '\n\n' + styles);
