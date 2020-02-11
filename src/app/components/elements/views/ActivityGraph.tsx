import React, {useEffect} from 'react';
import {bb} from "billboard.js";
import {NUMERIC_DATE} from "../DateString";
import {AnsweredQuestionsByDate} from "../../../../IsaacApiTypes";

export const ActivityGraph = ({answeredQuestionsByDate}: {answeredQuestionsByDate: AnsweredQuestionsByDate}) => {
    const generateDateArray = (min: Date, max: Date) => {
        const current = new Date(min);
        const dates = [];
        while (current <= max) {
            dates.push(new Date(current));
            current.setDate(current.getDate() + 1);
        }
        return dates;
    };

    useEffect(() => {
        const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
        let selectedDates = [] as string[];
        if (foundDates && foundDates.length > 0) {
            const nonZeroDates = foundDates.filter((date) => answeredQuestionsByDate && answeredQuestionsByDate[date] > 0);
            if (nonZeroDates.length > 0) {
                const minNonZeroDate = nonZeroDates.reduce((min, date) => date < min ? date : min);
                const maxDate = foundDates.reduce((max, date) => date > max ? date : max);
                selectedDates = generateDateArray(new Date(minNonZeroDate), new Date(maxDate))
                    .map((date) => NUMERIC_DATE.format(date).split("/").reverse().join("-"));
            }
        }
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
            axis: {x: {type: "timeseries", tick: {fit: false, count: 8}}},
            zoom: {enabled: true},
            legend: {show: false},
            spline: {interpolation: {type: "monotone-x"}},
            bindto: "#activityGraph"
        });
    }, [answeredQuestionsByDate]);

    return <div id="activityGraph"/>
};
