import React, {ChangeEvent, useState} from "react";
import {ContentSummaryDTO, IsaacQuizDTO, QuizFeedbackMode} from "../../../../IsaacApiTypes";
import {
    AppDispatch,
    closeActiveModal, hideToast,
    setQuiz, showQuizSettingModal,
    showToast,
    useAppDispatch,
    useGetGroupsQuery
} from "../../../state";
import {isDefined, Item, nthHourOf, selectOnChange, TODAY} from "../../../services";
import range from "lodash/range";
import {currentYear, DateInput} from "../inputs/DateInput";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {StyledSelect} from "../inputs/StyledSelect";
import {Button, FormFeedback, Label, UncontrolledTooltip} from "reactstrap";


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

type ControlName = 'group' | 'dueDate' | 'scheduledStartDate' | 'feedbackMode';

interface QuizSettingModalProps {
    allowedToSchedule?: boolean;
    quiz: ContentSummaryDTO | IsaacQuizDTO;
    dueDate?: Date | null;
    scheduledStartDate?: Date | null;
    feedbackMode?: QuizFeedbackMode | null;
}

export function QuizSettingModal({allowedToSchedule, quiz, dueDate: initialDueDate, scheduledStartDate: initialScheduledStartDate, feedbackMode: initialFeedbackMode}: QuizSettingModalProps) {
    const dispatch: AppDispatch = useAppDispatch();
    const groupsQuery = useGetGroupsQuery(false);

    const [validated, setValidated] = useState<Set<ControlName>>(new Set());
    const [submitting, setSubmitting] = useState(false);
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);
    const [scheduledStartDate, setScheduledStartDate] = useState<Date | null>(initialScheduledStartDate ?? null);
    const [feedbackMode, setFeedbackMode] = useState<QuizFeedbackMode | null>(initialFeedbackMode ?? null);

    const yearRange = range(currentYear, currentYear + 5);

    function addValidated(what: ControlName) {
        setValidated(validated => {
            return new Set([...validated, what]);
        });
    }

    const groupInvalid = validated.has('group') && selectedGroups.length === 0;
    const dueDateInvalid = isDefined(dueDate) && ((scheduledStartDate ? scheduledStartDate.valueOf() > dueDate.valueOf() : false) || dueDate.valueOf() < Date.now());
    const scheduledStartDateInvalid = isDefined(scheduledStartDate) && scheduledStartDate.valueOf() <= TODAY().valueOf();
    const feedbackModeInvalid = validated.has('feedbackMode') && feedbackMode === null;

    const scheduledQuizHelpTooltipId = "scheduled-quiz-help-tooltip";

    return <div className="mb-4">
        <Label className="w-100 mb-4">Set test to the following group:<br/>
            <ShowLoadingQuery
                query={groupsQuery}
                defaultErrorTitle={"Error fetching groups"}
                thenRender={groups => {
                    const groupOptions: Item<number>[] = groups.map(g => ({label: g.groupName as string, value: g.id as number}));
                    return <StyledSelect
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
                }}
            />
            {groupInvalid && <FormFeedback className="d-block" valid={false}>You must select a group</FormFeedback>}
        </Label>
        <Label className="w-100 mb-4">What level of feedback should students get:<br/>
            <StyledSelect
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
            {feedbackModeInvalid && <FormFeedback className="d-block" valid={false}>You must select a feedback mode</FormFeedback>}
        </Label>
        {allowedToSchedule && <Label className="w-100 mb-4">Set an optional start date:<span id={scheduledQuizHelpTooltipId} className="icon-help"/><br/>
            <DateInput value={scheduledStartDate ?? undefined} invalid={scheduledStartDateInvalid || undefined}
                       yearRange={yearRange}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate)}
            />
            <UncontrolledTooltip placement="top" autohide={false} target={scheduledQuizHelpTooltipId}>
                You can schedule a test to appear in the future by setting a start date.
                The test will be visible to students from this date onwards.<br/>
                If you do not set a start date, the test will be visible immediately.
            </UncontrolledTooltip>
            {scheduledStartDateInvalid && <small className={"pt-2 text-danger"}>Start date must be today, or in the future.</small>}
        </Label>}
        <Label className="w-100 mb-4">Set an optional due date:<br/>
            <DateInput invalid={dueDateInvalid || undefined} value={dueDate ?? undefined} yearRange={yearRange}
                       onChange={(e) => setDueDate(e.target.valueAsDate)}/>
            {dueDateInvalid && <small className={"pt-2 text-danger"}>{allowedToSchedule ? "Due date must be on, or after the start date." : "Due date must be after today."}</small>}
        </Label>
        <div className="text-right">
            <Button disabled={selectedGroups.length === 0 || !feedbackMode || submitting || dueDateInvalid || scheduledStartDateInvalid}
                       onMouseEnter={() => setValidated(new Set(['group', 'feedbackMode']))}
                       onClick={async () => {
                           const assignment = {
                               quizId: quiz.id,
                               groupId: selectedGroups[0].value,
                               dueDate: dueDate ?? undefined,
                               scheduledStartDate: scheduledStartDate ? nthHourOf(7, scheduledStartDate) : undefined,
                               quizFeedbackMode: feedbackMode ?? undefined,
                           };
                           if (!allowedToSchedule) {
                               delete assignment.scheduledStartDate;
                           }
                           let toastId: string | null;
                           const again = () => {
                               if (toastId) {
                                   dispatch(hideToast(toastId));
                               }
                               dispatch(showQuizSettingModal(quiz, allowedToSchedule, dueDate, scheduledStartDate, feedbackMode));
                           };
                           try {
                               setSubmitting(true);
                               await dispatch(setQuiz(assignment));
                               toastId = await dispatch(showToast({
                                   color: "success", title: "Test set", body: "Test set to " + selectedGroups[0].label + " successfully", timeout: 7000,
                                   buttons: [<Button key="again" onClick={again}>Set to another group</Button>]
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
            </Button>
        </div>
    </div>;
}
