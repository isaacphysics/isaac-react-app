import React, {useEffect} from "react";
import {AdminContentErrorsState, AppState} from "../../state/reducers";
import {getAdminContentErrors} from "../../state/actions";
import {ShowLoading} from "../handlers/ShowLoading";
import {connect} from "react-redux";
import {withRouter} from "react-router-dom";
import {Col, Container, Row, Table} from "reactstrap";
import {EDITOR_URL} from "../../services/constants";
import {ContentErrorItem} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";

const stateToProps = (state: AppState) => {
    return {
        errors: state ? state.adminContentErrors : null
    };
};
const dispatchToProps = {getAdminContentErrors};

interface AdminContentErrorsPageComponentProps {
    errors: AdminContentErrorsState;
    getAdminContentErrors: () => void;
}

const contentErrorDetailsListItem = (errorDetailsListItem: string, index: number) => {
    return <li key={index}>{errorDetailsListItem}</li>
};

const contentErrorRow = (errorRecord: ContentErrorItem, index: number) => {
    return <tr key={index}>
        <td>
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

export const AdminContentErrorsPageComponent = ({errors, getAdminContentErrors}: AdminContentErrorsPageComponentProps) => {
    useEffect(
        () => {getAdminContentErrors();}, []
    );

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
                    <Col>
                        <Table>
                            <tbody>
                                <tr>
                                    <th>Title / Filename</th>
                                    <th title="Is this file published?">Published</th>
                                    <th title="Files with critical errors will not be available on Isaac!">Critical Error</th>
                                    <th>List of Error Messages</th>
                                </tr>
                                {errors.errorsList.map(contentErrorRow)}
                            </tbody>
                        </Table>
                    </Col>
                </Row>
            </div>}
        </ShowLoading>
    </Container>;
};

export const AdminContentErrors = withRouter(connect(stateToProps, dispatchToProps)(AdminContentErrorsPageComponent));
