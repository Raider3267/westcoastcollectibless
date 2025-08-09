import fs from 'fs/promises'
import { parse } from 'csv-parse/sync'
import { stringify } from 'csv-stringify/sync'

// Function to extract series name from title
function getSeriesName(title) {
  const titleLower = title.toLowerCase()
  
  // Check for specific series keywords in order of specificity
  if (titleLower.includes('paradox')) return 'SKULLPANDA Paradox Series'
  if (titleLower.includes('crystal ball')) return 'Labubu Crystal Ball Series'
  if (titleLower.includes('wacky mart')) return 'Wacky Mart Series'
  if (titleLower.includes('big into energy')) return 'Big Into Energy Series'
  if (titleLower.includes('crying again')) return 'CRYBABY Crying Again Series'
  if (titleLower.includes('forest fairy tale')) return 'Labubu Forest Fairy Tale Series'
  if (titleLower.includes("l'impressionnisme")) return 'SKULLPANDA L\'impressionnisme Series'
  if (titleLower.includes('gummy bear')) return 'Hacipupu Gummy Bear Series'
  if (titleLower.includes('siege and confinement')) return 'SKULLPANDA Siege and Confinement Series'
  if (titleLower.includes('family cute together')) return 'Disney Mickey & Friends Family Cute Together Series'
  if (titleLower.includes('fragrance')) return 'The Monsters Fragrance Series'
  
  // Check for character-based series
  if (titleLower.includes('labubu')) return 'Labubu Series'
  if (titleLower.includes('skullpanda')) return 'SKULLPANDA Series'  
  if (titleLower.includes('hacipupu')) return 'Hacipupu Series'
  if (titleLower.includes('crybaby')) return 'CRYBABY Series'
  if (titleLower.includes('disney')) return 'Disney Collaboration Series'
  
  // Generic fallback
  return 'POP MART Series'
}

// Function to determine exclusivity
function getExclusivity(originalDescription) {
  const descLower = originalDescription.toLowerCase()
  
  if (descLower.includes('exclusive') || descLower.includes('china exclusive') || 
      descLower.includes('asia exclusive') || descLower.includes('limited edition') ||
      descLower.includes('shanghai') || descLower.includes('not sold in u.s')) {
    return 'Exclusive release – not available in US stores'
  }
  
  return 'Official global release'
}

// Function to determine inclusions
function getInclusions(originalDescription) {
  const descLower = originalDescription.toLowerCase()
  
  if (descLower.includes('includes') || descLower.includes('set') || 
      descLower.includes('full set') || descLower.includes('complete set') ||
      descLower.includes('accessories') || descLower.includes('storage bag') ||
      descLower.includes('original card')) {
    return 'Includes all original accessories and packaging'
  }
  
  return 'Includes original packaging'
}

// Extract specific product details from original description
function extractSpecificDetails(originalDescription, title) {
  const bullets = []
  
  // Clean HTML and extract meaningful content - fix the order!
  const cleanText = originalDescription
    .replace(/<br\s*\/?>/gi, '\n')      // First convert br tags to newlines
    .replace(/<\/p>/gi, '\n')           // Convert closing p tags to newlines  
    .replace(/<p[^>]*>/gi, '\n')        // Convert opening p tags to newlines
    .replace(/<[^>]*>/g, '')            // Then remove all other HTML tags
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    
  // Split into lines and clean up
  const lines = cleanText.split(/[\n\r]+/).map(line => 
    line.replace(/^[-•]\s*/, '').trim()
  ).filter(line => line.length > 10)
  
  lines.forEach(line => {
    // Skip shipping, questions, and generic short lines
    if (line.match(/ships|shipping|santa monica|from (the )?u\.?s\.?|questions|email|message|buy with confidence|damaged boxes|let me know if interested/i)) return
    if (line.match(/^(authentic|pop mart|brand new|factory.sealed|official)$/i)) return
    
    // Preserve lines that are already well-formatted product details with emojis
    if (line.match(/^[🎁✅🐰✨🌟💎🎯⭐🕯️🎨🌸🧸💰🎭🎲]\s*[A-Z]/)) {
      // Skip the standard ones we'll add anyway
      if (!line.match(/brand.new.*factory.sealed|official.*pop mart.*product/i)) {
        bullets.push(line)
      }
      return
    }
    
    // Preserve lines with specific product characteristics  
    if (line.match(/cute.*made of.*vinyl|approximately.*tall|approximately.*inches|vinyl face.*soft.*plush|ceramic.*holder.*reusable|scented.*candle|fragrance.*blind|collectible.*holder|reusable.*decor|aromatic notes|fits.*cases|surprise scent|glittering snow globe|qi.certified|wireless charging|3d printed|fits standard.*figures/i)) {
      bullets.push(line)
    }
    
    // Preserve lines about exclusivity with specific details
    if (line.match(/exclusive.*release.*from.*series|asia exclusive.*release|limited.*edition|china exclusive|not sold in.*stores|rare.*china.exclusive|exclusive.*2025.*shanghai|limited release.*2025.*shanghai|authenticity.*qr.*code/i)) {
      bullets.push(line)
    }
    
    // Preserve lines about what's included or special features
    if (line.match(/includes.*original|comes.*with.*original|complete set|all colors.*included|random selection|each figure comes|chance.*pull.*secret|includes.*storage.*bag|includes.*pumpkin.*costume|complete.*full.*set/i)) {
      bullets.push(line)
    }
    
    // Preserve collector/fan oriented details with specifics
    if (line.match(/perfect for.*fans.*collectors|collectors.*alike|perfect for.*display.*cuddling|perfect for.*halloween.*displays|perfect for.*mystery.*box.*lovers/i)) {
      bullets.push(line)
    }
    
    // Preserve technical/functional details
    if (line.match(/fast charging.*support|sleek.*compact.*design|led indicator.*light|non.slip.*base|universal.*compatibility|qi.enabled.*devices|opened.*carefully.*verify|unopened.*box.*inner.*packaging|brand new.*never.*opened/i)) {
      bullets.push(line)
    }
  })
  
  return bullets
}

// Function to generate standardized description with specific details for each product type
function generateStandardDescription(title, originalDescription) {
  // Clean title for opening line
  const cleanTitle = title.replace(/–.*?(authentic|us seller|new).*$/i, '').trim()
  const titleLower = title.toLowerCase()
  const descLower = originalDescription.toLowerCase()
  
  // Build standardized format with product-specific details
  const standardBullets = []
  
  // Always start with brand new + packaging
  standardBullets.push('🎁 Brand‑new, factory‑sealed in original packaging')
  
  // Add official/exclusive status based on original content
  if (descLower.includes('exclusive') || descLower.includes('not sold in u.s') ||
      descLower.includes('asia exclusive') || descLower.includes('china exclusive')) {
    standardBullets.push('✅ Official Pop Mart product – not sold in U.S. stores')
  } else {
    standardBullets.push('✅ Official Pop Mart product – 100% authentic')
  }
  
  // Add product-specific details based on title/type
  if (titleLower.includes('crybaby') && titleLower.includes('crying again')) {
    if (titleLower.includes('full set') || titleLower.includes('whole')) {
      standardBullets.push('🧸 Complete vinyl face plush collection with soft, huggable bodies')
      standardBullets.push('🎁 Includes all standard characters with chance to receive secret edition')
      standardBullets.push('✨ Perfect for Pop Mart collectors and fans of designer plush toys')
    } else if (titleLower.includes('single box')) {
      // This is the specific single box product you want to format
      return `100% Authentic POP MART release – Crybaby Crying Again Vinyl Face Plush Blind Box
• Brand new and sealed in original packaging
• Series: Crying Again
• Official global release
• Includes one random plush with a vinyl face and soft plush body – chance to pull the secret edition
• Perfect for POP MART fans, mystery box lovers, and designer plush collectors`
    } else {
      standardBullets.push('🎁 Brand new and sealed in original packaging')
      standardBullets.push('📝 Series: Crying Again')
      standardBullets.push('✅ Official global release')
      standardBullets.push('🧸 Includes one random plush with a vinyl face and soft plush body – chance to pull the secret edition')
      standardBullets.push('✨ Perfect for POP MART fans, mystery box lovers, and designer plush collectors')
      return `100% Authentic POP MART release – Crybaby Crying Again Vinyl Face Plush Blind Box\n${standardBullets.slice(1).map(bullet => `• ${bullet.replace(/^[🎁📝✅🧸✨]\s*/, '')}`).join('\n')}`
    }
  } else if (titleLower.includes('skullpanda') && titleLower.includes('shanghai') && titleLower.includes('siege')) {
    standardBullets.push('🏮 Limited edition 2025 Shanghai exhibition exclusive hanger card')
    standardBullets.push('✨ Rare "Siege and Confinement" series figure with official QR authentication')
    standardBullets.push('🎯 Highly sought-after collector piece from exclusive Shanghai drop')
  } else if (titleLower.includes('big into energy') && titleLower.includes('wireless')) {
    standardBullets.push('🔌 Qi-certified wireless charger compatible with iPhone, Samsung, and all Qi-enabled devices')
    standardBullets.push('⚡ Fast charging technology with LED status indicator and non-slip base')
    standardBullets.push('✨ Sleek Labubu-themed design perfect for desk, nightstand, or workspace')
  } else if (titleLower.includes('big into energy') && titleLower.includes('snow globe')) {
    standardBullets.push('❄️ Magical snow globe featuring Labubu in glittering winter wonderland scene')
    standardBullets.push('✨ Limited edition collectible from the Big Into Energy series')
    standardBullets.push('🎁 Perfect display piece for Pop Mart enthusiasts and snow globe collectors')
  } else if (titleLower.includes('forest fairy tale')) {
    standardBullets.push('🧚 Beautiful woodland-themed Labubu with intricate fairy tale detailing')
    standardBullets.push('✨ Rare China-exclusive release not available in US retail stores')
    standardBullets.push('🎁 Includes exclusive Labubu storage bag and original packaging')
  } else if (titleLower.includes('tempura shrimp') && titleLower.includes('earphone')) {
    standardBullets.push('🍤 Adorable Labubu Tempura Shrimp design earphone case holder')
    standardBullets.push('🎧 Fits most standard wireless earphone cases with secure closure')
    standardBullets.push('✨ Fun collectible accessory perfect for Pop Mart fans on-the-go')
  } else if (titleLower.includes('crystal ball') && titleLower.includes('blind box')) {
    standardBullets.push('🔮 Complete set of Labubu Crystal Ball figures from Asia-exclusive release')
    standardBullets.push('🌈 All colors included - every character from the mystical series')
    standardBullets.push('✨ Rare collectible set perfect for dedicated Pop Mart collectors')
  } else if (titleLower.includes('skullpanda') && titleLower.includes('paradox') && titleLower.includes('candle')) {
    standardBullets.push('🕯️ Scented candle with collectible ceramic Skullpanda figure holder')
    standardBullets.push('🎨 Reusable ceramic holder becomes decorative piece after candle burns')
    standardBullets.push('🌸 Surprise aromatic scent from the exclusive Paradox fragrance series')
  } else if (titleLower.includes('3d printed') && titleLower.includes('pumpkin')) {
    standardBullets.push('🎃 Custom 3D printed Halloween outfit set designed for standard Labubu figures')
    standardBullets.push('🧡 Includes pumpkin costume, mini prop, and headband - customizable colors available')
    standardBullets.push('✨ Perfect for Halloween displays, photoshoots, or seasonal collection themes')
  } else if (titleLower.includes('wacky mart') && titleLower.includes('vinyl plush')) {
    standardBullets.push('🐰 Cute Labubu pendant made of soft vinyl, approximately 7″ tall')
    standardBullets.push('✨ Exclusive release from the Wacky Mart series, perfect for fans of The Monsters and Pop Mart collectors')
  } else {
    // Fallback for other products
    const seriesName = getSeriesName(title)
    standardBullets.push(`✨ Exclusive release from the ${seriesName}, perfect for fans of The Monsters and Pop Mart collectors`)
  }
  
  // Format as clean text with bullet points
  const bulletText = standardBullets.map(bullet => `• ${bullet}`).join('\n')
  
  return `100% Authentic POP MART ${cleanTitle}\n${bulletText}`
}

async function processCSV() {
  try {
    console.log('📖 Reading export.csv...')
    const csvContent = await fs.readFile('export.csv', 'utf-8')
    
    console.log('🔍 Parsing CSV data...')
    const records = parse(csvContent, { columns: true, skip_empty_lines: true })
    
    console.log(`📊 Processing ${records.length} records...`)
    
    // Process each record
    const processedRecords = records.map((record, index) => {
      const title = record.title || ''
      const originalDescription = record.description || ''
      
      // Skip empty titles (these are usually variant rows)
      if (!title.trim()) {
        console.log(`⏭️  Row ${index + 1}: Skipping empty title`)
        return record // Return unchanged
      }
      
      console.log(`✨ Row ${index + 1}: Processing "${title.substring(0, 50)}..."`)
      
      // Generate new standardized description
      const newDescription = generateStandardDescription(title, originalDescription)
      
      // Return record with updated description
      return {
        ...record,
        description: newDescription
      }
    })
    
    console.log('💾 Generating new CSV...')
    const newCsvContent = stringify(processedRecords, { header: true })
    
    // Write to new file
    const outputFileName = 'export_standardized.csv'
    await fs.writeFile(outputFileName, newCsvContent)
    
    console.log(`✅ Success! Standardized descriptions saved to: ${outputFileName}`)
    console.log(`📋 Processed ${records.filter(r => r.title?.trim()).length} products with new descriptions`)
    
    // Show a few examples
    console.log('\n🎯 Example standardized descriptions:')
    const examples = processedRecords
      .filter(r => r.title?.trim())
      .slice(0, 3)
      .map((r, i) => `\n${i + 1}. ${r.title}\n${r.description.replace(/<[^>]*>/g, '').substring(0, 200)}...`)
    
    console.log(examples.join('\n'))
    
  } catch (error) {
    console.error('❌ Error processing CSV:', error)
  }
}

// Run the script
processCSV()