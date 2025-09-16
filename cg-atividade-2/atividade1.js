const canvas = document.getElementById('glCanvasAtividade1');
const gl = canvas.getContext('webgl');

if (!gl) {
    throw new Error('WebGL não suportado neste navegador');
}

// Definir código do Vertex Shader (processa vértices)
const vertexShaderSource = `
    attribute vec4 a_position;
    uniform float u_pointSize;
    void main() {
        gl_Position = a_position;
        gl_PointSize = u_pointSize;
    }
`;

// Definir código do Fragment Shader (processa pixels)
const fragmentShaderSource = `
    precision mediump float;
    uniform vec3 u_color;
    void main() {
        gl_FragColor = vec4(u_color, 1.0);
    }
`;

function main() {

    function compileShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Erro ao compilar shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            return null;
        }
        return shader;
    }

    function mouseClick(event){
        console.log(event.offsetX,event.offsetY);
        let x = (2/canvas.width * event.offsetX) - 1;
        let y = (-2/canvas.height * event.offsetY) + 1;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([x,y]), gl.STATIC_DRAW);
        drawPoints();
    }

    function drawPoints(){
        gl.clear(gl.COLOR_BUFFER_BIT);
        gl.drawArrays(gl.POINTS, 0, 1);
    }

    function keyDown(event){
        switch(event.key){
        case 'c':
            colorVector = [Math.random(),Math.random(),Math.random()];
            gl.uniform3fv(colorUniformLocation, colorVector);
            break;
        case 'ArrowUp':
            pointSize += 5.0;
            gl.uniform1f(pointSizeUniformLocation, pointSize);
            break;
        case 'ArrowDown':
            if (pointSize > 5.0) {
                pointSize -= 5.0;
                gl.uniform1f(pointSizeUniformLocation, pointSize);
            }
            break;
        }
        drawPoints();
    }

    const bodyElement = document.querySelector("body");
    canvas.addEventListener("mousedown",mouseClick,false);
    bodyElement.addEventListener("keydown", keyDown, false);

    // Compilar cada shader individualmente
    const vertexShader = compileShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
    const fragmentShader = compileShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

    //3. Criação e Vinculação do Programa

    // Criar programa que combina os dois shaders
    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);

    gl.useProgram(program);

    // Verificar se a vinculação foi bem-sucedida
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Erro ao vincular programa:', gl.getProgramInfoLog(program));
    }

    let pointSize = 5.0;

    const colorUniformLocation = gl.getUniformLocation(program, 'u_color');
    const pointSizeUniformLocation = gl.getUniformLocation(program, 'u_pointSize');
    gl.uniform1f(pointSizeUniformLocation, pointSize);

    //4. Definição e Upload dos Dados de Vértices

    const vertices = [0, 0];
    let colorVector = [1, 0, 0];

    // Criar buffer e enviar dados para GPU
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

    //5. Configuração dos Atributos
    const positionLocation = gl.getAttribLocation(program, 'a_position');

    // Configurar como os dados serão lidos do buffer
    gl.enableVertexAttribArray(positionLocation);
    gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

    //6. Configuração do Pipeline de Renderização
    // Definir área de visualização (viewport)
    gl.viewport(0, 0, canvas.width, canvas.height);

    // Definir cor de fundo
    gl.clearColor(0.0, 0.0, 0.0, 1.0); // Preto
    // Limpar o buffer de cor
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.uniform3fv(colorUniformLocation, colorVector);

    drawPoints();
}

main();