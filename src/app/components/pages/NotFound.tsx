import React from "react";
import { useLocation } from "react-router-dom";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";

export const NotFound = () => {
  const { pathname, state } = useLocation<{ overridePathname?: string }>();
  return (
    <Container>
      <div>
        <TitleAndBreadcrumb breadcrumbTitleOverride="Unknown page" currentPageTitle="Page not found" />
        <h3 className="my-4">
          <small>
            {"We're sorry, page not found: "}
            <code>{(state && state.overridePathname) || pathname}</code>
          </small>
        </h3>
      </div>
    </Container>
  );
};
