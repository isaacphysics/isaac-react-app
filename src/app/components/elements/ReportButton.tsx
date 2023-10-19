import React from "react";
import { logAction, useAppDispatch } from "../../state";

export const ReportButton = ({ pageId }: { pageId?: string }) => {
  const dispatch = useAppDispatch();

  function logPageReport() {
    const eventDetails = {
      type: "REPORT_CONTENT_PAGE",
      pageId: pageId,
    };
    dispatch(logAction(eventDetails));
  }

  return (
    <button
      className="report-icon btn-action"
      aria-label="Report a problem (opens in new tab)"
      title="Report a problem (opens in new tab)"
      onClick={() => {
        logPageReport();
        window.open(
          pageId ? `/contact?preset=contentProblem&page=${pageId}` : "/contact?preset=contentProblem",
          "_blank",
        );
      }}
    />
  );
};
