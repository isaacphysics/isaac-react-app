import React from "react";
import Select from "react-select";
import {Item, unwrapValue} from "../../../services/select";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {useDeviceSize} from "../../../services/device";

interface LevelsFilterProps {
    id: string;
    levelOptions: Item<number>[];
    levels: Item<number>[];
    setLevels: React.Dispatch<React.SetStateAction<Item<number>[]>>
}

export function LevelsFilterHexagonal(props: LevelsFilterProps) {
    const {levelOptions, levels, setLevels, id} = props;
    const deviceSize = useDeviceSize();
    const hexagon = calculateHexagonProportions(34, 2);

    const halfWayBreakPoint = Math.floor(levelOptions.length / 2);
    const levelOptionsFirstRow = levelOptions.slice(0, halfWayBreakPoint);
    const levelOptionsSecondRow = levelOptions.slice(halfWayBreakPoint, levelOptions.length);

    // Use select for small devices
    if (deviceSize === "xs") {
        return <LevelsFilterSelect {...props} />;
    }

    return <svg width="100%" height="160px">
        <g transform={`translate(${hexagon.padding}, ${hexagon.padding})`}>
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
