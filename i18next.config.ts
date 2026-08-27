import { defineConfig } from 'i18next-cli';

const IGNORE_STRINGS = [
  /"[mpg][tbse]?-\d/gm, // bootstrap margin/padding
  /wf?-\d|bg-[a-z]+/gm, // misc bootstrap
  /icon-/gm, // icon classes
  /isaac[^\s]*Question/gm,
  /[a-z][A-Z]/gm, // lower case followed by upper case (camelCase indicator)
  /[a-zA-Z0-9_-]+[_-][a-zA-Z0-9_-]+/gm, // snake_case and kebab-case strings
  /\.[a-zA-Z0-9_-]+/gm, // file extensions
  /[^\s]*\/[^\s]*/gm, // url-like strings
  /\?[a-zA-Z0-9_-]+=/gm, // query params
  /#/gm, // hash anchors
  /\\[a-zA-Z0-9_]+/gm, // latex strings
  /\d+ \d+ \d+/gm, // coordinates, css, etc
  /<[a-zA-Z]+/gm, // html tags
  /[a-zA-Z]+\(/gm, // function calls
  /^[\\\/\$\+\^&\*\(\)\[\]\{\}~\|:;\.,✔️ –-]+$/g // symbol junk – do not include m in regex params
]

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
    transKeepBasicHtmlNodesFor: ["br", "strong", "i", "b", "em", "u", "sup", "sub", "code", "pre"],
    ignoredAttributes: ["class","className","data-*","style","id","key","ref","src","href"],
    instrumentScorer: (content, { file, code, beforeContext, afterContext }) => {
      for (const ignore of IGNORE_STRINGS) {
        if (content.match(ignore)) {
          // ignore string
          return null;
        }
      }

      // uncomment to use with e.g. npx i18next-cli instrument --namespace common --dry-run
      // console.log(content);

      // use default behaviour
      return undefined;
    },
    ignore: [
      "**/inequality/constants.ts",
      "**/inequality/utils.ts",
    ],
    defaultNS: "common",
  }
})
