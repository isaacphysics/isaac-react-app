import React from 'react';
import {StreakRecord} from "../../../../IsaacAppTypes";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";

interface DailyStreakGaugeProps {
    streakRecord: StreakRecord | null | undefined;
}

export const DailyStreakGauge = (props: DailyStreakGaugeProps) => {
    const {streakRecord} = props;
    return <CircularProgressbarWithChildren value={streakRecord?.currentActivity || 0}
        maxValue={3}
        strokeWidth={15}
        styles={buildStyles({
            pathColor: '#509E2E',
            trailColor: '#c9cad1'

        })}>
        <div style={{fontSize: 24}}>
            {streakRecord?.currentStreak || 0}
        </div>
    </CircularProgressbarWithChildren>
};

export const HeaderDailyStreakGauge = (props: DailyStreakGaugeProps) => {
    const {streakRecord} = props;
    return <CircularProgressbarWithChildren value={streakRecord?.currentActivity || 0}
        maxValue={3}
        styles={buildStyles({
            pathColor: '#509E2E',
            trailColor: '#c9cad1'
        })}>
        <div style={{fontSize: 24}}>
            {streakRecord?.currentStreak || 0}
        </div>
    </CircularProgressbarWithChildren>
}
