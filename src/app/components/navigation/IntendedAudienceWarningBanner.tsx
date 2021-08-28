import React from "react";
import * as RS from "reactstrap";
import {SITE, SITE_SUBJECT} from "../../services/siteConstants";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isIntendedAudience, useUserContext} from "../../services/userContext";
import {useSelector} from "react-redux";
import {selectors} from "../../state/selectors";
import {EXAM_BOARD_NULL_OPTIONS, examBoardLabelMap, STAGE_NULL_OPTIONS, stageLabelMap} from "../../services/constants";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useSelector(selectors.user.orNull);
    const userContext = useUserContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return <React.Fragment />;
    }

    let message = [];
    if (!STAGE_NULL_OPTIONS.has(userContext.stage)) {
        message.push(stageLabelMap[userContext.stage]);
    }
    if (SITE.CS === SITE_SUBJECT && !EXAM_BOARD_NULL_OPTIONS.has(userContext.examBoard)) {
        message.push(examBoardLabelMap[userContext.examBoard]);
    }
    if (message.length === 0) { // should never happen...
        message.push("your account settings." /* "anyone!" */)
    }
    return <RS.Alert color="warning">
        <strong>Note: </strong>
        {`This page is not relevant for ${message.join(" ")}.`}
    </RS.Alert>
}
