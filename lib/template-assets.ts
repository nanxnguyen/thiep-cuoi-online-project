// Production asset manifest for the invitation catalog (spec 2026-10-04-thirty-new-templates).
// Everything under refs/ defaults to reference-only and must never ship. Only assets
// with status owned, licensed or original may live under public/templates/.

export type AssetStatus = "owned" | "licensed" | "original" | "reference-only";

export type TemplateAsset = {
  path: `/templates/${string}`;
  family: string;
  source: string;
  status: AssetStatus;
  licenseNote: string;
};

export const TEMPLATE_ASSETS: readonly TemplateAsset[] = [];

export function validateTemplateAsset(asset: TemplateAsset): void {
  if (!asset.source.trim()) throw new Error(`template asset ${asset.path} is missing its source`);
  if (asset.status === "reference-only") {
    throw new Error(`template asset ${asset.path} is reference-only and cannot ship to production`);
  }
  if (asset.status === "licensed" && !asset.licenseNote.trim()) {
    throw new Error(`licensed template asset ${asset.path} is missing its license note`);
  }
}

export function productionAssets(): TemplateAsset[] {
  const assets = TEMPLATE_ASSETS.filter((a) => a.status === "owned" || a.status === "licensed" || a.status === "original");
  for (const asset of TEMPLATE_ASSETS) validateTemplateAsset(asset);
  return [...assets];
}
