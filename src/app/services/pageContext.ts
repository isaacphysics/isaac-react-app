import { ContentBaseDTO, UserContext } from "../../IsaacApiTypes";
import { PageContextState } from "../../IsaacAppTypes";
import { LearningStage, LearningStages, SiteTheme, STAGE_TO_LEARNING_STAGE, Subject, Subjects, TAG_ID } from "./constants";
import { isDefined } from "./miscUtils";
import { useLocation } from "react-router";
import { HUMAN_STAGES, HUMAN_SUBJECTS } from "./constants";
import { pageContextSlice, useAppDispatch } from "../state";
import { useEffect } from "react";

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
export const getUpdatedPageContext = (previousContext: PageContextState | undefined, userContexts: readonly UserContext[] | undefined, doc: ContentBaseDTO | undefined): PageContextState => {
    const newContext = {stage: undefined, subject: undefined} as NonNullable<PageContextState>;

    // if we haven't changed learning stage (GCSE => GCSE), use the learning stage from the old context
    if (previousContext?.stage && doc?.audience?.some(a => a.stage?.map(s => STAGE_TO_LEARNING_STAGE[s]).filter(isDefined).some(s => previousContext.stage?.includes(s)))) {
        newContext.stage = previousContext.stage;
    }
    // if we have changed stage...
    else if (userContexts && doc?.audience) {
        // ...if the user has a registered context for the new stage, use that stage (with precedence for earlier stages in the user context)
        const newStage = userContexts.map(c => c.stage).find(s => doc.audience?.flatMap(a => a.stage).includes(s));
        if (newStage) {
            newContext.stage = isDefined(STAGE_TO_LEARNING_STAGE[newStage]) ? [STAGE_TO_LEARNING_STAGE[newStage] as LearningStage] : undefined;
        }

        // ...if the user has no registered context for that stage, if the question has only one stage, switch to that stage)
        const stages = doc.audience.flatMap(a => a.stage).filter(isDefined).filter((v, i, a) => a.indexOf(v) === i);
        if (stages.length === 1) {
            newContext.stage = isDefined(STAGE_TO_LEARNING_STAGE[stages[0]]) ? [STAGE_TO_LEARNING_STAGE[stages[0]] as LearningStage] : undefined;
        }
    }
    // otherwise we cannot infer a single stage to show (user not logged in OR no registered context for a question with multiple valid stages), so the default of "all" is used
    // (i.e. stage === undefined)


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

function determinePageContextFromUrl(url: string): PageContextState {
    const [subject, stage] = url.split("/").filter(Boolean);
    if (isValidIsaacSubject(subject) && isValidIsaacStage(stage)) {
        return {subject, stage: [stage]};
    }
    return {};
}

/**
 * A hook for updating the page context based on the URL. Only use on pages where the URL is the source of truth for the page context.
 * (i.e. subject-specific pages, like question finders, concept pages, etc.)
 * If you want to get the current page context from redux rather than the URL, use `useAppSelector(selectors.pageContext.context)` instead.
 * @param resetIfNotFound - If true, the page context will be reset if the URL does not contain a valid page context. This should be true on pages with a "neutral" version and a "subject-specific" version.
 * @returns The current page context.
 */
export function useUrlPageTheme(params?: {resetIfNotFound?: boolean}): PageContextState {
    const location = useLocation();
    const dispatch = useAppDispatch();

    useEffect(() => {
        const urlContext = determinePageContextFromUrl(location.pathname);
        if (urlContext?.subject && urlContext?.stage) {
            dispatch(pageContextSlice.actions.updatePageContext({
                subject: urlContext.subject, 
                stage: urlContext.stage
            }));
        } else {
            if (params?.resetIfNotFound) {
                dispatch(pageContextSlice.actions.resetPageContext());
            }
        }
    }, [dispatch, location.pathname]);

    return determinePageContextFromUrl(location.pathname);
}

export function isDefinedContext(context?: PageContextState): context is NonNullable<Required<PageContextState>> {
    return isDefined(context) && isDefined(context.subject) && isDefined(context.stage);
}

export function isSingleStageContext(context?: PageContextState): boolean {
    return isDefinedContext(context) && context.stage.length === 1;
}
