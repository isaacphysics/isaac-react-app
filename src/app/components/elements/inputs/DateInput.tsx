import React, {ChangeEvent, MouseEvent, useEffect, useRef, useState} from 'react';
import {Button, Input, InputGroup, InputProps} from "reactstrap";
import range from 'lodash/range';
import _cloneDeep from 'lodash/cloneDeep';
import classNames from 'classnames';

// @ts-ignore This value definition is a bit dodgy but should work.
export interface DateInputProps extends InputProps {
    labelSuffix?: string;
    disableDefaults?: boolean;
    yearRange?: number[];
    value?: string | string[] | number | Date;
    noClear?: boolean;
}

const MONTHS = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
];

function useWrappedState<T>(initialValue?: T) {
    // To avoid race conditions value needs to be set and setValue needs to be used
    // eslint-disable-next-line prefer-const
    let [value, setValue] = useState<T | undefined>(initialValue);
    function set(newValue: T | undefined) {
        if (typeof newValue == 'number' && isNaN(newValue)) {
            newValue = undefined;
        }
        value = newValue;
        setValue(newValue);
    }
    function get() {
        return value;
    }
    function reset() {
        set(initialValue);
    }
    return {get, set, reset};
}

function isLeapYear(year?: number) {
    if (!year) return true;
    if (year % 4 != 0) return false;
    if (year % 400 == 0) return true;
    if (year % 100 == 0) return false;
    return true;
}

function daysInMonth(month?: number, year?: number) {
    if (!month) return 31;
    switch(month) {
        case 1:
        case 3:
        case 5:
        case 7:
        case 8:
        case 10:
        case 12:
            return 31;
        case 4:
        case 6:
        case 9:
        case 11:
            return 30;
    }
    if (isLeapYear(year)) {
        return 29;
    } else {
        return 28;
    }
}

export const currentYear = new Date().getFullYear();

function extractDay(date: Date | undefined) {
    return date && date.getUTCDate();
}

function extractMonth(date: Date | undefined) {
    return date && (date.getUTCMonth() + 1);
}

function extractYear(date: Date | undefined) {
    return date && date.getUTCFullYear();
}

export const DateInput = (props: DateInputProps) => {
    const hiddenRef = useRef<HTMLInputElement>(null);

    const controlProps = {
        valid: props.valid,
        invalid: props.invalid,
        disabled: props.disabled,
        readOnly: props.readOnly,
        required: props.required
    };

    const inputGroupClasses = ["date-input", props.valid && "is-valid", props.invalid && "is-invalid"].filter(x => !!x).join(" ");

    const value = props.value;
    const valueAsDate = value != undefined ? new Date(value as unknown as string) : undefined;

    const defaultValue = props.defaultValue;
    const defaultDate = defaultValue != undefined ? new Date(defaultValue as unknown as string) : undefined;

    const values: {[what: string]: {get: () => number | undefined; set: (to: number | undefined) => void; reset: () => void}} = {
        day: useWrappedState<number>(extractDay(valueAsDate) || extractDay(defaultDate)),
        month: useWrappedState<number>(extractMonth(valueAsDate) || extractMonth(defaultDate)),
        year: useWrappedState<number>(extractYear(valueAsDate) || extractYear(defaultDate))
    };

    useEffect( () => {
        values.day.reset();
        values.month.reset();
        values.year.reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [valueAsDate]);

    function lastInMonth() {
        return daysInMonth(values.month.get(), values.year.get());
    }

    function calculateDate(): Date | undefined {
        const year = values.year.get();
        const month = values.month.get();
        const day = values.day.get();
        if (year && month && day) {
            return new Date(Date.UTC(year, month - 1, day));
        }
    }

    function calculateHiddenValue(): string {
        const timestamp = calculateDate();
        if (timestamp) {
            return timestamp.toISOString().substr(0, 10);
        }
        return "";
    }

    function setHiddenValue() {
        if (hiddenRef.current) {
            const timestamp = calculateDate();
            if (timestamp) {
                hiddenRef.current.value = timestamp.valueOf().toString();
            }
            return timestamp;
        }
    }

    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentDay = now.getDate();

    const change = (what: string) => (e: ChangeEvent<HTMLInputElement>) => {

        values[what].set(parseInt(e.target.value, 10));

        const day = values.day.get();
        if (!props.disableDefaults && (what == "day" || what == "month")) {
            let month = values["month"].get() as number;
            if (values["month"].get() == undefined) {
                const defaultMonth = day && day <= currentDay ? currentMonth + 1 : currentMonth;
                values["month"].set(defaultMonth > 12 ? 1 : defaultMonth);
                month = defaultMonth;
            }
            if (values["year"].get() == undefined) {
                const defaultYear = (month > 12 || (month < currentMonth)) ? currentYear + 1 : currentYear;
                const scaledYear = props.yearRange && props.yearRange.length > 0
                    ? defaultYear < (props.yearRange.at(0) as number)
                        ? props.yearRange.at(0)
                        : (defaultYear > (props.yearRange.at(-1) as number)
                            ? props.yearRange.at(-1)
                            : defaultYear)
                    : defaultYear;
                values["year"].set(scaledYear);
            }
        }

        if (day && day > lastInMonth()) {
            values.day.set(lastInMonth());
        }

        const timestamp = setHiddenValue();

        if (props.onChange) {
            props.onChange({
                ...e,
                currentTarget: {
                    ...(hiddenRef.current || e.currentTarget),
                    valueAsDate: timestamp || null
                },
                target: {
                    ...(hiddenRef.current || e.target),
                    valueAsDate: timestamp || null
                }
            });
        }
    };

    const clear = (e: MouseEvent<HTMLButtonElement>) => {
        values.day.set(undefined);
        values.month.set(undefined);
        values.year.set(undefined);

        const timestamp = setHiddenValue();

        if (props.onChange) {
            props.onChange({
                ...e,
                // @ts-ignore <- I am NOT sure this is a good idea...
                currentTarget: {
                    ...(e.currentTarget || hiddenRef.current),
                    valueAsDate: timestamp || null
                },
                // @ts-ignore
                target: {
                    ...(e.target || hiddenRef.current),
                    valueAsDate: timestamp || null
                }
            });
        }
    };

    const yearRange: number[] = _cloneDeep(props.yearRange) || range(currentYear, 1899, -1);
    // To prevent visual bug temporarily add the selected year to the range
    const selectedYear: number | undefined = values.year.get();
    if (selectedYear && !(yearRange.includes(selectedYear))) {
        yearRange.push(selectedYear);
    }

    const controlPropsWithValidationStripped = {...controlProps, valid: undefined, invalid: undefined};

    return <React.Fragment>
        <InputGroup id={props.id} {...controlPropsWithValidationStripped} className={inputGroupClasses}>
            <Input className="date-input-day mr-1" type="select" {...controlProps} aria-label={`Day${props.labelSuffix ? props.labelSuffix : ""}`} onChange={change("day")} value={values.day.get() || ""}>
                {values.day.get() === undefined && <option />}
                {range(1, Math.max(lastInMonth(), values.day.get() || 0) + 1).map(day => <option key={day}>{day}</option>)}
            </Input>
            <Input className="date-input-month mr-1" type="select" {...controlProps} aria-label={`Month${props.labelSuffix ? props.labelSuffix : ""}`} onChange={change("month")} value={values.month.get() || ""}>
                {values.month.get() === undefined && <option />}
                {MONTHS.map((month, index)=> <option value={index + 1} key={index + 1}>{month}</option>)}
            </Input>
            <Input className="date-input-year mr-1" type="select" {...controlProps} aria-label={`Year${props.labelSuffix ? props.labelSuffix : ""}`} onChange={change("year")} value={values.year.get() || ""}>
                {values.year.get() === undefined && <option />}
                {/* Hide the invalid option added */}
                {yearRange.map(year => <option key={year} className={classNames({"d-none": selectedYear && year === selectedYear})}>{year}</option>)}
            </Input>
            {(props.noClear === undefined || !props.noClear) && <Button close {...controlPropsWithValidationStripped} className="mx-1" aria-label={`Clear date${props.labelSuffix ? props.labelSuffix : ""}`} onClick={clear} />}
        </InputGroup>
        <Input innerRef={hiddenRef} type="hidden" name={props.name} value={calculateHiddenValue()} {...controlProps} />
    </React.Fragment>;
};
