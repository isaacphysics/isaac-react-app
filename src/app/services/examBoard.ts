import {EXAM_BOARD, examBoardTagMap} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {LoggedInUser} from "../../IsaacAppTypes";

export const determineExamBoardFrom = (user: LoggedInUser | null | undefined) => {
    if (!user || user.examBoard == undefined || user.examBoard == EXAM_BOARD.OTHER) {
        return EXAM_BOARD.OCR;
    } else {
        return user.examBoard;
    }
};

export const determineCurrentExamBoard = (user: LoggedInUser | null | undefined, currentExamBoardPreference: EXAM_BOARD | null | undefined): EXAM_BOARD => {
    if (!user || user.examBoard == undefined || user.examBoard == EXAM_BOARD.OTHER) {
        return currentExamBoardPreference || EXAM_BOARD.OCR;
    } else {
        return user.examBoard;
    }
};

export const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    return contents.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoard]));
};
