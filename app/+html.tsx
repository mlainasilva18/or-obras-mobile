import { ScrollViewStyleReset } from 'expo-router/html';
import type { PropsWithChildren } from 'react';

/**
 * Root HTML customizado para o OR Obras PWA.
 * Inclui meta tags para:
 *  - Safari iOS: "Adicionar à Tela de Início" com ícone e splash screen
 *  - Chrome Android/desktop: manifest.json para instalação PWA
 *  - Tema verde #2E7D32 na barra de status do navegador
 */
export default function Root({ children }: PropsWithChildren) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta httpEquiv="X-UA-Compatible" content="IE=edge" />

        {/* Viewport responsivo */}
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1, shrink-to-fit=no, viewport-fit=cover"
        />

        {/* Título e descrição */}
        <title>OR Obras — FVS</title>
        <meta name="description" content="Sistema de Ficha de Verificação de Serviço para construtoras" />
        <meta name="application-name" content="OR Obras" />

        {/* Tema do navegador (Chrome, Edge, Samsung Browser) */}
        <meta name="theme-color" content="#2E7D32" />

        {/* PWA Manifest (Chrome Android + Edge + Samsung + Firefox) */}
        <link rel="manifest" href="/manifest.json" />

        {/* Favicon */}
        <link rel="icon" type="image/png" href="/icon-192.png" />
        <link rel="shortcut icon" href="/icon-192.png" />

        {/* ============================================================
            SAFARI iOS — "Adicionar à Tela de Início"
            ============================================================ */}
        {/* Habilita modo standalone (sem barra do Safari) */}
        <meta name="apple-mobile-web-app-capable" content="yes" />
        {/* Estilo da barra de status: black-translucent para tela cheia */}
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Nome exibido abaixo do ícone na tela de início */}
        <meta name="apple-mobile-web-app-title" content="OR Obras" />

        {/* Ícone Apple Touch (aparece na tela de início do iPhone/iPad) */}
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="192x192" href="/icon-192.png" />
        <link rel="apple-touch-icon" sizes="512x512" href="/icon-512.png" />

        {/* Splash screens para iPhone (iOS mostra ao abrir o PWA) */}
        {/* iPhone SE / 8 */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 667px) and (-webkit-device-pixel-ratio: 2)"
          href="/icon-512.png"
        />
        {/* iPhone X / XS / 11 Pro */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 375px) and (device-height: 812px) and (-webkit-device-pixel-ratio: 3)"
          href="/icon-512.png"
        />
        {/* iPhone 14 Pro / 15 */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 393px) and (device-height: 852px) and (-webkit-device-pixel-ratio: 3)"
          href="/icon-512.png"
        />
        {/* iPad */}
        <link
          rel="apple-touch-startup-image"
          media="(device-width: 768px) and (device-height: 1024px) and (-webkit-device-pixel-ratio: 2)"
          href="/icon-512.png"
        />

        {/* ============================================================
            Open Graph (compartilhamento em redes sociais / WhatsApp)
            ============================================================ */}
        <meta property="og:type" content="website" />
        <meta property="og:title" content="OR Obras — FVS" />
        <meta property="og:description" content="Sistema de Ficha de Verificação de Serviço para construtoras" />
        <meta property="og:image" content="/icon-512.png" />

        {/* ============================================================
            Fontes de ícones — MaterialIcons (corrige ícones no web estático)
            ============================================================ */}
        <style dangerouslySetInnerHTML={{ __html: `
          @font-face {
            font-family: 'MaterialIcons';
            src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialIcons.4e85bc9ebe07e0340c9c4fc2f6c38908.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'MaterialCommunityIcons';
            src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/MaterialCommunityIcons.6e435534bd35da5fef04168860a9b8fa.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
          @font-face {
            font-family: 'Ionicons';
            src: url('/assets/node_modules/@expo/vector-icons/build/vendor/react-native-vector-icons/Fonts/Ionicons.b4eb097d35f44ed943676fd56f6bdc51.ttf') format('truetype');
            font-weight: normal;
            font-style: normal;
          }
        `}} />

        {/* Reset de estilo para React Native Web */}
        <ScrollViewStyleReset />

        {/* Registrar Service Worker para cache offline */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(reg) { console.log('[OR Obras] SW registrado:', reg.scope); })
                    .catch(function(err) { console.warn('[OR Obras] SW falhou:', err); });
                });
              }
            `,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
