import React from "react";
import {Difficulty} from "../../../../IsaacApiTypes";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {difficultyLabelMap, difficultyShortLabelMap, isAda, siteSpecific} from "../../../services";
import classnames from "classnames";
import {Rectangle} from "./Rectangle";
import {Circle} from "./Circle";

// Difficulty icon proportions
const difficultyIconWidth = siteSpecific(15, 25);
const difficultyIconXPadding = 1.5;
const yPadding = 2;
const difficultyCategoryLevels = siteSpecific([1, 2, 3], [1, 2]);
const miniHexagon = calculateHexagonProportions(difficultyIconWidth / 2, 0);
const miniSquare = {width: difficultyIconWidth, height: difficultyIconWidth};

const squareOffset = ((miniHexagon.quarterHeight * 4 + 2 * yPadding) - difficultyIconWidth) / 2 - 1; // ${yPadding + (difficultyCategory === "P" && isPhy ? 0 : 2)}

interface DifficultyIconShapeProps {
    difficultyCategory: string;
    difficultyCategoryLevel: number;
    active: boolean;
    blank?: boolean;
}
function SingleDifficultyIconShape({difficultyCategory, difficultyCategoryLevel, active, blank}: DifficultyIconShapeProps) {
    // FIXME the calculations here need refactoring, had to rush them to get it done
    return <g transform={`translate(${(difficultyCategoryLevel - 1) * (difficultyIconWidth + 2 * difficultyIconXPadding) + siteSpecific(0, 1)}, ${isAda ? yPadding + 2 : difficultyCategory === "P" ? 0 : squareOffset})`}>
        {difficultyCategory === "P" ?
            siteSpecific(
                <Hexagon {...miniHexagon} className={"hex difficulty practice " + classnames({active})} />,
                <Circle radius={difficultyIconWidth / 2} className={"hex difficulty practice " + classnames({active})} />
            ) :
            <Rectangle {...miniSquare} className={"square difficulty challenge " + classnames({active})} />
        }
        {/* {<foreignObject width={difficultyIconWidth} height={difficultyIconWidth + (difficultyCategory === "P" && isPhy ? yPadding + 2 : siteSpecific(0, 1))}>
            <div aria-hidden={"true"} className={`difficulty-title difficulty-icon-title ${classnames({active})} difficulty-${difficultyCategoryLevel}`}>
                {blank ? "" : difficultyCategory}
            </div>
        </foreignObject>} */}
    </g>;
}

export function DifficultyIcons({difficulty, blank, className} : {difficulty: Difficulty, blank?: boolean, className?: string}) {
    const difficultyLabel = difficultyShortLabelMap[difficulty];
    const difficultyCategory = difficultyLabel[0];
    const difficultyLevel = parseInt(difficultyLabel[1]);

    return <div className={className}>
        <svg
            className="d-flex"
            role={"img"}
            width={`${difficultyCategoryLevels.length * (difficultyIconWidth + 2 * difficultyIconXPadding) + difficultyIconXPadding}px`}
            height={`${miniHexagon.quarterHeight * 4 + 2 * yPadding}px`}
        >
            <title>{difficultyLabelMap[difficulty]}</title>
            {difficultyCategoryLevels.map(difficultyCategoryLevel => {
                const active = difficultyCategoryLevel <= difficultyLevel;
                return <SingleDifficultyIconShape
                    key={`${difficultyLabel} ${difficultyCategoryLevel}`}
                    {...{difficultyCategory, difficultyCategoryLevel, active, blank, difficultyIconWidth, difficultyIconXPadding, yPadding}}
                />;
            })}
        </svg>
    </div>;
}
