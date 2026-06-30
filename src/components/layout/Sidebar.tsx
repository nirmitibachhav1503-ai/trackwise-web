import { Link, useLocation } from "react-router-dom";

import {
    FaUsers,
    FaCalendarAlt,
    FaClipboardList,
    FaChartBar,
    FaUserCircle,
    FaSignOutAlt,
    FaHome,
    FaProjectDiagram
}
    from "react-icons/fa";

import { useTheme }
    from "../../context/ThemeContext";

import AppVersion
    from "../common/AppVersion";

function Sidebar() {
    const location =
        useLocation();

    const { darkMode } =
        useTheme();

    const menuItems =
        [
            {
                title: "Dashboard",
                path: "/admin/dashboard",
                icon: <FaHome />
            },
            {
                title: "Employees",
                path: "/admin/employees",
                icon: <FaUsers />
            },
            {
                title: "Holidays",
                path: "/admin/holidays",
                icon: <FaCalendarAlt />
            },
            {
                title: "Leaves",
                path: "/admin/leaves",
                icon: <FaClipboardList />
            },
            {
                title: "Reports",
                path: "/admin/daily-report",
                icon: <FaChartBar />
            },
            {
                title: "Projects",
                path: "/admin/projects",
                icon: <FaProjectDiagram />
            },
            {
                title: "Profile",
                path: "/profile",
                icon: <FaUserCircle />
            }
        ];

    const logout =
        () => {
            localStorage.clear();

            window.location.href = "/";
        };

    return (

        <div
            className={
                darkMode
                    ?
                    "sidebar sidebar-dark"
                    :
                    "sidebar sidebar-light"
            }
        >

            <div className="sidebar-header">

                <h3>
                    TrackWise
                </h3>

            </div>

            <div
                className="
                sidebar-user"
            >

                <img
                    src="/default-user.png"
                    alt="user"
                    className="
                    profile-image"
                />

                <h6>
                    Admin User
                </h6>

            </div>

            <div
                className="
                sidebar-menu"
            >

                {
                    menuItems.map(
                        (
                            item,
                            index
                        ) =>
                        (
                            <Link
                                key={index}
                                to={item.path}
                                className={
                                    location.pathname
                                        === item.path
                                        ?
                                        "menu-item active"
                                        :
                                        "menu-item"
                                }
                            >

                                {item.icon}

                                <span>
                                    {item.title}
                                </span>

                            </Link>
                        )
                    )
                }

            </div>
            <div
                className="
 sidebar-footer"
            >

                <AppVersion />

            </div>

            <div
                className="
                sidebar-footer"
            >

                <button
                    className="
                    logout-btn"
                    onClick={
                        logout
                    }
                >

                    <FaSignOutAlt />

                    <span>
                        Logout
                    </span>

                </button>

            </div>

        </div>


    );
}

export default Sidebar;