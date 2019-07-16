import {EXAM_BOARD, examBoardTagMap} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import {ContentSummaryDTO} from "../../IsaacApiTypes";

export const determineExamBoardFrom = (userPreferences?: UserPreferencesDTO | null) => {
    if (userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA) {
        return EXAM_BOARD.AQA;
    } else {
        return EXAM_BOARD.OCR;
    }
};

export const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    console.log(examBoard);
    return contents.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoard]));
};
