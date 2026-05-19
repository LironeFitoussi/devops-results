import { describe, expect, it } from "vitest";
import { getSidebarMenuItems, routeConfig } from "./routesConfig";

describe("sidebar role filtering", () => {
  it("shows admin student management only for admins", () => {
    const labels = getSidebarMenuItems(routeConfig, true, "admin").map(
      (item) => item.label,
    );

    expect(labels).toContain("Students");
    expect(labels).not.toContain("Dashboard");
  });

  it("shows the student dashboard only for students", () => {
    const labels = getSidebarMenuItems(routeConfig, true, "student").map(
      (item) => item.label,
    );

    expect(labels).toContain("Dashboard");
    expect(labels).not.toContain("Students");
    expect(labels).not.toContain("Google Forms");
  });
});
