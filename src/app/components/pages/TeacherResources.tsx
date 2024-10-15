import React from "react";
import { ColumnSlice } from "../elements/layout/ColumnSlice";
import { Button, Container } from "reactstrap";
import { IconCard } from "../elements/cards/IconCard";
import { useGetNewsPodListQuery } from "../../state";
import { TextBlock } from "../elements/layout/TextBlock";

export const TeacherResources = () => {
    const {data: teacherPods} = useGetNewsPodListQuery({subject: "news"});
    const featuredPod = teacherPods?.[0];

    return <>
        <section id="resources-and-updates" className="position-relative">
            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-dark-pink" fluid>
                <ColumnSlice className="">
                    <TextBlock className="text-white">
                        <h1 className="font-size-1-75 font-size-md-2-5">
                            <span className="text-pink">/</span><br/>
                            Resources for teachers
                        </h1>
                        <p>Classwork, homework, and exam prep to help you teach computer science. All available for free.</p>
                    </TextBlock>
                    <img className="p-4" src="/assets/cs/decor/teacher-1.png" alt=""/>
                </ColumnSlice>
            </Container>

            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 position-relative" fluid>
                <div className="w-100 h-100 position-absolute swirls-img"/>
                <ColumnSlice>
                    <TextBlock>
                        <h2>Our latest updates</h2>
                        <p>We&apos;re constantly working to improve your experience with Ada Computer Science. Read the latest news and updates from the team.</p>
                    </TextBlock>
                    {featuredPod && featuredPod.title && featuredPod.value ? <IconCard card={{
                        title: featuredPod.title,
                        icon: {src: "/assets/cs/icons/book.svg"},
                        bodyText: featuredPod.value,
                        tag: "New",
                        clickUrl: featuredPod.url,
                        buttonText: "Read more",
                        buttonStyle: "link"
                    }}/> : <div/>}
                </ColumnSlice>
            </Container>

            <Container className="py-5 px-md-4 px-xxl-5 mw-1600 bg-white" fluid>
                <ColumnSlice>
                    <img className="p-4" src="/assets/cs/decor/questions.png" alt=""/>
                    <TextBlock>
                        <h2>A full curriculum of topics</h2>
                        <p>We have over 65 learning topics that cover everything you need to teach computer science. From computing systems and networks, to AI, machine learning, and much more.</p>
                        <p>They&apos;re created by expert educators and are regularly updated. You can even filter content for different age groups and exams.</p>
                        <Button to={"/topics"}>Explore all topics</Button>
                    </TextBlock>
                </ColumnSlice>
            </Container>
        </section>
        <section id="tools">
            
        </section>
        <section id="cpd">
            
        </section>
        <section id="more-resources">
            
        </section>
        <section id="help-and-support">
            
        </section>
    </>;
};
