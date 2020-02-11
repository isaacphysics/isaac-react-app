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
            data: {type: "gauge", columns: [["data", (streakRecord && streakRecord.currentActivity) || 0]]},
            gauge: {
                fullCircle: true, max: 3, startingAngle: 0,
                label: {
                    extents: () => "",
                    format: () => (streakRecord && streakRecord.currentStreak || 0).toString()
                }
            },
            color: {pattern: ["#00FF00"], threshold: {values: [0]}},
            size: {height: 180},
            legend: {show: false},
            bindto: "#dailyStreakChart",
            tooltip: {show: false}
        });
    }, [streakRecord]);
    return <div className={"auto-margin"} id="dailyStreakChart"/>
};
