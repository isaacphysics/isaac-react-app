import React from "react";
import {logAction, useAppDispatch} from "../../state";
import { siteSpecific } from "../../services";
import { IconButton } from "./AffixButton";

export const ReportButton = ({pageId} : {pageId?: string}) => {
    const dispatch = useAppDispatch();

    function logPageReport() {
        const eventDetails = {
            type: "REPORT_CONTENT_PAGE",
            pageId: pageId
        };
        dispatch(logAction(eventDetails));
    }

    return <IconButton
        icon="icon-flag"
        className="w-max-content h-max-content action-button"
        affixClassName={siteSpecific("icon-color-black-hoverable", "icon-color-white icon-sm")}
        aria-label="Report a problem (opens in new tab)" 
        title="Report a problem (opens in new tab)"
        color={siteSpecific("tint", "primary")}
        data-bs-theme="neutral"
        onClick={() => {
            logPageReport();
            window.open(pageId ? `/contact?preset=contentProblem&page=${pageId}` : "/contact?preset=contentProblem", "_blank");
        }}
    />;
};
