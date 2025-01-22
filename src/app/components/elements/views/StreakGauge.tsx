import React from 'react';
import {UserSnapshot} from "../../../../IsaacAppTypes";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";
import {GRAY_120, progressColour} from "../../../services";

interface StreakGaugeProps {
    streakRecord: UserSnapshot | null | undefined;
}

export const StreakGauge = (props: StreakGaugeProps) => {
    const {streakRecord} = props;
    const streakActivity = streakRecord?.weeklyStreakRecord?.currentActivity || 0;
    const currentStreak = streakRecord?.weeklyStreakRecord?.currentStreak || 0;
    const maxParts = 10;
    return <CircularProgressbarWithChildren value={streakActivity}
        maxValue={maxParts}
        strokeWidth={15}
        styles={buildStyles({
            pathColor: progressColour,
            trailColor: GRAY_120

        })}>
        <div style={{fontSize: 24}}>
            {currentStreak}
        </div>
    </CircularProgressbarWithChildren>;
};

export const HeaderStreakGauge = (props: StreakGaugeProps) => {
    const {streakRecord} = props;
    const streakActivity = streakRecord?.weeklyStreakRecord?.currentActivity || 0;
    const currentStreak = streakRecord?.weeklyStreakRecord?.currentStreak || 0;
    const maxParts = 10;
    return <CircularProgressbarWithChildren value={streakActivity}
        maxValue={maxParts}
        strokeWidth={12}
        styles={buildStyles({
            pathColor: progressColour,
            trailColor: GRAY_120
        })}>
        <div style={{fontSize: 18}}>
            {currentStreak}
        </div>
    </CircularProgressbarWithChildren>;
};

export const DashboardStreakGauge = (props: StreakGaugeProps) => {
    const {streakRecord} = props;
    const streakActivity = streakRecord?.weeklyStreakRecord?.currentActivity || 0;
    const currentStreak = streakRecord?.weeklyStreakRecord?.currentStreak || 0;
    const maxParts = 10;
    return <CircularProgressbarWithChildren value={streakActivity}
        maxValue={maxParts}
        strokeWidth={6}
        background={true}
        styles={buildStyles({
            pathColor: "#3A8621", // color-brand-500
            trailColor: GRAY_120,
            backgroundColor: "#FFFFFF"
        })}>
        <div className="streak-panel-gauge">
            <b>{currentStreak}</b><br/>WEEK{currentStreak !== 1 && "S"}
        </div>
    </CircularProgressbarWithChildren>;
};