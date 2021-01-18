import React from "react";
import * as RS from "reactstrap";
import Select from "react-select";
import {TAG_ID} from "../../../services/constants";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {useDeviceSize} from "../../../services/device";
import {HexagonConnection} from "./HexagonConnection";
import {Item, unwrapValue} from "../../../services/select";

export interface Tier {id: string; name: string; for: string}

const hexagonProperties = {
    unselected: {
        fill: {colour: "none"},
        stroke: {colour: "grey", width: 1}
    },
    selected: {
        fill: {colour: "#944cbe"}
    },
    clickable: {
        fill: {colour: "none"},
        clickable: true,
    }
}

const connectionProperties = {fill: 'none', stroke: '#fea100', optionStrokeColour: "#d9d9d9", strokeWidth: 4, strokeDasharray: 4};

interface HierarchyFilterProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    selections: Item<TAG_ID>[][];
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>
}
export function HierarchyFilterHexagonal(props: HierarchyFilterProps) {
    const {tiers, choices, selections, setTierSelection} = props;
    const deviceSize = useDeviceSize();
    const hexagon = calculateHexagonProportions(36, 10);

    // Use multiple selects for small devices
    if (deviceSize === "xs") {
        return <HierarchyFilterSelects {...props} />;
    }
    return <svg width="100%" height="400px">
        <g id="hexagonal-filter"  transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
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
                        const isSelected = !!selections[i]?.map(s => s.value).includes(choice.value);
                        return <g key={choice.value} transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon
                                {...hexagon} properties={isSelected ? hexagonProperties.selected : hexagonProperties.unselected}
                            />
                            <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                                <div className={`hexagon-tier-title ${isSelected ? "active" : ""} ${choice.label.split(/\s/).some(word => word.length > 10) ? "small" : ""}`}>
                                    {choice.label}
                                </div>
                            </foreignObject>
                            <Hexagon
                                {...hexagon} properties={hexagonProperties.clickable}
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

export function HierarchyFilterSelects({tiers, choices, selections, setTierSelection}: HierarchyFilterProps) {
    return <React.Fragment>
        {tiers.map((tier, i) => <React.Fragment key={tier.for}>
            <RS.Label htmlFor={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
            <Select name={tier.for} onChange={unwrapValue(setTierSelection(i))} isMulti options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
