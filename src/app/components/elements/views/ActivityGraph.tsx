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
            current.setMonth(current.getMonth() + 1);
        }
        return dates;
    };

    useEffect(() => {
        const foundDates = answeredQuestionsByDate ? Object.keys(answeredQuestionsByDate) : [];
        let selectedDates: string[] = [];
        let minTime;
        let maxTime;
        if (foundDates && foundDates.length > 0) {
            const nonZeroDates = foundDates.filter((date) => answeredQuestionsByDate && answeredQuestionsByDate[date] > 0);
            if (nonZeroDates.length > 0) {
                const minNonZeroDate = new Date(nonZeroDates.reduce((min, date) => date < min ? date : min));
                const maxDate = new Date(foundDates.reduce((max, date) => date > max ? date : max));
                let tempMinTime = new Date(minNonZeroDate.getTime());
                let tempMaxTime = new Date(maxDate.getTime());
                if (minNonZeroDate.getFullYear() == maxDate.getFullYear() && minNonZeroDate.getMonth() == maxDate.getMonth()) {
                    tempMinTime.setMonth(minNonZeroDate.getMonth() - 1);
                    tempMaxTime.setMonth(maxDate.getMonth() + 1);
                }
                minTime = Date.parse(tempMinTime.toString());
                maxTime = Date.parse(tempMaxTime.toString());
                selectedDates = generateDateArray(minNonZeroDate, maxDate)
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
            axis: {x: {type: "timeseries", tick: {fit: false, count: 8}, min: minTime, max: maxTime}},
            zoom: {enabled: true},
            legend: {show: false},
            spline: {interpolation: {type: "monotone-x"}},
            bindto: "#activityGraph"
        });
    }, [answeredQuestionsByDate]);

    return <div id="activityGraph"/>
};
