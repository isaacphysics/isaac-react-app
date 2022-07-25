import React from "react";
import * as RS from "reactstrap";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isIntendedAudience, notRelevantMessage, useUserContext} from "../../services/userContext";
import {useAppSelector} from "../../state/store";
import {selectors} from "../../state/selectors";
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
        {`The content on this page has ${notRelevantMessage(userContext)}. You can change your viewing preferences by updating your profile.`}
    </RS.Alert>
}
