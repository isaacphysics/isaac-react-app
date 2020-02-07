import * as RS from "reactstrap";
import {DailyStreakGauge} from "../views/DailyStreakGauge";
import React from "react";
import {UserProgress} from "../../../../IsaacAppTypes";

export const DailyStreakPanel = ({userProgress}: {userProgress?: UserProgress | null}) => {
    return <React.Fragment>
        <RS.Row>
            <div className={"text-center-width"}>
                Daily streak
            </div>
        </RS.Row>
        <RS.Row>
            <DailyStreakGauge streakRecord={userProgress?.userSnapshot?.streakRecord}/>
        </RS.Row>
        <RS.Row>
            <div id="streak-help" className={"text-center-width"}>
                Longest streak: {userProgress?.userSnapshot?.streakRecord?.largestStreak || 0} days
            </div>
            <RS.UncontrolledTooltip placement="bottom" target="streak-help">
                <div className="text-left">
                    The daily streak indicates the number of consecutive days you have been active on Isaac.<br/>
                    Answer at least <b>three question parts</b> correctly per day to fill up your daily progress bar and increase your streak!
                </div>
            </RS.UncontrolledTooltip>
        </RS.Row>
    </React.Fragment>
};
