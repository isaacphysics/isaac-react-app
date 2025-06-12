import React, { ReactElement } from "react";
import { ShowLoading } from "../handlers/ShowLoading";
import { IsaacContent } from "../content/IsaacContent";
import { WithFigureNumbering } from "./WithFigureNumbering";
import { EditContentButton } from "./EditContentButton";
import { isaacApi, resultOrNotFound } from "../../state";

interface PageContentProps {
  pageId: string;
  ifNotFound?: ReactElement;
}

export const PageContent = ({ pageId, ifNotFound }: PageContentProps) => {
  const { data: page, error } = isaacApi.endpoints.getPage.useQuery(pageId);

  const defaultNotFoundComponent = (
    <div>
      <h2>Content not found</h2>
      <h3 className="my-4">
        <small>
          {"We're sorry, page not found: "}
          <code>{pageId}</code>
        </small>
      </h3>
    </div>
  );

  return (
    <ShowLoading
      until={resultOrNotFound(page, error)}
      ifNotFound={ifNotFound || defaultNotFoundComponent}
      thenRender={(page) => (
        <WithFigureNumbering doc={page}>
          <EditContentButton doc={page} />
          <IsaacContent doc={page} />
        </WithFigureNumbering>
      )}
    />
  );
};
