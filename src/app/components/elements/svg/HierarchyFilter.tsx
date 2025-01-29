import React from "react";
import {
    tags,
    addHexagonKeyPoints,
    DeviceSize,
    ifKeyIsEnter,
    isDefined,
    Item,
    noop,
    selectOnChange,
    svgLine,
    svgMoveTo,
    TAG_ID,
    useDeviceSize, siteSpecific,
    TAG_LEVEL
} from "../../../services";
import {calculateHexagonProportions, Hexagon, HexagonProportions} from "./Hexagon";
import {HexagonConnection} from "./HexagonConnection";
import classNames from "classnames";
import {StyledSelect} from "../inputs/StyledSelect";
import { Label } from "reactstrap";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { ChoiceTree } from "../panels/QuestionFinderFilterPanel";

export type TierID = "subjects" | "fields" | "topics";
export interface Tier {id: TierID; name: string; for: string}

const connectionProperties = {fill: 'none', strokeWidth: 3, strokeDasharray: 3};

interface HierarchySummaryProps {
    tiers: Tier[];
    choices: ChoiceTree[];
    selections: ChoiceTree[];
}

interface HierarchyFilterProps extends HierarchySummaryProps {
    questionFinderFilter?: boolean;
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<ChoiceTree>>;
    tier: number;
    index: TAG_ID | TAG_LEVEL;
}

function naturalLanguageList(list: string[]) {
    if (list.length === 0) return "No";
    const lowerCaseList = [list[0][0] + list[0].slice(1).toLowerCase(), ...list.slice(1).map(l => l.toLowerCase())];
    if (list.length === 1) return lowerCaseList[0];
    const lastIndex = list.length - 1;
    return `${lowerCaseList.slice(0, lastIndex).join(", ")} and ${lowerCaseList[lastIndex]}`;
}

export function HierarchyFilterHexagonal({tier, index, tiers, choices, selections, questionFinderFilter, setTierSelection}: HierarchyFilterProps) {  
    return <div>
        {choices[tier][index] && choices[tier][index].map((choice) => {
            const isSelected = selections[tier][index]?.map(s => s.value).includes(choice.value);
            console.log(tier, index, choice, isSelected, "womaaa")
            function selectValue() {
                if (selections[tier][index]) {
                    setTierSelection(tier)({...selections[tier], [index]: isSelected ? 
                        selections[tier][index].filter(s => s.value !== choice.value) :
                        [...selections[tier][index], choice]});
                }
                else {
                    setTierSelection(tier)({...selections[tier], [index]: [choice]});
                }
            };

            return <div key={choice.value} className={classNames("ps-3 ms-2", {"ms-3": tier===1, "ms-4": tier===2})}>
                <StyledCheckbox
                    color="primary"
                    checked={isSelected}
                    onChange={selectValue}
                    label={<span>{choice.label}</span>}
                />
                {tier < 2 && choices[tier+1] && choice.value in choices[tier+1] && <HierarchyFilterHexagonal {...{tier: tier+1, index: choice.value, tiers, choices, selections, questionFinderFilter, setTierSelection}}/>}
            </div>;
        }
        )}
    </div>;
}

export function HierarchyFilterSummary({tiers, choices, selections}: HierarchySummaryProps) {
    const hexagon = calculateHexagonProportions(10, 2);
    const hexKeyPoints = addHexagonKeyPoints(hexagon);
    const connection = {length: 60};
    const height = `${hexagon.quarterHeight * 4 + hexagon.padding * 2 + 32}px`;

    if (!selections[0]?.length) {
        return <span className="text-muted ms-3 d-inline-block" style={{height}}>
            None Selected
        </span>;
    }

    const selectionSummary = selections.map((tierSelections, i) =>
        tierSelections.length != 1 ? `Multiple ${tiers[i].name}` : `${tierSelections[0].label}`);

    return <svg
        role="img"
        width={`${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * selectionSummary.length}px`}
        height={height}
    >
        <title>
            {`${naturalLanguageList(selectionSummary)} filter${selectionSummary.length != 1 || selections[0]?.length != 1 ? "s" : ""} selected`}
        </title>
        <g id="hexagonal-filter-summary" transform={`translate(1,1)`}>
            {/* Connection & Hexagon */}
            <g transform={`translate(${connection.length / 2 - hexKeyPoints.x.center}, 0)`}>
                {selectionSummary.map((selection, i) => {
                    const yCenter = hexKeyPoints.y.center;
                    const xConnectionStart = hexKeyPoints.x.right + hexagon.padding;
                    return <g key={selection} transform={`translate(${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * i}, 0)`}>
                        {i != selectionSummary.length - 1 && <path
                            {...connectionProperties}
                            d={`${svgMoveTo(xConnectionStart, yCenter)}${svgLine(xConnectionStart+connection.length, yCenter)}`}
                            className={`connection`}
                        />}
                        <Hexagon className={`hex active ${selections[0]?.length ? selections[0][0].value : choices[0][0].value}`} {...hexagon} />
                    </g>;
                })}
            </g>

            {/* Text */}
            {selectionSummary.map((selection, i) => {
                return <g key={selection} transform={`translate(${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * i}, 0)`}>
                    <g transform={`translate(0, ${hexagon.quarterHeight * 4 + hexagon.padding})`}>
                        <foreignObject width={connection.length} height={hexagon.quarterHeight * 5}>
                            <div className={`hexagon-tier-summary text-dark`}>
                                {selection}
                            </div>
                        </foreignObject>
                    </g>
                </g>;
            })}
        </g>
    </svg>;
}

export function HierarchyFilterSelects({tiers, choices, selections, setTierSelection}: HierarchyFilterProps) {
    return <React.Fragment>
        {tiers.map((tier, i) => <React.Fragment key={tier.for}>
            <Label htmlFor={tier.for} className="pt-2 pb-0">{tier.name}: </Label>
            <StyledSelect name={tier.for} onChange={selectOnChange(setTierSelection(i), false)} isMulti options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
