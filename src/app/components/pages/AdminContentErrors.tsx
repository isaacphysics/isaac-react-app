import React, {useState} from "react";
import {useGetContentErrorsQuery} from "../../state";
import {Col, Container, Input, Label, Row, Table} from "reactstrap";
import {EDITOR_URL, matchesAllWordsInAnyOrder, selectOnChange, useQueryParams} from "../../services";
import {ContentErrorItem, ContentErrorsResponse} from "../../../IsaacAppTypes";
import {TitleAndBreadcrumb} from "../elements/TitleAndBreadcrumb";
import {StyledSelect} from "../elements/inputs/StyledSelect";
import {ShowLoadingQuery} from "../handlers/ShowLoadingQuery";
import { HorizontalScroller } from "../elements/inputs/HorizontalScroller";
import { useTranslation } from "react-i18next";

const sortBySourcePath = (error1: ContentErrorItem, error2: ContentErrorItem) => {
    const path1 = error1.partialContent?.canonicalSourceFile;
    const path2 = error2.partialContent?.canonicalSourceFile;
    if (path1 === path2) {
        return 0;
    } else if (!path1) {
        return -1;
    } else if (!path2) {
        return 1;
    } else {
        return path1 < path2 ? -1: 1;
    }
};

const contentErrorDetailsListItem = (errorDetailsListItem: string, index: number) => {
    return <li key={index}>{errorDetailsListItem}</li>;
};

const ContentErrorRow = (errorRecord: ContentErrorItem, index: number) => {
    const { t } = useTranslation();
    return <tr key={index}>
        <td className="text-break">
            <a href={EDITOR_URL + errorRecord.partialContent.canonicalSourceFile} title={t("common:admin.contentErrors.row.tooltipContentId", { contentId: errorRecord.partialContent.id })} target="_blank" rel="noopener">
                {errorRecord.partialContent.canonicalSourceFile || errorRecord.partialContent.id}
            </a>
        </td>
        <td>{(!!errorRecord.partialContent.published).toString()}</td>{/*The published key may be missing, also meaning false*/}
        <td>{(!errorRecord.successfulIngest).toString()}</td>
        <td>
            <ul>
                {errorRecord.listOfErrors.map(contentErrorDetailsListItem)}
            </ul>
        </td>
    </tr>;
};

enum PUBLISHED_FILTER {
    PUBLISHED = "Published",
    UNPUBLISHED = "Unpublished"
}

enum CRITICAL_FILTER {
    CRITICAL = "Critical",
    NON_CRITICAL = "Other error"
}

export const AdminContentErrors = () => {
    const { t } = useTranslation();
    const errorsQuery = useGetContentErrorsQuery();

    const params = useQueryParams(true);

    const [pathFilter, setPathFilter] = useState<string>(params.path || "");
    const [errorFilter, setErrorFilter] = useState<string>("");
    const errorReducer = (show: boolean, errorStr: string) => show || matchesAllWordsInAnyOrder(errorStr, errorFilter);

    const [publishedFilter, setPublishedFilter] = useState<PUBLISHED_FILTER[]>([PUBLISHED_FILTER.PUBLISHED, PUBLISHED_FILTER.UNPUBLISHED]);
    const [criticalFilter, setCriticalFilter] = useState<CRITICAL_FILTER[]>([CRITICAL_FILTER.CRITICAL, CRITICAL_FILTER.NON_CRITICAL]);

    const filteredErrors = (errors: ContentErrorsResponse) => {
        return errors.errorsList
            .filter((error) => error.listOfErrors.reduce(errorReducer, false))
            .filter(
                (error) =>
                    (error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.PUBLISHED)) ||
                    (!error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.UNPUBLISHED)),
            )
            .filter(
                (error) =>
                    (error.successfulIngest && criticalFilter.includes(CRITICAL_FILTER.NON_CRITICAL)) ||
                    (!error.successfulIngest && criticalFilter.includes(CRITICAL_FILTER.CRITICAL)),
            );
    };

    return <Container>
        <Row>
            <Col>
                <TitleAndBreadcrumb
                    currentPageTitle={t("common:admin.contentErrors.title")}
                    icon={{type: "icon", icon: "icon-tests"}}
                />
            </Col>
        </Row>
        <ShowLoadingQuery
            defaultErrorTitle={t("common:admin.contentErrors.loadingError")}
            query={errorsQuery}
            thenRender={errors => {
                return <div>
                    <Row>
                        <Col>
                            <p className="mt-2">
                                <strong>{t("common:admin.contentErrors.stats.contentVersionLabel")}</strong> {errors.currentLiveVersion}
                            </p>
                            <p>
                                <strong>{t("common:admin.contentErrors.stats.criticalErrorsLabel")}</strong> {errors.failedFiles},&nbsp;
                                <strong>{t("common:admin.contentErrors.stats.filesWithErrorsLabel")}</strong> {errors.brokenFiles},&nbsp;
                                <strong>{t("common:admin.contentErrors.stats.totalErrorsLabel")}</strong> {errors.totalErrors}
                            </p>
                        </Col>
                    </Row>
                    <Row>
                        <Col lg={4} className="mb-2">
                            <Label htmlFor="file-path-filter" className="w-100">
                                {t("common:admin.contentErrors.filters.filePathLabel")}
                            </Label>
                            <Input id="file-path-filter" type="text" defaultValue={pathFilter} onChange={(e) => setPathFilter(e.target.value)} placeholder={t("common:admin.contentErrors.filters.filePathPlaceholder")}/>
                        </Col>
                        <Col lg={8} className="mb-2">
                            <Label htmlFor="error-message-filter" className="w-100">
                                {t("common:admin.contentErrors.filters.errorMessageLabel")}
                            </Label>
                            <Input id="error-message-filter" type="text" onChange={(e) => setErrorFilter(e.target.value)} placeholder={t("common:admin.contentErrors.filters.errorMessagePlaceholder")}/>
                        </Col>
                        <Col lg={6} className="mb-2">
                            <Label htmlFor="critical-filter-select">{t("common:admin.contentErrors.filters.severityLabel")}</Label>
                            <StyledSelect
                                inputId="critical-filter-select"
                                isMulti
                                placeholder={t("common:admin.contentErrors.filters.nonePlaceholder")}
                                value={criticalFilter.map(x => ({value: x, label: x}))}
                                options={[
                                    {value: CRITICAL_FILTER.CRITICAL, label: CRITICAL_FILTER.CRITICAL},
                                    {value: CRITICAL_FILTER.NON_CRITICAL, label: CRITICAL_FILTER.NON_CRITICAL}
                                ]}
                                onChange={selectOnChange(setCriticalFilter, true)}
                            />
                        </Col>
                        <Col lg={6} className="mb-2">
                            <Label htmlFor="published-filter-select">{t("common:admin.contentErrors.filters.publishedStatusLabel")}</Label>
                            <StyledSelect
                                inputId="published-filter-select"
                                isMulti
                                placeholder={t("common:admin.contentErrors.filters.nonePlaceholder")}
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
                            <HorizontalScroller enabled={filteredErrors(errors).length > 10} className="mb-3">
                                <Table bordered>
                                    <colgroup>
                                        <col style={{minWidth: "20ex"}} />
                                    </colgroup>
                                    <tbody>
                                        <tr>
                                            <th>{t("common:admin.contentErrors.table.fileHeader")}</th>
                                            <th title={t("common:admin.contentErrors.table.publishedTooltip")}>{t("common:admin.contentErrors.table.publishedHeader")}</th>
                                            <th title="Files with critical errors will not be available on Isaac!">{t("common:admin.contentErrors.table.criticalErrorHeader")}</th>
                                            <th>{t("common:admin.contentErrors.table.errorMessagesHeader")}</th>
                                        </tr>
                                        {errors.errorsList
                                            .filter((error) => ((error.partialContent.canonicalSourceFile || error.partialContent.id) ?? "").includes(pathFilter))
                                            .filter((error) => error.listOfErrors.reduce(errorReducer, false))
                                            .filter(
                                                (error) =>
                                                    (error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.PUBLISHED)) ||
                                                    (!error.partialContent.published && publishedFilter.includes(PUBLISHED_FILTER.UNPUBLISHED)),
                                            )
                                            .filter(
                                                (error) =>
                                                    (error.successfulIngest && criticalFilter.includes(CRITICAL_FILTER.NON_CRITICAL)) ||
                                                    (!error.successfulIngest && criticalFilter.includes(CRITICAL_FILTER.CRITICAL)),
                                            )
                                            .sort(sortBySourcePath)
                                            .map(ContentErrorRow)
                                        }
                                    </tbody>
                                </Table>
                            </HorizontalScroller>
                        </Col>
                    </Row>
                </div>;
            }}
        />
    </Container>;
};
