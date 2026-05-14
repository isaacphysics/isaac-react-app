import React, {ReactElement} from "react";
import {IsaacContent} from "../content/IsaacContent";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {EditContentButton} from "./EditContentButton";
import {useGetPageFragmentQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { TeacherNotes } from "./TeacherNotes";
import { WEBMASTER_EMAIL } from "../../services";
import { useTranslation, Trans } from 'react-i18next'

interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}
export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const { t } = useTranslation()
    const fragmentQuery = useGetPageFragmentQuery(fragmentId);

    const notFoundComponent = ifNotFound ?? <div>
        <h2>{t('contentNotFound', 'Content not found')}</h2>
        <p className="my-4">
            {window.navigator.onLine 
                ? <>
                    {t('weaposreSorryPageFragmentNotFound', 'We&apos;re sorry, page fragment not found:')}
                    <code>{fragmentId}</code>
                </> 
                : <p><Trans i18nKey="brItLooksLikeYouaposreOfflineYouMayWantToCheckYourInternetConnectionAndThenRefreshThisPageToTryAgainBrIfYouAreStillHavingIssuesPleaseAHrefmailtowebmaster_emailletUsKnowa"><br />
                    It looks like you&apos;re offline. You may want to check your internet connection, and then refresh this page to try again.
                    <br />
                    If you are still having issues, please <a href={`mailto:${WEBMASTER_EMAIL}`}>let us know</a>.</Trans></p>}
        </p>
    </div>;

    return <ShowLoadingQuery
        ifError={() => notFoundComponent}
        query={fragmentQuery}
        thenRender={(fragment) =>
            <WithFigureNumbering doc={fragment}>
                <EditContentButton doc={fragment} />
                <TeacherNotes notes={fragment.teacherNotes} />
                <IsaacContent doc={fragment} />
            </WithFigureNumbering>
        }
        ifNotFound={notFoundComponent}
    />;
};
