import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const wilayas = [
  { code: '01', name: 'Adrar', nameAr: 'أدرار', shippingCost: 1500 },
  { code: '02', name: 'Chlef', nameAr: 'الشلف', shippingCost: 800 },
  { code: '03', name: 'Laghouat', nameAr: 'الأغواط', shippingCost: 1000 },
  { code: '04', name: 'Oum El Bouaghi', nameAr: 'أم البواقي', shippingCost: 900 },
  { code: '05', name: 'Batna', nameAr: 'باتنة', shippingCost: 900 },
  { code: '06', name: 'Béjaïa', nameAr: 'بجاية', shippingCost: 800 },
  { code: '07', name: 'Biskra', nameAr: 'بسكرة', shippingCost: 1000 },
  { code: '08', name: 'Béchar', nameAr: 'بشار', shippingCost: 1500 },
  { code: '09', name: 'Blida', nameAr: 'البليدة', shippingCost: 600 },
  { code: '10', name: 'Bouira', nameAr: 'البويرة', shippingCost: 700 },
  { code: '11', name: 'Tamanrasset', nameAr: 'تمنراست', shippingCost: 2000 },
  { code: '12', name: 'Tébessa', nameAr: 'تبسة', shippingCost: 1000 },
  { code: '13', name: 'Tlemcen', nameAr: 'تلمسان', shippingCost: 900 },
  { code: '14', name: 'Tiaret', nameAr: 'تيارت', shippingCost: 900 },
  { code: '15', name: 'Tizi Ouzou', nameAr: 'تيزي وزو', shippingCost: 700 },
  { code: '16', name: 'Alger', nameAr: 'الجزائر', shippingCost: 400 },
  { code: '17', name: 'Djelfa', nameAr: 'الجلفة', shippingCost: 900 },
  { code: '18', name: 'Jijel', nameAr: 'جيجل', shippingCost: 900 },
  { code: '19', name: 'Sétif', nameAr: 'سطيف', shippingCost: 800 },
  { code: '20', name: 'Saïda', nameAr: 'سعيدة', shippingCost: 900 },
  { code: '21', name: 'Skikda', nameAr: 'سكيكدة', shippingCost: 900 },
  { code: '22', name: 'Sidi Bel Abbès', nameAr: 'سيدي بلعباس', shippingCost: 900 },
  { code: '23', name: 'Annaba', nameAr: 'عنابة', shippingCost: 900 },
  { code: '24', name: 'Guelma', nameAr: 'قالمة', shippingCost: 900 },
  { code: '25', name: 'Constantine', nameAr: 'قسنطينة', shippingCost: 800 },
  { code: '26', name: 'Médéa', nameAr: 'المدية', shippingCost: 700 },
  { code: '27', name: 'Mostaganem', nameAr: 'مستغانم', shippingCost: 900 },
  { code: '28', name: 'M\'Sila', nameAr: 'المسيلة', shippingCost: 900 },
  { code: '29', name: 'Mascara', nameAr: 'معسكر', shippingCost: 900 },
  { code: '30', name: 'Ouargla', nameAr: 'ورقلة', shippingCost: 1500 },
  { code: '31', name: 'Oran', nameAr: 'وهران', shippingCost: 800 },
  { code: '32', name: 'El Bayadh', nameAr: 'البيض', shippingCost: 1000 },
  { code: '33', name: 'Illizi', nameAr: 'إليزي', shippingCost: 2000 },
  { code: '34', name: 'Bordj Bou Arreridj', nameAr: 'برج بوعريريج', shippingCost: 800 },
  { code: '35', name: 'Boumerdès', nameAr: 'بومرداس', shippingCost: 600 },
  { code: '36', name: 'El Tarf', nameAr: 'الطارف', shippingCost: 1000 },
  { code: '37', name: 'Tindouf', nameAr: 'تندوف', shippingCost: 2000 },
  { code: '38', name: 'Tissemsilt', nameAr: 'تيسمسيلت', shippingCost: 900 },
  { code: '39', name: 'El Oued', nameAr: 'الوادي', shippingCost: 1500 },
  { code: '40', name: 'Khenchela', nameAr: 'خنشلة', shippingCost: 1000 },
  { code: '41', name: 'Souk Ahras', nameAr: 'سوق أهراس', shippingCost: 1000 },
  { code: '42', name: 'Tipaza', nameAr: 'تيبازة', shippingCost: 600 },
  { code: '43', name: 'Mila', nameAr: 'ميلة', shippingCost: 800 },
  { code: '44', name: 'Aïn Defla', nameAr: 'عين الدفلى', shippingCost: 700 },
  { code: '45', name: 'Naâma', nameAr: 'النعامة', shippingCost: 1000 },
  { code: '46', name: 'Aïn Témouchent', nameAr: 'عين تموشنت', shippingCost: 900 },
  { code: '47', name: 'Ghardaïa', nameAr: 'غرداية', shippingCost: 1500 },
  { code: '48', name: 'Relizane', nameAr: 'غليزان', shippingCost: 900 },
  { code: '49', name: 'Timimoun', nameAr: 'تيميمون', shippingCost: 1800 },
  { code: '50', name: 'Bordj Badji Mokhtar', nameAr: 'برج باجي مختار', shippingCost: 2500 },
  { code: '51', name: 'Ouled Djellal', nameAr: 'أولاد جلال', shippingCost: 1200 },
  { code: '52', name: 'Béni Abbès', nameAr: 'بني عباس', shippingCost: 1800 },
  { code: '53', name: 'In Salah', nameAr: 'عين صالح', shippingCost: 2000 },
  { code: '54', name: 'In Guezzam', nameAr: 'عين قزام', shippingCost: 2500 },
  { code: '55', name: 'Touggourt', nameAr: 'تقرت', shippingCost: 1500 },
  { code: '56', name: 'Djanet', nameAr: 'جانت', shippingCost: 2200 },
  { code: '57', name: 'El M\'Ghair', nameAr: 'المغير', shippingCost: 1200 },
  { code: '58', name: 'El Meniaa', nameAr: 'المنيعة', shippingCost: 1800 }
];

async function main() {
  console.log('Start seeding Wilayas...');

  for (const wilaya of wilayas) {
    const exists = await prisma.wilaya.findUnique({
      where: { code: wilaya.code }
    });

    if (!exists) {
      await prisma.wilaya.create({
        data: wilaya
      });
      console.log(`Created wilaya: ${wilaya.name}`);
    } else {
      await prisma.wilaya.update({
        where: { code: wilaya.code },
        data: wilaya
      });
      console.log(`Updated wilaya: ${wilaya.name}`);
    }
  }

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

