import React from "react";

const Loading = () => {
  return (
    <div className="flex justify-center items-center h-full">
      <div className="relative w-8 h-8">
        {/* Grey static circle */}
        <div className="absolute inset-0 rounded-full" />

        {/* Green spinning circle */}
        <div className="absolute inset-0 border-4 border-filgrey border-t-gren rounded-full animate-spin" />
      </div>
    </div>
  );
};

export default Loading;
