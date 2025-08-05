"use client";

import Footer from "@/components/Footer";
import NonDashboardSidebar from "./ScoreCardSidebar";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex flex-col h-screen  w-full">
      <div className="flex w-full h-full">
        <NonDashboardSidebar />
        <div className="flex flex-col h-full w-full ">
          <main className="bg-white-50 w-full h-full overflow-y-scroll ">{children}</main>
        </div>
      </div>
    </div>
  );
}
