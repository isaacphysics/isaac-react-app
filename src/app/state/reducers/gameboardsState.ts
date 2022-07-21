import {ContentSummaryDTO, GameboardDTO, GameboardListDTO, IsaacWildcard} from "../../../IsaacApiTypes";
import {Action, BoardAssignees, Boards, FasttrackConceptsState, NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {ACTION_TYPE, NOT_FOUND} from "../../services/constants";
import {differenceBy, mapValues, union, unionWith} from "lodash";

export type CurrentGameboardState = GameboardDTO | NOT_FOUND_TYPE | null | {inflight: true; id: string | null};
export const currentGameboard = (currentGameboard: CurrentGameboardState = null, action: Action): CurrentGameboardState => {
    switch (action.type) {
        case ACTION_TYPE.GAMEBOARD_REQUEST:
            return {inflight: true, id: action.gameboardId} as {inflight: true; id: string | null};
        case ACTION_TYPE.GAMEBOARD_RESPONSE_SUCCESS:
            return action.gameboard;
        case ACTION_TYPE.GAMEBOARD_CREATE_RESPONSE_SUCCESS:
            return {id: action.gameboardId};
        case ACTION_TYPE.GAMEBOARD_ADD_RESPONSE_SUCCESS:
            if (currentGameboard && currentGameboard !== NOT_FOUND && currentGameboard.id === action.gameboardId) {
                if (action.gameboardTitle) {
                    return {...currentGameboard, title: action.gameboardTitle, savedToCurrentUser: true};
                } else {
                    return {...currentGameboard, savedToCurrentUser: true};
                }
            } else { // It was not the currentGameboard that got added
                return currentGameboard;
            }
        case ACTION_TYPE.GAMEBOARD_RESPONSE_NO_CONTENT:
        case ACTION_TYPE.GAMEBOARD_RESPONSE_FAILURE:
            return NOT_FOUND;
        case ACTION_TYPE.ROUTER_PAGE_CHANGE:
            return null;
        default:
            return currentGameboard;
    }
};

export type WildcardsState = IsaacWildcard[] | NOT_FOUND_TYPE | null;
export const wildcards = (wildcards: WildcardsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.GAMEBOARD_WILDCARDS_REQUEST:
            return null;
        case ACTION_TYPE.GAMEBOARD_WILDCARDS_RESPONSE_SUCCESS:
            return action.wildcards;
        case ACTION_TYPE.GAMEBOARD_WILDCARDS_RESPONSE_FAILURE:
            return NOT_FOUND;
        default:
            return wildcards;
    }
};

export type BoardsState = {boards?: Boards} & BoardAssignees | null;

function mergeBoards(boards: Boards, additional: GameboardListDTO) {
    return {
        ...boards,
        totalResults: additional.totalResults || boards.totalResults,
        boards: unionWith(additional.results, boards.boards, function(a, b) {return a.id == b.id})
    };
}

export const boards = (boards: BoardsState = null, action: Action): BoardsState => {
    function modifyBoards(modify: (current: GameboardDTO[]) => GameboardDTO[], tweak?: (boards: Boards) => void) {
        if (boards && boards.boards) {
            const result = {...boards, boards: {...boards.boards, boards: modify(boards.boards.boards)}};
            if (tweak) tweak(result.boards);
            return result;
        }
        return boards;
    }

    switch (action.type) {
        case ACTION_TYPE.BOARDS_REQUEST:
            if (!action.accumulate) {
                return {
                    boardAssignees: boards && boards.boardAssignees || undefined
                };
            }
            return boards;
        case ACTION_TYPE.BOARDS_RESPONSE_SUCCESS:
            if (boards && boards.boards && action.accumulate) {
                return {...boards, boards: mergeBoards(boards.boards, action.boards)};
            } else {
                return {...boards, boards: {boards: action.boards.results as GameboardDTO[], totalResults: action.boards.totalResults as number}};
            }
        case ACTION_TYPE.BOARDS_DELETE_RESPONSE_SUCCESS:
            return modifyBoards(existing => differenceBy(existing, [action.board], board => board.id),
                boards => {boards.totalResults--;});
        case ACTION_TYPE.BOARDS_GROUPS_RESPONSE_SUCCESS:
            if (boards) {
                return {
                    ...boards,
                    boardAssignees: {...boards.boardAssignees, ...(mapValues(action.groups, groups => groups.map(g => ({groupId: g.id as number}))))}
                };
            }
            return boards;
        case ACTION_TYPE.BOARDS_UNASSIGN_RESPONSE_SUCCESS:
            if (boards) {
                return {
                    ...boards,
                    boardAssignees: mapValues(boards.boardAssignees, (value, key) => key == action.board.id ? value.filter(assignee => assignee.groupId !== action.group.id) : value)
                };
            }
            return boards;
        case ACTION_TYPE.BOARDS_ASSIGN_RESPONSE_SUCCESS:
            if (boards) {
                const boardId = action.board.id as string;
                const assignees = union(boards.boardAssignees && boards.boardAssignees[boardId], action.groupIds.map(id => ({groupId: id, startDate: action.scheduledStartDate})));
                return {
                    ...boards,
                    boardAssignees: {...boards.boardAssignees, [boardId]: assignees}
                };
            }
            return boards;
        default:
            return boards;
    }
};

export const fasttrackConcepts = (state: FasttrackConceptsState = null, action: Action) => {
    switch (action.type) {
        case ACTION_TYPE.FASTTRACK_CONCEPTS_RESPONSE_SUCCESS:
            return action.concepts;
        default:
            return state;
    }
};

type QuestionSearchResultState = ContentSummaryDTO[] | null;
export const questionSearchResult = (questionSearchResult: QuestionSearchResultState = null, action: Action) => {
    switch(action.type) {
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_SUCCESS: {
            return action.questions.map((question) => {
                return {...question, url: question.url && question.url.replace("/isaac-api/api/pages","")}
            });
        }
        case ACTION_TYPE.QUESTION_SEARCH_RESPONSE_FAILURE: {
            return null;
        }
        default: {
            return questionSearchResult;
        }
    }
};
