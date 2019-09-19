import {SortOrder, tagExamboardMap} from "./constants";
import {orderBy} from "lodash";
import {getDescendents, Tag} from "./tags";
import {ContentSummaryDTO, GameboardDTO, GameboardItem} from "../../IsaacApiTypes";

export const sortQuestions = (sortState: { [s: string]: string }) => (questions: ContentSummaryDTO[]) => {
    if (sortState["title"] && sortState["title"] != SortOrder.NONE) {
        const sortedQuestions = questions.sort((a, b) => bookSort(a.title || "", b.title || ""));
        return sortState["title"] == SortOrder.ASC ? sortedQuestions : sortedQuestions.reverse();
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

export const bookSort = (a: string, b: string) => {
    const splitRegex = /(\d+)/;
    const sectionsA = a.split(splitRegex).filter((x) => x != "." && x != "");
    const sectionsB = b.split(splitRegex).filter((x) => x != "." && x != "");

    for (let i = 0; i < Math.min(sectionsA.length, sectionsB.length); i++) {
        const isNumberA = sectionsA[i].search(/\d/) != -1;
        const isNumberB = sectionsB[i].search(/\d/) != -1;

        if (isNumberA && isNumberB) {
            const numbersA = sectionsA[i].split(/\./).map((x) => parseInt(x));
            const numbersB = sectionsB[i].split(/\./).map((x) => parseInt(x));

            for (let j = 0; j < Math.min(numbersA.length, numbersB.length); j++) {
                const comparison = numbersA[j] - numbersB[j];
                if (comparison) {
                    return comparison;
                }
            }

            if (numbersA.length != numbersB.length) {
                return numbersB.length - numbersA.length;
            }
        } else if (!isNumberA && !isNumberB) {
            const comparison = sectionsA[i].localeCompare(sectionsB[i]);
            if (comparison) {
                return comparison;
            }
        } else {
            return isNumberA ? 1 : -1;
        }
    }
    return sectionsB.length - sectionsA.length;
};

export const convertContentSummaryToGameboardItem = (question: ContentSummaryDTO) => {
    const newQuestion = {...question};
    delete newQuestion.type;
    delete newQuestion.url;

    const gameboardItem = newQuestion as GameboardItem;
    gameboardItem.level = newQuestion.level ? parseInt(newQuestion.level) : 0;
    return gameboardItem;
};

export const convertGameboardItemToContentSummary = (question: GameboardItem) => {
    const newQuestion = {...question};
    const contentSummary = newQuestion as ContentSummaryDTO;
    contentSummary.level = contentSummary.level && contentSummary.level.toString();
    return contentSummary;
};

export const convertTagToSelectionOption = (tag: Tag) => {
    return {
        value: tag.id,
        label: tag.title
    }
};

export const groupTagSelectionsByParent = (parent: Tag) => {
    return {
        label: parent.title,
        options: getDescendents(parent.id).map(convertTagToSelectionOption)
    };
};

export const convertExamBoardToOption = (examBoard: string) => {
    return {value: examBoard, label: tagExamboardMap[examBoard]};
};

export const loadGameboardQuestionOrder = (gameboard: GameboardDTO) => {
    return gameboard.questions && gameboard.questions.map((question) => {
        return question.id;
    }).filter((id) => id) as string[];
};

export const loadGameboardSelectedQuestions = (gameboard: GameboardDTO) => {
    return gameboard.questions && gameboard.questions.map(convertGameboardItemToContentSummary).reduce((map, question) => {
        question.id && map.set(question.id, question);
        return map;
    }, new Map<string, ContentSummaryDTO>());
};
