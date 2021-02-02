import React from "react";
import Select from "react-select";
import {Item, unwrapValue} from "../../../services/select";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {useDeviceSize} from "../../../services/device";

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
        return <span className="text-muted">No Selection</span>;
    }

    return <svg
        width={`${hexagon.padding * 2 + (levels.length * 2 * (hexagon.halfWidth + hexagon.padding))}px`}
        height={`${hexagon.padding * 2 + (hexagon.quarterHeight * 4)}px`}
    >
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

export function LevelsFilterHexagonal(props: LevelsFilterProps) {
    const {levelOptions, levels, setLevels} = props;
    const deviceSize = useDeviceSize();
    const hexagon = calculateHexagonProportions(32, 2);

    const halfWayBreakPoint = Math.floor(levelOptions.length / 2);
    const levelOptionsFirstRow = levelOptions.slice(0, halfWayBreakPoint);
    const levelOptionsSecondRow = levelOptions.slice(halfWayBreakPoint, levelOptions.length);

    // Use select for small devices
    if (deviceSize === "xs") {
        return <LevelsFilterSelect {...props} />;
    }

    return <svg width="100%" height="160px">
        <g transform={`translate(1,1)`}>
            {[levelOptionsFirstRow, levelOptionsSecondRow].map((levelOptionsRow, i) => {
                return <g transform={`translate(${i * (hexagon.halfWidth + hexagon.padding)}, ${i * ((3*hexagon.quarterHeight) + (2*hexagon.padding))})`}>
                    {levelOptionsRow.map((levelOption, j) => {
                        const isSelected = levels.map(l => l.value).includes(levelOption.value);
                        return <g transform={`translate(${j * 2 * (hexagon.halfWidth + hexagon.padding)}, 0)`}>
                            <Hexagon {...hexagon} className={`hex level ${isSelected ? "active" : ""}`} />
                            <foreignObject width={hexagon.halfWidth * 2} height={hexagon.quarterHeight * 4}>
                                <div className={`hexagon-level-title ${isSelected ? "active" : ""} hex-level-${levelOption.value}`}>
                                    {levelOption.label}
                                </div>
                            </foreignObject>
                            <Hexagon
                                {...hexagon} className="hex none clickable" properties={{clickable: true}}
                                onClick={() => setLevels(isSelected ?
                                    levels.filter(l => l.value !== levelOption.value) : // remove
                                    [...levels, levelOption] // add
                                )}
                            />
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
