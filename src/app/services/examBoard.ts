import {EXAM_BOARD} from "./constants";
import {UserPreferencesDTO} from "../../IsaacAppTypes";
import { user } from "../state/reducers";

export const determineExamBoardFrom = (userPreferences: UserPreferencesDTO | null) => {
    if (!userPreferences) {
        return EXAM_BOARD.OCR;
    } else if (userPreferences.EXAM_BOARD) {
        return userPreferences.EXAM_BOARD.AQA ? EXAM_BOARD.AQA : EXAM_BOARD.OCR;
    }
    return EXAM_BOARD.OCR;
};
