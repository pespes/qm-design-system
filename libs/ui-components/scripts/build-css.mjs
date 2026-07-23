/**
 * Combines tw-animage-css @import statement with ui-component utility rules
 * from src/styles.css into a single output file for publishing. It is expected
 * that any consuming apps wil have ui-tokens and tailwindcss as dependencies already.
 */
import { mkdirSync, readFileSync, writeFileSync } from 'fs';

const styles = readFileSync('src/styles.css', 'utf8');

mkdirSync('dist', { recursive: true });
writeFileSync('dist/styles.css', '@import "tw-animate-css";' + '\n\n' + styles);
