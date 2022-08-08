import { Post } from "./posts.js";
import { FormState, ValidationConfig, Validators } from "./validate.js";

export interface AppState {
    editedPost: Post | undefined;
    allPosts: Post[],
    postFormValidationConfig: ValidationConfig<Post>,
    postFormErrors: string[],
    postFormInputStates: FormState<Post>
}

export const AppStateStore: AppState = {
    editedPost: undefined,
    allPosts: [],
    postFormValidationConfig: { //Field name from Post + validation method from validate.js
        title: [Validators.required(), Validators.len(3, 60)], //More validations for one field => put them in an array
        tags: Validators.required(),
        authorId: Validators.required(),
        content: Validators.required(),
        imageUrl: [Validators.required(), Validators.pattern(/https:\/\/(www)?(.\w+.|\/|)+(png|jpg|jpeg)/)]
    },
    postFormErrors: [],
    postFormInputStates: {}
}