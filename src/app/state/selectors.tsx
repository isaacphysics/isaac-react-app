import {AppState} from "./reducers";
import {sortBy} from "lodash";
import {NOT_FOUND} from "../services/constants";

export const selectors = {
    groups: {
        current: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            const activeId = state.groups.selectedGroupId;
            if (!activeId) return null;
            return state.groups.cache[activeId] || null;
        },
        active: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.active) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.active.map(groupId => state.groups.cache[groupId]);
        },
        archived: (state: AppState) => {
            if (!state) return null;
            if (!state.groups) return null;
            if (!state.groups.cache) return null;
            if (!state.groups.archived) return null;
            // @ts-ignore - typescript can't pass the non-null inside the map function here
            return state.groups.archived.map(groupId => state.groups.cache[groupId]);
        },
        groups: (state: AppState) => {
            return {
                active: selectors.groups.active(state),
                archived: selectors.groups.archived(state)
            }
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
        }
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
        orNull: (state: AppState) => state?.user || null
    },
};

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
