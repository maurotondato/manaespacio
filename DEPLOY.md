# Publicar en GitHub Pages y conectar manaespacio.com

El sitio es estático y no tiene build: GitHub Pages publica el repositorio tal
como está. Todas las rutas internas son relativas, así que funciona igual en
`maurotondato.github.io/manaespacio/` que en `manaespacio.com/`.

---

## 1. Publicar la rama

**Settings → Pages**

| Campo | Valor |
| --- | --- |
| Source | Deploy from a branch |
| Branch | `main` |
| Folder | `/ (root)` |

Cada push a esa rama vuelve a publicar el sitio, normalmente en menos de un minuto.

---

## 2. Conectar el dominio

Hacelo **en este orden**. Si añadís el dominio en GitHub antes de tocar el DNS,
la web queda con un error de certificado hasta que el DNS propague.

### 2.1 — Primero el DNS

En el panel del registrador de `manaespacio.com`, **borrá los registros que hoy
apuntan a Netlify** y dejá estos:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| `A` | `@` | `185.199.108.153` |
| `A` | `@` | `185.199.109.153` |
| `A` | `@` | `185.199.110.153` |
| `A` | `@` | `185.199.111.153` |
| `CNAME` | `www` | `maurotondato.github.io` |

Los cuatro registros `A` son de GitHub y hacen falta los cuatro.

Para comprobar que propagó (puede tardar desde minutos hasta 24 horas):

```bash
dig +short manaespacio.com
# → tienen que aparecer las cuatro IP 185.199.*
```

### 2.2 — Después el dominio en GitHub

**Settings → Pages → Custom domain** → escribí `manaespacio.com` → **Save**.

GitHub crea solo un archivo `CNAME` en la raíz del repositorio. **No lo crees a
mano antes de tiempo:** si lo subís con el DNS todavía apuntando a Netlify, la
vista previa de `maurotondato.github.io/manaespacio/` empieza a redirigir al
dominio y vas a seguir viendo la web vieja.

Cuando GitHub muestre el tilde verde de verificación, marcá **Enforce HTTPS**.
El certificado lo emite y renueva GitHub, gratis.

### 2.3 — Dar de baja el sitio en Netlify

Una vez que `manaespacio.com` cargue desde Pages, entrá a Netlify y quitá el
dominio de ese sitio, para que no queden los dos reclamando el mismo nombre.

---

## 3. Comprobaciones

```bash
# 1. Una ruta inexistente debe devolver 404, nunca 200
curl -s -o /dev/null -w "%{http_code}\n" https://manaespacio.com/some-path-that-does-not-exist
# → 404

# 2. Páginas y recursos clave
for p in / /about/ /contact/ /privacy/ /llms.txt /robots.txt /sitemap.xml /md/index.md; do
  echo "$p -> $(curl -s -o /dev/null -w '%{http_code}' https://manaespacio.com$p)"
done

# 3. Los alias en español siguen llevando a su página
curl -s https://manaespacio.com/sobre-mi/ | grep -o 'url=[^"]*'
```

También conviene:

- **[Rich Results Test](https://search.google.com/test/rich-results)** → pegar
  `https://manaespacio.com/` y confirmar que detecta `Organization` y `Person`.
- **PageSpeed Insights** → `https://manaespacio.com/`.

### Google Search Console

Hacelo **después** de que el dominio ya cargue desde Pages, no antes.

1. **Verificar la propiedad.** Elegí el tipo **Dominio** (no "Prefijo de URL"):
   cubre `manaespacio.com`, `www.manaespacio.com` y http/https de una sola vez,
   y se verifica con un registro `TXT` en el DNS, así que sobrevive a cualquier
   cambio de alojamiento. Si la verificación anterior era un archivo
   `googleXXXX.html` subido al sitio viejo, ya no existe y hay que rehacerla.
2. **Enviar el sitemap** en *Sitemaps* → `sitemap.xml`.
3. **Pedir indexación** de las tres URL nuevas en *Inspección de URLs*:
   `/about/`, `/contact/` y `/privacy/`. Antes el sitio era una sola página, así
   que estas no existían.
4. **No** añadas `maurotondato.github.io` como propiedad. Todas las páginas
   declaran su `rel="canonical"` hacia `manaespacio.com`, así que la vista previa
   no compite con el dominio.
5. En *Cobertura* pueden aparecer los alias (`/sobre-mi/`, `/contacto/`…) como
   "Página alternativa con etiqueta canónica adecuada" o "Excluida por noindex".
   Es el comportamiento buscado, no un error.

---

## 4. Qué no puede hacer GitHub Pages

Pages sirve archivos y nada más: no deja definir cabeceras HTTP propias ni
ejecutar código. Por eso hay dos cosas de la lista original que **no se cumplen**
con este alojamiento:

| | Estado |
| --- | --- |
| `Vary: Accept, Accept-Encoding` | ❌ no se puede enviar |
| Markdown por `Accept: text/markdown` | ❌ no se puede negociar |

Lo que sí queda resuelto: las variantes markdown existen como archivos estáticos
en `/md/`, y cada página las declara en su `<head>` con
`rel="alternate" type="text/markdown"`, además de listarlas `llms.txt`. Un agente
las encuentra igual; lo que no puede es pedirlas por cabecera.

Si en algún momento querés recuperar esas dos cosas, la configuración de Netlify
que las resolvía está en el historial de git (commit `d0d261f`, archivos
`netlify.toml` y `netlify/edge-functions/content-negotiation.ts`). Otra opción es
poner Cloudflare gratis por delante de Pages, que sí permite añadir cabeceras.

---

## 5. Cosas a revisar con tu cuenta

1. **Formulario de contacto.** Usa [FormSubmit](https://formsubmit.co) apuntando
   a `soporte.manaespacio@gmail.com`. Funciona igual en Pages, porque el envío va
   directo a su servidor. La primera vez que se envíe desde el dominio nuevo,
   FormSubmit manda un email de activación que hay que confirmar una sola vez.

2. **Widget de Instagram.** Se mantiene el mismo widget de Fouita que ya estaba
   (`wdg.fouita.com/widgets/0x2d5f67.js`). Si alguna vez deja de funcionar, la
   sección muestra automáticamente un enlace directo al perfil, así que la página
   nunca queda con un hueco.

3. **Dirección.** Los datos estructurados declaran `Tandil, Buenos Aires, AR`
   (código postal 7000) como lugar de atención presencial, y la Universidad
   Nacional de La Plata como dónde estudiaste. Si querés añadir la calle y el
   número del consultorio, están en `index.html`, `about/index.html`,
   `contact/index.html` y `md/contact.md`.

---

## 6. Si algo sale mal

- **Actions** (pestaña del repositorio) muestra el resultado de cada publicación.
- Para volver atrás, `git revert` del commit y push: Pages republica sola.
- No hay build, así que una publicación no puede "fallar al compilar"; si algo se
  rompe, es contenido y se arregla con un commit.
