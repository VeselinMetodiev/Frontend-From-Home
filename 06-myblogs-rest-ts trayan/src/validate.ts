import { Post } from "./posts.js";
import { ChangedStatus, ValidationStatus } from "./state-enums.js";

export type ValidationConfig<T> = {
    [P in keyof T]?: Validator | Validator[]
}

export type ValidationResult<T> = {
    [P in keyof T]?: string[]
}

export class FormFieldState { //It is both type and instance => that's why it is a class, not just type
    constructor(
    public valid: ValidationStatus,
    public changed: ChangedStatus
    ) {}
}

//TODO: Another class
export type FormState<T> = { //Creating map
    [P in keyof T]?: FormFieldState
}


export type Validator = (value: string, field: string) => void;

export type ValidatorFactory = (...args: any) => Validator

// Standard validators
export class Validators {
    static required: ValidatorFactory = () => (value: string, field: string) => {
        if(value.trim().length === 0 || Number.isNaN(parseInt(value))) {
            throw `The field '${field}' is required`;
        } 
    }
    static pattern: ValidatorFactory = (validationPattern: RegExp) => (value: string, field: string) => {
        if(!validationPattern.test(value)) {
            throw `The field '${field}' does not match pattern '${validationPattern}'`
        }
    }
    static len: ValidatorFactory = (min: number, max: number) => (value: string, field: string) => {
        if(value.length < min) {
            throw `The field '${field}' should be at least ${min} characters long`
        } else if (value.length > max) {
            throw `The field '${field}' should be no more than ${max} characters long`
        }
    }
}

