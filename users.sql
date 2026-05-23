-- Am înlocuit 'name' cu 'first_name' și 'last_name'
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20), 
    password_hash VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserăm utilizatorul de test cu valorile separate
INSERT INTO users (first_name, last_name, email, phone_number, password_hash) 
VALUES ('Marco', 'Mihalca', 'marco@example.com', '+40700000000', 'hashed_password_aici');