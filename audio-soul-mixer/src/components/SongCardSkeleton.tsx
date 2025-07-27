import { Skeleton } from "./ui/skeleton";

const SongCardSkeleton = () => {
  return (
    <div className="rounded-lg p-4">
      <div className="relative mb-3">
        <Skeleton className="w-full aspect-square rounded-md" />
      </div>
      
      <div className="space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
};

export default SongCardSkeleton; 