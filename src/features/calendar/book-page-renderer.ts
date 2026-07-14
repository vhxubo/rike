import {
  BOOK_PAGE_FRAGMENT_SHADER,
  BOOK_PAGE_VERTEX_SHADER,
} from '@/features/calendar/book-page-shaders'

interface RendererOptions {
  columns?: number
  onContextLost?: () => void
  rows?: number
}

function compileShader(gl: WebGLRenderingContext, type: number, source: string) {
  const shader = gl.createShader(type)
  if (!shader) throw new Error('Unable to allocate WebGL shader')
  gl.shaderSource(shader, source)
  gl.compileShader(shader)
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const message = gl.getShaderInfoLog(shader) ?? 'Unknown shader compilation error'
    gl.deleteShader(shader)
    throw new Error(message)
  }
  return shader
}

function createProgram(gl: WebGLRenderingContext) {
  const vertex = compileShader(gl, gl.VERTEX_SHADER, BOOK_PAGE_VERTEX_SHADER)
  const fragment = compileShader(gl, gl.FRAGMENT_SHADER, BOOK_PAGE_FRAGMENT_SHADER)
  const program = gl.createProgram()
  if (!program) throw new Error('Unable to allocate WebGL program')
  gl.attachShader(program, vertex)
  gl.attachShader(program, fragment)
  gl.linkProgram(program)
  gl.deleteShader(vertex)
  gl.deleteShader(fragment)
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const message = gl.getProgramInfoLog(program) ?? 'Unknown WebGL link error'
    gl.deleteProgram(program)
    throw new Error(message)
  }
  return program
}

function buildMesh(columns: number, rows: number) {
  const vertices: number[] = []
  const indices: number[] = []

  for (let row = 0; row <= rows; row += 1) {
    for (let column = 0; column <= columns; column += 1) {
      vertices.push(column / columns, row / rows)
    }
  }

  for (let row = 0; row < rows; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      const topLeft = row * (columns + 1) + column
      const topRight = topLeft + 1
      const bottomLeft = topLeft + columns + 1
      const bottomRight = bottomLeft + 1
      indices.push(topLeft, bottomLeft, topRight, topRight, bottomLeft, bottomRight)
    }
  }

  return {
    vertices: new Float32Array(vertices),
    indices: new Uint16Array(indices),
  }
}

function uniform(gl: WebGLRenderingContext, program: WebGLProgram, name: string) {
  const location = gl.getUniformLocation(program, name)
  if (!location) throw new Error(`Missing WebGL uniform: ${name}`)
  return location
}

export class BookPageRenderer {
  private readonly canvas: HTMLCanvasElement
  private readonly gl: WebGLRenderingContext
  private readonly program: WebGLProgram
  private readonly vertexBuffer: WebGLBuffer
  private readonly indexBuffer: WebGLBuffer
  private readonly texture: WebGLTexture
  private readonly indexCount: number
  private readonly onContextLost?: () => void
  private lost = false

  constructor(canvas: HTMLCanvasElement, options: RendererOptions = {}) {
    this.canvas = canvas
    const gl = canvas.getContext('webgl', {
      alpha: true,
      antialias: true,
      premultipliedAlpha: true,
      preserveDrawingBuffer: false,
    })
    if (!gl) throw new Error('WebGL is unavailable')
    this.gl = gl
    this.onContextLost = options.onContextLost
    this.program = createProgram(gl)

    const mesh = buildMesh(options.columns ?? 32, options.rows ?? 20)
    const vertexBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()
    const texture = gl.createTexture()
    if (!vertexBuffer || !indexBuffer || !texture) throw new Error('Unable to allocate WebGL resources')
    this.vertexBuffer = vertexBuffer
    this.indexBuffer = indexBuffer
    this.texture = texture
    this.indexCount = mesh.indices.length

    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, mesh.vertices, gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW)

    gl.useProgram(this.program)
    const position = gl.getAttribLocation(this.program, 'a_position')
    gl.enableVertexAttribArray(position)
    gl.vertexAttribPointer(position, 2, gl.FLOAT, false, 0, 0)

    gl.bindTexture(gl.TEXTURE_2D, texture)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE)
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1)

    gl.enable(gl.BLEND)
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA)
    gl.enable(gl.DEPTH_TEST)
    gl.depthFunc(gl.LEQUAL)

    canvas.addEventListener('webglcontextlost', this.handleContextLost)
  }

  private readonly handleContextLost = (event: Event) => {
    event.preventDefault()
    this.lost = true
    this.onContextLost?.()
  }

  resize(pageWidth: number, pageHeight: number) {
    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    this.canvas.width = Math.max(1, Math.round(pageWidth * 2 * dpr))
    this.canvas.height = Math.max(1, Math.round(pageHeight * dpr))
    this.canvas.style.left = `${-pageWidth}px`
    this.canvas.style.width = `${pageWidth * 2}px`
    this.canvas.style.height = `${pageHeight}px`
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height)
  }

  setTexture(source: HTMLCanvasElement) {
    const gl = this.gl
    gl.bindTexture(gl.TEXTURE_2D, this.texture)
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source)
  }

  render(progress: number, reverse: boolean, pointerY: number, cornerY: 0 | 1) {
    if (this.lost) throw new Error('WebGL context was lost')
    const gl = this.gl
    gl.clearColor(0, 0, 0, 0)
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT)
    gl.useProgram(this.program)
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vertexBuffer)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer)
    gl.bindTexture(gl.TEXTURE_2D, this.texture)

    gl.uniform1f(uniform(gl, this.program, 'u_progress'), progress)
    gl.uniform1f(uniform(gl, this.program, 'u_reverse'), reverse ? 1 : 0)
    gl.uniform1f(uniform(gl, this.program, 'u_pointer_y'), pointerY)
    gl.uniform1f(uniform(gl, this.program, 'u_corner_y'), cornerY)

    const dark = document.documentElement.dataset.theme === 'dark'
    const paperColor = dark ? [0.153, 0.157, 0.141] : [1, 0.992, 0.969]
    const shadowColor = dark ? [0.02, 0.02, 0.018] : [0.125, 0.137, 0.122]
    gl.uniform3f(
      uniform(gl, this.program, 'u_paper_color'),
      paperColor[0],
      paperColor[1],
      paperColor[2],
    )
    gl.uniform3f(
      uniform(gl, this.program, 'u_shadow_color'),
      shadowColor[0],
      shadowColor[1],
      shadowColor[2],
    )

    const intensity = Math.sin(Math.max(0, Math.min(1, progress)) * Math.PI)
    gl.uniform1f(uniform(gl, this.program, 'u_shadow_pass'), 1)
    gl.uniform1f(uniform(gl, this.program, 'u_shadow_alpha'), intensity * 0.055)
    for (const offset of [-0.018, -0.009, 0, 0.009, 0.018]) {
      gl.uniform2f(uniform(gl, this.program, 'u_shadow_offset'), offset, Math.abs(offset) * 0.35)
      gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0)
    }

    gl.clear(gl.DEPTH_BUFFER_BIT)
    gl.uniform1f(uniform(gl, this.program, 'u_shadow_pass'), 0)
    gl.uniform1f(uniform(gl, this.program, 'u_shadow_alpha'), 0)
    gl.uniform2f(uniform(gl, this.program, 'u_shadow_offset'), 0, 0)
    gl.drawElements(gl.TRIANGLES, this.indexCount, gl.UNSIGNED_SHORT, 0)
  }

  dispose() {
    const gl = this.gl
    this.canvas.removeEventListener('webglcontextlost', this.handleContextLost)
    gl.deleteTexture(this.texture)
    gl.deleteBuffer(this.vertexBuffer)
    gl.deleteBuffer(this.indexBuffer)
    gl.deleteProgram(this.program)
  }
}
