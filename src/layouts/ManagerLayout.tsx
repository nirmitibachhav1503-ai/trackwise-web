import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function ManagerLayout() {

  return (
    <div className="d-flex">

      <Sidebar />

      <div className="w-100">

        <Navbar />

        <div style={{ background: "#f4f6f9", minHeight: "100vh" }} className="p-4">
          <Outlet />
        </div>

      </div>

    </div>
  );
}

export default ManagerLayout;