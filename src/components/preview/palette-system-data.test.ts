import {
  iphone17ProCanvasSpec,
  paletteSystemsPreviewSpec,
  pearlDawnDetailedPreviewSpec,
  screenBlueprints,
} from "./palette-system-data";

describe("palette system preview data", () => {
  it("defines five palette systems with complete token maps", () => {
    expect(paletteSystemsPreviewSpec).toHaveLength(5);

    paletteSystemsPreviewSpec.forEach((spec) => {
      expect(spec.palette.appBg).toBeTruthy();
      expect(spec.palette.topBarBg).toBeTruthy();
      expect(spec.palette.topBarBorder).toBeTruthy();
      expect(spec.palette.panelBg).toBeTruthy();
      expect(spec.palette.panelAltBg).toBeTruthy();
      expect(spec.palette.cardBg).toBeTruthy();
      expect(spec.palette.cardSoftBg).toBeTruthy();
      expect(spec.palette.anchor).toBeTruthy();
      expect(spec.palette.anchorSoft).toBeTruthy();
      expect(spec.palette.anchorContrast).toBeTruthy();
      expect(spec.palette.joyAccent).toBeTruthy();
      expect(spec.palette.joyAccentSoft).toBeTruthy();
      expect(spec.palette.joySurface).toBeTruthy();
      expect(spec.palette.joyHighlight).toBeTruthy();
      expect(spec.palette.cloudyAccent).toBeTruthy();
      expect(spec.palette.cloudyAccentSoft).toBeTruthy();
      expect(spec.palette.cloudySurface).toBeTruthy();
      expect(spec.palette.cloudyHighlight).toBeTruthy();
      expect(spec.palette.navBg).toBeTruthy();
      expect(spec.palette.navActiveBg).toBeTruthy();
      expect(spec.palette.focusRing).toBeTruthy();
      expect(spec.palette.textStrong).toBeTruthy();
      expect(spec.palette.textMuted).toBeTruthy();
      expect(spec.palette.borderSoft).toBeTruthy();
      expect(spec.palette.shadowColor).toBeTruthy();
      expect(spec.screens).toHaveLength(8);
    });
  });

  it("keeps the shared blueprint registry aligned with every palette variant", () => {
    expect(screenBlueprints).toHaveLength(8);

    paletteSystemsPreviewSpec.forEach((spec) => {
      expect(spec.screens.map((screen) => screen.id)).toEqual(
        screenBlueprints.map((screen) => screen.id),
      );
    });
  });

  it("defines the iPhone 17 Pro canvas contract and three Pearl Dawn detail directions", () => {
    expect(iphone17ProCanvasSpec.id).toBe("iphone-17-pro");
    expect(iphone17ProCanvasSpec.width).toBe(402);
    expect(iphone17ProCanvasSpec.height).toBe(874);
    expect(iphone17ProCanvasSpec.safeTop).toBe(59);
    expect(iphone17ProCanvasSpec.safeSide).toBe(14);
    expect(iphone17ProCanvasSpec.safeBottom).toBe(34);

    expect(pearlDawnDetailedPreviewSpec).toHaveLength(3);

    pearlDawnDetailedPreviewSpec.forEach((direction) => {
      expect(direction.palette.anchor).toBeTruthy();
      expect(direction.screens).toHaveLength(8);
      expect(direction.screens.map((screen) => screen.id)).toEqual(
        screenBlueprints.map((screen) => screen.id),
      );
    });
  });
});
