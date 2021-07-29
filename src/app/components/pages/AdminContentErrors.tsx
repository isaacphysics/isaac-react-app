import React, {useEffect, useState} from "react";
import {AppState} from "../../state/reducers";
import {getAdminContentErrors} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {useDispatch, useSelector} from "react-redux";
import {Col, Container, Input, Label, Row, Table} from "reactstrap";
import {EDITOR_URL, sortIcon} from "../../services/constants";
import {BoardOrder, ContentErrorItem} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const contentErrorDetailsListItem = (errorDetailsListItem: string, index: number) => {
    return <li key={index}>{errorDetailsListItem}</li>
};

const ContentErrorRow = (errorRecord: ContentErrorItem, index: number) => {
    return <tr key={index}>
        <td className="text-break">
            {/* eslint-disable-next-line react/jsx-no-target-blank */}
            <a href={EDITOR_URL + errorRecord.partialContent.canonicalSourceFile} target="_blank" rel="noopener">
                {errorRecord.partialContent.title || errorRecord.partialContent.id}
            </a>
        </td>
        <td>{(!!errorRecord.partialContent.published).toString()}</td>{/*The published key may be missing, also meaning false*/}
        <td>{(!errorRecord.successfulIngest).toString()}</td>
        <td>
            <ul>
                {errorRecord.listOfErrors.map(contentErrorDetailsListItem)}
            </ul>
        </td>
    </tr>
};

export const AdminContentErrors = () => {
    const dispatch = useDispatch();
    useEffect(() => {dispatch(getAdminContentErrors());}, [dispatch]);
    const errors = useSelector((state: AppState) => state?.adminContentErrors || null);

    const [errorFilter, setErrorFilter] = useState<string>("");
    const errorReducer = (show: boolean, errorStr: string) => show || errorStr.toLowerCase().includes(errorFilter.toLowerCase())

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb currentPageTitle="Content errors" />
            </Col>
        </Row>
        <ShowLoading until={errors}>
            {errors && <div>
                <Row>
                    <Col>
                        <p>
                            <strong>Critical errors:</strong> {errors.failedFiles},&nbsp;
                            <strong>Files with errors:</strong> {errors.brokenFiles},&nbsp;
                            <strong>Total errors:</strong> {errors.totalErrors}
                        </p>
                        <p>
                            <strong>Content Version:</strong> {errors.currentLiveVersion}
                        </p>
                    </Col>
                </Row>
                <Row>
                    <Col lg={4} className="mb-2">
                        <Label className="w-100">
                            Filter errors <Input type="text" onChange={(e) => setErrorFilter(e.target.value)} placeholder="Filter errors by error message"/>
                        </Label>
                    </Col>
                </Row>
                <Row>
                    <Col>
                        <Table responsive bordered>
                            <tbody>
                                <tr>
                                    <th>Title / Filename</th>
                                    <th title="Is this file published?">Published</th>
                                    <th title="Files with critical errors will not be available on Isaac!">Critical Error</th>
                                    <th>List of Error Messages</th>
                                </tr>
                                {errors.errorsList.filter((error) => error.listOfErrors.reduce(errorReducer, false))
                                    .map(ContentErrorRow)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>}
        </ShowLoading>
    </Container>;
};
