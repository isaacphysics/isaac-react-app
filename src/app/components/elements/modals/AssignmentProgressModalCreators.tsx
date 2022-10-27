import React from "react";
import {closeActiveModal, store} from "../../../state";
import * as RS from "reactstrap";
import {PageFragment} from "../PageFragment";

// N.B. This modal must not be referenced in index.tsx to avoid circular dependencies

export const downloadLinkModal = (link: string) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Privacy Notice",
        body: <PageFragment fragmentId="csv_download_notice" />,
        buttons: [
            <RS.Button key={0} block color="primary" tag="a"  href={link} target="_blank" onClick={() => {store.dispatch(closeActiveModal())}}>
                Download CSV
            </RS.Button>,
        ]
    }
};

