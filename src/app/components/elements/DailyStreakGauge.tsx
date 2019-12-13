import React, {useEffect, useRef, useState} from 'react';
import {bb} from "billboard.js";
import "billboard.js/dist/theme/insight.css"; //TODO remove this??
import {StreakRecord} from "../../../IsaacAppTypes";

interface DailyStreakGaugeProps {
    streakRecord: StreakRecord | null | undefined;
}

export const DailyStreakGauge = (props: DailyStreakGaugeProps) => {
    const {streakRecord} = props;
    useEffect(() => {
        bb.generate({
            data: {
                columns: [
                    ["data", (streakRecord && streakRecord.currentActivity) || 0]
                ],
                type: "gauge",
            },
            gauge: {
                fullCircle: true,
                label: {
                    extents: () => "",
                    format: () => (streakRecord && streakRecord.currentStreak || 0).toString()
                },
                max: 3,
                startingAngle: 0
            },
            color: {
                pattern: [
                    "#00FF00",
                ],
                threshold: {
                    values: [
                        0,
                    ]
                }
            },
            size: {
                height: 180
            },
            legend: {
                show: false,
            },
            bindto: "#dailyStreakChart",
            tooltip: {
                show: false
            }
        });
    }, [streakRecord]);
    return <div className={"auto-margin"} id="dailyStreakChart"/>
};