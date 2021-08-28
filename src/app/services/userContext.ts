import {
    BOOLEAN_NOTATION,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    EXAM_BOARDS_CS_A_LEVEL,
    EXAM_BOARDS_CS_GCSE,
    PROGRAMMING_LANGUAGE,
    STAGE,
    STAGE_NULL_OPTIONS,
    STAGES_CS,
    STAGES_PHY,
    stagesOrdered,
} from "./constants";
import {AudienceContext, ContentBaseDTO, Role, UserContext} from "../../IsaacApiTypes";
import {useLocation, useParams} from "react-router-dom";
import {useSelector} from "react-redux";
import {AppState} from "../state/reducers";
import {SITE, SITE_SUBJECT} from "./siteConstants";
import {BooleanNotation, PotentialUser, ProgrammingLanguage, ViewingContext} from "../../IsaacAppTypes";
import {isLoggedIn, roleRequirements} from "./user";
import {isDefined} from "./miscUtils";
import {history} from "./history";
import queryString from "query-string";
import {useEffect} from "react";
import {useQueryParams} from "./reactRouterExtension";
import {comparatorFromOrderedValues} from "./gameboards";
import {selectors} from "../state/selectors";

export interface UseUserContextReturnType {
    examBoard: EXAM_BOARD;
    stage: STAGE;
    showOtherContent?: boolean;
    preferredProgrammingLanguage?: string;
    preferredBooleanNotation?: string;
}

export function useUserContext(): UseUserContextReturnType {
    const qParams = useQueryParams(true);
    const existingLocation = useLocation();
    const user = useSelector((state: AppState) => state && state.user);
    const {PROGRAMMING_LANGUAGE: programmingLanguage, BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings} =
        useSelector((state: AppState) => state?.userPreferences) || {};
    const transientUserContext = useSelector((state: AppState) => state?.transientUserContext) || {};
    const {questionId} = useParams();
    const currentGameboard = useSelector(selectors.board.currentGameboard);

    // Programming Language
    const preferredProgrammingLanguage = programmingLanguage && Object.keys(PROGRAMMING_LANGUAGE).reduce((val: string | undefined, key) => programmingLanguage[key as keyof ProgrammingLanguage] === true ? key as PROGRAMMING_LANGUAGE : val, undefined);

    // Boolean notation preference
    const preferredBooleanNotation = booleanNotation && Object.keys(BOOLEAN_NOTATION).reduce((val: string | undefined, key) => booleanNotation[key as keyof BooleanNotation] === true ? key as BOOLEAN_NOTATION : val, undefined);

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

    // Exam Board
    let examBoard: EXAM_BOARD;
    if (SITE_SUBJECT === SITE.PHY) {
        examBoard = EXAM_BOARD.NONE;
    } else if (qParams.examBoard && Object.values(EXAM_BOARD).includes(qParams.examBoard as EXAM_BOARD)) {
        examBoard = qParams.examBoard as EXAM_BOARD;
    } else if (isDefined(transientUserContext?.examBoard)) {
        examBoard = transientUserContext?.examBoard;
    } else if (isLoggedIn(user) && user.registeredContexts?.length && user.registeredContexts[0].examBoard) {
        examBoard = user.registeredContexts[0].examBoard as EXAM_BOARD;
    } else {
        examBoard = EXAM_BOARD.NONE;
    }

    // Gameboard views overrides all context options
    if (questionId && qParams.board && currentGameboard && currentGameboard.id === qParams.board) {
        const gameboardItem = currentGameboard.contents?.filter(c => c.id === questionId)[0];
        if (gameboardItem) {
            const gameboardDeterminedViews = determineAudienceViews(gameboardItem.audience, gameboardItem.creationContext);
            // If user's stage selection is not one specified by the gameboard change it
            if (gameboardDeterminedViews.length > 0) {
                if (!gameboardDeterminedViews.map(v => v.stage).includes(stage) && !STAGE_NULL_OPTIONS.has(stage)) {
                    if (gameboardDeterminedViews.length === 1) {
                        stage = gameboardDeterminedViews[0].stage as STAGE;
                    } else {
                        stage = STAGE.NONE;
                    }
                }
                if (!gameboardDeterminedViews.map(v => v.examBoard).includes(examBoard) && !EXAM_BOARD_NULL_OPTIONS.has(examBoard)) {
                    if (gameboardDeterminedViews.length === 1) {
                        examBoard = gameboardDeterminedViews[0].examBoard as EXAM_BOARD;
                    } else {
                        examBoard = EXAM_BOARD.NONE;
                    }
                }
            }
        }
    }

    let showOtherContent;
    if (isDefined(transientUserContext?.showOtherContent)) {
        showOtherContent = transientUserContext?.showOtherContent;
    } else if (isDefined(displaySettings?.HIDE_NON_AUDIENCE_CONTENT)) {
        showOtherContent = !displaySettings?.HIDE_NON_AUDIENCE_CONTENT;
    } else {
        showOtherContent = true;
    }

    // Update query params
    useEffect(() => {
        if (
            (stage !== qParams.stage && !STAGE_NULL_OPTIONS.has(stage)) ||
            (examBoard !== qParams.examBoard && !EXAM_BOARD_NULL_OPTIONS.has(examBoard))
        ) {
            const newParams = {...qParams, stage, examBoard};
            if (STAGE_NULL_OPTIONS.has(stage)) {delete newParams.stage;} /* TODO MT people might want to share none view */
            if (EXAM_BOARD_NULL_OPTIONS.has(examBoard)) {delete newParams.examBoard;} /* TODO MT people might want to share none view */
            history.push({...existingLocation, search: queryString.stringify(newParams, {encode: false})});
        }
    }, []);

    return {examBoard, stage, showOtherContent, preferredProgrammingLanguage, preferredBooleanNotation};
}

const _EXAM_BOARD_ITEM_OPTIONS = [ /* best not to export - use getFiltered */
    {label: "OCR", value: EXAM_BOARD.OCR},
    {label: "AQA", value: EXAM_BOARD.AQA},
    {label: "CIE", value: EXAM_BOARD.CIE},
    {label: "EDEXCEL", value: EXAM_BOARD.EDEXCEL},
    {label: "EDUQAS", value: EXAM_BOARD.EDUQAS},
    {label: "WJEC", value: EXAM_BOARD.WJEC},
    {label: "All Exam Boards", value: EXAM_BOARD.NONE},
];
interface ExamBoardFilterOptions {
    byUser?: PotentialUser | null;
    byStages?: STAGE[];
    byUserContexts?: UserContext[];
    includeNullOptions?: boolean;
}
export function getFilteredExamBoardOptions(filter?: ExamBoardFilterOptions) {
    return _EXAM_BOARD_ITEM_OPTIONS
        // by stage
        .filter(i =>
            !isDefined(filter?.byStages) || // ignore if not set
            i.value === EXAM_BOARD.NONE || // none does not get filtered by stage
            filter?.byStages.length === 0 || // if there are no stages to filter by all pass
            filter?.byStages.some(s => STAGE_NULL_OPTIONS.has(s)) || // none in the stage level allows for all exam boards
            (filter?.byStages.includes(STAGE.GCSE) && EXAM_BOARDS_CS_GCSE.has(i.value)) || // if there is gcse in stages allow GCSE boards
            (filter?.byStages.includes(STAGE.A_LEVEL) && EXAM_BOARDS_CS_A_LEVEL.has(i.value)) // if there is a_level in stage allow A Level boards
        )
        // includeNullOptions flag
        .filter(i => filter?.includeNullOptions || !EXAM_BOARD_NULL_OPTIONS.has(i.value))
        // by user account settings
        .filter(i =>
            // skip if null or logged out user
            !isLoggedIn(filter?.byUser) ||
            // user has a null option selected
            filter?.byUser.registeredContexts
                ?.filter(rc => !filter.byStages || filter.byStages.length === 0 || filter.byStages.includes(rc.stage as STAGE) || STAGE_NULL_OPTIONS.has(rc.stage as STAGE))
                .some(rc => EXAM_BOARD_NULL_OPTIONS.has(rc.examBoard as EXAM_BOARD)) ||
            // stage is one of registered context selections
            filter?.byUser.registeredContexts
                ?.filter(rc => !filter.byStages || filter.byStages.length === 0 || filter.byStages.includes(rc.stage as STAGE) || STAGE_NULL_OPTIONS.has(rc.stage as STAGE))
                .map(rc => rc.examBoard).includes(i.value)
        )
        // Restrict by existing user context selections
        .filter(i =>
            !isDefined(filter?.byUserContexts) ||
            !filter?.byUserContexts
                .filter(uc => !filter.byStages || filter.byStages.includes(uc.stage as STAGE))
                .map(uc => uc.examBoard).includes(i.value));
}

const _STAGE_ITEM_OPTIONS = [ /* best not to export - use getFiltered */
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "Further A", value: STAGE.FURTHER_A},
    {label: "University", value: STAGE.UNIVERSITY},
    {label: "All Stages", value: STAGE.NONE},
];
interface StageFilterOptions {
    byUser?: PotentialUser | null;
    byUserContexts?: UserContext[];
    includeNullOptions?: boolean;
}
export function getFilteredStageOptions(filter?: StageFilterOptions) {
    return _STAGE_ITEM_OPTIONS
        // Restrict by subject stages
        .filter(i => ({[SITE.CS]: STAGES_CS, [SITE.PHY]: STAGES_PHY}[SITE_SUBJECT].has(i.value)))
        // Restrict by includeNullOptions flag
        .filter(i => filter?.includeNullOptions || !STAGE_NULL_OPTIONS.has(i.value))
        // Restrict by account settings
        .filter(i =>
            // skip if null or logged out user
            !isLoggedIn(filter?.byUser) ||
            // user has a null option selected
            filter?.byUser.registeredContexts?.some(rc => STAGE_NULL_OPTIONS.has(rc.stage as STAGE)) ||
            // stage is one of registered context selections
            filter?.byUser.registeredContexts?.map(rc => rc.stage).includes(i.value)
        )
        // Restrict by user contexts
        .filter(i =>
            !filter?.byUserContexts ||
            // if options at stage are exhausted don't offer it
            // - physics
            (SITE_SUBJECT === SITE.PHY && !filter.byUserContexts.map(uc => uc.stage).includes(i.value)) ||
            // - computer science
            (SITE_SUBJECT === SITE.CS && !(
                // stage already has a null option selected
                filter.byUserContexts.some(uc => uc.stage === i.value && EXAM_BOARD_NULL_OPTIONS.has(uc.examBoard as EXAM_BOARD)) ||
                // every exam board has been recorded for the stage
                getFilteredExamBoardOptions({byUser: filter.byUser, byStages: [i.value], byUserContexts: filter.byUserContexts}).length === 0
            ))
        );
}

function produceAudienceViewingCombinations(audience: AudienceContext): ViewingContext[] {
    const keys: (keyof AudienceContext)[] = ["stage", "examBoard", "difficulty"];
    let audienceOptions: ViewingContext[] = [];
    keys.forEach(key => {
        const values = audience[key];
        if (!values || values.length === 0) {return; /* early */}

        const nextIterationOfAudienceOptions: ViewingContext[] = [];
        values.forEach((value: string) => {
            (audienceOptions.length ? audienceOptions : [{}]).forEach(option => {
                nextIterationOfAudienceOptions.push({...option, [key]: value});
            });
        });

        audienceOptions = nextIterationOfAudienceOptions;
    });
    return audienceOptions;
}

export function determineAudienceViews(audience?: AudienceContext[], creationContext?: AudienceContext): ViewingContext[] {
    if (audience === undefined) {return [];}

    let viewingContexts: ViewingContext[] = [];

    // Create a list of all intended viewing context combinations from the audience
    audience.forEach(audienceContext => {
        viewingContexts.push(...produceAudienceViewingCombinations(audienceContext));
    });

    // Restrict by creation context options, if defined
    if (creationContext) {
        viewingContexts = viewingContexts.filter(viewingContext => {
            let viableView = true;
            if (creationContext.stage && viewingContext.stage) {
                viableView = viableView && creationContext.stage.includes(viewingContext.stage);
            }
            if (creationContext.examBoard && viewingContext.examBoard) {
                viableView = viableView && creationContext.examBoard.includes(viewingContext.examBoard);
            }
            if (creationContext.difficulty && viewingContext.difficulty) {
                viableView = viableView && creationContext.difficulty.includes(viewingContext.difficulty);
            }
            return viableView;
        })
    }

    return viewingContexts
        .sort((a, b) => comparatorFromOrderedValues(stagesOrdered)(a.stage, b.stage));
}

export function isIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UseUserContextReturnType, user: PotentialUser | null): boolean {
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
                userExamBoard === EXAM_BOARD.NONE || audienceClause.examBoard.includes(userExamBoard);
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
