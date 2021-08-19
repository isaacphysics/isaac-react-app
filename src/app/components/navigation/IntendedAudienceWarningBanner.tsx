import React from "react";
import * as RS from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isIntendedAudience, useUserContext} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {DOCUMENT_TYPE} from "../../services/constants";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return <React.Fragment />;
    }

    return <RS.Alert color="warning">
        <strong>Note: </strong>
        {`This ${doc.type === DOCUMENT_TYPE.QUESTION ? "question" : doc.type === DOCUMENT_TYPE.CONCEPT ? "concept" : "content"} `}
        {`is not intended for your selected stage${SITE_SUBJECT === SITE.CS ? " or exam board" : ""}.`}
    </RS.Alert>
}
