# Librería Cuadratín — plantilla de librería

> **Sitio de demostración.** «Librería Cuadratín» es un **negocio ficticio**. El nombre,
> la dirección (Praza do Cuadrante, 2 · Lugo), el teléfono (982 00 00 18), el horario,
> los precios, las dos personas del equipo y las opiniones son **datos de muestra
> inventados**. No corresponden a ningún negocio real. La página lleva
> `noindex, nofollow` a propósito.
>
> **Los libros tampoco existen**: títulos, autores y sellos editoriales están inventados
> y las portadas están dibujadas para esta plantilla.

**Demo:** https://alvarotaiagu.github.io/plantilla-libreria-web/

---

## El concepto: «Lomos»

Nadie entra en una librería pidiendo un ISBN: se entra, se pasa el dedo por la balda y
se para donde se para. Lo único que se ve de un libro en una estantería es **el lomo**,
y de ahí sale todo:

- El hero **es una estantería**: 46 cantos de colores con su título en vertical. Al
  pasar el dedo, el lomo **sale a saludar** y los dos vecinos se inclinan, como pasa de
  verdad cuando sacas un libro. Funciona con ratón, con teclado (los lomos son
  enfocables) y con el dedo.
- Los titulares **suben desde detrás del canto**, con la línea recortada: el texto sale
  del lomo.
- La paleta es una pared oscura de librería con los colores saturados de las
  encuadernaciones; el mono de máquina de escribir hace el resto.

Registro visual: pared verde tinta, cantos de color y tipografía de taller. Es lo
contrario del blanco clínico y del papel claro de las otras plantillas de la tanda.

## Mapa de secciones

| # | Sección | Qué hace |
|---|---|---|
| — | La estantería | 46 lomos que responden al dedo, al ratón y al teclado |
| 01 | La mesa de novedades | Seis libros con portada dibujada y la nota escrita a mano de la casa |
| 02 | El plano | Plano en SVG de los 60 m²: cada zona se enciende a la vez en el dibujo y en la lista |
| 03 | Club de lectura | Los **primeros jueves reales** de los próximos seis meses, calculados en vivo |
| 04 | Encargos | Los cuatro pasos y un formulario de muestra |
| 05 | Quién atiende | Las dos libreras y tres opiniones marcadas como de muestra |
| 06 | Visítanos | Horario **en vivo**, dirección y mapa bajo clic |

## Recursos de movimiento

1. **Lenis** como único motor de scroll.
2. **La balda** — el recurso protagonista: lomos que salen y vecinos que se inclinan,
   más el llenado de izquierda a derecha al cargar.
3. **Titulares que suben desde detrás del canto** (línea recortada por `overflow`).
4. **El plano**, que empareja el dibujo con la lista al pasar por encima.
5. **Botones magnéticos** y **cursor** en forma de marcapáginas.
6. **Club de lectura en vivo** y **horario en vivo** con el día de hoy resaltado.

## Rendimiento medido

`PerformanceObserver` de `longtask` en la pasada de verificación (Chromium, 1440×900,
recorrido completo con la rueda): **1 tarea larga en total, de 141 ms, al arrancar**
(GSAP + webfont) y **0 mientras se recorre la página**.

## Cómo reskinearlo a una librería real

1. **Los lomos se generan.** Están en el HTML entre `<!--LOMOS-->` y `<!--/LOMOS-->`,
   escritos por el script `genlibros.js` que acompaña a la plantilla: ahí se cambian los
   títulos, los colores y la cantidad. Conviene que sobren, porque la balda se recorta.
2. **Ojo con el ancho:** la fila de lomos es más ancha que la pantalla a propósito. Sin
   `overflow: clip` en `html` y `overflow: hidden` en `.balda`, el **móvil ensancha el
   viewport entero** para que quepa y toda la página se descoloca. Costó una sesión
   encontrarlo.
3. **Las portadas** también salen del script (`assets/portadas/`), con seis motivos
   geométricos. Para una librería real se sustituyen por las portadas que la editorial
   permita usar, cambiando el `<img>` de cada `<li class="libro">`.
4. **El plano** es SVG en línea dentro de `index.html`: cada zona es un `<g
   class="plano__zona" data-zona="…">` emparejado con su `<li data-zona="…">`. Para otra
   tienda, se redibujan los rectángulos y se mantienen los `data-zona`.
5. **El club de lectura** se calcula en la sección 6 de `js/main.js`: la función busca
   el primer jueves de cada mes. Si el club es otro día, se cambia el `getDay() !== 4`.
6. **Datos del negocio** — el `application/ld+json` del `<head>`, la sección «Visítanos»,
   el `<footer>` y la consulta del mapa (sección 12 de `js/main.js`).
   Quitar `noindex, nofollow` y el sello de demostración.
7. **Horario** — sección 9 de `js/main.js`, en minutos desde medianoche, con
   `0 = domingo`.

## Decisiones tomadas

- **Ni un libro real.** Todo lo que se ve —lomos, portadas, lecturas del club— está
  inventado, y se avisa en la página, en el pie y en el aviso legal.
- **Sin `aggregateRating` ni `review`** en los datos estructurados, aunque haya
  testimonios: van firmados con nombre de pila y con su aviso de muestra debajo.
- **La balda es accesible**: cada lomo es enfocable con el teclado y sale igual que con
  el ratón; el titular conserva su texto sin partir para los lectores de pantalla.
- **Con `prefers-reduced-motion`** la balda sigue respondiendo (sin inclinarse), y el
  club y el horario siguen calculándose.
- **Lo de «una sola vez» va con `IntersectionObserver`**, no con `ScrollTrigger`
  `once: true`, que no dispara si el elemento ya está en pantalla al crearse.
- **Sin GSAP la página se lee entera**: los estados «vacíos» viven bajo `.has-motion`, y
  la balda es CSS puro.

## Créditos

Ver [`CREDITOS.md`](CREDITOS.md). No hay fotografías: todo es dibujo propio.

## Técnico

HTML + CSS + un `main.js`. Sin framework, sin build, sin backend, sin npm. GSAP,
ScrollTrigger y Lenis por CDN. Se abre con doble clic en `index.html` y se publica tal
cual en GitHub Pages.
