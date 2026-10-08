/**
 * Doc blocks for the Foundations pages. Token names come from @level/ui-tokens' token keys and values are
 * parsed from the token CSS files, so the pages update automatically when tokens are re-synced from Figma.
 * (Tailwind only emits theme variables that are used, so reading `var(--x)` at runtime would miss tokens.)
 */
import type { CSSProperties, ReactNode } from 'react';
import { tokens } from '@level/ui-tokens/json/token-keys';
import tokensCss from '@level/ui-tokens/css/tokens?raw';
import proCss from '@level/ui-tokens/css/tokens-pro?raw';

const parseVariables = (css: string) =>
  new Map(
    [...css.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/gi)].map((m) => [
      m[1],
      m[2].trim(),
    ]),
  );

const baseValues = parseVariables(tokensCss);
const proValues = parseVariables(proCss);

const parseUtilities = (css: string) =>
  new Map(
    [...css.matchAll(/@utility\s+([a-z0-9-]+)\s*\{([^}]*)\}/gi)].map((m) => [
      m[1],
      Object.fromEntries(
        [...m[2].matchAll(/([a-z-]+)\s*:\s*([^;]+);/gi)].map((d) => [
          d[1].replace(/-([a-z])/g, (_, c: string) => c.toUpperCase()),
          d[2].trim(),
        ]),
      ) as CSSProperties,
    ]),
  );

const typeStyles = parseUtilities(tokensCss);

const remToPx = (value: string) => {
  const rem = /^([\d.]+)rem$/.exec(value);
  return rem ? `${Math.round(parseFloat(rem[1]) * 16 * 100) / 100}px` : value;
};

const styles = {
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    fontSize: 14,
    margin: '16px 0 32px',
  },
  th: {
    textAlign: 'left',
    padding: '8px 12px 8px 0',
    borderBottom: '1px solid #DDDDDB',
    fontWeight: 600,
  },
  td: {
    padding: '10px 12px 10px 0',
    borderBottom: '1px solid #EEEEED',
    verticalAlign: 'middle',
  },
  code: {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace',
    fontSize: 12,
  },
  muted: { color: '#767671', fontSize: 12 },
} satisfies Record<string, CSSProperties>;

function Table({
  headers,
  children,
}: {
  headers: string[];
  children: ReactNode;
}) {
  return (
    <table style={styles.table}>
      <thead>
        <tr>
          {headers.map((h) => (
            <th key={h} style={styles.th}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>{children}</tbody>
    </table>
  );
}

const Code = ({ children }: { children: ReactNode }) => (
  <code style={styles.code}>{children}</code>
);

// --- Colors ---
const COLOR_FAMILY_ORDER = [
  'brand',
  'base',
  'accent',
  'surface',
  'foreground',
  'border',
  'danger',
  'warning',
  'success',
  'info',
  'state',
  'focus',
  'rating',
  'counter',
];

function Swatch({ value }: { value: string | undefined }) {
  if (!value) return <span style={styles.muted}>—</span>;
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
      <span
        style={{
          width: 32,
          height: 32,
          borderRadius: 6,
          background: value,
          border: '1px solid rgba(0,0,0,0.1)',
          flexShrink: 0,
        }}
      />
      <Code>{value}</Code>
    </span>
  );
}

/** One table per colour family. `family` limits it to one family; omit for all. */
export function ColorTokens({ family }: { family?: string }) {
  const families = COLOR_FAMILY_ORDER.filter((f) => !family || f === family);
  return (
    <>
      {families.map((f) => {
        const names = tokens.theme.color.filter(
          (name) => name.split('-')[0] === f,
        );
        if (!names.length) return null;
        const hasPro = names.some((name) => proValues.has(`--color-${name}`));
        return (
          <section key={f}>
            <h3 style={{ textTransform: 'capitalize' }}>{f}</h3>
            <Table
              headers={[
                'Token',
                hasPro ? 'Homeowner' : 'Value',
                ...(hasPro ? ['Pro'] : []),
              ]}
            >
              {names.map((name) => (
                <tr key={name}>
                  <td style={styles.td}>
                    <Code>--color-{name}</Code>
                    <div style={styles.muted}>
                      bg-{name} · text-{name} · border-{name}
                    </div>
                  </td>
                  <td style={styles.td}>
                    <Swatch value={baseValues.get(`--color-${name}`)} />
                  </td>
                  {hasPro && (
                    <td style={styles.td}>
                      <Swatch
                        value={
                          proValues.get(`--color-${name}`) ??
                          baseValues.get(`--color-${name}`)
                        }
                      />
                    </td>
                  )}
                </tr>
              ))}
            </Table>
          </section>
        );
      })}
    </>
  );
}

// --- Spacing ---
const remValue = (value = '') => (value === '0' ? 0 : parseFloat(value));

export function SpacingTokens() {
  const names = [...tokens.theme.spacing].sort(
    (a, b) =>
      remValue(baseValues.get(`--spacing-${a}`)) -
      remValue(baseValues.get(`--spacing-${b}`)),
  );
  return (
    <Table headers={['Token', 'Value', 'Example classes', 'Size']}>
      {names.map((name) => {
        const value = baseValues.get(`--spacing-${name}`) ?? '';
        return (
          <tr key={name}>
            <td style={styles.td}>
              <Code>--spacing-{name}</Code>
            </td>
            <td style={styles.td}>
              <Code>{value}</Code>{' '}
              <span style={styles.muted}>{remToPx(value)}</span>
            </td>
            <td style={{ ...styles.td, ...styles.muted }}>
              p-{name} · gap-{name} · size-{name}
            </td>
            <td style={styles.td}>
              <span
                style={{
                  display: 'block',
                  height: 16,
                  width: value,
                  background: '#7A37B7',
                  borderRadius: 2,
                }}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

// --- Corner radius ---
export function RadiusTokens() {
  return (
    <Table headers={['Token', 'Value', 'Class', 'Preview']}>
      {tokens.theme.radius.map((name) => {
        const value = baseValues.get(`--radius-${name}`) ?? '';
        return (
          <tr key={name}>
            <td style={styles.td}>
              <Code>--radius-{name}</Code>
            </td>
            <td style={styles.td}>
              <Code>{value}</Code>{' '}
              <span style={styles.muted}>
                {name === 'full' ? 'fully round' : remToPx(value)}
              </span>
            </td>
            <td style={styles.td}>
              <Code>rounded-{name}</Code>
            </td>
            <td style={styles.td}>
              <span
                style={{
                  display: 'block',
                  width: 56,
                  height: 56,
                  borderRadius: value,
                  background: '#F5E7FF',
                  border: '2px solid #7A37B7',
                }}
              />
            </td>
          </tr>
        );
      })}
    </Table>
  );
}

// --- Typography ---
export function TypographyTokens() {
  return (
    <Table headers={['Class', 'Sample', 'Size / weight / line height']}>
      {tokens.utilities.map((name) => {
        const style = typeStyles.get(name) ?? {};
        return (
          <tr key={name}>
            <td style={styles.td}>
              <Code>{name}</Code>
            </td>
            <td style={styles.td}>
              <span
                style={{
                  ...style,
                  fontFamily: `${String(style.fontFamily ?? 'DM Sans')}, sans-serif`,
                }}
              >
                The quick brown fox
              </span>
            </td>
            <td style={{ ...styles.td, ...styles.muted }}>
              {remToPx(String(style.fontSize ?? ''))} /{' '}
              {String(style.fontWeight ?? '')} /{' '}
              {String(style.lineHeight ?? '')}
            </td>
          </tr>
        );
      })}
    </Table>
  );
}
