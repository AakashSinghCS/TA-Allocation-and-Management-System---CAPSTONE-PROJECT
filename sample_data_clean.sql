-- Clear existing data and add new sample data
USE course_db;

-- Clear existing sections and schedules
DELETE FROM section_schedule;
DELETE FROM section;

-- Insert sample sections with unique combinations
INSERT INTO section (id, course_id, section_year, semester, section, type) VALUES
(1, 1, 2024, 'Fall', '001', 'LECTURE'),
(2, 1, 2024, 'Fall', '002', 'LECTURE'),
(3, 1, 2024, 'Fall', '101', 'TUTORIAL'),
(4, 2, 2024, 'Fall', '001', 'LECTURE'),
(5, 2, 2024, 'Fall', '101', 'LABORATORY'),
(6, 3, 2025, 'Spring', '001', 'LECTURE'),
(7, 3, 2025, 'Spring', '101', 'LABORATORY'),
(8, 4, 2025, 'Spring', '001', 'SEMINAR'),
(9, 5, 2024, 'Fall', '001', 'LECTURE'),
(10, 5, 2024, 'Fall', '002', 'LECTURE'),
(11, 6, 2025, 'Spring', '001', 'LECTURE'),
(12, 7, 2024, 'Fall', '001', 'LECTURE'),
(13, 8, 2024, 'Fall', '001', 'LECTURE'),
(14, 8, 2024, 'Fall', '101', 'LABORATORY'),
(15, 1, 2025, 'Spring', '001', 'LECTURE'),
(16, 2, 2025, 'Spring', '001', 'LECTURE');

-- Insert sample section schedules
INSERT INTO section_schedule (id, section_id, day_of_week, start_time, end_time) VALUES
(1, 1, 'MONDAY', '09:00:00', '10:30:00'),
(2, 1, 'WEDNESDAY', '09:00:00', '10:30:00'),
(3, 2, 'TUESDAY', '11:00:00', '12:30:00'),
(4, 2, 'THURSDAY', '11:00:00', '12:30:00'),
(5, 3, 'FRIDAY', '14:00:00', '15:30:00'),
(6, 4, 'MONDAY', '14:00:00', '15:30:00'),
(7, 4, 'WEDNESDAY', '14:00:00', '15:30:00'),
(8, 5, 'FRIDAY', '14:00:00', '17:00:00'),
(9, 6, 'TUESDAY', '10:00:00', '11:30:00'),
(10, 6, 'THURSDAY', '10:00:00', '11:30:00'),
(11, 7, 'FRIDAY', '10:00:00', '13:00:00'),
(12, 8, 'MONDAY', '16:00:00', '18:00:00'),
(13, 9, 'MONDAY', '08:00:00', '09:30:00'),
(14, 9, 'WEDNESDAY', '08:00:00', '09:30:00'),
(15, 10, 'TUESDAY', '13:00:00', '14:30:00'),
(16, 10, 'THURSDAY', '13:00:00', '14:30:00'),
(17, 11, 'MONDAY', '15:00:00', '16:30:00'),
(18, 11, 'WEDNESDAY', '15:00:00', '16:30:00'),
(19, 12, 'TUESDAY', '09:00:00', '10:30:00'),
(20, 13, 'MONDAY', '11:00:00', '12:30:00'),
(21, 13, 'WEDNESDAY', '11:00:00', '12:30:00'),
(22, 14, 'FRIDAY', '13:00:00', '16:00:00'),
(23, 15, 'TUESDAY', '14:00:00', '15:30:00'),
(24, 15, 'THURSDAY', '14:00:00', '15:30:00'),
(25, 16, 'MONDAY', '10:00:00', '11:30:00'),
(26, 16, 'WEDNESDAY', '10:00:00', '11:30:00');
