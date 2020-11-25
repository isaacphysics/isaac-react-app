import React from 'react';
import {UserSnapshot} from "../../../../IsaacAppTypes";
import {buildStyles, CircularProgressbarWithChildren} from "react-circular-progressbar";
import {GRAY_120, ISAAC_GREEN} from "../../../services/constants";
import {SITE, SITE_SUBJECT} from "../../../services/siteConstants";

interface StreakGaugeProps {
    streakRecord: UserSnapshot | null | undefined;
}

export const StreakGauge = (props: StreakGaugeProps) => {
    const {streakRecord} = props;
    return <CircularProgressbarWithChildren value={streakRecord?.dailyStreakRecord?.currentActivity || 0}
        maxValue={3}
        strokeWidth={15}
        styles={buildStyles({
            pathColor: ISAAC_GREEN,
            trailColor: GRAY_120

        })}>
        <div style={{fontSize: 24}}>
            {streakRecord?.dailyStreakRecord?.currentStreak || 0}
        </div>
    </CircularProgressbarWithChildren>
};

export const HeaderStreakGauge = (props: StreakGaugeProps) => {
    const {streakRecord} = props;
    const streakActivity = {
        [SITE.CS]: (streakRecord?.weeklyStreakRecord?.currentActivity || 0),
        [SITE.PHY]: (streakRecord?.dailyStreakRecord?.currentActivity || 0),
    }[SITE_SUBJECT];
    const currentStreak = {
        [SITE.CS]: (streakRecord?.weeklyStreakRecord?.currentStreak || 0),
        [SITE.PHY]: (streakRecord?.dailyStreakRecord?.currentStreak || 0),
    }[SITE_SUBJECT];
    const maxParts = {
        [SITE.CS]: 10,
        [SITE.PHY]: 3
    }[SITE_SUBJECT]
    return <CircularProgressbarWithChildren value={streakActivity}
        maxValue={maxParts}
        styles={buildStyles({
            pathColor: ISAAC_GREEN,
            trailColor: GRAY_120
        })}>
        <div style={{fontSize: 18}}>
            {currentStreak}
        </div>
    </CircularProgressbarWithChildren>
}
