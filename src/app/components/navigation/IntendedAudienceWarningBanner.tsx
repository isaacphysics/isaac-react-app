import React from "react";
import * as RS from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isIntendedAudience, useUserContext} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {examBoardLabelMap, stageLabelMap} from "../../services/constants";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return <React.Fragment />;
    }

    return <RS.Alert color="warning">
        <strong>Note: </strong>
        {`This page is not relevant for `}
        {SITE.PHY === SITE_SUBJECT && `${stageLabelMap[userContext.stage]}.`}
        {SITE.CS === SITE_SUBJECT && `${stageLabelMap[userContext.stage]} ${examBoardLabelMap[userContext.examBoard]}.`}
    </RS.Alert>
}
