/**
 * Google Fonts読み込みライブラリ（Canvas描画用）
 */

export interface FontLoadOptions {
  familyName: string;
  weights?: string[];
  subsets?: string[];
}

export class GoogleFontsLoader {
  private static readonly API_URL = "https://fonts.googleapis.com/css2";
  private static loadedFonts = new Set<string>();
  private static loadingFonts = new Map<string, Promise<void>>();

  static async loadGoogleFont(options: FontLoadOptions): Promise<void> {
    const { familyName, weights = ["400"], subsets = ["latin"] } = options;
    const fontKey = `${familyName}_${weights.join(",")}_${subsets.join(",")}`;

    if (this.loadedFonts.has(fontKey)) return;
    if (this.loadingFonts.has(fontKey)) {
      return await this.loadingFonts.get(fontKey)!;
    }

    const loadPromise = this.performFontLoad(familyName, weights, subsets, fontKey);
    this.loadingFonts.set(fontKey, loadPromise);

    try {
      await loadPromise;
    } finally {
      this.loadingFonts.delete(fontKey);
    }
  }

  private static async performFontLoad(
    familyName: string,
    weights: string[],
    subsets: string[],
    fontKey: string
  ): Promise<void> {
    const url = this.buildGoogleFontsURL(familyName, weights, subsets);
    const response = await fetch(url);

    if (!response.ok) throw new Error(`HTTP ${response.status}`);

    const css = await response.text();
    const fontUrls = css.match(/url\([^)]+\)/g);

    if (!fontUrls) throw new Error("No font URLs found");

    const fontPromises = fontUrls.map(async (urlMatch, index) => {
      const url = urlMatch.slice(4, -1).replace(/['"]/g, "");
      const weight = weights[index % weights.length];
      const font = new FontFace(familyName, `url(${url})`, { weight });
      await font.load();
      document.fonts.add(font);
    });

    await Promise.all(fontPromises);
    this.loadedFonts.add(fontKey);
  }

  private static buildGoogleFontsURL(
    familyName: string,
    weights: string[],
    subsets: string[]
  ): string {
    const family = familyName.replace(/ /g, "+");
    let url = `${this.API_URL}?family=${family}:wght@${weights.join(
      ";"
    )}&display=swap`;
    if (subsets.length > 0) url += `&subset=${subsets.join(",")}`;
    return url;
  }
}

export default GoogleFontsLoader;
