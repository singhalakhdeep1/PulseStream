import { describe, expect, it } from "vitest";
import { formatCount, getInitials, extractHashtags, extractMentions, truncate } from "@/lib/utils";

describe("formatCount", () => {
    it("formats values under 1000 as-is", () => {
        expect(formatCount(999)).toBe("999");
    });
    it("formats thousands as K", () => {
        expect(formatCount(1500)).toBe("1.5K");
    });
    it("formats millions as M", () => {
        expect(formatCount(2_500_000)).toBe("2.5M");
    });
});

describe("getInitials", () => {
    it("returns first letter for single name", () => {
        expect(getInitials("Alice")).toBe("A");
    });
    it("returns first + last initials for full name", () => {
        expect(getInitials("Alice Bob")).toBe("AB");
    });
    it("returns ? for empty string", () => {
        expect(getInitials("")).toBe("?");
    });
});

describe("extractHashtags", () => {
    it("extracts hashtags from text", () => {
        expect(extractHashtags("Hello #world #nextjs")).toEqual(["world", "nextjs"]);
    });
    it("deduplicates", () => {
        expect(extractHashtags("#a #a")).toEqual(["a"]);
    });
});

describe("extractMentions", () => {
    it("extracts @mentions", () => {
        expect(extractMentions("Hey @alice and @bob")).toEqual(["alice", "bob"]);
    });
});

describe("truncate", () => {
    it("returns text unchanged if within limit", () => {
        expect(truncate("short", 10)).toBe("short");
    });
    it("truncates with ellipsis", () => {
        expect(truncate("hello world", 5)).toBe("hello…");
    });
});
