import { defineConfig } from 'i18next-cli';

const IGNORE_STRINGS = [
  "[mpg][tbse]?-\d" // bootstrap margin/padding
]

export default defineConfig({
  locales: [
    "en",
    "cy"
  ],
  extract: {
    input: "src/**/*.{js,jsx,ts,tsx}",
    output: "src/app/locales/{{language}}/{{namespace}}.json",
    instrumentScorer: (content, { file, code }) => {
      for (const ignore of IGNORE_STRINGS) {
        if (new RegExp(ignore).test(code)) {
          // ignore string
          return null;
        }
      }

      // use default behaviour
      return undefined;
    }
  }
})
