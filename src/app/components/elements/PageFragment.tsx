import React, {ReactElement} from "react";
import {IsaacContent} from "../content/IsaacContent";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {EditContentButton} from "./EditContentButton";
import {isaacApi} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";

interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}
export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const fragmentQuery = isaacApi.endpoints.getPageFragment.useQuery(fragmentId);

    const notFoundComponent = ifNotFound ?? <div>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page fragment not found: "}
                <code>{fragmentId}</code>
            </small>
        </h3>
    </div>;

    return <ShowLoadingQuery
        ifError={() => notFoundComponent}
        query={fragmentQuery}
        thenRender={(fragment) =>
            <WithFigureNumbering doc={fragment}>
                <EditContentButton doc={fragment} />
                <IsaacContent doc={fragment} />
            </WithFigureNumbering>
        }
        ifNotFound={notFoundComponent}
    />;
};
