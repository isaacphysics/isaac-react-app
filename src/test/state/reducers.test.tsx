import mapValues from "lodash/mapValues";
import union from "lodash/union";
import {questionDTOs, registeredUserDTOs} from "../test-factory";
import {ACTION_TYPE} from "../../app/services";
import {Action, AppQuestionDTO, PotentialUser} from "../../IsaacAppTypes";
import {GameboardDTO} from "../../IsaacApiTypes";
import {createMockAPIAction} from "./utils";
import {AnyAction} from "redux";
import {
    AppState,
    BoardsState,
    gameboardsSlice,
    questions,
    rootReducer,
    selectors,
    toasts,
    userSlice
} from "../../app/state";

const ignoredTestAction: Action = {type: ACTION_TYPE.TEST_ACTION};

function q(questions: AppQuestionDTO[]): { questions: AppQuestionDTO[]; pageCompleted: boolean; mostRecentCorrectAttemptDate: Date | undefined} {
    return {questions, pageCompleted: false, mostRecentCorrectAttemptDate: undefined};
}

function removeRTKProperties(state: AppState) {
    if (state) {
        // @ts-ignore
        delete state["isaacApi"];
    }
    return state ?? {} as any;
}

describe("root reducer", () => {

    it("has null as the initial state value for every property", () => {
        const actualInitialState = removeRTKProperties(rootReducer(undefined, ignoredTestAction));

        Object.entries(actualInitialState).map(([reducerName, actualInitialValue]) => {
            if (reducerName === "adminUserSeach") {
                expect(actualInitialValue).toHaveLength(0);
            } else {
                expect(actualInitialValue).toBe(null);
            }
        });
    });

    // FIXME make a similar test to make sure that logging out causes a refresh of the page (clearing the state)
    // it("resets to the initial state on log out regardless of previous state", () => {
    //     const actualInitialState = removeRTKProperties(rootReducer(undefined, ignoredTestAction));
    //     actualInitialState.user = {loggedIn: false};
    //     const previousStates = [
    //         {'questions': q([{id: 'a_toboggan'}])},
    //         {'questions': null},
    //         undefined
    //     ];
    //     previousStates.map((previousState) => {
    //         // @ts-ignore initial state so that we don't need to keep updating the test unnecessarily
    //         const actualNextState = removeRTKProperties(rootReducer(previousState, {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS}));
    //         expect(actualNextState).toEqual(actualInitialState);
    //     });
    // });
});

describe("user reducer", () => {
    const {profWheeler, dameShirley} = registeredUserDTOs;

    const previousStates: (PotentialUser | null)[] = [null, {loggedIn: false}, {...dameShirley, loggedIn: true}, {...profWheeler, loggedIn: true}];

    it("returns null as an initial value", () => {
        const actualState = userSlice.reducer(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        previousStates.map((previousState) => {
            const actualNextState = userSlice.reducer(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should always add a user on login response success", () => {
        const addProfWheelerAction: Action = {type: ACTION_TYPE.USER_LOG_IN_RESPONSE_SUCCESS, authResponse: profWheeler};
        previousStates.map((previousState) => {
            const actualNextState = userSlice.reducer(previousState, addProfWheelerAction);
            expect(actualNextState).toEqual({...profWheeler, loggedIn: true});
        });
    });
});

describe("questions reducer", () => {
    const {aToboggan, manVsHorse} = questionDTOs;

    it("returns null as an initial value", () => {
        const actualState = questions(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        const previousStates = [null, q([aToboggan]), q([aToboggan, manVsHorse])];
        previousStates.map((previousState) => {
            const actualNextState = questions(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("should register a question correctly", () => {
        const registerManVsHorse: Action = {type: ACTION_TYPE.QUESTION_REGISTRATION, questions: [manVsHorse]};
        const testCases = [
            [null, q([manVsHorse])],
            [q([aToboggan]), q([aToboggan, manVsHorse])],
            [q([aToboggan, manVsHorse]), q([aToboggan, manVsHorse, manVsHorse])] // TODO MT could be handled better
        ];
        testCases.map(([previousState, expectedNextState]) => {
            const actualNextState = questions(previousState, registerManVsHorse);
            expect(actualNextState).toEqual(expectedNextState);
        });
    });

    it("should deregister questions correctly", () => {
        const deregisterManVsHorse: Action =
            {type: ACTION_TYPE.QUESTION_DEREGISTRATION, questionIds: [(manVsHorse.id as string)]};
        const testCases = [
            [null, null],
            [q([manVsHorse]), null],
            [q([aToboggan, manVsHorse]), q([aToboggan])],
            [q([aToboggan, manVsHorse, manVsHorse]), q([aToboggan])],
            [q([aToboggan, aToboggan]), q([aToboggan, aToboggan])]
        ];
        testCases.map(([previousState, expectedNextState]) => {
            const actualNextState = questions(previousState, deregisterManVsHorse);
            expect(actualNextState).toEqual(expectedNextState);
        });
    });
});

describe("toasts reducer", () => {
    const sampleToast = {
        title: "Title",
        body: "Body",
        color: "success",
        id: "toastA"
    };
    const moreToast = {
        title: "Title",
        body: "Body",
        color: "info",
        id: "toastB"
    };
    const previousStates = [null, [], [sampleToast]];

    it("returns null as an initial value", () => {
        const actualState = toasts(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    it("returns the previous state by default", () => {
        previousStates.map((previousState) => {
            const actualNextState = toasts(previousState, ignoredTestAction);
            expect(actualNextState).toEqual(previousState);
        });
    });

    it("can add to the list of toasts", () => {
        const toastsShowAction: Action = {type: ACTION_TYPE.TOASTS_SHOW, toast: moreToast};
        previousStates.map((previousState) => {
            const actualNextState = toasts(previousState, toastsShowAction);
            expect(actualNextState).toEqual([...(previousState || []), moreToast]);
        });
    });

    it("can mark existing toasts as hidden", () => {
        const toastsShowAction: Action = {type: ACTION_TYPE.TOASTS_HIDE, toastId: moreToast.id};
        const previousState = [sampleToast, moreToast];
        const actualNextState = toasts(previousState, toastsShowAction);
        expect(actualNextState).toEqual([sampleToast, {...moreToast, showing: false}]);
    });

    it("can remove existing toasts", () => {
        const toastsShowAction: Action = {type: ACTION_TYPE.TOASTS_REMOVE, toastId: moreToast.id};
        const previousState = [sampleToast, moreToast];
        const actualNextState = toasts(previousState, toastsShowAction);
        expect(actualNextState).toEqual([sampleToast]);
    });
});

describe("boards reducer", () => {
    it("returns null as an initial value", () => {
        const actualState = gameboardsSlice.reducer(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    // @ts-ignore It's not a complete state
    const selector = mapValues(selectors.boards, f => (boardsState: BoardsState) => f({boards: boardsState}));

    const testBoards: GameboardDTO[] = [{id: "abc", title: "ABC Board"}, {id: "def", title: "DEF Board"}];

    const simpleState: BoardsState = {totalResults: 42, boards: testBoards};

    it ("can get a new set of boards", () => {
        const action: AnyAction = createMockAPIAction("getGameboards", "query", "fulfilled", {boards: testBoards, totalResults: 42}, {startIndex: 0});
        const previousStates = [null];
        previousStates.map((previousState) => {
            const actualNextState = gameboardsSlice.reducer(previousState, action);
            expect(selector.boards(actualNextState)).toEqual({totalResults: 42, boards: testBoards});
        });
    });

    it ("can add to the set of boards", () => {
        const newBoards: GameboardDTO[] = [{id: "ghi", title: "Ghi Board"}, {id: "jkl", title: "JKL Board"}];
        const action: AnyAction = createMockAPIAction("getGameboards", "query", "fulfilled", {boards: newBoards, totalResults: 40}, {startIndex: 2});
        const withDupes = {totalResults: 38, boards: [...testBoards, newBoards[1]]};
        const previousStates = [null, simpleState, withDupes];
        previousStates.map((previousState) => {
            const actualNextState = gameboardsSlice.reducer(previousState, action);
            const priorBoards = previousState && previousState.boards || [];
            expect(selector.boards(actualNextState)).toEqual({totalResults: 40, boards: union(priorBoards, newBoards)});
        });
    });

    it ("getting a new set of boards clears the current boards", () => {
        const action: AnyAction = createMockAPIAction("getGameboards", "query", "pending", undefined, {startIndex: 0});
        const previousStates = [null, simpleState];
        previousStates.map((previousState) => {
            const actualNextState = gameboardsSlice.reducer(previousState, action);
            expect(selector.boards(actualNextState)).toBeNull();
        });
    });

    it("can delete an existing board", () => {
        const deleteBoard = testBoards[0];
        const action: AnyAction = createMockAPIAction("unlinkUserFromGameboard", "mutation", "fulfilled", undefined, deleteBoard.id as string);
        const previousStates = [simpleState];
        previousStates.map((previousState) => {
            const actualNextState = gameboardsSlice.reducer(previousState, action);
            expect(selector.boards(actualNextState)).toEqual({totalResults: 41, boards: [testBoards[1]]});
        });
    });
});
