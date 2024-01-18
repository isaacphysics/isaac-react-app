import React from "react";
import { DisplaySettings } from "../../../../IsaacAppTypes";
import { SITE_TITLE } from "../../../services";
import { StyledCheckbox } from "../inputs/CheckboxInput";
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
                changeFunction={e => setDisplaySettings(
                    (oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e})
                )} 
                label={<p><b>Hide previous question attempts</b></p>}
                id={"hide-previous-q-attempts"}
            />
            This feature is helpful for revision, for example - you can attempt all of the questions on the website again, without seeing your previous answers.
        </>}
    />;
};