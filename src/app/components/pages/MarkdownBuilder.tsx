import React, {useState} from 'react';
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {Markup} from "../elements/markup";
import { Container, Card, CardBody, InputGroup, Label, Input } from 'reactstrap';
import { useTranslation } from "react-i18next";


export const MarkdownBuilder = () => {
    const { t } = useTranslation();
    const [markdownToTest, setMarkdownToTest] = useState("");

    return <Container>
        <TitleAndBreadcrumb currentPageTitle={t("common:markdownBuilder.title")} icon={{type: "icon", icon: "icon-concept"}} />
        <Card className="mt-4 mb-7">
            <CardBody>
                <InputGroup>
                    <Label className="w-100">
                        <h2 className="h4">{t("common:markdownBuilder.rawInputLabel")}</h2>
                        <Input type="textarea" rows={10} value={markdownToTest} onChange={e => setMarkdownToTest(e.target.value)}/>
                    </Label>
                </InputGroup>
                <div className="my-2 text-center">
                    <a href="https://www.markdownguide.org/basic-syntax/" target="_blank" rel="noopener noreferrer">
                        {t("common:markdownBuilder.guideLinkText")}
                    </a>
                </div>
                <InputGroup>
                    <Label className="w-100">
                        <h2 className="h4">{t("common:markdownBuilder.renderedLabel")}</h2>
                        <Card>
                            <CardBody>
                                <Markup trusted-markup-encoding={"markdown"} >
                                    {markdownToTest}
                                </Markup>
                            </CardBody>
                        </Card>
                    </Label>
                </InputGroup>
            </CardBody>
        </Card>
    </Container>;
};
