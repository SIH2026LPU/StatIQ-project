import { syncHtmlCatalogue } from "./index";

export async function syncEsankhyiki() {
  return syncHtmlCatalogue("esankhyiki", "Official statistics catalogue", "Macro");
}
