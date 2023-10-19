import React from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageFragment } from "../elements/PageFragment";

export const ComingSoon = () => (
  <Container>
    <TitleAndBreadcrumb currentPageTitle="Coming soon" />
    <div className="mt-4" />
    <PageFragment fragmentId="coming_soon" />
  </Container>
);
