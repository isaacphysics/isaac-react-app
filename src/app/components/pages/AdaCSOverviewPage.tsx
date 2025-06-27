import React from "react";
import {withRouter} from "react-router";
import {Container} from "reactstrap";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {PageMetadata} from "../elements/PageMetadata";
import {AffixButton} from "../elements/AffixButton";


export const AdaCSOverviewPage = withRouter(() => {


    return <Container data-bs-theme={undefined}>
        <TitleAndBreadcrumb
            currentPageTitle={"Computer Science"}
            icon={{
                type: "img",
                subject: undefined,
                icon: "/assets/common/logos/ada_logo_stamp_aqua.svg",
                width: "70px",
                height: "81px",
            }}
        />
        <div className="mt-7">
            <PageMetadata title="Ada Computer Science" />
            <p>
                Ada Computer Science is a free learning platform for computing teachers and students.
                Developed by the Raspberry Pi Foundation in partnership with the Isaac Physics team at the University of Cambridge,
                it is tailored to support learners aged 14-19. Ada Computer Science offers structured resources to support both
                teachers and students. These include concept pages, interactive questions, and teacher tools, amongst a
                wide range of other resources designed to enhance computer science education.
            </p>
            <h4>
                Here&apos;s how Ada CS can support you:
            </h4>
            <div className="d-flex row-cols-1 row-cols-md-2 row">
                <div className="d-flex flex-column">
                    <h5>For students</h5>
                    <div>
                        Explore interactive resources designed to help you study computer science:
                        <ul>
                            <li>Learn through a full curriculum of topics explained in concept pages.</li>
                            <li>Practise and test your understanding with interactive questions.</li>
                            <li>Track your progress and identify areas to improve.</li>
                            <li>Join termly challenges to test your knowledge and skills.</li>
                        </ul>
                    </div>
                </div>
                <div className="d-flex flex-column">
                    <h5>For teachers</h5>
                    <div>
                        Access structured resources to help you deliver high-quality computer science education:
                        <ul>
                            <li>Teach with over 50 curriculum-aligned topics covering the full breadth of computer science.</li>
                            <li>Set self-marking assignments to save time and support independent learning.</li>
                            <li>Track student progress with a personal markbook to identify areas for improvement.</li>
                        </ul>
                    </div>
                </div>
            </div>

            <p className="text-center my-4">
                <AffixButton
                    color="keyline"
                    target={"_blank"}
                    href={"https://adacomputerscience.org"}
                    affix={{affix: "icon-arrow-right", position: "suffix", type: "icon"}}
                >
                    Go to Ada CS
                </AffixButton>
            </p>

        </div>
    </Container>;
});
