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

    return siteSpecific(
        <IconButton
            icon="icon-flag"
            className="w-max-content h-max-content"
            affixClassName="icon-color-black-hoverable"
            aria-label="Report a problem (opens in new tab)" 
            title="Report a problem (opens in new tab)"
            color="tint"
            data-bs-theme="neutral"
            onClick={() => {
                logPageReport();
                window.open(pageId ? `/contact?preset=contentProblem&page=${pageId}` : "/contact?preset=contentProblem", "_blank");
            }}
        />,
        <button
            className="report-icon btn-action"
            aria-label="Report a problem (opens in new tab)"
            title="Report a problem (opens in new tab)"
            onClick={() => {
                logPageReport();
                window.open(pageId ? `/contact?preset=contentProblem&page=${pageId}` : "/contact?preset=contentProblem", "_blank");
            }}
        />
    );
};
