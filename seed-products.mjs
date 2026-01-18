import postgres from 'postgres';

const PRODUCTS = [
  {
    id: 1,
    emoji: "🦝",
    name: "Coatí Guard",
    slogan: "¡Protege tu viaje!",
    description: "Dispositivo ultrasónico avanzado que emite frecuencias específicas para alertar a la fauna silvestre de Costa Rica. Diseñado especialmente para prevenir colisiones con coatíes, venados y otros animales en carreteras montañosas. Se monta fácilmente en el parachoques del vehículo y se activa automáticamente con el movimiento. Resistente al agua y a condiciones climáticas extremas.",
    imageUrl: "/products/01_coati_guard.jpg"
  },
  {
    id: 2,
    emoji: "🐆",
    name: "Ocelot Alert",
    slogan: "¡Viaja seguro en la selva!",
    description: "Sistema de alerta premium con tecnología de doble frecuencia para proteger tanto a los conductores como a la vida silvestre en peligro de extinción. Especialmente efectivo en zonas de reservas naturales y parques nacionales. Incluye indicador LED de funcionamiento y batería de larga duración. Certificado por organizaciones de conservación de Costa Rica.",
    imageUrl: "/products/02_ocelot_alert.jpg"
  },
  {
    id: 3,
    emoji: "🌬️",
    name: "Brisa Tica",
    slogan: "¡Aire fresco, energía limpia!",
    description: "Ventilador solar innovador que mantiene tu vehículo fresco incluso cuando está estacionado bajo el intenso sol tropical. El panel solar de alta eficiencia captura la energía del sol para hacer circular el aire caliente hacia afuera. Reduce la temperatura interior hasta 15°C. Instalación sin herramientas en cualquier ventana. Perfecto para el clima de Costa Rica.",
    imageUrl: "/products/03_brisa_tica.jpg"
  },
  {
    id: 4,
    emoji: "🦜",
    name: "Tucán Grip",
    slogan: "¡Tu teléfono siempre a mano!",
    description: "Soporte magnético de teléfono con diseño inspirado en el pico del tucán. Rotación 360° para vista perfecta en modo retrato o paisaje. Base con ventosa de vacío ultra fuerte que se adhiere a cualquier superficie. Compatible con todos los smartphones. Incluye placas magnéticas adhesivas. Ideal para navegación GPS en las rutas de Costa Rica.",
    imageUrl: "/products/04_tucan_grip.jpg"
  },
  {
    id: 5,
    emoji: "🦋",
    name: "Morpho Shield",
    slogan: "¡Protección invisible contra insectos!",
    description: "Repelente ultrasónico de última generación que crea una barrera invisible contra mosquitos, jejenes y otros insectos tropicales. Tecnología silenciosa e inodora, segura para humanos y mascotas. Cobertura de hasta 20 metros cuadrados. Recargable vía USB con batería de 12 horas. Perfecto para terrazas, jardines y actividades al aire libre en Costa Rica.",
    imageUrl: "/products/05_morpho_shield.jpg"
  },
  {
    id: 6,
    emoji: "☀️",
    name: "Sol Tico",
    slogan: "¡Energía del sol en tu bolsillo!",
    description: "Powerbank solar de 20,000mAh con paneles de alta eficiencia. Carga completa en 8 horas de sol tropical. Dos puertos USB para carga simultánea. Linterna LED integrada con modo SOS. Resistente al agua (IP67) y a caídas. Perfecto para excursiones a playas, volcanes y selvas de Costa Rica. Incluye mosquetón para mochila.",
    imageUrl: "/products/06_sol_tico.jpg"
  },
  {
    id: 7,
    emoji: "🐢",
    name: "Tortuga Case",
    slogan: "¡Protección total para tu teléfono!",
    description: "Funda impermeable con certificación IP68 que protege tu smartphone hasta 10 metros de profundidad. Diseño inspirado en el caparazón de las tortugas marinas de Costa Rica. Pantalla táctil totalmente funcional bajo el agua. Perfecta para snorkel, kayak y días de playa. Incluye cordón flotante de seguridad. Compatible con la mayoría de smartphones.",
    imageUrl: "/products/07_tortuga_case.jpg"
  },
  {
    id: 8,
    emoji: "🐒",
    name: "Mono Bottle",
    slogan: "¡Hidratación inteligente!",
    description: "Botella de agua plegable de silicona de grado alimenticio. Se comprime hasta ocupar solo 5cm cuando está vacía. Capacidad de 750ml cuando está expandida. Libre de BPA y resistente a temperaturas de -40°C a 200°C. Mosquetón integrado para colgar en mochilas. Ideal para el clima tropical y aventuras en Costa Rica. Fácil de limpiar.",
    imageUrl: "/products/08_mono_bottle.jpg"
  },
  {
    id: 9,
    emoji: "👁️",
    name: "Ojo de Jaguar",
    slogan: "¡Ilumina tu aventura!",
    description: "Linterna frontal LED de 5000 lúmenes con cinco modos de iluminación. Sensor de movimiento para encendido sin manos. Batería recargable de larga duración (hasta 20 horas en modo bajo). Resistente al agua y ajustable para máxima comodidad. Perfecta para caminatas nocturnas, camping y exploración de cuevas en Costa Rica.",
    imageUrl: "/products/09_ojo_jaguar.jpg"
  },
  {
    id: 10,
    emoji: "🦥",
    name: "Perezoso Fan",
    slogan: "¡Frescura portátil!",
    description: "Mini ventilador recargable con diseño ultra compacto. Tres velocidades ajustables para máximo confort. Batería de 2000mAh que dura hasta 8 horas. Silencioso como un perezoso. Base plegable para uso de escritorio o portátil. Cable USB-C incluido. Perfecto para el calor tropical de Costa Rica. Disponible en colores inspirados en la naturaleza.",
    imageUrl: "/products/10_perezoso_fan.jpg"
  },
  {
    id: 11,
    emoji: "🔍",
    name: "Tucán Finder",
    slogan: "¡Nunca pierdas tus llaves!",
    description: "Localizador Bluetooth de precisión con alcance de 50 metros. Aplicación intuitiva que muestra la ubicación exacta en mapa. Alarma bidireccional: encuentra tu teléfono desde el dispositivo. Batería reemplazable que dura un año. Resistente al agua. Diseño compacto para llaves, mochilas, carteras. Comunidad de búsqueda para objetos perdidos en Costa Rica.",
    imageUrl: "/products/11_tucan_finder.jpg"
  },
  {
    id: 12,
    emoji: "🌡️",
    name: "Pura Vida Thermo",
    slogan: "¡Temperatura perfecta todo el día!",
    description: "Termo de acero inoxidable de doble pared con aislamiento al vacío. Mantiene bebidas frías por 24 horas y calientes por 12 horas. Capacidad de 750ml. Boca ancha para fácil limpieza y adición de hielo. Recubrimiento antideslizante. Libre de BPA. Tapa hermética a prueba de derrames. Perfecto para café en la montaña o agua fría en la playa.",
    imageUrl: "/products/12_pura_vida_thermo.jpg"
  },
  {
    id: 13,
    emoji: "☂️",
    name: "Quetzal Rain",
    slogan: "¡Protección contra la lluvia tropical!",
    description: "Paraguas compacto automático que se abre y cierra con un botón. Estructura reforzada resistente a vientos de hasta 100 km/h. Tela de secado rápido con tratamiento repelente al agua. Se pliega a solo 30cm de longitud. Incluye funda de transporte. Diseño inspirado en las plumas del quetzal. Ideal para la temporada de lluvias de Costa Rica.",
    imageUrl: "/products/13_quetzal_rain.jpg"
  },
  {
    id: 14,
    emoji: "🐸",
    name: "Ranita Cooler",
    slogan: "¡Frescura para tus aventuras!",
    description: "Bolsa térmica plegable de 20 litros con aislamiento de espuma de alta densidad. Mantiene alimentos y bebidas frías por hasta 8 horas. Exterior resistente al agua e interior fácil de limpiar. Correa ajustable para hombro. Se pliega completamente cuando no está en uso. Perfecta para días de playa, picnics y excursiones en Costa Rica. Incluye bolsillos externos.",
    imageUrl: "/products/14_ranita_cooler.jpg"
  }
];

async function seedProducts() {
  const sql = postgres(process.env.DATABASE_URL);
  
  console.log('Seeding products...');
  
  for (const product of PRODUCTS) {
    await sql`
      INSERT INTO products (id, emoji, name, slogan, description, image_url, base_price, is_active) 
      VALUES (${product.id}, ${product.emoji}, ${product.name}, ${product.slogan}, ${product.description}, ${product.imageUrl}, '0.00', 1)
      ON CONFLICT (id) DO UPDATE SET
        emoji = EXCLUDED.emoji,
        name = EXCLUDED.name,
        slogan = EXCLUDED.slogan,
        description = EXCLUDED.description,
        image_url = EXCLUDED.image_url
    `;
  }
  
  await sql.end();
  console.log('Products seeded successfully!');
}

seedProducts().catch(console.error);
