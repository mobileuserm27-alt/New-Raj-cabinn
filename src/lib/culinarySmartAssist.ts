// Smart Culinary Assistant & Image Optimization for Raj Cabin Menu

export interface SmartDishSuggestion {
  hindiName: string;
  description: string;
  dietType: 'veg' | 'non_veg' | 'egg' | 'vegan';
  spiceLevel: 'none' | 'mild' | 'medium' | 'spicy' | 'extra_spicy';
  categoryKeyword?: string;
  suggestedPrepTime?: number;
}

// Comprehensive culinary database for Indian, Indo-Chinese, Tandoori, Mughlai & Continental dishes
const DISH_DATABASE: Record<string, Partial<SmartDishSuggestion>> = {
  // Biryani & Rice
  'chicken biryani': {
    hindiName: 'चिकन बिरयानी',
    description: 'Fragrant long-grain Basmati rice layered with tender spiced chicken, saffron, and caramelised onions, slow-cooked in traditional dum style.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'biryani',
    suggestedPrepTime: 20
  },
  'mutton biryani': {
    hindiName: 'मटन बिरयानी',
    description: 'Slow-cooked royal dum biryani with succulent bone-in mutton pieces, fragrant basmati rice, aromatic spices, and royal saffron infusion.',
    dietType: 'non_veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'biryani',
    suggestedPrepTime: 25
  },
  'veg biryani': {
    hindiName: 'वेज दम बिरयानी',
    description: 'Medley of fresh garden vegetables, paneer cubes, and long-grain basmati rice delicately spiced and infused with rose water and kewra.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'biryani',
    suggestedPrepTime: 15
  },
  'paneer biryani': {
    hindiName: 'पनीर बिरयानी',
    description: 'Marinated soft malai paneer cubes slow-cooked with aromatic basmati rice, herbs, and toasted nuts in authentic Lucknowi style.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'biryani',
    suggestedPrepTime: 15
  },
  'egg biryani': {
    hindiName: 'अंडा बिरयानी',
    description: 'Boiled and shallow-fried farm fresh eggs tossed in roasted masala and layered with aromatic dum basmati rice.',
    dietType: 'egg',
    spiceLevel: 'medium',
    categoryKeyword: 'biryani',
    suggestedPrepTime: 15
  },
  'jeera rice': {
    hindiName: 'जीरा राइस',
    description: 'Fluffy aged basmati rice tempered with premium cumin seeds, pure desi ghee, and fresh coriander leaves.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'rice',
    suggestedPrepTime: 10
  },
  'steamed basmati rice': {
    hindiName: 'सादा बासमती चावल',
    description: 'Aged aromatic Indian basmati rice steamed to fluffy perfection, ideal pairing with curries and dals.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'rice',
    suggestedPrepTime: 10
  },

  // Main Course - Vegetarian
  'paneer butter masala': {
    hindiName: 'पनीर बटर मसाला',
    description: 'Soft cottage cheese cubes simmered in a velvety, rich tomato and cashew gravy, finished with fresh butter and kasuri methi.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'kadai paneer': {
    hindiName: 'कड़ाही पनीर',
    description: 'Fresh cottage cheese tossed with crunchy bell peppers, onions, and freshly pounded coriander and red chilli kadai spices.',
    dietType: 'veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'shahi paneer': {
    hindiName: 'शाही पनीर',
    description: 'Royal mughlai delicacy of fresh paneer in a luxurious white cashew, almond, and cardamom infused cream gravy.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'palak paneer': {
    hindiName: 'पालक पनीर',
    description: 'Wholesome fresh spinach puree tempered with garlic, ginger, and cumin, loaded with tender cottage cheese cubes.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'dal makhani': {
    hindiName: 'दाल मखनी',
    description: 'Authentic Punjabi black lentils and kidney beans slow-cooked overnight on charcoal, infused with butter and rich dairy cream.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'dal tadka': {
    hindiName: 'दाल तड़का',
    description: 'Yellow arhar lentils cooked to perfection, tempered with desi ghee, burnt garlic, cumin seeds, and dry red chillies.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 12
  },
  'malai kofta': {
    hindiName: 'मलाई कोफ्ता',
    description: 'Melt-in-mouth cottage cheese and mawa dumplings stuffed with dry fruits, served in a rich creamy cashew saffron gravy.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'main',
    suggestedPrepTime: 20
  },
  'mix veg': {
    hindiName: 'मिक्स वेज',
    description: 'Seasonal farm-fresh vegetables tossed with cottage cheese and spices in a luscious onion-tomato masala.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'mushroom masala': {
    hindiName: 'मशरूम मसाला',
    description: 'Plump button mushrooms tossed with diced onions and capsicum in a robust spiced semi-dry gravy.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },

  // Main Course - Non-Vegetarian
  'butter chicken': {
    hindiName: 'बटर चिकन (मुर्ग मखनी)',
    description: 'Smoky tandoor-roasted chicken tikka simmered in a silky tomato, cashew cream sauce enriched with fenugreek and butter.',
    dietType: 'non_veg',
    spiceLevel: 'mild',
    categoryKeyword: 'main',
    suggestedPrepTime: 18
  },
  'chicken tikka masala': {
    hindiName: 'चिकन टिक्का मसाला',
    description: 'Succulent pieces of tandoor-grilled chicken cooked in a rich, chunky onion-tomato gravy with bell peppers and whole spices.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 18
  },
  'kadai chicken': {
    hindiName: 'कड़ाही चिकन',
    description: 'Juicy chicken cooked with crushed whole spices, bell peppers, onions, and ripe tomatoes in a traditional iron wok.',
    dietType: 'non_veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'main',
    suggestedPrepTime: 18
  },
  'chicken curry': {
    hindiName: 'देसी चिकन करी',
    description: 'Homestyle tender chicken cooked in a slow-simmered onion, ginger, garlic, and freshly ground garam masala curry.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'mutton rogan josh': {
    hindiName: 'मटन रोगन जोश',
    description: 'Signature Kashmiri delicacy of tender lamb cooked with ratanjot, Kashmiri chillies, whole spices, and fennel essence.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 22
  },
  'mutton kasha': {
    hindiName: 'कोलकाता मटन कशा',
    description: 'Traditional slow-braised tender mutton in a dark, thick, spicy caramelized onion and garlic gravy.',
    dietType: 'non_veg',
    spiceLevel: 'extra_spicy',
    categoryKeyword: 'main',
    suggestedPrepTime: 25
  },
  'fish curry': {
    hindiName: 'बंगाली फिश करी',
    description: 'Fresh local river fish steak simmered in a light, fragrant mustard or onion-tomato sauce with green chillies.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },
  'prawns masala': {
    hindiName: 'झींगा मसाला',
    description: 'Juicy tiger prawns tossed in a tangy coconut and roasted onion masala with curry leaves.',
    dietType: 'non_veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'main',
    suggestedPrepTime: 15
  },

  // Starters & Tandoor
  'chicken tikka': {
    hindiName: 'चिकन टिक्का',
    description: 'Boneless tender chicken morsels marinated in spiced hung curd, kashmiri chilli, and mustard oil, grilled in clay tandoor.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 15
  },
  'tandoori chicken': {
    hindiName: 'तंदूरी चिकन',
    description: 'Classic whole bone-in chicken marinated in yoghurt and aromatic spices, roasted over red-hot charcoal embers.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 20
  },
  'paneer tikka': {
    hindiName: 'पनीर टिक्का',
    description: 'Chunky cottage cheese cubes and bell peppers marinated in spiced mustard yoghurt marinade, grilled to golden smoky perfection.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 15
  },
  'fish fry': {
    hindiName: 'कोलकाता फिश फ्राई',
    description: 'Crispy panko-crusted fresh Bhetki fish fillet marinated in fresh coriander and green chillies, served with Kasundi mustard.',
    dietType: 'non_veg',
    spiceLevel: 'mild',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },
  'chicken 65': {
    hindiName: 'चिकन 65',
    description: 'Crispy deep-fried spicy chicken bites tossed with fresh curry leaves, green chillies, and crushed black pepper.',
    dietType: 'non_veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },
  'chilli chicken': {
    hindiName: 'चिली चिकन (ड्राई / ग्रेवी)',
    description: 'Wok-tossed battered crispy chicken chunks with crunchy capsicum, sliced green chillies, and spicy soy-garlic sauce.',
    dietType: 'non_veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'starter',
    suggestedPrepTime: 14
  },
  'chilli paneer': {
    hindiName: 'चिली पनीर',
    description: 'Crisp cottage cheese cubes tossed in spicy Indo-Chinese sauce with bell peppers, garlic, spring onions, and green chillies.',
    dietType: 'veg',
    spiceLevel: 'spicy',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },
  'veg spring rolls': {
    hindiName: 'वेज स्प्रिंग रोल्स',
    description: 'Crisp golden fried rolls stuffed with seasoned shredded cabbage, carrots, capsicum, and noodles with sweet chilli dip.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'starter',
    suggestedPrepTime: 10
  },
  'hara bhara kabab': {
    hindiName: 'हरा भरा कबाब',
    description: 'Crispy spinach, green pea, and potato patties subtly spiced and shallow fried, served with mint chutney.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },
  'chicken seekh kabab': {
    hindiName: 'चिकन सीक कबाब',
    description: 'Minced spiced chicken skewers infused with fresh herbs and roasted over charcoal, garnished with onion rings and lemon.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 15
  },

  // Chinese & Fast Food
  'veg fried rice': {
    hindiName: 'वेज फ्राइड राइस',
    description: 'Wok-tossed fragrant basmati rice with finely chopped seasonal vegetables, spring onions, and toasted sesame.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'chinese',
    suggestedPrepTime: 12
  },
  'chicken fried rice': {
    hindiName: 'चिकन फ्राइड राइस',
    description: 'Aromatic wok-tossed rice with shredded tender chicken, egg ribbons, vegetables, and light oriental seasoning.',
    dietType: 'non_veg',
    spiceLevel: 'mild',
    categoryKeyword: 'chinese',
    suggestedPrepTime: 14
  },
  'veg hakka noodles': {
    hindiName: 'वेज हक्का नूडल्स',
    description: 'Classic wok-tossed noodles with shredded cabbage, carrots, bell peppers, soy sauce, and aromatic garlic.',
    dietType: 'veg',
    spiceLevel: 'mild',
    categoryKeyword: 'chinese',
    suggestedPrepTime: 12
  },
  'chicken noodles': {
    hindiName: 'चिकन चाउमीन / नूडल्स',
    description: 'Street-style wok noodles tossed with juicy chicken slices, scrambled egg, crunchy veggies, and spicy chilli oil.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'chinese',
    suggestedPrepTime: 14
  },
  'veg momos': {
    hindiName: 'स्टीम्ड वेज मोमोज',
    description: 'Delicate steamed dumplings stuffed with finely minced vegetables and scallions, served with spicy red chutney.',
    dietType: 'veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },
  'chicken momos': {
    hindiName: 'चिकन मोमोज',
    description: 'Juicy steamed dumplings stuffed with seasoned minced chicken, served with garlic chilli dip and clear soup.',
    dietType: 'non_veg',
    spiceLevel: 'medium',
    categoryKeyword: 'starter',
    suggestedPrepTime: 12
  },

  // Breads
  'butter naan': {
    hindiName: 'बटर नान',
    description: 'Soft and pillowy clay oven baked flatbread brushed generously with salted butter and topped with fresh coriander.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'bread',
    suggestedPrepTime: 5
  },
  'garlic naan': {
    hindiName: 'गार्लिक बटर नान',
    description: 'Tandoori refined flour flatbread infused with roasted minced garlic, fresh coriander, and melted butter.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'bread',
    suggestedPrepTime: 6
  },
  'tandoori roti': {
    hindiName: 'तंदूरी रोटी',
    description: 'Healthy whole wheat flatbread baked in the clay oven, option of plain or brushed with butter.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'bread',
    suggestedPrepTime: 5
  },
  'laccha paratha': {
    hindiName: 'लच्छा पराठा',
    description: 'Crisp, multi-layered whole wheat flatbread shallow roasted with desi ghee for a flaky texture.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'bread',
    suggestedPrepTime: 8
  },

  // Desserts & Drinks
  'gulab jamun': {
    hindiName: 'गुलाब जामुन',
    description: 'Deep-fried golden khoya dumplings soaked in warm rose, saffron, and cardamom scented sugar syrup.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'dessert',
    suggestedPrepTime: 5
  },
  'rasgulla': {
    hindiName: 'स्पंज रसगुल्ला',
    description: 'Classic melt-in-mouth spongy cottage cheese balls simmered in light sugar syrup, served chilled.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'dessert',
    suggestedPrepTime: 3
  },
  'masala chai': {
    hindiName: 'स्पेशल मसाला चाय',
    description: 'Freshly brewed strong milk tea infused with crushed cardamom, ginger, cloves, and cinnamon.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'drink',
    suggestedPrepTime: 6
  },
  'cold coffee': {
    hindiName: 'कोल्ड कॉफ़ी विथ आइसक्रीम',
    description: 'Creamy blended chilled espresso with whole milk, chocolate syrup, and a scoop of vanilla ice cream.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'drink',
    suggestedPrepTime: 5
  },
  'mango lassi': {
    hindiName: 'मैंगो लस्सी',
    description: 'Thick, refreshing churned yoghurt drink blended with Alphonso mango pulp and garnished with chopped pistachios.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'drink',
    suggestedPrepTime: 5
  },
  'sweet lassi': {
    hindiName: 'स्पेशल मीठी लस्सी',
    description: 'Traditional Punjabi sweet curd shake topped with a dollop of fresh malai and crushed dry fruits.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'drink',
    suggestedPrepTime: 5
  },
  'virgin mojito': {
    hindiName: 'वर्जिन मोजितो',
    description: 'Sparkling refreshing cooler with muddled fresh mint leaves, zesty lime wedges, simple syrup, and ice soda.',
    dietType: 'veg',
    spiceLevel: 'none',
    categoryKeyword: 'drink',
    suggestedPrepTime: 5
  }
};

// Transliteration helper for common terms
function transliterateToHindi(text: string): string {
  const t = text.trim().toLowerCase();
  if (DISH_DATABASE[t]?.hindiName) return DISH_DATABASE[t].hindiName!;

  // Word substitutions
  const map: Record<string, string> = {
    chicken: 'चिकन',
    mutton: 'मटन',
    fish: 'फिश',
    egg: 'अंडा',
    prawn: 'झींगा',
    prawns: 'झींगा',
    paneer: 'पनीर',
    mushroom: 'मशरूम',
    veg: 'वेज',
    dal: 'दाल',
    biryani: 'बिरयानी',
    rice: 'चावल',
    roti: 'रोटी',
    naan: 'नान',
    paratha: 'पराठा',
    kulcha: 'कुलचा',
    tikka: 'टिक्का',
    kebab: 'कबाब',
    kabab: 'कबाब',
    masala: 'मसाला',
    curry: 'करी',
    fry: 'फ्राई',
    roast: 'रोस्ट',
    soup: 'सूप',
    noodles: 'नूडल्स',
    pasta: 'पास्ता',
    pizza: 'पिज़्ज़ा',
    burger: 'बर्गर',
    sandwich: 'सैंडविच',
    momo: 'मोमो',
    momos: 'मोमोज',
    roll: 'रोल',
    chilli: 'चिली',
    garlic: 'गार्लिक',
    butter: 'बटर',
    cheese: 'चीज़',
    dry: 'ड्राई',
    gravy: 'ग्रेवी',
    salad: 'सलाद',
    raita: 'रायता',
    lassi: 'लस्सी',
    chai: 'चाय',
    tea: 'चाय',
    coffee: 'कॉफ़ी',
    shake: 'शेक',
    juice: 'जूस',
    icecream: 'आइसक्रीम',
    kheer: 'खीर',
    halwa: 'हलवा',
    sweet: 'मिठाई',
    special: 'स्पेशल',
    crispy: 'क्रिस्पी',
    spicy: 'स्पाइसी'
  };

  const words = t.split(/\s+/);
  const hindiWords = words.map(w => map[w] || w);
  return hindiWords.join(' ');
}

// Generate smart dish details on the fly
export function getSmartDishDetails(dishName: string): SmartDishSuggestion {
  const cleanName = dishName.trim();
  const lower = cleanName.toLowerCase();

  // 1. Direct database exact match
  if (DISH_DATABASE[lower]) {
    const item = DISH_DATABASE[lower];
    return {
      hindiName: item.hindiName || transliterateToHindi(cleanName),
      description: item.description || `Delicious freshly prepared ${cleanName} with authentic spices and herbs.`,
      dietType: item.dietType || 'veg',
      spiceLevel: item.spiceLevel || 'medium',
      categoryKeyword: item.categoryKeyword,
      suggestedPrepTime: item.suggestedPrepTime || 15
    };
  }

  // 2. Partial database match
  for (const [key, val] of Object.entries(DISH_DATABASE)) {
    if (lower.includes(key) || key.includes(lower)) {
      return {
        hindiName: transliterateToHindi(cleanName),
        description: val.description || `Specialty ${cleanName} crafted with fresh ingredients and signature spices.`,
        dietType: val.dietType || (isNonVeg(lower) ? 'non_veg' : isEgg(lower) ? 'egg' : 'veg'),
        spiceLevel: val.spiceLevel || 'medium',
        categoryKeyword: val.categoryKeyword,
        suggestedPrepTime: val.suggestedPrepTime || 15
      };
    }
  }

  // 3. Dynamic Heuristic Generation for Custom / New Dishes
  const diet: 'veg' | 'non_veg' | 'egg' | 'vegan' = isNonVeg(lower)
    ? 'non_veg'
    : isEgg(lower)
    ? 'egg'
    : isVegan(lower)
    ? 'vegan'
    : 'veg';

  const spice: 'none' | 'mild' | 'medium' | 'spicy' | 'extra_spicy' = isSpicy(lower)
    ? 'spicy'
    : isSweetOrBeverage(lower)
    ? 'none'
    : isMild(lower)
    ? 'mild'
    : 'medium';

  let desc = '';

  if (lower.includes('biryani') || lower.includes('pulao') || lower.includes('rice')) {
    desc = `Aromatic basmati rice slow-cooked with tender cuts, saffron, caramelised onions, and royal spices, served fresh and piping hot.`;
  } else if (lower.includes('tikka') || lower.includes('kebab') || lower.includes('kabab') || lower.includes('tandoori')) {
    desc = `Succulent and smoky charcoal-grilled specialty marinated in hung curd, secret spices, and fresh herbs, served with mint chutney.`;
  } else if (lower.includes('curry') || lower.includes('masala') || lower.includes('gravy') || lower.includes('korma')) {
    desc = `Rich and flavourful slow-simmered gravy infused with whole spices, ginger, garlic, and freshly chopped cilantro.`;
  } else if (lower.includes('fry') || lower.includes('crispy') || lower.includes('pakora') || lower.includes('roll')) {
    desc = `Crispy and golden on the outside, juicy and flavourful inside, seasoned with zesty chaat masala and served with house dips.`;
  } else if (lower.includes('noodle') || lower.includes('chowmein') || lower.includes('manchurian') || lower.includes('chilli')) {
    desc = `Authentic wok-tossed Indo-Chinese specialty with crunchy bell peppers, garlic, scallions, and signature spicy sauces.`;
  } else if (lower.includes('naan') || lower.includes('roti') || lower.includes('paratha') || lower.includes('kulcha')) {
    desc = `Freshly baked in the clay oven, soft, flaky, and brushed generously with pure butter.`;
  } else if (lower.includes('shake') || lower.includes('lassi') || lower.includes('mojito') || lower.includes('juice') || lower.includes('coffee') || lower.includes('tea') || lower.includes('chai')) {
    desc = `Chilled, refreshing, and crafted with premium ingredients for the perfect thirst-quencher.`;
  } else if (lower.includes('sweet') || lower.includes('halwa') || lower.includes('ice') || lower.includes('cake') || lower.includes('jamun') || lower.includes('kheer')) {
    desc = `Traditional sweet indulgence prepared with pure desi ghee, khoya, and garnished with roasted pistachios and almonds.`;
  } else {
    desc = `Chef's special ${cleanName} prepared fresh to order using finest ingredients, aromatic herbs, and traditional culinary spices.`;
  }

  return {
    hindiName: transliterateToHindi(cleanName),
    description: desc,
    dietType: diet,
    spiceLevel: spice,
    suggestedPrepTime: 15
  };
}

function isNonVeg(str: string): boolean {
  return /chicken|mutton|fish|prawn|meat|lamb|bhetki|keema|tangdi|murgh|gosht|pomfret|crab/i.test(str);
}

function isEgg(str: string): boolean {
  return /egg|omlette|omelette|anda/i.test(str);
}

function isVegan(str: string): boolean {
  return /vegan|soya|tofu/i.test(str);
}

function isSpicy(str: string): boolean {
  return /spicy|chilli|kolhapuri|schezwan|peri|mirchi|kasha|angara|jalfrezi|kadai/i.test(str);
}

function isMild(str: string): boolean {
  return /butter|shahi|malai|korma|creamy|mild|paneer butter/i.test(str);
}

function isSweetOrBeverage(str: string): boolean {
  return /lassi|shake|coffee|tea|chai|mojito|juice|sweet|jamun|halwa|kheer|icecream|dessert|rasgulla/i.test(str);
}

// Client-side image compression: reads File, resizes to max 800x800, exports compact WebP/JPEG base64
export function compressImageFile(file: File, maxWidth = 800, maxHeight = 800, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!file || !file.type.startsWith('image/')) {
      reject(new Error('Please select a valid image file (JPG, PNG, WebP)'));
      return;
    }

    const reader = new FileReader();
    reader.onload = (readerEvent) => {
      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        // Calculate aspect ratio
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(readerEvent.target?.result as string);
          return;
        }

        // Draw image onto canvas
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to webp or jpeg
        const mimeType = 'image/webp';
        let dataUrl = canvas.toDataURL(mimeType, quality);

        // Fallback to jpeg if webp not supported
        if (!dataUrl.startsWith('data:image/webp')) {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        resolve(dataUrl);
      };

      img.onerror = () => {
        reject(new Error('Failed to decode image'));
      };

      img.src = readerEvent.target?.result as string;
    };

    reader.onerror = () => {
      reject(new Error('Failed to read image file'));
    };

    reader.readAsDataURL(file);
  });
}
