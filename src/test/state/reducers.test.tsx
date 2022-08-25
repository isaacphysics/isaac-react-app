import {union, mapValues} from "lodash"
import {questionDTOs, registeredUserDTOs, searchResultsList, unitsList, userGroupDTOs} from "../test-factory";
import {ACTION_TYPE} from "../../app/services";
import {Action, AppGroup, AppGroupMembership, AppQuestionDTO, PotentialUser} from "../../IsaacAppTypes";
import {GameboardDTO, UserSummaryWithEmailAddressDTO, UserSummaryWithGroupMembershipDTO} from "../../IsaacApiTypes";
import {createMockAPIAction} from "./utils";
import {AnyAction} from "redux";
import {
    AppState,
    BoardsState,
    GroupsState,
    constants,
    gameboardsSlice,
    groups,
    questions,
    rootReducer, search,
    toasts,
    user,
    selectors
} from "../../app/state";

const ignoredTestAction: Action = {type: ACTION_TYPE.TEST_ACTION};

function q(questions: AppQuestionDTO[]): { questions: AppQuestionDTO[]; pageCompleted: boolean } {
    return {questions, pageCompleted: false};
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

        Object.values(actualInitialState).map((actualInitialValue) => {
            expect(actualInitialValue).toBe(null);
        });
    });

    it("resets to the initial state on log out regardless of previous state", () => {
        const actualInitialState = removeRTKProperties(rootReducer(undefined, ignoredTestAction));
        actualInitialState.user = {loggedIn: false};
        const previousStates = [
            {'questions': q([{id: 'a_toboggan'}])},
            {'questions': null},
            undefined
        ];
        previousStates.map((previousState) => {
            // @ts-ignore initial state so that we don't need to keep updating the test unnecessarily
            const actualNextState = removeRTKProperties(rootReducer(previousState, {type: ACTION_TYPE.USER_LOG_OUT_RESPONSE_SUCCESS}));
            expect(actualNextState).toEqual(actualInitialState);
        });
    });
});

describe("user reducer", () => {
    const {profWheeler, dameShirley} = registeredUserDTOs;

    const previousStates: (PotentialUser | null)[] = [null, {loggedIn: false}, {...dameShirley, loggedIn: true}, {...profWheeler, loggedIn: true}];

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
        })
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
        })
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

describe("groups reducer", () => {
    it("returns null as an initial value", () => {
        const actualState = groups(undefined, ignoredTestAction);
        expect(actualState).toBe(null);
    });

    // @ts-ignore It's not a complete state
    const groupSelector = mapValues(selectors.groups, f => (groupsState: GroupsState) => f({groups: groupsState}));

    it("can get new active groups", () => {
        const testGroups = {1: userGroupDTOs.one, 2: userGroupDTOs.two};
        const action: Action = {type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS, groups: Object.values(testGroups), archivedGroupsOnly: false};
        const previousStates = [{}, null, {active: undefined, cache: testGroups}, {active: [3, 4], cache: testGroups}];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual(Object.values(testGroups));
        });
    });
    it("can get new archived groups", () => {
        const testGroups = {10: userGroupDTOs.archivedX};
        const action: Action = {type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS, groups: Object.values(testGroups), archivedGroupsOnly: true};
        const previousStates = [{}, null, {active: undefined, cache: {}}, {active: [3, 4], cache: testGroups}, {active: undefined, archived: [3, 4], cache: testGroups}, {archived: [1], active: [3, 4], cache: {}}];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.archived(actualNextState)).toEqual(Object.values(testGroups));
        });
    });
    it("can merge new archived groups", () => {
        const cache = {1: userGroupDTOs.one, 2: userGroupDTOs.two};
        const testGroups = {10: userGroupDTOs.archivedX};
        const action: Action = {type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS, groups: Object.values(testGroups), archivedGroupsOnly: true};
        const previousStates = [{active: undefined, cache: cache}, {active: [3, 4], cache: cache}, {active: undefined, archived: [3, 4], cache: cache}, {archived: [1], active: [3, 4], cache: cache}];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.archived(actualNextState)).toEqual(Object.values(testGroups));
        });
    });

    const activeGroups = {1: userGroupDTOs.one, 2: userGroupDTOs.two};
    const someActiveGroups = {active: [1, 2], cache: activeGroups, archived: []};

    it("can select a group", () => {
        const action: Action = {type: ACTION_TYPE.GROUPS_SELECT, group: userGroupDTOs.two};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.current(actualNextState)).toEqual(userGroupDTOs.two);
        });
    });

    it("can create a group", () => {
        const action: Action = {type: ACTION_TYPE.GROUPS_CREATE_RESPONSE_SUCCESS, newGroup: userGroupDTOs.three};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([...Object.values(activeGroups), userGroupDTOs.three]);
        });
    });

    it("can update a group", () => {
        const updatedGroup = {...userGroupDTOs.two, groupName: "Updated name"};
        const action: Action = {type: ACTION_TYPE.GROUPS_UPDATE_RESPONSE_SUCCESS, updatedGroup};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            const newGroups = groupSelector.active(actualNextState);
            expect(newGroups).toBeDefined();
            expect(newGroups).toHaveProperty('length');
            expect((newGroups as AppGroup[]).length).toEqual(2);
            expect(newGroups).toEqual([userGroupDTOs.one, updatedGroup]);
        });
    });

    it("can delete a group", () => {
        const deletedGroup = {...userGroupDTOs.two};
        const action: Action = {type: ACTION_TYPE.GROUPS_DELETE_RESPONSE_SUCCESS, deletedGroup};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            const newGroups = groupSelector.active(actualNextState);
            expect(newGroups).toBeDefined();
            expect(newGroups).toHaveProperty('length');
            expect((newGroups as AppGroup[]).length).toEqual(1);
            expect(newGroups).toEqual([userGroupDTOs.one]);
        });
    });

    it("can update a token", () => {
        const token = "THX1138";
        const action: Action = {type: ACTION_TYPE.GROUPS_TOKEN_RESPONSE_SUCCESS, group: userGroupDTOs.two, token};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([userGroupDTOs.one, {...userGroupDTOs.two, token}]);
        });
    });

    it("can update members", () => {
        const members: UserSummaryWithGroupMembershipDTO[] = [{
            ...registeredUserDTOs.profWheeler,
            groupMembershipInformation: {status: "ACTIVE"}
        }];
        const action: Action = {type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS, group: userGroupDTOs.two, members};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([userGroupDTOs.one, {...userGroupDTOs.two, members}]);
        });
    });

    // This isn't actually achieved.
    /*it.skip("members are preserved across updates", () => {
        const members: UserSummaryWithGroupMembershipDTO[] = [{
            ...registeredUserDTOs.profWheeler,
            groupMembershipInformation: {status: "ACTIVE"}
        }];
        const action: Action = {type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS, group: userGroupDTOs.two, members};
        const previousStates = [someActiveGroups, groups(someActiveGroups, action)];

        const action2: Action = {type: ACTION_TYPE.GROUPS_RESPONSE_SUCCESS, groups: Object.values(activeGroups), archivedGroupsOnly: false};
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action2);
            expect(groupSelector.active(actualNextState)).toEqual([userGroupDTOs.one, {...userGroupDTOs.two, members}]);
        });
    });*/

    it("can delete members", () => {
        const members: AppGroupMembership[] = [{
            ...registeredUserDTOs.profWheeler,
            groupMembershipInformation: {
                status: "ACTIVE",
                userId: 2,
                groupId: 2
            }
        }];
        const prepareAction: Action = {type: ACTION_TYPE.GROUPS_MEMBERS_RESPONSE_SUCCESS, group: userGroupDTOs.two, members};

        const member = members[0];
        const action: Action = {type: ACTION_TYPE.GROUPS_MEMBERS_DELETE_RESPONSE_SUCCESS, member};
        const previousStates = [groups(someActiveGroups, prepareAction)];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([userGroupDTOs.one, {...userGroupDTOs.two, members: []}]);
        });
    });

    it("can add a manager", () => {
        const manager: UserSummaryWithEmailAddressDTO = {
            ...registeredUserDTOs.profWheeler
        };
        const action: Action = {type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_SUCCESS, group: userGroupDTOs.one, managerEmail: manager.email as string, newGroup: {...userGroupDTOs.one, additionalManagers: [manager]}};
        const previousStates = [someActiveGroups];
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([{...userGroupDTOs.one, additionalManagers: [manager]}, userGroupDTOs.two]);
        });
    });

    it("can remove a manager", () => {
        const manager: UserSummaryWithEmailAddressDTO = {
            ...registeredUserDTOs.profWheeler
        };
        const prepareAction: Action = {type: ACTION_TYPE.GROUPS_MANAGER_ADD_RESPONSE_SUCCESS, group: userGroupDTOs.one, managerEmail: manager.email as string, newGroup: {...userGroupDTOs.one, additionalManagers: [manager]}};
        const previousStates = [groups(someActiveGroups, prepareAction)];

        const action: Action = {type: ACTION_TYPE.GROUPS_MANAGER_DELETE_RESPONSE_SUCCESS, group: userGroupDTOs.one, manager};
        previousStates.map((previousState) => {
            const actualNextState = groups(previousState, action);
            expect(groupSelector.active(actualNextState)).toEqual([{...userGroupDTOs.one, additionalManagers: []}, userGroupDTOs.two]);
        });
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
