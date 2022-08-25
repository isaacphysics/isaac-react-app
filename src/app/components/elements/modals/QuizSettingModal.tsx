import {ContentSummaryDTO, IsaacQuizDTO, QuizFeedbackMode} from "../../../../IsaacApiTypes";
import {AppGroup} from "../../../../IsaacAppTypes";
import {
    AppDispatch,
    closeActiveModal,
    hideToast,
    setQuiz,
    showQuizSettingModal,
    showToast,
    useAppDispatch
} from "../../../state";
import React, {useState} from "react";
import {isDefined, Item, selectOnChange} from "../../../services";
import {range} from "lodash";
import {currentYear, DateInput} from "../inputs/DateInput";
import * as RS from "reactstrap";
import Select from "react-select";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";

type QuizFeedbackOption = Item<QuizFeedbackMode>;
const feedbackOptions = {
    NONE: "No feedback",
    OVERALL_MARK: "Overall mark",
    SECTION_MARKS: "Mark for each test section",
    DETAILED_FEEDBACK: "Detailed feedback on each question",
};

const feedbackOptionsList: QuizFeedbackOption[] = Object.keys(feedbackOptions).map(key => {
    const mode = key as QuizFeedbackMode;
    return {label: feedbackOptions[mode], value: mode};
});

const feedbackOptionsMap = feedbackOptionsList.reduce((obj, option) => {
    obj[option.value] = option;
    return obj;
}, {} as {[key in QuizFeedbackMode]: QuizFeedbackOption});

type ControlName = 'group' | 'dueDate' | 'feedbackMode';

interface QuizSettingModalProps {
    quiz: ContentSummaryDTO | IsaacQuizDTO;
    groups: AppGroup[];
    dueDate?: Date | null;
    feedbackMode?: QuizFeedbackMode | null;
}

export function QuizSettingModal({quiz, groups, dueDate: initialDueDate, feedbackMode: initialFeedbackMode}: QuizSettingModalProps) {
    const dispatch: AppDispatch = useAppDispatch();
    const [validated, setValidated] = useState<Set<ControlName>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);
    const [feedbackMode, setFeedbackMode] = useState<QuizFeedbackMode | null>(initialFeedbackMode ?? null);

    const yearRange = range(currentYear, currentYear + 5);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const groupOptions: Item<number>[] = groups.map(g => ({label: g.groupName as string, value: g.id as number}));

    function addValidated(what: ControlName) {
        setValidated(validated => {
            return new Set([...validated, what]);
        });
    }

    const groupInvalid = validated.has('group') && selectedGroups.length === 0;
    const dueDateInvalid = isDefined(dueDate) && dueDate.getTime() < now.getTime();
    const feedbackModeInvalid = validated.has('feedbackMode') && feedbackMode === null;

    return <div className="mb-4">
        <RS.Label className="w-100 mb-4">Set test to the following groups:<br/>
            <Select
                options={groupOptions}
                onChange={(s) => {
                    selectOnChange(setSelectedGroups, false)(s);
                    addValidated('group');
                }}
                onBlur={() => addValidated('group')}
                isSearchable
                menuPortalTarget={document.body}
                styles={{
                    control: (styles) => ({...styles, ...(groupInvalid ? {borderColor: '#dc3545'} : {})}),
                    menuPortal: base => ({...base, zIndex: 9999}),
                }}
            />
            {groupInvalid && <RS.FormFeedback className="d-block" valid={false}>You must select a group</RS.FormFeedback>}
        </RS.Label>
        <RS.Label className="w-100 mb-4">Set an optional due date:<br/>
            <DateInput invalid={dueDateInvalid || undefined} value={dueDate ?? undefined} yearRange={yearRange} defaultYear={currentYear}
                       defaultMonth={(day) => (day && day <= currentDay) ? currentMonth + 1 : currentMonth} onChange={(e) => setDueDate(e.target.valueAsDate)}/>
            {dueDateInvalid && <RS.FormFeedback>Due date must be after today</RS.FormFeedback>}
        </RS.Label>
        <RS.Label className="w-100 mb-4">What level of feedback should students get:<br/>
            <Select
                value={feedbackMode ? feedbackOptionsMap[feedbackMode] : null}
                onChange={(s) => {
                    if (s && (s as QuizFeedbackOption).value) {
                        const item = s as QuizFeedbackOption;
                        setFeedbackMode(item.value);
                    }
                    addValidated('feedbackMode');
                }}
                onBlur={() => addValidated('feedbackMode')}
                options={feedbackOptionsList}
                menuPortalTarget={document.body}
                styles={{
                    control: (styles) => ({...styles, ...(feedbackModeInvalid ? {borderColor: '#dc3545'} : {})}),
                    menuPortal: base => ({...base, zIndex: 9999}),
                }}
            />
            {feedbackModeInvalid && <RS.FormFeedback className="d-block" valid={false}>You must select a feedback mode</RS.FormFeedback>}
        </RS.Label>
        <div className="text-right">
            <RS.Button disabled={selectedGroups.length === 0 || !feedbackMode || submitting}
                       onMouseEnter={() => setValidated(new Set(['group', 'feedbackMode']))}
                       onClick={async () => {
                           const assignment = {
                               quizId: quiz.id,
                               groupId: selectedGroups[0].value,
                               dueDate: dueDate ?? undefined,
                               quizFeedbackMode: feedbackMode ?? undefined,
                           };
                           let toastId: string | null;
                           const again = () => {
                               if (toastId) {
                                   dispatch(hideToast(toastId));
                               }
                               dispatch(showQuizSettingModal(quiz, dueDate, feedbackMode));
                           };
                           try {
                               setSubmitting(true);
                               await dispatch(setQuiz(assignment));
                               toastId = await dispatch(showToast({
                                   color: "success", title: "Test set", body: "Test set to " + selectedGroups[0].label + " successfully", timeout: 7000,
                                   buttons: [<RS.Button key="again" onClick={again}>Set to another group</RS.Button>]
                               }));
                           } catch (e) {
                               return;
                           } finally {
                               setSubmitting(false);
                           }
                           dispatch(closeActiveModal());
                       }}
            >
                {submitting ? <IsaacSpinner /> : "Set test"}
            </RS.Button>
        </div>
    </div>;
}
