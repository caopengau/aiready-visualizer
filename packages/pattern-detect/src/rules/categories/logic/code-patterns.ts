/**
 * Code pattern detection utilities - consolidates similar pattern checks
 * Uses pattern registry to reduce duplication
 */

// Common enum value patterns - register once, reuse everywhere
const COMMON_ENUM_PATTERNS = [
  ['LOW', ["'low'", '0', "'LOW'"]],
  ['HIGH', ["'high'", '2', "'HIGH'"]],
  ['MEDIUM', ["'medium'", '1', "'MEDIUM'"]],
] as const;

const hasEnumValue = (
  code: string,
  enumName: string,
  variants: string[]
): boolean => variants.some((v) => code.includes(`${enumName} = ${v}`));

export const CodePatterns = {
  // Enum patterns
  hasCommonEnumValues: (code: string): boolean =>
    COMMON_ENUM_PATTERNS.every(([name, variants]) =>
      hasEnumValue(code, name, variants as string[])
    ),

  isEnumDefinition: (code: string): boolean =>
    /(?:export\s+)?(?:const\s+)?enum\s+/.test(code) ||
    (code.includes('enum ') && code.includes('{') && code.includes('}')),

  // Type patterns - helpers for checking type-only definitions
  hasTypeDefinition: (code: string): boolean =>
    code.includes('interface ') ||
    code.includes('type ') ||
    code.includes('enum '),

  isTypeOnlyFile: (code: string): boolean => {
    const hasTypes = CodePatterns.hasTypeDefinition(code);
    const hasNoImpl = ![
      'function ',
      'class ',
      'const ',
      'let ',
      'export default',
    ].some((kw) => code.includes(kw));
    return hasTypes && hasNoImpl;
  },

  // Utility patterns - function group patterns
  hasFunctionGroup: (code: string, prefix: string): boolean => {
    const regex = new RegExp(
      `${prefix}(format|parse|sanitize|normalize|convert)`,
      'i'
    );
    return regex.test(code);
  },

  // Pattern checkers using keyword lists
  hasKeywordGroup: (code: string, keywords: string[]): boolean =>
    keywords.some((kw) => code.includes(kw)),

  // Validation patterns - unified keyword check
  hasValidationPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, [
      'isValid',
      'validate',
      'checkValid',
      'isEmail',
      'isPhone',
      'isUrl',
      'isNumeric',
      'isAlpha',
      'isAlphanumeric',
      'isEmpty',
      'isNotEmpty',
      'isRequired',
      'isOptional',
    ]),

  // Hook patterns - React/Vue hooks
  hasHookPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, [
      'function use',
      'export function use',
      'const use',
      'export const use',
    ]),

  // Score/Rating patterns
  hasScorePattern: (code: string): boolean =>
    (code.includes('if (score >=') || code.includes('if (score >')) &&
    code.includes('return') &&
    code.includes("'") &&
    code.split('if (score').length >= 3,

  // Visualization patterns - D3/Canvas
  hasVizPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, [
      'dragstarted',
      'dragged',
      'dragended',
    ]) &&
    CodePatterns.hasKeywordGroup(code, ['simulation', 'd3.', 'alphaTarget']),

  // Switch/Icon patterns
  hasSwitchPattern: (code: string): boolean =>
    code.includes('switch (') &&
    code.includes("case '") &&
    code.includes('return') &&
    code.split('case ').length >= 4,

  hasIconPattern: (code: string): boolean =>
    CodePatterns.hasKeywordGroup(code, [
      'getIcon',
      'getColor',
      'getLabel',
      'getRating',
    ]),

  // Singleton patterns
  hasSingletonGetter: (code: string): boolean =>
    /(?:export\s+)?(?:async\s+)?function\s+get[A-Z][a-zA-Z0-9]*\s*\(/.test(
      code
    ) ||
    /(?:export\s+)?const\s+get[A-Z][a-zA-Z0-9]*\s*=\s*(?:async\s+)?\(\)\s*=>/.test(
      code
    ),

  hasSingletonPattern: (code: string): boolean =>
    (code.includes('if (!') &&
      code.includes('instance') &&
      code.includes(' = ')) ||
    (code.includes('if (!_') && code.includes(' = new ')),

  // Re-export patterns
  hasReExportPattern: (code: string): boolean => {
    const lines = code.split('\n').filter((l) => l.trim());
    if (lines.length === 0) return false;
    const reExportLines = lines.filter(
      (l) =>
        /^export\s+(\{[^}]+\}|\*)\s+from\s+/.test(l.trim()) ||
        /^export\s+\*\s+as\s+\w+\s+from\s+/.test(l.trim())
    ).length;
    return reExportLines > 0 && reExportLines / lines.length > 0.5;
  },
};
