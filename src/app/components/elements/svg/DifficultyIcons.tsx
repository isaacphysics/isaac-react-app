import React from "react";
import {Difficulty} from "../../../../IsaacApiTypes";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {difficultyLabelMap, difficultyShortLabelMap} from "../../../services";
import classnames from "classnames";
import {Rectangle} from "./Rectangle";

// Difficulty icon proportions
const difficultyIconWidth = 25;
const difficultyIconXPadding = 1.5;
const yPadding = 2;
const difficultyCategoryLevels = [1, 2, 3];
const miniHexagon = calculateHexagonProportions(difficultyIconWidth / 2, 0);
const miniSquare = {width: difficultyIconWidth, height: difficultyIconWidth};

interface DifficultyIconShapeProps {difficultyCategory: string; difficultyCategoryLevel: number; active: boolean}
function SingleDifficultyIconShape({difficultyCategory, difficultyCategoryLevel, active}: DifficultyIconShapeProps) {
    return <g transform={`translate(${(difficultyCategoryLevel - 1) * (difficultyIconWidth + 2 * difficultyIconXPadding)}, ${yPadding + (difficultyCategory === "P" ? 0 : 2)})`}>
        {difficultyCategory === "P" ?
            <Hexagon {...miniHexagon} className={"hex difficulty practice " + classnames({active})} /> :
            <Rectangle {...miniSquare} className={"square difficulty challenge " + classnames({active})} />
        }
        {<foreignObject width={difficultyIconWidth} height={difficultyIconWidth + (difficultyCategory === "P" ? yPadding + 2 : 0)}>
            <div className={`difficulty-title difficulty-icon-title ${classnames({active})} difficulty-${difficultyCategoryLevel}`}>
                {difficultyCategory}
            </div>
        </foreignObject>}
    </g>;
}

export function DifficultyIcons({difficulty} : {difficulty : Difficulty}) {
    const difficultyLabel = difficultyShortLabelMap[difficulty];
    const difficultyCategory = difficultyLabel[0];
    const difficultyLevel = parseInt(difficultyLabel[1]);

    return <div>
        <svg
            width={`${difficultyCategoryLevels.length * (difficultyIconWidth + 2 * difficultyIconXPadding) - difficultyIconXPadding}px`}
            height={`${miniHexagon.quarterHeight * 4 + 2 * yPadding}px`}
        >
            <title>{difficultyLabelMap[difficulty]}</title>
            {difficultyCategoryLevels.map(difficultyCategoryLevel => {
                const active = difficultyCategoryLevel <= difficultyLevel;
                return <SingleDifficultyIconShape
                    key={`${difficultyLabel} ${difficultyCategoryLevel}`}
                    {...{difficultyCategory, difficultyCategoryLevel, active, difficultyIconWidth, difficultyIconXPadding, yPadding}}
                />;
            })}
        </svg>
    </div>;
}
