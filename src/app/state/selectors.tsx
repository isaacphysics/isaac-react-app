import {AdminUserSearchState, AppState, ProgressState} from "./reducers";
import {sortBy} from "lodash";
import {anonymousNames, anonymousSchoolNames, NOT_FOUND} from "../services/constants";
import {AppGroup, UserSchoolLookup} from "../../IsaacAppTypes";
import {UserSummaryForAdminUsersDTO} from "../../IsaacApiTypes";
import {KEY, load} from "../services/localStorage";

export const selectors = {
    groups: {
        current: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            const activeId = state.groups.selectedGroupId;
            if (!activeId) return null;
            return load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(state.groups.cache[activeId]) : state.groups.cache[activeId];
        },
        active: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.active) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.active.map(groupId => state.groups.cache[groupId]).map(group => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(group): group);
        },
        archived: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.archived) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.archived.map(groupId => state.groups.cache[groupId]).map(group => load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.appGroup(group) : group);
        },
        groups: (state: AppState) => {
            return {
                active: selectors.groups.active(state),
                archived: selectors.groups.archived(state)
            }
        },
        progress: (state: AppState) => {
            if (!state) return null;
            if (!state.groupProgress) return null;
            return state.groupProgress;
        }
    },

    topic: {
        currentTopic: (state: AppState) => {
            if (!state) return null;
            if (!state.currentTopic) return null;
            if (state.currentTopic === NOT_FOUND) return null;
            return state.currentTopic;
        }
    },

    board: {
        currentGameboard: (state: AppState) => {
            if (!state) return null;
            if (!state.currentGameboard) return null;
            if (state.currentGameboard === NOT_FOUND) return null;
            if ('inflight' in state.currentGameboard) return null;
            return state.currentGameboard;
        },
        currentGameboardOrNotFound: (state: AppState) => {
            if (!state) return null;
            if (!state.currentGameboard) return null;
            if (state.currentGameboard === NOT_FOUND) return NOT_FOUND;
            if ('inflight' in state.currentGameboard) return null;
            return state.currentGameboard;
        }
    },

    boards: {
        boards: (state: AppState) => {
            if (!state) return null;
            if (!state.boards) return null;
            if (!state.boards.boards) return null;
            function mapGroups(ids?: number[]) {
                return ids && sortBy(ids.map(id => state && state.groups && state.groups.cache && state.groups.cache[id]), g => g && g.groupName && g.groupName.toLowerCase());
            }
            return {
                totalResults: state.boards.boards.totalResults,
                boards: state.boards.boards.boards.map(board => (
                    {
                        ...board,
                        assignedGroups: state.boards && state.boards.boardAssignees && mapGroups(state.boards.boardAssignees[board.id as string]) || undefined
                    }
                ))
            };
        }
    },

    doc: {
        get: (state: AppState) => state?.doc || null,
    },

    questions: {
        getQuestions: (state: AppState) => state?.questions?.questions,
        allQuestionsAttempted: (state: AppState) => {
            return !!state && !!state.questions && state.questions.questions.map(q => !!q.currentAttempt).reduce((prev, current) => prev && current);
        },
        anyQuestionPreviouslyAttempted: (state: AppState) => {
            return !!state && !!state.questions && state.questions.questions.map(q => !!q.bestAttempt).reduce((prev, current) => prev || current);
        },
        graphSketcherSpec: (state: AppState) => state?.graphSketcherSpec,
    },

    segue: {
        contentVersion: (state: AppState) => state?.contentVersion || null,
        versionOrUnknown: (state: AppState) => state?.constants?.segueVersion || "unknown",
        environmentOrUnknown: (state: AppState) => state?.constants?.segueEnvironment || "unknown",
    },

    error: {
        general: (state: AppState) => state?.error && state.error.type == "generalError" && state.error.generalError || null,
    },

    user:  {
        orNull: (state: AppState) => state?.user || null,
    },

    mainContentId: {
        orDefault: (state: AppState) => state?.mainContentId || "main",
    },

    admin: {
        userSearch: (state: AppState) => state?.adminUserSearch || null,
        userSchoolLookup: (state: AppState) => state?.userSchoolLookup,
    },

    assignments: {
        progress: (state: AppState) => state?.progress && load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.progressState(state?.progress) : state?.progress
    }
};

export const anonymisationFunctions = {
    appGroup: (appGroup: AppGroup): AppGroup => {
        return {
            ...appGroup,
            members: appGroup.members?.map(member => {
                const newName = anonymousNames[Math.floor((member.givenName?.charCodeAt(0) || 0) % anonymousNames.length)];
                return {
                    ...member,
                    familyName: "Test",
                    givenName: newName,
                }
            }),
        }
    },
    progressState: (progress: ProgressState): ProgressState => {
        if (!progress) return null;
        const anonymousProgress: ProgressState = {};
        Object.keys(progress).forEach(id  => {
            anonymousProgress[Number(id)] = progress[Number(id)].map(userProgress => {
                const newName = anonymousNames[Math.floor((userProgress.user.givenName?.charCodeAt(0) || 0) % anonymousNames.length)];
                return {
                    ...userProgress,
                    user: {
                        ...userProgress.user,
                        familyName: "Test",
                        givenName: newName
                    }
                }
            })
        });
        return anonymousProgress;
    },
    userSummaryForAdminUsersDTO: (user: UserSummaryForAdminUsersDTO): UserSummaryForAdminUsersDTO => {
        const newName = anonymousNames[Math.floor((user.givenName?.charCodeAt(0) || 0) % anonymousNames.length)];
        return {
            ...user,
            familyName: "Test",
            givenName: newName,
            email: newName + ".XYZ@email.com"
        }
    },
    userSchoolLookup: (userSchoolLookup: UserSchoolLookup): UserSchoolLookup => {
        const anonymousSchoolLookup = {} as UserSchoolLookup;
        Object.keys(userSchoolLookup).forEach(id  => anonymousSchoolLookup[Number(id)] = {
            urn: "",
            name: anonymousSchoolNames[Math.floor(((userSchoolLookup[Number(id)].name.charCodeAt(0)) || 0) % anonymousSchoolNames.length)] + "'s School",
            postcode: "",
            closed: false,
            dataSource: ""
        });
        return anonymousSchoolLookup
    }
}

export const selectorEqualityFunctions = {
    admin: {
        userSearch: (left: AdminUserSearchState, right: AdminUserSearchState) => {
            return (left == null && left === right) ||
                (right != null && left?.map((userL, i) => JSON.stringify(userL) === JSON.stringify(right[i]))
                    .filter(same => !same).length === 0);
        }
    }
}

// Important type checking to avoid an awkward bug
interface SelectorsWithNoPropArgs {
    // It is important that the selectors do not use the component's props to filter the results as they can be
    // out-of-date. In some cases this can lead to zombie children.
    // A full explanation can be found here: https://react-redux.js.org/next/api/hooks#stale-props-and-zombie-children
    // We avoid this problem by forcing the selectors to be simple, accepting only the app state as an argument.
    // Filtering using the props can be safely done later during the component's render on useSelector(...)'s result.
    [type: string]: {[name: string]: (state: AppState) => unknown};
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const selectorsWithoutZombies: SelectorsWithNoPropArgs = selectors; // lgtm[js/unused-local-variable] I don't want to lose selectors' type inference
