import {
    DOCUMENT_TYPE,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    EXAM_BOARDS_CS_A_LEVEL,
    EXAM_BOARDS_CS_GCSE,
    examBoardTagMap,
    PROGRAMMING_LANGUAGE,
    STAGE,
    STAGE_NULL_OPTIONS,
    STAGES_CS,
    STAGES_PHY
} from "./constants";
import {ContentBaseDTO, ContentSummaryDTO, Role} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {PotentialUser, ProgrammingLanguage} from "../../IsaacAppTypes";
import {isLoggedIn, roleRequirements} from "./user";
import {useQueryParams} from "./reactRouterExtension";
import {isDefined} from "./miscUtils";
import {history} from "./history";
import queryString from "query-string";
import {useEffect} from "react";

interface UserContext {
    examBoard: EXAM_BOARD;
    stage: STAGE;
    showOtherContent?: boolean;
    preferredProgrammingLanguage?: string;
}

export function useUserContext(): UserContext {
    const qParams = useQueryParams(true);
    const user = useSelector((state: AppState) => state && state.user);
    const transientUserContext = useSelector((state: AppState) => state?.transientUserContext) || {};
    const {PROGRAMMING_LANGUAGE: programmingLanguage} = useSelector((state: AppState) => state?.userPreferences) || {};

    // Programming Language
    const preferredProgrammingLanguage = programmingLanguage && Object.keys(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) => programmingLanguage[key as keyof ProgrammingLanguage] === true ? key as PROGRAMMING_LANGUAGE : val, undefined);

    // Exam Board
    let examBoard: EXAM_BOARD;
    if (SITE_SUBJECT === SITE.PHY) {
        examBoard = EXAM_BOARD.NONE;
    } else if (qParams.examBoard && Object.values(EXAM_BOARD).includes(qParams.examBoard.toUpperCase() as EXAM_BOARD)) {
        examBoard = qParams.examBoard.toUpperCase() as EXAM_BOARD;
    } else if (isDefined(transientUserContext?.examBoard)) {
        examBoard = transientUserContext?.examBoard;
    } else if (isLoggedIn(user) && user.registeredContexts?.length && user.registeredContexts[0].examBoard) {
        examBoard = user.registeredContexts[0].examBoard as EXAM_BOARD;
    } else {
        examBoard = EXAM_BOARD.NONE;
    }

    // Stage
    let stage: STAGE;
    if (qParams.stage && Object.values(STAGE).includes(qParams.stage as STAGE)) {
        stage = qParams.stage as STAGE;
    } else if (isDefined(transientUserContext.stage)) {
        stage = transientUserContext.stage;
    } else if (isLoggedIn(user) && user.registeredContexts?.length && user.registeredContexts[0].stage) {
        stage = user.registeredContexts[0].stage as STAGE;
    } else {
        stage = STAGE.NONE;
    }

    const showOtherContent = transientUserContext?.showOtherContent ?? true;

    // Update query params
    useEffect(() => {
        if (
            (stage !== qParams.stage && !STAGE_NULL_OPTIONS.has(stage)) ||
            (examBoard !== qParams.examBoard?.toUpperCase() && !EXAM_BOARD_NULL_OPTIONS.has(examBoard))
        ) {
            const newParams = {...qParams, stage, examBoard: examBoard.toLowerCase()};
            if (STAGE_NULL_OPTIONS.has(stage)) {delete newParams.stage;} /* TODO MT people might want to share none view */
            if (EXAM_BOARD_NULL_OPTIONS.has(examBoard)) {delete newParams.examBoard;} /* TODO MT people might want to share none view */
            history.push({search: queryString.stringify(newParams, {encode: false})});
        }
    }, []);

    return {examBoard, stage, showOtherContent, preferredProgrammingLanguage};
}

const EXAM_BOARD_ITEM_OPTIONS = [
    {label: "OCR", value: EXAM_BOARD.OCR},
    {label: "AQA", value: EXAM_BOARD.AQA},
    {label: "CIE", value: EXAM_BOARD.CIE},
    {label: "EDEXCEL", value: EXAM_BOARD.EDEXCEL},
    {label: "EDUQAS", value: EXAM_BOARD.EDUQAS},
    {label: "WJEC", value: EXAM_BOARD.WJEC},
    {label: "Other", value: EXAM_BOARD.OTHER},
    {label: "None", value: EXAM_BOARD.NONE},
];
export function getFilteredExamBoardOptions(stages: STAGE[], includeNullOptions: boolean) {
    return EXAM_BOARD_ITEM_OPTIONS
        .filter(i =>
            stages.length === 0 ||
            stages.includes(STAGE.NONE) ||
            (stages.includes(STAGE.GCSE) && EXAM_BOARDS_CS_GCSE.has(i.value)) ||
            (stages.includes(STAGE.A_LEVEL) && EXAM_BOARDS_CS_A_LEVEL.has(i.value))
        )
        .filter(i => includeNullOptions || !EXAM_BOARD_NULL_OPTIONS.has(i.value));
}

const STAGE_ITEM_OPTIONS = [
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "Further A", value: STAGE.FURTHER_A},
    {label: "University", value: STAGE.UNIVERSITY},
    {label: "None", value: STAGE.NONE},
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

export function isIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UserContext, user: PotentialUser | null): boolean {
    // If no audience is specified, we default to true
    if (!intendedAudience) {
        return true;
    }

    return intendedAudience.some(audienceClause => {
        // If stages are specified do we have any of them in our context
        if (audienceClause.stage) {
            const userStage = userContext.stage;
            const satisfiesStageCriteria = userStage === STAGE.NONE || audienceClause.stage.includes(userStage);
            if (!satisfiesStageCriteria) {
                return false;
            }
        }

        // If exam boards are specified do we have any of them in our context
        if (audienceClause.examBoard) {
            const userExamBoard = userContext.examBoard;
            const satisfiesExamBoardCriteria =
                userExamBoard === EXAM_BOARD.NONE || audienceClause.examBoard.includes(userExamBoard.toLowerCase());
            if (!satisfiesExamBoardCriteria) {
                return false;
            }
        }

        // If a role is specified do we have any of those roles or greater
        if (audienceClause.role) {
            const satisfiesRoleCriteria = audienceClause.role.some(role =>
                (role === "logged_in" && isLoggedIn(user)) ||
                (Object.keys(roleRequirements).includes(role.toUpperCase()) && roleRequirements[role.toUpperCase() as Role](user))
            );
            if (!satisfiesRoleCriteria) {
                return false;
            }
        }

        // Passed all requirements, this user is the intended audience
        return true;
    });
}

export function mergeDisplayOptions(source: ContentBaseDTO["display"], update: ContentBaseDTO["display"]): ContentBaseDTO["display"] {
    const srcCopy = {...source};
    if (update) {
        if (update.audience && update.audience.length > 0) {
            srcCopy.audience = update.audience;
        }
        if (update.nonAudience && update.nonAudience.length > 0) {
            srcCopy.nonAudience = update.nonAudience;
        }
    }
    return srcCopy;
}
