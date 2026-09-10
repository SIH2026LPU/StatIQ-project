import { describe, expect, it } from "vitest";
import { generateWorld } from "@/db/world";

describe("synthetic world generator", () => {
  it("meets full-scale volume targets", () => {
    const world = generateWorld("full");
    expect(world.users.length).toBeGreaterThanOrEqual(50);
    expect(world.employees.length).toBe(1000);
    expect(world.departments.length).toBe(20);
    expect(world.jobRoles.length).toBe(50);
    expect(world.competencies.length).toBe(100);
    expect(world.courses.length).toBe(200);
    expect(world.programmes.length).toBe(50);
    expect(world.employeeCompetencies.length).toBeGreaterThanOrEqual(5000);
    expect(world.courseCompetencies.length).toBeGreaterThanOrEqual(500);
    expect(world.roleCompetencies.length).toBeGreaterThanOrEqual(500);
  });
});
