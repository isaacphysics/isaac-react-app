import React from "react";
import { DismissibleBanner } from "./DismissibleBanner";
import { Link } from "react-router-dom";
import { isPhy } from "../../services";
import { useTranslation, Trans } from 'react-i18next'

export const IsaacScienceLaunchBanner = () => {
    const { t } = useTranslation()
    return isPhy && <DismissibleBanner cookieName="isaacScienceLaunchBannerDismissed" theme="info">
        {t('isaacScienceIsTheNewHomeOfIsaacPhysics', 'Isaac Science is the new home of Isaac Physics.')}{" "}
        {t('ifYouHavenapostAlreadyPlease', 'If you haven&apos;t already, please')} <Link to="/pages/isaacscience" target="_blank" className="d-inline"><Trans i18nKey="readMoreAboutHowTheChangeSpanClassnamevisuallyhiddentoIsaacSciencespanMightAffectYou">read more about how the change <span className="visually-hidden">to Isaac Science</span> might affect you</Trans></Link>.
    </DismissibleBanner>;
};
