import {FormGroup, Row, default as RS, Table, Label} from "reactstrap";
import {SubjectInterestInput} from "./subjectInterestInput";
import React from "react";

interface SujectInterestTableInputProps<T> {
    stateObject: T;
    setStateFunction: (stateObject: T) => void;
}

export const SubjectInterestTableInput = (props: SujectInterestTableInputProps<any>) => {
    const {stateObject, setStateFunction} = props

    return <FormGroup>
        <Label htmlFor="phy-subject-table" className="mb-0">
            Subject Interests
        </Label>
        <Table id="phy_subject-table" borderless>
            <thead>
                <tr>
                    <th/>
                    <th>GCSE<br/><small>14-16 yrs</small></th>
                    <th>A Level<br/><small>16-18 yrs</small></th>
                    <th>University<br/><small>18+ yrs</small></th>
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
}
