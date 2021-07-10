import {
    DOCUMENT_TYPE,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    EXAM_BOARDS_CS_A_LEVEL,
    EXAM_BOARDS_CS_GCSE,
    EXAM_BOARDS_OLD,
    examBoardTagMap,
    STAGE,
    STAGE_NULL_OPTIONS,
    STAGES_CS,
    STAGES_PHY
} from "./constants";
import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";

interface UserContextProps {
    examBoard: EXAM_BOARD;
    stage: STAGE;
}

export function useUserContext(): UserContextProps {
    const {BETA_FEATURE: betaFeature} = useSelector((state: AppState) => state?.userPreferences) || {};
    const user = useSelector((state: AppState) => state && state.user);
    const transientUserContext = useSelector((state: AppState) => state?.transientUserContext) || {};

    // Exam Board
    let examBoard;
    if (SITE_SUBJECT === SITE.PHY) {
        examBoard = EXAM_BOARD.NONE;
    } else if (betaFeature?.AUDIENCE_CONTEXT || !user || user.examBoard === undefined || EXAM_BOARD_NULL_OPTIONS.has(user.examBoard)) {
        examBoard = transientUserContext?.examBoard || EXAM_BOARD.AQA;
    } else {
        examBoard = user.examBoard;
    }

    // Stage
    const stage = transientUserContext?.stage || STAGE.A_LEVEL;

    return {examBoard, stage};
}

const EXAM_BOARD_ITEM_OPTIONS = [
    {label: "OCR", value: EXAM_BOARD.OCR},
    {label: "AQA", value: EXAM_BOARD.AQA},
    {label: "CIE", value: EXAM_BOARD.CIE},
    {label: "EDEXCEL", value: EXAM_BOARD.EDEXCEL},
    {label: "EDUCAS", value: EXAM_BOARD.EDUCAS},
    {label: "WJEC / CBAC", value: EXAM_BOARD.WJEC},
    {label: "Other", value: EXAM_BOARD.OTHER},
    {label: "None", value: EXAM_BOARD.NONE},
];
export function getFilteredExamBoardOptions(stages: STAGE[], includeNullOptions: boolean, audienceContextBetaFeature?: boolean) {
    return EXAM_BOARD_ITEM_OPTIONS
        .filter(i =>
            (stages.length === 0) ||
            (stages.includes(STAGE.GCSE) && EXAM_BOARDS_CS_GCSE.has(i.value)) ||
            (stages.includes(STAGE.A_LEVEL) && EXAM_BOARDS_CS_A_LEVEL.has(i.value))
        )
        .filter(i => includeNullOptions || !EXAM_BOARD_NULL_OPTIONS.has(i.value))
        .filter(i => audienceContextBetaFeature || EXAM_BOARDS_OLD.has(i.value));
}

const STAGE_ITEM_OPTIONS = [
    {label: "None", value: STAGE.NONE},
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "Further A", value: STAGE.FURTHER_A},
    {label: "University", value: STAGE.UNIVERSITY},
];
export function getFilteredStages(includeNullOptions: boolean) {
    return STAGE_ITEM_OPTIONS
        .filter(i => ({[SITE.PHY]: STAGES_PHY, [SITE.CS]: STAGES_CS}[SITE_SUBJECT].has(i.value)))
        .filter(i => includeNullOptions || !STAGE_NULL_OPTIONS.has(i.value));
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
