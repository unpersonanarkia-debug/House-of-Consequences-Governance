// engine/validator.js – TOIMIVA AJETTAVA
import Ajv from 'ajv';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const ajv = new Ajv({ 
  allErrors: true, 
  verbose: true,
  strict: false 
});

// Lataa schema
const schemaPath = path.join(__dirname, '../schemas/evidence-pack-v1.0.json');
const schema = JSON.parse(await fs.readFile(schemaPath, 'utf8'));
const validate = ajv.compile(schema);

console.log('🏛️ House of Consequences Governance Validator v1.0\n');

async function validateCase(filePath) {
  try {
    const data = JSON.parse(await fs.readFile(filePath, 'utf8'));
    const valid = validate(data);
    
    if (valid) {
      console.log(✅ ${path.basename(filePath)});
      
      // Näytä risk score
      const riskScore = data.governance_assessment?.structural_risk_score;
      const pattern = data.governance_assessment?.canonical_pattern;
      const cost = data.attribution?.economic_impact?.annual_total_cost;
      
      if (riskScore) {
        console.log(   Risk Score: ${riskScore.toFixed(2)});
        console.log(   Pattern: ${pattern});
        if (cost) console.log(   Cost: ${cost.toLocaleString()}€/vuosi);
      }
      return true;
    } else {
      console.error(❌ ${path.basename(filePath)});
      console.error('Virheet:', validate.errors.map(e =>   - ${e.instancePath}: ${e.message}).join('\n'));
      return false;
    }
  } catch (error) {
    console.error(💥 ${path.basename(filePath)}: ${error.message});
    return false;
  }
}

// Etsi kaikki cases/
const casesDir = path.join(__dirname, '../cases');
try {
  const files = await fs.readdir(casesDir);
  const caseFiles = files.filter(f => f.endsWith('.json'));
  
  if (caseFiles.length === 0) {
    console.log('⚠️  Ei cases/ kansiota tai JSON-tiedostoja');
    console.log('Luo: cases/healthcare-viive_normiksi-001.json');
  }
  
  for (const file of caseFiles) {
    await validateCase(path.join(casesDir, file));
  }
} catch (error) {
  console.log('⚠️  Luo cases/ kansio testausta varten');
}

// Test schema itse
console.log('\n📋 Schema valid:', ajv.validateSchema(schema) ? '✅' : '❌');
