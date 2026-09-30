import { defineConfig } from 'i18next-cli';

// Custom rules for `instrument`. i18next-cli runs these *after* its own skip checks, which already drop
// className/src/href/etc. attribute values, console arguments, URLs, pure numbers, strings under 2 chars,
// ALL_CAPS_WITH_UNDERSCORES and any lowercase single token under 30 chars (e.g. "primary", "d-flex").
//
// Every string rule describes the shape of the *whole* string. A rule that matches a substring would also
// drop real sentences that happen to contain "GitHub", "free-text", "and/or" or "teacher(s)".
//
// To see what each rule does:  I18N_SCORER_DEBUG=1 npx i18next-cli instrument --dry-run
const IGNORE_STRINGS: Record<string, RegExp> = {
  token: /^[a-z0-9_-]+$/, // what's left of "{{userId}}", "{{width}}px" once placeholders are replaced
  identifier: /^-?[a-z]+(?:[A-Z][a-z0-9]*)+$/, // camelCase identifiers and sort keys: questionId, -startDate
  pascalIdentifier: /^[A-Z][a-z0-9]+(?:[A-Z][a-z0-9]*)+$/, // component/type names and lone brand names: ListViewItem, YouTube
  constant: /^[A-Z][A-Z0-9_-]{3,}$/, // enum-style values: ATTEMPTED, NO-FILTER (only outside JSX text, see below)
  snakeOrKebab: /^(?:[a-z0-9]+(?:[-_][a-z0-9]+)+|\w+_\w+)$/, // long single tokens: some-long-css-class-name, Some_Value
  fileName: /^[^\s]+\.[a-z0-9]{1,5}$/i, // image.svg, data.json
  urlOrPath: /^(?![A-Z]\/[A-Z]$)[^\s]*\/[^\s]*$/, // single tokens with a slash (but keep "N/A")
  queryParam: /[?&][\w-]+=/,
  attribute: /^[\w-]+=\S*$/, // data-width=x
  hashAnchor: /^[^\s]*#[\w-]+$/, // #section, /page#section
  latex: /\\[a-zA-Z]+/,
  numeric: /^[-\d\s.,%]+$/, // SVG viewBoxes, coordinates: "0 0 24 24"
  html: /<\/?[a-zA-Z][\w-]*(?:[\s>/]|$)/, // markup inside a string literal needs a manual <Trans>, not a t() call
  code: /^[\w.$]+\((?!s\))|=>/, // function calls and arrow functions, but not "teacher(s)"
  symbols: /^[\s\\/$+^&*()[\]{}~|:;.,✔️–-]+$/u,
};

// Tokens that appear in class strings but have no hyphen or digit
const BARE_CLASS_TOKENS = new Set([
  "active", "badge", "border", "btn", "card", "clearfix", "col", "container", "disabled", "fade", "icon", "lead",
  "row", "show", "small", "h1", "h2", "h3", "h4", "h5", "h6",
]);

// "icon icon-info mx-2", "section-divider mt-4 mb-3": lowercase, no punctuation, mostly hyphenated tokens
const isClassList = (text: string) => {
  const tokens = text.trim().split(/\s+/);
  if (tokens.length < 2 || !tokens.every(t => /^[a-z][a-z0-9_:/-]*$/.test(t))) return false;
  const classLike = tokens.filter(t => /[-_\d]/.test(t) || BARE_CLASS_TOKENS.has(t)).length;
  return classLike * 3 >= tokens.length * 2;
};

export const skipReason = (content: string, beforeContext: string, afterContext: string) => {
  // Template literals arrive as "Hello {{name}}"; judge the shape of the text around the placeholders
  const text = content.replace(/\{\{[^}]*\}\}/g, "x");
  if (isClassList(text)) return "classList";
  // Strings being compared are values, not text: status === "CORRECT", case "TEACHER":
  if (/(?:[!=]==?|\bcase)\s*$/.test(beforeContext) || /^\s*[!=]==?/.test(afterContext)) return "comparison";
  for (const [rule, regex] of Object.entries(IGNORE_STRINGS)) {
    // An upper-case word between JSX tags is displayed as-is, so keep it
    if (rule === "constant" && /[>}]\s*$/.test(beforeContext)) continue;
    if (regex.test(text)) return rule;
  }
  return null;
};

export default defineConfig({
  locales: [
    "en",
    "cy"
  ],
  lint: {
    checkConcatenation: 'error',
    checkPunctuationConcatenation: 'error',
  },
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/app/locales/{{language}}/{{namespace}}.json",
    ignoredTags: ["script", "style", "code", "pre", "svg"],
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "b", "em", "u", "sup", "sub"],
    ignoredAttributes: ["class","className","data-*","style","id","key","ref","src","href"],
    instrumentScorer: (content, { file, offset, code, beforeContext, afterContext }) => {
      const reason = skipReason(content, beforeContext, afterContext);
      if (process.env.I18N_SCORER_DEBUG) {
        const line = code.slice(0, offset).split("\n").length;
        console.log(`${reason ? `[skip:${reason}]` : "[keep]"}\t${file}:${line}\t${JSON.stringify(content)}`);
      }
      return reason ? null : undefined;
    },
    ignore: [
      "**/inequality/constants.ts",
      "**/inequality/utils.ts",
      "src/mocks/**",
      "src/test/**",
    ],
    defaultNS: "common",
    nsSeparator: ":",
    keySeparator: ".",
  }
})
