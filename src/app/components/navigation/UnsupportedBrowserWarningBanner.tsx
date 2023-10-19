import React from "react";
import { Alert, Container } from "reactstrap";
import { Link } from "react-router-dom";

export const UnsupportedBrowserBanner = () => {
  const userAgent = navigator.userAgent;
  const isIE = userAgent.indexOf("MSIE ") >= 0 || !!navigator.userAgent.match(/Trident.*rv:11\./);

  return isIE ? (
    <Alert color="danger" className="mb-0 no-print">
      <Container className="text-center">
        We will drop all support for Internet Explorer by September 2020. You will need to use a modern browser to
        continue to access our site.{" "}
        <Link to="/contact?subject=Internet%20Explorer">Contact us if this will cause problems</Link>.
      </Container>
    </Alert>
  ) : null;
};
