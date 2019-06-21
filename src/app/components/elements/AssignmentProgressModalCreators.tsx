import React from "react";
import {
    closeActiveModal,
} from "../../state/actions";
import {store} from "../../state/store";
import * as RS from "reactstrap";

export const downloadLinkModal = (link: string) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: "Privacy Notice",
        body: <React.Fragment>
            Show privacy notice from isaac-page-fragment="csv_download_notice"
        </React.Fragment>,
        buttons: [
            <RS.Button key={0} block color="primary" tag="a"  href={link} target="_blank" rel="noopener noreferer" onClick={() => {store.dispatch(closeActiveModal())}}>
                Download CSV
            </RS.Button>,
        ]
    }
};

