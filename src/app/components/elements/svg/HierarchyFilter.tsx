import React from "react";
import * as RS from "reactstrap";
import Select from "react-select";
import {TAG_ID} from "../../../services/constants";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {useDeviceSize} from "../../../services/device";
import {HexagonConnection} from "./HexagonConnection";
import {Item, unwrapValue} from "../../../services/select";
import {addHexagonKeyPoints, svgLine, svgMoveTo} from "../../../services/svg";

export interface Tier {id: string; name: string; for: string}

const connectionProperties = {fill: 'none', stroke: '#fea100', optionStrokeColour: "#d9d9d9", strokeWidth: 4, strokeDasharray: 4};

interface HierarchySummaryProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    selections: Item<TAG_ID>[][];
}

interface HierarchyFilterProps extends HierarchySummaryProps {
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>
}

export function HierarchyFilterHexagonal(props: HierarchyFilterProps) {
    const {tiers, choices, selections, setTierSelection} = props;
    const deviceSize = useDeviceSize();
    const hexagon = calculateHexagonProportions(36, 8);

    // Use multiple selects for small devices
    if (deviceSize === "xs") {
        return <HierarchyFilterSelects {...props} />;
    }
    return <svg width="100%" height={`${105 + (tiers.length - 1) * 145}px`}>
        <g id="hexagonal-filter" transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
            {/* Connections */}
            {tiers.slice(1).map((tier, i) => {
                return <g
                    key={tier.for}
                    transform={'translate(' + (hexagon.halfWidth + hexagon.padding) + ',' +
                    (3 * hexagon.quarterHeight + hexagon.padding + i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)) + ')'}
                >
                    <HexagonConnection
                        sourceIndex={choices[i].map(c => c.value).indexOf(selections[i][0]?.value)}
                        optionIndices={[...choices[i+1].keys()]} // range from 0 to choices[i+1].length
                        targetIndices={selections[i+1]?.map(s => choices[i+1].map(c => c.value).indexOf(s.value)) || [-1]}
                        hexagonProportions={hexagon} connectionProperties={connectionProperties}
                    />
                </g>
            })}

            {/* Hexagons */}
            {tiers.map((tier, i) => (
                <g key={tier.for} transform={`translate(0,${i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)})`}>
                    {choices[i].map((choice, j) => {
                        const subject = i == 0 ? choice.value : selections[0][0].value;
                        const isSelected = !!selections[i]?.map(s => s.value).includes(choice.value);
                        return <g key={choice.value} transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon {...hexagon} className={`hex ${subject} ${isSelected ? "active" : ""}`} />
                            <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                                <div className={`hexagon-tier-title ${isSelected ? "active" : ""} ${choice.label.split(/\s/).some(word => word.length > 10) ? "small" : ""}`}>
                                    {choice.label}
                                </div>
                            </foreignObject>
                            <Hexagon
                                {...hexagon} className="hex none clickable" properties={{clickable: true}}
                                onClick={() => setTierSelection(i)(isSelected ?
                                    selections[i].filter(s => s.value !== choice.value) : // remove
                                    [...(selections[i] || []), choice] // add
                                )}
                            />
                        </g>
                    })}
                </g>
            ))}
        </g>
    </svg>;
}

export function HierarchyFilterSummary({tiers, choices, selections}: HierarchySummaryProps) {
    const hexagon = calculateHexagonProportions(10, 2);
    const hexKeyPoints = addHexagonKeyPoints(hexagon);
    const connection = {length: 60};
    const selectionSummary = selections[0].length ?
        selections.map((tierSelections, i) =>
            tierSelections.length != 1 ? `Multiple ${tiers[i].name}s` : `${tierSelections[0].label}`) :
        [`Multiple ${tiers[0].name}s`]; // default

    return <svg
        width={`${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * selectionSummary.length}px`}
        height={`${hexagon.quarterHeight * 4 + hexagon.padding * 2 + 32}px`}
    >
        <g id="hexagonal-filter-summary" transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
            {/* Connection & Hexagon */}
            <g transform={`translate(${connection.length / 2 - hexKeyPoints.x.center}, 0)`}>
                {selectionSummary.map((selection, i) => {
                    const yCenter = hexKeyPoints.y.center;
                    const xConnectionStart = hexKeyPoints.x.right + hexagon.padding;
                    return <g key={selection} transform={`translate(${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * i}, 0)`}>
                        {i != selectionSummary.length - 1 && <path
                            {...connectionProperties}
                            d={`${svgMoveTo(xConnectionStart, yCenter)}${svgLine(xConnectionStart+connection.length, yCenter)}`}
                        />}
                        <Hexagon className={`hex active ${selections[0].length ? selections[0][0].value : choices[0][0].value}`} {...hexagon} />
                    </g>
                })}
            </g>

            {/* Text */}
            {selectionSummary.map((selection, i) => {
                return <g key={selection} transform={`translate(${((hexagon.halfWidth + hexagon.padding) * 2 + connection.length) * i}, 0)`}>
                    <g transform={`translate(0, ${hexagon.quarterHeight * 4 + hexagon.padding})`}>
                        <foreignObject width={connection.length} height={hexagon.quarterHeight * 5}>
                            <div className={`hexagon-tier-title small`}>
                                {selection}
                            </div>
                        </foreignObject>
                    </g>
                </g>
            })}
        </g>
    </svg>;
}

export function HierarchyFilterSelects({tiers, choices, selections, setTierSelection}: HierarchyFilterProps) {
    return <React.Fragment>
        {tiers.map((tier, i) => <React.Fragment key={tier.for}>
            <RS.Label htmlFor={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
            <Select name={tier.for} onChange={unwrapValue(setTierSelection(i))} isMulti options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
