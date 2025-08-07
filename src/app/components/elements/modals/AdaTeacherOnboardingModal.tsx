import React from "react";
import { Button } from "reactstrap";
import * as AppTypes from "../../../../IsaacAppTypes";
import { AppDispatch, closeActiveModal } from "../../../state";

export const adaTeacherOnboardingModal = (dispatch: AppDispatch): AppTypes.ActiveModal => {
    return {
        size: 'md',
        header: <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
            <strong className="color-purple">1 of 4</strong>
            <button className="icon icon-close" aria-label="Close" onClick={() => dispatch(closeActiveModal())}/>
        </div>, 
        body: <div className="text-center mx-4 my-3">
            <img className="img-fluid w-md-50 mx-auto my-7" src="/assets/cs/decor/onboarding-welcome.svg" alt='' />
            <h4>Welcome to Ada</h4>
            <p>Ada supports your teaching to help your students succeed in computer science</p>
        </div>,
        buttons: [
            <Button key={0} block color="solid">
                Next
            </Button>
        ]
    };
};
