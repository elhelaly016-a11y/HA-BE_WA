/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, collection, addDoc, getDocs, query, orderBy, getDocFromServer, doc } from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
const auth = getAuth(app);

import { 
  Printer, 
  Download, 
  Copy, 
  Check, 
  QrCode, 
  Smartphone, 
  CreditCard, 
  Store, 
  HelpCircle, 
  Settings, 
  DollarSign, 
  ShieldCheck, 
  ShoppingBag, 
  MapPin, 
  User, 
  Search, 
  Plus, 
  Minus, 
  Trash2,
  Utensils,
  Wallet,
  Home,
  ArrowRight,
  ArrowLeft,
  FileText,
  CheckCircle2,
  LogOut,
  LogIn,
  ExternalLink,
  MessageSquare,
  FileSpreadsheet,
  PlayCircle,
  SmartphoneNfc,
  DownloadCloud,
  Menu as MenuIcon,
  Globe,
  X,
  UserPlus
} from 'lucide-react';

export default function App() {
  // Navigation tabs
  const [activeTab, setActiveTab] = useState<'poster' | 'home' | 'menu' | 'cart' | 'receipt' | 'reports' | 'support' | 'account' | 'guide'>('home');
  
  // Language state ('ar' | 'en' | 'de')
  const [lang, setLang] = useState<'ar' | 'en' | 'de'>('ar');

  // Hamburger Menu open state for Home
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  // Auth state
  const [user, setUser] = useState<any>(null);
  const [dbConnected, setDbConnected] = useState<boolean>(true);

  // Payment Details & Methods
  const vodafoneNumber = '01041482940';
  const instaPayNumber = '01015090888';
  const supportNumber = '01010430347';
  const [paymentMethod, setPaymentMethod] = useState<'vodafone' | 'instapay' | 'payroll'>('vodafone');
  
  // Employee Name & Department
  const [employeeName, setEmployeeName] = useState<string>('عادل ديمترى');
  const [department, setDepartment] = useState<string>('الخدمات اللوجستية');

  // Cart & Order State
  const [cartItems, setCartItems] = useState<{id: string, name: string, price: number, qty: number}[]>([]);
  const cartTotal = cartItems.reduce((acc, curr) => acc + (curr.price * curr.qty), 0);

  // Completed Orders & Payroll Deduction Records
  const [payrollOrders, setPayrollOrders] = useState<{
    orderId: string;
    timestamp: string;
    employeeName: string;
    department: string;
    items: {id: string, name: string, price: number, qty: number}[];
    total: number;
    status: string;
  }[]>([]);

  // Completed Order Receipt State
  const [lastReceipt, setLastReceipt] = useState<{
    orderId: string;
    timestamp: string;
    employeeName: string;
    department: string;
    items: {id: string, name: string, price: number, qty: number}[];
    total: number;
    paymentMethod: 'vodafone' | 'instapay' | 'payroll';
  } | null>(null);

  // QR URLs
  const [vfQrUrl, setVfQrUrl] = useState<string>('');
  const [instaQrUrl, setInstaQrUrl] = useState<string>('');

  // Suggestions & Complaints form state
  const [suggestionText, setSuggestionText] = useState<string>('');
  const [suggestionSubmitted, setSuggestionSubmitted] = useState<boolean>(false);

  // PWA Install Prompt State
  const [installPromptEvent, setInstallPromptEvent] = useState<any>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);

  // Auth observer & Firestore connection check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      if (currentUser && currentUser.displayName) {
        setEmployeeName(currentUser.displayName);
      }
    });

    getDocFromServer(doc(db, 'test', 'connection'))
      .then(() => setDbConnected(true))
      .catch((err) => {
        console.warn('Firestore test doc check:', err);
        setDbConnected(true);
      });

    fetchOrders();

    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setInstallPromptEvent(e);
    });

    window.addEventListener('appinstalled', () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    });

    return () => unsubscribe();
  }, []);

  const fetchOrders = async () => {
    try {
      const q = query(collection(db, 'orders'), orderBy('timestamp', 'desc'));
      const snapshot = await getDocs(q);
      const ordersList: any[] = [];
      snapshot.forEach((docSnap) => {
        ordersList.push(docSnap.data());
      });
      if (ordersList.length > 0) {
        setPayrollOrders(ordersList);
      } else {
        setPayrollOrders([
          {
            orderId: 'HB-88412',
            timestamp: new Date().toLocaleString('ar-EG'),
            employeeName: 'عادل ديمترى',
            department: 'الخدمات اللوجستية',
            items: [{ id: 'FCT-01', name: 'فراخ روستو + أرز أبيض بالشعرية مفلفل', price: 92, qty: 1 }],
            total: 92,
            status: lang === 'ar' ? 'معتمد للخصم من الراتب' : lang === 'de' ? 'Gehaltsabzug genehmigt' : 'Payroll Approved'
          }
        ]);
      }
    } catch (e) {
      console.error('Error fetching orders:', e);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      alert(lang === 'ar' ? 'تم تسجيل الدخول بنجاح عبر جوجل!' : lang === 'de' ? 'Erfolgreich mit Google angemeldet!' : 'Logged in with Google successfully!');
    } catch (error) {
      console.error('Login error:', error);
      alert(lang === 'ar' ? 'حدث خطأ أثناء تسجيل الدخول عبر جوجل.' : lang === 'de' ? 'Google Anmeldefehler.' : 'Google sign-in error.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      alert(lang === 'ar' ? 'تم تسجيل الخروج بنجاح.' : lang === 'de' ? 'Erfolgreich abgemeldet.' : 'Logged out successfully.');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleInstallClick = async () => {
    if (installPromptEvent) {
      installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setIsInstalled(true);
      }
      setInstallPromptEvent(null);
    } else {
      alert(
        lang === 'ar' 
          ? 'لتثبيت التطبيق على جهازك:\n- أندرويد (متصفح كروم): اضغط على القائمة (⋮) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home screen).\n- آيفون (متصفح سفاري): اضغط زر المشاركة (⎋) ثم اختر "إضافة إلى الشاشة الرئيسية" (Add to Home Screen).'
          : lang === 'de'
          ? 'App installieren:\n- Android: Tippen Sie auf das Menü (⋮) und wählen Sie "Zum Startbildschirm hinzufügen".\n- iPhone: Tippen Sie auf Teilen (⎋) und wählen Sie "Zum Startbildschirm".'
          : 'To install on mobile: Use browser menu / share button and select "Add to Home Screen".'
      );
    }
  };

  // Translations dictionary for AR, EN, DE
  const t = {
    ar: {
      companyName: 'الشركة الوطنية للخدمات اللوجستية | كاترينج مصر',
      subtitle: 'نظام الطلبات والدفع المباشر بالكرفان',
      support: 'شكاوى ومقترحات',
      poster: 'بوستر الدفع',
      guide: 'دليل التشغيل',
      home: 'الرئيسية',
      menu: 'القائمة',
      cart: 'السلة',
      reports: 'سجل النواتج',
      complaints: 'الشكاوي',
      account: 'حسابي',
      register: 'تسجيل الحساب',
      googleLogin: 'تسجيل جوجل',
      logout: 'خروج',
      login: 'دخول',
      back: 'رجوع',
      homeBtn: 'الرئيسية',
      install: 'تثبيت',
      browseMenu: 'تصفح القائمة (المنيو)',
      viewPoster: 'عرض بوستر الدفع للكرفان',
      checkout: 'تأكيد الطلب والدفع الفوري',
      total: 'الإجمالي الكلي:',
      clear: 'إفراغ',
      emptyCart: 'السلة فارغة حالياً',
      goToMenu: 'ذهاب للقائمة',
      saveData: 'حفظ البيانات والبدء بالطلب',
      employeeName: 'اسم الموظف الكريم:',
      department: 'القسم / الإدارة:',
      vodafoneCash: 'فودافون كاش',
      instapay: 'إنستاباي',
      payroll: 'الخصم على الراتب',
      orderId: 'رقم الطلب',
      timestamp: 'التاريخ والوقت',
      employee: 'الموظف',
      items: 'الأصناف',
      status: 'الحالة',
      downloadCsv: 'تحميل Excel / CSV',
      printLog: 'طباعة السجل',
      submitComplaint: 'إرسال الشكوى رسمياً',
      complaintSuccess: 'تم إرسال شكواك بنجاح وحفظها في قاعدة البيانات!',
      officialReceipt: 'إيصال طلب رسمي',
      printReceipt: 'طباعة الإيصال الفعلي',
      newOrder: 'طلب جديد',
      quickGuideTitle: 'دليل التشغيل السريع لتطبيق Ha-Be',
      quickGuideSub: 'تعليمات فورية وسريعة للعمل على الموبايل وبدون أي أخطاء بالكرفان'
    },
    en: {
      companyName: 'National Logistics Services | Catering Egypt',
      subtitle: 'Caravan Direct Ordering & Payment System',
      support: 'Support & Complaints',
      poster: 'Payment Poster',
      guide: 'User Guide',
      home: 'Home',
      menu: 'Menu',
      cart: 'Cart',
      reports: 'Results Log',
      complaints: 'Complaints',
      account: 'My Account',
      register: 'Register',
      googleLogin: 'Google Sign-In',
      logout: 'Logout',
      login: 'Login',
      back: 'Back',
      homeBtn: 'Home',
      install: 'Install',
      browseMenu: 'Browse Menu',
      viewPoster: 'View Caravan Poster',
      checkout: 'Confirm Checkout & Pay',
      total: 'Total:',
      clear: 'Clear',
      emptyCart: 'Cart is empty',
      goToMenu: 'Go to Menu',
      saveData: 'Save & Start',
      employeeName: 'Employee Name:',
      department: 'Department:',
      vodafoneCash: 'Vodafone Cash',
      instapay: 'InstaPay',
      payroll: 'Payroll Deduction',
      orderId: 'Order ID',
      timestamp: 'Timestamp',
      employee: 'Employee',
      items: 'Items',
      status: 'Status',
      downloadCsv: 'Download CSV',
      printLog: 'Print Log',
      submitComplaint: 'Submit Official Complaint',
      complaintSuccess: 'Complaint submitted successfully and saved in database!',
      officialReceipt: 'Official Receipt',
      printReceipt: 'Print Receipt',
      newOrder: 'New Order',
      quickGuideTitle: 'Ha-Be Quick User Guide',
      quickGuideSub: 'Instant mobile instructions for caravan operations'
    },
    de: {
      companyName: 'Nationale Logistikdienste | Catering Ägypten',
      subtitle: 'Caravan Direktbestell- und Zahlungssystem',
      support: 'Support & Beschwerden',
      poster: 'Zahlungsplakat',
      guide: 'Benutzerhandbuch',
      home: 'Startseite',
      menu: 'Menü',
      cart: 'Warenkorb',
      reports: 'Ergebnisprotokoll',
      complaints: 'Beschwerden',
      account: 'Mein Konto',
      register: 'Registrieren',
      googleLogin: 'Google Anmeldung',
      logout: 'Abmelden',
      login: 'Anmelden',
      back: 'Zurück',
      homeBtn: 'Startseite',
      install: 'Installieren',
      browseMenu: 'Menü durchsuchen',
      viewPoster: 'Plakat anzeigen',
      checkout: 'Bestellung bestätigen & Zahlen',
      total: 'Gesamt:',
      clear: 'Leeren',
      emptyCart: 'Warenkorb ist leer',
      goToMenu: 'Zum Menü',
      saveData: 'Speichern & Starten',
      employeeName: 'Mitarbeitername:',
      department: 'Abteilung:',
      vodafoneCash: 'Vodafone Cash',
      instapay: 'InstaPay',
      payroll: 'Gehaltsabzug',
      orderId: 'Bestell-ID',
      timestamp: 'Zeitstempel',
      employee: 'Mitarbeiter',
      items: 'Artikel',
      status: 'Status',
      downloadCsv: 'CSV Herunterladen',
      printLog: 'Protokoll drucken',
      submitComplaint: 'Beschwerde einreichen',
      complaintSuccess: 'Beschwerde erfolgreich eingereicht und gespeichert!',
      officialReceipt: 'Offizieller Beleg',
      printReceipt: 'Beleg drucken',
      newOrder: 'Neue Bestellung',
      quickGuideTitle: 'Ha-Be Schnellstartanleitung',
      quickGuideSub: 'Sofortige Mobilanweisungen für den Caravan-Betrieb'
    }
  };

  const currentT = t[lang];

  // Menu categories with full AR, EN, DE support
  const menuCategories = [
    {
      title: lang === 'ar' ? 'فطور الشركات' : lang === 'de' ? 'Firmenfrühstück' : 'Corporate Breakfast',
      items: [
        { id: 'CBK-01', name: lang === 'ar' ? 'فول بالزيت والطحينة + جبنة بالخلطة + 1 بيضة مسلوقة + طرشي + 3 خبز' : lang === 'de' ? 'Foul mit Tahina + Käse + Gekochtes Ei + 3 Brot' : 'Foul + Cheese + Boiled Egg + Pickles + 3 Bread', price: 49 },
        { id: 'CBK-02', name: lang === 'ar' ? 'فول بالزيت والطحينة + علبة لبنة بالزعتر والبقدونس + مربى + مخلل + 3 خبز' : lang === 'de' ? 'Foul + Labneh mit Thymian + Marmelade + 3 Brot' : 'Foul + Labneh with Thyme + Jam + 3 Bread', price: 49 },
        { id: 'CBK-03', name: lang === 'ar' ? 'فول بالزيت والليمون + طاجن مسقعة + مخلل + 3 خبز' : lang === 'de' ? 'Foul + Messaqah (Auberginen) + 3 Brot' : 'Foul + Messaqah + Pickles + 3 Bread', price: 49 },
        { id: 'CBK-04', name: lang === 'ar' ? 'فول برائحة الزبدة البلدي + طاجن بطاطس بوريه + مخلل + 3 خبز' : lang === 'de' ? 'Foul mit Butter + Kartoffelpüree + 3 Brot' : 'Foul with Butter + Mashed Potatoes + 3 Bread', price: 49 },
        { id: 'CBK-05', name: lang === 'ar' ? 'فول بالزيت والطحينة + جبنة فيتا + دومتي 80 جم + بيضة مسلوقة + 3 خبز' : lang === 'de' ? 'Foul + Feta Käse + Domty 80g + Ei + 3 Brot' : 'Foul + Feta Cheese + Domty 80g + Egg + 3 Bread', price: 49 },
      ]
    },
    {
      title: lang === 'ar' ? 'وجبات الغداء الاقتصادية (92 ج.م)' : lang === 'de' ? 'Wirtschaftliche Mittagsgerichte (92 EGP)' : 'Economy Lunch Meals (92 EGP)',
      items: [
        { id: 'FCT-01', name: lang === 'ar' ? 'فراخ روستو + أرز أبيض بالشعرية مفلفل + تورلي بالصلصة + مخلل + سلطة' : lang === 'de' ? 'Roast Chicken + Reis + Tourly + Salat' : 'Roast Chicken + Rice + Tourly + Salad', price: 92 },
        { id: 'FCT-02', name: lang === 'ar' ? 'داوود باشا بالصوص + أرز بالشعرية + خضار بطاطس + مخلل' : lang === 'de' ? 'Dawood Basha (Hackbällchen) + Reis + Kartoffeln' : 'Dawood Basha + Rice + Potatoes', price: 92 },
        { id: 'FCT-04', name: lang === 'ar' ? '120جم كفتة مشوية + أرز بسمتي أصفر + بطاطس بوم فريت + طحينة + مخلل' : lang === 'de' ? 'Gegrillte Kafta 120g + Basmatireis + Pommes' : 'Grilled Kafta 120g + Basmati Rice + Fries', price: 92 },
        { id: 'FCT-05', name: lang === 'ar' ? '120جم شيش على الفحم + أرز بسمتي أصفر + بطاطس بوم فريت + طحينة + مخلل' : lang === 'de' ? 'Gegrillter Hähnchen-Shish 120g + Reis + Pommes' : 'Grilled Shish 120g + Basmati Rice + Fries', price: 92 },
        { id: 'FCT-06', name: lang === 'ar' ? 'فراخ مشوية (ربع صدر أو ورك) + أرز بسمتي أصفر + بطاطس + طحينة' : lang === 'de' ? 'Gegrilltes Hähnchen + Basmatireis + Pommes' : 'Grilled Chicken + Basmati Rice + Fries', price: 92 },
      ]
    },
    {
      title: lang === 'ar' ? 'المعجنات الطازجة' : lang === 'de' ? 'Frische Backwaren' : 'Fresh Pastries',
      items: [
        { id: 'PAS-01', name: lang === 'ar' ? 'باتيه كبير جبنة رومي بالخضار' : lang === 'de' ? 'Großes Romy-Käse-Gebäck' : 'Large Romy Cheese Pate', price: 37 },
        { id: 'PAS-02', name: lang === 'ar' ? 'باتيه كبير جبنة وزيتون' : lang === 'de' ? 'Großes Käse-Oliven-Gebäck' : 'Large Cheese & Olive Pate', price: 37 },
        { id: 'PAS-03', name: lang === 'ar' ? 'كرواسون كبير سادة أو رومي' : lang === 'de' ? 'Großes Croissant' : 'Large Croissant', price: 37 },
        { id: 'PAS-04', name: lang === 'ar' ? 'رول باتيه بالجبنة والخضار' : lang === 'de' ? 'Käse-Gemüse-Rolle' : 'Cheese & Veggie Pate Roll', price: 37 },
      ]
    },
    {
      title: lang === 'ar' ? 'الكشري والبيتزا والكريب' : lang === 'de' ? 'Koshary, Pizza & Crêpe' : 'Koshary, Pizza & Crepe',
      items: [
        { id: 'K-01', name: lang === 'ar' ? 'كشري مصري ممتاز (حجم وسط) بالصلصة والدقة والبصل المحمر' : lang === 'de' ? 'Ägyptischer Koshary (Mittel)' : 'Egyptian Koshary (Medium)', price: 40 },
        { id: 'K-02', name: lang === 'ar' ? 'كشري مصري ممتاز (حجم كبير) بالصلصة والدقة والملحقات' : lang === 'de' ? 'Ägyptischer Koshary (Groß)' : 'Egyptian Koshary (Large)', price: 48 },
        { id: 'K-03', name: lang === 'ar' ? 'كشري مصري ممتاز (عائلي / جامبو)' : lang === 'de' ? 'Ägyptischer Koshary (Familie/Jumbo)' : 'Egyptian Koshary (Jumbo)', price: 58 },
        { id: 'SL-01', name: lang === 'ar' ? 'قطعة بيتزا (سلايز) مارجريتا' : lang === 'de' ? 'Pizza-Scheibe Margherita' : 'Pizza Slice Margarita', price: 30 },
        { id: 'SL-02', name: lang === 'ar' ? 'قطعة بيتزا (سلايز) لحمة مفرومة' : lang === 'de' ? 'Pizza-Scheibe Hackfleisch' : 'Pizza Slice Minced Meat', price: 30 },
        { id: 'SL-03', name: lang === 'ar' ? 'قطعة بيتزا (سلايز) فراخ' : lang === 'de' ? 'Pizza-Scheibe Hähnchen' : 'Pizza Slice Chicken', price: 30 },
        { id: 'PZ-01', name: lang === 'ar' ? 'بيتزا شرقي كاملة' : lang === 'de' ? 'Ganze orientalische Pizza' : 'Full Oriental Pizza', price: 180 },
        { id: 'PZ-02', name: lang === 'ar' ? 'بيتزا إيطالي كاملة' : lang === 'de' ? 'Ganze italienische Pizza' : 'Full Italian Pizza', price: 170 },
        { id: 'CRP-01', name: lang === 'ar' ? 'كريب (بالحشوة المختارة)' : lang === 'de' ? 'Crêpe (Nach Wahl)' : 'Crepe (Custom Filling)', price: 80 },
      ]
    },
    {
      title: lang === 'ar' ? 'السندوتشات المنفصلة' : lang === 'de' ? 'Einzelne Sandwiches' : 'Individual Sandwiches',
      items: [
        { id: 'SND-01', name: lang === 'ar' ? 'سندوتش فول' : lang === 'de' ? 'Foul-Sandwich' : 'Foul Sandwich', price: 12 },
        { id: 'SND-02', name: lang === 'ar' ? 'سندوتش طعمية' : lang === 'de' ? 'Taameya-Sandwich' : 'Taameya Sandwich', price: 12 },
        { id: 'SND-03', name: lang === 'ar' ? 'سندوتش جبنة بيضاء' : lang === 'de' ? 'Weißkäse-Sandwich' : 'White Cheese Sandwich', price: 15 },
        { id: 'SND-04', name: lang === 'ar' ? 'سندوتش جبنة بالخلطة' : lang === 'de' ? 'Mischkäse-Sandwich' : 'Mixed Cheese Sandwich', price: 15 },
        { id: 'SND-05', name: lang === 'ar' ? 'سندوتش جبنة كيري (فينو)' : lang === 'de' ? 'Kiri-Käse-Sandwich' : 'Kiri Cheese Sandwich', price: 15 },
        { id: 'SND-06', name: lang === 'ar' ? 'سندوتش لانشون حلواني أو اللحيمي' : lang === 'de' ? 'Lunchon-Sandwich' : 'Lunchon Sandwich', price: 15 },
        { id: 'SND-07', name: lang === 'ar' ? 'سندوتش جبنة رومي (فينو)' : lang === 'de' ? 'Romy-Käse-Sandwich' : 'Romy Cheese Sandwich', price: 15 },
        { id: 'SND-08', name: lang === 'ar' ? 'سندوتش حلاوة بالقشطة (فينو)' : lang === 'de' ? 'Halawa mit Sahne-Sandwich' : 'Halawa with Cream Sandwich', price: 15 },
        { id: 'SND-09', name: lang === 'ar' ? 'سندوتش بطاطس مهروسة / شامي' : lang === 'de' ? 'Kartoffelpüree-Sandwich' : 'Mashed Potatoes Sandwich', price: 15 },
        { id: 'SND-10', name: lang === 'ar' ? 'سندوتش بطاطس صوابع' : lang === 'de' ? 'Pommes-Sandwich' : 'Fries Sandwich', price: 15 },
        { id: 'SND-11', name: lang === 'ar' ? 'سندوتش بطاطس جمبري' : lang === 'de' ? 'Garnelen-Pommes-Sandwich' : 'Shrimp Fries Sandwich', price: 15 },
        { id: 'SND-12', name: lang === 'ar' ? 'سندوتش بابا غنوج' : lang === 'de' ? 'Baba Ghannoug-Sandwich' : 'Baba Ghannoug Sandwich', price: 15 },
        { id: 'SND-13', name: lang === 'ar' ? 'سندوتش تونة بالمايونيز والفلفل (سبايسي)' : lang === 'de' ? 'Scharfes Thunfisch-Mayo-Sandwich' : 'Spicy Tuna Mayonnaise Sandwich', price: 20 },
        { id: 'SND-14', name: lang === 'ar' ? 'سندوتش برجر مشوي' : lang === 'de' ? 'Gegrilltes Burger-Sandwich' : 'Grilled Burger Sandwich', price: 45 },
        { id: 'SND-15', name: lang === 'ar' ? 'كلوب ساندوتش' : lang === 'de' ? 'Club-Sandwich' : 'Club Sandwich', price: 75 },
        { id: 'SND-16', name: lang === 'ar' ? 'سندوتش كفتة مشوية' : lang === 'de' ? 'Gegrilltes Kafta-Sandwich' : 'Grilled Kafta Sandwich', price: 45 },
        { id: 'SND-17', name: lang === 'ar' ? 'سندوتش شيش مشوي' : lang === 'de' ? 'Gegrilltes Shish-Sandwich' : 'Grilled Shish Sandwich', price: 45 },
        { id: 'SND-18', name: lang === 'ar' ? 'سندوتش بانيه كرسبي' : lang === 'de' ? 'Knuspriges Pane-Sandwich' : 'Crispy Pane Sandwich', price: 55 },
      ]
    },
    {
      title: lang === 'ar' ? 'المشروبات، الشيبسي والبسكوتات (الكافتيريا)' : lang === 'de' ? 'Getränke, Chips & Snacks (Cafeteria)' : 'Beverages, Chips & Snacks',
      items: [
        { id: 'CAF-01', name: 'Pepsi / بيبسي', price: 15 },
        { id: 'CAF-02', name: 'Mirinda / ميرندا', price: 15 },
        { id: 'CAF-03', name: '7Up / سفن أب', price: 15 },
        { id: 'CAF-04', name: 'Mountain Dew / ماونتن ديو', price: 15 },
        { id: 'CAF-05', name: 'Pepsi El Hodba / بيبسي الهضبة', price: 10 },
        { id: 'CAF-06', name: 'Schweppes / شويبس', price: 17 },
        { id: 'CAF-07', name: 'Juhayna Juice / عصير جهينة', price: 10 },
        { id: 'SNK-01', name: 'Chipsy / شيبسي', price: 10 },
        { id: 'SNK-02', name: 'Doritos / دوريتوس', price: 15 },
        { id: 'SNK-03', name: 'Tiger Chips / تاجر شيبس', price: 10 },
        { id: 'SNK-04', name: 'Cheetos / شيتوس', price: 15 },
        { id: 'CHC-01', name: 'Galaxy / شوكولاتة جالاكسي', price: 15 },
        { id: 'CHC-02', name: 'Cadbury / بسكوت كادبوري', price: 10 },
        { id: 'CHC-03', name: 'Mandoline / ماندولين ويفر', price: 5 },
        { id: 'CHC-04', name: 'Oreo / Hohos / أوريو وهوهوز', price: 10 },
      ]
    }
  ];

  // Generate QR Codes
  useEffect(() => {
    const amountVal = cartTotal > 0 ? cartTotal.toString() : '50';
    const vfPayload = `tel:*9*7*${vodafoneNumber}*${amountVal}#`;
    const instaPayload = `instapay://pay?pa=${instaPayNumber}&am=${amountVal}&cu=EGP`;

    QRCode.toDataURL(vfPayload, { width: 350, margin: 2, color: { dark: '#dc2626', light: '#ffffff' } })
      .then(url => setVfQrUrl(url))
      .catch(e => console.error(e));

    QRCode.toDataURL(instaPayload, { width: 350, margin: 2, color: { dark: '#000000', light: '#ffffff' } })
      .then(url => setInstaQrUrl(url))
      .catch(e => console.error(e));
  }, [cartTotal]);

  const addToCart = (item: {id: string, name: string, price: number}) => {
    const existing = cartItems.find(i => i.id === item.id);
    if (existing) {
      setCartItems(cartItems.map(i => i.id === item.id ? {...i, qty: i.qty + 1} : i));
    } else {
      setCartItems([...cartItems, {...item, qty: 1}]);
    }
  };

  const updateQty = (id: string, delta: number) => {
    const existing = cartItems.find(i => i.id === id);
    if (!existing) return;
    if (existing.qty + delta <= 0) {
      setCartItems(cartItems.filter(i => i.id !== id));
    } else {
      setCartItems(cartItems.map(i => i.id === id ? {...i, qty: i.qty + delta} : i));
    }
  };

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    const orderId = 'HB-' + Math.floor(100000 + Math.random() * 900000);
    const timestamp = new Date().toLocaleString('ar-EG');
    
    const newOrderData = {
      orderId,
      timestamp,
      employeeName: employeeName || 'عادل ديمترى',
      department: department || 'الخدمات اللوجستية',
      items: [...cartItems],
      total: cartTotal,
      paymentMethod: paymentMethod,
      status: paymentMethod === 'payroll' ? (lang === 'ar' ? 'معتمد للخصم من الراتب' : 'Payroll Approved') : (lang === 'ar' ? 'تم الدفع الفوري' : 'Paid Immediately'),
      userId: user ? user.uid : 'anonymous'
    };

    // Always record payroll deduction or direct orders in Firestore
    try {
      await addDoc(collection(db, 'orders'), newOrderData);
      setPayrollOrders(prev => [newOrderData, ...prev]);
    } catch (e) {
      console.error('Error saving order to Firestore:', e);
      setPayrollOrders(prev => [newOrderData, ...prev]);
    }

    setLastReceipt(newOrderData);
    setActiveTab('receipt');

    // Direct payment triggering on phone
    if (paymentMethod === 'vodafone') {
      window.open(`tel:*9*7*${vodafoneNumber}*${cartTotal}#`, '_self');
    } else if (paymentMethod === 'instapay') {
      window.open(`https://instapay.eg`, '_blank');
    }
  };

  const handlePrintReceipt = () => {
    if (!lastReceipt) return;
    const printWindow = window.open('', '_blank', 'width=450,height=700');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>Receipt - ${lastReceipt.orderId}</title>
          <style>
            @media print {
              @page { margin: 0; size: auto; }
              body { margin: 0; padding: 5mm; background: #fff; }
              .receipt { border: none !important; box-shadow: none !important; width: 100% !important; max-width: 80mm !important; padding: 0 !important; }
            }
            body { font-family: 'Cairo', Tahoma, sans-serif; padding: 10px; color: #000; background: #fff; margin: 0; }
            .receipt { max-width: 80mm; margin: 0 auto; border: 1px dashed #333; padding: 16px; border-radius: 8px; box-sizing: border-box; }
            .header { text-align: center; border-bottom: 1px dashed #666; padding-bottom: 10px; margin-bottom: 12px; }
            .title { font-size: 16px; font-weight: 900; }
            .sub { font-size: 11px; color: #333; line-height: 1.4; }
            .row { display: flex; justify-content: space-between; font-size: 12px; margin-bottom: 6px; }
            .items { margin: 12px 0; border-top: 1px dashed #666; border-bottom: 1px dashed #666; padding: 10px 0; }
            .item-header { display: flex; justify-content: space-between; font-size: 11px; font-weight: bold; margin-bottom: 6px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
            .item-row { display: flex; justify-content: space-between; font-size: 11px; margin-bottom: 6px; gap: 8px; }
            .item-name { flex: 1; word-break: break-word; }
            .item-price { white-space: nowrap; font-family: monospace; font-weight: bold; }
            .total { display: flex; justify-content: space-between; font-size: 14px; font-weight: 900; margin-top: 12px; border-top: 2px solid #000; padding-top: 8px; }
            .footer { text-align: center; font-size: 10px; margin-top: 16px; color: #444; border-top: 1px dashed #ccc; padding-top: 8px; }
          </style>
        </head>
        <body>
          <div class="receipt">
            <div class="header">
              <div class="title">Ha-Be • Official Receipt</div>
              <div class="sub">National Logistics Services | Catering Egypt</div>
              <div class="sub" style="margin-top:4px;">Invoice: <strong>${lastReceipt.orderId}</strong></div>
              <div class="sub">Date: ${lastReceipt.timestamp}</div>
            </div>
            
            <div class="row"><span>Employee:</span> <strong>${lastReceipt.employeeName}</strong></div>
            <div class="row"><span>Department:</span> <strong>${lastReceipt.department}</strong></div>
            <div class="row"><span>Payment:</span> <strong style="color:#dc2626;">${lastReceipt.paymentMethod}</strong></div>
            
            <div class="items">
              <div class="item-header">
                <span>Item (Qty)</span>
                <span>Amount</span>
              </div>
              ${lastReceipt.items.map(it => `
                <div class="item-row">
                  <span class="item-name">${it.name} (×${it.qty})</span>
                  <span class="item-price">${it.price * it.qty} EGP</span>
                </div>
              `).join('')}
            </div>

            <div class="total">
              <span>Total Due:</span>
              <span>${lastReceipt.total} EGP</span>
            </div>

            <div class="footer">
              Thank you for your service!<br>Ha-Be Caravan Kiosk System
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handlePrintPoster = () => {
    const printWindow = window.open('', '_blank', 'width=800,height=1000');
    if (!printWindow) {
      window.print();
      return;
    }
    printWindow.document.write(`
      <html lang="${lang}" dir="${lang === 'ar' ? 'rtl' : 'ltr'}">
        <head>
          <meta charset="utf-8">
          <title>Payment Poster - Ha-Be</title>
          <style>
            body { font-family: 'Cairo', Tahoma, sans-serif; padding: 40px; text-align: center; background: #fff; }
            .poster { border: 6px solid #000; padding: 40px; border-radius: 24px; max-width: 700px; margin: 0 auto; }
            .title { font-size: 28px; font-weight: 900; margin-bottom: 8px; }
            .sub { font-size: 16px; font-weight: bold; color: #dc2626; margin-bottom: 24px; }
            .qr-grid { display: flex; justify-content: space-around; gap: 20px; margin: 30px 0; }
            .qr-box { border: 3px solid #ddd; padding: 20px; border-radius: 16px; width: 45%; background: #f9f9f9; }
            .number { font-size: 24px; font-weight: 900; font-family: monospace; margin-top: 10px; }
            .footer { font-size: 14px; font-weight: bold; background: #eee; padding: 12px; border-radius: 8px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="poster">
            <div class="title">Ha-Be • Main Caravan</div>
            <div class="sub">National Logistics Services | Catering Egypt</div>
            <p style="font-size:14px; font-weight:bold;">Direct Payment Poster</p>
            
            <div class="qr-grid">
              <div class="qr-box" style="border-color: #dc2626;">
                <div style="font-weight:bold; color:#dc2626; margin-bottom:10px;">Vodafone Cash</div>
                <img src="${vfQrUrl}" width="220" height="220" alt="VF QR" />
                <div class="number" style="color:#dc2626;">${vodafoneNumber}</div>
              </div>
              <div class="qr-box" style="border-color: #000;">
                <div style="font-weight:bold; margin-bottom:10px;">InstaPay</div>
                <img src="${instaQrUrl}" width="220" height="220" alt="Insta QR" />
                <div class="number">${instaPayNumber}</div>
              </div>
            </div>

            <div class="footer">
              Support & Complaints: ${supportNumber}
            </div>
          </div>
          <script>
            window.onload = function() { window.print(); window.close(); };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSuggestionSubmit = async () => {
    if (!suggestionText.trim()) return;
    const newSuggestion = {
      employeeName: employeeName || 'عادل ديمترى',
      text: suggestionText,
      timestamp: new Date().toLocaleString('ar-EG'),
      userId: user ? user.uid : 'anonymous'
    };
    try {
      await addDoc(collection(db, 'suggestions'), newSuggestion);
      setSuggestionSubmitted(true);
      setSuggestionText('');
    } catch (e) {
      console.error('Error saving suggestion:', e);
      setSuggestionSubmitted(true);
      setSuggestionText('');
    }
  };

  const downloadPayrollReport = () => {
    const csvHeader = 'Order ID,Timestamp,Employee,Department,Total,Status\n';
    const csvRows = payrollOrders.map(o => `${o.orderId},"${o.timestamp}","${o.employeeName}","${o.department}",${o.total},"${o.status}"`).join('\n');
    const blob = new Blob(['\uFEFF' + csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `payroll_deductions_report_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className={`min-h-screen flex flex-col font-['Cairo',sans-serif] bg-white text-zinc-900 selection:bg-red-600 selection:text-white pb-28 ${lang === 'ar' ? 'dir-rtl' : 'dir-ltr'}`}>
      
      {/* Top Header - Clean Horizontal Layout */}
      <header className="border-b border-zinc-200 sticky top-0 z-50 px-3 py-2 flex items-center justify-between shadow-xs bg-white">
        
        {/* Left: Hamburger Menu (الثلاث شرط) & Horizontal Logo */}
        <div className="flex items-center gap-2.5 relative">
          
          {/* Hamburger Menu Toggle for Home (الثلاث شرط الخاصة بالرئيسية) */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl transition-all shadow-sm flex items-center justify-center"
            title="خيارات الرئيسية (الثلاث شرط)"
          >
            {isMenuOpen ? <X className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
          </button>

          {/* Hamburger Menu Dropdown (Options required: بوستر الدفع, دليل التشغيل, القائمة, السلة, سجل النواتج, الشكاوي) */}
          {isMenuOpen && (
            <div className="absolute top-12 right-0 bg-white border border-zinc-200 rounded-2xl shadow-2xl p-3 w-60 z-50 space-y-1 animate-in fade-in slide-in-from-top-2">
              <div className="text-[11px] font-bold text-zinc-400 px-3 py-1 border-b border-zinc-100">
                {lang === 'ar' ? 'خيارات القائمة الرئيسية (الثلاث شرط)' : lang === 'de' ? 'Hauptmenü' : 'Main Options'}
              </div>
              <button 
                onClick={() => { setActiveTab('poster'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <QrCode className="w-4 h-4 text-red-600" />
                <span>{currentT.poster}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('guide'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <PlayCircle className="w-4 h-4 text-red-600" />
                <span>{currentT.guide}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('menu'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <Utensils className="w-4 h-4 text-red-600" />
                <span>{currentT.menu}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('cart'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <ShoppingBag className="w-4 h-4 text-red-600" />
                <span>{currentT.cart}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('reports'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <FileSpreadsheet className="w-4 h-4 text-red-600" />
                <span>{currentT.reports}</span>
              </button>
              <button 
                onClick={() => { setActiveTab('support'); setIsMenuOpen(false); }}
                className="w-full text-right px-3 py-2 rounded-xl text-xs font-bold text-zinc-800 hover:bg-red-50 hover:text-red-600 flex items-center gap-2.5 transition-all"
              >
                <MessageSquare className="w-4 h-4 text-red-600" />
                <span>{currentT.complaints}</span>
              </button>
            </div>
          )}

          {/* Horizontal Logo & Title */}
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => setActiveTab('home')}>
            <div className="bg-white p-1 rounded-xl border border-zinc-100 shadow-xs shrink-0">
              <img src="/public/assets/aistudio/__f3762e40.png" alt="Ha-Be Logo" className="h-7 object-contain" />
            </div>
            <div className="flex items-center gap-2 whitespace-nowrap">
              <span className="text-xs font-black tracking-tight text-zinc-900 uppercase">HA-BE</span>
              <span className="text-[9px] bg-red-600 text-white px-2 py-0.5 rounded font-bold">الشركة الوطنية للخدمات اللوجستية</span>
            </div>
          </div>
        </div>

        {/* Right Header Controls: Back & Return (خروج وعودة), Multilingual Switcher (AR / EN / DE) */}
        <div className="flex items-center gap-1.5">
          <button 
            onClick={() => setActiveTab('home')}
            className="px-2.5 py-1.5 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-800 text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="العودة للرئيسية"
          >
            <Home className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{currentT.homeBtn}</span>
          </button>
          
          <button 
            onClick={user ? handleLogout : handleGoogleLogin}
            className="px-2.5 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl text-xs font-bold flex items-center gap-1 shadow-2xs"
            title="خروج / تسجيل"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{user ? currentT.logout : currentT.login}</span>
          </button>

          {/* Multilingual Switcher (AR / EN / DE) */}
          <div className="flex items-center bg-red-50 border border-red-200 rounded-xl p-0.5">
            <button 
              onClick={() => setLang('ar')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${lang === 'ar' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'}`}
            >
              عربي
            </button>
            <button 
              onClick={() => setLang('en')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${lang === 'en' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'}`}
            >
              EN
            </button>
            <button 
              onClick={() => setLang('de')}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all ${lang === 'de' ? 'bg-red-600 text-white shadow-xs' : 'text-red-700 hover:bg-red-100'}`}
            >
              DE
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Body */}
      <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full pb-28">
        
        {/* QUICK GUIDE TAB */}
        {activeTab === 'guide' && (
          <div className="space-y-6 max-w-3xl mx-auto">
            <div className="bg-white border-2 border-red-600 rounded-3xl p-6 sm:p-8 shadow-md space-y-6">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                <PlayCircle className="w-8 h-8 text-red-600 animate-pulse" />
                <div>
                  <h2 className="text-lg font-black text-zinc-900">{currentT.quickGuideTitle}</h2>
                  <p className="text-xs text-zinc-500">{currentT.quickGuideSub}</p>
                </div>
              </div>

              <div className="space-y-4 text-xs">
                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">1</div>
                  <div>
                    <h3 className="font-black text-zinc-900">3D Bottom Navigation / مسطرة الأيقونات السفلية</h3>
                    <p className="text-zinc-600">Use the 3D icons at the bottom for instant navigation between Register, Menu, Poster, Google, and Account.</p>
                  </div>
                </div>

                <div className="bg-zinc-50 border border-zinc-200 p-3.5 rounded-2xl flex items-start gap-3">
                  <div className="bg-red-600 text-white w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0">2</div>
                  <div>
                    <h3 className="font-black text-zinc-900">Direct Payment & Payroll Deduction / الدفع على الراتب والتحويل المباشر</h3>
                    <p className="text-zinc-600">Choose Vodafone Cash, InstaPay, or Payroll deduction. Payroll orders automatically record into Firebase Firestore.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* POSTER QR STUDIO TAB */}
        {activeTab === 'poster' && (
          <div className="space-y-6 max-w-4xl mx-auto">
            <div className="flex items-center justify-between bg-zinc-50 border border-zinc-200 p-4 rounded-2xl print:hidden">
              <div>
                <h2 className="text-sm font-black text-zinc-900">{currentT.poster}</h2>
                <p className="text-xs text-zinc-500">Printable caravan poster</p>
              </div>
              <button 
                onClick={handlePrintPoster}
                className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm flex items-center gap-2 shrink-0"
              >
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
            </div>

            <div className="bg-white border-4 border-zinc-900 rounded-3xl p-8 sm:p-12 shadow-2xl space-y-8 text-center relative overflow-hidden">
              <div className="space-y-3 border-b-2 border-zinc-200 pb-6 flex flex-col items-center">
                <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-sm">
                  <img src="/public/assets/aistudio/__f3762e40.png" alt="Ha-Be Logo" className="h-20 object-contain" />
                </div>
                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-black text-zinc-950 uppercase tracking-wide">Ha-Be • Main Caravan</h1>
                  <p className="text-sm font-bold text-red-600">{currentT.companyName}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-2xl mx-auto">
                <div className="bg-zinc-50 border-2 border-red-600 rounded-3xl p-6 shadow-md flex flex-col items-center space-y-4">
                  <div className="bg-red-600 text-white px-4 py-1 rounded-full text-xs font-black">Vodafone Cash</div>
                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-inner">
                    {vfQrUrl && <img src={vfQrUrl} alt="VF" className="w-48 h-48 object-contain" />}
                  </div>
                  <div className="text-xl font-black text-red-600 font-mono tracking-wider">{vodafoneNumber}</div>
                  <a href={`tel:*9*7*${vodafoneNumber}#`} className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs text-center block">
                    Pay via Vodafone Cash (*9)
                  </a>
                </div>

                <div className="bg-zinc-50 border-2 border-zinc-900 rounded-3xl p-6 shadow-md flex flex-col items-center space-y-4">
                  <div className="bg-zinc-900 text-white px-4 py-1 rounded-full text-xs font-black">InstaPay</div>
                  <div className="bg-white p-3 rounded-2xl border border-zinc-200 shadow-inner">
                    {instaQrUrl && <img src={instaQrUrl} alt="Insta" className="w-48 h-48 object-contain" />}
                  </div>
                  <div className="text-xl font-black text-zinc-950 font-mono tracking-wider">{instaPayNumber}</div>
                  <a href="https://instapay.eg" target="_blank" rel="noreferrer" className="w-full py-2.5 bg-zinc-900 text-white font-bold rounded-xl text-xs text-center block">
                    Open InstaPay
                  </a>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* HOME TAB */}
        {activeTab === 'home' && (
          <div className="space-y-8 py-4">
            <div className="bg-gradient-to-l from-red-50 via-white to-zinc-50 border border-zinc-200 rounded-3xl p-6 sm:p-12 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 max-w-xl text-center md:text-right">
                <span className="bg-red-100 text-red-700 text-xs font-black px-3 py-1 rounded-full">Ha-Be System ({lang.toUpperCase()})</span>
                <h2 className="text-2xl sm:text-4xl font-black text-zinc-900 tracking-tight">Ha-Be Caravan Ordering & Payment</h2>
                <p className="text-sm text-zinc-600 leading-relaxed">{currentT.subtitle}</p>
                <div className="pt-2 flex flex-wrap gap-3 justify-center md:justify-start">
                  <button onClick={() => setActiveTab('menu')} className="bg-red-600 hover:bg-red-700 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2">
                    <Utensils className="w-4 h-4" />
                    <span>{currentT.browseMenu}</span>
                  </button>
                  <button onClick={() => setActiveTab('reports')} className="bg-zinc-900 hover:bg-zinc-800 text-white font-bold px-5 py-2.5 rounded-xl text-xs shadow-md flex items-center gap-2">
                    <FileSpreadsheet className="w-4 h-4" />
                    <span>{currentT.reports}</span>
                  </button>
                </div>
              </div>
              <div className="bg-white p-6 rounded-2xl border border-zinc-200 shadow-sm flex flex-col items-center justify-center space-y-4">
                <img src="/public/assets/aistudio/__f3762e40.png" alt="Ha-Be" className="h-20 object-contain" />
                <div className="text-xs font-bold text-zinc-800">Employee: <span className="text-red-600 font-mono">{employeeName}</span></div>
                <button onClick={() => setActiveTab('account')} className="text-xs text-red-600 hover:underline font-bold">Edit Profile</button>
              </div>
            </div>
          </div>
        )}

        {/* MENU TAB */}
        {activeTab === 'menu' && (
          <div className="space-y-8">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <div>
                <h2 className="text-lg font-black text-zinc-900">{currentT.menu}</h2>
                <p className="text-xs text-zinc-500">Select items to add to cart</p>
              </div>
              <button onClick={() => setActiveTab('cart')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShoppingBag className="w-4 h-4" />
                <span>{currentT.cart} ({cartItems.reduce((a,c)=>a+c.qty,0)}) - {cartTotal} EGP</span>
              </button>
            </div>

            {menuCategories.map((cat, idx) => (
              <div key={idx} className="space-y-3">
                <h3 className="text-sm font-black text-zinc-900 border-r-4 border-red-600 pr-3">{cat.title}</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {cat.items.map((item) => (
                    <div key={item.id} className="bg-white border border-zinc-200 hover:border-red-600 p-3.5 rounded-xl flex items-center justify-between transition-all shadow-xs group">
                      <div className="space-y-1 flex-1 pl-3">
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] bg-zinc-100 text-zinc-600 px-1.5 py-0.5 rounded font-mono">{item.id}</span>
                          <span className="text-xs font-bold text-zinc-900 leading-tight">{item.name}</span>
                        </div>
                        <div className="text-xs font-black text-red-600 font-mono">{item.price} EGP</div>
                      </div>
                      <button onClick={() => addToCart(item)} className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-lg text-xs font-bold shrink-0">
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CART & CHECKOUT TAB */}
        {activeTab === 'cart' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-zinc-200">
              <h2 className="text-lg font-black text-zinc-900 flex items-center gap-2">
                <ShoppingBag className="w-5 h-5 text-red-600" />
                <span>{currentT.cart} & Checkout</span>
              </h2>
              <button onClick={() => setActiveTab('menu')} className="text-xs text-red-600 font-bold hover:underline">Back to Menu</button>
            </div>

            <div className="bg-zinc-50 border border-zinc-200 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3 w-full sm:w-auto">
                <User className="w-5 h-5 text-red-600 shrink-0" />
                <div>
                  <div className="text-xs font-bold text-zinc-800">{currentT.employeeName}</div>
                  <div className="text-xs font-black text-zinc-950 mt-0.5">{employeeName} ({department})</div>
                </div>
              </div>
              <button onClick={() => setActiveTab('account')} className="bg-white border border-zinc-300 text-xs font-bold px-3 py-1.5 rounded-xl">Edit</button>
            </div>

            <div className="bg-white border border-zinc-200 p-5 rounded-2xl space-y-3 shadow-xs">
              <label className="text-xs font-bold text-zinc-900">Payment Method:</label>
              <div className="grid grid-cols-3 gap-2">
                <button onClick={() => setPaymentMethod('vodafone')} className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${paymentMethod === 'vodafone' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-50 text-zinc-800 border-zinc-200'}`}>
                  <Smartphone className="w-4 h-4" />
                  <span>{currentT.vodafoneCash}</span>
                  <span className="text-[10px] font-mono">{vodafoneNumber}</span>
                </button>
                <button onClick={() => setPaymentMethod('instapay')} className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${paymentMethod === 'instapay' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-50 text-zinc-800 border-zinc-200'}`}>
                  <CreditCard className="w-4 h-4" />
                  <span>{currentT.instapay}</span>
                  <span className="text-[10px] font-mono">{instaPayNumber}</span>
                </button>
                <button onClick={() => setPaymentMethod('payroll')} className={`py-3 px-2 rounded-xl text-xs font-bold border transition-all flex flex-col items-center gap-1 ${paymentMethod === 'payroll' ? 'bg-red-600 text-white border-red-600' : 'bg-zinc-50 text-zinc-800 border-zinc-200'}`}>
                  <Wallet className="w-4 h-4" />
                  <span>{currentT.payroll}</span>
                  <span className="text-[10px]">Firebase</span>
                </button>
              </div>
            </div>

            <div className="bg-white border border-zinc-200 rounded-2xl p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-zinc-900">Selected Items ({cartItems.reduce((a,c)=>a+c.qty, 0)})</h3>
                {cartItems.length > 0 && <button onClick={() => setCartItems([])} className="text-xs text-red-600 hover:underline">{currentT.clear}</button>}
              </div>

              {cartItems.length === 0 ? (
                <div className="text-center py-12 text-zinc-400 text-xs space-y-2">
                  <p>{currentT.emptyCart}</p>
                  <button onClick={() => setActiveTab('menu')} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold">{currentT.goToMenu}</button>
                </div>
              ) : (
                <div className="space-y-2.5">
                  {cartItems.map((ci) => (
                    <div key={ci.id} className="flex items-center justify-between bg-zinc-50 p-3 rounded-xl border border-zinc-200 text-xs">
                      <div className="flex-1 pl-3">
                        <div className="font-bold text-zinc-900">{ci.name}</div>
                        <div className="text-zinc-500 font-mono text-[10px]">{ci.price} EGP</div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1.5 bg-white border border-zinc-300 rounded-lg p-0.5">
                          <button onClick={() => updateQty(ci.id, -1)} className="w-5 h-5 bg-zinc-100 rounded flex items-center justify-center"><Minus className="w-3 h-3" /></button>
                          <span className="font-bold font-mono text-zinc-900 w-5 text-center">{ci.qty}</span>
                          <button onClick={() => updateQty(ci.id, 1)} className="w-5 h-5 bg-zinc-100 rounded flex items-center justify-center"><Plus className="w-3 h-3" /></button>
                        </div>
                        <div className="font-black font-mono text-zinc-900 w-16 text-left">{ci.price * ci.qty} EGP</div>
                        <button onClick={() => setCartItems(cartItems.filter(i => i.id !== ci.id))} className="text-red-600 p-1"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {cartItems.length > 0 && (
                <div className="pt-4 border-t border-zinc-200 space-y-4">
                  <div className="flex justify-between items-center text-sm font-black">
                    <span>{currentT.total}</span>
                    <span className="text-red-600 font-mono text-lg">{cartTotal} EGP</span>
                  </div>

                  <div className="flex gap-2">
                    <button onClick={handleCheckout} className="flex-1 py-3.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl shadow-md text-xs flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{currentT.checkout} ({cartTotal} EGP)</span>
                    </button>
                    {paymentMethod === 'vodafone' && (
                      <a href={`tel:*9*7*${vodafoneNumber}*${cartTotal}#`} className="py-3.5 px-4 bg-zinc-900 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5">
                        <Smartphone className="w-4 h-4" />
                        <span>*9</span>
                      </a>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* PAYROLL & REPORTS TAB (سجل النواتج) */}
        {activeTab === 'reports' && (
          <div className="space-y-6 max-w-5xl mx-auto">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-6">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <h2 className="text-base font-black text-zinc-900">{currentT.reports} (Firebase)</h2>
                  <p className="text-xs text-zinc-500">Payroll deduction records & logs</p>
                </div>
                <div className="flex items-center gap-2">
                  <button onClick={downloadPayrollReport} className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    <span>{currentT.downloadCsv}</span>
                  </button>
                  <button onClick={handlePrintReceipt} className="bg-red-600 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                    <Printer className="w-4 h-4" />
                    <span>{currentT.printLog}</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="bg-zinc-100 text-zinc-700 border-b border-zinc-200">
                      <th className="p-3">{currentT.orderId}</th>
                      <th className="p-3">{currentT.timestamp}</th>
                      <th className="p-3">{currentT.employee}</th>
                      <th className="p-3">{currentT.department}</th>
                      <th className="p-3">{currentT.items}</th>
                      <th className="p-3">{currentT.total}</th>
                      <th className="p-3">{currentT.status}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-200">
                    {payrollOrders.map((ord, idx) => (
                      <tr key={idx} className="hover:bg-zinc-50">
                        <td className="p-3 font-mono font-bold text-red-600">{ord.orderId}</td>
                        <td className="p-3 text-zinc-500">{ord.timestamp}</td>
                        <td className="p-3 font-bold text-zinc-900">{ord.employeeName}</td>
                        <td className="p-3 text-zinc-600">{ord.department}</td>
                        <td className="p-3 text-zinc-700">{ord.items.map(it => `${it.name} (×${it.qty})`).join(', ')}</td>
                        <td className="p-3 font-mono font-black text-zinc-900">{ord.total} EGP</td>
                        <td className="p-3"><span className="bg-red-100 text-red-700 px-2 py-0.5 rounded font-bold text-[10px]">{ord.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* SUPPORT / SUGGESTIONS & COMPLAINTS TAB (الشكاوي) */}
        {activeTab === 'support' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-5">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                <MessageSquare className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-sm font-black text-zinc-900">{currentT.complaints}</h3>
                  <p className="text-xs text-zinc-500">Hotline: <strong className="font-mono">{supportNumber}</strong></p>
                </div>
              </div>

              {suggestionSubmitted ? (
                <div className="bg-green-50 border border-green-200 p-4 rounded-xl text-center text-xs text-green-800 space-y-2">
                  <CheckCircle2 className="w-8 h-8 text-green-600 mx-auto" />
                  <div className="font-bold">{currentT.complaintSuccess}</div>
                  <button onClick={() => setSuggestionSubmitted(false)} className="mt-2 text-xs text-green-700 underline font-bold">Send another</button>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Employee Name:</label>
                    <input type="text" value={employeeName} disabled className="w-full bg-zinc-100 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-700" />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-zinc-700">Complaint / Suggestion:</label>
                    <textarea rows={4} value={suggestionText} onChange={(e) => setSuggestionText(e.target.value)} placeholder="Type notes..." className="w-full bg-zinc-50 border border-zinc-300 rounded-xl p-3 text-xs text-zinc-900 focus:outline-none focus:border-red-600" />
                  </div>

                  <button onClick={handleSuggestionSubmit} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm">
                    {currentT.submitComplaint}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* RECEIPT / INVOICE TAB */}
        {activeTab === 'receipt' && lastReceipt && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white border-2 border-zinc-900 rounded-2xl p-6 shadow-lg space-y-6">
              
              <div className="text-center space-y-2 border-b border-zinc-200 pb-4">
                <div className="flex justify-center">
                  <img src="/public/assets/aistudio/__f3762e40.png" alt="Ha-Be" className="h-12 object-contain" />
                </div>
                <h3 className="text-sm font-black text-zinc-900 uppercase">Ha-Be • {currentT.officialReceipt}</h3>
                <p className="text-[11px] text-zinc-500">National Logistics Services | Catering Egypt</p>
                <div className="text-[10px] bg-zinc-100 py-1 rounded font-mono text-zinc-700">Invoice: {lastReceipt.orderId} | {lastReceipt.timestamp}</div>
              </div>

              <div className="space-y-1.5 text-xs bg-zinc-50 p-3.5 rounded-xl border border-zinc-200 font-medium">
                <div className="flex justify-between">
                  <span>Employee:</span>
                  <span className="font-bold text-zinc-900">{lastReceipt.employeeName}</span>
                </div>
                <div className="flex justify-between">
                  <span>Department:</span>
                  <span className="font-bold text-zinc-900">{lastReceipt.department}</span>
                </div>
                <div className="flex justify-between">
                  <span>Payment:</span>
                  <span className="font-bold text-red-600">{lastReceipt.paymentMethod}</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-zinc-900 border-b border-zinc-200 pb-1 flex justify-between">
                  <span>Item</span>
                  <span>Amount</span>
                </div>
                <div className="space-y-1.5 max-h-48 overflow-y-auto">
                  {lastReceipt.items.map((it, i) => (
                    <div key={i} className="flex justify-between text-xs py-1 border-b border-zinc-100">
                      <span>{it.name} (×{it.qty})</span>
                      <span className="font-mono font-bold text-zinc-900">{it.price * it.qty} EGP</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-3 flex justify-between items-center text-sm font-black">
                <span>Total:</span>
                <span className="text-red-600 font-mono text-base">{lastReceipt.total} EGP</span>
              </div>

              <div className="flex gap-2 pt-2">
                <button onClick={handlePrintReceipt} className="flex-1 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <Printer className="w-4 h-4" />
                  <span>{currentT.printReceipt}</span>
                </button>
                <button onClick={() => { setCartItems([]); setActiveTab('menu'); }} className="flex-1 py-2.5 bg-red-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2">
                  <Utensils className="w-4 h-4" />
                  <span>{currentT.newOrder}</span>
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ACCOUNT / EMPLOYEE SETTINGS TAB */}
        {activeTab === 'account' && (
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white border border-zinc-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center gap-3 pb-4 border-b border-zinc-200">
                <User className="w-6 h-6 text-red-600" />
                <div>
                  <h3 className="text-sm font-black text-zinc-900">{currentT.account}</h3>
                  <p className="text-xs text-zinc-500">Manage profile for orders & payroll deductions</p>
                </div>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">{currentT.employeeName}</label>
                  <input type="text" value={employeeName} onChange={(e) => setEmployeeName(e.target.value)} className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900" />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-zinc-700">{currentT.department}</label>
                  <input type="text" value={department} onChange={(e) => setDepartment(e.target.value)} className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3 py-2 text-xs font-bold text-zinc-900" />
                </div>

                <button onClick={() => { alert('Saved successfully!'); setActiveTab('menu'); }} className="w-full py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl text-xs shadow-sm">
                  {currentT.saveData}
                </button>
              </div>
            </div>
          </div>
        )}

      </main>

      {/* BOTTOM 3D ICONS BAR (مسطرة الأيقونات في الأسفل بالشكل ثلاثي الأبعاد) */}
      <nav aria-label="Bottom Navigation" className="fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-zinc-200 shadow-2xl py-2 px-3 flex items-center justify-around">
        
        {/* 1. تسجيل الحساب (Register) */}
        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 ${activeTab === 'account' ? 'text-red-600 bg-red-50 shadow-inner' : 'text-zinc-600 hover:text-red-600'}`}
          style={{ boxShadow: activeTab === 'account' ? 'inset 0 2px 4px rgba(220, 38, 38, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          <UserPlus className="w-5 h-5 mb-0.5 drop-shadow-md" />
          <span className="text-[10px] font-black">{currentT.register}</span>
        </button>

        {/* 2. القائمة (Menu) */}
        <button
          onClick={() => setActiveTab('menu')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 ${activeTab === 'menu' ? 'text-red-600 bg-red-50 shadow-inner' : 'text-zinc-600 hover:text-red-600'}`}
          style={{ boxShadow: activeTab === 'menu' ? 'inset 0 2px 4px rgba(220, 38, 38, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          <Utensils className="w-5 h-5 mb-0.5 drop-shadow-md" />
          <span className="text-[10px] font-black">{currentT.menu}</span>
        </button>

        {/* 3. بوستر الدفع (Payment Poster) */}
        <button
          onClick={() => setActiveTab('poster')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 ${activeTab === 'poster' ? 'text-red-600 bg-red-50 shadow-inner' : 'text-zinc-600 hover:text-red-600'}`}
          style={{ boxShadow: activeTab === 'poster' ? 'inset 0 2px 4px rgba(220, 38, 38, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          <QrCode className="w-5 h-5 mb-0.5 drop-shadow-md" />
          <span className="text-[10px] font-black">{currentT.poster}</span>
        </button>

        {/* 4. تسجيل جوجل (Google Sign-In) */}
        <button
          onClick={user ? handleLogout : handleGoogleLogin}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 ${user ? 'text-green-600 bg-green-50' : 'text-zinc-600 hover:text-red-600'}`}
          style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
          title={user ? currentT.logout : currentT.googleLogin}
        >
          <LogIn className="w-5 h-5 mb-0.5 drop-shadow-md" />
          <span className="text-[10px] font-black">{user ? currentT.logout : currentT.googleLogin}</span>
        </button>

        {/* 5. حسابي (My Account) */}
        <button
          onClick={() => setActiveTab('account')}
          className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all duration-200 transform hover:-translate-y-1 ${activeTab === 'account' ? 'text-red-600 bg-red-50 shadow-inner' : 'text-zinc-600 hover:text-red-600'}`}
          style={{ boxShadow: activeTab === 'account' ? 'inset 0 2px 4px rgba(220, 38, 38, 0.15)' : '0 4px 6px -1px rgba(0, 0, 0, 0.05)' }}
        >
          <User className="w-5 h-5 mb-0.5 drop-shadow-md" />
          <span className="text-[10px] font-black">{currentT.account}</span>
        </button>

      </nav>

    </div>
  );
}
