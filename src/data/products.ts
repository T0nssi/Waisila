export interface Product {
  slug: string;
  name: string;
  en: string;
  category: 'marble' | 'granite' | 'quartz' | 'artificial';
  image: string;
  description?: string;
  origin?: string;
  finish?: string;
  usage?: string;
}

export const products: Product[] = [
  // Marble
  { slug: 'white-valencia', name: 'ไวท์วาลากัส', en: 'White Valencia', category: 'marble', image: '/assets/products/marble/white-valencia.jpg', origin: 'โรมันจีน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'arabescato', name: 'อาราเบสคาโต้', en: 'Arabescato', category: 'marble', image: '/assets/products/marble/arabescato.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'white-carrara', name: 'ไวท์ คาราร่า', en: 'White Carrara', category: 'marble', image: '/assets/products/marble/white-carrara.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'white-venus', name: 'ไวท์ วีนัส', en: 'White Venus', category: 'marble', image: '/assets/products/marble/white-venus.jpg', origin: 'กรีซ', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'statuario', name: 'สตาร์ตูดิโอ้', en: 'Statuario', category: 'marble', image: '/assets/products/marble/statuario.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์, บันได' },
  { slug: 'cive', name: 'ซีเวค', en: 'Cive', category: 'marble', image: '/assets/products/marble/cive.jpg', origin: 'ตุรกี', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'crema-marfil', name: 'ครีมมาเฟล', en: 'Crema Marfil', category: 'marble', image: '/assets/products/marble/crema-marfil.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'nuova-marble', name: 'นิวมาเฟล', en: 'Nuova Marble', category: 'marble', image: '/assets/products/marble/nuova-marble.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'new-emperador', name: 'นิว เอ็มพาราโด้', en: 'New Emperador', category: 'marble', image: '/assets/products/marble/new-emperador.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'light-emperador', name: 'ไลท์ เอ็มพาราโด้', en: 'Light Emperador', category: 'marble', image: '/assets/products/marble/light-emperador.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'dark-emperador', name: 'ดาร์ก เอ็มพาราโด้', en: 'Dark Emperador', category: 'marble', image: '/assets/products/marble/dark-emperador.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'grey-emperador', name: 'เกรย์ เอ็มพาราโด้', en: 'Grey Emperador', category: 'marble', image: '/assets/products/marble/grey-emperador.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'black-emperador', name: 'แบล็ค เอ็มพาราโด้', en: 'Black Emperador', category: 'marble', image: '/assets/products/marble/black-emperador.jpg', origin: 'สเปน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'black-macchina', name: 'แบล็ค มาคิวน่า', en: 'Black Macchina', category: 'marble', image: '/assets/products/marble/black-macchina.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'black-forest', name: 'แบล็ค ฟอร์เรส', en: 'Black Forest', category: 'marble', image: '/assets/products/marble/black-forest.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'green-italy', name: 'เขียว อิตาลี', en: 'Green Italy', category: 'marble', image: '/assets/products/marble/green-italy.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'พื้น, ผนัง, บันได' },

  // Granite
  { slug: 'dark-green', name: 'ดำเกล็ดทอง', en: 'Dark Green', category: 'granite', image: '/assets/products/granite/dark-green.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'dark-africa', name: 'ดำอัฟริกา', en: 'Dark Africa', category: 'granite', image: '/assets/products/granite/dark-africa.jpg', origin: 'แอฟริกา', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'dark-india', name: 'ดำอินเดีย', en: 'Dark India', category: 'granite', image: '/assets/products/granite/dark-india.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'dark-thai', name: 'ดำไทย', en: 'Dark Thai', category: 'granite', image: '/assets/products/granite/dark-thai.jpg', origin: 'ไทย', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'dark-china', name: 'ดำจีน', en: 'Dark China', category: 'granite', image: '/assets/products/granite/dark-china.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'grey-cloud-pattern', name: 'เทาลายเมฆ', en: 'Grey Cloud Pattern', category: 'granite', image: '/assets/products/granite/grey-cloud-pattern.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'white-china-603', name: 'ขาวจีน 603', en: 'White China 603', category: 'granite', image: '/assets/products/granite/white-china-603.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'white-china-604', name: 'ขาวจีน 604', en: 'White China 604', category: 'granite', image: '/assets/products/granite/white-china-604.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'grey-china-623', name: 'เทาจีน 623', en: 'Grey China 623', category: 'granite', image: '/assets/products/granite/grey-china-623.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'grey-china-624', name: 'เทาจีน 624', en: 'Grey China 624', category: 'granite', image: '/assets/products/granite/grey-china-624.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'pink-china', name: 'ชมพูจีน', en: 'Pink China', category: 'granite', image: '/assets/products/granite/pink-china.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'new-pink', name: 'นิวพิ้งค์', en: 'New Pink', category: 'granite', image: '/assets/products/granite/new-pink.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'sakura', name: 'ซากุระ', en: 'Sakura', category: 'granite', image: '/assets/products/granite/sakura.jpg', origin: 'ญี่ปุ่น', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'red-india-s', name: 'แดงอินเดีย (S)', en: 'Red India (S)', category: 'granite', image: '/assets/products/granite/red-india-s.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'red-india-l', name: 'แดงอินเดีย (L)', en: 'Red India (L)', category: 'granite', image: '/assets/products/granite/red-india-l.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'blue-pearl', name: 'บลูเพิร์ล', en: 'Blue Pearl', category: 'granite', image: '/assets/products/granite/blue-pearl.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'emerald-pearl', name: 'เอ็มเมอร์รัลเพิร์ล', en: 'Emerald Pearl', category: 'granite', image: '/assets/products/granite/emerald-pearl.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง, เคาน์เตอร์' },
  { slug: 'black-forest-granite', name: 'แบล็ค ฟอร์เรส', en: 'Black Forest', category: 'granite', image: '/assets/products/granite/black-forest.jpg', origin: 'อินเดีย', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'multi-color-brown', name: 'มัลติคัลเลอร์ บราว', en: 'Multi Color Brown', category: 'granite', image: '/assets/products/granite/multi-color-brown.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },
  { slug: 'multi-color-red', name: 'มัลติคัลเลอร์ เรด', en: 'Multi Color Red', category: 'granite', image: '/assets/products/granite/multi-color-red.jpg', origin: 'จีน', finish: 'Polish', usage: 'พื้น, ผนัง' },

  // Quartz
  { slug: 'white-caracutta', name: 'ไวท์ คารากัสต้า', en: 'White Caracutta', category: 'quartz', image: '/assets/products/quartz/white-caracutta.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'adel-white', name: 'เอเดล ไวท์', en: 'Adel White', category: 'quartz', image: '/assets/products/quartz/adel-white.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'mama-white', name: 'มาม่าไวท์', en: 'Mama White', category: 'quartz', image: '/assets/products/quartz/mama-white.jpg', origin: 'อิตาลี', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'light-grey', name: 'ไลท์ เกรย์', en: 'Light Grey', category: 'quartz', image: '/assets/products/quartz/light-grey.jpg', origin: 'ไต้หวัน', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'cappuccino', name: 'คาปูชิโน่', en: 'Cappuccino', category: 'quartz', image: '/assets/products/quartz/cappuccino.jpg', origin: 'ไต้หวัน', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'classic-grey', name: 'คลาสิค เกรย์', en: 'Classic Grey', category: 'quartz', image: '/assets/products/quartz/classic-grey.jpg', origin: 'ไต้หวัน', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'black-quartz', name: 'ควอทซ์ดำ', en: 'Black Quartz', category: 'quartz', image: '/assets/products/quartz/black-quartz.jpg', origin: 'ไต้หวัน', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },
  { slug: 'red-quartz', name: 'ควอทซ์แดง', en: 'Red Quartz', category: 'quartz', image: '/assets/products/quartz/red-quartz.jpg', origin: 'ไต้หวัน', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น' },

  // Artificial
  { slug: 'crystal-white', name: 'คลิสตัสไวท์', en: 'Crystal White', category: 'artificial', image: '/assets/products/artificial/crystal-white.jpg', origin: 'ไทย', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น, ผนัง' },
  { slug: 'magic-white', name: 'เมจิกไวท์', en: 'Magic White', category: 'artificial', image: '/assets/products/artificial/magic-white.jpg', origin: 'ไทย', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น, ผนัง' },
  { slug: 'crystal-white-magic-gold', name: 'คลิสตัสไวท์เมจิกโกลด์', en: 'Crystal White Magic Gold', category: 'artificial', image: '/assets/products/artificial/crystal-white-magic-gold.jpg', origin: 'ไทย', finish: 'Polish', usage: 'เคาน์เตอร์, พื้น, ผนัง' },
];

export function getProductBySlug(slug: string): Product | undefined {
  return products.find(p => p.slug === slug);
}

export function getProductsByCategory(category: Product['category']): Product[] {
  return products.filter(p => p.category === category);
}
