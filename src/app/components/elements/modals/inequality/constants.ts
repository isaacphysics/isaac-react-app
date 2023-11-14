export type EditorMode = "maths" | "logic";
export type LogicSyntax = "binary" | "logic";

export interface MenuItemProps {
  type: string;
  properties: any;
  children?: any;
  menu: { label: string; texLabel: boolean; className?: string; fontSize?: string };
}

export interface MenuItems {
  upperCaseLetters: MenuItemProps[];
  lowerCaseLetters: MenuItemProps[];
  upperCaseGreekLetters: MenuItemProps[];
  lowerCaseGreekLetters: MenuItemProps[];
  logicFunctionsItems: MenuItemProps[];
  mathsBasicFunctionsItems: MenuItemProps[];
  mathsTrigFunctions: MenuItemProps[];
  mathsHypFunctions: MenuItemProps[];
  mathsLogFunctions: MenuItemProps[];
  mathsDerivatives: MenuItemProps[];
  // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
  letters: MenuItemProps[];
  otherFunctions: MenuItemProps[];
}

export const LOWER_CASE_GREEK_LETTERS = [
  "alpha",
  "beta",
  "gamma",
  "delta",
  "varepsilon",
  "zeta",
  "eta",
  "theta",
  "iota",
  "kappa",
  "lambda",
  "mu",
  "nu",
  "xi",
  "omicron",
  "pi",
  "rho",
  "sigma",
  "tau",
  "upsilon",
  "phi",
  "chi",
  "psi",
  "omega",
];
export const UPPER_CASE_GREEK_LETTERS = [
  "Gamma",
  "Delta",
  "Theta",
  "Lambda",
  "Xi",
  "Pi",
  "Sigma",
  "Upsilon",
  "Phi",
  "Psi",
  "Omega",
];

export const TRIG_FUNCTION_NAMES = [
  "sin",
  "cos",
  "tan",
  "cosec",
  "sec",
  "cot",
  "arcsin",
  "arccos",
  "arctan",
  "arccosec",
  "arcsec",
  "arccot",
];
export const HYP_FUNCTION_NAMES = [
  "sinh",
  "cosh",
  "tanh",
  "cosech",
  "sech",
  "coth",
  "arccosech",
  "arcsech",
  "arccoth",
  "arcsinh",
  "arccosh",
  "arctanh",
];

export const LOG_FUNCTION_NAMES = ["ln", "log"];

export const DIFFERENTIAL_REGEX = /^(Delta|delta|d)\s*(?:\^([0-9]+))?\s*([a-zA-Z]+(?:(?:_|\^).+)?)/;
