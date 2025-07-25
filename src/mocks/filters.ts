import { isPhy } from "../app/services";
import { clickOn } from "../test/testUtils";
import { screen } from "@testing-library/react";
import _ from "lodash";

export const toggleFilter = async (filter: string | RegExp) => {
    if (isPhy) {
        await clickOn(filter, mainContainer());
    } else {
        await clickOn(filter);
        await clickOn("Apply filters");
    }
};

export const setTestFilters = (testedFilters: Filters[]) => async (toggle: Filters[], expectedStates: SelectionState[]) => {
    await toggleFilters(toggle.map(orWithTag));
    expectClassesOn(testedFilters.map(orWithTag), expectedStates);
};

export enum SelectionState {
    Selected = "icon-checkbox-selected",
    Partial = "icon-checkbox-partial-alt",
    Deselected = "icon-checkbox-off",
    Hidden = 'hidden'
};

export enum Filters {
    GCSE = 'GCSE',
    Physics = "Physics",
    Skills = "Skills",
    Mechanics = "Mechanics",
    SigFig = "Significant Figures",
    Maths = "Maths",
    Number = "Number",
    Arithmetic = "Arithmetic",
    Geometry = "Geometry",
    Shapes = "Shapes"
}

const mainContainer = () => screen.findByTestId('main');

const orWithTag = (str: string) => new RegExp(`^${str}$|^${str} \\([0-9].*\\)$`);

const toggleFilters = (filters: Array<string | RegExp>) => {
    return Promise.all(filters.map(filter => toggleFilter(filter)));
};

const expectClassesOn = (labels: Array<string | RegExp>, classNames: string[]) => {
    return _.zipWith(labels, classNames, (label, className) => expectClassOn(label, className));
};

export const expectClassOn = (label: string | RegExp, className: string) => {
    const element = screen.queryByLabelText(label);
    if (className === 'hidden') {
        return expect(element).not.toBeInTheDocument();
    }
    return expect(element).toHaveClass(className);
};