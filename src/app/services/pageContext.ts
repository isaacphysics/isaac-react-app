import { ContentBaseDTO, Stage, UserContext } from "../../IsaacApiTypes";
import { PageContextState } from "../../IsaacAppTypes";
import { LearningStage, LearningStages, PHY_NAV_SUBJECTS, SiteTheme, STAGE, STAGE_TO_LEARNING_STAGE, Subject, Subjects, TAG_ID } from "./constants";
import { isDefined } from "./miscUtils";
import { useLocation } from "react-router";
import { HUMAN_STAGES, HUMAN_SUBJECTS } from "./constants";
import { pageContextSlice, selectors, useAppDispatch, useAppSelector } from "../state";
import { useEffect, useState } from "react";

const filterBySubjects = (tags: (TAG_ID | string)[]): SiteTheme[] => {
    // filtering this const list against the passed-in tags maintains the order (and thus precedence) of the subjects
    return [TAG_ID.physics, TAG_ID.maths, TAG_ID.chemistry, TAG_ID.biology].filter(tag => tags.includes(tag)) as SiteTheme[];
};

/**
 * Gets the subject theme (`"physics" | "maths" | "chemistry" | "biology" | "neutral"`) for a content object from the current page context and tags of that object.
 * 
 * If the tags contain just one subject, that subject will always be returned.
 * If the tags contain multiple subjects, the 'most relevant' subject tag is returned. This is determined by:
 * - If the element is inside a themed context, and the theme is one of the subjects, that theme is returned. This means that if you are in a maths context,
 *   all maths-and-x tags will always be themed as maths.
 * - Otherwise, the subject tag with the highest precedence is returned (`physics > maths > chemistry > biology`).
 * 
 * If no subject tags are found, `"neutral"` is returned as a default.
 * 
 * @param currentTheme - The current page theme. Find via e.g. `useAppSelector(selectors.pageContext.theme)`.
 * @param tags - The content object tags in which to search for a subject.
 * @returns The most relevant theme.
 */
export const getThemeFromContextAndTags = (currentTheme: Subject | undefined, tags: (TAG_ID | string)[]): SiteTheme => {
    const subjectTags = filterBySubjects(tags);

    if (currentTheme && subjectTags.includes(currentTheme)) {
        return currentTheme;
    }

    return subjectTags[0] || "neutral";
};

/**
 * Gets the subject theme (`"physics" | "maths" | "chemistry" | "biology" | "neutral"`) for a content object from its tags.
 * @param tags - The content object tags in which to search for a subject.
 * @returns The most relevant theme.
 */
export const getThemeFromTags = (tags?: (TAG_ID | string)[]): SiteTheme => {
    if (!tags) return "neutral";
    
    const subjectTags = filterBySubjects(tags);
    return subjectTags[0] || "neutral";
};

/**
 * Gets the page context for the current page, based exclusively on the tags of the content. Used e.g. for books.
 * 
 * @param doc - The current page DTO. The tags of this object will be used to determine the new context.
 * @returns The page context state based on the content object tags.
 */
export const useContextFromContentObjectTags = (doc: ContentBaseDTO | undefined): PageContextState => {
    const dispatch = useAppDispatch();
    const tags = doc?.tags || [];

    const newContext = { stage: undefined, subject: undefined, previousContext: undefined } as NonNullable<PageContextState>;

    if (tags.length) {
        newContext.subject = filterBySubjects(tags)[0] as Subject;
    }

    useEffect(() => {
        dispatch(pageContextSlice.actions.updatePageContext(newContext));

        return () => {
            dispatch(pageContextSlice.actions.updatePageContext({
                subject: undefined,
                stage: undefined,
                previousContext: newContext,
            }));
        };
    }
    , [dispatch, doc]);

    return useAppSelector(selectors.pageContext.context);
};

export function determinePageContextFromPreviousPageContext(userContexts: readonly UserContext[] | undefined, previousContext: PageContextState, doc: ContentBaseDTO | undefined): PageContextState {
    const newContext = {stage: undefined, subject: undefined, previousContext} as NonNullable<PageContextState>;

    // if we haven't changed learning stage (GCSE => GCSE), use the learning stage from the old context
    if (previousContext?.stage && doc?.audience?.some(a => a.stage?.map(s => STAGE_TO_LEARNING_STAGE[s]).filter(isDefined).some(s => previousContext.stage?.includes(s)))) {
        newContext.stage = previousContext.stage;
    }

    // if we have changed stage...
    else if (doc?.audience) {
        // ...if the question has only one stage, switch to that stage
        const stages = doc.audience.flatMap(a => a.stage).filter(isDefined).filter((v, i, a) => a.indexOf(v) === i);
        if (stages.length === 1) {
            newContext.stage = isDefined(STAGE_TO_LEARNING_STAGE[stages[0]]) ? [STAGE_TO_LEARNING_STAGE[stages[0]] as LearningStage] : undefined;
        } 
        
        // ...if there is exactly one match between the user's registered contexts and the audience stage(s), use that stage
        else if (userContexts) {
            const stageMatches = userContexts.map(c => c.stage).filter(s => s && stages.includes(s));
            if (stageMatches.length === 1 && stageMatches[0]) {
                newContext.stage = isDefined(STAGE_TO_LEARNING_STAGE[stageMatches[0]]) ? [STAGE_TO_LEARNING_STAGE[stageMatches[0]] as LearningStage] : undefined;
            }
        }
    }
    // otherwise we cannot infer a single stage to show (user not logged in OR no registered context for a question with multiple valid stages
    // OR multiple matches between registered contexts and page audience), so the default of "all" is used (i.e. stage === undefined)


    // repeat the process for subject

    // if we haven't changed subject (Physics => Physics), use the subject from the old context
    if (previousContext?.subject && doc?.tags?.includes(previousContext.subject)) {
        newContext.subject = previousContext.subject;
    } 
    // if we have changed subject, if the question has subject tags, use the subject of highest priority (physics > maths > chemistry > biology)
    else if (doc?.tags) {
        const subjectTags = filterBySubjects(doc.tags);
        if (subjectTags.length) {
            newContext.subject = subjectTags[0] as Subject;
        }
    }
    // otherwise we cannot infer a subject to show, so the default of "neutral" is used

    return newContext;
}

/**
 * Gets the page context for the current page, based on the previous page context, the user's registered contexts, and the audience and tags of the current page.
 * 
 * As a general rule, if the previous context can be maintained, it will be. 
 *   - If the stage hasn't changed (e.g. GCSE => GCSE, even if the question is marked as belonging to other stages too), it will remain at GCSE.
 *     If the stage has changed, if the new stage is relevant to a user context, the context will be displayed in that single stage. 
 *     If the question is only targeted at a single stage, that stage is used. Otherwise, no single stage can be determined, so the default of `"all"` is used.
 *   - If the subject hasn't changed (e.g. Physics => Physics, even if the question is tagged as belonging to other subjects too), it will remain at Physics.
 *     If the subject has changed, the subject with the highest priority will be used. If no subject can be determined, the default of `"neutral"` is used.
 * 
 * @param previousContext - The page context from the previous page, if any.
 * @param userContexts - The user's registered contexts, if logged in and any exist.
 * @param doc - The current page DTO. The audience and tags of this object will be used to determine the new context.
 * @returns The page context for this page.
 */
export const usePreviousPageContext = (userContexts: readonly UserContext[] | undefined, doc: ContentBaseDTO | undefined): PageContextState => {
    const previousContext = useAppSelector(selectors.pageContext.previousContext) as PageContextState;
    const dispatch = useAppDispatch();

    const [previousPageContext, setPreviousPageContext] = useState<PageContextState>(() => (
        {stage: undefined, subject: undefined, previousContext} as NonNullable<PageContextState>)
    );

    useEffect(() => {
        const newContext = determinePageContextFromPreviousPageContext(userContexts, previousContext, doc);
        setPreviousPageContext(newContext);
        dispatch(pageContextSlice.actions.updatePageContext(newContext));

        return () => {
            dispatch(pageContextSlice.actions.updatePageContext({
                subject: undefined,
                stage: undefined,
                previousContext: {subject: newContext?.subject, stage: newContext?.stage},
            }));
        };
    }, [dispatch, doc, previousContext, userContexts]);

    return previousPageContext;
};

/**
 * Gets a human-readable string representing the current page context (e.g. "GCSE Physics").
 * @param pageContext - The current page context.
 * @returns A human-readable string.
 */
export function getHumanContext(pageContext?: PageContextState): string {
    return `${pageContext?.stage && isSingleStageContext(pageContext) ? (HUMAN_STAGES[pageContext.stage[0]] + " ") : ""}${pageContext?.subject ? HUMAN_SUBJECTS[pageContext.subject] : ""}`;
}

function isValidIsaacSubject(subject?: string): subject is Subject {
    return typeof subject === "string" && Subjects.includes(subject as Subject);
}

function isValidIsaacStage(stage?: string): stage is LearningStage {
    return typeof stage === "string" && LearningStages.includes(stage as LearningStage);
}

function determinePageContextFromUrl(url: string): NonNullable<PageContextState> {
    const [subject, stage] = url.split("/").filter(Boolean);

    return {
        subject: isValidIsaacSubject(subject) ? subject : undefined,
        stage: isValidIsaacStage(stage) ? [stage] : [],
    } as NonNullable<PageContextState>;
}

function isDistinctUrlContext(urlContext: PageContextState, reduxContext: PageContextState): boolean {
    return urlContext?.subject !== reduxContext?.subject || urlContext?.stage?.join(",") !== reduxContext?.stage?.join(",");
}

/**
 * A hook for updating the page context based on the URL. Only use on pages where the URL is the source of truth for the page context.
 * (i.e. subject-specific pages, like question finders, concept pages, etc.)
 * If you want to get the current page context from redux rather than the URL, use `useAppSelector(selectors.pageContext.context)` instead.
 * @returns The current page context.
 */
export function useUrlPageTheme(): NonNullable<PageContextState> {
    const location = useLocation();
    const dispatch = useAppDispatch();

    // urlPageTheme mirrors the redux state, but without delay; this is never stale, but redux might be for a couple of renders
    const [urlPageTheme, setUrlPageTheme] = useState<NonNullable<PageContextState>>(determinePageContextFromUrl(location.pathname));

    useEffect(() => {
        const urlContext = determinePageContextFromUrl(location.pathname);
        // only update local state if an actual value has changed, not just because this is a different object
        setUrlPageTheme(pt => isDistinctUrlContext(urlContext, pt) ? urlContext : pt);

        dispatch(pageContextSlice.actions.updatePageContext({
            subject: urlContext?.subject, 
            stage: urlContext?.stage,
            previousContext: {subject: urlContext?.subject, stage: urlContext?.stage},
        }));

        return () => {
            setUrlPageTheme({stage: undefined, subject: undefined});
            dispatch(pageContextSlice.actions.updatePageContext({
                subject: undefined,
                stage: undefined,
                previousContext: {subject: urlContext?.subject, stage: urlContext?.stage},
            }));
        };
    }, [dispatch, location.pathname]);

    return urlPageTheme;
}

export function isDefinedContext(context?: PageContextState): context is NonNullable<PageContextState> {
    return isDefined(context) && (isDefined(context.subject) || isDefined(context.stage));
}

export function isFullyDefinedContext(context?: PageContextState): context is NonNullable<Required<PageContextState>> {
    return isDefined(context) && isDefined(context.subject) && isDefined(context.stage);
}

export function isSingleStageContext(context?: PageContextState): boolean {
    return isFullyDefinedContext(context) && context.stage.length === 1;
}

export function isValidStageSubjectPair(subject: Subject, stage: LearningStage): boolean {
    return (PHY_NAV_SUBJECTS[subject] as readonly LearningStage[]).includes(stage);
}

export function sortStages(stages: Stage[]): Stage[] {
    return stages.toSorted((a, b) => {
        const aIndex = isDefined(a) ? Object.values(STAGE).indexOf(a as STAGE) : -1;
        const bIndex = isDefined(b) ? Object.values(STAGE).indexOf(b as STAGE) : -1;
        return aIndex - bIndex;
    });
}
