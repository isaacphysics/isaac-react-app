import React, { useEffect, useState } from "react";
import { Accordion, AccordionItem, AccordionHeader, AccordionBody } from "reactstrap";
import { ShowLoading } from "../../handlers/ShowLoading";
import { CompletableTask } from "../CompletableTask";
import { ProgressBar } from "../views/ProgressBar";
import { useAdaGetStartedTasks } from "../../../services/adaOnboardingTasks";
import { useLinkableSetting } from "../../../services/linkableSetting";
import { Link } from "react-router-dom";
import { Trans, useTranslation } from "react-i18next";

export const GetStartedWithAda = () => {
    const { t } = useTranslation();
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
                <span className="fw-bold">{t("common:getStarted.title")}</span>
                {getStartedTasks && Object.values(getStartedTasks).every(Boolean) && <i className="icon icon-tick icon-sm mx-3" />}
            </AccordionHeader>
            <AccordionBody accordionId="1">
                <ShowLoading
                    until={getStartedTasks}
                    thenRender={(tasks) => <>
                        {t("common:getStarted.intro")}

                        <div className="d-flex align-items-center gap-4 mt-2">
                            <span className="fw-bold">{percentComplete}%</span>
                            <ProgressBar thin rounded percentage={percentComplete} type="ada-primary" />
                        </div>

                        <ul className="list-unstyled d-flex flex-column mt-3 gap-3">
                            <CompletableTask tag={"li"} complete={tasks.createAccount} inputId="create-account">
                                <label htmlFor="create-account" className="mb-0"><strong>{t("common:getStarted.tasks.createAccount")}</strong></label>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.personaliseContent} inputId="personalise-content" disabled={!tasks.createAccount} action={{
                                title: t("common:getStarted.tasks.personaliseContentTitle"),
                                to: "/account#customise",
                                onClick: () => setLinkedSetting("account-context")
                            }}>
                                <div className="d-flex flex-column">
                                    <label className="mb-0" htmlFor="personalise-content"><strong>{t("common:getStarted.tasks.personaliseContentTitle")}</strong></label>
                                    <span>{t("common:getStarted.tasks.personaliseContentHint")}</span>
                                </div>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.createGroup} inputId="create-group" disabled={!tasks.createAccount} action={{
                                title: t("common:getStarted.tasks.manageGroupsTitle"),
                                to: "/groups",
                            }}>
                                <label htmlFor="create-group" className="mb-0"><strong>{t("common:getStarted.tasks.createGroup")}</strong></label>
                            </CompletableTask>

                            <CompletableTask tag={"li"} complete={tasks.assignQuiz} inputId="assign-quiz" disabled={!tasks.createGroup}>
                                <label htmlFor="assign-quiz" className="mb-0"><strong>{t("common:getStarted.tasks.assignQuiz")}</strong></label>
                            </CompletableTask>

                            {/* <CompletableTask tag={"li"} complete={tasks.viewMarkbook} disabled={!tasks.assignQuiz}>
                                <strong>View your markbook</strong>
                            </CompletableTask> */}
                        </ul>

                        <div className="text-md-end">
                            <Trans i18nKey="common:getStarted.videoCta" components={{ strong: <strong />, youtubeLink: <Link to="https://www.youtube.com/playlist?list=PLxyaWvsfmq49mjnh8LQeztQSZAcrvB6bk" target="_blank" /> }} />
                        </div>
                    </>}
                />
            </AccordionBody>
        </AccordionItem>
    </Accordion>;
};
