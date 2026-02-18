import { Button } from "@/components/ui/button";
import React from "react";

export default function AddButton({
  children,
  ...rest
}: {
  children: React.ReactNode;
}) {
  return (
    <Button
      {...rest}
      className="rounded-full bg-[#00B48D] text-white hover:bg-[#00B48D]/90 cursor-pointer transition duration-200"
    >
      {children}
    </Button>
  );
}
