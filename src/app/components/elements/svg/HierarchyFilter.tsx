import React from "react";
import * as RS from "reactstrap";
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
    useDeviceSize, siteSpecific
} from "../../../services";
import {calculateHexagonProportions, Hexagon, HexagonProportions} from "./Hexagon";
import {HexagonConnection} from "./HexagonConnection";
import classNames from "classnames";
import {StyledSelect} from "../inputs/StyledSelect";

export type TierID = "subjects" | "fields" | "topics";
export interface Tier {id: TierID; name: string; for: string}

const connectionProperties = {fill: 'none', strokeWidth: 3, strokeDasharray: 3};

interface HierarchySummaryProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    selections: Item<TAG_ID>[][];
}

interface HierarchyFilterProps extends HierarchySummaryProps {
    questionFinderFilter?: boolean;
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>;
}

function naturalLanguageList(list: string[]) {
    if (list.length === 0) return "No";
    const lowerCaseList = [list[0][0] + list[0].slice(1).toLowerCase(), ...list.slice(1).map(l => l.toLowerCase())];
    if (list.length === 1) return lowerCaseList[0];
    const lastIndex = list.length - 1;
    return `${lowerCaseList.slice(0, lastIndex).join(", ")} and ${lowerCaseList[lastIndex]}`;
}

function hexRowTranslation(deviceSize: DeviceSize, hexagon: HexagonProportions, i: number, questionFinderFilter: boolean) {
    if (i == 0 || (deviceSize != "xs" && !questionFinderFilter)) {
        return `translate(0,${i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)})`;
    } else {
        const x = (i * 2 - 1) * (hexagon.halfWidth + hexagon.padding);
        const y = 3 * hexagon.quarterHeight + hexagon.padding + (hexagon.quarterHeight + hexagon.padding /* xs y diff */);
        return `translate(${x},${y})`;
    }
}

function connectionRowTranslation(deviceSize: DeviceSize, hexagon: HexagonProportions, i: number, questionFinderFilter: boolean) {
    if (deviceSize != "xs" && !questionFinderFilter) {
        return `translate(${hexagon.halfWidth + hexagon.padding},${3 * hexagon.quarterHeight + hexagon.padding + i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)})`;
    } else {
        return `translate(0,0)`; // positioning is managed absolutely not through transformation
    }
}

function hexagonTranslation(deviceSize: DeviceSize, hexagon: HexagonProportions, i: number, j: number, questionFinderFilter: boolean) {
    if (i == 0 || (deviceSize != "xs" && !questionFinderFilter)) {
        return `translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)},0)`;
    } else {
        return `translate(0,${j * (4 * hexagon.quarterHeight + hexagon.padding)})`;
    }
}

export function HierarchyFilterHexagonal({tiers, choices, selections, questionFinderFilter, setTierSelection}: HierarchyFilterProps) {
    const deviceSize = useDeviceSize();
    const leadingHexagon = calculateHexagonProportions(36, deviceSize === "xs" ? 2 : 8);
    const hexagon = calculateHexagonProportions(36, deviceSize === "xs" || !!questionFinderFilter ? 16 : 8);
    const focusPadding = 3;

    const maxOptions = choices.slice(1).map(c => c.length).reduce((a, b) => Math.max(a, b), 0);
    const height = (deviceSize != "xs" && !questionFinderFilter) ?
        2 * focusPadding + 4 * hexagon.quarterHeight + (tiers.length - 1) * (6 * hexagon.quarterHeight + 2 * hexagon.padding) :
        2 * focusPadding + 4 * hexagon.quarterHeight + maxOptions * (4 * hexagon.quarterHeight + hexagon.padding) + (maxOptions ? hexagon.padding : 0);
    const width = (8 * leadingHexagon.halfWidth) + (6 * leadingHexagon.padding) + (2 * focusPadding);

    return <svg
        viewBox={questionFinderFilter ? `0 0 ${width} ${height}` : ""}
        width={questionFinderFilter ? "auto" : "100%"}
        className={classNames({"mx-auto d-block": questionFinderFilter})}
        height={`${height}px`}
    >
        <title>Topic filter selector</title>
        <g id="hexagonal-filter" transform={`translate(${focusPadding},${focusPadding})`}>
            {/* Connections */}
            {tiers.slice(1).map((tier, i) => {
                const subject = selections?.[0]?.[0] ? selections[0][0].value : "";
                return <g key={tier.for} transform={connectionRowTranslation(deviceSize, hexagon, i, !!questionFinderFilter)}>
                    <HexagonConnection
                        sourceIndex={choices[i].map(c => c.value).indexOf(selections[i][0]?.value)}
                        optionIndices={[...choices[i+1].keys()]} // range from 0 to choices[i+1].length
                        targetIndices={selections[i+1]?.map(s => choices[i+1].map(c => c.value).indexOf(s.value)) || [-1]}
                        leadingHexagonProportions={leadingHexagon} hexagonProportions={hexagon} connectionProperties={connectionProperties}
                        rowIndex={i} mobile={deviceSize === "xs" || !!questionFinderFilter} className={`connection ${subject}`}
                    />
                </g>;
            })}

            {/* Hexagons */}
            {tiers.map((tier, i) => <g key={tier.for} transform={hexRowTranslation(deviceSize, hexagon, i, !!questionFinderFilter)}>
                {choices[i].map((choice, j) => {
                    const subject = i == 0 ? choice.value : selections[0][0].value;
                    const isSelected = !!selections[i]?.map(s => s.value).includes(choice.value);
                    const longWordInLabel = choice.label.split(/\s/).some(word => word.length > 10);
                    const tag = tags.getById(choice.value);
                    const isComingSoon = isDefined(tag.comingSoonDate);
                    function selectValue() {
                        setTierSelection(i)(isSelected ?
                            selections[i].filter(s => s.value !== choice.value) : // remove
                            [...(selections[i] || []), choice] // add
                        );
                    }

                    return <g key={choice.value} transform={hexagonTranslation(deviceSize, i === 0 ? leadingHexagon : hexagon, i, j, !!questionFinderFilter)}>
                        <Hexagon {...hexagon} className={classNames("hex", subject, {"active": isSelected && !isComingSoon, "de-emph": isComingSoon})} />
                        <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                            <div className={classNames("hexagon-tier-title", {"active": isSelected && !isComingSoon, "de-emph": isComingSoon, "small": longWordInLabel})}>
                                {choice.label}
                            </div>
                            {tag.comingSoonDate && <div className={classNames(subject, "hexagon-coming-soon")}>
                                Coming {tag.comingSoonDate}
                            </div>}
                        </foreignObject>

                        <Hexagon
                            {...hexagon} className={classNames("hex none", {"clickable": !isComingSoon})} properties={{clickable: !isComingSoon}} role="button"
                            tabIndex={isComingSoon ? -1 : 0} onClick={isComingSoon ? noop : selectValue} onKeyPress={isComingSoon ? noop : ifKeyIsEnter(selectValue)}
                        >
                            {!isComingSoon && <title>
                                {`${isSelected ? "Remove" : "Add"} the ${tier.name.toLowerCase()} "${choice.label}" ${isSelected ? "from" : "to"} your ${siteSpecific("gameboard", "quiz")} filter`}
                            </title>}
                        </Hexagon>
                        {isComingSoon && <title>
                            This topic is coming soon
                        </title>}
                    </g>;
                })}
            </g>)}
        </g>
    </svg>;
}

export function HierarchyFilterSummary({tiers, choices, selections}: HierarchySummaryProps) {
    const hexagon = calculateHexagonProportions(10, 2);
    const hexKeyPoints = addHexagonKeyPoints(hexagon);
    const connection = {length: 60};
    const height = `${hexagon.quarterHeight * 4 + hexagon.padding * 2 + 32}px`;

    if (! selections[0]?.length) {
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
            <RS.Label htmlFor={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
            <StyledSelect name={tier.for} onChange={selectOnChange(setTierSelection(i), false)} isMulti options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
