import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";
dotenv.config();

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedCatalog() {
  console.log("Checking current catalog...");
  const { data: existingProducts } = await supabase.from("products").select("id, name");
  if (existingProducts && existingProducts.length > 0) {
    console.log(`Found ${existingProducts.length} existing products in catalog. Skipping seed.`);
    return;
  }

  console.log("Seeding authentic tea categories...");
  const categories = [
    {
      name: "Black Teas",
      slug: "black-teas",
      description_html: "<p>Robust, full-bodied single-origin orthodox and CTC black teas from Assam, Darjeeling, and the Nilgiris.</p>",
      display_order: 1,
      is_active: true,
      seo_title: "Single-Origin Black Teas | Pure Pour Co.",
      seo_description: "Shop high grown orthodox black teas and hearty morning CTC chai blends from India's premier tea gardens.",
    },
    {
      name: "Chai & Spice Blends",
      slug: "chai-and-spices",
      description_html: "<p>Traditional Indian spiced teas crafted with pure whole spices like Green Cardamom, Ginger, Clove, and Cinnamon.</p>",
      display_order: 2,
      is_active: true,
      seo_title: "Masala Chai & Spiced Teas | Pure Pour Co.",
      seo_description: "Handcrafted Indian masala chais, Kashmiri Kahwa and herbal infusions with freshly ground spices.",
    },
    {
      name: "Green & White Teas",
      slug: "green-and-white-teas",
      description_html: "<p>Delicate, antioxidant-rich whole leaf green and white teas carefully plucked during seasonal spring flushes.</p>",
      display_order: 3,
      is_active: true,
      seo_title: "Green & White Teas | Pure Pour Co.",
      seo_description: "Subtle floral green teas, moon-plucked white teas, and refreshing herbal infusions.",
    },
  ];

  const { data: insertedCategories, error: catError } = await supabase
    .from("categories")
    .upsert(categories, { onConflict: "slug" })
    .select();

  if (catError) {
    console.error("Error creating categories:", catError);
    return;
  }

  const catMap = Object.fromEntries(insertedCategories.map((c) => [c.slug, c.id]));

  console.log("Seeding ingredients...");
  const ingredients = [
    {
      name: "Assam Orthodox Tea Leaves",
      slug: "assam-orthodox-tea",
      short_description: "Tippy golden whole leaf orthodox black tea offering a rich malty liquor.",
    },
    {
      name: "Green Cardamom (Elaichi)",
      slug: "green-cardamom",
      short_description: "Fragrant, handpicked green cardamom pods bursting with sweet citrusy warmth.",
    },
    {
      name: "Kashmiri Saffron",
      slug: "kashmiri-saffron",
      short_description: "Mongra grade crimson saffron threads imparting a majestic golden hue and royal aroma.",
    },
    {
      name: "Sun-Dried Ginger",
      slug: "sun-dried-ginger",
      short_description: "Zesty, warming dried ginger root with a clean, peppery bite.",
    },
  ];

  const { data: insertedIngredients, error: ingError } = await supabase
    .from("ingredients")
    .upsert(ingredients, { onConflict: "slug" })
    .select();

  if (ingError) console.error("Error inserting ingredients:", ingError);

  const ingMap = Object.fromEntries((insertedIngredients || []).map((i) => [i.slug, i.id]));

  console.log("Seeding tea products...");
  const productDefs = [
    {
      product: {
        name: "Assam Golden CTC Breakfast Tea",
        slug: "assam-golden-ctc-breakfast-tea",
        sku: "TEA-ASM-CTC-250",
        category_id: catMap["black-teas"],
        regular_price: 349,
        sale_price: 299,
        net_quantity: "250g",
        stock_quantity: 45,
        low_stock_threshold: 10,
        tax_rate: 5,
        hsn_code: "0902",
        weight_grams: 280,
        short_description: "Robust, malty Assam CTC tea with golden specks, blended specifically for a rich, amber milk chai.",
        description_html: "<p>Harvested from the lush valleys of Upper Assam, this CTC tea delivers unmatched briskness and deep copper infusion. Designed for daily morning kadak chai, it holds up effortlessly against full-cream milk and brown sugar.</p><h3>Tasting Notes</h3><p>Malt, toasted caramel, and rich amber warmth with a brisk, invigorating mouthfeel.</p>",
        featured_image_url: "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        status: "active",
        is_featured: true,
        seo_title: "Assam Golden CTC Kadak Breakfast Tea (250g) | Pure Pour Co.",
        seo_description: "Buy single-estate Assam CTC black tea online. Malty, strong and aromatic — perfect for traditional Indian milk chai.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=800&q=80",
        "https://images.unsplash.com/photo-1594631252845-29fc4cc8cde9?auto=format&fit=crop&w=800&q=80",
      ],
      features: [
        { title: "Origin", description: "Dibrugarh, Upper Assam" },
        { title: "Harvest", description: "Second Flush 2026" },
        { title: "Best Paired With", description: "Whole Milk & Jaggery / Sugar" },
        { title: "Caffeine", description: "High (Morning Kadak)" },
      ],
      ingredients: ["assam-orthodox-tea"],
    },
    {
      product: {
        name: "Royal Kashmiri Kahwa Green Tea",
        slug: "royal-kashmiri-kahwa-green-tea",
        sku: "TEA-KHW-100",
        category_id: catMap["chai-and-spices"],
        regular_price: 499,
        sale_price: 449,
        net_quantity: "100g",
        stock_quantity: 30,
        low_stock_threshold: 8,
        tax_rate: 5,
        hsn_code: "0902",
        weight_grams: 140,
        short_description: "Traditional Himalayan green tea blended with whole green cardamom, cinnamon quills, almond flakes, and pure Kashmiri saffron.",
        description_html: "<p>A timeless royal brew from the Kashmir valley. Delicate whole green tea leaves are married with aromatic Idukki cardamom, slivered almonds, and genuine Mongra saffron from Pampore. Brews a delicate golden liquor that warms the soul.</p>",
        featured_image_url: "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
        status: "active",
        is_featured: true,
        seo_title: "Royal Kashmiri Saffron Kahwa Tea (100g) | Pure Pour Co.",
        seo_description: "Authentic Kashmiri Kahwa green tea blended with Pampore saffron, cardamom, and toasted almond slivers.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1597481499750-3e6b22637e12?auto=format&fit=crop&w=800&q=80",
      ],
      features: [
        { title: "Origin", description: "Kashmir Valley, India" },
        { title: "Aroma", description: "Saffron, Sweet Spice & Floral" },
        { title: "Brewing Style", description: "Steep without milk, sweeten with honey" },
      ],
      ingredients: ["kashmiri-saffron", "green-cardamom"],
    },
    {
      product: {
        name: "Darjeeling First Flush Wonder Orthodox",
        slug: "darjeeling-first-flush-wonder-orthodox",
        sku: "TEA-DAR-FF-100",
        category_id: catMap["black-teas"],
        regular_price: 699,
        sale_price: 649,
        net_quantity: "100g",
        stock_quantity: 18,
        low_stock_threshold: 5,
        tax_rate: 5,
        hsn_code: "0902",
        weight_grams: 130,
        short_description: "Spring-plucked Himalayan Champagne of Teas. Bright, floral muscatel aroma with pristine lingering freshness.",
        description_html: "<p>Sourced from high-altitude misty slopes overlooking Mount Kanchenjunga. Plucked in early spring when the tender two leaves and a bud wake from winter dormancy. Delivers an ethereal pale golden cup with nuanced notes of raw peach and wild spring blossoms.</p>",
        featured_image_url: "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=80",
        status: "active",
        is_featured: true,
        seo_title: "Darjeeling First Flush Orthodox Black Tea (100g) | Pure Pour Co.",
        seo_description: "Pure Darjeeling First Flush tea, celebrated worldwide as the Champagne of teas for its delicate floral muscatel notes.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1563911892437-1feda0179e1b?auto=format&fit=crop&w=800&q=80",
      ],
      features: [
        { title: "Estate Elevation", description: "5,800 ft above sea level" },
        { title: "Flush", description: "First Flush (Spring 2026)" },
        { title: "Tasting Profile", description: "Floral Muscatel, Spring Peach" },
      ],
      ingredients: ["assam-orthodox-tea"],
    },
    {
      product: {
        name: "Artisan Idukki Cardamom Masala Chai",
        slug: "artisan-idukki-cardamom-masala-chai",
        sku: "TEA-MSL-CRD-250",
        category_id: catMap["chai-and-spices"],
        regular_price: 399,
        sale_price: 349,
        net_quantity: "250g",
        stock_quantity: 50,
        low_stock_threshold: 12,
        tax_rate: 5,
        hsn_code: "0902",
        weight_grams: 280,
        short_description: "Rich Assam black tea generously infused with freshly crushed green cardamom and dry ginger for the ultimate evening respite.",
        description_html: "<p>Nothing matches the comforting ritual of fresh Elaichi chai. We blend heavy-bodied Assam orthodox and CTC grains with freshly cracked cardamom pods directly from Kerala spice hills. Every sip is naturally fragrant, soothing, and sweet.</p>",
        featured_image_url: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
        status: "active",
        is_featured: true,
        seo_title: "Artisan Cardamom Masala Chai (250g) | Pure Pour Co.",
        seo_description: "Authentic Elaichi Masala Chai made with freshly crushed green cardamom and bold Assam black tea.",
      },
      gallery: [
        "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=800&q=80",
      ],
      features: [
        { title: "Spice Blend", description: "Idukki Green Cardamom & Kerala Dry Ginger" },
        { title: "Best Enjoyed", description: "Evening tea with light snacks" },
        { title: "Steep Time", description: "3-4 minutes boiling with milk" },
      ],
      ingredients: ["green-cardamom", "sun-dried-ginger"],
    },
  ];

  for (const def of productDefs) {
    const { data: createdProd, error: pErr } = await supabase
      .from("products")
      .upsert(def.product, { onConflict: "slug" })
      .select()
      .single();

    if (pErr) {
      console.error(`Error creating product ${def.product.name}:`, pErr);
      continue;
    }

    console.log(`✓ Product created: ${createdProd.name} (SKU: ${createdProd.sku})`);

    // Insert gallery images
    if (def.gallery && def.gallery.length > 0) {
      const imgRows = def.gallery.map((url, i) => ({
        product_id: createdProd.id,
        url,
        display_order: i,
        alt_text: `${createdProd.name} - view ${i + 1}`,
      }));
      await supabase.from("product_images").insert(imgRows);
    }

    // Insert features
    if (def.features && def.features.length > 0) {
      const featRows = def.features.map((f, i) => ({
        product_id: createdProd.id,
        title: f.title,
        description: f.description,
        display_order: i,
      }));
      await supabase.from("product_features").insert(featRows);
    }

    // Insert Product FAQs
    await supabase.from("product_faqs").insert([
      {
        product_id: createdProd.id,
        question: "How long will this tea stay fresh after opening?",
        answer: "When kept in an airtight, opaque container away from moisture and direct sunlight, our teas retain peak aroma for up to 9-12 months.",
        display_order: 1,
      },
      {
        product_id: createdProd.id,
        question: "What is the recommended brewing temperature?",
        answer: "For black and spiced chais, bring fresh filtered water to a full rolling boil (100°C). For green teas, steep at 80-85°C.",
        display_order: 2,
      },
    ]);

    // Insert Approved Reviews
    await supabase.from("product_reviews").insert([
      {
        product_id: createdProd.id,
        customer_name: "Aditya Verma",
        customer_email: "aditya@example.com",
        rating: 5,
        title: "Remarkable aroma and depth of flavor!",
        comment: "This has become our family's morning staple. Exceptional quality compared to regular commercial store-bought brands.",
        is_verified_buyer: true,
        status: "approved",
      },
      {
        product_id: createdProd.id,
        customer_name: "Sneha Nair",
        customer_email: "sneha@example.com",
        rating: 5,
        title: "Clean, fresh, and authentically sourced",
        comment: "You can immediately notice the difference in leaf quality. Perfectly balanced without any artificial bitterness.",
        is_verified_buyer: true,
        status: "approved",
      },
    ]);

    // Link Ingredients
    if (def.ingredients && def.ingredients.length > 0) {
      const ingRows = def.ingredients
        .map((slug, i) => {
          const ingId = ingMap[slug];
          return ingId ? { product_id: createdProd.id, ingredient_id: ingId, display_order: i } : null;
        })
        .filter(Boolean);

      if (ingRows.length > 0) {
        await supabase.from("product_ingredients").insert(ingRows);
      }
    }
  }

  console.log("Tea catalog successfully seeded!");
}

seedCatalog().catch(console.error);
