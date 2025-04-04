import React from "react";
import {
    TAG_ID,
    TAG_LEVEL
} from "../../../services";
import classNames from "classnames";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { ChoiceTree, getChoiceTreeLeaves } from "../panels/QuestionFinderFilterPanel";
import { pruneTreeNode } from "../../../services/questionHierarchy";

export type TierID = "subjects" | "fields" | "topics";
export interface Tier {id: TierID; name: string; for: string}

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

export function HierarchyFilterTreeList({tier, index, choices, selections, questionFinderFilter, className, root, setSelections}: HierarchyFilterProps) {  
    return <div className={classNames("ms-3", className)}>
        {choices[tier] && choices[tier][index] && choices[tier][index].map((choice) => {
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

            return <div key={choice.value} className={classNames("ps-2", {"search-field": tier===2, "checkbox-region": isSelected && tier !== 2, "hierarchy-true-root": root && tier === 0})}>
                <div className="d-flex align-items-center">
                    <StyledCheckbox
                        partial
                        color="white"
                        bsSize={root ? "lg" : "sm"}
                        checked={isSelected}
                        onChange={selectValue}
                        label={<span>{choice.label}</span>}
                        className={classNames({"icon-checkbox-off": !isSelected, "icon icon-checkbox-partial-alt": isSelected && !isLeaf, "icon-checkbox-selected": isLeaf})}
                    />
                </div>
                {tier < 2 && choices[tier+1] && choice.value in choices[tier+1] && 
                    <HierarchyFilterTreeList {...{tier: tier+1, index: choice.value, choices, selections, questionFinderFilter, setSelections}}/>
                }
            </div>;
        }
        )}
    </div>;
}
