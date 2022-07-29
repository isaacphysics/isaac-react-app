import React from "react";
import {useAppSelector} from "../../../state/store";
import {AppState} from "../../../state/reducers";
import {ActiveModal} from "./ActiveModal";

export const ActiveModals = () => {
    const activeModals = useAppSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            return <ActiveModal key={modal.title} activeModal={modal}/>
        })}
    </div>
};
