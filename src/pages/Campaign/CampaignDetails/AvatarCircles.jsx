import { cn } from '../../../lib/utils';

export const AvatarCircles = ({ numPeople, className, avatarUrls }) => {
  const displayUrls = avatarUrls.slice(0, 3); // Max 3 avatars
  const remainingCount = Math.max(0, numPeople - 3);

  return (
    <div className={cn("z-10 flex -space-x-4 rtl:space-x-reverse", className)}>
      {displayUrls.map((url, index) => (
        <img
          key={index}
          className="h-10 w-10 rounded-full border-2 border-yellow-100"
          src={url}
          width={40}
          height={40}
          alt={`Avatar ${index + 1}`}
        />
      ))}
      {remainingCount > 0 && (
        <div className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-white bg-[#734D20] text-center text-xs font-medium text-white">
          +{remainingCount}
        </div>
      )}
    </div>
  );
};