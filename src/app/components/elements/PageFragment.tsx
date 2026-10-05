import React, {ReactElement} from "react";
import {IsaacContent} from "../content/IsaacContent";
import {WithFigureNumbering} from "./WithFigureNumbering";
import {EditContentButton} from "./EditContentButton";
import {useGetPageFragmentQuery} from "../../state";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { TeacherNotes } from "./TeacherNotes";
import { WEBMASTER_EMAIL } from "../../services";
import { Trans, useTranslation } from "react-i18next";
import { TransAnchor } from "./TransAnchor";

interface PageFragmentComponentProps {
    fragmentId: string;
    ifNotFound?: ReactElement;
}
export const PageFragment = ({fragmentId, ifNotFound}: PageFragmentComponentProps) => {
    const { t } = useTranslation();
    const fragmentQuery = useGetPageFragmentQuery(fragmentId);

    const notFoundComponent = ifNotFound ?? <div>
        <h2>{t("common:clientError.contentNotFound")}</h2>
        <p className="my-4">
            {window.navigator.onLine 
                ? <>
                    <Trans
                        i18nKey="common:clientError.fragmentNotFound"
                        components={{
                            code: <code />,
                        }}
                        values={{ fragmentId }}
                    />
                </> 
                : <p>
                    <br />
                    <Trans
                        i18nKey="common:clientError.offlineMessage"
                        components={{
                            br: <br />,
                            contactLink: <TransAnchor href={`mailto:${WEBMASTER_EMAIL}`} />,
                        }}
                    />
                </p>}
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
