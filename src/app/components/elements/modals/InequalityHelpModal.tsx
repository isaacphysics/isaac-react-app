import {buildActiveModal} from "./ActiveModal";
import {ModalId} from "./index";
import {PageFragment} from "../PageFragment";
import React from "react";

export const InequalityHelpModal = buildActiveModal(
    ModalId.inequalityHelp,
    "InequalityHelpModal",
    ({editorMode}: {editorMode: string}) => ({
        size: "xl",
        title: "Quick Help",
        body: () => <PageFragment fragmentId={`eqn_editor_help_modal_${editorMode}`}/>
    })
);
