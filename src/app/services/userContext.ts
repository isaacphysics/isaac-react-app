import {DOCUMENT_TYPE, EXAM_BOARD, examBoardTagMap} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";

export function useUserContext(): {examBoard: EXAM_BOARD} {
    const user = useSelector((state: AppState) => state && state.user);
    const tempExamBoardPreference = useSelector((state: AppState) => state?.tempExamBoard);

    let examBoard;
    if (SITE_SUBJECT === SITE.PHY) {
        examBoard = EXAM_BOARD.NONE;
    } else if (!user || user.examBoard == undefined || user.examBoard == EXAM_BOARD.OTHER) {
        examBoard = tempExamBoardPreference || EXAM_BOARD.AQA;
    } else {
        examBoard = user.examBoard;
    }
    return {examBoard};
}


const contentTypesToFilter = [DOCUMENT_TYPE.QUESTION, DOCUMENT_TYPE.CONCEPT];
export const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    if (examBoard === EXAM_BOARD.NONE) {
        return contents;
    }
    return contents.filter(content => {
        return !contentTypesToFilter.includes(content.type as DOCUMENT_TYPE) ||
            content.tags?.includes(examBoardTagMap[examBoard])
    });
};
