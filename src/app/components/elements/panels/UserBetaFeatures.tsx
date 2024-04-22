import React from "react";
import { DisplaySettings } from "../../../../IsaacAppTypes";
import { SITE_TITLE, siteSpecific } from "../../../services";
import { StyledCheckbox } from "../inputs/StyledCheckbox";
import { MyAccountTab } from "./MyAccountTab";
interface UserBetaFeaturesProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

export const UserBetaFeatures = ({displaySettings, setDisplaySettings}: UserBetaFeaturesProps) => {
    return <MyAccountTab
        leftColumn={<>
            <h3>Beta Features</h3>
            <p>Here you can opt-in to beta features of the {SITE_TITLE} platform.</p>
        </>}
        rightColumn={<>
            <StyledCheckbox type={"checkbox"} initialValue={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
                onChange={e => setDisplaySettings(
                    (oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked})
                )} 
                label={<p><b>Hide previous question attempts</b></p>}
                id={"hide-previous-q-attempts"}
            />
            <p>{`This feature lets you answer questions ${siteSpecific("that you have answered before, without seeing your old answer.", "again, even if you've answered them before.")} It's useful if you are reviewing a topic before a test or exam.`}</p>
        </>}
    />;
};
