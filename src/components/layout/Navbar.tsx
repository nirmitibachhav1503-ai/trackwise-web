import ThemeToggle from "../ThemeToggle";
import { useAuth } from "../../context/AuthContext";

function Navbar()
{
    const {
        logout
    } = useAuth();

    return (
        <div
            className="
            d-flex
            align-items-center
            justify-content-end
            gap-3
            py-2
            px-3"
        >

            <ThemeToggle />

            <button
                className="
                btn
                btn-danger"
                onClick={logout}
            >
                Logout
            </button>

        </div>
    );
}

export default Navbar;
