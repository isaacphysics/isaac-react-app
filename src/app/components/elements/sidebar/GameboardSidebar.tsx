import React from "react";
import { GameboardDTO, AssignmentDTO } from "../../../../IsaacApiTypes";
import { determineGameboardSubjects, isDefined, TAG_ID, tags, HUMAN_SUBJECTS, extractTeacherName } from "../../../services";
import { getFriendlyDaysUntil } from "../DateString";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { Pill, CompletionKey } from "./SidebarElements";

interface GameboardSidebarProps extends ContentSidebarProps {
    gameboard: GameboardDTO;
    assignments?: AssignmentDTO[];
};

const GameboardDetails = ({ gameboard }: { gameboard: GameboardDTO }) => {
    const subjects = determineGameboardSubjects(gameboard);

    const gameboardTags = Array.from((gameboard?.contents || []).reduce((a, c) => {
        if (isDefined(c.tags) && c.tags.length > 0) {
            return new Set([...Array.from(a), ...c.tags.map(id => id as TAG_ID)]);
        }
        return a;
    }, new Set<TAG_ID>())).filter(tag => isDefined(tag));
    const topics = (tags.getTopicTags(gameboardTags).length > 0
        ? tags.getTopicTags(gameboardTags)
        : tags.getFieldTags(gameboardTags)
    ).map(tag => tag.alias ?? tag.title).sort();

    return <>
        <div className="section-divider"/>
        <h5>Question deck</h5>
        <div className="mb-2">
            Subject{subjects.length > 1 && "s"}:
            <ul className="d-inline ms-1">{subjects.map(s => <li className="d-inline" key={s}><Pill title={HUMAN_SUBJECTS[s]} theme={s}/></li>)}</ul>
        </div>
        {(topics.length > 0) && <div className="mb-2">
            Topic{subjects.length > 1 && "s"}:
            <ul className="d-inline ms-1">{topics.map(t => <li key={t} className="d-inline"><Pill title={t}/></li>)}</ul>
        </div>}
    </>;
};

const AssignmentDetails = ({ assignment, multipleAssignments }: { assignment: AssignmentDTO; multipleAssignments?: boolean }) => {
    const {assignerSummary, creationDate, dueDate, groupName, scheduledStartDate} = assignment;
    const assigner = extractTeacherName(assignerSummary);
    const startDate = scheduledStartDate ?? creationDate;
    return <>
        {multipleAssignments && <div className="section-divider"/>}
        <div>Assigned to <b>{groupName}</b> by <b>{assigner}</b></div>
        {startDate && <div>Set: <b>{getFriendlyDaysUntil(startDate)}</b></div>}
        {dueDate && <div>Due: <b>{getFriendlyDaysUntil(dueDate)}</b></div>}
    </>;
};

const AllAssignmentDetails = ({ assignments }: { assignments?: AssignmentDTO[] }) => {
    const multipleAssignments = assignments && assignments.length > 1;
    return assignments && assignments.length > 0 && <>
        <div className={multipleAssignments ? "section-divider-bold" : "section-divider"}/>
        <h5>Assignment{multipleAssignments && "s"}</h5>
        {multipleAssignments && <div>You have multiple assignments for this question deck.</div>}
        <ul>{assignments.map(a => <li key={a.id}><AssignmentDetails assignment={a} multipleAssignments={multipleAssignments} /></li>)}</ul>
    </>;
};

export const GameboardSidebar = (props: GameboardSidebarProps) => {
    const {gameboard, assignments, ...rest} = props;

    return <ContentSidebar buttonTitle="Details" {...rest}>
        <GameboardDetails gameboard={gameboard} />
        <AllAssignmentDetails assignments={assignments} />
        <div className="section-divider"/>
        <CompletionKey/>
    </ContentSidebar>;
};
