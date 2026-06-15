import {
    Component
}
from "react";

import type {
    ErrorInfo,
    ReactNode
}
from "react";

interface Props
{
    children: ReactNode;
}

interface State
{
    hasError: boolean;
}

class ErrorBoundary
extends Component<Props, State>
{
    constructor(props: Props)
    {
        super(props);

        this.state =
        {
            hasError: false
        };
    }

    static getDerivedStateFromError()
    {
        return {
            hasError: true
        };
    }

    componentDidCatch(
        error: Error,
        errorInfo: ErrorInfo
    )
    {
        console.error(
            "Application Error",
            error,
            errorInfo
        );
    }

    render()
    {
        if(
            this.state.hasError
        )
        {
            return (

                <div
                    className="
                    d-flex
                    justify-content-center
                    align-items-center"
                    style={{
                        height:"100vh"
                    }}
                >

                    <div
                        className="
                        text-center"
                    >

                        <h1>
                            Oops!
                        </h1>

                        <p>
                            Something went wrong.
                        </p>

                        <button
                            className="
                            btn btn-primary"
                            onClick={() =>
                                window.location.reload()
                            }
                        >
                            Reload
                        </button>

                    </div>

                </div>

            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
