import React from "react";
import { DisplaySettings } from "../../../../IsaacAppTypes";
import { Button, CardBody, UncontrolledTooltip } from "reactstrap";
import { SITE_TITLE, isAda } from "../../../services";
import { StyledCheckbox } from "../inputs/CheckboxInput";
interface UserBetaFeaturesProps {
    displaySettings: DisplaySettings;
    setDisplaySettings: (ds: DisplaySettings | ((oldDs?: DisplaySettings) => DisplaySettings)) => void;
}

export const UserBetaFeatures = ({displaySettings, setDisplaySettings}: UserBetaFeaturesProps) => {
    return <CardBody>
        <p>
            Here you can opt-in to beta features of the {SITE_TITLE} platform.
        </p>
        <StyledCheckbox type={"checkbox"} initialValue={displaySettings.HIDE_QUESTION_ATTEMPTS ?? false}
            changeFunction={e => setDisplaySettings(
                (oldDs) => ({...oldDs, HIDE_QUESTION_ATTEMPTS: e})
            )} 
            label={<>
                Hide previous question attempts
                <span id={`hide-previous-q-info`} className="icon-help mx-2" />
                <UncontrolledTooltip placement="right-start" target={`hide-previous-q-info`}>
                    This feature is helpful for revision, for example - you can attempt all of the questions
                    on the website again, without seeing your previous answers.
                </UncontrolledTooltip>
            </>}
            id={"hide-previous-q-attempts"}
        />
        {isAda && <div className="d-flex flex-row justify-content-center">
            <Button type="submit" color="primary" className="mt-4 w-50">Save</Button>
        </div>}
    </CardBody>;
};