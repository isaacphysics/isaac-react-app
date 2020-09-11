import React from 'react';
import {NUMERIC_DATE} from "../DateString";
import {AnsweredQuestionsByDate} from "../../../../IsaacApiTypes";
import HeatMap from "react-heatmap-grid";
import {SHORT_DAYS, SHORT_MONTHS} from "../../../services/constants";


export const ProgressHeatmap = ({answeredQuestionsByDate}: {answeredQuestionsByDate: AnsweredQuestionsByDate}) => {
    const generateDateArray = (min: Date, max: Date) => {
        const current = new Date(min);
        const dates = [];
        while (current <= max) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    const HEATMAP_COLUMNS = 25;
    const yLabels = SHORT_DAYS;


    const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
    const heatmapData: number[][] = Array(yLabels.length).fill(0).map(() => Array(HEATMAP_COLUMNS).fill(0).map(() => Math.floor(0)));
    if (foundDates?.length > 0) {
        const maxDate = new Date();
        const minDate = new Date(maxDate);
        minDate.setDate(-HEATMAP_COLUMNS * 7);
        foundDates.forEach(dateString => {
            const date = new Date(dateString);
            const diffWeeks = Math.floor(Math.round(Math.abs(maxDate.getTime() - date.getTime()) / (24 * 3600 * 1000)) / 7);
            heatmapData[date.getDay()][diffWeeks] = answeredQuestionsByDate[dateString] || 0;
        })
    }

    const xLabels = new Array(HEATMAP_COLUMNS).fill(0).map((_, i) => {
        const date = new Date();
        date.setDate(-i * 7);
        return date.getDate() < 7 ? SHORT_MONTHS[date.getMonth()] : "";
    });
    return <HeatMap
        yLabels={yLabels}
        xLabels={xLabels}
        xLabelsLocation={"bottom"}
        data={heatmapData}
        cellStyle={(background: string, value: number, min: number, max: number, data: number, x: number, y: number) => ({
            background: value > 0 ? `rgba(66, 86, 244, ${1 - ((max - value) / (max - min) * 0.7)})` : "rgb(245, 245, 245)",
            fontSize: "11px",
        })}
        squares
        // cellRender={(value: string) => value && `${value}`}
        title={(value: number) => `${value} questions answered`}
    />
};
