# Mana · Espacio Integral — manaespacio.com

Sitio estático de [manaespacio.com](https://manaespacio.com): psicología online,
sesiones focalizadas, oráculo, libros y viajes conscientes de la Lic. Agustina Nasello.

Sin build, sin dependencias, sin framework. Se publica tal cual está el repositorio.

**Todas las rutas internas son relativas**, así que el sitio funciona igual en la
raíz de un dominio (`manaespacio.com/about/`) que dentro de una subcarpeta
(`usuario.github.io/manaespacio/about/`). Por eso cada página vive en su propia
carpeta con un `index.html` dentro: la URL con barra final es idéntica en
GitHub Pages y en Netlify.

Al añadir enlaces o recursos nuevos, **nunca** empieces la ruta con `/`:
usa `images/foo.webp` desde la portada y `../images/foo.webp` desde una página
interior. Una ruta que empiece con `/` rompe el sitio en subcarpeta.

## Estructura

```
index.html              Portada
about/index.html        /about/    — Sobre mí
contact/index.html      /contact/  — Contacto
privacy/index.html      /privacy/  — Política de privacidad
gracias/index.html      /gracias/  — Confirmación del formulario (noindex)
404.html                Página de error (estado 404 real; estilos en línea)
.nojekyll               Desactiva el procesado de Jekyll en GitHub Pages

assets/css/styles.css   Sistema de diseño completo (tokens, componentes, animaciones)
assets/js/main.js       Interacciones en JavaScript nativo, sin librerías

images/                 Imágenes optimizadas en WebP (512 KB en total)
md/                     Variante markdown de cada página, para agentes de IA

llms.txt                Guía para asistentes y agentes: qué es el sitio y cuándo usarlo
robots.txt              Reglas de rastreo
sitemap.xml             Índice de páginas

sobre-mi/, contacto/, privacidad/…        Alias en español que redirigen
```

Alojado en **GitHub Pages**. Como Pages no admite reglas de redirección del
servidor, los alias en español son páginas mínimas con `meta refresh` y
`rel="canonical"` hacia la URL buena.

## Desarrollo local

Cualquier servidor estático sirve para ver el diseño:

```bash
python3 -m http.server 8000
```

Eso reproduce fielmente lo que hace GitHub Pages, que también es un servidor
de archivos estáticos. Para probarlo tal como se ve en Pages, o sea dentro de
una subcarpeta:

```bash
mkdir -p /tmp/pagesim && ln -s "$PWD" /tmp/pagesim/manaespacio
cd /tmp/pagesim && python3 -m http.server 8000
# abrir http://localhost:8000/manaespacio/
```

## Imágenes

Las imágenes originales pesaban **55 MB** en PNG, lo que hacía imposible subir el
sitio a GitHub con comodidad. Ahora pesan **512 KB** en WebP, con el mismo
contenido visual y variantes de distinto tamaño (`hero.webp` / `hero-sm.webp`,
`agustina.webp` / `agustina-sm.webp`, `flores.webp` / `flores-sm.webp`).

Si hay que añadir una imagen nueva, conviene convertirla antes:

```bash
python3 -c "
from PIL import Image
im = Image.open('original.png').convert('RGB')
im.thumbnail((1600, 1600), Image.LANCZOS)
im.save('images/nombre.webp', 'WEBP', quality=80, method=6)
"
```

## Despliegue

Ver [DEPLOY.md](DEPLOY.md).
