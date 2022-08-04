import React, {ReactElement} from "react";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {NOT_FOUND} from "../../services/constants";
import {EditContentButton} from "./EditContentButton";
import {isaacApi} from "../../state/slices/api";


interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}

export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const {data: fragment, error} = isaacApi.endpoints.getPageFragment.useQuery(fragmentId);
    const fragmentOrNotFound = error && 'status' in error && error.status === NOT_FOUND ? NOT_FOUND : fragment;

    const defaultNotFoundComponent = <div>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page fragment not found: "}
                <code>{fragmentId}</code>
            </small>
        </h3>
    </div>;

    return <ShowLoading until={fragmentOrNotFound} ifNotFound={ifNotFound || defaultNotFoundComponent} thenRender={fragment =>
        <WithFigureNumbering doc={fragment}>
            <EditContentButton doc={fragment} />
            <IsaacContent doc={fragment} />
        </WithFigureNumbering>}
    />;
};
