import React from "react";
import { isStaff, isTeacherOrAbove } from "../../services";
import { selectors, useAppSelector } from "../../state";
import classNames from "classnames";
import {v4 as uuid_v4} from "uuid";
import { UncontrolledTooltip } from "reactstrap";
import { ACCESSIBILITY_WARNINGS, getAccessibilityTags } from "../../services/accessibility";

interface QuestionPropertyTagsProps extends React.HTMLAttributes<HTMLDivElement> {
    supersededBy?: string;
    tags?: string[];
}

export const QuestionPropertyTags = ({ supersededBy, tags, ...rest }: QuestionPropertyTagsProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const accessibilitySettings = useAppSelector(state => state?.userPreferences?.ACCESSIBILITY) || {};

    return <div {...rest} className={classNames("d-flex gap-2 align-items-center", rest.className)}>
        {accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && getAccessibilityTags(tags)?.map(tag => {
            const id = `access-warn-${uuid_v4()}`; // must be globally unique. making refs in a loop was too painful.
            return <React.Fragment key={tag}>
                <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[tag].icon} icon-access-visual icon-color-black z-2`} id={id} />
                <span className="visually-hidden">{ACCESSIBILITY_WARNINGS[tag].description}</span>
                <UncontrolledTooltip target={`#${id}`} placement="top">
                    {ACCESSIBILITY_WARNINGS[tag].description}
                </UncontrolledTooltip>
            </React.Fragment>;
        })}

        {supersededBy && isTeacherOrAbove(user) && <a 
            className="pill-tag-outline" 
            href={`/questions/${supersededBy}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
        >SUPERSEDED</a>}

        {tags?.includes("nofilter") && isStaff(user) && <span
            className="pill-tag-outline" 
        >NO-FILTER</span>}
    </div>;
};
