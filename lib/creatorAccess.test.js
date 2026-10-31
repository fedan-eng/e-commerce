import { beforeEach, describe, expect, it, vi } from "vitest";

const users = {};
const promoFind = vi.fn();
const promoFindOne = vi.fn();
vi.mock("@/lib/db", () => ({ connectDB: vi.fn() }));
vi.mock("@/lib/auth", () => ({ verifyToken: (t) => (t ? JSON.parse(t) : null) }));
vi.mock("@/models/User", () => ({
  default: { findById: (id) => ({ select: () => ({ lean: async () => users[id] || null }) }) },
}));
vi.mock("@/models/PromoCode", () => ({
  default: {
    find: (q) => ({ sort: () => ({ lean: async () => promoFind(q) }) }),
    findOne: (q) => ({ collation: () => ({ lean: async () => promoFindOne(q) }) }),
  },
}));
const { creatorAccess } = await import("./creatorAccess");

const req = (session, url = "https://fil.test/api/creator/dashboard") => ({
  url,
  cookies: { get: () => (session ? { value: JSON.stringify(session) } : undefined) },
});

beforeEach(() => {
  promoFind.mockReset().mockReturnValue([{ code: "DAMMY10" }]);
  promoFindOne.mockReset().mockReturnValue({ code: "TOLU5" });
  Object.assign(users, {
    c1: { _id: "c1", role: "creator" },
    u1: { _id: "u1", role: "user" },
    a1: { _id: "a1", role: "admin" },
    off: { _id: "off", role: "creator", isActive: false },
  });
});

describe("creatorAccess", () => {
  it("needs a session", async () => {
    expect((await creatorAccess(req(null))).denied.status).toBe(401);
  });

  it("reads the role from the database, not the token", async () => {
    // Token still says creator, but an admin switched them back to a customer
    expect((await creatorAccess(req({ id: "u1", role: "creator" }))).denied.status).toBe(403);
    // Token says user, but they were just made a creator
    expect((await creatorAccess(req({ id: "c1", role: "user" }))).promos).toEqual([{ code: "DAMMY10" }]);
  });

  it("only gives a creator the codes linked to them, ignoring ?code=", async () => {
    const r = await creatorAccess(req({ id: "c1" }, "https://fil.test/api/creator/dashboard?code=TOLU5"));
    expect(promoFind).toHaveBeenCalledWith({ type: "creator", creatorUser: "c1" });
    expect(promoFindOne).not.toHaveBeenCalled();
    expect(r).toMatchObject({ asAdmin: false, promos: [{ code: "DAMMY10" }] });
  });

  it("blocks suspended accounts", async () => {
    expect((await creatorAccess(req({ id: "off" }))).denied.status).toBe(401);
  });

  it("lets admins open any creator's dashboard by code", async () => {
    const r = await creatorAccess(req({ id: "a1" }, "https://fil.test/api/creator/dashboard?code=tolu5"));
    expect(promoFindOne).toHaveBeenCalledWith({ code: "TOLU5", type: "creator" });
    expect(r).toMatchObject({ asAdmin: true, promos: [{ code: "TOLU5" }] });
    expect((await creatorAccess(req({ id: "a1" }))).denied.status).toBe(400);
  });
});
