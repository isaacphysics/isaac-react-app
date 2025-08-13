import React, { useEffect } from "react";
import { Button } from "reactstrap";
import { closeActiveModal, openActiveModal, useAppDispatch } from "../../../state";
import { KEY, persistence } from "../../../services";
import { activeModalWithPagination, PaginationState } from "./ActiveModalWithPagination";

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

const Page = ({ page }: { page: typeof pages[number]}) => {
    return <div role="region" aria-label="Teacher onboarding modal page" key={page.title} className="text-center mx-2">
        <img src={`/assets/cs/decor/${page.image}`} alt='' aria-hidden className="pb-3 modal-page-hero-image"/>
        <div className="d-flex flex-column align-items-center justify-content-center modal-page-text">
            <h4>{page.title}</h4>
            <p className="mb-0">{page.message}</p>
        </div>
    </div>;
};

const buttons = ({ pageIndex, setPage, close}: PaginationState) => {
    const isLastPage = pageIndex == pages.length;
    const nextPage = () => setPage(pageIndex + 1);
    return [
        <Button key={0} block color="solid" onClick={isLastPage ? close : nextPage} aria-label="Go to next page on modal">
            {isLastPage ? "Go to My Ada" : "Next"}
        </Button>
    ];
};

export const adaTeacherOnboardingModal = activeModalWithPagination({ 
    title: 'Teacher Onboarding modal',
    useInit: () => useEffect(() => {
        const unschedule = setTimeout(unscheduleTeacherOnboardingModal, 100);
        return () => clearTimeout(unschedule);
    }, []),
    pages: pages.map((page, idx) => <Page key={idx} page={page}/>),
    buttons
});

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

const unscheduleTeacherOnboardingModal = (): void => {
    persistence.remove(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT);
};

const shouldModalShow = (): boolean => {
    return persistence.load(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT) === "true";
};

export const scheduleTeacherOnboardingModalForNextOverviewVisit = (): void => {
    persistence.save(KEY.SHOW_TEACHER_ONBOARDING_MODAL_ON_NEXT_OVERVIEW_VISIT, "true");
};
