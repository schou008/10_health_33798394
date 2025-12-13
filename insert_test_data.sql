# Insert data into the tables
USE health;

# Password is 'smiths', stored as a bcrypt hash
INSERT INTO users (username, firstName, lastName, email, hashedPassword)
VALUES
('gold', 'Gold', 'User', 'gold@example.com', '$2b$10$6hHgExPJzVfUNlf/KMgwx.h3HKsKNcVLyXPdoMiHhslKrZNSSiFgi');

INSERT INTO classes (name, instructor, datetime, duration, capacity, difficulty) VALUES
('Morning Yoga', 'Alice Green', '2025-12-15 08:00:00', 60, 15, 'Beginner'),
('HIIT Express', 'Ben Speed', '2025-12-15 18:00:00', 45, 12, 'Intermediate'),
('Pilates', 'Clara Core', '2025-12-16 09:30:00', 50, 10, 'Beginner'),
('Zumba', 'Darren Dance', '2025-12-16 19:00:00', 50, 20, 'All levels');

INSERT INTO bookings (class_id, name, email) VALUES
(1, 'Test User', 'test1@example.com'),
(1, 'Another User', 'test2@example.com');