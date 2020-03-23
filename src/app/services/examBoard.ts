import {EXAM_BOARD, examBoardTagMap} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";

export const useCurrentExamBoard = () => {
    const user = useSelector((state: AppState) => state && state.user);
    const tempExamBoardPreference = useSelector((state: AppState) => state && state.tempExamBoard);

    if (SITE_SUBJECT === SITE.PHY) {
        return EXAM_BOARD.NONE;
    }

    if (!user || user.examBoard == undefined || user.examBoard == EXAM_BOARD.OTHER) {
        return tempExamBoardPreference || EXAM_BOARD.OCR;
    } else {
        return user.examBoard;
    }
};

export const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    if (examBoard === EXAM_BOARD.NONE) {
        return contents;
    }
    return contents.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoard]));
};
