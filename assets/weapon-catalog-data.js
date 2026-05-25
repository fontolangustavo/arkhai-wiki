(function () {
  const weaponTypeOrder = window.weaponTypeOrder || ['Adaga', 'Espada', 'Cajado', 'Arco', 'Pistola', 'Martelo'];
  const rarityOrder = window.weaponRarityOrder || ['Incomum', 'Raro', 'Epico', 'Lendario'];
  const tierOrder = window.weaponTierOrder || ['I', 'II', 'III', 'IV'];
  const defaultImage = window.weaponDefaultImage || 'assets/images/items/weapons/default.svg';

  function slugifyWeaponType(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function resolveWeaponTypeName(value) {
    const normalized = slugifyWeaponType(value);
    const fromOrder = weaponTypeOrder.find(typeName => slugifyWeaponType(typeName) === normalized);
    return fromOrder || weaponTypeOrder[0];
  }

  function findTableByHeading(doc, heading) {
    if (!doc || !Array.isArray(doc.tables)) {
      return null;
    }

    return doc.tables.find(table => table.headingPath && table.headingPath[table.headingPath.length - 1] === heading) || null;
  }

  function findTableByPrefix(doc, prefix) {
    if (!doc || !Array.isArray(doc.tables)) {
      return null;
    }

    return doc.tables.find(table => table.headingPath && table.headingPath[0] === prefix) || null;
  }

  function parseVariantKey(label) {
    const match = String(label || '').trim().match(/^(.*)\s+(I|II|III|IV)$/);
    if (!match) {
      return null;
    }

    return {
      rarity: match[1],
      tier: match[2]
    };
  }

  function buildStatTableRows(table) {
    if (!table || !Array.isArray(table.rows) || !Array.isArray(table.headers)) {
      return {};
    }

    return Object.fromEntries(table.rows.map(row => {
      const parsed = parseVariantKey(row[0]);
      if (!parsed) {
        return null;
      }

      const values = Object.fromEntries(table.headers.slice(1).map((header, index) => [header, row[index + 1]]));
      return [`${parsed.rarity}:${parsed.tier}`, values];
    }).filter(Boolean));
  }

  function buildVariantMap(variants, statRowsByKey) {
    return Object.fromEntries(variants.map(variant => {
      const stats = statRowsByKey[`${variant.rarity}:${variant.tier}`] || null;
      return [
        `${variant.rarity}:${variant.tier}`,
        {
          ...variant,
          image: variant.image || defaultImage,
          stats
        }
      ];
    }));
  }

  function buildWeaponTypeFromDocs(family, weaponDoc, rarityLine, overviewTable, catalystTable, visualTable) {
    const typeLabel = rarityLine.label;
    const typeId = slugifyWeaponType(typeLabel);
    const baseWeaponName = rarityLine.rarities && rarityLine.rarities.Incomum ? rarityLine.rarities.Incomum : typeLabel;
    const typeTable = weaponDoc.tables.find(table => {
      const heading = table.headingPath && table.headingPath[table.headingPath.length - 1];
      return table.headingPath && table.headingPath[0] === 'Tabelas de Atributos por Arma' && heading === baseWeaponName;
    }) || null;
    const variants = (weaponDoc.variants || []).filter(variant => variant.baseName === baseWeaponName);
    const statRowsByKey = buildStatTableRows(typeTable);
    const variantByKey = buildVariantMap(variants, statRowsByKey);
    const previewVariant = variantByKey['Incomum:I'] || variants[0] || null;
    const overviewRow = overviewTable && Array.isArray(overviewTable.rows)
      ? overviewTable.rows.find(row => row[0] === typeLabel) || null
      : null;
    const overview = overviewTable && overviewRow
      ? Object.fromEntries(overviewTable.headers.map((header, index) => [header, overviewRow[index]]))
      : null;
    const identityHeader = overviewTable && overviewTable.headers
      ? overviewTable.headers[overviewTable.headers.length - 1]
      : null;
    const catalystRow = catalystTable && Array.isArray(catalystTable.rows)
      ? catalystTable.rows.find(row => row[0] === typeLabel) || null
      : null;

    return {
      id: typeId,
      typeId,
      weaponType: typeLabel,
      baseWeaponName,
      summary: overview && identityHeader ? overview[identityHeader] : weaponDoc.summary,
      overview,
      overviewHeaders: overviewTable ? overviewTable.headers : [],
      overviewRow,
      statTable: typeTable
        ? {
            title: 'Atributos por Raridade e Tier',
            columns: typeTable.headers.slice(1),
            rows: statRowsByKey
          }
        : null,
      variants,
      variantByKey,
      imageByRarity: Object.fromEntries(
        rarityOrder.map(rarity => {
          const preferredVariant = variants.find(variant => variant.rarity === rarity && variant.tier === 'I')
            || variants.find(variant => variant.rarity === rarity)
            || null;

          return [rarity, preferredVariant ? preferredVariant.image : defaultImage];
        })
      ),
      previewImage: previewVariant ? previewVariant.image : defaultImage,
      image: previewVariant ? previewVariant.image : defaultImage,
      rarityNames: rarityLine.rarities || {},
      visuals: visualTable && Array.isArray(visualTable.rows)
        ? visualTable.rows.map(row => ({ rarity: row[0], text: row[1] }))
        : [],
      catalystRow,
      catalystTable,
      progressionTable: visualTable,
      typeTable
    };
  }

  function buildFamilyFromDocs(family) {
    const weaponDoc = family.docs && family.docs.weapons;
    if (!weaponDoc) {
      return null;
    }

    const rarityLinesTable = findTableByHeading(weaponDoc, 'Linhas de Raridade');
    const overviewTable = findTableByHeading(weaponDoc, 'Tipos de Arma');
    const catalystTable = findTableByPrefix(weaponDoc, 'Catalisadores de Ascensao por Arma');
    const visualTable = findTableByHeading(weaponDoc, 'Progressao Visual');
    const rarityLines = Array.isArray(weaponDoc.rarityLines) ? weaponDoc.rarityLines : [];
    const types = rarityLines.map(rarityLine =>
      buildWeaponTypeFromDocs(family, weaponDoc, rarityLine, overviewTable, catalystTable, visualTable)
    ).filter(Boolean);

    const typeById = Object.fromEntries(types.map(type => [type.id, type]));
    const defaultType = types[0] || null;

    return {
      id: family.id,
      familyName: family.familyName,
      region: weaponDoc.region || family.region || '',
      markName: weaponDoc.markName || family.markName || '',
      markEffect: weaponDoc.markEffect || family.markEffect || '',
      summary: weaponDoc.summary || family.summary || '',
      attributes: weaponDoc.attributes || family.attributes || [],
      resources: weaponDoc.resources || family.resources || [],
      materials: weaponDoc.materials || family.materials || [],
      sourceDocument: weaponDoc.sourceDocument || family.sourceDocument || '',
      sourceHeading: family.sourceHeading || weaponDoc.title || '',
      rarityLinesTable,
      docs: family.docs,
      types,
      typeById,
      defaultTypeId: defaultType ? defaultType.id : null,
      typeNames: types.map(type => type.weaponType),
      family
    };
  }

  function buildWeaponCatalog() {
    const catalog = window.ArkhaiEquipmentCatalog;
    if (!catalog || !Array.isArray(catalog.families)) {
      return null;
    }

    const families = catalog.families.map(buildFamilyFromDocs).filter(Boolean);
    const familyById = Object.fromEntries(families.map(family => [family.id, family]));
    const weaponTypeIndex = Object.fromEntries(weaponTypeOrder.map(typeName => [typeName, []]));

    families.forEach(family => {
      family.types.forEach(type => {
        if (!weaponTypeIndex[type.weaponType]) {
          weaponTypeIndex[type.weaponType] = [];
        }

        weaponTypeIndex[type.weaponType].push({
          family,
          type
        });
      });
    });

    const weaponTypeMeta = Object.fromEntries(weaponTypeOrder.map(typeName => [
      typeName,
      {
        summary: `${typeName}s publicadas em ${weaponTypeIndex[typeName] ? weaponTypeIndex[typeName].length : 0} familias.`,
        focus: `Tipo de arma: ${typeName}`,
        detailSummary: `Familias publicadas para ${typeName.toLowerCase()}s.`
      }
    ]));

    return {
      weaponTypeOrder,
      weaponTypeMeta,
      weaponTypeIndex,
      familyById,
      families,
      defaultImage,
      resolveWeaponTypeName,
      rarityOrder,
      tierOrder
    };
  }

  function getWeaponCatalogSelection(options) {
    const catalog = window.ArkhaiWeaponCatalog || buildWeaponCatalog();
    if (!catalog) {
      return null;
    }

    const familyId = options && options.familyId ? options.familyId : catalog.families[0].id;
    const family = catalog.familyById[familyId] || catalog.families[0];
    const typeId = options && options.typeId ? slugifyWeaponType(options.typeId) : (family.defaultTypeId || null);
    const type = (typeId && family.typeById[typeId]) || family.types[0] || null;
    if (!type) {
      return null;
    }

    const rarity = options && options.rarity && rarityOrder.includes(options.rarity) ? options.rarity : rarityOrder[0];
    const tier = options && options.tier && tierOrder.includes(options.tier) ? options.tier : tierOrder[0];
    const variant = type.variantByKey[`${rarity}:${tier}`] || type.variants[0] || null;

    return {
      source: 'catalog',
      family,
      type,
      variant
    };
  }

  const catalog = buildWeaponCatalog();

  if (catalog) {
    window.ArkhaiWeaponCatalog = catalog;
    window.weaponCatalogFamilies = catalog.families;
    window.weaponCatalogFamilyById = catalog.familyById;
    window.weaponCatalogWeaponTypeIndex = catalog.weaponTypeIndex;
    window.weaponCatalogWeaponTypeMeta = catalog.weaponTypeMeta;
    window.weaponCatalogWeaponTypeOrder = catalog.weaponTypeOrder;
    window.resolveWeaponCatalogTypeName = catalog.resolveWeaponTypeName;
    window.getWeaponCatalogSelection = getWeaponCatalogSelection;
  }
})();
