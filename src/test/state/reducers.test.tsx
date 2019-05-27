import {constants, questions, rootReducer, search, user} from "../../app/state/reducers";
import {Action, LoggedInUser} from "../../IsaacAppTypes";
import {questionDTOs, registeredUserDTOs, searchResultsList, unitsList} from "../test-factory";
import {ACTION_TYPE} from "../../app/services/constants";

const ignoredTestAction: Action = {type: ACTION_TYPE.TEST_ACTION};

describe("root reducer", () => {

    it("has null as the initial state value for every property", () => {
        const actualInitialState = rootReducer(undefined, ignoredTestAction);
        Object.values(actualInitialState).map((actualInitialValue) => {
            expect(actualInitialValue).toBe(null);
        });
    });

    it("resets to the initial state on log out regardless of previous state", () => {
        const actualInitialState = rootReducer(undefined, ignoredTestAction);
        actualInitialState.user = {loggedIn: false};
        const previousStates = [
            {'questions': [{id: 'a_toboggan'}]},
            {'questions': null},
            undefined
        ];
        previousStates.map((previousState) => {
            // @ts-ignore initial state so that we don't need to keep updating the test unnecessarily
            const actualNextState = rootReducer(previousState, {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS});
            expect(actualNextState).toEqual(actualInitialState);
        });
    });

    // TODO MT add a test with redux-undo to assert logging out also removes history...
    // I don't think "history" is preserved unless done explicitly with redux-logger/redux-undo anyway
});

describe("user reducer", () => {
    const {profWheeler, dameShirley} = registeredUserDTOs;

    const previousStates: (LoggedInUser | null)[] = [null, {loggedIn: false}, {...dameShirley, loggedIn: true}, {...profWheeler, loggedIn: true}];

    it("returns null as an initial value", () => {
        const actualState = user(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        previousStates.map((previousState) => {
            const actualNextState = user(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should always add a user on login response success", () => {
        const addProfWheelerAction: Action = {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, user: profWheeler};
        previousStates.map((previousState) => {
            const actualNextState = user(previousState, addProfWheelerAction);
            expect(actualNextState).toEqual({...profWheeler, loggedIn: true});
        })
    })
});

describe("questions reducer", () => {
    const {aToboggan, manVsHorse} = questionDTOs;

    it("returns null as an initial value", () => {
        const actualState = questions(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        const previousStates = [null, [aToboggan], [aToboggan, manVsHorse]];
        previousStates.map((previousState) => {
            const actualNextState = questions(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should register a question correctly", () => {
        const registerManVsHorse: Action = {type: ACTION_TYPE.QUESTION_REGISTRATION, question: manVsHorse};
        const testCases = [
            [null, [manVsHorse]],
            [[aToboggan], [aToboggan, manVsHorse]],
            [[aToboggan, manVsHorse], [aToboggan, manVsHorse, manVsHorse]] // TODO MT could be handled better
        ];
        testCases.map(([previousState, expectedNextState]) => {
            const actualNextState = questions(previousState, registerManVsHorse);
            expect(actualNextState).toEqual(expectedNextState);
        })
    });

    it("should deregister questions correctly", () => {
        const deregisterManVsHorse: Action =
            {type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionId: (manVsHorse.id as string)};
        const testCases = [
            [null, null],
            [[manVsHorse], null],
            [[aToboggan, manVsHorse], [aToboggan]],
            [[aToboggan, manVsHorse, manVsHorse], [aToboggan]],
            [[aToboggan, aToboggan], [aToboggan, aToboggan]]
        ];
        testCases.map(([previousState, expectedNextState]) => {
            const actualNextState = questions(previousState, deregisterManVsHorse);
            expect(actualNextState).toEqual(expectedNextState);
        })
    });
});

describe("constants reducer", () => {
    it("returns null as an initial value", () => {
        const actualState = constants(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        const previousStates = [null, {units: unitsList}];
        previousStates.map((previousState) => {
            const actualNextState = constants(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should always add the list of units on units response success", () => {
        const unitsAction: Action = {type: ACTION_TYPE.CONSTANTS_UNITS_RESPONSE_SUCCESS, units: unitsList};
        const previousStates = [null, {units: ["foo"]}];
        previousStates.map((previousState) => {
            const actualNextState = constants(previousState, unitsAction);
            expect(actualNextState).toEqual({units: unitsList});
        })
    })
});

describe("search reducer", () => {
    it("returns null as an initial value", () => {
        const actualState = constants(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        const previousStates = [null, {searchResults: searchResultsList}];
        previousStates.map((previousState) => {
            const actualNextState = search(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should replace the list of search results on ", () => {
        const unitsAction: Action = {type: ACTION_TYPE.SEARCH_RESPONSE_SUCCESS, searchResults: searchResultsList};
        const previousStates = [null, {searchResults: {totalResults: 0, results: []}}];
        previousStates.map((previousState) => {
            const actualNextState = search(previousState, unitsAction);
            expect(actualNextState).toEqual({searchResults: searchResultsList});
        })
    })
});
