import React, { useEffect, useState } from "react";
import { Button } from "reactstrap";
import { closeActiveModal, openActiveModal, useAppDispatch } from "../../../state";
import { ActiveModalWithState } from "../../../../IsaacAppTypes";
import { useDispatch } from "react-redux";
import { KEY, persistence } from "../../../services";

export const useTeacherOnboardingModal = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {
        if (shouldModalShow()) {
            dispatch(openActiveModal(adaTeacherOnboardingModal));
            return () => {
                dispatch(closeActiveModal());
            };
        }
    }, [dispatch]);
};

export const scheduleTeacherOnboardingModalForNextOverviewVisit = (): void => {
    persistence.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "true");
};

const unscheduleTeacherOnboardingModal = (): void => {
    persistence.remove(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT);
};

const shouldModalShow = (): boolean => {
    return persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT) === "true";
};

type AdaTeacherOnboardingModalState = {
    pageIndex: number,
    setPage: (p: number) => void,
    close: () => void
};

export const adaTeacherOnboardingModal: ActiveModalWithState<AdaTeacherOnboardingModalState> = { 
    size: 'md',
    title: 'Teacher Onboarding modal',
    useInit() {
        const dispatch = useDispatch();
        const close = () => dispatch(closeActiveModal());;
        const [pageIndex, setPage] = useState(1);
        useEffect(() => {
            const unschedule = setTimeout(unscheduleTeacherOnboardingModal, 100);
            return () => {
                clearTimeout(unschedule);
            };
        });
        return { pageIndex, setPage, close };
    },
    header({ pageIndex, close }) {
        return <div className="d-flex justify-content-between px-4 pt-3 pb-2 border-bottom">
            <strong role="region" aria-label="Modal page indicator" className="color-purple">{pageIndex} of {pages.length}</strong>
            <button aria-label="Close onboarding modal" className="icon icon-close" onClick={close} />
        </div>;
    },
    body({ pageIndex }) {
        return <>
            <Page page={pages[0]} isCurrentPage={1 === pageIndex} />
            <Page page={pages[1]} isCurrentPage={2 === pageIndex} />
            <Page page={pages[2]} isCurrentPage={3 === pageIndex} />
            <Page page={pages[3]} isCurrentPage={4 === pageIndex} />
        </>;
    },
    buttons({ pageIndex, setPage, close }) {
        const isLastPage = pageIndex == pages.length;
        const nextPage = () => setPage(pageIndex + 1);
        return [
            <Button key={0} block color="solid" onClick={isLastPage ? close : nextPage} aria-label="Go to next page on modal">
                {isLastPage ? "Go to My Ada" : "Next"}
            </Button>
        ];
    }
};

const Page = ({ page, isCurrentPage }: { page: typeof pages[number], isCurrentPage: boolean}) => {
    return <div role="region" aria-label="Teacher onboarding modal page" key={page.title} className="text-center mx-2" style={isCurrentPage ? {} : {display: 'none'}}>
        <img aria-label="Teacher onboarding modal image" src={`/assets/cs/decor/${page.image}`} alt='' className="pb-3 modal-page-hero-image"/>
        <div className="d-flex flex-column align-items-center justify-content-center modal-page-text">
            <h4>{page.title}</h4>
            <p className="mb-0">{page.message}</p>
        </div>
    </div>;
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
