import { screen } from "@testing-library/react";
import zipWith from "lodash/zipWith";
import flatten from "lodash/flatten";
import { isPhy } from "../app/services";
import { clickOn } from "../test/testUtils";

export enum Filter {
    All = 'All',
    GCSE = 'GCSE',
    Physics = "Physics",
    Skills = "Skills",
    Mechanics = "Mechanics",
    SigFigs = "Significant Figures",
    Maths = "Maths",
    Number = "Number",
    Arithmetic = "Arithmetic",
    Geometry = "Geometry",
    Shapes = "Shapes",
    Statics = "Statics",
    Units = "Units",
    Kinematics = "Kinematics"
}

export const toggleFilter = async (filter: Filter | Filter[]): Promise<void> => {
    if (Array.isArray(filter)) {
        await Promise.all(filter.map(toggleFilter));
    } else {
        const regex = allowMatchesWithCount(filter);
        if (isPhy) {
            await clickOn(regex, mainContainer());
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
    return expect(element).toHaveClass(state);
});

const mainContainer = () => screen.findByTestId('main');

const findFilter = (label: string) => {
    const regexp = allowMatchesWithCount(label);
    return screen.queryByLabelText(regexp);
};

const allowMatchesWithCount = (str: string) => new RegExp(`^${str}$|^${str} \\([0-9]+\\)$|^${str}\\s*[0-9]+$`);