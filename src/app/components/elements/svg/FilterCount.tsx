import React from "react";
import {Circle} from "./Circle";
import { siteSpecific } from "../../../services";
import { Hexagon } from "./Hexagon";

export interface FilterCountProps extends React.SVGProps<SVGSVGElement> {
    count: number;
    widthPx?: number;
}

export const FilterCount = (props: FilterCountProps) => {
    const {count, widthPx, ...rest} = props;
    const filterIconWidth = widthPx || 25;

    return <svg
        {...rest}
        width={`${filterIconWidth}px`}
        height={`${filterIconWidth}px`}
    >
        <title>{`${count} filters selected`}</title>
        <g>
            <Circle radius={filterIconWidth / 2} className={"circle filter-count"} />
            <foreignObject width={siteSpecific(filterIconWidth * Math.sqrt(3)/2, filterIconWidth)} height={filterIconWidth}>
                <div aria-hidden={"true"} className={`filter-count-title`}>
                    {count}
                </div>
            </foreignObject>
        </g>
    </svg>;
};
