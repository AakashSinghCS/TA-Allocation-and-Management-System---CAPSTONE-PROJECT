import { CheckCircle } from "lucide-react";

export function StatusIndicator({ loading }: { loading: boolean }) {
  return (
    <div className="flex items-center justify-center self-center">
      {loading ? (
        <div
          className="
            animate-spin
            rounded-full
            h-6 w-6
            border-2
            border-blue-600
            border-t-transparent
          "
        />
      ) : (
        <></>
        // <div className="relative group">
        //   <CheckCircle
        //     className="text-green-500 hover:text-green-600"
        //     size={24}
        //     strokeWidth={2}
        //   />
        //   <span className="
        //     absolute
        //     bottom-full left-1/2
        //     -translate-x-1/2 mb-2
        //     bg-gray-800 text-white text-xs
        //     px-2 py-1 rounded
        //     opacity-0 group-hover:opacity-100
        //     transition-opacity whitespace-nowrap
        //     z-10
        //   ">
        //     Search Completed
        //   </span>
        // </div>
      )}
    </div>
  );
}
