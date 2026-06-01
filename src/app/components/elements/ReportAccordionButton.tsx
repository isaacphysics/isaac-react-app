import React from "react";
import {logAction, useAppDispatch} from "../../state";
import { siteSpecific } from "../../services";
import classNames from "classnames";

interface ReportAccordionButtonProps {
    pageId?: string,
    sectionId?: string,
    sectionTitle?: string
    sectionIndex?: number
}

export const ReportAccordionButton = ({pageId, sectionId, sectionTitle, sectionIndex} : ReportAccordionButtonProps) => {
    const dispatch = useAppDispatch();

    const getContactFormParams = () => {
        let params = "";
        if (sectionId) {
            // Accordion section IDs usually identify the page also, so nothing else is required
            params +=`&accordion=${sectionId}`;
        }
        else if (pageId) {
            params +=`&page=${pageId}`;
            // In absence of an ID, the section titles are likely most useful in locating the problem
            if (sectionTitle) {
                params +=`&section=${encodeURIComponent(sectionTitle)}`;
            }
        }
        return params;
    };

    function logAccordionReport() {
        const eventDetails = {
            type: "REPORT_CONTENT_ACCORDION_SECTION",
            pageId: pageId,
            accordionId: sectionId,
            accordionTitle: sectionTitle,
            accordionIndex: sectionIndex
        };
        dispatch(logAction(eventDetails));
    }

    return <button
        className="accordion-icon btn-action align-self-end mt-2 me-2 mb-4 bg-transparent btn-blank"
        aria-label="Report a problem (opens in new tab)"
        title="Report a problem (opens in new tab)"
        onClick={() => {
            logAccordionReport();
            window.open(`/contact?preset=contentProblem${getContactFormParams()}`, "_blank");
        }}
    >
        <i className={classNames("icon icon-flag", siteSpecific("icon-color-grey", "icon-color-muted icon-sm"))} />
    </button>;
};
