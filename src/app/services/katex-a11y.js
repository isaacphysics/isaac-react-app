// Based on https://github.com/KaTeX/KaTeX/blob/v0.11.1/contrib/render-a11y-string/render-a11y-string.js
/**
 * renderA11yString returns a readable string.
 *
 * In some cases the string will have the proper semantic math
 * meaning,:
 *   renderA11yString("\\frac{a}{b}"")
 *   -> "start fraction, a, divided by, b, end fraction"
 *
 * However, other cases do not:
 *   renderA11yString("f(x) = x^2")
 *   -> "f, left parenthesis, x, right parenthesis, equals, x, squared"
 *
 * The commas in the string aim to increase ease of understanding
 * when read by a screenreader.
 */

/* eslint-disable @typescript-eslint/no-use-before-define */
import katex from "katex";

const stringMap = {
    "(": "left bracket",
    ")": "right bracket",
    "[": "open square bracket",
    "]": "close square bracket",
    "\\{": "left curly bracket",
    "\\}": "right curly bracket",
    "\\lbrace": "left curly bracket",
    "\\rbrace": "right curly bracket",
    "\\lvert": "open vertical bar",
    "\\rvert": "close vertical bar",
    "|": "vertical bar",
    "\\vert": "vertical bar",
    "\\uparrow": "up arrow",
    "\\Uparrow": "up arrow",
    "\\downarrow": "down arrow",
    "\\Downarrow": "down arrow",
    "\\updownarrow": "up down arrow",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    "\\langle": "open angle bracket",
    "\\rangle": "close angle bracket",
    "\\lfloor": "open floor",
    "\\rfloor": "close floor",
    "\\int": "integral",
    "\\intop": "integral",
    "\\lim": "limit",
    "\\ln": "natural log",
    "\\log": "log",
    "\\sin": "sine",
    "\\cos": "cosine",
    "\\tan": "tangent",
    "\\cot": "cotangent",
    "\\sum": "sum",
    "/": "slash",
    ",": "comma",
    ".": "point",
    "-": "negative",
    "+": "plus",
    "~": "tilde",
    ":": "colon",
    "?": "question mark",
    "'": "apostrophe",
    "\\#": "hash symbol",
    "\\%": "percent",
    " ": "space",
    "\\ ": "space",
    "\\$": "dollar sign",
    "\\angle": "angle",
    "\\degree": "degree",
    "\\circ": "circle",
    "\\vec": "vector",
    "\\triangle": "triangle",
    "\\pi": "pi",
    "\\prime": "prime",
    "\\infty": "infinity",
    "\\alpha": "alpha",
    "\\beta": "beta",
    "\\gamma": "gamma",
    "\\omega": "omega",
    "\\theta": "theta",
    "\\sigma": "sigma",
    "\\lambda": "lambda",
    "\\tau": "tau",
    "\\Delta": "delta",
    "\\delta": "delta",
    "\\mu": "mu",
    "\\rho": "rho",
    "\\nabla": "del",
    "\\ell": "ell",
    "\\ldots": "dots",
    "\\@cdots": "dots",
    "\\lnot": "not",
    "\\emptyset": "empty set",
    // TODO: add entries for all accents
    "\\hat": "hat",
    "\\acute": "acute",
};

const powerMap = {
    "prime": "prime",
    "degree": "degrees",
    "circle": "degrees",
    "2": "squared",
    "3": "cubed",
};

const openMap = {
    "|": "open vertical bar",
    ".": "",
};

const closeMap = {
    "|": "close vertical bar",
    ".": "",
};

const binMap = {
    "+": "plus",
    "-": "minus",
    "\\pm": "plus or minus",
    "\\cdot": "dot",
    "*": "times",
    "/": "divided by",
    "\\times": "times",
    "\\div": "divided by",
    "\\circ": "circle",
    "\\bullet": "bullet",
    "\\land": "and",
    "\\lor": "or",
    "\\veebar": "xor",
    "\\cup": "union",
    "\\cap": "intersection",
    "\\setminus": "difference",
};

const relMap = {
    "=": "equals",
    "\\approx": "approximately equals",
    "\\neq": "is not equal to",
    "\\geq": "is greater than or equal to",
    "\\ge": "is greater than or equal to",
    "\\leq": "is less than or equal to",
    "\\le": "is less than or equal to",
    ">": "is greater than",
    "<": "is less than",
    "\\leftarrow": "left arrow",
    "\\Leftarrow": "left arrow",
    "\\rightarrow": "right arrow",
    "\\Rightarrow": "right arrow",
    ":": "colon",
    "\\in": "in",
    "\\notin": "not in",
    "\\subset": "proper subset of",
    "\\subseteq": "subset of",
    "\\supset": "proper superset of",
    "\\supseteq": "superset of",
};

const accentUnderMap = {
    "\\underleftarrow": "left arrow",
    "\\underrightarrow": "right arrow",
    "\\underleftrightarrow": "left-right arrow",
    "\\undergroup": "group",
    "\\underlinesegment": "line segment",
    "\\utilde": "tilde",
};

const denominatorMap = {
    "2": "half",
    "3": "third",
    "4": "quarter",
    "5": "fifth",
    "6": "sixth",
    "7": "seventh",
    "8": "eigth",
    "9": "ninth",
    "10": "tenth",
    "100": "hundredth"
};

const arrowMap = {
    "\\xleftarrow": "arrow left",
    "\\xrightarrow": "arrow right",
    "\\xLeftarrow": "arrow left",
    "\\xRightarrow": "arrow right",
    "\\xleftrightarrow": "arrow left and right",
    "\\xLeftrightarrow": "arrow left and right",
    "\\xmapsto": "maps to",
    "\\xrightleftarrows": "arrow left and right",
}


const buildString = (str, type, a11yStrings) => {
    if (!str) {
        return;
    }

    let ret;

    if (type === "open") {
        ret = str in openMap ? openMap[str] : stringMap[str] || str;
    } else if (type === "close") {
        ret = str in closeMap ? closeMap[str] : stringMap[str] || str;
    } else if (type === "bin") {
        ret = binMap[str] || str;
    } else if (type === "rel") {
        ret = relMap[str] || str;
    } else if (type === "arrow") {
        ret = arrowMap[str] || "arrow";
    } else {
        ret = stringMap[str] || str;
    }

    // If the text to add is a number and the last string is a number, then
    // combine them into a single number. Do similar if this text is inside a
    // 'start text' region.
    let numRegex = /^\d+$/;
    let startTextRegex = /^start ((bold|italic) )?text$/;
    if (
        (a11yStrings.length > 0 && numRegex.test(ret) && numRegex.test(a11yStrings[a11yStrings.length - 1])) ||
        (a11yStrings.length > 1 && type === "normal" && startTextRegex.test(a11yStrings[a11yStrings.length - 2]))
    ) {
        a11yStrings[a11yStrings.length - 1] += ret;
    } else if (ret) {
        a11yStrings.push(ret);
    }
};

const buildRegion = (a11yStrings, callback) => {
    const regionStrings = [];
    a11yStrings.push(regionStrings);
    callback(regionStrings);
};

const handleObject = (tree, a11yStrings, atomType) => {
    // Everything else is assumed to be an object...
    switch (tree.type) {
        case "accent": {
            buildRegion(a11yStrings, (a11yStrings) => {
                buildA11yStrings(tree.base, a11yStrings, atomType);
                a11yStrings.push("with");
                buildString(tree.label, "normal", a11yStrings);
                a11yStrings.push("on top");
            });
            break;
        }

        case "accentUnder": {
            buildRegion(a11yStrings, (a11yStrings) => {
                buildA11yStrings(tree.base, a11yStrings, atomType);
                a11yStrings.push("with");
                buildString(accentUnderMap[tree.label], "normal", a11yStrings);
                a11yStrings.push("underneath");
            });
            break;
        }

        case "accent-token": {
            // Used internally by accent symbols.
            break;
        }

        case "atom": {
            const {text} = tree;
            switch (tree.family) {
                case "bin": {
                    buildString(text, "bin", a11yStrings);
                    break;
                }
                case "close": {
                    buildString(text, "close", a11yStrings);
                    break;
                }
                // TODO(kevinb): figure out what should be done for inner
                case "inner": {
                    buildString(tree.text, "inner", a11yStrings);
                    break;
                }
                case "open": {
                    buildString(text, "open", a11yStrings);
                    break;
                }
                case "punct": {
                    buildString(text, "punct", a11yStrings);
                    break;
                }
                case "rel": {
                    buildString(text, "rel", a11yStrings);
                    break;
                }
                default: {
                    throw new Error(`"${tree.family}" is not a valid atom type`);
                }
            }
            break;
        }

        case "color": {
            const color = tree.color.replace(/katex-/, "");

            buildRegion(a11yStrings, (regionStrings) => {
                regionStrings.push("start color " + color);
                buildA11yStrings(tree.body, regionStrings, atomType);
                regionStrings.push("end color " + color);
            });
            break;
        }

        case "color-token": {
            // Used by \color, \colorbox, and \fcolorbox but not directly rendered.
            // It's a leaf node and has no children so just break.
            break;
        }

        case "delimsizing": {
            if (tree.delim && tree.delim !== ".") {
                buildString(tree.delim, "normal", a11yStrings);
            }
            break;
        }

        case "genfrac": {
            buildRegion(a11yStrings, (regionStrings) => {
                // genfrac can have unbalanced delimiters
                const {leftDelim, rightDelim} = tree;

                // NOTE: Not sure if this is a safe assumption
                // hasBarLine true -> fraction, false -> binomial
                if (tree.hasBarLine) {
                    const numeratorString = flatten(buildA11yStrings(tree.numer, [], atomType)).join(",");
                    const denominatorString = flatten(buildA11yStrings(tree.denom, [], atomType)).join(",");
                    if ("1" === numeratorString && denominatorString in denominatorMap) {
                        regionStrings.push(`one ${denominatorMap[denominatorString]}`);
                    } else {
                        regionStrings.push("start fraction");
                        leftDelim && buildString(leftDelim, "open", regionStrings);
                        buildA11yStrings(tree.numer, regionStrings, atomType);
                        regionStrings.push("divided by");
                        buildA11yStrings(tree.denom, regionStrings, atomType);
                        rightDelim && buildString(rightDelim, "close", regionStrings);
                        regionStrings.push("end fraction");
                    }
                } else {
                    regionStrings.push("start binomial");
                    leftDelim && buildString(leftDelim, "open", regionStrings);
                    buildA11yStrings(tree.numer, regionStrings, atomType);
                    regionStrings.push("over");
                    buildA11yStrings(tree.denom, regionStrings, atomType);
                    rightDelim && buildString(rightDelim, "close", regionStrings);
                    regionStrings.push("end binomial");
                }
            });
            break;
        }

        case "kern": {
            // No op: we don't attempt to present kerning information
            // to the screen reader.
            break;
        }

        case "leftright": {
            buildRegion(a11yStrings, (regionStrings) => {
                buildString(tree.left, "open", regionStrings);
                buildA11yStrings(tree.body, regionStrings, atomType);
                buildString(tree.right, "close", regionStrings);
            });
            break;
        }

        case "leftright-right": {
            // TODO: double check that this is a no-op
            break;
        }

        case "lap": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "mathord": {
            buildString(tree.text, "normal", a11yStrings);
            break;
        }

        case "op": {
            const {body, name} = tree;
            if (body) {
                buildA11yStrings(body, a11yStrings, atomType);
            } else if (name) {
                buildString(name, "normal", a11yStrings);
            }
            break;
        }

        case "op-token": {
            // Used internally by operator symbols.
            buildString(tree.text, atomType, a11yStrings);
            break;
        }

        case "ordgroup": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "overline": {
            buildRegion(a11yStrings, function(a11yStrings) {
                a11yStrings.push("start overline");
                buildA11yStrings(tree.body, a11yStrings, atomType);
                a11yStrings.push("end overline");
            });
            break;
        }

        case "phantom": {
            a11yStrings.push("empty space");
            break;
        }

        case "raisebox": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "rule": {
            a11yStrings.push("rectangle");
            break;
        }

        case "sizing": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "spacing": {
            a11yStrings.push("space");
            break;
        }

        case "styling": {
            // We ignore the styling and just pass through the contents
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "sqrt": {
            buildRegion(a11yStrings, (regionStrings) => {
                const {body, index} = tree;
                if (index) {
                    const indexString = flatten(
                        buildA11yStrings(index, [], atomType)).join(",");
                    if (indexString === "3") {
                        regionStrings.push("cube root of");
                        buildA11yStrings(body, regionStrings, atomType);
                        regionStrings.push("end cube root");
                        return;
                    }

                    regionStrings.push("root");
                    regionStrings.push("start index");
                    buildA11yStrings(index, regionStrings, atomType);
                    regionStrings.push("end index");
                    return;
                }

                regionStrings.push("square root of");
                buildA11yStrings(body, regionStrings, atomType);
                regionStrings.push("end square root");
            });
            break;
        }

        case "supsub": {
            const {base, sub, sup} = tree;
            let opType = (base && base.type === "op") ? base.name : null;
            let isSimpleSubscriptVariable = false;

            // case e.g. "q_{1}q_{2}" to be read as "q one q two":
            if (base && base.type === "mathord" && sub) {
                const baseString = flatten(buildA11yStrings(base, [], atomType)).join(",");
                const subscriptString = flatten(buildA11yStrings(sub, [], atomType)).join(",");
                if (/^[a-zA-Z]$/.test(baseString) && /^([0-9]+|\\textrm{(min|max)})$/.test(subscriptString)) {
                    buildRegion(a11yStrings, function(regionStrings) {
                        regionStrings.push(`${baseString} ${subscriptString}`);
                    });
                    isSimpleSubscriptVariable = true;
                }
            }
            // otherwise ordinary base, subscript and superscript:

            if (base && !isSimpleSubscriptVariable) {
                buildA11yStrings(base, a11yStrings, atomType);
            }

            if (sub && !isSimpleSubscriptVariable) {
                switch (opType) {
                    case "\\log":
                        buildRegion(a11yStrings, function(regionStrings) {
                            regionStrings.push(`base`);
                            buildA11yStrings(sub, regionStrings, atomType);
                        });
                        break;
                    case "\\int":
                    case "\\sum":
                        buildRegion(a11yStrings, function(regionStrings) {
                            regionStrings.push(`from`);
                            buildA11yStrings(sub, regionStrings, atomType);
                        });
                        break;
                    default:
                        buildRegion(a11yStrings, function(regionStrings) {
                            regionStrings.push(`start subscript`);
                            buildA11yStrings(sub, regionStrings, atomType);
                            regionStrings.push(`end subscript`);
                        });
                }
            }

            if (sup) {
                buildRegion(a11yStrings, function(regionStrings) {
                    const supString = flatten(buildA11yStrings(sup, [], atomType)).join(" ");

                    switch (opType) {
                        case "\\int":
                        case "\\sum":
                            buildRegion(a11yStrings, function(regionStrings) {
                                regionStrings.push(`to`);
                                buildA11yStrings(sup, regionStrings, atomType);
                                regionStrings.push(`of`);
                            });
                            break;
                        default:
                            if (supString in powerMap) {
                                regionStrings.push(powerMap[supString]);
                                return;
                            }
                            if (/^((minus )?[0-9]+|[A-Za-z])$/.test(supString)) {
                                regionStrings.push(`to the power ${supString} `);
                                return;
                            }
                            buildRegion(a11yStrings, function(regionStrings) {
                                regionStrings.push(`start superscript`);
                                buildA11yStrings(sup, regionStrings, atomType);
                                regionStrings.push(`end superscript`);
                            });
                    }
                });
            } else if (sub && (opType === "\\int" || opType === "\\sum")) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push(`of`);
                });
            }
            break;
        }

        case "text": {
            // TODO: handle other fonts
            let modifier;
            switch (tree.font) {
                case "\\textbf":
                    modifier = "bold"; break;
                case "\\textit":
                    modifier = "italic"; break;
                default:
                    modifier = "";
            }
            buildRegion(a11yStrings, function(regionStrings) {
                const dropZoneRegex = /\[drop-zone(?<params>\|(?<width>w-\d+?)?(?<height>h-\d+?)?)?]/g;
                if (tree.body.map(a => a.hasOwnProperty("text") ? a.text : "").join("").search(dropZoneRegex) !== -1) {
                    regionStrings.push("clickable drop zone");
                } else {
                    regionStrings.push(`start ${modifier} text`.replace(/\s+/, " "));
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push(`end ${modifier} text`.replace(/\s+/, " "));
                }
            });
            break;
        }

        case "textord": {
            buildString(tree.text, atomType, a11yStrings);
            break;
        }

        case "smash": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "enclose": {
            // TODO: create a map for these.
            // TODO: differentiate between a body with a single atom, e.g.
            // "cancel a" instead of "start cancel, a, end cancel"
            if (/cancel/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start cancel");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end cancel");
                });
                break;
            } else if (/box/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start box");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end box");
                });
                break;
            } else if (/sout/.test(tree.label)) {
                buildRegion(a11yStrings, function(regionStrings) {
                    regionStrings.push("start strikeout");
                    buildA11yStrings(tree.body, regionStrings, atomType);
                    regionStrings.push("end strikeout");
                });
                break;
            }
            throw new Error(
                `KaTeX-a11y: enclose node with ${tree.label} not supported yet`);
        }

        case "vphantom": {
            // We should simply be able to ignore \vphantom.
            // Breaking here also prevents the translation from going into the actual element
            // which turns out to be \vphantom{X} and so "A Wild X Appears!"
            break;
        }

        case "hphantom": {
            // Same as above, I suppose.
            break;
        }

        case "operatorname": {
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "array": {
            throw new Error("KaTeX-a11y: array not implemented yet");
        }

        case "raw": {
            throw new Error("KaTeX-a11y: raw not implemented yet");
        }

        case "size": {
            // Although there are nodes of type "size" in the parse tree, they have
            // no semantic meaning and should be ignored.
            break;
        }

        case "url": {
            throw new Error("KaTeX-a11y: url not implemented yet");
        }

        case "tag": {
            throw new Error("KaTeX-a11y: tag not implemented yet");
        }

        case "verb": {
            buildString(`start verbatim`, "normal", a11yStrings);
            buildString(tree.body, "normal", a11yStrings);
            buildString(`end verbatim`, "normal", a11yStrings);
            break;
        }

        case "environment": {
            throw new Error("KaTeX-a11y: environment not implemented yet");
        }

        case "horizBrace": {
            buildString(`start ${tree.label.slice(1)}`, "normal", a11yStrings);
            buildA11yStrings(tree.base, a11yStrings, atomType);
            buildString(`end ${tree.label.slice(1)}`, "normal", a11yStrings);
            break;
        }

        case "infix": {
            // All infix nodes are replace with other nodes.
            break;
        }

        case "includegraphics": {
            throw new Error("KaTeX-a11y: includegraphics not implemented yet");
        }

        case "font": {
            // TODO: callout the start/end of specific fonts
            // TODO: map \BBb{N} to "the naturals" or something like that
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "href": {
            throw new Error("KaTeX-a11y: href not implemented yet");
        }

        case "cr": {
            // This is used by environments and newlines.
            buildRegion(a11yStrings, function(a11yStrings) {
                if (tree.newLine || tree.newRow) {
                    a11yStrings.push(". ");
                }
            });
            break;
        }

        case "underline": {
            buildRegion(a11yStrings, function(a11yStrings) {
                a11yStrings.push("start underline");
                buildA11yStrings(tree.body, a11yStrings, atomType);
                a11yStrings.push("end underline");
            });
            break;
        }

        case "xArrow": {
            buildString(tree.label, "arrow", a11yStrings);
            break;
        }

        case "mclass": {
            // \neq and \ne are macros so we let "htmlmathml" render the mathmal
            // side of things and extract the text from that.
            const atomType = tree.mclass.slice(1);
            // $FlowFixMe: drop the leading "m" from the values in mclass
            buildA11yStrings(tree.body, a11yStrings, atomType);
            break;
        }

        case "mathchoice": {
            // TODO: track which which style we're using, e.g. dispaly, text, etc.
            // default to text style if even that may not be the correct style
            buildA11yStrings(tree.text, a11yStrings, atomType);
            break;
        }

        case "htmlmathml": {
            buildA11yStrings(tree.mathml, a11yStrings, atomType);
            break;
        }

        case "middle": {
            buildString(tree.delim, atomType, a11yStrings);
            break;
        }

        default:
            throw new Error("KaTeX a11y un-recognized type: " + tree.type);
    }
};

const buildA11yStrings = (tree, a11yStrings, atomType) => {
    if (tree instanceof Array) {
        for (let i = 0; i < tree.length; i++) {
            buildA11yStrings(tree[i], a11yStrings, atomType);
        }
    } else {
        handleObject(tree, a11yStrings, atomType);
    }

    return a11yStrings;
};


const flatten = function(array) {
    let result = [];

    array.forEach(function(item) {
        if (item instanceof Array) {
            result = result.concat(flatten(item));
        } else {
            result.push(item);
        }
    });

    return result;
};

const renderA11yString = function(text, settings) {
    const tree = katex.__parse(text, settings);
    const a11yStrings = buildA11yStrings(tree, [], "normal");
    return flatten(a11yStrings).join(", ");
};

export default renderA11yString;
