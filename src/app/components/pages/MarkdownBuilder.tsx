import React, { useState } from "react";
import * as RS from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { Markup } from "../elements/markup";

export const MarkdownBuilder = () => {
  const [markdownToTest, setMarkdownToTest] = useState("");

  return (
    <RS.Container>
      <TitleAndBreadcrumb currentPageTitle="Markdown builder" />
      <RS.Card className="mt-4 mb-5">
        <RS.CardBody>
          <RS.InputGroup>
            <RS.Label className="w-100">
              <h2 className="h4">Raw input</h2>
              <RS.Input
                type="textarea"
                rows={10}
                value={markdownToTest}
                onChange={(e) => setMarkdownToTest(e.target.value)}
              />
            </RS.Label>
          </RS.InputGroup>
          <div className="my-2 text-center">
            <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">
              Markdown guide
            </a>
          </div>
          <RS.InputGroup>
            <RS.Label className="w-100">
              <h2 className="h4">Rendered markdown</h2>
              <RS.Card>
                <RS.CardBody>
                  <Markup trusted-markup-encoding={"markdown"}>{markdownToTest}</Markup>
                </RS.CardBody>
              </RS.Card>
            </RS.Label>
          </RS.InputGroup>
        </RS.CardBody>
      </RS.Card>
    </RS.Container>
  );
};
