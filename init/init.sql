CREATE DATABASE IF NOT EXISTS user_db;

CREATE DATABASE IF NOT EXISTS course_db;

CREATE DATABASE IF NOT EXISTS application_db;

CREATE DATABASE IF NOT EXISTS profiles_db;

CREATE USER 'dev_user' IDENTIFIED BY 'secret';

GRANT ALL PRIVILEGES ON user_db.* TO 'dev_user';

GRANT ALL PRIVILEGES ON course_db.* TO 'dev_user';

GRANT ALL PRIVILEGES ON application_db.* TO 'dev_user';

GRANT ALL PRIVILEGES ON profiles_db.* TO 'dev_user';

FLUSH PRIVILEGES;