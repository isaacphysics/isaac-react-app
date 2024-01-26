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

  const baseContactUrl = `/contact?preset=contentProblem&url=${window.location.href}`;
  const pageParam = pageId ? `&page=${pageId}` : "";
  const contactUrl = `${baseContactUrl}${pageParam}`;

  return (
    <button
      className="report-icon btn-action"
      aria-label="Report a problem (opens in new tab)"
      title="Report a problem (opens in new tab)"
      onClick={() => {
        logPageReport();
        window.open(contactUrl, "_blank");
      }}
    />
  );
};
