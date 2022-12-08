import React from "react";
import {ActiveModal} from "../../../../IsaacAppTypes";
import {closeActiveModal, store} from "../../../state";
import {Button} from "reactstrap";

export const teacherEventConfirmationModal = (submitBooking: () => void, stopBooking: () => void): ActiveModal => ({
    closeAction: () => {store.dispatch(closeActiveModal());},
    body: () => {
        const close = () => {store.dispatch(closeActiveModal())};
        return <div className={"mb-4"}>
            <p>This is an event for <b>teachers only</b>. Please confirm that you are a teacher (or a teacher trainee).</p>
            <div className={"d-flex justify-content-around mt-2"}>
                <Button onClick={() => {
                    submitBooking();
                    close();
                }}>I am a teacher</Button>
                <Button onClick={() => {
                    stopBooking();
                    close();
                }}>I am a student</Button>
            </div>
        </div>
    },
    title: "Please confirm teacher status"
});
