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

Hacelo con el dominio ya cargando desde Pages.

**1 · Crear la propiedad.** En [search.google.com/search-console](https://search.google.com/search-console)
→ selector de propiedades (arriba a la izquierda) → **Añadir propiedad**.
Elegí la columna **Dominio**, no "Prefijo de la URL", y escribí:

```
manaespacio.com
```

Sin `https://`, sin `www`, sin barra final. La propiedad de tipo Dominio cubre
el apex, el `www` y http/https de una sola vez, y se verifica por DNS, así que
no se rompe si algún día cambiás de alojamiento.

**2 · Verificar por DNS.** Google devuelve un registro parecido a
`google-site-verification=AbC123...`. En el panel del registrador del dominio,
creá un registro:

| Campo | Valor |
| --- | --- |
| Tipo | `TXT` |
| Nombre / Host | `@` (en algunos paneles se deja vacío, o se escribe `manaespacio.com`) |
| Valor | la cadena completa `google-site-verification=...` |
| TTL | el que venga por defecto |

Este `TXT` convive sin problema con los registros `A` de GitHub: no los pisa.

Para comprobar que propagó antes de pulsar *Verificar*:

```bash
dig +short TXT manaespacio.com
# → tiene que aparecer "google-site-verification=..."
```

Suele tardar entre unos minutos y un par de horas. Si Google dice que no lo
encuentra, esperá y volvé a intentar; no hace falta rehacer nada.

**3 · Enviar el sitemap.** Ya verificado: menú lateral → **Sitemaps** → en
"Añadir un sitemap nuevo" escribí `sitemap.xml` → **Enviar**. El estado pasa a
"Correcto" y detecta 4 URL.

**4 · Pedir indexación de las páginas nuevas.** Antes el sitio era una sola
página, así que estas tres no existían. En la barra superior (*Inspeccionar
cualquier URL*), pegá cada una y pulsá **Solicitar indexación**:

```
https://manaespacio.com/about/
https://manaespacio.com/contact/
https://manaespacio.com/privacy/
```

La portada conviene inspeccionarla también, para que Google vuelva a rastrearla
con el diseño nuevo.

**5 · Qué NO hacer.** No añadas `maurotondato.github.io` como propiedad: todas
las páginas declaran `rel="canonical"` hacia `manaespacio.com`, así que la vista
previa no compite con el dominio.

**6 · Qué vas a ver después.** En *Páginas*, los alias (`/sobre-mi/`,
`/contacto/`, `/privacidad/`, `/servicios/`, `/testimonios/`), `/gracias/` y el
404 aparecen como "Excluida por la etiqueta noindex" o "Página alternativa con
la etiqueta canónica correcta". Es lo buscado, no un error. Las tres páginas
nuevas pueden tardar de días a semanas en pasar de "Descubierta" a "Indexada".

**7 · Si ya tenías una propiedad de la época de Netlify.** Seguirá en la lista.
Si era de tipo "Prefijo de la URL" y se verificó con un archivo `googleXXXX.html`
subido al sitio, esa verificación ya no vale, porque el sitio viejo se
reemplazó. La propiedad de Dominio del paso 1 la reemplaza con ventaja; podés
dejar la vieja o borrarla, no molesta.

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
