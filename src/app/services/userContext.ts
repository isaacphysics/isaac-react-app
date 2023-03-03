import {
    BOOLEAN_NOTATION,
    comparatorFromOrderedValues,
    EXAM_BOARD,
    EXAM_BOARD_NULL_OPTIONS,
    EXAM_BOARDS_CS_A_LEVEL,
    EXAM_BOARDS_CS_GCSE,
    examBoardBooleanNotationMap,
    examBoardLabelMap,
    history,
    isAda,
    isDefined,
    isLoggedIn,
    isPhy,
    PROGRAMMING_LANGUAGE,
    roleRequirements,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    STAGES_CS,
    STAGES_PHY,
    stagesOrdered,
    useQueryParams,
} from "./";
import {AudienceContext, ContentBaseDTO, ContentDTO, UserRole, Stage, UserContext} from "../../IsaacApiTypes";
import {useLocation, useParams} from "react-router-dom";
import {AppState, useAppSelector} from "../state";
import {GameboardContext, PotentialUser, ViewingContext} from "../../IsaacAppTypes";
import queryString from "query-string";
import {useContext, useEffect} from "react";
import {Immutable} from "immer";

export interface UseUserContextReturnType {
    examBoard: EXAM_BOARD;
    stage: STAGE;
    showOtherContent?: boolean;
    preferredProgrammingLanguage?: PROGRAMMING_LANGUAGE;
    preferredBooleanNotation?: BOOLEAN_NOTATION;
    explanation: {stage?: string, examBoard?: string};
}

const urlMessage = "URL query parameters";
const gameboardMessage = "gameboard settings"

export function useUserContext(): UseUserContextReturnType {
    const existingLocation = useLocation();
    const queryParams = useQueryParams(true);

    const user = useAppSelector((state: AppState) => state && state.user);
    const {PROGRAMMING_LANGUAGE: programmingLanguage, BOOLEAN_NOTATION: booleanNotation, DISPLAY_SETTING: displaySettings} =
        useAppSelector((state: AppState) => state?.userPreferences) || {};

    const transientUserContext = useAppSelector((state: AppState) => state?.transientUserContext) || {};

    const explanation: UseUserContextReturnType["explanation"] = {};

    // Programming Language
    let preferredProgrammingLanguage;
    if (programmingLanguage) {
        preferredProgrammingLanguage = Object.values(PROGRAMMING_LANGUAGE).find(key => programmingLanguage[key] === true);
    }

    // Stage
    let stage: STAGE;
    const stageQueryParam = queryParams.stage as STAGE | undefined;
    if (stageQueryParam && Object.values(STAGE).includes(stageQueryParam) && !STAGE_NULL_OPTIONS.has(stageQueryParam)) {
        stage = stageQueryParam;
        explanation.stage = urlMessage;
    } else if (isDefined(transientUserContext.stage)) {
        stage = transientUserContext.stage;
    } else if (isLoggedIn(user) && user.registeredContexts?.length && user.registeredContexts[0].stage) {
        stage = user.registeredContexts[0].stage as STAGE;
    } else {
        stage = STAGE.ALL;
    }

    // Exam Board
    let examBoard: EXAM_BOARD;
    const examBoardQueryParam = queryParams.examBoard as EXAM_BOARD | undefined
    if (isPhy) {
        examBoard = EXAM_BOARD.ALL;
    } else if (examBoardQueryParam && Object.values(EXAM_BOARD).includes(examBoardQueryParam) && !EXAM_BOARD_NULL_OPTIONS.has(examBoardQueryParam)) {
        examBoard = examBoardQueryParam;
        explanation.examBoard = urlMessage;
    } else if (isDefined(transientUserContext?.examBoard)) {
        examBoard = transientUserContext?.examBoard;
    } else if (isLoggedIn(user) && user.registeredContexts?.length && user.registeredContexts[0].examBoard) {
        examBoard = user.registeredContexts[0].examBoard as EXAM_BOARD;
    } else {
        examBoard = EXAM_BOARD.ALL;
    }

    // Boolean notation preference -
    let preferredBooleanNotation: BOOLEAN_NOTATION | undefined;
    if (booleanNotation) {
        preferredBooleanNotation = Object.values(BOOLEAN_NOTATION).find(key => booleanNotation[key] === true);
    }
    // if we don't have a boolean notation preference for the user, then set it based on the exam board
    if (preferredBooleanNotation === undefined) {
        preferredBooleanNotation = examBoardBooleanNotationMap[examBoard];
    }

    // Gameboard views overrides all context options
    const currentGameboard = useContext(GameboardContext);
    const {questionId} = useParams<{ questionId: string}>();
    if (questionId && queryParams.board && currentGameboard && currentGameboard.id === queryParams.board) {
        const gameboardItem = currentGameboard.contents?.filter(c => c.id === questionId)[0];
        if (gameboardItem) {
            const gameboardDeterminedViews = determineAudienceViews(gameboardItem.audience, gameboardItem.creationContext);
            // If user's stage selection is not one specified by the gameboard change it
            if (gameboardDeterminedViews.length > 0) {
                if (!gameboardDeterminedViews.map(v => v.stage).includes(stage) && !STAGE_NULL_OPTIONS.has(stage)) {
                    explanation.stage = gameboardMessage;
                    if (gameboardDeterminedViews.length === 1) {
                        stage = gameboardDeterminedViews[0].stage as STAGE;
                    } else {
                        stage = STAGE.ALL;
                    }
                }
                if (!gameboardDeterminedViews.map(v => v.examBoard).includes(examBoard) && !EXAM_BOARD_NULL_OPTIONS.has(examBoard)) {
                    explanation.examBoard = gameboardMessage;
                    if (gameboardDeterminedViews.length === 1) {
                        examBoard = gameboardDeterminedViews[0].examBoard as EXAM_BOARD;
                    } else {
                        examBoard = EXAM_BOARD.ALL;
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

    // Replace query params
    useEffect(() => {
        const actualParams = queryString.parse(window.location.search);
        if (stage !== actualParams.stage || (!isPhy && examBoard !== actualParams.examBoard)) {
            try {
                history.replace({
                    ...existingLocation,
                    search: queryString.stringify({
                        ...queryParams,
                        stage,
                        examBoard: isAda ? examBoard : undefined,
                    }, {encode: false})
                });
            } catch (e) {
                // This is to handle the case where the existingLocation pathname is invalid, i.e. "isaacphysics.org//".
                // In that case history.replace(...) throws an exception, and it will do this while the ErrorBoundary is
                // trying to render, causing a loop and a spike in client-side errors.
            }
        }
    }, [stage, examBoard, queryParams.stage, queryParams.examBoard]);

    return {
        stage, examBoard, explanation,
        showOtherContent, preferredProgrammingLanguage, preferredBooleanNotation
    };
}

const _EXAM_BOARD_ITEM_OPTIONS = [ /* best not to export - use getFiltered */
    {label: "AQA", value: EXAM_BOARD.AQA},
    {label: "CIE", value: EXAM_BOARD.CIE},
    {label: "EDEXCEL", value: EXAM_BOARD.EDEXCEL},
    {label: "EDUQAS", value: EXAM_BOARD.EDUQAS},
    {label: "OCR", value: EXAM_BOARD.OCR},
    {label: "WJEC", value: EXAM_BOARD.WJEC},
    {label: "All Exam Boards", value: EXAM_BOARD.ALL},
];
interface ExamBoardFilterOptions {
    byUser?: Immutable<PotentialUser> | null;
    byStages?: STAGE[];
    byUserContexts?: UserContext[];
    includeNullOptions?: boolean;
}
export function getFilteredExamBoardOptions(filter?: ExamBoardFilterOptions) {
    return _EXAM_BOARD_ITEM_OPTIONS
        // by stage
        .filter(i =>
            !isDefined(filter?.byStages) || // ignore if not set
            i.value === EXAM_BOARD.ALL || // none does not get filtered by stage
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
    {label: "Year 7&8", value: STAGE.YEAR_7_AND_8},
    {label: "Year 9", value: STAGE.YEAR_9},
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "Further A", value: STAGE.FURTHER_A},
    {label: "University", value: STAGE.UNIVERSITY},
    {label: "All stages", value: STAGE.ALL},
];
interface StageFilterOptions {
    byUser?: Immutable<PotentialUser> | null;
    byUserContexts?: UserContext[];
    includeNullOptions?: boolean;
    hideFurtherA?: true;
}
export function getFilteredStageOptions(filter?: StageFilterOptions) {
    return _STAGE_ITEM_OPTIONS
        // Restrict by subject stages
        .filter(i => siteSpecific(STAGES_PHY, STAGES_CS).has(i.value))
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
        // Hide further a option for physics
        .filter(i => !filter?.hideFurtherA || i.value !== STAGE.FURTHER_A)
        // Restrict by user contexts
        .filter(i =>
            !filter?.byUserContexts ||
            // if options at stage are exhausted don't offer it
            // - physics
            (isPhy && !filter.byUserContexts.map(uc => uc.stage).includes(i.value)) ||
            // - computer science
            (isAda && !(
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

// Find all combinations of viewing contexts from an audience of the form:
//   {stage: ["a_level", "gcse"], examBoard: ["aqa", "ocr"]}
// so that we have a list of the form: [
//   {stage: "a_level", examBoard: "aqa"},
//   {stage: "a_level", examBoard: "ocr"},
//   {stage: "gcse", examBoard: "aqa"},
//   {stage: "gcse", examBoard: "ocr"},
// ].
// Then, filter possible viewing context by creation context if any is provided.
export function determineAudienceViews(audience?: AudienceContext[], creationContext?: AudienceContext): ViewingContext[] {
    if (audience === undefined) {return [];}

    const allViews: ViewingContext[] = [];
    let viewsFilteredByCreationContext: ViewingContext[]  = [];

    // Create a list of all intended viewing context combinations from the audience
    audience.forEach(audienceContext => {
        allViews.push(...produceAudienceViewingCombinations(audienceContext));
    });

    // Restrict by creation context options, if defined
    if (creationContext) {
        viewsFilteredByCreationContext = allViews.filter(viewingContext => {
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

    const viewsToDisplay = viewsFilteredByCreationContext.length > 0 ? viewsFilteredByCreationContext : allViews;

    return viewsToDisplay.sort((a, b) =>
        comparatorFromOrderedValues(stagesOrdered)(a.stage, b.stage));
}

export const AUDIENCE_DISPLAY_FIELDS: (keyof ViewingContext)[] = siteSpecific(
    ["stage", "difficulty"],
    ["stage"]
);

export function filterAudienceViewsByProperties(views: ViewingContext[], properties: (keyof ViewingContext)[]): ViewingContext[] {
    const filteredViews: ViewingContext[] = [];
    const viewed = new Set();
    views.forEach(v => {
        const displayedValue = properties.map(p => `${v[p]}`).join(" ");
        if (!viewed.has(displayedValue)) {
            filteredViews.push(v);
            viewed.add(displayedValue);
        }
    });
    return filteredViews;
}

export function findAudienceRecordsMatchingPartial(audience: ContentBaseDTO['audience'], partialViewingContext: Partial<ViewingContext>) {
    return audience?.filter((audienceRecord) => {
        return Object.entries(partialViewingContext).every(([key, value]) => audienceRecord[key as keyof AudienceContext]?.[0] === value);
    }) ?? [];
}

export function isIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null): boolean {
    // If no audience is specified, we default to true
    if (!intendedAudience) {
        return true;
    }

    return intendedAudience.some(audienceClause => {
        // If stages are specified do we have any of them in our context
        if (audienceClause.stage) {
            const userStage = userContext.stage;
            const satisfiesStageCriteria = userStage === STAGE.ALL || audienceClause.stage.includes(userStage);
            if (!satisfiesStageCriteria) {
                return false;
            }
        }

        // If exam boards are specified do we have any of them in our context
        if (audienceClause.examBoard) {
            const userExamBoard = userContext.examBoard;
            const satisfiesExamBoardCriteria =
                userExamBoard === EXAM_BOARD.ALL || audienceClause.examBoard.includes(userExamBoard);
            if (!satisfiesExamBoardCriteria) {
                return false;
            }
        }

        // If a role is specified do we have any of those roles or greater
        if (audienceClause.role) {
            const satisfiesRoleCriteria = audienceClause.role.some(role =>
                (role === "logged_in" && isLoggedIn(user)) ||
                (Object.keys(roleRequirements).includes(role.toUpperCase()) && roleRequirements[role.toUpperCase() as UserRole](user))
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

export function notRelevantMessage(userContext: UseUserContextReturnType): string {
    const message = [];
    if (!STAGE_NULL_OPTIONS.has(userContext.stage)) {
        message.push(stageLabelMap[userContext.stage]);
    }
    if (isAda && !EXAM_BOARD_NULL_OPTIONS.has(userContext.examBoard)) {
        message.push(examBoardLabelMap[userContext.examBoard]);
    }
    if (message.length === 0) { // should never happen...
        message.push("your account settings" /* "anyone!" */)
    }
    return `not been marked for ${message.join(" ")}`;
}

export function audienceStyle(audienceString: string): string {
    switch (audienceString) {
        case stageLabelMap.a_level:
            return "stage-label-alevel";
        case stageLabelMap.gcse:
            return "stage-label-gcse";
        default:
            return "stage-label-all";
    }
}

export function stringifyAudience(audience: ContentDTO["audience"], userContext: UseUserContextReturnType): string {
    let stagesSet: Set<Stage>;
    if (!audience) {
        stagesSet = new Set<Stage>([STAGE.ALL]);
    } else {
        stagesSet = new Set<Stage>();
        audience.forEach(audienceRecord => audienceRecord.stage?.forEach(stage => stagesSet.add(stage)));
    }
    // order stages
    const audienceStages = Array.from(stagesSet).sort(comparatorFromOrderedValues(stagesOrdered));
    // if you are one of the options - only show that option
    const stagesFilteredByUserContext = audienceStages.filter(s => userContext.stage === s);
    let stagesToView = stagesFilteredByUserContext.length > 0 ? stagesFilteredByUserContext : audienceStages;
    // If common, could find substrings and report ranges i.e, GCSE to University

    // CS would like to show All stages instead of GCSE & A Level - that will work until we have more stages
    if (isAda && stagesToView.includes(STAGE.GCSE) && stagesToView.includes(STAGE.A_LEVEL)) {
        stagesToView = [STAGE.ALL];
    }

    return stagesToView.map(stage => stageLabelMap[stage]).join(" & ");
}

export function makeIntendedAudienceComparator(user: Immutable<PotentialUser> | null, userContext: UseUserContextReturnType) {
    // Make "relevant" sections appear first
    return function intendedAudienceComparator(sectionA: {audience?: ContentBaseDTO['audience']}, sectionB: {audience?: ContentBaseDTO['audience']}) {
        const isAudienceA = isIntendedAudience(sectionA.audience, userContext, user);
        const isAudienceB = isIntendedAudience(sectionB.audience, userContext, user);
        return isAudienceA === isAudienceB ? 0 : isAudienceB ? 1 : -1;
    }
}
