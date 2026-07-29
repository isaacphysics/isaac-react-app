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

interface SetFeedbackModeModalProps {
    quiz: QuizAssignmentDTO;
}

const SetFeedbackModeModalBody = ({quiz}: SetFeedbackModeModalProps) => {
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setFeedbackMode = async (mode: QuizFeedbackMode) => {
        if (isDefined(quiz.id) && mode !== quiz?.quizFeedbackMode) {
            await updateQuiz({quizAssignmentId: quiz.id, update: {quizFeedbackMode: mode}});
            dispatch(closeActiveModal());
            dispatch(showSuccessToast("Success!", "Feedback mode updated successfully."));
        }
    };

    return <>
        <p className="mb-5">
            You can adjust the type of feedback given to students after they complete this test. Changes to this setting are applied immediately and will affect all students, regardless of completion status.
        </p>
        <Label for="feedbackMode" className="me-2">
            Student feedback mode:
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
        title: "Set feedback mode",
        body: <SetFeedbackModeModalBody {...props} />
    };
};
