import {difficultiesOrdered, SortOrder} from "./constants";
import {orderBy} from "lodash";
import tags from "./tags";
import {AudienceContext, ContentSummaryDTO, Difficulty, GameboardDTO, GameboardItem} from "../../IsaacApiTypes";
import {Dispatch, SetStateAction} from "react";
import {ValueType} from "react-select/src/types";
import {ContentSummary, Tag} from "../../IsaacAppTypes";
import {determineAudienceViews} from "./userContext";

const bookSort = (a: string, b: string) => {
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

export const sortQuestions = (sortState: {[s: string]: string}, creationContext?: AudienceContext) => (questions: ContentSummaryDTO[]) => {
    if (sortState["title"] && sortState["title"] != SortOrder.NONE) {
        const sortedQuestions = questions.sort((a, b) => bookSort(a.title || "", b.title || ""));
        return sortState["title"] == SortOrder.ASC ? sortedQuestions : sortedQuestions.reverse();
    }
    if (sortState.difficulty && sortState.difficulty != SortOrder.NONE) {
        questions.sort(function compareFirstDifficulty(a, b) {
            const firstDifficultyA = determineAudienceViews(a.audience, creationContext)[0]?.difficulty;
            const firstDifficultyB = determineAudienceViews(b.audience, creationContext)[0]?.difficulty;
            if (firstDifficultyA === firstDifficultyB) return 0;
            const aIndex = difficultiesOrdered.indexOf(firstDifficultyA as Difficulty)
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

export const convertContentSummaryToGameboardItem = (question: ContentSummary): GameboardItem => {
    const newQuestion = {...question, contentType: question.type};
    delete newQuestion.type;
    delete newQuestion.url;
    return newQuestion;
};

export const convertGameboardItemToContentSummary = (question: GameboardItem): ContentSummaryDTO => {
    return {...question, type: question.contentType};
};

export const convertTagToSelectionOption = (tag: Tag) => {
    return {
        value: tag.id,
        label: `${tag.title}${tag.comingSoonDate ? ` (Coming ${tag.comingSoonDate})`: ""}`,
        isDisabled: !!tag.comingSoonDate,
        isHidden: !!tag.hidden,
    }
};

export const groupTagSelectionsByParent = (parent: Tag) => {
    return {
        label: parent.title,
        options: tags.getChildren(parent.id).map(convertTagToSelectionOption).filter(tag => !tag.isHidden)
    };
};

// TODO REMOVE AUDIENCE_CONTEXT Let's move from multiSelectOnChange and selectOnChange to select.ts.unwrapValue(...) for types and consistency
export const multiSelectOnChange = <T>(setValue: Dispatch<SetStateAction<T[]>>) => (e: ValueType<{value: T; label: string}>) => {
    if (e && Array.isArray(e)) {
        setValue(e.map((item) => item.value));
    } else {
        setValue([]);
    }
};
export const selectOnChange = <T>(setValue: Dispatch<SetStateAction<T[]>>) => (e: ValueType<{value: T; label: string}>) => {
    if (e) {
        const value = (e as {value: T; label: string})?.value;
        if (value) {
            setValue([value]);
        }
    } else {
        setValue([]);
    }
};

export const loadGameboardQuestionOrder = (gameboard: GameboardDTO) => {
    return gameboard.contents && gameboard.contents.map((question) => {
        return question.id;
    }).filter((id) => id) as string[];
};

export const loadGameboardSelectedQuestions = (gameboard: GameboardDTO) => {
    return gameboard.contents && gameboard.contents.map(convertGameboardItemToContentSummary).reduce((map, question) => {
        question.id && map.set(question.id, question);
        return map;
    }, new Map<string, ContentSummary>());
};

export const logEvent = (eventsLog: any[], event: string, params: any) => {
    eventsLog.push({
        event,
        timestamp: new Date().getTime(),
        ...params
    })
};
