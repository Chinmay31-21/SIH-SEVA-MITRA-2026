// Realistic Indian agriculture demo data for Krishi Mitra

export const farmer = {
  name: "Ramesh Patil",
  farmName: "Green Valley Farm",
  location: "Nashik, Maharashtra",
  verified: true,
  initials: "RP",
};

export const languages = [
  "English",
  "हिंदी",
  "मराठी",
  "ગુજરાતી",
  "ਪੰਜਾਬੀ",
  "தமிழ்",
  "తెలుగు",
  "ಕನ್ನಡ",
  "বাংলা",
];

export const fields = [
  { id: "A", name: "Field A", crop: "Tomato", area: 2.5, health: 91, status: "Healthy", moisture: 64, stage: "Flowering", harvestDays: 18 },
  { id: "B", name: "Field B", crop: "Onion", area: 1.8, health: 68, status: "Attention Required", moisture: 38, stage: "Bulb Development", harvestDays: 34 },
  { id: "C", name: "Field C", crop: "Wheat", area: 3.0, health: 88, status: "Healthy", moisture: 57, stage: "Grain Filling", harvestDays: 42 },
];

export const soilMetrics = [
  { label: "Moisture", value: 64, unit: "%", status: "Optimal", note: "Soil has enough water today", max: 100 },
  { label: "Temperature", value: 24, unit: "°C", status: "Good", note: "Warm enough for root growth", max: 45 },
  { label: "pH Level", value: 6.7, unit: "", status: "Good", note: "Slightly acidic — good for most crops", max: 14 },
  { label: "Nitrogen (N)", value: 38, unit: "kg/acre", status: "Low", note: "18% below recommended — feed soon", max: 100 },
  { label: "Phosphorus (P)", value: 52, unit: "kg/acre", status: "Optimal", note: "Healthy level", max: 100 },
  { label: "Potassium (K)", value: 61, unit: "kg/acre", status: "Optimal", note: "Healthy level", max: 100 },
  { label: "Electrical Conductivity", value: 0.8, unit: "dS/m", status: "Good", note: "No salinity stress", max: 4 },
  { label: "Organic Carbon", value: 0.62, unit: "%", status: "Medium", note: "Add compost to improve", max: 1.5 },
];

export const aiSuggestions = [
  {
    title: "Reduce irrigation today",
    priority: "High",
    reason: "Rainfall is expected tomorrow evening (72% probability).",
    action: "Reduce today's watering by approximately 30%.",
    benefit: "Saves ~1,800 litres of water and prevents waterlogging.",
  },
  {
    title: "Apply nitrogen-rich fertilizer",
    priority: "High",
    reason: "Nitrogen in Field A is 18% below the recommended range during flowering.",
    action: "Apply Urea at 22 kg/acre within the next 3 days.",
    benefit: "Supports fruit set; can improve yield by up to 12%.",
  },
  {
    title: "Early fungal risk detected",
    priority: "Medium",
    reason: "Humidity above 85% for 3 consecutive nights in Nashik region.",
    action: "Inspect lower leaves of tomato plants; consider preventive neem spray.",
    benefit: "Prevents early blight before visible damage.",
  },
  {
    title: "Hold onion harvest by 4 days",
    priority: "Low",
    reason: "Onion prices at Nashik APMC are trending up 3.2% this week.",
    action: "Delay harvest if bulbs are mature and weather stays dry.",
    benefit: "Potential extra revenue of ~₹4,100 per acre.",
  },
];

export const fertilizerPlan = {
  deficiency: "Nitrogen Deficiency",
  fertilizer: "Urea (46% N)",
  quantity: "22 kg/acre",
  method: "Broadcasting followed by light irrigation",
  bestDate: "Within 3 days, early morning",
  safety: "Wear gloves. Keep away from water channels. Do not apply before heavy rain.",
};

export const diseaseResult = {
  disease: "Early Blight",
  confidence: 92,
  severity: "Moderate",
  treatment: [
    "Spray Mancozeb 75% WP @ 2.5 g/litre of water",
    "Remove and destroy infected lower leaves",
    "Repeat spray after 10 days if symptoms persist",
  ],
  prevention: [
    "Maintain proper spacing for air circulation",
    "Avoid overhead irrigation in the evening",
    "Rotate crops — avoid tomato in the same field next season",
  ],
};

export const cropRecommendations = [
  { crop: "Onion", suitability: 92, demand: "High", water: "Medium", investment: "₹32,000/acre", revenue: "₹78,000", profit: "₹46,000", risk: "Low", why: "Your soil pH (6.7) and organic carbon suit onion perfectly. Nashik demand is projected to rise 14% in two weeks, and your field has medium water availability which matches onion's needs." },
  { crop: "Tomato", suitability: 88, demand: "Very High", water: "High", investment: "₹45,000/acre", revenue: "₹1,10,000", profit: "₹65,000", risk: "Medium", why: "Strong mandi demand in Pune and Nashik. Your drip irrigation covers the high water need. Medium risk due to price volatility." },
  { crop: "Soybean", suitability: 83, demand: "Medium", water: "Low", investment: "₹18,000/acre", revenue: "₹42,000", profit: "₹24,000", risk: "Low", why: "Low water need protects against dry spells. Nitrogen fixation will naturally restore your soil's low nitrogen." },
  { crop: "Maize", suitability: 79, demand: "Medium", water: "Medium", investment: "₹22,000/acre", revenue: "₹52,000", profit: "₹30,000", risk: "Low", why: "Good rotational crop after tomato. Steady demand from poultry feed industry near Nashik." },
];

export const weatherNow = {
  temp: 29,
  feelsLike: 32,
  humidity: 68,
  wind: 14,
  aqi: 82,
  aqiLabel: "Moderate",
  rainProbability: 72,
  uv: 7,
  pressure: 1008,
  condition: "Partly Cloudy",
};

export const hourlyForecast = [
  { time: "6 AM", temp: 22, rain: 10 },
  { time: "9 AM", temp: 26, rain: 15 },
  { time: "12 PM", temp: 30, rain: 20 },
  { time: "3 PM", temp: 31, rain: 35 },
  { time: "6 PM", temp: 28, rain: 72 },
  { time: "9 PM", temp: 25, rain: 80 },
  { time: "12 AM", temp: 23, rain: 45 },
  { time: "3 AM", temp: 22, rain: 20 },
];

export const weeklyForecast = [
  { day: "Today", high: 31, low: 22, rain: 72, icon: "rain" },
  { day: "Sun", high: 29, low: 21, rain: 85, icon: "rain" },
  { day: "Mon", high: 30, low: 20, rain: 40, icon: "cloud" },
  { day: "Tue", high: 32, low: 21, rain: 10, icon: "sun" },
  { day: "Wed", high: 33, low: 22, rain: 5, icon: "sun" },
  { day: "Thu", high: 32, low: 22, rain: 20, icon: "cloud" },
  { day: "Fri", high: 31, low: 21, rain: 55, icon: "rain" },
];

export const weatherAlerts = [
  { title: "Heavy Rainfall Alert", severity: "warning", detail: "Expected tomorrow from 4 PM – 9 PM. Estimated 35–45 mm.", actions: ["Avoid irrigation today", "Delay pesticide spraying", "Protect harvested produce"] },
  { title: "High Humidity — Disease Risk", severity: "info", detail: "Humidity above 85% at night for the next 3 days.", actions: ["Inspect tomato lower leaves daily", "Ensure field drainage is clear"] },
  { title: "Strong Wind Warning", severity: "warning", detail: "Wind gusts up to 42 km/h on Monday afternoon.", actions: ["Support tall plants with stakes", "Secure stored produce covers"] },
];

export const solarData = {
  current: 3.8,
  today: 18.7,
  efficiency: 94,
  consumed: 11.2,
  stored: 7.5,
  co2Saved: 14.9,
};

export const solarWeekly = [
  { day: "Mon", kwh: 16.2 },
  { day: "Tue", kwh: 17.8 },
  { day: "Wed", kwh: 15.4 },
  { day: "Thu", kwh: 18.1 },
  { day: "Fri", kwh: 19.3 },
  { day: "Sat", kwh: 18.7 },
  { day: "Sun", kwh: 12.6 },
];

export const irrigationZones = [
  { zone: "Zone A", crop: "Tomato", status: "Running", moisture: 38, detail: "1,250 L planned" },
  { zone: "Zone B", crop: "Onion", status: "Scheduled", moisture: 41, detail: "Starts 6:00 AM" },
  { zone: "Zone C", crop: "Wheat", status: "Moisture Sufficient", moisture: 57, detail: "No irrigation needed" },
];

export const sensors = [
  { name: "Moisture Sensor", location: "Field A", status: "Online", battery: 86, updated: "2 min ago", value: "38%" },
  { name: "Moisture Sensor", location: "Field B", status: "Online", battery: 71, updated: "5 min ago", value: "41%" },
  { name: "NPK Sensor", location: "Field A", status: "Online", battery: 64, updated: "12 min ago", value: "N: Low" },
  { name: "pH Sensor", location: "Field C", status: "Online", battery: 92, updated: "8 min ago", value: "6.7" },
  { name: "Temperature Sensor", location: "Field B", status: "Offline", battery: 12, updated: "3 hrs ago", value: "—" },
  { name: "Tank Level Sensor", location: "Main Tank", status: "Online", battery: 78, updated: "1 min ago", value: "78%" },
];

export const marketPrices = [
  { crop: "Tomato", mandi: "Pune APMC", price: 2350, min: 2100, max: 2600, change: 8.4, demand: "High", stock: "120 tonnes" },
  { crop: "Onion", mandi: "Nashik", price: 1980, min: 1750, max: 2200, change: 3.2, demand: "High", stock: "340 tonnes" },
  { crop: "Wheat", mandi: "Nagpur", price: 2410, min: 2300, max: 2520, change: -1.5, demand: "Medium", stock: "510 tonnes" },
  { crop: "Soybean", mandi: "Indore", price: 4890, min: 4650, max: 5100, change: 2.1, demand: "Medium", stock: "280 tonnes" },
  { crop: "Potato", mandi: "Kolhapur", price: 1420, min: 1300, max: 1580, change: -3.8, demand: "Low", stock: "620 tonnes" },
  { crop: "Grapes", mandi: "Nashik", price: 5400, min: 5000, max: 5900, change: 5.6, demand: "Very High", stock: "85 tonnes" },
  { crop: "Cotton", mandi: "Ludhiana", price: 7100, min: 6900, max: 7350, change: 1.2, demand: "Medium", stock: "190 tonnes" },
  { crop: "Maize", mandi: "Pune APMC", price: 2240, min: 2150, max: 2380, change: 0.8, demand: "Medium", stock: "410 tonnes" },
];

export const priceHistory = [
  { month: "Mar", tomato: 1650, onion: 1450 },
  { month: "Apr", tomato: 1820, onion: 1520 },
  { month: "May", tomato: 2100, onion: 1610 },
  { month: "Jun", tomato: 1980, onion: 1740 },
  { month: "Jul", tomato: 2210, onion: 1830 },
  { month: "Aug", tomato: 2350, onion: 1980 },
];

export const marketListings = [
  { crop: "Premium Nashik Onion", farmer: "Ramesh Patil", location: "Nashik", qty: "850 kg", grade: "A", price: "₹32/kg", harvested: "Today", verified: true },
  { crop: "Organic Tomato", farmer: "Sunita Deshmukh", location: "Pune", qty: "420 kg", grade: "A", price: "₹28/kg", harvested: "Yesterday", verified: true },
  { crop: "Sharbati Wheat", farmer: "Gurpreet Singh", location: "Ludhiana", qty: "2.4 tonnes", grade: "Premium", price: "₹2,450/quintal", harvested: "3 days ago", verified: true },
  { crop: "Fresh Okra (Bhindi)", farmer: "Mahesh Jadhav", location: "Kolhapur", qty: "180 kg", grade: "B+", price: "₹24/kg", harvested: "Today", verified: false },
  { crop: "Thompson Grapes", farmer: "Anil Shinde", location: "Nashik", qty: "640 kg", grade: "Export", price: "₹58/kg", harvested: "Today", verified: true },
  { crop: "Basmati Rice", farmer: "Harpreet Kaur", location: "Ludhiana", qty: "1.8 tonnes", grade: "Premium", price: "₹4,100/quintal", harvested: "1 week ago", verified: true },
];

export const storageFacilities = [
  { name: "Krishi Warehouse", location: "Nashik", distance: "4.3 km", capacity: "38 tonnes", type: "Cold Storage", rate: "₹24/quintal/day" },
  { name: "Mahalaxmi Godown", location: "Ozarkhed", distance: "9.1 km", capacity: "120 tonnes", type: "Dry Storage", rate: "₹9/quintal/day" },
  { name: "Sahyadri Agro Storage", location: "Dindori", distance: "16.8 km", capacity: "22 tonnes", type: "Cold Storage", rate: "₹27/quintal/day" },
];

export const surplusOptions = [
  { option: "Sell to processing facility", revenue: "₹9,600", cost: "₹800 transport", shelfLife: "—", facility: "Nashik Agro Processors, 6.2 km" },
  { option: "Move to cold storage", revenue: "₹13,400 (delayed sale)", cost: "₹115/day", shelfLife: "Extends 21 days", facility: "Krishi Warehouse, 4.3 km" },
  { option: "Produce tomato puree", revenue: "₹17,300", cost: "₹3,900 processing", shelfLife: "6 months", facility: "Sahyadri FPO Unit, 12 km" },
  { option: "Donate via food recovery network", revenue: "₹0 (tax benefit)", cost: "Free pickup", shelfLife: "Immediate", facility: "Annapurna Network, Nashik" },
];

export const communityPosts = [
  { author: "Sunita Deshmukh", location: "Pune", crop: "Tomato", category: "Crop Advice", text: "Has anyone observed leaf curl in tomatoes after the recent rainfall? Trying neem spray — any better suggestions?", likes: 24, comments: 11, time: "2 hrs ago" },
  { author: "Mahesh Jadhav", location: "Kolhapur", crop: "Sugarcane", category: "Success Stories", text: "Sold my entire harvest directly through the marketplace this season — earned 18% more than the mandi rate. Thank you community for the advice!", likes: 89, comments: 23, time: "5 hrs ago" },
  { author: "Gurpreet Singh", location: "Ludhiana", crop: "Wheat", category: "Machinery", text: "Sharing my harvester for rent next week. DM if anyone near Ludhiana needs it. ₹1,400/hour.", likes: 15, comments: 8, time: "8 hrs ago" },
  { author: "Anil Shinde", location: "Nashik", crop: "Grapes", category: "Weather", text: "Heavy rain alert for tomorrow evening in Nashik belt. Cover your drying produce and check drainage channels today itself.", likes: 56, comments: 14, time: "1 day ago" },
];

export const farmerGroups = [
  { name: "Nashik Onion Growers", members: 1240, activity: "Very Active" },
  { name: "Organic Farming Maharashtra", members: 860, activity: "Active" },
  { name: "Drip Irrigation Users India", members: 2130, activity: "Active" },
  { name: "Grape Export Network", members: 420, activity: "Moderate" },
];

export const schemes = [
  { name: "PM-KISAN Samman Nidhi", benefit: "₹6,000/year direct income support", eligibility: "All landholding farmers", deadline: "Open", docs: "Aadhaar, Land records, Bank account" },
  { name: "PM Fasal Bima Yojana", benefit: "Crop insurance at 2% premium (Kharif)", eligibility: "All farmers, including tenant farmers", deadline: "31 July", docs: "Aadhaar, Land records, Sowing certificate" },
  { name: "PM Krishi Sinchayee Yojana", benefit: "90% subsidy on drip irrigation (small farmers)", eligibility: "Small & marginal farmers", deadline: "Rolling", docs: "Aadhaar, 7/12 extract, Bank details" },
  { name: "Kisan Credit Card", benefit: "Credit up to ₹3 lakh at 4% interest", eligibility: "Farmers with land records", deadline: "Open", docs: "Aadhaar, Land records, Photo" },
  { name: "Solar Pump Subsidy (PM-KUSUM)", benefit: "60% subsidy on solar pumps", eligibility: "Farmers with water source", deadline: "30 Sept", docs: "Aadhaar, Land records, Electricity bill" },
  { name: "Soil Health Card Scheme", benefit: "Free soil testing every 2 years", eligibility: "All farmers", deadline: "Open", docs: "Aadhaar, Land records" },
  { name: "Agriculture Infrastructure Fund", benefit: "3% interest subvention on storage loans", eligibility: "Farmers, FPOs, agri-entrepreneurs", deadline: "Open", docs: "Project report, Aadhaar, Bank details" },
];

export const sharedResources = [
  { name: "Tractor Rental — Mahindra 575", distance: "2.1 km", price: "₹650/hour", available: "Tomorrow" },
  { name: "Drone Spraying Service", distance: "5.4 km", price: "₹450/acre", available: "Today" },
  { name: "Harvester Rental", distance: "11 km", price: "₹1,400/hour", available: "Next week" },
  { name: "Cold Storage Slot", distance: "4.3 km", price: "₹24/quintal/day", available: "38 tonnes free" },
  { name: "Soil Testing Van", distance: "3.2 km", price: "₹200/sample", available: "Today" },
  { name: "Produce Transport (Mini Truck)", distance: "1.8 km", price: "₹18/km", available: "Today" },
];

export const fpos = [
  { name: "Sahyadri Farmer Producer Company", members: 1840, distance: "12 km", crops: "Tomato, Grapes", benefits: ["Collective Selling", "Storage", "Processing", "Market Access"] },
  { name: "Godavari Valley FPO", members: 960, distance: "18 km", crops: "Onion, Maize", benefits: ["Bulk Input Purchase", "Export Linkage"] },
  { name: "Nashik Fresh Vegetables FPC", members: 640, distance: "9 km", crops: "Mixed Vegetables", benefits: ["Retail Chain Contracts", "Cold Chain"] },
];

export const trainingCategories = [
  { name: "Crop Management", lessons: 24, type: "Video + Audio" },
  { name: "Organic Farming", lessons: 18, type: "Video" },
  { name: "Irrigation Techniques", lessons: 12, type: "Video + Guide" },
  { name: "Pest Management", lessons: 16, type: "Audio lessons" },
  { name: "Farm Machinery", lessons: 9, type: "Video" },
  { name: "Financial Literacy", lessons: 14, type: "Audio lessons" },
  { name: "Government Schemes", lessons: 11, type: "Guide" },
  { name: "Post-Harvest Management", lessons: 13, type: "Video + Guide" },
];

export const notifications = [
  { category: "Weather", text: "Rain expected in 6 hours. Delay evening irrigation.", time: "10 min ago", unread: true },
  { category: "Crop Health", text: "Low nitrogen detected in Field A.", time: "1 hr ago", unread: true },
  { category: "Irrigation", text: "Field B moisture has fallen below 40%.", time: "2 hrs ago", unread: true },
  { category: "Market", text: "Tomato price increased by 8.4% at Pune APMC.", time: "3 hrs ago", unread: false },
  { category: "Orders", text: "Buyer Rahul Foods sent you an offer for 850 kg onion.", time: "5 hrs ago", unread: true },
  { category: "Community", text: "Anil Shinde replied to your post in Nashik Onion Growers.", time: "Yesterday", unread: false },
  { category: "Government Schemes", text: "You may qualify for a new irrigation subsidy (PMKSY).", time: "Yesterday", unread: false },
];

export const orders = [
  { buyer: "Rahul Foods (Restaurant)", item: "850 kg Onion", offer: "₹30/kg", status: "Offer Received" },
  { buyer: "FreshMart Retail", item: "200 kg Tomato", offer: "₹26/kg", status: "In Transit" },
  { buyer: "Hotel Green Leaf", item: "60 kg Mixed Vegetables", offer: "₹1,840 total", status: "Delivered" },
];

export const moistureTrend = [
  { day: "Mon", a: 52, b: 46 },
  { day: "Tue", a: 49, b: 44 },
  { day: "Wed", a: 55, b: 43 },
  { day: "Thu", a: 47, b: 40 },
  { day: "Fri", a: 44, b: 39 },
  { day: "Sat", a: 41, b: 38 },
  { day: "Sun", a: 38, b: 41 },
];
