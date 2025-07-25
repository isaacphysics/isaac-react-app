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

export const setTestFilters = (testedFilters: Filters[]) => async (toggle: Filters[], expectedStates: BoxSelectionState[]) => {
    await toggleFilters(toggle.map(orWithCount));
    expectClasses(testedFilters.map(orWithCount), expectedStates);
};

export const setTestHighlights = (testedFilters: Filters[]) => async (toggle: Filters[], expectedStates: CheckedState[]) => {
    await toggleFilters(toggle.map(orWithCount));
    expectCheckedStates(testedFilters.map(orWithCount), expectedStates);

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

const toggleFilters = (filters: Array<string | RegExp>) => {
    return Promise.all(filters.map(filter => toggleFilter(filter)));
};

const expectClasses = (labels: Array<string | RegExp>, classNames: string[]) => {
    return _.zipWith(labels, classNames, expectClass);
};

export const expectClass = (label: string | RegExp, className: string) => {
    const element = screen.queryByLabelText(label);
    if (className === 'hidden') {
        return expect(element).not.toBeInTheDocument();
    }
    return expect(element).toHaveClass(className);
};

export const expectCheckedState = (label: string | RegExp, checkedState: CheckedState) => {
    const element = screen.queryByLabelText(label);
    return checkedState == CheckedState.Checked ? expect(element).toBeChecked() : expect(element).not.toBeChecked();
};

export const expectCheckedStates = (labels: Array<string | RegExp>, checkedStates: CheckedState[]) => {
    return _.zipWith(labels, checkedStates, expectCheckedState);
};