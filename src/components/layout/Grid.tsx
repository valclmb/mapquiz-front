import { cn } from "@/lib/utils";

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-grow w-11/12 mx-auto min-h-screen  lg:max-w-10/12   py-6  bg-background ">
      <div
        className={cn(
          "absolute inset-0 h-full",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <div className="z-20 w-full pt-16 flex flex-col md:justify-between">
        {children}
      </div>
    </div>
  );
}
