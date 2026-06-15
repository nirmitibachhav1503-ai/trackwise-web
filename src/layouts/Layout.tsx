import { Outlet } from "react-router-dom";

import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";

function Layout()
{
    return (
        <div className="d-flex">

            <Sidebar />

            <div
                style={{
                    width:"100%",
                    padding:"20px"
                }}
            >

                <Navbar />

                <Outlet />

            </div>

        </div>
    );
}

export default Layout;
