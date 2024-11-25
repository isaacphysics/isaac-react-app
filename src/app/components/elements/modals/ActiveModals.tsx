import React from "react";
import {AppState, useAppSelector} from "../../../state";
import {ActiveModal} from "./ActiveModal";

export const ActiveModals = () => {
    const activeModals = useAppSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            return <ActiveModal key={modal.title} activeModal={modal}/>;
        })}
    </div>;
};
