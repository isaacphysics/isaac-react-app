import React from 'react';
import {AnsweredQuestionsByDate} from "../../../../IsaacApiTypes";
import {SHORT_DAYS, SHORT_MONTHS} from "../../../services/constants";
import {HeatMapGrid} from "react-grid-heatmap/dist";
import {NUMERIC_DATE} from "../DateString";
import {overflowModulus} from "../../../services/miscUtils";


export const ProgressHeatmap = ({answeredQuestionsByDate}: {answeredQuestionsByDate: AnsweredQuestionsByDate}) => {
    const HEATMAP_COLUMNS = 25;
    const yLabels = SHORT_DAYS;

    const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
    const heatmapData: number[][] = Array(yLabels.length).fill(0).map(() => Array(HEATMAP_COLUMNS).fill(0).map(() => Math.floor(0)));
    if (foundDates?.length > 0) {
        const maxDate = new Date();
        const minDate = new Date();
        minDate.setDate(-HEATMAP_COLUMNS * 7);
        foundDates.forEach(dateString => {
            const date = new Date(dateString);
            const diffWeeks = Math.floor(Math.round(Math.abs(maxDate.getTime() - date.getTime()) / (24 * 3600 * 1000)) / 7);
            heatmapData[overflowModulus(date.getDay() - 1, 7)][diffWeeks] = answeredQuestionsByDate[dateString] || 0;
        })
    }

    const xLabels = new Array(HEATMAP_COLUMNS).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(-i * 7);
        return date.getDate() < 7 ? SHORT_MONTHS[date.getMonth()] : "";
    });

    const lookupDateFromPos = (x: number, y: number): Date => {
        const date = new Date();
        date.setDate(date.getDate() - (overflowModulus(date.getDay() - 1, 7) - x) - (7 * y));
        return date;
    }

    return <div
        style={{
            width: '100%'
        }}>
        <HeatMapGrid
            yLabels={yLabels}
            xLabels={xLabels}
            xLabelsPos={"bottom"}
            data={heatmapData}
            cellHeight='2rem'
            cellStyle={(x, y, ratio) => ({
                background: ratio > 0 ? `rgba(66, 86, 244, ${(ratio * 0.9) + 0.1})` : "rgb(245, 245, 245)",
                fontSize: "11px",
            })}
            cellRender={(x, y, value) => (
                <div style={{height: "100%"}} key={`${x}-${y}`} title={`${value} questions answered on ${NUMERIC_DATE.format(lookupDateFromPos(x, y))}`}/>
            )}
        />
    </div>
};
