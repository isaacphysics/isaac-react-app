import React, {useEffect} from "react";
import {AppState} from "../../state/reducers";
import {ContentDTO} from "../../../IsaacApiTypes";
import {ShowLoading} from "../handlers/ShowLoading";
import {IsaacContent} from "../content/IsaacContent";
import {connect} from "react-redux";
import {NOT_FOUND_TYPE} from "../../../IsaacAppTypes";
import {fetchFragment} from "../../state/actions";

const stateToProps = (state: AppState, {name}: {name: string}) => {
    return {
        fragment: state && state.fragments && state.fragments[name] || null
    };
};
const dispatchToProps = {fetchFragment};

interface PageFragmentComponentProps {
    name: string;
    fragment: ContentDTO | NOT_FOUND_TYPE | null;
    fetchFragment: (name: string) => void;
}

const PageFragmentComponent = ({name, fragment, fetchFragment}: PageFragmentComponentProps) => {
    useEffect(
        () => {fetchFragment(name);},
        [name]
    );

    return <ShowLoading until={fragment} render={(fragment: ContentDTO) =>
        <IsaacContent doc={fragment} />
    }/>;
};

export const PageFragment = connect(stateToProps, dispatchToProps)(PageFragmentComponent);
