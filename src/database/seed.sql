-- Seed data for books

INSERT INTO books (title, author, isbn, genre, total_copies, available_copies, status) VALUES
('The Great Gatsby', 'F. Scott Fitzgerald', '9780743273565', 'Fiction', 3, 3, 'available'),
('1984', 'George Orwell', '9780451524935', 'Dystopian', 4, 4, 'available'),
('The Hobbit', 'J.R.R. Tolkien', '9780547928227', 'Fantasy', 3, 3, 'available'),
('Diary of a Wimpy Kid', 'Jeff Kinney', '9780810993136', 'Comedy', 2, 2, 'available'),
('The Book Thief', 'Markus Zusak', '9780375842207', 'Historical Fiction', 3, 3, 'available'),
('The Maze Runner', 'James Dashner', '9780385737951', 'Sci-Fi', 3, 3, 'available'),
('Animal Farm', 'George Orwell', '9780451526342', 'Satire', 3, 3, 'available'),
('Lord of the Flies', 'William Golding', '9780399501487', 'Fiction', 2, 2, 'available');

INSERT INTO users (name, email, username, password_hash, role) VALUES
('Admin User', 'admin@olms.com', 'admin', '$2b$12$e/1BwrRhLqULe5R/uebX4ORnI7jEulZe8mDhIrduAVsTJzvg86ZKm', 'admin');
