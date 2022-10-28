import {ContentDTO, ContentSummaryDTO} from "../../IsaacApiTypes";
import {
    ALL_TOPICS_CRUMB,
    DOCUMENT_TYPE,
    documentTypePathPrefix,
    isIntendedAudience,
    isPhy,
    LinkInfo,
    NOT_FOUND,
    UseUserContextReturnType
} from "./";
import {NOT_FOUND_TYPE, PotentialUser} from "../../IsaacAppTypes";
import {CurrentTopicState} from "../state";
import {Immutable} from "immer";

const filterForConcepts = (contents: ContentSummaryDTO[]) => {
    return contents.filter(content => content.type === DOCUMENT_TYPE.CONCEPT);
};

const filterForQuestions = (contents: ContentSummaryDTO[]) => {
    return contents.filter(content => content.type === DOCUMENT_TYPE.QUESTION);
};

export const filterAndSeparateRelatedContent = (contents: ContentSummaryDTO[], userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null) => {
    const examBoardFilteredContent = contents.filter(c =>
        isPhy ||
        userContext.showOtherContent ||
        isIntendedAudience(c.audience, userContext, user)
    );
    const relatedConcepts = filterForConcepts(examBoardFilteredContent);
    const relatedQuestions = filterForQuestions(examBoardFilteredContent);
    return [relatedConcepts, relatedQuestions];
};

export const getRelatedDocs = (doc: ContentDTO | NOT_FOUND_TYPE | null, userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null) => {
    if (doc && doc != NOT_FOUND && doc.relatedContent) {
        return filterAndSeparateRelatedContent(doc.relatedContent, userContext, user);
    }
    return [[], []];
};

export const getRelatedConcepts = (doc: ContentDTO | NOT_FOUND_TYPE | null, userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null) => {
    return getRelatedDocs(doc, userContext, user)[0];
};

const isValidIdForTopic = (contentId: string, currentTopic: CurrentTopicState) => {
    if (currentTopic && currentTopic != NOT_FOUND && currentTopic.relatedContent) {
        return !!currentTopic.relatedContent.filter((content) => content.id === contentId);
    }
};

export const determineTopicHistory = (currentTopic: CurrentTopicState, currentDocId: string) => {
    const result: LinkInfo[] = [];
    if (currentTopic && currentTopic != NOT_FOUND && currentTopic.id && currentTopic.title && currentTopic.relatedContent) {
        result.push(ALL_TOPICS_CRUMB);
        if (isValidIdForTopic(currentDocId, currentTopic)) {
            result.push({title: currentTopic.title, to: `/topics/${currentTopic.id.slice("topic_summary_".length)}`});
        }
    }
    return result;
};

export const makeAttemptAtTopicHistory = () => {
    return [ALL_TOPICS_CRUMB]
};

export const determineNextTopicContentLink = (currentTopic: CurrentTopicState | undefined, contentId: string, userContext: UseUserContextReturnType, user: Immutable<PotentialUser> | null) => {
    if (currentTopic && currentTopic != NOT_FOUND && currentTopic.relatedContent) {
        if (isValidIdForTopic(contentId, currentTopic)) {
            const [relatedConcepts, relatedQuestions] =
                filterAndSeparateRelatedContent(currentTopic.relatedContent, userContext, user);
            const orderedRelatedContent = relatedConcepts.concat(relatedQuestions);
            const relatedContentIds = orderedRelatedContent.map((content) => content.id);
            const nextIndex = relatedContentIds.indexOf(contentId) + 1;
            if (nextIndex < relatedContentIds.length) {
                const nextContent = orderedRelatedContent[nextIndex];
                return {
                    title: nextContent.title as string,
                    to: `/${documentTypePathPrefix[nextContent.type as DOCUMENT_TYPE]}/${nextContent.id}`
                };
            }
        }
    }
};
