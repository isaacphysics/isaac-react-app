import React from "react";
import classNames from "classnames";
import { Link } from "react-router";
import { Row, Col, Button } from "reactstrap";
import { QuizAssignmentDTO } from "../../../../IsaacApiTypes";
import { useDeviceSize, tags, isDefined, TAG_ID, PATHS, generateGameboardSubjectHexagons, Subject, above, HUMAN_SUBJECTS, below, isPhy, isTutorOrAbove, TODAY, isOverdue } from "../../../services";
import { selectors, useAppSelector } from "../../../state";
import { ShareLink } from "../ShareLink";
import { Spacer } from "../Spacer";
import { HexIcon } from "../svg/HexIcon";
import { GameboardLinkLocation } from "./GameboardCard";
import { getFriendlyDaysUntil } from "../DateString";

type TestCardUsageDisplay = {
    type: "progressLink";
}

interface CardUsageInfoProps extends React.HTMLAttributes<HTMLDivElement> {
    quizAssignment?: QuizAssignmentDTO;
    usageDisplay?: TestCardUsageDisplay;
}
    
// "Attempted/Correct" percentages or "Assigned to X groups"
const CardUsageInfo = ({ quizAssignment, usageDisplay, className, ...rest }: CardUsageInfoProps) => {
    if (!quizAssignment) return;
    return <div {...rest} className={classNames(className, "d-flex justify-content-center justify-content-md-end align-self-start column-gap-7 column-gap-md-4", {"card-usage-branded-corner": usageDisplay?.type === "progressLink"})}>
        {usageDisplay?.type === "progressLink" && <>
            {isDefined(quizAssignment.scheduledStartDate) && quizAssignment.scheduledStartDate >= TODAY()
                ? <div className="d-flex align-items-center">
                    <span>
                        Begins&nbsp;
                        <b>{getFriendlyDaysUntil(quizAssignment.scheduledStartDate)}</b>
                    </span>
                </div>
                : <Link to={`${PATHS.TEST}/${quizAssignment.id}/feedback`} target="_blank" className="d-flex align-items-center gap-2">
                    <b>View group results</b>
                    <span className={"visually-hidden"}>(opens in new tab)</span>
                    <i className="icon icon-arrow-right" aria-hidden="true" />
                </Link>
            }
        </>}
    </div>;
};

type TestCardProps = React.HTMLAttributes<HTMLElement> & {
    quizAssignment?: QuizAssignmentDTO;
    linkLocation?: GameboardLinkLocation;
    openAssignModal?: () => void;
    cancel?: () => void;
    extendDueDate?: () => void;
    // useAssignmentLink?: boolean; // whether to use /assignment/:id over /gameboards#:i
    allowManaging?: boolean; // replaces "assign" with both "unset" and "set again" buttons for more precise assignment management
    usageDisplay?: TestCardUsageDisplay;
};


// any children passed into this component will be rendered in the card body
export const TestCard = (props: TestCardProps) => {
    const {quizAssignment, linkLocation, children, openAssignModal, cancel, extendDueDate, allowManaging, usageDisplay, ...rest} = props;

    const user = useAppSelector(selectors.user.orNull);
    const deviceSize = useDeviceSize();

    const testUrl = quizAssignment ? `${PATHS.TEST}/${quizAssignment.id}` : undefined;
    const subjects = tags.getSubjectTags(quizAssignment?.quizSummary?.tags as TAG_ID[] || []).map(t => t.id);

    const card = <div className="px-3 py-2 flex-grow-1">
        <Row data-testid="my-assignment">
            <Col className="d-flex flex-column align-items-start">
                <div className="d-flex align-items-center w-100">
                    <div className="d-flex position-relative justify-content-center board-subject-hexagon-size me-4 my-2">
                        <div className="board-subject-hexagon-container justify-content-center">
                            {generateGameboardSubjectHexagons(subjects)}
                        </div>
                        <HexIcon icon="icon-tests" subject={subjects[0] as Subject} className="assignment-hex ps-3"/>
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                        <h4 className="text-break m-0">
                            {isDefined(quizAssignment) && (
                                linkLocation === GameboardLinkLocation.Title
                                    ? <Link to={`${PATHS.TEST}/${quizAssignment.id}`}>{quizAssignment.quizSummary?.title}</Link>
                                    : quizAssignment.quizSummary?.title || "Untitled Test"
                            )}
                        </h4>
                        {above['sm'](deviceSize) && subjects.length > 0 && <div className="d-flex align-items-center mb-2">
                            {subjects.map((subject) => <span key={subject} className="badge rounded-pill bg-theme me-1" data-bs-theme={subject}>{HUMAN_SUBJECTS[subject]}</span>)}
                        </div>}
                    </div>
                    {!below['xs'](deviceSize) && <CardUsageInfo className="float-end" quizAssignment={quizAssignment} usageDisplay={usageDisplay} />}
                </div>

                {children}

                <Spacer/>
            </Col>
        </Row>

        {below['xs'](deviceSize) && <CardUsageInfo className="d-flex w-100 justify-content-around" quizAssignment={quizAssignment} usageDisplay={usageDisplay} />}

        <div className="d-flex flex-column flex-sm-row align-items-start mt-2">
            <Spacer />
            <div className="d-flex gap-3 align-self-stretch align-items-center mb-2 order-0 order-sm-1">
                {isPhy && testUrl && <div className="card-share-link">
                    <ShareLink linkUrl={testUrl} reducedWidthLink clickAwayClose size="sm" buttonProps={{color: "keyline", disabled: !!(quizAssignment && isOverdue(quizAssignment))}} />
                </div>}
                {allowManaging
                    ? isTutorOrAbove(user) && <>
                        <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); cancel?.();}}>
                            Unassign
                        </Button>
                        <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); extendDueDate?.();}}>
                            Extend due date
                        </Button>
                        <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); openAssignModal?.();}}>
                            Set again
                        </Button>
                    </>
                    : isTutorOrAbove(user) && <>
                        <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); openAssignModal?.();}}>
                            Assign
                        </Button>
                    </>
                }
            </div>
        </div>
    </div>;

    if (quizAssignment && linkLocation === GameboardLinkLocation.Card && testUrl) {
        return <Link {...rest} className={classNames("w-100 d-flex assignments-card mb-3", rest.className)} to={testUrl}>
            {card}
        </Link>;
    } else {
        return <div className={classNames("w-100 d-flex assignments-card mb-3", rest.className)}>
            {card}
        </div>;
    }
};
