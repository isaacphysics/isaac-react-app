import React from "react";
import { useLocation, useNavigate } from "react-router";
import { IsaacProgrammeDTO } from "../cards/ProgrammeCard";
import { StyledTabPicker } from "../inputs/StyledTabPicker";
import { ContentSidebarProps, ContentSidebar } from "../layout/SidebarLayout";
import { useTranslation } from 'react-i18next'

interface ProgrammesSidebarProps extends ContentSidebarProps {
    programmes?: IsaacProgrammeDTO[];
}

export const ProgrammesSidebar = ({programmes, ...rest}: ProgrammesSidebarProps) => {
    const { t } = useTranslation()
    const navigate = useNavigate();
    const location = useLocation();

    return <ContentSidebar buttonTitle="Explore programmes" {...rest}>
        <div className="section-divider"/>
        <h5>{t('ourProgrammes', 'Our programmes')}</h5>
        <ul>
            <li>
                {programmes?.map((programme) =>
                    <StyledTabPicker
                        key={programme.id}
                        checkboxTitle={programme.title}
                        checked={false}
                        onClick={() => {
                            if (programme.id) {
                                void navigate({pathname: location.pathname, hash: `${programme.id.slice(programme.id.indexOf("_") + 1)}`}, {replace: true});
                                document.getElementById(programme.id.slice(programme.id.indexOf("_") + 1))?.scrollIntoView({behavior: "smooth"});
                            }
                        }}
                    />
                )}
            </li>
        </ul>
    </ContentSidebar>;
};
