import React from "react";
import { AppState, useAppSelector } from "../../../state";
import { ActiveModal } from "./ActiveModal";
import { adaTeacherOnboardingModal } from "./AdaTeacherOnboardingModal";
import { ActiveModalProps } from "../../../../IsaacAppTypes";
import { MODAL_TYPES } from "../../../services";

const MODAL_REGISTRY: Record<typeof MODAL_TYPES[keyof typeof MODAL_TYPES], ActiveModalProps> = {
    'TEACHER_ONBOARDING': adaTeacherOnboardingModal,
};

export const ActiveModals = () => {
    const activeModals = useAppSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            if (typeof modal === "string") {
                const registeredModal = MODAL_REGISTRY[modal as keyof typeof MODAL_TYPES];
                return registeredModal ? <ActiveModal key={registeredModal.title} activeModal={registeredModal}/> : null;
            }
            return <ActiveModal key={modal.title} activeModal={modal}/>;
        })}
    </div>;
};
