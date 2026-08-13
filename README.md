# 🧘‍♂️ ActivaYa

**ActivaYa** es una aplicación web diseñada para ayudarte a realizar descansos saludables durante tu jornada.  
Permite programar recordatorios y mostrar ejercicios guiados para estirarte, moverte y mejorar tu bienestar físico y mental.

---

## ✨ Características principales

- ⏰ **Recordatorios configurables** para tomar pausas activas.
- 🏃 **Ejercicios guiados** con duración personalizable.
- 📊 **Estadísticas** para consultar el progreso de las pausas y ejercicios.
- 📱 **Interfaz responsive** adaptada a móviles y escritorio.
- 📥 **Instalable como PWA** para acceder rápidamente a la aplicación.

---

## 🛠 Tecnologías utilizadas

- **Next.js**
- **TypeScript**
- **Tailwind CSS**
- **React**
- **shadcn/ui**
- **Framer Motion**
- **Recharts**
- **Zod**

---

## 📁 Estructura del proyecto

```text
activaya-main/
├── lib/
│   └── notifications.ts          # Lógica de notificaciones.
├── public/
│   ├── exercises/                # Imágenes de los ejercicios.
│   ├── helpimg/                  # Imágenes utilizadas en la guía de ayuda.
│   ├── k-logo.png
│   ├── logo-mono.svg
│   ├── logo192.png
│   ├── logo192.svg
│   ├── logo512.png
│   ├── logo512.svg
│   ├── manifest.json             # Configuración de la PWA.
│   ├── sw.js                     # Service worker de la aplicación.
│   └── welcome.png
├── src/
│   ├── app/
│   │   ├── break/
│   │   │   └── [id]/
│   │   │       └── page.tsx      # Página de ejecución de una pausa.
│   │   ├── stats/
│   │   │   └── page.tsx          # Página de estadísticas.
│   │   ├── favicon.ico
│   │   ├── globals.css           # Estilos globales.
│   │   ├── layout.tsx            # Layout raíz.
│   │   └── page.tsx              # Página principal.
│   ├── components/
│   │   ├── ui/                   # Componentes reutilizables de interfaz.
│   │   ├── BreakCard.tsx         # Tarjeta de una pausa.
│   │   ├── BreakForm.tsx         # Formulario de pausas.
│   │   ├── BreakList.tsx         # Lista y administración de pausas.
│   │   ├── BreakSession.tsx      # Lógica y ejecución de una sesión.
│   │   ├── HelpGuide.tsx         # Guía de ayuda.
│   │   ├── NotificationManager.tsx
│   │   ├── PwaInstaller.tsx
│   │   └── WelcomeScreen.tsx
│   ├── hooks/
│   │   ├── use-mobile.tsx        # Detección de viewport móvil.
│   │   ├── use-toast.ts          # Gestión de mensajes toast.
│   │   └── useLocalStorage.ts    # Persistencia local del estado.
│   └── lib/
│       ├── data.ts               # Catálogo de ejercicios.
│       ├── notifications.ts      # Programación de recordatorios.
│       ├── types.ts              # Tipos e interfaces.
│       └── utils.ts              # Utilidades compartidas.
├── .gitattributes
├── components.json               # Configuración de componentes UI.
├── LICENSE                       # Licencia GPLv3.
├── manual_de_usuario.pdf         # Manual de usuario.
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── postcss.config.mjs
├── README.md
├── tailwind.config.ts
└── tsconfig.json
```

### Organización del código

- **`src/app`** contiene las rutas y páginas de Next.js.
- **`src/components`** contiene los componentes específicos de ActivaYa.
- **`src/components/ui`** contiene componentes de interfaz reutilizables.
- **`src/hooks`** contiene hooks personalizados.
- **`src/lib`** contiene tipos, datos, utilidades y lógica de notificaciones.
- **`public`** contiene imágenes, recursos de la PWA y el service worker.
- **`lib/notifications.ts`** mantiene la lógica de notificaciones existente en la raíz del proyecto.

---

## 📄 Licencia

Este proyecto está distribuido bajo la **GNU General Public License v3.0 (GPLv3)**.

Consulta [`LICENSE`](./LICENSE) para los términos completos.

---

## 📬 Contacto

**Kilian Diaz Miranda**

- LinkedIn: https://www.linkedin.com/in/kiliandiazmiranda/
- Correo: [kiliandiazmiranda@outlook.com](mailto:kiliandiazmiranda@outlook.com)
