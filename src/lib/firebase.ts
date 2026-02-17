"use client";

import { initializeApp } from "firebase/app";
import { getAnalytics, type Analytics } from "firebase/analytics";
import { env } from "@/lib/env.mjs";

// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const defaultConfig = {
  apiKey: "AIzaSyDen2HziMsyDeIRl-esNdGqOa-EknfhXJM",
  authDomain: "leadhandler-web.firebaseapp.com",
  projectId: "leadhandler-web",
  storageBucket: "leadhandler-web.firebasestorage.app",
  messagingSenderId: "480886379534",
  appId: "1:480886379534:web:1a0dfb18cb3afa91abd85f",
  measurementId: "G-49HPYJ8BF3",
};

const firebaseConfig = {
  apiKey: env.client.NEXT_PUBLIC_FIREBASE_API_KEY || defaultConfig.apiKey,
  authDomain: env.client.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || defaultConfig.authDomain,
  projectId: env.client.NEXT_PUBLIC_FIREBASE_PROJECT_ID || defaultConfig.projectId,
  storageBucket: env.client.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || defaultConfig.storageBucket,
  messagingSenderId: env.client.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || defaultConfig.messagingSenderId,
  appId: env.client.NEXT_PUBLIC_FIREBASE_APP_ID || defaultConfig.appId,
  measurementId: env.client.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || defaultConfig.measurementId,
};

const hasConfig = !!(firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId);

const app = hasConfig ? initializeApp(firebaseConfig) : null;

let analytics: Analytics | null = null;
if (app && typeof window !== "undefined") {
  try {
    analytics = getAnalytics(app);
  } catch {
    // getAnalytics can throw in some SSR or restricted contexts
  }
}

export { app, analytics };
