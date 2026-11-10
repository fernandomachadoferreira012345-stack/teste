/**
 * ============================================================
 * NEON VELOCITY CUSTOMS // SCRIPT PRINCIPAL
 * Animação de Scroll com Sequência de 242 Frames (Vanilla JS)
 * ============================================================
 */

(function () {
  'use strict';

  // Configuração da Sequência de 242 Frames
  const FRAME_COUNT = 242;
  const FRAME_PATH = (index) => {
    const padIndex = String(index).padStart(4, '0');
    return `./frames/frame-${padIndex}.jpg`;
  };

  // Elementos do DOM
  const canvas = document.getElementById('scroll-canvas');
  const ctx = canvas.getContext('2d');
  const scrollSection = document.getElementById('hero');
  const loaderOverlay = document.getElementById('loader-overlay');
  const loaderBarFill = document.getElementById('loader-bar-fill');
  const loaderStatus = document.getElementById('loader-status');
  const hudFrameCounter = document.getElementById('hud-frame-counter');
  const hudBoostVal = document.getElementById('hud-boost-val');
  const hudRpmVal = document.getElementById('hud-rpm-val');
  const hudProgressFill = document.getElementById('hud-progress-fill');

  // Textos Narrativos por Faixa de Frames
  const narrativeStep1 = document.getElementById('narrative-step-1');
  const narrativeStep2 = document.getElementById('narrative-step-2');
  const narrativeStep3 = document.getElementById('narrative-step-3');
  const narrativeStep4 = document.getElementById('narrative-step-4');

  // Cache e Controle de Imagens
  const images = [];
  let loadedImagesCount = 0;
  let currentFrameIndex = 0;
  let targetFrameIndex = 0;
  let isUsingProceduralFallback = false;
  let animationFrameId = null;

  // Detecção de prefers-reduced-motion
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // ============================================================
  // 1. AJUSTE DE RESOLUÇÃO DO CANVAS (RESPONSIVO COM DEVICE PIXEL RATIO)
  // ============================================================
  function resizeCanvas() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const width = window.innerWidth;
    const height = window.innerHeight;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';

    ctx.scale(dpr, dpr);
    renderFrame(currentFrameIndex);
  }

  window.addEventListener('resize', resizeCanvas, { passive: true });

  // ============================================================
  // 2. DESENHO PROPORCIONAL COM ASPECT RATIO "COVER"
  // ============================================================
  function drawImageProp(context, img, x, y, w, h) {
    if (!img) return;

    const imgW = img.naturalWidth || img.width || 1920;
    const imgH = img.naturalHeight || img.height || 1080;

    // Calcular escala proporcional (cover)
    const ratio = Math.max(w / imgW, h / imgH);
    const newW = imgW * ratio;
    const newH = imgH * ratio;

    // Centralizar
    const offsetX = (w - newW) * 0.5;
    const offsetY = (h - newH) * 0.5;

    context.drawImage(img, 0, 0, imgW, imgH, offsetX, offsetY, newW, newH);
  }

  // ============================================================
  // 3. MOTOR DE FALLBACK PROCEDURAL (SE OS FRAMES AINDA NÃO FORAM COLADOS)
  // ============================================================
  function drawProceduralFallback(context, frameIndex, w, h) {
    // Fundo asfalto escuro
    context.fillStyle = '#070709';
    context.fillRect(0, 0, w, h);

    const progress = frameIndex / (FRAME_COUNT - 1);
    const centerX = w * 0.5;
    const centerY = h * 0.5;

    // Grade de perspectiva 3D estilo Tokyo Neon
    context.strokeStyle = 'rgba(0, 255, 255, 0.12)';
    context.lineWidth = 1;

    const vanishingY = centerY * 0.7;
    for (let x = -w * 0.5; x <= w * 1.5; x += w * 0.08) {
      context.beginPath();
      context.moveTo(centerX, vanishingY);
      context.lineTo(x, h);
      context.stroke();
    }

    // Linhas horizontais em movimento com o scroll
    const lineOffset = (frameIndex * 8) % 60;
    for (let y = vanishingY; y < h; y += 35) {
      const currentY = y + lineOffset;
      if (currentY > h) continue;
      const alpha = Math.min(0.25, (currentY - vanishingY) / (h - vanishingY));
      context.strokeStyle = `rgba(255, 0, 255, ${alpha})`;
      context.beginPath();
      context.moveTo(0, currentY);
      context.lineTo(w, currentY);
      context.stroke();
    }

    // Silhueta Estilizada de Carro JDM (Vista Traseira/Angulada)
    context.save();
    context.translate(centerX, centerY + 20);

    // Efeito de neon underglow no chão
    const glowRadius = 140 + Math.sin(frameIndex * 0.1) * 20;
    const radialGlow = context.createRadialGradient(0, 80, 10, 0, 80, glowRadius);
    radialGlow.addColorStop(0, 'rgba(0, 255, 255, 0.7)');
    radialGlow.addColorStop(0.5, 'rgba(255, 0, 255, 0.4)');
    radialGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');
    context.fillStyle = radialGlow;
    context.beginPath();
    context.ellipse(0, 80, 220, 60, 0, 0, Math.PI * 2);
    context.fill();

    // Silhueta do Veículo Esportivo
    context.fillStyle = '#111116';
    context.strokeStyle = '#00FFFF';
    context.lineWidth = 2;
    context.shadowColor = '#00FFFF';
    context.shadowBlur = 15;

    context.beginPath();
    context.moveTo(-130, 60);
    context.lineTo(-110, -20);
    context.lineTo(-60, -70);
    context.lineTo(60, -70);
    context.lineTo(110, -20);
    context.lineTo(130, 60);
    context.closePath();
    context.fill();
    context.stroke();

    // Lanternas Traseiras Circulares (Assinatura Nissan Skyline R34)
    context.shadowColor = '#FF0055';
    context.shadowBlur = 25;
    context.fillStyle = '#FF0055';

    [-70, -40, 40, 70].forEach(xPos => {
      context.beginPath();
      context.arc(xPos, 0, 14, 0, Math.PI * 2);
      context.fill();
      context.strokeStyle = '#FFFFFF';
      context.lineWidth = 2;
      context.stroke();
    });

    // Aerofólio em Fibra de Carbono
    context.shadowColor = '#00FFFF';
    context.fillStyle = '#1A1A22';
    context.fillRect(-140, -85, 280, 12);

    context.restore();

    // Aviso informativo discreto
    context.fillStyle = 'rgba(0, 255, 255, 0.6)';
    context.font = '11px "JetBrains Mono", monospace';
    context.textAlign = 'center';
    context.fillText(`[SEQUÊNCIA PROCEDURAL ATIVA: FRAME ${String(frameIndex + 1).padStart(3, '0')} / ${FRAME_COUNT}]`, centerX, h - 35);
    context.fillText(`(Copie seus 242 arquivos JPG para a pasta ./frames/)`, centerX, h - 18);
  }

  // ============================================================
  // 4. RENDERIZAÇÃO DO FRAME ATUAL
  // ============================================================
  function renderFrame(index) {
    const w = window.innerWidth;
    const h = window.innerHeight;

    ctx.clearRect(0, 0, w, h);

    const img = images[index];

    if (img && img.complete && img.naturalWidth !== 0) {
      // Se a imagem real está carregada, desenha com proporção cover
      drawImageProp(ctx, img, 0, 0, w, h);
    } else {
      // Caso a imagem ainda não exista no disco, renderiza a simulação procedural
      drawProceduralFallback(ctx, index, w, h);
    }

    // Atualizar HUD de Telemetria
    updateHud(index);
  }

  // ============================================================
  // 5. ATUALIZAÇÃO DO HUD E DA TELEMETRIA
  // ============================================================
  function updateHud(frameIndex) {
    const padCurrent = String(frameIndex + 1).padStart(3, '0');
    if (hudFrameCounter) {
      hudFrameCounter.textContent = `FRAME ${padCurrent} / ${FRAME_COUNT}`;
    }

    // Simulação de Pressão de Turbo e RPM sincronizados com o avanço do scroll
    const boost = (0.3 + (frameIndex / FRAME_COUNT) * 2.1).toFixed(1);
    const rpm = Math.round(2800 + (frameIndex / FRAME_COUNT) * 5800);

    if (hudBoostVal) hudBoostVal.textContent = `${boost} BAR`;
    if (hudRpmVal) hudRpmVal.textContent = `${rpm.toLocaleString('pt-BR')} RPM`;

    // Barra de progresso da sequência no HUD
    const percent = ((frameIndex + 1) / FRAME_COUNT) * 100;
    if (hudProgressFill) {
      hudProgressFill.style.width = `${percent}%`;
    }

    // Controle dos Textos Narrativos por Etapa de Frames
    // Etapa 1: 0 - 60
    // Etapa 2: 61 - 130
    // Etapa 3: 131 - 190
    // Etapa 4: 191 - 241
    if (narrativeStep1) narrativeStep1.classList.toggle('hidden', frameIndex > 60);
    if (narrativeStep2) narrativeStep2.classList.toggle('hidden', frameIndex <= 60 || frameIndex > 130);
    if (narrativeStep3) narrativeStep3.classList.toggle('hidden', frameIndex <= 130 || frameIndex > 190);
    if (narrativeStep4) narrativeStep4.classList.toggle('hidden', frameIndex <= 190);
  }

  // ============================================================
  // 6. LOOP DE INTERPOLAÇÃO SUAVE (SMOOTH LERPING A 60 FPS)
  // ============================================================
  function updateScroll() {
    if (prefersReducedMotion) return;

    // Calcular fração do scroll dentro da seção Hero
    const rect = scrollSection.getBoundingClientRect();
    const scrollDistance = scrollSection.offsetHeight - window.innerHeight;
    const currentScrollY = -rect.top;

    let progress = currentScrollY / scrollDistance;
    progress = Math.max(0, Math.min(1, progress));

    // Determinar índice alvo
    targetFrameIndex = Math.min(FRAME_COUNT - 1, Math.floor(progress * FRAME_COUNT));

    // Interpolação suave (Lerp) para troca fluida de frames sem tranco
    const diff = targetFrameIndex - currentFrameIndex;
    if (Math.abs(diff) > 0.05) {
      currentFrameIndex += diff * 0.25;
      renderFrame(Math.round(currentFrameIndex));
    }

    animationFrameId = requestAnimationFrame(updateScroll);
  }

  // ============================================================
  // 7. PRÉ-CARREGAMENTO DAS 242 IMAGENS
  // ============================================================
  function preloadImages() {
    let loadedCount = 0;
    let failedCount = 0;

    for (let i = 1; i <= FRAME_COUNT; i++) {
      const img = new Image();
      img.src = FRAME_PATH(i);

      img.onload = () => {
        loadedCount++;
        handleProgress(loadedCount + failedCount);
      };

      img.onerror = () => {
        failedCount++;
        isUsingProceduralFallback = true;
        handleProgress(loadedCount + failedCount);
      };

      images.push(img);
    }
  }

  function handleProgress(processed) {
    const percent = Math.round((processed / FRAME_COUNT) * 100);

    if (loaderBarFill) {
      loaderBarFill.style.width = `${percent}%`;
    }

    if (loaderStatus) {
      loaderStatus.textContent = `CARREGANDO TELEMETRIA... ${percent}%`;
    }

    // Quando todos os 242 frames foram verificados
    if (processed >= FRAME_COUNT) {
      setTimeout(() => {
        if (loaderOverlay) {
          loaderOverlay.classList.add('hidden');
        }
        renderFrame(0);
        animationFrameId = requestAnimationFrame(updateScroll);
      }, 350);
    }
  }

  // ============================================================
  // 8. FUNCIONALIDADES INTERATIVAS: THE MOD SHOP & WHATSAPP
  // ============================================================
  function initModShopCalculator() {
    const checkboxes = document.querySelectorAll('.mod-check');
    const totalDisplay = document.getElementById('summary-total-display');
    const countDisplay = document.getElementById('selected-mods-count');
    const btnEnviar = document.getElementById('btn-enviar-setup');

    if (!checkboxes.length || !totalDisplay) return;

    function recalculate() {
      let total = 0;
      let count = 0;
      const selectedNames = [];

      checkboxes.forEach(cb => {
        if (cb.checked) {
          total += Number(cb.getAttribute('data-price') || 0);
          count++;
          selectedNames.push(cb.getAttribute('data-name') || 'Item');
        }
      });

      const formatted = new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency: 'BRL',
      }).format(total);

      totalDisplay.textContent = formatted;
      countDisplay.textContent = `${count} ${count === 1 ? 'modificação' : 'modificações'}`;

      // Configurar link do WhatsApp
      if (btnEnviar) {
        btnEnviar.onclick = () => {
          if (count === 0) {
            alert('Por favor, selecione ao menos uma modificação para compor seu setup!');
            return;
          }

          const msg = `⚡ *PROJETO DE CUSTOMIZAÇÃO // NEON VELOCITY* ⚡\n\n` +
            `Olá, selecionei os seguintes upgrades para minha máquina:\n\n` +
            selectedNames.map(n => `• ${n}`).join('\n') + `\n\n` +
            `💰 *Investimento Estimado:* ${formatted}\n\n` +
            `Desejo agendar a entrada do veículo na oficina para vistoria técnica.`;

          window.open(`https://wa.me/5511999990000?text=${encodeURIComponent(msg)}`, '_blank');
        };
      }
    }

    checkboxes.forEach(cb => cb.addEventListener('change', recalculate));
    recalculate();
  }

  // Links rápidos para envio de propostas de carros e peças
  function initProposalButtons() {
    document.querySelectorAll('.btn-proposta').forEach(btn => {
      btn.addEventListener('click', () => {
        const carro = btn.getAttribute('data-carro') || 'Veículo JDM';
        const msg = `🏁 *PROPOSTA DE AQUISIÇÃO // THE JDM LEGENDS*\n\nOlá, tenho interesse imediato na aquisição do ${carro}. Gostaria de consultar a documentação e agendar vistoria presencial.`;
        window.open(`https://wa.me/5511999990000?text=${encodeURIComponent(msg)}`, '_blank');
      });
    });

    document.querySelectorAll('.btn-buy-part').forEach(btn => {
      btn.addEventListener('click', () => {
        const peca = btn.getAttribute('data-part') || 'Peça Forjada';
        const msg = `🔥 *THE PARTS VAULT // PEDIDO DE PEÇA*\n\nOlá, gostaria de encomendar o ${peca}. Vocês têm a pronta entrega para envio imediato?`;
        window.open(`https://wa.me/5511999990000?text=${encodeURIComponent(msg)}`, '_blank');
      });
    });
  }

  // Menu Mobile Toggle & Navbar Scroll
  function initNavigation() {
    const navbar = document.getElementById('navbar');
    const menuToggle = document.getElementById('menu-toggle');
    const navMenu = document.getElementById('nav-menu');

    window.addEventListener('scroll', () => {
      if (navbar) {
        navbar.classList.toggle('scrolled', window.scrollY > 50);
      }
    }, { passive: true });

    if (menuToggle && navMenu) {
      menuToggle.addEventListener('click', () => {
        const isOpen = navMenu.style.display === 'flex';
        navMenu.style.display = isOpen ? 'none' : 'flex';
        if (!isOpen) {
          navMenu.style.flexDirection = 'column';
          navMenu.style.position = 'absolute';
          navMenu.style.top = '100%';
          navMenu.style.left = '0';
          navMenu.style.right = '0';
          navMenu.style.background = '#0A0A0A';
          navMenu.style.padding = '1.5rem';
          navMenu.style.borderBottom = '1px solid #00FFFF';
        }
      });
    }
  }

  // ============================================================
  // INICIALIZAÇÃO
  // ============================================================
  document.addEventListener('DOMContentLoaded', () => {
    resizeCanvas();
    preloadImages();
    initModShopCalculator();
    initProposalButtons();
    initNavigation();
  });

})();
