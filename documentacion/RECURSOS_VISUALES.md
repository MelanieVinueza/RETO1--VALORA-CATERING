# Imágenes y presentación del cliente

Se crearon ocho escenas con la herramienta integrada `imagegen`: una mesa para eventos, un buffet empresarial, una pausa de café, un menú saludable, una parrillada, cocina ecuatoriana, pastas y la preparación de platos en cocina. Son imágenes ilustrativas generadas, no fotografías de instalaciones ni de eventos reales de Válora.

Los originales se conservan fuera de la entrega. El proyecto incluye únicamente JPEG optimizados; la portada tiene dos tamaños para móviles y escritorio. No se necesitan servicios externos para cargar las imágenes.

| Uso | Archivo | Dimensiones |
|---|---|---|
| Portada | `assets/catering-hero.jpg` | 1440 × 960 |
| Portada en móvil | `assets/catering-hero-small.jpg` | 768 × 512 |
| Buffet empresarial | `assets/paquetes/buffet-empresarial.jpg` | 960 × 640 |
| Coffee break | `assets/paquetes/coffee-break.jpg` | 960 × 640 |
| Menú bienestar | `assets/paquetes/bienestar.jpg` | 960 × 640 |
| Parrillada | `assets/paquetes/parrillada.jpg` | 960 × 640 |
| Cocina ecuatoriana | `assets/paquetes/cocina-ecuatoriana.jpg` | 960 × 640 |
| Pastas | `assets/paquetes/pastas.jpg` | 960 × 640 |
| Sección Nosotros | `assets/imagenes/cocina-valora.jpg` | 960 × 640 |

Las rutas parten de la raíz del proyecto. Las imágenes tienen alternativas descriptivas, dimensiones declaradas y carga diferida, salvo la portada, que se prioriza. Cada paquete utiliza una imagen diferente definida en `data/productos.json`.

## Pantalla final

La vista del cliente utiliza «Finalizar compra» y termina con «Compra exitosa». Se retiraron los avisos de demostración, el comprobante largo y el envío de pedidos por WhatsApp del recorrido. Al finalizar correctamente se vacía el carrito y se ofrece «Seguir comprando».

El cambio es de presentación: los precios académicos se conservaron, no se añadió una pasarela de pago y no se registra un cobro. Para la defensa debe explicarse esa diferencia. Las condiciones de uso describen el alcance de la confirmación.

## Prompts utilizados

### Portada

```text
Use case: photorealistic-natural. Asset type: wide hero photograph for a Spanish catering website. Primary request: an appetizing, abundant and elegant catering table for an event. Scene: contemporary welcoming event setting, warm wooden table and cream linen, understated ceramic tableware. Subject: several distinct platters of freshly prepared food, roasted vegetables, elegant small savory appetizers, colorful salads, sliced grilled chicken and bread; thoughtfully arranged, natural portions. Composition: horizontal wide editorial photograph, three-quarter angle across the table, foreground food in clear focus and softly blurred welcoming background. Lighting: warm natural daylight, sophisticated but approachable. Palette: warm wood, cream, deep brown with the natural greens and reds of food. Constraints: no text, no logos, no watermarks, no recognizable people, no menus or signage; realistic food textures, coherent utensils, avoid repeated identical dishes. Landscape aspect ratio approximately 3:2.
```

### Buffet empresarial

```text
Use case: photorealistic-natural. Asset type: landscape product card photo for a Spanish catering service website. Primary request: appetizing professional business lunch buffet with roasted chicken, fluffy rice and colorful vegetables in separate cream ceramic serving platters, a pitcher of citrus water nearby. Scene: refined warm wooden dining table, natural linen, subtle professional event setting softly blurred behind. Composition: landscape 3:2 photograph at a three-quarter elevated angle, an abundant group catering arrangement, main platters centered and easy to recognize at thumbnail size. Lighting: soft warm window daylight, authentic food textures, premium editorial food photography. Palette: cream ceramic, warm walnut wood, natural vegetable greens and muted burgundy details. Constraints: no people, no text, no logos, no watermark; realistic food and dishes, no synthetic shine.
```

### Coffee break

```text
Use case: photorealistic-natural. Asset type: landscape product card photo for a Spanish catering service website. Primary request: elegant coffee break for a business meeting, two cream ceramic cups of coffee, a coffee pot, small golden croissants and miniature savory sandwiches arranged on a dark wooden board, a few berries in a small bowl. Scene: meeting room sideboard with cream linen, warm wood and chairs softly blurred in the background. Composition: landscape 3:2 close editorial photograph from a low diagonal tabletop angle; cups and pastry board are central focal points and clearly distinct from a buffet meal. Lighting: gentle morning window light, warm inviting professional atmosphere. Palette: espresso brown, pastry gold, cream, subtle burgundy berries and natural green garnish. Constraints: no people, no text, no logos, no watermark; realistic appetizing food textures, no cutlery floating.
```

### Menú bienestar

```text
Use case: photorealistic-natural. Asset type: landscape product card photo for a Spanish catering service website. Primary request: fresh healthy catering meal with a generous cream ceramic bowl of quinoa, chickpeas, avocado slices, cucumber, cherry tomatoes, leafy greens and roasted vegetables, with lemon wedges and a small glass of infused water. Scene: pale warm stone tabletop with a folded natural linen napkin and a small side dish of vegetables. Composition: landscape 3:2 overhead flat lay, one large colorful bowl centered slightly left with balanced surrounding ingredients, immediately recognizable at thumbnail size; completely different composition from a buffet or coffee service. Lighting: bright soft daylight with delicate natural shadows, high quality editorial food photography. Palette: fresh greens, tomato red, golden quinoa, neutral cream, small deep purple cabbage accents. Constraints: no people, no text, no logos, no watermark; realistic edible ingredients, no artificial shine.
```

### Preparación en cocina

```text
Use case: photorealistic-natural. Asset type: editorial photograph for the about section of a Spanish catering website. Primary request: close view of a chef preparing and finishing several fresh catering dishes in an orderly professional kitchen. Scene: clean worktop, ceramic dishes with grilled vegetables, fresh greens and a balanced meal, subtle stainless steel kitchen blurred behind. Subject: the chef's hands placing a garnish carefully with kitchen tweezers, clean neutral chef uniform visible from chest down, no face. Composition: horizontal close-up at worktop height, distinct from an event buffet table, emphasize care, craft and fresh ingredients. Lighting: gentle warm natural light, realistic photography. Palette: warm cream, brown worktop accents, natural greens. Constraints: no text, no logos, no watermarks, no identifiable people, anatomically correct hands, believable food and utensils, clean kitchen. Landscape aspect ratio approximately 3:2.
```
