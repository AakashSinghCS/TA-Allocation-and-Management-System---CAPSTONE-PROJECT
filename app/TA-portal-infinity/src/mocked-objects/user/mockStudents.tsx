import type {Student} from '../../interfaces/user/Student';
export const mockStudentJohnDoe : Student = {
    id : 1,
    firstName : "John",
    lastName : "Doe",
    email : "johndoe@test.com",
    studentNum : 12345678,
    program : "Computer Science",
    enrollmentYear : 2021,
    schoolYear: 3,
    createdAt : new Date("2021-01-01T00:00:00.000Z"),
}



export const mockStudentEmmaDoe : Student = {
    id : 2,
    firstName : "Emma",
    lastName : "Doe",
    email : "emmadoe@test.com",
    studentNum : 12345679,
    program : "Computer Science",
    enrollmentYear : 2020,
    schoolYear: 3,
    createdAt : new Date("2021-01-01T00:00:00.000Z"),
}
