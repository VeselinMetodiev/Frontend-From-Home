import { Book } from "./book.js";

const API_BASE_URL = "https://www.googleapis.com/books/v1/volumes?q=";

export interface BooksApiClient {
    getBooks(searchWord: string) : Promise<any>;
}

export class BooksApiClientImpl implements BooksApiClient {
    async getBooks(searchWord: string) {
      return this.handleRequest(`${API_BASE_URL}${encodeURI(searchWord)}`);
    }

    private async handleRequest(url: string, options?: RequestInit) {
      try {
          const postsResp = await fetch(url, options);
          if (postsResp.status >= 400) {
              return Promise.reject(postsResp.body);
          }
          return postsResp.json();
      } catch (err) {
          return Promise.reject(err);
      }
  }
}

export const BooksAPI: BooksApiClient = new BooksApiClientImpl();