import React, { useState } from "react";
import { Button } from "reactstrap";
import { AppDispatch, closeActiveModal } from "../../../state";
import { ActiveModalWithState } from "../../../../IsaacAppTypes";

type AdaTeacherOnboardingModalState = { 
    page: number,
    setPage: (p: number) => void
};

export const adaTeacherOnboardingModal = (dispatch: AppDispatch): ActiveModalWithState<AdaTeacherOnboardingModalState> => {
    return {
        size: 'md',
        title: 'teacher_onboarding_modal_id',
        useInit() {
            const [page, setPage] = useState(1);
            return { page, setPage };
        },
        header: ({ page }) => <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
            <strong className="color-purple" data-testid='teacher-modal-pages'>{page} of 4</strong>
            <button className="icon icon-close" aria-label="Close" onClick={() => dispatch(closeActiveModal())}
                data-testid='teacher-modal-close'/>
        </div>, 
        body: <div className="text-center mx-4 my-3">
            <img className="img-fluid w-md-50 mx-auto my-7" src="/assets/cs/decor/onboarding-welcome.svg" alt='' />
            <h4>Welcome to Ada</h4>
            <p>Ada supports your teaching to help your students succeed in computer science</p>
        </div>,
        buttons: ({ page, setPage }) => [
            <Button key={0} block color="solid" onClick={() => setPage(page + 1)}>
                Next
            </Button>
        ]
    };
};
