type LoadingScreenProps = {
    message?: string;
    fullScreen?: boolean;
    size?: "sm" | "md" | "lg";
};

export default function LoadingScreen({
    message = "Loading...",
    fullScreen = true,
    size = "md",
}: LoadingScreenProps) {
    const spinnerSize = {
        sm: "w-8 h-8 border-2",
        md: "w-16 h-16 border-4",
        lg: "w-24 h-24 border-4",
    };

    return (
        <div
            className={`flex flex-col items-center justify-center gap-4 ${
                fullScreen ? "min-h-screen" : "h-full"
            }`}
        >
            <div
                className={`
                    ${spinnerSize[size]}
                    border-blue-500
                    border-t-transparent
                    rounded-full
                    animate-spin
                `}
            />

            {message && (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {message}
                </p>
            )}
        </div>
    );
}