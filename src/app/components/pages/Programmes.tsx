import React, { useEffect, useState } from "react";
import { Container } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { GenericPageSidebar, MainContent, ProgrammesSidebar, SidebarLayout } from "../elements/layout/SidebarLayout";
import { ShowLoading } from "../handlers/ShowLoading";
import { IsaacProgrammeDTO, ProgrammeCard } from "../elements/cards/ProgrammeCard";
import { ContentDTO } from "../../../IsaacApiTypes";

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
                url: "/pages/biology_challenges",
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

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={"Programmes"} icon={{type: "hex", icon: "icon-events"}} />
        <SidebarLayout>
            <ProgrammesSidebar programmes={programmes} />
            <MainContent>
                <ShowLoading until={programmes} thenRender={(programmes) => {
                    return <ul className="list-unstyled mt-4">
                        {programmes.map((programme) => (
                            <ProgrammeCard tag={"li"} key={programme.id} className="mb-4" programme={programme} />
                        ))}
                    </ul>;
                }} />
            </MainContent>
        </SidebarLayout>
    </Container>;
};
