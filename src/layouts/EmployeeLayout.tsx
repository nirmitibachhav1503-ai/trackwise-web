import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function EmployeeLayout() {

  return (
    <div className="d-flex">

      <Sidebar />

      <div className="w-100">

        <Navbar />

        <div className="p-4">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default EmployeeLayout;