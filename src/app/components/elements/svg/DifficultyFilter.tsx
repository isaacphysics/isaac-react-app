import {calculateHexagonProportions, Hexagon, HexagonProps} from "./Hexagon";
import {ifKeyIsEnter} from "../../../services/navigation";
import React from "react";
import {Item} from "../../../services/select";
import {generateSquareProportions, Rectangle} from "./Rectangle";
import {Diamond, generateDiamondProportions} from "./Diamond";
import {calculateOctagonProportions, Octagon} from "./Octagon";

interface ConcentricHexagonProps<T> extends HexagonProps<T> {
    active?: boolean,
    ringSize?: number
}

function ConcentricHexagon<T> (props : ConcentricHexagonProps<T>) {
    const {active, ringSize = 0, ...hexagon} = props;

    const ringProps = {...hexagon, ...calculateHexagonProportions(hexagon.halfWidth - ringSize, 0), clickable: false};
    console.log(ringProps);
    const innerProps = {...hexagon, ...calculateHexagonProportions(ringProps.halfWidth  - ringSize, 0), clickable: false};
    console.log(innerProps);

    return <>
        <Hexagon {...hexagon} className={`hex practice difficulty ${active ? "active" : ""}`} />
        <g transform={`translate(${(hexagon.halfWidth - ringProps.halfWidth)}, ${2 * (hexagon.quarterHeight - ringProps.quarterHeight)})`}>
            <Hexagon {...ringProps} className={`hex practice difficulty mini ${active ? "" : "active"}`} />
        </g>
        <g transform={`translate(${(hexagon.halfWidth - innerProps.halfWidth)}, ${2 * (hexagon.quarterHeight - innerProps.quarterHeight)})`}>
            <Hexagon {...innerProps} className={`hex practice difficulty mini ${active ? "active" : ""}`} />
        </g>
    </>
}


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

    const diamond = generateDiamondProportions(sideLength / 2, sideLength / 2, shapePadding);
    const octagon = calculateOctagonProportions(sideLength / 2, shapePadding);
    const focusPadding = 3;

    const getAbbreviation = (label : string) => label.substr(label.search(/\(/) + 1, 2);
    const getDifficultyLevel = (value : string) => parseInt(value.substr(value.search(/_/) + 1, 1))

    const practiceOptionsRow = difficultyOptions.slice(0, 3);
    const challengeOptionsRow = difficultyOptions.slice(3, 6);

    const demoShape : string = "square"

    return <svg width="100%" height={`${2 * focusPadding + 4 * hexagon.quarterHeight + hexagon.padding + diamond.padding + 2 * diamond.halfHeight}px`}>
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
                        {/*<ConcentricHexagon {...hexagon} active={isSelected} ringSize={3} className="hex practice difficulty" />*/}
                        <Hexagon {...hexagon} className={`hex practice difficulty ${isSelected ? "active" : ""}`} />
                        <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                            <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                {getAbbreviation(difficultyOption.label)}
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
                        {[1, 0, -1].slice(0, getDifficultyLevel(difficultyOption.value)).map((n) =>
                            <g transform={`translate(${2 * hexagon.halfWidth - (hexagon.padding + 2 * miniHexagon.halfWidth + miniHexagon.padding)}, ${2 * hexagon.quarterHeight - 2 * miniHexagon.quarterHeight + n * (4 * miniHexagon.quarterHeight + miniHexagon.padding)})`}>
                                <Hexagon {...miniHexagon} className={`hex practice difficulty mini ${isSelected ? "" : "active"}`} />
                            </g>
                        )}
                    </g>;})}
            </g>
            {demoShape == "square" ?
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
                                    {getAbbreviation(difficultyOption.label)}
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
                            {[0, 1, 2].slice(0, getDifficultyLevel(difficultyOption.value)).map((n) =>
                                <g transform={`translate(${square.width - (square.padding + miniSquare.width + miniSquare.padding)}, ${(square.height + square.padding - miniSquare.padding) - (n + 1) * (miniSquare.height + 2 * miniSquare.padding) })`}>
                                    <Rectangle {...miniSquare} className={`square challenge difficulty mini ${isSelected ? "" : "active"}`} />
                                </g>
                            )}
                        </g>;})}
                </g>
                :
                // BEYOND HERE LIES FUN (haven't made mini difficulty indicators yet)
                demoShape == "diamond" ?
                    <g transform={`translate(0, ${4 * hexagon.quarterHeight + diamond.padding + hexagon.padding})`}>
                        {challengeOptionsRow.map((difficultyOption, j) => {
                            const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                            function selectValue() {
                                setDifficulties(isSelected ?
                                    difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                                    [...difficulties, difficultyOption] // add
                                );
                            }
                            return <g transform={`translate(${j * (2 * diamond.halfWidth + 2 * diamond.padding)}, 0)`} >
                                <Diamond {...diamond} className={`diamond challenge difficulty ${isSelected ? "active" : ""}`} />
                                <foreignObject width={2 * diamond.halfWidth} height={2 * diamond.halfHeight}>
                                    <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                        {getAbbreviation(difficultyOption.label)}
                                    </div>
                                </foreignObject>
                                <Diamond
                                    {...diamond} className="diamond none clickable" properties={{clickable: true}} role="button"
                                    tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                                >
                                    <title>
                                        {`${isSelected ? "Remove" : "Add"} level ${difficultyOption.label} ${isSelected ? "from" : "to"} your gameboard filter`}
                                    </title>
                                </Diamond>
                            </g>;})}
                    </g>
                    :
                    demoShape == "octagon" ?
                        <g transform={`translate(0, ${4 * hexagon.quarterHeight + octagon.padding + hexagon.padding})`}>
                            {challengeOptionsRow.map((difficultyOption, j) => {
                                const isSelected = difficulties.map(l => l.value).includes(difficultyOption.value);
                                function selectValue() {
                                    setDifficulties(isSelected ?
                                        difficulties.filter(d => d.value !== difficultyOption.value) : // remove
                                        [...difficulties, difficultyOption] // add
                                    );
                                }
                                return <g transform={`translate(${j * (2 * octagon.halfWidth + 2 * octagon.padding)}, 0)`} >
                                    <Octagon {...octagon} className={`octagon challenge difficulty ${isSelected ? "active" : ""}`} />
                                    <foreignObject width={2 * octagon.halfWidth} height={2 * octagon.halfHeight}>
                                        <div className={`difficulty-title ${isSelected ? "active" : ""} difficulty-${difficultyOption.value}`}>
                                            {getAbbreviation(difficultyOption.label)}
                                        </div>
                                    </foreignObject>
                                    <Octagon
                                        {...octagon} className="octagon none clickable" properties={{clickable: true}} role="button"
                                        tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                                    >
                                        <title>
                                            {`${isSelected ? "Remove" : "Add"} level ${difficultyOption.label} ${isSelected ? "from" : "to"} your gameboard filter`}
                                        </title>
                                    </Octagon>
                                </g>;})}
                        </g>
                        :
                        <g/>
            }
        </g>
    </svg>
}
