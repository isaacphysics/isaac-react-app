import React from "react";
import * as RS from "reactstrap";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {examBoardLabelMap, isIntendedAudience, stageLabelMap, useUserContext} from "../../services";
import {selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return RenderNothing;
    }

    return <RS.Alert color="warning" className={"no-print"}>
        <strong>Note: </strong>
        {`There is no content on this page for ${examBoardLabelMap[userContext.examBoard]} ${stageLabelMap[userContext.stage]}. ` +
        "You can change you preferences "}
        <strong>by updating your profile <a href="\account">here</a>.</strong>
    </RS.Alert>;
}
