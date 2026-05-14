import React from "react";
import { DismissibleBanner } from "./DismissibleBanner";
import { isAda, isLoggedIn, isTeacherOrAbove } from "../../services";
import { selectors, useAppSelector } from "../../state";
import { useTranslation } from 'react-i18next'

export const NewAdaNavigationBanner = () => {
    const { t } = useTranslation()
    const user = useAppSelector(selectors.user.orNull);
    return isAda && isLoggedIn(user) && <DismissibleBanner cookieName="adaNavigationBannerDismissed" theme="info">
        {t('navigationNowHasANewLookUseMyAdaToAccessYour', 'Navigation now has a new look! Use My Ada to access your')}{" "}
        {isTeacherOrAbove(user) 
            ? <>{t('teachingGroupsMarkbookAssignmentsAndMore', 'teaching groups, markbook, assignments and more.')}</>
            : <>{t('assignmentsTestsProgressAndMore', 'assignments, tests, progress and more.')}</>
        }
    </DismissibleBanner>;
};
