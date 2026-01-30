import {
    comparatorFromOrderedValues,
    CS_EXAM_BOARDS_BY_STAGE,
    EXAM_BOARD,
    EXAM_BOARD_DEFAULT_OPTION,
    EXAM_BOARD_NULL_OPTIONS,
    examBoardLabelMap,
    isAda,
    isDefined,
    isFullyDefinedContext,
    isLoggedIn,
    isPhy,
    isSingleStageContext,
    LEARNING_STAGE_TO_STAGES,
    roleRequirements,
    siteSpecific,
    STAGE,
    STAGE_NULL_OPTIONS,
    stageLabelMap,
    STAGES_CS,
    stagesOrdered,
    useQueryParams,
} from ".";
import {
    AudienceContext,
    ContentBaseDTO,
    ContentDTO,
    UserRole,
    Stage,
    UserContext,
    GameboardItem
} from "../../IsaacApiTypes";
import {useParams} from "react-router-dom";
import {
    AppState,
    transientUserContextSlice,
    TransientUserContextState,
    useAppDispatch,
    useAppSelector
} from "../state";
import {DisplaySettings, GameboardContext, PageContextState, PotentialUser, ViewingContext} from "../../IsaacAppTypes";
import {useContext, useEffect, useState} from "react";
import {Immutable} from "immer";

export interface UseUserContextReturnType {
    contexts: UserContext[];
    setStage: (stage: STAGE) => void;
    setExamBoard: (stage: EXAM_BOARD) => void;
    isFixedContext: boolean;
    setFixedContext: (isFixedContext: boolean) => void;
    explanation: {stage: CONTEXT_SOURCE, examBoard: CONTEXT_SOURCE};
    hasDefaultPreferences: boolean;
}

export interface GameboardAndPathInfo {
    boardIdFromDTO?: string;
    contentsFromDTO?: GameboardItem[];
    boardIdFromQueryParams?: string;
    questionIdFromPath?: string;
}

export enum CONTEXT_SOURCE {
    TRANSIENT = "TRANSIENT",
    REGISTERED = "REGISTERED",
    GAMEBOARD = "GAMEBOARD",
    PAGE_CONTEXT = "PAGE_CONTEXT",
    DEFAULT = "DEFAULT",
    NOT_IMPLEMENTED = "NOT_IMPLEMENTED"
}

interface ContextProperties {
    contexts: UserContext[];
    isFixedContext: boolean;
    hasDefaultPreferences: boolean;
    explanation: { stage: CONTEXT_SOURCE, examBoard: CONTEXT_SOURCE };
}

export function useUserViewingContext(): UseUserContextReturnType {
    const dispatch = useAppDispatch();
    const queryParams = useQueryParams(true);
    const [contextProps, setContextProps] = useState<ContextProperties>({ contexts: [{stage: STAGE.ALL, examBoard: EXAM_BOARD_DEFAULT_OPTION}], isFixedContext: false, hasDefaultPreferences: false, explanation: { stage: CONTEXT_SOURCE.DEFAULT, examBoard: CONTEXT_SOURCE.DEFAULT } });

    const user = useAppSelector((state: AppState) => state && state.user);
    const { DISPLAY_SETTING: displaySettings } = useAppSelector((state: AppState) => state?.userPreferences) || {};
    const {questionId} = useParams<{ questionId: string}>();

    const registeredContexts = isLoggedIn(user) ? user.registeredContexts as UserContext[] : undefined;
    const transientUserContext = useAppSelector((state: AppState) => state?.transientUserContext);

    const { id, contents} = useContext(GameboardContext) || {};

    const setStage = (stage: STAGE) => dispatch(transientUserContextSlice?.actions.setStage(stage));
    const setExamBoard = (examBoard: EXAM_BOARD) => dispatch(transientUserContextSlice?.actions.setExamBoard(examBoard));
    const setFixedContext = (isFixedContext: boolean) => dispatch(transientUserContextSlice?.actions.setFixedContext(isFixedContext));

    useEffect(() => {
        const gameboardAndPathInfo = { boardIdFromDTO: id, contentsFromDTO: contents,  boardIdFromQueryParams: queryParams.board, questionIdFromPath: questionId };
        const newContextProps = calculateNewUserContext(transientUserContext || {}, registeredContexts, gameboardAndPathInfo, displaySettings);
        setContextProps(newContextProps);
    }, [transientUserContext, registeredContexts, displaySettings, id, contents, queryParams.board, questionId]);

    return { ...contextProps, setStage, setExamBoard, setFixedContext };
}

export const calculateNewUserContext = (transientUserContext: TransientUserContextState, registeredContexts: UserContext[] | undefined,
    gameboardAndPathInfo: GameboardAndPathInfo | undefined, displaySettings: DisplaySettings | undefined) : ContextProperties => {
    
    const contexts: UserContext[] = [];
    let stage: STAGE = STAGE.ALL;
    let examBoard: EXAM_BOARD = EXAM_BOARD_DEFAULT_OPTION;
    const explanation: UseUserContextReturnType["explanation"] = {stage: CONTEXT_SOURCE.DEFAULT, examBoard: siteSpecific(CONTEXT_SOURCE.NOT_IMPLEMENTED, CONTEXT_SOURCE.DEFAULT)};

    if (gameboardAndPathInfo?.questionIdFromPath && gameboardAndPathInfo?.boardIdFromQueryParams
        && gameboardAndPathInfo.boardIdFromDTO === gameboardAndPathInfo.boardIdFromQueryParams) {
        // Gameboard context is active
        const gameboardItem = gameboardAndPathInfo.contentsFromDTO?.filter(c => c.id === gameboardAndPathInfo.questionIdFromPath)[0];
        if (gameboardItem) {
            const gameboardDeterminedViews = determineAudienceViews(gameboardItem.audience, gameboardItem.creationContext);
            if (gameboardDeterminedViews.length > 0) {
                explanation.stage = CONTEXT_SOURCE.GAMEBOARD;
                if (gameboardDeterminedViews.length === 1) {
                    stage = gameboardDeterminedViews[0].stage as STAGE;
                }
                if (isAda) {
                    explanation.examBoard = CONTEXT_SOURCE.GAMEBOARD;
                    if (gameboardDeterminedViews.length === 1) {
                        examBoard = gameboardDeterminedViews[0].examBoard as EXAM_BOARD;
                    }
                }
            }
        }
        contexts.push({stage, examBoard});
    } else if (transientUserContext && (transientUserContext.stage || transientUserContext.examBoard)) {
        // Transient context is active
        if (transientUserContext.stage) {
            stage = transientUserContext.stage;
            explanation.stage = CONTEXT_SOURCE.TRANSIENT;
        }
        if (isAda && transientUserContext.examBoard) {
            examBoard = transientUserContext.examBoard;
            explanation.examBoard = CONTEXT_SOURCE.TRANSIENT;
        }
        contexts.push({stage, examBoard});
    } else if (registeredContexts?.length) {
        // Registered context is active
        explanation.stage = CONTEXT_SOURCE.REGISTERED;
        if (isAda){
            // Registered contexts on Ada will define both stage and exam board
            explanation.examBoard = CONTEXT_SOURCE.REGISTERED;
        }
        // Registered contexts on phy don't have exam boards, so augment with ALL here
        const registeredContextsWithExamBoards = isPhy ? registeredContexts.map(rc => ({stage: rc.stage, examBoard: EXAM_BOARD.ALL})) : registeredContexts;
        contexts.push(...registeredContextsWithExamBoards);
    } else {
        // Use default context
        contexts.push({stage, examBoard});
    }

    const hasDefaultPreferences = isAda && contexts.length === 1 && contexts[0].stage === STAGE.ALL && contexts[0].examBoard === EXAM_BOARD.ADA;
    const isFixedContext = !!transientUserContext?.isFixedContext;

    if (isFixedContext) {
        explanation.stage = CONTEXT_SOURCE.PAGE_CONTEXT;
    }

    return { contexts, isFixedContext, hasDefaultPreferences, explanation };
};

const _EXAM_BOARD_ITEM_OPTIONS = [ /* best not to export - use getFiltered */
    {label: "All Exam Boards", value: EXAM_BOARD.ALL},
    {label: "Ada CS (Default)", value: EXAM_BOARD.ADA},
    {label: "AQA", value: EXAM_BOARD.AQA},
    {label: "CIE", value: EXAM_BOARD.CIE},
    {label: "Edexcel", value: EXAM_BOARD.EDEXCEL},
    {label: "Eduqas", value: EXAM_BOARD.EDUQAS},
    {label: "OCR", value: EXAM_BOARD.OCR},
    {label: "WJEC", value: EXAM_BOARD.WJEC},
    {label: "SQA", value: EXAM_BOARD.SQA},
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
            filter?.byStages.some(s => STAGE_NULL_OPTIONS.includes(s)) || // none in the stage level allows for all exam boards
            (STAGES_CS.some(s => filter?.byStages?.includes(s) && CS_EXAM_BOARDS_BY_STAGE[s].includes(i.value)))
        )
        // includeNullOptions flag
        .filter(i => filter?.includeNullOptions || !EXAM_BOARD_NULL_OPTIONS.includes(i.value))
        // by user account settings
        .filter(i =>
            // skip if null or logged out user
            !isLoggedIn(filter?.byUser) ||
            // user has a null option selected
            filter?.byUser.registeredContexts
                ?.filter(rc => !filter.byStages || filter.byStages.length === 0 || filter.byStages.includes(rc.stage as STAGE) || STAGE_NULL_OPTIONS.includes(rc.stage as STAGE))
                .some(rc => EXAM_BOARD_NULL_OPTIONS.includes(rc.examBoard as EXAM_BOARD)) ||
            // stage is one of registered context selections
            filter?.byUser.registeredContexts
                ?.filter(rc => !filter.byStages || filter.byStages.length === 0 || filter.byStages.includes(rc.stage as STAGE) || STAGE_NULL_OPTIONS.includes(rc.stage as STAGE))
                .map(rc => rc.examBoard).includes(i.value)
        )
        // Restrict by existing user context selections
        .filter(i =>
            !isDefined(filter?.byUserContexts) ||
            !filter?.byUserContexts
                .filter(uc => !filter.byStages || filter.byStages.includes(uc.stage as STAGE))
                .map(uc => uc.examBoard).includes(i.value));
}

const _STAGE_ITEM_OPTIONS = siteSpecific([ /* best not to export - use getFiltered */
    {label: "Year 7&8", value: STAGE.YEAR_7_AND_8},
    {label: "Year 9", value: STAGE.YEAR_9},
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "Further A", value: STAGE.FURTHER_A},
    {label: "University", value: STAGE.UNIVERSITY},
    {label: "All stages", value: STAGE.ALL},
], [
    {label: "All Stages (Default)", value: STAGE.ALL},
    {label: "Core", value: STAGE.CORE},
    {label: "Advanced", value: STAGE.ADVANCED},
    {label: "Post-18", value: STAGE.POST_18},
    {label: "GCSE", value: STAGE.GCSE},
    {label: "A Level", value: STAGE.A_LEVEL},
    {label: "National 5", value: STAGE.SCOTLAND_NATIONAL_5},
    {label: "Higher", value: STAGE.SCOTLAND_HIGHER},
    {label: "Advanced Higher", value: STAGE.SCOTLAND_ADVANCED_HIGHER},
]);
interface StageFilterOptions {
    byUser?: Immutable<PotentialUser> | null;
    byUserContexts?: UserContext[];
    includeNullOptions?: boolean;
    hideFurtherA?: true;
    nullFirst?: boolean;
}
export function getFilteredStageOptions(filter?: StageFilterOptions) {
    return _STAGE_ITEM_OPTIONS
        // Restrict by includeNullOptions flag
        .filter(i => filter?.includeNullOptions || filter?.nullFirst || !STAGE_NULL_OPTIONS.includes(i.value))
        // Restrict by account settings
        .filter(i =>
            // skip if null or logged out user
            !isLoggedIn(filter?.byUser) ||
            // user has a null option selected
            filter?.byUser.registeredContexts?.some(rc => STAGE_NULL_OPTIONS.includes(rc.stage as STAGE)) ||
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
                filter.byUserContexts.some(uc => uc.stage === i.value && EXAM_BOARD_NULL_OPTIONS.includes(uc.examBoard as EXAM_BOARD)) ||
                // every exam board has been recorded for the stage
                getFilteredExamBoardOptions({byUser: filter.byUser, byStages: [i.value], byUserContexts: filter.byUserContexts}).length === 0
            ))
        ).sort((a, b) => filter?.nullFirst ? (-STAGE_NULL_OPTIONS.includes(a.value) + -STAGE_NULL_OPTIONS.includes(b.value)) : 0);
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

    // Set all Ada audience contexts to the same difficulty level, if not already
    if (isAda) {
        const questionDifficulty = audience.find(audienceContext => audienceContext.difficulty != undefined)?.difficulty;
        audience = audience.map(audienceContext => { return {...audienceContext, difficulty: questionDifficulty}; });
    }

    // Create a list of all intended viewing context combinations from the audience
    audience.forEach(audienceContext => {
        allViews.push(...produceAudienceViewingCombinations(audienceContext));
    });

    // Restrict by creation context options, if defined
    if (creationContext) {
        viewsFilteredByCreationContext = allViews.filter(viewingContext => {
            let viableView = true;
            if (creationContext.stage && viewingContext.stage) {
                viableView = creationContext.stage.includes(viewingContext.stage);
            }
            if (creationContext.examBoard && viewingContext.examBoard) {
                viableView = viableView && creationContext.examBoard.includes(viewingContext.examBoard);
            }
            if (creationContext.difficulty && viewingContext.difficulty) {
                viableView = viableView && creationContext.difficulty.includes(viewingContext.difficulty);
            }
            return viableView;
        });
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

export function isRelevantToPageContext(intendedAudience: ContentBaseDTO['audience'], pageContext: PageContextState) {
    return isFullyDefinedContext(pageContext) && !!intendedAudience?.some(audience => 
        audience.stage?.some(auStage => 
            pageContext.stage.some(pcStage => 
                LEARNING_STAGE_TO_STAGES[pcStage].includes(auStage as STAGE)
            )
        )
    );
}

export function isRelevantPageContextOrIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null, pageContext: PageContextState) {
    
    // if we are in a subject-stage-specific route, this is only relevant if there is some overlap between that route and the content object; we ignore the user entirely.
    if (isFullyDefinedContext(pageContext) && isSingleStageContext(pageContext)) {
        return isRelevantToPageContext(intendedAudience, pageContext);
    }

    // otherwise, check the user context against the intended audience as normal
    return isIntendedAudience(intendedAudience, userContext, user);
}

export function isIntendedAudience(intendedAudience: ContentBaseDTO['audience'], userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null): boolean {
    // If no audience is specified, we default to true
    if (!intendedAudience) {
        return true;
    }

    return intendedAudience.some(audienceClause => {
        // If stages are specified do we have any of them in our context
        if (audienceClause.stage) {
            const userStages = userContext.contexts.map(c => c.stage);
            if (isPhy && userStages.includes(STAGE.A_LEVEL)) {
                userStages.push(STAGE.FURTHER_A);
            }
            const satisfiesStageCriteria = userStages.includes(STAGE.ALL) || userStages.some(s => s && audienceClause.stage?.includes(s));
            if (!satisfiesStageCriteria) {
                return false;
            }
        }

        // If exam boards are specified do we have any of them in our context
        if (audienceClause.examBoard) {
            const userExamBoards = userContext.contexts.map(c => c.examBoard);
            const satisfiesExamBoardCriteria =
                userExamBoards.includes(EXAM_BOARD.ALL) || userExamBoards.some(b => b && audienceClause.examBoard?.includes(b));
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
    if (userContext.contexts.length === 1) {
        const userStage = userContext.contexts[0].stage;
        if (userStage && !STAGE_NULL_OPTIONS.includes(userStage as STAGE)) {
            message.push(stageLabelMap[userStage]);
        }
        const userExamBoard = userContext.contexts[0].examBoard;
        if (isAda && userExamBoard && !EXAM_BOARD_NULL_OPTIONS.includes(userExamBoard as EXAM_BOARD)) {
            message.push(examBoardLabelMap[userExamBoard]);
        }
    }
    else {
        message.push("your account settings");
    }
    return `not been marked for ${message.join(" ")}`;
}

export function audienceStyle(audienceString: string): string {
    const audienceStages = audienceString.split('\n').flatMap(line => line.split(', '));

    // Convert to css labels
    const stageLabels = audienceStages.map(
        stage => {switch (stage) {
            case stageLabelMap.core:
            case stageLabelMap.gcse:
            case stageLabelMap.scotland_national_5:
                return "stage-label-core";

            case stageLabelMap.advanced:
            case stageLabelMap.a_level:
            case stageLabelMap.scotland_advanced_higher:
                return "stage-label-advanced";

            case stageLabelMap.post_18:
            case stageLabelMap.scotland_higher:
                return "stage-label-higher";

            default:
                return "stage-label-all";
        }}
    );
    const uniqueLabels = audienceStages.length === 1
        ? new Set(stageLabels)
        // If multiple stages are present group into "advanced" and "core"
        : new Set(stageLabels.map(v => v === "stage-label-higher" ? "stage-label-advanced" : v));

    // If only one group exists use that colour, otherwise, use the mixed colour
    return uniqueLabels.size === 1 ? uniqueLabels.values().next().value as string : "stage-label-all";
}

export function stringifyAudience(audience: ContentDTO["audience"], userContext: UseUserContextReturnType, intendedAudience: boolean): string {
    let stagesSet: Set<Stage>;
    if (!audience) {
        stagesSet = new Set<Stage>([STAGE.ALL]);
    } else {
        stagesSet = new Set<Stage>();
        audience.forEach(audienceRecord => audienceRecord.stage?.forEach(stage => stagesSet.add(stage)));
    }
    // order stages
    const audienceStages = Array.from(stagesSet).sort(comparatorFromOrderedValues(stagesOrdered));
    const stagesFilteredByUserContext = audienceStages.filter(s => userContext.contexts.some(c => c.stage == s));
    let stagesToView: Stage[] = [];

    if (isAda) {
        // Ada currently (subject to change) want to show the stages as 3 groups:
        // - GCSE & A Level
        // - National 5 & Higher
        // - Advanced Higher
        // with intra-group separation by commas, inter-group separation by newlines

        const adaStages = [STAGE.CORE, STAGE.ADVANCED, STAGE.POST_18];
        const adaAudienceStages = audienceStages.filter(s => adaStages.includes(s as STAGE));

        stagesToView = userContext.hasDefaultPreferences || !intendedAudience
            ? adaAudienceStages
            : stagesFilteredByUserContext.length > 0
                ? stagesFilteredByUserContext
                // only show Ada exam board stages intentionally
                : audienceStages.filter(s => !adaStages.includes(s as STAGE));

        const result = stagesToView.reduce((acc, label) => {
            if ([STAGE.GCSE, STAGE.A_LEVEL].includes(label as STAGE)) {
                acc[0].push(label);
            } else if ([STAGE.SCOTLAND_NATIONAL_5, STAGE.SCOTLAND_HIGHER].includes(label as STAGE)) {
                acc[1].push(label);
            } else if ([STAGE.SCOTLAND_ADVANCED_HIGHER].includes(label as STAGE)) {
                acc[2].push(label);
            } else if (adaStages.includes(label as STAGE)) {
                acc[3].push(label);
            }
            return acc;
        }, [[], [], [], []] as Stage[][]);

        // FIXME: use result.findLastIndex when supported
        // const lastNonEmptyIndex = result.findLastIndex((labels) => labels.length > 0);
        const reversed = result.slice().reverse();
        const lastNonEmptyIndex = (result.length - 1) - reversed.findIndex(((labels) => labels.length > 0));

        return result.reduce((acc, labels, index) => {
            if (labels.length === 0) return acc;
            let labelStrings = labels.map((label) => stageLabelMap[label]).join(", ");
            // do not include a newline after the last group
            labelStrings += (index < lastNonEmptyIndex ? "\n" : "");
            return acc + labelStrings;
        }, "");
    }

    // if you are one of the options - only show that option
    stagesToView = stagesFilteredByUserContext.length > 0 ? stagesFilteredByUserContext : audienceStages;
    return stagesToView.map(stage => stageLabelMap[stage]).join(" & ");
}

export function makeIntendedAudienceComparator(user: Immutable<PotentialUser> | null, userContext: UseUserContextReturnType) {
    // Make "relevant" sections appear first
    return function intendedAudienceComparator(sectionA: {audience?: ContentBaseDTO['audience']}, sectionB: {audience?: ContentBaseDTO['audience']}) {
        const isAudienceA = isIntendedAudience(sectionA.audience, userContext, user);
        const isAudienceB = isIntendedAudience(sectionB.audience, userContext, user);
        return isAudienceA === isAudienceB ? 0 : isAudienceB ? 1 : -1;
    };
}
