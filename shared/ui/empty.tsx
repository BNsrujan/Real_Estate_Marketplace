import Image from "next/image";


export default function EmptyState({
    title,
    description,
    imageSrc,
}: {
    title: string;
    description: string;
    imageSrc: string;
}) {
    return (
        <div className="flex flex-col items-center justify-center gap-4 py-20">
            <Image
                src={imageSrc}
                alt="Empty state"
                width={200}
                height={200}
                className="object-contain"
            />
            <h2 className="text-2xl font-semibold">{title}</h2>
            <p className="text-gray-500">{description}</p>
        </div>
    );
}
