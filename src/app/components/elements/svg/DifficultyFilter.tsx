import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {ifKeyIsEnter, Item, siteSpecific} from "../../../services";
import React from "react";
import {generateSquareProportions, Rectangle} from "./Rectangle";
import {Container} from "reactstrap";

export interface DifficultyFilterProps {
    difficultyOptions: Item<string>[];
    difficulties: Item<string>[];
    setDifficulties: (ds : Item<string>[]) => void
}

export function DifficultyFilter({difficultyOptions, difficulties, setDifficulties}: DifficultyFilterProps) {
    const sideLength = 72;
    const shapePadding = 3;

    const hexagon = calculateHexagonProportions(sideLength/2, shapePadding);
    const miniHexagon = calculateHexagonProportions(sideLength/16, shapePadding);

    const square = generateSquareProportions(sideLength, shapePadding);
    const miniSquare = generateSquareProportions(sideLength/9, shapePadding);

    const focusPadding = 3;

    const getAbbreviation = (label : string) => label.substr(label.search(/\(/) + 1, 2);
    const getDifficultyLevel = (value : string) => parseInt(value.substr(value.search(/_/) + 1, 1))

    const practiceOptionsRow = difficultyOptions.slice(0, 3);
    const challengeOptionsRow = difficultyOptions.slice(3, 6);

    return <Container className="ms-0 ps-0 text-center" style={{width: 2 * focusPadding + 6 * (hexagon.halfWidth + 2 * hexagon.padding)}}>
        <span>Practice</span>
        <svg width={`${2 * focusPadding + 6 * (hexagon.halfWidth + hexagon.padding)}`} height={`${2 * focusPadding + 4 * hexagon.quarterHeight + 2 * hexagon.padding}px`}>
            <title>Difficulties filter selector</title>
            <g transform={`translate(${focusPadding + hexagon.padding},${focusPadding})`}>
                <g>
                    {practiceOptionsRow.map((difficultyOption, j) => {
                        const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                        function selectValue() {
                            setDifficulties(isSelected ?
                                difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                                [...difficulties, difficultyOption] // add
                            );
                        }
                        return <g key={difficultyOption.value} transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`} >
                            <Hexagon {...hexagon} className={`hex practice difficulty ${isSelected ? "active" : ""}`} />
                            <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                                <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value} `}>
                                    {getAbbreviation(difficultyOption.label)}
                                </div>
                            </foreignObject>
                            <Hexagon
                                {...hexagon} className="hex none clickable" properties={{clickable: true}} role="button"
                                tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                            >
                                <title>
                                    {`${isSelected ? "Remove" : "Add"} difficulty ${difficultyOption.label} ${isSelected ? "from" : "to"} your ${siteSpecific("gameboard", "quiz")} filter`}
                                </title>
                            </Hexagon>
                            {[1, 0, -1].slice(0, getDifficultyLevel(difficultyOption.value)).map((n) =>
                                <g key={`${difficultyOption.value}-${n}`} transform={`translate(${2 * hexagon.halfWidth - (hexagon.padding + 2 * miniHexagon.halfWidth + miniHexagon.padding)}, ${2 * hexagon.quarterHeight - 2 * miniHexagon.quarterHeight + n * (4 * miniHexagon.quarterHeight + miniHexagon.padding)})`}>
                                    <Hexagon {...miniHexagon} className={`hex practice difficulty mini ${isSelected ? "" : "active"}`} />
                                </g>
                            )}
                        </g>;})}
                </g>
            </g>
        </svg>
        <span>Challenge</span>
        <svg width={`${2 * focusPadding + 3 * (square.width + 2 * square.padding)}`} height={`${2 * focusPadding + square.height + 2 * square.padding}px`}>
            <g transform={`translate(${focusPadding + square.padding},${focusPadding})`}>
                {challengeOptionsRow.map((difficultyOption, j) => {
                    const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                    function selectValue() {
                        setDifficulties(isSelected ?
                            difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                            [...difficulties, difficultyOption] // add
                        );
                    }
                    return <g key={difficultyOption.value} transform={`translate(${j * (square.width + 2 * square.padding)}, 0)`} >
                        <Rectangle {...square} className={`square challenge difficulty ${isSelected ? "active" : ""}`} />
                        <foreignObject width={square.width} height={square.height}>
                            <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                {getAbbreviation(difficultyOption.label)}
                            </div>
                        </foreignObject>
                        <Rectangle
                            {...square} className="square none clickable" properties={{clickable: true}} role="button"
                            tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                        >
                            <title>
                                {`${isSelected ? "Remove" : "Add"} difficulty ${difficultyOption.label} ${isSelected ? "from" : "to"} your ${siteSpecific("gameboard", "quiz")} filter`}
                            </title>
                        </Rectangle>
                        {[0, 1, 2].slice(0, getDifficultyLevel(difficultyOption.value)).map((n) =>
                            <g key={`${difficultyOption.value}-${n}`} transform={`translate(${square.width - (square.padding + miniSquare.width + miniSquare.padding)}, ${(square.height + square.padding - miniSquare.padding) - (n + 1) * (miniSquare.height + 2 * miniSquare.padding) })`}>
                                <Rectangle {...miniSquare} className={`square challenge difficulty mini ${isSelected ? "" : "active"}`} />
                            </g>
                        )}
                    </g>;})}
            </g>
        </svg>
    </Container>
}
