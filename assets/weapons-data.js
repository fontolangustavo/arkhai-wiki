(function () {
  const rarityOrder = ['Incomum', 'Raro', 'Epico', 'Lendario'];
  const tierOrder = ['I', 'II', 'III', 'IV'];
  const weaponTypeOrder = ['Adaga', 'Espada', 'Cajado', 'Arco', 'Pistola', 'Martelo'];
  const weaponTypeMeta = {
    Adaga: {
      icon: '🦂',
      summary: 'Ataques rapidos, veneno constante, critico e perfuracao curta.',
      focus: 'Mobilidade, burst e aplicacao de marca',
      detailSummary: 'Linha focada em velocidade, veneno, critico e perfuracao curta.'
    },
    Espada: {
      icon: '🗡️',
      summary: 'Cortes consistentes, forca e identidade marcial clara.',
      focus: 'Dano solido, ritmo medio e versatilidade',
      detailSummary: 'Linha focada em corte consistente, forca e identidade marcial.'
    },
    Cajado: {
      icon: '🔱',
      summary: 'Canalizacao magica, controle e efeitos elementais.',
      focus: 'Inteligencia, area e sustentacao arcana',
      detailSummary: 'Linha focada em canalizacao arcana, controle e area.'
    },
    Arco: {
      icon: '🏹',
      summary: 'Longo alcance, precision e dano de flanco.',
      focus: 'Mobilidade, perfuracao e distancia',
      detailSummary: 'Linha focada em distancia, precision e dano de flanco.'
    },
    Pistola: {
      icon: '🔫',
      summary: 'Disparo concentrado, critico e pressao de medio alcance.',
      focus: 'Explosao rapida e dano por janela',
      detailSummary: 'Linha focada em disparo concentrado e critico de medio alcance.'
    },
    Martelo: {
      icon: '🔨',
      summary: 'Impacto pesado, quebra de defesa e controle bruto.',
      focus: 'Forca, atordoamento e area curta',
      detailSummary: 'Linha focada em impacto, quebra de defesa e forca bruta.'
    }
  };
  const weaponTypeFolderByName = {
    Adaga: 'daggers',
    Espada: 'swords',
    Cajado: 'staffs',
    Arco: 'bows',
    Pistola: 'pistols',
    Martelo: 'hammers'
  };
  const weaponTypeNameBySlug = Object.fromEntries(
    weaponTypeOrder.map(typeName => [slugifyWeaponType(typeName), typeName])
  );
  const defaultImage = 'assets/images/items/weapons/default.svg';

  function resolveWeaponImage(image) {
    return image || defaultImage;
  }

  function createWeaponImageHtml(image, alt, className = 'item-image') {
    const resolvedImage = resolveWeaponImage(image);

    return `<img class="${className}" src="${resolvedImage}" alt="${alt}" onerror="this.onerror=null;this.src='${defaultImage}'">`;
  }

  function slugifyWeaponType(value) {
    return String(value || '')
      .trim()
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  function slugifyWeaponId(value) {
    return slugifyWeaponType(value).replace(/-/g, '_');
  }

  function buildWeaponVariantId(baseName, tier) {
    return `${slugifyWeaponId(baseName)}_${String(tier).toLowerCase()}`;
  }

  function buildWeaponVariantImagePath(familyId, weaponType, variantId) {
    const folder = weaponTypeFolderByName[weaponType] || `${slugifyWeaponType(weaponType)}s`;
    return `assets/images/items/weapons/families/${familyId}/${folder}/${variantId}.png`;
  }

  function resolveWeaponTypeName(value) {
    return weaponTypeNameBySlug[slugifyWeaponType(value)] || weaponTypeOrder[0];
  }

  function buildVariants(rarityNames) {
    return rarityOrder.flatMap(rarity => {
      const baseName = rarityNames[rarity];

      return tierOrder.map(tier => ({
        id: buildWeaponVariantId(baseName, tier),
        rarity,
        tier,
        name: `${baseName} ${tier}`
      }));
    });
  }

  function buildWeaponType(typeConfig, familyConfig) {
    const weaponType = typeConfig.weaponType || familyConfig.weaponType || 'Arma';
    const typeId = typeConfig.id || slugifyWeaponType(weaponType);
    const rarityNames = typeConfig.rarityNames || familyConfig.rarityNames;
    const imageByRarity = typeConfig.imageByRarity || familyConfig.imageByRarity || {};
    const statTable = typeConfig.statTable || familyConfig.statTable || null;
    const image = resolveWeaponImage(typeConfig.image || familyConfig.image);
    const variants = buildVariants(rarityNames);
    const previewVariant = variants[0] || null;
    const fallbackImage = previewVariant
      ? buildWeaponVariantImagePath(familyConfig.id, weaponType, previewVariant.id)
      : image;
    const previewImage = resolveWeaponImage(imageByRarity.Incomum || fallbackImage);

    return {
      ...typeConfig,
      id: typeId,
      weaponType,
      baseWeaponName: typeConfig.baseWeaponName || familyConfig.baseWeaponName || weaponType,
      image,
      imageByRarity,
      rarityNames,
      statTable,
      variants,
      previewImage,
      variantByKey: Object.fromEntries(
        variants.map(variant => [
          `${variant.rarity}:${variant.tier}`,
          {
            ...variant,
            image: resolveWeaponImage(imageByRarity[variant.rarity] || buildWeaponVariantImagePath(familyConfig.id, weaponType, variant.id)),
            stats: statTable ? statTable.rows[`${variant.rarity}:${variant.tier}`] || null : null
          }
        ])
      )
    };
  }

  function buildFamily(config) {
    const baseTypeConfig = {
      id: slugifyWeaponType(config.weaponType),
      weaponType: config.weaponType,
      baseWeaponName: config.baseWeaponName,
      rarityNames: config.rarityNames,
      image: config.image,
      imageByRarity: config.imageByRarity,
      statTable: config.statTable,
      recipe: config.recipe,
      visuals: config.visuals,
      ascensions: config.ascensions,
      directions: config.directions
    };

    const typeConfigs = config.types && config.types.length
      ? [baseTypeConfig, ...config.types]
      : [baseTypeConfig];

    const types = typeConfigs.map(typeConfig => buildWeaponType(typeConfig, config));
    const defaultType = types[0];

    return {
      ...config,
      types,
      typeById: Object.fromEntries(types.map(type => [type.id, type])),
      defaultTypeId: defaultType.id,
      image: defaultType.previewImage,
      imageByRarity: defaultType.imageByRarity,
      statTable: defaultType.statTable,
      weaponType: defaultType.weaponType,
      baseWeaponName: defaultType.baseWeaponName,
      rarityNames: defaultType.rarityNames,
      recipe: defaultType.recipe,
      visuals: defaultType.visuals,
      ascensions: defaultType.ascensions,
      directions: defaultType.directions,
      typeNames: types.map(type => type.weaponType),
      variants: defaultType.variants,
      variantByKey: defaultType.variantByKey
    };
  }

  const families = [
    buildFamily({
      id: 'escorpiao',
      familyName: 'Escorpiao',
      weaponType: 'Adaga',
      region: 'Khem-Nippur',
      theme: 'Velocidade, veneno, critico e perfuracao',
      markName: 'Marca do Escorpiao',
      markEffect: 'Chance de aplicar Envenenamento em ataques',
      attributes: ['Agilidade', 'Percepcao', 'Chance de Critico', 'Penetracao Elemental'],
      resources: ['Liga de Khem', 'Arenito Arcano', 'Cristal do Gihon', 'Gema Venenosa'],
      materials: ['Fragmento de Escorpiao', 'Ferrao', 'Carapaca', 'Glandula de Veneno'],
      baseWeaponName: 'Adaga de Escorpiao',
      types: [
        {
          id: 'espada',
          weaponType: 'Espada',
          baseWeaponName: 'Espada de Escorpiao',
          image: 'assets/images/items/weapons/families/escorpiao/weapon.svg',
          imageByRarity: {
            Incomum: 'assets/images/items/weapons/families/escorpiao/swords/scorpion_sword.png',
            Raro: 'assets/images/items/weapons/families/escorpiao/swords/elite_scorpion_sword.png',
            Epico: 'assets/images/items/weapons/families/escorpiao/swords/master_scorpion_sword.png',
            Lendario: 'assets/images/items/weapons/families/escorpiao/swords/fangs_of_the_king_sword.png'
          },
          rarityNames: {
            Incomum: 'Espada de Escorpiao',
            Raro: 'Espada do Escorpiao Elite',
            Epico: 'Sabre do Mestre Escorpiao',
            Lendario: 'Cauda do Rei'
          },
          statTable: {
            title: 'Atributos por Raridade e Tier',
            columns: ['Ataque Fisico', 'Chance de Veneno (Marca)', 'Forca', 'Critico', 'Perfuracao', 'Dano de Veneno'],
            rows: {
              'Incomum:I': {
                'Ataque Fisico': '26',
                'Chance de Veneno (Marca)': '7%',
                'Forca': '+5',
                'Critico': '-',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Incomum:II': {
                'Ataque Fisico': '31',
                'Chance de Veneno (Marca)': '8%',
                'Forca': '+6',
                'Critico': '-',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Incomum:III': {
                'Ataque Fisico': '35',
                'Chance de Veneno (Marca)': '9%',
                'Forca': '+7',
                'Critico': '-',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Incomum:IV': {
                'Ataque Fisico': '40',
                'Chance de Veneno (Marca)': '10%',
                'Forca': '+8',
                'Critico': '-',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Raro:I': {
                'Ataque Fisico': '48',
                'Chance de Veneno (Marca)': '12%',
                'Forca': '+9',
                'Critico': '9%',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Raro:II': {
                'Ataque Fisico': '55',
                'Chance de Veneno (Marca)': '13%',
                'Forca': '+10',
                'Critico': '10%',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Raro:III': {
                'Ataque Fisico': '61',
                'Chance de Veneno (Marca)': '14%',
                'Forca': '+12',
                'Critico': '11%',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Raro:IV': {
                'Ataque Fisico': '69',
                'Chance de Veneno (Marca)': '15%',
                'Forca': '+13',
                'Critico': '12%',
                'Perfuracao': '-',
                'Dano de Veneno': '-'
              },
              'Epico:I': {
                'Ataque Fisico': '81',
                'Chance de Veneno (Marca)': '18%',
                'Forca': '+16',
                'Critico': '14%',
                'Perfuracao': '15%',
                'Dano de Veneno': '-'
              },
              'Epico:II': {
                'Ataque Fisico': '92',
                'Chance de Veneno (Marca)': '20%',
                'Forca': '+18',
                'Critico': '16%',
                'Perfuracao': '17%',
                'Dano de Veneno': '-'
              },
              'Epico:III': {
                'Ataque Fisico': '104',
                'Chance de Veneno (Marca)': '22%',
                'Forca': '+20',
                'Critico': '18%',
                'Perfuracao': '19%',
                'Dano de Veneno': '-'
              },
              'Epico:IV': {
                'Ataque Fisico': '117',
                'Chance de Veneno (Marca)': '24%',
                'Forca': '+22',
                'Critico': '20%',
                'Perfuracao': '21%',
                'Dano de Veneno': '-'
              },
              'Lendario:I': {
                'Ataque Fisico': '135',
                'Chance de Veneno (Marca)': '28%',
                'Forca': '+26',
                'Critico': '23%',
                'Perfuracao': '25%',
                'Dano de Veneno': '11%'
              },
              'Lendario:II': {
                'Ataque Fisico': '153',
                'Chance de Veneno (Marca)': '31%',
                'Forca': '+30',
                'Critico': '26%',
                'Perfuracao': '28%',
                'Dano de Veneno': '14%'
              },
              'Lendario:III': {
                'Ataque Fisico': '174',
                'Chance de Veneno (Marca)': '35%',
                'Forca': '+34',
                'Critico': '29%',
                'Perfuracao': '31%',
                'Dano de Veneno': '17%'
              },
              'Lendario:IV': {
                'Ataque Fisico': '198',
                'Chance de Veneno (Marca)': '40%',
                'Forca': '+38',
                'Critico': '33%',
                'Perfuracao': '35%',
                'Dano de Veneno': '21%'
              }
            }
          },
          recipe: [
            'Projeto de Espada',
            '+ Fragmento de Escorpiao',
            '+ Carapaca de Escorpiao Incomum',
            '+ Liga de Khem Incomum',
            '+ Selo Runico Incomum',
            '= Espada de Escorpiao [Incomum I]'
          ],
          ascensions: [
            {
              from: 'Espada de Escorpiao [Incomum IV]',
              result: 'Espada do Escorpiao Elite [Raro I]',
              materials: [
                'Glandula de Veneno Rara',
                'Liga de Khem Rara',
                '100x Fragmento de Ar-Khe Raro',
                '100x Cinza Arcana Rara',
                '100x Selo Runico Raro'
              ]
            },
            {
              from: 'Espada do Escorpiao Elite [Raro IV]',
              result: 'Sabre do Mestre Escorpiao [Epico I]',
              materials: [
                'Cauda do Mestre Escorpiao Epica',
                'Cristal do Gihon Epico',
                '300x Fragmento de Ar-Khe Epico',
                '300x Cinza Arcana Epica',
                '300x Selo Runico Epico'
              ]
            },
            {
              from: 'Sabre do Mestre Escorpiao [Epico IV]',
              result: 'Cauda do Rei [Lendario I]',
              materials: [
                'Cauda do Rei Escorpiao Lendaria',
                'Gema Venenosa Primordial',
                '900x Fragmento de Ar-Khe Primordial',
                '900x Cinza Arcana Primordial',
                '900x Selo Runico Primordial'
              ]
            }
          ]
        }
      ],
      statTable: {
        title: 'Atributos por Raridade e Tier',
        columns: ['Ataque Fisico', 'Agilidade', 'Critico', 'Perfuracao', 'Chance de Veneno'],
        rows: {
          'Incomum:I': {
            'Ataque Fisico': '18',
            'Agilidade': '+4',
            'Critico': '-',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Incomum:II': {
            'Ataque Fisico': '21',
            'Agilidade': '+5',
            'Critico': '-',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Incomum:III': {
            'Ataque Fisico': '24',
            'Agilidade': '+5',
            'Critico': '-',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Incomum:IV': {
            'Ataque Fisico': '28',
            'Agilidade': '+6',
            'Critico': '-',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Raro:I': {
            'Ataque Fisico': '33',
            'Agilidade': '+7',
            'Critico': '11%',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Raro:II': {
            'Ataque Fisico': '38',
            'Agilidade': '+8',
            'Critico': '12%',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Raro:III': {
            'Ataque Fisico': '42',
            'Agilidade': '+9',
            'Critico': '13%',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Raro:IV': {
            'Ataque Fisico': '48',
            'Agilidade': '+11',
            'Critico': '14%',
            'Perfuracao': '-',
            'Chance de Veneno': '-'
          },
          'Epico:I': {
            'Ataque Fisico': '56',
            'Agilidade': '+12',
            'Critico': '16%',
            'Perfuracao': '14%',
            'Chance de Veneno': '-'
          },
          'Epico:II': {
            'Ataque Fisico': '64',
            'Agilidade': '+14',
            'Critico': '18%',
            'Perfuracao': '16%',
            'Chance de Veneno': '-'
          },
          'Epico:III': {
            'Ataque Fisico': '72',
            'Agilidade': '+16',
            'Critico': '20%',
            'Perfuracao': '18%',
            'Chance de Veneno': '-'
          },
          'Epico:IV': {
            'Ataque Fisico': '81',
            'Agilidade': '+18',
            'Critico': '22%',
            'Perfuracao': '20%',
            'Chance de Veneno': '-'
          },
          'Lendario:I': {
            'Ataque Fisico': '94',
            'Agilidade': '+21',
            'Critico': '25%',
            'Perfuracao': '24%',
            'Chance de Veneno': '31%'
          },
          'Lendario:II': {
            'Ataque Fisico': '106',
            'Agilidade': '+24',
            'Critico': '28%',
            'Perfuracao': '27%',
            'Chance de Veneno': '34%'
          },
          'Lendario:III': {
            'Ataque Fisico': '121',
            'Agilidade': '+27',
            'Critico': '31%',
            'Perfuracao': '30%',
            'Chance de Veneno': '38%'
          },
          'Lendario:IV': {
            'Ataque Fisico': '137',
            'Agilidade': '+30',
            'Critico': '35%',
            'Perfuracao': '34%',
            'Chance de Veneno': '43%'
          }
        }
      },
      image: 'assets/images/items/weapons/families/escorpiao/weapon.svg',
      imageByRarity: {
        Incomum: 'assets/images/items/weapons/families/escorpiao/daggers/scorpion_dagger.png',
        Raro: 'assets/images/items/weapons/families/escorpiao/daggers/elite_scorpion_dagger.png',
        Epico: 'assets/images/items/weapons/families/escorpiao/daggers/master_scorpion_blade.png',
        Lendario: 'assets/images/items/weapons/families/escorpiao/daggers/fangs_of_the_king.png'
      },
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/escorpiao/weapons.md',
      sourceHeading: 'Familia Escorpiao - Armas',
      summary:
        'A familia Escorpiao cobre uma linha completa de equipamentos ofensivos com ferrao, carapaca e veneno do deserto.',
      rarityNames: {
        Incomum: 'Adaga de Escorpiao',
        Raro: 'Adaga do Escorpiao Elite',
        Epico: 'Lamina do Mestre Escorpiao',
        Lendario: 'Presas do Rei'
      },
      recipe: [
        'Projeto de Adaga',
        '+ Fragmento de Escorpiao',
        '+ Ferrao de Escorpiao Incomum',
        '+ Liga de Khem Incomum',
        '+ Selo Runico Incomum',
        '= Adaga de Escorpiao [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Quitina negra bruta, metal simples, veneno discreto e silhueta ainda pouco refinada' },
        { rarity: 'Raro', text: 'Quitina polida, bordas verdes, pequenos cristais venenosos e detalhes de elite' },
        { rarity: 'Epico', text: 'Partes vivas da carapaca, runas toxicas, aura verde constante e lamina mais agressiva' },
        { rarity: 'Lendario', text: 'Silhueta real, veneno primordial, brilho permanente e detalhes dourados de Khem-Nippur' }
      ],
      ascensions: [
        {
          from: 'Adaga de Escorpiao [Incomum IV]',
          result: 'Adaga do Escorpiao Elite [Raro I]',
          materials: [
            'Glandula de Veneno Rara',
            'Liga de Khem Rara',
            '100x Fragmento de Ar-Khe Raro',
            '100x Cinza Arcana Rara',
            '100x Selo Runico Raro'
          ]
        },
        {
          from: 'Adaga do Escorpiao Elite [Raro IV]',
          result: 'Lamina do Mestre Escorpiao [Epico I]',
          materials: [
            'Ferrao do Mestre Escorpiao Epico',
            'Cristal do Gihon Epico',
            '300x Fragmento de Ar-Khe Epico',
            '300x Cinza Arcana Epica',
            '300x Selo Runico Epico'
          ]
        },
        {
          from: 'Lamina do Mestre Escorpiao [Epico IV]',
          result: 'Presas do Rei [Lendario I]',
          materials: [
            'Presa do Rei Escorpiao Lendaria',
            'Gema Venenosa Primordial',
            '900x Fragmento de Ar-Khe Primordial',
            '900x Cinza Arcana Primordial',
            '900x Selo Runico Primordial'
          ]
        }
      ],
      directions: [
        'A familia Escorpiao deve favorecer velocidade, critico, perfuracao e dano venenoso.',
        'Cada arma deve manter a identidade da propria categoria sem perder a linguagem visual de escorpiao.',
        'O visual deve usar curvas agressivas, ferroes, pincas, carapaca negra, cristais verdes e detalhes de Khem-Nippur.',
        'A ascensao nunca troca a familia da arma.',
        'A raridade deve evoluir a mesma arma, nao transformar o item em outro conceito visual desconectado.'
      ]
    }),
    buildFamily({
      id: 'vampiro',
      familyName: 'Vampiro',
      weaponType: 'Espada',
      region: 'Regioes de Sombra',
      theme: 'Roubo de vida, sangue, eternidade',
      markName: 'Marca Vampirica',
      markEffect: 'Roubo de vida em ataques e habilidades',
      attributes: ['Vitalidade', 'Inteligencia', 'Roubo de HP', 'Dano Magico'],
      resources: ['Cristal de Sangue', 'Madeira Ritual', 'Resina Escura'],
      materials: ['Fragmento de Vampiro', 'Presa Sanguinea', 'Sangue Coagulado', 'Veu Carmesim'],
      baseWeaponName: 'Espada Carmesim',
      image: 'assets/images/items/weapons/families/vampiro/weapon.svg',
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/vampiro/weapons.md',
      sourceHeading: 'Familia Vampiro - Armas',
      summary:
        'A familia Vampiro usa osso imortal, sangue coagulado e metais ritualisticos para sustain e dano sombrio.',
      rarityNames: {
        Incomum: 'Espada Carmesim',
        Raro: 'Lamina Noturna',
        Epico: 'Espada do Lorde Vampiro',
        Lendario: 'Sangue Eterno'
      },
      recipe: [
        'Projeto de Espada',
        '+ Fragmento de Vampiro',
        '+ Presa Sanguinea Incomum',
        '+ Cristal de Sangue Incomum',
        '+ Selo Runico Incomum',
        '= Espada Carmesim [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Lamina escura com brilho vermelho fraco' },
        { rarity: 'Raro', text: 'Veias de sangue pulsando no metal' },
        { rarity: 'Epico', text: 'Lamina absorve luz ao atacar' },
        { rarity: 'Lendario', text: 'Sangue vivo percorre a arma constantemente' }
      ],
      ascensions: [],
      directions: [
        'A arma deve favorecer sustain e dano sombrio.',
        'O visual deve transmitir nobreza decadente.',
        'Efeitos visuais devem usar sangue, nevoa e sombras.'
      ]
    }),
    buildFamily({
      id: 'golem-de-cinzas',
      familyName: 'Golem de Cinzas',
      weaponType: 'Martelo',
      region: 'Hellas-Assur',
      theme: 'Brasa, pedra viva, forja',
      markName: 'Marca das Cinzas',
      markEffect: 'Ataques criticos aplicam Queimadura',
      attributes: ['Forca', 'Vitalidade', 'Dano Fisico', 'Resistencia'],
      resources: ['Liga Vulcanica', 'Pedra Viva', 'Carvao de Forja'],
      materials: ['Fragmento de Cinzas', 'Nucleo de Brasa', 'Placa Vulcanica', 'Coracao Igneo'],
      baseWeaponName: 'Martelo Vulcanico',
      image: 'assets/images/items/weapons/families/golem-de-cinzas/weapon.svg',
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/golem-de-cinzas/weapons.md',
      sourceHeading: 'Familia Golem de Cinzas - Armas',
      summary:
        'Armas de forca bruta, impacto e fogo vulcanico, construidas com pedra viva e nucleo de brasa.',
      rarityNames: {
        Incomum: 'Martelo Vulcanico',
        Raro: 'Martelo de Brasa',
        Epico: 'Forja do Ancestral',
        Lendario: 'Coracao da Forja'
      },
      recipe: [
        'Projeto de Martelo',
        '+ Fragmento de Cinzas',
        '+ Nucleo de Brasa Incomum',
        '+ Liga Vulcanica Incomum',
        '+ Selo Runico Incomum',
        '= Martelo Vulcanico [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Pedra vulcanica escura com rachaduras' },
        { rarity: 'Raro', text: 'Brasas visiveis dentro do metal' },
        { rarity: 'Epico', text: 'Lava escorre nas juntas do martelo' },
        { rarity: 'Lendario', text: 'Nucleo vivo de fogo pulsa no centro' }
      ],
      ascensions: [],
      directions: [
        'A arma deve transmitir peso extremo.',
        'Animacoes devem parecer lentas e devastadoras.',
        'O fogo deve parecer instavel e vivo.'
      ]
    }),
    buildFamily({
      id: 'wyrm-de-gelo',
      familyName: 'Wyrm de Gelo',
      weaponType: 'Espada',
      region: 'Regioes Geladas',
      theme: 'Gelo, lentidao, resistencia',
      markName: 'Marca do Wyrm',
      markEffect: 'Ataques reduzem a velocidade do alvo',
      attributes: ['Forca', 'Percepcao', 'Dano de Gelo', 'Velocidade de Ataque'],
      resources: ['Mineral Congelado', 'Gema Fria', 'Liga Glacial', 'Perola Fria'],
      materials: ['Fragmento de Wyrm', 'Escama Glacial', 'Cristal Frio', 'Coracao Congelado'],
      baseWeaponName: 'Espada do Wyrm',
      image: 'assets/images/items/weapons/families/wyrm-de-gelo/weapon.svg',
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/wyrm-de-gelo/weapons.md',
      sourceHeading: 'Familia Wyrm de Gelo - Armas',
      summary:
        'Lamina glacial com escamas, cristais congelados e minerais que conservam frio arcano.',
      rarityNames: {
        Incomum: 'Espada do Wyrm',
        Raro: 'Espada do Wyrm Anciao',
        Epico: 'Garra do Wyrm Mestre',
        Lendario: 'Presa do Wyrm Eterno'
      },
      recipe: [
        'Projeto de Espada',
        '+ Fragmento de Wyrm',
        '+ Escama Glacial Incomum',
        '+ Mineral Congelado Incomum',
        '+ Selo Runico Incomum',
        '= Espada do Wyrm [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Lamina azul palida, gelo opaco e marcas simples' },
        { rarity: 'Raro', text: 'Escamas glaciais presas ao fio, nevoa fria nas bordas' },
        { rarity: 'Epico', text: 'Garra congelada como lamina, cristais crescem no cabo' },
        { rarity: 'Lendario', text: 'Presa ancestral com aura congelante permanente' }
      ],
      ascensions: [
        {
          from: 'Espada do Wyrm [Incomum IV]',
          result: 'Espada do Wyrm Anciao [Raro I]',
          materials: [
            'Cristal Frio Raro',
            'Liga Glacial Rara',
            '100x Fragmento de Ar-Khe Raro',
            '100x Cinza Arcana Rara',
            '100x Selo Runico Raro'
          ]
        },
        {
          from: 'Espada do Wyrm Anciao [Raro IV]',
          result: 'Garra do Wyrm Mestre [Epico I]',
          materials: [
            'Coracao Congelado Epico',
            'Gema Fria Epica',
            '300x Fragmento de Ar-Khe Epico',
            '300x Cinza Arcana Epica',
            '300x Selo Runico Epico'
          ]
        },
        {
          from: 'Garra do Wyrm Mestre [Epico IV]',
          result: 'Presa do Wyrm Eterno [Lendario I]',
          materials: [
            'Presa do Wyrm Eterno Lendaria',
            'Perola Fria Primordial',
            '900x Fragmento de Ar-Khe Primordial',
            '900x Cinza Arcana Primordial',
            '900x Selo Runico Primordial'
          ]
        }
      ],
      directions: [
        'A arma deve favorecer controle e dano glacial.',
        'O visual deve transmitir frio antigo e predatorio.',
        'Golpes devem parecer pesados, cortantes e congelantes.'
      ]
    }),
    buildFamily({
      id: 'aracu-das-sombras',
      familyName: 'Aracu das Sombras',
      weaponType: 'Arco',
      region: 'Silvan-Arcadia',
      theme: 'Evasao, mobilidade, emboscada',
      markName: 'Marca do Aracu',
      markEffect: 'Ataques apos evasao causam dano bonus',
      attributes: ['Agilidade', 'Percepcao', 'Evasao', 'Dano de Flanco'],
      resources: ['Fibra Viva', 'Madeira Raiz', 'Resina Sombria', 'Osso Alar'],
      materials: ['Fragmento de Aracu', 'Seda Sombria', 'Garra Silenciosa', 'Olho da Penumbra'],
      baseWeaponName: 'Arco do Aracu',
      image: 'assets/images/items/weapons/families/aracu-das-sombras/weapon.svg',
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/aracu-das-sombras/weapons.md',
      sourceHeading: 'Familia Aracu das Sombras - Armas',
      summary:
        'Armas de furtividade feitas com ossos alares, fibras sombrias e materiais que absorvem luz.',
      rarityNames: {
        Incomum: 'Arco do Aracu',
        Raro: 'Arco das Sombras',
        Epico: 'Arco da Penumbra',
        Lendario: 'Asas do Vazio'
      },
      recipe: [
        'Projeto de Arco',
        '+ Fragmento de Aracu',
        '+ Garra Silenciosa Incomum',
        '+ Madeira Raiz Incomum',
        '+ Selo Runico Incomum',
        '= Arco do Aracu [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Madeira escura simples com penas negras' },
        { rarity: 'Raro', text: 'Penas absorvem parte da luz ao redor' },
        { rarity: 'Epico', text: 'O arco desaparece parcialmente nas sombras' },
        { rarity: 'Lendario', text: 'Estrutura parece feita do proprio vazio' }
      ],
      ascensions: [
        {
          from: 'Arco do Aracu [Incomum IV]',
          result: 'Arco das Sombras [Raro I]',
          materials: [
            'Seda Sombria Rara',
            'Fibra Viva Rara',
            '100x Fragmento de Ar-Khe Raro',
            '100x Cinza Arcana Rara',
            '100x Selo Runico Raro'
          ]
        },
        {
          from: 'Arco das Sombras [Raro IV]',
          result: 'Arco da Penumbra [Epico I]',
          materials: [
            'Olho da Penumbra Epico',
            'Resina Sombria Epica',
            '300x Fragmento de Ar-Khe Epico',
            '300x Cinza Arcana Epica',
            '300x Selo Runico Epico'
          ]
        },
        {
          from: 'Arco da Penumbra [Epico IV]',
          result: 'Asas do Vazio [Lendario I]',
          materials: [
            'Garra do Aracu Ancestral Lendaria',
            'Osso Alar Primordial',
            '900x Fragmento de Ar-Khe Primordial',
            '900x Cinza Arcana Primordial',
            '900x Selo Runico Primordial'
          ]
        }
      ],
      directions: [
        'A arma deve favorecer emboscada e mobilidade.',
        'O visual deve parecer silencioso e predatorio.',
        'Disparos devem transmitir velocidade extrema e furtividade.'
      ]
    }),
    buildFamily({
      id: 'sacerdotisa-de-nod',
      familyName: 'Sacerdotisa de Nod',
      weaponType: 'Cajado',
      region: 'Ermo de Nod',
      theme: 'Maldicao, ritual, debuffs',
      markName: 'Marca de Nod',
      markEffect: 'Debuffs aplicados pelo portador duram mais',
      attributes: ['Inteligencia', 'Percepcao', 'Duracao de Debuff', 'Penetracao de Resistencia'],
      resources: ['Ferro Amaldicoado', 'Cristal de Maldicao', 'Madeira Ritual', 'Gema Fria'],
      materials: ['Fragmento Amaldicoado', 'Selo Profanado', 'Mantra Quebrado', 'Reliquia Nodita'],
      baseWeaponName: 'Cajado de Nod',
      image: 'assets/images/items/weapons/families/sacerdotisa-de-nod/weapon.svg',
      sourceDocument: 'arkhai/mmorpg-design-docs/05-items-and-equipment/families/sacerdotisa-de-nod/weapons.md',
      sourceHeading: 'Familia Sacerdotisa de Nod - Armas',
      summary:
        'Armas de ritual proibido feitas de ossos ritualisticos, metais amaldicoados e cristais corrompidos.',
      rarityNames: {
        Incomum: 'Cajado de Nod',
        Raro: 'Cajado Amaldicoado',
        Epico: 'Cajado do Ritual',
        Lendario: 'Voz de Nod'
      },
      recipe: [
        'Projeto de Cajado',
        '+ Fragmento Amaldicoado',
        '+ Selo Profanado Incomum',
        '+ Ferro Amaldicoado Incomum',
        '+ Selo Runico Incomum',
        '= Cajado de Nod [Incomum I]'
      ],
      visuals: [
        { rarity: 'Incomum', text: 'Cajado de osso simples com runas fracas' },
        { rarity: 'Raro', text: 'Runas vermelhas pulsando lentamente' },
        { rarity: 'Epico', text: 'O cajado murmura frases incompreensiveis' },
        { rarity: 'Lendario', text: 'Runas flutuam fora da arma como espectros' }
      ],
      ascensions: [
        {
          from: 'Cajado de Nod [Incomum IV]',
          result: 'Cajado Amaldicoado [Raro I]',
          materials: [
            'Mantra Quebrado Raro',
            'Cristal de Maldicao Raro',
            '100x Fragmento de Ar-Khe Raro',
            '100x Cinza Arcana Rara',
            '100x Selo Runico Raro'
          ]
        },
        {
          from: 'Cajado Amaldicoado [Raro IV]',
          result: 'Cajado do Ritual [Epico I]',
          materials: [
            'Reliquia Nodita Epica',
            'Madeira Ritual Epica',
            '300x Fragmento de Ar-Khe Epico',
            '300x Cinza Arcana Epica',
            '300x Selo Runico Epico'
          ]
        },
        {
          from: 'Cajado do Ritual [Epico IV]',
          result: 'Voz de Nod [Lendario I]',
          materials: [
            'Osso da Sacerdotisa Ancestral Lendario',
            'Cristal de Maldicao Primordial',
            '900x Fragmento de Ar-Khe Primordial',
            '900x Cinza Arcana Primordial',
            '900x Selo Runico Primordial'
          ]
        }
      ],
      directions: [
        'A arma deve favorecer debuffs e magia ritualistica.',
        'O visual deve transmitir proibicao e corrupcao.',
        'Efeitos visuais devem usar runas, ecos e energia sombria.'
      ]
    })
  ];

  const familyById = Object.fromEntries(families.map(family => [family.id, family]));
  const weaponTypeIndex = Object.fromEntries(weaponTypeOrder.map(typeName => [typeName, []]));

  families.forEach(family => {
    family.types.forEach(type => {
      const typeName = type.weaponType || family.weaponType;

      if (!weaponTypeIndex[typeName]) {
        weaponTypeIndex[typeName] = [];
      }

      weaponTypeIndex[typeName].push({
        family,
        type
      });
    });
  });

  function getWeaponSelection(options) {
    const familyId = options && options.familyId ? options.familyId : families[0].id;
    const family = familyById[familyId] || families[0];
    const typeId = options && options.typeId ? options.typeId : family.defaultTypeId;
    const type = family.typeById[typeId] || family.typeById[family.defaultTypeId];
    const rarity = options && options.rarity ? options.rarity : rarityOrder[0];
    const tier = options && options.tier ? options.tier : tierOrder[0];
    const variant = type.variantByKey[`${rarity}:${tier}`] || type.variants[0];

    return { family, type, variant };
  }

  window.ArkhaiWeaponsData = {
    rarityOrder,
    tierOrder,
    weaponTypeOrder,
    weaponTypeMeta,
    weaponTypeIndex,
    resolveWeaponTypeName,
    defaultImage,
    resolveWeaponImage,
    createWeaponImageHtml,
    buildWeaponType,
    families,
    familyById,
    getWeaponSelection
  };

  window.weaponFamilies = families;
  window.weaponRarityOrder = rarityOrder;
  window.weaponTierOrder = tierOrder;
  window.weaponTypeOrder = weaponTypeOrder;
  window.weaponTypeMeta = weaponTypeMeta;
  window.weaponTypeIndex = weaponTypeIndex;
  window.resolveWeaponTypeName = resolveWeaponTypeName;
  window.weaponDefaultImage = defaultImage;
  window.resolveWeaponImage = resolveWeaponImage;
  window.createWeaponImageHtml = createWeaponImageHtml;
  window.buildWeaponType = buildWeaponType;
  window.getWeaponSelection = getWeaponSelection;
})();
