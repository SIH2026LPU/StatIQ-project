import { syncHtmlCatalogue } from "./index";

export async function syncNssta() {
  return syncHtmlCatalogue("nssta", "Training programmes", "Training");
}
