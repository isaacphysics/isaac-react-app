import {ContentSummaryDTO} from "../../IsaacApiTypes";
import {DOCUMENT_TYPE, documentTypePathPrefix, EXAM_BOARD, examBoardTagMap} from "./constants";
import {CurrentTopicState} from "../state/reducers";
import {LinkInfo} from "../../IsaacAppTypes";


const filterOnExamBoard = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    return contents.filter(content => content.tags && content.tags.includes(examBoardTagMap[examBoard]));
};

const filterForConcepts = (contents: ContentSummaryDTO[]) => {
    return contents.filter(content => content.type === DOCUMENT_TYPE.CONCEPT);
};

const filterForQuestions = (contents: ContentSummaryDTO[]) => {
    return contents.filter(content => content.type === DOCUMENT_TYPE.QUESTION);
};

export const filterAndSeparateRelatedContent = (contents: ContentSummaryDTO[], examBoard: EXAM_BOARD) => {
    const examBoardFilteredContent = filterOnExamBoard(contents, examBoard);
    const relatedConcepts = examBoardFilteredContent && filterForConcepts(examBoardFilteredContent);
    const relatedQuestions = examBoardFilteredContent && filterForQuestions(examBoardFilteredContent);
    return [relatedConcepts, relatedQuestions];
};

export const idIsPresent = (id: string, contents: {id?: string}[] | undefined) => {
    return contents && !!contents.filter((content) => content.id === id);
};

export const determineTopicHistory = (currentTopic: CurrentTopicState) => {
    const result: LinkInfo[] = [];
    if (currentTopic && currentTopic.id && currentTopic.title) {
        result.push({title: "All topics", to: "/topics"});
        result.push({title: currentTopic.title, to: `/topics/${currentTopic.id.slice("topic_summary_".length)}`})
    }
    return result;
};

export const determineNextTopicContentLink = (currentTopic: CurrentTopicState, contentId: string, examBoard: EXAM_BOARD) => {
    if (currentTopic && currentTopic.relatedContent) {
        const [relatedConcepts, relatedQuestions] = filterAndSeparateRelatedContent(currentTopic.relatedContent, examBoard);
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
};
