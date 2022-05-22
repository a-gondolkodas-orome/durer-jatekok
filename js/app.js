(function(){var e={203:function(e){var t='<div class="p-4"> <router-view></router-view> </div> ';e.exports=t},773:function(e){var t="<div class=\"animate-spin h-8 w-8 place-self-center border-t-blue-600 rounded-full border-4\" :style=\"{ 'visibility': isEnemyMoveInProgress ? 'visible' : 'hidden' }\"></div> ";e.exports=t},448:function(e){var t='<div> <template v-if="game"> <button class="rounded-lg px-4 bg-blue-400 hover:bg-blue-600 js-back-to-overview" @click="goBackToOverview()">&lt; Vissza a listához</button> <h1 class="text-blue-600 text-2xl font-bold pb-4">{{ game.name }}</h1> <hr/> <component :is="gameId"></component> </template> <page-not-found v-if="!game"></page-not-found> </div> ';e.exports=t},464:function(e){var t='<div> <p class="text-justify"> A pályán mindig két kupac korong található. A soron következő játékos választ egy kupacot, és azt szétosztja két kisebb kupacra (mindkettőbe legalább 1 korongnak kerülnie kell), a másik kupacot pedig kidobjuk. Az a játékos veszít, aki nem tud szabályosan lépni (azaz egyik kupacot se tudja szétosztani). Az új leosztás gombra kattintva generálhatsz egy felállást. A felállás ismeretében te döntheted el, hogy kezdeni szeretnél-e, vagy második játékos lenni. Sok sikert! :) </p> <div class="flex flex-wrap" id="heap-splitter"> <div class="game__board"> <div v-for="rowIndex in [0, 1]" class="game__pile" :class="{ \'border-b-black border-b-2\': rowIndex === 1 }"> <template v-for="(_, pieceIndex) in board[rowIndex]"> <span v-if="shouldShowDividerToTheLeft({ rowIndex, pieceIndex })" class="inline-block border-r-black border-r-4 h-16 border-dotted -ml-1"></span> <span class="game__piece bg-blue-600 rounded-full mr-1" :style="{ \'opacity-50\': !shouldPlayerMoveNext, \'pointer-events\': shouldPlayerMoveNext ? \'auto\' : \'none\', \'cursor\': pieceIndex === 0 ? \'not-allowed\' : \'pointer\' }" @click="clickPiece({ rowIndex, pieceIndex })" @mouseover="hoveredPiece = { rowIndex, pieceIndex }" @mouseout="hoveredPiece = null"></span> </template> <span class="inline-block h-16 align-middle px-2 text-xl -mt-4"> {{ currentChoiceDescription(rowIndex) }} </span> </div> </div> <div class="p-1 flex flex-col flex-grow flex-shrink-0 basis-80"> <p class="text-center font-bold text-lg">{{ ctaText }}</p> <enemy-loader/> <p class="italic text-justify">{{ stepDescription }}</p> <button v-if="isGameReadyToStart" class="game__cta-button js-first-player" @click="startGameAsPlayer({ isFirst: true })"> Kezdő leszek </button> <button v-if="isGameReadyToStart" class="game__cta-button js-second-player" @click="startGameAsPlayer({ isFirst: false })"> Második leszek </button> <div class="flex flex-grow items-end"> <button class="game__cta-button mt-4 js-restart-game" @click="initializeGame()"> Új leosztás </button> </div> </div> </div> </div> ';e.exports=t},428:function(e,t,a){var r=a(91),s=a(259),o=r(s),n='<div> <svg style="display:none"> <symbol id="game-soldier-icon" viewBox="0 0 298.167 298.167"> <g> <polygon points="87.226,49.664 87.226,103.334 141.228,103.334 \t"/> <path d="M57.737,224.637c4.569-0.903,9.541-2.088,14.62-3.407c-1.152-5.343-1.774-10.881-1.774-16.564\n          c0-19.615,7.248-37.558,19.186-51.332h118.631c11.937,13.774,19.185,31.717,19.185,51.332c0,5.683-0.622,11.221-1.774,16.564\n          c5.079,1.319,10.051,2.503,14.62,3.407c1.406-6.438,2.154-13.118,2.154-19.971c0-20.161-6.415-38.852-17.31-54.14\n          c3.8-2.721,6.285-7.162,6.285-12.192c0-8.284-6.716-15-15-15h-5h-124h-6c-8.284,0-15,6.716-15,15c0,5.045,2.498,9.496,6.316,12.216\n          c-10.885,15.284-17.293,33.966-17.293,54.116C55.582,211.519,56.33,218.199,57.737,224.637z"/> <path d="M149.083,283.167c-11.725,0-22.848-2.602-32.849-7.23c-10.838-0.202-20.728-0.808-29.685-1.821\n          c16.578,14.942,38.511,24.052,62.533,24.052c24.023,0,45.955-9.109,62.533-24.051c-8.958,1.013-18.847,1.618-29.685,1.82\n          C171.931,280.565,160.808,283.167,149.083,283.167z"/> <circle cx="183.987" cy="184.168" r="12.465"/> <circle cx="114.18" cy="184.168" r="12.465"/> <path d="M168.083,221.334c-4.304,0-8.276,1.383-11.524,3.712v-25.397c0-4.107-3.165-7.688-7.271-7.811\n          c-4.247-0.127-7.729,3.277-7.729,7.496c0,9.756,0,15.835,0,25.678c-3.239-2.309-7.193-3.678-11.476-3.678\n          c-7.958,0-56.993,11.918-79.534,17.277c-5.048,1.2-5.868,7.975-1.294,10.425c20.996,11.245,59.479,11.982,75.34,11.982\n          c2.388,0,4.263-0.017,5.488-0.017c8.982,0,16.56-5.975,19-14.163c2.44,8.188,10.019,14.163,19,14.163\n          c1.225,0,3.103,0.017,5.488,0.017c15.858,0,54.344-0.735,75.34-11.982c4.574-2.45,3.755-9.225-1.294-10.426\n          C225.078,233.251,176.042,221.334,168.083,221.334z"/> <path d="M210.4,27.163c-2.574-6.903-9.207-11.829-17.008-11.829h-27.1C165.3,6.704,157.98,0,149.083,0s-16.217,6.704-17.209,15.334\n          h-26.148c-8.076,0-14.912,5.273-17.276,12.561l60.609,60.61L210.4,27.163z"/> <polygon points="211.226,103.334 211.226,48.664 156.89,103.334 \t"/> </g> </symbol> </svg> <p class="text-justify"> A török szultán serege megtámadta Hunyadi várát. A várlépcső egyes fokain néhány janicsár áll. Minden reggel a szultán kettéosztja a hadseregét egy piros és egy kék hadtestre. Hunyadi a nap folyamán vagy a piros, vagy a kék sereget megsemmisíti, választása szerint. Éjszaka minden megmaradt janicsár egy lépcsőfokot fellép. Hunyadi nyer, ha a szultán egész seregét megsemmisítette. A szultán nyer, ha lesz olyan janicsár, aki felér a várhoz. Az új játék gombra kattintva generálhatsz egy felállást. A felállás ismeretében te döntheted e, hogy Hunyadiként vagy a török szultánként szeretnél-e játszani. Sok sikert! :) </p> <div class="flex flex-wrap" id="hunyadi-and-the-janissaries"> <div class="game__board"> <img src="'+o+'" style="display:block;margin:auto"> <div v-for="rowIndex in [0, 1, 2, 3, 4]" class="game__pile" :class="{ \'border-b-black border-b-2\': rowIndex === 4 }"> <span v-for="(group, pieceIndex) in board[rowIndex]" class="game__piece mx-1 js-clickable-soldier" @click="toggleGroup(rowIndex, pieceIndex)"> <svg class="game__piece" :class="group === \'blue\' ? \'fill-blue-600\' : \'fill-red-600\'"> <use xlink:href="#game-soldier-icon"/> </svg> </span> </div> </div> <div class="p-1 flex flex-col flex-grow flex-shrink-0 basis-80"> <p class="text-center font-bold text-lg">{{ ctaText }}</p> <enemy-loader/> <p class="italic text-justify">{{ stepDescription }}</p> <template v-if="isGameReadyToStart"> <button class="game__cta-button js-second-player" @click="startGameAsPlayer({ isFirst: false })"> Hunyadi leszek </button> <button class="game__cta-button js-first-player" @click="startGameAsPlayer({ isFirst: true })"> Szultán leszek </button> </template> <template v-if="isGameInProgress"> <button v-if="isPlayerSultan" :class="{ \'opacity-50\': isEnemyMoveInProgress }" class="game__cta-button js-finalize-groups" @click="finalizeSoldierGrouping()"> Lépek </button> <button v-if="!isPlayerSultan" :class="{ \'opacity-50\': isEnemyMoveInProgress }" class="game__cta-button bg-red-400 hover:bg-red-600 js-kill-red" @click="killGroup(\'red\')"> Legyőzöm a pirosakat </button> <button v-if="!isPlayerSultan" :class="{ \'opacity-50\': isEnemyMoveInProgress }" class="game__cta-button bg-blue-400 hover:bg-blue-600" @click="killGroup(\'blue\')"> Legyőzöm a kékeket </button> </template> <div class="flex flex-grow items-end"> <button class="game__cta-button mt-4 js-restart-game" @click="initializeGame()"> Új leosztás </button> </div> </div> </div> </div> ';e.exports=n},411:function(e){var t='<div> <h1 class="text-blue-600 text-2xl font-bold pb-4">Dürer játékok</h1> <table class="w-full border-collapse"> <thead> <tr> <th v-for="header in [\'Év\', \'Forduló\', \'Kategória\', \'Játék\', \'\']" class="bg-gray-500 border-2 border-gray-300 text-center text-white font-bold p-1">{{ header }}</th> </tr> </thead> <tr v-for="game in gamesToShow" class="odd:bg-gray-200"> <td v-for="gameProp in [game.year, game.round, game.category, game.name]" class="border-2 border-gray-300 text-center p-1">{{ gameProp }}</td> <td class="border-2 border-gray-300 text-center p-1"> <button @click="goToGamePage(game.component)" :class="`rounded-lg px-4 bg-blue-400 hover:bg-blue-600 js-select-${game.component}`">Kipróbálom!</button> </td> </tr> </table> </div> ';e.exports=t},953:function(e){var t='<div> Sajnáljuk, a keresett oldal nem található. Az alábbi gombra kattintva válassz egy játékot. <button class="rounded-lg px-4 bg-blue-400 hover:bg-blue-600 js-back-to-overview" @click="$router.push(\'/\')">A játékok listájához</button> </div> ';e.exports=t},126:function(e,t,a){"use strict";var r={};a.r(r),a.d(r,{generateNewBoard:function(){return m},getBoardAfterPlayerStep:function(){return p},makeAiMove:function(){return v}});var s={};a.r(s),a.d(s,{generateNewBoard:function(){return P},getBoardAfterKillingGroup:function(){return z},makeAiMove:function(){return f}});var o=a(821),n=a(637),i={name:"enemy-loader",template:a(773),computed:{...(0,n.Se)(["isEnemyMoveInProgress"])}},l=a(207),d={name:"heap-splitter",template:a(464),components:{EnemyLoader:i},data:()=>({hoveredPiece:null}),computed:{...(0,n.rn)(["game","board","shouldPlayerMoveNext"]),...(0,n.Se)(["ctaText","isEnemyMoveInProgress","isGameInProgress","isGameReadyToStart","isGameFinished"]),stepDescription(){return this.isGameInProgress&&this.shouldPlayerMoveNext?"Kattints egy korongra, hogy azzal kettéosztd azt a kupacot. Amelyik korongra kattintasz, az és a tőle jobbra lévők kerülnek az új kupacba.":""}},methods:{...(0,n.nv)(["playerMove","startGameAsPlayer","initializeGame"]),clickPiece({rowIndex:e,pieceIndex:t}){this.shouldPlayerMoveNext&&0!==t&&(this.playerMove(this.game.strategy.getBoardAfterPlayerStep(this.board,{rowIndex:e,pieceIndex:t})),this.hoveredPiece=null)},shouldShowDividerToTheLeft(e){return(0,l.Z)(this.hoveredPiece,e)&&0!==e.pieceIndex},currentChoiceDescription(e){if(this.isGameFinished)return"";const t=this.board[e];return!this.isGameReadyToStart&&this.shouldPlayerMoveNext&&this.hoveredPiece?this.hoveredPiece.rowIndex!==e||0===this.hoveredPiece.pieceIndex?t:`${t} --\x3e ${this.hoveredPiece.pieceIndex}, ${t-this.hoveredPiece.pieceIndex}`:t}},created(){this.initializeGame()}},c=a(956);const u=(e,t)=>2*(0,c.Z)(Math.ceil(e/2),Math.floor(t/2)),m=()=>[(0,c.Z)(3,10),(0,c.Z)(3,10)],p=(e,{rowIndex:t,pieceIndex:a})=>{const r=[a,e[t]-a];return{board:r,isGameEnd:g(r)}},g=e=>1===e[0]&&1===e[1],v=e=>{const t=(0,c.Z)(0,1),a=e[t]%2===0||1===e[1-t]?t:1-t,r=h(e[a]);return{board:r,isGameEnd:g(r)}},h=e=>{if(2===e)return[1,1];const t=1+u(0,e-2);return[t,e-t]};var y={name:"hunyadi-and-the-janissaries",template:a(428),components:{EnemyLoader:i},computed:{...(0,n.rn)({isPlayerSultan:e=>e.isPlayerTheFirstToMove}),...(0,n.rn)(["game","board","shouldPlayerMoveNext"]),...(0,n.Se)(["ctaText","isEnemyMoveInProgress","isGameInProgress","isGameReadyToStart"]),stepDescription(){return this.isGameInProgress&&this.shouldPlayerMoveNext&&this.isPlayerSultan?"Kattints a katonákra és válaszd két részre a seregedet.":""}},methods:{...(0,n.OI)(["setBoard"]),...(0,n.nv)(["playerMove","startGameAsPlayer","initializeGame"]),toggleGroup(e,t){if(!this.shouldPlayerMoveNext||!this.isPlayerSultan)return;const a=this.board;a[e][t]="blue"===a[e][t]?"red":"blue",this.setBoard(a)},finalizeSoldierGrouping(){this.playerMove({board:this.board,isGameEnd:!1})},killGroup(e){this.playerMove(this.game.strategy.getBoardAfterKillingGroup(this.board,e))}},created(){this.initializeGame()}},b=a(793);const f=(e,t)=>{if(t){const t=x(e);return z(e,t)}return{board:k(e),isGameEnd:!1}},k=e=>{const t={blue:0,red:0},a=1===(0,c.Z)(0,1)?"red":"blue",r="blue"===a?"red":"blue";for(let s=0;s<e.length;s++)for(let o=0;o<e[s].length;o++){const n=t[a]<t[r]?a:r;e[s][o]=n,t[n]+=.5**s}return e},x=e=>{if(e[0].length>0)return e[0][0];const t={blue:0,red:0};for(let a=0;a<e.length;a++)for(const r of e[a])t[r]+=.5**a;return t["blue"]>t["red"]?"blue":"red"},P=()=>{const e=5;let t=[];for(let a=0;a<e-1;a++){const e=[];0===a&&e.push("blue"),1===(0,c.Z)(0,1)&&e.push("blue"),t.push(e)}t.push([]);for(let a=0;a<e-1;a++)for(let e of t[a])1===(0,c.Z)(0,1)&&(t[a].splice(e,1),t[a+1].push("blue","blue"));return t},z=(e,t)=>{let a,r=!1;for(let s=0;s<e.length;s++){const o=e[s].filter((e=>e!==t));o.length>0&&(0===s?(r=!0,a=!0):e[s-1].push(...o)),e[s]=[]}return 0!==(0,b.Z)(e).length||r||(r=!0,a=!1),{board:e,isGameEnd:r,hasFirstPlayerWon:a}},M={HeapSplitter:d,HunyadiAndTheJanissaries:y},G={HunyadiAndTheJanissaries:{year:6,round:"döntő",category:"D",component:"HunyadiAndTheJanissaries",name:"Hunyadi és a janicsárok",strategy:s},HeapSplitter:{year:8,round:"döntő",category:"A",component:"HeapSplitter",name:"Kupac kettéosztó",strategy:r}};var j={name:"page-not-found",template:a(953)},I={name:"game",template:a(448),components:{...M,PageNotFound:j},props:{gameId:String},computed:{...(0,n.rn)(["game"])},methods:{...(0,n.OI)(["setGame","setGameStatus"]),goBackToOverview(){this.setGame(null),this.setGameStatus(null),this.$router.push("/")},setGameBasedOnRoute(){this.setGame(Object.values(G).find((e=>e.component===this.gameId))||null)}},mounted(){this.setGameBasedOnRoute()},watch:{gameId(){this.setGameBasedOnRoute()}}},T={name:"overview",template:a(411),data:()=>({gamesToShow:Object.values(G)}),methods:{goToGamePage(e){this.$router.push(`/game/${e}`)}}},S={name:"app",template:a(203),components:{Game:I,Overview:T},created(){document.title="Dürer játékok"}},w=()=>(0,n.MT)({state:{game:null,board:null,gameStatus:null,isPlayerTheFirstToMove:null,shouldPlayerMoveNext:null,isPlayerWinner:null,enemyMoveTimeoutHandle:null,isEnemyMoveInProgress:null},getters:{isGameInProgress:e=>"inProgress"===e.gameStatus,isGameReadyToStart:e=>"readyToStart"===e.gameStatus,isGameFinished:e=>"finished"===e.gameStatus,isEnemyMoveInProgress:e=>e.isEnemyMoveInProgress&&null!==e.enemyMoveTimeoutHandle,ctaText:(e,t)=>t.isGameInProgress?e.shouldPlayerMoveNext?"Te jössz.":"Mi jövünk.":t.isGameFinished?e.isPlayerWinner?"Nyertél. Gratulálunk! :)":"Sajnos, most nem nyertél, de ne add fel.":"A gombra kattintva tudod elindítani a játékot."},mutations:{setGame(e,t){e.game=t},setGameStatus(e,t){e.gameStatus=t},startGameAsPlayer(e,{isFirst:t}){e.isPlayerTheFirstToMove=t,e.shouldPlayerMoveNext=t,e.gameStatus="inProgress"},setBoard(e,t){e.board=t}},actions:{startGameAsPlayer:({commit:e,dispatch:t},{isFirst:a=!0})=>{e("startGameAsPlayer",{isFirst:a}),a||t("aiMove")},applyMove({state:e,commit:t},{board:a,isGameEnd:r,hasFirstPlayerWon:s}){t("setBoard",a),e.shouldPlayerMoveNext=!e.shouldPlayerMoveNext,r&&(clearTimeout(e.enemyMoveTimeoutHandle),e.gameStatus="finished",e.isPlayerWinner=void 0===s?!e.shouldPlayerMoveNext:e.isPlayerTheFirstToMove===s)},initializeGame({state:e,commit:t}){clearTimeout(e.enemyMoveTimeoutHandle),e.isEnemyMoveInProgress=!1,e.shouldPlayerMoveNext=null,e.isPlayerWinner=null,e.isPlayerTheFirstToMove=null,e.board=e.game.strategy.generateNewBoard(),t("setGameStatus","readyToStart")},aiMove:async({state:e,dispatch:t})=>{e.isEnemyMoveInProgress=!0;const a=Math.floor(750*Math.random()+750);e.enemyMoveTimeoutHandle=setTimeout((()=>{t("applyMove",e.game.strategy.makeAiMove(e.board,e.isPlayerTheFirstToMove)),e.isEnemyMoveInProgress=!1}),a)},playerMove:({dispatch:e},{board:t,isGameEnd:a,hasFirstPlayerWon:r})=>{e("applyMove",{board:t,isGameEnd:a,hasFirstPlayerWon:r}),a||e("aiMove")}}}),_=a(119);const A=[{path:"/",component:T},{path:"/game/:gameId/",component:I,props:!0},{path:"/:path(.*)*",component:j}];var E=()=>(0,_.p7)({history:(0,_.r5)(),routes:A});const F=(0,o.ri)(S);F.use(w()),F.use(E()),F.mount("#app")},259:function(e,t,a){"use strict";e.exports=a.p+"img/hunyadi-and-the-janissaries-castle.jpg"}},t={};function a(r){var s=t[r];if(void 0!==s)return s.exports;var o=t[r]={exports:{}};return e[r](o,o.exports,a),o.exports}a.m=e,function(){var e=[];a.O=function(t,r,s,o){if(!r){var n=1/0;for(c=0;c<e.length;c++){r=e[c][0],s=e[c][1],o=e[c][2];for(var i=!0,l=0;l<r.length;l++)(!1&o||n>=o)&&Object.keys(a.O).every((function(e){return a.O[e](r[l])}))?r.splice(l--,1):(i=!1,o<n&&(n=o));if(i){e.splice(c--,1);var d=s();void 0!==d&&(t=d)}}return t}o=o||0;for(var c=e.length;c>0&&e[c-1][2]>o;c--)e[c]=e[c-1];e[c]=[r,s,o]}}(),function(){a.d=function(e,t){for(var r in t)a.o(t,r)&&!a.o(e,r)&&Object.defineProperty(e,r,{enumerable:!0,get:t[r]})}}(),function(){a.g=function(){if("object"===typeof globalThis)return globalThis;try{return this||new Function("return this")()}catch(e){if("object"===typeof window)return window}}()}(),function(){a.o=function(e,t){return Object.prototype.hasOwnProperty.call(e,t)}}(),function(){a.r=function(e){"undefined"!==typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})}}(),function(){a.p="/durer-jatekok/"}(),function(){var e={143:0};a.O.j=function(t){return 0===e[t]};var t=function(t,r){var s,o,n=r[0],i=r[1],l=r[2],d=0;if(n.some((function(t){return 0!==e[t]}))){for(s in i)a.o(i,s)&&(a.m[s]=i[s]);if(l)var c=l(a)}for(t&&t(r);d<n.length;d++)o=n[d],a.o(e,o)&&e[o]&&e[o][0](),e[o]=0;return a.O(c)},r=self["webpackChunkdurer_jatekok"]=self["webpackChunkdurer_jatekok"]||[];r.forEach(t.bind(null,0)),r.push=t.bind(null,r.push.bind(r))}();var r=a.O(void 0,[998],(function(){return a(126)}));r=a.O(r)})();
//# sourceMappingURL=app.js.map