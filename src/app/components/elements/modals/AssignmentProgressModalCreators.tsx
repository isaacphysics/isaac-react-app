import React from "react";
import {closeActiveModal, store} from "../../../state";
import {PageFragment} from "../PageFragment";
import { Button } from "reactstrap";
import { ActiveModalProps } from "../../../../IsaacAppTypes";
import i18next from 'i18next'

// N.B. This modal must not be referenced in index.tsx to avoid circular dependencies

export const downloadLinkModal = (link: string): ActiveModalProps => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal());},
        title: i18next.t('privacyNotice', 'Privacy Notice'),
        body: <PageFragment fragmentId="csv_download_notice" />,
        buttons: [
            <Button key={0} block color="solid" tag="a"  href={link} target="_blank" onClick={() => {store.dispatch(closeActiveModal());}}>
                {i18next.t('downloadCsv', 'Download CSV')}
            </Button>,
        ]
    };
};

