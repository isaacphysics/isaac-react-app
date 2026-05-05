import React, { useMemo, useState } from "react";
import { GameboardDTO } from "../../../../IsaacApiTypes";
import { Row, Col, Button, Label, Collapse, Badge } from "reactstrap";
import { generateGameboardSubjectHexagons, isDefined, above, HUMAN_SUBJECTS, stageLabelMap, difficultyShortLabelMap, PATHS, tags, determineGameboardStagesAndDifficulties, determineGameboardSubjects, TAG_ID, useDeviceSize, Subject, isPhy, below, isTutorOrAbove } from "../../../services";
import { HexIcon } from "../svg/HexIcon";
import { Link } from "react-router-dom";
import classNames from "classnames";
import { Spacer } from "../Spacer";
import { ShareLink } from "../ShareLink";
import { SaveBoardButton } from "../SaveBoardButton";
import { selectors, useAppSelector } from "../../../state";

export enum GameboardLinkLocation {
    // where on the card can the user click to navigate to the gameboard
    Card,
    Title
}
interface BoardItemIndicatorProps extends React.HTMLAttributes<HTMLSpanElement> {
    count: number;
    type: "list-view" | "board-card"
}

export const BoardItemIndicator = ({count, type, ...rest}: BoardItemIndicatorProps) => {
    return <Badge 
        color="theme" {...rest} 
        className={classNames("count-tag", {"list-view-status-indicator": type === "list-view", "board-card-status-indicator": type === "board-card"}, rest.className)}
    >
        {count < 100 ? count : "99+"}
    </Badge>;
};

interface CardUsageInfoProps extends React.HTMLAttributes<HTMLDivElement> {
    gameboard?: GameboardDTO;
    groupCount?: number;
    isSetAssignments?: boolean;
}

// "Attempted/Correct" percentages or "Assigned to X groups"
const CardUsageInfo = ({ gameboard, groupCount, isSetAssignments, className, ...rest }: CardUsageInfoProps) => {
    return <div {...rest} className={classNames(className, "d-flex justify-content-center justify-content-md-end column-gap-7 column-gap-md-4")}>
        {!isSetAssignments 
            ? <>
                <Label className="d-block w-max-content text-center text-nowrap pt-3">
                    {isDefined(gameboard) &&<div className="board-percent-completed">{gameboard.percentageAttempted ?? 0}</div>}
                    Attempted
                </Label>
                <Label className="d-block w-max-content text-center text-nowrap pt-3">
                    {isDefined(gameboard) && <div className="board-percent-completed">{gameboard.percentageCorrect ?? 0}</div>}
                    Correct
                </Label> 
            </>
            : <>
                <Label className="d-block w-max-content text-center text-nowrap pt-3 pt-md-1" title="Number of groups assigned">
                    Assigned to
                    <div className="board-bubble-info">{groupCount ?? 0}</div>
                    group{groupCount !== 1 && "s"}
                </Label>
            </>
        }
    </div>;
};

interface GameboardCardProps extends React.HTMLAttributes<HTMLElement> {
    gameboard?: GameboardDTO;
    linkLocation?: GameboardLinkLocation;
    openAssignModal?: () => void;
    groupCount?: number;
}

// any children passed into this component will be rendered in the card body
export const GameboardCard = (props: GameboardCardProps) => {
    const {gameboard, linkLocation, children, openAssignModal, groupCount, ...rest} = props;

    const isSetAssignments = isDefined(groupCount);
    const user = useAppSelector(selectors.user.orNull);

    const [showMore, setShowMore] = useState(false);
    const boardStagesAndDifficulties = useMemo(() => determineGameboardStagesAndDifficulties(gameboard), [gameboard]);

    const deviceSize = useDeviceSize();

    const topics = tags.getTopicTags(Array.from((gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag))).map(tag => tag.alias ?? tag.title).sort();

    const boardSubjects = determineGameboardSubjects(gameboard);

    const boardLink = gameboard && (isSetAssignments 
        ? `/assignment/${gameboard.id}`
        : `${PATHS.GAMEBOARD}#${gameboard.id}`
    );

    const card = <div className="px-3 py-2 flex-grow-1">
        <Row data-testid="my-assignment">
            <Col className="d-flex flex-column align-items-start">
                <div className="d-flex align-items-center w-100">
                    <div className="d-flex position-relative justify-content-center board-subject-hexagon-size me-4 my-2">
                        <div className="board-subject-hexagon-container justify-content-center">
                            {generateGameboardSubjectHexagons(boardSubjects)}
                        </div>
                        <HexIcon icon="icon-question-deck" subject={boardSubjects[0] as Subject} className="assignment-hex ps-3"/>
                        {gameboard?.contents && <BoardItemIndicator count={gameboard.contents.length} type="board-card" data-bs-theme={boardSubjects[0]} />}
                    </div>
                    <div className="d-flex flex-column flex-grow-1">
                        <h4 className="text-break m-0">
                            {isDefined(gameboard) && (
                                linkLocation === GameboardLinkLocation.Title
                                    ? <Link to={`${PATHS.GAMEBOARD}#${gameboard.id}`}>{gameboard.title}</Link>
                                    : gameboard.title
                            )}
                        </h4>
                        {above['sm'](deviceSize) && boardSubjects.length > 0 && <div className="d-flex align-items-center mb-2">
                            {boardSubjects.map((subject) => <span key={subject} className="badge rounded-pill bg-theme me-1" data-bs-theme={subject}>{HUMAN_SUBJECTS[subject]}</span>)}
                        </div>}
                    </div>
                    {!below['xs'](deviceSize) && <CardUsageInfo className="float-end" gameboard={gameboard} groupCount={groupCount} isSetAssignments={isSetAssignments} />}
                </div>

                {children}

                <Spacer/>
            </Col>
        </Row>

        {below['xs'](deviceSize) && <CardUsageInfo className="d-flex w-100 justify-content-around" gameboard={gameboard} groupCount={groupCount} isSetAssignments={isSetAssignments} />}

        <div className="d-flex flex-column flex-sm-row align-items-start mt-2">
            <Button className="my-2 btn-underline order-1 order-sm-0" color="link" onClick={(e) => {e.preventDefault(); setShowMore(!showMore);}}>
                {showMore ? "Hide details" : "Show details"}
            </Button>
            <Spacer />
            <div className="d-flex gap-3 align-self-stretch align-items-center mb-2 order-0 order-sm-1">
                {isPhy && gameboard && <SaveBoardButton board={gameboard} color="keyline" size="sm" />}
                {isPhy && boardLink && <div className="card-share-link">
                    <ShareLink linkUrl={boardLink} reducedWidthLink clickAwayClose size="sm" buttonProps={{color: "keyline"}} />
                </div>}
                {isTutorOrAbove(user) && <Button className="flex-grow-1" color="keyline" onClick={(e) => {e.preventDefault(); openAssignModal?.();}}>
                    {isSetAssignments ? "Assign / Unassign" : "Assign"}
                </Button>}
            </div>
        </div>

        {/* collapsed info */}
        <Collapse isOpen={showMore} className="w-100">
            <Row>
                <Col xs={12} md={8} className="mt-sm-2">
                    <p className="mb-0"><strong>Questions:</strong> {gameboard?.contents?.length || "0"}</p>
                    {isDefined(topics) && topics.length > 0 && <p className="mb-0">
                        <strong>{topics.length === 1 ? "Topic" : "Topics"}:</strong>{" "}
                        {topics.join(", ")}
                    </p>}
                </Col>
                <Col xs={12} md={4} className="mt-sm-2">
                    {boardStagesAndDifficulties.length > 0 &&
                        <table className="w-100 mb-0">
                            <thead>
                                <tr>
                                    <th className="w-50">
                                        {`Stage${boardStagesAndDifficulties.length > 1 ? "s" : ""}:`}
                                    </th>
                                    <th className="w-50">
                                        {`Difficult${boardStagesAndDifficulties.some(([, ds]) => ds.length > 1) ? "ies" : "y"}`}
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {boardStagesAndDifficulties.map(([stage, difficulties]) => <tr key={stage}>
                                    <td className="w-50 align-baseline">
                                        {stageLabelMap[stage]}:
                                    </td>
                                    <td className="w-50 ps-1">
                                        {difficulties.map((d) => difficultyShortLabelMap[d]).join(", ")}
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    }
                </Col>
            </Row>
        </Collapse>
    </div>;

    if (gameboard && linkLocation === GameboardLinkLocation.Card && boardLink) {
        return <Link {...rest} className={classNames("w-100 d-flex assignments-card mb-3", rest.className)} to={boardLink}>
            {card}
        </Link>;
    } else {
        return <div className={classNames("w-100 d-flex assignments-card mb-3", rest.className)}>
            {card}
        </div>;
    }
};
