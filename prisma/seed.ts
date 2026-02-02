import { PrismaClient, PartType } from '../lib/generated/prisma'

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding database...')

  // Usuń stare dane (w odpowiedniej kolejności ze względu na relacje)
  await prisma.bikeProductDefaultPart.deleteMany()
  await prisma.partProduct.deleteMany()
  await prisma.bikeProduct.deleteMany()

  // === SEED PART PRODUCTS ===
  console.log('Creating PartProducts...')

  // --- ŁAŃCUCHY ---
  const chainShimano105 = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'Shimano',
      model: 'CN-HG601-11',
      description: 'Łańcuch 11-rzędowy Shimano 105'
    }
  })

  const chainShimanoUltegra = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'Shimano',
      model: 'CN-HG701-11',
      description: 'Łańcuch 11-rzędowy Shimano Ultegra'
    }
  })

  const chainShimanoDeore12 = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'Shimano',
      model: 'CN-M6100',
      description: 'Łańcuch 12-rzędowy Shimano Deore'
    }
  })

  const chainSram12 = await prisma.partProduct.create({
    data: {
      type: PartType.CHAIN,
      brand: 'SRAM',
      model: 'PC-1210 Eagle',
      description: 'Łańcuch 12-rzędowy SRAM'
    }
  })

  // --- KASETY ---
  const cassetteShimano105 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-R7000 11-32T',
      description: 'Kaseta Shimano 105 11-32T'
    }
  })

  const cassetteShimanoGRX1134 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-HG500 11-34T',
      description: 'Kaseta Shimano GRX 11-34T'
    }
  })

  const cassetteShimanoSLX1051 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-M7100 10-51T',
      description: 'Kaseta Shimano SLX 10-51T'
    }
  })

  const cassetteShimano1142 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'Shimano',
      model: 'CS-HG700 11-42T',
      description: 'Kaseta Shimano 11-42T'
    }
  })

  const cassetteSramRival1044 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'SRAM',
      model: 'XG-1250 10-44T',
      description: 'Kaseta SRAM Rival 10-44T'
    }
  })

  const cassetteSramXG1046 = await prisma.partProduct.create({
    data: {
      type: PartType.CASSETTE,
      brand: 'SRAM',
      model: 'XG-1351 10-46T',
      description: 'Kaseta SRAM 10-46T'
    }
  })

  // --- OPONY ---
  const tireContinentalGP5000 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Continental',
      model: 'Grand Prix 5000 28mm',
      description: 'Opona szosowa Continental GP5000'
    }
  })

  const tireWTBByway44 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'WTB',
      model: 'Byway 44mm',
      description: 'Opona gravelowa WTB Byway 44mm'
    }
  })

  const tireWTBRiddler45 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'WTB',
      model: 'Riddler 45C',
      description: 'Opona gravelowa WTB Riddler 45C'
    }
  })

  const tireWTBResolute42 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'WTB',
      model: 'Resolute Comp 700x42C',
      description: 'Opona gravelowa WTB Resolute 42mm'
    }
  })

  const tireSchwalbeGOneRS45 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Schwalbe',
      model: 'G-One RS 45mm',
      description: 'Opona gravelowa Schwalbe G-One RS 45mm'
    }
  })

  const tireSchwalbeGOneR45 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Schwalbe',
      model: 'G-One R Performance 700x45C',
      description: 'Opona gravelowa Schwalbe G-One R 45mm'
    }
  })

  const tireSchwalbe38 = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Schwalbe',
      model: 'G-One Allround 38mm',
      description: 'Opona gravelowa Schwalbe G-One 38mm'
    }
  })

  const tireSchwalbeThunderBurt = await prisma.partProduct.create({
    data: {
      type: PartType.TIRE_FRONT,
      brand: 'Schwalbe',
      model: 'Thunder Burt',
      description: 'Opona Schwalbe Thunder Burt'
    }
  })

  // --- KLOCKI HAMULCOWE ---
  const padsShimanoGRX = await prisma.partProduct.create({
    data: {
      type: PartType.PADS_FRONT,
      brand: 'Shimano',
      model: 'L03A Resin',
      description: 'Klocki hamulcowe Shimano L03A'
    }
  })

  const padsSram = await prisma.partProduct.create({
    data: {
      type: PartType.PADS_FRONT,
      brand: 'SRAM',
      model: 'Organic Disc Pads',
      description: 'Klocki hamulcowe SRAM organiczne'
    }
  })

  // --- OWIJKA KIEROWNICY ---
  const handlebarTapeFizik = await prisma.partProduct.create({
    data: {
      type: PartType.HANDLEBAR_TAPE,
      brand: 'Fizik',
      model: 'Vento Microtex Tacky',
      description: 'Owijka kierownicy Fizik Vento'
    }
  })

  const handlebarTapeSupacaz = await prisma.partProduct.create({
    data: {
      type: PartType.HANDLEBAR_TAPE,
      brand: 'Supacaz',
      model: 'Super Sticky Kush',
      description: 'Owijka kierownicy Supacaz'
    }
  })

  // --- ZĘBATKI / KORBY ---
  const cranksetShimanoGRX40T = await prisma.partProduct.create({
    data: {
      type: PartType.CRANKSET,
      brand: 'Shimano',
      model: 'FC-RX820 40T',
      description: 'Korba Shimano GRX 1x 40T'
    }
  })

  const cranksetShimanoGRX2x = await prisma.partProduct.create({
    data: {
      type: PartType.CRANKSET,
      brand: 'Shimano',
      model: 'FC-RX600 46/30T',
      description: 'Korba Shimano GRX 2x 46/30T'
    }
  })

  const cranksetSramRival40T = await prisma.partProduct.create({
    data: {
      type: PartType.CRANKSET,
      brand: 'SRAM',
      model: 'Rival XPLR 40T',
      description: 'Korba SRAM Rival XPLR 40T'
    }
  })

  // --- MLECZKO TUBELESS ---
  const sealantStans = await prisma.partProduct.create({
    data: {
      type: PartType.TUBELESS_SEALANT,
      brand: 'Stans NoTubes',
      model: 'Race Sealant',
      description: 'Mleczko tubeless Stans'
    }
  })

  // --- PRZERZUTKI TYLNE ---
  const rdShimanoGRXRX822 = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'Shimano',
      model: 'GRX RD-RX822',
      description: 'Przerzutka tylna Shimano GRX RX822 12-speed'
    }
  })

  const rdShimanoGRXRX820 = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'Shimano',
      model: 'GRX RD-RX820',
      description: 'Przerzutka tylna Shimano GRX RX820 12-speed'
    }
  })

  const rdShimanoGRXRX812 = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'Shimano',
      model: 'GRX RD-RX812',
      description: 'Przerzutka tylna Shimano GRX RX812 11-speed'
    }
  })

  const rdShimanoGRXRX810 = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'Shimano',
      model: 'GRX RD-RX810',
      description: 'Przerzutka tylna Shimano GRX RX810 11-speed'
    }
  })

  const rdShimanoGRXRX400 = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'Shimano',
      model: 'GRX RD-RX400',
      description: 'Przerzutka tylna Shimano GRX RX400 10-speed'
    }
  })

  const rdSramRivalXPLR = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'SRAM',
      model: 'Rival XPLR AXS',
      description: 'Przerzutka tylna SRAM Rival XPLR AXS elektroniczna'
    }
  })

  const rdSramApexXPLR = await prisma.partProduct.create({
    data: {
      type: PartType.DERAILLEUR_REAR,
      brand: 'SRAM',
      model: 'Apex XPLR AXS',
      description: 'Przerzutka tylna SRAM Apex XPLR AXS elektroniczna'
    }
  })

  // --- MANETKI / SHIFTERY ---
  const shiftersShimanoGRX12 = await prisma.partProduct.create({
    data: {
      type: PartType.SHIFTERS,
      brand: 'Shimano',
      model: 'GRX ST-RX820',
      description: 'Manetki Shimano GRX 12-speed'
    }
  })

  const shiftersShimanoGRX11 = await prisma.partProduct.create({
    data: {
      type: PartType.SHIFTERS,
      brand: 'Shimano',
      model: 'GRX ST-RX810',
      description: 'Manetki Shimano GRX 11-speed'
    }
  })

  const shiftersShimanoGRX10 = await prisma.partProduct.create({
    data: {
      type: PartType.SHIFTERS,
      brand: 'Shimano',
      model: 'GRX ST-RX400',
      description: 'Manetki Shimano GRX 10-speed'
    }
  })

  const shiftersSramRivalAXS = await prisma.partProduct.create({
    data: {
      type: PartType.SHIFTERS,
      brand: 'SRAM',
      model: 'Rival AXS',
      description: 'Manetki SRAM Rival AXS elektroniczne'
    }
  })

  // --- HAMULCE ---
  const brakesShimanoGRX = await prisma.partProduct.create({
    data: {
      type: PartType.BRAKES,
      brand: 'Shimano',
      model: 'GRX BR-RX400',
      description: 'Hamulce hydrauliczne Shimano GRX'
    }
  })

  const brakesSramRival = await prisma.partProduct.create({
    data: {
      type: PartType.BRAKES,
      brand: 'SRAM',
      model: 'Rival AXS HRD',
      description: 'Hamulce hydrauliczne SRAM Rival AXS'
    }
  })

  // --- TARCZE HAMULCOWE ---
  const discShimanoRT70 = await prisma.partProduct.create({
    data: {
      type: PartType.DISC_FRONT,
      brand: 'Shimano',
      model: 'RT70 160mm',
      description: 'Tarcza hamulcowa Shimano RT70 160mm'
    }
  })

  const discSramCenterline = await prisma.partProduct.create({
    data: {
      type: PartType.DISC_FRONT,
      brand: 'SRAM',
      model: 'Centerline 160mm',
      description: 'Tarcza hamulcowa SRAM Centerline 160mm'
    }
  })

  // --- PIASTY ---
  const hubsShimanoGRX = await prisma.partProduct.create({
    data: {
      type: PartType.HUBS,
      brand: 'Shimano',
      model: 'GRX HB/FH-RX470',
      description: 'Piasty Shimano GRX'
    }
  })

  const hubsDTSwiss = await prisma.partProduct.create({
    data: {
      type: PartType.HUBS,
      brand: 'DT Swiss',
      model: '370',
      description: 'Piasty DT Swiss 370'
    }
  })

  // --- OBRĘCZE ---
  const rimsDTSwissG540 = await prisma.partProduct.create({
    data: {
      type: PartType.RIMS,
      brand: 'DT Swiss',
      model: 'G540',
      description: 'Obręcze DT Swiss G540 24mm'
    }
  })

  const rimsFSACarbonAGX = await prisma.partProduct.create({
    data: {
      type: PartType.RIMS,
      brand: 'FSA',
      model: 'SL-K AGX i25 Carbon',
      description: 'Obręcze karbonowe FSA SL-K AGX'
    }
  })

  const rimsVisionTrimax = await prisma.partProduct.create({
    data: {
      type: PartType.RIMS,
      brand: 'Vision',
      model: 'Trimax 30 AGX i23',
      description: 'Obręcze Vision Trimax 30'
    }
  })

  const rimsWTBi25 = await prisma.partProduct.create({
    data: {
      type: PartType.RIMS,
      brand: 'WTB',
      model: 'i25 TCS',
      description: 'Obręcze WTB i25 TCS Tubeless Ready'
    }
  })

  const rimsZipp303XPLR = await prisma.partProduct.create({
    data: {
      type: PartType.RIMS,
      brand: 'SRAM Zipp',
      model: '303 XPLR S Carbon',
      description: 'Obręcze karbonowe Zipp 303 XPLR'
    }
  })

  // --- KIEROWNICE ---
  const handlebarFSAWingPro = await prisma.partProduct.create({
    data: {
      type: PartType.HANDLEBAR,
      brand: 'FSA',
      model: 'A-Wing Pro',
      description: 'Kierownica gravelowa FSA A-Wing Pro'
    }
  })

  const handlebarKross = await prisma.partProduct.create({
    data: {
      type: PartType.HANDLEBAR,
      brand: 'Kross',
      model: 'Gravel Alu',
      description: 'Kierownica gravelowa Kross aluminiowa'
    }
  })

  // --- MOSTKI ---
  const stemFSAACR = await prisma.partProduct.create({
    data: {
      type: PartType.STEM,
      brand: 'FSA',
      model: 'NS ACR',
      description: 'Mostek FSA NS ACR'
    }
  })

  const stemKross = await prisma.partProduct.create({
    data: {
      type: PartType.STEM,
      brand: 'Kross',
      model: 'Alu 6061',
      description: 'Mostek Kross aluminiowy'
    }
  })

  // --- SIODŁA ---
  const saddleFizikTerraArgo = await prisma.partProduct.create({
    data: {
      type: PartType.SADDLE,
      brand: 'Fizik',
      model: 'Terra Argo X5',
      description: 'Siodło gravelowe Fizik Terra Argo X5'
    }
  })

  const saddleFizik = await prisma.partProduct.create({
    data: {
      type: PartType.SADDLE,
      brand: 'Fizik',
      model: 'Aliante R3',
      description: 'Siodło Fizik Aliante R3'
    }
  })

  const saddleWTBVolt = await prisma.partProduct.create({
    data: {
      type: PartType.SADDLE,
      brand: 'WTB',
      model: 'Volt Sport',
      description: 'Siodło WTB Volt Sport'
    }
  })

  const saddleSelleRoyal = await prisma.partProduct.create({
    data: {
      type: PartType.SADDLE,
      brand: 'Selle Royal',
      model: 'Scientia A3',
      description: 'Siodło Selle Royal Scientia'
    }
  })

  // --- SZTYCA ---
  const seatpostCarbon = await prisma.partProduct.create({
    data: {
      type: PartType.SEATPOST,
      brand: 'Kross',
      model: 'Carbon 27.2mm',
      description: 'Sztyca karbonowa Kross'
    }
  })

  const seatpostDropperXFusion = await prisma.partProduct.create({
    data: {
      type: PartType.SEATPOST,
      brand: 'X-Fusion',
      model: 'Manic Dropper',
      description: 'Sztyca regulowana X-Fusion Manic'
    }
  })

  // --- WIDELCE ---
  const forkCarbon = await prisma.partProduct.create({
    data: {
      type: PartType.FORK,
      brand: 'Kross',
      model: 'Carbon Gravel',
      description: 'Widelec karbonowy Kross'
    }
  })

  const forkRockShoxRudy = await prisma.partProduct.create({
    data: {
      type: PartType.FORK,
      brand: 'RockShox',
      model: 'Rudy Ultimate RD2 30mm',
      description: 'Widelec amortyzowany RockShox Rudy 30mm'
    }
  })

  // --- RAMY ---
  const frameCarbonKross = await prisma.partProduct.create({
    data: {
      type: PartType.FRAME,
      brand: 'Kross',
      model: 'Esker Carbon T784',
      description: 'Rama karbonowa Kross Esker T784'
    }
  })

  const frameCarbonKrossRS = await prisma.partProduct.create({
    data: {
      type: PartType.FRAME,
      brand: 'Kross',
      model: 'Esker RS Carbon Aero',
      description: 'Rama karbonowa aerodynamiczna Kross Esker RS'
    }
  })

  const frameAluKross = await prisma.partProduct.create({
    data: {
      type: PartType.FRAME,
      brand: 'Kross',
      model: 'Esker Aluminium 6061 Gen2',
      description: 'Rama aluminiowa Kross Esker Gen2'
    }
  })

  const frameSteelKross = await prisma.partProduct.create({
    data: {
      type: PartType.FRAME,
      brand: 'Kross',
      model: 'Esker Steel',
      description: 'Rama stalowa Kross Esker'
    }
  })

  // === SEED BIKE PRODUCTS - KROSS ESKER ===
  console.log('Creating BikeProducts - Kross Esker...')

  const eskerRS30 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker RS 3.0',
      year: 2024
    }
  })

  const eskerRS20 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker RS 2.0',
      year: 2024
    }
  })

  const eskerRS10 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker RS 1.0',
      year: 2024
    }
  })

  const eskerTR = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker TR',
      year: 2024
    }
  })

  const eskerADV30 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker ADV 3.0',
      year: 2026
    }
  })

  const eskerADV10 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker ADV 1.0',
      year: 2026
    }
  })

  const esker70 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 7.0',
      year: 2024
    }
  })

  const esker80 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 8.0',
      year: 2024
    }
  })

  const esker50Ultra = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 5.0 ULT.RA',
      year: 2024
    }
  })

  const esker60Ultra = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 6.0 ULT.RA',
      year: 2024
    }
  })

  const esker60GRX = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 6.0 GRX 2x12',
      year: 2024
    }
  })

  const esker40GRX = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker 4.0 GRX',
      year: 2024
    }
  })

  const eskerAXSLTD = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Kross',
      model: 'Esker AXS LTD',
      year: 2026
    }
  })

  // === Inne rowery (zachowane z poprzedniego seeda) ===
  const topstoneCarbon1 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'GRAVEL',
      brand: 'Cannondale',
      model: 'Topstone Carbon 1',
      year: 2024
    }
  })

  const domaneSL7 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'ROAD',
      brand: 'Trek',
      model: 'Domane SL 7',
      year: 2024
    }
  })

  const tarmacSL8 = await prisma.bikeProduct.create({
    data: {
      bikeType: 'ROAD',
      brand: 'Specialized',
      model: 'Tarmac SL8',
      year: 2024
    }
  })

  // === SEED DEFAULT PARTS FOR BIKES ===
  console.log('Creating BikeProductDefaultParts...')

  // --- Kross Esker RS 3.0 (SRAM Rival XPLR AXS, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerRS30.id, partProductId: frameCarbonKrossRS.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: eskerRS30.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerRS30.id, partProductId: chainSram12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerRS30.id, partProductId: cassetteSramRival1044.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerRS30.id, partProductId: cranksetSramRival40T.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: eskerRS30.id, partProductId: rdSramRivalXPLR.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerRS30.id, partProductId: shiftersSramRivalAXS.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerRS30.id, partProductId: brakesSramRival.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerRS30.id, partProductId: padsSram.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerRS30.id, partProductId: padsSram.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerRS30.id, partProductId: discSramCenterline.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerRS30.id, partProductId: discSramCenterline.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerRS30.id, partProductId: rimsFSACarbonAGX.id, partType: PartType.RIMS, expectedKm: 20000 },
      { bikeProductId: eskerRS30.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: eskerRS30.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: eskerRS30.id, partProductId: handlebarFSAWingPro.id, partType: PartType.HANDLEBAR, expectedKm: 25000 },
      { bikeProductId: eskerRS30.id, partProductId: stemFSAACR.id, partType: PartType.STEM, expectedKm: 40000 },
      { bikeProductId: eskerRS30.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerRS30.id, partProductId: saddleFizikTerraArgo.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: eskerRS30.id, partProductId: seatpostCarbon.id, partType: PartType.SEATPOST, expectedKm: 40000 },
      { bikeProductId: eskerRS30.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Kross Esker RS 2.0 (SRAM Apex XPLR AXS, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerRS20.id, partProductId: frameCarbonKrossRS.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: eskerRS20.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerRS20.id, partProductId: chainSram12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerRS20.id, partProductId: cassetteSramRival1044.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerRS20.id, partProductId: rdSramApexXPLR.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerRS20.id, partProductId: shiftersSramRivalAXS.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerRS20.id, partProductId: brakesSramRival.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerRS20.id, partProductId: padsSram.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerRS20.id, partProductId: padsSram.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerRS20.id, partProductId: discSramCenterline.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerRS20.id, partProductId: discSramCenterline.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerRS20.id, partProductId: rimsDTSwissG540.id, partType: PartType.RIMS, expectedKm: 15000 },
      { bikeProductId: eskerRS20.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: eskerRS20.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: eskerRS20.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerRS20.id, partProductId: saddleFizikTerraArgo.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: eskerRS20.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Kross Esker RS 1.0 (Shimano GRX 1x12, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerRS10.id, partProductId: frameCarbonKrossRS.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: eskerRS10.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerRS10.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerRS10.id, partProductId: cassetteShimanoSLX1051.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerRS10.id, partProductId: cranksetShimanoGRX40T.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: eskerRS10.id, partProductId: rdShimanoGRXRX822.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerRS10.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerRS10.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerRS10.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerRS10.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerRS10.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerRS10.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerRS10.id, partProductId: rimsVisionTrimax.id, partType: PartType.RIMS, expectedKm: 15000 },
      { bikeProductId: eskerRS10.id, partProductId: tireWTBByway44.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: eskerRS10.id, partProductId: tireWTBByway44.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: eskerRS10.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerRS10.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker TR (Shimano GRX 1x12, RockShox Rudy, dropper) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerTR.id, partProductId: frameAluKross.id, partType: PartType.FRAME, expectedKm: 60000 },
      { bikeProductId: eskerTR.id, partProductId: forkRockShoxRudy.id, partType: PartType.FORK, expectedKm: 20000 },
      { bikeProductId: eskerTR.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerTR.id, partProductId: cassetteShimanoSLX1051.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerTR.id, partProductId: cranksetShimanoGRX40T.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: eskerTR.id, partProductId: rdShimanoGRXRX822.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerTR.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerTR.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerTR.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerTR.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerTR.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerTR.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerTR.id, partProductId: rimsWTBi25.id, partType: PartType.RIMS, expectedKm: 15000 },
      { bikeProductId: eskerTR.id, partProductId: tireSchwalbeThunderBurt.id, partType: PartType.TIRE_FRONT, expectedKm: 3000 },
      { bikeProductId: eskerTR.id, partProductId: tireSchwalbeThunderBurt.id, partType: PartType.TIRE_REAR, expectedKm: 3000 },
      { bikeProductId: eskerTR.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerTR.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: eskerTR.id, partProductId: seatpostDropperXFusion.id, partType: PartType.SEATPOST, expectedKm: 20000 },
      { bikeProductId: eskerTR.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Kross Esker ADV 3.0 (SRAM Rival AXS 1x13, carbon, Zipp wheels) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerADV30.id, partProductId: frameCarbonKross.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: eskerADV30.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerADV30.id, partProductId: chainSram12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerADV30.id, partProductId: cassetteSramXG1046.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerADV30.id, partProductId: rdSramRivalXPLR.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerADV30.id, partProductId: shiftersSramRivalAXS.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerADV30.id, partProductId: brakesSramRival.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerADV30.id, partProductId: padsSram.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerADV30.id, partProductId: padsSram.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerADV30.id, partProductId: discSramCenterline.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerADV30.id, partProductId: discSramCenterline.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerADV30.id, partProductId: rimsZipp303XPLR.id, partType: PartType.RIMS, expectedKm: 25000 },
      { bikeProductId: eskerADV30.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: eskerADV30.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: eskerADV30.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerADV30.id, partProductId: saddleFizikTerraArgo.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: eskerADV30.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Kross Esker ADV 1.0 (Shimano GRX 1x12, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerADV10.id, partProductId: frameCarbonKross.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: eskerADV10.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerADV10.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerADV10.id, partProductId: cassetteShimanoSLX1051.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerADV10.id, partProductId: cranksetShimanoGRX40T.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: eskerADV10.id, partProductId: rdShimanoGRXRX822.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerADV10.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerADV10.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerADV10.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerADV10.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerADV10.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerADV10.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerADV10.id, partProductId: tireSchwalbeGOneR45.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: eskerADV10.id, partProductId: tireSchwalbeGOneR45.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: eskerADV10.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerADV10.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker 7.0 (Shimano GRX 1x11, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker70.id, partProductId: frameCarbonKross.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: esker70.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker70.id, partProductId: chainShimanoUltegra.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker70.id, partProductId: cassetteShimano1142.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker70.id, partProductId: rdShimanoGRXRX812.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker70.id, partProductId: shiftersShimanoGRX11.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker70.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker70.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker70.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker70.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker70.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker70.id, partProductId: rimsDTSwissG540.id, partType: PartType.RIMS, expectedKm: 15000 },
      { bikeProductId: esker70.id, partProductId: tireSchwalbe38.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: esker70.id, partProductId: tireSchwalbe38.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: esker70.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker70.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker 8.0 (Shimano GRX 2x11, carbon) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker80.id, partProductId: frameCarbonKross.id, partType: PartType.FRAME, expectedKm: 80000 },
      { bikeProductId: esker80.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker80.id, partProductId: chainShimanoUltegra.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker80.id, partProductId: cassetteShimanoGRX1134.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker80.id, partProductId: cranksetShimanoGRX2x.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: esker80.id, partProductId: rdShimanoGRXRX810.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker80.id, partProductId: shiftersShimanoGRX11.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker80.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker80.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker80.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker80.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker80.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker80.id, partProductId: tireSchwalbe38.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: esker80.id, partProductId: tireSchwalbe38.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: esker80.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker80.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: esker80.id, partProductId: seatpostCarbon.id, partType: PartType.SEATPOST, expectedKm: 40000 },
    ]
  })

  // --- Kross Esker 5.0 ULT.RA (Shimano GRX 1x12, alu) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker50Ultra.id, partProductId: frameAluKross.id, partType: PartType.FRAME, expectedKm: 60000 },
      { bikeProductId: esker50Ultra.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker50Ultra.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker50Ultra.id, partProductId: cassetteShimanoSLX1051.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker50Ultra.id, partProductId: cranksetShimanoGRX40T.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: esker50Ultra.id, partProductId: rdShimanoGRXRX822.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker50Ultra.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker50Ultra.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker50Ultra.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker50Ultra.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker50Ultra.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker50Ultra.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker50Ultra.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: esker50Ultra.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: esker50Ultra.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker50Ultra.id, partProductId: saddleSelleRoyal.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker 6.0 ULT.RA (Shimano GRX 2x12, alu) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker60Ultra.id, partProductId: frameAluKross.id, partType: PartType.FRAME, expectedKm: 60000 },
      { bikeProductId: esker60Ultra.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker60Ultra.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker60Ultra.id, partProductId: cassetteShimanoGRX1134.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker60Ultra.id, partProductId: cranksetShimanoGRX2x.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: esker60Ultra.id, partProductId: rdShimanoGRXRX820.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker60Ultra.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker60Ultra.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker60Ultra.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker60Ultra.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker60Ultra.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker60Ultra.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker60Ultra.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: esker60Ultra.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: esker60Ultra.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker60Ultra.id, partProductId: saddleSelleRoyal.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker 6.0 GRX 2x12 (Shimano GRX 2x12, alu) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker60GRX.id, partProductId: frameAluKross.id, partType: PartType.FRAME, expectedKm: 60000 },
      { bikeProductId: esker60GRX.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker60GRX.id, partProductId: chainShimanoDeore12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker60GRX.id, partProductId: cassetteShimanoGRX1134.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker60GRX.id, partProductId: cranksetShimanoGRX2x.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: esker60GRX.id, partProductId: rdShimanoGRXRX820.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker60GRX.id, partProductId: shiftersShimanoGRX12.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker60GRX.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker60GRX.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker60GRX.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker60GRX.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker60GRX.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker60GRX.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: esker60GRX.id, partProductId: tireWTBRiddler45.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: esker60GRX.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker60GRX.id, partProductId: saddleSelleRoyal.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker 4.0 GRX (Shimano GRX 2x10, stal) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: esker40GRX.id, partProductId: frameSteelKross.id, partType: PartType.FRAME, expectedKm: 100000 },
      { bikeProductId: esker40GRX.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: esker40GRX.id, partProductId: chainShimano105.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: esker40GRX.id, partProductId: cassetteShimanoGRX1134.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: esker40GRX.id, partProductId: cranksetShimanoGRX2x.id, partType: PartType.CRANKSET, expectedKm: 25000 },
      { bikeProductId: esker40GRX.id, partProductId: rdShimanoGRXRX400.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: esker40GRX.id, partProductId: shiftersShimanoGRX10.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: esker40GRX.id, partProductId: brakesShimanoGRX.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: esker40GRX.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: esker40GRX.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: esker40GRX.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: esker40GRX.id, partProductId: discShimanoRT70.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: esker40GRX.id, partProductId: hubsShimanoGRX.id, partType: PartType.HUBS, expectedKm: 25000 },
      { bikeProductId: esker40GRX.id, partProductId: tireWTBResolute42.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: esker40GRX.id, partProductId: tireWTBResolute42.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: esker40GRX.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: esker40GRX.id, partProductId: saddleWTBVolt.id, partType: PartType.SADDLE, expectedKm: 15000 },
    ]
  })

  // --- Kross Esker AXS LTD (SRAM elektronika) ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: eskerAXSLTD.id, partProductId: frameAluKross.id, partType: PartType.FRAME, expectedKm: 60000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: forkCarbon.id, partType: PartType.FORK, expectedKm: 40000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: chainSram12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: eskerAXSLTD.id, partProductId: cassetteSramRival1044.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: rdSramApexXPLR.id, partType: PartType.DERAILLEUR_REAR, expectedKm: 15000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: shiftersSramRivalAXS.id, partType: PartType.SHIFTERS, expectedKm: 25000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: brakesSramRival.id, partType: PartType.BRAKES, expectedKm: 25000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: padsSram.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: eskerAXSLTD.id, partProductId: padsSram.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: eskerAXSLTD.id, partProductId: discSramCenterline.id, partType: PartType.DISC_FRONT, expectedKm: 12000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: discSramCenterline.id, partType: PartType.DISC_REAR, expectedKm: 12000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: tireSchwalbeGOneRS45.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: handlebarTapeFizik.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 5000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: saddleFizik.id, partType: PartType.SADDLE, expectedKm: 15000 },
      { bikeProductId: eskerAXSLTD.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Cannondale Topstone Carbon 1 ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: topstoneCarbon1.id, partProductId: chainShimanoUltegra.id, partType: PartType.CHAIN, expectedKm: 2000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: cassetteShimanoGRX1134.id, partType: PartType.CASSETTE, expectedKm: 6000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: tireWTBByway44.id, partType: PartType.TIRE_FRONT, expectedKm: 3500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: tireWTBByway44.id, partType: PartType.TIRE_REAR, expectedKm: 3500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 2500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 2500 },
      { bikeProductId: topstoneCarbon1.id, partProductId: cranksetShimanoGRX40T.id, partType: PartType.CRANKSET, expectedKm: 10000 },
      { bikeProductId: topstoneCarbon1.id, partProductId: sealantStans.id, partType: PartType.TUBELESS_SEALANT, expectedKm: 3000 },
    ]
  })

  // --- Trek Domane SL 7 ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: domaneSL7.id, partProductId: chainShimano105.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: domaneSL7.id, partProductId: cassetteShimano105.id, partType: PartType.CASSETTE, expectedKm: 8000 },
      { bikeProductId: domaneSL7.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: domaneSL7.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
      { bikeProductId: domaneSL7.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_FRONT, expectedKm: 3000 },
      { bikeProductId: domaneSL7.id, partProductId: padsShimanoGRX.id, partType: PartType.PADS_REAR, expectedKm: 3000 },
      { bikeProductId: domaneSL7.id, partProductId: handlebarTapeSupacaz.id, partType: PartType.HANDLEBAR_TAPE, expectedKm: 6000 },
    ]
  })

  // --- Specialized Tarmac SL8 ---
  await prisma.bikeProductDefaultPart.createMany({
    data: [
      { bikeProductId: tarmacSL8.id, partProductId: chainSram12.id, partType: PartType.CHAIN, expectedKm: 2500 },
      { bikeProductId: tarmacSL8.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_FRONT, expectedKm: 4000 },
      { bikeProductId: tarmacSL8.id, partProductId: tireContinentalGP5000.id, partType: PartType.TIRE_REAR, expectedKm: 4000 },
    ]
  })

  console.log('Seeding completed!')
  console.log(`Created ${await prisma.partProduct.count()} PartProducts`)
  console.log(`Created ${await prisma.bikeProduct.count()} BikeProducts`)
  console.log(`Created ${await prisma.bikeProductDefaultPart.count()} BikeProductDefaultParts`)
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
