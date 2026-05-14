import { useRef, useMemo } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

const vertexShader = `varying vec2 vUv;void main(){vUv=uv;gl_Position=vec4(position,1.0);}`;

const fragmentShader = `
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

#define PI 3.14159265
#define TAU 6.28318530

/* ──────────── NOISE ──────────── */
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}

float noise(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),
    mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),
    mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}

float fbm(vec3 p){
  float v=0.0,a=0.5;
  for(int i=0;i<6;i++){v+=a*noise(p);p=p*2.03+0.31;a*=0.48;}
  return v;
}

float noise2D(vec2 p){return noise(vec3(p,0.0));}

/* ──────────── ROOM GEOMETRY ──────────── */
#define FY 0.0
#define CY 9.0
#define WL -14.0
#define WR 14.0
#define WB -20.0
#define WF 14.0

/* Soft center light panel */
const vec3 LC=vec3(0.0,4.5,-19.9);
const vec2 LS=vec2(6.0,4.5);
const vec3 LCOL=vec3(0.55,0.78,0.95);

float lightMask(vec3 p){
  float dx=abs(p.x-LC.x)/LS.x;
  float dy=abs(p.y-LC.y)/LS.y;
  float m=max(dx,dy);
  return smoothstep(1.0,0.5,m);
}

float iPlane(vec3 ro,vec3 rd,float v,int a){
  float t=a==0?(v-ro.x)/rd.x:a==1?(v-ro.y)/rd.y:(v-ro.z)/rd.z;
  return t>0.001?t:1e10;
}

/* ──────────── WALL DETAIL ──────────── */
vec3 wallNormal(vec3 baseN, vec2 uv){
  float ridge=cos(fract(uv.y*2.4)*TAU)*0.12;
  float seamH=smoothstep(0.012,0.0,abs(fract(uv.y*0.3)-0.5)*2.0-0.97);
  float seamV=smoothstep(0.012,0.0,abs(fract(uv.x*0.11)-0.5)*2.0-0.97);
  float seam=max(seamH,seamV);
  vec3 n=baseN;
  if(abs(baseN.x)>0.5) n.y+=ridge*(1.0-seam);
  else if(abs(baseN.z)>0.5) n.y+=ridge*(1.0-seam);
  return normalize(n);
}

float wallShade(vec2 uv){
  float seamH=smoothstep(0.012,0.0,abs(fract(uv.y*0.3)-0.5)*2.0-0.97);
  float seamV=smoothstep(0.012,0.0,abs(fract(uv.x*0.11)-0.5)*2.0-0.97);
  float pan=(1.0-seamH*0.6)*(1.0-seamV*0.6);
  float v=hash(floor(uv*vec2(0.11,0.3)))*0.25;
  return pan*(0.75+v);
}

/* Cables on left wall */
float cables(vec3 p,vec3 n){
  if(n.x<0.5||p.z>-4.0)return 0.0;
  float c=0.0;
  for(int i=0;i<5;i++){
    float cy=6.2+float(i)*0.32;
    c=max(c,smoothstep(0.04,0.01,abs(p.y-cy)));
  }
  return c;
}

/* ──────────── GRID LINES ──────────── */
float gridLines(vec2 p, float spacing, float thickness){
  vec2 g=abs(fract(p/spacing)-0.5)*2.0;
  float lx=smoothstep(thickness,0.0,1.0-g.x);
  float ly=smoothstep(thickness,0.0,1.0-g.y);
  return max(lx,ly);
}

/* ──────────── SCANLINES ──────────── */
float scanlines(vec2 uv, float t){
  float line=smoothstep(0.0,0.02,abs(sin(uv.y*uResolution.y*0.5+t*2.0))-0.97);
  float sweep=smoothstep(0.0,0.06,abs(fract(uv.y-t*0.03)-0.5)*2.0-0.94);
  return line*0.04+sweep*0.06;
}

/* ──────────── LIGHT STREAKS ──────────── */
float lightStreaks(vec2 uv, float t){
  float s=0.0;
  for(int i=0;i<4;i++){
    float fi=float(i);
    float x=sin(fi*1.7+t*0.08)*0.3+0.5;
    float d=abs(uv.x-x);
    float streak=smoothstep(0.015,0.0,d)*0.08;
    streak*=smoothstep(0.0,0.3,uv.y)*smoothstep(1.0,0.6,uv.y);
    float drift=sin(uv.y*8.0+t*0.3+fi)*0.003;
    streak*=(1.0+drift);
    s+=streak;
  }
  return s;
}

/* ──────────── ENERGY WAVES ──────────── */
float energyWaves(vec2 uv, float t){
  vec2 c=uv-vec2(0.5,0.45);
  float r=length(c);
  float wave=0.0;
  for(int i=0;i<3;i++){
    float fi=float(i);
    float phase=r*12.0-t*(0.4+fi*0.15)+fi*2.0;
    float w=sin(phase)*0.5+0.5;
    w=pow(w,8.0);
    w*=smoothstep(0.6,0.1,r);
    wave+=w*0.03;
  }
  return wave;
}

/* ──────────── RIPPLE DISTORTION ──────────── */
vec2 ripple(vec2 uv, float t){
  vec2 c=uv-vec2(0.5,0.45);
  float r=length(c);
  float angle=atan(c.y,c.x);
  float wave=sin(r*20.0-t*0.8)*0.002*smoothstep(0.5,0.0,r);
  float wave2=sin(r*14.0-t*0.5+1.5)*0.001*smoothstep(0.4,0.0,r);
  return uv+normalize(c+0.001)*(wave+wave2);
}

/* ──────────── AMBIENT OCCLUSION ──────────── */
float edgeAO(vec3 p){
  float ao=1.0;
  ao*=smoothstep(0.0,2.0,p.y);
  ao*=smoothstep(0.0,2.0,CY-p.y);
  ao*=smoothstep(0.0,2.5,p.x-WL);
  ao*=smoothstep(0.0,2.5,WR-p.x);
  return 0.25+0.75*ao;
}

/* ──────────── ROOM TRACER ──────────── */
vec2 traceRoom(vec3 ro,vec3 rd){
  float tMin=1e10;float sType=0.0;vec3 p;
  float tf=iPlane(ro,rd,FY,1);p=ro+rd*tf;
  if(tf<tMin&&p.x>WL&&p.x<WR&&p.z>WB&&p.z<WF){tMin=tf;sType=1.0;}
  float tc=iPlane(ro,rd,CY,1);p=ro+rd*tc;
  if(tc<tMin&&p.x>WL&&p.x<WR&&p.z>WB&&p.z<WF){tMin=tc;sType=3.0;}
  float tl=iPlane(ro,rd,WL,0);p=ro+rd*tl;
  if(tl<tMin&&p.y>FY&&p.y<CY&&p.z>WB&&p.z<WF){tMin=tl;sType=2.0;}
  float tr=iPlane(ro,rd,WR,0);p=ro+rd*tr;
  if(tr<tMin&&p.y>FY&&p.y<CY&&p.z>WB&&p.z<WF){tMin=tr;sType=2.0;}
  float tb=iPlane(ro,rd,WB,2);p=ro+rd*tb;
  if(tb<tMin&&p.x>WL&&p.x<WR&&p.y>FY&&p.y<CY){
    tMin=tb;sType=lightMask(p)>0.01?4.0:2.0;
  }
  return vec2(tMin,sType);
}

vec3 getN(vec3 p){
  if(abs(p.y-FY)<0.02)return vec3(0,1,0);
  if(abs(p.y-CY)<0.02)return vec3(0,-1,0);
  if(abs(p.x-WL)<0.02)return vec3(1,0,0);
  if(abs(p.x-WR)<0.02)return vec3(-1,0,0);
  return vec3(0,0,1);
}

/* ──────────── WALL SHADING ──────────── */
vec3 shadeWall(vec3 p,vec3 rawN){
  vec2 uv=abs(rawN.x)>0.5?p.zy:abs(rawN.y)>0.5?p.xz:p.xy;
  vec3 n=wallNormal(rawN,uv);
  float shade=wallShade(uv);
  float cb=cables(p,rawN);
  float base=mix(0.028,0.055,shade);
  base=mix(base,0.015,cb);
  base+=fbm(vec3(uv*6.0,0.0))*0.012;
  /* Grid overlay on walls */
  float g=gridLines(uv,2.0,0.985)*0.015;
  base+=g;
  vec3 toL=LC-p;float d=length(toL);
  float att=1.0/(1.0+d*d*0.004);
  float diff=max(dot(n,normalize(toL)),0.0);
  vec3 vDir=normalize(vec3(0,3.5,8)-p);
  vec3 hDir=normalize(normalize(toL)+vDir);
  float spec=pow(max(dot(n,hDir),0.0),40.0)*0.12;
  float ao=edgeAO(p);
  return vec3(base)*ao+LCOL*(diff*att*0.28+spec*att)*ao;
}

/* ──────────── ACES TONEMAP ──────────── */
vec3 aces(vec3 x){
  float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);
}

/* ══════════════════ MAIN ══════════════════ */
void main(){
  float t=uTime;

  /* Apply ripple distortion to UV */
  vec2 uv0=ripple(vUv,t);
  vec2 uv=(uv0-0.5)*2.0;
  uv.x*=uResolution.x/uResolution.y;

  /* ── Camera with smooth parallax ── */
  vec3 ro=vec3(uMouse.x*2.8, 3.5+uMouse.y*0.9, 8.0);
  vec3 ta=vec3(0.0,3.5,-6.0);
  vec3 fwd=normalize(ta-ro);
  vec3 rgt=normalize(cross(vec3(0,1,0),fwd));
  vec3 up=cross(fwd,rgt);
  vec3 rd=normalize(fwd+uv.x*rgt*0.6+uv.y*up*0.6);

  /* ── Primary trace ── */
  vec2 hit=traceRoom(ro,rd);
  float tHit=hit.x;float st=hit.y;
  vec3 hp=ro+rd*tHit;
  vec3 hn=getN(hp);
  vec3 color=vec3(0.0);

  if(st>0.5&&st<1.5){
    /* ═══ FLOOR — polished reflective with grid ═══ */
    vec3 toL=LC-hp;float d=length(toL);
    float att=1.0/(1.0+d*d*0.003);
    float diff=max(dot(hn,normalize(toL)),0.0);
    color=vec3(0.008,0.012,0.018)+LCOL*diff*att*0.14;

    /* Floor grid */
    float fg=gridLines(hp.xz,3.0,0.992)*0.02;
    color+=vec3(0.2,0.6,0.8)*fg*att*0.5;

    /* Blurred reflection */
    float rough=0.05;
    vec3 jN=normalize(hn+rough*vec3(noise(hp*12.0)-0.5,0.0,noise(hp*12.0+5.0)-0.5));
    vec3 reflD=reflect(rd,jN);
    vec2 rh=traceRoom(hp+hn*0.02,reflD);
    vec3 rp=hp+reflD*rh.x;
    vec3 reflCol=vec3(0.0);
    if(rh.y>3.5){
      float lm=lightMask(rp);
      float warp=fbm(vec3((rp.xy-LC.xy)/LS*2.0+t*0.12,t*0.08));
      reflCol=LCOL*lm*(1.0+warp*0.4)*1.5;
    } else if(rh.y>0.5){
      reflCol=shadeWall(rp,getN(rp));
    }
    float fresnel=pow(1.0-max(dot(hn,-rd),0.0),4.0);
    fresnel=0.1+0.9*fresnel;
    float rfade=exp(-rh.x*0.035);
    color+=reflCol*fresnel*rfade;
    color*=fbm(vec3(hp.x*1.2,0.0,hp.z*1.2))*0.4+0.7;
    float flAO=smoothstep(0.0,3.5,hp.x-WL)*smoothstep(0.0,3.5,WR-hp.x)*smoothstep(0.0,2.5,hp.z-WB);
    color*=0.35+0.65*flAO;

  } else if(st>1.5&&st<2.5){
    color=shadeWall(hp,hn);
  } else if(st>2.5&&st<3.5){
    color=shadeWall(hp,hn);
  } else if(st>3.5){
    /* ═══ LIGHT PANEL — organic flowing energy ═══ */
    float lm=lightMask(hp);
    vec2 luv=(hp.xy-LC.xy)/LS;

    /* Animated energy pattern using domain warping */
    float t1=t*0.12;
    vec3 q=vec3(luv*2.5,t1);
    float f1=fbm(q);
    float f2=fbm(q+vec3(f1*1.2,f1*0.8,t1*0.5));
    float pattern=fbm(q+vec3(f2*1.5,f2,t1*0.3));

    vec3 lightCol=mix(LCOL,vec3(0.4,0.85,1.0),pattern*0.3);
    color=lightCol*lm*(0.9+pattern*0.6)*1.6;

    /* Bloom halo */
    float edge=max(abs(hp.x-LC.x)/LS.x,abs(hp.y-LC.y)/LS.y);
    color+=LCOL*smoothstep(1.5,0.3,edge)*0.2;
  }

  /* ═══ 64-STEP VOLUMETRIC FOG ═══ */
  float fog=0.0;
  float maxT=min(tHit,42.0);
  float sl=maxT/64.0;
  for(int i=0;i<64;i++){
    float ft=sl*(float(i)+0.5);
    vec3 fp=ro+rd*ft;
    if(fp.x>WL&&fp.x<WR&&fp.y>FY&&fp.y<CY&&fp.z>WB&&fp.z<WF){
      vec3 toL=LC-fp;float fd=length(toL);
      float fatt=1.0/(1.0+fd*fd*0.008);
      float dirBias=0.5+0.5*max(dot(normalize(toL),vec3(0,0,1)),0.0);
      float density=0.009+noise(fp*0.22+t*0.008)*0.005;
      fog+=density*fatt*dirBias*sl;
    }
  }
  color+=LCOL*fog*2.8;

  /* Distance fog */
  color=mix(color,vec3(0.01,0.016,0.024),1.0-exp(-tHit*0.018));

  /* ═══ OVERLAY EFFECTS ═══ */

  /* Energy waves */
  color+=LCOL*energyWaves(vUv,t);

  /* Light streaks */
  color+=LCOL*lightStreaks(vUv,t);

  /* Scanlines */
  color+=vec3(0.15,0.4,0.55)*scanlines(vUv,t);

  /* ═══ POST-PROCESSING ═══ */

  /* Heavy vignette */
  float vig=1.0-dot(vUv-0.5,vUv-0.5)*2.2;
  color*=clamp(vig,0.0,1.0);

  /* ACES tonemap */
  color=aces(color*1.3);

  /* Film grain / noise texture */
  float grain=(hash(vUv*1200.0+fract(t*0.7))-0.5)*0.025;
  color+=grain;

  gl_FragColor=vec4(max(color,0.0),1.0);
}
`;

/* ──────────── Lightweight mobile shader ──────────── */
const fragmentShaderMobile = `
precision mediump float;
varying vec2 vUv;
uniform float uTime;
uniform vec2 uMouse;
uniform vec2 uResolution;

#define PI 3.14159265
#define TAU 6.28318530

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float h3(vec3 p){return fract(sin(dot(p,vec3(127.1,311.7,74.7)))*43758.5453);}

float noise(vec3 p){
  vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(mix(h3(i),h3(i+vec3(1,0,0)),f.x),
    mix(h3(i+vec3(0,1,0)),h3(i+vec3(1,1,0)),f.x),f.y),
    mix(mix(h3(i+vec3(0,0,1)),h3(i+vec3(1,0,1)),f.x),
    mix(h3(i+vec3(0,1,1)),h3(i+vec3(1,1,1)),f.x),f.y),f.z);
}

float fbm(vec3 p){
  float v=0.0,a=0.5;
  for(int i=0;i<3;i++){v+=a*noise(p);p=p*2.03+0.31;a*=0.48;}
  return v;
}

#define FY 0.0
#define CY 9.0
#define WL -14.0
#define WR 14.0
#define WB -20.0
#define WF 14.0

const vec3 LC=vec3(0.0,4.5,-19.9);
const vec2 LS=vec2(6.0,4.5);
const vec3 LCOL=vec3(0.55,0.78,0.95);

float lightMask(vec3 p){
  float dx=abs(p.x-LC.x)/LS.x;
  float dy=abs(p.y-LC.y)/LS.y;
  float m=max(dx,dy);
  return smoothstep(1.0,0.5,m);
}

float iPlane(vec3 ro,vec3 rd,float v,int a){
  float t=a==0?(v-ro.x)/rd.x:a==1?(v-ro.y)/rd.y:(v-ro.z)/rd.z;
  return t>0.001?t:1e10;
}

float edgeAO(vec3 p){
  float ao=1.0;
  ao*=smoothstep(0.0,2.0,p.y);
  ao*=smoothstep(0.0,2.0,CY-p.y);
  ao*=smoothstep(0.0,2.5,p.x-WL);
  ao*=smoothstep(0.0,2.5,WR-p.x);
  return 0.25+0.75*ao;
}

vec2 traceRoom(vec3 ro,vec3 rd){
  float tMin=1e10;float sType=0.0;vec3 p;
  float tf=iPlane(ro,rd,FY,1);p=ro+rd*tf;
  if(tf<tMin&&p.x>WL&&p.x<WR&&p.z>WB&&p.z<WF){tMin=tf;sType=1.0;}
  float tc=iPlane(ro,rd,CY,1);p=ro+rd*tc;
  if(tc<tMin&&p.x>WL&&p.x<WR&&p.z>WB&&p.z<WF){tMin=tc;sType=3.0;}
  float tl=iPlane(ro,rd,WL,0);p=ro+rd*tl;
  if(tl<tMin&&p.y>FY&&p.y<CY&&p.z>WB&&p.z<WF){tMin=tl;sType=2.0;}
  float tr=iPlane(ro,rd,WR,0);p=ro+rd*tr;
  if(tr<tMin&&p.y>FY&&p.y<CY&&p.z>WB&&p.z<WF){tMin=tr;sType=2.0;}
  float tb=iPlane(ro,rd,WB,2);p=ro+rd*tb;
  if(tb<tMin&&p.x>WL&&p.x<WR&&p.y>FY&&p.y<CY){
    tMin=tb;sType=lightMask(p)>0.01?4.0:2.0;
  }
  return vec2(tMin,sType);
}

vec3 getN(vec3 p){
  if(abs(p.y-FY)<0.02)return vec3(0,1,0);
  if(abs(p.y-CY)<0.02)return vec3(0,-1,0);
  if(abs(p.x-WL)<0.02)return vec3(1,0,0);
  if(abs(p.x-WR)<0.02)return vec3(-1,0,0);
  return vec3(0,0,1);
}

vec3 aces(vec3 x){
  float a=2.51,b=0.03,c=2.43,d=0.59,e=0.14;
  return clamp((x*(a*x+b))/(x*(c*x+d)+e),0.0,1.0);
}

void main(){
  float t=uTime;
  vec2 uv=(vUv-0.5)*2.0;
  uv.x*=uResolution.x/uResolution.y;

  vec3 ro=vec3(uMouse.x*2.8, 3.5+uMouse.y*0.9, 8.0);
  vec3 ta=vec3(0.0,3.5,-6.0);
  vec3 fwd=normalize(ta-ro);
  vec3 rgt=normalize(cross(vec3(0,1,0),fwd));
  vec3 up=cross(fwd,rgt);
  vec3 rd=normalize(fwd+uv.x*rgt*0.6+uv.y*up*0.6);

  vec2 hit=traceRoom(ro,rd);
  float tHit=hit.x;float st=hit.y;
  vec3 hp=ro+rd*tHit;
  vec3 hn=getN(hp);
  vec3 color=vec3(0.0);

  if(st>0.5&&st<1.5){
    vec3 toL=LC-hp;float d=length(toL);
    float att=1.0/(1.0+d*d*0.003);
    float diff=max(dot(hn,normalize(toL)),0.0);
    color=vec3(0.008,0.012,0.018)+LCOL*diff*att*0.14;
    float ao=edgeAO(hp);
    color*=ao;
  } else if(st>1.5&&st<3.5){
    vec3 toL=LC-hp;float d=length(toL);
    float att=1.0/(1.0+d*d*0.004);
    float diff=max(dot(hn,normalize(toL)),0.0);
    float ao=edgeAO(hp);
    color=vec3(0.035)*ao+LCOL*diff*att*0.28*ao;
  } else if(st>3.5){
    float lm=lightMask(hp);
    vec2 luv=(hp.xy-LC.xy)/LS;
    float t1=t*0.12;
    vec3 q=vec3(luv*2.5,t1);
    float pattern=fbm(q);
    vec3 lightCol=mix(LCOL,vec3(0.4,0.85,1.0),pattern*0.3);
    color=lightCol*lm*(0.9+pattern*0.6)*1.6;
  }

  /* Lightweight 16-step volumetric fog */
  float fog=0.0;
  float maxT=min(tHit,42.0);
  float sl=maxT/16.0;
  for(int i=0;i<16;i++){
    float ft=sl*(float(i)+0.5);
    vec3 fp=ro+rd*ft;
    if(fp.x>WL&&fp.x<WR&&fp.y>FY&&fp.y<CY&&fp.z>WB&&fp.z<WF){
      vec3 toL=LC-fp;float fd=length(toL);
      float fatt=1.0/(1.0+fd*fd*0.008);
      float density=0.012;
      fog+=density*fatt*sl;
    }
  }
  color+=LCOL*fog*2.8;

  color=mix(color,vec3(0.01,0.016,0.024),1.0-exp(-tHit*0.018));

  float vig=1.0-dot(vUv-0.5,vUv-0.5)*2.2;
  color*=clamp(vig,0.0,1.0);
  color=aces(color*1.3);

  float grain=(hash(vUv*800.0+fract(t*0.7))-0.5)*0.02;
  color+=grain;

  gl_FragColor=vec4(max(color,0.0),1.0);
}
`;

export default function CineshaderRoom() {
  const meshRef = useRef();
  const { size } = useThree();
  const mouseSmooth = useRef(new THREE.Vector2(0, 0));

  // Detect mobile on mount (screen width <= 768)
  const isMobile = useMemo(() => {
    return typeof window !== 'undefined' && window.innerWidth <= 768;
  }, []);

  const activeShader = isMobile ? fragmentShaderMobile : fragmentShader;

  const uniforms = useMemo(() => ({
    uTime: { value: 0 },
    uMouse: { value: new THREE.Vector2(0, 0) },
    uResolution: { value: new THREE.Vector2(size.width, size.height) },
  }), []);

  useFrame((state) => {
    if (!meshRef.current) return;
    const u = meshRef.current.material.uniforms;
    u.uTime.value = state.clock.elapsedTime;
    // Cineshader-style damped mouse parallax
    mouseSmooth.current.x += (state.mouse.x - mouseSmooth.current.x) * 0.025;
    mouseSmooth.current.y += (state.mouse.y - mouseSmooth.current.y) * 0.025;
    u.uMouse.value.set(mouseSmooth.current.x, mouseSmooth.current.y);
    u.uResolution.value.set(state.size.width, state.size.height);
  });

  return (
    <mesh ref={meshRef}>
      <planeGeometry args={[2, 2]} />
      <shaderMaterial
        vertexShader={vertexShader}
        fragmentShader={activeShader}
        uniforms={uniforms}
        depthWrite={false}
        depthTest={false}
      />
    </mesh>
  );
}
