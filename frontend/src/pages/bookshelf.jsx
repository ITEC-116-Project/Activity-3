import React, { useState, useEffect } from "react";
import "../style/bookshelf.css";
import logo from "../assets/book.png";
import { Pencil, Trash } from "lucide-react";
import def from "../assets/default.jpg";

const Bookshelf = () => {
  const [books, setBooks] = useState([]);
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [modalType, setModalType] = useState("add"); // "add" or "edit"

  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [category, setCategory] = useState("");
  const [coverFile, setCoverFile] = useState(null);
  const [selectedBook, setSelectedBook] = useState(null);

  const [previewUrl, setPreviewUrl] = useState(null);
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setCoverFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  // -------------------- Fetch Books --------------------
  useEffect(() => {
    fetchBooks();
  }, []);

  const fetchBooks = async () => {
    try {
      const response = await fetch("http://localhost:3000/books");
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched books:', data);
      setBooks(data);
    } catch (err) {
      console.error("Error fetching books:", err);
    }
  };

  // -------------------- Add / Edit Modal --------------------
  const openAddModal = () => {
    setModalType("add");
    setTitle("");
    setAuthor("");
    setCategory("");
    setCoverFile(null);
    setPreviewUrl(null);
    setSelectedBook(null);
    setIsAddEditModalOpen(true);
  };

  const openEditModal = (book) => {
    setModalType("edit");
    setTitle(book.title);
    setAuthor(book.author);
    setCategory(book.category);
    setCoverFile(null);
    setPreviewUrl(book.cover ? `http://localhost:3000/uploads/${book.cover}` : null);
    setSelectedBook(book);
    setIsAddEditModalOpen(true);
  };

  const openDeleteModal = (book) => {
    setSelectedBook(book);
    setIsDeleteModalOpen(true);
  };

  const closeModals = () => {
    setIsAddEditModalOpen(false);
    setIsDeleteModalOpen(false);
  };

  const stopPropagation = (e) => e.stopPropagation();

  // -------------------- Submit Form --------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("title", title);
    formData.append("author", author);
    formData.append("category", category);
    if (coverFile) formData.append("cover", coverFile);
    try {
      if (modalType === "add") {
        const response = await fetch("http://localhost:3000/books", {
          method: "POST",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();        
        if (data) {
          await fetchBooks();
          closeModals();
        }
      } else if (modalType === "edit" && selectedBook) {
        const response = await fetch(`http://localhost:3000/books/${selectedBook.id}`, {
          method: "PUT",
          body: formData,
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data) {
          await fetchBooks();
          closeModals();
        }
      }
    } catch (err) {
      console.error("Error saving book:", err);
    }
  };

  // -------------------- Delete --------------------
  const handleDelete = async () => {
    try {
      if (selectedBook) {
        const response = await fetch(
          `http://localhost:3000/books/${selectedBook.id}`,
          {
            method: "DELETE",
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        await fetchBooks();
        setIsDeleteModalOpen(false);
        setSelectedBook(null);
      }
    } catch (err) {
      console.error("Error deleting book:", err);
    }
  };

  // -------------------- Render --------------------
  return (
    <div>
      <div className="header">
        <img src={logo} alt="" className="logo" />
        <span>BOOKSHELF</span>
      </div>

      <div className="content">
        <div className="container">
          <div className="top-container">
            <span>List of Books</span>
            <button className="add-btn" onClick={openAddModal}>
              Add Book
            </button>
          </div>

          <hr />

          {books.length === 0 ? (
            <div className="empty-state">
              <p>Empty Bookshelf. Start adding a book!</p>
            </div>
          ) : (
            <div className="bookshelf">
            {books.map((book) => (
              <div key={book.id} className="book-card">
                <div className="img-div">
                  <img
                    src={
                      book.cover
                        ? `http://localhost:3000/uploads/${book.cover}`
                        : def
                    }
                    alt="cover"
                    className="book-cover"
                  />
                </div>

                <div className="book-info">
                  <p className="book-title">{book.title}</p>
                  <p className="author">{book.author || "Unknown"}</p>
                  <p className="category">
                    {book.category || "Uncategorized"}
                  </p>
                </div>

                <div className="icons-div">
                  <Pencil
                    color="#0BA6FF"
                    className="icons"
                    onClick={() => openEditModal(book)}
                  />
                  <Trash
                    color="#FF0000"
                    className="icons"
                    onClick={() => openDeleteModal(book)}
                  />
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      </div>

      {/* ---------- Add/Edit Modal ---------- */}
      {isAddEditModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="modal-content" onClick={stopPropagation}>
            <h3>{modalType === "add" ? "Add book" : "Edit book"}</h3>
            <hr />

            <form onSubmit={handleSubmit}>
              <div className="cover-box">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Cover Preview"
                    style={{
                      width: '160px',
                      height: '200px',
                      objectFit: 'cover',
                      marginTop: '10px',
                    }}
                  />
                ) : (
                  <div className="cover-placeholder">Book cover</div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  id="coverUpload"
                  onChange={handleFileChange}
                />
                <button
                  type="button"
                  className="cover-btn"
                  onClick={() =>
                    document.getElementById("coverUpload").click()
                  }
                >
                  {coverFile ? "Change Cover" : "Add Book Cover"}
                </button>
              </div>

              <label>Book Title</label>
              <input
                type="text"
                placeholder="Enter title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />

              <label>Author</label>
              <input
                type="text"
                placeholder="Enter author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                required
              />

              <label>Category</label>
              <input
                type="text"
                placeholder="Enter category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              />

              <div className="modal-buttons">
                <button
                  type="button"
                  className="cancel-btn"
                  onClick={closeModals}
                >
                  Cancel
                </button>
                <button type="submit" className="confirm-btn">
                  {modalType === "add" ? "Add" : "Confirm"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ---------- Delete Confirmation Modal ---------- */}
      {isDeleteModalOpen && (
        <div className="modal-overlay" onClick={closeModals}>
          <div className="delete-modal" onClick={stopPropagation}>
            <p>Are you sure to delete this book?</p>
            <div className="delete-buttons">
              <button onClick={closeModals} className="cancel-btn">
                Cancel
              </button>
              <button onClick={handleDelete} className="delete-btn">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Bookshelf;
