import React, {useState} from "react";
import {
    closeActiveModal,
    mutationSucceeded,
    showSuccessToast,
    useAppDispatch,
    useUpdateQuizAssignmentMutation
} from "../../../state";
import {
    TODAY
} from "../../../services";
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import range from "lodash/range";
import {
    Label,
    Button
} from "reactstrap";
import { ActiveModalProps } from "../../../../IsaacAppTypes";
import { useTranslation } from "react-i18next";
import i18next from "i18next";

type ExtendDueDateModalProps = {
    currDueDate: Date | number;
    numericQuizAssignmentId: number;
}

const ExtendDueDateModalBody = ({currDueDate, numericQuizAssignmentId}: ExtendDueDateModalProps) => {
    const { t } = useTranslation();
    const yearRange = range(currentYear, currentYear + 5);
    const [dueDate, setDueDate] = useState<Date>(new Date(currDueDate));
    const [updateQuiz, {isLoading: isUpdatingQuiz}] = useUpdateQuizAssignmentMutation();
    const dispatch = useAppDispatch();

    const setValidDueDate = () => {
        if (isUpdatingQuiz || !numericQuizAssignmentId || !dueDate || currDueDate == dueDate) {
            return;
        }

        if (currDueDate && (dueDate > currDueDate || dueDate > TODAY())) {
            void updateQuiz({quizAssignmentId: numericQuizAssignmentId, update: {dueDate: dueDate}})
                .then((result) => {
                    if (mutationSucceeded(result)) {
                        dispatch(showSuccessToast(
                            t("common:assignments.extendDueDate.successToastTitle"), t("common:assignments.extendDueDate.successToastMessage", { dueDate: dueDate.toLocaleDateString() })
                        ));
                        dispatch(closeActiveModal());
                    }
                });
        }
    };

    return <>
        <p className="px-1">{t("common:assignments.extendDueDate.confirmationText")}</p>
        <hr className="text-center"/>
        <div className="p-2">
            <Label for="dueDate" className="pe-1">{t("common:assignments.extendDueDate.inputLabel")}
                <DateInput id="dueDate" value={dueDate} invalid={dueDate && ((dueDate < currDueDate) || dueDate <= TODAY())}
                    yearRange={yearRange} noClear disabled={isUpdatingQuiz} className="text-center"
                    onChange={(e) => e.target.valueAsDate && setDueDate(e.target.valueAsDate)}
                />
            </Label>
            {dueDate && (dueDate < currDueDate || dueDate <= TODAY()) && 
            <p className={"text-danger"}>
                {t("common:assignments.extendDueDate.validationError")}
            </p>}
            <Button
                className="mt-2 mb-2"
                block color="secondary"
                onClick={setValidDueDate}
                role={"button"}
                disabled={isUpdatingQuiz && dueDate && (dueDate < currDueDate)}>
                {t("common:assignments.extendDueDate.submitButton")}
            </Button>
        </div>
    </>;
};

export const extendDueDateModal = (props: ExtendDueDateModalProps) : ActiveModalProps => {
    return {
        title: i18next.t("common:assignments.extendDueDate.modalTitle"),
        body: <ExtendDueDateModalBody {...props} />
    };
};

