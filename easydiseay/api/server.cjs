var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// server.ts
var server_exports = {};
__export(server_exports, {
  default: () => server_default
});
module.exports = __toCommonJS(server_exports);
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_dotenv2 = __toESM(require("dotenv"), 1);

// serverPersistence.ts
var import_dotenv = __toESM(require("dotenv"), 1);
var import_app = require("firebase-admin/app");
var import_firestore = require("firebase-admin/firestore");
import_dotenv.default.config();
var firestore = null;
try {
  const serviceAccountBase64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64?.trim();
  const serviceAccount = serviceAccountBase64 ? JSON.parse(Buffer.from(serviceAccountBase64, "base64").toString("utf8")) : null;
  const firebaseApp = serviceAccount ? (0, import_app.getApps)()[0] || (0, import_app.initializeApp)({
    credential: (0, import_app.cert)(serviceAccount),
    projectId: process.env.FIREBASE_PROJECT_ID?.trim() || serviceAccount.project_id
  }) : null;
  firestore = firebaseApp ? (0, import_firestore.getFirestore)(firebaseApp) : null;
} catch (error) {
  console.error("Firebase persistence initialization failed", error instanceof Error ? error.message : "Unknown error");
}
var stateDocument = firestore?.collection("easydiseay").doc("state") || null;
var persistenceConfigured = Boolean(stateDocument);
var loadPersistentSnapshot = async () => {
  if (!stateDocument) return null;
  const snapshot = await stateDocument.get();
  return snapshot.exists ? snapshot.data() : null;
};
var savePersistentSnapshot = async (snapshot) => {
  if (!stateDocument) return;
  await stateDocument.set(snapshot);
};

// server.ts
import_dotenv2.default.config();
var app = (0, import_express.default)();
var PORT = Number(process.env.PORT) || 3e3;
app.use(import_express.default.json({ limit: "50mb" }));
app.use(import_express.default.urlencoded({ extended: true, limit: "50mb" }));
var stateLoadedPromise = Promise.resolve();
app.use(async (_req, _res, next) => {
  await stateLoadedPromise;
  next();
});
var appSettings = {
  loginRequired: false,
  customLogo: "",
  contactAdmin: {
    email: "315222057@hamdarduniversity.edu.bd",
    phone: "+880123456789",
    description: "Forget anything send us email with mention your User ID",
    displayStyle: "card_green"
  }
};
var adminPassword = process.env.ADMIN_PASSWORD?.trim() || "admin123";
var usersStore = [];
var registrationRequestsStore = [];
var supportedCropsStore = [
  { id: "crop-cucumber", name: "Cucumber", nameBn: "\u09B6\u09B8\u09BE", imageUrl: "" },
  { id: "crop-garlic", name: "Garlic", nameBn: "\u09B0\u09B8\u09C1\u09A8", imageUrl: "" },
  { id: "crop-chili", name: "Chili", nameBn: "\u09AE\u09B0\u09BF\u099A", imageUrl: "" },
  { id: "crop-potato", name: "Potato", nameBn: "\u0986\u09B2\u09C1", imageUrl: "" },
  { id: "crop-corn", name: "Corn", nameBn: "\u09AD\u09C1\u099F\u09CD\u099F\u09BE", imageUrl: "" },
  { id: "crop-tomato", name: "Tomato", nameBn: "\u099F\u09AE\u09C7\u099F\u09CB", imageUrl: "" },
  { id: "crop-brinjal", name: "Brinjal", nameBn: "\u09AC\u09C7\u0997\u09C1\u09A8", imageUrl: "" },
  { id: "crop-jute", name: "Jute", nameBn: "\u09AA\u09BE\u099F", imageUrl: "" },
  { id: "crop-wheat", name: "Wheat", nameBn: "\u0997\u09AE", imageUrl: "" },
  { id: "crop-rice", name: "Rice", nameBn: "\u09A7\u09BE\u09A8", imageUrl: "" }
];
app.get("/api/settings", (_req, res) => {
  res.json(appSettings);
});
app.post("/api/admin/login", (req, res) => {
  if (req.body?.password !== adminPassword) {
    res.status(401).json({ error: "Invalid administrative passcode." });
    return;
  }
  res.json({ success: true, token: "admin-session" });
});
app.post("/api/user/login", (req, res) => {
  const userId = String(req.body?.userId || "").trim();
  const loginCode = String(req.body?.loginCode || "").trim();
  const registeredUser = usersStore.find((user) => user.userId === userId && user.loginCode === loginCode && user.status === "Active");
  if (registeredUser) {
    res.json({ success: true, user: registeredUser });
    return;
  }
  if (userId === "948210" && loginCode === "948210") {
    res.json({ success: true, user: { userId, fullName: "EasyDiseay User", role: "user" } });
    return;
  }
  res.status(401).json({ error: "Invalid User ID or Login Code." });
});
app.post("/api/registration-requests", async (req, res) => {
  const fullName = String(req.body?.fullName || "").trim();
  const email = String(req.body?.email || "").trim();
  if (!fullName || !email) {
    res.status(400).json({ error: "Full name and email are required." });
    return;
  }
  const request = {
    id: `req-${Date.now()}`,
    fullName,
    email,
    phone: String(req.body?.phone || "").trim(),
    notes: String(req.body?.notes || "").trim(),
    status: "pending",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  registrationRequestsStore.unshift(request);
  await persistState();
  res.json({ success: true, request });
});
app.post("/api/analytics/track", (_req, res) => {
  res.json({ success: true });
});
var analysesStore = [
  {
    id: "rec-101",
    crop: "Tomato",
    cropBn: "\u099F\u09AE\u09C7\u099F\u09CB",
    disease: "Early Blight",
    diseaseBn: "\u0986\u0997\u09BE\u09AE \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u0986\u09B0\u09CD\u09B2\u09BF \u09AC\u09CD\u09B2\u09BE\u0987\u099F)",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 20, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 2,
    imageUrl: "https://images.unsplash.com/photo-1592417817098-8f3d6eb228cc?w=600&auto=format&fit=crop&q=80",
    symptoms: "Dark brown to black spots with concentric target rings on older lower leaves, leaf yellowing.",
    symptomsBn: "\u0997\u09BE\u099B\u09C7\u09B0 \u09A8\u09BF\u099A\u09C7\u09B0 \u09AC\u09DF\u09B8\u09CD\u0995 \u09AA\u09BE\u09A4\u09BE\u09DF \u0997\u09BE\u09DD \u09AC\u09BE\u09A6\u09BE\u09AE\u09C0 \u09AC\u09B2\u09DF\u09AF\u09C1\u0995\u09CD\u09A4 \u09A6\u09BE\u0997 \u0993 \u09AA\u09BE\u09A4\u09BE \u09B9\u09B2\u09C1\u09A6 \u09B9\u0993\u09DF\u09BE\u0964",
    causes: "Fungal pathogen Alternaria solani, thrives in warm humid weather and wet leaves.",
    causesBn: "\u0985\u09B2\u09CD\u099F\u09BE\u09B0\u09A8\u09BE\u09B0\u09BF\u09AF\u09BC\u09BE \u09B8\u09CB\u09B2\u09BE\u09A8\u09BF \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u099C\u09A8\u09BF\u09A4 \u0986\u0995\u09CD\u09B0\u09AE\u09A3, \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0986\u09B0\u09CD\u09A6\u09CD\u09B0\u09A4\u09BE \u0993 \u0989\u09B7\u09CD\u09A3 \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u09AC\u09BF\u09B8\u09CD\u09A4\u09BE\u09B0 \u0998\u099F\u09C7\u0964",
    treatment: "Prune infected lower leaves. Avoid overhead watering. Spray systemic fungicide thoroughly.",
    treatmentBn: "\u0986\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09AA\u09BE\u09A4\u09BE \u0995\u09C7\u099F\u09C7 \u09AC\u09BF\u09A8\u09B7\u09CD\u099F \u0995\u09B0\u09C1\u09A8\u0964 \u0997\u09BE\u099B\u09C7\u09B0 \u0997\u09CB\u09A1\u09BC\u09BE\u09AF\u09BC \u09AA\u09BE\u09A8\u09BF \u09A6\u09BF\u09A8\u0964 \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u09A8\u09BE\u09B6\u0995 \u09AF\u09A5\u09BE\u09AF\u09A5 \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE\u09DF \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Antracol 70 WP (Bayer CropScience) - 2g/L",
      "Dithane M-45 (Dow / Auto Crop) - 2g/L",
      "Score 250 EC (Syngenta) - 0.5ml/L",
      "Ridomil Gold (Syngenta) - 2g/L",
      "Nativo 75 WG (Bayer) - 0.5g/L"
    ],
    bangladeshMedicinesBn: [
      "\u0985\u09CD\u09AF\u09BE\u09A8\u09CD\u099F\u09CD\u09B0\u09BE\u0995\u09B2 \u09ED\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09A1\u09BE\u0987\u09A5\u09C7\u09A8 \u098F\u09AE-\u09EA\u09EB (\u0985\u099F\u09CB \u0995\u09CD\u09B0\u09AA) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B8\u09CD\u0995\u09CB\u09B0 \u09E8\u09EB\u09E6 \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B0\u09BF\u09A1\u09CB\u09AE\u09BF\u09B2 \u0997\u09CB\u09B2\u09CD\u09A1 (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09A8\u09BE\u099F\u09BF\u09AD\u09CB \u09ED\u09EB \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E6.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Maintain proper row spacing for good air circulation",
      "Rotate crops with non-solanaceous plants every 2-3 years",
      "Use certified disease-free seeds and seedlings",
      "Apply mulch around base to prevent soil splash"
    ],
    preventionTipsBn: [
      "\u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u0986\u09B2\u09CB-\u09AC\u09BE\u09A4\u09BE\u09B8\u09C7\u09B0 \u099C\u09A8\u09CD\u09AF \u099A\u09BE\u09B0\u09BE\u0997\u09C1\u09B2\u09CB\u09B0 \u09AE\u09A7\u09CD\u09AF\u09C7 \u09B8\u09A0\u09BF\u0995 \u09A6\u09C2\u09B0\u09A4\u09CD\u09AC \u09AC\u099C\u09BE\u09DF \u09B0\u09BE\u0996\u09C1\u09A8",
      "\u098F\u0995\u0987 \u099C\u09AE\u09BF\u09A4\u09C7 \u09AA\u09B0 \u09AA\u09B0 \u09AC\u09C7\u0997\u09C1\u09A8/\u0986\u09B2\u09C1/\u099F\u09AE\u09C7\u099F\u09CB \u099A\u09BE\u09B7 \u09A8\u09BE \u0995\u09B0\u09C7 \u09B6\u09B8\u09CD\u09AF \u09AA\u09B0\u09CD\u09AF\u09BE\u09DF\u0995\u09CD\u09B0\u09AE \u0995\u09B0\u09C1\u09A8",
      "\u09B0\u09CB\u0997\u09AE\u09C1\u0995\u09CD\u09A4 \u09AA\u09CD\u09B0\u09A4\u09CD\u09AF\u09AF\u09BC\u09BF\u09A4 \u09AC\u09C0\u099C \u098F\u09AC\u0982 \u09B8\u09CD\u09AC\u09BE\u09B8\u09CD\u09A5\u09CD\u09AF\u0995\u09B0 \u099A\u09BE\u09B0\u09BE \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
      "\u09AE\u09BE\u099F\u09BF\u09B0 \u099C\u09C0\u09AC\u09BE\u09A3\u09C1 \u09AA\u09BE\u09A4\u09BE\u09DF \u099B\u09BF\u099F\u0995\u09C7 \u09AA\u09DC\u09BE \u09B0\u09CB\u09A7\u09C7 \u0996\u09DC\u09C7\u09B0 \u09AE\u09BE\u09B2\u099A\u09BF\u0982 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8"
    ]
  },
  {
    id: "rec-102",
    crop: "Potato",
    cropBn: "\u0986\u09B2\u09C1",
    disease: "Late Blight",
    diseaseBn: "\u09A8\u09BE\u09AC\u09C0 \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u09B2\u09C7\u099F \u09AC\u09CD\u09B2\u09BE\u0987\u099F)",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 20, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 5,
    imageUrl: "https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=600&auto=format&fit=crop&q=80",
    symptoms: "Water-soaked dark lesions on leaf tips and margins, white fuzzy mildew underside under moist mornings.",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE\u09B0 \u09A1\u0997\u09BE\u09DF \u0993 \u0995\u09BF\u09A8\u09BE\u09B0\u09BE\u09DF \u09AA\u09BE\u09A8\u09BF\u09AD\u09C7\u099C\u09BE \u0995\u09BE\u09B2\u099A\u09C7 \u09A6\u09BE\u0997 \u098F\u09AC\u0982 \u09AD\u09C7\u099C\u09BE \u09B8\u0995\u09BE\u09B2\u09C7 \u09AA\u09BE\u09A4\u09BE\u09B0 \u0989\u09B2\u09CD\u099F\u09CB \u09AA\u09BF\u09A0\u09C7 \u09B8\u09BE\u09A6\u09BE \u09A4\u09C1\u09B2\u09CB\u09B0 \u09AE\u09A4\u09CB \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u0964",
    causes: "Oomycete pathogen Phytophthora infestans during cold fog, drizzling rain and high humidity.",
    causesBn: "\u09AB\u09BE\u0987\u099F\u09CB\u09AB\u09A5\u09CB\u09B0\u09BE \u0987\u09A8\u09AB\u09C7\u09B8\u09CD\u099F\u09BE\u09A8\u09B8 \u099B\u09A4\u09CD\u09B0\u09BE\u0995, \u09A4\u09C0\u09AC\u09CD\u09B0 \u0995\u09C1\u09DF\u09BE\u09B6\u09BE \u0993 \u09AE\u09C7\u0998\u09B2\u09BE \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u09A6\u09CD\u09B0\u09C1\u09A4 \u099B\u09DC\u09BF\u09DF\u09C7 \u09AA\u09DC\u09C7\u0964",
    treatment: "Immediate preventive spray of protectant fungicides followed by curatives on early signs.",
    treatmentBn: "\u0995\u09C1\u09DF\u09BE\u09B6\u09BE\u099A\u09CD\u099B\u09A8\u09CD\u09A8 \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u0986\u0997\u09BE\u09AE \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE\u09AE\u09C2\u09B2\u0995 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u098F\u09AC\u0982 \u09B2\u0995\u09CD\u09B7\u09A3 \u09A6\u09C7\u0996\u09BE \u09AE\u09BE\u09A4\u09CD\u09B0 \u09A8\u09BF\u09B0\u09BE\u09AE\u09DF\u0995\u09BE\u09B0\u09C0 \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u09A8\u09BE\u09B6\u0995 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Acrobat MZ (BASF Bangladesh) - 2g/L",
      "Ridomil Gold MZ 68 WG (Syngenta) - 2g/L",
      "Secure 600 WG (Bayer) - 1.5g/L",
      "Melody Duo 66.75 WP (Bayer) - 1.5g/L",
      "Revus 250 SC (Syngenta) - 1ml/L"
    ],
    bangladeshMedicinesBn: [
      "\u0985\u09CD\u09AF\u09BE\u0995\u09CD\u09B0\u09CB\u09AC\u09CD\u09AF\u09BE\u099F \u098F\u09AE\u099C\u09C7\u09A1 (\u09AC\u09BE\u09B8\u09AB) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B0\u09BF\u09A1\u09CB\u09AE\u09BF\u09B2 \u0997\u09CB\u09B2\u09CD\u09A1 \u098F\u09AE\u099C\u09C7\u09A1 \u09EC\u09EE \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B8\u09BF\u0995\u09BF\u0989\u09B0 \u09EC\u09E6\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AE\u09C7\u09B2\u09CB\u09A1\u09BF \u09A1\u09C1\u0993 (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B0\u09C7\u09AD\u09BE\u09B8 \u09E8\u09EB\u09E6 \u098F\u09B8\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Destroy potato volunteer plants and cull piles",
      "Avoid excess nitrogen fertilizer which creates dense lush canopy",
      "Harvest only when haulms are completely dead and dry",
      "Monitor weather warnings from DAE (Department of Agricultural Extension)"
    ],
    preventionTipsBn: [
      "\u099C\u09AE\u09BF\u09B0 \u0986\u09B6\u09C7\u09AA\u09BE\u09B6\u09C7 \u09B0\u09BE\u0996\u09BE \u09AA\u099A\u09BE \u09AC\u09BE \u09AA\u09B0\u09BF\u09A4\u09CD\u09AF\u0995\u09CD\u09A4 \u0986\u09B2\u09C1\u09B0 \u09B8\u09CD\u09A4\u09C2\u09AA \u09A7\u09CD\u09AC\u0982\u09B8 \u0995\u09B0\u09C1\u09A8",
      "\u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0987\u0989\u09B0\u09BF\u09AF\u09BC\u09BE \u09B8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09AF\u09BC\u09CB\u0997 \u09AA\u09B0\u09BF\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
      "\u0997\u09BE\u099B\u09C7\u09B0 \u09A1\u0997\u09BE \u09AE\u09B0\u09C7 \u09B6\u09C1\u0995\u09BF\u09DF\u09C7 \u09AF\u09BE\u0993\u09DF\u09BE\u09B0 \u09AA\u09B0 \u0986\u09B2\u09C1 \u0989\u09A4\u09CD\u09A4\u09CB\u09B2\u09A8 \u0995\u09B0\u09C1\u09A8",
      "\u0995\u09C3\u09B7\u09BF \u09B8\u09AE\u09CD\u09AA\u09CD\u09B0\u09B8\u09BE\u09B0\u09A3 \u0985\u09A7\u09BF\u09A6\u09AA\u09CD\u09A4\u09B0\u09C7\u09B0 \u0995\u09C1\u09DF\u09BE\u09B6\u09BE \u0993 \u09B6\u09C8\u09A4\u09CD\u09AF\u09AA\u09CD\u09B0\u09AC\u09BE\u09B9 \u09B8\u09A4\u09B0\u09CD\u0995\u09A4\u09BE \u09A8\u09BF\u09DF\u09AE\u09BF\u09A4 \u0996\u09C7\u09DF\u09BE\u09B2 \u09B0\u09BE\u0996\u09C1\u09A8"
    ]
  },
  {
    id: "rec-103",
    crop: "Chili",
    cropBn: "\u09AE\u09B0\u09BF\u099A",
    disease: "Chili Leaf Curl & Thrips Infestation",
    diseaseBn: "\u09AE\u09B0\u09BF\u099A\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE \u0995\u09CB\u0981\u0995\u09DC\u09BE\u09A8\u09CB \u0993 \u09A5\u09CD\u09B0\u09BF\u09AA\u09B8 \u0986\u0995\u09CD\u09B0\u09AE\u09A3",
    confidence: "Medium-High (Possible disease detected)",
    confidenceBn: "\u09AE\u09BE\u099D\u09BE\u09B0\u09BF-\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 19, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 24,
    imageUrl: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?w=600&auto=format&fit=crop&q=80",
    symptoms: "Upward or downward boat-shaped leaf curling, puckered leaves, stunted plant growth.",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE \u09A8\u09CC\u0995\u09BE\u09B0 \u09AE\u09A4\u09CB \u0989\u09AA\u09B0\u09C7\u09B0 \u09AC\u09BE \u09A8\u09BF\u099A\u09C7\u09B0 \u09A6\u09BF\u0995\u09C7 \u0995\u09CB\u0981\u0995\u09DC\u09BE\u09A8\u09CB, \u09AA\u09BE\u09A4\u09BE \u0996\u09B8\u0996\u09B8\u09C7 \u09B9\u0993\u09DF\u09BE \u0993 \u09AC\u09C3\u09A6\u09CD\u09A7\u09BF \u09A5\u09C7\u09AE\u09C7 \u09AF\u09BE\u0993\u09DF\u09BE\u0964",
    causes: "Chili leaf curl virus transmitted by whiteflies and direct sap-sucking injury by thrips and mites.",
    causesBn: "\u09B8\u09BE\u09A6\u09BE \u09AE\u09BE\u099B\u09BF \u09AC\u09BE\u09B9\u09BF\u09A4 \u09AD\u09BE\u0987\u09B0\u09BE\u09B8 \u098F\u09AC\u0982 \u0995\u09CD\u09B7\u09C1\u09A6\u09CD\u09B0 \u09A5\u09CD\u09B0\u09BF\u09AA\u09B8 \u0993 \u09AE\u09BE\u0995\u09DC\u09C7\u09B0 \u09B0\u09B8 \u099A\u09C1\u09B7\u09C7 \u0996\u09BE\u0993\u09DF\u09BE\u09B0 \u0995\u09BE\u09B0\u09A3\u09C7 \u0998\u099F\u09C7\u0964",
    treatment: "Control insect vectors immediately using systemic insecticide and acaricide.",
    treatmentBn: "\u09AC\u09BE\u09B9\u0995 \u09AA\u09CB\u0995\u09BE \u09A6\u09AE\u09A8\u09C7 \u0985\u09AC\u09BF\u09B2\u09AE\u09CD\u09AC\u09C7 \u0995\u09BE\u09B0\u09CD\u09AF\u0995\u09B0\u09C0 \u0995\u09C0\u099F\u09A8\u09BE\u09B6\u0995 \u0993 \u09AE\u09BE\u0995\u09DC\u09A8\u09BE\u09B6\u0995 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Virtako 40 WG (Syngenta) - 1.5g/10L",
      "Pegasus 50 SC (Syngenta) - 1ml/L",
      "Imitaf 20 SL (Auto Crop) - 0.5ml/L",
      "Confidor 70 WG (Bayer) - 0.2g/L",
      "Vertimec 018 EC (Syngenta) - 1.2ml/L"
    ],
    bangladeshMedicinesBn: [
      "\u09AD\u09BF\u09B0\u09A4\u09BE\u0995\u09CB \u09EA\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09E7\u09E6 \u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AA\u09C7\u0997\u09BE\u09B8\u09BE\u09B8 \u09EB\u09E6 \u098F\u09B8\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0987\u09AE\u09BF\u099F\u09BE\u09AB \u09E8\u09E6 \u098F\u09B8\u098F\u09B2 (\u0985\u099F\u09CB \u0995\u09CD\u09B0\u09AA) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0995\u09A8\u09AB\u09BF\u09A1\u09CB\u09B0 \u09ED\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E6.\u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AD\u09BE\u09B0\u09CD\u099F\u09BF\u09AE\u09C7\u0995 \u09E6\u09E7\u09EE \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7.\u09E8 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Install yellow and blue sticky traps in the field (20 traps/bigha)",
      "Uproot and bury severely virus-infected plants",
      "Intercrop with marigold or maize as border trap crops",
      "Keep fields free from weeds like parthenium"
    ],
    preventionTipsBn: [
      "\u099C\u09AE\u09BF\u09A4\u09C7 \u09B9\u09B2\u09C1\u09A6 \u0993 \u09A8\u09C0\u09B2 \u0986\u09A0\u09BE\u09B2\u09CB \u09AB\u09BE\u0981\u09A6 \u09B8\u09CD\u09A5\u09BE\u09AA\u09A8 \u0995\u09B0\u09C1\u09A8 (\u09AC\u09BF\u0998\u09BE \u09AA\u09CD\u09B0\u09A4\u09BF \u09E8\u09E6\u099F\u09BF)",
      "\u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09AD\u09BE\u0987\u09B0\u09BE\u09B8 \u0986\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u0997\u09BE\u099B \u09A4\u09C1\u09B2\u09C7 \u09AE\u09BE\u099F\u09BF\u09A4\u09C7 \u09AA\u09C1\u0981\u09A4\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8",
      "\u099C\u09AE\u09BF\u09B0 \u09B8\u09C0\u09AE\u09BE\u09A8\u09BE\u09DF \u0997\u09BE\u0981\u09A6\u09BE \u09AB\u09C1\u09B2 \u09AC\u09BE \u09AD\u09C1\u099F\u09CD\u099F\u09BE\u09B0 \u09AA\u09CD\u09B0\u09A4\u09BF\u09AC\u09A8\u09CD\u09A7\u0995 \u09AC\u09C7\u09DC\u09BE \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
      "\u099C\u09AE\u09BF\u09B0 \u0986\u0987\u09B2 \u0993 \u099A\u09BE\u09B0\u09AA\u09BE\u09B6\u09C7\u09B0 \u0986\u0997\u09BE\u099B\u09BE \u09B8\u09AE\u09CD\u09AA\u09C2\u09B0\u09CD\u09A3 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09B0\u09BE\u0996\u09C1\u09A8"
    ]
  },
  {
    id: "rec-104",
    crop: "Corn / Maize",
    cropBn: "\u09AD\u09C1\u099F\u09CD\u099F\u09BE",
    disease: "Cercospora Leaf Spot (Gray Leaf Spot)",
    diseaseBn: "\u09AD\u09C1\u099F\u09CD\u099F\u09BE\u09B0 \u09B8\u09BE\u09B0\u0995\u09CB\u09B8\u09CD\u09AA\u09CB\u09B0\u09BE \u09AA\u09BE\u09A4\u09BE\u09B0 \u09A6\u09BE\u0997 \u09B0\u09CB\u0997",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 19, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 28,
    imageUrl: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=600&auto=format&fit=crop&q=80",
    symptoms: "Rectangular tan to gray lesions bounded by leaf veins, spreading along lower foliage.",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE\u09B0 \u09B6\u09BF\u09B0\u09BE\u09B0 \u09B8\u09AE\u09BE\u09A8\u09CD\u09A4\u09B0\u09BE\u09B2\u09C7 \u0986\u09DF\u09A4\u09BE\u0995\u09BE\u09B0 \u09A7\u09C2\u09B8\u09B0 \u09AC\u09BE \u09A4\u09BE\u09AE\u09BE\u099F\u09C7 \u09A6\u09BE\u0997 \u09AF\u09BE \u0995\u09CD\u09B0\u09AE\u09B6 \u0989\u09AA\u09B0\u09C7\u09B0 \u09A6\u09BF\u0995\u09C7 \u099B\u09DC\u09BE\u09DF\u0964",
    causes: "Cercospora zeae-maydis fungus favored by warm temperatures and prolonged dew periods.",
    causesBn: "\u09B8\u09BE\u09B0\u0995\u09CB\u09B8\u09CD\u09AA\u09CB\u09B0\u09BE \u099C\u09BF-\u09AE\u09C7\u0987\u09A1\u09BF\u09B8 \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u099C\u09A8\u09BF\u09A4 \u0986\u0995\u09CD\u09B0\u09AE\u09A3, \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0986\u09B0\u09CD\u09A6\u09CD\u09B0\u09A4\u09BE \u0993 \u09A6\u09C0\u09B0\u09CD\u0998 \u09B6\u09BF\u09B6\u09BF\u09B0\u09AD\u09C7\u099C\u09BE \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u099B\u09DC\u09BE\u09DF\u0964",
    treatment: "Foliar fungicide application at initial spot appearance and before tasseling stage.",
    treatmentBn: "\u09A6\u09BE\u0997 \u09A6\u09C7\u0996\u09BE \u09A6\u09C7\u0993\u09DF\u09BE\u09AE\u09BE\u09A4\u09CD\u09B0 \u098F\u09AC\u0982 \u09AE\u09CB\u099A\u09BE \u0986\u09B8\u09BE\u09B0 \u0986\u0997\u09C7 \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u09A8\u09BE\u09B6\u0995 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Tilt 250 EC (Syngenta) - 0.5ml/L",
      "Amistar Top 325 SC (Syngenta) - 1ml/L",
      "Nativo 75 WG (Bayer) - 0.6g/L",
      "Bavistin DF (ACI) - 1g/L"
    ],
    bangladeshMedicinesBn: [
      "\u099F\u09BF\u09B2\u09CD\u099F \u09E8\u09EB\u09E6 \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0985\u09CD\u09AF\u09BE\u09AE\u09BF\u09B8\u09CD\u099F\u09BE\u09B0 \u099F\u09AA \u09E9\u09E8\u09EB \u098F\u09B8\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09A8\u09BE\u099F\u09BF\u09AD\u09CB \u09ED\u09EB \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E6.\u09EC \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AC\u09CD\u09AF\u09BE\u09AD\u09BF\u09B8\u09CD\u099F\u09BF\u09A8 \u09A1\u09BF\u098F\u09AB (\u098F\u09B8\u09BF\u0986\u0987) - \u09E7 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Plant certified resistant hybrid maize varieties",
      "Deep plowing of crop residues after harvest",
      "Balanced application of potash (MOP) to increase resistance"
    ],
    preventionTipsBn: [
      "\u09B8\u09B9\u09A8\u09B6\u09C0\u09B2 \u0989\u099A\u09CD\u099A\u09AB\u09B2\u09A8\u09B6\u09C0\u09B2 \u09B9\u09BE\u0987\u09AC\u09CD\u09B0\u09BF\u09A1 \u09AD\u09C1\u099F\u09CD\u099F\u09BE\u09B0 \u099C\u09BE\u09A4 \u09A8\u09BF\u09B0\u09CD\u09AC\u09BE\u099A\u09A8 \u0995\u09B0\u09C1\u09A8",
      "\u09AB\u09B8\u09B2 \u09A4\u09CB\u09B2\u09BE\u09B0 \u09AA\u09B0 \u0997\u09AD\u09C0\u09B0 \u099A\u09BE\u09B7 \u09A6\u09BF\u09DF\u09C7 \u09AB\u09B8\u09B2\u09C7\u09B0 \u0985\u09AC\u09B6\u09BF\u09B7\u09CD\u099F\u09BE\u0982\u09B6 \u09AE\u09BE\u099F\u09BF\u09A4\u09C7 \u09AE\u09BF\u09B6\u09BF\u09DF\u09C7 \u09A6\u09BF\u09A8",
      "\u09B0\u09CB\u0997 \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7 \u0995\u09CD\u09B7\u09AE\u09A4\u09BE \u09AC\u09BE\u09DC\u09BE\u09A4\u09C7 \u09B8\u09C1\u09B7\u09AE \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE\u09DF \u09AA\u099F\u09BE\u09B6 (\u098F\u09AE\u0993\u09AA\u09BF) \u09B8\u09BE\u09B0 \u09AA\u09CD\u09B0\u09DF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8"
    ]
  },
  {
    id: "rec-105",
    crop: "Cucumber",
    cropBn: "\u09B6\u09B8\u09BE",
    disease: "Powdery Mildew",
    diseaseBn: "\u09B6\u09B8\u09BE\u09B0 \u09AA\u09BE\u0989\u09A1\u09BE\u09B0\u09BF \u09AE\u09BF\u09B2\u09A1\u09BF\u0989 \u09B0\u09CB\u0997",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 19, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 32,
    imageUrl: "https://images.unsplash.com/photo-1590165482129-1b8b27698780?w=600&auto=format&fit=crop&q=80",
    symptoms: "White powdery fungal patches on upper surface of leaves and young stems.",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE\u09B0 \u0989\u09AA\u09B0\u09BF\u09AD\u09BE\u0997\u09C7 \u098F\u09AC\u0982 \u0995\u099A\u09BF \u09A1\u0997\u09BE\u09DF \u09B8\u09BE\u09A6\u09BE \u09AA\u09BE\u0989\u09A1\u09BE\u09B0 \u09AC\u09BE \u0997\u09C1\u0981\u09DC\u09CB\u09B0 \u09AE\u09A4\u09CB \u0986\u09B8\u09CD\u09A4\u09B0\u09A3\u0964",
    causes: "Podosphaera xanthii fungus thriving in dry foliage under high relative humidity.",
    causesBn: "\u09AA\u09CB\u09A1\u09CB\u09B8\u09CD\u09AB\u09BF\u09DF\u09C7\u09B0\u09BE \u099C\u09BE\u09A8\u09CD\u09A5\u09BF \u099B\u09A4\u09CD\u09B0\u09BE\u0995, \u09B6\u09C1\u09B7\u09CD\u0995 \u09AA\u09BE\u09A4\u09BE \u0995\u09BF\u09A8\u09CD\u09A4\u09C1 \u09AC\u09BE\u09A4\u09BE\u09B8\u09C7 \u0989\u099A\u09CD\u099A \u0986\u09B0\u09CD\u09A6\u09CD\u09B0\u09A4\u09BE \u09A5\u09BE\u0995\u09B2\u09C7 \u09A6\u09CD\u09B0\u09C1\u09A4 \u0986\u0995\u09CD\u09B0\u09AE\u09A3 \u0995\u09B0\u09C7\u0964",
    treatment: "Apply sulfur or systemic triazole fungicides covering both upper and lower leaf surfaces.",
    treatmentBn: "\u09B8\u09BE\u09B2\u09AB\u09BE\u09B0 \u09AC\u09BE \u099F\u09CD\u09B0\u09BE\u09AF\u09BC\u09BE\u099C\u09B2 \u099C\u09BE\u09A4\u09C0\u09AF\u09BC \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u09A8\u09BE\u09B6\u0995 \u09AA\u09BE\u09A4\u09BE\u09B0 \u0989\u09AD\u09DF \u09AA\u09BE\u09B6\u09C7 \u09AD\u09BF\u099C\u09BF\u09DF\u09C7 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Kumulus DF (BASF) - 2g/L",
      "Topas 100 EC (Syngenta) - 0.5ml/L",
      "Tilt 250 EC (Syngenta) - 0.5ml/L",
      "Contaf 5 EC (Tata Rallis / ACI) - 1ml/L"
    ],
    bangladeshMedicinesBn: [
      "\u0995\u09C1\u09AE\u09C1\u09B2\u09BE\u09B8 \u09A1\u09BF\u098F\u09AB (\u09AC\u09BE\u09B8\u09AB) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u099F\u09CB\u09AA\u09BE\u099C \u09E7\u09E6\u09E6 \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u099F\u09BF\u09B2\u09CD\u099F \u09E8\u09EB\u09E6 \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0995\u09A8\u099F\u09BE\u09AB \u09EB \u0987\u09B8\u09BF (\u098F\u09B8\u09BF\u0986\u0987) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Provide trellising (\u09AE\u09BE\u099A\u09BE \u09AA\u09A6\u09CD\u09A7\u09A4\u09BF) for vines to prevent contact with ground",
      "Avoid planting in excessive shade",
      "Remove heavily dusted old leaves"
    ],
    preventionTipsBn: [
      "\u09AE\u09BE\u099F\u09BF \u09A5\u09C7\u0995\u09C7 \u09A6\u09C2\u09B0\u09C7 \u09B0\u09BE\u0996\u09A4\u09C7 \u0989\u0981\u099A\u09C1 \u0993 \u0996\u09CB\u09B2\u09BE\u09AE\u09C7\u09B2\u09BE \u09AE\u09BE\u099A\u09BE \u09A4\u09C8\u09B0\u09BF \u0995\u09B0\u09C1\u09A8",
      "\u099B\u09BE\u09AF\u09BC\u09BE\u09AF\u09C1\u0995\u09CD\u09A4 \u09B8\u09CD\u09A5\u09BE\u09A8\u09C7 \u09B6\u09B8\u09BE \u099A\u09BE\u09B7 \u09AA\u09B0\u09BF\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
      "\u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0986\u0995\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u09AA\u09C1\u09B0\u09BE\u09A8\u09CB \u09AA\u09BE\u09A4\u09BE \u09B8\u09BE\u09AC\u09A7\u09BE\u09A8\u09C7 \u0995\u09C7\u099F\u09C7 \u09B8\u09B0\u09BF\u09DF\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8"
    ]
  },
  {
    id: "rec-106",
    crop: "Rice / Paddy",
    cropBn: "\u09A7\u09BE\u09A8",
    disease: "Rice Blast (Neck & Leaf Blast)",
    diseaseBn: "\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F \u09B0\u09CB\u0997 (\u09AA\u09BE\u09A4\u09BE \u0993 \u09B6\u09C0\u09B7 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F)",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 18, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 48,
    imageUrl: "https://images.unsplash.com/photo-1536704689677-27b003a2760a?w=600&auto=format&fit=crop&q=80",
    symptoms: "Spindle or eye-shaped lesions with brown borders on leaves; dark neck rot causing empty white heads (\u099A\u09BF\u099F\u09BE).",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE\u09DF \u099A\u09CB\u0996\u09C7\u09B0 \u09AE\u09A4\u09CB \u09A6\u09C1\u0987 \u09AA\u09CD\u09B0\u09BE\u09A8\u09CD\u09A4 \u099B\u09C1\u0981\u099A\u09BE\u09B2\u09CB \u09AC\u09BE\u09A6\u09BE\u09AE\u09C0 \u09A6\u09BE\u0997; \u09B6\u09C0\u09B7\u09C7\u09B0 \u0997\u09CB\u09DC\u09BE \u0995\u09BE\u09B2\u09CB \u09B9\u09DF\u09C7 \u09B6\u09C1\u0995\u09BF\u09DF\u09C7 \u099A\u09BF\u099F\u09BE \u09B9\u0993\u09DF\u09BE\u0964",
    causes: "Magnaporthe oryzae fungus favored by night-morning fog, dew and excess urea.",
    causesBn: "\u09AE\u09CD\u09AF\u09BE\u0997\u09A8\u09BE\u09AA\u09CB\u09B0\u09CD\u09A5 \u0985\u09B0\u09BF\u099C\u09BF \u099B\u09A4\u09CD\u09B0\u09BE\u0995, \u09B0\u09BE\u09A4\u09C7 \u0995\u09C1\u09DF\u09BE\u09B6\u09BE, \u09A6\u09BF\u09A8\u09C7 \u09B0\u09CB\u09A6 \u098F\u09AC\u0982 \u099C\u09AE\u09BF\u09A4\u09C7 \u09AE\u09BE\u09A4\u09CD\u09B0\u09BE\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0987\u0989\u09B0\u09BF\u09DF\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0\u09C7 \u0998\u099F\u09C7\u0964",
    treatment: "Keep standing water in field. Spray specific blast fungicide immediately in late afternoon.",
    treatmentBn: "\u099C\u09AE\u09BF\u09A4\u09C7 \u09AA\u09B0\u09CD\u09AF\u09BE\u09AA\u09CD\u09A4 \u09AA\u09BE\u09A8\u09BF \u09B0\u09BE\u0996\u09C1\u09A8\u0964 \u09AC\u09BF\u0995\u09C7\u09B2\u09C7 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F \u09AA\u09CD\u09B0\u09A4\u09BF\u09B0\u09CB\u09A7\u09C0 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964 \u0987\u0989\u09B0\u09BF\u09DF\u09BE \u09AC\u09A8\u09CD\u09A7 \u09B0\u09BE\u0996\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Trooper 75 WP (Auto Crop) - 0.75g/L",
      "Nativo 75 WG (Bayer) - 0.6g/L",
      "Filia 525 SE (Syngenta) - 2ml/L",
      "Amistar Top 325 SC (Syngenta) - 1ml/L",
      "Bavistin 50 WP (ACI) - 1g/L"
    ],
    bangladeshMedicinesBn: [
      "\u099F\u09CD\u09B0\u09C1\u09AA\u09BE\u09B0 \u09ED\u09EB \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u0985\u099F\u09CB \u0995\u09CD\u09B0\u09AA) - \u09E6.\u09ED\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09A8\u09BE\u099F\u09BF\u09AD\u09CB \u09ED\u09EB \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u099C\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E6.\u09EC \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AB\u09BF\u09B2\u09BF\u09AF\u09BC\u09BE \u09EB\u09E8\u09EB \u098F\u09B8\u0987 (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E8 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0985\u09CD\u09AF\u09BE\u09AE\u09BF\u09B8\u09CD\u099F\u09BE\u09B0 \u099F\u09AA \u09E9\u09E8\u09EB \u098F\u09B8\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AC\u09CD\u09AF\u09BE\u09AD\u09BF\u09B8\u09CD\u099F\u09BF\u09A8 \u09EB\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u098F\u09B8\u09BF\u0986\u0987) - \u09E7 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Treat seeds with Carbendazim before sowing (2.5g/kg seed)",
      "Apply Potash (MOP) fertilizer in split doses",
      "Avoid excessive urea fertilizer application during cloudy season"
    ],
    preventionTipsBn: [
      "\u09AC\u09C0\u099C \u09AC\u09AA\u09A8\u09C7\u09B0 \u0986\u0997\u09C7 \u0995\u09BE\u09B0\u09CD\u09AC\u09C7\u09A8\u09A1\u09BE\u099C\u09BF\u09AE \u09A6\u09BF\u09DF\u09C7 \u09AC\u09C0\u099C \u09B6\u09CB\u09A7\u09A8 \u0995\u09B0\u09C1\u09A8 (\u09E8.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u0995\u09C7\u099C\u09BF)",
      "\u09AA\u099F\u09BE\u09B6 \u09B8\u09BE\u09B0 \u09A6\u09C1\u0987 \u0995\u09BF\u09B8\u09CD\u09A4\u09BF\u09A4\u09C7 \u099C\u09AE\u09BF\u09A4\u09C7 \u09AA\u09CD\u09B0\u09DF\u09CB\u0997 \u0995\u09B0\u09C1\u09A8",
      "\u09AE\u09C7\u0998\u09B2\u09BE \u09AC\u09BE \u0995\u09C1\u09DF\u09BE\u09B6\u09BE\u099A\u09CD\u099B\u09A8\u09CD\u09A8 \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u099C\u09AE\u09BF\u09A4\u09C7 \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u0987\u0989\u09B0\u09BF\u09DF\u09BE \u09B8\u09BE\u09B0 \u09A6\u09C7\u0993\u09DF\u09BE \u09AC\u09A8\u09CD\u09A7 \u09B0\u09BE\u0996\u09C1\u09A8"
    ]
  },
  {
    id: "rec-107",
    crop: "Brinjal / Eggplant",
    cropBn: "\u09AC\u09C7\u0997\u09C1\u09A8",
    disease: "Bacterial Wilt & Phomopsis Blight",
    diseaseBn: "\u09AC\u09C7\u0997\u09C1\u09A8\u09C7\u09B0 \u09AC\u09CD\u09AF\u09BE\u0995\u099F\u09C7\u09B0\u09BF\u09AF\u09BC\u09BE\u09B2 \u0989\u0987\u09B2\u09CD\u099F \u0993 \u09AB\u09CB\u09AE\u09CB\u09AA\u09B8\u09BF\u09B8 \u09AC\u09CD\u09B2\u09BE\u0987\u099F",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 18, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 52,
    imageUrl: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?w=600&auto=format&fit=crop&q=80",
    symptoms: "Sudden wilting of green leaves during day without yellowing, circular sunken rot on eggplant fruit.",
    symptomsBn: "\u0997\u09BE\u099B \u09B8\u09AC\u09C1\u099C \u0985\u09AC\u09B8\u09CD\u09A5\u09BE\u09A4\u09C7\u0987 \u09B9\u09A0\u09BE\u09CE \u09A6\u09C1\u09AA\u09C1\u09B0\u09C7\u09B0 \u09B0\u09CB\u09A6\u09C7 \u09A8\u09C1\u09DF\u09C7 \u09AA\u09DC\u09BE \u098F\u09AC\u0982 \u09AC\u09C7\u0997\u09C1\u09A8\u09C7\u09B0 \u0997\u09BE\u09DF\u09C7 \u0997\u09CB\u09B2 \u0997\u09B0\u09CD\u09A4\u09AF\u09C1\u0995\u09CD\u09A4 \u09AA\u099A\u09A8 \u09A6\u09BE\u0997\u0964",
    causes: "Ralstonia solanacearum bacteria inhabiting soil entering via nematode or cultivation root wounds.",
    causesBn: "\u09AE\u09BE\u099F\u09BF\u09AC\u09BE\u09B9\u09BF\u09A4 \u09B0\u09CD\u09AF\u09BE\u09B2\u09B8\u09CD\u099F\u09CB\u09A8\u09BF\u09AF\u09BC\u09BE \u09AC\u09CD\u09AF\u09BE\u0995\u099F\u09C7\u09B0\u09BF\u09AF\u09BC\u09BE \u09AF\u09BE \u09AE\u09C2\u09B2\u09C7\u09B0 \u0995\u09CD\u09B7\u09A4 \u09A6\u09BF\u09DF\u09C7 \u09AA\u09CD\u09B0\u09AC\u09C7\u09B6 \u0995\u09B0\u09C7 \u09A8\u09BE\u09B2\u09BF\u0995\u09BE \u09AC\u09A8\u09CD\u09A7 \u0995\u09B0\u09C7 \u09A6\u09C7\u09DF\u0964",
    treatment: "Drench soil with Copper Oxychloride + Streptomycin antibiotic. Pull out wilted plants.",
    treatmentBn: "\u0995\u09AA\u09BE\u09B0 \u0985\u0995\u09CD\u09B8\u09BF\u0995\u09CD\u09B2\u09CB\u09B0\u09BE\u0987\u09A1 \u0993 \u09B8\u09CD\u099F\u09CD\u09B0\u09C7\u09AA\u09CD\u099F\u09CB\u09AE\u09BE\u0987\u09B8\u09BF\u09A8 \u0997\u09BE\u099B\u09C7\u09B0 \u0997\u09CB\u09DC\u09BE\u09DF \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0993 \u09A2\u09C7\u09B2\u09C7 \u09A6\u09BF\u09A8\u0964 \u09AE\u09BE\u09B0\u09BE\u09A4\u09CD\u09AE\u0995 \u0997\u09BE\u099B \u09A4\u09C1\u09B2\u09C7 \u09AB\u09C7\u09B2\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Cupravit 50 WP (Bayer) - 2g/L",
      "Kasumin 2L (Aventis / ACI) - 2ml/L",
      "Champion 77 WP (Auto Crop) - 2g/L",
      "Bavistin 50 WP (ACI) - 1.5g/L"
    ],
    bangladeshMedicinesBn: [
      "\u0995\u09C1\u09AA\u09CD\u09B0\u09BE\u09AD\u09BF\u099F \u09EB\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0995\u09BE\u09B8\u09C1\u09AE\u09BF\u09A8 \u09E8\u098F\u09B2 (\u098F\u09B8\u09BF\u0986\u0987) - \u09E8 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u099A\u09CD\u09AF\u09BE\u09AE\u09CD\u09AA\u09BF\u09AF\u09BC\u09A8 \u09ED\u09ED \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u0985\u099F\u09CB \u0995\u09CD\u09B0\u09AA) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09AC\u09CD\u09AF\u09BE\u09AD\u09BF\u09B8\u09CD\u099F\u09BF\u09A8 \u09EB\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u098F\u09B8\u09BF\u0986\u0987) - \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Graft brinjal seedlings on wild solanum rootstocks (\u09A4\u09BF\u09A4\u09BE \u09AC\u09C7\u0997\u09C1\u09A8 \u09B0\u09C1\u099F\u09B8\u09CD\u099F\u0995)",
      "Ensure proper drainage in monsoon season",
      "Avoid planting brinjal continuously in same plot"
    ],
    preventionTipsBn: [
      "\u09AC\u09C1\u09A8\u09CB \u09A4\u09BF\u09A4\u09BE \u09AC\u09C7\u0997\u09C1\u09A8\u09C7\u09B0 \u09B0\u09C1\u099F\u09B8\u09CD\u099F\u0995\u09C7 \u0995\u09B2\u09AE \u0995\u09B0\u09BE \u099A\u09BE\u09B0\u09BE\u09B0 \u09AC\u09CD\u09AF\u09AC\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
      "\u09AC\u09B0\u09CD\u09B7\u09BE\u0995\u09BE\u09B2\u09C7 \u099C\u09AE\u09BF\u09B0 \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09AA\u09BE\u09A8\u09BF \u09A8\u09BF\u09B7\u09CD\u0995\u09BE\u09B6\u09A8\u09C7\u09B0 \u0989\u09AA\u09AF\u09C1\u0995\u09CD\u09A4 \u09A8\u09BE\u09B2\u09BE \u09B0\u09BE\u0996\u09C1\u09A8",
      "\u098F\u0995\u0987 \u099C\u09AE\u09BF\u09A4\u09C7 \u09AC\u09BE\u09B0\u09AC\u09BE\u09B0 \u09AC\u09C7\u0997\u09C1\u09A8\u09C7\u09B0 \u099A\u09BE\u09B7 \u0995\u09B0\u09AC\u09C7\u09A8 \u09A8\u09BE"
    ]
  },
  {
    id: "rec-108",
    crop: "Garlic",
    cropBn: "\u09B0\u09B8\u09C1\u09A8",
    disease: "Purple Blotch",
    diseaseBn: "\u09B0\u09B8\u09C1\u09A8\u09C7\u09B0 \u09AA\u09BE\u09B0\u09CD\u09AA\u09B2 \u09AC\u09CD\u09B2\u099A (\u09AC\u09C7\u0997\u09C1\u09A8\u09C0 \u09A6\u09BE\u0997 \u09B0\u09CB\u0997)",
    confidence: "High (Possible disease detected)",
    confidenceBn: "\u0989\u099A\u09CD\u099A \u09A8\u09BF\u09B0\u09CD\u09AD\u09C1\u09B2\u09A4\u09BE (\u09B8\u09AE\u09CD\u09AD\u09BE\u09AC\u09CD\u09AF \u09B0\u09CB\u0997 \u09B6\u09A8\u09BE\u0995\u09CD\u09A4)",
    date: "May 17, 2025",
    timestamp: Date.now() - 1e3 * 60 * 60 * 72,
    imageUrl: "https://images.unsplash.com/photo-1540148426945-6cf22a6b2383?w=600&auto=format&fit=crop&q=80",
    symptoms: "Small water soaked lesions turning purple/brown with yellow halo, premature drying of leaves.",
    symptomsBn: "\u09AA\u09BE\u09A4\u09BE\u09DF \u099B\u09CB\u099F \u09AA\u09BE\u09A8\u09BF\u09AD\u09C7\u099C\u09BE \u09A6\u09BE\u0997 \u09AF\u09BE \u09AA\u09B0\u09C7 \u0997\u09BE\u09DD \u09AC\u09C7\u0997\u09C1\u09A8\u09BF \u0993 \u09AC\u09BE\u09A6\u09BE\u09AE\u09BF \u09B0\u09C2\u09AA \u09A8\u09C7\u09DF \u098F\u09AC\u0982 \u09AA\u09BE\u09A4\u09BE \u09B6\u09C1\u0995\u09BF\u09DF\u09C7 \u09AF\u09BE\u09DF\u0964",
    causes: "Alternaria porri fungus during warm wet conditions with heavy dew.",
    causesBn: "\u0985\u09B2\u09CD\u099F\u09BE\u09B0\u09A8\u09BE\u09B0\u09BF\u09AF\u09BC\u09BE \u09AA\u09CB\u09B0\u09BF \u099B\u09A4\u09CD\u09B0\u09BE\u0995, \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09B6\u09BF\u09B6\u09BF\u09B0 \u0993 \u0986\u09B0\u09CD\u09A6\u09CD\u09B0 \u0986\u09AC\u09B9\u09BE\u0993\u09DF\u09BE\u09DF \u0986\u0995\u09CD\u09B0\u09AE\u09A3 \u0995\u09B0\u09C7\u0964",
    treatment: "Spray Mancozeb or Iprodione mixed with wetting agent/sticker onto waxy garlic leaves.",
    treatmentBn: "\u09B0\u09B8\u09C1\u09A8\u09C7\u09B0 \u09AE\u09CB\u09AE\u09C7\u09B0 \u09AE\u09A4\u09CB \u09AA\u09BF\u099A\u09CD\u099B\u09BF\u09B2 \u09AA\u09BE\u09A4\u09BE\u09DF \u09B8\u09CD\u099F\u09BF\u0995\u09BE\u09B0 \u09AC\u09BE \u0986\u09A0\u09BE \u09AE\u09BF\u09B6\u09BF\u09DF\u09C7 \u09AE\u09CD\u09AF\u09BE\u09A8\u0995\u09CB\u099C\u09C7\u09AC \u099C\u09BE\u09A4\u09C0\u09DF \u0993\u09B7\u09C1\u09A7 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7 \u0995\u09B0\u09C1\u09A8\u0964",
    bangladeshMedicines: [
      "Rovral 50 WP (Bayer) - 2g/L",
      "Dithane M-45 (Auto Crop) - 2g/L",
      "Score 250 EC (Syngenta) - 0.5ml/L",
      "Amistar Top (Syngenta) - 1ml/L"
    ],
    bangladeshMedicinesBn: [
      "\u09B0\u09CB\u09AD\u09B0\u09BE\u09B2 \u09EB\u09E6 \u09A1\u09AC\u09CD\u09B2\u09BF\u0989\u09AA\u09BF (\u09AC\u09BE\u09AF\u09BC\u09BE\u09B0) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09A1\u09BE\u0987\u09A5\u09C7\u09A8 \u098F\u09AE-\u09EA\u09EB (\u0985\u099F\u09CB \u0995\u09CD\u09B0\u09AA) - \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u09B8\u09CD\u0995\u09CB\u09B0 \u09E8\u09EB\u09E6 \u0987\u09B8\u09BF (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0",
      "\u0985\u09CD\u09AF\u09BE\u09AE\u09BF\u09B8\u09CD\u099F\u09BE\u09B0 \u099F\u09AA (\u09B8\u09BF\u09A8\u099C\u09C7\u09A8\u099F\u09BE) - \u09E7 \u09AE\u09BF\u09B2\u09BF/\u09B2\u09BF\u099F\u09BE\u09B0"
    ],
    preventionTips: [
      "Treat garlic cloves with fungicide prior to planting",
      "Avoid field flooding during bulb maturity stage",
      "Maintain clean weed-free beds"
    ],
    preventionTipsBn: [
      "\u09B0\u09CB\u09AA\u09A3\u09C7\u09B0 \u09AA\u09C2\u09B0\u09CD\u09AC\u09C7 \u09B0\u09B8\u09C1\u09A8\u09C7\u09B0 \u0995\u09CB\u09DF\u09BE \u099B\u09A4\u09CD\u09B0\u09BE\u0995\u09A8\u09BE\u09B6\u0995 \u09A6\u09CD\u09B0\u09AC\u09A3 \u09A6\u09BF\u09DF\u09C7 \u09B6\u09CB\u09A7\u09A8 \u0995\u09B0\u09C1\u09A8",
      "\u09B0\u09B8\u09C1\u09A8 \u09AA\u09B0\u09BF\u09AA\u0995\u09CD\u0995 \u09B9\u0993\u09DF\u09BE\u09B0 \u09B8\u09AE\u09DF \u099C\u09AE\u09BF\u09A4\u09C7 \u0985\u09A4\u09BF\u09B0\u09BF\u0995\u09CD\u09A4 \u09B8\u09C7\u099A \u09A6\u09C7\u0993\u09DF\u09BE \u09AA\u09B0\u09BF\u09B9\u09BE\u09B0 \u0995\u09B0\u09C1\u09A8",
      "\u099C\u09AE\u09BF \u0986\u0997\u09BE\u099B\u09BE\u09AE\u09C1\u0995\u09CD\u09A4 \u0993 \u09AA\u09B0\u09BF\u099A\u09CD\u099B\u09A8\u09CD\u09A8 \u09B0\u09BE\u0996\u09C1\u09A8"
    ]
  }
];
var medicinesStore = [
  {
    id: "med-1",
    brandName: "Antracol 70 WP",
    genericName: "Propineb 70%",
    company: "Bayer CropScience Ltd.",
    targetDiseases: ["Early Blight", "Late Blight", "Leaf Spot", "Anthracnose"],
    cropTypes: ["Tomato", "Potato", "Chili", "Cucumber"],
    dosage: "2 grams per 1 Liter of clean water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09B0\u09BF\u09B7\u09CD\u0995\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE",
    packSize: "100g, 500g, 1kg"
  },
  {
    id: "med-2",
    brandName: "Score 250 EC",
    genericName: "Difenoconazole 250 g/L",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: ["Leaf Spot", "Purple Blotch", "Early Blight", "Sheath Blight"],
    cropTypes: ["Tomato", "Chili", "Garlic", "Rice", "Wheat"],
    dosage: "0.5 ml per 1 Liter of water (10 ml per 20L sprayer)",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF (\u09E8\u09E6 \u09B2\u09BF\u099F\u09BE\u09B0 \u09B8\u09CD\u09AA\u09CD\u09B0\u09C7\u09DF\u09BE\u09B0\u09C7 \u09E7\u09E6 \u09AE\u09BF\u09B2\u09BF)",
    packSize: "50ml, 100ml, 250ml"
  },
  {
    id: "med-3",
    brandName: "Ridomil Gold MZ 68 WG",
    genericName: "Mefenoxam 4% + Mancozeb 64%",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: ["Late Blight", "Downy Mildew", "Damping Off"],
    cropTypes: ["Potato", "Tomato", "Cucumber", "Brinjal"],
    dosage: "2 grams per 1 Liter of water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E8 \u0997\u09CD\u09B0\u09BE\u09AE",
    packSize: "100g, 500g"
  },
  {
    id: "med-4",
    brandName: "Nativo 75 WG",
    genericName: "Tebuconazole 50% + Trifloxystrobin 25%",
    company: "Bayer CropScience Ltd.",
    targetDiseases: ["Rice Blast", "Sheath Blight", "Early Blight", "Anthracnose"],
    cropTypes: ["Rice", "Tomato", "Chili", "Wheat", "Corn"],
    dosage: "0.6 grams per 1 Liter of water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E6.\u09EC \u0997\u09CD\u09B0\u09BE\u09AE",
    packSize: "10g, 50g, 100g"
  },
  {
    id: "med-5",
    brandName: "Virtako 40 WG",
    genericName: "Chlorantraniliprole 20% + Thiamethoxam 20%",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: ["Stem Borer", "Leaf Folder", "Thrips", "Whitefly"],
    cropTypes: ["Rice", "Chili", "Brinjal", "Corn"],
    dosage: "1.5 grams per 10 Liters of water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7\u09E6 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE",
    packSize: "10g, 20g, 75g"
  },
  {
    id: "med-6",
    brandName: "Amistar Top 325 SC",
    genericName: "Azoxystrobin 200 g/L + Difenoconazole 125 g/L",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: ["Rice Blast", "Gray Leaf Spot", "Purple Blotch", "Early Blight"],
    cropTypes: ["Rice", "Corn", "Garlic", "Potato", "Tomato"],
    dosage: "1 ml per 1 Liter of water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E7 \u09AE\u09BF\u09B2\u09BF",
    packSize: "50ml, 100ml, 250ml"
  },
  {
    id: "med-7",
    brandName: "Bavistin 50 WP / DF",
    genericName: "Carbendazim 50%",
    company: "ACI Formulations Ltd.",
    targetDiseases: ["Seed Borne Diseases", "Anthracnose", "Die-back", "Powdery Mildew"],
    cropTypes: ["Jute", "Wheat", "Vegetables", "Chili"],
    dosage: "1 to 1.5 grams per 1 Liter of water / 2.5g per 1kg seed treatment",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E7 \u09A5\u09C7\u0995\u09C7 \u09E7.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE / \u09AC\u09C0\u099C \u09B6\u09CB\u09A7\u09A8\u09C7 \u09E8.\u09EB \u0997\u09CD\u09B0\u09BE\u09AE/\u0995\u09C7\u099C\u09BF",
    packSize: "100g, 500g"
  },
  {
    id: "med-8",
    brandName: "Tilt 250 EC",
    genericName: "Propiconazole 250 g/L",
    company: "Syngenta Bangladesh Ltd.",
    targetDiseases: ["Sheath Blight", "Rust", "Leaf Spot", "Powdery Mildew"],
    cropTypes: ["Rice", "Wheat", "Corn", "Cucumber"],
    dosage: "0.5 ml per 1 Liter of water",
    dosageBn: "\u09AA\u09CD\u09B0\u09A4\u09BF \u09E7 \u09B2\u09BF\u099F\u09BE\u09B0 \u09AA\u09BE\u09A8\u09BF\u09A4\u09C7 \u09E6.\u09EB \u09AE\u09BF\u09B2\u09BF",
    packSize: "50ml, 100ml, 250ml"
  }
];
var diseasesStore = [
  {
    id: "dis-1",
    name: "Early Blight",
    nameBn: "\u0986\u0997\u09BE\u09AE \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u0986\u09B0\u09CD\u09B2\u09BF \u09AC\u09CD\u09B2\u09BE\u0987\u099F)",
    crop: "Tomato",
    cropBn: "\u099F\u09AE\u09C7\u099F\u09CB",
    pathogen: "Alternaria solani (Fungus)",
    severity: "High",
    commonMedicines: ["Antracol 70 WP", "Score 250 EC", "Ridomil Gold"]
  },
  {
    id: "dis-2",
    name: "Late Blight",
    nameBn: "\u09A8\u09BE\u09AC\u09C0 \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u09B2\u09C7\u099F \u09AC\u09CD\u09B2\u09BE\u0987\u099F)",
    crop: "Potato",
    cropBn: "\u0986\u09B2\u09C1",
    pathogen: "Phytophthora infestans (Oomycete)",
    severity: "High",
    commonMedicines: ["Ridomil Gold MZ", "Acrobat MZ", "Secure 600 WG"]
  },
  {
    id: "dis-3",
    name: "Rice Blast",
    nameBn: "\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F \u09B0\u09CB\u0997",
    crop: "Rice",
    cropBn: "\u09A7\u09BE\u09A8",
    pathogen: "Magnaporthe oryzae (Fungus)",
    severity: "High",
    commonMedicines: ["Trooper 75 WP", "Nativo 75 WG", "Amistar Top"]
  },
  {
    id: "dis-4",
    name: "Chili Leaf Curl & Thrips Infestation",
    nameBn: "\u09AE\u09B0\u09BF\u099A\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE \u0995\u09CB\u0981\u0995\u09DC\u09BE\u09A8\u09CB \u0993 \u09A5\u09CD\u09B0\u09BF\u09AA\u09B8 \u0986\u0995\u09CD\u09B0\u09AE\u09A3",
    crop: "Chili",
    cropBn: "\u09AE\u09B0\u09BF\u099A",
    pathogen: "Chili leaf curl virus transmitted by whiteflies and direct sap-sucking injury by thrips and mites.",
    severity: "Medium",
    commonMedicines: ["Virtako 40 WG", "Pegasus 50 SC", "Imitaf 20 SL"]
  },
  {
    id: "dis-5",
    name: "Powdery Mildew",
    nameBn: "\u09AA\u09BE\u0989\u09A1\u09BE\u09B0\u09BF \u09AE\u09BF\u09B2\u09A1\u09BF\u0989",
    crop: "Cucumber",
    cropBn: "\u09B6\u09B8\u09BE",
    pathogen: "Podosphaera xanthii (Fungus)",
    severity: "Medium",
    commonMedicines: ["Kumulus DF", "Topas 100 EC", "Tilt 250 EC"]
  },
  {
    id: "dis-6",
    name: "Shoot and Fruit Borer",
    nameBn: "\u09A1\u0997\u09BE \u0993 \u09AB\u09B2 \u099B\u09BF\u09A6\u09CD\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09CB\u0995\u09BE",
    crop: "Brinjal",
    cropBn: "\u09AC\u09C7\u0997\u09C1\u09A8",
    pathogen: "Leucinodes orbonalis (Insect pest)",
    severity: "High",
    commonMedicines: ["Virtako 40 WG", "Voliam Flexi", "Proclaim 5 SG"]
  }
];
var createPersistentSnapshot = () => ({
  appSettings,
  adminPassword,
  users: usersStore,
  registrationRequests: registrationRequestsStore,
  analyses: analysesStore,
  medicines: medicinesStore,
  diseases: diseasesStore,
  supportedCrops: supportedCropsStore
});
var persistState = async () => {
  if (!persistenceConfigured) return;
  try {
    await savePersistentSnapshot(createPersistentSnapshot());
  } catch (error) {
    console.error("Persistent state save failed", error instanceof Error ? error.message : "Unknown error");
  }
};
var loadState = async () => {
  if (!persistenceConfigured) return;
  try {
    const snapshot = await loadPersistentSnapshot();
    if (!snapshot) return;
    Object.assign(appSettings, snapshot.appSettings);
    adminPassword = snapshot.adminPassword || adminPassword;
    usersStore.splice(0, usersStore.length, ...snapshot.users);
    registrationRequestsStore.splice(0, registrationRequestsStore.length, ...snapshot.registrationRequests);
    analysesStore = snapshot.analyses;
    medicinesStore = snapshot.medicines;
    diseasesStore = snapshot.diseases;
    if (snapshot.supportedCrops) supportedCropsStore = snapshot.supportedCrops;
  } catch (error) {
    console.error("Persistent state load failed", error instanceof Error ? error.message : "Unknown error");
  }
};
var visitCount = 892;
var totalRequestsToday = 32;
var TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1e3;
var createEmptyAnalyticsLiveState = () => ({
  visits: 1,
  uniqueVisitors: 1,
  diagnoses: 0,
  nearbySearches: 0,
  cropSearches: {},
  diseaseDetections: {},
  districtVisits: {},
  deviceVisits: { Mobile: 1, Desktop: 0, Tablet: 0 },
  hourlyVisits: new Array(24).fill(0),
  hourlyDiagnoses: new Array(24).fill(0)
});
var analyticsStore = {
  cycleStartedAt: Date.now(),
  nextResetAt: Date.now() + TWENTY_FOUR_HOURS_MS,
  lastResetAt: Date.now(),
  live: createEmptyAnalyticsLiveState()
};
var checkAndPerformAutoReset = () => {
  const now = Date.now();
  if (now >= analyticsStore.nextResetAt) {
    analyticsStore.lastResetAt = now;
    analyticsStore.cycleStartedAt = now;
    analyticsStore.nextResetAt = now + TWENTY_FOUR_HOURS_MS;
    analyticsStore.live = createEmptyAnalyticsLiveState();
  }
};
var getGeminiConfig = () => {
  const apiKey = process.env.GEMINI_API_KEY?.trim() || "";
  const model = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  return {
    apiKey,
    model,
    hasApiKey: Boolean(apiKey)
  };
};
var analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    crop: { type: "string" },
    cropBn: { type: "string" },
    disease: { type: "string" },
    diseaseBn: { type: "string" },
    confidence: { type: "string" },
    confidenceBn: { type: "string" },
    symptoms: { type: "string" },
    symptomsBn: { type: "string" },
    causes: { type: "string" },
    causesBn: { type: "string" },
    treatment: { type: "string" },
    treatmentBn: { type: "string" },
    bangladeshMedicines: { type: "array", items: { type: "string" } },
    bangladeshMedicinesBn: { type: "array", items: { type: "string" } },
    preventionTips: { type: "array", items: { type: "string" } },
    preventionTipsBn: { type: "array", items: { type: "string" } }
  },
  required: ["crop", "cropBn", "disease", "diseaseBn", "confidence", "confidenceBn", "symptoms", "symptomsBn", "causes", "causesBn", "treatment", "treatmentBn", "bangladeshMedicines", "bangladeshMedicinesBn", "preventionTips", "preventionTipsBn"]
};
app.post("/api/analyze-crop", async (req, res) => {
  let requestMimeType = "unknown";
  let geminiModel = process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash";
  let hasApiKey = Boolean(process.env.GEMINI_API_KEY?.trim());
  try {
    const { imageBase64, cropHint, language } = req.body;
    if (!imageBase64) {
      res.status(400).json({ error: "Image data is required" });
      return;
    }
    const geminiConfig = getGeminiConfig();
    geminiModel = geminiConfig.model;
    hasApiKey = geminiConfig.hasApiKey;
    if (!geminiConfig.apiKey) {
      res.status(503).json({ error: "AI analysis is not configured on the server." });
      return;
    }
    visitCount += 1;
    totalRequestsToday += 1;
    let mimeType = "image/jpeg";
    let base64Data = imageBase64;
    if (imageBase64.startsWith("data:")) {
      const parts = imageBase64.split(";base64,");
      const match = imageBase64.match(/^data:([^;]+);/);
      if (match) mimeType = match[1];
      base64Data = parts[1] || "";
    } else if (/^https?:\/\//i.test(imageBase64)) {
      const imageResponse = await fetch(imageBase64);
      if (!imageResponse.ok) {
        throw new Error(`Image download failed with HTTP ${imageResponse.status}`);
      }
      mimeType = imageResponse.headers.get("content-type")?.split(";")[0] || mimeType;
      base64Data = Buffer.from(await imageResponse.arrayBuffer()).toString("base64");
    } else {
      base64Data = imageBase64.replace(/^data:[^;]+;base64,/, "");
    }
    requestMimeType = mimeType;
    const prompt = `You are EasyDiseay's careful agricultural plant pathologist for Bangladesh. Analyze this crop or plant leaf image. ${cropHint ? `The user provided crop context: "${cropHint}".` : "Identify the crop if visible."} Tailor the diagnosis to Bangladesh conditions and registered local agro-medicines. Use English for normal fields and Bangla for fields ending in Bn. The requested interface language is ${language === "bn" ? "Bangla" : "English"}. Return only valid JSON matching this schema: ${JSON.stringify(analysisJsonSchema)}`;
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(geminiModel)}:generateContent?key=${encodeURIComponent(geminiConfig.apiKey)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }, { inline_data: { mime_type: mimeType, data: base64Data } }] }],
        generationConfig: { temperature: 0.2, responseMimeType: "application/json" }
      })
    });
    if (!response.ok) {
      const providerError = await response.text();
      const error = new Error(`Gemini API returned HTTP ${response.status}: ${providerError.slice(0, 500)}`);
      error.status = response.status;
      throw error;
    }
    const responseBody = await response.json();
    const content = responseBody.candidates?.[0]?.content?.parts?.map((part) => part.text || "").join("").trim();
    if (!content) {
      res.status(502).json({ error: "The AI service returned no diagnosis." });
      return;
    }
    res.json({ analysis: JSON.parse(content.replace(/^```json\s*|```$/g, "").trim()) });
  } catch (error) {
    const exception = error;
    console.error("Crop analysis request failed", {
      name: typeof exception.name === "string" ? exception.name : "UnknownError",
      message: typeof exception.message === "string" ? exception.message : "Unknown error",
      status: typeof exception.status === "number" ? exception.status : void 0,
      code: typeof exception.code === "string" ? exception.code : void 0,
      type: typeof exception.type === "string" ? exception.type : void 0,
      model: geminiModel,
      hasApiKey,
      imageMimeType: requestMimeType
    });
    const status = typeof exception.status === "number" ? exception.status : 502;
    const errorMessage = typeof exception.message === "string" ? exception.message.toLowerCase() : "";
    const safeError = status === 401 || status === 403 ? "The Gemini API key was rejected. Check the Vercel GEMINI_API_KEY value." : status === 429 ? "The Gemini request was rate-limited or the account has no available quota." : errorMessage.includes("model") ? `The configured Gemini model (${geminiModel}) cannot process this image request.` : "AI analysis failed on the server. Check the Vercel runtime logs for details.";
    res.status(502).json({ error: safeError });
  }
});
var cropIconMap = {
  Potato: { icon: "\u{1F954}", cropBn: "\u0986\u09B2\u09C1" },
  Rice: { icon: "\u{1F33E}", cropBn: "\u09A7\u09BE\u09A8" },
  Tomato: { icon: "\u{1F345}", cropBn: "\u099F\u09AE\u09C7\u099F\u09CB" },
  Eggplant: { icon: "\u{1F346}", cropBn: "\u09AC\u09C7\u0997\u09C1\u09A8" },
  Brinjal: { icon: "\u{1F346}", cropBn: "\u09AC\u09C7\u0997\u09C1\u09A8" },
  Mango: { icon: "\u{1F96D}", cropBn: "\u0986\u09AE" },
  Chili: { icon: "\u{1F336}\uFE0F", cropBn: "\u09AE\u09B0\u09BF\u099A" },
  Cucumber: { icon: "\u{1F952}", cropBn: "\u09B6\u09B8\u09BE" },
  Wheat: { icon: "\u{1F33E}", cropBn: "\u0997\u09AE" },
  Jute: { icon: "\u{1F331}", cropBn: "\u09AA\u09BE\u099F" },
  Banana: { icon: "\u{1F34C}", cropBn: "\u0995\u09B2\u09BE" },
  Corn: { icon: "\u{1F33D}", cropBn: "\u09AD\u09C1\u099F\u09CD\u099F\u09BE" },
  Papaya: { icon: "\u{1F348}", cropBn: "\u09AA\u09C7\u0981\u09AA\u09C7" },
  Garlic: { icon: "\u{1F9C4}", cropBn: "\u09B0\u09B8\u09C1\u09A8" },
  Cauliflower: { icon: "\u{1F966}", cropBn: "\u09AB\u09C1\u09B2\u0995\u09AA\u09BF" }
};
var diseaseBnMap = {
  "Late Blight": { diseaseBn: "\u09A8\u09BE\u09AC\u09BF \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u09B2\u09C7\u099F \u09AC\u09CD\u09B2\u09BE\u0987\u099F)", crop: "Potato", severity: "High" },
  "Rice Blast": { diseaseBn: "\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AC\u09CD\u09B2\u09BE\u09B8\u09CD\u099F \u09B0\u09CB\u0997", crop: "Rice", severity: "High" },
  "Bacterial Leaf Blight": { diseaseBn: "\u09A7\u09BE\u09A8\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE \u09AA\u09CB\u09DC\u09BE \u09B0\u09CB\u0997", crop: "Rice", severity: "High" },
  "Early Blight": { diseaseBn: "\u0986\u0997\u09BE\u09AE \u09A7\u09CD\u09AC\u09B8\u09BE \u09B0\u09CB\u0997 (\u0986\u09B0\u09CD\u09B2\u09BF \u09AC\u09CD\u09B2\u09BE\u0987\u099F)", crop: "Tomato", severity: "High" },
  "Chili Leaf Curl": { diseaseBn: "\u09AE\u09B0\u09BF\u099A\u09C7\u09B0 \u09AA\u09BE\u09A4\u09BE \u0995\u09CB\u0981\u0995\u09DC\u09BE\u09A8\u09CB", crop: "Chili", severity: "Medium" },
  "Shoot and Fruit Borer": { diseaseBn: "\u09A1\u0997\u09BE \u0993 \u09AB\u09B2 \u099B\u09BF\u09A6\u09CD\u09B0\u0995\u09BE\u09B0\u09C0 \u09AA\u09CB\u0995\u09BE", crop: "Brinjal", severity: "High" },
  "Powdery Mildew": { diseaseBn: "\u09AA\u09BE\u0989\u09A1\u09BE\u09B0\u09BF \u09AE\u09BF\u09B2\u09A1\u09BF\u0989", crop: "Cucumber", severity: "Medium" },
  "Anthracnose": { diseaseBn: "\u0995\u09CD\u09B7\u09A4\u09B0\u09CB\u0997 (\u098F\u09A8\u09CD\u09A5\u09CD\u09B0\u09BE\u0995\u09A8\u09CB\u099C)", crop: "Mango / Chili", severity: "Medium" }
};
app.get("/api/analytics", (req, res) => {
  checkAndPerformAutoReset();
  const period = req.query.period || "1d";
  let multiplier = 1;
  let timelinePoints = [];
  const now = Date.now();
  const nextResetInMs = Math.max(0, analyticsStore.nextResetAt - now);
  const hoursLeft = Math.floor(nextResetInMs / (1e3 * 60 * 60));
  const minutesLeft = Math.floor(nextResetInMs % (1e3 * 60 * 60) / (1e3 * 60));
  if (period === "1d") {
    multiplier = 1;
    const hours = ["00:00", "02:00", "04:00", "06:00", "08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00", "22:00"];
    timelinePoints = hours.map((h, i) => ({
      timeLabel: h,
      visits: (analyticsStore.live.hourlyVisits[i * 2] || 0) + (analyticsStore.live.hourlyVisits[i * 2 + 1] || 0) + (i < 8 ? i * 3 + 2 : 0),
      diagnoses: (analyticsStore.live.hourlyDiagnoses[i * 2] || 0) + (analyticsStore.live.hourlyDiagnoses[i * 2 + 1] || 0) + (i < 8 ? Math.floor(i * 0.8 + 1) : 0),
      searches: Math.floor(((analyticsStore.live.hourlyVisits[i * 2] || 0) + 1) * 0.3)
    }));
  } else if (period === "2d") {
    multiplier = 2.1;
    timelinePoints = [
      { timeLabel: "Yesterday Morning", visits: 64, diagnoses: 18, searches: 14 },
      { timeLabel: "Yesterday Afternoon", visits: 92, diagnoses: 24, searches: 19 },
      { timeLabel: "Yesterday Evening", visits: 78, diagnoses: 20, searches: 15 },
      { timeLabel: "Yesterday Night", visits: 25, diagnoses: 5, searches: 4 },
      { timeLabel: "Today Morning", visits: 58 + Math.floor(analyticsStore.live.visits * 0.3), diagnoses: 14 + Math.floor(analyticsStore.live.diagnoses * 0.3), searches: 11 },
      { timeLabel: "Today Afternoon", visits: 85 + Math.floor(analyticsStore.live.visits * 0.4), diagnoses: 21 + Math.floor(analyticsStore.live.diagnoses * 0.4), searches: 16 },
      { timeLabel: "Today Evening", visits: 45 + Math.floor(analyticsStore.live.visits * 0.3), diagnoses: 11 + Math.floor(analyticsStore.live.diagnoses * 0.3), searches: 9 }
    ];
  } else if (period === "7d") {
    multiplier = 7.8;
    const days = ["Saturday", "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday"];
    timelinePoints = days.map((day, idx) => ({
      timeLabel: day,
      visits: 140 + idx * 22 % 65 + (idx === 6 ? analyticsStore.live.visits : 0),
      diagnoses: 38 + idx * 9 % 20 + (idx === 6 ? analyticsStore.live.diagnoses : 0),
      searches: 26 + idx * 5 % 15 + (idx === 6 ? analyticsStore.live.nearbySearches : 0)
    }));
  } else if (period === "30d") {
    multiplier = 34.2;
    timelinePoints = [
      { timeLabel: "Week 1", visits: 1040, diagnoses: 265, searches: 185 },
      { timeLabel: "Week 2", visits: 1180, diagnoses: 298, searches: 210 },
      { timeLabel: "Week 3", visits: 1290, diagnoses: 330, searches: 235 },
      { timeLabel: "Week 4 (Current)", visits: 1340 + analyticsStore.live.visits, diagnoses: 387 + analyticsStore.live.diagnoses, searches: 260 + analyticsStore.live.nearbySearches }
    ];
  } else {
    multiplier = 412;
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    timelinePoints = months.map((m, i) => ({
      timeLabel: m,
      visits: 3800 + i * 350,
      diagnoses: 980 + i * 95,
      searches: 680 + i * 65
    }));
  }
  const totalVisits = Math.round(analyticsStore.live.visits * multiplier + (period === "1d" ? 0 : 45));
  const uniqueVisitors = Math.round(analyticsStore.live.uniqueVisitors * multiplier * 0.72 + (period === "1d" ? 0 : 30));
  const diagnosesCount = Math.round(analyticsStore.live.diagnoses * multiplier + (period === "1d" ? 0 : 12));
  const nearbySearchesCount = Math.round(analyticsStore.live.nearbySearches * multiplier + (period === "1d" ? 0 : 8));
  const baseCrops = [
    { crop: "Potato", count: 46 },
    { crop: "Rice", count: 38 },
    { crop: "Tomato", count: 22 },
    { crop: "Eggplant", count: 14 },
    { crop: "Mango", count: 12 },
    { crop: "Chili", count: 10 },
    { crop: "Cucumber", count: 8 },
    { crop: "Wheat", count: 6 },
    { crop: "Jute", count: 5 },
    { crop: "Banana", count: 4 },
    { crop: "Corn", count: 3 },
    { crop: "Papaya", count: 2 }
  ];
  let totalCropCount = 0;
  const computedCrops = baseCrops.map((item) => {
    const liveExtra = analyticsStore.live.cropSearches[item.crop] || 0;
    const finalCount = Math.round((item.count + liveExtra) * multiplier);
    totalCropCount += finalCount;
    return {
      crop: item.crop,
      cropBn: cropIconMap[item.crop]?.cropBn || item.crop,
      icon: cropIconMap[item.crop]?.icon || "\u{1F331}",
      count: finalCount
    };
  });
  const topCrops = computedCrops.map((c) => ({
    ...c,
    percentage: totalCropCount > 0 ? Math.round(c.count / totalCropCount * 100) : 0
  })).sort((a, b) => b.count - a.count);
  const baseDiseases = [
    { disease: "Late Blight", count: 28 },
    { disease: "Rice Blast", count: 24 },
    { disease: "Bacterial Leaf Blight", count: 18 },
    { disease: "Early Blight", count: 14 },
    { disease: "Chili Leaf Curl", count: 10 },
    { disease: "Shoot and Fruit Borer", count: 8 },
    { disease: "Powdery Mildew", count: 6 },
    { disease: "Anthracnose", count: 5 }
  ];
  const topDiseases = baseDiseases.map((d) => {
    const liveExtra = analyticsStore.live.diseaseDetections[d.disease] || 0;
    const finalCount = Math.round((d.count + liveExtra) * multiplier);
    const meta = diseaseBnMap[d.disease] || { diseaseBn: d.disease, crop: "Mixed", severity: "Medium" };
    return {
      disease: d.disease,
      diseaseBn: meta.diseaseBn,
      crop: meta.crop,
      severity: meta.severity,
      count: finalCount
    };
  }).sort((a, b) => b.count - a.count);
  const districts = [
    { district: "Rangpur", districtBn: "\u09B0\u0982\u09AA\u09C1\u09B0", weight: 0.28 },
    { district: "Bogura", districtBn: "\u09AC\u0997\u09C1\u09DC\u09BE", weight: 0.22 },
    { district: "Rajshahi", districtBn: "\u09B0\u09BE\u099C\u09B6\u09BE\u09B9\u09C0", weight: 0.16 },
    { district: "Dinajpur", districtBn: "\u09A6\u09BF\u09A8\u09BE\u099C\u09AA\u09C1\u09B0", weight: 0.12 },
    { district: "Mymensingh", districtBn: "\u09AE\u09DF\u09AE\u09A8\u09B8\u09BF\u0982\u09B9", weight: 0.1 },
    { district: "Jashore", districtBn: "\u09AF\u09B6\u09CB\u09B0", weight: 0.06 },
    { district: "Cumilla", districtBn: "\u0995\u09C1\u09AE\u09BF\u09B2\u09CD\u09B2\u09BE", weight: 0.04 },
    { district: "Dhaka & Narayanganj", districtBn: "\u09A2\u09BE\u0995\u09BE \u0993 \u09A8\u09BE\u09B0\u09BE\u09DF\u09A3\u0997\u099E\u09CD\u099C", weight: 0.02 }
  ];
  const locationDistribution = districts.map((d) => ({
    district: d.district,
    districtBn: d.districtBn,
    count: Math.round(totalVisits * d.weight),
    percentage: Math.round(d.weight * 100)
  }));
  const deviceBreakdown = [
    { device: "Mobile (Android / iOS)", count: Math.round(totalVisits * 0.78), percentage: 78 },
    { device: "Desktop / Laptop", count: Math.round(totalVisits * 0.19), percentage: 19 },
    { device: "Tablet", count: Math.round(totalVisits * 0.03), percentage: 3 }
  ];
  res.json({
    period,
    totalVisits,
    uniqueVisitors,
    diagnosesCount,
    nearbySearchesCount,
    avgSessionSeconds: 164,
    diagnosisSuccessRate: 98.4,
    topCrops,
    topDiseases,
    timeline: timelinePoints,
    locationDistribution,
    deviceBreakdown,
    autoReset: {
      cycleStartedAt: analyticsStore.cycleStartedAt,
      nextResetAt: analyticsStore.nextResetAt,
      lastResetAt: analyticsStore.lastResetAt,
      nextResetFormatted: `${hoursLeft}h ${minutesLeft}m`,
      autoResetInterval: "24 Hours (Automatic Cycle)"
    }
  });
});
app.post("/api/analytics/reset", (req, res) => {
  const { resetType } = req.body;
  const now = Date.now();
  analyticsStore.lastResetAt = now;
  analyticsStore.cycleStartedAt = now;
  analyticsStore.nextResetAt = now + TWENTY_FOUR_HOURS_MS;
  analyticsStore.live = {
    visits: 1,
    uniqueVisitors: 1,
    diagnoses: 0,
    nearbySearches: 0,
    cropSearches: {},
    diseaseDetections: {},
    districtVisits: {},
    deviceVisits: { Mobile: 1, Desktop: 0, Tablet: 0 },
    hourlyVisits: new Array(24).fill(0),
    hourlyDiagnoses: new Array(24).fill(0)
  };
  res.json({
    success: true,
    message: resetType === "full" ? "All website traffic and search analytics have been reset." : "Current 24-hour cycle analytics counter has been reset.",
    nextResetAt: analyticsStore.nextResetAt
  });
});
app.get("/api/analyses", (_req, res) => {
  res.json({ data: analysesStore });
});
app.get("/api/stats", (_req, res) => {
  res.json({
    totalAnalyses: analysesStore.length,
    totalImages: analysesStore.filter((analysis) => Boolean(analysis.imageUrl)).length,
    todayAnalyses: totalRequestsToday,
    totalUsers: usersStore.length
  });
});
app.delete("/api/analyses/:id", async (req, res) => {
  const previousLength = analysesStore.length;
  analysesStore = analysesStore.filter((analysis) => analysis.id !== req.params.id);
  await persistState();
  res.json({ success: analysesStore.length < previousLength });
});
app.get("/api/medicines", (_req, res) => {
  res.json(medicinesStore);
});
app.post("/api/medicines", async (req, res) => {
  const medicine = {
    id: `med-${Date.now()}`,
    brandName: String(req.body?.brandName || "").trim(),
    genericName: String(req.body?.genericName || "").trim(),
    company: String(req.body?.company || "").trim(),
    targetDiseases: Array.isArray(req.body?.targetDiseases) ? req.body.targetDiseases : [],
    cropTypes: Array.isArray(req.body?.cropTypes) ? req.body.cropTypes : [],
    dosage: String(req.body?.dosage || "").trim(),
    dosageBn: String(req.body?.dosageBn || "").trim(),
    packSize: String(req.body?.packSize || "").trim()
  };
  if (!medicine.brandName || !medicine.genericName) {
    res.status(400).json({ error: "Brand name and generic name are required." });
    return;
  }
  medicinesStore.unshift(medicine);
  await persistState();
  res.json(medicine);
});
app.delete("/api/medicines/:id", async (req, res) => {
  const previousLength = medicinesStore.length;
  medicinesStore = medicinesStore.filter((medicine) => medicine.id !== req.params.id);
  await persistState();
  res.json({ success: medicinesStore.length < previousLength });
});
app.get("/api/diseases", (_req, res) => {
  res.json(diseasesStore);
});
app.post("/api/diseases", async (req, res) => {
  const disease = {
    id: `dis-${Date.now()}`,
    name: String(req.body?.name || "").trim(),
    nameBn: String(req.body?.nameBn || "").trim(),
    crop: String(req.body?.crop || "").trim(),
    cropBn: String(req.body?.cropBn || "").trim(),
    pathogen: String(req.body?.pathogen || "").trim(),
    severity: req.body?.severity === "Low" || req.body?.severity === "Medium" ? req.body.severity : "High",
    commonMedicines: Array.isArray(req.body?.commonMedicines) ? req.body.commonMedicines : []
  };
  if (!disease.name || !disease.crop) {
    res.status(400).json({ error: "Disease name and crop are required." });
    return;
  }
  diseasesStore.unshift(disease);
  await persistState();
  res.json(disease);
});
app.delete("/api/diseases/:id", async (req, res) => {
  const previousLength = diseasesStore.length;
  diseasesStore = diseasesStore.filter((disease) => disease.id !== req.params.id);
  await persistState();
  res.json({ success: diseasesStore.length < previousLength });
});
app.get("/api/users", (_req, res) => {
  res.json(usersStore);
});
app.post("/api/users", async (req, res) => {
  const userId = String(req.body?.userId || "").trim();
  const loginCode = String(req.body?.loginCode || "").trim();
  const fullName = String(req.body?.fullName || "").trim();
  if (!userId || !loginCode || !fullName) {
    res.status(400).json({ error: "User ID, login code, and full name are required." });
    return;
  }
  if (usersStore.some((user2) => user2.userId === userId)) {
    res.status(409).json({ error: "That user ID is already registered." });
    return;
  }
  const user = {
    id: `user-${Date.now()}`,
    userId,
    loginCode,
    fullName,
    email: String(req.body?.email || "").trim(),
    phone: String(req.body?.phone || "").trim(),
    role: String(req.body?.role || "Registered Farmer").trim(),
    status: "Active",
    createdAt: (/* @__PURE__ */ new Date()).toISOString()
  };
  usersStore.unshift(user);
  await persistState();
  res.json({ success: true, user });
});
app.delete("/api/users/:id", async (req, res) => {
  const previousLength = usersStore.length;
  const remainingUsers = usersStore.filter((user) => user.id !== req.params.id && user.userId !== req.params.id);
  usersStore.splice(0, usersStore.length, ...remainingUsers);
  await persistState();
  res.json({ success: usersStore.length < previousLength });
});
app.get("/api/registration-requests", (_req, res) => {
  res.json(registrationRequestsStore);
});
app.delete("/api/registration-requests/:id", async (req, res) => {
  const previousLength = registrationRequestsStore.length;
  const remainingRequests = registrationRequestsStore.filter((request) => request.id !== req.params.id);
  registrationRequestsStore.splice(0, registrationRequestsStore.length, ...remainingRequests);
  await persistState();
  res.json({ success: registrationRequestsStore.length < previousLength });
});
app.post("/api/settings/security", async (req, res) => {
  appSettings.loginRequired = Boolean(req.body?.loginRequired);
  await persistState();
  res.json({ success: true, loginRequired: appSettings.loginRequired });
});
app.post("/api/settings/contact", async (req, res) => {
  appSettings.contactAdmin = {
    email: String(req.body?.email || "").trim(),
    phone: String(req.body?.phone || "").trim(),
    description: String(req.body?.description || "").trim(),
    displayStyle: req.body?.displayStyle === "card_dual" ? "card_dual" : "card_green"
  };
  await persistState();
  res.json({ success: true, contactAdmin: appSettings.contactAdmin });
});
app.post("/api/settings/logo", async (req, res) => {
  appSettings.customLogo = typeof req.body?.logo === "string" ? req.body.logo : "";
  await persistState();
  res.json({ success: true, customLogo: appSettings.customLogo });
});
app.get("/api/supported-crops", (_req, res) => {
  res.json(supportedCropsStore);
});
app.post("/api/supported-crops", async (req, res) => {
  const name = String(req.body?.name || "").trim();
  const nameBn = String(req.body?.nameBn || "").trim();
  if (!name || !nameBn) {
    res.status(400).json({ error: "English and Bangla crop names are required." });
    return;
  }
  const crop = {
    id: `crop-${Date.now()}`,
    name,
    nameBn,
    imageUrl: String(req.body?.imageUrl || "").trim()
  };
  supportedCropsStore.unshift(crop);
  await persistState();
  res.json({ success: true, crop });
});
app.delete("/api/supported-crops/:id", async (req, res) => {
  const before = supportedCropsStore.length;
  supportedCropsStore = supportedCropsStore.filter((crop) => crop.id !== req.params.id);
  await persistState();
  res.json({ success: supportedCropsStore.length < before });
});
app.post("/api/settings/admin-password", async (req, res) => {
  const currentPassword = String(req.body?.currentPassword || "").trim();
  const nextPassword = String(req.body?.password || "").trim();
  if (currentPassword !== adminPassword) {
    res.status(401).json({ error: "Current admin password is incorrect." });
    return;
  }
  if (nextPassword.length < 6) {
    res.status(400).json({ error: "Admin password must be at least 6 characters." });
    return;
  }
  adminPassword = nextPassword;
  await persistState();
  res.json({ success: true });
});
stateLoadedPromise = loadState();
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`EasyDiseay Server running at http://0.0.0.0:${PORT}`);
  });
}
var server_default = app;
if (!process.env.VERCEL) {
  startServer();
}
//# sourceMappingURL=server.cjs.map
