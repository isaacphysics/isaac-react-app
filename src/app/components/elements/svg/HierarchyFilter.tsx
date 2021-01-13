import React from "react";
import * as RS from "reactstrap";
import Select, {ValueType} from "react-select";
import {TAG_ID} from "../../../services/constants";
import {Hexagon} from "./Hexagon";
import {DeviceSize, useDeviceSize} from "../../../services/device";

interface Item<T> {value: T; label: string;}
export interface Tier {id: string; name: string; for: string}
function unwrapValue<T>(f: React.Dispatch<React.SetStateAction<Item<T>[]>>) {
    return (value: ValueType<Item<T>>) => f(Array.isArray(value) ? value : !value ? [] : [value]);
}

const hexagonProperties = {
    unselected: {
        fill: {colour: "none"},
        stroke: {colour: "grey", width: 1},
        clickable: true,
    },
    selected: {
        fill: {colour: "purple"},
        clickable: true,
    },
}
function calculateHexagonProportions(unitLength: number, padding: number) {
    return {
        halfWidth: unitLength,
        quarterHeight: unitLength / Math.sqrt(3),
        padding: padding,
    }
}

function generateHexagonTitle(title: string, isSelected: boolean) {
    let xPosition = 10;
    let yPosition = 46;
    return <text
        fontFamily="Exo 2"
        fontSize="0.8rem"
        fontWeight={600}
        fill={isSelected ? '#fff' : '#333'}
        stroke="none"
        strokeLinejoin="round"
        strokeLinecap="round"
        x={xPosition}
        y={yPosition}
    >{title}</text>;
}

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

    return <svg id="ft-progress" width="100%" height="400px">
        <g transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
            {tiers.map((tier, i) => (
                <g key={tier.for} transform={`translate(0,${i * (6 * hexagon.quarterHeight + 2 * hexagon.padding)})`}>
                    {choices[i].map((choice, j) => {
                        const currentlySelected = !!selections[i]?.map(s => s.value).includes(choice.value);
                        return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon
                                {...hexagon}
                                properties={currentlySelected ? hexagonProperties.selected : hexagonProperties.unselected}
                                onClick={() => {
                                    const selectedChoice = choices[i][j];
                                    if (currentlySelected) { // remove
                                        setTierSelection(i)(selections[i].filter(s => s.value !== selectedChoice.value));
                                    } else { // add
                                        setTierSelection(i)([...(selections[i] || []), selectedChoice]);
                                    }
                                }}
                            />
                            {generateHexagonTitle(choices[i][j].label, currentlySelected)}
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
            <RS.Label for={tier.for} className="pt-2 pb-0">{tier.name}: </RS.Label>
            <Select name={tier.for} onChange={unwrapValue(setTierSelection(i))} isMulti={true} options={choices[i]} value={selections[i]} />
        </React.Fragment>)}
    </React.Fragment>;
}
