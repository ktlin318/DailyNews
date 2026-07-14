"use client";

import { useMemo, useState } from "react";

type NewsItem = { id:number; category:string; time:string; title:string; summary:string; keywords:string[]; sources:{name:string;url:string}[]; audience:string[] };
type TalkTrack = { opening:string; followup:string };

const news: NewsItem[] = [
  { id:1, category:"總經", time:"08:40", title:"央行政策訊號牽動市場利率預期", summary:"政策聲明維持審慎基調，市場關注後續通膨與就業數據；短期債券殖利率與匯率波動可能提高。", keywords:["利率","通膨","匯率"], sources:[{name:"來源 A",url:"https://example.com/source-a"},{name:"來源 B",url:"https://example.com/source-b"}], audience:["高資產","外幣交易"] },
  { id:2, category:"市場", time:"09:15", title:"科技類股領漲，資金風險偏好回溫", summary:"主要指數由大型科技股帶動，但成交結構仍集中，市場持續觀察量能與產業輪動的延續性。", keywords:["科技股","台股","資金輪動"], sources:[{name:"來源 A",url:"https://example.com/market-a"}], audience:["高資產"] },
  { id:3, category:"生活", time:"10:05", title:"暑期旅遊需求升溫，熱門航線提前增班", summary:"多家業者調整暑期運能，熱門時段供需吃緊；實際航班日期與票價仍以業者公告為準。", keywords:["暑期旅遊","航班","海外消費"], sources:[{name:"來源 A",url:"https://example.com/travel-a"},{name:"官方公告",url:"https://example.com/official"}], audience:["海外消費"] }
];
const categories=["全部","總經","市場","生活"], audiences=["全部客群","高資產","外幣交易","海外消費"];
const talkTracks:Record<string,TalkTrack>={
  "全部|全部客群":{opening:"今天幾則新聞都和資金配置、消費安排有關，想先從您最近最在意的市場變化聊起。",followup:"可接著詢問：目前是比較想掌握市場方向、外幣配置，還是近期消費與旅遊安排？"},
  "總經|高資產":{opening:"今天利率與匯率的訊號較明顯，您目前的資產配置是否有想優先檢視的部分？",followup:"可接著詢問：您較在意利率變化對債券部位，還是對外幣資產的影響？"},
  "總經|外幣交易":{opening:"今天的總經資訊與匯率預期有關，想了解您近期是否有外幣換匯或付款安排？",followup:"可接著詢問：您預計使用的幣別、時間點與金額區間為何？"},
  "市場|高資產":{opening:"科技類股帶動市場，但資金仍相對集中；您會想先從既有持股的配置比例談起嗎？",followup:"可接著詢問：您比較關注既有部位風險，還是下一階段的分批布局機會？"},
  "生活|海外消費":{opening:"暑期旅遊與航班資訊更新得很快，您近期是否有海外行程或外幣支付需求？",followup:"可接著詢問：目的地、出發日期與支付方式是否已經確認？"}
};
const dailySummaries:Record<string,string>={全部:"今日焦點集中在利率、科技股與暑期旅遊需求；市場參與者持續觀察資金配置、匯率波動及海外消費安排。",總經:"利率與匯率成為今日總經焦點。政策訊號維持審慎，後續通膨與就業數據將影響市場對資金成本的預期。",市場:"科技類股帶動市場風險偏好回溫，但成交結構仍偏集中；後續可持續觀察量能與產業輪動是否延續。",生活:"暑期旅遊需求升溫，熱門航線供需較緊；規劃海外行程時，可提早確認航班、支付與外幣準備。"};

export default function Home(){
  const [category,setCategory]=useState("全部"), [audience,setAudience]=useState("全部客群"), [date,setDate]=useState("2026-07-13");
  const filtered=useMemo(()=>news.filter(n=>(category==="全部"||n.category===category)&&(audience==="全部客群"||n.audience.includes(audience))),[category,audience]);
  const track=talkTracks[`${category}|${audience}`]??talkTracks[`${category}|全部客群`]??talkTracks[`全部|${audience}`]??talkTracks["全部|全部客群"];
  const formattedDate=new Intl.DateTimeFormat("zh-TW",{year:"numeric",month:"long",day:"numeric"}).format(new Date(`${date}T00:00:00`));
  return <main><header className="topbar"><a className="brand" href="#brief"><span className="brandmark">N</span><span>NEWSROOM <b>AI</b></span></a><label className="date-picker"><span>新聞日期</span><input type="date" value={date} onChange={e=>setDate(e.target.value)}/></label></header>
    <section className="controls" id="brief"><div className="control-group"><span className="label">主題</span>{categories.map(c=><button key={c} className={category===c?"active":""} onClick={()=>setCategory(c)}>{c}</button>)}</div><label className="control-group"><span className="label">套用客群</span><select value={audience} onChange={e=>setAudience(e.target.value)}>{audiences.map(a=><option key={a}>{a}</option>)}</select></label></section>
    <section className="layout"><div className="feed"><div className="section-title"><div><p className="eyebrow">DAILY NEWS BRIEF</p><h1>{formattedDate}｜今日新聞摘要</h1></div><span>{filtered.length} 則摘要</span></div><div className="daily-summary" style={{background:"var(--card)",borderLeft:"4px solid var(--teal)",padding:"18px 20px",margin:"0 0 30px",boxShadow:"0 8px 24px rgba(16,35,33,.04)"}}><strong style={{display:"block",color:"var(--teal)",fontSize:12,letterSpacing:1,marginBottom:8}}>今日概況</strong><p style={{margin:0,color:"#455451",lineHeight:1.75}}>{dailySummaries[category]}</p></div>{filtered.map((item,index)=><article className="story" key={item.id}><div className="story-no">0{index+1}</div><div className="story-main"><div className="meta"><span className="tag">{item.category}</span><time>{item.time}</time></div><h3>{item.title}</h3><p>{item.summary}</p><div className="keywords">{item.keywords.map(keyword=><span className="keyword" key={keyword}>{keyword}</span>)}</div><div className="source-row"><span className="source-label">新聞來源</span><div className="source-list">{item.sources.map((source,index)=><a key={source.url} className={index===0?"primary":""} href={source.url} target="_blank" rel="noreferrer">{source.name} ↗</a>)}</div></div></div></article>)}{!filtered.length&&<div className="empty">目前沒有符合此主題與客群的示範新聞。</div>}</div><aside><div className="aside-card script"><div className="script-head"><p className="eyebrow">SMART TALK TRACK</p><span>依篩選更新</span></div><h2>客群溝通建議</h2><div className="track-context"><span>{category==="全部"?"全部主題":category}</span><i>×</i><span>{audience}</span></div><p className="track-label">建議開場</p><blockquote>「{track.opening}」</blockquote><p className="track-label">延伸追問</p><p className="followup">{track.followup}</p><button onClick={()=>navigator.clipboard?.writeText(`建議開場：${track.opening}\n延伸追問：${track.followup}`)}>複製建議</button></div></aside></section><footer>NEWSROOM AI｜每日新聞與客群溝通 Demo</footer></main>;
}
