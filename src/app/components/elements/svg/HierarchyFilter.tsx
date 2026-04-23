import React from "react";
import { SUBJECT_SPECIFIC_CHILDREN_MAP, TAG_ID, TAG_LEVEL, tags } from "../../../services";
import classNames from "classnames";
import { CheckboxWrapper, StyledCheckbox } from "../inputs/StyledCheckbox";
import { ChoiceTree, getChoiceTreeLeaves } from "../panels/QuestionFinderFilterPanel";
import { pruneTreeNode } from "../../../services/questionHierarchy";
import { selectors, useAppSelector } from "../../../state";

export type TierID = "subjects" | "fields" | "topics";
export interface Tier {id: TierID; name: string; for: string}

const disabledSubjectStageTopics: Record<string, Record<string, TAG_ID[]>> = {
    "biology": {
        "gcse": [TAG_ID.biochemistry, TAG_ID.genetics, TAG_ID.physiology, TAG_ID.ecology, TAG_ID.evolution, TAG_ID.bioMathsSkills],
    },
};

const comingSoonSubjectStageTopics: Record<string, Record<string, TAG_ID[]>> = {
    "biology": {
        "gcse": [TAG_ID.biochemistry, TAG_ID.physiology],
    },
};

interface HierarchyFilterProps {
    choices: ChoiceTree[];
    selections: ChoiceTree[];
    questionFinderFilter?: boolean;
    setSelections: (selections: ChoiceTree[]) => void;
    tier: number;
    index: TAG_ID | TAG_LEVEL;
    className?: string;
    root?: boolean;
}

export const HierarchyFilterTreeContents = ({tier, index, choices, selections, questionFinderFilter, root, setSelections}: Omit<HierarchyFilterProps, 'className'>) => {
    const pageContext = useAppSelector(selectors.pageContext.context);

    return <>
        {choices[tier] && choices[tier][index] && choices[tier][index].map((choice, i) => {
            const isSelected = selections[tier] && selections[tier][index]?.map(s => s.value).includes(choice.value);
            const isLeaf = getChoiceTreeLeaves(selections).map(l => l.value).includes(choice.value);
            function selectValue() {
                let newSelections = [...selections];
                if (selections[tier] && selections[tier][index]) {
                    if (isSelected) { // Remove the node from the tree
                        newSelections = pruneTreeNode(newSelections, choice.value);
                    } else { // Add the node to the tree
                        newSelections[tier][index]?.push(choice);
                    }
                }
                else {
                    newSelections[tier] = {...selections[tier], [index]: [choice]};
                }
                setSelections(newSelections);
            };

            const isDisabled = pageContext?.subject && pageContext?.stage?.[0] && disabledSubjectStageTopics[pageContext?.subject]?.[pageContext?.stage?.[0]]?.includes(choice.value);
            const isComingSoon = isDisabled && pageContext?.subject && pageContext?.stage?.[0] && comingSoonSubjectStageTopics[pageContext?.subject]?.[pageContext?.stage?.[0]]?.includes(choice.value);

            return <React.Fragment key={i}>
                {tier === 1 && pageContext?.subject && pageContext?.stage?.length === 1 && SUBJECT_SPECIFIC_CHILDREN_MAP[pageContext.subject][pageContext.stage[0]]?.includes(choice.value) && <div>
                    <p className="ps-3 text-muted small mb-0">
                        {tags.getBaseTagById(choice.value).parent?.toUpperCase()}
                    </p>
                </div>}
                <li key={choice.value}>
                    <CheckboxWrapper active={isSelected && tier !== 2} className={classNames({"search-field": tier===2, "hierarchy-true-root": root && tier === 0, "d-flex": isComingSoon})}>
                        <StyledCheckbox
                            partial
                            color="white"
                            bsSize={root ? "lg" : "sm"}
                            checked={isSelected}
                            onChange={selectValue}
                            label={<span>{choice.label}</span>}
                            className={classNames({"icon-checkbox-off": !isSelected, "icon icon-checkbox-partial-alt": isSelected && !isLeaf, "icon-checkbox-selected": isLeaf})}
                            disabled={isDisabled}
                        />
                        {tier < 2 && choices[tier+1] && choice.value in choices[tier+1] && 
                            <HierarchyFilterTreeList {...{tier: tier+1, index: choice.value, choices, selections, questionFinderFilter, setSelections}}/>
                        }
                        {isComingSoon && <span className="badge bg-theme ms-2 h-min-content align-self-center">Coming soon!</span>}
                    </CheckboxWrapper>
                </li>
            </React.Fragment>;
        }
        )}
    </>;
};

export function HierarchyFilterTreeList({className, ...rest}: HierarchyFilterProps) {  
    return <ul className={classNames("plain-list", className)}>
        <HierarchyFilterTreeContents {...rest} />
    </ul>;
}
