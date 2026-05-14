import React from "react";
import {Circle} from "./Circle";
import { useTranslation } from 'react-i18next'

export interface FilterCountProps extends React.SVGProps<SVGSVGElement> {
    count: number;
    widthPx?: number;
}

export const FilterCount = (props: FilterCountProps) => {
    const { t } = useTranslation()
    const {count, widthPx, ...rest} = props;
    const filterIconWidth = widthPx || 25;

    return <svg
        {...rest}
        width={t('filtericonwidthpx', '{{filterIconWidth}}px', { filterIconWidth })}
        height={t('filtericonwidthpx', '{{filterIconWidth}}px', { filterIconWidth })}
    >
        <title>{t('countFiltersSelected', '{{count}} filters selected', { count })}</title>
        <g>
            <Circle radius={filterIconWidth / 2} className={"circle filter-count"} />
            <foreignObject width={filterIconWidth} height={filterIconWidth}>
                <div aria-hidden={"true"} className={`filter-count-title`}>
                    {count}
                </div>
            </foreignObject>
        </g>
    </svg>;
};
