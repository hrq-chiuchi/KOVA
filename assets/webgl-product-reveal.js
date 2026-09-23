(() => {
  const MAX_ITEMS = 12;
  const MAX_TEXTURE_BYTES = 96 * 1024 * 1024;
  const VERTEX_SOURCE = `
    attribute vec2 aPosition;
    varying vec2 vUv;
    void main() {
      vUv = aPosition * 0.5 + 0.5;
      gl_Position = vec4(aPosition, 0.0, 1.0);
    }
  `;
  const FRAGMENT_SOURCE = `
    precision highp float;
    uniform sampler2D uTextureA;
    uniform sampler2D uTextureB;
    uniform float uProgress;
    uniform float uMode;
    uniform float uTargetAspect;
    uniform float uTextureAspectA;
    uniform float uTextureAspectB;
    varying vec2 vUv;

    float hash(vec2 point) {
      return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453123);
    }

    vec2 coverUv(vec2 uv, float textureAspect) {
      if (uTargetAspect > textureAspect) {
        uv.y = (uv.y - 0.5) * (textureAspect / uTargetAspect) + 0.5;
      } else {
        uv.x = (uv.x - 0.5) * (uTargetAspect / textureAspect) + 0.5;
      }
      return clamp(uv, 0.0, 1.0);
    }

    vec4 sampleA(vec2 uv, float split) {
      vec2 center = coverUv(uv, uTextureAspectA);
      vec4 base = texture2D(uTextureA, center);
      float red = texture2D(uTextureA, coverUv(uv + vec2(split, 0.0), uTextureAspectA)).r;
      float blue = texture2D(uTextureA, coverUv(uv - vec2(split, 0.0), uTextureAspectA)).b;
      return vec4(red, base.g, blue, base.a);
    }

    vec4 sampleB(vec2 uv, float split) {
      vec2 center = coverUv(uv, uTextureAspectB);
      vec4 base = texture2D(uTextureB, center);
      float red = texture2D(uTextureB, coverUv(uv + vec2(split, 0.0), uTextureAspectB)).r;
      float blue = texture2D(uTextureB, coverUv(uv - vec2(split, 0.0), uTextureAspectB)).b;
      return vec4(red, base.g, blue, base.a);
    }

    void main() {
      float progress = clamp(uProgress, 0.0, 1.0);

      if (uMode < 0.5) {
        float intensity = 1.0 - progress;
        float band = hash(vec2(floor(vUv.y * 34.0), floor(progress * 18.0)));
        float horizontalShift = (band - 0.5) * 0.09 * intensity;
        vec2 shiftedUv = vUv + vec2(horizontalShift, 0.0);
        vec2 pixelGrid = mix(vec2(18.0, 24.0), vec2(1800.0), progress);
        vec2 pixelUv = (floor(shiftedUv * pixelGrid) + 0.5) / pixelGrid;
        float colorSplit = 0.012 * intensity;
        vec4 color = sampleA(pixelUv, colorSplit);
        float cell = hash(floor(vUv * vec2(18.0, 24.0)));
        float alpha = smoothstep(cell * 0.68, cell * 0.68 + 0.18, progress);
        float signal = step(0.82, band) * intensity;
        color.rgb += vec3(0.1, 0.14, 0.0) * signal;
        gl_FragColor = vec4(color.rgb, color.a * alpha);
        return;
      }

      float transitionPeak = sin(progress * 3.14159265);
      float band = hash(vec2(floor(vUv.y * 30.0), floor(progress * 14.0)));
      float horizontalShift = (band - 0.5) * 0.075 * transitionPeak;
      vec2 shiftedUv = vUv + vec2(horizontalShift, 0.0);
      vec2 pixelGrid = mix(vec2(1800.0), vec2(22.0, 28.0), transitionPeak);
      vec2 pixelUv = (floor(shiftedUv * pixelGrid) + 0.5) / pixelGrid;
      float colorSplit = 0.008 * transitionPeak;
      vec4 colorA = sampleA(pixelUv, colorSplit);
      vec4 colorB = sampleB(pixelUv, -colorSplit);
      float cell = hash(floor(vUv * vec2(18.0, 24.0)));
      float threshold = 0.1 + cell * 0.8;
      float blend = smoothstep(threshold - 0.08, threshold + 0.08, progress);
      vec4 color = mix(colorA, colorB, blend);
      float signal = step(0.86, band) * transitionPeak;
      color.rgb += vec3(0.1, 0.14, 0.0) * signal;
      gl_FragColor = color;
    }
  `;

  class WebGLProductReveal {
    constructor() {
      this.items = new Map();
      this.textureBytes = 0;
      this.raf = 0;
      this.activeItem = null;
      this.introQueue = [];
      this.observer = null;
      // Targets waiting to come near the viewport before their textures are decoded and uploaded.
      this.pending = new Set();
      this.prepareObserver = null;
      this.handleResize = () => this.requestRender();
    }

    init(root = document) {
      if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;
      const targets = [];
      if (root instanceof Element && root.matches('[data-webgl-reveal]')) targets.push(root);
      root.querySelectorAll?.('[data-webgl-reveal]').forEach((target) => targets.push(target));
      if (!targets.length) return;
      if (!this.ensureContext()) return;
      targets.forEach((target) => this.queue(target));
    }

    queue(target) {
      if (this.items.has(target) || this.pending.has(target)) return;
      this.pending.add(target);
      this.prepareObserver?.observe(target);
    }

    ensureContext() {
      if (this.gl && !this.contextLost) return true;
      const canvas = document.querySelector('[data-webgl-reveal-canvas]');
      if (!canvas) return false;
      const gl = canvas.getContext('webgl', {
        alpha: true,
        antialias: false,
        depth: false,
        stencil: false,
        powerPreference: 'high-performance',
        failIfMajorPerformanceCaveat: true,
      });
      if (!gl) return false;

      this.canvas = canvas;
      this.gl = gl;
      this.contextLost = false;
      this.abort = new AbortController();
      canvas.addEventListener('webglcontextlost', (event) => this.onContextLost(event), { signal: this.abort.signal });
      canvas.addEventListener('webglcontextrestored', () => this.onContextRestored(), { signal: this.abort.signal });
      window.addEventListener('resize', this.handleResize, { signal: this.abort.signal, passive: true });
      this.createObserver();
      return this.createResources();
    }
    createObserver() {
      this.prepareObserver?.disconnect();
      this.prepareObserver = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.prepareObserver?.unobserve(entry.target);
          this.pending.delete(entry.target);
          this.add(entry.target);
        });
      }, { rootMargin: '50% 0px' });
      this.pending.forEach((target) => this.prepareObserver.observe(target));

      this.observer?.disconnect();
      this.observer = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          this.observer?.unobserve(entry.target);
          const item = this.items.get(entry.target);
          if (!item || item.introPlayed) return;
          item.introPlayed = true;
          this.enqueueIntro(item);
        });
      }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    }


    compile(type, source) {
      const shader = this.gl.createShader(type);
      if (!shader) return null;
      this.gl.shaderSource(shader, source);
      this.gl.compileShader(shader);
      if (this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) return shader;
      console.warn('KOVA WebGL shader unavailable:', this.gl.getShaderInfoLog(shader));
      this.gl.deleteShader(shader);
      return null;
    }

    createResources() {
      const vertex = this.compile(this.gl.VERTEX_SHADER, VERTEX_SOURCE);
      const fragment = this.compile(this.gl.FRAGMENT_SHADER, FRAGMENT_SOURCE);
      if (!vertex || !fragment) return false;
      const program = this.gl.createProgram();
      if (!program) return false;
      this.gl.attachShader(program, vertex);
      this.gl.attachShader(program, fragment);
      this.gl.linkProgram(program);
      this.gl.deleteShader(vertex);
      this.gl.deleteShader(fragment);
      if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
        console.warn('KOVA WebGL program unavailable:', this.gl.getProgramInfoLog(program));
        this.gl.deleteProgram(program);
        return false;
      }

      const buffer = this.gl.createBuffer();
      if (!buffer) return false;
      this.program = program;
      this.buffer = buffer;
      this.position = this.gl.getAttribLocation(program, 'aPosition');
      this.uniforms = {
        textureA: this.gl.getUniformLocation(program, 'uTextureA'),
        textureB: this.gl.getUniformLocation(program, 'uTextureB'),
        progress: this.gl.getUniformLocation(program, 'uProgress'),
        targetAspect: this.gl.getUniformLocation(program, 'uTargetAspect'),
        mode: this.gl.getUniformLocation(program, 'uMode'),
        textureAspectA: this.gl.getUniformLocation(program, 'uTextureAspectA'),
        textureAspectB: this.gl.getUniformLocation(program, 'uTextureAspectB'),
      };
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
      this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, -1, 1, 1, -1, 1, 1]), this.gl.STATIC_DRAW);
      this.gl.useProgram(program);
      this.gl.enableVertexAttribArray(this.position);
      this.gl.vertexAttribPointer(this.position, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.uniform1i(this.uniforms.textureA, 0);
      this.gl.uniform1i(this.uniforms.textureB, 1);
      return true;
    }

    async loadTexture(source) {
      const image = new Image();
      image.crossOrigin = 'anonymous';
      image.decoding = 'async';
      image.src = source.currentSrc || source.src;
      await image.decode();
      if (!this.gl || this.contextLost) return null;

      const bytes = image.naturalWidth * image.naturalHeight * 4;
      if (!bytes || this.textureBytes + bytes > MAX_TEXTURE_BYTES) return null;
      const texture = this.gl.createTexture();
      if (!texture) return null;

      this.gl.bindTexture(this.gl.TEXTURE_2D, texture);
      this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_S, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_WRAP_T, this.gl.CLAMP_TO_EDGE);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MIN_FILTER, this.gl.LINEAR);
      this.gl.texParameteri(this.gl.TEXTURE_2D, this.gl.TEXTURE_MAG_FILTER, this.gl.LINEAR);
      this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.RGBA, this.gl.RGBA, this.gl.UNSIGNED_BYTE, image);
      this.textureBytes += bytes;

      return {
        texture,
        bytes,
        width: image.naturalWidth,
        height: image.naturalHeight,
      };
    }

    releaseTexture(texture) {
      if (!texture) return;
      if (this.gl && !this.contextLost) this.gl.deleteTexture(texture.texture);
      this.textureBytes = Math.max(0, this.textureBytes - texture.bytes);
    }

    async add(target) {
      if (this.items.has(target) || this.items.size >= MAX_ITEMS) return;
      const sourceA = target.querySelector('img:not(.product-card__image--alternate)');
      const sourceB = target.querySelector('.product-card__image--alternate');
      if (!sourceA) return;

      const item = {
        target,
        sourceA,
        sourceB,
        textureA: null,
        textureB: null,
        progress: 0,
        mix: 0,
        mode: 0,
        introPlayed: false,
        active: false,
        tween: null,
        abort: new AbortController(),
      };
      this.items.set(target, item);

      try {
        const textureA = await this.loadTexture(sourceA);
        if (!textureA || !this.items.has(target) || this.contextLost) {
          this.releaseTexture(textureA);
          this.items.delete(target);
          return;
        }
        item.textureA = textureA;

        if (sourceB) {
          const textureB = await this.loadTexture(sourceB);
          if (!textureB || !this.items.has(target) || this.contextLost) {
            this.releaseTexture(textureB);
            this.releaseTexture(textureA);
            this.items.delete(target);
            return;
          }
          item.textureB = textureB;
          target.addEventListener('pointerenter', (event) => {
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') this.playHover(item, 1);
          }, { signal: item.abort.signal });
          target.addEventListener('pointerleave', (event) => {
            if (event.pointerType === 'mouse' || event.pointerType === 'pen') this.playHover(item, 0);
          }, { signal: item.abort.signal });
        }
        target.classList.add('is-webgl-prepared');
        this.observer?.observe(target);
      } catch (_) {
        this.releaseTexture(item.textureA);
        this.releaseTexture(item.textureB);
        item.abort.abort();
        this.items.delete(target);
        target.classList.remove('is-webgl-prepared', 'is-webgl-animating');
      }
    }

    enqueueIntro(item) {
      if (!item.textureA || this.introQueue.includes(item)) return;
      this.introQueue.push(item);
      this.playNextIntro();
    }

    playNextIntro() {
      if (this.activeItem) return;
      let item = this.introQueue.shift();
      while (item && (!this.items.has(item.target) || !item.textureA)) item = this.introQueue.shift();
      if (!item) return;
      this.activeItem = item;
      item.mode = 0;
      item.progress = 0;
      this.mountCanvas(item);
      this.animate(item, 1, 0.86, 'power2.out');
    }

    mountCanvas(item) {
      this.canvas.removeAttribute('style');
      item.target.appendChild(this.canvas);
    }

    playHover(item, destination) {
      if (!item.textureA || !item.textureB || !window.gsap) return;
      this.introQueue = this.introQueue.filter((queued) => queued !== item);
      const continuing = this.activeItem === item && item.active && item.mode === 1;
      if (this.activeItem && !continuing) this.stop(this.activeItem);
      this.activeItem = item;
      item.mode = 1;
      if (!continuing) {
        item.progress = destination === 1 ? 0 : 1;
        item.mix = item.progress;
      }
      this.mountCanvas(item);
      this.animate(item, destination, 0.52, 'power2.inOut');
    }

    animate(item, destination, duration, ease) {
      item.tween?.kill();
      item.active = true;
      item.target.classList.add('is-webgl-animating');
      const state = { progress: item.progress };
      this.requestRender();
      item.tween = window.gsap.to(state, {
        progress: destination,
        duration,
        ease,
        overwrite: true,
        onUpdate: () => {
          item.progress = state.progress;
          if (item.mode === 1) item.mix = state.progress;
          this.requestRender();
        },
        onComplete: () => {
          const completedMode = item.mode;
          item.progress = destination;
          if (completedMode === 1) item.mix = destination;
          item.target.classList.remove('is-webgl-animating');
          item.active = false;
          item.tween = null;
          if (this.activeItem === item) this.activeItem = null;
          this.clearCanvas();
          this.parkCanvas();
          this.playNextIntro();
        },
      });
    }

    stop(item) {
      item.tween?.kill();
      item.tween = null;
      item.active = false;
      item.target.classList.remove('is-webgl-animating');
      if (this.activeItem === item) this.activeItem = null;
      this.clearCanvas();
      this.parkCanvas();
    }

    requestRender() {
      if (this.raf || !this.gl || this.contextLost || !this.activeItem?.active) return;
      this.raf = requestAnimationFrame(() => {
        this.raf = 0;
        this.render();
      });
    }

    resize(item) {
      const dpr = Math.min(window.devicePixelRatio || 1, window.innerWidth < 768 ? 1 : 1.5);
      const width = Math.max(1, Math.round(item.target.clientWidth * dpr));
      const height = Math.max(1, Math.round(item.target.clientHeight * dpr));
      if (this.canvas.width !== width || this.canvas.height !== height) {
        this.canvas.width = width;
        this.canvas.height = height;
      }
    }

    clearCanvas() {
      if (!this.gl || this.contextLost || !this.canvas) return;
      this.gl.disable(this.gl.SCISSOR_TEST);
      this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
      this.gl.clearColor(0, 0, 0, 0);
      this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    parkCanvas() {
      if (this.canvas?.parentElement !== document.body) document.body.appendChild(this.canvas);
    }

    render() {
      const item = this.activeItem;
      if (!this.gl || !this.program || !item?.active || !item.textureA) return;
      this.resize(item);
      this.clearCanvas();
      this.gl.useProgram(this.program);
      this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
      this.gl.enableVertexAttribArray(this.position);
      this.gl.vertexAttribPointer(this.position, 2, this.gl.FLOAT, false, 0, 0);
      this.gl.activeTexture(this.gl.TEXTURE0);
      this.gl.bindTexture(this.gl.TEXTURE_2D, item.textureA.texture);
      this.gl.activeTexture(this.gl.TEXTURE1);
      this.gl.bindTexture(this.gl.TEXTURE_2D, (item.textureB || item.textureA).texture);
      this.gl.uniform1f(this.uniforms.mode, item.mode);
      this.gl.uniform1f(this.uniforms.progress, item.progress);
      this.gl.uniform1f(this.uniforms.targetAspect, item.target.clientWidth / item.target.clientHeight);
      this.gl.uniform1f(this.uniforms.textureAspectA, item.textureA.width / item.textureA.height);
      const textureB = item.textureB || item.textureA;
      this.gl.uniform1f(this.uniforms.textureAspectB, textureB.width / textureB.height);
      this.gl.drawArrays(this.gl.TRIANGLES, 0, 6);
    }

    destroy(root = document) {
      for (const target of Array.from(this.pending)) {
        if (root !== document && target !== root && !root.contains?.(target)) continue;
        this.prepareObserver?.unobserve(target);
        this.pending.delete(target);
      }
      for (const [target, item] of Array.from(this.items.entries())) {
        if (root !== document && target !== root && !root.contains?.(target)) continue;
        this.observer?.unobserve(target);
        this.introQueue = this.introQueue.filter((queued) => queued !== item);
        if (item.active) this.stop(item);
        item.tween?.kill();
        item.abort.abort();
        target.classList.remove('is-webgl-prepared', 'is-webgl-animating');
        this.releaseTexture(item.textureA);
        this.releaseTexture(item.textureB);
        this.items.delete(target);
      }
      if (!this.items.size && !this.pending.size) this.dispose();
    }

    refresh() {
      this.requestRender();
    }

    onContextLost(event) {
      event.preventDefault();
      this.contextLost = true;
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.observer?.disconnect();
      this.prepareObserver?.disconnect();
      this.introQueue = [];
      this.items.forEach((item) => {
        item.tween?.kill();
        item.tween = null;
        item.active = false;
        item.abort.abort();
        item.target.classList.remove('is-webgl-prepared', 'is-webgl-animating');
      });
      this.activeItem = null;
      this.parkCanvas();
    }

    onContextRestored() {
      const targets = Array.from(this.items.keys());
      this.items.clear();
      this.textureBytes = 0;
      this.contextLost = false;
      if (!this.createResources()) return;
      this.createObserver();
      targets.forEach((target) => this.add(target));
    }

    dispose() {
      cancelAnimationFrame(this.raf);
      this.raf = 0;
      this.activeItem = null;
      this.observer?.disconnect();
      this.observer = null;
      this.prepareObserver?.disconnect();
      this.prepareObserver = null;
      this.pending.clear();
      this.introQueue = [];
      this.abort?.abort();
      this.parkCanvas();
      if (this.gl && !this.contextLost) {
        if (this.buffer) this.gl.deleteBuffer(this.buffer);
        if (this.program) this.gl.deleteProgram(this.program);
      }
      this.canvas?.removeAttribute('style');
      this.gl = null;
      this.program = null;
      this.buffer = null;
      this.abort = null;
      this.contextLost = false;
      this.textureBytes = 0;
    }
  }

  const reveal = new WebGLProductReveal();
  window.AfterdarkWebGL = {
    init: (root) => reveal.init(root),
    destroy: (root) => reveal.destroy(root),
    refresh: () => reveal.refresh(),
  };
})();
