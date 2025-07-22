import { cn } from "@/lib/utils";

export function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex flex-grow w-full min-h-screen  md:mx-auto lg:max-w-10/12 md:max-w-11/12 sm:max-w-full py-5  bg-background ">
      <div
        className={cn(
          "absolute inset-0",
          "[background-size:20px_20px]",
          "[background-image:radial-gradient(#d4d4d4_1px,transparent_1px)]",
          "dark:[background-image:radial-gradient(#404040_1px,transparent_1px)]"
        )}
      />
      {/* Radial gradient for the container to give a faded look */}
      <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-background [mask-image:radial-gradient(ellipse_at_center,transparent_20%,black)]"></div>
      <main className=" z-20 size-full mt-16">{children}</main>
    </div>
  );
}
