import katex from "katex";
import { katexify } from "../../app/components/elements/markup/latexRendering";

jest.spyOn(katex, "renderToString");

const html = ["<div>foo</div><p><b>bar</b>", "</span></p>"];
const math = ["e = mc^2"];
const nestedDollars = ["GDP = 100,000,000\\\\textrm{$}", "GDP = 100\\$"];
const LATEX = "LATEX";

function wrapIn(open: string, what: string, close: string): string {
  return open + what + close;
}

const delimiters: [string, boolean, string][] = [
  ["$", false, "$"],
  ["\\(", false, "\\)"],
  ["$$", true, "$$"],
  ["\\[", true, "\\]"],
  ["\\begin{equation}", true, "\\end{equation}"],
];

describe("TrustedHtml LaTeX locator", () => {
  beforeEach(() => {
    // @ts-ignore
    katex.renderToString.mockImplementation(() => LATEX);
  });

  afterAll(() => {
    jest.clearAllMocks();
  });

  it("can find basic delimiters", () => {
    delimiters.forEach(([open, displayMode, close]) => {
      const testcase = html[0] + wrapIn(open, math[0], close) + html[1];
      const result = katexify(testcase, null, undefined, false, {});

      expect(result).toEqual(html[0] + LATEX + html[1]);
      // @ts-ignore
      const callArgs = katex.renderToString.mock.calls.pop();
      expect(callArgs[0]).toBe(math[0]);
      expect(callArgs[1]).toMatchObject({ displayMode: displayMode });
      // @ts-ignore katex.__parse is mocked, so katex-a11y can't generate screenreader text - this means
      // katex.renderToString is called again to generate MathML, so we need to pop a second call off of the
      // call stack
      katex.renderToString.mock.calls.pop();
    });
  });

  it("unbalanced delimiters don't break everything but instead are just skipped", () => {
    delimiters.forEach(([open, ,]) => {
      const testcase = html[0] + wrapIn(open, math[0], "") + html[1];
      const result = katexify(testcase, null, undefined, false, {});

      expect(result).toEqual(html[0] + open + math[0] + html[1]);
      expect(katex.renderToString).not.toHaveBeenCalled();
    });
  });

  it("nested $ are fine", () => {
    nestedDollars.forEach((dollarMath) => {
      delimiters.forEach(([open, displayMode, close]) => {
        const testcase = html[0] + wrapIn(open, dollarMath, close) + html[1];
        const result = katexify(testcase, null, undefined, false, {});

        expect(result).toEqual(html[0] + LATEX + html[1]);
        // @ts-ignore
        const callArgs = katex.renderToString.mock.calls.pop();
        expect(callArgs[0]).toBe(dollarMath);
        expect(callArgs[1]).toMatchObject({ displayMode: displayMode });
        // @ts-ignore katex.__parse is mocked, so katex-a11y can't generate screenreader text - this means
        // katex.renderToString is called again to generate MathML, so we need to pop a second call off of the
        // call stack
        katex.renderToString.mock.calls.pop();
      });
    });
  });

  it("can render environments", () => {
    const env = "\\begin{aligned}" + math[0] + "\\end{aligned}";
    const testcase = html[0] + env + html[1];
    const result = katexify(testcase, null, undefined, false, {});

    expect(result).toEqual(html[0] + LATEX + html[1]);
    // @ts-ignore
    const callArgs = katex.renderToString.mock.calls.pop();
    expect(callArgs[0]).toBe(env);
    expect(callArgs[1]).toMatchObject({ displayMode: true });
    // @ts-ignore katex.__parse is mocked, so katex-a11y can't generate screenreader text - this means
    // katex.renderToString is called again to generate MathML, so we need to pop a second call off of the
    // call stack
    katex.renderToString.mock.calls.pop();
  });

  it("missing refs show an inline error", () => {
    const ref = '\\ref{foo[234o89tdgfiuno34£"$%^Y}';
    const testcase = html[0] + ref + html[1];
    const result = katexify(testcase, null, undefined, false, {});

    expect(result).toEqual(html[0] + "unknown reference " + ref + html[1]);
    expect(katex.renderToString).not.toHaveBeenCalled();
  });

  it("found refs show their figure number", () => {
    const ref = "\\ref{foo}";
    const testcase = html[0] + ref + html[1];
    const result = katexify(testcase, null, undefined, false, { foo: 42 });

    const expectedFigureRef = "Figure" + "&nbsp;" + "42";
    const expectedFigureRefWithFormatting = `<strong class="text-secondary figure-reference">${expectedFigureRef}</strong>`;
    expect(result).toEqual(html[0] + expectedFigureRefWithFormatting + html[1]);
    expect(katex.renderToString).not.toHaveBeenCalled();
  });

  it("ignores escaped dollars", () => {
    const escapedDollar = "\\$";
    const unescapedDollar = "$";
    const testcase = html[0] + escapedDollar + html[1];
    const result = katexify(testcase, null, undefined, false, {});

    expect(result).toEqual(html[0] + unescapedDollar + html[1]);
    expect(katex.renderToString).not.toHaveBeenCalled();
  });
});
