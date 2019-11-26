const bookListDiv = document.querySelector('.bookshelf')
const bookColors = ["book-green", "book-blue", "book-umber", "book-springer"]
const addBtn = document.querySelector('#new-toy-btn')
const loginForm = document.querySelector('.login-form')
const totalBooks = document.querySelector('#booksontheleft')
const showArea = document.querySelector('#bookshow')
const newBookBtn = document.getElementById('modalBtn')
const libSelector = document.getElementById('lname')
const signUpForm = document.querySelector('.signup-form')
const deleteLibraryBtn = document.querySelector('#delete-btn')
const organizer = document.querySelector('#organize')



document.addEventListener('DOMContentLoaded', () => {
  
// --- gets the libraries ---

fetch('http://localhost:3000/libraries')
.then(response => response.json())
.then(libraries => {
  libraries.forEach(library => addOneLibraryToTheDropDown(library))
})

// --- puts libraries on the selector ---

const addOneLibraryToTheDropDown = (lib) => {
  if (lib.librarian) {
  let el = document.createElement("option");
  el.textContent = lib.library_name;
  el.value = lib.librarian;
  libSelector.appendChild(el);
  }
}

// --- puts books on the list ---
fetch('http://localhost:3000/books')
  .then(response => response.json())
  .then(books => {
    books.forEach(book => addOneBookToTheList(book))
  })
  
// --- puts one book on the lower left side list ---

const addOneBookToTheList = (book) => {
    totalBooks.innerHTML += `
    <li class="singleBook" data-listid=${book.id}> ${book.title} </li>
    `
}

// --- page count calculator ---

pageCount.addEventListener('click', (e) => {
  e.preventDefault();
  console.log(`${libSelector.value}`)
 fetch(`http://localhost:3000/libraries/${libSelector.value}`)
     .then(response => response.json())
     .then(library => {
       let justPages = library.library_books.map(function(book) {
        return book.pages
       });
       let totalPages = justPages.reduce(function(prev, curr) {
        return prev + curr;
       })
       alert(`You have read ${totalPages} pages so far, ${libSelector.value}. Wow!`)
     })
})

// --- deletes a library ---

deleteLibraryBtn.addEventListener('click', (e) => {
  e.preventDefault()
    fetch(`http://localhost:3000/libraries/${libSelector.value}`, {
    method: 'DELETE',
      headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
          },
      }).then(response => {
        let deletedChoice = document.querySelector(`option[value="${libSelector.value}"]`);
        deletedChoice.remove()
    }).catch(error => {
        console.error(error)
    })
  })



// --- when you log in ---

libSelector.addEventListener('input', event => {
   event.preventDefault()
   meBooks = document.querySelectorAll('.book') //takes off current books
   meBooks.forEach(function(book) {
     book.remove()
  })
   const userName = document.querySelector('#lname').value
     fetch(`http://localhost:3000/libraries/${userName}`)
     .then(response => response.json())
     .then(library => {
       library.library_books.forEach(putOneBookOnTheShelf)
     })
   })

// --- puts one book on your bookshelf, ALL CREDIT TO AKB ---

const putOneBookOnTheShelf = (libBook) => {
  if (libBook.id) {
bookListDiv.innerHTML += `
  <div class="book ${bookColors[Math.floor(Math.random()*bookColors.length)]}">
  <h2>${libBook.title} <button data-libBookId=${libBook.id}>X</button></h2>
      `
  } else {
    alert("You already have this book!")
  }
}

  // --- event listener for clicking on list of all books ---

  totalBooks.addEventListener('click', event => {
    if (event.target.dataset.listid) {
  fetch(`http://localhost:3000/books/${event.target.dataset.listid}`)
  .then(response => response.json())
  .then(book => showBookDetails(book))
    }
})

  // --- puts clicked book details in the show area ---

  const showBookDetails = (book) => {
    showArea.innerHTML = `
  <h2 style="text-align:center;"><a href=${book.info_link} target="_blank"> ${book.title} </a></h2>
  <h3 style="text-align:center;"> ${book.author} <h3>
  <p>${book.pages} pages long</p>
  <p>First published in ${book.year_published}, in ${book.country_of_origin}.</p>

  <img src="${book.bookcover_img}" class="bookImage">
  <br>
<div style="text-align: center;">
  <button data-addid=${book.id}>Add Me To Your Library!
  </div>

  `
  }

// --- takes a book off your shelf ---

bookListDiv.addEventListener('click', (e) => {
  // console.log(e.target)
  if (e.target.dataset.libbookid) {
    // console.log('step one worked')
    fetch(`http://localhost:3000/library_books/${e.target.dataset.libbookid}`, {
    method: 'DELETE',
      headers: {
      // Access-Control-Allow-Origin: *,
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
      }).then(response => {
        e.target.parentElement.parentElement.remove()
    }).catch(error => {
        console.error(error)
    })
  }
})

// ---   new library event listener ---

signUpForm.addEventListener('submit', event => {
  event.preventDefault()
  const newLibrarianName = document.querySelector('.newName').value
  const newLibraryName = document.querySelector('.new-library-name').value
  let newLibraryObj = {
    librarian: newLibrarianName,
    library_name: newLibraryName,
  }
fetch('http://localhost:3000/libraries', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(newLibraryObj)
    }).then(resp => resp.json())
    .then((libObj) => {
    addOneLibraryToTheDropDown(libObj)
    signUpForm.reset()
    }).catch(error => {
        console.error(error)
    })
  })

// --- event listener to add book to library ---

showArea.addEventListener('click', event => {
  if (event.target.dataset.addid !== undefined) {
   fetch(`http://localhost:3000/books/${event.target.dataset.addid}`)
  .then(response => response.json())
  .then(book => {
    let bookObj = book
    grabLibraryId(bookObj)
    }) 
  }
})  

// --- takes your book info, passes along to get library info ---

   const grabLibraryId = (bookObj) => {
    const userName = document.querySelector('.libraryName').value
    fetch(`http://localhost:3000/libraries/${userName}`)
      .then(response => response.json())
      .then(library => {
        const libid = library.id
        postNewLibBook(bookObj, libid)
      })
}

// --- takes all your info and makes a new library book ---

    const postNewLibBook = (bookObj, libid) => {   //yes, i know i can use spread. 
      let newLibBookObj = {
        library_id: libid,
        book_id: parseInt(bookObj.id, 10),
        title: bookObj.title,
        pages: parseInt(bookObj.pages, 10),
        author: bookObj.author,
        country_of_origin: bookObj.country_of_origin,
        original_language: bookObj.original_language,
        year_published: parseInt(bookObj.year_published, 10)
      }
    fetch("http://localhost:3000/library_books/", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(newLibBookObj) 
      })
    .then(resp => resp.json())
    .then((newLibBookObj) => {
    putOneBookOnTheShelf(newLibBookObj)
  })
}

// --- event listener to create a new book ---

modalBtn.addEventListener('click', function () {
    modal.style.display = "block";
    document.getElementById('modalText').innerHTML = `
    <form class="newBookForm">
    <h1> Create a new book! </h1>
    Title:<br>
  <input type="text" class="title" required><br>
    Author:<br>
  <input type="text" class="author" required><br>
    Country of Origin:<br>
  <input type="text" class="country" required><br>
    Link to cover image:<br>
  <input type="text" class="coverlink" required><br>
    Original Language:<br>
  <input type="text" class="language" required><br>
    Info Link:<br>
  <input type="text" class="wikilink" required><br>
    Year Published:<br>
  <input type="text" class="year" required><br>
    Pages:<br>
  <input type="text" class="pages" required><br>
  <input id="submitBook" type="submit">
  </form>
    `
  })

// --- make a new book ---

document.addEventListener('click', function (event) {
  if (event.target.id == 'submitBook') {
    event.preventDefault();
    let newBookObj = {
      author: document.querySelector('.author').value,
      country_of_origin: document.querySelector('.country').value,
      bookcover_img: document.querySelector('.coverlink').value,
      original_language: document.querySelector('.language').value,
      info_link: document.querySelector('.wikilink').value,
      title: document.querySelector('.title').value,
      year_published: document.querySelector('.year').value,
      pages: document.querySelector('.pages').value,
          };
    fetch("http://localhost:3000/books/", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: JSON.stringify(newBookObj) 
      }).then(resp => resp.json())
    .then((newBookObj) => {
    modal.style.display = "none";
    addOneBookToTheList(newBookObj)
      }).catch(error => {
        console.error(error)
    })
    } 
})

// Get the modal
var modal = document.getElementById("myModal");


// Get the <span> element that closes the modal
var span = document.getElementsByClassName("close")[0];

// When the user clicks on <span> (x), close the modal
span.onclick = function() {
  modal.style.display = "none";
}

// When the user clicks anywhere outside of the modal, close it
window.onclick = function(event) {
  if (event.target == modal) {
    modal.style.display = "none";
    }
  }

  // --- organize your shelf ---

organizer.addEventListener('input', (event) => {
  event.preventDefault()
  let selectingThing = organizer.value
  meBooks = document.querySelectorAll('.book') //takes off current books
  meBooks.forEach(function(book) {
  book.remove()
  })
   const userName = document.querySelector('#lname').value
     fetch(`http://localhost:3000/libraries/${userName}`)
     .then(response => response.json())
     .then(library => {
      let organizedBooks = library.library_books.sort((a, b) => (a[selectingThing] > b[selectingThing]) ? 1 : -1)
       organizedBooks.forEach(putOneBookOnTheShelf)

       })
    })
})