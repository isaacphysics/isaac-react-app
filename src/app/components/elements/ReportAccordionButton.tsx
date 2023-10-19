import React from "react";
import { logAction, useAppDispatch } from "../../state";

interface ReportAccordionButtonProps {
  pageId?: string;
  sectionId?: string;
  sectionTitle?: string;
  sectionIndex?: number;
}

export const ReportAccordionButton = ({
  pageId,
  sectionId,
  sectionTitle,
  sectionIndex,
}: ReportAccordionButtonProps) => {
  const dispatch = useAppDispatch();

  const getContactFormParams = () => {
    let params = "";
    if (sectionId) {
      // Accordion section IDs usually identify the page also, so nothing else is required
      params += `&accordion=${sectionId}`;
    } else if (pageId) {
      params += `&page=${pageId}`;
      // In absence of an ID, the section titles are likely most useful in locating the problem
      if (sectionTitle) {
        params += `&section=${sectionTitle}`;
      }
    }
    return params;
  };

  function logAccordionReport() {
    let eventDetails = {
      type: "REPORT_CONTENT_ACCORDION_SECTION",
      pageId: pageId,
      accordionId: sectionId,
      accordionTitle: sectionTitle,
      accordionIndex: sectionIndex,
    };
    dispatch(logAction(eventDetails));
  }

  return (
    <button
      className="accordion-icon accordion-icon-report btn-action"
      aria-label="Report a problem (opens in new tab)"
      title="Report a problem (opens in new tab)"
      onClick={() => {
        logAccordionReport();
        window.open(`/contact?preset=contentProblem${getContactFormParams()}`, "_blank");
      }}
    />
  );
};
