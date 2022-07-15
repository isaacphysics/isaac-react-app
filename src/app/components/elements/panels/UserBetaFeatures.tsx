import React from "react";
import {DisplaySettings} from "../../../../IsaacAppTypes";
import {CardBody, CustomInput, UncontrolledTooltip} from "reactstrap";
import {SITE_SUBJECT_TITLE} from "../../../services/siteConstants";
interface UserBetaFeaturesProps {
    displaySettings?: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

export const UserBetaFeatures = ({displaySettings, setDisplaySettings}: UserBetaFeaturesProps) => {
    return <CardBody>
        <p>
            Here you can opt-in to beta features of the Isaac {SITE_SUBJECT_TITLE} platform.
        </p>
        <CustomInput type={"checkbox"} checked={displaySettings?.HIDE_QUESTION_ATTEMPTS}
                     onChange={e => setDisplaySettings(
                         (oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked})
                     )} label={<>
                        Hide previous question attempts
                        <span id={`hide-previous-q-info`} className="icon-help mx-2" />
                        <UncontrolledTooltip placement="right-start" target={`hide-previous-q-info`}>
                            This feature is helpful for revision for example - you can attempt all of the questions
                            on the platform again, without seeing your previous answers (correct or not).
                        </UncontrolledTooltip>
                     </>}
                     id={"hide-previous-q-attempts"}
        />
    </CardBody>;
}