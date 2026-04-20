
const API_BASE = "" // same origin



function saveToken(token) {
  localStorage.setItem("token", token)
}

function getToken() {
  return localStorage.getItem("token")
}

function logout() {
  localStorage.removeItem("token")
  window.location.href = "/login.html"
}


async function loginUser(event) {
  event.preventDefault()

  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try {
    const res = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    saveToken(data.token)
    alert("Login successful")
    window.location.href = "/index.html"

  } catch (err) {
    console.error(err)
    alert("Login failed")
  }
}

// ===============================
// REGISTER
// ===============================
async function registerUser(event) {
  event.preventDefault()

  const name = document.getElementById("name").value
  const email = document.getElementById("email").value
  const username = document.getElementById("username").value
  const password = document.getElementById("password").value

  try {
    const res = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, username, password })
    })

    const data = await res.json()

    if (!res.ok) {
      alert(data.error)
      return
    }

    alert("Account created! Please login.")
    window.location.href = "/login.html"

  } catch (err) {
    console.error(err)
    alert("Registration failed")
  }
}

// ===============================
// LOAD BOOKS
// ===============================
async function loadBooks() {
  const container = document.getElementById("booksContainer")
  if (!container) return

  const res = await fetch("/api/books")
  const books = await res.json()

  container.innerHTML = ""

  books.forEach(book => {
    const div = document.createElement("div")
    div.className = "book-card"

    div.innerHTML = `
      <h3>${book.title}</h3>
      <p>${book.author}</p>
      <p>Available: ${book.available_copies}</p>
      ${
        book.available_copies > 0
          ? `<button onclick="borrowBook(${book.id})">Borrow</button>`
          : `<button disabled>Unavailable</button>`
      }
    `

    container.appendChild(div)
  })
}

// ===============================
// BORROW
// ===============================
async function borrowBook(bookId) {
  const token = getToken()

  if (!token) {
    alert("Please login first")
    return
  }

  const res = await fetch("/api/borrow", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ book_id: bookId })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error)
    return
  }

  alert("Book borrowed!")
  loadBooks()
  loadMyLoans()
}

// ===============================
// LOAD LOANS
// ===============================
async function loadMyLoans() {
  const container = document.getElementById("loansContainer")
  if (!container) return

  const token = getToken()
  if (!token) return

  const res = await fetch("/api/borrow/my", {
    headers: {
      "Authorization": `Bearer ${token}`
    }
  })

  const loans = await res.json()

  container.innerHTML = "<h2>My Loans</h2>"

  loans.forEach(loan => {
    const div = document.createElement("div")

    div.innerHTML = `
      <p>${loan.title} - ${loan.status}</p>
      <p>Due: ${loan.due_date}</p>
      ${
        loan.status === "active"
          ? `<button onclick="returnBook(${loan.transaction_id})">Return</button>`
          : ""
      }
    `

    container.appendChild(div)
  })
}

// ===============================
// RETURN
// ===============================
async function returnBook(transactionId) {
  const token = getToken()

  const res = await fetch("/api/borrow/return", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify({ transaction_id: transactionId })
  })

  const data = await res.json()

  if (!res.ok) {
    alert(data.error)
    return
  }

  alert("Returned!")
  loadBooks()
  loadMyLoans()
}

// ===============================
// INIT
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadBooks()
  loadMyLoans()
})

// ===============================
// SEARCH FUNCTIONALITY
// ===============================
async function handleSearch() {
  const query = document.getElementById("searchInput").value;
  const container = document.getElementById("booksContainer");
  const statusText = document.getElementById("statusText");

  if (!container) return;

  // status feedback
  statusText.innerText = query ? `Searching for "${query}"...` : "Loading all books...";

  try {
    // We use the search parameter your controller expects: ?search=
    const res = await fetch(`/api/books?search=${encodeURIComponent(query)}`);
    const books = await res.json();

    container.innerHTML = "";

    if (books.length === 0) {
      container.innerHTML = "<p class='no-results'>No books found. Try a different title or author.</p>";
      return;
    }

    books.forEach(book => {
      const div = document.createElement("div");
      div.className = "book-card";
      div.innerHTML = `
        <h3>${book.title}</h3>
        <p><strong>Author:</strong> ${book.author}</p>
        <p><strong>Genre:</strong> ${book.genre || 'General'}</p>
        <p>Available: ${book.available_copies}</p>
        ${
          book.available_copies > 0
            ? `<button class="gold-btn" onclick="borrowBook(${book.id})">Borrow</button>`
            : `<button disabled>Unavailable</button>`
        }
      `;
      container.appendChild(div);
    });
  } catch (err) {
    console.error("Search error:", err);
    statusText.innerText = "Error fetching books.";
  }
}

// ===============================
// UPDATE INIT (DOMContentLoaded)
// ===============================
document.addEventListener("DOMContentLoaded", () => {
  loadBooks();
  loadMyLoans();

  // Add the click listener to your Search Button
  const searchBtn = document.getElementById("searchBtn");
  if (searchBtn) {
    searchBtn.addEventListener("click", handleSearch);
  }

  // Allow pressing "Enter" to search too
  const searchInput = document.getElementById("searchInput");
  if (searchInput) {
    searchInput.addEventListener("keypress", (e) => {
      if (e.key === "Enter") handleSearch();
    });
  }
});