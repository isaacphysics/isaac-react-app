import React from "react";
import {PageFragment} from "../PageFragment";
import {buildActiveModal} from "./ActiveModal";
import {Button} from "reactstrap";

export const DownloadLinkModal = buildActiveModal(
    "download-link",
    "DownloadLinkModal",
    ({link, closeModal}) => ({
        title: "Privacy Notice",
        body: <PageFragment fragmentId="csv_download_notice" />,
        buttons: [
            <Button key={0} block color="primary" tag="a" href={link} target="_blank" onClick={closeModal}>
                Download CSV
            </Button>
        ]
    })
);
