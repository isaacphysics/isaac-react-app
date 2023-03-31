import React from "react";
import {ifKeyIsEnter, Item, selectOnChange, siteSpecific} from "../../../services";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {StyledSelect} from "../inputs/StyledSelect";

interface LevelsSummaryProps {
    levelOptions: Item<number>[];
    levels: Item<number>[];
}

interface LevelsFilterProps extends LevelsSummaryProps {
    id: string;
    setLevels: React.Dispatch<React.SetStateAction<Item<number>[]>>
}

export function LevelsFilterSummary({levels, levelOptions}: LevelsSummaryProps) {
    const hexagon = calculateHexagonProportions(10, 1);

    if (levels.length == 0) {
        return <span className="text-muted">None Selected</span>;
    }

    return <svg
        role="img"
        width={`${hexagon.padding * 2 + (levels.length * 2 * (hexagon.halfWidth + hexagon.padding))}px`}
        height={`${hexagon.padding * 2 + (hexagon.quarterHeight * 4)}px`}
    >
        <title>{`Levels ${levels.map(l => l.label).join(", ")} selected`}</title>
        <g transform={`translate(1,1)`}>
            {levelOptions
                .filter(lo => levels.map(l => l.value).includes(lo.value)) // maintain option order
                .map((level, i) => <g key={level.value} transform={`translate(${i * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                    <Hexagon {...hexagon} className={`hex level active`} />
                    <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                        <div className={`hexagon-level-title active  hex-level-${level.value}`}>
                            {level.label}
                        </div>
                    </foreignObject>
                </g>)
            }
        </g>
    </svg>;
}

export function LevelsFilterHexagonal({levelOptions, levels, setLevels}: LevelsFilterProps) {
    const hexagon = calculateHexagonProportions(32, 2);
    const focusPadding = 3;

    const halfWayBreakPoint = Math.floor(levelOptions.length / 2);
    const levelOptionsFirstRow = levelOptions.slice(0, halfWayBreakPoint);
    const levelOptionsSecondRow = levelOptions.slice(halfWayBreakPoint, levelOptions.length);

    return <svg width="100%" height={`${2 * focusPadding + 7 * hexagon.quarterHeight + 2 * hexagon.padding}px`}>
        <title>Levels filter selector</title>
        <g transform={`translate(${focusPadding},${focusPadding})`}>
            {[levelOptionsFirstRow, levelOptionsSecondRow].map((levelOptionsRow, i) => {
                return <g transform={`translate(${i * (hexagon.halfWidth + hexagon.padding)}, ${i * ((3*hexagon.quarterHeight) + (2*hexagon.padding))})`}>
                    {levelOptionsRow.map((levelOption, j) => {
                        const isSelected = levels.map(l => l.value).includes(levelOption.value);
                        function selectValue() {
                            setLevels(isSelected ?
                                levels.filter(l => l.value !== levelOption.value) : // remove
                                [...levels, levelOption] // add
                            );
                        }
                        return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon {...hexagon} className={`hex level ${isSelected ? "active" : ""}`} />
                            <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                                <div className={`hexagon-level-title ${isSelected ? "active" : ""} hex-level-${levelOption.value}`}>
                                    {levelOption.label}
                                </div>
                            </foreignObject>
                            <Hexagon
                                {...hexagon} className="hex none clickable" properties={{clickable: true}} role="button"
                                tabIndex={0} onClick={selectValue} onKeyPress={ifKeyIsEnter(selectValue)}
                            >
                                <title>
                                    {`${isSelected ? "Remove" : "Add"} level ${levelOption.label} ${isSelected ? "from" : "to"} your ${siteSpecific("gameboard", "quiz")} filter`}
                                </title>
                            </Hexagon>
                        </g>
                    })}
                </g>
            })}
        </g>
    </svg>
}

export function LevelsFilterSelect({levelOptions, levels, setLevels, id}: LevelsFilterProps) {
    return <StyledSelect id={id} onChange={selectOnChange(setLevels, false)} isMulti value={levels} options={levelOptions} />
}
