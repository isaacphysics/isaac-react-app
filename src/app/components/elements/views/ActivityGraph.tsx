import React, {useEffect} from 'react';
import {bb} from "billboard.js";
import {NUMERIC_DATE} from "../DateString";
import {AnsweredQuestionsByDate} from "../../../../IsaacApiTypes";

export const ActivityGraph = ({answeredQuestionsByDate}: {answeredQuestionsByDate: AnsweredQuestionsByDate}) => {

    let selectedDates: string[] = [];
    const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
    if (foundDates && foundDates.length > 0) {
        const nonZeroDates = foundDates.filter((date) => answeredQuestionsByDate && answeredQuestionsByDate[date] > 0);
        if (nonZeroDates.length > 0) {
            selectedDates = foundDates.sort().map((date) => NUMERIC_DATE.format(new Date(date)).split("/").reverse().join("-"));
        }
    }

    useEffect(() => {
        bb.generate({
            data: {
                x: "x",
                columns: [
                    ["x", ...selectedDates],
                    ["activity", ...selectedDates.map((date) => answeredQuestionsByDate ? answeredQuestionsByDate[date] || 0 : 0)]
                ],
                types: {activity: "area-spline"},
                colors: {activity: "#ffb53f"},
                xFormat: "%Y-%m-%d"
            },
            axis: {x: {type: "timeseries", tick: {fit: false, format: '%b %Y', count: Math.min(8, selectedDates.length)}}},
            zoom: {enabled: true},
            legend: {show: false},
            spline: {interpolation: {type: "monotone-x"}},
            bindto: "#activityGraph"
        });
    }, [answeredQuestionsByDate, selectedDates]);

    return <div id="activityGraph"/>
};
