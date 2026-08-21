import dotenv from "dotenv";
import { cert, getApps, initializeApp } from "firebase-admin/app";
import { getFirestore, type DocumentData, type DocumentReference } from "firebase-admin/firestore";
import { getStorage } from "firebase-admin/storage";

dotenv.config();

export interface PersistentSnapshot {
  appSettings: {
    loginRequired: boolean;
    customLogo: string;
    contactAdmin: {
      email: string;
      phone: string;
      description: string;
      displayStyle: "card_green" | "card_dual";
    };
  };
  adminPassword: string;
  users: unknown[];
  registrationRequests: unknown[];
  analyses: unknown[];
  medicines: unknown[];
  diseases: unknown[];
  supportedCrops?: unknown[];
  _legacy?: boolean;
}

let firestore: ReturnType<typeof getFirestore> | null = null;
let storageBucket: ReturnType<ReturnType<typeof getStorage>["bucket"]> | null = null;

try {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  const serviceAccount = serviceAccountBase64
    ? JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf8"))
    : null;
  const projectId = process.env.FIREBASE_PROJECT_ID?.trim() || serviceAccount?.project_id || "";

  const firebaseApp = serviceAccount
    ? (getApps()[0] || initializeApp({
        credential: cert(serviceAccount),
        projectId,
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET?.trim() || undefined,
      }))
    : null;

  firestore = firebaseApp ? getFirestore(firebaseApp) : null;

  if (firebaseApp) {
    const bucketName = process.env.FIREBASE_STORAGE_BUCKET?.trim() || (projectId ? `${projectId}.appspot.com` : "");
    storageBucket = bucketName ? getStorage(firebaseApp).bucket(bucketName) : getStorage(firebaseApp).bucket();
  }
} catch (error) {
  console.error("Firebase persistence initialization failed", error instanceof Error ? error.message : "Unknown error");
}

export const persistenceConfigured = Boolean(firestore);
export const storageConfigured = Boolean(storageBucket);

const rootCollection = () => firestore!.collection("easydiseay");
const collectionDocs = {
  settings: "settings",
  users: "users",
  registrationRequests: "registrationRequests",
  analyses: "analyses",
  medicines: "medicines",
  diseases: "diseases",
  supportedCrops: "supportedCrops",
};

export const loadPersistentSnapshot = async (): Promise<PersistentSnapshot | null> => {
  if (!firestore) return null;
  const root = rootCollection();
  const [settingsSnap, usersSnap, requestsSnap, analysesSnap, medicinesSnap, diseasesSnap, cropsSnap, legacyStateSnap] =
    await Promise.all([
      root.doc(collectionDocs.settings).get(),
      root.doc(collectionDocs.users).collection("items").get(),
      root.doc(collectionDocs.registrationRequests).collection("items").get(),
      root.doc(collectionDocs.analyses).collection("items").get(),
      root.doc(collectionDocs.medicines).collection("items").get(),
      root.doc(collectionDocs.diseases).collection("items").get(),
      root.doc(collectionDocs.supportedCrops).collection("items").get(),
      root.doc("state").get(),
    ]);

  if (!settingsSnap.exists && usersSnap.empty && requestsSnap.empty && analysesSnap.empty &&
      medicinesSnap.empty && diseasesSnap.empty && cropsSnap.empty) {
    if (!legacyStateSnap.exists) return null;
    return { ...(legacyStateSnap.data() as PersistentSnapshot), _legacy: true };
  }

  const settings = settingsSnap.exists ? settingsSnap.data() as Partial<PersistentSnapshot> & { adminPassword?: string } : {};
  return {
    appSettings: settings.appSettings as PersistentSnapshot["appSettings"],
    adminPassword: String(settings.adminPassword || ""),
    users: usersSnap.docs.map((doc) => doc.data()),
    registrationRequests: requestsSnap.docs.map((doc) => doc.data()),
    analyses: analysesSnap.docs.map((doc) => doc.data()),
    medicines: medicinesSnap.docs.map((doc) => doc.data()),
    diseases: diseasesSnap.docs.map((doc) => doc.data()),
    supportedCrops: cropsSnap.docs.map((doc) => doc.data()),
  };
};

const replaceCollection = async (name: string, items: unknown[]) => {
  const collection = rootCollection().doc(name).collection("items");
  const existing = await collection.get();
  const operations: Array<{ type: "delete" | "set"; ref: DocumentReference; data?: DocumentData }> = [];
  existing.docs.forEach((doc) => operations.push({ type: "delete", ref: doc.ref }));
  for (const item of items) {
    const value = item as Record<string, unknown>;
    const id = String(value.id || `item-${Date.now()}-${Math.random().toString(36).slice(2)}`);
    operations.push({ type: "set", ref: collection.doc(id), data: value });
  }
  for (let i = 0; i < operations.length; i += 450) {
    const batch = firestore!.batch();
    for (const operation of operations.slice(i, i + 450)) {
      if (operation.type === "delete") batch.delete(operation.ref);
      else batch.set(operation.ref, operation.data || {});
    }
    await batch.commit();
  }
};

export const savePersistentSnapshot = async (snapshot: PersistentSnapshot): Promise<void> => {
  if (!firestore) return;
  await rootCollection().doc(collectionDocs.settings).set({
    appSettings: snapshot.appSettings,
    adminPassword: snapshot.adminPassword,
    updatedAt: new Date().toISOString(),
  });
  await Promise.all([
    replaceCollection(collectionDocs.users, snapshot.users),
    replaceCollection(collectionDocs.registrationRequests, snapshot.registrationRequests),
    replaceCollection(collectionDocs.analyses, snapshot.analyses),
    replaceCollection(collectionDocs.medicines, snapshot.medicines),
    replaceCollection(collectionDocs.diseases, snapshot.diseases),
    replaceCollection(collectionDocs.supportedCrops, snapshot.supportedCrops || []),
  ]);
};

export const upsertPersistentItem = async (collectionName: keyof typeof collectionDocs, item: Record<string, unknown>): Promise<void> => {
  if (!firestore) return;
  const id = String(item.id || "");
  if (!id) throw new Error("Persistent item requires an id.");
  await rootCollection().doc(collectionDocs[collectionName]).collection("items").doc(id).set(item);
};

export const deletePersistentItem = async (collectionName: keyof typeof collectionDocs, id: string): Promise<void> => {
  if (!firestore) return;
  await rootCollection().doc(collectionDocs[collectionName]).collection("items").doc(id).delete();
};

export const updatePersistentSettings = async (patch: Record<string, unknown>): Promise<void> => {
  if (!firestore) return;
  const ref = rootCollection().doc(collectionDocs.settings);
  const flat: Record<string, unknown> = { updatedAt: new Date().toISOString() };
  for (const [key, value] of Object.entries(patch)) {
    if (key === "appSettings" && value && typeof value === "object") {
      for (const [settingKey, settingValue] of Object.entries(value as Record<string, unknown>)) {
        flat[`appSettings.${settingKey}`] = settingValue;
      }
    } else flat[key] = value;
  }
  try {
    await ref.update(flat);
  } catch (error: unknown) {
    if ((error as { code?: number })?.code !== 5) throw error;
    await ref.set(flat, { merge: true });
  }
};

export const getPersistentSettings = async (): Promise<Partial<PersistentSnapshot["appSettings"]> & { adminPassword?: string } | null> => {
  if (!firestore) return null;
  const snap = await rootCollection().doc(collectionDocs.settings).get();
  return snap.exists ? snap.data() as Partial<PersistentSnapshot["appSettings"]> & { adminPassword?: string } : null;
};

export const getPersistentUser = async (userId: string): Promise<Record<string, unknown> | null> => {
  if (!firestore) return null;
  const snap = await rootCollection().doc(collectionDocs.users).collection("items").where("userId", "==", userId).limit(1).get();
  return snap.empty ? null : snap.docs[0].data() as Record<string, unknown>;
};

const parseDataUrl = (dataUrl: string) => {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) throw new Error("Invalid image data.");
  return { contentType: match[1], data: Buffer.from(match[2], "base64") };
};

export const uploadDataUrl = async (dataUrl: string, folder: "logos" | "crops", extensionHint = "png"): Promise<string> => {
  if (!storageBucket) throw new Error("Firebase Storage is not configured.");
  const { contentType, data } = parseDataUrl(dataUrl);
  if (data.length > 8 * 1024 * 1024) throw new Error("Uploaded image exceeds the 8MB limit.");
  const safeExt = extensionHint.replace(/[^a-z0-9]/gi, "").slice(0, 8) || "png";
  const file = storageBucket.file(`easydiseay/${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${safeExt}`);
  await file.save(data, {
    resumable: false,
    metadata: { contentType, cacheControl: "public,max-age=31536000,immutable" },
  });
  const [url] = await file.getSignedUrl({ action: "read", expires: "2036-01-01" });
  return url;
};
