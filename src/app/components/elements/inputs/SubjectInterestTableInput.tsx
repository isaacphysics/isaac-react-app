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
                    <th scope="col">GCSE<br/><small>14-16 yrs</small></th>
                    <th scope="col">A Level<br/><small>16-18 yrs</small></th>
                    <th scope="col">University<br/><small>18+ yrs</small></th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <th scope="row">Physics</th>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_GCSE"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_ALEVEL"} setStateFunction={setStateFunction}/></td>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"PHYSICS_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
                <tr>
                    <th scope="row">Chemistry</th>
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
                    <th scope="row">Engineering</th>
                    <td/>
                    <td/>
                    <td><SubjectInterestInput stateObject={stateObject} propertyName={"ENGINEERING_UNI"} setStateFunction={setStateFunction}/></td>
                </tr>
            </tbody>
        </Table>
    </FormGroup>
};
