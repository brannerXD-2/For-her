# Eclipse — para Camila

Una pequeña experiencia web hecha con HTML, CSS y JavaScript puro (sin frameworks, sin compilación, sin dependencias).

El concepto es un eclipse total: algo se pone en medio y por unos minutos no se ve lo que siempre estuvo ahí. Se recorre con el dedo:

| Momento | Qué pasa | Interacción |
| --- | --- | --- |
| **Entrada** | El cielo en totalidad, una frase y un anillo. | Tocar «entrar» (es el gesto que iPhone acepta para arrancar la música). Se puede elegir «en silencio». |
| **Ayer** | Siete fragmentos, con el eclipse en pánico: la corona parpadea y el corazón late rápido. | Tocar para continuar. |
| **Respirar** | Tres respiraciones: la corona se hincha al inhalar, el latido se aquieta con cada una. | Mantener presionado para inhalar, soltar para exhalar (o Espacio). Aparece «saltar» pasados 26 s. |
| **La luz vuelve** | Seis paradas. La luna se aleja: primero el anillo de diamante, luego una media luna de sol, un atardecer dorado sobre las montañas. En la oscuridad total las luces del valle están encendidas; se apagan cuando vuelve el sol. | Deslizar (arrastrar, rueda o flechas). La luna no se deja apurar: se detiene en cada pensamiento. Si nadie toca, avanza sola despacio. |
| **Final** | Luz plena. Tres respuestas posibles, todas válidas. | Elegir una. Después, «Camila.» y la firma. |

## Estructura

```
index.html
css/
  tokens.css     variables de diseño y tipografías
  base.css       reset, lienzo, velo
  story.css      fragmentos, respiración, instrucciones
  ui.css         entrada, botones, respuestas, despedida, pie, créditos
js/
  main.js        arranque, bucle, calidad adaptativa
  config.js      todos los números ajustables (y el WhatsApp opcional)
  content.js     todos los textos
  engine/        shader del cielo (WebGL), renderizador, estado del eclipse
  input/         puntero unificado (ratón, dedo, teclado)
  audio/         música (dos piezas) y latido (Web Audio)
  story/         entrada, ayer, respiración, luz, final
  ui/            fragmentos, HUD, créditos
  util/
assets/
  fonts/  audio/  images/
```

## Probarlo en local

Los módulos ES necesitan un servidor:

```bash
python -m http.server 5510
```

Con `?debug` en la URL se expone `window.app` y se puede saltar de capítulo: `?debug&from=breath`, `?debug&from=light&s=3`, `?debug&from=final`. `?motion=reduce` fuerza movimiento reducido.

## Publicar

Es un sitio estático: sirve en Vercel, GitHub Pages o cualquier hosting. Todas las rutas son relativas.

## Personalizar

- **Textos**: `js/content.js`. Cada fragmento es una lista de líneas; el siguiente espera un toque.
- **WhatsApp opcional**: en `js/config.js`, `CONTACT.whatsapp` (solo dígitos con prefijo, p. ej. `573001234567`). Si queda vacío, el botón «decírselo a Branner» no aparece.
- **Ritmo y aspecto**: `js/config.js` (tamaño del sol, sensibilidad del arrastre, respiraciones, calidad).

## Detalles técnicos

- **Móvil primero.** Pensado para iPhone en vertical; también horizontal, tabletas y escritorio (en pantallas anchas el eclipse pasa a la izquierda y el texto a la derecha). Áreas seguras, `100dvh`, objetivos táctiles de 44 px, nada depende del hover.
- **Rendimiento.** Un solo shader de pantalla completa; si los fotogramas van lentos, baja sola la resolución. Si WebGL no existe, queda un resplandor en CSS. Se recupera si el teléfono suelta el contexto gráfico en segundo plano.
- **Movimiento reducido.** Con `prefers-reduced-motion` desaparecen el parpadeo, el destello del latido, el paralaje y los desenfoques.
- **Sonido.** Nunca arranca solo: se elige en la entrada y arranca en el mismo toque (`click`) sobre un botón real, que es lo que Safari de iPhone acepta. Música en un `<audio>` (suena aunque el interruptor de silencio esté puesto); el latido usa Web Audio. En iOS el volumen del `<audio>` no se puede cambiar: ahí la música solo está encendida o apagada. Si el navegador bloquea el arranque, el icono de sonido late en dorado y un toque lo inicia.

## Créditos y licencias

- **Música**: «Floating Cities» y «Dreamer» de Kevin MacLeod ([incompetech.com](https://incompetech.com)), licencia [Creative Commons: Attribution 4.0](https://creativecommons.org/licenses/by/4.0/). Cambios: recortadas, convertidas en bucles continuos con fundido cruzado y ajuste de volumen.
  ```bash
  ffmpeg -i "Floating Cities.mp3" -filter_complex "[0:a]atrim=6:174,asetpts=PTS-STARTPTS[mid];[0:a]atrim=174:180,asetpts=PTS-STARTPTS[tail];[0:a]atrim=0:6,asetpts=PTS-STARTPTS[head];[tail][head]acrossfade=d=6:c1=qsin:c2=qsin[xf];[mid][xf]concat=n=2:v=0:a=1,volume=-1dB[out]" -map "[out]" -c:a libmp3lame -b:a 112k -ar 44100 assets/audio/sombra.mp3
  ffmpeg -i "Dreamer.mp3" -filter_complex "[0:a]atrim=6:186,asetpts=PTS-STARTPTS[mid];[0:a]atrim=186:192,asetpts=PTS-STARTPTS[tail];[0:a]atrim=0:6,asetpts=PTS-STARTPTS[head];[tail][head]acrossfade=d=6:c1=qsin:c2=qsin[xf];[mid][xf]concat=n=2:v=0:a=1,volume=-1dB[out]" -map "[out]" -c:a libmp3lame -b:a 112k -ar 44100 assets/audio/luz.mp3
  ```
- **Tipografías** (SIL Open Font License 1.1, en `assets/fonts/`): Instrument Serif, Geist Mono y DM Mono.
- El cielo, el eclipse, las montañas y el latido se dibujan y suenan desde el código; no hay imágenes de terceros.

*hecho con cariño por Branner*
