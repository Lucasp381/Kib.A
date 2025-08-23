import { Skeleton } from "@/components/ui/skeleton";

export default function LoadingSkeleton() {

    return (
        <div className="w-screen h-screen flex flex-col items-center justify-center gap-4">
            <Skeleton className="w-[80%] h-[50%] rounded-xl" /> {/* Contenu */}
            <Skeleton className="w-[80%] h-80 rounded-xl" /> {/* Contenu */}
        </div>
    );
}