import {FormGroup, Label, Table} from "reactstrap";
import {SubjectInterestInput} from "./subjectInterestInput";
import React from "react";

interface SubjectInterestTableInputProps<T> {
    stateObject: T;
    setStateFunction: (stateObject: T) => void;
}

export const SubjectInterestTableInput = (props: SubjectInterestTableInputProps<any>) => {
    const {stateObject, setStateFunction} = props;

    return <FormGroup>
        <Label htmlFor="phy-subject-table" className="mb-0">
            Subject Interests
        </Label>
        <Table id="phy_subject-table" borderless>
            <thead>
                <tr>
                    <td/>
                    <th scope="col" className="table-title">GCSE<br/><small>14-16 yrs</small></th>
                    <th scope="col" className="table-title">A Level<br/><small>16-18 yrs</small></th>
                    <th scope="col" className="table-title">University<br/><small>18+ yrs</small></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">Physics</span>
                        <span className="d-block d-md-none">Phys</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">Chemistry</span>
                        <span className="d-block d-md-none">Chem</span></th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"CHEMISTRY_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row">Maths</th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"MATHS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row"><span className="d-none d-lg-block d-md-block">Engineering</span>
                        <span className="d-block d-md-none">Eng</span></th>
                    <td/>
                    <td/>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"ENGINEERING_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
            </tbody>
        </Table>
    </FormGroup>
};
