import React from "react";
import { closeActiveModal, store } from "../../../state";
import { PageFragment } from "../PageFragment";
import { Button } from "reactstrap";

// N.B. This modal must not be referenced in index.tsx to avoid circular dependencies

export const downloadLinkModal = (link: string) => {
  return {
    closeAction: () => {
      store.dispatch(closeActiveModal());
    },
    title: "Privacy Notice",
    body: <PageFragment fragmentId="csv_download_notice" />,
    buttons: [
      <Button
        key={0}
        block
        color="primary"
        tag="a"
        href={link}
        target="_blank"
        onClick={() => {
          store.dispatch(closeActiveModal());
        }}
      >
        Download CSV
      </Button>,
    ],
  };
};
