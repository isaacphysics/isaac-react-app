import React from "react";
import {Circle} from "./Circle";

const filterIconWidth = 25;

export const FilterCount = ({count}: {count: number}) => {
    return <svg
        width={`${filterIconWidth}px`}
        height={`${filterIconWidth}px`}
        className="me-2"
    >
        <title>{`${count} filters selected`}</title>
        <g>
            <Circle radius={filterIconWidth / 2} className={"circle filter-count"} />
            {<foreignObject width={filterIconWidth} height={filterIconWidth}>
                <div aria-hidden={"true"} className={`filter-count-title`}>
                    {count}
                </div>
            </foreignObject>}
        </g>
    </svg>;
};
