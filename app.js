/* ==========================================
   MGV PAINTERS CORE APPLICATION SCRIPT (Restructured)
   ========================================== */

window.safeCreateIcons = function() {
  if (window.lucide && typeof window.lucide.createIcons === 'function') {
    try {
      window.lucide.createIcons();
    } catch(e) {
      console.warn("Lucide error: ", e);
    }
  }
};

// IndexedDB Initialization for storing worker images & documents
let db;
const DB_NAME = 'MGV_PhotoStore';
const DB_VERSION = 2;

function initIndexedDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error("IndexedDB load error:", event);
      reject(event);
    };

    request.onsuccess = (event) => {
      db = event.target.result;
      console.log("IndexedDB loaded successfully.");
      resolve(db);
    };

    request.onupgradeneeded = (event) => {
      const dbInstance = event.target.result;
      
      // Store attendance selfies
      if (!dbInstance.objectStoreNames.contains('attendance_photos')) {
        dbInstance.createObjectStore('attendance_photos', { keyPath: 'id', autoIncrement: true });
      }
      
      // Store 2-hour work status photos
      if (!dbInstance.objectStoreNames.contains('status_photos')) {
        dbInstance.createObjectStore('status_photos', { keyPath: 'id', autoIncrement: true });
      }

      // Store painter onboarding documents (aadhar front, back, selfie)
      if (!dbInstance.objectStoreNames.contains('painter_documents')) {
        dbInstance.createObjectStore('painter_documents', { keyPath: 'id', autoIncrement: true });
      }
    };
  });
}

// Helper to save photos in IndexedDB
function savePhotoToDB(storeName, dataObject) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database not initialized");
      return;
    }
    const transaction = db.transaction([storeName], 'readwrite');
    const store = transaction.objectStore(storeName);
    const request = store.add(dataObject);

    request.onsuccess = () => resolve(request.result);
    request.onerror = (e) => reject(e);
  });
}

// Helper to load photos from IndexedDB
function getPhotosFromDB(storeName, filterKey, filterVal) {
  return new Promise((resolve, reject) => {
    if (!db) {
      reject("Database not initialized");
      return;
    }
    const transaction = db.transaction([storeName], 'readonly');
    const store = transaction.objectStore(storeName);
    const request = store.getAll();

    request.onsuccess = () => {
      let results = request.result;
      if (filterKey && filterVal !== undefined) {
        results = results.filter(item => item[filterKey] === filterVal);
      }
      resolve(results);
    };
    request.onerror = (e) => reject(e);
  });
}


// State Management & Local Storage Schemas
const AppState = {
  enquiries: [],
  workers: [],
  payments: [],
  bills: [],
  salaries: [],
  services: [],
  paintCatalog: [],
  propertyTypes: [],
  leads: [],
  painterApplications: [],
  confidentialProfiles: [],
  permissionMatrix: [],
  reviews: [],
  portfolio: [],
  customers: [],
  
  init() {
    // Load existing database entities or load default mock datasets
    this.enquiries = JSON.parse(localStorage.getItem('mgv_enquiries')) || this.getDefaultEnquiries();
    this.workers = JSON.parse(localStorage.getItem('mgv_workers')) || this.getDefaultWorkers();
    this.payments = JSON.parse(localStorage.getItem('mgv_payments')) || this.getDefaultPayments();
    this.bills = JSON.parse(localStorage.getItem('mgv_bills')) || this.getDefaultBills();
    this.salaries = JSON.parse(localStorage.getItem('mgv_salaries')) || this.getDefaultSalaries();
    this.services = JSON.parse(localStorage.getItem('mgv_services')) || this.getDefaultServices();
    this.paintCatalog = JSON.parse(localStorage.getItem('mgv_paint_catalog')) || this.getDefaultPaintCatalog();
    this.propertyTypes = JSON.parse(localStorage.getItem('mgv_property_types')) || this.getDefaultPropertyTypes();
    this.leads = JSON.parse(localStorage.getItem('mgv_leads')) || this.getDefaultLeads();
    this.painterApplications = JSON.parse(localStorage.getItem('mgv_painter_applications')) || this.getDefaultPainterApplications();
    this.confidentialProfiles = JSON.parse(localStorage.getItem('mgv_confidential_profiles')) || this.getDefaultConfidentialProfiles();
    const savedMatrix = JSON.parse(localStorage.getItem('mgv_permission_matrix')) || [];
    const defaultMatrix = this.getDefaultPermissionMatrix();
    this.permissionMatrix = defaultMatrix.map(def => {
      const saved = savedMatrix.find(s => s.module === def.module && s.role === def.role);
      return saved ? saved : def;
    });
    this.reviews = JSON.parse(localStorage.getItem('mgv_reviews')) || this.getDefaultReviews();
    this.portfolio = JSON.parse(localStorage.getItem('mgv_portfolio')) || this.getDefaultPortfolio();
    this.customers = JSON.parse(localStorage.getItem('mgv_customers')) || this.getDefaultCustomers();
    
    this.saveAll();
  },
  
  saveAll() {
    localStorage.setItem('mgv_enquiries', JSON.stringify(this.enquiries));
    localStorage.setItem('mgv_workers', JSON.stringify(this.workers));
    localStorage.setItem('mgv_payments', JSON.stringify(this.payments));
    localStorage.setItem('mgv_bills', JSON.stringify(this.bills));
    localStorage.setItem('mgv_salaries', JSON.stringify(this.salaries));
    localStorage.setItem('mgv_services', JSON.stringify(this.services));
    localStorage.setItem('mgv_paint_catalog', JSON.stringify(this.paintCatalog));
    localStorage.setItem('mgv_property_types', JSON.stringify(this.propertyTypes));
    localStorage.setItem('mgv_leads', JSON.stringify(this.leads));
    localStorage.setItem('mgv_painter_applications', JSON.stringify(this.painterApplications));
    localStorage.setItem('mgv_confidential_profiles', JSON.stringify(this.confidentialProfiles));
    localStorage.setItem('mgv_permission_matrix', JSON.stringify(this.permissionMatrix));
    localStorage.setItem('mgv_reviews', JSON.stringify(this.reviews));
    localStorage.setItem('mgv_portfolio', JSON.stringify(this.portfolio));
    localStorage.setItem('mgv_customers', JSON.stringify(this.customers));
  },
  
  getDefaultWorkers() {
    return [
      {
        id: "w-1",
        name: "Raj Kumar",
        phone: "9988776655",
        email: "raj.kumar@mgv.com",
        specialty: "interior",
        experience: "5 years",
        status: "Active",
        approved: true,
        currentLat: 12.9110,
        currentLng: 77.6401,
        lastCheckIn: "2026-07-22 08:30",
        lifetimeHours: 320,
        attendance: [
          { date: "2026-07-20", checkIn: "08:30", checkOut: "17:00", hours: 8, selfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
          { date: "2026-07-21", checkIn: "08:15", checkOut: "17:15", hours: 8.5, selfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" },
          { date: "2026-07-22", checkIn: "08:30", checkOut: "17:00", hours: 8, selfie: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150" }
        ]
      },
      {
        id: "w-2",
        name: "Suresh Gowda",
        phone: "9988776611",
        email: "suresh.g@mgv.com",
        specialty: "exterior",
        experience: "8 years",
        status: "Active",
        approved: true,
        currentLat: 12.9230,
        currentLng: 77.6521,
        lastCheckIn: "2026-07-22 09:15",
        lifetimeHours: 410,
        attendance: [
          { date: "2026-07-20", checkIn: "09:00", checkOut: "18:00", hours: 8, selfie: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
          { date: "2026-07-21", checkIn: "08:45", checkOut: "17:45", hours: 8, selfie: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" },
          { date: "2026-07-22", checkIn: "09:15", checkOut: "18:15", hours: 8, selfie: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150" }
        ]
      }
    ];
  },
  
  getDefaultEnquiries() {
    return [
      {
        id: "MGV-4819",
        name: "Navya Shree",
        phone: "9876543210",
        email: "navya@outlook.com",
        address: "Flat 302, Green Glen Layout, Bellandur, Bangalore",
        customerType: "prop-1",
        serviceType: "s-1",
        paintBrand: "Asian Paints",
        paintType: "Tractor Emulsion (Standard)",
        areaSqft: 1200,
        pricingModel: "lumpsum",
        estimateAmount: 36000,
        status: "In Progress",
        assignedWorkerId: "w-1",
        createdAt: "2026-07-20 11:20",
        floor: "3rd Floor",
        houseNo: "Flat 302",
        referredBy: "Friend",
        liveHours: 24,
        estimatedHours: 60,
        faultsLog: "None so far. Sanding was thorough.",
        installments: [
          { date: "2026-07-20 14:30", amount: 10000, type: "Advance Received", reference: "UPI: 9817293021", method: "QR Code" },
          { date: "2026-07-21 16:30", amount: 10000, type: "Installment 1", reference: "UPI: 9817592819", method: "QR Code" }
        ],
        servicesList: [
          { serviceId: "s-1", sqft: 1200, rate: 27, paintId: "p-2", cost: 32400 }
        ],
        timeline: [
          { step: 0, title: "Site Measurement Survey", date: "2026-07-20 14:00", done: true },
          { step: 1, title: "Wall Sanding & Double Putty Filling", date: "2026-07-21 10:30", done: true },
          { step: 2, title: "Base Primer Coating", date: "2026-07-22 09:00", done: true },
          { step: 3, title: "First Color Coat Application", date: "Pending", done: false },
          { step: 4, title: "Final Inspection & Cleanup", date: "Pending", done: false }
        ]
      },
      {
        id: "MGV-8921",
        name: "Preetham Builder",
        phone: "9812345678",
        email: "info@preethambuilders.com",
        address: "Site 14, Sector 7, HSR Layout, Bangalore",
        customerType: "prop-5",
        serviceType: "s-2",
        paintBrand: "Berger Paints",
        paintType: "Silk Glamor (Premium)",
        areaSqft: 4500,
        pricingModel: "labor",
        estimateAmount: 57375,
        status: "Pending Assignment",
        assignedWorkerId: "",
        createdAt: "2026-07-22 13:40",
        floor: "Entire Building",
        houseNo: "Site 14",
        referredBy: "Broker",
        liveHours: 0,
        estimatedHours: 120,
        faultsLog: "",
        installments: [],
        servicesList: [
          { serviceId: "s-2", sqft: 4500, rate: 15, paintId: "p-7", cost: 67500 }
        ],
        timeline: [
          { step: 0, title: "Site Measurement Survey", date: "Pending", done: false },
          { step: 1, title: "Wall Sanding & Double Putty Filling", date: "Pending", done: false },
          { step: 2, title: "Base Primer Coating", date: "Pending", done: false },
          { step: 3, title: "First Color Coat Application", date: "Pending", done: false },
          { step: 4, title: "Final Inspection & Cleanup", date: "Pending", done: false }
        ]
      }
    ];
  },
  
  getDefaultPayments() {
    return [
      {
        id: "PAY-1001",
        date: "2026-07-21 16:30",
        customerId: "MGV-4819",
        customerName: "Navya Shree",
        amount: 20000,
        gstAmount: 3600,
        totalAmount: 23600,
        paymentMethod: "UPI Transfer",
        status: "Verified"
      }
    ];
  },
  
  getDefaultBills() {
    return [
      {
        id: "BIL-2001",
        date: "2026-07-20 10:15",
        vendorName: "Sri Balaji Paints HSR",
        paintBrand: "Asian Paints",
        paintType: "Apcolite Primer & Putty",
        quantity: "18",
        amount: 12000,
        gstAmount: 2160,
        totalAmount: 14160,
        billType: "Material Purchase"
      }
    ];
  },
  
  getDefaultSalaries() {
    return [
      {
        id: "SAL-3001",
        date: "2026-07-22 17:00",
        workerId: "w-1",
        workerName: "Raj Kumar",
        projectId: "MGV-4819",
        hoursWorked: 8,
        amountPaid: 1200
      }
    ];
  },

  getDefaultServices() {
    return [
      { id: "s-1", title: "Interior Painting", description: "Flawless walls with premium sanding, double-putty preparation, and smooth emulsion coats.", baseRateLabor: 12, baseRateLumpsum: 27, badge: "Starts at ₹12/sqft" },
      { id: "s-2", title: "Exterior Painting", description: "Weatherproof protective coatings that guard against Bangalore rains, heat, and fungal growth.", baseRateLabor: 15, baseRateLumpsum: 30, badge: "Starts at ₹15/sqft" },
      { id: "s-3", title: "Grill & Gate Painting", description: "Anti-rust epoxy priming followed by premium gloss enamel for long-lasting metallic shine.", baseRateLabor: 25, baseRateLumpsum: 45, badge: "Starts at ₹25/sqft" },
      { id: "s-4", title: "Damp & Waterproofing", description: "Heavy-duty elastomeric membrane application to resolve damp wall and mold issues permanently.", baseRateLabor: 30, baseRateLumpsum: 65, badge: "Starts at ₹30/sqft" },
      { id: "s-5", title: "Wood Polishing", description: "Premium polyurethane coating, polyurethane sealant application, and high-gloss or matte finishing.", baseRateLabor: 40, baseRateLumpsum: 90, badge: "Starts at ₹40/sqft" },
      { id: "s-6", title: "Acid Wash", description: "Deep chemical cleaning for tough surface stains, cement residues, and heavy scale buildup.", baseRateLabor: 10, baseRateLumpsum: 20, badge: "Starts at ₹10/sqft" },
      { id: "s-7", title: "Grouting Services", description: "Tile joint cleaning and premium epoxy/cement grouting to prevent water seepage and dampness.", baseRateLabor: 15, baseRateLumpsum: 35, badge: "Starts at ₹15/sqft" }
    ];
  },

  getDefaultPaintCatalog() {
    return [
      { id: "p-1", brand: "Asian Paints", grade: "Distemper (Economy)", rate: 8 },
      { id: "p-2", brand: "Asian Paints", grade: "Tractor Emulsion (Standard)", rate: 15 },
      { id: "p-3", brand: "Asian Paints", grade: "Premium Apcolite (Semi-Premium)", rate: 22 },
      { id: "p-4", brand: "Asian Paints", grade: "Royale Luxury (Premium)", rate: 35 },
      { id: "p-5", brand: "Berger Paints", grade: "Bison Distemper (Economy)", rate: 7 },
      { id: "p-6", brand: "Berger Paints", grade: "Easy Clean Emulsion (Standard)", rate: 14 },
      { id: "p-7", brand: "Berger Paints", grade: "Silk Glamor (Premium)", rate: 32 },
      { id: "p-8", brand: "Nerolac Paints", grade: "Beauty Acrylic (Economy)", rate: 8 },
      { id: "p-9", brand: "Nerolac Paints", grade: "Little Master (Standard)", rate: 13 },
      { id: "p-10", brand: "Nerolac Paints", grade: "Impressions Ultra (Premium)", rate: 30 },
      { id: "p-11", brand: "Dulux Paints", grade: "Promise Acrylic (Economy)", rate: 9 },
      { id: "p-12", brand: "Dulux Paints", grade: "SuperClean (Standard)", rate: 16 },
      { id: "p-13", brand: "Dulux Paints", grade: "Velvet Touch (Ultra-Luxury)", rate: 38 }
    ];
  },

  getDefaultPropertyTypes() {
    return [
      { id: "prop-1", name: "Individual House Owner", modifier: 1.00, label: "Standard" },
      { id: "prop-2", name: "Individual House Tenant", modifier: 0.90, label: "Basic Refresh" },
      { id: "prop-3", name: "Duplex House", modifier: 1.10, label: "Standard Duplex" },
      { id: "prop-4", name: "Villa Owner", modifier: 1.20, label: "Premium care" },
      { id: "prop-5", name: "Builder / Commercial Entity", modifier: 0.80, label: "Contract volume" },
      { id: "prop-6", name: "Apartment Association", modifier: 0.95, label: "Multi-block discount" },
      { id: "prop-7", name: "Commercial Complex", modifier: 0.85, label: "Commercial volume" },
      { id: "prop-8", name: "Street Walls", modifier: 0.75, label: "Public/Boundary" },
      { id: "prop-9", name: "Repainting Work", modifier: 1.05, label: "Prep & repaint" }
    ];
  },

  getDefaultLeads() {
    return [
      { id: "L-1001", name: "Ananya Hegde", phone: "9876543201", type: "WhatsApp Chat", address: "Indiranagar, Bangalore", date: "2026-07-23 15:40", status: "New Lead", referredBy: "None" },
      { id: "L-1002", name: "Rohan Kamath", phone: "9988776602", type: "Call Request", address: "Koramangala, Bangalore", date: "2026-07-23 18:10", status: "Called - Scheduled Visit", referredBy: "Friend" }
    ];
  },

  getDefaultPainterApplications() {
    return [
      { id: "app-1", name: "Manjunath K", phone: "9876500111", specialty: "interior", date: "2026-07-23 12:00", approved: false, docId: 1 }
    ];
  },

  getDefaultConfidentialProfiles() {
    return [
      {
        workerId: "w-1",
        pan: "ABCDE1234F",
        aadhar: "1234 5678 9012",
        rentalAgreement: "Active. Expiry 2027-12-31. Landlord: Raju.",
        bankAccount: "Acct: 50100012345678, IFSC: HDFC0001234",
        emergencyContact: "9812345670 (Wife)",
        photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
      },
      {
        workerId: "w-2",
        pan: "XYZAB5678G",
        aadhar: "9876 5432 1098",
        rentalAgreement: "Active. Expiry 2028-05-15. Landlord: Ramesh.",
        bankAccount: "Acct: 300123456789, IFSC: SBIN0004321",
        emergencyContact: "9988776622 (Brother)",
        photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=150"
      }
    ];
  },

  getDefaultPermissionMatrix() {
    return [
      { module: "Services Directory", role: "Customer", read: true, write: false, edit: false, delete: false },
      { module: "Services Directory", role: "Painter/Worker", read: true, write: false, edit: false, delete: false },
      
      { module: "Paint Catalog", role: "Customer", read: true, write: false, edit: false, delete: false },
      { module: "Paint Catalog", role: "Painter/Worker", read: true, write: false, edit: false, delete: false },
      
      { module: "Booking Form", role: "Customer", read: true, write: true, edit: false, delete: false },
      { module: "Booking Form", role: "Painter/Worker", read: false, write: false, edit: false, delete: false },
      
      { module: "GPS Live Tracker", role: "Customer", read: true, write: false, edit: false, delete: false },
      { module: "GPS Live Tracker", role: "Painter/Worker", read: true, write: true, edit: false, delete: false },
      
      { module: "Finance Ledgers", role: "Customer", read: false, write: false, edit: false, delete: false },
      { module: "Finance Ledgers", role: "Painter/Worker", read: false, write: false, edit: false, delete: false },
      
      { module: "Worker Directory", role: "Customer", read: false, write: false, edit: false, delete: false },
      { module: "Worker Directory", role: "Painter/Worker", read: true, write: false, edit: false, delete: false },
      
      { module: "Leads Spreadsheet", role: "Customer", read: false, write: false, edit: false, delete: false },
      { module: "Leads Spreadsheet", role: "Painter/Worker", read: false, write: false, edit: false, delete: false },
      
      { module: "Credentials Manager", role: "Customer", read: false, write: false, edit: false, delete: false },
      { module: "Credentials Manager", role: "Painter/Worker", read: false, write: false, edit: false, delete: false },
      
      { module: "Manage Portfolio", role: "Customer", read: true, write: false, edit: false, delete: false },
      { module: "Manage Portfolio", role: "Painter/Worker", read: false, write: false, edit: false, delete: false }
    ];
  },

  getDefaultReviews() {
    return [
      { id: "rev-1", clientName: "Mrs. Kavya Sen", location: "HSR Sector 2", rating: 5, service: "Duplex Interior Painting", comment: "Excellent service. The sanding and putty application was super clean. We could track progress on the portal daily." },
      { id: "rev-2", clientName: "Dr. Anirban Dutta", location: "Bellandur", rating: 5, service: "Wood Polishing", comment: "Highly professional team. The wood polish shine on our teak main doors is outstanding. Fair rates." }
    ];
  },

  getDefaultPortfolio() {
    return [
      { id: "pm-1", title: "HSR Layout Villa Interior", beforeImg: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80", afterImg: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=800&q=80" },
      { id: "pm-2", title: "Outer Ring Road Commercial Complex", beforeImg: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80", afterImg: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=800&q=80" }
    ];
  },

  getDefaultCustomers() {
    return [
      { id: "CUST-101", name: "Navya Shree", phone: "9876543210", email: "navya@outlook.com", address: "HSR Layout, Floor 2, House No 12B", date: "2026-08-01 10:00" },
      { id: "CUST-102", name: "Mrs. Kavya Sen", phone: "8899221100", email: "kavya@gmail.com", address: "HSR Sector 2, Floor 1, House No 44", date: "2026-08-02 11:30" },
      { id: "CUST-103", name: "Dr. Anirban Dutta", phone: "9988776655", email: "anirban@gmail.com", address: "Bellandur, Floor 3, House No 18", date: "2026-08-03 14:15" }
    ];
  }
};


// View Controller & Navigation Router
document.addEventListener("DOMContentLoaded", async () => {
  // Initialize datasets
  AppState.init();
  await initIndexedDB();
  
  // Create icons
  safeCreateIcons();
  
  // Router Links
  const navBtns = document.querySelectorAll(".nav-btn");
  const views = document.querySelectorAll(".view-section");
  
  navBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      const targetView = btn.getAttribute("data-view");
      
      navBtns.forEach(b => b.classList.remove("active"));
      views.forEach(v => v.classList.remove("active"));
      
      btn.classList.add("active");
      const targetSec = document.getElementById(targetView);
      if (targetSec) targetSec.classList.add("active");
      
      // Auto resize map when admin switches to it
      if (targetView === 'contractor-view') {
        setTimeout(initGPSMap, 100);
        updateContractorKPIs();
      }
    });
  });

  // Handle Logo Button returning to Home
  document.getElementById("logoBtn").addEventListener("click", () => {
    document.querySelector('[data-view="home-view"]').click();
  });

  // Portal Sidebar Sub-Panes Navigation Switcher
  setupPaneSwitcher("customerDashboard");
  setupPaneSwitcher("workerDashboard");
  setupPaneSwitcher("contractorDashboard");
  
  // Financial Sub-Panes
  setupSubpaneSwitcher("con-finances");

  // Load interactive features
  renderHomepage();
  initWhatsAppWidget();
  initUnifiedLogin();
  initPainterSignup();
  initBookingForm();
  initCustomerPortal();
  initWorkerPortal();
  initContractorDashboard();
  initVideoPlayer();
});

// Helper: setups internal dashboard side tab panes switcher
function setupPaneSwitcher(dashboardId) {
  const dashboard = document.getElementById(dashboardId);
  if (!dashboard) return;
  
  const tabs = dashboard.querySelectorAll(".portal-tab");
  const panes = dashboard.querySelectorAll(".portal-pane");
  
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      panes.forEach(p => p.classList.remove("active"));
      
      tab.classList.add("active");
      const paneId = tab.getAttribute("data-pane");
      const targetPane = dashboard.querySelector(`#${paneId}`);
      if (targetPane) targetPane.classList.add("active");
      
      // Resize GPS canvas if Map pane selected
      if (paneId === 'con-gps') {
        setTimeout(initGPSMap, 50);
      }
      if (paneId === 'con-customers') {
        renderCustomersDatabaseTable();
      }
      if (paneId === 'con-whatsapp') {
        populateWaContactsSelect();
      }
      if (paneId === 'con-gmail') {
        populateGmailContactsSelect();
      }
    });
  });
}

function setupSubpaneSwitcher(dashboardId) {
  const container = document.getElementById(dashboardId);
  if (!container) return;
  const menuButtons = container.querySelectorAll(".tab-menu-btn");
  const panes = container.querySelectorAll(".con-subpane");
  
  menuButtons.forEach(btn => {
    btn.addEventListener("click", () => {
      menuButtons.forEach(b => b.classList.remove("active"));
      panes.forEach(p => p.style.display = 'none');
      
      btn.classList.add("active");
      const paneId = btn.getAttribute("data-subpane");
      container.querySelector(`#${paneId}`).style.display = 'block';
    });
  });
}


function getServiceFeaturesBadges(serviceTitle) {
  const title = serviceTitle.toLowerCase();
  let features = [];
  if (title.includes("interior")) {
    features = [
      { icon: "check-circle", text: "Double Putty" },
      { icon: "shield", text: "Sanding Care" },
      { icon: "leaf", text: "Low VOC Eco" },
      { icon: "sparkles", text: "Luxury Finish" }
    ];
  } else if (title.includes("exterior")) {
    features = [
      { icon: "umbrella", text: "Rain Protect" },
      { icon: "sun", text: "Anti-Flaking" },
      { icon: "activity", text: "Elastic Seal" },
      { icon: "shield-check", text: "Mold Guard" }
    ];
  } else if (title.includes("grill") || title.includes("gate")) {
    features = [
      { icon: "hammer", text: "Anti-Rust Coat" },
      { icon: "zap", text: "Epoxy Primer" },
      { icon: "shield", text: "Iron Guard" },
      { icon: "sun", text: "Gloss Enamel" }
    ];
  } else if (title.includes("waterproofing") || title.includes("damp")) {
    features = [
      { icon: "droplet", text: "Elastomeric" },
      { icon: "shield-alert", text: "Anti-Seepage" },
      { icon: "activity", text: "Crack Bridge" },
      { icon: "star", text: "10-Yr Guarantee" }
    ];
  } else if (title.includes("wood") || title.includes("polish")) {
    features = [
      { icon: "feather", text: "PU Sealant" },
      { icon: "compass", text: "Matte/Gloss" },
      { icon: "shield", text: "Scratch Guard" },
      { icon: "sun", text: "UV Wood Protect" }
    ];
  } else if (title.includes("acid") || title.includes("wash")) {
    features = [
      { icon: "trash-2", text: "Stain Cleaner" },
      { icon: "activity", text: "Scale Dissolver" },
      { icon: "zap", text: "Deep Prep" },
      { icon: "check-circle", text: "Surface Seal" }
    ];
  } else {
    features = [
      { icon: "grid", text: "Epoxy Joint" },
      { icon: "droplet", text: "Waterproof Seal" },
      { icon: "shield", text: "Zero Seepage" },
      { icon: "activity", text: "Fungal Guard" }
    ];
  }
  
  return features.map(f => `
    <span style="display:inline-flex; align-items:center; gap:0.25rem; background:rgba(255,255,255,0.03); border:1px solid rgba(255,255,255,0.05); padding:0.2rem 0.45rem; border-radius:8px; font-size:0.7rem; color:var(--text-secondary);">
      <i data-lucide="${f.icon}" style="width:12px; height:12px; color:var(--secondary);"></i>
      ${f.text}
    </span>
  `).join('');
}

/* ==================== HOME PAGE DYNAMIC RENDERER ==================== */
function renderHomepage() {
  const servicesGrid = document.getElementById("homeServicesGrid");
  if (servicesGrid) {
    function getServiceImage(id) {
      const mapping = {
        's-1': 'interior.jpg',
        's-2': 'exterior.jpg',
        's-3': 'gate.jpg',
        's-4': 'waterproofing.jpg',
        's-5': 'wood.jpg',
        's-6': 'acidwash.jpg',
        's-7': 'grouting.jpg'
      };
      return mapping[id] || 'interior.jpg';
    }

    servicesGrid.innerHTML = AppState.services.map((s, idx) => `
      <div class="card service-card service-${s.id}" style="display:flex; flex-direction:column; justify-content:space-between; min-height: 380px; padding: 0; overflow: hidden; border: 1px solid rgba(0,0,0,0.08);">
        <div style="height: 160px; background: url('${getServiceImage(s.id)}') center center; background-size: cover; position: relative;">
          <div class="service-icon" style="background: ${getServiceIconBg(idx)}; color: ${getServiceIconColor(idx)}; position: absolute; bottom: -20px; left: 20px; border: 3px solid var(--card-bg); z-index: 2;">
            <i data-lucide="${getServiceIconName(idx)}"></i>
          </div>
        </div>
        <div style="padding: 1.5rem; padding-top: 2rem; display: flex; flex-direction: column; flex-grow: 1; justify-content: space-between;">
          <div>
            <h3 style="font-size: 1.25rem; font-family: var(--font-display); margin-bottom: 0.5rem; color: var(--text-primary);">${s.title}</h3>
            <div style="display:flex; flex-wrap:wrap; gap:0.3rem; margin-bottom:1.25rem;">
              ${getServiceFeaturesBadges(s.title)}
            </div>
          </div>
          <span class="badge badge-primary" style="align-self: flex-start; margin-top: auto;">${s.badge || 'Premium Rates'}</span>
        </div>
      </div>
    `).join('');
    if (window.lucide) {
      safeCreateIcons();
    }
  }

  const brandsGrid = document.getElementById("homeBrandsGrid");
  if (brandsGrid) {
    // Group by brand
    const grouped = {};
    AppState.paintCatalog.forEach(p => {
      if (!grouped[p.brand]) grouped[p.brand] = [];
      grouped[p.brand].push(p);
    });

    brandsGrid.innerHTML = Object.keys(grouped).map(brand => {
      const brandClass = brand.toLowerCase().split(' ')[0];
      const gradesHtml = grouped[brand].map(g => {
        let tier = "Premium";
        if (g.rate > 40) tier = "Ultra Premium";
        else if (g.rate < 20) tier = "Standard";
        return `<li><span>${g.grade}</span> <span class="paint-price" style="color:var(--secondary); font-size:0.75rem; font-weight:600;">${tier} Grade</span></li>`;
      }).join('');
      return `
        <div class="card brand-card ${brandClass}">
          <div class="brand-logo">${brand}</div>
          <p class="text-secondary" style="font-size: 0.8rem; margin-bottom: 0.5rem;">Premium range selection</p>
          <ul class="paint-grade-list">
            ${gradesHtml}
          </ul>
        </div>
      `;
    }).join('');
  }

  // Render customer reviews list
  const reviewsContainer = document.getElementById("homeReviewsContainer");
  if (reviewsContainer) {
    reviewsContainer.innerHTML = AppState.reviews.map(r => `
      <div class="card" style="padding: 1.25rem;">
        <div style="display: flex; justify-content: space-between; align-items: center;" class="mb-2">
          <strong>${r.clientName} (${r.location})</strong>
          <div style="color: var(--accent); display: flex; gap: 2px;">
            ${Array(parseInt(r.rating) || 5).fill('<i data-lucide="star" style="fill: var(--accent); width: 14px; height: 14px;"></i>').join('')}
          </div>
        </div>
        <span class="badge badge-secondary mb-2" style="font-size:0.7rem; align-self: flex-start; background: rgba(255,255,255,0.05); color: var(--text-secondary);">${r.service}</span>
        <p class="text-secondary" style="font-size: 0.85rem; margin-top: 0.25rem;">"${r.comment}"</p>
      </div>
    `).join('');
  }

  // Render completed project showcase portfolio
  const portfolioContainer = document.getElementById("homePortfolioContainer");
  if (portfolioContainer) {
    portfolioContainer.innerHTML = AppState.portfolio.map(p => `
      <div class="photo-item" style="border-radius: 8px; overflow: hidden; height: 180px; position: relative; cursor: zoom-in;" onclick="viewBeforeAfterSwipeModal('${p.beforeImg}', '${p.afterImg}', '${p.title}')">
        <img src="${p.afterImg}" style="width: 100%; height: 100%; object-fit: cover;">
        <div class="photo-item-info" style="padding: 0.5rem;">
          <div class="desc" style="font-size: 0.75rem;">${p.title}</div>
          <span style="font-size: 0.65rem; color: var(--secondary); font-weight: 500;">Click to View Before/After</span>
        </div>
      </div>
    `).join('');
  }

  if (window.lucide) {
    safeCreateIcons();
  }
}

function getServiceIconBg(idx) {
  const bgs = ["var(--primary-glow)", "var(--secondary-glow)", "var(--accent-glow)", "var(--danger-glow)", "rgba(168, 85, 247, 0.15)", "rgba(14, 165, 233, 0.15)", "rgba(236, 72, 153, 0.15)"];
  return bgs[idx % bgs.length];
}
function getServiceIconColor(idx) {
  const colors = ["var(--primary)", "var(--secondary)", "var(--accent)", "var(--danger)", "#a855f7", "#0ea5e9", "#ec4899"];
  return colors[idx % colors.length];
}
function getServiceIconName(idx) {
  const icons = ["home", "palmtree", "fence", "droplet-off", "sparkles", "trash-2", "grid"];
  return icons[idx % icons.length];
}


/* ==================== WHATSAPP CONSULTATION WIDGET ==================== */
function initWhatsAppWidget() {
  const trigger = document.getElementById("waRequestTrigger");
  const card = document.getElementById("waRequestCard");
  const closeBtn = document.getElementById("closeWaRequestBtn");
  const form = document.getElementById("waLeadForm");

  if (trigger && card) {
    trigger.addEventListener("click", () => {
      card.style.display = card.style.display === "block" ? "none" : "block";
    });
  }

  if (closeBtn && card) {
    closeBtn.addEventListener("click", () => {
      card.style.display = "none";
    });
  }

  // Bind home page hero WhatsApp button
  const homeWaBtn = document.getElementById("homeWaBtn");
  if (homeWaBtn && trigger) {
    homeWaBtn.addEventListener("click", () => {
      trigger.click();
    });
  }

  if (form) {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("waLeadName").value.trim();
      const phone = document.getElementById("waLeadPhone").value.trim();
      const address = document.getElementById("waLeadAddress").value.trim();
      const referralInput = document.getElementById("waLeadReferral");
      const referral = referralInput ? referralInput.value.trim() : "";
      const type = document.getElementById("waLeadType").value;

      const newLead = {
        id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
        date: getCurrentTimestamp(),
        name,
        phone,
        address,
        referral: referral || "Direct (None)",
        type,
        status: "New Lead"
      };

      AppState.leads.unshift(newLead);
      AppState.saveAll();

      card.style.display = "none";
      form.reset();

      // Trigger simulated WhatsApp message
      triggerWhatsAppMessage(name, phone, address, newLead.id);
    });
  }
}


/* ==================== UNIFIED LOGIN PORTAL ==================== */
function initUnifiedLogin() {
  const loginBtn = document.getElementById("unifiedLoginBtn");
  if (!loginBtn) return;

  const loginInput = document.getElementById("loginUserPhone");
  const demoAccountsDiv = document.getElementById("loginDemoAccounts");
  const passwordGroup = document.getElementById("loginPasswordGroup");

  // Always show password field
  if (passwordGroup) {
    passwordGroup.style.display = "block";
  }

  if (loginInput && demoAccountsDiv) {
    loginInput.addEventListener("input", () => {
      const val = loginInput.value.trim();
      if (val === "admin" || val.startsWith("9999999999")) {
        demoAccountsDiv.style.display = "block";
      } else {
        demoAccountsDiv.style.display = "none";
      }
    });
  }

  function checkUserNeedsPassword(input) {
    return true;
  }

  loginBtn.addEventListener("click", () => {
    const input = document.getElementById("loginUserPhone").value.trim();
    if (!input) {
      alert("Please enter your registered phone number or passcode.");
      return;
    }

    // 1. Check Admin Role
    if (input === "admin" || input === "9999999999") {
      document.getElementById("login-view").classList.remove("active");
      document.getElementById("contractor-view").classList.add("active");
      document.getElementById("contractorDashboard").style.display = "grid";
      
      initContractorDashboardData(); // Fixed: renders services, paint catalog tables as well
      initGPSMap();
      initAdminCalculator();
      
      // Select first sidebar tab
      enforceRolePermissions();
      document.querySelector("#contractorDashboard .portal-tab").click();
      return;
    }

    // 2. Check Painter/Worker Role
    const worker = AppState.workers.find(w => w.phone === input || w.email === input);
    if (worker) {
      if (!worker.approved) {
        alert("Your painter profile is currently awaiting Contractor approval. Please contact the administrator.");
        return;
      }

      if (worker.password) {
        const passwordEntered = document.getElementById("loginUserPassword").value;
        if (worker.password !== passwordEntered) {
          alert("Incorrect password. Please verify credentials or contact the administrator.");
          return;
        }
      }

      currentWorker = worker;
      document.getElementById("login-view").classList.remove("active");
      document.getElementById("worker-view").classList.add("active");
      document.getElementById("workerDashboard").style.display = "grid";
      document.getElementById("workerWelcomeName").innerText = `Hello, ${worker.name}`;
      
      loadWorkerActiveJob();
      checkAttendanceStatus();
      
      // Select first sidebar tab
      enforceRolePermissions();
      document.querySelector("#workerDashboard .portal-tab").click();
      return;
    }

    // 3. Check Customer Role
    const customer = AppState.enquiries.find(e => e.phone === input || e.email === input);
    if (customer) {
      if (customer.password) {
        const passwordEntered = document.getElementById("loginUserPassword").value;
        if (customer.password !== passwordEntered) {
          alert("Incorrect password. Please verify credentials or contact the administrator.");
          return;
        }
      }

      currentCustomer = customer;
      document.getElementById("login-view").classList.remove("active");
      document.getElementById("customer-view").classList.add("active");
      document.getElementById("customerDashboard").style.display = "grid";
      document.getElementById("custWelcomeName").innerText = `Welcome, ${customer.name}`;
      
      loadCustomerTimeline(customer);
      loadCustomerPhotos(customer);
      loadCustomerPayments(customer);
      loadCustomerQuotation(customer);
      
      // Select first sidebar tab
      enforceRolePermissions();
      document.querySelector("#customerDashboard .portal-tab").click();
      return;
    }

    alert("Sign-in failed. No account found. For demo accounts use 9876543210 (Customer), 9988776655 (Painter) or admin (Contractor).");
  });

  // Handle global logouts
  const customerLogout = document.getElementById("custLogoutBtn");
  if (customerLogout) {
    customerLogout.addEventListener("click", () => {
      currentCustomer = null;
      document.getElementById("customer-view").classList.remove("active");
      document.getElementById("home-view").classList.add("active");
      document.getElementById("loginUserPhone").value = "";
      document.querySelector('[data-view="home-view"]').click();
    });
  }

  const workerLogout = document.getElementById("workerLogoutBtn");
  if (workerLogout) {
    workerLogout.addEventListener("click", () => {
      currentWorker = null;
      document.getElementById("worker-view").classList.remove("active");
      document.getElementById("home-view").classList.add("active");
      document.getElementById("loginUserPhone").value = "";
      document.querySelector('[data-view="home-view"]').click();
    });
  }

  const conLogout = document.getElementById("conLogoutBtn");
  if (conLogout) {
    conLogout.addEventListener("click", () => {
      document.getElementById("contractor-view").classList.remove("active");
      document.getElementById("home-view").classList.add("active");
      document.getElementById("loginUserPhone").value = "";
      document.querySelector('[data-view="home-view"]').click();
    });
  }
}


/* ==================== PAINTER JOIN ONBOARDING ==================== */
function initPainterSignup() {
  const form = document.getElementById("painterSignupForm");
  if (!form) return;

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = document.getElementById("applyName").value.trim();
    const phone = document.getElementById("applyPhone").value.trim();
    const specialty = document.getElementById("applySpecialty").value;

    const fileFront = document.getElementById("applyAadharFront").files[0];
    const fileBack = document.getElementById("applyAadharBack").files[0];
    const fileSelfie = document.getElementById("applySelfie").files[0];

    if (!fileFront || !fileBack || !fileSelfie) {
      alert("Please upload Aadhar Front, Aadhar Back, and verification selfie.");
      return;
    }

    // Convert files to base64
    const base64Front = await readFileAsBase64(fileFront);
    const base64Back = await readFileAsBase64(fileBack);
    const base64Selfie = await readFileAsBase64(fileSelfie);

    // Save in IndexedDB painter_documents store
    const docId = Date.now();
    const documentsLog = {
      id: docId,
      name,
      phone,
      frontData: base64Front,
      backData: base64Back,
      selfieData: base64Selfie
    };

    await savePhotoToDB('painter_documents', documentsLog);

    // Create Painter Application
    const newApp = {
      id: `app-${docId}`,
      name,
      phone,
      specialty,
      date: getCurrentTimestamp(),
      approved: false,
      docId
    };

    AppState.painterApplications.unshift(newApp);
    AppState.saveAll();

    form.reset();
    alert("Application submitted successfully! Your Aadhar documents and selfie have been uploaded. MGV supervisor will verify details.");
    
    // Return to home-view
    document.querySelector('[data-view="home-view"]').click();
  });
}


/* ==================== CONTRACTOR PRICE ESTIMATOR ==================== */
let adminCalcAddedServices = [];

function initAdminCalculator() {
  const customerSelect = document.getElementById("adminCalcCustomerType");
  const serviceSelect = document.getElementById("adminCalcServiceType");
  const customServiceGroup = document.getElementById("adminCalcCustomServiceGroup");
  const customServiceDesc = document.getElementById("adminCalcCustomServiceDesc");
  const paintsChecklist = document.getElementById("adminCalcPaintsChecklist");
  const areaInput = document.getElementById("adminCalcArea");
  const modelGroup = document.getElementById("adminCalcModelGroup");
  
  // Custom Overrides Inputs
  const houseInput = document.getElementById("adminCalcHouseNo");
  const floorInput = document.getElementById("adminCalcFloor");
  const customSqftRateInput = document.getElementById("adminCalcCustomSqftRate");
  const customLumpsumTotalInput = document.getElementById("adminCalcCustomLumpsumTotal");
  const customLaborTotalInput = document.getElementById("adminCalcCustomLaborTotal");

  // Add Service Btn & Booking Btn
  const addServiceBtn = document.getElementById("adminAddServiceToInvoiceBtn");
  const createBookingBtn = document.getElementById("adminCalcCreateBookingBtn");

  const calcCustomerDropdown = document.getElementById("adminCalcCustomerSelect");
  const projectNameInput = document.getElementById("adminCalcProjectName");

  if (!customerSelect) return;

  function getPercentageLabel(modifier) {
    const pct = Math.round((modifier - 1.0) * 100);
    if (pct === 0) return "Standard (No Adjustment)";
    return pct > 0 ? `+${pct}%` : `${pct}%`;
  }

  // Populate dynamic options
  customerSelect.innerHTML = AppState.propertyTypes.map(p => `<option value="${p.id}">${p.name} (${getPercentageLabel(p.modifier)})</option>`).join('');
  
  // Populate customer selector dropdown
  window.populateCalcCustomersDropdown = function() {
    if (!calcCustomerDropdown) return;
    let html = `<option value="new">-- [REGISTER NEW CUSTOMER] --</option>`;
    AppState.customers.forEach(c => {
      html += `<option value="${c.id}">${c.name} (${c.phone})</option>`;
    });
    calcCustomerDropdown.innerHTML = html;
  };
  populateCalcCustomersDropdown();

  // Watch customer dropdown selection to pre-populate details
  if (calcCustomerDropdown) {
    calcCustomerDropdown.addEventListener("change", () => {
      const val = calcCustomerDropdown.value;
      if (val === "new") {
        houseInput.value = "";
        floorInput.value = "";
        if (projectNameInput) projectNameInput.value = "";
      } else {
        const c = AppState.customers.find(item => item.id === val);
        if (c) {
          // Parse Flat/Floor from address
          const houseNoMatch = c.address.match(/(?:House|Flat|No\.?)\s*([A-Za-z0-9\-]+)/i);
          const floorMatch = c.address.match(/([0-9]+)\s*(?:st|nd|rd|th)?\s*Floor/i);
          houseInput.value = houseNoMatch ? houseNoMatch[1] : (c.address.split(',')[0] || "");
          floorInput.value = floorMatch ? floorMatch[1] : "1";
          if (projectNameInput) projectNameInput.value = `${c.name}'s Home Painting`;
        }
      }
      calculateAdminQuote();
    });
  }

  // Bind GST toggle dropdown
  const gstOptionSelect = document.getElementById("adminCalcGSTOption");
  if (gstOptionSelect) {
    gstOptionSelect.addEventListener("change", calculateAdminQuote);
  }

  // Add "All" and "others" to dropdown
  let servicesOptions = `<option value="all">All Services</option>`;
  servicesOptions += AppState.services.map(s => `<option value="${s.id}">${s.title}</option>`).join('');
  servicesOptions += `<option value="others">others (Enter text manually)</option>`;
  serviceSelect.innerHTML = servicesOptions;
  
  if (paintsChecklist) {
    paintsChecklist.innerHTML = AppState.paintCatalog.filter(p => !p.hidden).map(p => `
      <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; user-select: none;">
        <input type="checkbox" name="calcPaintGrade" value="${p.id}" data-rate="${p.rate}" data-brand="${p.brand}" data-grade="${p.grade}">
        <span>${p.brand} - ${p.grade} (₹${p.rate}/sqft)</span>
      </label>
    `).join('');
  }

  // Handle service select change (show/hide custom desc)
  serviceSelect.addEventListener("change", () => {
    if (serviceSelect.value === "others") {
      customServiceGroup.style.display = "block";
    } else {
      customServiceGroup.style.display = "none";
    }
  });

  // Modeler binding
  let activeModel = "lumpsum";
  const modelBtns = modelGroup.querySelectorAll(".radio-btn");
  modelBtns.forEach(btn => {
    btn.addEventListener("click", () => {
      modelBtns.forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      activeModel = btn.getAttribute("data-model");
      renderAddedServicesTable();
      calculateAdminQuote();
    });
  });

  // Watch overrides
  const inputs = [customerSelect, customLumpsumTotalInput, customLaborTotalInput, houseInput, floorInput, projectNameInput];
  inputs.forEach(input => {
    if (input) input.addEventListener("input", calculateAdminQuote);
  });

  // Add Service to Consolidated List
  if (addServiceBtn) {
    addServiceBtn.addEventListener("click", () => {
      const serviceVal = serviceSelect.value;
      const area = parseFloat(areaInput.value) || 0;
      if (area <= 0) {
        alert("Please enter a valid estimated area in sqft.");
        return;
      }

      // custom rate
      const customSqft = parseFloat(customSqftRateInput.value);

      // get paints
      const checkedBoxes = Array.from(document.querySelectorAll('input[name="calcPaintGrade"]:checked'));
      const paintsList = checkedBoxes.map(box => ({
        id: box.value,
        rate: parseFloat(box.getAttribute("data-rate")),
        summary: `${box.getAttribute("data-brand")} - ${box.getAttribute("data-grade")}`
      }));
      const paintRateSum = paintsList.reduce((sum, p) => sum + p.rate, 0);

      // Add helper
      const addSingleService = (srv) => {
        adminCalcAddedServices.push({
          id: srv.id,
          title: srv.title,
          area: area,
          customSqft: customSqft, // float or NaN
          baseRateLabor: srv.baseRateLabor,
          baseRateLumpsum: srv.baseRateLumpsum,
          paints: paintsList,
          paintRateSum: paintRateSum
        });
      };

      if (serviceVal === "all") {
        AppState.services.forEach(srv => {
          addSingleService(srv);
        });
      } else if (serviceVal === "others") {
        const desc = customServiceDesc.value.trim() || "Other Painting Works";
        adminCalcAddedServices.push({
          id: "s-others",
          title: desc,
          area: area,
          customSqft: customSqft,
          baseRateLabor: 15,
          baseRateLumpsum: 35,
          paints: paintsList,
          paintRateSum: paintRateSum
        });
      } else {
        const srv = AppState.services.find(s => s.id === serviceVal);
        if (srv) {
          addSingleService(srv);
        }
      }

      // Reset service section
      customSqftRateInput.value = "";
      customServiceDesc.value = "";
      document.querySelectorAll('input[name="calcPaintGrade"]').forEach(chk => chk.checked = false);

      renderAddedServicesTable();
      calculateAdminQuote();
    });
  }

  // Render cart table
  function renderAddedServicesTable() {
    const tbody = document.getElementById("adminCalcAddedServicesBody");
    if (!tbody) return;

    if (adminCalcAddedServices.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted" style="font-size: 0.8rem; padding: 1.5rem;">No services added to estimate yet. Select options above.</td></tr>`;
      return;
    }

    tbody.innerHTML = adminCalcAddedServices.map((item, idx) => {
      const paintsStr = item.paints.map(p => p.summary).join(', ') || 'None';
      
      let rate = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
      if (!isNaN(item.customSqft)) {
        rate = item.customSqft;
      }
      
      let subtotal = rate * item.area;
      if (activeModel === "lumpsum") {
        subtotal += item.paintRateSum * item.area;
      }
      
      return `
        <tr>
          <td><strong>${item.title}</strong></td>
          <td>${item.area} sqft</td>
          <td>₹${rate}/sqft</td>
          <td style="max-width: 150px; font-size: 0.75rem;">${paintsStr}</td>
          <td><strong>₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
          <td>
            <button class="btn btn-secondary" style="padding:0.2rem 0.45rem; font-size:0.75rem; color: var(--danger);" onclick="removeCalcService(${idx})">
              <i data-lucide="trash" style="width:12px; height:12px;"></i>
            </button>
          </td>
        </tr>
      `;
    }).join('');

    safeCreateIcons();
  }

  // Remove component handler
  window.removeCalcService = function(idx) {
    adminCalcAddedServices.splice(idx, 1);
    renderAddedServicesTable();
    calculateAdminQuote();
  };

  // Recalculate Quote Summary
  function calculateAdminQuote() {
    const houseNo = houseInput.value.trim() || "-";
    const floor = floorInput.value.trim() || "-";
    
    document.getElementById("adminSumHouseNo").innerText = houseNo;
    document.getElementById("adminSumFloor").innerText = floor;

    const selectedProp = AppState.propertyTypes.find(p => p.id === customerSelect.value);
    const propMod = selectedProp ? selectedProp.modifier : 1.0;
    document.getElementById("adminSumPropertyModifier").innerText = `${formatModifierHuman(propMod)} (${selectedProp ? selectedProp.name : ''})`;

    let grossTotal = adminCalcAddedServices.reduce((sum, item) => {
      let rate = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
      if (!isNaN(item.customSqft)) {
        rate = item.customSqft;
      }
      let subtotal = rate * item.area;
      if (activeModel === "lumpsum") {
        subtotal += item.paintRateSum * item.area;
      }
      return sum + subtotal;
    }, 0);

    // Apply overall custom lumpsum or labor total overrides to avoid loss
    const customLumpsum = parseFloat(customLumpsumTotalInput.value);
    const customLabor = parseFloat(customLaborTotalInput.value);

    if (activeModel === "lumpsum" && !isNaN(customLumpsum)) {
      grossTotal = customLumpsum;
    } else if (activeModel === "labor" && !isNaN(customLabor)) {
      grossTotal = customLabor;
    }

    // Apply modifier
    grossTotal = grossTotal * propMod;

    // Check GST option
    const gstOption = document.getElementById("adminCalcGSTOption")?.value || "with";
    const isWithGST = gstOption === "with";

    const cgst = isWithGST ? grossTotal * 0.09 : 0;
    const sgst = isWithGST ? grossTotal * 0.09 : 0;
    const netTotal = grossTotal + cgst + sgst;

    document.getElementById("adminSumGross").innerText = `₹${grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("adminSumCGST").innerText = `₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("adminSumSGST").innerText = `₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
    document.getElementById("adminSumTotal").innerText = `₹${netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

    // Populate itemized consolidated bill items
    const billItemsContainer = document.getElementById("adminSumBillItems");
    if (billItemsContainer) {
      if (adminCalcAddedServices.length === 0) {
        billItemsContainer.innerHTML = `<span class="text-muted" style="font-size: 0.8rem;">No service items added.</span>`;
      } else {
        billItemsContainer.innerHTML = adminCalcAddedServices.map(item => {
          let rate = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
          if (!isNaN(item.customSqft)) {
            rate = item.customSqft;
          }
          if (activeModel === "lumpsum") {
            rate += item.paintRateSum;
          }
          const sub = rate * item.area;
          return `
            <div style="display:flex; justify-content:space-between; font-size:0.75rem; color:#f1f5f9; border-bottom: 1px solid rgba(255,255,255,0.02); padding-bottom:3px;">
              <span style="max-width: 70%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${item.title}</span>
              <span style="color:var(--secondary); font-weight:600;">₹${sub.toLocaleString('en-IN')}</span>
            </div>
          `;
        }).join('');
      }
    }
  }

  // Create booking
  if (createBookingBtn) {
    createBookingBtn.addEventListener("click", () => {
      if (adminCalcAddedServices.length === 0) {
        alert("Please add at least one service component before generating the consolidated booking invoice.");
        return;
      }

      const houseNo = houseInput.value.trim();
      const floor = floorInput.value.trim();
      if (!houseNo || !floor) {
        alert("Please enter House/Flat No. and Floor level details.");
        return;
      }

      const projectName = projectNameInput ? projectNameInput.value.trim() : "MGV Painters Project";
      if (!projectName) {
        alert("Please enter a Project/Site Name.");
        return;
      }

      const chosenCustId = calcCustomerDropdown ? calcCustomerDropdown.value : "new";

      let name = "";
      let phone = "";
      let email = "";
      let address = "";
      let referral = "Direct";

      if (chosenCustId === "new") {
        name = prompt("Enter Customer Full Name:", "Navya Shree");
        if (!name) return;
        phone = prompt("Enter Customer Phone Number:", "9876543210");
        if (!phone) return;
        email = prompt("Enter Customer Email ID:", "navya@outlook.com");
        if (!email) return;
        address = prompt("Enter Site Full Address:", `${houseNo}, ${floor}, Bangalore`);
        if (!address) return;
        referral = prompt("Referred By (e.g. Preetham Builder, Google):", "None") || "Direct";
      } else {
        const e = AppState.enquiries.find(item => item.id === chosenCustId);
        if (e) {
          name = e.name;
          phone = e.phone;
          email = e.email;
          address = e.address;
          referral = e.referredBy || "Direct";
        }
      }

      // Gross calculate
      const selectedProp = AppState.propertyTypes.find(p => p.id === customerSelect.value);
      const propMod = selectedProp ? selectedProp.modifier : 1.0;
      
      let grossTotal = adminCalcAddedServices.reduce((sum, item) => {
        let rate = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
        if (!isNaN(item.customSqft)) {
          rate = item.customSqft;
        }
        let subtotal = rate * item.area;
        if (activeModel === "lumpsum") {
          subtotal += item.paintRateSum * item.area;
        }
        return sum + subtotal;
      }, 0);

      const customLumpsum = parseFloat(customLumpsumTotalInput.value);
      const customLabor = parseFloat(customLaborTotalInput.value);
      if (activeModel === "lumpsum" && !isNaN(customLumpsum)) {
        grossTotal = customLumpsum;
      } else if (activeModel === "labor" && !isNaN(customLabor)) {
        grossTotal = customLabor;
      }
      grossTotal = grossTotal * propMod;

      const gstOption = document.getElementById("adminCalcGSTOption")?.value || "with";
      const isWithGST = gstOption === "with";
      const gst = isWithGST ? grossTotal * 0.18 : 0;
      const netTotal = grossTotal + gst;

      let finalEnquiryId = "";
      if (chosenCustId !== "new") {
        finalEnquiryId = chosenCustId;
        const e = AppState.enquiries.find(item => item.id === chosenCustId);
        if (e) {
          e.houseNo = houseNo;
          e.floor = floor;
          e.pricingModel = activeModel;
          e.estimateAmount = netTotal;
          e.paintType = adminCalcAddedServices.map(s => `${s.title} (${s.paints.map(p=>p.summary).join(',') || 'No Paint'})`).join(', ');
          e.areaSqft = adminCalcAddedServices.reduce((sum, item) => sum + item.area, 0);
          e.servicesList = adminCalcAddedServices.map(item => {
            let r = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
            if (!isNaN(item.customSqft)) r = item.customSqft;
            let sub = r * item.area;
            if (activeModel === "lumpsum") sub += item.paintRateSum * item.area;
            return {
              serviceId: item.id,
              serviceTitle: item.title,
              sqft: item.area,
              rate: r,
              paintIds: item.paints.map(p => p.id),
              paintSummary: item.paints.map(p => p.summary).join(', '),
              cost: sub
            };
          });
        }
      } else {
        const randomId = Math.floor(1000 + Math.random() * 9000);
        finalEnquiryId = `MGV-${randomId}`;
        const totalSqft = adminCalcAddedServices.reduce((sum, item) => sum + item.area, 0);
        const detailsList = adminCalcAddedServices.map(item => {
          let r = activeModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
          if (!isNaN(item.customSqft)) r = item.customSqft;
          let sub = r * item.area;
          if (activeModel === "lumpsum") sub += item.paintRateSum * item.area;
          return {
            serviceId: item.id,
            serviceTitle: item.title,
            sqft: item.area,
            rate: r,
            paintIds: item.paints.map(p => p.id),
            paintSummary: item.paints.map(p => p.summary).join(', '),
            cost: sub
          };
        });

        const newEnquiry = {
          id: finalEnquiryId,
          name: name,
          phone: phone,
          email: email,
          password: "password123",
          address: address,
          customerType: customerSelect.value,
          serviceType: adminCalcAddedServices[0].id,
          paintBrand: adminCalcAddedServices[0].paints[0] ? adminCalcAddedServices[0].paints[0].summary.split(' - ')[0] : "None",
          paintType: adminCalcAddedServices.map(s => `${s.title} (${s.paints.map(p=>p.summary).join(',') || 'No Paint'})`).join(', '),
          areaSqft: totalSqft,
          pricingModel: activeModel,
          estimateAmount: netTotal,
          status: "Pending Survey",
          assignedWorkerId: "",
          createdAt: getCurrentTimestamp(),
          floor: floor,
          houseNo: houseNo,
          referredBy: referral || "Direct",
          liveHours: 0,
          estimatedHours: 80,
          faultsLog: "",
          installments: [],
          servicesList: detailsList,
          timeline: [
            { step: 0, title: "Site Measurement Survey", date: "Pending", done: false },
            { step: 1, title: "Wall Sanding & Double Putty Filling", date: "Pending", done: false },
            { step: 2, title: "Base Primer Coating", date: "Pending", done: false },
            { step: 3, title: "First Color Coat Application", date: "Pending", done: false },
            { step: 4, title: "Final Inspection & Cleanup", date: "Pending", done: false }
          ]
        };
        AppState.enquiries.unshift(newEnquiry);
      }

      // Add to Leads
      const existingLead = AppState.leads.find(l => l.phone === phone);
      if (!existingLead) {
        AppState.leads.unshift({
          id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
          date: getCurrentTimestamp(),
          name: name,
          phone: phone,
          address: address,
          type: "Site Estimate Generated",
          referral: referral || "Direct",
          status: "Completed Survey"
        });
      } else {
        existingLead.status = "Completed Survey";
      }

      AppState.saveAll();

      // Show Share Modal
      document.getElementById("shareInvoiceProjectName").innerText = projectName;
      document.getElementById("shareInvoiceCustName").innerText = name;
      document.getElementById("shareInvoiceCustPhone").innerText = phone;
      document.getElementById("shareInvoiceCustEmail").innerText = email;
      document.getElementById("shareInvoiceBase").innerText = `₹${grossTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
      document.getElementById("shareInvoiceGST").innerText = gst > 0 ? `₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (18%)` : "Excluded (0%)";
      document.getElementById("shareInvoiceTotal").innerText = `₹${netTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

      // Configure WhatsApp share message
      const servicesText = adminCalcAddedServices.map(s => `- ${s.title} (${s.area} sqft)`).join('\n');
      const gstStatus = gst > 0 ? "Included (18% GST)" : "Excluded (0% GST)";
      const waMessage = `*OFFICIAL ESTIMATE INVOICE & BILL*\n*MGV Painters* (Director: Mr. G. V. Gopinath)\n\nDear *${name}*,\nWe have prepared your custom estimate for project: *${projectName}*.\n\n*Services Included:*\n${servicesText}\n\n*Pricing Summary:*\n- Base Amount: Rs. ${grossTotal.toFixed(2)}\n- GST Status: ${gstStatus}\n- Net Total Cost: Rs. ${netTotal.toFixed(2)}\n\nFor any inquiries or approvals, feel free to contact Mr. G. V. Gopinath.\nThank you!`;
      
      const waBtn = document.getElementById("shareInvoiceWhatsAppBtn");
      if (waBtn) {
        waBtn.href = `https://api.whatsapp.com/send?phone=91${phone.replace(/\s+/g, "")}&text=${encodeURIComponent(waMessage)}`;
      }

      const mailBtn = document.getElementById("shareInvoiceMailBtn");
      if (mailBtn) {
        mailBtn.onclick = () => {
          alert(`Official Estimate Email notification successfully sent to ${email}!\n\nSubject: Official Quotation Invoice - ${projectName}\nBody Summary:\n\n${waMessage}`);
        };
      }

      document.getElementById("adminInvoiceShareModal").style.display = "flex";

      // Clear cart
      adminCalcAddedServices = [];
      houseInput.value = "";
      floorInput.value = "";
      if (projectNameInput) projectNameInput.value = "";
      customLumpsumTotalInput.value = "";
      customLaborTotalInput.value = "";
      renderAddedServicesTable();
      calculateAdminQuote();

      // Refresh dashboards
      updateContractorKPIs();
      populateEnquiriesTable();
      populateLeadsTable();
      populateCredentialsTable();
    });
  }

  calculateAdminQuote();
}


/* ==================== CUSTOMER PORTAL RENDERING ==================== */
function loadCustomerQuotation(enquiry) {
  const addressVal = document.getElementById("custProjAddress");
  const areaVal = document.getElementById("custProjArea");
  const paintTypeVal = document.getElementById("custProjPaintType");
  const modelVal = document.getElementById("custProjModel");
  const baseCostVal = document.getElementById("custProjBaseCost");
  const gstVal = document.getElementById("custProjGST");
  const totalVal = document.getElementById("custProjTotal");

  const estHoursVal = document.getElementById("custProjEstHours");
  const actualHoursVal = document.getElementById("custProjActualHours");
  const statusNotesVal = document.getElementById("custProjStatusNotes");
  const faultLogsVal = document.getElementById("custProjFaultLogs");

  if (!addressVal) return;

  addressVal.innerText = enquiry.address;
  areaVal.innerText = `${enquiry.areaSqft} sqft`;
  
  // Find dynamic names
  const service = AppState.services.find(s => s.id === enquiry.serviceType) || { title: enquiry.serviceType };
  paintTypeVal.innerText = `${service.title} (${enquiry.paintType})`;
  modelVal.innerText = enquiry.pricingModel === "lumpsum" ? "Lumpsum Plan (Material + Wages)" : "Labour Charges Only Plan";

  const total = enquiry.estimateAmount;
  const base = total / 1.18;
  const gst = total - base;

  baseCostVal.innerText = `₹${base.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  gstVal.innerText = `₹${gst.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  totalVal.innerText = `₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  if (estHoursVal) estHoursVal.innerText = `${enquiry.estHours || 0} hrs`;
  if (actualHoursVal) actualHoursVal.innerText = `${enquiry.totalHoursWorked || 0} hrs`;
  if (statusNotesVal) statusNotesVal.innerText = enquiry.statusNotes || "No updates posted yet.";
  if (faultLogsVal) faultLogsVal.innerText = enquiry.faultLogs || "No quality issues reported.";
}


/* ==================== BOOKING FORM & SITE SURVEYS ==================== */
function initBookingForm() {
  const bookingForm = document.getElementById("bookingForm");
  if (!bookingForm) return;

  bookingForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    const name = document.getElementById("bookName").value;
    const phone = document.getElementById("bookPhone").value;
    const email = document.getElementById("bookEmail").value;
    const address = document.getElementById("bookAddress").value;
    const comments = document.getElementById("bookComments").value;
    
    // Default dynamic options for new bookings
    const defaultProp = AppState.propertyTypes[0] ? AppState.propertyTypes[0].id : "prop-1";
    const defaultService = AppState.services[0] ? AppState.services[0].id : "s-1";
    const defaultPaint = AppState.paintCatalog[1] ? AppState.paintCatalog[1] : { brand: "Asian", grade: "Tractor Emulsion", rate: 15 };
    
    // Generate order ID
    const randomId = Math.floor(1000 + Math.random() * 9000);
    const newEnquiryId = `MGV-${randomId}`;
    
    const newEnquiry = {
      id: newEnquiryId,
      name,
      phone,
      email,
      address,
      customerType: defaultProp,
      serviceType: defaultService,
      paintBrand: defaultPaint.brand,
      paintType: defaultPaint.grade,
      areaSqft: 1000,
      pricingModel: "lumpsum",
      estimateAmount: 30000, // Default estimate
      status: "Pending Survey",
      assignedWorkerId: "",
      createdAt: getCurrentTimestamp(),
      timeline: [
        { step: 0, title: "Site Measurement Survey", date: "Pending", done: false },
        { step: 1, title: "Wall Sanding & Double Putty Filling", date: "Pending", done: false },
        { step: 2, title: "Base Primer Coating", date: "Pending", done: false },
        { step: 3, title: "First Color Coat Application", date: "Pending", done: false },
        { step: 4, title: "Final Inspection & Cleanup", date: "Pending", done: false }
      ]
    };
    
    // Append to list & save
    AppState.enquiries.unshift(newEnquiry);
    
    // Log as registered lead also
    AppState.leads.unshift({
      id: `L-${Math.floor(1000 + Math.random() * 9000)}`,
      date: getCurrentTimestamp(),
      name,
      phone,
      address,
      type: "Site Survey Request",
      status: "New Lead"
    });
    
    AppState.saveAll();
    
    // Trigger simulated WhatsApp Flow
    triggerWhatsAppMessage(name, phone, address, newEnquiryId);
    
    // Reset form
    bookingForm.reset();
    alert(`Order booking enquiry #${newEnquiryId} submitted! A WhatsApp notification has been triggered.`);
    
    // Update admin list if open
    updateContractorKPIs();
    populateEnquiriesTable();
  });
}

// Generate synthesizer sound beep for WhatsApp alert
function playNotificationSound() {
  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    
    // WhatsApp notification sound is typically a double high beep
    function beep(freq, duration, delay) {
      setTimeout(() => {
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
        
        osc.start();
        osc.stop(audioCtx.currentTime + duration);
      }, delay);
    }
    
    beep(880, 0.12, 0); // 1st high tone
    beep(880, 0.12, 180); // 2nd high tone
  } catch (e) {
    console.log("AudioContext blocked or unsupported", e);
  }
}

// Trigger sliding mobile and bubble animation
function triggerWhatsAppMessage(customerName, phone, address, enquiryId) {
  const banner = document.getElementById("waNotificationBanner");
  const phoneMock = document.getElementById("waPhoneMock");
  const chatBody = document.getElementById("waChatBody");
  const bannerMsg = document.getElementById("waBannerMsg");
  
  // Set current time for bubble
  const now = new Date();
  const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  
  const textMsg = `"our technician will get back to you soon in 30minutes for farther discussion" - Booking #${enquiryId}`;
  
  bannerMsg.innerText = textMsg;
  document.getElementById("waInitTime").innerText = timeStr;
  
  // 1. Play sound beep
  playNotificationSound();
  
  // 2. Slide-in banner
  banner.classList.add("active");
  
  // 3. After 1.5s, slide-in phone mock
  setTimeout(() => {
    phoneMock.classList.add("active");
    
    // Add User outgoing request bubble simulation
    const userBubble = document.createElement("div");
    userBubble.className = "whatsapp-bubble outgoing";
    userBubble.innerHTML = `Hi MGV Painters, I would like to consult with supervisor Gopinath about my property in ${address}. Contact: ${phone}.<span class="bubble-time">${timeStr}</span>`;
    chatBody.appendChild(userBubble);
    chatBody.scrollTop = chatBody.scrollHeight;
    
    // Simulate MGV support typing response
    setTimeout(() => {
      const typingBubble = document.createElement("div");
      typingBubble.className = "whatsapp-bubble incoming typing-indicator";
      typingBubble.innerHTML = `<em>MGV Support is typing...</em>`;
      chatBody.appendChild(typingBubble);
      chatBody.scrollTop = chatBody.scrollHeight;
      
      // Complete response bubble
      setTimeout(() => {
        typingBubble.remove();
        
        const responseBubble = document.createElement("div");
        responseBubble.className = "whatsapp-bubble incoming";
        responseBubble.innerHTML = `Hi ${customerName}! Thanks for your interest. <strong>Supervisor G. V. Gopinath will call you shortly in 30 minutes</strong> for direct negotiation. Reference ID: <strong>#${enquiryId}</strong>.<span class="bubble-time">${timeStr}</span>`;
        chatBody.appendChild(responseBubble);
        chatBody.scrollTop = chatBody.scrollHeight;
      }, 2000);
      
    }, 1500);
    
  }, 1500);

  // Auto remove notification banner after 6 seconds
  setTimeout(() => {
    banner.classList.remove("active");
  }, 7000);
}

// Close phone mock handler
document.getElementById("closePhoneBtn").addEventListener("click", () => {
  document.getElementById("waPhoneMock").classList.remove("active");
});


/* ==================== CUSTOMER PORTAL DYNAMIC VIEWS ==================== */
let currentCustomer = null;

function initCustomerPortal() {
  // Navigation tabs already wired by Dom ready router setupPaneSwitcher
}

function loadCustomerTimeline(enquiry) {
  const container = document.getElementById("custTimeline");
  container.innerHTML = "";
  
  enquiry.timeline.forEach(step => {
    const isCompleted = step.done;
    let stepClass = "timeline-step";
    let checkIcon = "";
    
    if (isCompleted) {
      stepClass += " completed";
      checkIcon = `<i data-lucide="check" style="width:12px; height:12px; color:white;"></i>`;
    } else if (enquiry.status === "In Progress" && !isCompleted && isNextStep(enquiry.timeline, step.step)) {
      stepClass += " active";
      checkIcon = `<i data-lucide="play" style="width:10px; height:10px; color:white;"></i>`;
    }
    
    const stepHtml = `
      <div class="${stepClass}">
        <div class="timeline-step-icon">${checkIcon}</div>
        <div class="timeline-step-content">
          <h4>${step.title}</h4>
          <p class="${isCompleted ? 'text-primary' : 'text-secondary'}">${isCompleted ? 'Completed' : 'Pending Scheduling'}</p>
          <div class="meta">${step.date !== 'Pending' ? `Confirmed at ${step.date}` : ''}</div>
        </div>
      </div>
    `;
    container.insertAdjacentHTML('beforeend', stepHtml);
  });
  safeCreateIcons();
}

function isNextStep(timeline, stepIndex) {
  for (let s of timeline) {
    if (!s.done) {
      return s.step === stepIndex;
    }
  }
  return false;
}

async function loadCustomerPhotos(enquiry) {
  const container = document.getElementById("custPhotoGallery");
  container.innerHTML = "";
  
  try {
    const photos = await getPhotosFromDB('status_photos', 'projectId', enquiry.id);
    
    if (photos.length === 0) {
      container.innerHTML = `<div class="text-center text-muted mt-4 grid-form-full" style="grid-column: span 3; padding: 2rem;">No progress selfies uploaded yet for this site.</div>`;
      return;
    }
    
    photos.forEach(photo => {
      const itemHtml = `
        <div class="photo-item">
          <img src="${photo.photoData}" alt="Work status upload">
          <div class="photo-item-info">
            <div class="time">
              <span>${photo.timestamp.split(' ')[0]}</span>
              <span>${photo.timestamp.split(' ')[1]}</span>
            </div>
            <div class="desc">${photo.description}</div>
          </div>
        </div>
      `;
      container.insertAdjacentHTML('beforeend', itemHtml);
    });
  } catch (err) {
    console.error("Failed loading IndexedDB photos:", err);
  }
}

function loadCustomerPayments(enquiry) {
  const tbody = document.getElementById("custTransactionsBody");
  tbody.innerHTML = "";
  
  const pmts = AppState.payments.filter(p => p.customerId === enquiry.id);
  const totalAmountEstimated = enquiry.estimateAmount;
  
  if (pmts.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No transactions recorded yet. Initial site survey quotation total estimated: ₹${totalAmountEstimated.toLocaleString('en-IN')}</td></tr>`;
    return;
  }
  
  pmts.forEach(p => {
    const row = `
      <tr>
        <td><strong>${p.id}</strong><br><span style="font-size:0.75rem; color:var(--text-muted);">${p.upiQrRef ? 'Ref: ' + p.upiQrRef : 'Bank Ledger'}</span></td>
        <td>${p.date}</td>
        <td>${enquiry.paintType || 'Painting Service'} (${enquiry.pricingModel})<br><span style="font-size:0.75rem; color:var(--secondary); font-weight:600;">${p.phase || (p.isAdvance ? 'Advance Payment' : 'Installment')}</span></td>
        <td>₹${p.amount.toLocaleString('en-IN')}</td>
        <td>₹${p.gstAmount.toLocaleString('en-IN')}</td>
        <td>₹${p.totalAmount.toLocaleString('en-IN')}</td>
        <td><span class="badge ${p.isAdvance ? 'badge-primary' : 'badge-success'}">${p.isAdvance ? 'Advance Received' : p.status}</span></td>
        <td>
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewPaymentReceipt('${p.id}')">View QR Receipt</button>
        </td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  });
}


/* ==================== WORKER PORTAL LOGIC ==================== */
let currentWorker = null;

function initWorkerPortal() {
  const detectLocBtn = document.getElementById("detectLocationBtn");
  const gpsInput = document.getElementById("attGPSVal");
  
  if (detectLocBtn) {
    detectLocBtn.addEventListener("click", () => {
      gpsInput.value = "Detecting GPS...";
      
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude.toFixed(6);
            const lng = position.coords.longitude.toFixed(6);
            gpsInput.value = `${lat}, ${lng} (Real GPS)`;
            if (currentWorker) {
              currentWorker.currentLat = position.coords.latitude;
              currentWorker.currentLng = position.coords.longitude;
            }
          },
          (error) => {
            // Fallback to random coordinate in HSR layout Bangalore
            const latMock = (12.9080 + Math.random() * 0.015).toFixed(6);
            const lngMock = (77.6350 + Math.random() * 0.02).toFixed(6);
            gpsInput.value = `${latMock}, ${lngMock} (Mock - HSR Bangalore)`;
            if (currentWorker) {
              currentWorker.currentLat = parseFloat(latMock);
              currentWorker.currentLng = parseFloat(lngMock);
            }
            console.warn("GPS access denied, fallback to mock HSR coords:", error);
          }
        );
      } else {
        const latMock = (12.9080 + Math.random() * 0.015).toFixed(6);
        const lngMock = (77.6350 + Math.random() * 0.02).toFixed(6);
        gpsInput.value = `${latMock}, ${lngMock} (Mock - HSR Bangalore)`;
        if (currentWorker) {
          currentWorker.currentLat = parseFloat(latMock);
          currentWorker.currentLng = parseFloat(lngMock);
        }
      }
    });
  }

  // Submit Attendance
  const submitAtt = document.getElementById("submitAttendanceBtn");
  if (submitAtt) {
    submitAtt.addEventListener("click", handleAttendanceSubmit);
  }
  
  // Submit 2-Hour Progress Photo
  const progressUpdateForm = document.getElementById("progressUpdateForm");
  if (progressUpdateForm) {
    progressUpdateForm.addEventListener("submit", handleProgressSubmit);
  }
}

// Find worker's assigned project
function getWorkerProject(workerId) {
  return AppState.enquiries.find(e => e.assignedWorkerId === workerId && e.status === "In Progress");
}

function loadWorkerActiveJob() {
  const container = document.getElementById("workerActiveJobContainer");
  if (!container) return;
  container.innerHTML = "";
  
  const assignedProj = getWorkerProject(currentWorker.id);
  
  if (!assignedProj) {
    container.innerHTML = `
      <div class="card text-center" style="background: rgba(9, 13, 22, 0.4); border: 1px dashed rgba(255,255,255,0.1); padding: 2rem;">
        <i data-lucide="info" style="width:48px; height:48px; color:var(--accent); margin:0 auto 1rem auto;"></i>
        <h4>No active project assigned to you.</h4>
        <p class="text-secondary mt-2">Check back later or contact the contractor to assign you a painting job site.</p>
      </div>
    `;
    safeCreateIcons();
    return;
  }
  
  const html = `
    <div class="card" style="background: linear-gradient(135deg, rgba(20, 30, 55, 0.8) 0%, rgba(9, 13, 22, 0.9) 100%);">
      <div style="display:flex; justify-content:space-between; align-items:center;" class="mb-4">
        <h4>Job Ref: #${assignedProj.id}</h4>
        <span class="badge badge-success">${assignedProj.status}</span>
      </div>
      <p class="mb-2"><strong>Client:</strong> ${assignedProj.name}</p>
      <p class="mb-2"><strong>Address:</strong> ${assignedProj.address}</p>
      <p class="mb-2"><strong>Painting Requirements:</strong> ${assignedProj.paintType}</p>
      <p class="mb-4"><strong>Property Scope:</strong> Area: ${assignedProj.areaSqft} sqft (Lumpsum Plan)</p>
      
      <div class="card" style="padding: 1rem; background:rgba(255,255,255,0.02);">
        <h5>Milestone Status</h5>
        <ul style="list-style:none; padding: 0.5rem 0;" class="text-secondary">
          ${assignedProj.timeline.map(t => `
            <li class="mt-2" style="display:flex; justify-content:space-between; font-size:0.85rem;">
              <span>${t.title}</span>
              <strong style="color:${t.done ? 'var(--secondary)' : 'var(--text-muted)'}">${t.done ? `Done (${t.date})` : 'Incomplete'}</strong>
            </li>
          `).join('')}
        </ul>
      </div>
    </div>
  `;
  container.innerHTML = html;
}

// Attendance helpers
function checkAttendanceStatus() {
  const text = document.getElementById("attStatusText");
  const actionArea = document.getElementById("attendanceActionArea");
  if (!text) return;
  
  const todayStr = getTodayDateStr();
  const checkedInToday = currentWorker.lastCheckIn.startsWith(todayStr);
  
  if (checkedInToday) {
    text.innerHTML = `<i data-lucide="check-circle" style="color:var(--secondary); width:32px; height:32px; display:block; margin:0 auto 0.5rem auto;"></i>
      <strong style="color:var(--secondary);">Clocked In Successfully</strong><br>
      Checked-in at ${currentWorker.lastCheckIn} today.<br>Site GPS coordinates logged.`;
    actionArea.style.display = "none";
  } else {
    text.innerHTML = `<i data-lucide="alert-circle" style="color:var(--accent); width:32px; height:32px; display:block; margin:0 auto 0.5rem auto;"></i>
      <strong>Pending Clock-in</strong><br>
      Please capture/upload selfie at the site where you stopped work yesterday to start today's log.`;
    actionArea.style.display = "block";
    document.getElementById("attGPSVal").value = "Click Detect Location";
  }
  safeCreateIcons();
}

async function handleAttendanceSubmit() {
  const selfieFile = document.getElementById("attSelfieInput").files[0];
  const gpsVal = document.getElementById("attGPSVal").value;
  
  if (!selfieFile) {
    alert("Please upload/capture your attendance selfie.");
    return;
  }
  
  if (gpsVal === "Click Detect Location" || gpsVal === "Detecting GPS...") {
    alert("Please verify your GPS coordinates by clicking the location button.");
    return;
  }
  
  // Read file as base64 string
  const base64Photo = await readFileAsBase64(selfieFile);
  const timestamp = getCurrentTimestamp();
  
  // Save photo in IndexedDB
  const attendanceLog = {
    workerId: currentWorker.id,
    workerName: currentWorker.name,
    timestamp,
    latitude: currentWorker.currentLat,
    longitude: currentWorker.currentLng,
    photoData: base64Photo
  };
  
  await savePhotoToDB('attendance_photos', attendanceLog);
  
  // Update Worker Check-in Status
  currentWorker.lastCheckIn = timestamp;
  currentWorker.status = "Active";
  
  // Update project milestone if relevant
  const proj = getWorkerProject(currentWorker.id);
  if (proj) {
    if (!proj.timeline[0].done) {
      proj.timeline[0].done = true;
      proj.timeline[0].date = timestamp;
    }
  }
  
  AppState.saveAll();
  
  alert("Site attendance clocked in successfully!");
  checkAttendanceStatus();
  loadWorkerActiveJob();
  
  populateWorkersTable();
}

// 2-Hour Progress updates submission
async function handleProgressSubmit(e) {
  e.preventDefault();
  
  if (!currentWorker) return;
  
  const activeProj = getWorkerProject(currentWorker.id);
  if (!activeProj) {
    alert("Cannot upload progress status because you do not have an active painting project assigned.");
    return;
  }
  
  const photoInputEl = document.getElementById("updatePhotoInput").files[0];
  const description = document.getElementById("updateDesc").value;
  
  if (!photoInputEl) {
    alert("Please upload a progress photo.");
    return;
  }
  
  const base64Photo = await readFileAsBase64(photoInputEl);
  const timestamp = getCurrentTimestamp();
  
  const progressLog = {
    projectId: activeProj.id,
    workerId: currentWorker.id,
    workerName: currentWorker.name,
    timestamp,
    description,
    photoData: base64Photo
  };
  
  await savePhotoToDB('status_photos', progressLog);
  
  // Update active project timeline steps dynamically
  let changedTimeline = false;
  
  if (description.includes("Sanding")) {
    activeProj.timeline[1].done = true;
    activeProj.timeline[1].date = timestamp;
    changedTimeline = true;
  } else if (description.includes("primer")) {
    activeProj.timeline[2].done = true;
    activeProj.timeline[2].date = timestamp;
    changedTimeline = true;
  } else if (description.includes("emulsion")) {
    activeProj.timeline[3].done = true;
    activeProj.timeline[3].date = timestamp;
    changedTimeline = true;
  } else if (description.includes("cleanup")) {
    activeProj.timeline[4].done = true;
    activeProj.timeline[4].date = timestamp;
    activeProj.status = "Completed"; // Project finishes
    changedTimeline = true;
  }
  
  AppState.saveAll();
  
  // Simulate small shift in GPS coordinates upon updates
  currentWorker.currentLat += (Math.random() - 0.5) * 0.002;
  currentWorker.currentLng += (Math.random() - 0.5) * 0.002;
  AppState.saveAll();
  
  document.getElementById("progressUpdateForm").reset();
  alert("2-Hour progress update uploaded successfully!");
  loadWorkerActiveJob();
}

// Convert files to base64 strings
function readFileAsBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}


/* ==================== CONTRACTOR HUB DASHBOARD ==================== */
function initContractorDashboard() {
  // Manual accounting forms
  const addPaymentForm = document.getElementById("addPaymentForm");
  if (addPaymentForm) {
    addPaymentForm.addEventListener("submit", handleAddPayment);
  }

  const generateQRBtn = document.getElementById("payGenerateQRBtn");
  if (generateQRBtn) {
    generateQRBtn.addEventListener("click", () => {
      const baseVal = parseFloat(document.getElementById("payBaseAmount").value) || 0;
      if (baseVal <= 0) {
        alert("Please enter a valid base amount first.");
        return;
      }
      const total = baseVal * 1.18;
      document.getElementById("payQrAmount").innerText = total.toLocaleString('en-IN', { minimumFractionDigits: 2 });
      document.getElementById("payUpiQrContainer").style.display = "block";
      const txn = `UPI${Math.floor(1000000000 + Math.random() * 9000000000)}`;
      document.getElementById("payUpiTxnRef").value = txn;
      
      const upiId = document.getElementById("payCustomUpiId").value.trim() || "pay@mgvpainters.bhim";
      document.getElementById("payQrUpiLabel").innerText = upiId;

      const fileInput = document.getElementById("payCustomQrUpload");
      const canvas = document.getElementById("payQrCanvas");

      if (fileInput && fileInput.files.length > 0) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const img = new Image();
          img.onload = () => {
            const ctx = canvas.getContext("2d");
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(fileInput.files[0]);
      } else {
        const payText = `upi://pay?pa=${upiId}&pn=MGV%20Painters&am=${total.toFixed(2)}&tr=${txn}`;
        drawMockQRCode("payQrCanvas", payText);
      }
    });
  }

  const phaseSelect = document.getElementById("payInstallmentPhase");
  if (phaseSelect) {
    phaseSelect.addEventListener("change", (e) => {
      const isAdvanceCheckbox = document.getElementById("payIsAdvance");
      if (isAdvanceCheckbox) {
        isAdvanceCheckbox.checked = (e.target.value === "Advance Payment");
      }
    });
  }
  
  const billChecklist = document.getElementById("billPaintsChecklist");
  if (billChecklist) {
    billChecklist.innerHTML = AppState.paintCatalog.filter(p => !p.hidden).map(p => `
      <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; user-select: none;">
        <input type="checkbox" name="billPaintGrade" value="${p.id}" data-brand="${p.brand}" data-grade="${p.grade}">
        <span>${p.brand} - ${p.grade}</span>
      </label>
    `).join('');
  }

  const addBillForm = document.getElementById("addBillForm");
  if (addBillForm) {
    addBillForm.addEventListener("submit", handleAddBill);
  }

  // Worker tab menu subpane switching
  const workerTabMenu = document.querySelector("#con-workers .tab-menu");
  if (workerTabMenu) {
    const btns = workerTabMenu.querySelectorAll(".tab-menu-btn");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        // Hide all subpanes inside #con-workers
        document.querySelectorAll("#con-workers .con-subpane").forEach(pane => {
          pane.style.display = "none";
          pane.classList.remove("active");
        });
        
        const subpaneId = btn.getAttribute("data-subpane");
        const activePane = document.getElementById(subpaneId);
        if (activePane) {
          activePane.style.display = "block";
          activePane.classList.add("active");
        }
        
        // Custom logic when switching tabs
        if (subpaneId === "workers-confidential-pane") {
          populateWorkersConfidentialTable();
        } else if (subpaneId === "workers-attendance-pane") {
          populateAttendanceWorkerLookupDropdown();
        }
      });
    });
  }

  // Contractor portal tab click delegation
  document.addEventListener("click", (e) => {
    const tab = e.target.closest("#contractorDashboard .portal-tab");
    if (tab) {
      const pane = tab.getAttribute("data-pane");
      if (pane === "con-portfolio") {
        populatePortfolioMediaTable();
        populatePortfolioReviewsTable();
      } else if (pane === "con-permissions") {
        populatePermissionsTable();
      } else if (pane === "con-credentials") {
        populateCredentialsTable();
      } else if (pane === "con-leads") {
        populateLeadsTable();
      } else if (pane === "con-workers") {
        populateWorkersTable();
      } else if (pane === "con-finances") {
        populateLedgerTables();
      }
    }
  });

  // Portfolio subpane menu switching
  const portfolioTabMenu = document.querySelector("#con-portfolio .tab-menu");
  if (portfolioTabMenu) {
    const btns = portfolioTabMenu.querySelectorAll(".tab-menu-btn");
    btns.forEach(btn => {
      btn.addEventListener("click", () => {
        btns.forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        
        document.querySelectorAll("#con-portfolio .con-subpane").forEach(pane => {
          pane.style.display = "none";
          pane.classList.remove("active");
        });
        
        const subpaneId = btn.getAttribute("data-subpane");
        const activePane = document.getElementById(subpaneId);
        if (activePane) {
          activePane.style.display = "block";
          activePane.classList.add("active");
        }
      });
    });
  }
}

function updateContractorKPIs() {
  document.getElementById("kpiBookings").innerText = AppState.enquiries.length;
  document.getElementById("kpiPainters").innerText = AppState.workers.length;
  
  let totalRevenue = 0;
  AppState.payments.forEach(p => {
    totalRevenue += p.amount;
  });
  document.getElementById("kpiRevenue").innerText = `₹${totalRevenue.toLocaleString('en-IN')}`;
  
  let outputGst = 0;
  AppState.payments.forEach(p => {
    outputGst += p.gstAmount;
  });
  
  let inputGst = 0;
  AppState.bills.forEach(b => {
    inputGst += b.gstAmount;
  });
  
  const netGst = outputGst - inputGst;
  document.getElementById("kpiGSTPaid").innerText = `₹${netGst.toLocaleString('en-IN')}`;
  
  document.getElementById("gstOutputSum").innerText = `₹${outputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("gstInputSum").innerText = `- ₹${inputGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("gstNetPayable").innerText = `₹${netGst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  
  if (netGst < 0) {
    document.getElementById("gstNetPayable").style.color = "var(--secondary)";
  } else {
    document.getElementById("gstNetPayable").style.color = "var(--danger)";
  }

  // Populate options dropdown for manual payment form
  const paySelect = document.getElementById("payProjectSelect");
  if (paySelect) {
    paySelect.innerHTML = `<option value="">Select Project Site</option>`;
    AppState.enquiries.forEach(e => {
      paySelect.insertAdjacentHTML('beforeend', `<option value="${e.id}">${e.id} - ${e.name} (${e.address.split(',')[0]})</option>`);
    });
  }
}

// Display Booking Enquiry grid
function populateEnquiriesTable() {
  const tbody = document.getElementById("conEnquiriesBody");
  if (!tbody) return;
  
  if (AppState.enquiries.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No booking inquiries registered.</td></tr>`;
    return;
  }
  
  tbody.innerHTML = AppState.enquiries.map(e => {
    const options = AppState.workers.filter(w => w.approved).map(w => {
      const isSelected = e.assignedWorkerId === w.id ? 'selected' : '';
      return `<option value="${w.id}" ${isSelected}>${w.name}</option>`;
    }).join('');
    
    const assignedPainterSelect = e.status !== "Completed" ? `
      <select class="input-control select-control" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:130px;" onchange="assignPainterToProject('${e.id}', this.value)">
        <option value="">Unassigned</option>
        ${options}
      </select>
    ` : (AppState.workers.find(w => w.id === e.assignedWorkerId)?.name || 'Completed');

    // Status Dropdown Select
    const statusOptions = ["Pending Survey", "In Progress", "Completed", "On Hold", "Fault Logged"].map(st => {
      const isSelected = e.status === st ? 'selected' : '';
      return `<option value="${st}" ${isSelected}>${st}</option>`;
    }).join('');
    
    const statusDropdown = `
      <select class="input-control select-control" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:130px; background: rgba(99,102,241,0.05); color: var(--accent); font-weight: 600;" onchange="updateProjectStatus('${e.id}', this.value)">
        ${statusOptions}
      </select>
    `;
    
    return `
      <tr>
        <td><strong>${e.id}</strong></td>
        <td>
          <strong>${e.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-secondary);">${e.phone}</span>
        </td>
        <td style="max-width:180px; font-size:0.8rem;">${e.address}</td>
        <td>
          <strong>₹${e.estimateAmount.toLocaleString('en-IN')}</strong><br>
          <span style="font-size:0.72rem; color:var(--text-muted);">${e.areaSqft} sqft | ${e.pricingModel}</span><br>
          <span style="font-size:0.72rem; color:var(--secondary); font-weight:600;">Est: ${e.estHours || 0}h | Logged: ${e.totalHoursWorked || 0}h</span>
        </td>
        <td>${assignedPainterSelect}</td>
        <td>${statusDropdown}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            ${e.status === 'Pending Survey' ? `<button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="approveSurvey('${e.id}')">Start</button>` : ''}
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background: var(--secondary-glow);" onclick="openProjectWorkModal('${e.id}')">Log Details</button>
            ${e.password ? `<button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background: var(--accent-glow);" onclick="resetUserPassword('${e.id}', 'Customer')">Reset Pass</button>` : ''}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

window.updateProjectStatus = function(enquiryId, newStatus) {
  const enquiry = AppState.enquiries.find(e => e.id === enquiryId);
  if (!enquiry) return;
  
  enquiry.status = newStatus;
  
  // Sync timeline
  if (newStatus === "Completed") {
    enquiry.timeline.forEach(t => t.done = true);
  }
  
  AppState.saveAll();
  populateEnquiriesTable();
  renderHomepage();
};

window.assignPainterToProject = function(enquiryId, workerId) {
  const enquiry = AppState.enquiries.find(e => e.id === enquiryId);
  if (!enquiry) return;
  
  enquiry.assignedWorkerId = workerId;
  if (workerId && enquiry.status === "Pending Survey") {
    enquiry.status = "In Progress";
    enquiry.timeline[0].done = true;
    enquiry.timeline[0].date = getCurrentTimestamp();
  } else if (!workerId && enquiry.status === "In Progress") {
    enquiry.status = "Pending Survey";
  }
  
  AppState.saveAll();
  populateEnquiriesTable();
  updateContractorKPIs();
};

window.approveSurvey = function(enquiryId) {
  const enquiry = AppState.enquiries.find(e => e.id === enquiryId);
  if (!enquiry) return;
  
  enquiry.status = "In Progress";
  enquiry.timeline[0].done = true;
  enquiry.timeline[0].date = getCurrentTimestamp();
  
  AppState.saveAll();
  populateEnquiriesTable();
  updateContractorKPIs();
};

window.completeProjectManual = function(enquiryId) {
  const enquiry = AppState.enquiries.find(e => e.id === enquiryId);
  if (!enquiry) return;
  
  enquiry.status = "Completed";
  enquiry.timeline.forEach(t => {
    if (!t.done) {
      t.done = true;
      t.date = getCurrentTimestamp();
    }
  });
  
  AppState.saveAll();
  populateEnquiriesTable();
  updateContractorKPIs();
};

// Display workers list
async function populateWorkersTable() {
  const tbody = document.getElementById("conWorkersBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (AppState.workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No painters registered.</td></tr>`;
    return;
  }
  
  for (let w of AppState.workers) {
    let statusClass = w.status === "Active" ? "badge-success" : "badge-danger";
    let actionBtn = "";
    
    if (!w.approved) {
      actionBtn = `<button class="btn btn-success" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="approveWorker('${w.id}')">Approve Profile</button>`;
      statusClass = "badge-warning";
      w.status = "Pending Approve";
    } else {
      actionBtn = `
        <div style="display:flex; gap:0.4rem;">
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="payLaborManual('${w.id}')">Pay Salary</button>
          <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--accent);" onclick="viewWorkerSpreadsheet('${w.id}')"><i data-lucide="table"></i> View Sheet</button>
        </div>
      `;
    }
    
    const row = `
      <tr>
        <td><strong>${w.name}</strong></td>
        <td>${w.phone}</td>
        <td><span class="badge badge-primary">${w.specialty}</span></td>
        <td><span class="badge ${statusClass}">${w.status}</span></td>
        <td>${actionBtn}</td>
      </tr>
    `;
    tbody.insertAdjacentHTML('beforeend', row);
  }

  // Refresh confidential lists
  populateWorkersConfidentialTable();
  safeCreateIcons();
}

window.approveWorker = function(workerId) {
  const worker = AppState.workers.find(w => w.id === workerId);
  if (!worker) return;
  
  worker.approved = true;
  worker.status = "Inactive";
  AppState.saveAll();
  
  populateWorkersTable();
  populateEnquiriesTable();
  updateContractorKPIs();
};

window.payLaborManual = function(workerId) {
  const worker = AppState.workers.find(w => w.id === workerId);
  if (!worker) return;

  document.getElementById("paySalWorkerId").value = workerId;
  document.getElementById("paySalWorkerName").value = worker.name;
  document.getElementById("paySalAmount").value = "1200";
  document.getElementById("paySalHours").value = "8";
  
  const vpaInput = document.getElementById("paySalWorkerVpa");
  if (vpaInput) {
    vpaInput.value = `${worker.name.toLowerCase().replace(/\s+/g, "")}@okaxis`;
  }

  const statusBox = document.getElementById("payoutStatusLogBox");
  if (statusBox) statusBox.style.display = "none";

  document.getElementById("paySalaryModal").style.display = "flex";
};

// Route Payout Gateways
window.routePayoutGateway = function(gateway) {
  const workerId = document.getElementById("paySalWorkerId").value;
  const workerName = document.getElementById("paySalWorkerName").value;
  const amount = parseFloat(document.getElementById("paySalAmount").value) || 1200;
  const vpa = document.getElementById("paySalWorkerVpa").value.trim() || `${workerName.toLowerCase().replace(/\s+/g, "")}@okaxis`;

  const statusBox = document.getElementById("payoutStatusLogBox");
  const statusMsg = document.getElementById("payoutStatusMessage");

  if (statusBox && statusMsg) {
    statusBox.style.display = "block";
    statusMsg.innerHTML = `<span style="color:var(--secondary);"><i data-lucide="loader" class="spin-icon" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Initiating secure session on ${gateway.toUpperCase()} network...</span>`;
    safeCreateIcons();
  }

  let payUrl = "";
  let gateLabel = "";
  if (gateway === "gpay") {
    payUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(workerName)}&am=${amount.toFixed(2)}&cu=INR&tn=Salary%20GooglePay`;
    gateLabel = "Google Pay";
  } else if (gateway === "phonepe") {
    payUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(workerName)}&am=${amount.toFixed(2)}&cu=INR&tn=Salary%20PhonePe`;
    gateLabel = "PhonePe";
  } else if (gateway === "paytm") {
    payUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(workerName)}&am=${amount.toFixed(2)}&cu=INR&tn=Salary%20Paytm`;
    gateLabel = "Paytm UPI";
  } else if (gateway === "bhim") {
    payUrl = `upi://pay?pa=${vpa}&pn=${encodeURIComponent(workerName)}&am=${amount.toFixed(2)}&cu=INR&tn=Salary%20BHIM`;
    gateLabel = "BHIM UPI";
  } else if (gateway === "sbi") {
    payUrl = "https://corporate.onlinesbi.sbi/corporate/sbi_corporate_login.htm";
    gateLabel = "SBI Corporate";
  } else if (gateway === "hdfc") {
    payUrl = "https://www.hdfcbank.com/personal/ways-to-bank/net-banking";
    gateLabel = "HDFC Netbanking";
  } else if (gateway === "icici") {
    payUrl = "https://www.icicibank.com/Personal-Banking/insta-banking/internet-banking/index.page";
    gateLabel = "ICICI InstaBanking";
  }

  setTimeout(() => {
    window.open(payUrl, "_blank");
    if (statusMsg) {
      statusMsg.innerHTML = `<span style="color:#60a5fa;"><i data-lucide="clock" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Awaiting auth confirmation from ${gateLabel} app...</span>`;
      safeCreateIcons();
      
      setTimeout(() => {
        statusMsg.innerHTML = `<span style="color:#10b981;"><i data-lucide="check-circle" style="width:12px; height:12px; display:inline-block; vertical-align:middle; margin-right:4px;"></i> Transaction authorized via ${gateLabel}! Click "Save & Record" below.</span>`;
        safeCreateIcons();
      }, 1500);
    }
  }, 1200);
};

// Handle salary payout submit
document.addEventListener("DOMContentLoaded", () => {
  const salForm = document.getElementById("paySalaryForm");
  if (salForm) {
    salForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const workerId = document.getElementById("paySalWorkerId").value;
      const workerName = document.getElementById("paySalWorkerName").value;
      const amount = parseFloat(document.getElementById("paySalAmount").value) || 0;
      const hours = parseInt(document.getElementById("paySalHours").value) || 8;

      if (!workerId || amount <= 0 || hours <= 0) {
        alert("Please specify a valid disbursement amount and working hours.");
        return;
      }

      const assignedProj = getWorkerProject(workerId);
      const projId = assignedProj ? assignedProj.id : "Admin task";

      const newSal = {
        id: `SAL-${Math.floor(1000 + Math.random() * 9000)}`,
        date: getCurrentTimestamp(),
        workerId: workerId,
        workerName: workerName,
        projectId: projId,
        hoursWorked: hours,
        amountPaid: amount,
        gateway: "Netbanking/UPI Route"
      };

      AppState.salaries.unshift(newSal);
      AppState.saveAll();

      alert(`Wages payout record of ₹${amount} saved and logged to spreadsheet for painter ${workerName}.`);
      document.getElementById("paySalaryModal").style.display = "none";
      
      populateLedgerTables();
      
      // If worker spreadsheet is open, refresh it dynamically
      const sheetModal = document.getElementById("workerSpreadsheetModal");
      if (sheetModal && sheetModal.style.display === "flex") {
        viewWorkerSpreadsheet(workerId);
      }
    });
  }
});

// View Individual Worker Spreadsheet details modal
window.viewWorkerSpreadsheet = function(workerId) {
  const worker = AppState.workers.find(w => w.id === workerId);
  if (!worker) return;

  const conf = AppState.confidentialProfiles.find(c => c.workerId === workerId) || {
    pan: "Pending Log",
    aadhar: "Pending Log",
    rentalAgreement: "Not Verified",
    bankAccount: "Not Set",
    emergencyContact: "Not Logged",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  };

  // Populate Biodata details
  document.getElementById("sheetWorkerName").innerText = worker.name;
  document.getElementById("sheetWorkerId").innerText = worker.id;
  document.getElementById("sheetMobile").innerText = worker.phone || "N/A";
  document.getElementById("sheetEmail").innerText = worker.email || `${worker.name.toLowerCase().replace(/\s+/g, "")}@mgvpainters.com`;
  document.getElementById("sheetAadhar").innerText = conf.aadhar || "N/A";
  document.getElementById("sheetPAN").innerText = conf.pan || "N/A";
  document.getElementById("sheetRental").innerText = conf.rentalAgreement || "N/A";
  document.getElementById("sheetEmergency").innerText = conf.emergencyContact || "N/A";
  document.getElementById("sheetBankDetails").innerText = conf.bankAccount || "N/A";

  const avatar = document.getElementById("sheetWorkerAvatar");
  if (avatar) {
    avatar.innerHTML = `<img src="${conf.photo}" style="width:100%; height:100%; object-fit:cover;">`;
  }

  // Work details & hours calculations
  const assignedProj = getWorkerProject(workerId);
  const activeProjTitle = assignedProj ? `${assignedProj.name} (${assignedProj.id})` : "No active project";
  document.getElementById("sheetProjects").innerText = activeProjTitle;

  // Filter wages history and working hours
  const history = AppState.salaries.filter(s => s.workerId === workerId);
  const totalLifetimeWagesPaid = history.reduce((sum, item) => sum + item.amountPaid, 0);

  // Fetch worker attendance and calculate total hours
  const attendanceLogs = worker.attendance || [];
  const totalLifetimeHours = attendanceLogs.reduce((sum, item) => sum + (parseFloat(item.hours) || parseFloat(item.hoursToday) || 8), 0);
  
  // Calculate current month hours
  const currentMonthPrefix = new Date().toISOString().substring(0, 7); // e.g. "2026-08"
  const monthlyLogs = attendanceLogs.filter(a => a.date && a.date.startsWith(currentMonthPrefix));
  const monthlyHours = monthlyLogs.reduce((sum, item) => sum + (parseFloat(item.hours) || parseFloat(item.hoursToday) || 8), 0);

  document.getElementById("sheetLifetimeHours").innerText = `${totalLifetimeHours} hrs`;
  document.getElementById("sheetMonthlyHours").innerText = `${monthlyHours} hrs`;

  // Base salary (daily wages)
  const baseSalaryDaily = 1200; // default standard wages
  document.getElementById("sheetBaseSalary").innerText = `₹${baseSalaryDaily.toLocaleString('en-IN')}/day`;
  
  // Rating and Remarks
  document.getElementById("sheetRating").innerText = "★".repeat(worker.rating || 5) + "☆".repeat(5 - (worker.rating || 5));
  document.getElementById("sheetRemarks").innerText = worker.remarks || "Excellent work and on-time measurement survey support.";

  // Advances, debits, pending salaries
  const totalAdvances = history.filter(h => h.projectId === "Wages Advance").reduce((sum, item) => sum + item.amountPaid, 0);
  const pendingSalaries = 0; // Default calculated on standard unpaid wages
  document.getElementById("sheetAdvances").innerText = `₹${totalAdvances.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("sheetPendingSalaries").innerText = `₹${pendingSalaries.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("sheetPendingWorks").innerText = assignedProj && assignedProj.status !== "Completed" ? "In Progress" : "None";

  // Populated Wages History Body
  const wagesTbody = document.getElementById("sheetWagesHistoryBody");
  if (wagesTbody) {
    if (history.length === 0) {
      wagesTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="font-size:0.75rem;">No salary disbursements recorded.</td></tr>`;
    } else {
      wagesTbody.innerHTML = history.map(h => `
        <tr>
          <td style="font-size:0.78rem;">${h.date}</td>
          <td style="font-size:0.78rem;"><strong>${h.id}</strong></td>
          <td style="font-size:0.78rem;">${h.hoursWorked} hrs</td>
          <td style="font-size:0.78rem; font-weight:600; color:#10b981;">₹${h.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          <td style="font-size:0.78rem; color:var(--text-muted);">${h.gateway || 'Corporate Netbanking'}</td>
        </tr>
      `).join('');
    }
  }

  document.getElementById("workerSpreadsheetModal").style.display = "flex";
  safeCreateIcons();
};

// Modal image lightbox preview
window.viewFullImageModal = function(imgSrc, title) {
  const modal = document.createElement("div");
  modal.style = `
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.9);
    z-index: 10000;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 2rem;
  `;
  
  modal.innerHTML = `
    <h3 style="color:white; margin-bottom: 1rem;">${title}</h3>
    <img src="${imgSrc}" style="max-width:90%; max-height:80%; border-radius:8px; box-shadow: 0 4px 30px rgba(0,0,0,0.5);">
    <button class="btn btn-primary mt-4" style="padding:0.5rem 2rem;">Close Preview</button>
  `;
  
  modal.querySelector("button").onclick = () => modal.remove();
  document.body.appendChild(modal);
};


/* ==================== LEDGER TABLES & FINANCE ==================== */
function populateLedgerTables() {
  const incomeTbody = document.getElementById("ledgerIncomeBody");
  if (incomeTbody) {
    incomeTbody.innerHTML = "";
    if (AppState.payments.length === 0) {
      incomeTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No payments received yet.</td></tr>`;
    } else {
      AppState.payments.forEach(p => {
        const phaseLabel = p.phase || (p.isAdvance ? 'Advance Payment' : 'Installment');
        incomeTbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${p.date}</td>
            <td><strong>${p.id}</strong><br><span style="font-size:0.72rem; color:var(--text-muted);">${p.paymentMethod}</span></td>
            <td>${p.customerName} (${p.customerId})<br><span style="font-size:0.75rem; color:var(--secondary); font-weight:600;">${phaseLabel} | Ref: ${p.upiQrRef || ''}</span></td>
            <td>₹${p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${(p.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${(p.gstAmount / 2).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td><strong>₹${p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            <td>
              <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewPaymentReceipt('${p.id}')">View QR Receipt</button>
            </td>
          </tr>
        `);
      });
    }
  }

  const materialsTbody = document.getElementById("ledgerMaterialsBody");
  if (materialsTbody) {
    materialsTbody.innerHTML = "";
    if (AppState.bills.length === 0) {
      materialsTbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No purchase bills saved.</td></tr>`;
    } else {
      AppState.bills.forEach(b => {
        const fileBtn = b.invoiceFileId ? `
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewUploadedInvoice('${b.invoiceFileId}')">View Invoice</button>
        ` : `<span class="text-muted" style="font-size:0.75rem;">No file</span>`;
        const gstinLabel = b.vendorGSTIN && b.vendorGSTIN !== 'N/A' ? `<br><span style="font-size:0.72rem; color:var(--text-muted);">GSTIN: ${b.vendorGSTIN}</span>` : '';
        const invNoLabel = b.invoiceNo ? `<br><span style="font-size:0.72rem; color:var(--text-muted);">Inv: ${b.invoiceNo}</span>` : '';
        materialsTbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${b.date}</td>
            <td><strong>${b.id}</strong>${invNoLabel}</td>
            <td>${b.vendorName}${gstinLabel}</td>
            <td>${b.paintType}</td>
            <td>₹${b.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td>₹${b.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })} (GST ${b.quantity || '18'}%)</td>
            <td><strong>₹${b.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            <td>${fileBtn}</td>
          </tr>
        `);
      });
    }
  }

  const laborTbody = document.getElementById("ledgerLaborBody");
  if (laborTbody) {
    laborTbody.innerHTML = "";
    if (AppState.salaries.length === 0) {
      laborTbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No worker payouts documented.</td></tr>`;
    } else {
      AppState.salaries.forEach(s => {
        laborTbody.insertAdjacentHTML('beforeend', `
          <tr>
            <td>${s.date}</td>
            <td><strong>${s.id}</strong></td>
            <td>${s.workerName}</td>
            <td>Job Ref: ${s.projectId}</td>
            <td><strong>₹${s.amountPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong></td>
            <td><span class="badge badge-success">Paid</span></td>
          </tr>
        `);
      });
    }
  }
}

function handleAddPayment(e) {
  e.preventDefault();
  
  const projectId = document.getElementById("payProjectSelect").value;
  const baseVal = parseFloat(document.getElementById("payBaseAmount").value) || 0;
  
  if (!projectId || baseVal <= 0) {
    alert("Please select a project site and enter a positive payment amount.");
    return;
  }
  
  const enquiry = AppState.enquiries.find(e => e.id === projectId);
  if (!enquiry) return;
  
  const gst = baseVal * 0.18;
  const total = baseVal + gst;
 
  const phase = document.getElementById("payInstallmentPhase").value;
  const isAdvance = document.getElementById("payIsAdvance").checked;
  const qrContainer = document.getElementById("payUpiQrContainer");
  const qrVisible = qrContainer && qrContainer.style.display === "block";
  const txnRef = document.getElementById("payUpiTxnRef").value.trim();
 
  if (qrVisible && !txnRef) {
    alert("Please enter the UPI transaction reference ID.");
    return;
  }
  
  const newPayment = {
    id: `PAY-${Math.floor(1000 + Math.random() * 9000)}`,
    date: getCurrentTimestamp(),
    customerId: enquiry.id,
    customerName: enquiry.name,
    amount: baseVal,
    gstAmount: gst,
    totalAmount: total,
    paymentMethod: qrVisible ? "UPI QR Scan" : "Bank Ledger",
    phase: phase,
    isAdvance: isAdvance,
    upiQrRef: txnRef || `TXN-${Math.floor(100000 + Math.random() * 900000)}`,
    status: "Verified"
  };
  
  AppState.payments.unshift(newPayment);

  // Sync to enquiry installments array
  enquiry.installments = enquiry.installments || [];
  enquiry.installments.push({
    date: newPayment.date,
    amount: total,
    type: phase,
    reference: newPayment.upiQrRef,
    method: newPayment.paymentMethod
  });

  if (isAdvance && (enquiry.status === "Pending Survey" || enquiry.status === "Pending Assignment")) {
    enquiry.status = "In Progress";
    enquiry.timeline[0].done = true;
    enquiry.timeline[0].date = newPayment.date;
  }

  AppState.saveAll();
  
  // Show simulated WhatsApp & SMS alerts immediately to customer on behalf of MGV Painters
  showDynamicPaymentAlert(enquiry.name, enquiry.phone, total, phase);

  document.getElementById("addPaymentForm").reset();
  if (qrContainer) qrContainer.style.display = "none";
  alert("Manual Customer Payment recorded successfully and synced to project milestones.");
  
  updateContractorKPIs();
  populateLedgerTables();
}

function showDynamicPaymentAlert(customerName, phone, amount, phase) {
  const container = document.createElement("div");
  container.style = `
    position: fixed;
    top: 25px;
    right: 25px;
    z-index: 100000;
    width: 360px;
    display: flex;
    flex-direction: column;
    gap: 12px;
    font-family: 'Inter', sans-serif;
  `;
  
  const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const txId = `TXN-${Math.floor(100000 + Math.random() * 900000)}`;

  const smsHtml = `
    <div style="background: #1e293b; color: white; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); padding: 1rem; position: relative; animation: slideInNotification 0.4s ease-out;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.72rem; color: #ea580c; font-weight: bold; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
          💬 SMS ALERT &bull; MGV Painters
        </span>
        <span style="font-size: 0.7rem; color: #64748b;">${timestamp}</span>
      </div>
      <div style="font-size: 0.8rem; line-height: 1.4; color: #cbd5e1;">
        Dear <strong>${customerName}</strong>, payment of <strong>₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> for your project (${phase}) has been received successfully. Thank you for choosing MGV Painters!
      </div>
    </div>
  `;

  const waHtml = `
    <div style="background: #075e54; color: white; border-radius: 12px; border: 1px solid rgba(255,255,255,0.1); box-shadow: 0 10px 15px -3px rgba(0,0,0,0.3); padding: 1rem; position: relative; animation: slideInNotification 0.4s ease-out 0.2s; animation-fill-mode: backwards;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
        <span style="font-size: 0.72rem; color: #a3e635; font-weight: bold; letter-spacing: 0.05em; display: flex; align-items: center; gap: 4px;">
          🟢 WHATSAPP &bull; MGV Painters Official
        </span>
        <span style="font-size: 0.7rem; color: #a3b899;">${timestamp}</span>
      </div>
      <div style="font-size: 0.8rem; line-height: 1.4; color: #f1f5f9;">
        🟢 <strong>Payment Acknowledgment</strong><br>
        Hi <strong>${customerName}</strong>,<br>
        We have credited <strong>₹${amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</strong> to your billing directory under <em>${phase}</em>.<br>
        Ref ID: ${txId}<br>
        Track live: <a href="#" style="color: #60a5fa; text-decoration: underline;">mgvpainters.com/portal</a>
      </div>
    </div>
  `;

  container.innerHTML = smsHtml + waHtml;
  document.body.appendChild(container);
  
  if (!document.getElementById("notificationAnimationCSS")) {
    const style = document.createElement("style");
    style.id = "notificationAnimationCSS";
    style.innerHTML = `
      @keyframes slideInNotification {
        from { transform: translateX(120%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutNotification {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(120%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  setTimeout(() => {
    container.style.animation = "slideOutNotification 0.5s ease-in forwards";
    setTimeout(() => container.remove(), 500);
  }, 7500);
}

async function handleAddBill(e) {
  e.preventDefault();
  
  const vendor = document.getElementById("billVendor").value.trim();
  const gstin = document.getElementById("billGSTIN").value.trim();
  const invoiceNo = document.getElementById("billInvoiceNo").value.trim();
  const baseCost = parseFloat(document.getElementById("billBaseAmount").value) || 0;
  const taxRate = parseFloat(document.getElementById("billGST").value);
  
  const checkedBoxes = Array.from(document.querySelectorAll('input[name="billPaintGrade"]:checked'));
  const selectedPaints = checkedBoxes.map(box => box.value);
  const paintsSummary = checkedBoxes.map(box => `${box.getAttribute('data-brand')} - ${box.getAttribute('data-grade')}`).join(', ') || "Miscellaneous Purchases";

  if (!vendor || baseCost <= 0 || !invoiceNo) {
    alert("Please enter vendor, invoice number, and base cost details.");
    return;
  }
  
  let fileId = null;
  const fileInput = document.getElementById("billInvoiceUpload");
  if (fileInput && fileInput.files.length > 0) {
    try {
      const base64 = await readFileAsBase64(fileInput.files[0]);
      fileId = await savePhotoToDB('painter_documents', { fileData: base64, type: 'invoice' });
    } catch (err) {
      console.error("Failed to save invoice file to DB:", err);
    }
  }

  const gst = baseCost * (taxRate / 100);
  const total = baseCost + gst;
  
  const newBill = {
    id: `BIL-${Math.floor(1000 + Math.random() * 9000)}`,
    date: getCurrentTimestamp(),
    vendorName: vendor,
    vendorGSTIN: gstin || "N/A",
    invoiceNo: invoiceNo,
    paintBrand: selectedPaints.join(','),
    paintType: paintsSummary,
    quantity: taxRate.toString(), // tax rate %
    amount: baseCost,
    gstAmount: gst,
    totalAmount: total,
    invoiceFileId: fileId,
    billType: "Material Purchase"
  };
  
  AppState.bills.unshift(newBill);
  AppState.saveAll();
  
  document.getElementById("addBillForm").reset();
  // Clear checklist checkboxes
  document.querySelectorAll('input[name="billPaintGrade"]').forEach(chk => chk.checked = false);

  alert("Material Purchase Invoice logged successfully.");
  
  updateContractorKPIs();
  populateLedgerTables();
}


let selectedWorkerForRoute = null;
let mapZoom = 1.0;
let mapPanX = 0;
let mapPanY = 0;
let isSatellite = false;
const satelliteBg = new Image();
satelliteBg.src = "https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&q=80&w=1000";

function initGPSMap() {
  const canvas = document.getElementById("gpsMapCanvas");
  if (!canvas) return;
  
  const ctx = canvas.getContext("2d");
  
  // Set dimensions based on parent container
  canvas.width = canvas.parentElement.clientWidth;
  canvas.height = 400;
  
  const w = canvas.width;
  const h = canvas.height;
  
  const latMax = 12.9350;
  const latMin = 12.9050;
  const lngMin = 77.6250;
  const lngMax = 77.6600;
  
  // Logical map coordinate space
  const mapWidth = 1000;
  const mapHeight = 700;
  
  function getRawXY(lat, lng) {
    const rx = ((lng - lngMin) / (lngMax - lngMin)) * mapWidth;
    const ry = ((latMax - lat) / (latMax - latMin)) * mapHeight;
    return { x: rx, y: ry };
  }
  
  function getXY(lat, lng) {
    const raw = getRawXY(lat, lng);
    // Center logic map inside canvas, scale by zoom, apply offsets
    const x = (raw.x - mapWidth / 2) * mapZoom + w / 2 + mapPanX;
    const y = (raw.y - mapHeight / 2) * mapZoom + h / 2 + mapPanY;
    return { x, y };
  }

  // Populate Route Dropdown
  const routeSelect = document.getElementById("mapRouteWorkerSelect");
  if (routeSelect) {
    routeSelect.innerHTML = `<option value="">-- Select Painter Pin or Option below --</option>` +
      AppState.workers.filter(w => w.approved).map(w => `<option value="${w.id}">${w.name} (${getWorkerProject(w.id) ? 'Site ' + getWorkerProject(w.id).id : 'Idle'})</option>`).join('');
    
    routeSelect.value = selectedWorkerForRoute ? selectedWorkerForRoute.id : "";
    
    routeSelect.onchange = (e) => {
      const selectedId = e.target.value;
      const worker = AppState.workers.find(w => w.id === selectedId);
      const pinCoordsSpan = document.getElementById("gpsLivePinCoords");
      if (worker) {
        selectedWorkerForRoute = worker;
        mapZoom = 1.8;
        const raw = getRawXY(worker.currentLat, worker.currentLng);
        mapPanX = -(raw.x - mapWidth / 2) * mapZoom;
        mapPanY = -(raw.y - mapHeight / 2) * mapZoom;
        if (pinCoordsSpan) {
          pinCoordsSpan.innerText = `${worker.name} (${worker.currentLat.toFixed(5)}° N, ${worker.currentLng.toFixed(5)}° E)`;
        }
      } else {
        selectedWorkerForRoute = null;
        if (pinCoordsSpan) {
          pinCoordsSpan.innerText = "None Selected";
        }
      }
    };
  }
  
  let pulseRadius = 0;
  let dashOffset = 0;
  
  // Interactive drag-to-pan & click-to-route implementation
  let isDragging = false;
  let hasDragged = false;
  let dragStartX = 0;
  let dragStartY = 0;
  
  canvas.addEventListener("mousedown", (e) => {
    isDragging = true;
    hasDragged = false;
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    dragStartX = mouseX - mapPanX;
    dragStartY = mouseY - mapPanY;
    canvas.style.cursor = "grabbing";
  });
  
  canvas.addEventListener("mousemove", (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Calculate inverse projection to project canvas coordinates to lat/lng
    const rawX = (mouseX - w / 2 - mapPanX) / mapZoom + mapWidth / 2;
    const rawY = (mouseY - h / 2 - mapPanY) / mapZoom + mapHeight / 2;
    const currentLng = lngMin + (rawX / mapWidth) * (lngMax - lngMin);
    const currentLat = latMax - (rawY / mapHeight) * (latMax - latMin);
    
    const cursorCoordsSpan = document.getElementById("gpsLiveCursorCoords");
    if (cursorCoordsSpan) {
      cursorCoordsSpan.innerText = `${Math.max(latMin, Math.min(latMax, currentLat)).toFixed(5)}° N, ${Math.max(lngMin, Math.min(lngMax, currentLng)).toFixed(5)}° E`;
    }

    if (!isDragging) return;
    hasDragged = true;
    mapPanX = mouseX - dragStartX;
    mapPanY = mouseY - dragStartY;
  });
  
  const stopDrag = (e) => {
    if (isDragging && !hasDragged) {
      // It was a click, not a drag!
      const rect = canvas.getBoundingClientRect();
      const clickX = e.clientX - rect.left;
      const clickY = e.clientY - rect.top;
      
      let clickedWorker = null;
      AppState.workers.forEach(w => {
        if (!w.approved) return;
        const { x, y } = getXY(w.currentLat, w.currentLng);
        const dist = Math.hypot(clickX - x, clickY - y);
        if (dist < 20) {
          clickedWorker = w;
        }
      });
      
      const pinCoordsSpan = document.getElementById("gpsLivePinCoords");
      if (clickedWorker) {
        selectedWorkerForRoute = clickedWorker;
        if (routeSelect) routeSelect.value = clickedWorker.id;
        if (pinCoordsSpan) {
          pinCoordsSpan.innerText = `${clickedWorker.name} (${clickedWorker.currentLat.toFixed(5)}° N, ${clickedWorker.currentLng.toFixed(5)}° E)`;
        }
      } else {
        selectedWorkerForRoute = null;
        if (routeSelect) routeSelect.value = "";
        if (pinCoordsSpan) {
          pinCoordsSpan.innerText = "None Selected";
        }
      }
    }
    isDragging = false;
    canvas.style.cursor = "grab";
  };
  
  canvas.addEventListener("mouseup", stopDrag);
  canvas.addEventListener("mouseleave", () => { isDragging = false; canvas.style.cursor = "grab"; });
  
  // Wheel Zoom support
  canvas.addEventListener("wheel", (e) => {
    e.preventDefault();
    const zoomFactor = 1.1;
    if (e.deltaY < 0) {
      mapZoom = Math.min(mapZoom * zoomFactor, 5.0);
    } else {
      mapZoom = Math.max(mapZoom / zoomFactor, 0.5);
    }
  });
  
  // Overlay Control Buttons wiring
  const btnZoomIn = document.getElementById("mapZoomIn");
  const btnZoomOut = document.getElementById("mapZoomOut");
  const btnReset = document.getElementById("mapReset");
  const btnToggleSat = document.getElementById("mapToggleSatellite");
  
  if (btnZoomIn) {
    btnZoomIn.onclick = () => {
      mapZoom = Math.min(mapZoom * 1.2, 5.0);
    };
  }
  if (btnZoomOut) {
    btnZoomOut.onclick = () => {
      mapZoom = Math.max(mapZoom / 1.2, 0.5);
    };
  }
  if (btnReset) {
    btnReset.onclick = () => {
      mapZoom = 1.0;
      mapPanX = 0;
      mapPanY = 0;
      selectedWorkerForRoute = null;
    };
  }
  if (btnToggleSat) {
    btnToggleSat.innerText = isSatellite ? "Vector Mode" : "Satellite Mode";
    btnToggleSat.className = isSatellite ? "map-ctrl-btn toggle-sat" : "map-ctrl-btn toggle-sat inactive";
    
    btnToggleSat.onclick = () => {
      isSatellite = !isSatellite;
      btnToggleSat.innerText = isSatellite ? "Vector Mode" : "Satellite Mode";
      if (isSatellite) {
        btnToggleSat.classList.remove("inactive");
      } else {
        btnToggleSat.classList.add("inactive");
      }
    };
  }
  
  function drawMap() {
    ctx.clearRect(0, 0, w, h);
    
    if (isSatellite && satelliteBg.complete) {
      const sw = mapWidth * mapZoom;
      const sh = mapHeight * mapZoom;
      const sx = (w - sw) / 2 + mapPanX;
      const sy = (h - sh) / 2 + mapPanY;
      ctx.drawImage(satelliteBg, sx, sy, sw, sh);
      
      ctx.fillStyle = "rgba(7, 5, 15, 0.45)";
      ctx.fillRect(0, 0, w, h);
    } else {
      ctx.fillStyle = "#0c1322";
      ctx.fillRect(0, 0, w, h);
      
      ctx.strokeStyle = "rgba(255, 255, 255, 0.02)";
      ctx.lineWidth = 1;
      for (let i = 0; i < w; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, h);
        ctx.stroke();
      }
      for (let j = 0; j < h; j += 40) {
        ctx.beginPath();
        ctx.moveTo(0, j);
        ctx.lineTo(w, j);
        ctx.stroke();
      }
    }
    
    // Streets
    ctx.strokeStyle = isSatellite ? "rgba(99, 102, 241, 0.2)" : "rgba(255,255,255,0.05)";
    ctx.lineWidth = 4;
    
    let p1 = getXY(12.9350, 77.6320);
    let p2 = getXY(12.9050, 77.6520);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    
    let p3 = getXY(12.9350, 77.6425);
    let p4 = getXY(12.9050, 77.6425);
    ctx.beginPath();
    ctx.moveTo(p3.x, p3.y);
    ctx.lineTo(p4.x, p4.y);
    ctx.stroke();
    
    ctx.strokeStyle = isSatellite ? "rgba(99, 102, 241, 0.12)" : "rgba(255,255,255,0.03)";
    ctx.lineWidth = 2;
    for (let latLine = 12.9310; latLine > 12.9050; latLine -= 0.006) {
      let pL1 = getXY(latLine, 77.6250);
      let pL2 = getXY(latLine, 77.6600);
      ctx.beginPath();
      ctx.moveTo(pL1.x, pL1.y);
      ctx.lineTo(pL2.x, pL2.y);
      ctx.stroke();
    }
    
    // Labels
    ctx.fillStyle = isSatellite ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.2)";
    ctx.font = "bold 9px Outfit";
    let label1 = getXY(12.9260, 77.6330);
    ctx.fillText("HSR LAYOUT SECTOR 3", label1.x, label1.y);
    let label2 = getXY(12.9180, 77.6500);
    ctx.fillText("HSR SECTOR 7", label2.x, label2.y);
    
    // 1. Draw Contractor HQ Gopinath Office
    const officeLat = 12.9180;
    const officeLng = 77.6350;
    const officeXY = getXY(officeLat, officeLng);
    
    ctx.beginPath();
    ctx.arc(officeXY.x, officeXY.y, 8, 0, 2 * Math.PI);
    ctx.fillStyle = "var(--primary)";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 9px Inter";
    ctx.fillText("MGV Office (HQ)", officeXY.x - 30, officeXY.y - 12);
    
    // 2. Draw active routing path if selected
    if (selectedWorkerForRoute) {
      const destXY = getXY(selectedWorkerForRoute.currentLat, selectedWorkerForRoute.currentLng);
      
      // Draw neon path line
      ctx.beginPath();
      ctx.moveTo(officeXY.x, officeXY.y);
      // Dotted intermediate route path simulating road turn
      const midX = officeXY.x + (destXY.x - officeXY.x) * 0.4;
      const midY = officeXY.y + (destXY.y - officeXY.y) * 0.8;
      ctx.lineTo(midX, midY);
      ctx.lineTo(destXY.x, destXY.y);
      
      ctx.strokeStyle = "rgba(99, 102, 241, 0.85)";
      ctx.lineWidth = 3.5;
      ctx.setLineDash([6, 4]);
      ctx.lineDashOffset = -dashOffset;
      ctx.stroke();
      ctx.setLineDash([]); // Reset
      
      // Distance calc
      const R = 6371; // km
      const dLat = (selectedWorkerForRoute.currentLat - officeLat) * Math.PI / 180;
      const dLon = (selectedWorkerForRoute.currentLng - officeLng) * Math.PI / 180;
      const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(officeLat * Math.PI / 180) * Math.cos(selectedWorkerForRoute.currentLat * Math.PI / 180) *
                Math.sin(dLon/2) * Math.sin(dLon/2);
      const cDist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
      const distance = R * cDist; // km
      const eta = Math.ceil(distance * 6); // roughly 10 min/km in HSR traffic
      
      // Render Legend Panel
      ctx.fillStyle = "rgba(9, 13, 22, 0.9)";
      ctx.strokeStyle = "var(--primary-glow)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(10, 10, 240, 75, 8);
      ctx.fill();
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 10px Inter";
      ctx.fillText(`Site Visit Route: ${selectedWorkerForRoute.name}`, 20, 28);
      ctx.fillStyle = "var(--secondary)";
      ctx.font = "9px Inter";
      ctx.fillText(`Distance: ${distance.toFixed(2)} km | Est. Drive: ${eta} mins`, 20, 44);
      ctx.fillStyle = "rgba(255,255,255,0.6)";
      ctx.fillText(`HQ: ${officeLat.toFixed(4)}, ${officeLng.toFixed(4)}`, 20, 60);
      ctx.fillText(`Site: ${selectedWorkerForRoute.currentLat.toFixed(4)}, ${selectedWorkerForRoute.currentLng.toFixed(4)}`, 20, 70);
    }
    
    pulseRadius += 0.3;
    if (pulseRadius > 20) pulseRadius = 4;
    dashOffset = (dashOffset + 0.25) % 20;
    
    AppState.workers.forEach(worker => {
      if (!worker.approved) return;
      
      const { x, y } = getXY(worker.currentLat, worker.currentLng);
      
      ctx.beginPath();
      ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
      ctx.strokeStyle = worker.status === "Active" ? "rgba(16, 185, 129, 0.45)" : "rgba(244, 63, 94, 0.45)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, 2 * Math.PI);
      ctx.fillStyle = worker.status === "Active" ? "#10b981" : "#f43f5e";
      ctx.fill();
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      
      ctx.fillStyle = "#ffffff";
      ctx.font = "bold 9px Inter";
      ctx.fillText(worker.name, x + 10, y + 3);
      
      ctx.fillStyle = "rgba(255,255,255,0.65)";
      ctx.font = "7px Inter";
      const job = getWorkerProject(worker.id);
      const textLoc = job ? `Site: #${job.id}` : "Idle / Check-in";
      ctx.fillText(textLoc, x + 10, y + 12);
    });
  }
  
  let animId = null;
  function animate() {
    drawMap();
    animId = requestAnimationFrame(animate);
  }
  animate();
  
  const movementInterval = setInterval(() => {
    AppState.workers.forEach(w => {
      if (w.approved && w.status === "Active") {
        w.currentLat += (Math.random() - 0.5) * 0.0004;
        w.currentLng += (Math.random() - 0.5) * 0.0004;
      }
    });
  }, 4000);
  
  document.getElementById("conLogoutBtn").addEventListener("click", () => {
    cancelAnimationFrame(animId);
    clearInterval(movementInterval);
  });
}


/* ==================== HOMEPAGE VIDEO walkthrough REVIEW ==================== */
function initVideoPlayer() {
  const poster = document.getElementById("videoPoster");
  const iframe = document.getElementById("reviewIframe");
  if (poster && iframe) {
    poster.addEventListener("click", () => {
      poster.style.display = "none";
      iframe.src = "https://www.youtube.com/embed/F4qR9_dI12k?autoplay=1";
    });
  }
}


/* ==================== LEADS & APPLICATION REVIEW DYNAMIC TABLES ==================== */
function populateLeadsTable() {
  const tbody = document.getElementById("conLeadsBody");
  if (!tbody) return;

  if (AppState.leads.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No spreadsheet leads found.</td></tr>`;
    return;
  }

  tbody.innerHTML = AppState.leads.map(l => {
    const statusOptions = ["New Lead", "Contacted", "Follow Up", "Completed Survey", "Lost Lead"].map(st => {
      const isSelected = l.status === st ? 'selected' : '';
      return `<option value="${st}" ${isSelected}>${st}</option>`;
    }).join('');
    
    const statusSelect = `
      <select class="input-control select-control" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:130px; background: rgba(255,255,255,0.02); color: var(--secondary); font-weight: 600;" onchange="updateLeadStatus('${l.id}', this.value)">
        ${statusOptions}
      </select>
    `;

    return `
      <tr>
        <td><strong>${l.id}</strong></td>
        <td>${l.date}</td>
        <td><strong>${l.name}</strong></td>
        <td>${l.phone}</td>
        <td><span class="badge badge-primary">${l.type}</span></td>
        <td>${l.address}</td>
        <td>
          <input type="text" class="input-control" style="padding:0.25rem 0.5rem; font-size:0.8rem; width:120px; background: rgba(255,255,255,0.02); border:1px solid rgba(255,255,255,0.05); color:var(--text-primary); border-radius: 4px;" value="${l.referral || ''}" onchange="updateLeadReferral('${l.id}', this.value)" placeholder="e.g. Google/Friend">
        </td>
        <td>${statusSelect}</td>
      </tr>
    `;
  }).join('');
}

window.updateLeadStatus = function(leadId, newStatus) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;
  lead.status = newStatus;
  AppState.saveAll();
  populateLeadsTable();
};

window.updateLeadReferral = function(leadId, newReferral) {
  const lead = AppState.leads.find(l => l.id === leadId);
  if (!lead) return;
  lead.referral = newReferral;
  AppState.saveAll();
};

// Leads CSV Export function
const exportBtn = document.getElementById("exportLeadsBtn");
if (exportBtn) {
  exportBtn.addEventListener("click", () => {
    if (AppState.leads.length === 0) {
      alert("No leads available to export.");
      return;
    }

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Lead ID,Date,Name,Phone,Request Type,Address,Reference By,Status\r\n";

    AppState.leads.forEach(l => {
      const row = `"${l.id}","${l.date}","${l.name}","${l.phone}","${l.type}","${l.address}","${l.referral || 'Direct (None)'}","${l.status}"`;
      csvContent += row + "\r\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `MGV_Painters_Leads_${getTodayDateStr()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  });
}

function populatePainterAppsTable() {
  const tbody = document.getElementById("conPainterAppsBody");
  if (!tbody) return;

  if (AppState.painterApplications.length === 0) {
    tbody.innerHTML = `<tr><td colspan="8" class="text-center text-muted">No painter partner applications pending review.</td></tr>`;
    return;
  }

  tbody.innerHTML = AppState.painterApplications.map(app => `
    <tr>
      <td>${app.date}</td>
      <td><strong>${app.name}</strong></td>
      <td>${app.phone}</td>
      <td><span class="badge badge-primary">${app.specialty}</span></td>
      <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewPainterDoc('${app.id}', 'front')">Aadhar Front</button></td>
      <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewPainterDoc('${app.id}', 'back')">Aadhar Back</button></td>
      <td><button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewPainterDoc('${app.id}', 'selfie')">Selfie</button></td>
      <td>
        <button class="btn btn-success" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="approvePainterApp('${app.id}')">Approve</button>
        <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="rejectPainterApp('${app.id}')">Reject</button>
      </td>
    </tr>
  `).join('');
}

window.viewPainterDoc = async function(appId, docType) {
  const app = AppState.painterApplications.find(a => a.id === appId);
  if (!app) return;

  try {
    const photos = await getPhotosFromDB('painter_documents', 'phone', app.phone);
    if (photos.length > 0) {
      let data = "";
      let title = "";
      if (docType === "front") {
        data = photos[0].frontData;
        title = `${app.name} Aadhar Front`;
      } else if (docType === "back") {
        data = photos[0].backData;
        title = `${app.name} Aadhar Back`;
      } else {
        data = photos[0].selfieData;
        title = `${app.name} Verification Selfie`;
      }
      viewFullImageModal(data, title);
    } else {
      alert("No uploaded document image found in database.");
    }
  } catch (err) {
    console.error(err);
    alert("Error fetching document data.");
  }
};

window.approvePainterApp = function(appId) {
  const appIndex = AppState.painterApplications.findIndex(a => a.id === appId);
  if (appIndex === -1) return;
  const app = AppState.painterApplications[appIndex];

  // Add to active workers list
  const newWorker = {
    id: `w-${Date.now()}`,
    name: app.name,
    phone: app.phone,
    email: `${app.name.toLowerCase().replace(/\s+/g, '.')}@mgv.com`,
    specialty: app.specialty,
    experience: "Verified Partner",
    status: "Inactive",
    approved: true,
    currentLat: 12.9141,
    currentLng: 77.6412,
    lastCheckIn: "Never"
  };

  AppState.workers.push(newWorker);
  AppState.painterApplications.splice(appIndex, 1);
  AppState.saveAll();

  alert(`Approved painter partner: ${app.name}! They can now log in using phone number ${app.phone}`);
  
  populatePainterAppsTable();
  populateWorkersTable();
  updateContractorKPIs();
};

window.rejectPainterApp = function(appId) {
  const appIndex = AppState.painterApplications.findIndex(a => a.id === appId);
  if (appIndex === -1) return;
  const app = AppState.painterApplications[appIndex];

  if (confirm(`Are you sure you want to reject the application of ${app.name}?`)) {
    AppState.painterApplications.splice(appIndex, 1);
    AppState.saveAll();
    populatePainterAppsTable();
  }
};


/* ==================== SERVICES / BRANDS / PROPERTIES ADMIN ==================== */
function renderAdminServices() {
  const tbody = document.getElementById("conServicesBody");
  if (!tbody) return;

  tbody.innerHTML = AppState.services.map(s => `
    <tr>
      <td><strong>${s.title}</strong></td>
      <td style="max-width:300px; font-size:0.85rem; color:var(--text-secondary);">${s.description}</td>
      <td>₹${s.baseRateLabor}/sqft</td>
      <td>₹${s.baseRateLumpsum}/sqft</td>
      <td><span class="badge badge-success">${s.badge || 'Starts at ₹12/sqft'}</span></td>
      <td>
        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openEditModal('service', '${s.id}')">Edit</button>
        <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deleteEntity('service', '${s.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminBrands() {
  const tbody = document.getElementById("conBrandsBody");
  if (!tbody) return;

  tbody.innerHTML = AppState.paintCatalog.map(p => `
    <tr>
      <td><strong>${p.brand}</strong></td>
      <td>${p.grade}</td>
      <td>₹${p.rate}/sqft</td>
      <td>
        <span class="badge ${p.hidden ? 'badge-danger' : 'badge-success'}">${p.hidden ? 'Hidden' : 'Visible'}</span>
      </td>
      <td>
        <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openEditModal('paint', '${p.id}')">Edit</button>
        <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:${p.hidden ? '#10b981' : '#f97316'}; color:white;" onclick="togglePaintVisibility('${p.id}')">${p.hidden ? 'Show' : 'Hide'}</button>
        <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deleteEntity('paint', '${p.id}')">Delete</button>
      </td>
    </tr>
  `).join('');
}

function renderAdminProperties() {
  const tbody = document.getElementById("conPropertiesBody");
  if (!tbody) return;

  tbody.innerHTML = AppState.propertyTypes.map(p => {
    const pct = Math.round((p.modifier - 1.0) * 100);
    const pctText = pct >= 0 ? `+${pct}%` : `${pct}%`;
    return `
      <tr>
        <td><strong>${p.name}</strong></td>
        <td>${pctText} Adjustment</td>
        <td>${p.label}</td>
        <td>
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openEditModal('property', '${p.id}')">Edit</button>
          <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deleteEntity('property', '${p.id}')">Delete</button>
        </td>
      </tr>
    `;
  }).join('');
}

// Modal Form Controllers
const modal = document.getElementById("adminFormModal");
const modalTitle = document.getElementById("modalTitle");
const modalForm = document.getElementById("modalForm");
const fieldsContainer = document.getElementById("modalFieldsContainer");
const closeModalBtn = document.getElementById("closeModalBtn");

let activeEntityType = "";
let activeEntityId = "";

if (closeModalBtn) {
  closeModalBtn.addEventListener("click", () => {
    modal.style.display = "none";
  });
}

window.openEditModal = function(type, id) {
  activeEntityType = type;
  activeEntityId = id;
  modal.style.display = "flex";
  
  if (type === 'service') {
    const s = AppState.services.find(item => item.id === id);
    modalTitle.innerText = id ? "Edit Service" : "Add New Service";
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Service Title</label>
        <input type="text" class="input-control" id="mServiceTitle" value="${s ? s.title : ''}" required>
      </div>
      <div class="form-group">
        <label>Description</label>
        <textarea class="input-control" id="mServiceDesc" rows="3" required>${s ? s.description : ''}</textarea>
      </div>
      <div class="grid-form">
        <div class="form-group">
          <label>Labor Rate / sqft (₹)</label>
          <input type="number" class="input-control" id="mServiceLabor" value="${s ? s.baseRateLabor : ''}" required>
        </div>
        <div class="form-group">
          <label>Lumpsum Rate / sqft (₹)</label>
          <input type="number" class="input-control" id="mServiceLumpsum" value="${s ? s.baseRateLumpsum : ''}" required>
        </div>
      </div>
      <div class="form-group">
        <label>Badge Display Text</label>
        <input type="text" class="input-control" id="mServiceBadge" value="${s ? s.badge : 'Starts at ₹12/sqft'}">
      </div>
    `;
  }
  else if (type === 'paint') {
    const p = AppState.paintCatalog.find(item => item.id === id);
    modalTitle.innerText = id ? "Edit Paint Brand/Grade" : "Add Paint Brand/Grade";
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Brand Name</label>
        <input type="text" class="input-control" id="mPaintBrand" value="${p ? p.brand : ''}" placeholder="e.g. Asian Paints" required>
      </div>
      <div class="form-group">
        <label>Paint Grade / Product Name</label>
        <input type="text" class="input-control" id="mPaintGrade" value="${p ? p.grade : ''}" placeholder="e.g. Royale Luxury" required>
      </div>
      <div class="form-group">
        <label>Rate per Sqft (₹)</label>
        <input type="number" class="input-control" id="mPaintRate" value="${p ? p.rate : ''}" required>
      </div>
    `;
  }
  else if (type === 'property') {
    const p = AppState.propertyTypes.find(item => item.id === id);
    modalTitle.innerText = id ? "Edit Property Type" : "Add Property Type";
    fieldsContainer.innerHTML = `
      <div class="form-group">
        <label>Building / Property Type Name</label>
        <input type="text" class="input-control" id="mPropName" value="${p ? p.name : ''}" placeholder="e.g. Villa" required>
      </div>
      <div class="form-group">
        <label>Rate Adjustment Percentage (%)</label>
        <input type="number" class="input-control" id="mPropModPercent" value="${p ? Math.round((p.modifier - 1.0) * 100) : '0'}" placeholder="e.g. +20 or -10" required>
      </div>
      <div class="form-group">
        <label>Billing Label / Subtitle</label>
        <input type="text" class="input-control" id="mPropLabel" value="${p ? p.label : ''}" placeholder="e.g. Premium care" required>
      </div>
    `;
  }
};

// Add buttons
const addServiceBtn = document.getElementById("adminAddServiceBtn");
if (addServiceBtn) addServiceBtn.addEventListener("click", () => openEditModal('service', ''));

const addPaintBtn = document.getElementById("adminAddPaintBtn");
if (addPaintBtn) addPaintBtn.addEventListener("click", () => openEditModal('paint', ''));

const addPropBtn = document.getElementById("adminAddPropertyBtn");
if (addPropBtn) addPropBtn.addEventListener("click", () => openEditModal('property', ''));

if (modalForm) {
  modalForm.addEventListener("submit", (e) => {
    e.preventDefault();
    
    if (activeEntityType === 'service') {
      const title = document.getElementById("mServiceTitle").value.trim();
      const description = document.getElementById("mServiceDesc").value.trim();
      const baseRateLabor = parseFloat(document.getElementById("mServiceLabor").value);
      const baseRateLumpsum = parseFloat(document.getElementById("mServiceLumpsum").value);
      const badge = document.getElementById("mServiceBadge").value.trim();

      if (activeEntityId) {
        const s = AppState.services.find(item => item.id === activeEntityId);
        if (s) {
          s.title = title;
          s.description = description;
          s.baseRateLabor = baseRateLabor;
          s.baseRateLumpsum = baseRateLumpsum;
          s.badge = badge;
        }
      } else {
        AppState.services.push({
          id: `s-${Date.now()}`,
          title,
          description,
          baseRateLabor,
          baseRateLumpsum,
          badge
        });
      }
      renderAdminServices();
    }
    else if (activeEntityType === 'paint') {
      const brand = document.getElementById("mPaintBrand").value.trim();
      const grade = document.getElementById("mPaintGrade").value.trim();
      const rate = parseFloat(document.getElementById("mPaintRate").value);

      if (activeEntityId) {
        const p = AppState.paintCatalog.find(item => item.id === activeEntityId);
        if (p) {
          p.brand = brand;
          p.grade = grade;
          p.rate = rate;
        }
      } else {
        AppState.paintCatalog.push({
          id: `p-${Date.now()}`,
          brand,
          grade,
          rate
        });
      }
      renderAdminBrands();
    }
    else if (activeEntityType === 'property') {
      const name = document.getElementById("mPropName").value.trim();
      const percentVal = parseFloat(document.getElementById("mPropModPercent").value) || 0;
      const modifier = 1.0 + (percentVal / 100);
      const label = document.getElementById("mPropLabel").value.trim();

      if (activeEntityId) {
        const p = AppState.propertyTypes.find(item => item.id === activeEntityId);
        if (p) {
          p.name = name;
          p.modifier = modifier;
          p.label = label;
        }
      } else {
        AppState.propertyTypes.push({
          id: `prop-${Date.now()}`,
          name,
          modifier,
          label
        });
      }
      renderAdminProperties();
    }

    AppState.saveAll();
    modal.style.display = "none";
    renderHomepage();
    initAdminCalculator();
    alert("Saved modifications successfully!");
  });
}

window.deleteEntity = function(type, id) {
  if (!confirm("Are you sure you want to delete this catalog option?")) return;

  if (type === 'service') {
    AppState.services = AppState.services.filter(item => item.id !== id);
    renderAdminServices();
  } else if (type === 'paint') {
    AppState.paintCatalog = AppState.paintCatalog.filter(item => item.id !== id);
    renderAdminBrands();
  } else if (type === 'property') {
    AppState.propertyTypes = AppState.propertyTypes.filter(item => item.id !== id);
    renderAdminProperties();
  }

  AppState.saveAll();
  renderHomepage();
  initAdminCalculator();
  alert("Option removed from catalog.");
};


/* ==================== SYSTEM RENDER WRAPPERS FOR DOM ==================== */
function initContractorDashboardData() {
  renderAdminServices();
  renderAdminBrands();
  renderAdminProperties();
  populateEnquiriesTable();
  populateWorkersTable();
  populatePainterAppsTable();
  populateLeadsTable();
  populateLedgerTables();
}

// Modify initial routes trigger to support administrative dashboard rendering
const originalTabSwitcher = document.querySelectorAll(".nav-btn");
originalTabSwitcher.forEach(btn => {
  btn.addEventListener("click", () => {
    const view = btn.getAttribute("data-view");
    if (view === 'contractor-view') {
      initContractorDashboardData();
    }
  });
});


/* ==================== UTILITY ENGINE ==================== */
function getCurrentTimestamp() {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const dy = String(now.getDate()).padStart(2, '0');
  const hr = String(now.getHours()).padStart(2, '0');
  const mi = String(now.getMinutes()).padStart(2, '0');
  return `${yr}-${mo}-${dy} ${hr}:${mi}`;
}

function getTodayDateStr() {
  const now = new Date();
  const yr = now.getFullYear();
  const mo = String(now.getMonth() + 1).padStart(2, '0');
  const dy = String(now.getDate()).padStart(2, '0');
  return `${yr}-${mo}-${dy}`;
}

function drawMockQRCode(canvasId, text) {
  const canvas = document.getElementById(canvasId);
  if (!canvas) return;
  const ctx = canvas.getContext("2d");
  const size = canvas.width || 150;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size, size);
  
  ctx.fillStyle = "#000000";
  const drawAnchor = (x, y) => {
    ctx.fillRect(x, y, 7, 7);
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(x + 1, y + 1, 5, 5);
    ctx.fillStyle = "#000000";
    ctx.fillRect(x + 2, y + 2, 3, 3);
  };
  
  ctx.save();
  const scale = size / 21;
  ctx.scale(scale, scale);
  
  drawAnchor(0, 0);
  drawAnchor(14, 0);
  drawAnchor(0, 14);
  
  ctx.fillRect(14, 14, 1, 1);
  
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  for (let x = 0; x < 21; x++) {
    for (let y = 0; y < 21; y++) {
      if ((x < 8 && y < 8) || (x > 13 && y < 8) || (x < 8 && y > 13)) {
        continue;
      }
      const val = Math.abs((hash ^ (x * y + x * 31 + y * 17)) % 100);
      if (val < 45) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  ctx.restore();
}

window.viewUploadedInvoice = async function(fileId) {
  try {
    const docs = await getPhotosFromDB('painter_documents');
    const doc = docs.find(d => d.id === parseInt(fileId));
    if (!doc || !doc.fileData) {
      alert("No invoice document uploaded or found.");
      return;
    }
    
    let modal = document.getElementById("invoiceViewModal");
    if (!modal) {
      modal = document.createElement("div");
      modal.id = "invoiceViewModal";
      modal.style = "display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 15000; justify-content: center; align-items: center; flex-direction: column; padding: 2rem;";
      modal.innerHTML = `
        <div style="background: #0d121d; padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); max-width: 600px; width: 100%; text-align: center;">
          <h3 class="mb-3" style="color: white;">Uploaded Invoice Document</h3>
          <div id="invoiceImageWrapper" style="max-height: 400px; overflow: auto; background: #000; padding: 0.5rem; border-radius: 4px; border: 1px solid rgba(255,255,255,0.05);">
            <!-- Image goes here -->
          </div>
          <button class="btn btn-secondary mt-4" onclick="document.getElementById('invoiceViewModal').style.display = 'none'">Close</button>
        </div>
      `;
      document.body.appendChild(modal);
    }
    
    const wrapper = document.getElementById("invoiceImageWrapper");
    if (doc.fileData.startsWith("data:application/pdf")) {
      wrapper.innerHTML = `<embed src="${doc.fileData}" type="application/pdf" width="100%" height="380px" />`;
    } else {
      wrapper.innerHTML = `<img src="${doc.fileData}" style="max-width: 100%; max-height: 380px; object-fit: contain;" />`;
    }
    modal.style.display = "flex";
  } catch (err) {
    console.error(err);
    alert("Error loading invoice document: " + err.message);
  }
};

window.openProjectWorkModal = function(enquiryId) {
  const enquiry = AppState.enquiries.find(e => e.id === enquiryId);
  if (!enquiry) return;
  
  document.getElementById("pwModalEnquiryId").value = enquiry.id;
  document.getElementById("pwModalProjId").innerText = enquiry.id;
  document.getElementById("pwEstHours").value = enquiry.estHours || "";
  document.getElementById("pwAddHours").value = "";
  document.getElementById("pwTotalLoggedLabel").innerText = `${enquiry.totalHoursWorked || 0} hrs`;
  document.getElementById("pwStatusNotes").value = enquiry.statusNotes || "";
  document.getElementById("pwFaultLogs").value = enquiry.faultLogs || "";
  
  document.getElementById("projectWorkModal").style.display = "flex";
};

window.closeProjectWorkModal = function() {
  document.getElementById("projectWorkModal").style.display = "none";
};

// Bind the project work form submit listener
document.addEventListener("DOMContentLoaded", () => {
  const projectWorkForm = document.getElementById("projectWorkForm");
  if (projectWorkForm) {
    projectWorkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("pwModalEnquiryId").value;
      const enquiry = AppState.enquiries.find(item => item.id === id);
      if (!enquiry) return;
      
      const estHours = parseFloat(document.getElementById("pwEstHours").value) || 0;
      const addHours = parseFloat(document.getElementById("pwAddHours").value) || 0;
      const statusNotes = document.getElementById("pwStatusNotes").value.trim();
      const faultLogs = document.getElementById("pwFaultLogs").value.trim();
      
      enquiry.estHours = estHours;
      enquiry.totalHoursWorked = (enquiry.totalHoursWorked || 0) + addHours;
      enquiry.statusNotes = statusNotes;
      enquiry.faultLogs = faultLogs;
      
      if (addHours > 0) {
        enquiry.hourlyLogs = enquiry.hourlyLogs || [];
        enquiry.hourlyLogs.unshift({
          date: getTodayDateStr(),
          hours: addHours,
          timestamp: getCurrentTimestamp()
        });
      }
      
      AppState.saveAll();
      closeProjectWorkModal();
      populateEnquiriesTable();
      alert("Project hours and logs updated successfully.");
    });
  }

  const workerProfileForm = document.getElementById("workerProfileForm");
  if (workerProfileForm) {
    workerProfileForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const workerId = document.getElementById("wpWorkerId").value;
      const name = document.getElementById("wpName").value.trim();
      const phone = document.getElementById("wpPhone").value.trim();
      const address = document.getElementById("wpAddress").value.trim();
      const emergency = document.getElementById("wpEmergencyPhone").value.trim();
      const pan = document.getElementById("wpPan").value.trim();
      const aadhar = document.getElementById("wpAadhar").value.trim();
      const rental = document.getElementById("wpRental").value.trim();
      const acct = document.getElementById("wpBankAcct").value.trim();
      const ifsc = document.getElementById("wpBankIfsc").value.trim();
      
      const fileInput = document.getElementById("wpPhotoUpload");
      let photo = document.getElementById("wpPhotoPreview").src;
      if (fileInput && fileInput.files.length > 0) {
        photo = await readFileAsBase64(fileInput.files[0]);
      }
      
      let w = AppState.workers.find(item => item.id === workerId);
      if (!w) {
        const newId = `w-${Date.now()}`;
        w = {
          id: newId,
          name,
          phone,
          specialty: "interior",
          experience: "1 year",
          status: "Active",
          approved: true
        };
        AppState.workers.push(w);
      } else {
        w.name = name;
        w.phone = phone;
      }
      
      let conf = AppState.confidentialProfiles.find(c => c.workerId === w.id);
      if (!conf) {
        conf = { workerId: w.id };
        AppState.confidentialProfiles.push(conf);
      }
      conf.address = address;
      conf.pan = pan;
      conf.aadhar = aadhar;
      conf.rentalAgreement = rental;
      conf.bankAccount = `Acct: ${acct}, IFSC: ${ifsc}`;
      conf.emergencyContact = `${emergency} (Emergency)`;
      conf.photo = photo;
      
      AppState.saveAll();
      closeConfidentialWorkerModal();
      populateWorkersTable();
      populateWorkersConfidentialTable();
      alert("Worker confidential profile saved successfully.");
    });
  }

  // Pre-load worker photo file inputs preview
  const wpPhotoUpload = document.getElementById("wpPhotoUpload");
  if (wpPhotoUpload) {
    wpPhotoUpload.addEventListener("change", async (e) => {
      if (e.target.files.length > 0) {
        const base64 = await readFileAsBase64(e.target.files[0]);
        document.getElementById("wpPhotoPreview").src = base64;
      }
    });
  }
});

window.populateWorkersConfidentialTable = function() {
  const tbody = document.getElementById("conWorkersConfidentialBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (AppState.workers.length === 0) {
    tbody.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No worker profiles registered.</td></tr>`;
    return;
  }
  
  AppState.workers.forEach(w => {
    const conf = AppState.confidentialProfiles.find(c => c.workerId === w.id) || {
      pan: "Pending Log",
      aadhar: "Pending Log",
      rentalAgreement: "Pending Log",
      bankAccount: "Pending Log",
      emergencyContact: "Pending Log",
      photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
    };
    
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td class="text-center">
          <img src="${conf.photo}" style="width:40px; height:40px; border-radius:50%; object-fit:cover; border:1px solid rgba(255,255,255,0.1); cursor:pointer;" onclick="viewFullImageModal('${conf.photo}', '${w.name} Photo')">
        </td>
        <td>
          <strong>${w.name}</strong><br>
          <span style="font-size:0.75rem; color:var(--text-muted);">${w.phone}</span>
        </td>
        <td>
          <span style="font-size:0.78rem; font-weight:600; color:var(--secondary);">PAN:</span> ${conf.pan}<br>
          <span style="font-size:0.78rem; font-weight:600; color:var(--secondary);">Aadhar:</span> ${conf.aadhar}
        </td>
        <td style="max-width:140px; font-size:0.78rem;">${conf.rentalAgreement}</td>
        <td style="font-size:0.78rem;">${conf.bankAccount}</td>
        <td style="font-size:0.78rem;">${conf.emergencyContact}</td>
        <td>
          <div style="display:flex; gap:0.4rem; flex-wrap:wrap; max-width:180px;">
            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openConfidentialWorkerModal('${w.id}')">Edit</button>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--accent);" onclick="viewWorkerSpreadsheet('${w.id}')"><i data-lucide="table"></i> View Sheet</button>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--accent-glow);" onclick="resetUserPassword('${w.id}', 'Worker')">Reset Pass</button>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deleteWorkerConfidential('${w.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `);
  });
};

window.openConfidentialWorkerModal = function(workerId) {
  const w = AppState.workers.find(item => item.id === workerId);
  const conf = AppState.confidentialProfiles.find(c => c.workerId === workerId) || {
    pan: "",
    aadhar: "",
    rentalAgreement: "",
    bankAccount: "",
    emergencyContact: "",
    photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=150"
  };
  
  document.getElementById("wpWorkerId").value = workerId;
  document.getElementById("wpName").value = w ? w.name : "";
  document.getElementById("wpPhone").value = w ? w.phone : "";
  document.getElementById("wpAddress").value = conf.address || "";
  document.getElementById("wpEmergencyPhone").value = conf.emergencyContact ? conf.emergencyContact.split(' ')[0] : "";
  document.getElementById("wpPan").value = conf.pan;
  document.getElementById("wpAadhar").value = conf.aadhar;
  document.getElementById("wpRental").value = conf.rentalAgreement;
  
  let acct = "", ifsc = "";
  if (conf.bankAccount && conf.bankAccount.includes("Acct:")) {
    const parts = conf.bankAccount.split(', IFSC:');
    acct = parts[0].replace("Acct:", "").trim();
    ifsc = parts[1] ? parts[1].trim() : "";
  }
  
  document.getElementById("wpBankAcct").value = acct;
  document.getElementById("wpBankIfsc").value = ifsc;
  document.getElementById("wpPhotoPreview").src = conf.photo;
  
  document.getElementById("workerProfileModal").style.display = "flex";
};

window.closeConfidentialWorkerModal = function() {
  document.getElementById("workerProfileModal").style.display = "none";
};

window.deleteWorkerConfidential = function(workerId) {
  if (confirm("Are you sure you want to delete this worker's confidential profile?")) {
    AppState.workers = AppState.workers.filter(w => w.id !== workerId);
    AppState.confidentialProfiles = AppState.confidentialProfiles.filter(c => c.workerId !== workerId);
    AppState.saveAll();
    populateWorkersTable();
    populateWorkersConfidentialTable();
    alert("Worker profile deleted successfully.");
  }
};

window.populateAttendanceWorkerLookupDropdown = function() {
  const select = document.getElementById("lookupAttendanceWorker");
  if (!select) return;
  select.innerHTML = AppState.workers.map(w => `<option value="${w.id}">${w.name}</option>`).join('');
};

window.queryWorkersAttendanceHistory = async function() {
  const workerId = document.getElementById("lookupAttendanceWorker").value;
  const startDateStr = document.getElementById("lookupAttendanceStartDate").value;
  const endDateStr = document.getElementById("lookupAttendanceEndDate").value;
  const resultsContainer = document.getElementById("attendanceHistoryResults");
  if (!resultsContainer) return;
  
  const worker = AppState.workers.find(w => w.id === workerId);
  const baseLifetime = worker ? (worker.lifetimeHours || 0) : 0;
  
  resultsContainer.innerHTML = `<p class="text-center text-secondary" style="grid-column: 1 / -1;">Querying database...</p>`;
  
  try {
    const photos = await getPhotosFromDB('attendance_photos', 'workerId', workerId);
    let filtered = photos;
    
    if (startDateStr) {
      filtered = filtered.filter(p => p.timestamp >= startDateStr + " 00:00");
    }
    if (endDateStr) {
      filtered = filtered.filter(p => p.timestamp <= endDateStr + " 23:59");
    }
    
    // Summarise hours in the selected logs
    let selectedRangeHours = 0;
    if (worker && worker.attendance) {
      worker.attendance.forEach(att => {
        if ((!startDateStr || att.date >= startDateStr) && (!endDateStr || att.date <= endDateStr)) {
          selectedRangeHours += (att.hours || 0);
        }
      });
    }
    
    let hoursSummaryHtml = `
      <div class="card grid-form-full mb-3" style="background: rgba(99, 102, 241, 0.05); border: 1px solid var(--primary-glow); padding: 1rem; grid-column: 1 / -1; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 1rem;">
        <div>
          <h5 style="color: white; margin: 0; font-family: var(--font-display);">Hours Tracking for ${worker ? worker.name : 'Worker'}</h5>
          <p class="text-secondary" style="font-size: 0.75rem; margin: 0.25rem 0 0 0;">Range: ${startDateStr || 'Beginning'} to ${endDateStr || 'Present'}</p>
        </div>
        <div style="display: flex; gap: 2rem;">
          <div style="text-align: center;">
            <div style="font-size: 1.25rem; font-weight: bold; color: var(--secondary);">${selectedRangeHours} hrs</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Range Total Hours</div>
          </div>
          <div style="text-align: center; border-left: 1px solid rgba(255,255,255,0.1); padding-left: 2rem;">
            <div style="font-size: 1.25rem; font-weight: bold; color: var(--primary-glow);">${baseLifetime} hrs</div>
            <div style="font-size: 0.7rem; color: var(--text-muted); text-transform: uppercase;">Lifetime Total Hours</div>
          </div>
        </div>
      </div>
    `;

    if (filtered.length === 0) {
      resultsContainer.innerHTML = hoursSummaryHtml + `<p class="text-center text-muted" style="grid-column: 1 / -1; padding: 2rem;">No attendance selfies recorded for the selected range.</p>`;
      return;
    }
    
    const photosHtml = filtered.map(p => `
      <div class="card" style="background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.05); padding: 1rem; text-align: center; display: flex; flex-direction: column; gap: 0.5rem; align-items: center;">
        <img src="${p.photoData}" style="width: 100px; height: 100px; border-radius: 8px; object-fit: cover; border: 2px solid var(--secondary); cursor: zoom-in;" onclick="viewFullImageModal('${p.photoData}', 'Attendance Selfie ${p.timestamp}')">
        <div>
          <span style="font-size:0.8rem; font-weight: 600; color: white;">Date: ${p.timestamp.split(' ')[0]}</span><br>
          <span style="font-size:0.75rem; color: var(--text-muted);">Time: ${p.timestamp.split(' ')[1]}</span>
        </div>
      </div>
    `).join('');

    resultsContainer.innerHTML = hoursSummaryHtml + photosHtml;
  } catch (err) {
    console.error("Failed querying attendance:", err);
    resultsContainer.innerHTML = `<p class="text-center text-danger" style="grid-column: 1 / -1;">Error loading data: ${err.message}</p>`;
  }
};

window.populatePermissionsTable = function() {
  const tbody = document.getElementById("conPermissionsBody");
  if (!tbody) return;
  
  tbody.innerHTML = AppState.permissionMatrix.map((p, idx) => `
    <tr>
      <td><strong>${p.module}</strong></td>
      <td><span class="badge ${p.role === 'Customer' ? 'badge-primary' : 'badge-success'}">${p.role}</span></td>
      <td class="text-center"><input type="checkbox" id="perm_read_${idx}" ${p.read ? 'checked' : ''}></td>
      <td class="text-center"><input type="checkbox" id="perm_write_${idx}" ${p.write ? 'checked' : ''}></td>
      <td class="text-center"><input type="checkbox" id="perm_edit_${idx}" ${p.edit ? 'checked' : ''}></td>
      <td class="text-center"><input type="checkbox" id="perm_delete_${idx}" ${p.delete ? 'checked' : ''}></td>
    </tr>
  `).join('');
};

window.savePermissionsMatrix = function() {
  AppState.permissionMatrix.forEach((p, idx) => {
    p.read = document.getElementById(`perm_read_${idx}`).checked;
    p.write = document.getElementById(`perm_write_${idx}`).checked;
    p.edit = document.getElementById(`perm_edit_${idx}`).checked;
    p.delete = document.getElementById(`perm_delete_${idx}`).checked;
  });
  
  AppState.saveAll();
  alert("Access permission matrix settings saved successfully.");
  enforceRolePermissions();
};

window.enforceRolePermissions = function() {
  const role = currentCustomer ? "Customer" : (currentWorker ? "Painter/Worker" : "Admin");
  
  if (role === "Admin") {
    // Admin has full access, show all elements, tabs and actions
    document.querySelectorAll("[data-perm-module]").forEach(el => {
      el.style.display = "";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      if (el.tagName === "INPUT" || el.tagName === "BUTTON" || el.tagName === "SELECT") {
        el.disabled = false;
      }
    });
    // Show all contractor tabs
    document.querySelectorAll("#contractorDashboard .portal-tab").forEach(tab => {
      tab.style.display = "block";
    });
    return;
  }
  
  // For non-Admin, evaluate elements dynamically based on data-perm-module and data-perm-action
  document.querySelectorAll("[data-perm-module]").forEach(el => {
    const modName = el.getAttribute("data-perm-module");
    const action = el.getAttribute("data-perm-action") || "read"; // "read" or "write"
    
    // Find permission in matrix
    const perm = AppState.permissionMatrix.find(p => p.module === modName && p.role === role);
    
    // If no permission object found, default to false for write/edit/delete, and true for read (except Finance/Leads)
    let isAllowed = true;
    if (perm) {
      if (action === "read") {
        isAllowed = perm.read;
      } else if (action === "write" || action === "edit" || action === "delete") {
        isAllowed = perm.write || perm.edit || perm.delete;
      }
    } else {
      if (modName === "Finance Ledgers" || modName === "Leads Spreadsheet" || modName === "Worker Directory") {
        isAllowed = false;
      }
    }
    
    // Enforce
    if (isAllowed) {
      // Show/enable
      el.style.display = "";
      el.style.pointerEvents = "auto";
      el.style.opacity = "1";
      if (el.tagName === "INPUT" || el.tagName === "BUTTON" || el.tagName === "SELECT") {
        el.disabled = false;
      }
    } else {
      // Hide or disable depending on action or element type
      if (action === "read") {
        el.style.display = "none";
      } else {
        el.style.pointerEvents = "none";
        el.style.opacity = "0.4";
        if (el.tagName === "INPUT" || el.tagName === "BUTTON" || el.tagName === "SELECT") {
          el.disabled = true;
        }
      }
    }
  });

  // Explicit backward compatibility for dashboard specific tabs:
  if (role === "Customer") {
    const catalogPerm = AppState.permissionMatrix.find(p => p.module === "Paint Catalog" && p.role === "Customer") || { read: true };
    const gpsPerm = AppState.permissionMatrix.find(p => p.module === "GPS Live Tracker" && p.role === "Customer") || { read: true };
    const financePerm = AppState.permissionMatrix.find(p => p.module === "Finance Ledgers" && p.role === "Customer") || { read: false };
    
    const custCatalogTab = document.querySelector('#customerDashboard .portal-tab[data-pane="cust-catalog"]');
    if (custCatalogTab) custCatalogTab.style.display = catalogPerm.read ? "block" : "none";
    
    const custGpsTab = document.querySelector('#customerDashboard .portal-tab[data-pane="cust-gps"]');
    if (custGpsTab) custGpsTab.style.display = gpsPerm.read ? "block" : "none";
    
    const custPaymentsTab = document.querySelector('#customerDashboard .portal-tab[data-pane="cust-payments"]');
    if (custPaymentsTab) custPaymentsTab.style.display = financePerm.read ? "block" : "none";
  }
  
  if (role === "Painter/Worker") {
    const gpsPerm = AppState.permissionMatrix.find(p => p.module === "GPS Live Tracker" && p.role === "Painter/Worker") || { read: true };
    const financePerm = AppState.permissionMatrix.find(p => p.module === "Finance Ledgers" && p.role === "Painter/Worker") || { read: false };
    
    const workerGpsTab = document.querySelector('#workerDashboard .portal-tab[data-pane="worker-gps"]');
    if (workerGpsTab) workerGpsTab.style.display = gpsPerm.read ? "block" : "none";
    
    const workerPaymentsTab = document.querySelector('#workerDashboard .portal-tab[data-pane="worker-payouts"]');
    if (workerPaymentsTab) workerPaymentsTab.style.display = financePerm.read ? "block" : "none";
  }
};

// Contractor portal tab click delegation for permissions
document.addEventListener("click", (e) => {
  const tab = e.target.closest("#contractorDashboard .portal-tab");
  if (tab) {
    const pane = tab.getAttribute("data-pane");
    if (pane === "con-permissions") {
      populatePermissionsTable();
    } else if (pane === "con-portfolio") {
      populatePortfolioMediaTable();
      populatePortfolioReviewsTable();
    }
  }
});

// Bind DOMContentLoaded events for portfolio & reviews forms
document.addEventListener("DOMContentLoaded", () => {
  const pmForm = document.getElementById("portfolioMediaForm");
  if (pmForm) {
    pmForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const id = document.getElementById("pmId").value;
      const title = document.getElementById("pmTitle").value.trim();
      const videoUrl = document.getElementById("pmVideoUrl").value.trim();
      
      const beforeInput = document.getElementById("pmBeforeUpload");
      const afterInput = document.getElementById("pmAfterUpload");
      
      let beforeImg = document.getElementById("pmBeforePreview").src;
      let afterImg = document.getElementById("pmAfterPreview").src;
      
      if (beforeInput.files.length > 0) {
        beforeImg = await readFileAsBase64(beforeInput.files[0]);
      }
      if (afterInput.files.length > 0) {
        afterImg = await readFileAsBase64(afterInput.files[0]);
      }
      
      let item = AppState.portfolio.find(p => p.id === id);
      if (!item) {
        item = { id: `pm-${Date.now()}` };
        AppState.portfolio.push(item);
      }
      item.title = title;
      item.beforeImg = beforeImg;
      item.afterImg = afterImg;
      item.videoUrl = videoUrl;
      
      AppState.saveAll();
      closePortfolioMediaModal();
      populatePortfolioMediaTable();
      renderHomepage();
      alert("Transformation site showcase saved successfully.");
    });
  }

  const prForm = document.getElementById("portfolioReviewForm");
  if (prForm) {
    prForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const id = document.getElementById("prId").value;
      const clientName = document.getElementById("prClientName").value.trim();
      const location = document.getElementById("prLocation").value.trim();
      const rating = parseInt(document.getElementById("prRating").value) || 5;
      const service = document.getElementById("prService").value.trim();
      const comment = document.getElementById("prComment").value.trim();
      
      let item = AppState.reviews.find(r => r.id === id);
      if (!item) {
        item = { id: `rev-${Date.now()}` };
        AppState.reviews.push(item);
      }
      item.clientName = clientName;
      item.location = location;
      item.rating = rating;
      item.service = service;
      item.comment = comment;
      
      AppState.saveAll();
      closePortfolioReviewModal();
      populatePortfolioReviewsTable();
      renderHomepage();
      alert("Customer review testimonial saved successfully.");
    });
  }

  const pmBeforeUpload = document.getElementById("pmBeforeUpload");
  if (pmBeforeUpload) {
    pmBeforeUpload.addEventListener("change", async (e) => {
      if (e.target.files.length > 0) {
        const base64 = await readFileAsBase64(e.target.files[0]);
        document.getElementById("pmBeforePreview").src = base64;
      }
    });
  }
  const pmAfterUpload = document.getElementById("pmAfterUpload");
  if (pmAfterUpload) {
    pmAfterUpload.addEventListener("change", async (e) => {
      if (e.target.files.length > 0) {
        const base64 = await readFileAsBase64(e.target.files[0]);
        document.getElementById("pmAfterPreview").src = base64;
      }
    });
  }

  const suForm = document.getElementById("unifiedSignupForm");
  if (suForm) {
    const suName = document.getElementById("suName");
    const suDOB = document.getElementById("suDOB");
    const suEmailDomain = document.getElementById("suEmailDomain");
    const suGeneratedVal = document.getElementById("suGeneratedUsername");

    function updateGeneratedUsernamePreview() {
      if (!suGeneratedVal) return;
      const name = suName ? suName.value.trim() : "";
      const dob = suDOB ? suDOB.value : "";
      const domain = suEmailDomain ? suEmailDomain.value.trim() : "";
      
      if (name && dob && domain) {
        const dobStr = dob.replace(/-/g, "");
        suGeneratedVal.value = `${name.toLowerCase().replace(/\s+/g, "")}_${dobStr}_${domain.toLowerCase()}`;
      } else {
        suGeneratedVal.value = "";
      }
    }

    if (suName) suName.addEventListener("input", updateGeneratedUsernamePreview);
    if (suDOB) suDOB.addEventListener("change", updateGeneratedUsernamePreview);
    if (suEmailDomain) suEmailDomain.addEventListener("input", updateGeneratedUsernamePreview);

    suForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("suName").value.trim();
      const dob = document.getElementById("suDOB").value;
      const domain = document.getElementById("suEmailDomain").value.trim();
      const phone = document.getElementById("suPhone").value.trim();
      const password = document.getElementById("suPassword").value;
      
      if (!name || !dob || !domain || !phone || !password) {
        alert("Please fill in all required fields.");
        return;
      }
      
      // Generate name_dob_domain email/username
      const dobStr = dob.replace(/-/g, "");
      const generatedEmail = `${name.toLowerCase().replace(/\s+/g, "")}_${dobStr}_${domain.toLowerCase()}`;
      
      // Check if phone or email already registered
      const existing = AppState.enquiries.find(item => item.phone === phone || item.email === generatedEmail);
      if (existing) {
        alert("An account with this phone number or generated username already exists.");
        return;
      }
      
      // Create new customer account as a pending survey enquiry
      const newCustomer = {
        id: `MGV-${Math.floor(1000 + Math.random() * 9000)}`,
        name: name,
        phone: phone,
        email: generatedEmail,
        password: password,
        address: "Pending Site Survey Details",
        serviceType: "s-1",
        paintBrand: "Asian Paints",
        paintType: "Tractor Emulsion (Standard)",
        areaSqft: 1000,
        pricingModel: "lumpsum",
        estimateAmount: 30000,
        status: "Pending Survey",
        createdAt: getCurrentTimestamp(),
        timeline: [
          { date: getCurrentTimestamp().split(' ')[0], text: "Account created. Awaiting site survey schedule." }
        ],
        payments: [],
        photos: []
      };
      
      AppState.enquiries.push(newCustomer);
      AppState.saveAll();
      
      alert(`Registration Successful!\n\nYour generated login email is:\n${generatedEmail}\n\nYou can sign in using this ID or your phone number with your password.`);
      suForm.reset();
      toggleUnifiedSignup(false);
      
      // Pre-fill login input with generated email
      document.getElementById("loginUserPhone").value = generatedEmail;
      // Trigger input event to update password field visibility
      document.getElementById("loginUserPhone").dispatchEvent(new Event('input'));
    });
  }
});

window.viewBeforeAfterSwipeModal = function(before, after, title, videoUrl) {
  let modal = document.getElementById("swipeViewModal");
  if (!modal) {
    modal = document.createElement("div");
    modal.id = "swipeViewModal";
    modal.style = "display: none; position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); z-index: 15000; justify-content: center; align-items: center; flex-direction: column; padding: 2rem;";
    modal.innerHTML = `
      <div style="background: #0d121d; padding: 1.5rem; border-radius: 8px; border: 1px solid rgba(255,255,255,0.08); max-width: 600px; width: 100%; text-align: center;">
        <h3 class="mb-3" style="color: white;" id="swipeModalTitle">Transformation</h3>
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; margin-bottom: 1rem;">
          <div>
            <p style="font-size: 0.8rem; color: var(--text-muted); margin-bottom: 0.5rem;">BEFORE</p>
            <img id="swipeBeforeImg" src="" style="width: 100%; height: 250px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" />
          </div>
          <div>
            <p style="font-size: 0.8rem; color: var(--secondary); margin-bottom: 0.5rem;">AFTER</p>
            <img id="swipeAfterImg" src="" style="width: 100%; height: 250px; object-fit: cover; border-radius: 6px; border: 1px solid rgba(255,255,255,0.1);" />
          </div>
        </div>
        <div id="swipeVideoContainer" style="margin-bottom: 1rem; display: none; background: #000; padding: 0.5rem; border-radius: 6px; border: 1px solid rgba(255,255,255,0.05);">
          <p style="font-size: 0.8rem; color: var(--accent); margin-bottom: 0.5rem; font-weight: bold;">PROJECT VIDEO WALKTHROUGH</p>
          <iframe id="swipeVideoIframe" src="" style="width: 100%; height: 220px; border: none; border-radius: 4px;"></iframe>
        </div>
        <button class="btn btn-secondary mt-2" onclick="closeSwipeViewModal()">Close</button>
      </div>
    `;
    document.body.appendChild(modal);
  }
  document.getElementById("swipeModalTitle").innerText = title;
  document.getElementById("swipeBeforeImg").src = before;
  document.getElementById("swipeAfterImg").src = after;
  
  const videoContainer = document.getElementById("swipeVideoContainer");
  const videoIframe = document.getElementById("swipeVideoIframe");
  if (videoUrl) {
    let embedUrl = videoUrl;
    if (videoUrl.includes("youtube.com/watch?v=")) {
      const vid = videoUrl.split("v=")[1]?.split("&")[0];
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
    } else if (videoUrl.includes("youtu.be/")) {
      const vid = videoUrl.split("youtu.be/")[1]?.split("?")[0];
      if (vid) embedUrl = `https://www.youtube.com/embed/${vid}`;
    }
    videoIframe.src = embedUrl;
    videoContainer.style.display = "block";
  } else {
    videoIframe.src = "";
    videoContainer.style.display = "none";
  }
  
  modal.style.display = "flex";
};

window.closeSwipeViewModal = function() {
  const modal = document.getElementById("swipeViewModal");
  if (modal) modal.style.display = "none";
  const iframe = document.getElementById("swipeVideoIframe");
  if (iframe) iframe.src = "";
};

window.populatePortfolioMediaTable = function() {
  const tbody = document.getElementById("conPortfolioMediaBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (AppState.portfolio.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No portfolio transformations.</td></tr>`;
    return;
  }
  
  AppState.portfolio.forEach(p => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong>${p.title}</strong></td>
        <td><img src="${p.beforeImg}" style="width:50px; height:40px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.15);" onclick="viewFullImageModal('${p.beforeImg}', '${p.title} Before')"></td>
        <td><img src="${p.afterImg}" style="width:50px; height:40px; object-fit:cover; border-radius:4px; border:1px solid rgba(255,255,255,0.15);" onclick="viewFullImageModal('${p.afterImg}', '${p.title} After')"></td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openPortfolioMediaModal('${p.id}')">Edit</button>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deletePortfolioMedia('${p.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `);
  });
};

window.populatePortfolioReviewsTable = function() {
  const tbody = document.getElementById("conPortfolioReviewsBody");
  if (!tbody) return;
  tbody.innerHTML = "";
  
  if (AppState.reviews.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted">No client reviews registered.</td></tr>`;
    return;
  }
  
  AppState.reviews.forEach(r => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong>${r.clientName}</strong></td>
        <td>${r.location} | <span style="font-size:0.75rem; color:var(--text-muted);">${r.service}</span></td>
        <td><strong>${r.rating} Stars</strong></td>
        <td style="max-width:200px; font-size:0.8rem; white-space:normal; overflow:visible;">${r.comment}</td>
        <td>
          <div style="display:flex; gap:0.4rem;">
            <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="openPortfolioReviewModal('${r.id}')">Edit</button>
            <button class="btn btn-primary" style="padding:0.25rem 0.5rem; font-size:0.75rem; background:var(--danger);" onclick="deletePortfolioReview('${r.id}')">Delete</button>
          </div>
        </td>
      </tr>
    `);
  });
};

window.openPortfolioMediaModal = function(id) {
  const item = AppState.portfolio.find(p => p.id === id) || {
    id: "",
    title: "",
    videoUrl: "",
    beforeImg: "https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=150&q=80",
    afterImg: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=150&q=80"
  };
  
  document.getElementById("pmId").value = item.id;
  document.getElementById("pmTitle").value = item.title;
  document.getElementById("pmVideoUrl").value = item.videoUrl || "";
  document.getElementById("pmBeforePreview").src = item.beforeImg;
  document.getElementById("pmAfterPreview").src = item.afterImg;
  
  document.getElementById("pmBeforeUpload").value = "";
  document.getElementById("pmAfterUpload").value = "";
  
  document.getElementById("portfolioMediaModal").style.display = "flex";
};

window.closePortfolioMediaModal = function() {
  document.getElementById("portfolioMediaModal").style.display = "none";
};

window.openPortfolioReviewModal = function(id) {
  const item = AppState.reviews.find(r => r.id === id) || {
    id: "",
    clientName: "",
    location: "",
    rating: 5,
    service: "",
    comment: ""
  };
  
  document.getElementById("prId").value = item.id;
  document.getElementById("prClientName").value = item.clientName;
  document.getElementById("prLocation").value = item.location;
  document.getElementById("prRating").value = item.rating;
  document.getElementById("prService").value = item.service;
  document.getElementById("prComment").value = item.comment;
  
  document.getElementById("portfolioReviewModal").style.display = "flex";
};

window.closePortfolioReviewModal = function() {
  document.getElementById("portfolioReviewModal").style.display = "none";
};

window.deletePortfolioMedia = function(id) {
  if (confirm("Are you sure you want to delete this transformation site showcase?")) {
    AppState.portfolio = AppState.portfolio.filter(p => p.id !== id);
    AppState.saveAll();
    populatePortfolioMediaTable();
    renderHomepage();
    alert("Transformation showcase deleted.");
  }
};

window.deletePortfolioReview = function(id) {
  if (confirm("Are you sure you want to delete this customer review testimonial?")) {
    AppState.reviews = AppState.reviews.filter(r => r.id !== id);
    AppState.saveAll();
    populatePortfolioReviewsTable();
    renderHomepage();
    alert("Review testimonial deleted.");
  }
};

window.toggleUnifiedSignup = function(show) {
  const loginCard = document.querySelector("#login-view .card:not(#unifiedSignupCard)");
  const signupCard = document.getElementById("unifiedSignupCard");
  if (show) {
    if (loginCard) loginCard.style.display = "none";
    if (signupCard) signupCard.style.display = "block";
  } else {
    if (loginCard) loginCard.style.display = "block";
    if (signupCard) signupCard.style.display = "none";
  }
};

window.resetUserPassword = function(id, role) {
  const newPass = prompt(`Enter new password for this ${role}:`);
  if (newPass === null) return;
  const pass = newPass.trim();
  if (!pass) {
    alert("Password cannot be empty.");
    return;
  }
  if (role === 'Customer') {
    const user = AppState.enquiries.find(e => e.id === id);
    if (user) {
      user.password = pass;
      alert(`Password for Customer ${user.name} reset to: ${pass}`);
    }
  } else {
    const user = AppState.workers.find(w => w.id === id);
    if (user) {
      user.password = pass;
      alert(`Password for Worker ${user.name} reset to: ${pass}`);
    }
  }
  AppState.saveAll();
  populateCredentialsTable();
};

window.populateCredentialsTable = function() {
  const tbody = document.getElementById("conCredentialsBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  // 1. Add Customers
  AppState.enquiries.forEach(cust => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><span class="badge badge-primary">Customer</span></td>
        <td><strong>${cust.id}</strong></td>
        <td>${cust.name}</td>
        <td>${cust.phone}</td>
        <td><input type="text" class="input-control" value="${cust.email || ''}" style="padding:0.2rem 0.5rem; font-size:0.8rem; width:180px;" onchange="updateAccountUsername('${cust.id}', 'Customer', this.value)"></td>
        <td><input type="text" class="input-control" value="${cust.password || 'password123'}" style="padding:0.2rem 0.5rem; font-size:0.8rem; width:130px;" onchange="updateAccountPassword('${cust.id}', 'Customer', this.value)"></td>
        <td>
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="resetUserPassword('${cust.id}', 'Customer')">Reset Dialog</button>
        </td>
      </tr>
    `);
  });

  // 2. Add Workers
  AppState.workers.forEach(w => {
    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><span class="badge badge-success">Painter/Worker</span></td>
        <td><strong>${w.id}</strong></td>
        <td>${w.name}</td>
        <td>${w.phone}</td>
        <td><input type="text" class="input-control" value="${w.email || w.phone}" style="padding:0.2rem 0.5rem; font-size:0.8rem; width:180px;" onchange="updateAccountUsername('${w.id}', 'Worker', this.value)"></td>
        <td><input type="text" class="input-control" value="${w.password || 'password123'}" style="padding:0.2rem 0.5rem; font-size:0.8rem; width:130px;" onchange="updateAccountPassword('${w.id}', 'Worker', this.value)"></td>
        <td>
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="resetUserPassword('${w.id}', 'Worker')">Reset Dialog</button>
        </td>
      </tr>
    `);
  });
};

window.updateAccountUsername = function(id, role, newUsername) {
  if (role === 'Customer') {
    const user = AppState.enquiries.find(e => e.id === id);
    if (user) user.email = newUsername;
  } else {
    const user = AppState.workers.find(w => w.id === id);
    if (user) user.email = newUsername;
  }
  AppState.saveAll();
  alert("Account username updated successfully!");
};

window.updateAccountPassword = function(id, role, newPassword) {
  if (role === 'Customer') {
    const user = AppState.enquiries.find(e => e.id === id);
    if (user) user.password = newPassword;
  } else {
    const user = AppState.workers.find(w => w.id === id);
    if (user) user.password = newPassword;
  }
  AppState.saveAll();
  alert("Account password updated successfully!");
};

window.viewPaymentReceipt = function(paymentId) {
  const p = AppState.payments.find(item => item.id === paymentId);
  if (!p) return;
  
  const content = document.getElementById("receiptDetailsContent");
  content.innerHTML = `
    <div><strong>Receipt No:</strong> <span style="float:right; color:white; font-weight:600;">${p.id}</span></div>
    <div><strong>Date & Time:</strong> <span style="float:right; color:white;">${p.date}</span></div>
    <div><strong>Customer Name:</strong> <span style="float:right; color:white;">${p.customerName}</span></div>
    <div><strong>Customer ID:</strong> <span style="float:right; color:white; font-weight:600;">${p.customerId}</span></div>
    <div><strong>Payment Type:</strong> <span style="float:right; color:white;">${p.paymentMethod}</span></div>
    <div><strong>Installment Phase:</strong> <span style="float:right; color:var(--secondary); font-weight:600;">${p.phase || (p.isAdvance ? 'Advance' : 'Installment')}</span></div>
    <hr style="border: none; border-top: 1px dashed rgba(255,255,255,0.1); margin: 0.5rem 0;">
    <div><strong>Base Amount:</strong> <span style="float:right; color:white;">₹${p.amount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div><strong>GST (18%):</strong> <span style="float:right; color:white;">₹${p.gstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div style="font-size:1.05rem; font-weight:bold; margin-top:0.35rem; color:var(--secondary);"><strong>Total Paid:</strong> <span style="float:right;">₹${p.totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span></div>
    <div style="margin-top:0.25rem;"><strong>Transaction Ref ID:</strong> <span style="float:right; color:var(--primary-glow); font-weight:600;">${p.upiQrRef || 'N/A'}</span></div>
  `;
  
  const qrContainer = document.getElementById("receiptQrContainer");
  const modal = document.getElementById("paymentReceiptModal");
  
  if (p.paymentMethod.includes("UPI") || p.paymentMethod.includes("QR") || p.upiQrRef) {
    qrContainer.style.display = "inline-block";
    const payText = `upi://pay?pa=pay@mgvpainters.bhim&pn=MGV%20Painters&am=${p.totalAmount.toFixed(2)}&tr=${p.upiQrRef}`;
    drawMockQRCode("receiptQrCanvas", payText);
  } else {
    qrContainer.style.display = "none";
  }
  
  modal.style.display = "flex";
  safeCreateIcons();
};

window.switchContractorTab = function(paneId) {
  const tab = document.querySelector(`#contractorDashboard .portal-tab[data-pane="${paneId}"]`);
  if (tab) {
    tab.click();
  }
};

/* ==================== CUSTOMERS HISTORY & DATABASE ENTITY ==================== */
window.openAddCustomerModal = function() {
  document.getElementById("addCustomerProfileForm").reset();
  document.getElementById("addCustomerProfileModal").style.display = "flex";
};

document.addEventListener("DOMContentLoaded", () => {
  const addCustForm = document.getElementById("addCustomerProfileForm");
  if (addCustForm) {
    addCustForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const name = document.getElementById("newCustName").value.trim();
      const phone = document.getElementById("newCustPhone").value.trim();
      const email = document.getElementById("newCustEmail").value.trim();
      const address = document.getElementById("newCustAddress").value.trim() || "-";

      if (!name || !phone || !email) {
        alert("Please fill in Name, Phone, and Email details.");
        return;
      }

      const newCustomer = {
        id: `CUST-${Math.floor(100 + Math.random() * 900)}`,
        name: name,
        phone: phone,
        email: email,
        address: address,
        date: getCurrentTimestamp()
      };

      AppState.customers.push(newCustomer);
      AppState.saveAll();

      alert(`Customer profile registered successfully! ID: ${newCustomer.id}`);
      document.getElementById("addCustomerProfileModal").style.display = "none";

      renderCustomersDatabaseTable();
      if (window.populateCalcCustomersDropdown) {
        populateCalcCustomersDropdown();
      }
    });
  }
});

window.renderCustomersDatabaseTable = function() {
  const tbody = document.getElementById("conCustomersDbBody");
  if (!tbody) return;
  tbody.innerHTML = "";

  const query = (document.getElementById("searchCustomersDb")?.value || "").toLowerCase().trim();
  const filtered = AppState.customers.filter(c => 
    c.name.toLowerCase().includes(query) || 
    c.phone.includes(query) || 
    c.email.toLowerCase().includes(query)
  );

  if (filtered.length === 0) {
    tbody.innerHTML = `<tr><td colspan="6" class="text-center text-muted">No matching customer records found.</td></tr>`;
    return;
  }

  filtered.forEach(c => {
    // Services availed count
    const servicesCount = AppState.enquiries.filter(e => e.phone === c.phone || e.email === c.email).length;
    
    // Dues calculations
    const clientProjects = AppState.enquiries.filter(e => e.phone === c.phone || e.email === c.email);
    const totalInvoiced = clientProjects.reduce((sum, item) => sum + (parseFloat(item.netTotal) || parseFloat(item.baseQuote) || 0), 0);
    const totalPaid = AppState.payments.filter(p => p.customerId === c.id || p.customerName === c.name).reduce((sum, item) => sum + item.totalAmount, 0);
    const balanceDue = Math.max(0, totalInvoiced - totalPaid);

    tbody.insertAdjacentHTML('beforeend', `
      <tr>
        <td><strong>${c.name}</strong><br><span style="font-size:0.75rem; color:var(--accent); font-weight:600;">ID: ${c.id}</span></td>
        <td>${c.phone}<br><span style="font-size:0.75rem; color:var(--text-muted);">${c.email}</span></td>
        <td>${c.date || 'N/A'}</td>
        <td><span class="badge badge-primary">${servicesCount} services</span></td>
        <td style="font-weight:600; color:${balanceDue > 0 ? '#ef4444' : '#10b981'};">₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td>
          <button class="btn btn-secondary" style="padding:0.25rem 0.5rem; font-size:0.75rem;" onclick="viewCustomerHistory('${c.id}')">View Details & History</button>
        </td>
      </tr>
    `);
  });
};

window.viewCustomerHistory = function(customerId) {
  const c = AppState.customers.find(item => item.id === customerId);
  if (!c) return;

  document.getElementById("custHistoryName").innerText = c.name;
  document.getElementById("custHistoryPhone").innerText = c.phone;
  document.getElementById("custHistoryEmail").innerText = c.email;
  document.getElementById("custHistoryAddress").innerText = c.address;

  const clientProjects = AppState.enquiries.filter(e => e.phone === c.phone || e.email === c.email);
  const totalInvoiced = clientProjects.reduce((sum, item) => sum + (parseFloat(item.netTotal) || parseFloat(item.baseQuote) || 0), 0);
  const totalPaid = AppState.payments.filter(p => p.customerId === c.id || p.customerName === c.name).reduce((sum, item) => sum + item.totalAmount, 0);
  const balanceDue = Math.max(0, totalInvoiced - totalPaid);

  document.getElementById("custHistoryTotalBilled").innerText = `₹${totalInvoiced.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("custHistoryTotalPaid").innerText = `₹${totalPaid.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
  document.getElementById("custHistoryTotalOwed").innerText = `₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;

  const servicesTbody = document.getElementById("custHistoryServicesBody");
  if (servicesTbody) {
    if (clientProjects.length === 0) {
      servicesTbody.innerHTML = `<tr><td colspan="5" class="text-center text-muted" style="font-size:0.75rem;">No availed projects/invoices mapped to this customer.</td></tr>`;
    } else {
      servicesTbody.innerHTML = clientProjects.map(p => {
        const cost = parseFloat(p.netTotal) || parseFloat(p.baseQuote) || 0;
        return `
          <tr>
            <td style="font-size:0.78rem;">${p.date || 'N/A'}</td>
            <td style="font-size:0.78rem;"><strong>${p.id}</strong><br><span style="font-size:0.72rem; color:var(--text-muted);">${p.projectName || 'Painting Works'}</span></td>
            <td style="font-size:0.78rem;">${p.serviceType || 'Interior/Exterior'}</td>
            <td style="font-size:0.78rem; font-weight:600; color:white;">₹${cost.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
            <td style="font-size:0.78rem;"><span class="badge ${p.status === 'Completed' ? 'badge-success' : 'badge-primary'}">${p.status}</span></td>
          </tr>
        `;
      }).join('');
    }
  }

  document.getElementById("customerHistoryModal").style.display = "flex";
  safeCreateIcons();
};


/* ==================== WHATSAPP ALERTS BUSINESS PANEL ==================== */
window.populateWaContactsSelect = function() {
  const type = document.getElementById("waRecipientType").value;
  const select = document.getElementById("waContactSelect");
  if (!select) return;
  select.innerHTML = "";

  if (type === "customer") {
    AppState.customers.forEach(c => {
      select.insertAdjacentHTML('beforeend', `<option value="${c.phone}" data-name="${c.name}">${c.name} (${c.phone})</option>`);
    });
  } else {
    AppState.workers.forEach(w => {
      select.insertAdjacentHTML('beforeend', `<option value="${w.phone}" data-name="${w.name}">${w.name} (${w.phone}) - ${w.specialty}</option>`);
    });
  }
  updateWaTemplatePreview();
};

window.updateWaTemplatePreview = function() {
  const select = document.getElementById("waContactSelect");
  if (!select) return;
  const tempType = document.getElementById("waTemplateType").value;
  const customBox = document.getElementById("waCustomMsgBox");
  
  if (tempType === "custom") {
    customBox.style.display = "block";
  } else {
    customBox.style.display = "none";
  }

  const selectedOpt = select.options[select.selectedIndex];
  const name = selectedOpt ? selectedOpt.getAttribute("data-name") : "Recipient Name";

  document.getElementById("waChatHeaderName").innerText = name;

  let text = "";
  if (tempType === "estimate") {
    text = `Hi *${name}*,\nYour consolidated painting estimate has been generated by MGV Painters (Contractor Gopinath). \nNet Invoice Total: *₹45,000.00* (Inclusive of GST).\nTrack live progress: mgvpainters.com/portal\nThank you!`;
  } else if (tempType === "survey") {
    text = `Hello *${name}*,\nOur chief site measurement supervisor is scheduled to visit your property for detailed laser surveys tomorrow at 10:00 AM. Please ensure site access.`;
  } else if (tempType === "payment") {
    text = `Dear *${name}*,\nWe have successfully received your advance/installment payment of *₹15,000.00*. Your balance directory spreadsheet has been updated. Thank you!`;
  } else if (tempType === "warning") {
    text = `Urgent *${name}* (Painter),\nSupervisor Gopinath logged quality issues/audit faults for your current project task. Please rectify immediately to clear wages release.`;
  } else if (tempType === "custom") {
    text = document.getElementById("waCustomText").value.trim() || "Type custom message...";
  }

  document.getElementById("waPreviewBubbleText").innerText = text;
  document.getElementById("waPreviewTime").innerText = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

window.sendOfficialWhatsAppMessage = function() {
  const select = document.getElementById("waContactSelect");
  const phone = select.value;
  const text = document.getElementById("waPreviewBubbleText").innerText;

  if (!phone) {
    alert("Please select a recipient contact first.");
    return;
  }

  const waUrl = `https://api.whatsapp.com/send?phone=91${phone}&text=${encodeURIComponent(text)}`;
  window.open(waUrl, "_blank");
};


/* ==================== GMAIL CONNECTIVITY SMTP COMPOSER ==================== */
window.populateGmailContactsSelect = function() {
  const select = document.getElementById("gmailRecipientSelect");
  if (!select) return;
  select.innerHTML = `<option value="">-- Choose Recipient --</option>`;

  AppState.customers.forEach(c => {
    select.insertAdjacentHTML('beforeend', `<option value="${c.email}" data-name="${c.name}">${c.name} (${c.email})</option>`);
  });
  AppState.workers.forEach(w => {
    select.insertAdjacentHTML('beforeend', `<option value="${w.email || w.phone + '@mgvpainters.com'}" data-name="${w.name}">${w.name} (Painter - ${w.email || 'No email'})</option>`);
  });
};

window.populateGmailFields = function() {
  const select = document.getElementById("gmailRecipientSelect");
  const toInput = document.getElementById("gmailToAddress");
  const subInput = document.getElementById("gmailSubject");
  const bodyInput = document.getElementById("gmailMessageBody");

  const selectedOpt = select.options[select.selectedIndex];
  if (!selectedOpt || !select.value) {
    toInput.value = "";
    subInput.value = "";
    bodyInput.value = "";
    return;
  }

  const name = selectedOpt.getAttribute("data-name");
  const email = select.value;

  toInput.value = email;
  subInput.value = `Official Project Invoice & Document Proof - MGV Painters`;
  
  bodyInput.value = `Dear ${name},\n\nPlease find attached the official details, paint catalog options, and consolidated quotation bills corresponding to the painting services availed at your site.\n\nSummary:\n- Provider: MGV Painters Bangalore\n- Supervisor: Mr. G. V. Gopinath (+91 99002 21122)\n- Attachment Included: Invoices / Catalog\n\nShort & sweet description: Premium painting layout ready for project execution. Feel free to contact our supervisor if any updates are needed.\n\nWarm regards,\nMGV Painters Team`;
};

window.sendOfficialGmailMail = function() {
  const to = document.getElementById("gmailToAddress").value.trim();
  const subject = document.getElementById("gmailSubject").value.trim();
  const body = document.getElementById("gmailMessageBody").value.trim();

  if (!to || !subject || !body) {
    alert("Please fill in Recipient, Subject, and Description fields.");
    return;
  }

  const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  window.open(gmailUrl, "_blank");
};

window.simulateGmailSmtpSend = function() {
  const to = document.getElementById("gmailToAddress").value.trim();
  if (!to) {
    alert("Please enter a recipient email address.");
    return;
  }

  const loader = document.createElement("div");
  loader.style = `
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85); z-index: 100000;
    display: flex; flex-direction: column; justify-content: center; align-items: center;
    color: white; font-family: 'Inter', sans-serif; gap: 1rem;
  `;
  loader.innerHTML = `
    <div class="spin-icon" style="font-size: 2rem; color: var(--secondary);"><i data-lucide="loader"></i></div>
    <div style="font-weight: 600;" id="simSmtpMsg">Connecting to Gmail SMTP relay...</div>
  `;
  document.body.appendChild(loader);
  safeCreateIcons();

  setTimeout(() => {
    document.getElementById("simSmtpMsg").innerText = "Transmitting consolidated invoice PDF & catalog attachments...";
    setTimeout(() => {
      document.getElementById("simSmtpMsg").innerHTML = `<span style="color:#10b981;">✓ Email successfully dispatched through Gmail SMTP relay!</span>`;
      setTimeout(() => {
        loader.remove();
      }, 1500);
    }, 1500);
  }, 1200);
};


/* ==================== PRINT ESTIMATE INVOICE RECEIPT ==================== */
window.printInvoiceReceipt = function(enquiryId) {
  let enquiry;
  let items = [];
  let baseAmount = 0;
  let isGst = true;
  
  if (enquiryId) {
    enquiry = AppState.enquiries.find(e => e.id === enquiryId);
    if (!enquiry) return;
    items = enquiry.addedServices || [];
    baseAmount = enquiry.baseQuote || 0;
    isGst = enquiry.gstEnabled !== false;
  } else {
    // Current draft estimate in estimator
    if (adminCalcAddedServices.length === 0) {
      alert("Please add at least one service to the draft estimate first.");
      return;
    }
    const customerSelect = document.getElementById("adminCalcCustomerSelect");
    const custId = customerSelect.value;
    const customer = AppState.customers.find(p => p.id === custId) || { name: "Walk-in Customer", phone: "-", address: "-" };
    const houseNo = document.getElementById("adminCalcHouseNo").value.trim() || "-";
    const floor = document.getElementById("adminCalcFloor").value.trim() || "-";
    const projName = document.getElementById("adminCalcProjectName").value.trim() || "Consolidated Painting Project";

    enquiry = {
      id: `EST-${Math.floor(1000 + Math.random() * 9000)}`,
      name: customer.name,
      phone: customer.phone,
      address: `${houseNo}, Floor ${floor}`,
      projectName: projName,
      date: getCurrentTimestamp()
    };

    items = adminCalcAddedServices;
    
    // Re-calculate baseQuote
    const activeModelBtn = document.querySelector("#adminCalcModelGroup .radio-btn.active");
    const calcModel = activeModelBtn ? activeModelBtn.getAttribute("data-model") : "lumpsum";
    
    baseAmount = adminCalcAddedServices.reduce((sum, item) => {
      let rate = calcModel === "lumpsum" ? item.baseRateLumpsum : item.baseRateLabor;
      if (!isNaN(item.customSqft)) rate = item.customSqft;
      let subtotal = rate * item.area;
      if (calcModel === "lumpsum") subtotal += item.paintRateSum * item.area;
      return sum + subtotal;
    }, 0);
    
    const gstOption = document.getElementById("adminCalcGSTOption")?.value || "with";
    isGst = gstOption === "with";
  }

  const cgst = isGst ? baseAmount * 0.09 : 0;
  const sgst = isGst ? baseAmount * 0.09 : 0;
  const total = baseAmount + cgst + sgst;

  const printWindow = window.open("", "_blank", "width=800,height=900");
  
  const itemsHtml = items.map((item, idx) => {
    const paintsStr = item.paints.map(p => p.summary).join(', ') || 'None';
    // Deduce rate
    let rate = item.customSqft || item.baseRateLumpsum || item.baseRateLabor || 0;
    let sub = rate * item.area;
    return `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">${idx + 1}</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd;">
          <strong>${item.title}</strong><br>
          <span style="font-size: 0.8rem; color: #666;">Paints: ${paintsStr}</span>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: center;">${item.area} sqft</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right;">₹${rate}/sqft</td>
        <td style="padding: 10px; border-bottom: 1px solid #ddd; text-align: right; font-weight: bold;">₹${sub.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `;
  }).join('');

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice - MGV Painters</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; color: #333; margin: 40px; }
          .header { display: flex; justify-content: space-between; border-bottom: 2px solid #ea580c; padding-bottom: 20px; }
          .logo-section h1 { color: #ea580c; margin: 0; font-size: 2.2rem; }
          .logo-section p { margin: 5px 0 0 0; color: #666; font-size: 0.95rem; }
          .meta-section { text-align: right; font-size: 0.9rem; line-height: 1.5; }
          .meta-section strong { color: #ea580c; }
          .billing-info { display: flex; justify-content: space-between; margin-top: 30px; background: #f9f9f9; padding: 15px; border-radius: 6px; }
          .bill-to, .provider-to { width: 48%; font-size: 0.9rem; line-height: 1.6; }
          .bill-to h3, .provider-to h3 { border-bottom: 1px solid #ddd; padding-bottom: 5px; margin-top: 0; color: #555; }
          .invoice-table { width: 100%; border-collapse: collapse; margin-top: 30px; }
          .invoice-table th { background: #ea580c; color: white; padding: 12px; text-align: left; }
          .totals-table { width: 320px; margin-left: auto; margin-top: 30px; font-size: 0.95rem; line-height: 1.8; }
          .totals-table td { padding: 4px 10px; }
          .totals-table tr.grand-total { font-size: 1.2rem; font-weight: bold; color: #ea580c; border-top: 2px solid #ea580c; }
          .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ddd; padding-top: 20px; font-size: 0.85rem; color: #777; }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <h1>MGV PAINTERS</h1>
            <p>Premium Painting & Coating Contractor</p>
          </div>
          <div class="meta-section">
            <strong>INVOICE / ESTIMATE PROOF</strong><br>
            Reference: ${enquiry.id}<br>
            Date: ${enquiry.date}<br>
            Project Name: ${enquiry.projectName || 'Painting Works'}
          </div>
        </div>
        
        <div class="billing-info">
          <div class="bill-to">
            <h3>CLIENT DETAILS</h3>
            <strong>Customer:</strong> ${enquiry.name}<br>
            <strong>Phone:</strong> ${enquiry.phone}<br>
            <strong>Address:</strong> ${enquiry.address}
          </div>
          <div class="provider-to">
            <h3>CONTRACTOR PROFILE</h3>
            <strong>MGV Painters Office</strong><br>
            <strong>Proprietor:</strong> Mr. G. V. Gopinath<br>
            <strong>UPI ID:</strong> pay@mgvpainters.bhim<br>
            <strong>Contact:</strong> +91 99002 21122
          </div>
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th style="width: 5%;">#</th>
              <th style="width: 50%;">Service Description</th>
              <th style="width: 15%; text-align: center;">Area</th>
              <th style="width: 15%; text-align: right;">Unit Rate</th>
              <th style="width: 15%; text-align: right;">Total</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>

        <table class="totals-table">
          <tr>
            <td>Base Subtotal:</td>
            <td style="text-align: right;">₹${baseAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>CGST (9%):</td>
            <td style="text-align: right;">₹${cgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr>
            <td>SGST (9%):</td>
            <td style="text-align: right;">₹${sgst.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
          <tr class="grand-total">
            <td>Net Total:</td>
            <td style="text-align: right;">₹${total.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
          </tr>
        </table>

        <div style="margin-top: 40px; text-align: center;">
          <p style="font-weight: bold; margin-bottom: 10px;">Scan to Pay via UPI App</p>
          <div id="printQrCanvasContainer" style="display: inline-block; padding: 10px; background: white; border: 1px solid #ddd; border-radius: 4px;">
             <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(`upi://pay?pa=pay@mgvpainters.bhim&pn=MGV%20Painters&am=${total.toFixed(2)}&cu=INR`)}">
          </div>
          <p style="font-size: 0.8rem; color: #555; margin-top: 5px;">UPI: pay@mgvpainters.bhim</p>
        </div>

        <div class="footer">
          Thank you for your valuable business with MGV Painters. This is a computer generated document and does not require a physical signature.
        </div>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
    </html>
  `);
  
  printWindow.document.close();
};


/* ==================== DYNAMIC LOGIN/LOGOUT HEADER VISIBILITY BINDERS ==================== */
window.updateLoginHeader = function() {
  const navLoginBtn = document.getElementById("navLoginBtn");
  if (!navLoginBtn) return;

  const isAdmin = document.getElementById("contractor-view").classList.contains("active");
  const isWorker = document.getElementById("worker-view").classList.contains("active");
  const isCustomer = document.getElementById("customer-view").classList.contains("active");

  if (isAdmin || isWorker || isCustomer) {
    navLoginBtn.innerHTML = `<i data-lucide="log-out"></i> Sign Out`;
    navLoginBtn.style.background = "var(--danger)";
    navLoginBtn.onclick = (e) => {
      e.preventDefault();
      if (isAdmin) {
        document.getElementById("conLogoutBtn").click();
      } else if (isWorker) {
        document.getElementById("workerLogoutBtn").click();
      } else if (isCustomer) {
        document.getElementById("custLogoutBtn").click();
      }
    };
  } else {
    navLoginBtn.innerHTML = `<i data-lucide="log-in"></i> Sign In`;
    navLoginBtn.style.background = "";
    navLoginBtn.onclick = null; 
  }
  safeCreateIcons();
};

setInterval(() => {
  updateLoginHeader();
}, 600);

/* ==================== TOGGLE PAINT BRAND VISIBILITY ==================== */
window.togglePaintVisibility = function(id) {
  const p = AppState.paintCatalog.find(item => item.id === id);
  if (p) {
    p.hidden = !p.hidden;
    AppState.saveAll();
    renderAdminBrands();
    
    // Re-populate and filter paint lists across all active builder panes
    const paintsChecklist = document.getElementById("adminCalcPaintsChecklist");
    if (paintsChecklist) {
      paintsChecklist.innerHTML = AppState.paintCatalog.filter(paint => !paint.hidden).map(paint => `
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; user-select: none;">
          <input type="checkbox" name="calcPaintGrade" value="${paint.id}" data-rate="${paint.rate}" data-brand="${paint.brand}" data-grade="${paint.grade}">
          <span>${paint.brand} - ${paint.grade} (₹${paint.rate}/sqft)</span>
        </label>
      `).join('');
    }
    const billChecklist = document.getElementById("billPaintsChecklist");
    if (billChecklist) {
      billChecklist.innerHTML = AppState.paintCatalog.filter(paint => !paint.hidden).map(paint => `
        <label style="display: flex; align-items: center; gap: 0.5rem; font-size: 0.8rem; color: var(--text-secondary); cursor: pointer; user-select: none;">
          <input type="checkbox" name="billPaintGrade" value="${paint.id}" data-brand="${paint.brand}" data-grade="${paint.grade}">
          <span>${paint.brand} - ${paint.grade}</span>
        </label>
      `).join('');
    }
  }
};
