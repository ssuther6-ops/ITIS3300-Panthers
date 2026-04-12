DROP TABLE IF EXISTS borrowing_transactions;
DROP TABLE IF EXISTS books CASCADE;
DROP TABLE IF EXISTS users CASCADE;

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    username VARCHAR(50) NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    author VARCHAR(150) NOT NULL,
    isbn VARCHAR(20) UNIQUE,
    genre VARCHAR(100),
    total_copies INT NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies INT NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    status VARCHAR(30) DEFAULT 'available',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE borrowing_transactions (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES users(id),
    book_id INT ReFERENCES books(id),
    borrowed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '14 days'),
    returned_at TIMESTAMP,
    status VARCHAR(10) DEFAULT 'active' CHECK (status IN ('active', 'returned', 'overdue'))
);
