import React from "react";
import * as RS from "reactstrap";
import classnames from "classnames";

interface TeacherAchievementProps {
    verb: string;
    count: number | null | undefined;
    item: string;
    createMoreText: string;
    createMoreLink: string;
    iconClassName: string;
}

const verbPastToInfinitive = new Map([
    ["created", "create"],
    ["set", "set"],
    ["visited", "visit"]
]);

export const TeacherAchievement = (props: TeacherAchievementProps) => {
    const {verb, count, item, createMoreText, createMoreLink, iconClassName} = props;
    const infinitive = verbPastToInfinitive.get(verb) || "unknown";
    return <RS.Row className="teacher-achievement my-2">
        <RS.Col className="teacher-badge">
            <span className={iconClassName + " " + classnames({"badge-icon": true, unlocked: count})}></span>
        </RS.Col>
        <RS.Col className="text-offset">
            You have {verb} <span>{count}</span> {item}{count !== 1 && "s"}.<br/>
            {infinitive.charAt(0).toUpperCase() + infinitive.slice(1)} more {item}s on the <a href={createMoreLink}>{createMoreText}</a> page.
        </RS.Col>
    </RS.Row>
};
