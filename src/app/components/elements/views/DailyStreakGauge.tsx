import React from 'react';
import {StreakRecord} from "../../../../IsaacAppTypes";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";
import {GRAY_120, ISAAC_GREEN} from "../../../services/constants";

interface DailyStreakGaugeProps {
    streakRecord: StreakRecord | null | undefined;
}

export const DailyStreakGauge = (props: DailyStreakGaugeProps) => {
    const {streakRecord} = props;
    return <CircularProgressbarWithChildren value={streakRecord?.currentActivity || 0}
        maxValue={3}
        strokeWidth={15}
        styles={buildStyles({
            pathColor: ISAAC_GREEN,
            trailColor: GRAY_120

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
            pathColor: ISAAC_GREEN,
            trailColor: GRAY_120
        })}>
        <div style={{fontSize: 24}}>
            {streakRecord?.currentStreak || 0}
        </div>
    </CircularProgressbarWithChildren>
}
