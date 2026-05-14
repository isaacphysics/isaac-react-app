import React from 'react';
import {Link} from "react-router-dom";
import {siteSpecific} from "../../services";
import { Alert } from 'reactstrap';
import { useTranslation } from 'react-i18next'

export const QuestionFinderBanner = () => {
    const { t } = useTranslation()
    return <Alert color={siteSpecific("danger", "info")} className={"no-print mt-3"}>
        {t('thisPageIsNoLongerSupportedAndWillSoonBeRemovedYouCan', 'This page is no longer supported and will soon be removed; you can')} <Link to="/questions">{t('findOurNewAndImprovedQuestionFinderHere', 'find our new and improved question finder here')}</Link>.
        <br/><Link to="/contact?subject=Old%20question%20finder">{t('letUsKnowAnyFeedbackAboutThisChange', 'Let us know any feedback about this change')}</Link>.
    </Alert>;
};
