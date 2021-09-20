import React from "react";
import * as RS from "reactstrap";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isIntendedAudience, notRelevantMessage, useUserContext} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return <React.Fragment />;
    }

    return <RS.Alert color="warning">
        <strong>Note: </strong>
        {`This page is ${notRelevantMessage(userContext)}.`}
    </RS.Alert>
}
