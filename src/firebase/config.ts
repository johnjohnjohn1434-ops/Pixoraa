/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCAilX0GQnN127N1SxCJ861qMxAO0svNUQ",
  authDomain: "ff-id-store-dab0f.firebaseapp.com",
  databaseURL: "https://ff-id-store-dab0f-default-rtdb.firebaseio.com",
  projectId: "ff-id-store-dab0f",
  storageBucket: "ff-id-store-dab0f.firebasestorage.app",
  messagingSenderId: "655049193530",
  appId: "1:655049193530:web:9a3a0139fbbf6f98b8dd03",
  measurementId: "G-S67HPPTR5V"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
