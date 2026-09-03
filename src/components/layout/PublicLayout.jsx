import React from "react";
import { Outlet } from "react-router-dom";

import Header from "../navigation/Header";
import BreakingTicker from "../navigation/BreakingTicker";
import Footer from "../navigation/Footer";

export default function PublicLayout() {
  return (
    <div className="app-shell">

      <Header />

      <BreakingTicker />

      <main className="page-container">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
}