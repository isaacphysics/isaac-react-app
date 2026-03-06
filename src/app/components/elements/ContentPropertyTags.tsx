import React from "react";
import { isPhy, isStaff, isTeacherOrAbove } from "../../services";
import { selectors, useAppSelector } from "../../state";
import classNames from "classnames";
import {v4 as uuid_v4} from "uuid";
import { UncontrolledTooltip } from "reactstrap";
import { ACCESSIBILITY_WARNINGS, getAccessibilityTags, useAccessibilitySettings } from "../../services/accessibility";

interface ContentPropertyTagsProps extends React.HTMLAttributes<HTMLDivElement> {
    deprecated?: boolean;
    supersededByPath?: string;
    tags?: string[];
}

export const ContentPropertyTags = ({ deprecated, supersededByPath, tags, ...rest }: ContentPropertyTagsProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const accessibilitySettings = useAccessibilitySettings();

    return <div {...rest} className={classNames("d-flex gap-2 align-items-center", rest.className)}>
        {isPhy && accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && getAccessibilityTags(tags)?.map(tag => {
            const id = `access-warn-${uuid_v4()}`; // must be globally unique. making refs in a loop was too painful.
            return <React.Fragment key={tag}>
                <i className={`icon icon-md ${ACCESSIBILITY_WARNINGS[tag].icon} icon-access-visual icon-color-black z-2`} id={id} />
                <span className="visually-hidden">{ACCESSIBILITY_WARNINGS[tag].description}</span>
                <UncontrolledTooltip target={`#${id}`} placement="top">
                    {ACCESSIBILITY_WARNINGS[tag].description}
                </UncontrolledTooltip>
            </React.Fragment>;
        })}

        {supersededByPath && isTeacherOrAbove(user) && <a 
            className="pill-tag-outline mw-max-content" 
            href={supersededByPath}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
        >SUPERSEDED</a>}

        {deprecated && isTeacherOrAbove(user) && <span
            className="pill-tag-outline mw-max-content" 
        >DEPRECATED</span>}

        {tags?.includes("nofilter") && isStaff(user) && <span
            className="pill-tag-outline mw-max-content" 
        >NO-FILTER</span>}
    </div>;
};
