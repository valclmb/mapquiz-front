import { cn } from "@/lib/utils";
import React from "react";

interface AvatarProps {
  user: {
    image?: string | null;
    name: string;
    isOnline?: boolean;
  };
}

export const Avatar: React.FC<AvatarProps> = ({ user }) => {
  console.log(user);
  return (
    <div className="relative">
      {user.image ? (
        <div className="w-8 h-8 rounded-full overflow-hidden">
          <img
            src={user.image}
            alt={user.name}
            className="w-full h-full object-cover"
          />
        </div>
      ) : (
        <div
          className={cn(
            "w-8 h-8 rounded-full flex items-center justify-center text-primary-foreground bg-primary"
          )}
        >
          {user.name.charAt(0)}
        </div>
      )}
      <div
        className={cn(
          "absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white",
          user.isOnline ? "bg-green-500" : "bg-gray-400"
        )}
        title={user.isOnline ? "En ligne" : "Hors ligne"}
      />
    </div>
  );
};
