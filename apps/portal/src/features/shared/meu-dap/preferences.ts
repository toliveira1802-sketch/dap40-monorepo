import {
  MEU_DAP_WIDGETS,
  type MeuDapWidgetDef,
  type MeuDapWidgetId,
  type MeuDapWidgetPrefs,
} from "./catalog";

const STORAGE_PREFIX = "dap-meu-dap-prefs:";

function storageKey(userId: string) {
  return `${STORAGE_PREFIX}${userId}`;
}

export function defaultPrefs(): MeuDapWidgetPrefs {
  return {
    hidden: MEU_DAP_WIDGETS.filter(w => !w.defaultVisible).map(w => w.id),
    order: [...MEU_DAP_WIDGETS]
      .sort((a, b) => a.defaultOrder - b.defaultOrder)
      .map(w => w.id),
  };
}

export function loadPrefs(userId: string): MeuDapWidgetPrefs {
  const fallback = defaultPrefs();
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as Partial<MeuDapWidgetPrefs>;
    const known = new Set(MEU_DAP_WIDGETS.map(w => w.id));
    const hidden = (parsed.hidden ?? []).filter((id): id is MeuDapWidgetId =>
      known.has(id as MeuDapWidgetId)
    );
    const order = (parsed.order ?? []).filter((id): id is MeuDapWidgetId =>
      known.has(id as MeuDapWidgetId)
    );
    for (const w of MEU_DAP_WIDGETS) {
      if (!order.includes(w.id)) order.push(w.id);
    }
    return { hidden, order };
  } catch {
    return fallback;
  }
}

export function savePrefs(userId: string, prefs: MeuDapWidgetPrefs): void {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(prefs));
  } catch {
    /* ignore quota / private mode */
  }
}

export function resolveVisibleWidgets(
  prefs: MeuDapWidgetPrefs
): MeuDapWidgetDef[] {
  const hidden = new Set(prefs.hidden);
  const byId = new Map(MEU_DAP_WIDGETS.map(w => [w.id, w]));
  const ordered: MeuDapWidgetDef[] = [];
  for (const id of prefs.order) {
    const def = byId.get(id);
    if (def && !hidden.has(id)) ordered.push(def);
  }
  for (const def of MEU_DAP_WIDGETS) {
    if (!hidden.has(def.id) && !ordered.some(w => w.id === def.id)) {
      ordered.push(def);
    }
  }
  return ordered;
}

export function toggleWidgetVisible(
  prefs: MeuDapWidgetPrefs,
  id: MeuDapWidgetId,
  visible: boolean
): MeuDapWidgetPrefs {
  const hidden = new Set(prefs.hidden);
  if (visible) hidden.delete(id);
  else hidden.add(id);
  return { ...prefs, hidden: [...hidden] };
}

export function moveWidget(
  prefs: MeuDapWidgetPrefs,
  id: MeuDapWidgetId,
  direction: "up" | "down"
): MeuDapWidgetPrefs {
  const order = [...prefs.order];
  const idx = order.indexOf(id);
  if (idx < 0) return prefs;
  const swap = direction === "up" ? idx - 1 : idx + 1;
  if (swap < 0 || swap >= order.length) return prefs;
  [order[idx], order[swap]] = [order[swap], order[idx]];
  return { ...prefs, order };
}
