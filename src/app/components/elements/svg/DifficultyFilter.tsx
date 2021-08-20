import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {ifKeyIsEnter} from "../../../services/navigation";
import React from "react";
import {Item} from "../../../services/select";
import {generateSquareProportions, Rectangle} from "./Rectangle";

export interface DifficultyFilterProps {
    difficultyOptions: Item<string>[];
    difficulties: Item<string>[];
    setDifficulties: (ds : Item<string>[]) => void
}

export function DifficultyFilterHexagonal({difficultyOptions, difficulties, setDifficulties}: DifficultyFilterProps) {
    const sideLength = 72;
    const shapePadding = 3;

    const hexagon = calculateHexagonProportions(sideLength/2, shapePadding);
    const square = generateSquareProportions(sideLength, shapePadding);
    const focusPadding = 3;

    const practiceOptionsRow = difficultyOptions.slice(0, 3);
    const challengeOptionsRow = difficultyOptions.slice(3, 6);

    return <svg width="100%" height={`${2 * focusPadding + 4 * hexagon.quarterHeight + hexagon.padding + square.padding + square.height}px`}>
        <title>Difficulties filter selector</title>
        <g transform={`translate(${focusPadding},${focusPadding})`}>
            <g>
                {practiceOptionsRow.map((difficultyOption, j) => {
                    const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                    function selectValue() {
                        setDifficulties(isSelected ?
                            difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                            [...difficulties, difficultyOption] // add
                        );
                    }
                    return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`} >
                        <Hexagon {...hexagon} className={`hex practice difficulty ${isSelected ? "active" : ""}`} />
                        <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                            <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                {difficultyOption.label}
                            </div>
                        </foreignObject>
                        <Hexagon
                            {...hexagon} className="hex none clickable" properties={{clickable: true}} role="button"
                            tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                        >
                            <title>
                                {`${isSelected ? "Remove" : "Add"} level ${difficultyOption.label} ${isSelected ? "from" : "to"} your gameboard filter`}
                            </title>
                        </Hexagon>
                    </g>;})}
            </g>
            <g transform={`translate(0, ${4 * hexagon.quarterHeight + square.padding + hexagon.padding})`}>
                {challengeOptionsRow.map((difficultyOption, j) => {
                    const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                    function selectValue() {
                        setDifficulties(isSelected ?
                            difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                            [...difficulties, difficultyOption] // add
                        );
                    }
                    return <g transform={`translate(${j * (square.width + 2 * square.padding)}, 0)`} >
                        <Rectangle {...square} className={`square challenge difficulty ${isSelected ? "active" : ""}`} />
                        <foreignObject width={square.width} height={square.height}>
                            <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                {difficultyOption.label}
                            </div>
                        </foreignObject>
                        <Rectangle
                            {...square} className="square none clickable" properties={{clickable: true}} role="button"
                            tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                        >
                            <title>
                                {`${isSelected ? "Remove" : "Add"} level ${difficultyOption.label} ${isSelected ? "from" : "to"} your gameboard filter`}
                            </title>
                        </Rectangle>
                    </g>;})}
            </g>
        </g>
    </svg>
}
