import React from "react";
import { IconButton } from "./AffixButton";
import { PageFragment } from "./PageFragment";
import { useAppDispatch, openActiveModal, closeActiveModal } from "../../state";
import { useTranslation } from "react-i18next";

export const HelpButton = ({modalId} : {modalId: string}) => {
    const { t } = useTranslation();
    const dispatch = useAppDispatch();

    function openHelpModal(modalId: string) {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal());},
            size: "xl",
            title: t("common:help.modalTitle"),
            body: <PageFragment fragmentId={modalId} />,
        }));
    }

    return <IconButton
        icon={{name: "icon-info icon-color-black-hoverable", color: "white"}}
        className="w-max-content h-max-content"
        aria-label={t("common:help.buttonLabel")} 
        title={t("common:help.buttonLabel")}
        color="tint"
        data-bs-theme="neutral"
        onClick={() => openHelpModal(modalId)}
    />;
};
