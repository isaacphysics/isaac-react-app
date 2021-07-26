import React, {ReactElement, useEffect} from "react";
import {AppState} from "../../state/reducers";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {useDispatch, useSelector} from "react-redux";
import {fetchFragment} from "../../state/actions";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {isDefined} from "../../services/miscUtils";


interface PageFragmentComponentProps {
    fragmentId: string;
    renderFragmentNotFound?: boolean | string | ReactElement;
}

export const PageFragment = ({fragmentId, renderFragmentNotFound}: PageFragmentComponentProps) => {
    const dispatch = useDispatch();
    const fragment = useSelector((state: AppState) => state && state.fragments && state.fragments[fragmentId] || null);
    const showFragment = typeof renderFragmentNotFound == "boolean" ? renderFragmentNotFound : true;

    useEffect(() => {
        dispatch(fetchFragment(fragmentId))
    }, [dispatch, fragmentId]);

    const notFoundComponent = <div>
        {isDefined(renderFragmentNotFound) && typeof renderFragmentNotFound !== "boolean" ?
            <div className="my-4">{renderFragmentNotFound}</div> : <>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page fragment not found: "}
                <code>{fragmentId}</code>
            </small>
        </h3></>}
    </div>;

    return <React.Fragment>
        {!(fragment == 404 && !showFragment) && <ShowLoading
            until={fragment}
            thenRender={fragment => <WithFigureNumbering doc={fragment}>
                <IsaacContent doc={fragment} />
            </WithFigureNumbering>}
            ifNotFound={notFoundComponent}
        />}
    </React.Fragment>;
};
