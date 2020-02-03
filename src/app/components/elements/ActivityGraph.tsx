import React, {useEffect, useRef, useState} from 'react';
import {bb} from "billboard.js";
import {StreakRecord} from "../../../IsaacAppTypes";
import {useDispatch, useSelector} from "react-redux";
import {AppState} from "../../state/reducers";
import {getAnsweredQuestionsByDate} from "../../state/actions";
import moment from "moment";

export const ActivityGraph = () => {
    const dispatch = useDispatch();
    const user = useSelector((state: AppState) => state && state.user);
    const answeredQuestionsByDate = useSelector((state: AppState) => state && state.answeredQuestionsByDate);

    useEffect(() => {
        if (user && user.loggedIn && user.id) {
            dispatch(getAnsweredQuestionsByDate(user.id, 0, Date.now(), true));
        }
    }, [user]);

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
                selectedDates = generateDateArray(new Date(minNonZeroDate), new Date(maxDate)).map((date) => moment(date).format("YYYY-MM-DD"));
            }
        }
        var chart = bb.generate({
            data: {
                x: "x",
                columns: [
                    ["x", ...selectedDates],
                    ["activity", ...selectedDates.map((date) => answeredQuestionsByDate ? answeredQuestionsByDate[date] || 0 : 0)]
                ],
                types: {
                    activity: "area-spline"
                },
                colors: {
                    activity: "#ffb53f"
                },
                xFormat: "%Y-%m-%d"
            },
            axis: {
                x: {
                    type: "timeseries",
                    tick: {
                        fit: false,
                        count: 8
                    }
                }
            },
            zoom: {
                enabled: true
            },
            legend: {
                show: false
            },
            spline: {
                interpolation: {
                    type: "monotone-x"
                }
            },
            bindto: "#activityGraph"
        });
    }, [answeredQuestionsByDate]);
    return <div id="activityGraph"/>
};
