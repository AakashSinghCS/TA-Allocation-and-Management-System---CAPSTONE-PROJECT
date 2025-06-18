## Monday (June 13-16)

### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-06-13_06-16_seiya.png)

### Current Tasks (Provide sufficient detail)
#1: Implement filter component and pass selected parameters to backend API (frontend side)

### Progress Update (since June 5, 2025) 
<table>
    <tr>
        <td><strong>TASK/ISSUE #</strong>
        </td>
        <td><strong>STATUS</strong>
        </td>
    </tr>
    <tr>
        <td>Implement filter component and pass selected parameters to backend API (frontend side)
        </td>
        <td>In Progress
        </td>
    </tr>
</table>


### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
My primary goal for this cycle was to make the Course Management filters functional on the frontend and ensure the selected parameters reach the backend endpoint.

What was done:
* Completed the filter UI component and made it capture user input and send requests to the API in the correct format.
* Aligned verbally with the backend owner on the endpoint URL and request/response schema


What was not done:
* Could not integrate the frontend with the backend because my database tests are still incomplete
* Implementing full role-based access control so only Coordinator users can access the page has been deferred until after integration.
* End-to-end tests and UI bug fixes remain unstarted because they depend on the integration


### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Finalize database tests so the frontend can be safely integrated with the live backend.
* Complete frontend–backend integration for the Course Management page and confirm successful data exchange.
* Implement role-based access control so only Coordinator users can access the page.


## Thursday (June 10-12)

### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-06-10_06-12_seiya.png)

### Current Tasks (Provide sufficient detail)
* #1: Finalize the UI for the Course Management page.
* #2: Connect the Course Management page frontend to the backend API.

### Progress Update (since June 5, 2025) 
<table>
    <tr>
        <td><strong>TASK/ISSUE #</strong>
        </td>
        <td><strong>STATUS</strong>
        </td>
    </tr>
    <tr>
        <td>#1: Update Course Management UI (fix filters, adjust layout, split page)
        </td>
        <td>Complete
        </td>
    </tr>
    <tr>
        <td>#2: Create function to send data to the API
        </td>
        <td>Complete
        </td>
    </tr>
    <tr>
        <td>#3: Integrate Course Management Frontend with Backend
        </td>
        <td>In Progress
        </td>
    </tr>
</table>


### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
My primary goal for this cycle was to complete the planned UI overhaul and establish the foundation for backend integration. While full integration is still In Progress, I successfully delivered the core UI updates and initial backend setup.

What was done:
* Completed the UI overhaul on schedule, improving both appearance and usability.
* Implemented preparatory work for backend connectivity, including API scaffolding.

What was not done:
* Integration between the frontend and backend.
* Restricting page access so that only users logged in as Coordinator can view this page.

### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Complete the full frontend and backend integration for the Course Management page.
* Implement role-based access control so that only users logged in as Coordinator can access this page
* Do testing of the features and functionality.
* Address and fix any bugs or remaining UI issues.

## Monday (June 6-9)

### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-06-06_06-09_seiya.png)

### Current Tasks (Provide sufficient detail)
* #1: Set up and troubleshoot the local development environment.
* #2: Implement frontend for TA Coordinator's "Course Management" page.

### Progress Update (since June 5, 2025) 
<table>
    <tr>
        <td><strong>TASK/ISSUE #</strong>
        </td>
        <td><strong>STATUS</strong>
        </td>
    </tr>
    <tr>
        <td>#1: Local Environment Setup
        </td>
        <td>Complete
        </td>
    </tr>
    <tr>
        <td>#2: Course Management UI Implementation
        </td>
        <td>In Progress
        </td>
    </tr>
</table>


### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
My primary goal for this cycle was the initial implementation of the Course Management frontend. While the overall feature is still **In Progress**, I successfully completed the core functionality. 

**What was done:**
* I created a functional UI for viewing and filtering courses, accessible via a new sidebar link.
* The page displays a list of courses from mock data.
* A robust filtering system is in place, allowing users to filter by Keyword, Term, Department Code, and Course Number.
* The "Add Course" form works visually, appending a new course to the list on the frontend.

**What was not done:**
* The CSV upload functionality has not been implemented yet.
* The current UI styling is functional and will be refined to match the design wireframes after the feature scope is finalized.


### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Finalize the scope of the Course Management feature with the team.
* Implement the required frontend changes based on the team's decisions.
* Refine UI styling to align with the design wireframes in the design document.
* Prepare for backend integration by understanding the required API endpoints once they are defined.


## Thursday (June 2-5)
### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-06-02_06-05_seiya.png)

### Current Tasks (Provide sufficient detail)
* #1: Implement “Course viewing, filtering, and creation” feature. (frontend)
* #2: Record transcript & walkthrough video for DFD Lv 1.


### Progress Update (since June 2, 2025)
| TASK/ISSUE # | STATUS | Category | Activity Summary | Date(s) | Time Spent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | In Progress | Feature Dev. (TA Coordinator) | • Implement “Course viewing, filtering, and creation” feature <br>• Preparation & short sync meeting | 3 – 5 Jun | **4 h 46 m** |
| #2 | Complete | Video & Docs (DFD Lv 1) | • Record transcript & walkthrough video <br>• Video preparation and scene planning | 3 – 4 Jun | **1 h 43 m** |
| #3 | Complete | Meetings & Coordination | • General team meetings (DFD status, user‑story sub‑issues) | 3 & 4 Jun | **2 h 49 m** |
| #4 | Complete | Logging / Admin | • Entered detailed time logs in Clockify | 5 Jun | **0 h 21 m** |
| **Total** | | | | | **9 h 39 m** |

### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
This cycle focused on two main areas: developing the course management feature and creating documentation for the DFD. Progress was made on implementing the user interface for course viewing and creation. The walkthrough video and transcript for the Level 1 DFD were completed.

### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Set up the local development environment.
* Implement frontend for TA Coordinator's "Course Management" page.


## Monday (May 31 - June 2)

### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-05-31_06-02_seiya.png)

### Current Tasks (Provide sufficient detail)
* #1: Write DFD Level 0 & 1 narrative description for the project document.



### Progress Update (since May 30, 2025)
| TASK/ISSUE # | STATUS | Category | Activity | Date(s) | Time Spent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | Complete | DFD & ER | Wrote **DFD Description** (Level 0 & 1 narrative for project wiki) | 2 Jun | **2 h 50 m** |
| **Total** | | | | | **2 h 50 m** |


### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
I completed a detailed  description of the Level 0 and Level 1 data-flow diagrams. This work involved clarifying each external entity, data store, and process, preparing the documentation for the upcoming peer review.

### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Record transcript & walkthrough video for DFD Lv 1.
* Implement “Course viewing, filtering, and creation” feature.


## Friday (May 25-30)

### Timesheet
Clockify report
![alt text](./clockify_images/clockify_weekly_log_2025-05-25_05-30_seiya.png)

### Current Tasks (Provide sufficient detail)
* #1: Fill *Team Planning* document (Experience / Strengths / Learning Goals sections).
* #2: Self-Study Spring Boot tutorial (DI, REST controller, basic CRUD).
* #3: DFD & ER collaborative work.

### Progress Update
| TASK/ISSUE # | STATUS | Category | Activity | Date(s) | Time Spent |
| :--- | :--- | :--- | :--- | :--- | :--- |
| #1 | Complete | Documentation | Drafted *Team Planning* document – sections **Experience / Strengths / Learning Goals** | 27 May | **3 h 19 m** |
| #2 | Complete | Self‑Study | Spring Boot tutorial (DI, REST controller, basic CRUD) | 28 & 29 May | **6 h 42 m** |
| #3 | Complete | DFD & ER Work | • DFD/ER review (COSC 310 reference) <br>• DFD meeting preparation <br>• Individual DFD review <br>• Team DFD meeting (in‑class) <br>• Follow‑up DFD meeting / fixes | 26 – 30 May | **12 h 35 m** |
| **Total** | | | | | **22 h 36 m** |


 
### Cycle Goal Review (Reflection: what went well, what was done, what didn't; Retrospective: how is the process going and why?)
Key achievements for this cycle include drafting sections of the team planning document, completing over 6 hours of self-study on Spring Boot, and significantly advancing the DFD/ER diagrams. We consolidated feedback to split the 'User' entity into more specific roles and updated the Level 0 & 1 diagrams accordingly.

### Next Cycle Goals (What are you going to accomplish during the next cycle)
* Write DFD Description (Level 0 & 1 narrative for project wiki).
