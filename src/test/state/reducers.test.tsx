import {questions, rootReducer, user} from "../../app/state/reducers";
import {Action, ActionType, AppQuestionDTO} from "../../IsaacAppTypes";
import {RegisteredUserDTO} from "../../IsaacApiTypes";

const ignoredTestAction: Action = {type: ActionType.TEST_ACTION};

describe("root reducer", () => {

    it("has null as the initial state value for every property", () => {
        const actualInitialState = rootReducer(undefined, ignoredTestAction);
        Object.values(actualInitialState).map((actualInitialValue) => {
            expect(actualInitialValue).toBe(null);
        });
    });

    it("resets to the initial state on log out regardless of previous state", () => {
        const actualInitialState = rootReducer(undefined, ignoredTestAction);
        const previousStates = [
            {'questions': [{id: 'a_toboggan'}]},
            {'questions': null},
            undefined
        ];
        previousStates.map((previousState) => {
            // @ts-ignore initial state so that we don't need to keep updating the test unnecessarily
            const actualNextState = rootReducer(previousState, {type: ActionType.USER_LOG_OUT_RESPONSE_SUCCESS});
            expect(actualNextState).toEqual(actualInitialState);
        });
    });

    // TODO MT add a test with redux-undo to assert logging out also removes history...
    // I don't think "history" is preserved unless done explicitly with redux-logger/redux-undo anyway
});

describe("user reducer", () => {
    const dameShirley: RegisteredUserDTO = {
        givenName: "Steve",
        familyName: "Shirley",
        gender: "FEMALE",
        id: 1
    };
    const profWheeler: RegisteredUserDTO = {
        givenName: "David",
        familyName: "Wheeler",
        id: 2
    };

    it("returns null as an initial value", () => {
        const actualState = user(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        const previousStates = [null, dameShirley, profWheeler];
        previousStates.map((previousState) => {
            const actualNextState = user(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should always add a user on login response success", () => {
        const addProfWheelerAction: Action = {type: ActionType.USER_LOG_IN_RESPONSE_SUCCESS, user: profWheeler};
        const previousStates = [null, dameShirley, profWheeler];
        previousStates.map((previousState) => {
            const actualNextState = user(previousState, addProfWheelerAction);
            expect(actualNextState).toEqual(profWheeler);
        })
    })
});

describe("questions reducer", () => {
    const manVsHorseId = "man_vs_horse|test";
    const manVsHorse: AppQuestionDTO = {
        id: manVsHorseId
    };
    const aTobogganId = "a_toboggan|123abc";
    const aToboggan: AppQuestionDTO = {
        id: aTobogganId
    };

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
        const registerManVsHorse: Action = {type: ActionType.QUESTION_REGISTRATION, question: manVsHorse};
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
        const deregisterManVsHorse: Action = {type: ActionType.QUESTION_DEREGISTRATION, questionId: manVsHorseId};
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
