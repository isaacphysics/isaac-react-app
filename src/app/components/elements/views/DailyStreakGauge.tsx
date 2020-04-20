import React, {useEffect} from 'react';
import {bb} from "billboard.js";
import {StreakRecord} from "../../../../IsaacAppTypes";

interface DailyStreakGaugeProps {
    streakRecord: StreakRecord | null | undefined;
}

export const DailyStreakGauge = (props: DailyStreakGaugeProps) => {
    const {streakRecord} = props;
    useEffect(() => {
        bb.generate({
            data: {
                type: "gauge",
                columns: [["data", (streakRecord && streakRecord.currentActivity) || 0]]
            },
            gauge: {
                fullCircle: true, max: 3, startingAngle: 0,
                label: {
                    extents: () => "",
                    format: () => (streakRecord && streakRecord.currentStreak || 0).toString()
                }
            },
            color: {pattern: ["#509E2E"], threshold: {values: [0]}},
            size: {height: 130},
            legend: {show: false},
            bindto: "#daily-streak-chart",
            tooltip: {show: false},
        });
    }, [streakRecord]);
    return <div className={"auto-margin"} id="daily-streak-chart"/>
};
