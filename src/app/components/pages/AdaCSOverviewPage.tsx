import React from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageMetadata} from "../elements/PageMetadata";
import {AffixButton} from "../elements/AffixButton";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { TextBlock } from "../elements/layout/TextBlock";
import { ImageBlock } from "../elements/layout/ImageBlock";
import { useTranslation } from "react-i18next";


export const AdaCSOverviewPage = () => {
    const { t } = useTranslation();
    return <Container data-bs-theme={undefined} className="ada-overview-page">
        <TitleAndBreadcrumb
            currentPageTitle={t("common:csOverview.overviewTitle")}
            icon={{
                type: "img",
                subject: undefined,
                icon: "/assets/common/logos/ada_logo_stamp_aqua.svg",
                width: "75px",
                height: "75px",
            }}
        />
        <div>
            <PageMetadata title={t("common:csOverview.pageTitle")} />
            <p>
                {t("common:csOverview.description")}
            </p>

            <ColumnSlice>
                <TextBlock>
                    <h2>{t("common:csOverview.students.title")}</h2>
                    <div>
                        {t("common:csOverview.students.intro")}
                        <ul>
                            <li>{t("common:csOverview.students.featureLearn")}</li>
                            <li>{t("common:csOverview.students.featurePractise")}</li>
                            <li>{t("common:csOverview.students.featureTrack")}</li>
                            <li>{t("common:csOverview.students.featureChallenges")}</li>
                        </ul>
                    </div>
                </TextBlock>
                <ImageBlock>
                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4"src="/assets/cs/decor/learner-1.png" alt=""/>
                </ImageBlock>
            </ColumnSlice>

            <ColumnSlice reverseUnderBreakpoint>
                <ImageBlock>
                    <img className="px-0 px-sm-3 px-md-0 px-lg-2 px-xl-4" src="/assets/cs/decor/teacher-1.png" alt=""/>
                </ImageBlock>
                <TextBlock>
                    <h2>{t("common:csOverview.teachers.title")}</h2>
                    <div>
                        {t("common:csOverview.teachers.intro")}
                        <ul>
                            <li>{t("common:csOverview.teachers.featureTeach")}</li>
                            <li>{t("common:csOverview.teachers.featureAssignments")}</li>
                            <li>{t("common:csOverview.teachers.featureMarkbook")}</li>
                        </ul>
                    </div>
                </TextBlock>
            </ColumnSlice>

            <div className="text-center py-4">
                <AffixButton
                    color="solid"
                    target={"_blank"}
                    href={"https://adacomputerscience.org"}
                    affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}
                    className="px-9 py-3 fs-6 position-relative"
                >
                    {t("common:csOverview.visitButton")}
                </AffixButton>
            </div>

        </div>
    </Container>;
};
