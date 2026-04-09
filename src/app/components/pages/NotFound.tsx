import React from "react";
import { useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";

export const NotFound = () => {
  const { pathname, state } = useLocation<{ overridePathname?: string }>();
  const missingPageId = state?.overridePathname || pathname;
  const contactUrl =
    `/contact?preset=pageNotFound&page=${encodeURIComponent(missingPageId)}` +
    `&url=${encodeURIComponent(globalThis.location.href)}`;
  return (
    <Container>
      <div>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Unknown page" currentPageTitle="Page not found (404)" />
        <h3 className="my-4">
          <small>
            <p>
              {"Sorry, we couldn't find the page you were looking for: "}
              <code>{missingPageId}</code>
            </p>
            <p>{"If you entered a web address, check it was correct."}</p>
            <p>{"If you pasted the web address, check you copied the entire address."}</p>
            <p>
              {"If the web address is correct or you selected a link or button, please"}{" "}
              <a href={contactUrl} style={{ textDecoration: "none", color: "#2B77B4" }}>
                contact us
              </a>{" "}
              {"to let us know."}
            </p>
          </small>
        </h3>
      </div>
    </Container>
  );
};
