import {FormGroup, Label, Table} from "reactstrap";
import {SubjectInterestInput} from "./subjectInterestInput";
import React from "react";
import {SubjectInterests} from "../../../../IsaacAppTypes";
import { Trans, useTranslation } from "react-i18next";

interface SubjectInterestTableInputProps<T> {
    stateObject: T;
    setStateFunction: (stateObject: T) => void;
}

// FIXME if this ever gets used again, we should add a Biology section
export const SubjectInterestTableInput = (props: SubjectInterestTableInputProps<SubjectInterests>) => {
    const { t } = useTranslation();
    const {stateObject, setStateFunction} = props;

    return <FormGroup className="form-group">
        <Label htmlFor="phy-subject-table" className="mb-0">
            {t("common:subjectInterests.title")}
        </Label>
        <Table id="phy_subject-table" borderless>
            <thead>
                <tr>
                    <td/>
                    <th scope="col" className="table-title"><Trans i18nKey="common:subjectInterests.gcseHeader" components={{ br: <br />, small: <small /> }} /></th>
                    <th scope="col" className="table-title"><Trans i18nKey="common:subjectInterests.aLevelHeader" components={{ br: <br />, small: <small /> }} /></th>
                    <th scope="col" className="table-title"><Trans i18nKey="common:subjectInterests.universityHeader" components={{ br: <br />, small: <small /> }} /></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t("common:subjectInterests.physics")}</span>
                        <span className="d-block d-md-none">{t("common:subjectInterests.physicsShort")}</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t("common:subjectInterests.chemistry")}</span>
                        <span className="d-block d-md-none">{t("common:subjectInterests.chemistryShort")}</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row">{t("common:subjectInterests.maths")}</th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t("common:subjectInterests.engineering")}</span>
                        <span className="d-block d-md-none">{t("common:subjectInterests.engineeringShort")}</span></th>
                    <td/>
                    <td/>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"ENGINEERING_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
            </tbody>
        </Table>
    </FormGroup>;
};
