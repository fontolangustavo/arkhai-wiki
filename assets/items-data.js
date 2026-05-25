(function () {
  const rarityOrder = ['Incomum', 'Raro', 'Epico', 'Lendario'];

  function toItemId(baseId, tier) {
    return `${baseId}_${String(tier).toLowerCase()}`;
  }

  function buildDaggersModel(data) {
    const lineOrder = rarityOrder
      .map(rarity => {
        const line = data.rarityLines && data.rarityLines[rarity];

        if (!line) {
          return null;
        }

        const variants = (data.tiers || [])
          .filter(tier => tier.rarity === rarity)
          .map(tier => {
            const id = toItemId(line.baseId, tier.internalTier);

            return {
              ...data.profile,
              ...tier,
              id,
              rarity,
              rarityTier: `${rarity} ${tier.internalTier}`,
              baseId: line.baseId,
              baseName: line.baseName,
              name: `${line.baseName} ${tier.internalTier}`,
              image: line.image,
              family: data.family,
              weaponType: data.weaponType,
              region: data.region,
              sourceDocument: data.sourceDocument,
              sourceSection: data.sourceSection,
              initialRecipe: (data.initialRecipes && data.initialRecipes[id]) || [],
              ascension: (data.ascensions && data.ascensions[id]) || null
            };
          });

        return {
          rarity,
          ...line,
          ...data.profile,
          lineId: line.baseId,
          displayName: line.baseName,
          variants,
          variantCount: variants.length,
          firstVariant: variants[0] || null,
          lastVariant: variants[variants.length - 1] || null
        };
      })
      .filter(Boolean);

    const lineById = Object.fromEntries(lineOrder.map(line => [line.lineId, line]));
    const variantById = Object.fromEntries(
      lineOrder.flatMap(line => line.variants.map(variant => [variant.id, variant]))
    );

    return {
      ...data,
      lineOrder,
      lineById,
      variantById
    };
  }

  function getDaggersSelection(model, options) {
    const requestedId = options && options.id;
    const requestedLineId = options && options.lineId;
    const requestedTier = options && options.tier;

    let variant = requestedId ? model.variantById[requestedId] || null : null;
    let line = null;

    if (variant) {
      line = model.lineById[variant.baseId] || null;
    } else {
      line = model.lineById[requestedLineId] || model.lineOrder[0] || null;

      if (line) {
        variant =
          line.variants.find(entry => entry.internalTier === requestedTier) ||
          line.variants[0] ||
          null;
      }
    }

    if (!line && variant) {
      line = model.lineById[variant.baseId] || null;
    }

    if (!variant && line) {
      variant = line.variants[0] || null;
    }

    return { line, variant };
  }

  window.ArkhaiWikiData = {
    rarityOrder,
    toItemId,
    buildDaggersModel,
    getDaggersSelection
  };

  window.rarityOrder = rarityOrder;
  window.toItemId = toItemId;
  window.buildDaggersModel = buildDaggersModel;
  window.getDaggersSelection = getDaggersSelection;
})();
