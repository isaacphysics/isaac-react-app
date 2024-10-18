export type EditorMode = "maths" | "logic" | "chemistry" | "nuclear";
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
    chemicalElements: MenuItemProps[];
    chemicalParticles: MenuItemProps[];
    // The following is for the pseudo-text-entry menu on /equality
    parsedChemicalElements: MenuItemProps[];
    chemicalStates: MenuItemProps[];
    chemicalOperations: MenuItemProps[];
    // The following are reduced versions in case there are available symbols and should replace their respective sub-sub-menus.
    letters: MenuItemProps[];
    otherFunctions: MenuItemProps[];
    otherChemistryFunctions: MenuItemProps[];
    otherChemicalStates: MenuItemProps[];
}

export const CHEMICAL_ELEMENTS = ["H", "He", "Li", "Be", "B", "C", "N", "O", "F", "Ne", "Na", "Mg", "Al", "Si", "P", "S", "Cl", "Ar", "K", "Ca", "Sc", "Ti", "V", "Cr", "Mn", "Fe", "Co", "Ni", "Cu", "Zn", "Ga", "Ge", "As", "Se", "Br", "Kr", "Rb", "Sr", "Y", "Zr", "Nb", "Mo", "Tc", "Ru", "Rh", "Pd", "Ag", "Cd", "In", "Sn", "Sb", "Te", "I", "Xe", "Cs", "Ba", "La", "Ce", "Pr", "Nd", "Pm", "Sm", "Eu", "Gd", "Tb", "Dy", "Ho", "Er", "Tm", "Yb", "Lu", "Hf", "Ta", "W", "Re", "Os", "Ir", "Pt", "Au", "Hg", "Tl", "Pb", "Bi", "Po", "At", "Rn", "Fr", "Ra", "Ac", "Th", "Pa", "U", "Np", "Pu", "Am", "Cm", "Bk", "Cf", "Es", "Fm", "Md", "No", "Lr", "Rf", "Db", "Sg", "Bh", "Hs", "Mt", "Ds", "Rg", "Cn", "Nh", "Fl", "Mc", "Lv", "Ts", "Og"];
export const CHEMICAL_PARTICLES: {[key: string]: MenuItemProps} = {
    alpha: {
        type: 'Particle',
        menu: { label: '\\alpha', texLabel: true },
        properties: { particle: 'α', type: 'alpha' }
    },
    beta: {
        type: 'Particle',
        menu: { label: '\\beta', texLabel: true },
        properties: { particle: 'β', type: 'beta' }
    },
    gamma: {
        type: 'Particle',
        menu: { label: '\\gamma', texLabel: true },
        properties: { particle: 'γ', type: 'gamma' }
    },
    neutrino: {
        type: 'Particle',
        menu: { label: '\\nu', texLabel: true },
        properties: { particle: 'ν', type: 'neutrino' }
    },
    antineutrino: {
        type: 'Particle',
        menu: { label: '\\bar{\\nu}', texLabel: true },
        properties: { particle: 'ν̅', type: 'antineutrino' }
    },
    proton: {
        type: 'Particle',
        menu: { label: '\\text{p}', texLabel: true },
        properties: { particle: 'p', type: 'proton' }
    },
    neutron: {
        type: 'Particle',
        menu: { label: '\\text{n}', texLabel: true },
        properties: { particle: 'n', type: 'neutron' }
    },
    electron: {
        type: 'Particle',
        menu: { label: '\\text{e}', texLabel: true },
        properties: { particle: 'e', type: 'electron' }
    }
};
export const CHEMICAL_STATES = ["(g)", "(l)", "(aq)", "(s)"];

export const LOWER_CASE_GREEK_LETTERS = ["alpha", "beta", "gamma", "delta", "varepsilon", "zeta", "eta", "theta", "iota", "kappa", "lambda", "mu", "nu", "xi", "omicron", "pi", "rho", "sigma", "tau", "upsilon", "phi", "chi", "psi", "omega"];
export const UPPER_CASE_GREEK_LETTERS = ["Gamma", "Delta", "Theta", "Lambda", "Xi", "Pi", "Sigma", "Upsilon", "Phi", "Psi", "Omega"];

export const TRIG_FUNCTION_NAMES = ["sin", "cos", "tan", "cosec", "sec", "cot", "arcsin", "arccos", "arctan", "arccosec", "arcsec", "arccot"];
export const HYP_FUNCTION_NAMES = ["sinh", "cosh", "tanh", "cosech", "sech", "coth", "arccosech", "arcsech", "arccoth", "arcsinh", "arccosh", "arctanh"];
export const LOG_FUNCTION_NAMES = ["ln", "log"];

export const DIFFERENTIAL_REGEX = /^(Delta|delta|d)\s*(?:\^([0-9]+))?\s*([a-zA-Z]+(?:(?:_|\^).+)?)/;
