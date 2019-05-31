import {EXAM_BOARD} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";

export const determineExamBoardFrom = (userPreferences: UserPreferencesDTO | null) => {
    return (userPreferences && userPreferences.EXAM_BOARD && userPreferences.EXAM_BOARD.AQA) ?
        EXAM_BOARD.AQA :
        EXAM_BOARD.OCR
};
