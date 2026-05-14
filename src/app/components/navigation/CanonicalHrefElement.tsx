import {useLocation} from "react-router-dom";
import {Helmet} from "react-helmet";
import React from "react";
import { useTranslation } from 'react-i18next'

export const CanonicalHrefElement = () => {
    const { t } = useTranslation()
    let canonicalPath = "";
    const location = useLocation();
    if (location.pathname !== "/") {
        canonicalPath = location.pathname;
    }
    const canonicalHref = t('origincanonicalpath', '{{origin}}{{canonicalPath}}', { origin: window.location.origin, canonicalPath });
    return <Helmet>
        <link rel="canonical" href={canonicalHref}/>
    </Helmet>;
};
