import React, {ChangeEvent, useState} from "react";
import {ContentSummaryDTO, IsaacQuizDTO, QuizAssignmentDTO, QuizFeedbackMode} from "../../../../IsaacApiTypes";
import {
    AppDispatch,
    closeActiveModal,
    selectors,
    useAppDispatch,
    useAppSelector,
    useAssignQuizMutation,
    useGetGroupsQuery,
    useGetQuizAssignmentsSetByMeQuery,
} from "../../../state";
import {assignMultipleQuiz, isDefined, Item, selectOnChange, TODAY} from "../../../services";
import range from "lodash/range";
import {currentYear, DateInput} from "../inputs/DateInput";
import {IsaacSpinner} from "../../handlers/IsaacSpinner";
import {ShowLoadingQuery} from "../../handlers/ShowLoadingQuery";
import {StyledSelect} from "../inputs/StyledSelect";
import {Button, FormFeedback, Label, UncontrolledTooltip} from "reactstrap";
import { AppGroup } from "../../../../IsaacAppTypes";


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

export function QuizSettingModal({quiz, dueDate: initialDueDate, scheduledStartDate: initialScheduledStartDate, feedbackMode: initialFeedbackMode}: QuizSettingModalProps) {
    const dispatch: AppDispatch = useAppDispatch();
    const groupsQuery = useGetGroupsQuery(false);
    const user = useAppSelector(selectors.user.loggedInOrNull);

    const [_assignQuiz, {isLoading: isAssigning}] = useAssignQuizMutation();

    const [validated, setValidated] = useState<Set<ControlName>>(new Set());
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date | null>(initialDueDate ?? null);
    const [scheduledStartDate, setScheduledStartDate] = useState<Date | null>(initialScheduledStartDate ?? null);
    const [feedbackMode, setFeedbackMode] = useState<QuizFeedbackMode | null>(initialFeedbackMode ?? null);
    const {data: quizAssignments} = useGetQuizAssignmentsSetByMeQuery();

    const yearRange = range(currentYear, currentYear + 5);

    function addValidated(what: ControlName) {
        setValidated(validated => {
            return new Set([...validated, what]);
        });
    }

    function assign() {
        dispatch(assignMultipleQuiz({
            quizId: quiz?.id as string,
            groups: selectedGroups,
            dueDate: dueDate ?? undefined,
            scheduledStartDate: scheduledStartDate ?? undefined,
            quizFeedbackMode: feedbackMode ?? undefined,
            userId: user?.id
        })).then(success => {
            if (success) {
                setValidated(new Set());
                setSelectedGroups([]);
                setDueDate(null);
                setScheduledStartDate(null);
                setFeedbackMode(null);
            }
        });
    }

    const isAssignmentSetToThisGroup = (group: Item<number>, assignment?: QuizAssignmentDTO) => assignment ? (assignment.quizId === quiz.id && assignment.groupId === group.value && (assignment.dueDate ? assignment.dueDate.valueOf() > Date.now() : true)) : false;
    const alreadyAssignedToAGroup = selectedGroups.some(group => quizAssignments?.some(assignment => isAssignmentSetToThisGroup(group, assignment)));
    
    const groupInvalid = validated.has('group') && selectedGroups.length === 0 || alreadyAssignedToAGroup;    
    const dueDateInvalid = isDefined(dueDate) && ((scheduledStartDate ? scheduledStartDate.valueOf() > dueDate.valueOf() : false) || dueDate.valueOf() < Date.now());
    const scheduledStartDateInvalid = isDefined(scheduledStartDate) && scheduledStartDate.valueOf() < TODAY().valueOf();
    const feedbackModeInvalid = validated.has('feedbackMode') && feedbackMode === null;

    const scheduledQuizHelpTooltipId = "scheduled-quiz-help-tooltip";

    return <div className="mb-4">
        <Label className="w-100 mb-4">Set test to the following group(s):<br/>
            <ShowLoadingQuery
                query={groupsQuery}
                defaultErrorTitle={"Error fetching groups"}
                thenRender={groups => {
                    const groupOptions = groups.map((g: AppGroup) => {return {label: g.groupName as string, value: g.id as number}; });

                    return <StyledSelect isMulti placeholder="Select groups"
                        options={groupOptions}
                        onChange={(s) => {
                            selectOnChange(setSelectedGroups, false)(s);
                            addValidated('group');
                        }}
                        value={selectedGroups}
                        onBlur={() => addValidated('group')}
                        isSearchable
                        menuPortalTarget={document.body}
                        styles={{
                            control: (styles) => ({...styles, ...(groupInvalid ? {borderColor: '#dc3545'} : {})}),
                            menuPortal: base => ({...base, zIndex: 9999}),
                        }}
                    />;
                }}
            />
            {groupInvalid && (selectedGroups.length === 0 ? <FormFeedback className="d-block" valid={false}>You must select a group</FormFeedback> : <FormFeedback className="d-block" valid={false}>You cannot reassign a test to this group(s) until the due date has passed.</FormFeedback>)}
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
        <Label className="w-100 mb-4">Set an optional start date:<span id={scheduledQuizHelpTooltipId} className="icon-help"/><br/>
            <DateInput value={scheduledStartDate ?? undefined} invalid={scheduledStartDateInvalid || undefined}
                       yearRange={yearRange}
                       onChange={(e: ChangeEvent<HTMLInputElement>) => setScheduledStartDate(e.target.valueAsDate)}
            />
            <UncontrolledTooltip placement="top" autohide={false} target={scheduledQuizHelpTooltipId}>
                You can schedule a test to appear in the future by setting a start date.
                The test will be visible to students from this date onwards.<br/>
                If you do not set a start date, the test will be visible immediately.
            </UncontrolledTooltip>
            {scheduledStartDateInvalid && <small className={"pt-2 text-danger"}>Start date must be today or in the future.</small>}
        </Label>
        <Label className="w-100 mb-4">Set an optional due date:<br/>
            <DateInput invalid={dueDateInvalid || undefined} value={dueDate ?? undefined} yearRange={yearRange}
                       onChange={(e) => setDueDate(e.target.valueAsDate)}/>
            {dueDateInvalid && <small className={"pt-2 text-danger"}>{dueDate.valueOf() > TODAY().valueOf() ? "Due date must be on or after the start date." : `Due date must be after today.`}</small>}
        </Label>

        <div className="w-100">
            <Button
                className={"float-start mb-4"}
                color="tertiary"
                disabled={isAssigning}
                onClick={() => dispatch(closeActiveModal())}
            >
                Close
            </Button>
            <Button
                className={"float-end mb-4"}
                disabled={groupInvalid || !feedbackMode || isAssigning || dueDateInvalid || scheduledStartDateInvalid}
                onMouseEnter={() => setValidated(new Set(['group', 'feedbackMode']))}
                onClick={assign}
            >
                {isAssigning ? <IsaacSpinner size={"sm"} /> : "Set test"}
            </Button>
        </div>
    </div>;
}
