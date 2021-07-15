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
import {ContentBaseDTO, ContentSummaryDTO, Role} from "../../IsaacApiTypes";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {PotentialUser} from "../../IsaacAppTypes";
import {isLoggedIn, roleRequirements} from "./user";

const defaultStage = {[SITE.CS]: STAGE.A_LEVEL, [SITE.PHY]: STAGE.NONE}[SITE_SUBJECT];

interface UserContext {
    examBoard: EXAM_BOARD;
    stage: STAGE;
    showOtherContent?: boolean;
}

export function useUserContext(): UserContext {
    const {BETA_FEATURE: betaFeature} = useSelector((state: AppState) => state?.userPreferences) || {};
    const user = useSelector((state: AppState) => state && state.user);
    const transientUserContext = useSelector((state: AppState) => state?.transientUserContext) || {};

    // Exam Board
    let examBoard;
    if (SITE_SUBJECT === SITE.PHY) {
        examBoard = EXAM_BOARD.NONE;
    } else if (!user || user.examBoard === undefined || EXAM_BOARD_NULL_OPTIONS.has(user.examBoard) || (betaFeature?.AUDIENCE_CONTEXT && transientUserContext?.examBoard !== undefined)) {
        const defaultExamBoard = betaFeature?.AUDIENCE_CONTEXT ? EXAM_BOARD.NONE : EXAM_BOARD.AQA;
        examBoard = transientUserContext?.examBoard ?? defaultExamBoard;
    } else {
        examBoard = user.examBoard;
    }

    // Stage
    const stage = transientUserContext?.stage ?? defaultStage;

    const showOtherContent = transientUserContext?.showOtherContent ?? true;

    return {examBoard, stage, showOtherContent};
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
            stages.length === 0 ||
            stages.includes(STAGE.NONE) ||
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

export function isIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UserContext, user: PotentialUser | null, audienceBetaFeatureEnabled?: boolean): boolean {
    // If no audience is specified, we default to true
    if (!intendedAudience) {
        return true;
    }

    return intendedAudience.some(audienceClause => {
        // If stages are specified do we have any of them in our context
        if (audienceClause.stage) {
            // If beta feature is not enabled we should treat users as if they have A Level selected
            const nonBetaFeatureOption = {[SITE.PHY]: STAGE.NONE, [SITE.CS]: STAGE.A_LEVEL}[SITE_SUBJECT];
            const userStage = audienceBetaFeatureEnabled ? userContext.stage : nonBetaFeatureOption;
            const satisfiesStageCriteria = userStage === STAGE.NONE || audienceClause.stage.includes(userStage);
            if (!satisfiesStageCriteria) {
                return false;
            }
        }

        // If exam boards are specified do we have any of them in our context
        if (audienceClause.examBoard) {
            // If beta feature is enabled we should treat users as if they have A Level selected
            const nonBetaFeatureOption = EXAM_BOARD.NONE;
            const userExamBoard = audienceBetaFeatureEnabled ? userContext.examBoard : nonBetaFeatureOption;
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
