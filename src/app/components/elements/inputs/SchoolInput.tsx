import React, { useEffect, useState } from "react";
import AsyncCreatableSelect from "react-select/async-creatable";
import * as RS from "reactstrap";
import { School, ValidationUser } from "../../../../IsaacAppTypes";
import { api, schoolNameWithPostcode, validateUserSchool } from "../../../services";
import { throttle } from "lodash";
import { Immutable } from "immer";

interface SchoolInputProps {
  userToUpdate: Immutable<ValidationUser>;
  setUserToUpdate?: (user: Immutable<ValidationUser>) => void;
  submissionAttempted: boolean;
  className?: string;
  idPrefix?: string;
  disableInput?: boolean;
  required: boolean;
}
const NOT_APPLICABLE = "N/A";

const schoolSearch = (
  schoolSearchText: string,
  setAsyncSelectOptionsCallback: (options: { value: string | School; label: string | undefined }[]) => void,
) => {
  api.schools
    .search(schoolSearchText)
    .then(({ data }) => {
      setAsyncSelectOptionsCallback(
        data && data.length > 0 ? data.map((item) => ({ value: item, label: schoolNameWithPostcode(item) })) : [],
      );
    })
    .catch((response) => {
      console.error("Error searching for schools. ", response);
    });
};
// Must define this debounced function _outside_ the component to ensure it doesn't get overwritten each rerender!
const throttledSchoolSearch = throttle(schoolSearch, 450, { trailing: true, leading: true });

export const SchoolInput = ({
  userToUpdate,
  setUserToUpdate,
  submissionAttempted,
  className,
  idPrefix = "school",
  disableInput,
  required,
}: SchoolInputProps) => {
  const [selectedSchoolObject, setSelectedSchoolObject] = useState<School | null>();

  // Get school associated with urn
  function fetchSchool(urn: string) {
    if (urn != "") {
      api.schools.getByUrn(urn).then(({ data }) => {
        setSelectedSchoolObject(data[0]);
      });
    } else {
      setSelectedSchoolObject(null);
    }
  }

  useEffect(() => {
    fetchSchool(userToUpdate.schoolId || "");
  }, [userToUpdate.schoolId]);

  // Set schoolId or schoolOther
  function setUserSchool(school: any) {
    if (school.urn) {
      setUserToUpdate?.({ ...userToUpdate, schoolId: school.urn, schoolOther: undefined });
      setSelectedSchoolObject(school);
    } else if (school) {
      setUserToUpdate?.({ ...userToUpdate, schoolOther: school, schoolId: undefined });
      setSelectedSchoolObject(school);
    }
  }

  // Called when school input box option selected
  function handleSetSchool(newValue: { value: string | School } | null) {
    if (newValue == null) {
      setSelectedSchoolObject(undefined);
      setUserToUpdate?.({ ...userToUpdate, schoolId: undefined, schoolOther: undefined });
    } else if (newValue && newValue.value) {
      setUserSchool(newValue.value);
    } else if (newValue) {
      setUserSchool(newValue);
    }
  }

  const schoolValue: { value: string | School; label: string | undefined } | undefined =
    selectedSchoolObject && selectedSchoolObject.urn
      ? { value: selectedSchoolObject.urn, label: schoolNameWithPostcode(selectedSchoolObject) }
      : userToUpdate.schoolOther
      ? { value: "manually entered school", label: userToUpdate.schoolOther }
      : undefined;

  const randomNumber = Math.random();

  const isInvalid = submissionAttempted && required && !validateUserSchool(userToUpdate);
  return (
    <RS.FormGroup className={`school ${className}`}>
      <RS.Label htmlFor={`school-input-${randomNumber}`}>My current school or college</RS.Label>
      {userToUpdate.schoolOther !== NOT_APPLICABLE && (
        <React.Fragment>
          <AsyncCreatableSelect
            isClearable
            isDisabled={disableInput}
            inputId={`school-input-${randomNumber}`}
            placeholder={"Type your school or college name"}
            value={schoolValue}
            className={(isInvalid ? "react-select-error " : "") + "basic-multi-select"}
            classNamePrefix="select"
            onChange={handleSetSchool}
            loadOptions={throttledSchoolSearch}
            filterOption={() => true}
            formatCreateLabel={(input) => <span>Use &quot;{input}&quot; as your school name</span>}
          />
        </React.Fragment>
      )}

      {((userToUpdate.schoolOther == undefined && !(selectedSchoolObject && selectedSchoolObject.name)) ||
        userToUpdate.schoolOther == NOT_APPLICABLE) && (
        <div className={(userToUpdate.schoolOther === NOT_APPLICABLE ? "mt-1" : "mt-3") + " d-flex"}>
          <RS.CustomInput
            type="checkbox"
            id={`${idPrefix}-not-associated-with-school`}
            checked={userToUpdate.schoolOther === NOT_APPLICABLE}
            invalid={isInvalid}
            disabled={disableInput || !setUserToUpdate}
            onChange={(e) => {
              const { schoolId, schoolOther, ...userWithoutSchoolInfo } = userToUpdate;
              if (e.target.checked) {
                setUserToUpdate?.({ ...userWithoutSchoolInfo, schoolOther: NOT_APPLICABLE });
              } else {
                setUserToUpdate?.(userWithoutSchoolInfo);
              }
            }}
            label="I am not associated with a school or college"
            className="larger-checkbox"
          />
        </div>
      )}

      <div className="invalid-school">
        {submissionAttempted && !validateUserSchool(userToUpdate) && "Please specify a school or college"}
      </div>
    </RS.FormGroup>
  );
};
