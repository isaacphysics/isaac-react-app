import {determineAudienceViews, difficultiesOrdered, SortOrder, sortStringsNumerically, tags} from "./";
import orderBy from "lodash/orderBy";
import {AudienceContext, ContentSummaryDTO, Difficulty, GameboardDTO, GameboardItem} from "../../IsaacApiTypes";
import {ContentSummary, Tag} from "../../IsaacAppTypes";

export const sortQuestions = (sortState: {[s: string]: string}, creationContext?: AudienceContext) => (questions: ContentSummaryDTO[]) => {
    if (sortState["title"] && sortState["title"] != SortOrder.NONE) {
        const sortedQuestions = questions.sort((a, b) => sortStringsNumerically(a.title || "", b.title || ""));
        return sortState["title"] == SortOrder.ASC ? sortedQuestions : sortedQuestions.reverse();
    }
    if (sortState.difficulty && sortState.difficulty != SortOrder.NONE) {
        questions.sort(function compareFirstDifficulty(a, b) {
            const firstDifficultyA = determineAudienceViews(a.audience, creationContext)[0]?.difficulty;
            const firstDifficultyB = determineAudienceViews(b.audience, creationContext)[0]?.difficulty;
            if (firstDifficultyA === firstDifficultyB) return 0;
            const aIndex = difficultiesOrdered.indexOf(firstDifficultyA as Difficulty);
            const bIndex = difficultiesOrdered.indexOf(firstDifficultyB as Difficulty);
            return (sortState.difficulty === SortOrder.ASC && aIndex > bIndex) ? 1 : -1;
        });
        return questions;
    }
    const keys: string[] = [];
    const order: ("asc" | "desc")[] = [];
    for (const key of Object.keys(sortState)) {
        if (sortState[key] && sortState[key] != SortOrder.NONE) {
            keys.push(key);
            order.push(sortState[key] == SortOrder.ASC ? "asc" : "desc");
        }
    }
    return orderBy(questions, keys, order);
};

type ContentSummaryFieldsNotInGameboardItem = Exclude<keyof ContentSummary, keyof GameboardItem>;
export const convertContentSummaryToGameboardItem = (question: ContentSummary): GameboardItem => {
    // We use the type system to ensure we remove fields that are not in a GameboardItem as it would otherwise cause serialization errors in the backend.
    const fieldsThatMustBeRemoved: {[field in ContentSummaryFieldsNotInGameboardItem]: undefined} = {
        type: undefined,
        difficulty: undefined,
        summary: undefined,
        level: undefined,
        url: undefined,
        deprecated: undefined,
    };
    const newQuestion = {
        ...question,
        state: undefined,
        contentType: question.type,
        ...fieldsThatMustBeRemoved
    };
    return newQuestion;
};

export const convertGameboardItemToContentSummary = (question: GameboardItem): ContentSummaryDTO => {
    return {
        ...question,
        state: undefined,
        type: question.contentType
    };
};

export const convertTagToSelectionOption = (tag: Tag) => {
    return {
        value: tag.id,
        label: `${tag.title}${tag.comingSoonDate ? ` (Coming ${tag.comingSoonDate})`: ""}`,
        isDisabled: !!tag.comingSoonDate,
        isHidden: !!tag.hidden,
    };
};

export const groupTagSelectionsByParent = (parent: Tag) => {
    return {
        label: parent.title,
        options: tags.getChildren(parent.id).map(convertTagToSelectionOption).filter(tag => !tag.isHidden)
    };
};

export const loadGameboardQuestionOrder = (gameboard: GameboardDTO) => {
    return gameboard.contents && gameboard.contents.map((question) => {
        return question.id;
    }).filter((id) => id) as string[];
};

export const loadGameboardSelectedQuestions = (gameboard: GameboardDTO) => {
    return gameboard.contents && gameboard.contents.map(convertGameboardItemToContentSummary).reduce((map, question) => {
        if (question.id) {
            map.set(question.id, question);
        }
        return map;
    }, new Map<string, ContentSummary>());
};

export const logEvent = (eventsLog: any[], event: string, params: any) => {
    eventsLog.push({
        event,
        timestamp: new Date().getTime(),
        ...params
    });
};
