import React, { useEffect, useState } from "react";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { ShowLoading } from "../handlers/ShowLoading";
import { IsaacProgrammeDTO, ProgrammeCard } from "../elements/cards/ProgrammeCard";
import { ContentDTO } from "../../../IsaacApiTypes";
import { ProgrammesSidebar } from "../elements/sidebar/ProgrammesSidebar";
import { PageContainer } from "../elements/layout/PageContainer";
import { siteSpecific } from "../../services";

const mockFetchProgrammes = (): Promise<IsaacProgrammeDTO[]> =>
    new Promise((resolve) =>
        resolve([
            {
                id: "01_stem_smart",
                title: "STEM SMART",
                children: [
                    {
                        encoding: "markdown",
                        value: "A free, **16-month** STEM tutoring and mentoring programme which supports students from state schools who may have experienced educational hardship or are in a group statistically less likely to go on to higher education.",
                    },
                    {
                        encoding: "markdown",
                        value: "The application deadline for the 2026-27 programme closes on **31st October 2025!**",
                    }
                ] as ContentDTO[],
                url: "/pages/stem_smart",
                image: {
                    src: "/assets/phy/programmes/stem_smart.jpg",
                },
                date: "January (year 12) – April (year 13)",
                applicableTo: "Sixth form",
                location: "Online, with an in-person residential",
            },
            {
                id: "02_spc",
                title: "Senior Physics Challenge",
                value: "A 4-day residential in July for UK students in year 12 or equivalent. Students are invited based on performance on the Isaac Science platform.",
                url: "/pages/spc",
                image: {
                    src: "/assets/phy/programmes/spc.jpg",
                },
                date: "July, annually",
                applicableTo: "Year 12",
                location: "University of Cambridge",
            },
            {
                id: "03_pms",
                title: "Physics Mentoring Scheme",
                value: "Weekly assignments in physics and maths to develop problem solving skills, supported by an online weekly tutorial led by the Isaac team. There is a year 11, a year 12 and year 13 scheme.",
                url: "/pages/isaac_mentor",
                image: {
                    src: "/assets/phy/programmes/pms.jpg",
                },
                date: "September – July, annually",
                applicableTo: "Years 11-13",
                location: "Online",
            },
            {
                id: "04_biology_challenges",
                title: "Biology Monthly Challenges",
                value: "A series of monthly online challenges to develop problem solving skills in biology. Certificates are awarded termly.",
                url: "/pages/biology_extension_questions",
                image: {
                    src: "/assets/phy/programmes/biology_challenges.jpg",
                },
                applicableTo: "A Level",
                location: "Online",
            }
        ])
    );


export const Programmes = () => {
    const [programmes, setProgrammes] = useState<IsaacProgrammeDTO[]>([]);

    useEffect(() => {
        void mockFetchProgrammes().then((data) => {
            setProgrammes(data);
        });
    }, []);

    useEffect(() => {
        // scroll to the selected programme, if it exists
        // this needs to be in its own useEffect to ensure programmes have been rendered first
        if (window.location.hash) {
            const programmeId = window.location.hash.substring(1);
            document.getElementById(programmeId)?.scrollIntoView({behavior: "smooth"});
        }
    }, [programmes]);

    return <PageContainer
        pageTitle={
            <TitleAndBreadcrumb currentPageTitle={"Programmes"} icon={{type: "icon", icon: "icon-events"}} />
        }
        sidebar={siteSpecific(
            <ProgrammesSidebar programmes={programmes} />,
            undefined
        )}
    >
        <ShowLoading until={programmes} thenRender={(programmes) => {
            return <ul className="list-unstyled mt-4">
                {programmes.map((programme) => (
                    <ProgrammeCard id={programme.id?.slice(programme.id?.indexOf("_") + 1)} tag={"li"} key={programme.id} className="mb-4" programme={programme} />
                ))}
            </ul>;
        }} />
    </PageContainer>;
};
