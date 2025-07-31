import { screen } from "@testing-library/react";
import zipWith from "lodash/zipWith";
import { isPhy } from "../app/services";
import { clickOn } from "../test/testUtils";

export const toggleFilter = async (filter: string) => {
    const regex = orWithCount(filter);
    if (isPhy) {
        await clickOn(regex, mainContainer());
    } else {
        await clickOn(regex);
        await clickOn("Apply filters");
    }
};

export const setTestFilters = (testedFilters: Filters[]) => async (toggle: Filters[], expectedStates: BoxSelectionState[]) => {
    await toggleFilters(toggle);
    expectClasses(testedFilters, expectedStates);
};

export const setTestHighlights = (testedFilters: Filters[]) => async (toggle: Filters[], expectedStates: CheckedState[]) => {
    await toggleFilters(toggle);
    expectCheckedStates(testedFilters, expectedStates);

};

export enum BoxSelectionState {
    Selected = "icon-checkbox-selected",
    Partial = "icon-checkbox-partial-alt",
    Deselected = "icon-checkbox-off",
    Hidden = 'hidden'
};

export enum CheckedState {
    Checked,
    Empty
};

export enum Filters {
    All = 'All',
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

const orWithCount = (str: string) => new RegExp(`^${str}$|^${str} \\([0-9]+\\)$|^${str}\\s*[0-9]+$`);

export const toggleFilters = (filters: string[]) => {
    return Promise.all(filters.map(filter => toggleFilter(filter)));
};

export const expectClasses = (labels: string[], classNames: string[]) => {
    return zipWith(labels, classNames, expectClass);
};

export const expectClass = (label: string, className: string) => {
    const element = screen.queryByLabelText(orWithCount(label));
    if (className === 'hidden') {
        return expect(element).not.toBeInTheDocument();
    }
    return expect(element).toHaveClass(className);
};

export const expectCheckedState = (label: string, checkedState: CheckedState) => {
    const element = screen.queryByLabelText(orWithCount(label));
    return checkedState == CheckedState.Checked ? expect(element).toBeChecked() : expect(element).not.toBeChecked();
};

export const expectCheckedStates = (labels: string[], checkedStates: CheckedState[]) => {
    return zipWith(labels, checkedStates, expectCheckedState);
};