import React from "react";
import * as RS from "reactstrap";
import Select, {ValueType} from "react-select";
import {TAG_ID} from "../../../services/constants";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {DeviceSize, useDeviceSize} from "../../../services/device";
import {HexagonConnection} from "./HexagonConnection";
import {Item, unwrapValue} from "../../../services/select";

export interface Tier {id: string; name: string; for: string}

const hexagonProperties = {
    unselected: {
        fill: {colour: "none"},
        stroke: {colour: "grey", width: 1},
        clickable: true,
    },
    selected: {
        fill: {colour: "#944cbe"},
        clickable: true,
    },
}

const connectionProperties = {fill: 'none', stroke: '#fea100', optionStrokeColour: "#d9d9d9", strokeWidth: 4, strokeDasharray: 4};

interface HierarchyFilterProps {
    tiers: Tier[];
    choices: Item<TAG_ID>[][];
    selections: Item<TAG_ID>[][];
    setTierSelection: (tierIndex: number) => React.Dispatch<React.SetStateAction<Item<TAG_ID>[]>>
}
export function HierarchyFilterHexagonal({tiers, choices, selections, setTierSelection}: HierarchyFilterProps) {
    const deviceSize = useDeviceSize();
    const hexagonUnitLength = 36;
    const hexagonPadding = 10;
    const hexagon = calculateHexagonProportions(hexagonUnitLength, hexagonPadding);

    return <svg width="100%" height="400px">
        <g id="hexagonal-filter"  transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
            <g id="connections-group">
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
            </g>
            <g id="hexagons-group">
                {tiers.map((tier, i) => (
                    <g key={tier.for} transform={`translate(0,${i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)})`}>
                        {choices[i].map((choice, j) => {
                            const isSelected = !!selections[i]?.map(s => s.value).includes(choice.value);
                            return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                                <Hexagon
                                    {...hexagon}
                                    properties={isSelected ? hexagonProperties.selected : hexagonProperties.unselected}
                                    onClick={() => setTierSelection(i)(isSelected ?
                                        selections[i].filter(s => s.value !== choice.value) : // remove
                                        [...(selections[i] || []), choice] // add
                                    )}
                                />
                                <text x={10} y={46} fontFamily="Exo 2" fontSize="0.8rem" fontWeight={600} fill={isSelected ? '#fff' : '#333'}>
                                    {choice.label}
                                </text>
                            </g>
                        })}
                    </g>
                ))}
            </g>

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
