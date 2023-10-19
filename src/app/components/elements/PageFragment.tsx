import React, { ReactElement } from "react";
import { ShowLoading } from "../handlers/ShowLoading";
import { IsaacContent } from "../content/IsaacContent";
import { WithFigureNumbering } from "./WithFigureNumbering";
import { EditContentButton } from "./EditContentButton";
import { isaacApi, resultOrNotFound } from "../../state";

interface PageFragmentComponentProps {
  fragmentId: string;
  ifNotFound?: ReactElement;
}
export const PageFragment = ({ fragmentId, ifNotFound }: PageFragmentComponentProps) => {
  const { data: fragment, error } = isaacApi.endpoints.getPageFragment.useQuery(fragmentId);

  const defaultNotFoundComponent = (
    <div>
      <h2>Content not found</h2>
      <h3 className="my-4">
        <small>
          {"We're sorry, page fragment not found: "}
          <code>{fragmentId}</code>
        </small>
      </h3>
    </div>
  );

  return (
    <ShowLoading
      until={resultOrNotFound(fragment, error)}
      ifNotFound={ifNotFound || defaultNotFoundComponent}
      thenRender={(fragment) => (
        <WithFigureNumbering doc={fragment}>
          <EditContentButton doc={fragment} />
          <IsaacContent doc={fragment} />
        </WithFigureNumbering>
      )}
    />
  );
};
