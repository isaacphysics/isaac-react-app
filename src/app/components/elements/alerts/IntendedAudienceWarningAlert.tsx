import React from "react";
import {ContentBaseDTO} from "../../../../IsaacApiTypes";
import {examBoardLabelMap, isAda, isIntendedAudience, isLoggedIn, stageLabelMap, useUserViewingContext} from "../../../services";
import {selectors, useAppSelector} from "../../../state";
import {RenderNothing} from "../RenderNothing";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";

export function IntendedAudienceWarningAlert({doc}: {doc: ContentBaseDTO}) {
    const user = useAppSelector(selectors.user.orNull);
    const userViewingContext = useUserViewingContext();

    // Specific Ada pages that should never show this banner
    const adaExcludedPages = /topic_summary_proj_data_science|(coursedata_unit([1-9]|10|11)|topic_summary_data_science_epq|epq_ds_intro|epq_ds_project_examples)/;

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userViewingContext, user) || (isAda && doc.id && adaExcludedPages.test(doc.id))) {
        return RenderNothing;
    }

    return <Alert color="warning" className={"no-print"}>
        {userViewingContext.contexts.length === 1 && userViewingContext.contexts[0].examBoard && userViewingContext.contexts[0].stage ?
            `There is no content on this page for ${examBoardLabelMap[userViewingContext.contexts[0].examBoard]} ${stageLabelMap[userViewingContext.contexts[0].stage]}. ` :
            `There is no content on this page for your stage ${isAda && "and exam board"} preferences. `
        }
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
