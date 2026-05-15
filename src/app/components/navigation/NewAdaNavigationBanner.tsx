import React from "react";
import { DismissibleBanner } from "./DismissibleBanner";
import { isAda, isLoggedIn, isTeacherOrAbove } from "../../services";
import { selectors, useAppSelector } from "../../state";

export const NewAdaNavigationBanner = () => {
    const user = useAppSelector(selectors.user.orNull);
    return isAda && isLoggedIn(user) && <DismissibleBanner cookieName="adaNavigationBannerDismissed" theme="info">
        Navigation now has a new look! Use My Ada to access your{" "}
        {isTeacherOrAbove(user) 
            ? <>teaching groups, markbook, assignments and more.</>
            : <>assignments, tests, progress and more.</>
        }
    </DismissibleBanner>;
};
