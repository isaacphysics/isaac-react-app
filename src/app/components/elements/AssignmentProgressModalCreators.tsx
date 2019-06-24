import React from "react";
import {
    closeActiveModal,
} from "../../state/actions";
import {store} from "../../state/store";
import * as RS from "reactstrap";
import {PageFragment} from "./PageFragment";

// N.B. This modal must not be referenced in actions.tsx to avoid circular dependencies

export const downloadLinkModal = (link: string) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Privacy Notice",
        body: <PageFragment fragmentId="csv_download_notice" />,
        buttons: [
            <RS.Button key={0} block color="primary" tag="a"  href={link} target="_blank" rel="noopener noreferer" onClick={() => {store.dispatch(closeActiveModal())}}>
                Download CSV
            </RS.Button>,
        ]
    }
};

