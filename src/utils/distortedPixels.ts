/**
 * Distortion estilo DistortedPixels (akella/Codrops) — MIT.
 * https://github.com/akella/DistortedPixels
 *
 * Sem Three.js: WebGL puro + DataTexture de offsets.
 */

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(n, max));
}

export type DistortedPixelsOptions = {
  imageUrl: string;
  /** Resolução do grid (maior = mais detalhado / “pixelzinho”). Padrão 48. */
  grid?: number;
  /** Raio de influência do mouse (0–1). Maior = área maior. Padrão 0.35. */
  mouseRadius?: number;
  /** Intensidade do puxão. Padrão 0.55. */
  strength?: number;
  /** Relaxamento 0–1 (mais perto de 1 = volta mais devagar). Padrão 0.92. */
  relaxation?: number;
  /** Quanto a textura desloca no shader (tamanho visual do efeito). Padrão 0.035. */
  offsetScale?: number;
  /**
   * Multiplicador da altura do canvas em relação à imagem (imagem fica centralizada).
   * Ex.: 1.7 = 70% mais área vertical pro efeito. Padrão 1.65.
   */
  canvasHeightScale?: number;
};

export class DistortedPixels {
  private canvas: HTMLCanvasElement;
  private gl: WebGLRenderingContext;
  private program: WebGLProgram;
  private dataTexture: WebGLTexture;
  private imageTexture: WebGLTexture;
  private data: Float32Array;
  private size: number;
  private mouseRadius: number;
  private strength: number;
  private relaxation: number;
  private offsetScale: number;
  private canvasHeightScale: number;
  /** Fração vertical da imagem no canvas (0–1), centrada. */
  private imageY0 = 0;
  private imageY1 = 1;

  private mouse = { x: 0.5, y: 0.5, prevX: 0.5, prevY: 0.5, vX: 0, vY: 0 };
  private raf = 0;
  private destroyed = false;
  private imageLoaded = false;

  private uDataLoc: WebGLUniformLocation | null = null;
  private uTexLoc: WebGLUniformLocation | null = null;
  private uOffsetScaleLoc: WebGLUniformLocation | null = null;
  private uImageY0Loc: WebGLUniformLocation | null = null;
  private uImageY1Loc: WebGLUniformLocation | null = null;

  static isSupported() {
    const c = document.createElement("canvas");
    return Boolean(c.getContext("webgl") || c.getContext("experimental-webgl"));
  }

  constructor(canvas: HTMLCanvasElement, options: DistortedPixelsOptions) {
    const gl = canvas.getContext("webgl", {
      alpha: true,
      premultipliedAlpha: false,
      antialias: true,
    });
    if (!gl) throw new Error("WebGL indisponível");

    this.canvas = canvas;
    this.gl = gl;
    this.size = Math.max(8, Math.floor(options.grid ?? 48));
    this.mouseRadius = options.mouseRadius ?? 0.35;
    this.strength = options.strength ?? 0.55;
    this.relaxation = options.relaxation ?? 0.92;
    this.offsetScale = options.offsetScale ?? 0.035;
    this.canvasHeightScale = Math.max(1, options.canvasHeightScale ?? 1.65);

    this.data = new Float32Array(this.size * this.size * 4);
    this.dataTexture = this.createDataTexture();
    this.imageTexture = this.createEmptyTexture();
    this.program = this.createProgram();

    this.uDataLoc = gl.getUniformLocation(this.program, "uDataTexture");
    this.uTexLoc = gl.getUniformLocation(this.program, "uTexture");
    this.uOffsetScaleLoc = gl.getUniformLocation(this.program, "uOffsetScale");
    this.uImageY0Loc = gl.getUniformLocation(this.program, "uImageY0");
    this.uImageY1Loc = gl.getUniformLocation(this.program, "uImageY1");

    this.loadImage(options.imageUrl);
    this.bindPointer();
    this.loop();
  }

  private createEmptyTexture() {
    const gl = this.gl;
    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      1,
      1,
      0,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      new Uint8Array([0, 0, 0, 0]),
    );
    return tex;
  }

  private createDataTexture() {
    const gl = this.gl;
    // WebGL1: float textures precisam da extensão
    gl.getExtension("OES_texture_float");
    gl.getExtension("OES_texture_float_linear");

    const tex = gl.createTexture()!;
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.size,
      this.size,
      0,
      gl.RGBA,
      gl.FLOAT,
      this.data,
    );
    return tex;
  }

  private createProgram() {
    const gl = this.gl;
    const vs = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;
    const fs = `
precision highp float;
uniform sampler2D uTexture;
uniform sampler2D uDataTexture;
uniform float uOffsetScale;
uniform float uImageY0;
uniform float uImageY1;
varying vec2 vUv;
void main() {
  // Sem flip no Y da data texture → posição do efeito alinhada ao mouse
  vec4 offset = texture2D(uDataTexture, vUv);

  // Imagem letterbox centralizada no canvas mais alto
  float imgH = max(uImageY1 - uImageY0, 0.0001);
  float localY = (vUv.y - uImageY0) / imgH;
  if (localY < 0.0 || localY > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }

  vec2 uv = vec2(vUv.x, localY) - uOffsetScale * offset.rg;
  if (uv.x < 0.0 || uv.x > 1.0 || uv.y < 0.0 || uv.y > 1.0) {
    gl_FragColor = vec4(0.0);
    return;
  }
  gl_FragColor = texture2D(uTexture, uv);
}`;

    const compile = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        throw new Error(String(gl.getShaderInfoLog(s)));
      }
      return s;
    };

    const program = gl.createProgram()!;
    gl.attachShader(program, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(program, compile(gl.FRAGMENT_SHADER, fs));
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
      throw new Error(String(gl.getProgramInfoLog(program)));
    }

    const buf = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    gl.useProgram(program);
    const loc = gl.getAttribLocation(program, "aPos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    gl.clearColor(0, 0, 0, 0);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    return program;
  }

  private loadImage(url: string) {
    const img = new Image();
    img.onload = () => {
      if (this.destroyed) return;
      const gl = this.gl;
      const displayW = Math.round(
        Math.min(220, this.canvas.parentElement?.clientWidth
          ? this.canvas.parentElement.clientWidth * 0.55
          : 220),
      );
      const imageH = Math.round(displayW * (img.naturalHeight / img.naturalWidth));
      // Canvas mais alto; imagem fica no centro (letterbox transparente)
      const displayH = Math.round(imageH * this.canvasHeightScale);
      const pad = (displayH - imageH) / 2;
      // WebGL y=0 = embaixo → borda inferior da imagem
      this.imageY0 = pad / displayH;
      this.imageY1 = (pad + imageH) / displayH;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      this.canvas.width = displayW * dpr;
      this.canvas.height = displayH * dpr;
      this.canvas.style.width = `${displayW}px`;
      this.canvas.style.height = `${displayH}px`;
      gl.viewport(0, 0, this.canvas.width, this.canvas.height);

      gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
      gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
      this.imageLoaded = true;
    };
    img.src = url;
  }

  private bindPointer() {
    // Listener no próprio canvas — posição 1:1 com o efeito
    this.canvas.style.pointerEvents = "auto";
    this.canvas.addEventListener("pointermove", this.onMove);
    this.canvas.addEventListener("pointerleave", this.onLeave);
  }

  private onMove = (e: PointerEvent) => {
    // Coordenadas só em relação ao canvas da logo (evita offset “efeito acima do mouse”)
    const rect = this.canvas.getBoundingClientRect();
    const x = (e.clientX - rect.left) / Math.max(1, rect.width);
    const y = (e.clientY - rect.top) / Math.max(1, rect.height);

    this.mouse.x = clamp(x, 0, 1);
    this.mouse.y = clamp(y, 0, 1);
    this.mouse.vX = this.mouse.x - this.mouse.prevX;
    this.mouse.vY = this.mouse.y - this.mouse.prevY;
    this.mouse.prevX = this.mouse.x;
    this.mouse.prevY = this.mouse.y;
  };

  private onLeave = () => {
    this.mouse.vX = 0;
    this.mouse.vY = 0;
  };

  private updateDataTexture() {
    const data = this.data;
    const size = this.size;

    for (let i = 0; i < data.length; i += 4) {
      data[i] *= this.relaxation;
      data[i + 1] *= this.relaxation;
    }

    const gridMouseX = size * this.mouse.x;
    // Espelha o Y de propósito: mouse CSS → célula oposta no grid WebGL
    const gridMouseY = size * this.mouse.y;
    const maxDist = size * this.mouseRadius;
    const maxDistSq = maxDist * maxDist;
    const aspect = this.canvas.height / Math.max(1, this.canvas.width);

    for (let i = 0; i < size; i++) {
      for (let j = 0; j < size; j++) {
        const distance = ((gridMouseX - i) ** 2) / aspect + (gridMouseY - j) ** 2;
        if (distance >= maxDistSq) continue;

        const index = 4 * (i + size * j);
        let power = maxDist / Math.sqrt(Math.max(distance, 0.0001));
        power = clamp(power, 0, 10);

        data[index] += this.strength * 80 * this.mouse.vX * power;
        // Invertido no Y: puxão acompanha o mouse de baixo↔cima
        data[index + 1] -= this.strength * 80 * this.mouse.vY * power;
      }
    }

    this.mouse.vX *= 0.9;
    this.mouse.vY *= 0.9;

    const gl = this.gl;
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      this.size,
      this.size,
      0,
      gl.RGBA,
      gl.FLOAT,
      this.data,
    );
  }

  private loop = () => {
    if (this.destroyed) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.imageLoaded) return;

    this.updateDataTexture();

    const gl = this.gl;
    gl.viewport(0, 0, this.canvas.width, this.canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.useProgram(this.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.imageTexture);
    gl.uniform1i(this.uTexLoc, 0);

    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, this.dataTexture);
    gl.uniform1i(this.uDataLoc, 1);

    gl.uniform1f(this.uOffsetScaleLoc, this.offsetScale);
    gl.uniform1f(this.uImageY0Loc, this.imageY0);
    gl.uniform1f(this.uImageY1Loc, this.imageY1);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  };

  destroy() {
    this.destroyed = true;
    cancelAnimationFrame(this.raf);
    const parent = this.canvas;
    parent.removeEventListener("pointermove", this.onMove);
    parent.removeEventListener("pointerleave", this.onLeave);
    this.canvas.style.pointerEvents = "none";
  }
}
