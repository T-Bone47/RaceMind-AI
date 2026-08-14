export const manifest = {
  screens: {
    scr_kxe6ij: { name: "Dashboard", route: "/", position: { "x": 160, "y": 220 } },
    scr_tg4n31: { name: "Live Telemetry", route: "/telemetry", position: { "x": 160, "y": 2200 } },
    scr_q4g8ai: { name: "Ollie", route: "/voice", position: { "x": 1560, "y": 2200 } },
    scr_gl8rkc: { name: "Race Strategy", route: "/strategy", position: { "x": 2960, "y": 2200 } },
    scr_a5b72i: { name: "Driver Analytics", route: "/analytics", position: { "x": 160, "y": 4180 } },
    scr_fqdamn: { name: "Setups · Library", route: "/setups", state: { "tab": "library" }, position: { "x": 160, "y": 6160 } },
    scr_j8a85i: { name: "Setups · Setup Sheet", route: "/setups", state: { "tab": "setup" }, position: { "x": 1560, "y": 6160 } },
    scr_rf4ddw: { name: "Setups · Analysis", route: "/setups", state: { "tab": "analysis" }, position: { "x": 2960, "y": 6160 } },
    scr_xrt2pe: { name: "Setups · Documents", route: "/setups", state: { "tab": "documents" }, position: { "x": 4360, "y": 6160 } },
    scr_tb08ot: { name: "AI Insights", route: "/insights", position: { "x": 1560, "y": 4180 } },
    scr_le801p: { name: "Session History", route: "/history", position: { "x": 2960, "y": 4180 } },
    scr_1es9o2: { name: "Reports", route: "/reports", position: { "x": 4360, "y": 4180 } },
    scr_vkszxj: { name: "Settings · Profile", route: "/settings", state: { "active": "profile" }, position: { "x": 160, "y": 8140 } },
    scr_pll969: { name: "Settings · AI & Voice", route: "/settings", state: { "active": "intelligence" }, position: { "x": 1560, "y": 8140 } },
    scr_fx7jas: { name: "Settings · Interface", route: "/settings", state: { "active": "interface" }, position: { "x": 2960, "y": 8140 } },
    scr_2n3pps: { name: "Settings · Data & System", route: "/settings", state: { "active": "system" }, position: { "x": 4360, "y": 8140 } }
  },
  sections: {
    sec_o8wc4r: { name: "Dashboard", x: 0, y: 0, width: 1520, height: 1180 },
    sec_erf8tr: { name: "Race Operations", x: 0, y: 1980, width: 4320, height: 1180 },
    sec_ph5up1: { name: "Performance Analysis", x: 0, y: 3960, width: 5720, height: 1180 },
    sec_yt3vto: { name: "Vehicle Setups", x: 0, y: 5940, width: 5720, height: 1180 },
    sec_o9w5u1: { name: "Settings", x: 0, y: 7920, width: 5720, height: 1180 }
  },
  layers: [
  { kind: "section", id: "sec_o8wc4r", children: [
    { kind: "screen", id: "scr_kxe6ij" }]
  },
  { kind: "section", id: "sec_erf8tr", children: [
    { kind: "screen", id: "scr_tg4n31" },
    { kind: "screen", id: "scr_q4g8ai" },
    { kind: "screen", id: "scr_gl8rkc" }]
  },
  { kind: "section", id: "sec_ph5up1", children: [
    { kind: "screen", id: "scr_a5b72i" },
    { kind: "screen", id: "scr_tb08ot" },
    { kind: "screen", id: "scr_le801p" },
    { kind: "screen", id: "scr_1es9o2" }]
  },
  { kind: "section", id: "sec_yt3vto", children: [
    { kind: "screen", id: "scr_fqdamn" },
    { kind: "screen", id: "scr_j8a85i" },
    { kind: "screen", id: "scr_rf4ddw" },
    { kind: "screen", id: "scr_xrt2pe" }]
  },
  { kind: "section", id: "sec_o9w5u1", children: [
    { kind: "screen", id: "scr_vkszxj" },
    { kind: "screen", id: "scr_pll969" },
    { kind: "screen", id: "scr_fx7jas" },
    { kind: "screen", id: "scr_2n3pps" }]
  }]

};