import { FormFieldState, ValidationConfig, ValidationResult } from "./validate.js";
import { AppStateStore } from "./state-store.js";
import { BlogsAPI } from "./blogs-api-client.js";
import { Post } from "./posts.js";
import { FormFieldDict, IdType } from "./shared-types.js";
import { ChangedStatus, UserState, ValidationStatus } from "./state-enums.js";

class BlogsController {
  favouritesSection = document.getElementById("favourite-posts")!;
  postsSection = document.getElementById("posts")! as HTMLElement;
  erorrsDiv = document.getElementById("errors")!;
  protected addPostForm = document.getElementById("add-post-form")! as HTMLFormElement;
  resetButton = document.getElementById("form-reset-button")! as HTMLButtonElement;
  favouritesButton = document.getElementById("favourites-button")! as HTMLButtonElement;
  favPostsIds : IdType[] = [];

  initFormState(formElement: HTMLFormElement){
    const formData = new FormData(formElement);
    const np: FormFieldDict<FormFieldState> = {};
    formData.forEach((value, key) => {
      np[key] = new FormFieldState(ValidationStatus.INVALID, ChangedStatus.PRISTINE)
    });
  }

  private changeFormState(){
    console.log("Button up")
  }

  async init() {
    this.addPostForm.addEventListener("submit", this.handleSubmitPost);
    this.resetButton.addEventListener("click", this.resetForm);
    this.addPostForm.addEventListener("change", this.validateForm, true);
    this.addPostForm.addEventListener("keyup", this.changeFormState);
    this.favouritesButton.addEventListener("click", () => { this.favouriteOrAllPosts() });

    try {
      this.fillfavPostsArray()
      this.showAllPosts();
    } catch (err) {
      this.showError(err);
    }
    
    this.initFormState(this.addPostForm);
  }

  showPosts(posts: Post[]) {
    posts.forEach((post) => this.addPostDOM(post));
  }

  favouriteOrAllPosts(){
    console.log(AppStateStore.userState);
    if(AppStateStore.userState === UserState.ALL){
      this.showFavouritePosts(this.postsSection);
      AppStateStore.userState = UserState.FAVOURITE;
    } else if(AppStateStore.userState === UserState.FAVOURITE){
      AppStateStore.userState = UserState.ALL;
      this.favouritesButton.innerText = "Favourites"
      this.favouritesButton.innerHTML += `<i class="material-icons right">cloud</i>`;
      this.postsSection.innerHTML = '';
      this.showAllPosts();
    }
  }

  async fillfavPostsArray(){
    const favPosts = await BlogsAPI.getAllFavouritePosts();
      favPosts.forEach(favPost => {
          this.favPostsIds.push(favPost.id);
        })
  }

  async showAllPosts() {
    const allPosts = await BlogsAPI.getAllPosts();
      AppStateStore.allPosts = allPosts;
      this.showPosts(allPosts);
      allPosts.forEach(post => {
        this.favPostsIds.forEach(id => {
          if(post.id === id){
            this.favPostsIds.push(post.id);
            const currentButton = document.querySelector(`#favourite${post.id!.toString()}`);
            (currentButton as HTMLElement).innerText = 'Remove from <3';
            currentButton?.setAttribute('class', 'btn waves-effect waves-light orange lighten-1');
          }
        })
      })
      return allPosts;
  }

  async showFavouritePosts(section: HTMLElement){
    section.innerHTML = ''; //Make section empty, then fill it with favourite posts
    const favouritePosts = await BlogsAPI.getAllFavouritePosts(); //fetch the posts
    this.showPosts(favouritePosts);
    console.log(this.favouritesButton)
    this.favouritesButton.innerText = 'Back to All Posts';
    const favButtons = document.querySelectorAll('.favButtons').forEach((button) => (button as HTMLElement).innerText = 'Remove From <3');

  }

  showError(err: any) {
    this.erorrsDiv.innerHTML = `<div>${err}</div>`;
  }

  addPostDOM(post: Post) {
    const postElem = document.createElement("article");
    postElem.setAttribute("id", post.id!.toString());
    postElem.className = "col s12 m6 l4";
    this.updateArticleInnerHtml(postElem, post);
    this.postsSection.insertAdjacentElement("beforeend", postElem);
  }

  updatePostDOM(post: Post) {
    const postElem = document.getElementById(post.id!.toString())!;
    this.updateArticleInnerHtml(postElem, post);
  }

  private updateArticleInnerHtml(postElem: HTMLElement, post: Post) {
    postElem.innerHTML = `
      <div class="card">
      <div class="card-image waves-effect waves-block waves-light">
        <img class="activator" src="${post.imageUrl}">
      </div>
      <div class="card-content">
        <span class="card-title activator grey-text text-darken-4">${
          post.title
        }<i class="material-icons right">more_vert</i></span>
        <p>Author: ${post.authorId}, Tags: ${
      post.tags ? post.tags.join(", ") : "no tags"
    }</p>
      </div>
      <div class="card-reveal">
        <span class="card-title grey-text text-darken-4">${
          post.title
        }<i class="material-icons right">close</i></span>
        <p>${post.content}</p>
      </div>
      <div class="card-action">
        <button class="btn waves-effect waves-light" type="button" id="edit${
          post.id
        }">Edit
          <i class="material-icons right">send</i>
        </button>
        <button class="btn waves-effect waves-light red lighten-1" type="button" id="delete${
          post.id
        }">Delete
          <i class="material-icons right">clear</i>
        </button>
        <button class="favButtons btn waves-effect waves-light red lighten-1" type="button" id="favourite${
          post.id
        }">Add to <3
          <i class="material-icons right">grade</i>
        </button>
      </div>
      </div>
      `;
    postElem
      .querySelector(`#delete${post.id}`)!
      .addEventListener("click", (event) => this.deletePost(post.id!));
    postElem
      .querySelector(`#edit${post.id}`)!
      .addEventListener("click", (event) => this.editPost(post));
    postElem
      .querySelector(`#favourite${post.id}`)!
      .addEventListener("click", (event) => this.addOrRemoveFavourites(post, post.id));
  }

  async addOrRemoveFavourites(post: Post, postId: IdType) {
    const currentButton = document.querySelector(`#favourite${postId!.toString()}`);
    console.log((currentButton as HTMLElement).innerText);
      //currentButton!.setAttribute('disabled', 'true');
    if(AppStateStore.userState === UserState.ALL && (currentButton as HTMLElement).innerText.toLowerCase().includes('add')){
    console.log("Add post to favourites.")
    try {
      this.favPostsIds.push(postId);
      await BlogsAPI.addPostToFavourites(post);
      console.log(currentButton);
      (currentButton as HTMLElement).innerText = 'Remove From <3';
      currentButton?.setAttribute('class', 'btn waves-effect waves-light orange lighten-1');
    } catch(err){
      this.showError(err);
    }
  } else if(AppStateStore.userState === UserState.ALL && (currentButton as HTMLElement).innerText.toLowerCase().includes('remove')){
    try {
    console.log('Remove from favourites 2');
    (currentButton as HTMLElement).innerText = 'Add to <3';
    currentButton?.setAttribute('class', 'btn waves-effect waves-light red lighten-1');
    await BlogsAPI.deletePostFromFavouritesById(postId);
    this.favPostsIds = this.favPostsIds.filter(function(value){ 
      return value !== postId;
  });
    } catch(err){
      this.showError(err);
    }
  } else if(AppStateStore.userState === UserState.FAVOURITE) {
    console.log('Remove from favourites');
    await BlogsAPI.deletePostFromFavouritesById(postId);
    document.getElementById(postId!.toString())?.remove();
    this.favPostsIds = this.favPostsIds.filter(function(value){ 
      return value !== postId;
  });
  }
  }

  editPost(post: Post) {
    this.fillPostForm(post);
    window.scrollTo(0, 0);
    AppStateStore.editedPost = post;
  }

  fillPostForm(post: Post) {
    let field: keyof Post;
    for (field in post) {
      (document.getElementById(field) as HTMLFormElement).value = post[field];
      const label = document.querySelector(
        `#add-post-form label[for=${field}]`
      );
      if (label) {
        label.className = "active";
      }
    }
  }

  handleSubmitPost = async (event: SubmitEvent) => {
    try {
      event.preventDefault();
      const post = this.getPostFormSnapshot();
      // const post = newPost as unknown as Post;
      if (post.id) {
        const updated = await BlogsAPI.updatePost(post);
        this.updatePostDOM(updated);
        AppStateStore.editedPost = undefined;
      } else {
        const created = await BlogsAPI.addNewPost(post);
        this.addPostDOM(created);
      }
      this.resetForm();
    } catch (err) {
      this.showError(err);
    }
  };

  getPostFormSnapshot(): Post {
    const formData = new FormData(this.addPostForm);
    const np: FormFieldDict<string> = {};
    formData.forEach((value, key) => {
      np[key] = value.toString();
    });
    return new Post(
      np.title,
      np.content,
      np.tags.split(/\W+/),
      np.imageUrl,
      parseInt(np.authorId),
      parseInt(np.id)
    );
  }

  resetForm = () => {
    if (AppStateStore.editedPost) {
      this.fillPostForm(AppStateStore.editedPost);
    } else {
      this.addPostForm.reset();
    }
  };

  async deletePost(postId: IdType) {
    try {
      await BlogsAPI.deletePostById(postId);
      document.getElementById(postId!.toString())?.remove();
    } catch (err) {
      this.showError(err);
    }
  }

  validateForm = (event: Event) => {
    const validationResult: ValidationResult<Post> = {};
    const config = AppStateStore.postFormValidationConfig;
    const formSnapshot = this.getPostFormSnapshot();
    let field: keyof ValidationConfig<Post>;
    for (field in config) {
      const validator = config[field];
      const validationErrors: string[] = [];
      if (validator !== undefined) {
        if (Array.isArray(validator)) {
          // Type guard
          validator.forEach((rule) => {
            try {
              const snap = formSnapshot[field]; // it must be separated in a constant otherwise the ternary operator does not work
              rule(snap ? snap.toString() : "", field); //When snap is NaN for number fields(empty) it will become empty string
            } catch (err) {
              validationErrors.push(err as string);
            }
          });
          if (validationErrors.length > 0) {  //Add all validation errors from the forEach loop
            validationResult[field] = validationErrors;
          }
        } else {
          try {
            validator(formSnapshot[field]!.toString(), field);
          } catch (err) {
            validationResult[field] = [err as string];
          }
        }
      }
    }
    this.showValidationErrors(validationResult);
  };

  showValidationErrors(validationResult: ValidationResult<Post>) {
    AppStateStore.postFormErrors = [];
    let field: keyof ValidationResult<Post>;
    for (field in validationResult) {
      const fieldError = `${field}Error`;
      console.log(fieldError);
      const filedErrors = validationResult[field];
      if (filedErrors !== undefined) {
        for (const err of filedErrors) {
          AppStateStore.postFormErrors.push(`${field} -> ${err}<br>`);
          document.getElementById(fieldError)!.innerHTML += (`<div>${field} -> ${err}<br></div>`);
        }
        
      }
    }
    this.showError(AppStateStore.postFormErrors.join('')); // default is ,
  }
}

const blogsController = new BlogsController();

blogsController.init();
