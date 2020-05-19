import {AppState} from "./reducers";
import {sortBy} from "lodash";
import {ACCEPTED_QUIZ_IDS, NOT_FOUND} from "../services/constants";
import {AppQuestionDTO, AppGroup} from "../../IsaacAppTypes";

export const groups = {
    current: (state: AppState): AppGroup | null => {
        if (!state) return null;
        if (!state.groups) return null;
        if (!state.groups.cache) return null;
        const activeId = state.groups.selectedGroupId;
        if (!activeId) return null;
        return state.groups.cache[activeId] || null;
    },
    active: (state: AppState): AppGroup[] | null => {
        if (!state) return null;
        if (!state.groups) return null;
        if (!state.groups.cache) return null;
        if (!state.groups.active) return null;
        return state.groups.active.map(groupId => state?.groups?.cache?.[groupId]) as AppGroup[];
    },
    archived: (state: AppState): AppGroup[] | null => {
        if (!state) return null;
        if (!state.groups) return null;
        if (!state.groups.cache) return null;
        if (!state.groups.archived) return null;
        return state.groups.archived.map(groupId => state?.groups?.cache?.[groupId]) as AppGroup[];
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
        return state && state.questions && state.questions.filter(question => question.id == questionPartId)[0];
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
