"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence, useInView } from "framer-motion";
import { type TemplateRendererProps } from "@/components/Praposal-section/template-renderer-types";

type Props = TemplateRendererProps;

/* ─── Helpers ─── */
function formatDate(v: string) {
  if (!v) return "";
  return new Date(v).toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });
}
function daysSince(d: string) {
  if (!d) return 0;
  return Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
}

/* ─── Gold sparkle burst ─── */
function spawnGold() {
  if (typeof document === "undefined") return;
  const syms = ["✦","★","◆","✧","♦","❋"], cols = ["#d4af37","#f0d060","#c8a82a","#e8c84a","#b8941a"];
  for (let i = 0; i < 38; i++) {
    const el = document.createElement("div");
    el.textContent = syms[i % syms.length];
    Object.assign(el.style, {
      position:"fixed", zIndex:"9999",
      left:`${Math.random()*100}vw`, top:"108vh",
      fontSize:`${10+Math.random()*22}px`, color:cols[i%cols.length],
      pointerEvents:"none",
      animation:`goldRise ${1.6+Math.random()*2}s ease-out forwards`,
      animationDelay:`${Math.random()}s`, opacity:"0",
    });
    document.body.appendChild(el);
    setTimeout(()=>el.remove(), 4500);
  }
}

/* ─── CSS ─── */
const CSS = `
@import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&display=swap');
@keyframes goldRise  { 0%{opacity:1;transform:translateY(0) scale(1) rotate(0deg)} 100%{opacity:0;transform:translateY(-115vh) scale(.25) rotate(32deg)} }
@keyframes namePulse { 0%,100%{text-shadow:0 0 30px rgba(212,175,55,0.15)} 50%{text-shadow:0 0 60px rgba(212,175,55,0.45)} }
::-webkit-scrollbar{width:3px}::-webkit-scrollbar-track{background:#0a0806}::-webkit-scrollbar-thumb{background:#d4af37;border-radius:2px}
html{scroll-behavior:smooth}
`;

/* ─── Color tokens ─── */
const G = {
  gold:"#d4af37", gold2:"#f0d060", black:"#0a0806",
  cream:"#fdfaf6", wine:"#8b1e3f", muted:"rgba(253,250,246,0.45)",
  card:"rgba(253,250,246,0.025)", border:"rgba(212,175,55,0.15)",
  borderH:"rgba(212,175,55,0.4)",
} as const;

/* ─── Divider ─── */
const GoldDivider = () => (
  <div style={{ width:"100%", height:1, background:"linear-gradient(90deg,transparent,rgba(212,175,55,0.12),transparent)" }} />
);

/* ─── Section header ─── */
function SectionHeader({ eyebrow, title }: { eyebrow:string; title:string }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once:true, margin:"-60px" });
  return (
    <motion.div ref={ref} initial={{opacity:0,y:20}} animate={inView?{opacity:1,y:0}:{}} transition={{duration:.8}} style={{textAlign:"center",marginBottom:56}}>
      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:5,textTransform:"uppercase",color:G.gold,marginBottom:14,opacity:.7}}>{eyebrow}</p>
      <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,4vw,38px)",fontWeight:400,color:G.cream,letterSpacing:2,marginBottom:16}}>{title}</h2>
      <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12}}>
        <div style={{width:48,height:1,background:G.gold,opacity:.3}} />
        <span style={{color:G.gold,fontSize:13,opacity:.55}}>❧</span>
        <div style={{width:48,height:1,background:G.gold,opacity:.3}} />
      </div>
    </motion.div>
  );
}

/* ─────────────────────────────────────────────
   HERO
───────────────────────────────────────────── */
function Hero({ proposal }: { proposal: Props["proposal"] }) {
  const delay = (d: number): React.CSSProperties => ({
    opacity:0, animation:`heroIn .9s ease-out ${d}s forwards`,
  });
  return (
    <section style={{minHeight:"100vh",display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",textAlign:"center",padding:"60px 24px",position:"relative",overflow:"hidden",background:`radial-gradient(ellipse 80% 60% at 50% 40%,rgba(212,175,55,0.055) 0%,transparent 70%)`}}>
      <style>{`@keyframes heroIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}`}</style>
      {/* vertical accent */}
      <div style={{position:"absolute",top:0,left:"50%",width:1,height:"100%",background:"linear-gradient(to bottom,transparent,rgba(212,175,55,0.1),transparent)",pointerEvents:"none"}} />
      {/* corners */}
      {[{top:24,left:24,borderTop:`1px solid rgba(212,175,55,.18)`,borderLeft:`1px solid rgba(212,175,55,.18)`},{top:24,right:24,borderTop:`1px solid rgba(212,175,55,.18)`,borderRight:`1px solid rgba(212,175,55,.18)`},{bottom:24,left:24,borderBottom:`1px solid rgba(212,175,55,.18)`,borderLeft:`1px solid rgba(212,175,55,.18)`},{bottom:24,right:24,borderBottom:`1px solid rgba(212,175,55,.18)`,borderRight:`1px solid rgba(212,175,55,.18)`}]
        .map((s,i)=><div key={i} style={{position:"absolute",width:36,height:36,...s}} />)}

      <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:5,textTransform:"uppercase",color:G.gold,marginBottom:28,...delay(.15)}}>A Love Story</p>

      <h1 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(36px,7vw,80px)",fontWeight:400,letterSpacing:4,color:G.cream,lineHeight:1,marginBottom:18,animation:"namePulse 5s ease-in-out infinite",...delay(.35)}}>
        {proposal.boyName}
        <span style={{color:G.gold,fontStyle:"italic",fontFamily:"'Cormorant Garamond',serif",margin:"0 18px"}}>&amp;</span>
        {proposal.girlName}
      </h1>

      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:"clamp(15px,2.5vw,21px)",fontStyle:"italic",color:G.muted,marginBottom:36,...delay(.55)}}>
        "A story written in time…"
      </p>

      <div style={{display:"flex",alignItems:"center",gap:14,marginBottom:44,...delay(.65)}}>
        <div style={{width:56,height:1,background:`linear-gradient(90deg,transparent,${G.gold})`,opacity:.35}} />
        <span style={{color:G.gold,fontSize:12,opacity:.5}}>✦</span>
        <div style={{width:56,height:1,background:`linear-gradient(90deg,${G.gold},transparent)`,opacity:.35}} />
      </div>

      <a href="#story"
        style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,textTransform:"uppercase",padding:"14px 40px",border:`1px solid rgba(212,175,55,0.4)`,color:G.cream,textDecoration:"none",display:"inline-block",transition:"all .4s",...delay(.8)}}
        onMouseEnter={e=>{const b=e.currentTarget as HTMLElement;b.style.borderColor=G.gold;b.style.color=G.gold;b.style.boxShadow="0 0 30px rgba(212,175,55,0.15)"}}
        onMouseLeave={e=>{const b=e.currentTarget as HTMLElement;b.style.borderColor="rgba(212,175,55,0.4)";b.style.color=G.cream;b.style.boxShadow="none"}}
      >
        Begin This Moment ✦
      </a>
    </section>
  );
}

/* ─────────────────────────────────────────────
   DAYS COUNTER
───────────────────────────────────────────── */
function DaysCounter({ firstMeetingDate }: { firstMeetingDate:string }) {
  const [count, setCount] = useState(0);
  const days = daysSince(firstMeetingDate);
  const ref = useRef(null);
  const inView = useInView(ref, { once:true });
  useEffect(() => {
    if (!inView || days === 0) return;
    let cur = 0;
    const step = Math.ceil(days / 60);
    const t = setInterval(() => { cur += step; if (cur >= days) { setCount(days); clearInterval(t); } else setCount(cur); }, 22);
    return () => clearInterval(t);
  }, [inView, days]);
  return (
    <div ref={ref} style={{textAlign:"center",padding:"56px 24px",border:`1px solid rgba(212,175,55,0.1)`,background:"rgba(212,175,55,0.018)",margin:"0 24px"}}>
      <div style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(52px,9vw,88px)",color:G.gold,letterSpacing:4,lineHeight:1}}>{days>0?count.toLocaleString("en-IN"):"∞"}</div>
      <div style={{fontFamily:"'Cormorant Garamond',serif",fontSize:11,letterSpacing:4,textTransform:"uppercase",color:"rgba(212,175,55,0.4)",marginTop:8}}>Days of Us</div>
      <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:G.muted,marginTop:10}}>Every single one, a gift.</p>
    </div>
  );
}

/* ─────────────────────────────────────────────
   STORY
───────────────────────────────────────────── */
function Story({ proposal }: { proposal:Props["proposal"] }) {
  const chapters = [
    { num:"I",   icon:"✦", title:"How We Met",    text:proposal.howWeMet    || "The universe conspired on an ordinary day that quietly became the most extraordinary of my life." },
    { num:"II",  icon:"♥", title:"Why I Love You", text:proposal.whyILoveYou || "Your laugh, your warmth — every imperfect, perfect piece of you." },
    { num:"III", icon:"✧", title:"Future Dreams",  text:proposal.futureDreams || "A thousand ordinary days I want to live only beside you." },
  ];
  return (
    <section id="story" style={{maxWidth:1040,margin:"0 auto",padding:"96px 24px"}}>
      <SectionHeader eyebrow="Our Journey" title="The Story So Far" />
      <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:20}}>
        {chapters.map((ch,i)=>(
          <motion.div key={ch.title}
            initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true,margin:"-40px"}} transition={{duration:.8,delay:i*.15}}
            whileHover={{y:-4}}
            style={{background:G.card,border:`1px solid ${G.border}`,padding:"32px 26px",position:"relative",overflow:"hidden",transition:"border-color .4s, box-shadow .4s",cursor:"default"}}
            onMouseEnter={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=G.borderH;el.style.boxShadow="0 8px 40px rgba(0,0,0,.4),inset 0 0 30px rgba(212,175,55,0.03)"}}
            onMouseLeave={e=>{const el=e.currentTarget as HTMLElement;el.style.borderColor=G.border;el.style.boxShadow="none"}}
          >
            <motion.div initial={{height:0}} whileHover={{height:"100%"}} transition={{duration:.5}} style={{position:"absolute",top:0,left:0,width:2,background:G.gold}} />
            <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(212,175,55,0.4)",marginBottom:16}}>{ch.num}</p>
            <div style={{fontSize:16,color:G.gold,marginBottom:14,opacity:.7}}>{ch.icon}</div>
            <h3 style={{fontFamily:"'Cinzel',serif",fontSize:13,letterSpacing:1,color:G.cream,marginBottom:12}}>{ch.title}</h3>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,lineHeight:1.85,color:G.muted,fontStyle:"italic"}}>{ch.text}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   GALLERY
───────────────────────────────────────────── */
function Gallery({ proposal }: { proposal:Props["proposal"] }) {
  const [modal, setModal] = useState<{src:string;caption:string}|null>(null);
  const gallery = proposal.gallery.filter(i=>i.image.trim()).slice(0,5);
  if (!gallery.length) return null;
  return (
    <section style={{maxWidth:1040,margin:"0 auto",padding:"0 24px 96px"}}>
      <SectionHeader eyebrow="Captured Moments" title="Fragments of Us" />
      <div style={{display:"grid",gridTemplateColumns:"2fr 1fr 1fr",gridAutoRows:180,gap:10}}>
        {gallery.map((item,idx)=>(
          <motion.div key={item.id} onClick={()=>setModal({src:item.image,caption:item.caption||""})}
            initial={{opacity:0,scale:.97}} whileInView={{opacity:1,scale:1}} viewport={{once:true}} transition={{duration:.7,delay:idx*.1}}
            style={{gridRow:idx===0?"span 2":undefined,overflow:"hidden",border:`1px solid ${G.border}`,position:"relative",cursor:"pointer"}}
          >
            <img src={item.image} alt="Memory" style={{width:"100%",height:"100%",objectFit:"cover",filter:"grayscale(15%)",transition:"transform .6s, filter .6s"}}
              onMouseEnter={e=>{const img=e.currentTarget as HTMLImageElement;img.style.transform="scale(1.05)";img.style.filter="grayscale(0)"}}
              onMouseLeave={e=>{const img=e.currentTarget as HTMLImageElement;img.style.transform="scale(1)";img.style.filter="grayscale(15%)"}}
            />
            {item.caption && (
              <div style={{position:"absolute",inset:0,background:"linear-gradient(transparent 55%,rgba(10,8,6,.88))",display:"flex",alignItems:"flex-end",padding:14,opacity:0,transition:"opacity .4s"}}
                onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="0"}
              >
                <span style={{fontFamily:"'Cormorant Garamond',serif",fontSize:12,fontStyle:"italic",color:"rgba(253,250,246,.75)"}}>{item.caption}</span>
              </div>
            )}
          </motion.div>
        ))}
      </div>
      <AnimatePresence>
        {modal && (
          <motion.div initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} onClick={()=>setModal(null)}
            style={{position:"fixed",inset:0,zIndex:999,background:"rgba(10,8,6,.93)",display:"flex",alignItems:"center",justifyContent:"center",padding:24,cursor:"pointer"}}>
            <motion.div initial={{scale:.9}} animate={{scale:1}} exit={{scale:.9}} style={{maxWidth:700,width:"100%"}}>
              <img src={modal.src} alt="" style={{width:"100%",maxHeight:"75vh",objectFit:"contain",border:`1px solid ${G.border}`}} />
              {modal.caption && <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:G.muted,textAlign:"center",marginTop:14}}>{modal.caption}</p>}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ─────────────────────────────────────────────
   LOVE GAMES
───────────────────────────────────────────── */
function LoveGames({ proposal }: { proposal:Props["proposal"] }) {
  const [heartOpen,  setHeartOpen]  = useState(false);
  const [flipped,    setFlipped]    = useState<number[]>([]);
  const [openTl,     setOpenTl]     = useState<number|null>(null);
  const [destiny,    setDestiny]    = useState<"stay"|"walk"|null>(null);

  const memories = ["First coffee together","The day I knew","That long walk in rain","Your laugh that evening","Our first real adventure"];
  const tlItems  = [
    { date: proposal.firstMeetingDate ? formatDate(proposal.firstMeetingDate) : "The Beginning", title:"The Beginning",  text:"The day our story started — quiet, unplanned, and somehow perfect." },
    { date:"Six Months Later",  title:"When I Knew",     text:"Something shifted. I knew I never wanted this to end."          },
    { date:"Today",             title:"This Moment",     text:"The moment I finally say what I have been feeling all along."    },
  ];

  const gameCard = (children: React.ReactNode) => (
    <div style={{background:G.card,border:`1px solid ${G.border}`,padding:"32px 28px",transition:"border-color .4s",position:"relative",overflow:"hidden"}}
      onMouseEnter={e=>(e.currentTarget as HTMLElement).style.borderColor=G.borderH}
      onMouseLeave={e=>(e.currentTarget as HTMLElement).style.borderColor=G.border}
    >{children}</div>
  );

  return (
    <section style={{maxWidth:1040,margin:"0 auto",padding:"0 24px 96px"}}>
      <SectionHeader eyebrow="Interactive" title="Made for You" />
      <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:20}}>

        {/* 1. Unlock Heart */}
        {gameCard(
          <div style={{textAlign:"center"}}>
            <motion.div animate={heartOpen?{scale:[1,1.3,1],rotate:[0,-10,10,0]}:{}} transition={{duration:.6}}
              style={{fontSize:52,cursor:"pointer",color:heartOpen?G.gold:G.wine,marginBottom:16,display:"inline-block",textShadow:heartOpen?`0 0 30px rgba(212,175,55,0.5)`:"none",transition:"all .4s"}}
              onClick={()=>setHeartOpen(true)}>
              {heartOpen?"♥":"♡"}
            </motion.div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:G.gold,marginBottom:6,textTransform:"uppercase"}}>Unlock My Heart</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:G.muted}}>Tap to reveal what's inside…</p>
            <AnimatePresence>
              {heartOpen && (
                <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.5}}
                  style={{marginTop:20,paddingTop:20,borderTop:`1px solid rgba(212,175,55,0.15)`}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:16,fontStyle:"italic",color:"rgba(253,250,246,.75)",lineHeight:1.8}}>
                    "You are the reason I believe in forever. Every morning I wake up grateful that somehow, you chose me too."
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {/* 2. Memory Cards */}
        {gameCard(
          <div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:G.gold,marginBottom:6,textTransform:"uppercase",textAlign:"center"}}>Pick a Memory</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:G.muted,textAlign:"center",marginBottom:20}}>Each card holds a moment…</p>
            <div style={{display:"flex",gap:10,justifyContent:"center",flexWrap:"wrap"}}>
              {memories.map((mem,i)=>(
                <motion.div key={i} whileHover={{y:-4}} onClick={()=>setFlipped(p=>p.includes(i)?p.filter(x=>x!==i):[...p,i])}
                  style={{width:70,height:98,border:`1px solid ${flipped.includes(i)?G.gold:G.border}`,background:flipped.includes(i)?"rgba(212,175,55,0.08)":G.card,display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",transition:"all .4s",padding:8,textAlign:"center"}}>
                  {flipped.includes(i)
                    ? <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:11,color:G.gold,fontStyle:"italic",lineHeight:1.4}}>{mem}</p>
                    : <span style={{fontSize:20,color:"rgba(212,175,55,0.3)"}}>✦</span>}
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* 3. Timeline */}
        {gameCard(
          <div>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:G.gold,marginBottom:24,textTransform:"uppercase",textAlign:"center"}}>Our Timeline</p>
            <div style={{position:"relative",paddingLeft:28}}>
              <div style={{position:"absolute",left:0,top:0,bottom:0,width:1,background:"linear-gradient(to bottom,transparent,rgba(212,175,55,0.22),transparent)"}} />
              {tlItems.map((item,i)=>(
                <div key={i} onClick={()=>setOpenTl(openTl===i?null:i)} style={{marginBottom:24,cursor:"pointer",position:"relative"}}>
                  <div style={{position:"absolute",left:-32,top:4,width:8,height:8,borderRadius:"50%",border:`1px solid ${G.gold}`,background:openTl===i?G.gold:G.black,transition:"all .3s",boxShadow:openTl===i?"0 0 12px rgba(212,175,55,0.4)":"none"}} />
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:2,color:"rgba(212,175,55,0.5)",marginBottom:3}}>{item.date}</p>
                  <p style={{fontFamily:"'Cinzel',serif",fontSize:12,color:G.cream,letterSpacing:.5}}>{item.title}</p>
                  <AnimatePresence>
                    {openTl===i && (
                      <motion.p initial={{height:0,opacity:0}} animate={{height:"auto",opacity:1}} exit={{height:0,opacity:0}} transition={{duration:.35}}
                        style={{fontFamily:"'Cormorant Garamond',serif",fontSize:13,fontStyle:"italic",color:G.muted,lineHeight:1.65,marginTop:6,overflow:"hidden"}}>
                        {item.text}
                      </motion.p>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4. Destiny Choice */}
        {gameCard(
          <div style={{textAlign:"center"}}>
            <p style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:3,color:G.gold,marginBottom:8,textTransform:"uppercase"}}>A Choice</p>
            <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:15,fontStyle:"italic",color:G.muted,marginBottom:24}}>What does your heart say?</p>
            {destiny===null && (
              <div style={{display:"flex",gap:12,justifyContent:"center",flexWrap:"wrap"}}>
                <button onClick={()=>setDestiny("stay")}
                  style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,padding:"12px 24px",background:"rgba(212,175,55,0.1)",border:`1px solid rgba(212,175,55,0.4)`,color:G.gold,cursor:"pointer",transition:"all .3s",textTransform:"uppercase"}}
                  onMouseEnter={e=>{const b=e.currentTarget;b.style.background="rgba(212,175,55,0.2)";b.style.boxShadow="0 0 24px rgba(212,175,55,0.15)"}}
                  onMouseLeave={e=>{const b=e.currentTarget;b.style.background="rgba(212,175,55,0.1)";b.style.boxShadow="none"}}
                >Stay in my life</button>
                <button onClick={()=>setDestiny("walk")}
                  style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,padding:"12px 24px",background:"transparent",border:`1px solid rgba(253,250,246,0.08)`,color:"rgba(253,250,246,.3)",cursor:"pointer",transition:"all .5s",textTransform:"uppercase"}}>
                  Walk away
                </button>
              </div>
            )}
            <AnimatePresence>
              {destiny==="stay" && (
                <motion.p initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} transition={{duration:.6}}
                  style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:G.gold,lineHeight:1.75}}>
                  "That is all I ever needed to hear. Thank you."
                </motion.p>
              )}
              {destiny==="walk" && (
                <motion.div initial={{opacity:0}} animate={{opacity:1}} transition={{duration:.5}}>
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:14,fontStyle:"italic",color:G.muted,marginBottom:12}}>
                    The button faded — just like that path never really existed.
                  </p>
                  <span style={{fontFamily:"'Cinzel',serif",fontSize:10,letterSpacing:2,color:G.gold,cursor:"pointer"}} onClick={()=>setDestiny(null)}>↩ Go back</span>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

      </div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   FINAL PROPOSAL
───────────────────────────────────────────── */
function FinalProposal({ proposal }: { proposal:Props["proposal"] }) {
  const [response, setResponse] = useState<"yes"|"think"|null>(null);
  return (
    <section id="proposal" style={{maxWidth:1040,margin:"0 auto",padding:"0 24px 96px"}}>
      <SectionHeader eyebrow="The Moment" title="The Question" />
      <motion.div initial={{opacity:0,y:24}} whileInView={{opacity:1,y:0}} viewport={{once:true}} transition={{duration:.9}}
        style={{position:"relative",padding:"80px 40px",textAlign:"center",border:`1px solid rgba(212,175,55,0.2)`,background:"rgba(253,250,246,0.015)",overflow:"hidden"}}>
        {/* spotlight */}
        <div style={{position:"absolute",top:"50%",left:"50%",transform:"translate(-50%,-50%)",width:500,height:500,borderRadius:"50%",background:"radial-gradient(circle,rgba(212,175,55,0.06),transparent 65%)",pointerEvents:"none"}} />
        {/* corners */}
        {[{top:16,left:16,borderTop:`1px solid rgba(212,175,55,0.28)`,borderLeft:`1px solid rgba(212,175,55,0.28)`},{top:16,right:16,borderTop:`1px solid rgba(212,175,55,0.28)`,borderRight:`1px solid rgba(212,175,55,0.28)`},{bottom:16,left:16,borderBottom:`1px solid rgba(212,175,55,0.28)`,borderLeft:`1px solid rgba(212,175,55,0.28)`},{bottom:16,right:16,borderBottom:`1px solid rgba(212,175,55,0.28)`,borderRight:`1px solid rgba(212,175,55,0.28)`}]
          .map((s,i)=><div key={i} style={{position:"absolute",width:28,height:28,...s}} />)}

        <div style={{position:"relative",zIndex:1}}>
          <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:4,color:"rgba(212,175,55,0.4)",marginBottom:28,textTransform:"uppercase"}}>For you, {proposal.girlName}</p>

          {/* icon */}
          <div style={{position:"relative",display:"inline-flex",alignItems:"center",justifyContent:"center",width:80,height:80,marginBottom:28}}>
            {[{sz:80,op:.18},{sz:104,op:.09}].map((r,i)=>(
              <motion.div key={i} animate={{scale:[1,1.08,1]}} transition={{duration:2.5,repeat:Infinity,delay:i*.5}}
                style={{position:"absolute",width:r.sz,height:r.sz,borderRadius:"50%",border:`1px solid rgba(212,175,55,${r.op})`}} />
            ))}
            <motion.div animate={{scale:[1,1.2,1]}} transition={{duration:1.6,repeat:Infinity}}
              style={{width:60,height:60,borderRadius:"50%",background:"rgba(212,175,55,0.06)",border:`1px solid rgba(212,175,55,0.3)`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:24,color:G.gold}}>
              ♥
            </motion.div>
          </div>

          <h2 style={{fontFamily:"'Cinzel',serif",fontSize:"clamp(22px,4vw,40px)",fontWeight:400,letterSpacing:2,color:G.cream,marginBottom:16,lineHeight:1.25}}>
            Will you be mine<br />forever?
          </h2>
          <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:18,fontStyle:"italic",color:G.muted,marginBottom:40,lineHeight:1.7}}>
            In all the ways that matter, in every quiet moment —<br />will you let this be us?
          </p>

          {!response ? (
            <>
              <div style={{display:"flex",gap:16,justifyContent:"center",flexWrap:"wrap"}}>
                <button onClick={()=>{setResponse("yes");spawnGold()}}
                  style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,padding:"16px 48px",background:"linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.09))",border:`1px solid rgba(212,175,55,0.5)`,color:G.gold,cursor:"pointer",transition:"all .4s",textTransform:"uppercase"}}
                  onMouseEnter={e=>{const b=e.currentTarget;b.style.background="rgba(212,175,55,0.25)";b.style.boxShadow="0 0 40px rgba(212,175,55,0.2)";b.style.transform="translateY(-2px)"}}
                  onMouseLeave={e=>{const b=e.currentTarget;b.style.background="linear-gradient(135deg,rgba(212,175,55,0.18),rgba(212,175,55,0.09))";b.style.boxShadow="none";b.style.transform="translateY(0)"}}
                >Yes, Forever ✦</button>
                <button onClick={()=>setResponse("think")}
                  style={{fontFamily:"'Cinzel',serif",fontSize:11,letterSpacing:3,padding:"16px 48px",background:"transparent",border:`1px solid rgba(253,250,246,0.08)`,color:"rgba(253,250,246,.3)",cursor:"pointer",transition:"all .5s",textTransform:"uppercase"}}
                  onMouseEnter={e=>(e.currentTarget as HTMLElement).style.opacity=".5"}
                  onMouseLeave={e=>(e.currentTarget as HTMLElement).style.opacity="1"}
                >I Need a Moment</button>
              </div>
              <div style={{display:"flex",justifyContent:"center",gap:8,marginTop:28}}>
                {[0,1,2].map(i=>(
                  <motion.span key={i} animate={{opacity:[.2,1,.2]}} transition={{duration:1.2,repeat:Infinity,delay:i*.25}}
                    style={{width:5,height:5,borderRadius:"50%",background:G.gold,display:"inline-block"}} />
                ))}
              </div>
            </>
          ) : (
            <AnimatePresence>
              <motion.div key="resp" initial={{opacity:0,y:16}} animate={{opacity:1,y:0}} transition={{duration:.6}}
                style={{marginTop:8,paddingTop:28,borderTop:`1px solid rgba(212,175,55,0.15)`}}>
                {response==="yes" ? (
                  <>
                    <p style={{fontFamily:"'Cinzel',serif",fontSize:18,color:G.gold,marginBottom:10,letterSpacing:1}}>You just made this story eternal.</p>
                    <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:G.muted,lineHeight:1.8}}>"This moment will live in me forever. Thank you for choosing me."</p>
                  </>
                ) : (
                  <p style={{fontFamily:"'Cormorant Garamond',serif",fontSize:17,fontStyle:"italic",color:"rgba(253,250,246,.4)",lineHeight:1.8}}>"Take all the time you need. I will be right here."</p>
                )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </motion.div>
    </section>
  );
}

/* ─────────────────────────────────────────────
   ROOT
───────────────────────────────────────────── */
export default function ProposalTemplate3({ proposal, template }: Props) {
  return (
    <div style={{background:G.black,color:G.cream,minHeight:"100vh",overflowX:"hidden",position:"relative"}}>
      <style>{CSS}</style>

      {/* grain texture */}
      <div style={{position:"fixed",inset:0,zIndex:100,pointerEvents:"none",opacity:.32,backgroundImage:`url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E")`}} />

      {/* sticky nav */}
      <div style={{position:"fixed",top:0,left:0,right:0,zIndex:50,display:"flex",justifyContent:"space-between",alignItems:"center",padding:"15px 28px",borderBottom:`1px solid rgba(212,175,55,0.06)`,background:"rgba(10,8,6,0.88)",backdropFilter:"blur(20px)"}}>
        <span style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:4,color:"rgba(212,175,55,0.38)",textTransform:"uppercase"}}>{template?.name??"A Love Story"}</span>
        <Link href="/dashboard" style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(212,175,55,0.38)",textDecoration:"none",textTransform:"uppercase",transition:"color .3s"}}
          onMouseEnter={e=>(e.currentTarget as HTMLElement).style.color=G.gold}
          onMouseLeave={e=>(e.currentTarget as HTMLElement).style.color="rgba(212,175,55,0.38)"}
        >Dashboard</Link>
      </div>

      <Hero proposal={proposal} />
      <GoldDivider />

      {proposal.firstMeetingDate && (
        <div style={{paddingTop:72}}><DaysCounter firstMeetingDate={proposal.firstMeetingDate} /></div>
      )}

      <Story proposal={proposal} />
      <GoldDivider />
      <Gallery proposal={proposal} />
      <GoldDivider />
      <LoveGames proposal={proposal} />
      <GoldDivider />
      <FinalProposal proposal={proposal} />

      <footer style={{padding:"40px 24px",textAlign:"center",borderTop:`1px solid rgba(212,175,55,0.06)`}}>
        <div style={{display:"flex",alignItems:"center",justifyContent:"center",gap:12,marginBottom:14}}>
          <div style={{width:40,height:1,background:G.gold,opacity:.18}} />
          <span style={{color:G.gold,opacity:.28,fontSize:10}}>✦</span>
          <div style={{width:40,height:1,background:G.gold,opacity:.18}} />
        </div>
        <p style={{fontFamily:"'Cinzel',serif",fontSize:9,letterSpacing:3,color:"rgba(212,175,55,0.2)",textTransform:"uppercase"}}>
          Made with love · For {proposal.girlName} · Always
        </p>
      </footer>
    </div>
  );
}