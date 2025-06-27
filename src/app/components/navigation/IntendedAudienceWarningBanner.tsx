import React from "react";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {isAda, isIntendedAudience, isLoggedIn} from "../../services";
import {selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const user = useAppSelector(selectors.user.orNull);
    const userContexts = user?.loggedIn && user.registeredContexts;
    // If this page is intended for this user's context no need to show a warning banner
    if (!userContexts || userContexts.some(uc => isIntendedAudience(doc.audience, uc, user))) {
        return RenderNothing;
    }

    return <Alert color="warning" className={"no-print"}>
        {`There is no content on this page for your stage ${isAda && "and exam board"} preferences. `}
        { isLoggedIn(user) &&
            <>
                You can change your preferences <strong>by updating your profile <Link to="/account">here</Link>.</strong>
            </>
        }
        <br/><br/>
        {"If you think that the page is incorrectly tagged, please "}
        <strong><Link to={`/contact?preset=contentProblem&page=${doc.id}`}>contact us</Link></strong>.
    </Alert>;
}
