import React, { useEffect, useState } from "react";
import { Card, Col, Container, Row } from "reactstrap";
import { TitleAndBreadcrumb } from "../elements/TitleAndBreadcrumb";
import { PageMetadata } from "../elements/PageMetadata";
import {bb, donut} from "billboard.js";
import classNames from "classnames";
import { DOCUMENT_TYPE, specificDoughnutColours, STAGE, TAG_ID, tags } from "../../services";
import { ListView } from "../elements/list-groups/ListView";
import { ContentSummaryDTO } from "../../../IsaacApiTypes";
import { Spacer } from "../elements/Spacer";

interface AnimatedCounterProps extends React.HTMLAttributes<HTMLSpanElement> {
    limit: number;
    time: number;
    increasingRate?: number; // how many times per second should the limit increase by 1
}

const AnimatedCounter = ({limit, time, increasingRate, ...rest}: AnimatedCounterProps) => {
    const [_limit, setLimit] = useState(limit);

    useEffect(() => {
        if (increasingRate) {
            const interval = window.setInterval(() => setLimit(l => l + 1), 1000 / increasingRate);
            return () => window.clearInterval(interval);
        }
    }, [increasingRate]);

    return <span {...rest} className={classNames("d-inline-block animated-counter", rest.className)} style={{ "--limit": _limit, "--time": time } as React.CSSProperties} />;
};

const PieChart = (props: React.HTMLAttributes<HTMLDivElement>) => {
    // Sample data for the pie chart
    const data : Partial<Record<TAG_ID, { label: string, value: number }>> = {
        [TAG_ID.physics]: { label: "Physics", value: 965_172_912 },
        [TAG_ID.chemistry]: { label: "Chemistry", value: 56_820_007 },
        [TAG_ID.biology]: { label: "Biology", value: 8_375_424 },
        [TAG_ID.maths]: { label: "Maths", value: 61_470_881 },
    };

    const categoryColumns = tags.getSubjectTags(tags.allTagIds).map((tag) => [tag.title, data[tag.id]?.value || 0]);

    useEffect(() => {
        bb.generate({
            data: {
                columns: categoryColumns,
                colors: Object.fromEntries(Object.entries(specificDoughnutColours).filter(([k]) => Object.values(data).some(d => d.label === k))),
                type: donut(),
            },
            donut: {
                title: "Attempts\nby subject",
                label: {format: (value) => `${value}`}
            },
            bindto: `#questionsCategoryChart`,
            size: { width: 320, height: 320 }
        });
    }, [categoryColumns]);

    return <div id={`questionsCategoryChart`} {...props} />;
};

interface StatCardProps {
    title: string;
    icon: string;
    counterProps: AnimatedCounterProps;
}

const StatCard = ({ title, icon, counterProps }: StatCardProps) => {
    return <Card className="border-0 px-2 py-4 flex-row rounded-4">
        <i className={`icon ${icon} icon-xl`} />
        <div className="d-flex flex-column px-4">
            <h2 className="text-brand">
                <AnimatedCounter {...counterProps} />
            </h2>
            {title}
        </div>
    </Card>;
};

export const IsaacStats = () => {
    return <Container>
        <TitleAndBreadcrumb
            currentPageTitle="Isaac Stats"
            icon={{"type": "hex", "icon": "icon-progress"}}
        />
        <PageMetadata title={<>Happy <span className="text-brand">11th</span> birthday to Isaac Science!</>} />
        <Row className="d-flex align-items-center g-5 row-cols-1 row-cols-md-2 row-cols-xl-3 mb-4">
            <Col>
                <StatCard title="Accounts" icon="icon-account" counterProps={{ limit: 750_777, time: 3, increasingRate: 0.002 }} />
            </Col>
            <Col>
                <StatCard title="Question attempts" icon="icon-question" counterProps={{ limit: 186_125_271, time: 4, increasingRate: 0.53654 }} />
            </Col>
            <Col className="mx-auto">
                <StatCard title="Concepts viewed" icon="icon-concept" counterProps={{ limit: 6_456_752, time: 5, increasingRate: 0.0186 }} />
            </Col>
        </Row>

        {/* <section className="d-flex py-9 container-override bg-white position-relative">
            <div>
                <p>
                    Isaac saw more question attempts this year than any other year. With <b>452,397</b> assignments and <b>9,311</b> tests set, you&apos;ve been keeping busy!
                </p>
                <p>
                    
                </p>
            </div>
            <Spacer />
            <PieChart className="justify-self-end" />
        </section> */}

        <section className="container-override bg-white py-9">
            <Row className="my-9">
                <Col xl={6} className="d-flex flex-column">
                    <h3>Most popular question</h3>
                    <ListView type={"item"} items={[{
                        "id": "gcse_ch2_13_q1",
                        "title": "Resultant Force and Acceleration 1",
                        "subtitle": "Essential GCSE Physics 13.1",
                        "type": "isaacQuestionPage",
                        "tags": [
                            "dynamics",
                            "phys_book_gcse",
                            "book",
                            "physics",
                            "mechanics"
                        ],
                        "url": "/api/pages/questions/gcse_ch2_13_q1",
                        "state": "NOT_ATTEMPTED",
                        "audience": [
                            {
                                "stage": [
                                    "gcse"
                                ],
                                "difficulty": [
                                    "practice_1"
                                ]
                            },
                            {
                                "stage": [
                                    "a_level"
                                ],
                                "difficulty": [
                                    "practice_1"
                                ]
                            }
                        ]
                    } as ContentSummaryDTO]} />
                    <span className="me-2 text-end">
                        (<AnimatedCounter limit={1_518_456} time={3} increasingRate={0.1} />
                        {" "}attempts across all parts)
                    </span>
                </Col>
                <Col xl={6} className="d-flex flex-column" id="concept-column">
                    <h3>Most popular concept</h3>
                    <ListView type={"item"} className="flex-grow-1" items={[{
                        type: DOCUMENT_TYPE.CONCEPT,
                        title: "Kirchhoff's Laws",
                        subtitle: "Current and voltage circuit laws",
                        summary: "Two important circuit laws pertaining to how voltage and current vary throughout a circuit.",
                        tags: ["physics"],
                        id: "kirchhoffs-laws",
                        audience: [{stage: [STAGE.GCSE], difficulty: ["challenge_2"]}],
                    } as ContentSummaryDTO]} />
                    <span className="me-2 text-end">
                        (<AnimatedCounter limit={856_776} time={3} increasingRate={0.04} />
                        {" "}views)
                    </span>
                </Col>
            </Row>
        </section>

        <section className="d-flex justify-content-around py-9 container-override">
            <div className="d-flex gap-4">
                <i className="icon icon-school icon-xl" />
                <div>
                    <h2>
                        <AnimatedCounter limit={3674} time={5} />
                    </h2>
                    schools using Isaac
                </div>
            </div>
            <div className="d-flex gap-4">
                <div className="text-end">
                    <h2>
                        <AnimatedCounter limit={16_224} time={5} />
                    </h2>
                    teachers using Isaac
                </div>
                <i className="icon icon-group icon-xl" />
            </div>
        </section>

        <section className="d-flex flex-column py-9 container-override align-items-center bg-white">
            <div className="d-flex gap-3 align-items-center">
                <h2 className="stats-hex-container text-white m-0">
                    <AnimatedCounter limit={5_298} time={10} />
                </h2>
                <h5>platform event attendees</h5>
            </div>
            <div className="d-flex gap-3 align-items-center">
                <h5>longest student streak</h5>
                <div className="stats-hex-container text-white m-0 d-flex flex-column align-items-center">
                    <h2 className="mb-0"><AnimatedCounter limit={201} time={10} /></h2>
                    <span className="fs-5 mt-n2">weeks</span>
                </div>
            </div>
        </section>

        <section className="py-9 container-override position-relative">
            <h3>Most <span className="text-danger">difficult</span> question</h3>
            <ListView type={"item"} items={[{
                "id": "cooling_excalibur",
                "title": "Cooling Excalibur",
                "type": "isaacQuestionPage",
                "level": "6",
                "tags": [
                    "chemistry",
                    "entropy",
                    "problem_solving",
                    "physical"
                ],
                "url": "/isaac-api/api/pages/questions/cooling_excalibur",
                "audience": [
                    {
                        "stage": [
                            "university"
                        ],
                        "difficulty": [
                            "challenge_3"
                        ]
                    }
                ]
            } as ContentSummaryDTO]} />
            <span className="me-2 float-end">
                (<AnimatedCounter limit={115} time={3} />
                {" "}correct answers)
            </span>
        </section>


        <h4 className="text-center my-9">Thank you for being a part of Isaac!</h4>
        <div className="container-override" id="stats-subjects-background" />

        
    </Container>;
};
