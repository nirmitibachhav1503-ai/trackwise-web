import {
    Outlet
}
from "react-router-dom";

import Sidebar
from "./Sidebar";

import Navbar
from "./Navbar";

import Footer
from "./Footer";

function Layout()
{
    return (

        <div
            className="
            d-flex"
        >

            <Sidebar />

            <div
                style={{
                    marginLeft:
                    "260px",

                    width:
                    "100%"
                }}
            >

                <Navbar />

                <div
                    className="
                    container-fluid
                    mt-4"
                >

                    <Outlet />

                </div>

                <Footer />

            </div>

        </div>

    );
}

export default Layout;