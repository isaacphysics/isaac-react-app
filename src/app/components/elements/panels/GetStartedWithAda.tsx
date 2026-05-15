import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { ShowLoading } from "../../handlers/ShowLoading";
import { CompletableTask } from "../CompletableTask";
import { ProgressBar } from "../views/ProgressBar";
import { useAdaGetStartedTasks } from "../../../services/adaOnboardingTasks";
import { useLinkableSetting } from "../../../services/linkableSetting";

export const GetStartedWithAda = () => {
    const [getStartedOpen, setGetStartedOpen] = useState(false);
    const {setLinkedSetting} = useLinkableSetting();
    const getStartedTasks = useAdaGetStartedTasks();
    const percentComplete = getStartedTasks ? Math.round(100 * Object.values(getStartedTasks).filter(Boolean).length / Object.keys(getStartedTasks).length) : 0;

    useEffect(() => {
        if (getStartedTasks && !Object.values(getStartedTasks).every(Boolean)) {
            setGetStartedOpen(true);
        }
    }, [getStartedTasks]);

    return <Accordion open={getStartedOpen ? ["1"] : []} toggle={() => setGetStartedOpen(o => !o)} className="position-relative">
        <AccordionItem>
            <AccordionHeader targetId="1">
                <span className="fw-bold">Get started with Ada CS</span>
                {getStartedTasks && Object.values(getStartedTasks).every(Boolean) && <i className="icon icon-tick icon-sm mx-3" />}
            </AccordionHeader>
            <AccordionBody accordionId="1">
                <ShowLoading
                    until={getStartedTasks}
                    thenRender={(tasks) => <>
                        Follow these steps to get started with your teacher account:

                        <div className="d-flex align-items-center gap-4 mt-2">
                            <span className="fw-bold">{percentComplete}%</span>
                            <ProgressBar thin rounded percentage={percentComplete} type="ada-primary" />
                        </div>

                        <ul className="list-unstyled d-flex flex-column mt-3 gap-3">
                            <CompletableTask tag={"li"} complete={tasks.createAccount}>
                                <strong>Create your account</strong>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.personaliseContent} disabled={!tasks.createAccount} action={{
                                title: "Personalise your content",
                                to: "/account#customise",
                                onClick: () => setLinkedSetting("account-context")
                            }}>
                                <div className="d-flex flex-column">
                                    <h5 className="m-0">Personalise your content</h5>
                                    <span>Pick a teaching level and exam board, or choose to see all content.</span>
                                </div>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.createGroup} disabled={!tasks.createAccount} action={{
                                title: "Manage groups",
                                to: "/groups",
                            }}>
                                <strong>Create a student group</strong>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.assignQuiz} disabled={!tasks.createGroup}>
                                <strong>Assign a quiz to students</strong>
                            </CompletableTask>

                            {/* <CompletableTask tag={"li"} complete={tasks.viewMarkbook} disabled={!tasks.assignQuiz}>
                                <strong>View your markbook</strong>
                            </CompletableTask> */}
                        </ul>  
                    </>}
                />
            </AccordionBody>
        </AccordionItem>
    </Accordion>;
};
