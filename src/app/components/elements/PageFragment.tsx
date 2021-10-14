import React, {ReactElement, useEffect} from "react";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {useDispatch, useSelector} from "react-redux";
import {fetchFragment} from "../../state/actions";
import {WithFigureNumbering} from "./WithFigureNumbering";


interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}

export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const dispatch = useDispatch();
    const fragment = useSelector((state: AppState) => state && state.fragments && state.fragments[fragmentId] || null);

    useEffect(() => {
        dispatch(fetchFragment(fragmentId))
    }, [dispatch, fragmentId]);

    const notFoundComponent = <div>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page fragment not found: "}
                <code>{fragmentId}</code>
            </small>
        </h3>
    </div>;

    return <React.Fragment>
        {!(fragment == 404) && <ShowLoading
            until={fragment}
            thenRender={fragment => <WithFigureNumbering doc={fragment}>
                <IsaacContent doc={fragment} />
            </WithFigureNumbering>}
            ifNotFound={ifNotFound || notFoundComponent}
        />}
    </React.Fragment>;
};
