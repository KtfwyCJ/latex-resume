import { useEffect, useRef } from 'react';

const VERT = `attribute vec2 a_pos;void main(){gl_Position=vec4(a_pos,0.,1.);}`;

const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2 u_res;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}

float noise(vec2 p){
  vec2 i=floor(p),f=fract(p),u=f*f*(3.-2.*f);
  return mix(mix(hash(i),hash(i+vec2(1.,0.)),u.x),
             mix(hash(i+vec2(0.,1.)),hash(i+vec2(1.,1.)),u.x),u.y);
}

float fbm(vec2 p){
  float v=0.;float a=.5;
  vec2 s=vec2(100.);
  mat2 r=mat2(.8,.6,-.6,.8);
  for(int i=0;i<5;i++){v+=a*noise(p);p=r*p*2.+s;a*=.5;}
  return v;
}

void main(){
  vec2 uv=gl_FragCoord.xy/u_res;
  float t=u_time*.12;
  vec2 q=vec2(fbm(uv+t*.4),fbm(uv+vec2(1.)));
  vec2 r=vec2(
    fbm(uv+q+vec2(1.7,9.2)+t*.15),
    fbm(uv+q+vec2(8.3,2.8)+t*.13)
  );
  float f=fbm(uv+r);
  vec3 col=mix(vec3(.05,.02,.01),vec3(.45,.25,.08),clamp(f*f*2.5,0.,1.));
  col=mix(col,vec3(.55,.32,.1),clamp(length(q)*.4,0.,1.));
  float alpha=clamp(f*.3,0.,.25);
  gl_FragColor=vec4(col,alpha);
}
`;

interface Props {
  speed?: number;
}

export default function FluidCanvas({ speed = 1 }: Props) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const gl = canvas.getContext('webgl', { alpha: true });
    if (!gl) return;

    const mkShader = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      return s;
    };

    const vert = mkShader(gl.VERTEX_SHADER, VERT);
    const frag = mkShader(gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([-1,-1, 1,-1, -1,1, -1,1, 1,-1, 1,1]),
      gl.STATIC_DRAW,
    );
    const posLoc = gl.getAttribLocation(prog, 'a_pos');
    gl.enableVertexAttribArray(posLoc);
    gl.vertexAttribPointer(posLoc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, 'u_time');
    const uRes  = gl.getUniformLocation(prog, 'u_res');
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

    let rafId = 0;
    const t0 = performance.now();

    const resize = () => {
      const w = Math.floor(canvas.offsetWidth  * 0.5);
      const h = Math.floor(canvas.offsetHeight * 0.5);
      if (w === 0 || h === 0) return;
      canvas.width  = w;
      canvas.height = h;
      gl.viewport(0, 0, w, h);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();

    const draw = (now: number) => {
      const t = ((now - t0) / 1000) * speed;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.uniform1f(uTime, t);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);
      rafId = requestAnimationFrame(draw);
    };
    rafId = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafId);
      ro.disconnect();
      gl.deleteShader(vert);
      gl.deleteShader(frag);
      gl.deleteProgram(prog);
      gl.deleteBuffer(buf);
    };
  }, [speed]);

  return (
    <canvas
      ref={ref}
      aria-hidden
      className="absolute inset-0 w-full h-full pointer-events-none"
    />
  );
}
