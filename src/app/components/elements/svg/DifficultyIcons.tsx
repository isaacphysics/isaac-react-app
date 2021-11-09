import React from "react";
import {Difficulty} from "../../../../IsaacApiTypes";
import {calculateHexagonProportions, Hexagon} from "./Hexagon";
import {difficultyShortLabelMap} from "../../../services/constants";
import classnames from "classnames";
import {Rectangle} from "./Rectangle";
import {isDefined} from "../../../services/miscUtils";

export function aggregateDifficulties(difficulties: Difficulty[]): Difficulty[] {
    const highestLevels: Record<string, number> = {};
    difficulties.forEach(difficulty => {
        const difficultyLabel = difficultyShortLabelMap[difficulty];
        const difficultyCategory = difficultyLabel[0];
        const difficultyLevel = parseInt(difficultyLabel[1]);
        if (!isDefined(highestLevels[difficultyCategory]) || difficultyLevel > highestLevels[difficultyCategory]) {
            highestLevels[difficultyCategory] = difficultyLevel;
        }
    });
    const aggregateDifficulties: Difficulty[] = [];
    ["P", "C"].forEach(difficultyCategory => {
        if (isDefined(highestLevels[difficultyCategory])) {
            aggregateDifficulties.push(`${{P: "practice_", C: "challenge_"}[difficultyCategory]}${highestLevels[difficultyCategory]}` as Difficulty);
        }
    })
    return aggregateDifficulties;
}

export function DifficultyIcons({difficulty} : {difficulty : Difficulty}) {
    // Difficulty icon proportions
    const difficultyIconWidth = 25;
    const difficultyIconXPadding = 1.5;
    const yPadding = 2;
    const miniHexagon = calculateHexagonProportions(difficultyIconWidth / 2, 0);
    const miniSquare = {width: difficultyIconWidth, height: difficultyIconWidth};

    const difficultyLabel = difficultyShortLabelMap[difficulty];
    const difficultyCategory = difficultyLabel[0];
    const numberOfLevelsForDifficultyCategory = 3;
    const difficultyLevel = parseInt(difficultyLabel[1]);

    return <div aria-label={"Difficulty: " + difficultyLabel}>
        <svg
            width={`${numberOfLevelsForDifficultyCategory * (difficultyIconWidth + 2 * difficultyIconXPadding) - difficultyIconXPadding}px`}
            height={`${miniHexagon.quarterHeight * 4 + 2 * yPadding}px`}
        >
            {Array(numberOfLevelsForDifficultyCategory).fill(undefined).map((_, i) => {
                const active = i < difficultyLevel;
                return <g key={i} transform={`translate(${i * (difficultyIconWidth + 2 * difficultyIconXPadding)}, ${yPadding + (difficultyCategory === "P" ? 0 : 2)})`}>
                    {difficultyCategory === "P" ?
                        <Hexagon {...miniHexagon} className={"hex difficulty practice " + classnames({active})} /> :
                        <Rectangle {...miniSquare} className={"square difficulty challenge " + classnames({active})} />
                    }
                    {<foreignObject width={difficultyIconWidth} height={difficultyIconWidth + (difficultyCategory === "P" ? yPadding + 2 : 0)}>
                        <div className={`difficulty-title ${classnames({active})} difficulty-${i + 1}`}>
                            {difficultyCategory}
                        </div>
                    </foreignObject>}
                </g>;
            })}
        </svg>
    </div>;
}
