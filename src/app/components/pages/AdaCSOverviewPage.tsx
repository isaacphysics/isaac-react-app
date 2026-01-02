import React from "react";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageMetadata} from "../elements/PageMetadata";
import {AffixButton} from "../elements/AffixButton";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { TextBlock } from "../elements/layout/TextBlock";
import { ImageBlock } from "../elements/layout/ImageBlock";


export const AdaCSOverviewPage = () => {
    return <Container data-bs-theme={undefined} className="ada-overview-page">
        <TitleAndBreadcrumb
            currentPageTitle={"Computer Science"}
            icon={{
                type: "img",
                subject: undefined,
                icon: "/assets/common/logos/ada_logo_stamp_aqua.svg",
                width: "75px",
                height: "75px",
            }}
        />
        <div>
            <PageMetadata title="Ada Computer Science" />
            <p>
                Ada Computer Science is a free learning platform for computing teachers and students.
                Developed by the Raspberry Pi Foundation in partnership with the Isaac Science team at the University of Cambridge,
                it is tailored to support learners aged 14-19. Ada Computer Science offers structured resources to support both
                teachers and students. These include concept pages, interactive questions, and teacher tools, amongst a
                wide range of other resources designed to enhance computer science education.
            </p>

            <ColumnSlice>
                <TextBlock>
                    <h2>For students</h2>
                    <div>
                        Explore interactive resources designed to help you study computer science:
                        <ul>
                            <li>Learn through a full curriculum of topics explained in concept pages.</li>
                            <li>Practise and test your understanding with interactive questions.</li>
                            <li>Track your progress and identify areas to improve.</li>
                            <li>Join termly challenges to test your knowledge and skills.</li>
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
                    <h2>For teachers</h2>
                    <div>
                        Access structured resources to help you deliver high-quality computer science education:
                        <ul>
                            <li>Teach with over 50 curriculum-aligned topics covering the full breadth of computer science.</li>
                            <li>Set self-marking assignments to save time and support independent learning.</li>
                            <li>Track student progress with a personal markbook to identify areas for improvement.</li>
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
                    Go to Ada CS
                </AffixButton>
            </div>

        </div>
    </Container>;
};
