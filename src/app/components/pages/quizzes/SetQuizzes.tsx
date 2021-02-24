import React, {useEffect, useState} from "react";
import {useDispatch, useSelector} from "react-redux";
import {Link, withRouter} from "react-router-dom";
import * as RS from "reactstrap";
import Select from 'react-select'

import {closeActiveModal, loadGroups, openActiveModal,} from "../../../state/actions";
import {ShowLoading} from "../../handlers/ShowLoading";
import {ContentSummaryDTO, QuizFeedbackMode, RegisteredUserDTO} from "../../../../IsaacApiTypes";
import {selectors} from "../../../state/selectors";
import {TitleAndBreadcrumb} from "../../elements/TitleAndBreadcrumb";
import {loadQuizzes} from "../../../state/actions/quizzes";
import {Spacer} from "../../elements/Spacer";
import { AppGroup } from '../../../../IsaacAppTypes';
import {currentYear, DateInput} from "../../elements/inputs/DateInput";
import {Item, unwrapValue} from '../../../services/select';
import {range} from "lodash";
import {isDefined} from "../../../services/miscUtils";

type QuizFeedbackOption = Item<QuizFeedbackMode>;
const feedbackOptions = {
    NONE: "No feedback",
    OVERALL_MARK: "Overall mark",
    SECTION_MARKS: "Mark for each quiz section",
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

function SettingQuizModal({quiz, groups}: { quiz: ContentSummaryDTO; groups: AppGroup[]}) {
    const [validated, setValidated] = useState<Set<ControlName>>(new Set());
    const [selectedGroups, setSelectedGroups] = useState<Item<number>[]>([]);
    const [dueDate, setDueDate] = useState<Date|null>(null);
    const [feedbackMode, setFeedbackMode] = useState<QuizFeedbackMode|null>(null);

    const yearRange = range(currentYear, currentYear + 5);
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const groupOptions = groups.map(g => ({label: g.groupName as string, value: g.id as number}));

    function addValidated(what: ControlName) {
        setValidated(validated => {
            return new Set([...validated, what]);
        });
    }

    const groupInvalid = validated.has('group') && selectedGroups.length === 0;
    const dueDateInvalid = isDefined(dueDate) && dueDate.getTime() < now.getTime();
    const feedbackModeInvalid = validated.has('feedbackMode') && feedbackMode === null;

    return <div>
        <RS.Label className="w-100">Set quiz to the following groups:<br />
            <Select
                value={selectedGroups}
                onChange={(s) => {
                    unwrapValue(setSelectedGroups)(s);
                    addValidated('group');
                }}
                onBlur={() => addValidated('group')}
                options={groupOptions}
                isSearchable
                styles={{
                    control: (styles) => ({...styles, ...(groupInvalid ? {borderColor: '#dc3545'} : {})}),
                }}
            />
            {groupInvalid && <RS.FormFeedback className="d-block" valid={false}>You must select a group</RS.FormFeedback>}
        </RS.Label>
        <RS.Label className="w-100">Set an optional due date:<br />
            <DateInput invalid={dueDateInvalid} value={dueDate ?? undefined} yearRange={yearRange} defaultYear={currentYear} defaultMonth={(day) => (day && day <= currentDay) ? currentMonth + 1 : currentMonth} onChange={(e) => setDueDate(e.target.valueAsDate)} />
            {dueDateInvalid && <RS.FormFeedback>Due date must be after today</RS.FormFeedback>}
        </RS.Label>
        <RS.Label className="w-100">What level of feedback should students get:<br />
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
                styles={{
                    control: (styles) => ({...styles, ...(feedbackModeInvalid ? {borderColor: '#dc3545'} : {})}),
                }}
            />
            {feedbackModeInvalid && <RS.FormFeedback className="d-block" valid={false}>You must select a feedback mode</RS.FormFeedback>}
        </RS.Label>
        <div className="text-right">
            <RS.Button disabled={selectedGroups.length === 0 || !feedbackMode} onMouseEnter={() => setValidated(new Set(['group', 'feedbackMode']))}>Set quiz</RS.Button>
        </div>
    </div>;
}

interface SetQuizzesPageProps {
    user: RegisteredUserDTO;
    location: {hash: string};
}

const SetQuizzesPageComponent = (props: SetQuizzesPageProps) => {
    const groups = useSelector(selectors.groups.active);
    const quizzes = useSelector(selectors.quizzes.available);

    const dispatch = useDispatch();

    useEffect(() => {
        dispatch(loadGroups(false));
        dispatch(loadQuizzes());
    }, [dispatch]);

    const pageHelp = <span>
        Use this page to set quizzes to your groups. You can assign any quiz the Isaac team have built.
        <br />
        Students in the group will be emailed when you set a new quiz.
    </span>;

    const setQuiz = (quiz: ContentSummaryDTO) => {
        dispatch(openActiveModal({
            closeAction: () => {dispatch(closeActiveModal())},
            title: "Setting quiz " + (quiz.title ?? quiz.id),
            body: <ShowLoading until={groups}>{groups && <SettingQuizModal quiz={quiz} groups={groups} />}</ShowLoading>
        }));
    }

    return <RS.Container>
        <TitleAndBreadcrumb currentPageTitle="Set quizzes" help={pageHelp} />
        <ShowLoading until={quizzes}>
            {quizzes && <>
                <h2>Available quizzes</h2>
                <RS.ListGroup className="mb-3 quiz-list">
                    {quizzes.map(quiz =>  <RS.ListGroupItem className="p-0 bg-transparent" key={quiz.id}>
                        <div className="flex-grow-1 p-2 d-flex">
                            <span>{quiz.title}</span>
                            {quiz.summary && <div className="small text-muted d-none d-md-block">{quiz.summary}</div>}
                            <Spacer />
                            <RS.Button onClick={() => setQuiz(quiz)}>Set Quiz</RS.Button>
                        </div>
                        <div>
                            <Link className="my-3 pl-3 pr-4 quiz-list-separator" to={{pathname: `/quiz/preview/${quiz.id}`}}>
                                <span>Preview</span>
                            </Link>
                        </div>
                    </RS.ListGroupItem>)}
                </RS.ListGroup>
            </>}</ShowLoading>
    </RS.Container>;
};

export const SetQuizzes = withRouter(SetQuizzesPageComponent);
