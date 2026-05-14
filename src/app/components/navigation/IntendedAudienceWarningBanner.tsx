import React from "react";
import {ContentBaseDTO} from "../../../IsaacApiTypes";
import {examBoardLabelMap, isAda, isIntendedAudience, isLoggedIn, stageLabelMap, useUserViewingContext} from "../../services";
import {selectors, useAppSelector} from "../../state";
import {RenderNothing} from "../elements/RenderNothing";
import { Link } from "react-router-dom";
import { Alert } from "reactstrap";
import { useTranslation } from 'react-i18next'

export function IntendedAudienceWarningBanner({doc}: {doc: ContentBaseDTO}) {
    const { t } = useTranslation()
    const user = useAppSelector(selectors.user.orNull);
    const userContext = useUserViewingContext();

    // If this page is intended for this user's context no need to show a warning banner
    if (isIntendedAudience(doc.audience, userContext, user)) {
        return RenderNothing;
    }

    return <Alert color="warning" className={"no-print"}>
        {userContext.contexts.length === 1 && userContext.contexts[0].examBoard && userContext.contexts[0].stage ?
            t('thereIsNoContentOnThisPageForValVal2', 'There is no content on this page for {{val}} {{val2}}.', { val: examBoardLabelMap[userContext.contexts[0].examBoard], val2: stageLabelMap[userContext.contexts[0].stage] }) :
            t('thereIsNoContentOnThisPageForYourStageValPreferences', 'There is no content on this page for your stage {{val}} preferences.', { val: isAda && "and exam board" })
        }
        { isLoggedIn(user) &&
            <>
                {t('youCanChangeYourPreferences', 'You can change your preferences')} <strong>{t('byUpdatingYourProfile', 'by updating your profile')} <Link to="/account">here</Link>.</strong>
            </>
        }
        <br/><br/>
        {t('ifYouThinkThatThePageIsIncorrectlyTaggedPlease', 'If you think that the page is incorrectly tagged, please ')}
        <strong><Link to={`/contact?preset=contentProblem&page=${doc.id}`}>contact us</Link></strong>.
    </Alert>;
}
