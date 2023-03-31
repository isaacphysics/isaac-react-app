import React from "react";
import {DisplaySettings} from "../../../../IsaacAppTypes";
import {CardBody, CustomInput, UncontrolledTooltip} from "reactstrap";
import {SITE_TITLE} from "../../../services";
interface UserBetaFeaturesProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

export const UserBetaFeatures = ({displaySettings, setDisplaySettings}: UserBetaFeaturesProps) => {
    return <CardBody>
        <p>
            Here you can opt-in to beta features of the {SITE_TITLE} platform.
        </p>
        <CustomInput type={"checkbox"} checked={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
                     onChange={e => setDisplaySettings(
                         (oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e.target.checked})
                     )} label={<>
                        Hide previous question attempts
                        <span id={`hide-previous-q-info`} className="icon-help mx-2" />
                        <UncontrolledTooltip placement="right-start" target={`hide-previous-q-info`}>
                            This feature is helpful for revision, for example - you can attempt all of the questions
                            on the website again, without seeing your previous answers.
                        </UncontrolledTooltip>
                     </>}
                     id={"hide-previous-q-attempts"}
        />
    </CardBody>;
}