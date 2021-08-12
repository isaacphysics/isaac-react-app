import React from "react";
import {Label} from "reactstrap";
import {NonAudienceContent} from "../../../../IsaacAppTypes";
import {TrueFalseRadioInput} from "./TrueFalseRadioInput";

interface NonAudienceContentInputProps {
    nonAudienceContent: NonAudienceContent;
    setNonAudienceContent: (nac: NonAudienceContent) => void;
    submissionAttempted: boolean;
}
export const NonAudienceContentInput = ({nonAudienceContent, setNonAudienceContent, submissionAttempted}: NonAudienceContentInputProps) => {
    return <div className="d-flex justify-content-between">
        <Label htmlFor="non-audience-content-radio" className="form-required pr-3">
            W
        </Label>
        <TrueFalseRadioInput
            id="non-audience-content-radio" submissionAttempted={submissionAttempted}
            stateObject={nonAudienceContent} propertyName="SEE_NON_AUDIENCE" setStateFunction={setNonAudienceContent}
        />
    </div>;
};
