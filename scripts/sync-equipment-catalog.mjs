import fs from 'node:fs';
import path from 'node:path';

const wikiRoot = path.resolve(process.cwd());
const docsRoot = path.resolve(wikiRoot, '..', 'arkhai', 'mmorpg-design-docs', '05-items-and-equipment', 'families');
const outputPath = path.join(wikiRoot, 'data', 'equipment-catalog.json');
const outputScriptPath = path.join(wikiRoot, 'assets', 'equipment-catalog.js');
const imageRoot = path.join(wikiRoot, 'assets', 'images', 'items');

const rarityOrder = ['Incomum', 'Raro', 'Epico', 'Lendario'];
const tierOrder = ['I', 'II', 'III', 'IV'];
const categoryFolderByName = {
  weapons: 'weapons',
  armor: 'armors',
  accessories: 'accessories',
  materials: 'materials'
};
const weaponTypeFolderByName = {
  Adaga: 'daggers',
  Espada: 'swords',
  Cajado: 'staffs',
  Arco: 'bows',
  Pistola: 'pistols',
  Martelo: 'hammers'
};

function slugify(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function slugifyItemId(value) {
  return slugify(value).replace(/-/g, '_');
}

function readText(filePath) {
  return fs.readFileSync(filePath, 'utf8');
}

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function splitCells(line) {
  return line
    .trim()
    .replace(/^\|/, '')
    .replace(/\|$/, '')
    .split('|')
    .map(cell => cell.trim());
}

function isSeparatorRow(line) {
  return /^\|?[\s:\-|]+\|?$/.test(line.trim());
}

function parseTables(text) {
  const lines = text.split(/\r?\n/);
  const tables = [];
  const headingStack = [];
  let currentHeading = [];

  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    const headingMatch = line.match(/^(#{1,6})\s+(.*)$/);

    if (headingMatch) {
      const level = headingMatch[1].length;
      const title = headingMatch[2].trim();
      currentHeading = currentHeading.slice(0, level - 1);
      currentHeading[level - 1] = title;
      headingStack.length = 0;
      currentHeading.forEach(item => headingStack.push(item));
      continue;
    }

    if (!line.trim().startsWith('|')) {
      continue;
    }

    const block = [line];
    let cursor = i + 1;

    while (cursor < lines.length && lines[cursor].trim().startsWith('|')) {
      block.push(lines[cursor]);
      cursor += 1;
    }

    if (block.length < 2) {
      continue;
    }

    const headerLine = block[0];
    const separatorLine = block[1];
    const bodyLines = isSeparatorRow(separatorLine) ? block.slice(2) : block.slice(1);
    const headers = splitCells(headerLine);
    const rows = bodyLines
      .filter(row => row.trim())
      .map(row => splitCells(row))
      .filter(row => row.length > 0);

    tables.push({
      headingPath: [...headingStack],
      headers,
      rows
    });

    i = cursor - 1;
  }

  return tables;
}

function findField(text, label) {
  const pattern = new RegExp(`\\*\\*${label.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}:\\*\\*\\s*(.+)$`, 'mi');
  const match = text.match(pattern);
  return match ? match[1].trim() : '';
}

function findParagraphAfterHeading(text, heading) {
  const lines = text.split(/\r?\n/);
  let inSection = false;
  const collected = [];

  for (const line of lines) {
    if (line.trim() === heading) {
      inSection = true;
      continue;
    }

    if (!inSection) {
      continue;
    }

    if (/^#{1,6}\s+/.test(line) || line.trim() === '---') {
      break;
    }

    if (line.trim().startsWith('|')) {
      break;
    }

    if (line.trim()) {
      collected.push(line.trim());
    } else if (collected.length) {
      break;
    }
  }

  return collected.join(' ').replace(/\s+/g, ' ').trim();
}

function splitList(value) {
  return value
    .split(',')
    .map(part => part.trim())
    .filter(Boolean);
}

function parseIntroFields(text) {
  return {
    region: findField(text, 'Regiao principal'),
    markName: findField(text, 'Marca de Fonte'),
    markEffect: findField(text, 'Efeito da Marca'),
    attributes: splitList(findField(text, 'Atributos tematicos')),
    resources: splitList(findField(text, 'Recursos de coleta')),
    materials: splitList(findField(text, 'Materiais de familia'))
  };
}

function buildVariantPath(category, familyId, groupSlug, baseName, tier) {
  const folder = categoryFolderByName[category];
  const variantId = `${slugifyItemId(baseName)}_${String(tier).toLowerCase()}`;
  const relativePath = `assets/images/items/${folder}/families/${familyId}/${groupSlug}/${variantId}.png`;
  const absolutePath = path.join(wikiRoot, relativePath);

  ensureDir(path.dirname(absolutePath));
  const gitkeepPath = path.join(path.dirname(absolutePath), '.gitkeep');

  if (!fs.existsSync(gitkeepPath)) {
    fs.writeFileSync(gitkeepPath, '');
  }

  return relativePath;
}

function parseRarityTable(table) {
  if (!table || table.rows.length === 0) {
    return [];
  }

  const rarityHeaders = table.headers.slice(1);
  return table.rows.map(row => {
    const label = row[0];
    const values = {};

    rarityHeaders.forEach((rarity, index) => {
      values[rarity] = row[index + 1] || '';
    });

    return {
      label,
      rarities: values
    };
  });
}

function getTableByHeading(tables, heading, headingContains = false) {
  return tables.find(table => {
    const lastHeading = table.headingPath[table.headingPath.length - 1] || '';
    if (headingContains) {
      return lastHeading.includes(heading);
    }
    return lastHeading === heading;
  }) || null;
}

function parseFamilyDoc(category, familyId, familyName, filePath) {
  const text = readText(filePath);
  const tables = parseTables(text);
  const titleMatch = text.match(/^#\s+Familia\s+(.+?)\s+-/m);
  const title = titleMatch ? titleMatch[1].trim() : familyName;
  const summary = findParagraphAfterHeading(text, '## Visao Geral');
  const introFields = parseIntroFields(text);

  const rarityTable = getTableByHeading(tables, 'Linhas de Raridade', true);
  const baseLines = parseRarityTable(rarityTable);
  const variants = [];

  baseLines.forEach(line => {
    const groupSlug = slugify(line.label);
    tierOrder.forEach(tier => {
      const rarityIndex = rarityOrder.findIndex(r => Object.prototype.hasOwnProperty.call(line.rarities, r));
      const rarity = rarityTable && rarityTable.headers[rarityIndex + 1] ? rarityTable.headers[rarityIndex + 1] : rarityOrder[0];
      const baseName = line.rarities[rarity] || line.label;
      const variantId = `${slugifyItemId(baseName)}_${tier.toLowerCase()}`;

      variants.push({
        id: variantId,
        name: `${baseName} ${tier}`,
        baseName,
        rarity,
        tier,
        image: buildVariantPath(category, familyId, groupSlug, baseName, tier),
        sourceDocument: path.relative(wikiRoot, filePath).replaceAll('\\', '/')
      });
    });
  });

  return {
    id: familyId,
    familyName: title,
    title,
    category,
    sourceDocument: path.relative(wikiRoot, filePath).replaceAll('\\', '/'),
    summary,
    ...introFields,
    tables,
    rarityLines: baseLines,
    variants
  };
}

function main() {
  const familyDirs = fs.readdirSync(docsRoot, { withFileTypes: true })
    .filter(entry => entry.isDirectory())
    .map(entry => entry.name)
    .sort();

  const catalog = {
    generatedAt: new Date().toISOString(),
    families: []
  };

  familyDirs.forEach(familyId => {
    const familyDocsRoot = path.join(docsRoot, familyId);
    const familyNameFromFolder = familyId
      .split('-')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    const weaponsDoc = path.join(familyDocsRoot, 'weapons.md');
    const armorDoc = path.join(familyDocsRoot, 'armor.md');
    const accessoriesDoc = path.join(familyDocsRoot, 'accessories.md');
    const materialsDoc = path.join(familyDocsRoot, 'materials.md');

    const record = {
      id: familyId,
      familyName: familyNameFromFolder,
      docs: {
        weapons: parseFamilyDoc('weapons', familyId, familyNameFromFolder, weaponsDoc),
        armor: parseFamilyDoc('armor', familyId, familyNameFromFolder, armorDoc),
        accessories: parseFamilyDoc('accessories', familyId, familyNameFromFolder, accessoriesDoc),
        materials: {
          id: familyId,
          familyName: familyNameFromFolder,
          category: 'materials',
          sourceDocument: path.relative(wikiRoot, materialsDoc).replaceAll('\\', '/'),
          tables: parseTables(readText(materialsDoc))
        }
      }
    };

    catalog.families.push(record);
  });

  fs.writeFileSync(outputPath, `${JSON.stringify(catalog, null, 2)}\n`, 'utf8');
  fs.writeFileSync(outputScriptPath, `window.ArkhaiEquipmentCatalog = ${JSON.stringify(catalog, null, 2)};\n`, 'utf8');
}

main();
