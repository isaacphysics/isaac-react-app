import React from "react";
import { AppState, useAppSelector } from "../../../state";
import { ActiveModal } from "./ActiveModal";
import { AdaTeacherOnboardingModal } from "./AdaTeacherOnboardingModal";

export type ModalRegistryKey = keyof typeof modalRegistry;
const modalRegistry = {
    'adaTeacherOnboardingModal': () => <AdaTeacherOnboardingModal />,
};

export const ActiveModals = () => {
    const activeModals = useAppSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            if (typeof modal === 'string' && modal in modalRegistry) {
                const Modal = modalRegistry[modal];
                return <Modal key={modal}/>;
            } else if (typeof modal === 'object'){
                return <ActiveModal key={modal.title} activeModal={modal}/>;
            }
        })}
    </div>;
};
