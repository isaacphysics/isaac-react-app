import React from "react";
import { isStaff, isTeacherOrAbove } from "../../services";
import { selectors, useAppSelector } from "../../state";
import classNames from "classnames";

interface QuestionPropertyTagsProps extends React.HTMLAttributes<HTMLDivElement> {
    supersededBy?: string;
    tags?: string[];
}

export const QuestionPropertyTags = ({ supersededBy, tags, ...rest }: QuestionPropertyTagsProps) => {
    const user = useAppSelector(selectors.user.orNull);
    const accessibilitySettings = useAppSelector(state => state?.userPreferences?.ACCESSIBILITY) || {};

    return <div {...rest} className={classNames("d-flex gap-2", rest.className)}>
        {supersededBy && isTeacherOrAbove(user) && <a 
            className="pill-tag-outline" 
            href={`/questions/${supersededBy}`}
            onClick={(e) => e.stopPropagation()}
            target="_blank"
        >SUPERSEDED</a>}
        {tags?.includes("nofilter") && isStaff(user) && <span
            className="pill-tag-outline" 
        >NO-FILTER</span>}
        {tags?.includes("vi_inaccessible") && accessibilitySettings?.SHOW_INACCESSIBLE_WARNING && <span
            className="warning-tag"
        >INACCESSIBLE</span>}
    </div>;
};
