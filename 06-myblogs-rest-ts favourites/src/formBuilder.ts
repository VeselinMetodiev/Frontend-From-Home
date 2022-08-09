import { ChangedStatus, ValidationStatus } from "./state-enums";
import { Validator } from "./validate.js";

export type FormComponents<Entity> = {
  [Prop in keyof Entity]?: FormComponent<Prop>;
};

interface FormComponent<State> {
  id: string;
  value: State;
  valid: ValidationStatus;
  changed: ChangedStatus;
  readonly initialValue: State;
  validators?: Validator | Validator[];
  reset(): void;
  validate(): string[]; //validation errors, empty array if not errors
  render(): string;
}

export interface FormTextComponentType extends FormComponent<string> {
  multiline: boolean;
}
export type FormCheckboxComponentType = FormComponent<boolean>;
export interface FormNumberComponentType extends FormComponent<number> {
  min: number;
  max: number;
}
export interface FormUrlComponentType extends FormComponent<string> {
  allowRelative: boolean;
  allowInsecure: boolean; //HTTP/S
}

export type FormComponentType<Prop> = Prop extends string
  ? FormTextComponentType
  : Prop extends number
  ? FormNumberComponentType
  : Prop extends boolean
  ? FormCheckboxComponentType
  : never;

export type FormWidgetElements<Entity> = {
    [Prop in keyof Entity]: FormComponentType<Prop>
}

export class FormTextComponent implements FormTextComponentType {
  constructor(
    public id: string,
    public value: string,
    public multiline: boolean = false,
    public initialValue = " ",
    public validators?: Validator | Validator,
    public valid: ValidationStatus = ValidationStatus.INVALID,
    public changed: ChangedStatus = ChangedStatus.PRISTINE
  ) {}
  reset(): void {
    this.value = this.initialValue;
  }
  validate() {
    const errors = [] as string[];
    if(!this.validators) return [];
    if (Array.isArray(this.validators)) {
      for (const validator of this.validators) {
        try {
          validator(this.value, this.id);
        } catch (err) {
          errors.push(err as string);
        }
      }
    } else {
        try {
            this.validators(this.value, this.id);
          } catch (err) {
            errors.push(err as string);
          }
    }
    return errors;
  }
  render(): string {
    const validationErrors = this.validate();
   return this.multiline ?
   `<div class="input-field col s12">
   <textarea id="${this.id} name="${this.id}" type="url" class="materialize-textarea validate ${validationErrors?'Invalid':'valid'}"
   value="${this.value}">
   <label for="imageUrl">Blog Image URL</label>
   <span id='imageUrlError' class="helper-text" data-error="${this.validate().join(', ')}"></span>
</div>`
   :
   `<div class="input-field col s12">
   <input id="${this.id} name="${this.id}" type="url" class="validate ${validationErrors?'Invalid':'valid'}"
   value="${this.value}">
   <label for="imageUrl">Blog Image URL</label>
   <span id='imageUrlError' class="helper-text" data-error="${this.validate().join(', ')}"></span>
</div>`
  }
}

export class FormWidget<Entity> {
    constructor(
        public elements: FormWidgetElements<Entity>,
        public initialValue: Entity
    ) {}
    reset() {
        for(const elemId in this.elements){
            this.elements[elemId].reset();
        }
    }
    validate() {
        console.log('validate')
    }
    getFormSnapshot(): Entity | null {
        console.log('validate');
        return null;
    }

}
