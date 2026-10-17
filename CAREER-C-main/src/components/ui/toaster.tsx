"use client";

import { Toast } from "@base-ui/react/toast";

export function Toaster() {
  return (
    <Toast.Provider>
      <Toast.Viewport className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 w-80 outline-none" />
    </Toast.Provider>
  );
}
