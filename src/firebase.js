import { initializeApp } from 'firebase/app';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore, collection, getDocs, getDoc, doc, addDoc, updateDoc, deleteDoc, query, orderBy, where, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { getTenantPath, getTenantStoragePath } from './config/tenant';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyB_PKD4rZR4KdomuZS8iroi7s_yBvw3sVQ",
  authDomain: "toursandtravels-462f7.firebaseapp.com",
  projectId: "toursandtravels-462f7",
  storageBucket: "toursandtravels-462f7.firebasestorage.app",
  messagingSenderId: "193003256534",
  appId: "1:193003256534:web:f5f3d6ab9fa70175b86777",
  measurementId: "G-VM7KYJ6J2Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);

export const db = getFirestore(app);
export const storage = getStorage(app);

console.log('Firebase initialized successfully');

// Base collection names (without tenant prefix)
const BASE_COLLECTIONS = {
  CATEGORIES: 'categories',
  TRIPS: 'trips',
  BOOKINGS: 'bookings',
  TESTIMONIALS: 'testimonials',
  GALLERY: 'gallery',
  ADDONS: 'addons',
  CONTACTS: 'contacts',
  LEADS: 'leads'
};

// Tenant-aware collections - automatically prefixed with tenant path
export const collections = {
  CATEGORIES: getTenantPath(BASE_COLLECTIONS.CATEGORIES),
  TRIPS: getTenantPath(BASE_COLLECTIONS.TRIPS),
  BOOKINGS: getTenantPath(BASE_COLLECTIONS.BOOKINGS),
  TESTIMONIALS: getTenantPath(BASE_COLLECTIONS.TESTIMONIALS),
  GALLERY: getTenantPath(BASE_COLLECTIONS.GALLERY),
  ADDONS: getTenantPath(BASE_COLLECTIONS.ADDONS),
  CONTACTS: getTenantPath(BASE_COLLECTIONS.CONTACTS),
  LEADS: getTenantPath(BASE_COLLECTIONS.LEADS)
};

// Real-time data listeners
export const subscribeToCategories = (callback) => {
  console.log('Subscribing to categories...');
  const q = query(collection(db, collections.CATEGORIES), orderBy('order', 'asc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Categories loaded:', data.length);
    callback(data);
  }, (error) => {
    console.error('Error subscribing to categories:', error);
  });
};

export const subscribeToTrips = (callback, categoryId = null) => {
  console.log('Subscribing to trips, categoryId:', categoryId);
  let q;
  if (categoryId) {
    q = query(collection(db, collections.TRIPS), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'));
  } else {
    q = query(collection(db, collections.TRIPS), orderBy('createdAt', 'desc'));
  }
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Trips loaded:', data.length, data);
    callback(data);
  }, (error) => {
    console.error('Error subscribing to trips:', error);
  });
};

export const subscribeToBookings = (callback) => {
  console.log('Subscribing to bookings...');
  const q = query(collection(db, collections.BOOKINGS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Bookings loaded:', data.length);
    callback(data);
  }, (error) => {
    console.error('Error subscribing to bookings:', error);
  });
};

export const subscribeToTestimonials = (callback) => {
  console.log('Subscribing to testimonials...');
  const q = query(collection(db, collections.TESTIMONIALS), orderBy('createdAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Testimonials loaded:', data.length);
    callback(data);
  }, (error) => {
    console.error('Error subscribing to testimonials:', error);
  });
};

// Categories CRUD
export const getCategories = async () => {
  console.log('Fetching categories...');
  try {
    const q = query(collection(db, collections.CATEGORIES), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Categories fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return [];
  }
};

export const addCategory = async (data) => {
  console.log('Adding category:', data);
  try {
    const result = await addDoc(collection(db, collections.CATEGORIES), { ...data, createdAt: new Date().toISOString() });
    console.log('Category added with ID:', result.id);
    return result;
  } catch (error) {
    console.error('Error adding category:', error);
    throw error;
  }
};

export const updateCategory = async (id, data) => {
  console.log('Updating category:', id, data);
  try {
    await updateDoc(doc(db, collections.CATEGORIES, id), { ...data, updatedAt: new Date().toISOString() });
    console.log('Category updated successfully');
  } catch (error) {
    console.error('Error updating category:', error);
    throw error;
  }
};

export const deleteCategory = async (id) => {
  console.log('Deleting category:', id);
  try {
    await deleteDoc(doc(db, collections.CATEGORIES, id));
    console.log('Category deleted successfully');
  } catch (error) {
    console.error('Error deleting category:', error);
    throw error;
  }
};

// Trips CRUD
export const getTrips = async (categoryId = null, includeHidden = false) => {
  console.log('Fetching trips, categoryId:', categoryId);
  try {
    let q;
    if (categoryId) {
      q = query(collection(db, collections.TRIPS), where('categoryId', '==', categoryId), orderBy('createdAt', 'desc'));
    } else {
      q = query(collection(db, collections.TRIPS), orderBy('createdAt', 'desc'));
    }
    const snapshot = await getDocs(q);
    let data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    if (!includeHidden) {
      data = data.filter(t => t.status !== 'hidden' && t.status !== 'inactive' && !t.hidden);
    }
    console.log('Trips fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching trips:', error);
    return [];
  }
};

export const getTripById = async (id, includeHidden = false) => {
  console.log('Fetching trip by ID:', id);
  try {
    const docRef = doc(db, collections.TRIPS, id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
      const data = { id: snapshot.id, ...snapshot.data() };
      if (!includeHidden && (data.status === 'hidden' || data.status === 'inactive' || data.hidden)) {
        console.log('Trip is hidden/inactive');
        return null;
      }
      console.log('Trip found:', data);
      return data;
    }
    console.log('Trip not found');
    return null;
  } catch (error) {
    console.error('Error fetching trip:', error);
    return null;
  }
};

export const addTrip = async (data) => {
  console.log('Adding trip:', data);
  try {
    const tripData = {
      ...data,
      createdAt: new Date().toISOString()
    };
    const result = await addDoc(collection(db, collections.TRIPS), tripData);
    console.log('Trip added with ID:', result.id);
    return result;
  } catch (error) {
    console.error('Error adding trip:', error);
    throw error;
  }
};

export const updateTrip = async (id, data) => {
  console.log('Updating trip:', id, data);
  try {
    await updateDoc(doc(db, collections.TRIPS, id), { ...data, updatedAt: new Date().toISOString() });
    console.log('Trip updated successfully');
  } catch (error) {
    console.error('Error updating trip:', error);
    throw error;
  }
};

export const deleteTrip = async (id) => {
  console.log('Deleting trip:', id);
  try {
    await deleteDoc(doc(db, collections.TRIPS, id));
    console.log('Trip deleted successfully');
  } catch (error) {
    console.error('Error deleting trip:', error);
    throw error;
  }
};

// Bookings CRUD
export const getBookings = async () => {
  console.log('Fetching bookings...');
  try {
    const q = query(collection(db, collections.BOOKINGS), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Bookings fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching bookings:', error);
    return [];
  }
};

export const addBooking = async (data) => {
  console.log('Adding booking:', data);
  try {
    const result = await addDoc(collection(db, collections.BOOKINGS), {
      ...data,
      status: 'pending',
      createdAt: new Date().toISOString()
    });
    console.log('Booking added with ID:', result.id);
    return result;
  } catch (error) {
    console.error('Error adding booking:', error);
    throw error;
  }
};

export const updateBookingStatus = async (id, status) => {
  console.log('Updating booking status:', id, status);
  try {
    await updateDoc(doc(db, collections.BOOKINGS, id), { status, updatedAt: new Date().toISOString() });
    console.log('Booking status updated successfully');
  } catch (error) {
    console.error('Error updating booking status:', error);
    throw error;
  }
};

// Testimonials CRUD
export const getTestimonials = async () => {
  console.log('Fetching testimonials...');
  try {
    const q = query(collection(db, collections.TESTIMONIALS), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Testimonials fetched:', data.length);
    return data;
  } catch (error) {
    console.error('Error fetching testimonials:', error);
    return [];
  }
};

export const addTestimonial = async (data) => {
  console.log('Adding testimonial:', data);
  try {
    const result = await addDoc(collection(db, collections.TESTIMONIALS), {
      ...data,
      createdAt: new Date().toISOString()
    });
    console.log('Testimonial added with ID:', result.id);
    return result;
  } catch (error) {
    console.error('Error adding testimonial:', error);
    throw error;
  }
};

export const deleteTestimonial = async (id) => {
  console.log('Deleting testimonial:', id);
  try {
    await deleteDoc(doc(db, collections.TESTIMONIALS, id));
    console.log('Testimonial deleted successfully');
  } catch (error) {
    console.error('Error deleting testimonial:', error);
    throw error;
  }
};

export const updateTestimonial = async (id, data) => {
  console.log('Updating testimonial:', id, data);
  try {
    await updateDoc(doc(db, collections.TESTIMONIALS, id), { ...data, updatedAt: new Date().toISOString() });
    console.log('Testimonial updated successfully');
  } catch (error) {
    console.error('Error updating testimonial:', error);
    throw error;
  }
};

// Image compression utility - compresses to 100-200KB max
export const compressImage = (file, maxSizeKB = 200, maxWidth = 1920) => {
  return new Promise((resolve) => {
    console.log('Compressing image:', file.name, file.size);
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (event) => {
      const img = new Image();
      img.src = event.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Scale down if larger than maxWidth
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);

        // Try different quality levels to get under maxSizeKB
        let quality = 0.85;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);

        // Reduce quality until under maxSizeKB
        while (compressedDataUrl.length > maxSizeKB * 1024 * 1.37 && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        // Convert data URL to blob
        const arr = compressedDataUrl.split(',');
        const mime = arr[0].match(/:(.*?);/)[1];
        const bstr = atob(arr[1]);
        let n = bstr.length;
        const u8arr = new Uint8Array(n);
        while (n--) {
          u8arr[n] = bstr.charCodeAt(n);
        }
        const compressedFile = new File([u8arr], file.name, { type: mime });
        console.log('Image compressed:', file.name, `${file.size} -> ${compressedFile.size} bytes`);
        resolve(compressedFile);
      };
    };
  });
};

// Storage Functions
export const uploadImage = async (file, path) => {
  const tenantPath = getTenantStoragePath(path);
  console.log('Uploading image:', tenantPath, file.size);
  try {
    const storageRef = ref(storage, tenantPath);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    console.log('Image uploaded successfully:', url);
    return url;
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
};

export const uploadCompressedImage = async (file, path, maxSizeKB = 200) => {
  const tenantPath = getTenantStoragePath(path);
  console.log('Uploading compressed image:', tenantPath);
  try {
    const compressedFile = await compressImage(file, maxSizeKB);
    const storageRef = ref(storage, tenantPath);
    await uploadBytes(storageRef, compressedFile);
    const url = await getDownloadURL(storageRef);
    console.log('Compressed image uploaded:', url);
    return url;
  } catch (error) {
    console.error('Error uploading compressed image:', error);
    throw error;
  }
};

export const uploadMultipleImages = async (files, path, maxSizeKB = 200) => {
  console.log('Uploading multiple images:', files.length);
  const urls = [];
  for (const file of files) {
    try {
      const url = await uploadCompressedImage(file, `${path}/${Date.now()}_${file.name}`, maxSizeKB);
      urls.push(url);
    } catch (error) {
      console.error('Error uploading image:', file.name, error);
    }
  }
  console.log('Multiple images uploaded:', urls.length);
  return urls;
};

export const deleteImage = async (path) => {
  const tenantPath = getTenantStoragePath(path);
  console.log('Deleting image:', tenantPath);
  try {
    const storageRef = ref(storage, tenantPath);
    await deleteObject(storageRef);
    console.log('Image deleted successfully');
  } catch (error) {
    console.error('Error deleting image:', error);
    throw error;
  }
};

// Leads CRUD
export const saveLead = async (phone, data) => {
  console.log('Saving lead under phone:', phone, data);
  try {
    const docRef = doc(db, collections.LEADS, phone);
    const docSnap = await getDoc(docRef);
    const timestamp = new Date().toISOString();
    if (docSnap.exists()) {
      await updateDoc(docRef, {
        ...data,
        updatedAt: timestamp
      });
    } else {
      await setDoc(docRef, {
        ...data,
        phone,
        createdAt: timestamp,
        updatedAt: timestamp
      });
    }
    console.log('Lead saved successfully');
  } catch (error) {
    console.error('Error saving lead:', error);
    throw error;
  }
};

export const updateBookingPaymentStatus = async (id, paymentStatus, screenshotUrl = null) => {
  console.log('Updating booking payment status:', id, paymentStatus);
  try {
    const updateData = { 
      paymentStatus, 
      updatedAt: new Date().toISOString() 
    };
    if (screenshotUrl) {
      updateData.paymentScreenshot = screenshotUrl;
    }
    await updateDoc(doc(db, collections.BOOKINGS, id), updateData);
    console.log('Booking payment status updated successfully');
  } catch (error) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
};

export const subscribeToLeads = (callback) => {
  console.log('Subscribing to leads...');
  const q = query(collection(db, collections.LEADS), orderBy('updatedAt', 'desc'));
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log('Leads loaded:', data.length);
    callback(data);
  }, (error) => {
    console.error('Error subscribing to leads:', error);
  });
};

export const deleteLead = async (phone) => {
  console.log('Deleting lead:', phone);
  try {
    await deleteDoc(doc(db, collections.LEADS, phone));
    console.log('Lead deleted successfully');
  } catch (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};

export default app;
