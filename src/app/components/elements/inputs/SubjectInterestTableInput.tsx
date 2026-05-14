import {FormGroup, Label, Table} from "reactstrap";
import {SubjectInterestInput} from "./subjectInterestInput";
import React from "react";
import {SubjectInterests} from "../../../../IsaacAppTypes";
import { useTranslation, Trans } from 'react-i18next'

interface SubjectInterestTableInputProps<T> {
    stateObject: T;
    setStateFunction: (stateObject: T) => void;
}

// FIXME if this ever gets used again, we should add a Biology section
export const SubjectInterestTableInput = (props: SubjectInterestTableInputProps<SubjectInterests>) => {
    const { t } = useTranslation()
    const {stateObject, setStateFunction} = props;

    return <FormGroup className="form-group">
        <Label htmlFor="phy-subject-table" className="mb-0">
            {t('subjectInterests', 'Subject Interests')}
        </Label>
        <Table id="phy_subject-table" borderless>
            <thead>
                <tr>
                    <td/>
                    <th scope="col" className="table-title"><Trans i18nKey="gcsebrsmall1416Yrssmall">GCSE<br/><small>14-16 yrs</small></Trans></th>
                    <th scope="col" className="table-title"><Trans i18nKey="aLevelbrsmall1618Yrssmall">A Level<br/><small>16-18 yrs</small></Trans></th>
                    <th scope="col" className="table-title"><Trans i18nKey="universitybrsmall18Yrssmall">University<br/><small>18+ yrs</small></Trans></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t('physics', 'Physics')}</span>
                        <span className="d-block d-md-none">{t('phys', 'Phys')}</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t('chemistry', 'Chemistry')}</span>
                        <span className="d-block d-md-none">{t('chem', 'Chem')}</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row">{t('maths', 'Maths')}</th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">{t('engineering', 'Engineering')}</span>
                        <span className="d-block d-md-none">{t('eng', 'Eng')}</span></th>
                    <td/>
                    <td/>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"ENGINEERING_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
            </tbody>
        </Table>
    </FormGroup>;
};
