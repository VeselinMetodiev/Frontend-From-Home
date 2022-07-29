async function fetchBooks(searchWord) {
  try {
    const resultsElem = document.getElementById("results");
    //delete the books from previous search
while(resultsElem.firstChild){
    resultsElem.removeChild(resultsElem.firstChild);
}

    const booksInfo = [];
    // const searchWord = "React Native";
    const fetchFromGoogle = await fetch(
      `https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(
        searchWord
      )}`
    );
    console.log(fetchFromGoogle);
        if(!fetchFromGoogle){
      resultsElem.insertAdjacentElement('beforeend', `<p> No data for <strong>${searchWord}</strong></p>`);
      return;
    }
    const googleBooks =  await fetchFromGoogle.json();
    if(!googleBooks.items){
      resultsElem.insertAdjacentHTML('beforeend', `<p> No data for ${searchWord}</p>`);
      return;
    }
    for (const book of googleBooks.items) {
      let description = book.volumeInfo.description;
      let author = book.volumeInfo.authors ? book.volumeInfo.authors : "Not Specified";
      let thumbnail = book.volumeInfo.imageLinks.thumbnail ? book.volumeInfo.imageLinks.thumbnail : "https://upload.wikimedia.org/wikipedia/commons/thumb/6/65/No-Image-Placeholder.svg/1665px-No-Image-Placeholder.svg.png";
      if (!description) {
        description = "No description.";
      } else if (description) {
        description = description.substring(0, 200);
        const lastSpace = description.lastIndexOf(" ");
        description = description.substring(0, lastSpace);
        description += "...";
      }
      booksInfo.push({
        Title: book.volumeInfo.title,
        Author: author,
        Thumbnail: thumbnail ,
        Description: description,
        GoogleLink: book.volumeInfo.previewLink,
      });
    }

    booksInfo.forEach((book) => {
      const templateString = `<article>
<h1>${book.Title}</h1>
<img class="article-image" src="${book.Thumbnail}" />
<div class="blog-text">
  <h2>${book.Author}</h2>
  <summary>
  ${book.Description}<a
      href="${book.GoogleLink}"
      >Open in Google</a
    >
  </summary>
  <a href="#">Add to Favourites</a>
</div>
</article>`;
      resultsElem.insertAdjacentHTML("beforeend", templateString);
    });
  } catch (err) {
    console.log("Error: ", err);
  } finally {
    console.log("Demo finished");
    const footer = document.getElementsByTagName("footer")[0];
    footer.style.position = "relative";
  }
}

document.getElementById("submit").addEventListener("click", displayBooks);

function displayBooks() {
  console.log("Search was clicked.");
  searchWord = document.getElementsByName("search")[0].value;
  console.log("SearchWord", searchWord);
  if (searchWord === "") {
    document.getElementsById("results").innerText = "Type Something, Buddy!";
  } else {
    fetchBooks(searchWord);
  }
}
