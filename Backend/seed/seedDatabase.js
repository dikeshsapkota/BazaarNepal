const path = require("path");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const dotenv = require("dotenv");

dotenv.config({
  path: path.resolve(__dirname, "../.env"),
});

const connectDB = require("../src/config/db");
const User = require("../src/models/User");
const Product = require("../src/models/Product");
const Order = require("../src/models/Order");
const PromoCode = require("../src/models/PromoCode");

const DEMO_PASSWORD = "Demo@12345";

const sellerSeeds = [
  {
    name: "Aarav Shrestha",
    email: "seller.techmart@bazaarnepal.demo",
    role: "seller",
    phone: "9801002001",
    address: "Putalisadak",
    city: "Kathmandu",
    shopName: "TechMart Nepal",
    description:
      "Trusted Kathmandu electronics shop offering phones, accessories, audio gear, and smart devices.",
  },
  {
    name: "Mingma Lama",
    email: "seller.crafts@bazaarnepal.demo",
    role: "seller",
    phone: "9801002002",
    address: "Lakeside",
    city: "Pokhara",
    shopName: "Himalayan Crafts",
    description:
      "Handmade Nepali decor, singing bowls, wool goods, and artisan gifts from local makers.",
  },
  {
    name: "Sanjana Karki",
    email: "seller.fashion@bazaarnepal.demo",
    role: "seller",
    phone: "9801002003",
    address: "New Road",
    city: "Kathmandu",
    shopName: "Kathmandu Fashion Hub",
    description:
      "Everyday fashion, festive wear, footwear, and accessories for modern Nepali shoppers.",
  },
  {
    name: "Bikram Thapa",
    email: "seller.fitness@bazaarnepal.demo",
    role: "seller",
    phone: "9801002004",
    address: "Bharatpur Heights",
    city: "Chitwan",
    shopName: "Nepal Fitness Store",
    description:
      "Durable home workout equipment, outdoor gear, and fitness essentials for active lifestyles.",
  },
  {
    name: "Anita Adhikari",
    email: "seller.foods@bazaarnepal.demo",
    role: "seller",
    phone: "9801002005",
    address: "Birtamode Bazaar",
    city: "Jhapa",
    shopName: "Himalayan Foods",
    description:
      "Premium tea, spices, pickles, honey, and traditional Nepali pantry products.",
  },
];

const customerSeeds = [
  {
    name: "Nisha Bhandari",
    email: "customer.nisha@bazaarnepal.demo",
    role: "customer",
    phone: "9810001001",
    address: "Baneshwor",
    city: "Kathmandu",
  },
  {
    name: "Rabin Gurung",
    email: "customer.rabin@bazaarnepal.demo",
    role: "customer",
    phone: "9810001002",
    address: "Srijana Chowk",
    city: "Pokhara",
  },
  {
    name: "Pratiksha Rai",
    email: "customer.pratiksha@bazaarnepal.demo",
    role: "customer",
    phone: "9810001003",
    address: "Traffic Chowk",
    city: "Butwal",
  },
  {
    name: "Suman Tamang",
    email: "customer.suman@bazaarnepal.demo",
    role: "customer",
    phone: "9810001004",
    address: "Lagankhel",
    city: "Lalitpur",
  },
  {
    name: "Asha Poudel",
    email: "customer.asha@bazaarnepal.demo",
    role: "customer",
    phone: "9810001005",
    address: "Birauta",
    city: "Pokhara",
  },
  {
    name: "Dipesh Maharjan",
    email: "customer.dipesh@bazaarnepal.demo",
    role: "customer",
    phone: "9810001006",
    address: "Kumaripati",
    city: "Lalitpur",
  },
  {
    name: "Kiran Joshi",
    email: "customer.kiran@bazaarnepal.demo",
    role: "customer",
    phone: "9810001007",
    address: "Dhangadhi Main Road",
    city: "Dhangadhi",
  },
  {
    name: "Maya Khadka",
    email: "customer.demo@bazaarnepal.demo",
    role: "customer",
    phone: "9810001008",
    address: "Balaju",
    city: "Kathmandu",
  },
];

const productSeeds = [
  ["TechMart Nepal", "Redmi Note 13 5G", "Electronics", 32999, 36999, 18, true, ["smartphone", "5g", "xiaomi"], "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=900&q=80", "A reliable 5G smartphone with smooth display, long battery life, and strong everyday performance."],
  ["TechMart Nepal", "Samsung Galaxy A15", "Electronics", 27999, 30999, 14, true, ["smartphone", "samsung", "android"], "https://images.unsplash.com/photo-1610945415295-d9bbf067e59c?auto=format&fit=crop&w=900&q=80", "Slim Android phone with a bright display, capable cameras, and dependable storage for daily use."],
  ["TechMart Nepal", "Anker 20,000mAh Power Bank", "Electronics", 4999, 5999, 35, false, ["power bank", "charging", "travel"], "https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?auto=format&fit=crop&w=900&q=80", "High-capacity portable charger for phones, earbuds, and travel essentials."],
  ["TechMart Nepal", "Sony Wireless Headphones", "Electronics", 11999, 13999, 22, true, ["audio", "wireless", "headphones"], "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80", "Comfortable over-ear headphones with rich sound and long listening time."],
  ["TechMart Nepal", "Logitech Wireless Keyboard Mouse Combo", "Electronics", 3499, 4299, 28, false, ["keyboard", "mouse", "office"], "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80", "Compact wireless keyboard and mouse set for office, study, and home desktops."],
  ["TechMart Nepal", "Mi Smart Band", "Electronics", 5499, 6499, 30, false, ["fitness tracker", "wearable", "bluetooth"], "https://images.unsplash.com/photo-1575311373937-040b8e1fd5b6?auto=format&fit=crop&w=900&q=80", "Lightweight fitness band with heart-rate tracking, sleep insights, and phone notifications."],
  ["TechMart Nepal", "TP-Link Dual Band WiFi Router", "Electronics", 4299, 4999, 19, false, ["router", "wifi", "networking"], "https://images.unsplash.com/photo-1606904825846-647eb07f5be2?auto=format&fit=crop&w=900&q=80", "Dual-band router for stable streaming, browsing, and work-from-home connectivity."],
  ["TechMart Nepal", "USB-C Fast Charger 30W", "Electronics", 1899, 2499, 42, false, ["charger", "usb-c", "fast charging"], "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?auto=format&fit=crop&w=900&q=80", "Compact fast charger compatible with modern Android phones, tablets, and accessories."],

  ["Kathmandu Fashion Hub", "Dhaka Pattern Casual Shirt", "Fashion", 2199, 2899, 24, true, ["dhaka", "shirt", "menswear"], "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?auto=format&fit=crop&w=900&q=80", "Soft cotton casual shirt with Dhaka-inspired detailing for smart everyday wear."],
  ["Kathmandu Fashion Hub", "Women's Pashmina Shawl", "Fashion", 3499, 4499, 17, true, ["pashmina", "shawl", "winter"], "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?auto=format&fit=crop&w=900&q=80", "Warm, elegant shawl with a soft hand feel for festive and formal outfits."],
  ["Kathmandu Fashion Hub", "Canvas Sneakers", "Fashion", 2999, 3599, 31, false, ["sneakers", "casual", "footwear"], "https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=900&q=80", "Lightweight canvas sneakers designed for daily walking and casual outfits."],
  ["Kathmandu Fashion Hub", "Handwoven Wool Beanie", "Fashion", 899, 1199, 45, false, ["beanie", "wool", "winter"], "https://images.unsplash.com/photo-1576871337622-98d48d1cf531?auto=format&fit=crop&w=900&q=80", "Cozy handwoven winter beanie made by Nepali knitters."],
  ["Kathmandu Fashion Hub", "Cotton Kurta Set", "Fashion", 2699, 3299, 20, false, ["kurta", "cotton", "ethnic"], "https://images.unsplash.com/photo-1610030469983-98e550d6193c?auto=format&fit=crop&w=900&q=80", "Breathable cotton kurta set for casual gatherings, office wear, and festivals."],
  ["Kathmandu Fashion Hub", "Leather Everyday Wallet", "Fashion", 1499, 1999, 36, false, ["wallet", "leather", "accessory"], "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=900&q=80", "Slim leather wallet with organized card slots and a durable stitched finish."],
  ["Kathmandu Fashion Hub", "Trekking Windcheater Jacket", "Fashion", 4499, 5499, 16, true, ["jacket", "trekking", "outerwear"], "https://images.unsplash.com/photo-1544022613-e87ca75a784a?auto=format&fit=crop&w=900&q=80", "Light wind-resistant jacket suited for city commutes and weekend hikes."],
  ["Kathmandu Fashion Hub", "Traditional Dhaka Topi", "Fashion", 799, 999, 55, false, ["dhaka topi", "traditional", "gift"], "https://images.unsplash.com/photo-1549062572-544a64fb0c56?auto=format&fit=crop&w=900&q=80", "Classic Dhaka topi with a clean fit for cultural events and gifting."],

  ["Himalayan Foods", "Ilam Orthodox Tea 500g", "Food & Beverages", 899, 1099, 60, true, ["tea", "ilam", "orthodox"], "https://images.unsplash.com/photo-1564890369478-c89ca6d9cde9?auto=format&fit=crop&w=900&q=80", "Aromatic orthodox tea from Ilam with a bright cup and smooth finish."],
  ["Himalayan Foods", "Mustang Apple Cider Vinegar", "Food & Beverages", 649, 799, 40, false, ["vinegar", "mustang", "apple"], "https://images.unsplash.com/photo-1615484477778-ca3b77940c25?auto=format&fit=crop&w=900&q=80", "Naturally fermented apple cider vinegar made from Mustang apples."],
  ["Himalayan Foods", "Timur Sichuan Pepper 100g", "Food & Beverages", 399, 499, 75, false, ["spice", "timur", "nepali"], "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=900&q=80", "Fragrant Nepali timur spice for achar, soups, noodles, and marinades."],
  ["Himalayan Foods", "Wild Honey from Lamjung", "Food & Beverages", 1299, 1599, 28, true, ["honey", "natural", "lamjung"], "https://images.unsplash.com/photo-1587049352851-8d4e89133924?auto=format&fit=crop&w=900&q=80", "Rich wild honey collected from Lamjung foothills with a deep floral flavor."],
  ["Himalayan Foods", "Gundruk Fermented Greens", "Food & Beverages", 349, 449, 80, false, ["gundruk", "traditional", "pickle"], "https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=900&q=80", "Traditional fermented leafy greens for authentic Nepali soups and side dishes."],
  ["Himalayan Foods", "Homestyle Mixed Pickle", "Food & Beverages", 499, 649, 52, false, ["achar", "pickle", "spicy"], "https://images.unsplash.com/photo-1589135233689-f3d82c2cd709?auto=format&fit=crop&w=900&q=80", "Spicy mixed achar prepared with mustard oil, herbs, and Nepali spices."],
  ["Himalayan Foods", "Himalayan Pink Salt 1kg", "Food & Beverages", 299, 399, 90, false, ["salt", "himalayan", "pantry"], "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=900&q=80", "Mineral-rich pink salt for everyday cooking, seasoning, and finishing."],
  ["Himalayan Foods", "Nepali Coffee Beans 250g", "Food & Beverages", 799, 999, 38, false, ["coffee", "beans", "organic"], "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=900&q=80", "Freshly roasted Nepali coffee beans with balanced aroma and gentle acidity."],

  ["Nepal Fitness Store", "Adjustable Dumbbell Pair 20kg", "Sports & Fitness", 8499, 9999, 12, true, ["dumbbell", "home gym", "strength"], "https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80", "Space-saving adjustable dumbbells for strength training at home."],
  ["Nepal Fitness Store", "Premium Yoga Mat 6mm", "Sports & Fitness", 1899, 2499, 46, true, ["yoga", "mat", "fitness"], "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?auto=format&fit=crop&w=900&q=80", "Comfortable non-slip yoga mat for stretching, meditation, and studio sessions."],
  ["Nepal Fitness Store", "Resistance Band Set", "Sports & Fitness", 1299, 1699, 58, false, ["resistance bands", "workout", "portable"], "https://images.unsplash.com/photo-1598289431512-b97b0917affc?auto=format&fit=crop&w=900&q=80", "Portable resistance bands for warmups, rehab, and full-body workouts."],
  ["Nepal Fitness Store", "Hydration Running Belt", "Sports & Fitness", 1599, 1999, 27, false, ["running", "belt", "hydration"], "https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80", "Lightweight running belt with bottle holder and phone pocket."],
  ["Nepal Fitness Store", "Skipping Rope with Counter", "Sports & Fitness", 699, 899, 65, false, ["skipping rope", "cardio", "training"], "https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80", "Adjustable skipping rope with built-in counter for cardio sessions."],
  ["Nepal Fitness Store", "Trekking Pole Pair", "Sports & Fitness", 2499, 3299, 21, false, ["trekking", "poles", "outdoor"], "https://images.unsplash.com/photo-1551632811-561732d1e306?auto=format&fit=crop&w=900&q=80", "Light trekking poles with adjustable length and comfortable grips."],
  ["Nepal Fitness Store", "Kettlebell 12kg", "Sports & Fitness", 3799, 4599, 14, false, ["kettlebell", "strength", "home gym"], "https://images.unsplash.com/photo-1599058917212-d750089bc07e?auto=format&fit=crop&w=900&q=80", "Solid kettlebell for swings, squats, presses, and conditioning workouts."],
  ["Nepal Fitness Store", "Cycling Gloves", "Sports & Fitness", 999, 1299, 34, false, ["cycling", "gloves", "outdoor"], "https://images.unsplash.com/photo-1570995637497-f0f3a8077ffa?auto=format&fit=crop&w=900&q=80", "Padded cycling gloves for better grip and comfort on longer rides."],

  ["Himalayan Crafts", "Handmade Singing Bowl", "Art & Crafts", 3999, 4999, 25, true, ["singing bowl", "meditation", "handmade"], "https://images.unsplash.com/photo-1604480132736-44c188fe4d20?auto=format&fit=crop&w=900&q=80", "Handmade metal singing bowl with a clear tone for meditation and gifting."],
  ["Himalayan Crafts", "Lokta Paper Journal", "Art & Crafts", 699, 899, 70, false, ["lokta", "journal", "stationery"], "https://images.unsplash.com/photo-1517842645767-c639042777db?auto=format&fit=crop&w=900&q=80", "Eco-friendly journal made with traditional Nepali lokta paper."],
  ["Himalayan Crafts", "Thangka Art Print", "Art & Crafts", 2499, 3199, 18, true, ["thangka", "wall art", "print"], "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?auto=format&fit=crop&w=900&q=80", "Detailed thangka-inspired art print for homes, studios, and meditation corners."],
  ["Himalayan Crafts", "Felt Ball Garland", "Art & Crafts", 999, 1299, 44, false, ["felt", "decor", "handmade"], "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=900&q=80", "Colorful handmade felt garland for playful room decor and celebrations."],
  ["Himalayan Crafts", "Bamboo Incense Holder", "Art & Crafts", 499, 649, 63, false, ["incense", "bamboo", "decor"], "https://images.unsplash.com/photo-1602910344008-22f323cc1817?auto=format&fit=crop&w=900&q=80", "Minimal bamboo incense holder for daily rituals and calm spaces."],
  ["Himalayan Crafts", "Handwoven Hemp Backpack", "Art & Crafts", 3299, 3999, 15, true, ["hemp", "backpack", "handwoven"], "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80", "Durable handwoven hemp backpack with practical pockets and Nepali character."],
  ["Himalayan Crafts", "Wooden Prayer Wheel", "Art & Crafts", 1899, 2499, 20, false, ["prayer wheel", "wood", "gift"], "https://images.unsplash.com/photo-1518709268805-4e9042af2176?auto=format&fit=crop&w=900&q=80", "Decorative wooden prayer wheel crafted for meaningful gifting and display."],
  ["Himalayan Crafts", "Ceramic Tea Cup Set", "Art & Crafts", 1599, 1999, 32, false, ["ceramic", "tea cup", "handmade"], "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?auto=format&fit=crop&w=900&q=80", "Hand-finished ceramic cup set for tea, coffee, and slow mornings."],
];

const promoSeeds = [
  ["TechMart Nepal", "TECH10", "percentage", 10, 5000, 100, 12, 45, true, "10% off selected electronics above Rs. 5,000"],
  ["TechMart Nepal", "GADGET500", "fixed", 500, 3000, 80, 2, 30, true, "Flat Rs. 500 off useful gadget orders"],
  ["Kathmandu Fashion Hub", "FASHION15", "percentage", 15, 2500, 120, 9, 60, true, "Festive fashion discount on eligible orders"],
  ["Kathmandu Fashion Hub", "WINTER300", "fixed", 300, 1500, 70, 0, -10, false, "Expired winter wardrobe campaign"],
  ["Himalayan Foods", "FOODFEST", "percentage", 12, 1200, 90, 6, 35, true, "Pantry savings on tea, honey, spices, and pickles"],
  ["Himalayan Foods", "TEA200", "fixed", 200, 800, 60, 4, 25, true, "Flat tea and coffee basket discount"],
  ["Nepal Fitness Store", "FITNESS8", "percentage", 8, 2000, 75, 5, 50, true, "Workout essentials discount"],
  ["Himalayan Crafts", "CRAFT250", "fixed", 250, 1000, 65, 7, 40, true, "Handmade gift discount"],
];

const orderBlueprints = [
  [0, "delivered", "paid", "TECH10", [[0, 1], [2, 1]], 32],
  [1, "delivered", "paid", "FASHION15", [[8, 1], [10, 1]], 30],
  [2, "delivered", "paid", "FOODFEST", [[16, 2], [19, 1]], 28],
  [3, "delivered", "paid", "FITNESS8", [[24, 1], [26, 1]], 26],
  [4, "delivered", "paid", "CRAFT250", [[32, 1], [33, 2]], 24],
  [5, "delivered", "paid", null, [[9, 1], [13, 1]], 22],
  [6, "delivered", "paid", "TEA200", [[16, 1], [23, 1]], 20],
  [7, "delivered", "paid", null, [[3, 1], [7, 2]], 18],
  [0, "delivered", "paid", "CRAFT250", [[37, 1], [39, 1]], 16],
  [1, "delivered", "paid", null, [[25, 1], [28, 1]], 14],
  [2, "shipped", "paid", "GADGET500", [[1, 1], [4, 1]], 12],
  [3, "shipped", "paid", null, [[14, 1], [15, 1]], 10],
  [4, "shipped", "pending", "FITNESS8", [[30, 1], [31, 1]], 9],
  [5, "confirmed", "paid", "FOODFEST", [[17, 1], [21, 2]], 8],
  [6, "confirmed", "pending", null, [[35, 1], [36, 1]], 7],
  [7, "confirmed", "paid", "FASHION15", [[11, 2], [12, 1]], 6],
  [0, "processing", "pending", null, [[5, 1], [6, 1]], 5],
  [1, "processing", "pending", "TECH10", [[0, 1], [7, 1]], 4],
  [2, "processing", "paid", null, [[18, 3], [22, 1]], 4],
  [3, "processing", "pending", "CRAFT250", [[34, 1], [38, 1]], 3],
  [4, "cancelled", "pending", null, [[27, 1], [29, 1]], 13],
  [5, "cancelled", "paid", "FASHION15", [[8, 1], [15, 1]], 11],
  [6, "cancelled", "pending", null, [[20, 2], [21, 1]], 10],
  [7, "delivered", "paid", "TECH10", [[1, 1], [2, 1], [4, 1]], 21],
  [3, "delivered", "paid", null, [[32, 1], [24, 1]], 19],
];

const reviewComments = [
  [5, "Excellent quality and exactly as described. Delivery was smooth and packaging felt premium."],
  [4, "Very useful product for the price. I would happily order from this seller again."],
  [5, "Loved the finish and overall value. It feels reliable for regular use."],
  [4, "Good product and fast service. A little more packaging protection would make it perfect."],
  [3, "The product works, but the color and finishing were slightly different from the photo."],
  [5, "Great local marketplace experience. The item arrived clean, fresh, and well packed."],
  [4, "Solid purchase. Quality is better than many similar items I have tried before."],
  [2, "Usable, but delivery took longer than expected and the item felt smaller than I imagined."],
  [5, "Bought this as a gift and it was appreciated immediately. Beautiful presentation."],
  [4, "Good value in this price range. The seller answered my questions quickly."],
];

const daysFromNow = (days) => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date;
};

const daysAgo = (days) => daysFromNow(-days);

const buildShippingAddress = (customer) => ({
  fullName: customer.name,
  phone: customer.phone,
  address: customer.address,
  city: customer.city,
  postalCode: "44600",
});

const calculateDiscount = (subtotal, promo) => {
  if (!promo || !promo.active || promo.expiryDate < new Date()) return 0;
  if (subtotal < promo.minOrderAmount) return 0;

  const discount =
    promo.type === "percentage"
      ? Math.round((subtotal * promo.discount) / 100)
      : promo.discount;

  return Math.min(discount, subtotal);
};

const clearDemoData = async () => {
  const demoEmails = [...sellerSeeds, ...customerSeeds].map((user) => user.email);
  const demoCodes = promoSeeds.map((promo) => promo[1]);
  const existingDemoUsers = await User.find({
    email: { $in: demoEmails },
  }).select("_id role");

  const existingDemoUserIds = existingDemoUsers.map((user) => user._id);
  const existingDemoSellerIds = existingDemoUsers
    .filter((user) => user.role === "seller")
    .map((user) => user._id);
  const existingDemoCustomerIds = existingDemoUsers
    .filter((user) => user.role === "customer")
    .map((user) => user._id);

  if (existingDemoUserIds.length > 0) {
    await Order.deleteMany({
      $or: [
        { customer: { $in: existingDemoCustomerIds } },
        { "items.seller": { $in: existingDemoSellerIds } },
      ],
    });

    await Product.deleteMany({
      seller: { $in: existingDemoSellerIds },
    });

    await PromoCode.deleteMany({
      $or: [
        { seller: { $in: existingDemoSellerIds } },
        { code: { $in: demoCodes } },
      ],
    });

    await User.deleteMany({
      _id: { $in: existingDemoUserIds },
    });
  } else {
    await PromoCode.deleteMany({
      code: { $in: demoCodes },
    });
  }
};

const seedUsers = async () => {
  const password = await bcrypt.hash(DEMO_PASSWORD, 10);
  const users = [...sellerSeeds, ...customerSeeds].map((user) => ({
    ...user,
    password,
  }));

  const createdUsers = await User.insertMany(users);
  const sellerMap = new Map();
  const customers = [];

  createdUsers.forEach((user) => {
    if (user.role === "seller") {
      sellerMap.set(user.shopName, user);
    } else {
      customers.push(user);
    }
  });

  return { sellerMap, customers };
};

const seedProducts = async (sellerMap) => {
  const products = productSeeds.map((product) => {
    const [
      sellerName,
      name,
      category,
      price,
      originalPrice,
      stock,
      featured,
      tags,
      image,
      description,
    ] = product;

    return {
      seller: sellerMap.get(sellerName)._id,
      name,
      description,
      category,
      price,
      originalPrice,
      stock,
      image,
      tags,
      reviewsList: [],
      rating: 0,
      reviews: 0,
      featured,
    };
  });

  return Product.insertMany(products);
};

const seedPromoCodes = async (sellerMap) => {
  const promos = promoSeeds.map((promo) => {
    const [
      sellerName,
      code,
      type,
      discount,
      minOrderAmount,
      maxUses,
      usedCount,
      expiryOffsetDays,
      active,
      description,
    ] = promo;

    return {
      seller: sellerMap.get(sellerName)._id,
      code,
      type,
      discount,
      minOrderAmount,
      maxUses,
      usedCount,
      expiryDate: daysFromNow(expiryOffsetDays),
      active,
      description,
    };
  });

  const createdPromos = await PromoCode.insertMany(promos);
  return new Map(createdPromos.map((promo) => [promo.code, promo]));
};

const seedOrders = async (customers, products, promoMap) => {
  const promoUsage = new Map();
  const orders = orderBlueprints.map((blueprint) => {
    const [customerIndex, status, paymentStatus, promoCode, items, ageDays] = blueprint;
    const customer = customers[customerIndex];
    const orderItems = items.map(([productIndex, quantity]) => ({
      product: products[productIndex]._id,
      seller: products[productIndex].seller,
      quantity,
      price: products[productIndex].price,
    }));
    const subtotal = orderItems.reduce(
      (sum, item) => sum + item.price * item.quantity,
      0
    );
    const promo = promoCode ? promoMap.get(promoCode) : null;
    const discount = calculateDiscount(subtotal, promo);
    const validatedPromoCode = discount > 0 ? promoCode : null;
    const createdAt = daysAgo(ageDays);

    if (validatedPromoCode) {
      promoUsage.set(validatedPromoCode, (promoUsage.get(validatedPromoCode) || 0) + 1);
    }

    return {
      customer: customer._id,
      items: orderItems,
      shippingAddress: buildShippingAddress(customer),
      subtotal,
      discount,
      promoCode: validatedPromoCode,
      total: subtotal - discount,
      paymentMethod: "eSewa",
      paymentStatus,
      status,
      createdAt,
      updatedAt: createdAt,
    };
  });

  const createdOrders = await Order.insertMany(orders);

  await Promise.all(
    [...promoUsage.entries()].map(([code, usedBySeed]) =>
      PromoCode.updateOne(
        { code },
        { $inc: { usedCount: usedBySeed } }
      )
    )
  );

  return createdOrders;
};

const addReviewsFromDeliveredOrders = async (orders, productMap, customerMap) => {
  const reviewedPairs = new Set();
  let reviewCursor = 0;
  let deliveredItemCursor = 0;

  for (const order of orders.filter((order) => order.status === "delivered")) {
    for (const item of order.items) {
      const productId = item.product.toString();
      const customerId = order.customer.toString();
      const reviewKey = `${customerId}:${productId}`;
      const shouldSkipReview = deliveredItemCursor % 5 === 4;

      deliveredItemCursor += 1;

      if (reviewedPairs.has(reviewKey)) continue;
      if (shouldSkipReview) continue;

      reviewedPairs.add(reviewKey);

      const product = productMap.get(productId);
      const customer = customerMap.get(customerId);
      const [rating, comment] = reviewComments[reviewCursor % reviewComments.length];

      product.reviewsList.push({
        user: order.customer,
        name: customer.name,
        rating,
        comment,
        verifiedPurchase: true,
      });

      reviewCursor += 1;
    }
  }

  const updatedProducts = [];

  for (const product of productMap.values()) {
    product.reviews = product.reviewsList.length;
    product.rating =
      product.reviews > 0
        ? product.reviewsList.reduce((sum, review) => sum + review.rating, 0) /
          product.reviews
        : 0;

    if (product.reviews > 0) {
      await product.save();
      updatedProducts.push(product);
    }
  }

  return updatedProducts.reduce((count, product) => count + product.reviews, 0);
};

const seedDatabase = async () => {
  await connectDB();

  try {
    console.log("[seed] Clearing existing BazaarNepal demo data...");
    await clearDemoData();

    console.log("[seed] Creating demo sellers and customers...");
    const { sellerMap, customers } = await seedUsers();

    console.log("[seed] Creating demo products...");
    const products = await seedProducts(sellerMap);

    console.log("[seed] Creating demo promo codes...");
    const promoMap = await seedPromoCodes(sellerMap);

    console.log("[seed] Creating demo orders...");
    const orders = await seedOrders(customers, products, promoMap);

    console.log("[seed] Creating verified reviews from delivered orders...");
    const productMap = new Map(products.map((product) => [product._id.toString(), product]));
    const customerMap = new Map(customers.map((customer) => [customer._id.toString(), customer]));
    const reviewCount = await addReviewsFromDeliveredOrders(
      orders,
      productMap,
      customerMap
    );

    console.log("");
    console.log("[seed] BazaarNepal demo seed complete");
    console.log(`   Sellers: ${sellerSeeds.length}`);
    console.log(`   Customers: ${customerSeeds.length}`);
    console.log(`   Products: ${products.length}`);
    console.log(`   Promo codes: ${promoSeeds.length}`);
    console.log(`   Orders: ${orders.length}`);
    console.log(`   Reviews: ${reviewCount}`);
    console.log("");
    console.log("Demo login:");
    console.log("   Customer: customer.demo@bazaarnepal.demo");
    console.log(`   Password: ${DEMO_PASSWORD}`);
  } finally {
    await mongoose.disconnect();
    console.log("[seed] MongoDB disconnected");
  }
};

seedDatabase().catch(async (error) => {
  console.error("[seed] BazaarNepal demo seed failed");
  console.error(error);
  await mongoose.disconnect();
  process.exit(1);
});
