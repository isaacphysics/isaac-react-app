import React from "react";
import {
    isDefined,
    QUIZ_FEEDBACK_NAMES,
} from "../../../services";
import {
    Label,
    DropdownItem,
    DropdownMenu,
    DropdownToggle,
    UncontrolledButtonDropdown
} from "reactstrap";
import { ActiveModalProps, QuizFeedbackModes } from "../../../../IsaacAppTypes";
import { QuizAssignmentDTO, QuizFeedbackMode } from "../../../../IsaacApiTypes";
import { closeActiveModal, showSuccessToast, useAppDispatch, useUpdateQuizAssignmentMutation } from "../../../state";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

interface SetFeedbackModeModalProps {
    quiz: QuizAssignmentDTO;
}

const SetFeedbackModeModalBody = ({quiz}: SetFeedbackModeModalProps) => {
    const { t } = useTranslation();
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setFeedbackMode = async (mode: QuizFeedbackMode) => {
        if (isDefined(quiz.id) && mode !== quiz?.quizFeedbackMode) {
            await updateQuiz({quizAssignmentId: quiz.id, update: {quizFeedbackMode: mode}});
            dispatch(closeActiveModal());
            dispatch(showSuccessToast("Success!", t("common:assignments.feedbackMode.updateSuccess")));
        }
    };

    return <>
        <p className="mb-5">
            {t("common:assignments.feedbackMode.description")}
        </p>
        <Label for="feedbackMode" className="me-2">
            {t("common:assignments.feedbackMode.label")}
        </Label>
        <UncontrolledButtonDropdown size="sm">
            <DropdownToggle color={"tint"} caret size={"sm"} disabled={isUpdatingQuiz}>
                {QUIZ_FEEDBACK_NAMES[quiz.quizFeedbackMode as QuizFeedbackMode]}
            </DropdownToggle>
            <DropdownMenu className="z-1050">
                {QuizFeedbackModes.map(mode =>
                    <DropdownItem key={mode}
                        onClick={() => setFeedbackMode(mode)}
                        active={mode === quiz?.quizFeedbackMode}
                    >
                        {QUIZ_FEEDBACK_NAMES[mode]}
                    </DropdownItem>
                )}
            </DropdownMenu>
        </UncontrolledButtonDropdown>
    </>;
};

export const setFeedbackModeModal = (props: SetFeedbackModeModalProps) : ActiveModalProps => {
    return {
        title: i18next.t("common:assignments.feedbackMode.title"),
        body: <SetFeedbackModeModalBody {...props} />
    };
};
