#!/usr/bin/env npx tsx

/**
 * CLI do importu danych rowerów i części
 *
 * Użycie:
 *   npx tsx import/cli/import.cli.ts bikes <plik.json> [--dry-run] [-v]
 *   npx tsx import/cli/import.cli.ts parts <plik.json> [--dry-run] [-v]
 *   npx tsx import/cli/import.cli.ts full <plik.json> [--dry-run] [-v]
 *
 * Opcje:
 *   --dry-run  Tryb testowy - nie zapisuje do bazy
 *   -v         Verbose - szczegółowy output
 *   --no-upsert  Nie aktualizuj istniejących rekordów
 */

import * as fs from 'fs'
import * as path from 'path'
import { loadBikesFromJson, loadBikes, disconnect as disconnectBikes } from '../loaders/bike.loader'
import { loadPartsFromJson, disconnect as disconnectParts } from '../loaders/part.loader'
import { loadDefaultPartsFromBikeData, disconnect as disconnectDefaultParts } from '../loaders/default-parts.loader'
import { RawBikesFileSchema, RawPartsFileSchema, RawBikeData } from '../schemas'

// Kolory dla terminala (bez zewnętrznych zależności)
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(message: string, color?: keyof typeof colors): void {
  if (color && colors[color]) {
    console.log(`${colors[color]}${message}${colors.reset}`)
  } else {
    console.log(message)
  }
}

function printHelp(): void {
  console.log(`
${colors.bright}BikeApp Import CLI${colors.reset}

${colors.cyan}Użycie:${colors.reset}
  npx tsx import/cli/import.cli.ts <command> <plik.json> [opcje]

${colors.cyan}Komendy:${colors.reset}
  bikes     Import rowerów (BikeProduct)
  parts     Import części (PartProduct)
  full      Import rowerów + domyślnych części (BikeProductDefaultPart)

${colors.cyan}Opcje:${colors.reset}
  --dry-run     Tryb testowy - nie zapisuje do bazy
  -v, --verbose Szczegółowy output
  --no-upsert   Nie aktualizuj istniejących rekordów (skip)

${colors.cyan}Przykłady:${colors.reset}
  npx tsx import/cli/import.cli.ts bikes data/bikes/kross-2024.json
  npx tsx import/cli/import.cli.ts parts data/parts/shimano.json --dry-run
  npx tsx import/cli/import.cli.ts full data/bikes/canyon.json -v
`)
}

async function importBikes(filePath: string, options: { dryRun: boolean; verbose: boolean; upsert: boolean }): Promise<void> {
  log(`\n📂 Wczytuję plik: ${filePath}`, 'cyan')

  if (!fs.existsSync(filePath)) {
    log(`❌ Plik nie istnieje: ${filePath}`, 'red')
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  if (options.dryRun) {
    log('🔍 Tryb DRY-RUN - dane nie będą zapisywane do bazy', 'yellow')
  }

  log('\n🚴 Importuję rowery...', 'blue')

  const result = await loadBikesFromJson(content, options)

  // Podsumowanie
  console.log('')
  log('📊 Podsumowanie:', 'bright')
  log(`  ✅ Utworzono: ${result.created}`, 'green')
  log(`  🔄 Zaktualizowano: ${result.updated}`, 'blue')
  log(`  ⏭️  Pominięto: ${result.skipped}`, 'yellow')

  if (result.errors.length > 0) {
    log(`  ❌ Błędy: ${result.errors.length}`, 'red')
    if (options.verbose) {
      for (const err of result.errors) {
        console.log(`     - ${err.data.brand || '?'} ${err.data.model || '?'}: ${err.error}`)
      }
    }
  }

  await disconnectBikes()
}

async function importParts(filePath: string, options: { dryRun: boolean; verbose: boolean; upsert: boolean }): Promise<void> {
  log(`\n📂 Wczytuję plik: ${filePath}`, 'cyan')

  if (!fs.existsSync(filePath)) {
    log(`❌ Plik nie istnieje: ${filePath}`, 'red')
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  if (options.dryRun) {
    log('🔍 Tryb DRY-RUN - dane nie będą zapisywane do bazy', 'yellow')
  }

  log('\n🔧 Importuję części...', 'blue')

  const result = await loadPartsFromJson(content, options)

  // Podsumowanie
  console.log('')
  log('📊 Podsumowanie:', 'bright')
  log(`  ✅ Utworzono: ${result.created}`, 'green')
  log(`  🔄 Zaktualizowano: ${result.updated}`, 'blue')
  log(`  ⏭️  Pominięto: ${result.skipped}`, 'yellow')

  if (result.errors.length > 0) {
    log(`  ❌ Błędy: ${result.errors.length}`, 'red')
    if (options.verbose) {
      for (const err of result.errors) {
        console.log(`     - ${err.data.brand || '?'} ${err.data.model || '?'}: ${err.error}`)
      }
    }
  }

  await disconnectParts()
}

async function importFull(filePath: string, options: { dryRun: boolean; verbose: boolean; upsert: boolean }): Promise<void> {
  log(`\n📂 Wczytuję plik: ${filePath}`, 'cyan')

  if (!fs.existsSync(filePath)) {
    log(`❌ Plik nie istnieje: ${filePath}`, 'red')
    process.exit(1)
  }

  const content = fs.readFileSync(filePath, 'utf-8')

  // Parsuj JSON
  let data: unknown
  try {
    data = JSON.parse(content)
  } catch {
    log('❌ Nieprawidłowy JSON', 'red')
    process.exit(1)
  }

  // Waliduj schema
  const parsed = RawBikesFileSchema.safeParse(data)
  if (!parsed.success) {
    log(`❌ Błąd walidacji: ${parsed.error.message}`, 'red')
    process.exit(1)
  }

  if (options.dryRun) {
    log('🔍 Tryb DRY-RUN - dane nie będą zapisywane do bazy', 'yellow')
  }

  // 1. Importuj rowery
  log('\n🚴 Krok 1/2: Importuję rowery...', 'blue')
  const bikesResult = await loadBikes(parsed.data.bikes, options)

  log(`  ✅ Utworzono: ${bikesResult.created}`, 'green')
  log(`  🔄 Zaktualizowano: ${bikesResult.updated}`, 'blue')
  log(`  ⏭️  Pominięto: ${bikesResult.skipped}`, 'yellow')

  // 2. Importuj domyślne części
  log('\n🔧 Krok 2/2: Importuję domyślne części...', 'blue')

  let totalPartsCreated = 0
  let totalPartsSkipped = 0
  let totalPartsErrors = 0

  for (const bike of parsed.data.bikes) {
    if (bike.components.length === 0) continue

    if (options.verbose) {
      log(`  ${bike.brand} ${bike.model}:`, 'cyan')
    }

    const partsResult = await loadDefaultPartsFromBikeData(bike, options)

    if (!partsResult.bikeFound) {
      if (options.verbose) {
        log(`    ⚠️ Rower nie znaleziony w bazie`, 'yellow')
      }
      continue
    }

    totalPartsCreated += partsResult.created
    totalPartsSkipped += partsResult.skipped
    totalPartsErrors += partsResult.errors.length
  }

  // Podsumowanie
  console.log('')
  log('📊 Podsumowanie końcowe:', 'bright')
  log(`  🚴 Rowery: ${bikesResult.created} utworzono, ${bikesResult.updated} zaktualizowano`, 'green')
  log(`  🔧 Domyślne części: ${totalPartsCreated} utworzono, ${totalPartsSkipped} pominięto`, 'green')

  if (bikesResult.errors.length > 0 || totalPartsErrors > 0) {
    log(`  ❌ Błędy: ${bikesResult.errors.length + totalPartsErrors}`, 'red')
  }

  await disconnectBikes()
  await disconnectDefaultParts()
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)

  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp()
    process.exit(0)
  }

  const command = args[0]
  const filePath = args[1]

  if (!filePath) {
    log('❌ Brak ścieżki do pliku', 'red')
    printHelp()
    process.exit(1)
  }

  const options = {
    dryRun: args.includes('--dry-run'),
    verbose: args.includes('-v') || args.includes('--verbose'),
    upsert: !args.includes('--no-upsert'),
  }

  // Rozwiń ścieżkę
  const absolutePath = path.resolve(process.cwd(), filePath)

  try {
    switch (command) {
      case 'bikes':
        await importBikes(absolutePath, options)
        break
      case 'parts':
        await importParts(absolutePath, options)
        break
      case 'full':
        await importFull(absolutePath, options)
        break
      default:
        log(`❌ Nieznana komenda: ${command}`, 'red')
        printHelp()
        process.exit(1)
    }

    log('\n✨ Gotowe!', 'green')
  } catch (error) {
    log(`\n❌ Błąd: ${error instanceof Error ? error.message : String(error)}`, 'red')
    process.exit(1)
  }
}

main()
