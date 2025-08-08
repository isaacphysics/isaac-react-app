import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { closeActiveModal } from "../../../state";
import { ActiveModalWithState } from "../../../../IsaacAppTypes";
import { useDispatch } from "react-redux";
import tap from "lodash/tap";

type AdaTeacherOnboardingModalState = {
    pageIndex: number,
    setPage: (p: number) => void,
    close: () => void
};

export const adaTeacherOnboardingModal: ActiveModalWithState<AdaTeacherOnboardingModalState> = { 
    size: 'md',
    title: 'teacher_onboarding_modal_id',
    useInit() {
        useImagePreload();
        const dispatch = useDispatch();
        const close = () => dispatch(closeActiveModal());;
        const [pageIndex, setPage] = useState(1);
        return { pageIndex, setPage, close };
    },
    header: ({ pageIndex, close }) => <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
        <strong className="color-purple" data-testid='teacher-modal-pages'>{pageIndex} of {pages.length}</strong>
        <button className="icon icon-close" aria-label="Close" onClick={close} data-testid='teacher-modal-close' />
    </div>,
    body: ({ pageIndex }) => {
        const page = pages[pageIndex - 1];
        return <div className="text-center mx-4">
            <img className="pb-5" width="330px" height="200px" src={`/assets/cs/decor/${page.image}`} alt='' data-testid='teacher-modal-image' />
            <h4>{page.title}</h4>
            <p>{page.message}</p>
        </div>;
    },
    buttons: ({ pageIndex, setPage, close }) => {
        const isLastPage = pageIndex == pages.length;
        const nextPage = () => setPage(pageIndex + 1);
        return [
            <Button key={0} block color="solid" onClick={isLastPage ? close : nextPage} data-testid='teacher-modal-forward'>
                {isLastPage ? "Go to My Ada" : "Next"}
            </Button>
        ];
    }
};

const useImagePreload = () => {
    // Save preloaded images to state so they don't get garbage-collected (a temporary solution that I see is 
    // needed on Chrome). Preloading so text and image changes at the same time.
    // TODO: once we've upgraded to React 19, use the new preload function that will work reliably across browsers 
    const [, setImages] = useState<HTMLImageElement[]>([]);
    useEffect(() => {
        const images = pages.map(page => tap(new Image(), img => img.src = `/assets/cs/decor/${page.image}`));
        setImages(images);
    }, [setImages]);
};

const pages = [
    {
        title: "Welcome to Ada",
        message: "Ada supports your teaching to help your students succeed in computer science.",
        image: "onboarding-welcome.svg"
    },
    {
        title: "Only see relevant learning materials",
        message: "Set your student learning stages and exam boards and we'll only show content relevant to you.",
        image: "onboarding-relevant-materials.svg"
    },
    { 
        title: "Assign auto-marking quizzes",
        message: "Choose a pre-made quiz or create your own and assign it to a whole group of stundents at once",
        image: "onboarding-auto-marking-quizzes.svg"
    },
    {
        title: "See your students progress",
        message: "See how students perform across quizzes and identify learning opportunities in your markbook.",
        image: "onboarding-students-progress.svg"
    }
] as const;