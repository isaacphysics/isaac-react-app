import React from "react";
import Select from "react-select";
import * as RS from "reactstrap";
import {Item, unwrapValue} from "../../../services/select";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";

interface LevelsFilterProps {
    id: string;
    levelOptions: Item<number>[];
    levels: Item<number>[];
    setLevels: React.Dispatch<React.SetStateAction<Item<number>[]>>
}


const hexagonProperties = {
    unselected: {
        fill: {colour: "none"},
        stroke: {colour: "grey", width: 1},
        clickable: true,
    },
    selected: {
        fill: {colour: "#509e2e"},
        clickable: true,
    },
}

const titleProperties = {
    x: 30, y: 44, fontFamily: "Exo 2", fontSize: "0.8rem", fontWeight: 600, fill: '#333', selectedFill: '#fff'
}

export function LevelsFilterHexagonal({levelOptions, levels, setLevels, id}: LevelsFilterProps) {
    console.log(levelOptions)
    const hexagonUnitLength = 34;
    const hexagonPadding = 2;
    const hexagon = calculateHexagonProportions(hexagonUnitLength, hexagonPadding);

    const halfWayBreakPoint = Math.floor(levelOptions.length / 2);
    const levelOptionsFirstRow = levelOptions.slice(0, halfWayBreakPoint);
    const levelOptionsSecondRow = levelOptions.slice(halfWayBreakPoint, levelOptions.length);

    const {selectedFill: titleSelectedFill, ...textProperties} = titleProperties;
    return <svg width="100%" height="160px">
        <g transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
            {[levelOptionsFirstRow, levelOptionsSecondRow].map((levelOptionsRow, i) => {
                return <g transform={`translate(${i * (hexagon.halfWidth + hexagonPadding)}, ${i * ((3*hexagon.quarterHeight) + (2*hexagon.padding))})`}>
                    {levelOptionsRow.map((levelOption, j) => {
                        const isSelected = levels.map(l => l.value).includes(levelOption.value);
                        return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon
                                {...hexagon}
                                properties={isSelected ? hexagonProperties.selected : hexagonProperties.unselected}
                                onClick={() => setLevels(isSelected ?
                                    levels.filter(l => l.value !== levelOption.value) : // remove
                                    [...levels, levelOption] // add
                                )}
                            />
                            <text {...textProperties} fill={isSelected ? titleSelectedFill : textProperties.fill}>
                                {levelOption.label}
                            </text>
                        </g>
                    })}
                </g>
            })}
        </g>
    </svg>
}

export function LevelsFilterSelect({levelOptions, levels, setLevels, id}: LevelsFilterProps) {
    return <Select id={id} onChange={unwrapValue(setLevels)} isMulti value={levels} options={levelOptions} />
}
