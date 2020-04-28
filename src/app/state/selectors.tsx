import {AppState} from "./reducers";
import {sortBy} from "lodash";
import {ACCEPTED_QUIZ_IDS, NOT_FOUND} from "../services/constants";
import {AppQuestionDTO} from "../../IsaacAppTypes";

export const groups = {
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
            active: groups.active(state),
            archived: groups.archived(state)
        }
    }
};

export const boards = {
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
};

export const doc = {
    ifNotAQuizId: (id: string) => (state: AppState) => ACCEPTED_QUIZ_IDS.includes(id) ? NOT_FOUND : (state && state.doc) || null,
    ifQuizId: (id: string) => (state: AppState) => ACCEPTED_QUIZ_IDS.includes(id) ? (state && state.doc) || null : NOT_FOUND,
};

export const questions = {
    selectQuestionPart: (questionPartId?: string) => (state: AppState) => {
        return state?.questions?.filter(question => question.id == questionPartId)[0];
    },
    allQuestionsAttempted: (state: AppState) => {
        return !!state && !!state.questions && state.questions.map(q => !!q.currentAttempt).reduce((prev, current) => prev && current);
    },
    anyQuestionPreviouslyAttempted: (state: AppState) => {
        return !!state && !!state.questions && state.questions.map(q => !!q.bestAttempt).reduce((prev, current) => prev || current);
    },
    filter: (predicate: (q: AppQuestionDTO) => boolean) => (state: AppState) => {
        return state && state.questions && state.questions.filter(predicate) || [];
    }
};

export const segue = {
    contentVersion: (state: AppState) => state?.contentVersion || null,
    versionOrUnknown: (state: AppState) => state?.constants?.segueVersion || "unknown",
    environmentOrUnknown: (state: AppState) => state?.constants?.segueEnvironment || "unknown",
};

export const error = {
    general: (state: AppState) => state?.error && state.error.type == "generalError" && state.error.generalError || null,
};

export const userOrNull = (state: AppState) => state?.user || null;
