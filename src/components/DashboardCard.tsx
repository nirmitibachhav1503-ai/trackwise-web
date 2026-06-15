interface Props {

    title: string;

    value: string | number;
}

function DashboardCard({
    title,
    value
}: Props)
{
    return (

        <div
            className="
            col-md-4"
        >

            <div
                className="
                card
                shadow-sm
                border-0"
            >

                <div
                    className="
                    card-body"
                >

                    <h6
                        className="
                        text-muted"
                    >
                        {title}
                    </h6>

                    <h2>
                        {value}
                    </h2>

                </div>

            </div>

        </div>
    );
}

export default DashboardCard;