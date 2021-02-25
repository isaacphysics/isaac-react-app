import {AppState} from "./reducers";
import {sortBy} from "lodash";
import {NOT_FOUND} from "../services/constants";
import {AppGroup, AppQuizAssignment} from "../../IsaacAppTypes";
import {KEY, load} from "../services/localStorage";
import {GroupProgressState, ProgressState} from "./reducers/assignmentsState";
import {isDefined} from "../services/miscUtils";
import {QuizAssignmentDTO} from "../../IsaacApiTypes";

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
            return load(KEY.ANONYMISE_USERS) === "YES" ? anonymisationFunctions.groupProgress(state.groupProgress) : state.groupProgress;
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
    },

    quizzes: {
        available: (state: AppState) => state?.quizzes?.quizzes,
        assignments: (state: AppState) => augmentWithGroupName(state, state?.quizAssignments),
    },
};

function augmentWithGroupName(state: AppState, quizAssignments: QuizAssignmentDTO[] | null | undefined): AppQuizAssignment[] | null {
    if (!isDefined(quizAssignments)) {
        return null;
    }
    const groupCache = state?.groups?.cache ?? {};
    console.log(groupCache);
    return quizAssignments.map(assignment => {
        console.log(assignment);
        const groupName = groupCache[assignment.groupId as number]?.groupName;
        return {
            ...assignment,
            groupName,
        } as AppQuizAssignment;
    });
}

export const anonymisationFunctions = {
    appGroup: (appGroup: AppGroup): AppGroup => {
        return {
            ...appGroup,
            groupName: `Demo Group ${appGroup.id}`,
            members: appGroup.members?.map((member, i) => {
                return {
                    ...member,
                    familyName: "",
                    givenName: `Test Student ${i + 1}`,
                }
            }),
        }
    },
    progressState: (progress: ProgressState): ProgressState => {
        if (!progress) return null;
        const anonymousProgress: ProgressState = {};
        Object.keys(progress).forEach(id  => {
            anonymousProgress[Number(id)] = progress[Number(id)].map((userProgress, i) => {
                return {
                    ...userProgress,
                    user: {
                        ...userProgress.user,
                        familyName: "",
                        givenName: `Test Student ${i + 1}`,
                    }
                }
            })
        });
        return anonymousProgress;
    },
    groupProgress: (groupProgress: GroupProgressState): GroupProgressState => {
        if (!groupProgress) return null;
        const anonymousGroupProgress: GroupProgressState = {};
        Object.keys(groupProgress).forEach(groupId => {
            anonymousGroupProgress[Number(groupId)] = (groupProgress[Number(groupId)] || []).map((userProgressSummary, i) => {
                return {
                    ...userProgressSummary,
                    user : {
                        ...userProgressSummary.user,
                        familyName: "",
                        givenName: `Test Student ${i + 1}`,
                    }
                }
            })
        });
        return anonymousGroupProgress;
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
