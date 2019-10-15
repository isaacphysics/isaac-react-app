import React from "react";
import {useSelector} from "react-redux";
import {AppState} from "../../../state/reducers";
import {ActiveModal} from "./ActiveModal";

export const ActiveModals = () => {
    const activeModals = useSelector((state: AppState) => state && state.activeModals);
    return <div>
        {activeModals && activeModals.map((modal) => {
            return <ActiveModal key={modal.title} activeModal={modal}/>
        })}
    </div>
};
