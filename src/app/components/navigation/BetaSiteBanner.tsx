import React from 'react';
import {Alert, Container} from 'reactstrap';
import {Link} from "react-router-dom";
import {isPhy} from "../../services";
import { useTranslation, Trans } from 'react-i18next'

export const BetaSiteBanner = () => {
    const { t } = useTranslation()

    return isPhy ? <Alert color="warning" className="mb-0 border-radius-0 mx-0 no-print" fade={false}>
        <Container className="text-center">
                 {t('thisSiteIsStillUnderConstructionYouCan', 'This site is still under construction.\n            You can')} <a href="https://isaacphysics.org/pages/isaacscience" target="_blank"><Trans i18nKey="learnMoreAboutOurRedesignSpanClassnamevisuallyhiddeninANewTabspan">learn more about our redesign <span className="visually-hidden">(in a new tab)</span></Trans></a>{t('or', ',\n            or')} <Link to="/contact?subject=Isaac%20Science">{t('giveUsAnyFeedbackHere', 'give us any feedback here')}</Link>.
        </Container>
    </Alert> : null;
};
