import { Book } from "./book.js";
import {BooksAPI} from "./google-books-api-client.js";
import { createGuid } from "./utilities.js";

class BooksController {
  resultsElem = document.getElementById("results") as HTMLElement;
  searchField = (document.getElementById("search")! as HTMLInputElement)
  results = document.getElementById("results");

  init() {
    document
      .getElementById("submit")
      ?.addEventListener("click", this.displayBooks.bind(this));
  }

   displayBooks() {
    const searchWord = this.searchField.value;
    console.log("Search Word: ", searchWord);

    //User sends empty input
    if (searchWord === "" && this.results !== null) {
        this.results.innerText = "Type Something, Buddy!";
      } else {
       this.fetchBooks(searchWord);
    }
  }

  async fetchBooks(searchWord: string) {
    try {
      //delete the books from previous search
      this.deletePreviousSearchResult();
      const fetchedBooks = await BooksAPI.getBooks(searchWord);

      //Nothing was fetched
      if (!fetchedBooks || !fetchedBooks.items) {
        this.resultsElem.insertAdjacentHTML(
          "beforeend",
          `<p> No data for <strong>${searchWord}</strong></p>`
        );
        return;
      }
      const booksInfo = this.ExtractBooks(fetchedBooks);
      booksInfo.forEach((book) => this.addBooksToDOM(book))
    } catch (err) {
      console.log("Error: ", err);
    } finally {
      console.log("Demo finished");
      const footer = document.getElementsByTagName("footer")[0];
      footer.style.position = "relative";
    }
  }

  private addBooksToDOM(book: Book){
const templateString = `<article id="${book.googleLink}">
<h1>${book.title}</h1>
<img class="article-image" src="${book.thumbnail}" />
<div class="blog-text">
<h2>${book.author}</h2>
<summary>
${book.description}<a
    href="${book.googleLink}"
    >Open in Google</a
  >
</summary>
<button id="button${book.id}" href="#">Add to Favourites</button>
</div>
</article>`;
      this.resultsElem.insertAdjacentHTML("beforeend", templateString);
      console.log(this.resultsElem);
       document.querySelector(`#button${book.id}`)!.addEventListener("click", (event) => this.addToFavourites(book));
  }

  //Returns an array of Books
  private ExtractBooks(fetchedBooks:any) : Book[] {
    const booksInfo = [];
    for (const book of fetchedBooks.items) {
      let description = book.volumeInfo.description;
      const author = book.volumeInfo.authors
        ? book.volumeInfo.authors
        : "Not Specified";
      const thumbnail = book.volumeInfo.imageLinks.thumbnail
        ? book.volumeInfo.imageLinks.thumbnail
        : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";
      if (!description) {
        description = "No description.";
      } else if (description) {
        description = description.substring(0, 200);
        const lastSpace = description.lastIndexOf(" ");
        description = description.substring(0, lastSpace);
        description += "...";
      }
      booksInfo.push({
        id: createGuid(),
        title: book.volumeInfo.title,
        author: author,
        thumbnail: thumbnail,
        description: description,
        googleLink: book.volumeInfo.previewLink,
      });
    }
    return booksInfo;
  }

  private deletePreviousSearchResult() {
    if (this.resultsElem !== null) {
      while (this.resultsElem.firstChild) {
        this.resultsElem.removeChild(this.resultsElem.firstChild);
      }
    }
  }
  addToFavourites(book: Book): void {
    console.log("Add to favourites was clicked.")
  }
}

const booksController = new BooksController();
booksController.init();
