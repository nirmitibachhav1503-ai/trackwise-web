function AppVersion()
{
    return (

        <small>

            Version

            {" "}

            {
                import.meta.env
                .VITE_APP_VERSION
            }

        </small>

    );
}

export default AppVersion;