class WebglProgram {
  constructor(gl) {
    this._gl = gl

    // 缓存program，保证一个渲染对象，一个program
    this.programWeakMap = new WeakMap()

    // 缓存program下的shader，保证一个program一个shader，用于判断shader的更新
    this.shaderWeakMap = new WeakMap()

    // 阴影的program
    this.shadowProgram = null
  }

  getProgram(meshObject, glShader) {
    let glProgram = this.programWeakMap.get(meshObject)
    if (glProgram) {
      // 有缓存program

      const cacheGlShader = this.shaderWeakMap.get(glProgram)
      if (cacheGlShader && cacheGlShader === glShader) {
        // 也缓存了shader 且shader未更新

        return glProgram
      }

      // 缓存了program 但shader更新了
      this._gl.attachShader(glProgram, glShader.vertexShader)
      this._gl.attachShader(glProgram, glShader.fragmentShader)

      this._gl.linkProgram(glProgram)

      this.shaderWeakMap.delete(glProgram)
      this.shaderWeakMap.set(glProgram, glShader)

      return glProgram
    }

    // 没有缓存的program，则新生成

    glProgram = this._createProgram(glShader)

    this.programWeakMap.set(meshObject, glProgram)
    this.shaderWeakMap.set(glProgram, glShader)

    return glProgram
  }

  getShadowProgram(glShader) {
    let glProgram = this.shadowProgram

    if (glProgram) {
      return glProgram
    }

    glProgram = this._createProgram(glShader)

    this.shadowProgram = glProgram

    return glProgram
  }

  _createProgram(glShader) {
    const glProgram = this._gl.createProgram()

    this._gl.attachShader(glProgram, glShader.vertexShader)
    this._gl.attachShader(glProgram, glShader.fragmentShader)

    this._gl.linkProgram(glProgram)

    // Check the result of linking
    const linked = this._gl.getProgramParameter(glProgram, this._gl.LINK_STATUS)
    if (!linked) {
      var error = this._gl.getProgramInfoLog(glProgram)
      console.log('Failed to link program: ' + error)
      this._gl.deleteProgram(glProgram)
      this._gl.deleteShader(glShader.vertexShader)
      this._gl.deleteShader(glShader.fragmentShader)

      return null
    }
    return glProgram
  }
}

export { WebglProgram }
