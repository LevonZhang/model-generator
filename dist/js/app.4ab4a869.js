(()=>{var e={146:(e,r,t)=>{"use strict";var o=t(751),a=t(641);function n(e,r,t,o,n,i){const s=(0,a.g2)("model-generator");return(0,a.uX)(),(0,a.Wv)(s)}var i=t(33);const s=e=>((0,a.Qi)("data-v-127fd3fa"),e=e(),(0,a.jt)(),e),l=s((()=>(0,a.Lk)("h1",null,"领域模型生成器",-1))),d={key:0,class:"diagram-container"},u={key:1,class:"diagram-container"},c=["src"],g={key:2,class:"error-message"};function p(e,r,t,n,s,p){return(0,a.uX)(),(0,a.CE)("div",null,[l,(0,a.bo)((0,a.Lk)("textarea",{"onUpdate:modelValue":r[0]||(r[0]=e=>s.userInput=e),placeholder:"输入您的领域模型需求"},null,512),[[o.Jo,s.userInput]]),(0,a.Lk)("button",{onClick:r[1]||(r[1]=(...e)=>p.generateModel&&p.generateModel(...e))},"生成模型"),s.isLoading?((0,a.uX)(),(0,a.CE)("div",d," 图片生成中... ")):s.imageUrl?((0,a.uX)(),(0,a.CE)("div",u,[(0,a.Lk)("img",{src:s.imageUrl,alt:"PlantUML Diagram"},null,8,c),(0,a.Lk)("button",{onClick:r[2]||(r[2]=(...e)=>p.downloadPNG&&p.downloadPNG(...e))},"下载 PNG")])):s.errorMessage?((0,a.uX)(),(0,a.CE)("div",g,(0,i.v_)(s.errorMessage),1)):(0,a.Q3)("",!0)])}const m={data(){return{userInput:"",isLoading:!1,errorMessage:null,imageUrl:null}},methods:{async generateModel(){this.isLoading=!0,this.imageUrl=null,this.errorMessage=null;try{const e=await fetch("https://legendary-enigma-5gqpqp79xpv43r7x-3001.app.github.dev/generate-diagram",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({diagram_source:this.userInput,diagram_type:"plantuml",output_format:"png"})});if(!e.ok)throw new Error(`Kroki API request failed with status ${e.status}`);const r=await e.blob();this.imageUrl=URL.createObjectURL(r)}catch(e){console.error("Error generating diagram:",e),this.errorMessage="生成图表时出错，请检查您的输入或网络连接。"}finally{this.isLoading=!1}},downloadPNG(){const e=document.createElement("a");e.href=this.imageUrl,e.download="diagram.png",document.body.appendChild(e),e.click(),document.body.removeChild(e)}}};var f=t(262);const h=(0,f.A)(m,[["render",p],["__scopeId","data-v-127fd3fa"]]),v=h,y={name:"App",components:{ModelGenerator:v}},b=(0,f.A)(y,[["render",n]]),k=b,{generateDiagram:w}=t(326);(0,o.Ef)(k).mount("#app")},326:(e,r,t)=>{const o=t(92),a=(e,r)=>{r.send("Welcome to krokiProxy!")},n=async(e,r)=>{try{console.log(e.body);const t=await o("https://kroki.io/",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(e.body)});if(!t.ok)throw new Error(`Kroki request failed: ${t.status}`);const a=await t.blob();r.setHeader("Content-Type","image/png"),r.send(Buffer.from(await a.arrayBuffer()))}catch(t){console.error("Error:",t),r.status(500).send("Error generating diagram")}};e.exports={generateDiagram:n,handleWelcome:a}}},r={};function t(o){var a=r[o];if(void 0!==a)return a.exports;var n=r[o]={exports:{}};return e[o](n,n.exports,t),n.exports}t.m=e,(()=>{var e=[];t.O=(r,o,a,n)=>{if(!o){var i=1/0;for(u=0;u<e.length;u++){for(var[o,a,n]=e[u],s=!0,l=0;l<o.length;l++)(!1&n||i>=n)&&Object.keys(t.O).every((e=>t.O[e](o[l])))?o.splice(l--,1):(s=!1,n<i&&(i=n));if(s){e.splice(u--,1);var d=a();void 0!==d&&(r=d)}}return r}n=n||0;for(var u=e.length;u>0&&e[u-1][2]>n;u--)e[u]=e[u-1];e[u]=[o,a,n]}})(),(()=>{t.d=(e,r)=>{for(var o in r)t.o(r,o)&&!t.o(e,o)&&Object.defineProperty(e,o,{enumerable:!0,get:r[o]})}})(),(()=>{t.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()})(),(()=>{t.o=(e,r)=>Object.prototype.hasOwnProperty.call(e,r)})(),(()=>{var e={524:0};t.O.j=r=>0===e[r];var r=(r,o)=>{var a,n,[i,s,l]=o,d=0;if(i.some((r=>0!==e[r]))){for(a in s)t.o(s,a)&&(t.m[a]=s[a]);if(l)var u=l(t)}for(r&&r(o);d<i.length;d++)n=i[d],t.o(e,n)&&e[n]&&e[n][0](),e[n]=0;return t.O(u)},o=self["webpackChunkmodel_generator"]=self["webpackChunkmodel_generator"]||[];o.forEach(r.bind(null,0)),o.push=r.bind(null,o.push.bind(o))})();var o=t.O(void 0,[504],(()=>t(146)));o=t.O(o)})();
//# sourceMappingURL=app.4ab4a869.js.map