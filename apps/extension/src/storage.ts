const STORAGE_KEY = 'shelfr_selected_collection';

export async function getSelectedCollection(): Promise<string | null> {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result[STORAGE_KEY] ?? null;
}

export async function setSelectedCollection(
  collectionId: string
): Promise<void> {
  await chrome.storage.local.set({ [STORAGE_KEY]: collectionId });
}
