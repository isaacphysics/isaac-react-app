import React, {useEffect, useState} from "react";
import {AppState, getAdminContentErrors, useAppDispatch, useAppSelector} from "../../state";
import {ShowLoading} from "../handlers/ShowLoading";
import {Col, Container, Input, Label, Row, Table} from "reactstrap";
import {EDITOR_URL, selectOnChange} from "../../services";
import {ContentErrorItem} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {StyledSelect} from "../elements/inputs/StyledSelect";

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

enum PUBLISHED_FILTER {
    PUBLISHED = "Published",
    UNPUBLISHED = "Unpublished"
}

export const AdminContentErrors = () => {
    const dispatch = useAppDispatch();
    useEffect(() => {dispatch(getAdminContentErrors());}, [dispatch]);
    const errors = useAppSelector((state: AppState) => state?.adminContentErrors || null);

    const [errorFilter, setErrorFilter] = useState<string>("");
    const errorReducer = (show: boolean, errorStr: string) => show || errorStr.toLowerCase().includes(errorFilter.toLowerCase());

    const [publishedFilter, setPublishedFilter] = useState<PUBLISHED_FILTER[]>([PUBLISHED_FILTER.PUBLISHED, PUBLISHED_FILTER.UNPUBLISHED]);

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
                        <Label htmlFor="error-message-filter" className="w-100">
                            Filter by error message
                        </Label>
                        <Input id="error-message-filter" type="text" onChange={(e) => setErrorFilter(e.target.value)} placeholder="Filter errors by error message"/>
                    </Col>
                    <Col lg={6} className="mb-2">
                        <Label htmlFor="published-filter-select">Filter by published status</Label>
                        <StyledSelect
                            inputId="published-filter-select"
                            isMulti
                            placeholder="None"
                            value={publishedFilter.map(x => ({value: x, label: x}))}
                            options={[
                                {value: PUBLISHED_FILTER.PUBLISHED, label: PUBLISHED_FILTER.PUBLISHED},
                                {value: PUBLISHED_FILTER.UNPUBLISHED, label: PUBLISHED_FILTER.UNPUBLISHED}
                            ]}
                            onChange={selectOnChange(setPublishedFilter, true)}
                            />
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
                                {errors.errorsList
                                    .filter((error) => error.listOfErrors.reduce(errorReducer, false))
                                    .filter((error) =>
                                        (error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.PUBLISHED))
                                        || (!error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.UNPUBLISHED)) )
                                    .map(ContentErrorRow)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>}
        </ShowLoading>
    </Container>;
};
