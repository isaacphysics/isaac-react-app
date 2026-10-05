import React from "react";
import {ContentBaseDTO} from "../../../../IsaacApiTypes";
import {examBoardLabelMap, isAda, isIntendedAudience, isLoggedIn, stageLabelMap, useUserViewingContext} from "../../../services";
import {selectors, useAppSelector} from "../../../state";
import {RenderNothing} from "../RenderNothing";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";
import { Trans, useTranslation } from "react-i18next";

export function IntendedAudienceWarningAlert({doc}: {doc: ContentBaseDTO}) {
    const { t } = useTranslation();
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return RenderNothing;
    }

    return <Alert color="warning" className={"no-print"}>
        {userContext.contexts.length === 1 && userContext.contexts[0].examBoard && userContext.contexts[0].stage ?
            t("common:intendedAudience.warning.noContentFor", { examBoard: examBoardLabelMap[userContext.contexts[0].examBoard], stage: stageLabelMap[userContext.contexts[0].stage] }) :
            `There is no content on this page for your stage ${isAda && "and exam board"} preferences. `
        }
        { isLoggedIn(user) &&
            <>
                <Trans
                    i18nKey="common:intendedAudience.warning.changePreferences"
                    components={{
                        strong: <strong />,
                        accountLink: <Link to="/account" />,
                    }}
                />
            </>
        }
        <br/><br/>
        <Trans
            i18nKey="common:intendedAudience.warning.reportTaggingIssue"
            components={{
                strong: <strong />,
                contactLink: <Link to={`/contact?preset=contentProblem&page=${doc.id}`} />,
            }}
        />
    </Alert>;
}
