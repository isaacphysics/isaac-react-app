import React, {ReactElement, useEffect} from "react";
import {AppState, fetchFragment, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {NOT_FOUND} from "../../services/constants";
import {EditContentButton} from "./EditContentButton";


interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}

export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const dispatch = useAppDispatch();
    const fragment = useAppSelector((state: AppState) => state && state.fragments && state.fragments[fragmentId] || null);

    useEffect(() => {
        dispatch(fetchFragment(fragmentId))
    }, [dispatch, fragmentId]);

    const defaultNotFoundComponent = <div>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page fragment not found: "}
                <code>{fragmentId}</code>
            </small>
        </h3>
    </div>;

    return <React.Fragment>
        {fragment !== NOT_FOUND && <ShowLoading
            until={fragment}
            thenRender={fragment => <WithFigureNumbering doc={fragment}>
                <EditContentButton doc={fragment} />
                <IsaacContent doc={fragment} />
            </WithFigureNumbering>}
            ifNotFound={ifNotFound || defaultNotFoundComponent}
        />}
    </React.Fragment>;
};
