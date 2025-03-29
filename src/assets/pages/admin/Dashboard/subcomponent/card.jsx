const MetricCard = ({title, stat}) => {
    return (
        <div className="justify-items-center mb-4 py-4">
            <div className="flex flex-col items-center">
                <p className="text-2xl">{stat}</p>
                <p className="text-lg text-gray-500">{title}</p>                
            </div>
        </div>
    );
}

export default MetricCard