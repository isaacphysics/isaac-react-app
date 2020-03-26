import * as RS from "reactstrap";
import {DailyStreakGauge} from "../views/DailyStreakGauge";
import React from "react";
import {UserProgress} from "../../../../IsaacAppTypes";

export const DailyStreakPanel = ({userProgress}: {userProgress?: UserProgress | null}) => {
    const largestStreak = userProgress?.userSnapshot?.dailyStreakRecord?.largestStreak || 0;
    return <React.Fragment>
        <div className={"text-center-width"}>
            Daily streak
        </div>
        <DailyStreakGauge streakRecord={userProgress?.userSnapshot?.dailyStreakRecord}/>
        <div id="streak-help" className={"text-center-width"}>
            Longest streak: {largestStreak}&nbsp;day{largestStreak != 1 && "s"}
        </div>
        <RS.UncontrolledTooltip placement="bottom" target="streak-help">
            <div className="text-left">
                The daily streak indicates the number of consecutive days you have been active on Isaac.<br/>
                Answer at least <b>three question parts</b> correctly per day to fill up your daily progress bar and increase your streak!
            </div>
        </RS.UncontrolledTooltip>
    </React.Fragment>
};
