import React, {useEffect, useMemo, useRef} from 'react';
import {areaSpline, bb, zoom} from "billboard.js";
import {AnsweredQuestionsByDate} from "../../../../IsaacApiTypes";
import {formatISODateOnly} from "../DateString";
import throttle from 'lodash/throttle';

type ActivityGraphProps = {
    id: string, // unique ID for the graph, so that multiple graphs can be rendered on the same page
    answeredQuestionsByDate: AnsweredQuestionsByDate,
    caption: string,
    colour: string,
    emptyText?: React.JSX.Element
};

export const ActivityGraph = ({ id, answeredQuestionsByDate, caption, colour, emptyText }: ActivityGraphProps) => {
    const graphRef = useRef<HTMLDivElement>(null);

    const selectedDates = useMemo(() => {
        const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
        if (foundDates && foundDates.length > 0) {
            const nonZeroDates = foundDates.filter((date) => answeredQuestionsByDate && answeredQuestionsByDate[date] > 0);
            if (nonZeroDates.length > 0) {
                return foundDates.sort();
            }
        }
        return [];
    }, [answeredQuestionsByDate]);

    const regenerateGraph = useMemo(() => {
        return throttle(() => {
            if (selectedDates.length === 0) {
                return;
            }
            let minDate, maxDate;
            let nTicks = selectedDates.length;
            if (selectedDates.length === 1) {
                // If only one datapoint, Billboard shows a decade of time on the x-axis. Truncate to one month each side:
                const firstDate = new Date(selectedDates[0]);
                minDate = formatISODateOnly(new Date(firstDate.getFullYear(), firstDate.getMonth()-1, 1));
                maxDate = formatISODateOnly(new Date(firstDate.getFullYear(), firstDate.getMonth()+1, 1));
                nTicks = 3;  // For one month, we need 3 labels for symmetry else label ends up in wrong place.
            }
            bb.generate({
                data: {
                    x: "x",
                    columns: [
                        ["x", ...selectedDates],
                        [caption, ...selectedDates.map((date) => answeredQuestionsByDate ? answeredQuestionsByDate[date] || 0 : 0)]
                    ],
                    types: {[caption]: areaSpline()},
                    colors: {[caption]: colour},
                    xFormat: "%Y-%m-%d",
                },
                axis: {
                    x: {
                        type: "timeseries",
                        tick: {fit: false, format: '%b %Y', count: Math.min(8, nTicks)},
                        min: minDate,  // If these are undefined, then the values from the data will be used.
                        max: maxDate,
                    }
                },
                zoom: {enabled: zoom()},
                legend: {show: false},
                spline: {interpolation: {type: "monotone-x"}},
                bindto: `#activity-graph-${id}`,
                padding: {top: 0, right: 30, bottom: 30, left: 35}  // Pad sides to avoid tick labels being truncated!
            });
        }, 250);
    }, [answeredQuestionsByDate, selectedDates, caption, colour, id]);

    useEffect(() => {
        // rerun the graph generation if any dependencies change
        regenerateGraph();

        // also reset the resizing listener, so that the correct update function is called if the window is resized
        const handleResize = () => regenerateGraph();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, [regenerateGraph]);

    return selectedDates.length > 0
        ? <div id={`activity-graph-${id}`} key={`activity-graph-${id}`} ref={graphRef} />
        : <div key="graph-empty-state" className="text-center-width">
            <strong>No data{emptyText ? '.' : ''} {emptyText}</strong>
        </div>;
};
