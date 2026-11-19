import {determineAudienceViews, difficultiesOrdered, sortByStringValue, SortOrder, sortStringsNumerically, tags} from "./";
import orderBy from "lodash/orderBy";
import {ContentSummaryDTO, Difficulty, GameboardDTO, GameboardItem} from "../../IsaacApiTypes";
import {GameboardBuilderQuestions, GameboardBuilderQuestionsStackProps, Tag} from "../../IsaacAppTypes";
import { DraggableStateSnapshot } from "@hello-pangea/dnd";

export const sortQuestions = (sortState: {[s: string]: string}) => (questions: ContentSummaryDTO[]) => {
    if (sortState["title"] && sortState["title"] != SortOrder.NONE) {
        const sortedQuestions = questions.sort((a, b) => sortStringsNumerically(a.title || "", b.title || ""));
        return sortState["title"] == SortOrder.ASC ? sortedQuestions : sortedQuestions.reverse();
    }
    if (sortState.difficulty && sortState.difficulty != SortOrder.NONE) {
        questions.sort(function compareFirstDifficulty(a, b) {
            const getIndex = (question: ContentSummaryDTO) => {
                return difficultiesOrdered.indexOf(determineAudienceViews(question.audience)[0]?.difficulty as Difficulty);
            };
            const diff = getIndex(a) - getIndex(b);
            return sortState.difficulty === SortOrder.ASC ? diff : -diff;
        });
        return questions;
    }
    if (sortState.book && sortState.book != SortOrder.NONE) {
        const sortedQuestions = questions.sort(sortByStringValue("subtitle"));
        return sortState.book == SortOrder.ASC ? sortedQuestions : sortedQuestions.reverse();
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

type ContentSummaryFieldsNotInGameboardItem = Exclude<keyof ContentSummaryDTO, keyof GameboardItem>;
export const convertContentSummaryToGameboardItem = (question: ContentSummaryDTO): GameboardItem => {
    // We use the type system to ensure we remove fields that are not in a GameboardItem as it would otherwise cause serialization errors in the backend.
    const fieldsThatMustBeRemoved: {[field in ContentSummaryFieldsNotInGameboardItem]: undefined} = {
        type: undefined,
        difficulty: undefined,
        summary: undefined,
        level: undefined,
        url: undefined,
        className: undefined,
        bookmarked: undefined,
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
    }, new Map<string, ContentSummaryDTO>());
};

export const logEvent = (eventsLog: object[], event: string, params: object) => {
    eventsLog.push({
        event,
        timestamp: new Date().getTime(),
        ...params
    });
};

export interface GameboardBuilderRowInterface {
    isDnd?: boolean;
    snapshot?: DraggableStateSnapshot;
    question: ContentSummaryDTO;
    currentQuestions: GameboardBuilderQuestions;
    undoStack: GameboardBuilderQuestionsStackProps;
    redoStack: GameboardBuilderQuestionsStackProps;
}

export const handleBuilderRowChange = ({ isDnd, question, currentQuestions, undoStack, redoStack }: GameboardBuilderRowInterface) => {
    if (question.id) {
        const newSelectedQuestions = new Map(currentQuestions.selectedQuestions);
        const newQuestionOrder = [...currentQuestions.questionOrder];
        if (newSelectedQuestions.has(question.id)) {
            newSelectedQuestions.delete(question.id);
            newQuestionOrder.splice(newQuestionOrder.indexOf(question.id), 1);
        } else {
            newSelectedQuestions.set(question.id, question);
            newQuestionOrder.push(question.id);
        }
        currentQuestions.setSelectedQuestions(newSelectedQuestions);
        currentQuestions.setQuestionOrder(newQuestionOrder);
        if (isDnd) {
            undoStack.push({questionOrder: currentQuestions.questionOrder, selectedQuestions: currentQuestions.selectedQuestions});
            redoStack.clear();
        }
    }
};
