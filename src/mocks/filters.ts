import { screen } from "@testing-library/react";
import zipWith from "lodash/zipWith";
import flatten from "lodash/flatten";
import { isPhy, softHyphen } from "../app/services";
import { clickOn } from "../test/testUtils";

export enum Filter {
    // stages
    All = 'All',
    GCSE = 'GCSE',
    
    //subjects
    Physics = "Physics",
    Maths = "Maths",
    
    // Physics fields
    Mechanics = "Mechanics",
    Skills = "Skills",

    // Physics -> Mechanics topics
    Statics = "Statics",
    Kinematics = `Kine${softHyphen}matics`,
    Dynamics = "Dynamics",
    CircularMotion = "Circular Motion",
    Oscillations = `Oscil${softHyphen}lations`,
    Materials = "Materials",

    // Physics -> Skills topics
    SigFigs = "Significant Figures",
    Units = "Units",

    // Maths fields
    Number = "Number",
    Algebra = "Algebra",
    Geometry = "Geometry",
    Functions = "Functions",
    Calculus = "Calculus",
    Statistics = "Statistics",

    // Maths -> Number topics
    Arithmetic = "Arithmetic",
    RationalNumbers = "Rational Numbers",
    FactorsPowers = "Factors & Powers",
    ComplexNumbers = "Complex Numbers",

    // Maths -> Algebra topics
    Manipulation = `Manip${softHyphen}ulation`,
    Quadratics = `Quadra${softHyphen}tics`,
    SimultaneousEquations = `Simul${softHyphen}taneous Equations`,
    Series = "Series",
    Matrices = "Matrices",
    
    // Maths -> Geometry topics
    Shapes = "Shapes",
    Trigonometry = `Trigon${softHyphen}ometry`,
    Vectors = "Vectors",
    Planes = "Planes",
    Coordinates = "Coordinates",

    // Maths -> Functions topics
    GeneralFunctions = "General Functions",
    GraphSketching = "Graph Sketching",

    // Maths -> Calculus topics
    Differentiation = `Differen${softHyphen}tiation`,
    Integration = `Inte${softHyphen}gration`,
    DifferentialEquations = `Differ${softHyphen}ential Equations`,

    // Maths -> Statistics topics
    DataAnalysis = "Data Analysis",
    Probability = `Probabi${softHyphen}lity`,
    RandomVariables = "Random Variables",
    HypothesisTests = `Hypo${softHyphen}thesis Tests`
}

export const toggleFilter = async (filter: Filter | Filter[]): Promise<void> => {
    if (Array.isArray(filter)) {
        await Promise.all(filter.map(toggleFilter));
    } else {
        const regex = allowMatchesWithCount(filter);
        if (isPhy) {
            await clickOn(regex, sidebarContainer());
        } else {
            await clickOn(regex);
            await clickOn("Apply filters");
        }
    }
};

export const toExpectation: <T, U>(expect: (subject: T, expected: U) => void) => {
    (filters: T[]): {toBe: (states: U[] | U[][]) => void};
    (filter: T): {toBe: (states: U) => void};
} = expect => subjects => ({
    toBe: expected => {
        if (Array.isArray(subjects) && Array.isArray(expected)) {
            if (flatten(subjects).length !== flatten(expected).length) {
                throw new Error("There must be as many subjects as there are expectations");
            }
            return zipWith(flatten(subjects), flatten(expected), expect);
        } else if (!Array.isArray(subjects) && !Array.isArray(expected)) {
            const [filter, state] = [subjects, expected];
            expect(filter, state);
        }
        throw new Error('Either call this function with two arrays or two non-arrays');
    }
});

export enum SelectState {
    Checked,
    NotChecked
};

export const expectSelect = toExpectation((filter: Filter, state: SelectState) => {
    const element = findFilter(filter);
    return state == SelectState.Checked ? expect(element).toBeChecked() : expect(element).not.toBeChecked();
});

export enum PartialCheckboxState {
    Selected = "icon-checkbox-selected",
    Partial = "icon-checkbox-partial-alt",
    Deselected = "icon-checkbox-off",
    Hidden = 'hidden'
};

export const expectPartialCheckBox = toExpectation((filter: Filter, state: PartialCheckboxState) => {
    const element = findFilter(filter);
    if (state === PartialCheckboxState.Hidden) {
        return expect(element).not.toBeInTheDocument();
    }
    if (!element) {
        throw new Error(`Could not find filter with label ${filter}`);
    }
    return expect(element).toHaveClass(state);
});

const sidebarContainer = () => screen.findByTestId('sidebar');

const findFilter = (label: string) => {
    const regexp = allowMatchesWithCount(label);
    return screen.queryByLabelText(regexp);
};

const allowMatchesWithCount = (str: string) => new RegExp(`^${str}$|^${str} \\([0-9]+\\)$|^${str}\\s*[0-9]+$`);
