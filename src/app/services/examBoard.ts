import {EXAM_BOARD, examBoardTagMap} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";

export const useCurrentExamBoard = () => {
    const user = useSelector((state: AppState) => state && state.user);
    const currentExamBoardPreference = useSelector((state: AppState) => state && state.currentExamBoardPreference);
    if (!user || user.examBoard == undefined || user.examBoard == EXAM_BOARD.OTHER) {
        return currentExamBoardPreference || EXAM_BOARD.OCR;
    } else {
        return user.examBoard;
    }
};

export const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    return contents.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoard]));
};
