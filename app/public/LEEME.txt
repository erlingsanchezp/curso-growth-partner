GROWTH PARTNER DESDE CERO · AULA DE SISTEMAS · VERSIÓN 1.0
Edición de estudio: 18 de octubre de 2026

INICIO RÁPIDO
1. Descomprime el paquete.
2. Sube el CONTENIDO de public a la carpeta que tu hosting sirve como web.
3. Abre la URL que apunta a index.html.
No requiere Node, compilación, framework, cuenta, API ni base de datos.
Todos los enlaces internos usan rutas relativas y navegación mediante #.
Puedes servirlo en la raíz o en una subcarpeta; no necesita reescrituras SPA.
Se requiere un navegador moderno con JavaScript, CSS Grid y almacenamiento local.

PRUEBA EN TU EQUIPO
Si tienes Python 3, abre una terminal dentro de public y ejecuta:
python3 -m http.server 8000
Después abre http://localhost:8000/ en tu propio navegador.
Detén ese servidor con Ctrl+C al terminar. En Windows puede llamarse python.
También puedes abrir public/index.html directamente, pero el almacenamiento
bajo file: no tiene comportamiento uniforme. Para uso consistente usa HTTP/HTTPS.

HOSTING
Sirve HTML como text/html, JS como text/javascript, CSS como text/css,
SVG como image/svg+xml y PDF como application/pdf. Conserva nombres y carpetas.
No subas archivos de bases de datos de práctica ni secretos al sitio público.
La configuración de caché depende de tu proveedor. Al actualizar, cambia
versión/rutas o invalida la caché para evitar mezclar archivos viejos y nuevos.
HTTPS es recomendable para un despliegue público. Este paquete no configura
dominio, certificado, cuentas ni políticas del proveedor de alojamiento.

QUÉ CONTIENE
24 módulos, 72 lecciones, 96 preguntas con explicación y opciones barajadas.
12 casos simulados con solución y criterios de revisión.
6 prácticas: economía, embudo, Wilson, A/B, muestra y automatización.
Proyecto final: seis cálculos, cuatro decisiones y rúbrica de seis dimensiones.
Libro completo de 132 páginas, 10 figuras originales y 13 fuentes primarias.
Datos CSV ficticios y ejemplo de automatización local en Python.

EVALUACIÓN
Un módulo completo requiere tres lecciones marcadas y al menos 3/4 en su prueba.
El primer intento, mejor resultado y número de intentos se conservan separados.
El cuaderno de cada módulo permite exportar una ficha Markdown para compartir
un aprendizaje y pedir retroalimentación usando tres preguntas de revisión.
El límite de guardado es 100 intentos por módulo; leer no está bloqueado.
El caso final se aprueba con 8/10. El expediente se registra como preparado
cuando están completos los 24 módulos, el caso final aprobado, la rúbrica con
al menos 2/3 por dimensión y el resumen de al menos 160 caracteres.
Esto no es una acreditación externa, verificación de autoría ni garantía de empleo.
Los textos abiertos requieren revisión humana para valorar su calidad real.
Los resultados del curso son editables en un navegador: no sirven como examen
vigilado ni como credencial verificable por terceros.

DATOS Y PRIVACIDAD
Se guarda progreso en localStorage bajo la clave gp-aula-v1, por navegador y
origen. No hay sincronización, cuentas ni analítica externa. El hosting puede
registrar accesos por su propia configuración. No escribas datos sensibles.
Exporta el respaldo JSON desde Guardar respaldo o Mi progreso; importa desde
Mi progreso, revisa el resumen y confirma. Importar reemplaza el avance local.
No se garantiza persistencia en modo privado, con almacenamiento bloqueado,
al cambiar de dominio o después de borrar datos del navegador.
Reiniciar progreso elimina solo los datos del curso tras confirmación en la UI.

AUTOMATIZACIÓN LOCAL (no es infraestructura de producción)
Dentro de public/ejemplos:
python3 automatizacion.py demo --db practica.sqlite
Para observar el fallo y recuperación por separado, usa una base nueva:
python3 automatizacion.py ingest eventos.jsonl --db prueba2.sqlite
python3 automatizacion.py run --db prueba2.sqlite --fail-once L3
python3 automatizacion.py report --db prueba2.sqlite
python3 automatizacion.py run --db prueba2.sqlite
python3 automatizacion.py report --db prueba2.sqlite
Esperado: cuatro eventos únicos, tres entidades, dos efectos lógicos finales;
L2 queda excluido por baja. Reingresar el lote no duplica eventos ni efectos.
La práctica escribe SQLite local y nunca envía correo ni conecta servicios.
Para producción revisa receptor seguro, firmas, secretos, colas, concurrencia,
copias, monitoreo, privacidad, retención y efectos externos con resultados inciertos.

PERSONALIZACIÓN
app.js controla las vistas. core.js contiene cálculos, evaluación y estado.
styles.css define el diseño adaptable. course-data.js contiene las lecciones,
preguntas, casos y fuentes. El primer elemento de las opciones del banco es
la respuesta correcta; se baraja al presentarse. Cambia formato y lógica juntos
si rediseñas el banco. No cambies la versión de progreso sin una migración.
No hay dependencias remotas ni pasos de instalación para servir el curso.

VERIFICACIÓN
Se revisaron el PDF renderizado, cálculos, persistencia y validación de datos,
evaluaciones, rutas, simulaciones, archivos y ejemplo Python con pruebas locales.
La interfaz no se revisó en un navegador gráfico en este entorno. Antes de
ofrecerla públicamente, prueba teclado, móvil y los navegadores de tu audiencia.
Esta limitación no equivale a una garantía de compatibilidad universal.

FUENTES Y AUTORÍA
Fuentes primarias y sus límites están dentro de Libro y recursos y en el PDF.
Consulta editorial: 18-10-2026. Verifica documentación viva antes de implementar.
Casos, cifras comerciales, imágenes de gráficos y entregas son didácticos.
La voz narrativa es un recurso editorial, no una biografía o experiencia inventada.
Las menciones de marcas no implican afiliación, patrocinio ni datos internos.
Código, texto y figuras originales del paquete se entregan para uso, adaptación
y despliegue del curso por su destinatario. Las fuentes enlazadas conservan sus derechos.
