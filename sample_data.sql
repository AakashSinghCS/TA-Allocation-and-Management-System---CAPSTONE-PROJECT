-- Sample data for testing CSV export functionality
USE course_db;

-- Insert sample courses
INSERT INTO course (id, course_num, dept_code, name) VALUES
(1, '110', 'COSC', 'Introduction to Computer Science'),
(2, '121', 'COSC', 'Computer Programming I'),
(3, '221', 'COSC', 'Computer Programming II'),
(4, '499', 'COSC', 'Capstone Project'),
(5, '101', 'MATH', 'Calculus I'),
(6, '102', 'MATH', 'Calculus II'),
(7, '200', 'ENGL', 'Academic Writing'),
(8, '250', 'PHYS', 'General Physics I');

-- Insert sample sections
INSERT INTO section (id, course_id, section_year, semester, section, type, instructor_id) VALUES
(1, 1, 2024, 'Fall', '001', 'LECTURE', NULL),
(2, 1, 2024, 'Fall', '002', 'LECTURE', NULL),
(3, 2, 2024, 'Fall', '001', 'LECTURE', NULL),
(4, 2, 2024, 'Fall', '101', 'LABORATORY', NULL),
(5, 3, 2025, 'Spring', '001', 'LECTURE', NULL),
(6, 4, 2025, 'Spring', '001', 'SEMINAR', NULL),
(7, 5, 2024, 'Fall', '001', 'LECTURE', NULL),
(8, 5, 2024, 'Fall', '002', 'LECTURE', NULL),
(9, 6, 2025, 'Spring', '001', 'LECTURE', NULL),
(10, 7, 2024, 'Fall', '001', 'LECTURE', NULL),
(11, 8, 2024, 'Fall', '001', 'LECTURE', NULL),
(12, 8, 2024, 'Fall', '101', 'LABORATORY', NULL);

-- Insert sample section schedules
INSERT INTO section_schedule (id, section_id, day_of_week, start_time, end_time) VALUES
(1, 1, 'MONDAY', '09:00:00', '10:30:00'),
(2, 1, 'WEDNESDAY', '09:00:00', '10:30:00'),
(3, 2, 'TUESDAY', '11:00:00', '12:30:00'),
(4, 2, 'THURSDAY', '11:00:00', '12:30:00'),
(5, 3, 'MONDAY', '14:00:00', '15:30:00'),
(6, 3, 'WEDNESDAY', '14:00:00', '15:30:00'),
(7, 4, 'FRIDAY', '14:00:00', '17:00:00'),
(8, 5, 'TUESDAY', '10:00:00', '11:30:00'),
(9, 5, 'THURSDAY', '10:00:00', '11:30:00'),
(10, 6, 'MONDAY', '16:00:00', '18:00:00'),
(11, 7, 'MONDAY', '08:00:00', '09:30:00'),
(12, 7, 'WEDNESDAY', '08:00:00', '09:30:00'),
(13, 8, 'TUESDAY', '13:00:00', '14:30:00'),
(14, 8, 'THURSDAY', '13:00:00', '14:30:00'),
(15, 9, 'MONDAY', '15:00:00', '16:30:00'),
(16, 9, 'WEDNESDAY', '15:00:00', '16:30:00'),
(17, 10, 'TUESDAY', '09:00:00', '10:30:00'),
(18, 11, 'MONDAY', '11:00:00', '12:30:00'),
(19, 11, 'WEDNESDAY', '11:00:00', '12:30:00'),
(20, 12, 'FRIDAY', '13:00:00', '16:00:00');
