import { GroupBase } from "react-select";
import { Item } from "./select";
import { isPhy } from "./siteConstants";
import { ChoiceTree } from "../components/elements/panels/QuestionFinderFilterPanel";
import { itemiseTag } from "./filter";
import { tags } from "./tags";
import { SUBJECT_SPECIFIC_CHILDREN_MAP, TAG_ID, TAG_LEVEL } from "./constants";
import { PageContextState } from "../../IsaacAppTypes";

export const sublistDelimiter = " >>> ";

type OpenListsState = TopLevelListsState & {
    [sublistId: string]: {state: boolean, subList: boolean}
};
type ListStateActions = {type: "toggle", id: string, focus: boolean}
    | {type: "expandAll", expand: boolean};

export type TopLevelListsState = {
    stage: {state: boolean, subList: boolean},
    examBoard: {state: boolean, subList: boolean},
    topics: {state: boolean, subList: boolean},
    difficulty: {state: boolean, subList: boolean},
    books: {state: boolean, subList: boolean},
    questionStatus: {state: boolean, subList: boolean},
};

export function listStateReducer(state: OpenListsState, action: ListStateActions): OpenListsState {
    switch (action.type) {
        case "toggle":
            return action.focus
                ? Object.fromEntries(Object.keys(state).map(
                    (title) => [
                        title,
                        {
                            // Close all lists except this one
                            state: action.id === title && !(state[action.id]?.state)
                            // But if this is a sublist don't change top-level lists
                            || (state[action.id]?.subList
                                && !(state[title]?.subList)
                                && state[title]?.state),
                            subList: state[title]?.subList
                        }
                    ])
                ) as OpenListsState
                : {...state, [action.id]: {
                    state: !(state[action.id]?.state),
                    subList: state[action.id]?.subList
                }};
        case "expandAll":
            return Object.fromEntries(Object.keys(state).map(
                (title) => [
                    title,
                    {
                        state: action.expand && !(state[title]?.subList),
                        subList: state[title]?.subList
                    }
                ])) as OpenListsState;
        default:
            return state;
    }
}

export function initialiseListState(tags: GroupBase<Item<string>>[]): OpenListsState {
    const subListState = Object.fromEntries(
        tags.filter(tag => tag.label)
            .map(tag => [
                `topics ${sublistDelimiter} ${tag.label}`,
                {state: false, subList: true}
            ])
    );
    return {
        ...subListState,
        stage: {state: true, subList: false},
        examBoard: {state: false, subList: false},
        topics: {state: isPhy, subList: false},
        difficulty: {state: false, subList: false},
        books: {state: false, subList: false},
        questionStatus: {state: false, subList: false}
    };
}

export const updateTopicChoices = (
    topicSelections: Partial<Record<TAG_ID | TAG_LEVEL, Item<TAG_ID>[]>>[],
    pageContext?: PageContextState,
    allowedTags?: TAG_ID[]
): ChoiceTree[] => {
    const subject = pageContext?.subject ? [tags.getById(pageContext?.subject as TAG_ID)] : tags.allSubjectTags; 
    const choices: ChoiceTree[] = [ { subject: subject.map(itemiseTag) } ];

    for (let tierIndex = 0; tierIndex < topicSelections.length && tierIndex < 2; tierIndex++) {
        if (Object.keys(topicSelections[tierIndex]).length > 0) {
            choices[tierIndex+1] = {};
            for (const v of Object.values(topicSelections[tierIndex])) {
                for (const v2 of v) {
                    choices[tierIndex+1][v2.value] = tags.getChildren(v2.value).map(itemiseTag);
                }
            }
        }
    }
    if (choices.length > 1 && pageContext?.subject && pageContext.stage?.length === 1) {
        SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext?.subject][pageContext.stage[0]]?.forEach(tag => 
            pageContext.subject ? choices[1][pageContext?.subject]?.push(itemiseTag(tags.getById(tag))) : null
        );
    }
    if (allowedTags) {
        return choices.map(c => filterChoice(c, allowedTags));
    }
    return choices;
};

function filterChoice(c: ChoiceTree, t: TAG_ID[]): ChoiceTree; 
function filterChoice(c: Item<TAG_ID>[], t: TAG_ID[]): Item<TAG_ID>[];
function filterChoice(choice: ChoiceTree | Item<TAG_ID>[], allowedTags: TAG_ID[] ): ChoiceTree | Item<TAG_ID>[] {  
    if (Array.isArray(choice)) {
        return choice.filter((tag => allowedTags.includes(tag.value)));
    }
    return Object.fromEntries(
        Object.entries(choice).map(([key, value]) => [key, filterChoice(value, allowedTags)])
    );
};
