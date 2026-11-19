import { r as e } from "./rolldown-runtime-S-ySWqyJ.js";
import { i as t, r as n } from "./framework-CXnKph_e.js";
var r = e(t(), 1),
  i = {
    player: `_player_17xky_1`,
    centerButton: `_centerButton_17xky_19`,
    hidden: `_hidden_17xky_48`,
    controls: `_controls_17xky_54`,
    timeline: `_timeline_17xky_64`,
    controlRow: `_controlRow_17xky_112`,
    playIcon: `_playIcon_17xky_132`,
    pauseIcon: `_pauseIcon_17xky_141`,
    time: `_time_17xky_64`,
    quality: `_quality_17xky_156`,
    fullscreenIcon: `_fullscreenIcon_17xky_178`,
  },
  a = n(),
  o = (e) =>
    Number.isFinite(e)
      ? `${Math.floor(e / 60)}:${Math.floor(e % 60)
          .toString()
          .padStart(2, `0`)}`
      : `0:00`;
function s({ sources, poster, title, locale = `es` }) {
  const video = (0, r.useRef)(null);
  const switching = (0, r.useRef)(null);
  const pendingRef = (0, r.useRef)(false);
  const bufferTimer = (0, r.useRef)(null);
  const bufferAt = (0, r.useRef)(0);
  const [source, setSource] = (0, r.useState)(sources[0]?.src ?? ``);
  const [activated, setActivated] = (0, r.useState)(false);
  const [playing, setPlaying] = (0, r.useState)(false);
  const [pending, setPending] = (0, r.useState)(false);
  const [buffering, setBuffering] = (0, r.useState)(false);
  const [error, setError] = (0, r.useState)(false);
  const [current, setCurrent] = (0, r.useState)(0);
  const [duration, setDuration] = (0, r.useState)(0);
  const [muted, setMuted] = (0, r.useState)(false);
  const [volume, setVolume] = (0, r.useState)(1);
  const [rateIndex, setRateIndex] = (0, r.useState)(0);
  const [volumeUsable, setVolumeUsable] = (0, r.useState)(true);
  const rates = [1, 1.5, 2];
  const en = locale === `en`;
  const labels = en
    ? {play:`Play`, pause:`Pause`, loading:`Loading video`, error:`Video unavailable. Try again.`,
       quality:`Video quality`, seek:`Seek video`, mute:`Mute`, unmute:`Unmute`, volume:`Volume`, speed:`Playback speed`, fullscreen:`Fullscreen`}
    : {play:`Reproducir`, pause:`Pausar`, loading:`Cargando video`, error:`No se pudo reproducir. Intentá de nuevo.`,
       quality:`Calidad de video`, seek:`Recorrer video`, mute:`Silenciar`, unmute:`Activar sonido`, volume:`Volumen`, speed:`Velocidad`, fullscreen:`Pantalla completa`};
  const clearBuffer = () => {
    clearTimeout(bufferTimer.current);
    bufferTimer.current = null;
    setBuffering(false);
  };
  const clearPending = () => { pendingRef.current = false; setPending(false); };
  const attemptPlay = () => {
    const media = video.current;
    if (!media) return;
    setError(false);
    pendingRef.current = true;
    setPending(true);
    media.play().catch(() => { clearPending(); setError(true); });
  };
  (0, r.useEffect)(() => {
    const media = video.current;
    if (activated && media) {
      if (switching.current) media.load();
      else attemptPlay();
    }
  }, [activated, source]);
  (0, r.useEffect)(() => {
    const media = video.current;
    if (!media) return;
    try {
      const original = media.volume;
      media.volume = 0.46;
      setVolumeUsable(Math.abs(media.volume - 0.46) < 0.01 && window.matchMedia(`(hover: hover) and (pointer: fine)`).matches);
      media.volume = original;
    } catch { setVolumeUsable(false); }
    return () => clearTimeout(bufferTimer.current);
  }, []);
  const toggle = () => {
    const media = video.current;
    if (!media || switching.current || pendingRef.current) return;
    if (!activated) { pendingRef.current = true; setPending(true); setActivated(true); return; }
    if (media.paused || media.ended) attemptPlay();
    else { media.pause(); clearBuffer(); }
  };
  const changeQuality = (next) => {
    const media = video.current;
    if (!media || next === source) return;
    switching.current = { time: media.currentTime || 0, resume: !media.paused || pendingRef.current };
    media.pause();
    clearBuffer();
    clearPending();
    setSource(next);
    setActivated(true);
  };
  const metadata = () => {
    const media = video.current;
    if (!media) return;
    setDuration(Number.isFinite(media.duration) ? media.duration : 0);
    const restore = switching.current;
    if (restore) {
      media.currentTime = Math.min(restore.time, media.duration || restore.time);
      switching.current = null;
      if (restore.resume) attemptPlay();
    }
  };
  const updateTime = () => {
    const media = video.current;
    if (!media) return;
    setCurrent(media.currentTime || 0);
    if (media.currentTime > bufferAt.current + 0.025) clearBuffer();
  };
  const waiting = () => {
    const media = video.current;
    if (!media || media.paused || pendingRef.current || switching.current) return;
    clearTimeout(bufferTimer.current);
    bufferAt.current = media.currentTime;
    bufferTimer.current = setTimeout(() => {
      if (!media.paused && media.readyState < 3 && media.currentTime <= bufferAt.current + 0.025) setBuffering(true);
    }, 250);
  };
  const changeVolume = (value) => {
    const media = video.current;
    if (!media) return;
    media.volume = value;
    media.muted = value === 0;
    setVolume(value);
    setMuted(value === 0);
  };
  const toggleMute = () => {
    const media = video.current;
    if (!media) return;
    media.muted = !media.muted;
    setMuted(media.muted);
  };
  const nextSpeed = () => {
    const next = (rateIndex + 1) % rates.length;
    setRateIndex(next);
    if (video.current) video.current.playbackRate = rates[next];
  };
  const fullscreen = async () => {
    const media = video.current;
    const frame = media?.parentElement;
    try {
      if (frame?.requestFullscreen) await frame.requestFullscreen();
      else if (media?.webkitEnterFullscreen) media.webkitEnterFullscreen();
    } catch { /* Fullscreen is optional on this device. */ }
  };
  const progress = duration ? current / duration * 100 : 0;
  return (0, a.jsxs)(`div`, {className:i.player, children:[
    (0, a.jsx)(`video`, {ref:video, src:activated ? source : void 0, poster, title, playsInline:true, preload:`none`,
      onLoadedMetadata:metadata, onDurationChange:(event)=>setDuration(event.currentTarget.duration || 0),
      onTimeUpdate:updateTime, onPlaying:()=>{clearPending();clearBuffer();setPlaying(true);},
      onWaiting:waiting, onCanPlay:clearBuffer,
      onPause:()=>{setPlaying(false);if(!switching.current){clearPending();clearBuffer();}},
      onEnded:()=>{setPlaying(false);clearPending();clearBuffer();},
      onError:()=>{clearPending();clearBuffer();setError(true);}, onClick:toggle}),
    (0, a.jsx)(`button`, {className:`${i.centerButton} ${playing || pending ? i.hidden : ``}`,type:`button`,onClick:toggle,
      "aria-label":`${labels.play} ${title}`,children:(0,a.jsx)(`span`,{"aria-hidden":true})}),
    (pending || buffering) && (0,a.jsx)(`span`,{className:`player-loading`,role:`status`,"aria-label":labels.loading,children:`●`}),
    error && (0,a.jsx)(`span`,{className:`player-error`,role:`alert`,children:labels.error}),
    (0,a.jsxs)(`div`,{className:i.controls,onClick:(event)=>event.stopPropagation(),children:[
      (0,a.jsx)(`input`,{className:i.timeline,type:`range`,min:0,max:duration || 0,step:0.05,value:Math.min(current,duration || 0),
        onChange:(event)=>{if(video.current){video.current.currentTime=Number(event.target.value);setCurrent(video.current.currentTime);clearBuffer();}},
        "aria-label":`${labels.seek}: ${title}`,style:{"--progress":`${progress}%`}}),
      (0,a.jsxs)(`div`,{className:i.controlRow,children:[
        (0,a.jsx)(`button`,{type:`button`,onClick:toggle,"aria-label":`${playing ? labels.pause : labels.play} ${title}`,
          children:(0,a.jsx)(`span`,{className:playing ? i.pauseIcon : i.playIcon,"aria-hidden":true})}),
        (0,a.jsxs)(`span`,{className:i.time,children:[o(current),` / `,o(duration)]}),
        (0,a.jsxs)(`div`,{className:`player-volume`,children:[
          (0,a.jsx)(`button`,{type:`button`,onClick:toggleMute,"aria-label":`${muted ? labels.unmute : labels.mute} ${title}`,children:muted ? `◖×` : `◖`}),
          volumeUsable && (0,a.jsx)(`input`,{type:`range`,min:0,max:1,step:0.01,value:muted ? 0 : volume,
            onChange:(event)=>changeVolume(Number(event.target.value)),"aria-label":`${labels.volume}: ${title}`})]}),
        (0,a.jsx)(`button`,{className:`player-speed`,type:`button`,onClick:nextSpeed,
          "aria-label":`${labels.speed}: ${rates[rateIndex]}×`,children:en ? `${rates[rateIndex]}×` : `${String(rates[rateIndex]).replace('.',',')}×`}),
        sources.length > 1 && (0,a.jsx)(`select`,{className:`player-quality`,value:source,onChange:(event)=>changeQuality(event.target.value),
          "aria-label":`${labels.quality}: ${title}`,children:sources.map((item)=>(0,a.jsx)(`option`,{value:item.src,children:item.label},item.src))}),
        (0,a.jsx)(`button`,{type:`button`,onClick:fullscreen,"aria-label":`${labels.fullscreen}: ${title}`,
          children:(0,a.jsx)(`span`,{className:i.fullscreenIcon,"aria-hidden":true,children:`⛶`})})]})]})
  ]});
}
var u = (path) => globalThis.__LUV_ASSETS__?.[path] ?? path,
  f = (video) => video.poster ? u(video.poster) : u(video.src.replace(/\.mp4$/, `-poster.webp`));
function p({ video, title, locale }) {
  const variants = video.variants ?? [{ src: video.src, label: `Original` }];
  return (0, a.jsx)(s, {
    sources: [...variants].reverse().map((source) => ({ ...source, src: u(source.src) })),
    poster: f(video), title, locale,
  });
}
var m = [
  {
    "client": "Conoflex",
    "slug": "conoflex",
    "kind": "video",
    "formats": [
      "video",
      "foto"
    ],
    "label": "Producción audiovisual + fotografía · Industria",
    "title": "Seguridad vial y tecnología, mostradas en acción.",
    "description": "Cobertura de Intersec 2026, demostraciones de producto y fotografía comercial para una empresa industrial.",
    "deliverables": [
      "Filmación de eventos",
      "Video de producto",
      "Fotografía comercial"
    ],
    "accent": "acid",
    "number": "01",
    "cover": {
      "src": "/work/conoflex/videos/intersec-2026-poster.webp",
      "position": "center 45%"
    },
    "videos": [
      {
        "src": "/work/conoflex/videos/intersec-2026.mp4",
        "variants": [
          {
            "src": "/work/conoflex/videos/intersec-2026-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/conoflex/videos/intersec-2026.mp4",
            "label": "1080p"
          }
        ],
        "poster": "/work/conoflex/videos/intersec-2026-poster.webp",
        "title": "Intersec 2026",
        "orientation": "portrait"
      },
      {
        "src": "/work/conoflex/videos/valla-portatil.mp4",
        "variants": [
          {
            "src": "/work/conoflex/videos/valla-portatil-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/conoflex/videos/valla-portatil.mp4",
            "label": "1080p"
          }
        ],
        "poster": "/work/conoflex/videos/valla-portatil-poster.webp",
        "title": "Valla portátil",
        "orientation": "portrait"
      },
      {
        "src": "/work/conoflex/videos/poste-vial.mp4",
        "variants": [
          {
            "src": "/work/conoflex/videos/poste-vial-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/conoflex/videos/poste-vial.mp4",
            "label": "1080p"
          }
        ],
        "title": "Poste vial · Archivo",
        "orientation": "portrait"
      }
    ],
    "photos": [
      {
        "src": "/work/conoflex/photos/jersey-producto.webp",
        "title": "Canalizador Jersey"
      },
      {
        "src": "/work/conoflex/photos/bolardo-escena.webp",
        "title": "Bolardo urbano"
      }
    ]
  },
  {
    "client": "Lolog Lodge",
    "slug": "lolog",
    "kind": "video",
    "formats": [
      "video"
    ],
    "label": "Producción audiovisual · Hotelería",
    "title": "La experiencia de un hotel boutique en imágenes.",
    "description": "Piezas audiovisuales para presentar el spa y el hotel con escenas reales de sus instalaciones y servicios.",
    "deliverables": [
      "Video hotelero",
      "Contenido turístico",
      "Edición"
    ],
    "accent": "violet",
    "number": "02",
    "cover": {
      "src": "/work/lolog/videos/hotel-boutique-poster.webp",
      "position": "center 48%"
    },
    "videos": [
      {
        "src": "/work/lolog/videos/spa.mp4",
        "variants": [
          {
            "src": "/work/lolog/videos/spa-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/lolog/videos/spa.mp4",
            "label": "1080p"
          }
        ],
        "poster": "/work/lolog/videos/spa-poster.webp",
        "title": "Lolog Lodge · Spa",
        "orientation": "portrait"
      },
      {
        "src": "/work/lolog/videos/hotel-boutique.mp4",
        "variants": [
          {
            "src": "/work/lolog/videos/hotel-boutique-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/lolog/videos/hotel-boutique.mp4",
            "label": "1080p"
          }
        ],
        "poster": "/work/lolog/videos/hotel-boutique-poster.webp",
        "title": "Lolog Lodge · Hotel boutique",
        "orientation": "portrait"
      }
    ]
  },
  {
    "client": "Bodega La Riojana",
    "slug": "riojana",
    "kind": "video",
    "formats": [
      "video",
      "foto"
    ],
    "label": "Video + fotografía · Marca y eventos",
    "title": "Producto, experiencias y momentos de marca.",
    "description": "Contenido para Club de Playa y VIOS en Hotel Marriott, junto con fotografías reales de activaciones de marca.",
    "deliverables": [
      "Video publicitario",
      "Fotografía de eventos",
      "Experiencias de marca"
    ],
    "accent": "wine",
    "number": "03",
    "cover": {
      "src": "/work/riojana/photos/club-playa-01.webp",
      "position": "center"
    },
    "videos": [
      {
        "src": "/work/riojana/videos/club-playa-hd.mp4",
        "variants": [
          {
            "src": "/work/riojana/videos/club-playa-hd-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/riojana/videos/club-playa-hd.mp4",
            "label": "1080p"
          }
        ],
        "title": "Club de Playa",
        "orientation": "portrait"
      },
      {
        "src": "/work/riojana/videos/vios-marriott.mp4",
        "variants": [
          {
            "src": "/work/riojana/videos/vios-marriott-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/riojana/videos/vios-marriott.mp4",
            "label": "1080p"
          }
        ],
        "poster": "/work/riojana/videos/vios-marriott-poster.webp",
        "title": "VIOS · Hotel Marriott",
        "orientation": "portrait"
      }
    ],
    "photos": [
      {
        "src": "/work/riojana/photos/club-playa-01.webp",
        "title": "Club de Playa · Activación de marca"
      },
      {
        "src": "/work/riojana/photos/club-playa-08.webp",
        "title": "Club de Playa · Experiencia de marca"
      }
    ]
  },
  {
    "client": "Lupart",
    "slug": "lupart",
    "kind": "video",
    "formats": [
      "video",
      "foto"
    ],
    "label": "Video + fotografía · Industria",
    "title": "Equipos y personas de una marca industrial.",
    "description": "Contenido audiovisual y fotografías para mostrar autoelevadores Hangcha y el equipo de Lupart.",
    "deliverables": [
      "Video industrial",
      "Fotografía empresarial",
      "Contenido de producto"
    ],
    "accent": "amber",
    "number": "04",
    "cover": {
      "src": "/work/lupart/photos/team-lupart-01.webp",
      "position": "center"
    },
    "videos": [
      {
        "src": "/work/lupart/videos/mundial-2026-hangcha.mp4",
        "variants": [
          {
            "src": "/work/lupart/videos/mundial-2026-hangcha-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/lupart/videos/mundial-2026-hangcha.mp4",
            "label": "1080p"
          }
        ],
        "title": "Autoelevadores Hangcha · Mundial 2026",
        "orientation": "portrait"
      }
    ],
    "photos": [
      {
        "src": "/work/lupart/photos/team-lupart-01.webp",
        "title": "Equipo Lupart"
      },
      {
        "src": "/work/lupart/photos/team-lupart-02.webp",
        "title": "Equipo Lupart"
      }
    ]
  },
  {
    "client": "Bienestar & Soluciones",
    "slug": "bienestar",
    "kind": "video",
    "formats": [
      "video"
    ],
    "label": "Video · Producto",
    "title": "Una demostración clara de Smart Lite E60.",
    "description": "Video de producto que presenta el uso y las funciones de una silla motorizada.",
    "deliverables": [
      "Video de producto",
      "Demostración audiovisual"
    ],
    "accent": "violet",
    "number": "05",
    "cover": {
      "src": "/work/bienestar/cover-integral.webp",
      "position": "center"
    },
    "videos": [
      {
        "src": "/work/bienestar/videos/silla-e60-hd.mp4",
        "variants": [
          {
            "src": "/work/bienestar/videos/silla-e60-hd-720.mp4",
            "label": "720p"
          },
          {
            "src": "/work/bienestar/videos/silla-e60-hd.mp4",
            "label": "1080p"
          }
        ],
        "title": "Smart Lite E60",
        "orientation": "portrait"
      }
    ]
  },
  {
    "client": "Bunker Jump",
    "slug": "bunker",
    "kind": "video",
    "formats": [
      "video"
    ],
    "label": "Presentación frente a cámara · Marca",
    "title": "Un mensaje de marca dicho frente a cámara.",
    "description": "Mi participación fue como presentador. La filmación y edición fueron realizadas por Bunker Jump.",
    "deliverables": [
      "Presentación frente a cámara"
    ],
    "creditNote": "Participé como presentador. Filmación y edición: Bunker Jump.",
    "accent": "cyan",
    "number": "06",
    "cover": {
      "src": "/work/bunker/cover-integral.webp",
      "position": "center"
    },
    "videos": [
      {
        "src": "/work/bunker/videos/reel-06.mp4",
        "variants": [
          {
            "src": "/work/bunker/videos/reel-06.mp4",
            "label": "720p"
          }
        ],
        "title": "Presentación de marca",
        "orientation": "portrait"
      }
    ]
  }
],
  h = [`FILM`, `EDIT`, `PHOTO`, `CREATE`],
  g = {
  "conoflex": {
    "label": "Video production + photography · Industrial",
    "title": "Road safety and technology in action.",
    "description": "Intersec 2026 coverage, product demonstrations and commercial photography for an industrial company.",
    "deliverables": [
      "Event filming",
      "Product video",
      "Commercial photography"
    ],
    "videoTitles": [
      "Intersec 2026",
      "Portable barrier",
      "Road post · Archive"
    ],
    "photoTitles": [
      "Jersey traffic channelizer",
      "Urban bollard"
    ]
  },
  "lolog": {
    "label": "Video production · Hospitality",
    "title": "A boutique hotel experience on film.",
    "description": "Real footage of the spa, facilities and services for the hospitality and tourism sector.",
    "deliverables": [
      "Hospitality video",
      "Tourism content",
      "Editing"
    ],
    "videoTitles": [
      "Lolog Lodge · Spa",
      "Lolog Lodge · Boutique hotel"
    ]
  },
  "riojana": {
    "label": "Video + photography · Brand and events",
    "title": "Product, experiences and brand moments.",
    "description": "Club de Playa and VIOS at Hotel Marriott, with real photographs from brand activations.",
    "deliverables": [
      "Advertising video",
      "Event photography",
      "Brand experiences"
    ],
    "videoTitles": [
      "Club de Playa",
      "VIOS · Hotel Marriott"
    ],
    "photoTitles": [
      "Club de Playa · Brand activation",
      "Club de Playa · Brand experience"
    ]
  },
  "lupart": {
    "label": "Video + photography · Industrial",
    "title": "The machines and people behind an industrial brand.",
    "description": "Video and photography featuring Hangcha forklifts and the Lupart team.",
    "deliverables": [
      "Industrial video",
      "Corporate photography",
      "Product content"
    ],
    "videoTitles": [
      "Hangcha forklifts · World Cup 2026"
    ],
    "photoTitles": [
      "Lupart team",
      "Lupart team"
    ]
  },
  "bienestar": {
    "label": "Video · Product",
    "title": "A clear showcase of the Smart Lite E60.",
    "description": "A product video demonstrating a powered wheelchair and its features.",
    "deliverables": [
      "Product video",
      "Visual demonstration"
    ],
    "videoTitles": [
      "Smart Lite E60"
    ]
  },
  "bunker": {
    "label": "On-camera presentation · Brand",
    "title": "Delivering a brand message on camera.",
    "description": "My role was as presenter. Bunker Jump handled filming and editing.",
    "deliverables": [
      "On-camera presentation"
    ],
    "creditNote": "My role: presenter. Filming and editing: Bunker Jump.",
    "videoTitles": [
      "Brand presentation"
    ]
  }
},
  _ = {
    es: {
      nav: [
        [`Trabajos`, `#trabajos`],
        [`Cómo trabajo`, `#proceso`],
        [`Contacto`, `#contacto`],
      ],
      navigationTopline: `Navegación / 2026`,
      mainNavAria: `Navegación principal`,
      roleLine: `Filmmaker · Editor · Fotógrafo`,
      availability: `Disponible para proyectos`,
      availabilityAria: `Consultar disponibilidad por WhatsApp`,
      menu: `Menú`,
      openMenu: `Abrir menú`,
      closeMenu: `Cerrar menú`,
      homeAria: `Luv Visualz, inicio`,
      eyebrow: `Foto · Video · Edición / Buenos Aires`,
      hero: [`LO QUE OFRECÉS`, `ES BUENO.`, `MOSTRÉMOSLO BIEN.`],
      heroOffer: `Producción audiovisual, fotografía y edición para empresas, productos y experiencias. Contame qué proyecto tenés en mente y vemos cómo encararlo.`,
      heroContact: `Hablemos de tu proyecto`,
      viewWork: `Ver trabajos`,
      tickerAria: `Servicios destacados`,
      workKicker: `01 / Trabajo seleccionado`,
      workTitle: [`MIS`, `TRABAJOS.`],
      workIntro: `Industria, hotelería, vino y productos. Proyectos reales que combinan filmación, fotografía, edición y, cuando corresponde, presentación frente a cámara.`,
      filterAria: `Filtrar trabajos`,
      filters: { todo: `Todos`, video: `Video`, foto: `Fotografía` },
      openProject: `Abrir proyecto de`,
      viewProject: `Ver proyecto`,
      viewVideo: `Ver`,
      oneVideo: `video`,
      manyVideos: `videos`,
      servicesKicker: `02 / Lo que hago`,
      services: [[`Producción audiovisual`, `Planificación, filmación y realización de contenido comercial, empresarial y de producto.`], [`Fotografía`, `Fotografía comercial, de producto, empresarial y de eventos.`], [`Edición y postproducción`, `Montaje, imagen, sonido y piezas finales para distintos canales.`]],
      servicesTitle: [`DE LA TOMA`, `A LA`, `ENTREGA.`],
      manifestoSmall: `Mi foco está en la ejecución.`,
      manifestoTitle: [`QUE CADA TOMA, CORTE Y FOTO`, `ESTÉ A LA ALTURA.`],
      processKicker: `02 / Cómo trabajo`,
      processTitle: [`DE TU IDEA`, `A LA`, `ENTREGA.`],
      processIntro: `Un proceso simple, enfocado en resolver bien la parte visual y dejarte archivos listos para usar.`,
      processSteps: [
        [
          `Punto de partida`,
          `Me contás qué necesitás comunicar, a quién y dónde va a usarse el material. Acordamos alcance, tiempos y recursos.`,
        ],
        [
          `Plan de tomas`,
          `Defino con vos las tomas, locaciones y recursos necesarios para realizar el proyecto.`,
        ],
        [
          `Captura`,
          `Grabo video, hago las fotos o pongo la cara frente a cámara, según lo que necesite el proyecto.`,
        ],
        [
          `Edición y entrega`,
          `Trabajo montaje, retoque, color, sonido y versiones finales listas para usar.`,
        ],
      ],
      contactKicker: `03 / Contacto`,
      contactTitle: [`MOSTRAME QUÉ`, `QUERÉS HACER.`],
      contactCopy: `Contame qué querés comunicar, para quién y en qué plazo. Hablemos del alcance y de las opciones para producirlo.`,
      contactCta: `Hablemos de tu proyecto`,
      location: `Buenos Aires, Argentina`,
      footerScope: `Foto · video · edición · on-camera.`,
      backTop: `Volver arriba ↑`,
      projectDialog: `Proyecto`,
      closeProject: `Cerrar proyecto`,
      projectContent: `Contenido del proyecto`,
      videos: `Videos`,
      photos: `Fotos`,
      enlargePhoto: `Ampliar fotografía`,
      closePhoto: `Cerrar fotografía`,
      enlargedPhoto: `Fotografía ampliada`,
      previousPhoto: `Fotografía anterior`,
      nextPhoto: `Fotografía siguiente`,
      choosePhoto: `Elegir fotografía`,
      goToPhoto: `Ir a fotografía`,
      modalCta: `Quiero algo así`,
    },
    en: {
      nav: [
        [`Work`, `#trabajos`],
        [`Process`, `#proceso`],
        [`Contact`, `#contacto`],
      ],
      navigationTopline: `Navigation / 2026`,
      mainNavAria: `Main navigation`,
      roleLine: `Filmmaker · Editor · Photographer`,
      availability: `Available for projects`,
      availabilityAria: `Ask about availability on WhatsApp`,
      menu: `Menu`,
      openMenu: `Open menu`,
      closeMenu: `Close menu`,
      homeAria: `Luv Visualz, home`,
      eyebrow: `Photography · Video · Editing / Buenos Aires`,
      hero: [`YOUR WORK`, `IS GOOD.`, `MAKE IT LOOK THE PART.`],
      heroOffer: `Video production, photography and editing for businesses, products and experiences. Tell me about your project and let’s discuss the best approach.`,
      heroContact: `Let’s talk about your project`,
      viewWork: `View work`,
      tickerAria: `Featured services`,
      workKicker: `01 / Selected work`,
      workTitle: [`MY`, `WORK.`],
      workIntro: `Industrial brands, hospitality, wine and products. Real projects across filming, photography, editing and on-camera presentation.`,
      filterAria: `Filter work`,
      filters: { todo: `All`, video: `Video`, foto: `Photography` },
      openProject: `Open project for`,
      viewProject: `View project`,
      viewVideo: `View`,
      oneVideo: `video`,
      manyVideos: `videos`,
      servicesKicker: `02 / What I do`,
      services: [[`Video production`, `Planning, filming and production for commercial, corporate and product content.`], [`Photography`, `Commercial, product, corporate and event photography.`], [`Editing and postproduction`, `Editing, picture, sound and delivery for different channels.`]],
      servicesTitle: [`FROM THE SHOOT`, `TO THE`, `FINAL FILE.`],
      manifestoSmall: `The details make the difference.`,
      manifestoTitle: [`EVERY FRAME, CUT AND IMAGE`, `HAS TO EARN ITS PLACE.`],
      processKicker: `02 / How I work`,
      processTitle: [`FROM THE BRIEF`, `TO FINAL`, `DELIVERY.`],
      processIntro: `A straightforward process built around clear decisions and finished files that are ready to use.`,
      processSteps: [
        [
          `The brief`,
          `We discuss your audience, goals, channels, scope and timeline.`,
        ],
        [
          `Shot plan`,
          `We agree on the shots, locations and resources needed for production.`,
        ],
        [
          `Production`,
          `I film, shoot the photographs or step in front of the camera—whatever the project calls for.`,
        ],
        [
          `Final delivery`,
          `I turn the material into polished, platform-ready files in the formats we agreed on.`,
        ],
      ],
      contactKicker: `03 / Contact`,
      contactTitle: [`SHOW ME WHAT`, `YOU’RE BUILDING.`],
      contactCopy: `Tell me what you want to communicate, who it is for and your timeline. Let’s discuss scope and production options.`,
      contactCta: `Let’s talk about your project`,
      location: `Buenos Aires, Argentina`,
      footerScope: `Photography · video · editing · on-camera.`,
      backTop: `Back to top ↑`,
      projectDialog: `Project`,
      closeProject: `Close project`,
      projectContent: `Project content`,
      videos: `Videos`,
      photos: `Photos`,
      enlargePhoto: `Enlarge photo`,
      closePhoto: `Close photo`,
      enlargedPhoto: `Enlarged photo`,
      previousPhoto: `Previous photo`,
      nextPhoto: `Next photo`,
      choosePhoto: `Choose photo`,
      goToPhoto: `Go to photo`,
      modalCta: `I want this kind of work`,
    },
  },
  v = {
    es: `https://wa.me/5491138848176?text=Hola%20Luv%2C%20vi%20tu%20web.%20Quiero%20contarte%20sobre%20un%20proyecto%20audiovisual%20para%20mi%20empresa.%20%C2%BFPodemos%20hablar%3F`,
    en: `https://wa.me/5491138848176?text=Hi%20Luv%2C%20I%20saw%20your%20site.%20I%27d%20like%20to%20discuss%20an%20audiovisual%20project%20for%20my%20business.`,
  },
  y = (e) =>
    e === `es`
      ? m
      : m.map((e) => {
          let t = g[e.slug];
          return {
            ...e,
            ...t,
            videos: e.videos?.map((e, n) => ({
              ...e,
              title: t.videoTitles?.[n] ?? e.title,
            })),
            photos: e.photos?.map((e, n) => ({
              ...e,
              title: t.photoTitles?.[n] ?? e.title,
            })),
          };
        });
function b({ locale: e = `es` }) {
  let t = _[e],
    n = v[e],
    i = (0, r.useMemo)(() => y(e), [e]),
    [o, s] = (0, r.useState)(!1),
    [c, l] = (0, r.useState)(`todo`),
    [d, f] = (0, r.useState)(null),
    [m, g] = (0, r.useState)(`video`),
    [b, x] = (0, r.useState)(null),
    S = (0, r.useRef)(null),
    returnFocus = (0, r.useRef)(null);
  ((0, r.useEffect)(() => {
    document.documentElement.lang = e;
    window.__LUV_HYDRATED__ = true;
    window.dispatchEvent(new Event(`luv:hydrated`));
  }, [e]),
    (0, r.useEffect)(() => {
      if (!d) return;
      const dialog = document.querySelector(`.project-modal`);
      dialog?.querySelector(`.modal-close`)?.focus();
      const trap = (event) => {
        if (event.key !== `Tab`) return;
        const scope = dialog?.querySelector(`.photo-lightbox`) ?? dialog;
        const focusables = [...(scope?.querySelectorAll(`button, a[href], input, select`) ?? [])]
          .filter((element) => element.getBoundingClientRect().width > 0 && !element.classList.contains(`modal-backdrop`) && !element.classList.contains(`lightbox-backdrop`));
        if (!focusables.length) return;
        const first = focusables[0], last = focusables[focusables.length - 1];
        if (event.shiftKey && document.activeElement === first) {event.preventDefault(); last.focus();}
        else if (!event.shiftKey && document.activeElement === last) {event.preventDefault(); first.focus();}
      };
      document.addEventListener(`keydown`, trap);
      return () => {document.removeEventListener(`keydown`, trap); returnFocus.current?.focus?.();};
    }, [d]),
    (0, r.useEffect)(() => {
      if (b !== null) document.querySelector(`.lightbox-close`)?.focus();
    }, [b]),
    (0, r.useEffect)(() => {
      const header = document.querySelector(`.site-header`);
      if (!header) return;
      let lastY = Math.max(0, window.scrollY), travel = 0, direction = 0;
      const onScroll = () => {
        const y = Math.max(0, window.scrollY), delta = y - lastY, next = Math.sign(delta);
        lastY = y;
        if (next && next !== direction) travel = 0;
        if (next) { direction = next; travel += Math.abs(delta); }
        header.classList.toggle(`header-scrolled`, y > 24);
        if (y < 80 || header.querySelector(`:focus-within`) || document.querySelector(`.slide-menu.visible`)) {
          header.classList.remove(`header-away`); travel = 0; return;
        }
        if (travel > 18) { header.classList.toggle(`header-away`, next > 0); travel = 0; }
      };
      window.addEventListener(`scroll`, onScroll, {passive:true});
      onScroll();
      return () => window.removeEventListener(`scroll`, onScroll);
    }, []),
    (0, r.useEffect)(() => {
      let e = (e) => {
        if (e.key === `Escape`) {
          if (b !== null) {
            x(null);
            return;
          }
          (s(!1), f(null));
        }
        b !== null &&
          d?.photos?.length &&
          (e.key === `ArrowLeft` &&
            x((e) => ((e ?? 0) - 1 + d.photos.length) % d.photos.length),
          e.key === `ArrowRight` && x((e) => ((e ?? 0) + 1) % d.photos.length));
      };
      return (
        window.addEventListener(`keydown`, e),
        document.body.classList.toggle(`locked`, o || !!d),
        () => {
          (window.removeEventListener(`keydown`, e),
            document.body.classList.remove(`locked`));
        }
      );
    }, [o, d, b]));
  let C = (0, r.useMemo)(
      () =>
        i.filter((e) => c === `todo` || (e.formats ?? [e.kind]).includes(c)),
      [c, i],
    ),
    w = {
      todo: i.length,
      video: i.filter((e) => (e.formats ?? [e.kind]).includes(`video`)).length,
      foto: i.filter((e) => (e.formats ?? [e.kind]).includes(`foto`)).length,
    },
    T = d?.photos ?? [],
    E = b === null ? null : T[b],
    D = (e) => {
      T.length && x((t) => ((t ?? 0) + e + T.length) % T.length);
    },
    O = () => s(!1);
  return (0, a.jsxs)(`main`, {
    children: [
      (0, a.jsx)(`div`, { className: `grain`, "aria-hidden": `true` }),
      (0, a.jsxs)(`header`, {
        className: `site-header`,
        children: [
          (0, a.jsxs)(`a`, {
            className: `brand`,
            href: `#inicio`,
            "aria-label": t.homeAria,
            children: [
              (0, a.jsx)(`span`, {
                className: `brand-mark brand-logo`,
                "aria-hidden": `true`,
              }),
              (0, a.jsx)(`span`, {
                className: `brand-name`,
                children: `LUV VISUALZ`,
              }),
            ],
          }),
          (0, a.jsxs)(`div`, {
            className: `header-side`,
            children: [
              (0, a.jsxs)(`a`, {
                className: `language-switch`,
                href: e === `es` ? `/en` : `/`,
                lang: e === `es` ? `en` : `es`,
                "aria-label":
                  e === `es`
                    ? `View this portfolio in English`
                    : `Ver este portfolio en español`,
                children: [
                  (0, a.jsxs)(`svg`, {
                    "aria-hidden": `true`,
                    viewBox: `0 0 24 24`,
                    children: [
                      (0, a.jsx)(`circle`, { cx: `12`, cy: `12`, r: `9` }),
                      (0, a.jsx)(`path`, {
                        d: `M3 12h18M12 3c2.5 2.5 3.6 5.5 3.6 9S14.5 18.5 12 21c-2.5-2.5-3.6-5.5-3.6-9S9.5 5.5 12 3Z`,
                      }),
                    ],
                  }),
                  (0, a.jsx)(`span`, {
                    children: e === `es` ? `English` : `Español`,
                  }),
                ],
              }),
              (0, a.jsxs)(`a`, {
                className: `availability`,
                href: n,
                target: `_blank`,
                rel: `noreferrer`,
                "aria-label": t.availabilityAria,
                children: [(0, a.jsx)(`i`, {}), ` `, t.availability],
              }),
              (0, a.jsxs)(`button`, {
                className: `menu-trigger ${o ? `is-open` : ``}`,
                type: `button`,
                "aria-label": o ? t.closeMenu : t.openMenu,
                "aria-expanded": o,
                onClick: () => s((e) => !e),
                children: [
                  (0, a.jsx)(`span`, { children: t.menu }),
                  (0, a.jsxs)(`b`, {
                    "aria-hidden": `true`,
                    children: [(0, a.jsx)(`i`, {}), (0, a.jsx)(`i`, {})],
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      (0, a.jsx)(`div`, {
        className: `menu-backdrop ${o ? `visible` : ``}`,
        onClick: () => s(!1),
        "aria-hidden": `true`,
      }),
      (0, a.jsxs)(`aside`, {
        className: `slide-menu ${o ? `visible` : ``}`,
        "aria-hidden": !o,
        children: [
          (0, a.jsx)(`div`, { className: `menu-orbit`, "aria-hidden": `true` }),
          (0, a.jsx)(`div`, {
            className: `menu-topline`,
            children: t.navigationTopline,
          }),
          (0, a.jsx)(`nav`, {
            "aria-label": t.mainNavAria,
            children: t.nav.map(([e, t], n) =>
              (0, a.jsxs)(
                `a`,
                {
                  href: t,
                  onClick: O,
                  tabIndex: o ? 0 : -1,
                  children: [
                    (0, a.jsxs)(`span`, { children: [`0`, n + 1] }),
                    e,
                    (0, a.jsx)(`b`, { children: `↗` }),
                  ],
                },
                t,
              ),
            ),
          }),
          (0, a.jsxs)(`div`, {
            className: `menu-footer`,
            children: [
              (0, a.jsx)(`p`, { children: t.roleLine }),
              (0, a.jsx)(`a`, {
                href: n,
                target: `_blank`,
                rel: `noreferrer`,
                tabIndex: o ? 0 : -1,
                children: `WhatsApp ↗`,
              }),
            ],
          }),
        ],
      }),
      (0, a.jsxs)(`section`, {
        className: `hero`,
        id: `inicio`,
        children: [
          (0, a.jsx)(`div`, { className: `hero-grid`, "aria-hidden": `true` }),
          (0, a.jsx)(`div`, { className: `hero-glow`, "aria-hidden": `true` }),
          (0, a.jsxs)(`div`, {
            className: `hero-copy`,
            children: [
              (0, a.jsxs)(`p`, {
                className: `eyebrow`,
                children: [
                  (0, a.jsx)(`span`, { children: `◆` }),
                  ` `,
                  t.eyebrow,
                ],
              }),
              (0, a.jsxs)(`h1`, {
                children: [
                  t.hero[0],
                  (0, a.jsx)(`span`, { children: t.hero[1] }),
                  (0, a.jsx)(`em`, { children: t.hero[2] }),
                ],
              }),
              (0, a.jsxs)(`div`, {
                className: `hero-bottom`,
                children: [
                  (0, a.jsxs)(`div`, {
                    className: `hero-offer`,
                    children: [
                      (0, a.jsx)(`p`, { children: t.heroOffer }),
                      (0, a.jsxs)(`a`, {
                        className: `hero-contact-link`,
                        href: n,
                        target: `_blank`,
                        rel: `noreferrer`,
                        children: [
                          (0, a.jsx)(`span`, {
                            className: `whatsapp-mark`,
                            "aria-hidden": `true`,
                            children: (0, a.jsxs)(`svg`, {
                              viewBox: `0 0 24 24`,
                              focusable: `false`,
                              children: [
                                (0, a.jsx)(`path`, {
                                  d: `M20 11.6a8 8 0 0 1-11.7 7.1L4 20l1.4-4.1A8 8 0 1 1 20 11.6Z`,
                                }),
                                (0, a.jsx)(`path`, {
                                  d: `M8.4 7.6c.3-.3.7-.2.9.1l1 1.7c.2.3.1.6-.1.8l-.6.6c.6 1.3 1.7 2.4 3 3l.6-.7c.2-.2.5-.3.8-.1l1.8.9c.3.2.4.6.2.9-.5.9-1.4 1.4-2.4 1.3-3.2-.4-5.8-2.9-6.3-6.1-.1-.9.3-1.8 1.1-2.4Z`,
                                }),
                              ],
                            }),
                          }),
                          (0, a.jsx)(`span`, { children: t.heroContact }),
                          (0, a.jsx)(`b`, { children: `↗` }),
                        ],
                      }),
                    ],
                  }),
                  (0, a.jsxs)(`a`, {
                    className: `circle-cta`,
                    href: `#trabajos`,
                    "aria-label": t.viewWork,
                    children: [
                      (0, a.jsx)(`span`, {
                        children:
                          e === `en`
                            ? (0, a.jsxs)(a.Fragment, {
                                children: [
                                  `View`,
                                  (0, a.jsx)(`br`, {}),
                                  `work`,
                                ],
                              })
                            : (0, a.jsxs)(a.Fragment, {
                                children: [
                                  `Ver`,
                                  (0, a.jsx)(`br`, {}),
                                  `trabajos`,
                                ],
                              }),
                      }),
                      (0, a.jsx)(`b`, { children: `↓` }),
                    ],
                  }),
                ],
              }),
            ],
          }),
          (0, a.jsxs)(`div`, {
            className: `hero-index`,
            "aria-hidden": `true`,
            children: [
              (0, a.jsx)(`span`, { children: `LVZ` }),
              (0, a.jsx)(`i`, {}),
              (0, a.jsx)(`span`, { children: `26` }),
            ],
          }),
        ],
      }),
      (0, a.jsx)(`div`, {
        className: `ticker`,
        "aria-label": t.tickerAria,
        children: (0, a.jsx)(`div`, {
          className: `ticker-track`,
          "aria-hidden": `true`,
          children: Array.from({ length: 10 }, (e, t) =>
            (0, a.jsx)(
              `div`,
              {
                className: `ticker-group`,
                children: h.map((e) =>
                  (0, a.jsxs)(
                    r.Fragment,
                    {
                      children: [
                        (0, a.jsx)(`span`, { children: e }),
                        (0, a.jsx)(`i`, { children: `✦` }),
                      ],
                    },
                    e,
                  ),
                ),
              },
              t,
            ),
          ),
        }),
      }),
      (0, a.jsxs)(`section`, {
        className: `work section`,
        id: `trabajos`,
        children: [
          (0, a.jsxs)(`div`, {
            className: `section-heading reveal`,
            children: [
              (0, a.jsxs)(`div`, {
                children: [
                  (0, a.jsx)(`p`, {
                    className: `kicker`,
                    children: t.workKicker,
                  }),
                  (0, a.jsxs)(`h2`, {
                    children: [
                      t.workTitle[0],
                      (0, a.jsx)(`br`, {}),
                      (0, a.jsx)(`span`, { children: t.workTitle[1] }),
                    ],
                  }),
                ],
              }),
              (0, a.jsx)(`p`, {
                className: `section-intro`,
                children: t.workIntro,
              }),
            ],
          }),
          (0, a.jsx)(`div`, {
            className: `filters`,
            role: `group`,
            "aria-label": t.filterAria,
            children: [`todo`, `video`, `foto`].map((e) =>
              (0, a.jsxs)(
                `button`,
                {
                  className: c === e ? `active` : ``,
                  onClick: () => l(e),
                  type: `button`,
                  children: [
                    t.filters[e],
                    (0, a.jsx)(`sup`, {
                      children: String(w[e]).padStart(2, `0`),
                    }),
                  ],
                },
                e,
              ),
            ),
          }),
          (0, a.jsx)(`div`, {
            className: `project-grid`,
            children: C.map((e) =>
              (0, a.jsxs)(
                `button`,
                {
                  className: `project-card ${e.accent}`,
                  type: `button`,
                  onClick: () => {
                    returnFocus.current = document.activeElement;
                    (f(e), g(e.videos?.length ? `video` : `foto`), x(null));
                  },
                  "aria-label": `${t.openProject} ${e.client}`,
                  children: [
                    (0, a.jsxs)(`div`, {
                      className: `project-visual`,
                      children: [
                        (e.cover || e.videos?.[0]) &&
                          (0, a.jsx)(`span`, {
                            className: `project-cover`,
                            style: {
                              backgroundImage: e.cover
                                ? `url(${u(e.cover.src)})`
                                : `url(https://drive.google.com/thumbnail?id=${e.videos[0].id}&sz=w1600)`,
                              backgroundPosition: e.cover?.position ?? `center`,
                            },
                            "aria-hidden": `true`,
                          }),
                        (0, a.jsx)(`div`, {
                          className: `visual-lines`,
                          "aria-hidden": `true`,
                        }),
                        (0, a.jsx)(`span`, {
                          className: `project-number`,
                          children: e.number,
                        }),
                        (0, a.jsx)(`span`, {
                          className: `project-kind`,
                          children:
                            (e.formats ?? [e.kind]).length > 1
                              ? `▶ FILM · ▧ PHOTO`
                              : e.slug === `bunker`
                                ? `● ON CAMERA`
                                : e.kind === `video`
                                  ? `▶ FILM`
                                  : `▧ PHOTO`,
                        }),
                        (0, a.jsx)(`strong`, { children: e.client }),
                        (0, a.jsxs)(`span`, {
                          className: `view-project`,
                          children: [
                            e.videos?.length
                              ? `${t.viewVideo} ${e.videos.length} ${e.videos.length === 1 ? t.oneVideo : t.manyVideos}`
                              : t.viewProject,
                            ` `,
                            (0, a.jsx)(`b`, { children: `↗` }),
                          ],
                        }),
                      ],
                    }),
                    (0, a.jsxs)(`div`, {
                      className: `project-meta`,
                      children: [
                        (0, a.jsx)(`span`, { children: e.label }),
                        (0, a.jsx)(`h3`, { children: e.client }),
                      ],
                    }),
                  ],
                },
                e.slug,
              ),
            ),
          }),
        ],
      }),
      (0, a.jsxs)(`section`, {
        className: `manifesto`,
        children: [
          (0, a.jsxs)(`div`, {
            className: `manifesto-signal`,
            "aria-hidden": `true`,
            children: [
              (0, a.jsx)(`i`, {}),
              (0, a.jsx)(`i`, {}),
              (0, a.jsx)(`i`, {}),
              (0, a.jsx)(`i`, {}),
              (0, a.jsx)(`i`, {}),
            ],
          }),
          (0, a.jsx)(`p`, { children: t.manifestoSmall }),
          (0, a.jsxs)(`h2`, {
            children: [
              t.manifestoTitle[0],
              (0, a.jsx)(`br`, {}),
              (0, a.jsx)(`span`, { children: t.manifestoTitle[1] }),
            ],
          }),
        ],
      }),
      (0, a.jsxs)(`section`, {
        className: `process section`,
        id: `proceso`,
        children: [
          (0, a.jsxs)(`div`, {
            className: `section-heading`,
            children: [
              (0, a.jsxs)(`div`, {
                children: [
                  (0, a.jsx)(`p`, {
                    className: `kicker`,
                    children: t.processKicker,
                  }),
                  (0, a.jsxs)(`h2`, {
                    children: [
                      t.processTitle[0],
                      (0, a.jsx)(`br`, {}),
                      t.processTitle[1],
                      ` `,
                      (0, a.jsx)(`span`, { children: t.processTitle[2] }),
                    ],
                  }),
                ],
              }),
              (0, a.jsx)(`p`, {
                className: `section-intro`,
                children: t.processIntro,
              }),
            ],
          }),
          (0, a.jsx)(`div`, {className:`services-grid`,children:t.services.map(([name, description], index)=>(0,a.jsxs)(`div`,{className:`service-item`,children:[
            (0,a.jsx)(`span`,{children:`0${index + 1}`}),
            (0,a.jsx)(`h3`,{children:name}),
            (0,a.jsx)(`p`,{children:description})]},name))}),
          (0, a.jsx)(`ol`, {
            className: `process-steps`,
            children: t.processSteps.map(([e, t], n) =>
              (0, a.jsxs)(
                `li`,
                {
                  children: [
                    (0, a.jsxs)(`span`, { children: [`0`, n + 1] }),
                    (0, a.jsx)(`h3`, { children: e }),
                    (0, a.jsx)(`p`, { children: t }),
                  ],
                },
                e,
              ),
            ),
          }),
        ],
      }),
      (0, a.jsxs)(`section`, {
        className: `contact`,
        id: `contacto`,
        children: [
          (0, a.jsx)(`div`, {
            className: `contact-grid`,
            "aria-hidden": `true`,
          }),
          (0, a.jsx)(`p`, { className: `kicker`, children: t.contactKicker }),
          (0, a.jsxs)(`h2`, {
            children: [
              t.contactTitle[0],
              (0, a.jsx)(`br`, {}),
              (0, a.jsx)(`span`, { children: t.contactTitle[1] }),
            ],
          }),
          (0, a.jsx)(`p`, {
            className: `contact-copy`,
            children: t.contactCopy,
          }),
          (0, a.jsxs)(`a`, {
            className: `contact-cta`,
            href: n,
            target: `_blank`,
            rel: `noreferrer`,
            children: [
              (0, a.jsx)(`span`, { children: t.contactCta }),
              (0, a.jsx)(`b`, { children: `↗` }),
            ],
          }),
          (0, a.jsxs)(`div`, {
            className: `contact-details`,
            children: [
              (0, a.jsx)(`span`, { children: t.location }),
              (0, a.jsx)(`span`, { children: `+54 9 11 3884-8176` }),
              (0, a.jsx)(`span`, { children: t.availability }),
            ],
          }),
        ],
      }),
      (0, a.jsxs)(`footer`, {
        children: [
          (0, a.jsxs)(`a`, {
            className: `brand`,
            href: `#inicio`,
            children: [
              (0, a.jsx)(`span`, {
                className: `brand-mark brand-logo`,
                "aria-hidden": `true`,
              }),
              (0, a.jsx)(`span`, {
                className: `brand-name`,
                children: `LUV VISUALZ`,
              }),
            ],
          }),
          (0, a.jsx)(`p`, { children: t.footerScope }),
          (0, a.jsx)(`a`, { href: `#inicio`, children: t.backTop }),
          (0, a.jsx)(`span`, { children: `© 2026` }),
        ],
      }),
      d &&
        (0, a.jsxs)(`div`, {
          className: `project-modal`,
          role: `dialog`,
          "aria-modal": `true`,
          "aria-label": `${t.projectDialog} ${d.client}`,
          children: [
            (0, a.jsx)(`button`, {
              className: `modal-backdrop`,
              onClick: () => f(null),
              "aria-label": t.closeProject,
            }),
            (0, a.jsxs)(`article`, {
              className:
                d.videos?.length || d.photos?.length ? `has-media` : ``,
              children: [
                (0, a.jsx)(`button`, {
                  className: `modal-close`,
                  onClick: () => f(null),
                  type: `button`,
                  "aria-label": t.closeProject,
                  children: `×`,
                }),
                d.videos?.length || d.photos?.length
                  ? (0, a.jsxs)(`div`, {
                      className: `modal-gallery`,
                      children: [
                        d.videos?.length && d.photos?.length
                          ? (0, a.jsxs)(`div`, {
                              className: `media-tabs`,
                              role: `tablist`,
                              "aria-label": t.projectContent,
                              children: [
                                (0, a.jsxs)(`button`, {
                                  type: `button`,
                                  className: m === `video` ? `active` : ``,
                                  onClick: () => g(`video`),
                                  role: `tab`,
                                  "aria-selected": m === `video`,
                                  children: [
                                    t.videos,
                                    ` `,
                                    (0, a.jsx)(`sup`, {
                                      children: String(
                                        d.videos.length,
                                      ).padStart(2, `0`),
                                    }),
                                  ],
                                }),
                                (0, a.jsxs)(`button`, {
                                  type: `button`,
                                  className: m === `foto` ? `active` : ``,
                                  onClick: () => g(`foto`),
                                  role: `tab`,
                                  "aria-selected": m === `foto`,
                                  children: [
                                    t.photos,
                                    ` `,
                                    (0, a.jsx)(`sup`, {
                                      children: String(
                                        d.photos.length,
                                      ).padStart(2, `0`),
                                    }),
                                  ],
                                }),
                              ],
                            })
                          : null,
                        m === `video` && d.videos?.length
                          ? (0, a.jsxs)(a.Fragment, {
                              children: [
                                d.creditNote
                                  ? (0, a.jsx)(`p`, {
                                      className: `media-credit`,
                                      children: d.creditNote,
                                    })
                                  : null,
                                (0, a.jsx)(`div`, {
                                  className: `modal-media-list ${d.videos.every((e) => e.orientation === `portrait`) ? `portrait-grid` : ``}`,
                                  role: `tabpanel`,
                                  children: d.videos.map((t, n) =>
                                    (0, a.jsxs)(
                                      `figure`,
                                      {
                                        children: [
                                          (0, a.jsx)(`div`, {
                                            className: `video-frame ${t.orientation === `portrait` ? `portrait` : ``}`,
                                            children: (0, a.jsx)(p, {
                                              video: t,
                                              title: `${d.client} — ${t.title}`,
                                              locale: e,
                                            }),
                                          }),
                                          (0, a.jsxs)(`figcaption`, {
                                            children: [
                                              (0, a.jsx)(`span`, {
                                                children: String(
                                                  n + 1,
                                                ).padStart(2, `0`),
                                              }),
                                              t.title,
                                            ],
                                          }),
                                        ],
                                      },
                                      t.id ?? t.src,
                                    ),
                                  ),
                                }),
                              ],
                            })
                          : null,
                        m === `foto` && d.photos?.length
                          ? (0, a.jsx)(`div`, {
                              className: `modal-photo-grid`,
                              role: `tabpanel`,
                              children: d.photos.map((e, n) =>
                                (0, a.jsxs)(
                                  `button`,
                                  {
                                    type: `button`,
                                    onClick: () => x(n),
                                    className: `photo-tile`,
                                    "aria-label": `${t.enlargePhoto} ${n + 1}: ${e.title}`,
                                    children: [
                                      (0, a.jsx)(`img`, {
                                        src: u(e.src),
                                        alt: ``,
                                      }),
                                      (0, a.jsxs)(`span`, {
                                        children: [`0`, n + 1],
                                      }),
                                      (0, a.jsx)(`b`, { children: e.title }),
                                    ],
                                  },
                                  e.src,
                                ),
                              ),
                            })
                          : null,
                      ],
                    })
                  : (0, a.jsxs)(`div`, {
                      className: `modal-visual ${d.accent}`,
                      children: [
                        (0, a.jsx)(`div`, {
                          className: `visual-lines`,
                          "aria-hidden": `true`,
                        }),
                        (0, a.jsxs)(`span`, {
                          children: [
                            d.number,
                            ` / `,
                            d.kind === `video` ? `FILM` : `PHOTO`,
                          ],
                        }),
                        (0, a.jsx)(`strong`, { children: d.client }),
                      ],
                    }),
                (0, a.jsxs)(`div`, {
                  className: `modal-copy`,
                  children: [
                    (0, a.jsx)(`p`, { className: `kicker`, children: d.label }),
                    (0, a.jsx)(`h2`, { children: d.title }),
                    (0, a.jsx)(`p`, { children: d.description }),
                    (0, a.jsx)(`ul`, {
                      children: d.deliverables.map((e) =>
                        (0, a.jsx)(`li`, { children: e }, e),
                      ),
                    }),
                    (0, a.jsxs)(`a`, {
                      href: n,
                      target: `_blank`,
                      rel: `noreferrer`,
                      children: [
                        t.modalCta,
                        ` `,
                        (0, a.jsx)(`b`, { children: `↗` }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
            E &&
              (0, a.jsxs)(`div`, {
                className: `photo-lightbox`,
                role: `dialog`,
                "aria-modal": `true`,
                "aria-label": `${t.enlargedPhoto}: ${E.title}`,
                children: [
                  (0, a.jsx)(`button`, {
                    className: `lightbox-backdrop`,
                    type: `button`,
                    onClick: () => x(null),
                    "aria-label": t.closePhoto,
                  }),
                  (0, a.jsx)(`button`, {
                    className: `lightbox-close`,
                    type: `button`,
                    onClick: () => x(null),
                    "aria-label": t.closePhoto,
                    children: `×`,
                  }),
                  (0, a.jsx)(`button`, {
                    className: `lightbox-arrow lightbox-prev`,
                    type: `button`,
                    onClick: () => D(-1),
                    "aria-label": t.previousPhoto,
                    children: (0, a.jsx)(`span`, {
                      className: `lightbox-arrow-icon`,
                      "aria-hidden": `true`,
                    }),
                  }),
                  (0, a.jsx)(`div`, {
                    className: `lightbox-stage`,
                    onTouchStart: (e) => {
                      S.current = e.touches[0].clientX;
                    },
                    onTouchEnd: (e) => {
                      if (S.current === null) return;
                      let t = e.changedTouches[0].clientX - S.current;
                      (Math.abs(t) > 45 && D(t > 0 ? -1 : 1),
                        (S.current = null));
                    },
                    children: (0, a.jsx)(`div`, {
                      className: `lightbox-image`,
                      style: { backgroundImage: `url(${u(E.src)})` },
                      role: `img`,
                      "aria-label": E.title,
                    }),
                  }),
                  (0, a.jsx)(`button`, {
                    className: `lightbox-arrow lightbox-next`,
                    type: `button`,
                    onClick: () => D(1),
                    "aria-label": t.nextPhoto,
                    children: (0, a.jsx)(`span`, {
                      className: `lightbox-arrow-icon`,
                      "aria-hidden": `true`,
                    }),
                  }),
                  (0, a.jsxs)(`div`, {
                    className: `lightbox-caption`,
                    children: [
                      (0, a.jsxs)(`div`, {
                        children: [
                          (0, a.jsxs)(`span`, {
                            children: [
                              String((b ?? 0) + 1).padStart(2, `0`),
                              ` / `,
                              String(T.length).padStart(2, `0`),
                            ],
                          }),
                          (0, a.jsx)(`b`, { children: E.title }),
                        ],
                      }),
                      (0, a.jsx)(`div`, {
                        className: `lightbox-dots`,
                        "aria-label": t.choosePhoto,
                        children: T.map((e, n) =>
                          (0, a.jsx)(
                            `button`,
                            {
                              type: `button`,
                              className: n === b ? `active` : ``,
                              onClick: () => x(n),
                              "aria-label": `${t.goToPhoto} ${n + 1}`,
                            },
                            e.src,
                          ),
                        ),
                      }),
                    ],
                  }),
                ],
              }),
          ],
        }),
    ],
  });
}
export { b as default };
