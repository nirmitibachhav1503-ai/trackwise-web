import {
  BrowserRouter,
  Routes,
  Route,
  Navigate
}
  from "react-router-dom";

import { ToastContainer } from "react-toastify";

import AdminDashboard from "./pages/admin/Dashboard";
import EmployeeDashboard from "./pages/employee/Dashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./layouts/AdminLayout";
import EmployeeLayout from "./layouts/EmployeeLayout";
import ManagerLayout from "./layouts/ManagerLayout";
import TimeEntry from "./pages/employee/TimeEntry";
import Login from "./pages/auth/Login";
import Employees from "./pages/admin/Employees";
import Managers from "./pages/manager/Managers";
import Holidays from "./pages/admin/Holidays";
import Leaves from "./pages/admin/Leaves";
import DailyReport from "./pages/admin/DailyReport";
import WeeklyReport from "./pages/admin/WeeklyReport";
import MonthlyReport from "./pages/admin/MonthlyReport";
import Analytics from "./pages/admin/Analytics";
import AssignTask from "./pages/manager/AssignTask";
import AssignEmployeeToManager from "./pages/admin/AssignEmployeeToManager";
import Projects from "./pages/admin/Projects";
import EmployeeWeeklyReport from "./pages/employee/WeeklyReport";
import EmployeeMonthlyReport from "./pages/employee/MonthlyReport";
import EmployeeDailyReport from "./pages/employee/DailyReport";
import MyTasks from "./pages/employee/MyTasks";
import MyLeaves from "./pages/employee/MyLeaves";
import ApplyLeave from "./pages/employee/ApplyLeave";
import TaskList from "./pages/manager/TaskList";
import ManagerEmployees from "./pages/manager/Employees";

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="top-right"
        autoClose={3000}
      />

      <Routes>
        <Route
          path="/"
          element={<Login />}
        />

        <Route
          path="/admin"
          element={
            <ProtectedRoute
              role="Admin"
            >
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />
          <Route
            path="dashboard"
            element={<AdminDashboard />}
          />
          <Route
            path="employees"
            element={<Employees />}
          />
          <Route
            path="managers"
            element={<Managers />}
          />
          <Route
            path="holidays"
            element={<Holidays />}
          />
          <Route
            path="leaves"
            element={<Leaves />}
          />
          <Route
            path="daily-report"
            element={<DailyReport />}
          />
          <Route
            path="weekly-report"
            element={<WeeklyReport />}
          />
          <Route
            path="monthly-report"
            element={<MonthlyReport />}
          />
<Route
             path="analytics"
             element={<Analytics />}
           />
           <Route
             path="assign-employee"
             element={<AssignEmployeeToManager />}
           />
           <Route
             path="projects"
             element={<Projects />}
           />
         </Route>

        <Route
           path="/hr"
           element={
             <ProtectedRoute
               role="HR"
             >
               <AdminLayout />
             </ProtectedRoute>
           }
        >
          <Route index element={<Navigate to="employees" replace />} />
          <Route path="employees" element={<Employees />} />
          <Route path="managers" element={<Managers />} />
          <Route path="holidays" element={<Holidays />} />
          <Route path="leaves" element={<Leaves />} />
          <Route path="daily-report" element={<DailyReport />} />
          <Route path="weekly-report" element={<WeeklyReport />} />
          <Route path="monthly-report" element={<MonthlyReport />} />
        </Route>

        <Route
          path="/employee"
          element={
            <ProtectedRoute
              role="Employee"
            >
              <EmployeeLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="dashboard" replace />}
          />
          <Route
            path="dashboard"
            element={<EmployeeDashboard />}
          />
          <Route
            path="time-entry"
            element={<TimeEntry />}
          />
          <Route
            path="my-leaves"
            element={<MyLeaves />}
          />
          <Route
            path="daily-report"
            element={<EmployeeDailyReport />}
          />
          <Route
            path="weekly-report"
            element={<EmployeeWeeklyReport />}
          />
          <Route
            path="monthly-report"
            element={<EmployeeMonthlyReport />}
          />
          <Route
            path="my-tasks"
            element={<MyTasks />}
          />
          <Route
            path="apply-leave"
            element={<ApplyLeave />}
          />
        </Route>

        <Route
          path="/manager"
          element={
            <ProtectedRoute
              role="Manager"
            >
              <ManagerLayout />
            </ProtectedRoute>
          }
        >
          <Route
            index
            element={<Navigate to="assign-task" replace />}
          />
          <Route
            path="assign-task"
            element={<AssignTask />}
          />
          <Route
            path="manageremployees"
            element={<ManagerEmployees />}
          />
          <Route
            path="tasks"
            element={<TaskList />}
          />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;