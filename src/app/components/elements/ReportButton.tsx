import React from "react";
import {logAction, useAppDispatch} from "../../state";
import { siteSpecific } from "../../services";
import { IconButton } from "./AffixButton";
import { useTranslation } from 'react-i18next'

export const ReportButton = ({pageId} : {pageId?: string}) => {
    const { t } = useTranslation()
    const dispatch = useAppDispatch();

    function logPageReport() {
        const eventDetails = {
            type: "REPORT_CONTENT_PAGE",
            pageId: pageId
        };
        dispatch(logAction(eventDetails));
    }

    return <IconButton
        icon={{name: t('iconflagIconcolorblackhoverable', 'icon-flag icon-color-black-hoverable'), color: "white"}}
        className="w-max-content h-max-content action-button"
        aria-label={t('reportAProblemOpensInNewTab', 'Report a problem (opens in new tab)')} 
        title={t('reportAProblemOpensInNewTab', 'Report a problem (opens in new tab)')}
        color={siteSpecific("tint", "primary")}
        data-bs-theme="neutral"
        onClick={() => {
            logPageReport();
            window.open(pageId ? `/contact?preset=contentProblem&page=${pageId}` : "/contact?preset=contentProblem", "_blank");
        }}
    />;
};
