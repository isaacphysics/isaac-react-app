import React from "react";
import { IconButton } from "./AffixButton";
import { PageFragment } from "./PageFragment";
import { useAppDispatch, openActiveModal, closeActiveModal } from "../../state";

export const HelpButton = ({modalId} : {modalId: string}) => {
    const dispatch = useAppDispatch();

    function openHelpModal(modalId: string) {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());},
            size: "xl",
            title: "Help",
            body: <PageFragment fragmentId={modalId} />,
        }));
    }

    return <IconButton
        icon={{name: "icon-info icon-color-black-hoverable", color: "white"}}
        className="w-max-content h-max-content"
        aria-label="Open help video" 
        title="Open help video"
        color="tint"
        data-bs-theme="neutral"
        onClick={() => openHelpModal(modalId)}
    />;
};
