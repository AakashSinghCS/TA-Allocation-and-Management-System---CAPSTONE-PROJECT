import { describe, it, expect, vi, beforeEach } from 'vitest';
import { router } from './router';

// Mock all lazy imported components
vi.mock('../App', () => ({
  default: () => <div data-testid="app">App</div>
}));

vi.mock('../components/features/roleguard/RoleGuard', () => ({
  default: ({ children, role }: { children: React.ReactNode; role: string }) => (
    <div data-testid="role-guard" data-role={role}>
      {children}
    </div>
  )
}));

vi.mock('../components/layout/publicLayout/PublicLayout', () => ({
  default: () => <div data-testid="public-layout">Public Layout</div>
}));

vi.mock('../interfaces/enum/UserRole', () => ({
  UserRole: {
    STUDENT: 'STUDENT',
    INSTRUCTOR: 'INSTRUCTOR',
    COORDINATOR: 'COORDINATOR',
    ADMIN: 'ADMIN'
  }
}));

// Mock all lazy imported pages
const mockPages = {
  CoordinatorQuestionnairePage: () => <div data-testid="coordinator-questionnaire">Coordinator Questionnaire</div>,
  TaQuestionnairePage: () => <div data-testid="ta-questionnaire">TA Questionnaire</div>,
  ProfilePage: () => <div data-testid="profile-page">Profile Page</div>,
  AllocationHistoryPage: () => <div data-testid="allocation-history">Allocation History</div>,
  ViewProfileQuestionsPage: () => <div data-testid="view-profile-questions">View Profile Questions</div>,
  AuditLogsPage: () => <div data-testid="audit-logs">Audit Logs</div>,
  CoursesTakenPage: () => <div data-testid="courses-taken">Courses Taken</div>,
  StudentComparerPage: () => <div data-testid="student-comparer">Student Comparer</div>,
  StudentQualificationPage: () => <div data-testid="student-qualification">Student Qualification</div>,
  AddAllocationHistory: () => <div data-testid="add-allocation-history">Add Allocation History</div>,
  AddEnrolledCourse: () => <div data-testid="add-enrolled-course">Add Enrolled Course</div>,
  StudentHomePage: () => <div data-testid="student-home">Student Home</div>,
  ApplicationPage: () => <div data-testid="application-page">Application Page</div>,
  ViewApplicationPage: () => <div data-testid="view-application">View Application</div>,
  ScheduleViewer: () => <div data-testid="schedule-viewer">Schedule Viewer</div>,
  TranscriptUploadPage: () => <div data-testid="transcript-upload">Transcript Upload</div>,
  InstructorNeedPage: () => <div data-testid="instructor-need">Instructor Need</div>,
  InstructorQualificationPage: () => <div data-testid="instructor-qualification">Instructor Qualification</div>,
  InstructorAddSectionPage: () => <div data-testid="instructor-add-section">Instructor Add Section</div>,
  InstructorAddNeedPage: () => <div data-testid="instructor-add-need">Instructor Add Need</div>,
  InstructorHomePage: () => <div data-testid="instructor-home">Instructor Home</div>,
  StudentsAllocatedPage: () => <div data-testid="students-allocated">Students Allocated</div>,
  CoordinatorHomePage: () => <div data-testid="coordinator-home">Coordinator Home</div>,
  AllocationPage: () => <div data-testid="allocation-page">Allocation Page</div>,
  ApplicationViewPage: () => <div data-testid="application-view">Application View</div>,
  UserBrowsingPage: () => <div data-testid="user-browsing">User Browsing</div>,
  ManualCreateUserPage: () => <div data-testid="manual-create-user">Manual Create User</div>,
  GlobalConfigPage: () => <div data-testid="global-config">Global Config</div>,
  TranscriptManagementPage: () => <div data-testid="transcript-management">Transcript Management</div>,
  CourseProfilePage: () => <div data-testid="course-profile">Course Profile</div>,
  SectionListPage: () => <div data-testid="section-list">Section List</div>,
  AddSectionPage: () => <div data-testid="add-section">Add Section</div>,
  LoginPage: () => <div data-testid="login-page">Login Page</div>,
  SignUpPage: () => <div data-testid="signup-page">SignUp Page</div>,
  ForgotPasswordPage: () => <div data-testid="forgot-password">Forgot Password</div>,
  ResetPasswordPage: () => <div data-testid="reset-password">Reset Password</div>,
  ErrorPage: () => <div data-testid="error-page">Error Page</div>,
  ExportToCSVPage: () => <div data-testid="export-csv">Export CSV</div>,
  GraduateAvailabilityPage: () => <div data-testid="graduate-availability">Graduate Availability</div>,
  CreateExamPage: () => <div data-testid="create-exam">Create Exam</div>
};

// Mock all lazy loaded pages
Object.entries(mockPages).forEach(([name, component]) => {
  vi.mock(`../pages/${name.toLowerCase()}/${name}`, () => ({
    default: component
  }));
});

// Mock specific paths that don't follow the pattern
vi.mock('../pages/coordinator/coordinatorquestionnairepage/CoordinatorQuestionnairePage', () => ({
  default: mockPages.CoordinatorQuestionnairePage
}));

vi.mock('../pages/student/taquestionnairepage/TaQuestionnairePage', () => ({
  default: mockPages.TaQuestionnairePage
}));

vi.mock('../pages/auth/profilepage/ProfilePage', () => ({
  default: mockPages.ProfilePage
}));

vi.mock('../pages/student/allocationhistorypage/AllocationHistoryPage', () => ({
  default: mockPages.AllocationHistoryPage
}));

vi.mock('../pages/student/viewprofilequestionspage/ViewProfileQuestionsPage', () => ({
  default: mockPages.ViewProfileQuestionsPage
}));

vi.mock('../pages/admin/audit/auditlogspage/AuditLogsPage', () => ({
  default: mockPages.AuditLogsPage
}));

vi.mock('../pages/student/taprofilepage/coursestakenpage/CoursesTakenPage', () => ({
  default: mockPages.CoursesTakenPage
}));

vi.mock('../pages/student/taprofilepage/comparerpage/StudentComparerPage', () => ({
  default: mockPages.StudentComparerPage
}));

vi.mock('../pages/student/taprofilepage/qualificationpage/StudentQualificationPage', () => ({
  default: mockPages.StudentQualificationPage
}));

vi.mock('../pages/student/taprofilepage/addallocationhistory/AddAllocationHistory', () => ({
  default: mockPages.AddAllocationHistory
}));

vi.mock('../pages/student/taprofilepage/coursestakenpage/addenrolledcourse/AddEnrolledCourse', () => ({
  default: mockPages.AddEnrolledCourse
}));

vi.mock('../pages/student/student_homepage/StudentHomePage', () => ({
  default: mockPages.StudentHomePage
}));

vi.mock('../pages/student/applicationpage/ApplicationPage', () => ({
  default: mockPages.ApplicationPage
}));

vi.mock('../pages/student/viewapplicationpage/ViewApplicationPage', () => ({
  default: mockPages.ViewApplicationPage
}));

vi.mock('../pages/student/scheduleviewer/ScheduleViewer', () => ({
  default: mockPages.ScheduleViewer
}));

vi.mock('../pages/student/transcriptuploadpage/TranscriptUploadPage', () => ({
  default: mockPages.TranscriptUploadPage
}));

vi.mock('../pages/instructor/instructorprofilepage/needpage/InstructorNeedPage', () => ({
  default: mockPages.InstructorNeedPage
}));

vi.mock('../pages/instructor/instructorprofilepage/qualificationpage/InstructorQualificationPage', () => ({
  default: mockPages.InstructorQualificationPage
}));

vi.mock('../pages/instructor/instructorprofilepage/needpage/addsectionpage/InstructorAddSectionPage', () => ({
  default: mockPages.InstructorAddSectionPage
}));

vi.mock('../pages/instructor/instructorprofilepage/needpage/addneedpage/InstructorAddNeedPage', () => ({
  default: mockPages.InstructorAddNeedPage
}));

vi.mock('../pages/instructor/instructorhomepage/InstructorHomePage', () => ({
  default: mockPages.InstructorHomePage
}));

vi.mock('../pages/instructor/instructorprofilepage/studentsallocatedpage/StudentsAllocatedPage', () => ({
  default: mockPages.StudentsAllocatedPage
}));

vi.mock('../pages/coordinator/coordinator_homepage/CoordinatorHomePage', () => ({
  default: mockPages.CoordinatorHomePage
}));

vi.mock('../pages/coordinator/allocationpage/AllocationPage', () => ({
  default: mockPages.AllocationPage
}));

vi.mock('../pages/coordinator/applicationviewpage/ApplicationViewPage', () => ({
  default: mockPages.ApplicationViewPage
}));

vi.mock('../pages/coordinator/userbrowsingpage/UserBrowsingPage', () => ({
  default: mockPages.UserBrowsingPage
}));

vi.mock('../pages/coordinator/userbrowsingpage/manualcreateuserpage/ManualCreateUserPage', () => ({
  default: mockPages.ManualCreateUserPage
}));

vi.mock('../pages/admin/globalconfig/GlobalConfigPage', () => ({
  default: mockPages.GlobalConfigPage
}));

vi.mock('../pages/coordinator/transcriptmanagementpage/TranscriptManagementPage', () => ({
  default: mockPages.TranscriptManagementPage
}));

vi.mock('../pages/course/courseprofilepage/CourseProfilePage', () => ({
  default: mockPages.CourseProfilePage
}));

vi.mock('../pages/course/sectionlistpage/SectionListPage', () => ({
  default: mockPages.SectionListPage
}));

vi.mock('../pages/course/addsectionpage/AddSectionPage', () => ({
  default: mockPages.AddSectionPage
}));

vi.mock('../pages/auth/loginPage/LoginPage', () => ({
  default: mockPages.LoginPage
}));

vi.mock('../pages/auth/signupPage/SignUpPage', () => ({
  default: mockPages.SignUpPage
}));

vi.mock('../pages/auth/forgotpasswordpage/ForgotPasswordPage', () => ({
  default: mockPages.ForgotPasswordPage
}));

vi.mock('../pages/auth/resetpasswordpage/ResetPasswordPage', () => ({
  default: mockPages.ResetPasswordPage
}));

vi.mock('../pages/auth/errorpage/ErrorPage', () => ({
  default: mockPages.ErrorPage
}));

vi.mock('../pages/csv/exportpage/ExportToCSVPage', () => ({
  default: mockPages.ExportToCSVPage
}));

vi.mock('../pages/student/graduateavailabilitypage/GraduateAvailabilityPage', () => ({
  default: mockPages.GraduateAvailabilityPage
}));

vi.mock('../pages/coordinator/exampage/CreateExamPage', () => ({
  default: mockPages.CreateExamPage
}));

describe('router', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Router Configuration', () => {
    it('creates browser router with correct structure', () => {
      expect(router).toBeDefined();
      expect(router.routes).toBeDefined();
      expect(Array.isArray(router.routes)).toBe(true);
      expect(router.routes).toHaveLength(2);
    });

    it('has user and public route configurations', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const publicRoute = router.routes.find(route => route.path === '/');
      
      expect(userRoute).toBeDefined();
      expect(userRoute?.children).toBeDefined();
      expect(publicRoute).toBeDefined();
      expect(publicRoute?.children).toBeDefined();
    });

    it('has error handling configured', () => {
      const userRoute = router.routes.find(route => route.path === '/user') as any;
      expect(userRoute?.errorElement).toBeDefined();
    });
  });

  describe('User Route Structure', () => {
    it('has profile and TA profile routes with parameters', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const profileRoute = userRoute?.children?.find(route => route.path === 'profile/:userId');
      const qualificationsRoute = userRoute?.children?.find(route => route.path === 'taprofile/:userId/qualifications');
      const sectionProfileRoute = userRoute?.children?.find(route => route.path === 'sectionprofile/:sectionId');
      
      expect(profileRoute).toBeDefined();
      expect(qualificationsRoute).toBeDefined();
      expect(sectionProfileRoute).toBeDefined();
    });

    it('has role-based nested route structures', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const studentRoute = userRoute?.children?.find(route => route.path === 'student');
      const instructorRoute = userRoute?.children?.find(route => route.path === 'instructor');
      const coordinatorRoute = userRoute?.children?.find(route => route.path === 'coordinator');
      
      expect(studentRoute).toBeDefined();
      expect(studentRoute?.children).toBeDefined();
      expect(instructorRoute).toBeDefined();
      expect(instructorRoute?.children).toBeDefined();
      expect(coordinatorRoute).toBeDefined();
      expect(coordinatorRoute?.children).toBeDefined();
    });
  });

  describe('Student Routes', () => {
    it('has essential student routes', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const studentRoute = userRoute?.children?.find(route => route.path === 'student');
      
      const essentialRoutes = [
        'home', 'application', 'view-applications', 'schedule',
        'questions/:studentId', 'addallocation', 'addenrollment'
      ];
      
      essentialRoutes.forEach(routePath => {
        const route = studentRoute?.children?.find(route => route.path === routePath);
        expect(route).toBeDefined();
      });
    });
  });

  describe('Instructor Routes', () => {
    it('has essential instructor routes', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const instructorRoute = userRoute?.children?.find(route => route.path === 'instructor');
      
      const essentialRoutes = [
        'home', 'browseuser', 'addsection', 
        'updateprereqcourses/:courseId/:year/:semester',
        'addneed/:sectionId'
      ];
      
      essentialRoutes.forEach(routePath => {
        const route = instructorRoute?.children?.find(route => route.path === routePath);
        expect(route).toBeDefined();
      });
    });
  });

  describe('Coordinator Routes', () => {
    it('has essential coordinator routes', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const coordinatorRoute = userRoute?.children?.find(route => route.path === 'coordinator');
      
      const essentialRoutes = [
        'home', 'questions', 'allocation', 'applications',
        'sections', 'sections/add', 'sections/export',
        'browseuser', 'globalconfig', 'transcripts'
      ];
      
      essentialRoutes.forEach(routePath => {
        const route = coordinatorRoute?.children?.find(route => route.path === routePath);
        expect(route).toBeDefined();
      });
    });
  });

  describe('Public Routes', () => {
    it('has authentication and public routes', () => {
      const publicRoute = router.routes.find(route => route.path === '/');
      
      const authRoutes = ['', 'login', 'signup', 'forgot-password', 'reset-password'];
      
      authRoutes.forEach(routePath => {
        const route = publicRoute?.children?.find(route => route.path === routePath);
        expect(route).toBeDefined();
      });
    });
  });

  describe('Error Handling and Fallbacks', () => {
    it('has catchall routes for error handling', () => {
      const userRoute = router.routes.find(route => route.path === '/user');
      const publicRoute = router.routes.find(route => route.path === '/');
      
      const userCatchAll = userRoute?.children?.find(route => route.path === '*');
      const publicCatchAll = publicRoute?.children?.find(route => route.path === '*');
      
      expect(userCatchAll).toBeDefined();
      expect(publicCatchAll).toBeDefined();
    });
  });
});
