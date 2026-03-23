import { describe, expect, it } from "vitest";
import { normalizeAuthErrorMessage } from "./app-logic";

describe("normalizeAuthErrorMessage", () => {
  it("converts invalid login messages into a clearer prompt", () => {
    expect(normalizeAuthErrorMessage("Invalid login credentials")).toBe(
      "邮箱或密码不正确，请检查后重试",
    );
  });

  it("converts duplicate signup messages into a login hint", () => {
    expect(normalizeAuthErrorMessage("User already registered")).toBe(
      "这个邮箱已经注册过了，请直接登录",
    );
  });

  it("converts unconfirmed email messages into a verification hint", () => {
    expect(normalizeAuthErrorMessage("Email not confirmed")).toBe(
      "请先前往邮箱完成验证，再回来登录",
    );
  });

  it("converts low-level network messages into a stable Chinese fallback", () => {
    expect(normalizeAuthErrorMessage("fetch failed")).toBe(
      "网络连接不稳定，请稍后再试",
    );
  });

  it("falls back to a generic Chinese prompt for unknown errors", () => {
    expect(normalizeAuthErrorMessage("Something else")).toBe(
      "登录暂时失败，请稍后再试",
    );
  });
});
