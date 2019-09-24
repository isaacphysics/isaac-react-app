import React, {useEffect, useState} from "react";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {useDispatch, useSelector} from "react-redux";
import {fetchFragment} from "../../state/actions";


interface PageFragmentComponentProps {
    fragmentId: string;
}

export const PageFragment = ({fragmentId}: PageFragmentComponentProps) => {
    const dispatch = useDispatch();
    const [pathname, setPathname] = useState("");
    const fragment = useSelector((state: AppState) => state && state.fragments && state.fragments[fragmentId] || null);

    useEffect(() => {
        dispatch(fetchFragment(fragmentId))
    }, [fragmentId]);

    useEffect(() => {
        setPathname(location.pathname);
    }, [location.pathname]);

    const notFoundComponent = <div>
        <h2>Content not found</h2>
        <h3 className="my-4">
            <small>
                {"We're sorry, page not found: "}
                <code>{pathname}</code>
            </small>
        </h3>
    </div>;

    return <ShowLoading
        until={fragment}
        thenRender={fragment => <IsaacContent doc={fragment} />}
        ifNotFound={notFoundComponent}
    />;
};
