/*
 * MOLL'S STUDIO — JAVASCRIPT
 * This file powers the interactive parts of the website.
 *
 * Main areas (in source order):
 * - State and drawing: chart data, grid drawing and stitch previews.
 * - Library and home: pattern cards and landing-page previews.
 * - Full patterns: pattern details and instructions.
 * - Pattern maker: editable drafts, local saves, and direct file exports.
 * - Posts and my designs: community posts and saved projects.
 * - Written instructions: converts chart data into craft instructions.
 * - Designer: chart editor controls, tools, and rendering.
 * - Picture tools: turn an image or prompt into chart artwork.
 * - Export: prepares chart images and written instructions for export.
 * - Navigation and start-up: page routing and initial setup.
 * - Inspiration wheel: randomly selects a pattern to try.
 *
 * Tip: functions are grouped under the section comments below. Search for
 * a section title to find the related behaviour.
 */

const $=s=>document.querySelector(s),$$=s=>[...document.querySelectorAll(s)];
// Add exported audio files here. Example: {title:'First song', src:'music/first-song.mp3'}
const MUSIC_TRACKS=[{title:'Teardrop by Massive Attack (ANOMOLLY REMIX)',src:'music/teardrop%202026.wav'},{title:'HARDGROOVE 1',src:'music/HARDGROOVE%201%20MASTER.wav'}];
const PATTERN_SITE_URL='file:///c%3A/Users/molly/Documents/molls_studio_project/index.html#home'; // Replace with the live domain when available.
const BASE='#f4f1ea',INK='#111';
const SYMS={k:'Knit',p:'Purl',yo:'Yarn over',k2:'Knit 2 together',ssk:'Slip, slip, knit',sk2p:'Centred double decrease',ns:'No stitch',inc:'Increase',sl:'Slip stitch',c2r:'Cross 2 right',c2l:'Cross 2 left',c4f:'Cable 4 front',c4b:'Cable 4 back',c2f:'Cable 2 front',c2b:'Cable 2 back',c3f:'Cable 3 front',c3b:'Cable 3 back'};
const ABBR={k:'k',p:'p',yo:'yo',k2:'k2tog',ssk:'ssk',sk2p:'sk2p',ns:'no stitch',inc:'inc',sl:'sl1',c2r:'C2R',c2l:'C2L',c4f:'C4F',c4b:'C4B',c2f:'C2F',c2b:'C2B',c3f:'C3F',c3b:'C3B'};
const NAMES={'#f4f1ea':'Oat','#26335b':'Indigo','#b23a48':'Madder','#5f7a3b':'Moss','#d9a21b':'Mustard','#8a7ca8':'Heather','#2b2b2e':'Charcoal','#7fb2d6':'Sky','#cfe3f1':'Ice','#ff9acb':'Pink','#8cf5b4':'Mint','#f6b8c4':'Blush','#ff5cad':'Hot pink','#ffd3ea':'Pale pink','#2fbf71':'Green','#ffe552':'Yellow','#1b1022':'Ink black'};
const TOOLS={paint:'Colour',fill:'Fill',symbol:'Symbol',erase:'Erase',area:'Clear area',text:'Text',select:'Select area'};
const KINDS={
 colourwork:{n:'Colourwork',d:'Stripes, motifs and Fair Isle with a knitted preview.',knit:1,tools:['paint','fill','erase','area','select','text'],hint:'Pick a colour, then click or drag on the grid.'},
 cable:{n:'Cable',d:'Twist stitches into cables.',sym:['k','p','c2f','c2b','c3f','c3b','c4f','c4b'],tools:['symbol','erase','area'],hint:'Choose a symbol, then click or drag to place it.'},
 lace:{n:'Lace',d:'Yarn overs, decreases and airy eyelets.',sym:['k','p','yo','k2','ssk','sk2p','ns'],tools:['symbol','erase','area'],hint:'Pair each yarn over with a decrease to keep the stitch count steady.'},
 textured:{n:'Textured stitch',d:'Ribs, seed stitch and basket weave.',sym:['k','p','inc','k2','ssk','sl'],tools:['symbol','erase','area'],hint:'Place knit and purl symbols to build ribs and weaves.'}};
const CM={k:'k',p:'p',o:'yo','/':'k2','\\':'ssk','^':'sk2p',x:'ns',i:'inc',s:'sl',r:'c2r',l:'c2l',f:'c4f',b:'c4b',F:'c2f',B:'c2b',g:'c3f',h:'c3b'};
const rows=(h,w,f)=>Array.from({length:h},(_,r)=>Array.from({length:w},(_,c)=>f(r,c)).join(''));
const P=[
{n:'Indigo stripe hat band',g:'hats',l:'Beginner',t:'colourwork',d:'Two-row stripes in two colours. A gentle first taste of changing yarn.',cols:[BASE,'#26335b'],rows:rows(12,12,r=>(r>>1)%2)},
{n:'Checkerboard cowl',g:'scarves',l:'Beginner',t:'colourwork',d:'Two-stitch squares that teach you to carry yarn neatly behind the work.',cols:[BASE,'#b23a48'],rows:rows(12,12,(r,c)=>((r>>1)+(c>>1))%2)},
{n:'Little heart motif',g:'mittens',l:'Beginner',t:'colourwork',d:'A small heart to place on mittens, a hat or a cushion.',cols:[BASE,'#b23a48'],rows:['00110001100','01111011110','01111111110','01111111110','00111111100','00011111000','00001110000','00000100000']},
{n:'Snowflake yoke',g:'jumpers',l:'Intermediate',t:'colourwork',d:'A symmetrical snowflake with a gold centre, repeated around a yoke.',cols:['#26335b','#cfe3f1','#d9a21b'],rows:rows(13,13,(r,c)=>{const a=Math.abs(c-6),b=Math.abs(r-6);return!a&&!b?2:Math.max(a,b)<6&&(!a||!b||a==b)?1:0})},
{n:'Mountain range scarf',g:'scarves',l:'Intermediate',t:'colourwork',d:'Snow-capped peaks across a 24-stitch repeat.',cols:['#cfe3f1','#26335b',BASE],rows:(()=>{const H=[1,2,3,4,5,6,5,4,3,4,5,6,7,6,5,4,3,2,3,4,3,2,1,1];return rows(9,24,(r,c)=>{const d=9-r;return d==H[c]&&d>3?2:d<=H[c]?1:0})})()},
{n:'Diamond Fair Isle band',g:'hats',l:'Intermediate',t:'colourwork',d:'Eight-stitch diamonds in mustard and oat on charcoal.',cols:['#2b2b2e','#d9a21b',BASE],rows:rows(9,16,(r,c)=>{const d=Math.abs(c%8-3.5)+Math.abs(r-4);return d<=1.5?2:d<=4.5?1:0})},
{n:'Simple cable column',g:'scarves',l:'Intermediate',t:'cable',d:'A four-stitch cable framed by purl columns, crossed every fourth row.',rows:rows(8,8,(r,c)=>c<2||c>5?'p':r%4==1?'f':'k')},
{n:'Eyelet leaf lace',g:'scarves',l:'Intermediate',t:'lace',d:'Yarn overs paired with decreases, worked on right-side rows with purl between.',rows:rows(6,9,(r,c)=>r%2?'kko\\k/okk'[c]:'k')},
{n:'Rib cuff swatch',g:'mittens',l:'Beginner',t:'textured',d:'Knit one, purl one rib for cuffs and hems.',rows:rows(8,8,(r,c)=>c%2?'p':'k')},
{n:'Basket weave blanket',g:'blankets',l:'Beginner',t:'textured',d:'Four-by-four blocks of knit and purl that look woven.',rows:rows(8,8,(r,c)=>((r>>2)+(c>>2))%2?'p':'k')},
{n:'Cherries',g:'hats',l:'Intermediate',t:'colourwork',d:'A pair of shiny cherries on their stems, with a leaf on top.',cols:[BASE,'#b23a48','#5f7a3b','#f6b8c4'],rows:(()=>{const seg=(x,y,x1,y1,x2,y2)=>{const dx=x2-x1,dy=y2-y1,t=Math.max(0,Math.min(1,((x-x1)*dx+(y-y1)*dy)/(dx*dx+dy*dy)));return Math.hypot(x-(x1+t*dx),y-(y1+t*dy))};
 return rows(16,15,(r,c)=>{const x=c+.5,y=r+.5,d1=Math.hypot(x-3.8,y-11.6),d2=Math.hypot(x-10.8,y-12.2);
  if(Math.hypot(x-2.7,y-10.3)<.9||Math.hypot(x-9.7,y-10.9)<.9)return 3;if(d1<3.7||d2<3.5)return 1;
  if(Math.hypot((x-11.4)/3,(y-2.5)/1.5)<1)return 2;if(seg(x,y,3.8,8.1,7.8,2.6)<.65||seg(x,y,10.8,8.7,7.8,2.6)<.65)return 2;return 0})})()},
{n:'Leopard print',g:'hats',l:'Intermediate',t:'colourwork',d:'Rosette spots on a pink ground, with mint centres. Repeats in 16 stitches.',cols:['#ff9acb','#2b2b2e','#8cf5b4'],rows:(()=>{const G=Array.from({length:16},()=>Array(16).fill(0)),RO=['011110','100001','102201','102200','100001','011100'],RO2=['001110','010001','102201','102201','100010','011100'];
 const st=(P,x,y)=>P.forEach((s,j)=>[...s].forEach((ch,i)=>{if(ch!='0')G[(y+j)%16][(x+i)%16]=+ch}));st(RO,1,0);st(RO2,9,8);
 [[10,2],[11,2],[11,3],[2,9],[3,9],[2,10],[7,6],[8,6],[14,5],[14,6],[15,6],[6,13],[6,14],[5,14],[13,0],[12,0]].forEach(([x,y])=>G[y][x]=1);return G.map(r=>r.join(''))})()},
{n:'Lightning bolt',g:'hats',l:'Beginner',t:'colourwork',d:'A zap of yellow on black. Ten stitches wide, so it tiles neatly around a hat.',cols:['#1b1022','#ffe552'],rows:['0000011100','0000111000','0001110000','0011100000','0111111100','0000111000','0001110000','0011100000','0111000000','0110000000']},
{n:'Smiley',g:'bags',l:'Beginner',t:'colourwork',d:'A happy face in thirteen stitches. Good for pockets, patches and tote bags.',cols:[BASE,'#ffe552','#1b1022'],rows:rows(13,13,(r,c)=>{if(Math.hypot(c-6,r-6)>6.3)return 0;if((r==4||r==5)&&(c==4||c==8))return 2;if((r==9&&c>=4&&c<=8)||(r==8&&(c==3||c==9)))return 2;return 1})},
{n:'Sparkle star',g:'jumpers',l:'Beginner',t:'colourwork',d:'A four-point sparkle to scatter over a jumper or the back of a mitten.',cols:[BASE,'#ff5cad'],rows:rows(13,13,(r,c)=>{const a=Math.abs(c-6),b=Math.abs(r-6);return a*b<=2||a+b<=3?1:0})},
{n:'Zigzag stripes',g:'scarves',l:'Beginner',t:'colourwork',d:'Pink and mint chevrons in an eight-row, twelve-stitch repeat.',cols:['#ff5cad','#8cf5b4'],rows:rows(8,12,(r,c)=>((c+(r<4?r:7-r))%4<2)?1:0)},
{n:'Seed stitch',g:'blankets',l:'Beginner',t:'textured',d:'Alternating knit and purl for a bumpy, reversible fabric that lies flat.',rows:rows(8,8,(r,c)=>(r+c)%2?'p':'k')}
];
const DECOR=P.slice();P.length=0; // original sample charts kept only for home-page artwork, not listed anywhere
NAMES['#1b7fb0']='Blue';NAMES['#17171a']='Black';for(const[k,v]of Object.entries({'#f6b8c4':'Blush','#ff9acb':'Pink'}))if(!NAMES[k])NAMES[k]=v;
P.push({n:'Cow print bag panel',g:'bags',cat:'animal-print',l:'Beginner',t:'colourwork',d:'Cow print panel for the crochet shoulder bag: 20 stitches wide and 40 rows. Folded in half it gives a front and a back.',cols:['#1b7fb0','#17171a'],rows:["11000000000011111110", "11100000000111111111", "11011111000111111111", "01111111100011111111", "01111111110001111111", "01111111110000111111", "00111111111000011111", "00111111111000001111", "00011111100000000111", "00001111000000000011", "00000111000000011110", "00000110000111100111", "00011100001111110011", "00111110001111110000", "00111110000111100000", "00011100000000000001", "11000000000000000011", "11100000000000000000", "01100000000000000000", "00000000000000000000", "00000000000000000000", "00000000000000000110", "00000000000000000111", "11000000000000000011", "10000000000000111000", "00000111100001111100", "00001111110001111100", "11001111110000111000", "11100111100001100000", "01111000000011100000", "11000000000011110000", "11100000000111111000", "11110000011111111100", "11111000011111111100", "11111100001111111110", "11111110001111111110", "11111111000111111110", "11111111100011111011", "11111111100000000111", "01111111000000000011"]});
const CRAFTS={knit:{n:'Knit',d:'Jumpers, hats, bags and more'},crochet:{n:'Crochet',d:'Bags and more'},crossstitch:{n:'Cross stitch',d:'Coming soon'}};
const CATS=[['jumpers','Jumpers'],['hats','Hats'],['bags','Bags'],['scarves','Scarves'],['mittens','Mittens & gloves'],['blankets','Blankets & homewares']];const CATN=Object.fromEntries(CATS);
const POSTS=[
{id:'welcome',t:'Welcome to Moll’s Studio',date:'2026-11-14',tag:'Studio news',sample:1,body:['This is a sample post. Moll’s Studio is where patterns, projects and charts live together.','Posts will share works in progress, finished makes and tips. Replace this text with your own story and photos.']},
{id:'read-a-chart',c:'knit',t:'How to read a knitting chart',date:'2026-11-14',tag:'Tips',sample:1,go:'colourwork',body:['A knitting chart is a picture of your fabric as seen from the right side. Each square is one stitch and each line of squares is one row.','Start at the bottom right corner. Read right-side rows from right to left, then turn your work and read wrong-side rows from left to right.','On wrong-side rows, work knit symbols as purl and purl symbols as knit, so the pattern shows correctly on the front.','Knitting in the round? Read every row from right to left and work every stitch as it appears on the chart.','Try it: draw a motif in a chart maker, then open Written instructions to see the same chart written out row by row.']}
];
// Replace these clearly labelled examples with real shop listings and image paths.
const SHOP_LISTINGS=[
 {id:'cow-print-shoulder-bag',title:'Cow Print Shoulder Bag',category:'Crochet bags',price:35,added:'2026-09-02',status:'sold',soldAt:'2026-09-10',icon:'👜',colors:['#8fd3f4','#1b7fb0'],description:'A chunky crochet shoulder bag in a blue and black cow print, with a long chain handle.',details:'Sold. Made from my Cow Print Shoulder Bag pattern. Kept here as part of the gallery of past makes.',pattern:'cow-print-shoulder-bag',image:'images/cow-print-bag.jpg'},
 {id:'stripy-scarf',title:'Stripy Scarf',category:'Hand-knit scarves',price:30,added:'2026-08-15',status:'sold',soldAt:'2026-08-28',icon:'🧣',colors:['#ffd3ea','#9aa84a'],description:'A long chunky scarf knitted in pink and olive green stripes, worked in a half twisted rib.',details:'Sold. Made from my Stripy Scarf pattern. Kept here as part of the gallery of past makes.',pattern:'stripy-scarf',image:'images/stripy-scarf.jpg'},
 {id:'granny-square-scarf',title:'Granny Square Scarf',category:'Crochet scarves',price:40,added:'2026-07-20',status:'sold',soldAt:'2026-08-05',icon:'🧶',colors:['#e6d9ff','#b79cf0'],description:'A lilac scarf made from 8 granny squares, each with its own coloured border.',details:'Sold. Made from my Granny Square Scarf pattern. Kept here as part of the gallery of past makes.',pattern:'granny-square-scarf',image:'images/granny-square-scarf.jpg'},
 {id:'checkerboard-hat',title:'Checkerboard Hat',category:'Crochet hats',price:28,added:'2026-10-01',status:'sold',soldAt:'2026-10-12',icon:'🧢',colors:['#e4ffa0','#ff5cad'],description:'A fluffy mohair hat in lime green and hot pink checks with a black rim.',details:'Sold. Made from my Checkerboard Hat pattern. Kept here as part of the gallery of past makes.',pattern:'checkerboard-hat',image:'images/checkerboard-hat-front.jpg'},
 {id:'purple-cat-hat',title:'Purple and Black Cat Hat',category:'Crochet hats',price:25,added:'2026-10-18',status:'sold',soldAt:'2026-10-25',icon:'🐱',colors:['#d9c2ff','#1b1022'],description:'A striped cat ear hat in purple and black.',details:'Sold. Made from my Cat Hat pattern. Kept here as part of the gallery of past makes.',pattern:'cat-hat',image:'images/cat-hat.jpg'},
 {id:'fluffy-cat-hat',title:'Fluffy Cat Hat',category:'Crochet hats',price:28,added:'2026-11-01',status:'sold',soldAt:'2026-11-09',icon:'🐱',colors:['#ff9acb','#7d2e4b'],description:'A fluffy pink and black cat ear hat with a folded cuff.',details:'Sold. Made from my Cat Hat pattern. Kept here as part of the gallery of past makes.',pattern:'cat-hat',image:'images/cat-hat-pink.jpg'}
];
const PAT=[
{id:'checkerboard-hat',n:'Checkerboard Hat',c:'crochet',g:'hats',l:'Beginner',img:'images/checkerboard-hat-front.jpg',imgAlt:'Crocheted hat in a lime green and hot pink checkerboard with a black rim, worn',more:[{src:'images/checkerboard-hat.jpg',alt:'The checkerboard hat from the side'},{src:'images/checkerboard-hat-top.jpg',alt:'Top of the checkerboard hat, seen from above'},{src:'images/checkerboard-hat-4.jpg',alt:'The checkerboard hat'}],d:'A fluffy mohair hat worked in the round in lime green and hot pink, with a black rim. The colour blocks make a checkerboard pattern.',
 dims:[['Hat circumference',52],['Hat height',21]], ty:'hat',t:.25,sh:[.43,.43,.14],w:3,use:[{n:'Colour A: lime green',g:30,est:1},{n:'Colour B: hot pink',g:30,est:1},{n:'Colour C: black',g:10,est:1}], yarn:'Mohair wool, used double (two layers together). Colour A: lime green. Colour B: hot pink. Colour C: black',needles:'5.5 mm crochet hook',notions:'Tapestry needle',
 charts:[],
 steps:[
 {h:'Before you start',s:['Don’t turn your work in this project. Work in the round and keep going in the same direction.']},
 {h:'The hat',s:['Row 1: Magic loop and dc 10 in Colour A (lime green).','Row 2: 2 dc Colour A, 2 dc Colour B, until end of rnd (20 sts).','Row 3: Colour B (hot pink) inc, dc, Colour A inc, dc, until end of row (30 sts).','Row 4: Colour A inc, 2 dc, Colour B inc, 2 dc, until end of rnd (40 sts).','Row 5: Colour A inc, 3 dc, Colour B inc, 3 dc, until end of rnd (50 sts).','Row 6: Colour A inc, 4 dc, Colour B inc, 5 dc, until end of rnd (60 sts).','Row 7: Colour B 6 dc, Colour A 6 dc, until end of rnd (60 sts).','Rows 8–9: Repeat row 7.','Rows 10–12: Colour A 6 dc, Colour B 6 dc, until end of rnd.','Row 13: Colour C (black), 60 sc for the rim.']},
 {h:'Finishing',s:['Sew in the ends and snip. This should create a checkerboard pattern.']}
 ]},
{id:'cat-hat',n:'Cat Hat',c:'crochet',g:'hats',l:'Beginner',img:'images/cat-hat-pink.jpg',imgAlt:'A fluffy pink and black crocheted cat hat with a folded cuff',more:[{src:'images/cat-hat.jpg',alt:'Crocheted cat hat with ears in purple and black stripes'},{src:'images/cat-hat-black.jpg',alt:'A black cat hat with a thin pink stripe'},{src:'images/cat-hat-grey.jpg',alt:'A striped cat hat in grey and pink'}],d:'A simple cat ear hat worked as one flat panel, then sewn up. Make it in any yarn, any stitch and any colours: stripes, fluffy, or with a different colour on the edge.',
 dims:[['Hat circumference',54],['Hat height',20]], ty:'hat',t:.3,sh:[1],w:4,use:[{n:'Yarn',g:65,est:1}], yarn:'Any yarn. Use a bigger hook with thicker yarn. A different hook and wool was used for each hat in the photos',needles:'Any crochet hook to suit your yarn',size:'Chain enough to fit around your head. Chain more for a looser hat and fewer for a snug one. It should stretch a little with loose tension',notions:'Tapestry needle and scissors',
 charts:[],
 steps:[
 {h:'Make the panel',s:['Chain enough to fit around your head. Chain more if you want the hat looser, or fewer if you want it snug. It should stretch a bit with a loose tension.','Row 1: Work dc to the end of the row. You can use any stitch you like here: sc, hdc, dc or tc.','Ch 2 and turn your work.','Repeat the row until you are happy with the height. Make sure the panel reaches the top of your head.','Add about 2 inches (5 cm) if you want a cuff on the hat.','Check that the panel fits all the way around your head.']},
 {h:'Sew it up',s:['Sew the short ends together with a tapestry needle to make a tube.','On the folded side (the top), sew the edges together across the top and sew around the corners to create the cat ear effect.','Flip the hat inside out.']},
 {h:'Finishing',s:['Sew in the ends and trim.','Have fun with it: use alternating colours to make stripes, make it fluffy, or add detail like a different colour on the edge.']}
 ]},
{id:'granny-square-scarf',n:'Granny Square Scarf',c:'crochet',g:'scarves',l:'Beginner',img:'images/granny-square-scarf.jpg',imgAlt:'Crocheted granny square scarf in lilac with yellow, purple, black and multicolour borders',d:'A scarf made from 8 lilac granny squares, each finished with a border in its own colour and sewn together. Written in US crochet terms.',
 dims:[['Scarf length',120],['Scarf width',15]], ty:'scarf',t:.1,sh:[.825,.035,.035,.035,.07],w:3,use:[{n:'Colour A: lilac',g:80,est:1},{n:'Colour B: yellow',g:3.6,est:1},{n:'Colour C: purple',g:3.6,est:1},{n:'Colour D: black',g:3.6,est:1},{n:'Colour E: multicolour',g:8,est:1}], yarn:'DK yarn. Colour A: lilac (all 8 squares). Border colours: B yellow, C purple, D black and E multicolour (purple, yellow and pink)',needles:'5.5 mm crochet hook',size:'8 granny squares',notions:'Tapestry needle and scissors',
 charts:[],
 steps:[
 {h:'Granny square (make 8)',s:['With Colour A (lilac), make a magic loop. If you can’t do a magic loop, chain 3 and join in the round to make a circle.','Round 1: Ch 2, then work 3 dc into the loop, ch 1, 3 dc, ch 1, 3 dc, ch 1, 3 dc, ch 1. Slip stitch into the first dc and ch 2.','Round 2 and every round after: 3 dc in every gap. At each corner work 3 dc, ch 2, 3 dc to make the corner. Slip stitch into the first dc and ch 2 at the end of each round.','Repeat until you have 6 rounds of Colour A.']},
 {h:'Borders',s:['Work one more round around each granny square in its border colour.','Colour B (yellow): border for 2 squares.','Colour C (purple): border for 2 squares.','Colour D (black): border for 2 squares.','Colour E (multicolour purple, yellow and pink): border for 2 squares.']},
 {h:'Finishing',s:['Use a tapestry needle to sew the squares together.','Sew in all the ends and snip off any extra yarn. Your scarf is done.']}
 ]},
{id:'stripy-scarf',n:'Stripy Scarf',g:'scarves',l:'Beginner',img:'images/stripy-scarf.jpg',imgAlt:'Knitted scarf in pink and olive green stripes',d:'A chunky stripy scarf in two colours, worked flat in a 1x1 half twisted rib. Four rows of one colour, four rows of the other, repeated until it is as long as you like.',
 dims:[['Width',18],['Length (128 rows)',70]], ty:'scarf',t:.3,sh:[.5,.5],w:5,use:[{n:'Colour A: pink',g:140,est:1},{n:'Colour B: olive green',g:140,est:1}], yarn:'Chunky yarn, Two colours: Colour A (pink in the photo) and Colour B (olive green in the photo). Any two colours work',needles:'6 mm needles, straight or circular (the scarf is knitted flat)',size:'24 stitches wide',finished:'Length is up to you. A good rule of thumb is a scarf as long as you are tall',notions:'Tapestry needle and scissors',
 charts:[],
 steps:[
 {h:'The scarf',s:['With 6 mm needles and Colour A, cast on 24 sts using the long tail cast on method.','Work 4 rows in 1x1 half twisted rib in Colour A.','Change to Colour B and work 4 rows in 1x1 half twisted rib.','Change back to Colour A and work 4 rows. Keep changing colour every 4 rows, repeating until the scarf is the length you want.','The scarf in the photo has 16 blocks of each colour, 128 rows altogether.']},
 {h:'Finishing',s:['Cast off and sew in the ends.']},
 {h:'Tip',s:['A good rule of thumb is that you want your scarf to be as long as you are tall.']}
 ]},
{id:'cow-print-shoulder-bag',n:'Cow Print Shoulder Bag',c:'crochet',g:'bags',l:'Beginner',img:'images/cow-print-bag.jpg',imgAlt:'Crocheted cow print shoulder bag in blue and black',d:'A small crocheted shoulder bag with a cow print in two colours. It is worked as one long panel in single crochet, folded in half, stitched up the sides and finished with a handle.',
 dims:[['Bag width',25],['Bag height',22]], w:5,use:[{n:'Colour A: blue',g:40,est:1},{n:'Colour B: black',g:35,est:1}], yarn:'Chunky yarn in 2 colours: blue and black (any two colours work)',needles:'8 mm crochet hook',size:'15 cm wide × 22 cm high',notions:'Tapestry needle and scissors',
 charts:[{id:'A',ref:'Cow print bag panel',cap:'Chart A: cow print panel, 20 sts and 40 rows'}],
 steps:[
 {h:'Bag panel',s:['Chain 21 in the colour of your first stitch on the chart.','Row 1: sc in the 2nd ch from the hook and in each ch across. 20 sc.','Ch 1, turn. Sc in each st across, changing colour as you follow Chart A.','Repeat the last row until you have worked all 40 rows of the chart. Every row is single crochet.',{chart:'A'}]},
 {h:'Make up the bag',s:['Fold the panel in half so the short ends meet. The fold is the bottom of the bag.','With a tapestry needle, join the sides with blanket stitch.']},
 {h:'Handle',s:['Chain 5.','Row 1: hdc in the 2nd ch from the hook and in each ch across. 4 hdc.','Ch 2, turn. Hdc in each st across.','Repeat the last row for 30 rows, or as long as you like your handle.','Sew the handle to the bag.']},
 {h:'Finishing',s:['Sew in all the ends and snip off any extra yarn. Your bag is complete.']}
 ]}
];
function toGrid(p){if(p.grid)return{w:p.grid.w,h:p.grid.h,col:p.grid.col.slice(),sym:p.grid.sym.slice()};const col=[],sym=[];p.rows.forEach(r=>[...r].forEach(ch=>{if(/\d/.test(ch)){col.push(p.cols[+ch]);sym.push('')}else{col.push(BASE);sym.push(CM[ch])}}));return{w:p.rows[0].length,h:p.rows.length,col,sym}}

/* ---------- state ---------- */
let dirty=false,lastHash='',skipRoute=false,kind='',docs={},S,undo,redo,pal,color,sym,tool,view='chart',pend=null,pendProj=null,rect=null;
var jrChartChoices={},jrPhotoUrls=[];
const Kp=k=>'stitchboard:projects:'+k,Dp=k=>'stitchboard:draft:'+k;
function blank(o,w,h){o.tile=null;o.w=w;o.h=h;o.col=Array(w*h).fill(BASE);o.sym=Array(w*h).fill('')}
function newDoc(k){const d={S:{name:''},undo:[],redo:[],pal:[BASE,'#ff5cad','#ff9acb','#ffd3ea','#8cf5b4','#2fbf71','#ffe552','#1b1022'],color:'#ff5cad',sym:KINDS[k].sym?KINDS[k].sym[0]:'k',tool:KINDS[k].tools[0]};blank(d.S,16,16);
 return d}
const snap=()=>JSON.stringify({w:S.w,h:S.h,col:S.col,sym:S.sym,pal:typeof pal!='undefined'&&KINDS[kind]&&KINDS[kind].knit?pal:undefined});
function load(o){S.tile=null;S.w=o.w;S.h=o.h;S.col=o.col.slice();S.sym=o.sym.slice();if(o.pal)pal=o.pal.slice();$('#gw').value=S.w;$('#gh').value=S.h}
function commit(b){if(snap()!==b){dirty=true;undo.push(b);if(undo.length>100)undo.shift();redo=[];draft()}}
function draft(){}
try{Object.keys(localStorage).filter(k=>k.startsWith('stitchboard:draft:')).forEach(k=>localStorage.removeItem(k))}catch(e){}
const msg=t=>{$('#msg').textContent=t};
const lum=h=>{const n=parseInt(h.slice(1),16);return(.299*(n>>16)+.587*((n>>8)&255)+.114*(n&255))/255};
function shade(h,a){const n=parseInt(h.slice(1),16),f=v=>Math.max(0,Math.min(255,Math.round(a<0?v*(1+a):v+(255-v)*a)));return`rgb(${f(n>>16)},${f((n>>8)&255)},${f(n&255)})`}

/* ---------- drawing ---------- */
function glyph(ctx,s,x,y,n,col){const m=n*.24,l=x+m,r=x+n-m,t=y+m,b=y+n-m,cx=x+n/2,cy=y+n/2;ctx.strokeStyle=col;ctx.fillStyle=col;ctx.lineWidth=Math.max(1.5,n*.1);ctx.lineCap='round';ctx.lineJoin='round';ctx.beginPath();
 if(s=='k'){ctx.moveTo(cx,t);ctx.lineTo(cx,b)}
 else if(s=='p'){ctx.arc(cx,cy,n*.12,0,7);ctx.fill();ctx.beginPath()}
 else if(s=='yo')ctx.arc(cx,cy,n*.22,0,7);
 else if(s=='k2'){ctx.moveTo(l,b);ctx.lineTo(r,t)}
 else if(s=='ssk'){ctx.moveTo(l,t);ctx.lineTo(r,b)}
 else if(s=='sk2p'){ctx.moveTo(l,b);ctx.lineTo(cx,t);ctx.lineTo(r,b);ctx.moveTo(cx,t);ctx.lineTo(cx,b)}
 else if(s=='inc'){ctx.moveTo(l,b);ctx.lineTo(cx,t);ctx.lineTo(r,b);ctx.closePath()}
 else if(s=='sl'){ctx.moveTo(l,t);ctx.lineTo(cx,b);ctx.lineTo(r,t)}
 else if(s=='c2r'){ctx.moveTo(l,b);ctx.lineTo(r,t);ctx.moveTo(l,cy);ctx.lineTo(r,cy)}
 else if(s=='c2l'){ctx.moveTo(l,t);ctx.lineTo(r,b);ctx.moveTo(l,cy);ctx.lineTo(r,cy)}
 else if(s=='c4f'||s=='c2f'||s=='c3f'){ctx.moveTo(l,b);ctx.lineTo(r,t);ctx.moveTo(l,t);ctx.lineTo(r,t)}
 else if(s=='c4b'||s=='c2b'||s=='c3b'){ctx.moveTo(l,t);ctx.lineTo(r,b);ctx.moveTo(l,b);ctx.lineTo(r,b)}
 else if(s=='ns'){ctx.fillStyle='#c3c9d3';ctx.fillRect(x,y,n,n);return}
 ctx.stroke()}
const CABW={c4f:4,c4b:4,c2f:2,c2b:2,c3f:3,c3b:3},CABC={f:4,b:4,F:2,B:2,g:3,h:3},ISCAB=s=>CABW.hasOwnProperty(s);
function collapseCab(a){const o=[];for(let i=0;i<a.length;){const v=a[i],W=CABW[v]||CABC[v];if(W){let e=i;while(e<a.length&&a[e]==v)e++;const n=Math.floor((e-i)/W);for(let j=0;j<n;j++)o.push(v);for(let j=0;j<(e-i)%W;j++)o.push('k');i=e}else{o.push(v);i++}}return o}
function cabMap(sym,w,h){const m=new Int8Array(w*h).fill(-1);for(let r=0;r<h;r++){let c=0;while(c<w){const s=sym[r*w+c];if(!ISCAB(s)){c++;continue}let e=c;while(e<w&&sym[r*w+e]==s)e++;const W=CABW[s],L=Math.floor((e-c)/W)*W;for(let j=0;j<L;j++)m[r*w+c+j]=j%W;c=e}}return m}
function cableLines(s){const W=CABW[s],f=s=='c4b'||s=='c2b'||s=='c3b',X=v=>v==0?.1:v==4?3.9:v,Y=v=>v==0?.1:v==1?.9:v,a=f?[[0,1,2,0],[0,0,1,.5],[2,1,4,0],[4,1,3,.5]]:[[0,0,2,1],[0,1,1,.5],[2,0,4,1],[4,0,3,.5]];return a.map(l=>[X(l[0])*W/4,Y(l[1]),X(l[2])*W/4,Y(l[3])])}
function cableGlyph(ctx,s,x,y,n,k,col){ctx.save();ctx.beginPath();ctx.rect(x,y,n,n);ctx.clip();ctx.strokeStyle=col;ctx.lineWidth=Math.max(1.5,n*.1);ctx.lineCap='round';ctx.beginPath();cableLines(s).forEach(l=>{ctx.moveTo(x-k*n+l[0]*n,y+l[1]*n);ctx.lineTo(x-k*n+l[2]*n,y+l[3]*n)});ctx.stroke();ctx.restore()}
function cableWide(ctx,s,x,y,n,col){const W=CABW[s];for(let k=0;k<W;k++)cableGlyph(ctx,s,x+k*n,y,n,k,col);ctx.strokeStyle='#999';ctx.lineWidth=1;ctx.strokeRect(x+.5,y+.5,W*n-1,n-1)}
function cabGroup(sym,w,c,r){const s=sym[r*w+c];if(!ISCAB(s))return null;const W=CABW[s];let a=c;while(a>0&&sym[r*w+a-1]==s)a--;let e=c;while(e<w-1&&sym[r*w+e+1]==s)e++;const st=a+Math.floor((c-a)/W)*W;return st+W-1<=e?[st,st+W-1]:null}
function drawChart(ctx,g,cell,ink,nolab,rows,fmin){const{w,h}=g,cab=cabMap(g.sym,w,h);
 for(let r=0;r<h;r++)for(let c=0;c<w;c++){const i=r*w+c,x=c*cell,y=r*cell;ctx.fillStyle=g.col[i];ctx.fillRect(x,y,cell,cell);if(g.sym[i]){const ink2=lum(g.col[i])>.5?INK:'#fff';if(cab[i]>=0)cableGlyph(ctx,g.sym[i],x,y,cell,cab[i],ink2);else glyph(ctx,g.sym[i],x,y,cell,ink2)}}
 ctx.strokeStyle='rgba(70,80,100,.55)';ctx.lineWidth=1;ctx.beginPath();
 for(let c=0;c<=w;c++)for(let r=0;r<h;r++){if(c>0&&c<w&&cab[r*w+c]>0)continue;ctx.moveTo(c*cell+.5,r*cell);ctx.lineTo(c*cell+.5,(r+1)*cell)}for(let r=0;r<=h;r++){ctx.moveTo(0,r*cell+.5);ctx.lineTo(w*cell,r*cell+.5)}ctx.stroke();
 if(g.hsplit){ctx.strokeStyle='#e0007a';ctx.lineWidth=Math.max(2,cell*.18);ctx.beginPath();ctx.moveTo(0,(h-g.hsplit)*cell);ctx.lineTo(w*cell,(h-g.hsplit)*cell);ctx.stroke()}
 if(g.split){ctx.strokeStyle='#e0007a';ctx.lineWidth=Math.max(2,cell*.18);ctx.beginPath();ctx.moveTo(g.split*cell,0);ctx.lineTo(g.split*cell,h*cell);ctx.stroke()}
 if(nolab)return;ctx.fillStyle=ink;ctx.font=`${Math.max(fmin||9,cell*.38)}px sans-serif`;ctx.textAlign='left';ctx.textBaseline='middle';
 const fs=Math.max(fmin||9,cell*.38),pick=m=>[1,2,5,10,20,50,100].find(t=>t*cell>=m)||100,sr=pick(fs+4),sc=pick(fs*.62*String(w).length+8);
 if(rows){const every=fmin||cell>=fs+2?1:sr;ctx.font=`${Math.max(8,Math.min(fs,fmin?cell*.95:cell*.8))}px sans-serif`;for(let r=0;r<h;r++){const v=h-r;if(every==1||v==1||v%every==0)ctx.fillText(`${g.round||v%2?'← k':'→ p'} ${v}`,w*cell+6,r*cell+cell/2)}ctx.font=`${fs}px sans-serif`}
 else for(let r=0;r<h;r++){const v=h-r;if(v==1||v%sr==0)ctx.fillText(v,w*cell+6,r*cell+cell/2)}ctx.textAlign='center';ctx.textBaseline='top';for(let c=0;c<w;c++){const v=w-c;if(v==1||v%sc==0)ctx.fillText(v,c*cell+cell/2,h*cell+5)}}
/* knitted preview: each stitch is a plain, flat V */
/* knitted stockinette: one stitch cut from a knitting texture, tinted per colour and tiled */
const KIT=Uint8Array.from(atob("VWV7i5KSkpKTlJSUk5GQjo6Oj5CSkY+NioR6a1pOTVhpeoaNkpWWlpSRj42Oj5GTlJSUk5KSk5ONfmhXSlx2iZKTkpKTlJSUk5KQj46Oj5GTlJKQjYh/cmJXVV5ufomQlJaXl5SRj46OkJKTlJSUk5KSlJOKd11KQFNvhpGTkpKTlJSUlJORj46Oj5GUlZWTkIyEeGldWmJxgYySlpeYlpSRj46PkZOUlZSTkpKTlJGFblNAOEtngI6Tk5KTk5SUlJOSkI6Oj5GUlpaVk4+IfG5iXmV0g46Ul5iXlpOQj4+QkpSVlZSTkpKUlI59ZEk4NUVeeIqSk5OSk5SUlZSTkY+Oj5GUlpeXlZGKgHJlYWd1hZCVl5iXlZOQj4+Rk5WVlZSTkpOUkodzWUI0NUFVboOPlJOTk5OUlZWTkpCPj5GTlpeXlpONgnRnYWh2hpGWl5iWlJKQkJGSlJWWlZSTk5STjH1mTz00NT1LYXmKk5STkpOUlZWUk5GQj5CTlZeYl5WPhXZoYmd2h5KXmJeWlJKRkZKTlZaWlZSTlJSPgm1WQzc0ODpDVW2DkJSUk5KUlZaVlJKQkJCSlZeYmJaRh3hpYWZ2iJOXmJaVk5GRkZOUlpaWlZSUlJKIdl5IOjY2OTg8SV94ipOVlJOTlZaWlJORkJGSlJaXmJaSiXpqYWV1h5SYl5WUkpGRkpSVlpaWlpWUk4x9aFA/Nzc5PDg3P1JqgY+VlZOUlZaWlZSSkZGSk5WXl5eTi31sYWNzh5SYl5STkpGSk5SWl5eXlpWTjoNxW0g9Ojw9Pzg0N0Rbc4eSlZWUlZaWlpWTkpGSk5WWl5eUjX9uYWJyhpOYlpORkZKTlJWWl5eXlpOOhXdmVUpFRUZERTw1NDxNZHuLk5WVlZaXlpaUk5KSkpSVl5eVjoFvYmJxhZOXlZKQkJKTlZaXmJiXlI+He2xeVVNTVFJNTEM8ODtGWG6AjZOWlpeXl5aVlJOSkpOUlpeVj4NxY2FwhJKWk5COj5KUlpeYmZiVkId8cWZeXF5iYl5WVEtFQkJHUWJ0hI6UlpeXl5eWlZOSkZKTlZaVkIRyY2Fvg5GVko6Nj5KVl5iZmZeRiX5zamVjZmpubWdeWlRRUFBQU1xpeIWOlJeYmJeWlZSSkZGSk5WVkIVzZGFugpCUkIyMjpKWmJmamJOKgHVuamlrb3N1c21jX1tcXl9dW1xibXqGj5aYmZiXlpSSkZCQkpSUkIVzZGFugpCTj4uLjpOXmZqYlIyCd3BtbXB0d3l6d3BmYV9jZ2ppZWJjaHF7h5CWmZmZl5WTkI6OkJOUkIVzY2BtgY+SjYmKjpSYmZiTjIN5cnBxdHd6fH59eXJoY2NobnJzcGxpaGtyfYiSl5qZmJaTkI2MjpGTj4RyY19tgY6RjYmKj5SXl5OMg3lzcXN3e35/gIGAe3NpZWZrc3d5d3RwbmxudX+JkpeamZeUj4yLjJCSj4NxYV9sgY6RjYmKj5OUkYqCeXRydHh9gIKDhISDfXRraGlvdnt9fHt4dXFvcHZ/ipKYmZiUkIuKi46RjoJwYF5sgI6RjYqKjpCOiIB4c3J0eX6Cg4SFh4eFf3Zsamxzen+BgH9+fHhzcXJ3gImRlpeVkIuJio6QjYFuX11rgI6RjoqJiYmEfXZycXR5foKEhoaIiYqHgXdubXB2foKEhIOCgX55dXFyd3+IkJSUkIyJio6QjH9sXFtpfYyQjIeEgn96dHBwc3h+goWGh4iKi4uIgnhwb3J5gIWHhoWFhIJ/enVycnZ+ho2Qj4yKi4+Qi31pWFZjeIaKhoB7eHVyb3BzeH2ChYeIiYqMjYyJgnlxcXR7goeJiYiGhoWDgHt1cXB0fIOJioqKjI+QinpkU09bbnx/fHZyb21tb3J3fYKFh4iJi4yNjo2Jg3pzcnZ8g4iKi4qJh4eGg396dHBwc3l+goSHio6OhnVeTEZPX2pubGloaGptcXd8gYSHiIqLjY6Pj42Kg3t0dHd9hImLjIyLiYiHhoN/eXRwb3B0eHyAhYmJf25XRT5DTlhcXV5hZmtxdnyBhIaIiouNjo+QkI6KhHx2dnl+hImMjY2Ni4qJh4WDfnlzb21tb3F1en58c2NPQDk7QUhNUllgaHB2e4CEhoiKi42OkJGRkI6LhX13d3p/hYmMjo+OjYyKiYeFgn55c25raGdpbG5rY1ZIPDY2OT5ETllkbnZ7gIOGiImLjY6QkZGRkY+Lhn95eXuAhoqNj5CQj46MiomHhYJ9eHNtZ2NfXVtXUkpCOjc2OD1GU2BsdXuAg4aIiYuMjo+RkpKSkZCMh4B7en2Ch4uOkJGRkI+OjIqJh4WCfnhya2JaUktGQ0A9Ojk5PENPXGl0e4CEhoiJioyNj5CRkpKSkpCNiIF8e36DiIuOkJGSkZCPjYyKiYeFgn14cWdcUEU+Ozo6Ojo8QkxaaHN7gISHiIqKi4yOj5GSk5OSkpGOiYN9fH+EiYyPkZKTkpGQjo2LiomHhYJ9d29jVUc9OTg5OjxASldmcnuAhIeJi4uLjI2PkJGSk5OTkpGOioR+fYCFio2PkZKTk5KRj46Ni4qJh4WCfXZsYFFFPDg3OT1FUmFveYCEiIqMjIyMjY6PkZKTk5OTkpGPi4R/fICGi46QkZOTk5KRkI+NjIuLiYiFgn12bF5QQzo2OD9LWmp2f4SIi42OjY2MjY6QkZKTk5OSkpGPi4R+en6GjI+QkpOTk5OSkY+OjYyMi4qIhoJ9dWlbSz43OEJRYnF9g4iLjo+Pjo2NjY6QkpOTlJOSkpGQi4N8dXuFjZCRkpOTlJOSkZCOjY2NjYyLiYaCfHNlVEM6O0ZYaniCiIuOkZGRj42Njo+RkpOUlJOSkpKQioB3bHaDjZGRkpOTlJOTkpCPjo2Njo6NjImGgXptXEo/P0xecH6Gi4+Sk5ORj42Njo+Rk5SUlJOSkpKQh3puYm6AjZGSkpOTlJSTkpGPjo2Ojo+Qj4yJhoB0ZFJGRlJkdoKKj5KUlZSRj42NjpCSk5SUk5KSkpOPg3Jj"),c=>c.charCodeAt(0)),KW=60,KH=38,KC={};
function knitTinted(hx){if(KC[hx])return KC[hx];const c=document.createElement('canvas');c.width=KW;c.height=KH;const x=c.getContext('2d'),im=x.createImageData(KW,KH),n=parseInt(hx.slice(1),16),R=n>>16,G=(n>>8)&255,B=n&255;
 for(let i=0;i<KW*KH;i++){const q=KIT[i]/128,o=i*4,d=(q-1)*38,m=q<1?q:1+(q-1)*.7;im.data[o]=Math.max(0,Math.min(255,R*m+d));im.data[o+1]=Math.max(0,Math.min(255,G*m+d));im.data[o+2]=Math.max(0,Math.min(255,B*m+d));im.data[o+3]=255}
 x.putImageData(im,0,0);return KC[hx]=c}
function drawKnit(ctx,g,sw,sh,skip){ctx.save();ctx.beginPath();ctx.rect(0,0,g.w*sw,g.h*sh);ctx.clip();ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
 /* each stitch owns a V-shaped band, so colour changes follow the stitches instead of square blocks */
 const vee=()=>{ctx.beginPath();ctx.moveTo(-.6,-33);ctx.lineTo(30,-9);ctx.lineTo(60.6,-33);ctx.lineTo(60.6,7.2);ctx.lineTo(30,31.2);ctx.lineTo(-.6,7.2);ctx.closePath()};
 /* pass 1: every stitch in its flat colour, with an outline a little wider than the stitch. The textured stitches are drawn on top in pass 2; without this, the soft edges of neighbouring stitches leave thin white lines between them on bigger charts */
 for(let r=-1;r<=g.h;r++)for(let c=0;c<g.w;c++){const rr=Math.min(g.h-1,Math.max(0,r)),hx=g.col[rr*g.w+c];if(skip&&skip(hx))continue;
  ctx.save();ctx.translate(c*sw,r*sh);ctx.scale(sw/KW,sh/KH);vee();ctx.fillStyle=ctx.strokeStyle=hx;ctx.lineJoin='round';ctx.lineWidth=2*KW/Math.max(2,sw);ctx.fill();ctx.stroke();ctx.restore()}
 for(let r=-1;r<=g.h;r++)for(let c=0;c<g.w;c++){const rr=Math.min(g.h-1,Math.max(0,r));if(skip&&skip(g.col[rr*g.w+c]))continue;const t=knitTinted(g.col[rr*g.w+c]);
  ctx.save();ctx.translate(c*sw,r*sh);ctx.scale(sw/KW,sh/KH);
  vee();ctx.clip();
  ctx.drawImage(t,0,0,KW,KH);ctx.drawImage(t,0,-KH,KW,KH);ctx.restore()}
 ctx.restore()}

/* ---------- library and home ---------- */
function thumb(p,mx){return gridThumb(toGrid(p),KINDS[p.t].knit,mx)}
function gridThumb(g,knit,mx){const cv=document.createElement('canvas'),dpr=devicePixelRatio||1,sw=knit?Math.max(5,Math.min(12,Math.floor(mx/g.w))):Math.max(9,Math.min(18,Math.floor(mx/g.w))),sh=knit?sw*.88:sw,W=g.w*sw+1,H=knit?g.h*sh+sw*.3:g.h*sh+1;
 cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);if(knit)drawKnit(x,g,sw,sh);else drawChart(x,g,sw,INK,true);return cv}
/* ---------- full patterns ---------- */
// Published colourwork charts (listed on the Charts page).
{const take=n=>DECOR.find(x=>x.n==n);
 P.push({n:'Cherries',g:'hats',l:'Intermediate',t:'colourwork',d:'A pair of cherries on their stems, with a leaf on top and a pink highlight on each. 15 stitches wide and 16 rows, in four colours.',cols:take('Cherries').cols,rows:["000000000000000", "000000000222220", "000000022222220", "000000222222220", "000000202000000", "000002000200000", "000022000200000", "000220000220000", "001111000020000", "013111100111100", "113311101331110", "111111111311111", "111111111111111", "011111101111111", "001111001111111", "000000000111110"]});
 P.push({...take('Little heart motif'),n:'Heart',d:'A small heart to place on mittens, a hat or a cushion. 11 stitches wide and 8 rows, in two colours.'});
 NAMES['#ccb187']='Tan';NAMES['#7d634c']='Brown';NAMES['#16100d']='Black';
 P.push({n:'Leopard print',repeat:true,g:'hats',cat:'animal-print',l:'Intermediate',t:'colourwork',d:'Leopard print in tan, black and brown, drawn from a leopard print reference. A 24-stitch repeat over 24 rows that tiles seamlessly: make the chart bigger and the pattern keeps going.',cols:['#ccb187','#16100d','#7d634c'],rows:["011110110000000001100100", "112210000011100011222110", "122220000112210012222210", "122221000122110012222210", "112210000022211001222000", "011110000112110000111011", "000000011011100011000011", "011000001100000110000000", "110001111100000011000011", "211011222110011110000112", "220012222210112210000122", "221012222210122220000022", "200001222000122221000112", "100000111000112210000011", "011000000000011110001100", "001100000001100000011000", "011111000001100000111100", "001122100011001001122100", "001222200112221101222200", "000222210122222101222210", "001122000122222101122100", "100111000012220000111101", "000000110001110110000011", "100000011000000110000001"]})
 P.push({n:'Cheetah print',repeat:true,g:'hats',cat:'animal-print',l:'Intermediate',t:'colourwork',d:'Solid black cheetah spots on a warm tan ground. This 24 × 24 stitch tile repeats seamlessly across and up/down to make a continuous print.',cols:['#ccb187','#16100d'],rows:["100000110011100001110001","100000100001100000110000","000010001100000110001000","000111001100000110001100","000010000100000110001100","100000110001000000100000","110000110011100000110000","110000110001000000110000","011100000110001100001000","011100000110001100011100","001000000110000000001000","100000111001100001100001","100000111001100011100001","100000000000100001100001","000110011100000000000000","000110011100001110001100","000000001000000100001100","110001000000110001100001","110011100000110001100001","100011000000010100000100","001000000000001100000110","001100000110001100000110","001000000110000100000000","100000110001100000000001"]});
 NAMES['#f8f800']='Yellow';NAMES['#302f00']='Black';
 P.push({n:'Smiley',g:'bags',l:'Beginner',t:'colourwork',d:'A classic smiley face. 16 stitches wide and 16 rows, in three colours: a yellow face with black eyes and smile on a plain ground.',cols:[BASE,'#f8f800','#302f00'],rows:["0000000000000000", "0000000000000000", "0000011111100000", "0000111111110000", "0001112112111000", "0011112112111100", "0011112112111100", "0011111111111100", "0012111111112100", "0012111111112100", "0011211111121100", "0001121111211000", "0000112222110000", "0000011111100000", "0000000000000000", "0000000000000000"]})}
 P.push({n:'4 cable chart',g:'scarves',l:'Beginner',t:'cable',d:'A basic 4-stitch cable chart, 14 stitches wide and 4 rows high: a right twist cable (C4B) and a left twist cable (C4F), each framed by purl columns. The cables cross on row 3 of every 4-row repeat.',rows:['ppkkkkppkkkkpp','ppbbbbppffffpp','ppkkkkppkkkkpp','ppkkkkppkkkkpp']});
const CHART=n=>P.find(x=>x.n==n);
const LET=i=>String.fromCharCode(65+i);
const KEYTXT={k:'Knit on a right-side row, purl on a wrong-side row',p:'Purl on a right-side row, knit on a wrong-side row',o:'Yarn over',
 '/':'k2tog (knit 2 together)','\\':'ssk (slip, slip, knit)',f:'C4F: slip 2 sts to a cable needle and hold at the front, k2, then k2 from the cable needle. Worked over 4 stitches (4 squares)',F:'C2F: slip 1 st to a cable needle and hold at the front, k1, then k1 from the cable needle. Worked over 2 stitches (2 squares)',B:'C2B: slip 1 st to a cable needle and hold at the back, k1, then k1 from the cable needle. Worked over 2 stitches (2 squares)',b:'C4B: slip 2 sts to a cable needle and hold at the back, k2, then k2 from the cable needle. Worked over 4 stitches (4 squares)',g:'C3F: slip 2 sts to a cable needle and hold at the front, k1, then k2 from the cable needle. Worked over 3 stitches (3 squares)',h:'C3B: slip 1 st to a cable needle and hold at the back, k2, then k1 from the cable needle. Worked over 3 stitches (3 squares)'};
const patCats=p=>CATN[p.g];
function patThumb(p,mx){if(p.img){const i=new Image();i.src=p.img;i.alt=p.imgAlt||p.n;i.loading='lazy';i.style.cssText=`width:${mx}px;max-width:100%;height:auto;border:3px solid var(--ink);display:block`;return i}const c=CHART(p.charts[0].ref);return thumb(c,mx)}
function chartBlock(pt,ch){const c=CHART(ch.ref),g=toGrid(c),knit=!!KINDS[c.t].knit,d=document.createElement('div');d.className='cbox';
 const h=document.createElement('h4');h.textContent=ch.cap;d.append(h);
 const cell=Math.max(14,Math.min(28,Math.floor(560/g.w))),cv=document.createElement('canvas'),dpr=devicePixelRatio||1,W=g.w*cell+(knit?66:34),H=g.h*cell+24;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';cv.className='cc';
 cv.setAttribute('role','img');cv.setAttribute('aria-label',ch.cap+(knit?'. Colour grid.':'. Stitch symbol grid.'));
 const x=cv.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);drawChart(x,g,cell,getComputedStyle(document.documentElement).getPropertyValue('--ink')||'#111',false,knit);
 const w=document.createElement('div');w.className='cw';w.append(cv);d.append(w);
 const key=document.createElement('ul');key.className='key';
 if(knit){c.cols.forEach((hx,i)=>{const li=document.createElement('li'),sw=document.createElement('i');sw.style.background=hx;li.append(sw,`Colour ${LET(i)}: ${NAMES[hx]||hx}`);key.append(li)})}
 else{[...new Set(c.rows.join(''))].forEach(ch2=>{const s2=CM[ch2],li=document.createElement('li'),cn=document.createElement('canvas');const wd=ISCAB(s2);cn.width=wd?CABW[s2]*22:22;cn.height=22;const cx=cn.getContext('2d');cx.fillStyle=BASE;cx.fillRect(0,0,cn.width,22);if(wd)cableWide(cx,s2,0,0,22,INK);else{cx.strokeStyle='#999';cx.strokeRect(.5,.5,21,21);glyph(cx,s2,0,0,22,INK)}li.append(cn,KEYTXT[ch2]||SYMS[s2]);key.append(li)})}
 d.append(key);
 const n=document.createElement('p');n.className='meta';n.textContent=ch.rnd?'Worked in the round: every rnd is read from right to left. Rnd 1 is the bottom row.':'Worked flat: right-side rows are read from right to left, wrong-side rows from left to right. Row 1 is the bottom row.';d.append(n);
 if(knit&&pt.c!='crochet'){const k=document.createElement('div');k.className='kn';const kp=gridThumb(g,true,260);kp.setAttribute('aria-label','How the chart looks when knitted');k.append(kp);d.append(k)}
 const b=document.createElement('button');b.textContent='Open this chart in the chart maker';b.onclick=()=>openPattern(c);d.append(b);return d}
// Approximate yards in 100 g of yarn for each weight (from Moll's table). Thicker yarn = fewer yards per skein.
const YARN_W=[{w:0,n:'Lace #0',lo:850,hi:950,uk:'Crochet thread (for cotton, rayon etc.)',g:36,nd:'1.5-2.25 mm',hk:'1.4-2.25 mm',ndt:2,hkt:1.75},{w:1,n:'Super Fine #1',lo:440,hi:460,uk:'Sock, Fingering, Baby, 4 ply',g:30,nd:'2.25-3.25 mm',hk:'2.25-3.5 mm',ndt:2.75,hkt:3},{w:2,n:'Fine #2',lo:330,hi:440,uk:'Sport, Baby, 4 ply',g:24.5,nd:'3.25-3.75 mm',hk:'3.5-4.5 mm',ndt:3.5,hkt:4},{w:3,n:'Light #3',lo:250,hi:350,uk:'Double Knit (DK), 8 ply, Light Worsted',g:22.5,nd:'3.75-4.5 mm',hk:'4-5.5 mm',ndt:4,hkt:4.5},{w:4,n:'Medium #4',lo:170,hi:220,uk:'Worsted, Aran, 10 ply',g:18,nd:'4.5-5.5 mm',hk:'5-6.5 mm',ndt:5,hkt:5.5},{w:5,n:'Bulky #5',lo:110,hi:140,uk:'Chunky, Craft, Rug',g:13.5,nd:'5.5-8 mm',hk:'6-9 mm or larger',ndt:6.5,hkt:7},{w:6,n:'Super Bulky #6',lo:60,hi:110,uk:'Super Chunky, Roving',g:9,nd:'8-12.75 mm',hk:'9-16 mm',ndt:9,hkt:10},{w:7,n:'Jumbo #7',lo:10,hi:30,uk:'Ultra, Roving',g:5,nd:'12.75 mm and larger',hk:'16 mm and larger',ndt:15,hkt:19}];
const yarnLabel=w=>`${yarnW(w).n} (UK: ${yarnW(w).uk})`,yarnW=w=>YARN_W[w]||YARN_W[4],yarnMid=w=>(yarnW(w).lo+yarnW(w).hi)/2,yarnRange=w=>`${yarnW(w).lo}-${yarnW(w).hi} yd per 100 g`;
// each pattern's yarn use is worked out in grams, then turned into yards using the weight of yarn the pattern names
PAT.forEach(p=>{if(p.use)p.use.forEach(u=>{if(u.g){u.u='m';u.q=Math.round(u.g/100*yarnMid(p.w)/1.0936)}})});
function patWeight(p){try{const v=JSON.parse(localStorage.getItem('ms-yweight')||'{}');const w=v[p.id];return w!=null&&YARN_W[w]?w:p.w}catch(e){return p.w}}
function patSkeinM(p){return yarnMid(patWeight(p))/1.0936} // metres in one 100 g skein of the chosen weight

// how much bigger or smaller a pattern comes out if you use a different yarn weight with the same stitch counts (stitches per 10 cm go down as yarn gets thicker)

// Typical yards for an average knitted item, by yarn weight 0 to 6 (from Moll's table; each pair is [smaller, larger] size). null = not given.
const YARN_PROJ={hat:[[350,400],[300,375],[250,350],[200,300],[150,250],[125,200],[75,125]],afghan:[[3500,3750],[3000,3500],[2500,3000],[2000,2500],[1500,2000],[750,1500],[500,1000]],sweater:[[2000,4000],[1500,3500],[1250,3000],[1000,2500],[800,2000],[750,1500],[500,1000]],scarf:[[350,850],[300,800],[250,750],[200,600],[150,550],[100,500],[50,450]],mittens:[[200,350],[150,300],[100,250],[75,200],[50,150],null,null],socks:[[400,500],[350,450],[300,400],[250,350],[200,300],null,null]};
const CROCHET_X=1.3; // crochet uses about 30% more yarn than knitting
// total yards for a pattern at yarn weight w: the table range for its project type, t = where in the range (0 small, 1 large)
function patTotalYd(p,w){if(!p.ty||!YARN_PROJ[p.ty])return null;let r=YARN_PROJ[p.ty][Math.min(w,6)];if(!r)return null;if(w>6)r=[r[0]*.55,r[1]*.55];return (r[0]+(p.t||0)*(r[1]-r[0]))*(p.c=='crochet'?CROCHET_X:1)}
const patScale=p=>yarnW(p.w).g/yarnW(patWeight(p)).g;
function patUse(p){ // yarn use for the chosen yarn weight
 const w=patWeight(p),tot=patTotalYd(p,w);
 if(tot!=null&&p.sh)return p.use.map((u,i)=>{const yd=tot*p.sh[i];return {n:u.n,u:'m',q:yd/1.0936,g:Math.round(yd/yarnMid(w)*100),est:u.est}});
 const s=patScale(p);return (p.use||[]).map(u=>{const q=u.g?u.q*s:u.q;return {n:u.n,u:'m',q,g:u.g?Math.round(u.g*s*yarnMid(p.w)/yarnMid(w)):0,est:u.est}})}

// Scaled instructions for a different yarn weight: stitch and row counts change so the finished size stays the same (k = how many more or fewer stitches, from the gauge table)
const rnd=(x,m)=>Math.max(m,Math.round(x/m)*m);
const PAT_SCALE={
 'stripy-scarf':(p,k,t)=>{const cast=rnd(24*k,2),rows=rnd(128*k,8);return [
  {h:'The scarf',s:[`With ${t} and Colour A, cast on ${cast} sts using the long tail cast on method.`,'Work 4 rows in 1x1 half twisted rib in Colour A.','Change to Colour B and work 4 rows in 1x1 half twisted rib.','Change back to Colour A and work 4 rows. Keep changing colour every 4 rows, repeating until the scarf is the length you want.',`For the same size as the scarf in the photo, work ${rows} rows altogether (${rows/8} blocks of each colour).`]},
  {h:'Finishing',s:['Cast off and sew in the ends.']},
  {h:'Tip',s:['A good rule of thumb is that you want your scarf to be as long as you are tall.',`The original is written for 24 sts and 128 rows in chunky yarn. These counts are scaled so the scarf comes out the same size in your yarn.`]}]},
 'granny-square-scarf':(p,k,t)=>{const r=Math.max(3,Math.round(6*k));return [
  {h:'Granny square (make 8)',s:['With Colour A (lilac), make a magic loop. If you can’t do a magic loop, chain 3 and join in the round to make a circle.','Round 1: Ch 2, then work 3 dc into the loop, ch 1, 3 dc, ch 1, 3 dc, ch 1, 3 dc, ch 1. Slip stitch into the first dc and ch 2.','Round 2 and every round after: 3 dc in every gap. At each corner work 3 dc, ch 2, 3 dc to make the corner. Slip stitch into the first dc and ch 2 at the end of each round.',`Repeat until you have ${r} rounds of Colour A (the original has 6 rounds in DK yarn, so this gives squares of the same size in your yarn). Use ${t}.`]},
  p.steps[1],p.steps[2]]},
 'cat-hat':(p,k,t)=>{const g=yarnW(patWeight(p)).g,ch=Math.round(54*g/10*.9/2)*2;return [
  {h:'Make the panel',s:[`Use ${t}. For an adult head (about 54 cm around), chain about ${ch}. Chain more if you want the hat looser, or fewer if you want it snug. It should stretch a bit with a loose tension.`,...p.steps[0].s.slice(1)]},p.steps[1],p.steps[2]]},
 'checkerboard-hat':(p,k,t)=>{const C=rnd(60*k,12),R=Math.max(3,Math.round(C/12)),b=Math.max(2,Math.round(3*k));return [
  p.steps[0],
  {h:'The hat',s:['Row 1: Magic loop and dc 12 in Colour A (lime green).',`Rounds 2–${R}: Work increases evenly, adding 12 stitches each round, until you have ${C} sts. Work the stitches in blocks of 6 stitches, alternating Colour A and Colour B, so the checkerboard starts to show.`,`Rounds ${R+1}–${R+b}: Colour B 6 dc, Colour A 6 dc, until end of rnd (${C} sts).`,`Rounds ${R+b+1}–${R+2*b}: Colour A 6 dc, Colour B 6 dc, until end of rnd.`,`Round ${R+2*b+1}: Colour C (black), ${C} sc for the rim.`,`The original has 60 sts and 13 rounds in mohair worked double. These counts are scaled so the hat comes out the same size in ${t}.`]},
  p.steps[2]]}
};
function patSteps(p){const f=PAT_SCALE[p.id];if(!f||patWeight(p)==p.w)return p.steps;const k=1/patScale(p);return f(p,k,p.c=='crochet'?yarnW(patWeight(p)).hkt+' mm crochet hook':yarnW(patWeight(p)).ndt+' mm needles')}
function patTool(p){ // needles or hook for the chosen yarn weight
 const w=patWeight(p);if(w==p.w||p.w==null)return p.needles;const y=yarnW(w),cr=p.c=='crochet';
 return `${cr?y.hkt:y.ndt} mm ${cr?'crochet hook':'needles'} (usual range for ${y.n}: ${cr?y.hk:y.nd}). Check your tension. The pattern was written for: ${p.needles}`}
function patYd(m){return Math.max(5,Math.round(m*1.0936/5)*5)}
function patUseLine(u){const m=u.u=='m'?u.q:u.u=='yd'?u.q/1.0936:null;return m==null?`${u.n}: ${u.est?'about ':''}${u.q} ${u.u}`:`${u.n}: ${u.est?'about ':''}${patYd(m)} yd (${Math.round(m/5)*5||m} m${u.g?', '+u.g+' g':''})`}
function patYarnText(p){ // e.g. "About 285 yd (260 m, about 100 g) in total (estimate), in Bulky #5 yarn..."
 const use=patUse(p);if(!use.length)return '';const w=patWeight(p),tot=use.reduce((a,u)=>a+(u.u=='yd'?u.q/1.0936:u.q),0),est=use.some(u=>u.est),g=use.reduce((a,u)=>a+(u.g||0),0);
 return `${est?'About ':''}${patYd(tot)} yd (${Math.round(tot/5)*5} m${g?', about '+Math.round(g/5)*5+' g':''}) in total${est?' (estimate)':''}${p.w!=null?', in '+yarnW(w).n+' yarn, UK '+yarnW(w).uk.split(', ').slice(0,2).join(' or ')+' ('+yarnRange(w)+')':''}.`+(use.length>1?' '+use.map(patUseLine).join('; ')+'.':'')}
function patCostRec(id){try{const v=JSON.parse(localStorage.getItem('ms-patcost')||'{}');return v&&v[id]||null}catch(e){return null}}
function patCostBlock(p){ // shopping list and cost for one pattern; not included in the pattern PDF
 const box=document.createElement('section');box.className='pcost';box.setAttribute('aria-label','Shopping list and cost');
 const h=document.createElement('h2');h.className='ph2';h.textContent='Shopping list and cost';box.append(h);
 const el=(t,txt,css)=>{const e=document.createElement(t);if(txt)e.textContent=txt;if(css)e.style.cssText=css;return e};
 const hasUse=p.use&&p.use.length,UL='margin:.3rem 0 .6rem;padding-left:1.3rem;text-align:left';
 const ul=el('ul','',UL);
 if(hasUse){const yl=el('p','Yarn needed',''),b0=el('b','Yarn needed');ul.append(...patUse(p).map(u=>el('li',patUseLine(u))));box.append(el('p','Yarn needed','margin:.2rem 0;font-weight:700'),ul);
  if(p.use.some(u=>u.est))box.append(el('p','These amounts are estimates, so allow a little extra.','margin:.2rem 0 .6rem;font-size:.9em'))}
 const mats=[[p.c=='crochet'?'Hook':'Needles',patTool(p)],['Notions',p.notions]].filter(x=>x[1]);
 if(!hasUse)mats.unshift(['Yarn',p.yarn]);
 const ul2=el('ul','',UL);mats.forEach(([a,b])=>ul2.append(el('li',a+': '+b)));if(!hasUse)box.append(ul2);else box.append(el('p','Also needed','margin:.2rem 0;font-weight:700'),ul2);
 let wsel=null;
 if(hasUse&&p.w!=null)box.append(el('p','Yarn weight: '+yarnW(patWeight(p)).n+'. To use a different yarn, change it under “Change the yarn” near the top of this pattern.','margin:.5rem 0 0;font-size:.9em'));
 const out=el('div'),msg=el('span','','');msg.className='hint';msg.setAttribute('role','status');
 let rec=patCostRec(p.id),skeinInp=null;
 const show=()=>{out.replaceChildren();rec=patCostRec(p.id);if(!rec||!rec.items||!rec.items.length){out.append(el('p',hasUse?'Type the price of one skein to see what this pattern costs to make.':'Add what one pack costs and what you already own to see what this pattern costs to make.','margin:.4rem 0'));return}
  const m=v=>rec.cur+(Math.round(v*100)/100).toFixed(2);out.append(el('p',`Cost to make: ${m(rec.grand)}${rec.qty>1?` for ${rec.qty} (${m(rec.per)} each)`:''}`,'margin:.4rem 0;font-weight:700'));
  const l=el('ul','',UL);rec.items.forEach(it=>l.append(el('li',`${it.n}: ${it.txt}${it.cost>0?' ('+m(it.cost)+')':''}`)));out.append(l,el('p','Worked out from the prices you entered. Your own prices are saved in this browser only.','margin:.2rem 0 .6rem;font-size:.9em'))};
 if(hasUse){const lab=el('label','Price of one skein of yarn (£) ','display:flex;flex-direction:column;gap:.25rem;font-weight:600;max-width:260px;margin:.6rem 0 0;text-align:left'),inp=document.createElement('input');inp.type='number';inp.min='0';inp.step='any';inp.inputMode='decimal';inp.placeholder='e.g. 4.50';inp.style.cssText='border:2.5px solid var(--ink);background:#fff;border-radius:6px;padding:.35rem .5rem;font:inherit';
  const sk=(()=>{try{return parseFloat(localStorage.getItem('ms-skein'))||0}catch(e){return 0}})();if(sk)inp.value=sk;
  const run=()=>{const price=parseFloat(inp.value);try{localStorage.setItem('ms-skein',inp.value)}catch(e){}
   if(!(price>0)){show();return}
   const S={name:p.n,qty:1,cur:(rec&&rec.cur)||'£',extra:10,other:'',pid:p.id,rows:costsPatRows(p,price)},calc=costsCalc(S),buy=calc.out.filter(o=>o.state=='buy');
   if(buy.length)try{const v=JSON.parse(localStorage.getItem('ms-patcost')||'{}');v[p.id]={name:p.n,cur:S.cur,qty:1,grand:calc.grand,per:calc.perGarment,items:buy.map(o=>({n:o.r.n||'Material',txt:`${o.packs} × ${costsFmt(parseFloat(o.r.ps))} ${costsUnit(o.r)}`,cost:o.cost})),state:S};localStorage.setItem('ms-patcost',JSON.stringify(v))}catch(e){}
   show()};
  inp.oninput=run;skeinInp=inp;lab.append(inp);box.append(lab);if(wsel)wsel.onchange=()=>{try{const v=JSON.parse(localStorage.getItem('ms-yweight')||'{}');v[p.id]=+wsel.value;localStorage.setItem('ms-yweight',JSON.stringify(v))}catch(e){}run()}}
 box.append(out);show();if(skeinInp&&parseFloat(skeinInp.value)>0)skeinInp.dispatchEvent(new Event('input'));
 const r=el('div','','margin:.6rem 0 0');r.className='row';
 const b1=el('button',hasUse?'Open in the cost calculator':'Work out the cost');b1.className='pri';b1.onclick=()=>{location.hash='#costs?pattern='+encodeURIComponent(p.id)};r.append(b1);
 const b2=el('button','Add to my shopping list');b2.onclick=()=>{rec=patCostRec(p.id);if(!rec||!rec.items||!rec.items.length){msg.textContent=hasUse?'Type the price of a skein first.':'Work out the cost first.';return}
  try{const proj=rec.name+(rec.qty>1?` (x${rec.qty})`:''),cur=JSON.parse(localStorage.getItem('ms-shoplist')||'[]').filter(i=>i.proj!==proj);rec.items.forEach(it=>cur.push({n:it.n,txt:it.txt,cost:it.cost,proj,done:false}));localStorage.setItem('ms-shoplist',JSON.stringify(cur));msg.textContent='Added. You can see it in the materials cost calculator.'}catch(e){msg.textContent='Sorry, that could not be saved.'}};r.append(b2);
 box.append(r,msg);return box}

function patYarnPanel(p){ // "Change the yarn": picks a yarn weight and shows size, needles and yarn for it
 if(p.w==null)return null;const w=patWeight(p),s=patScale(p),box=document.createElement('section');box.className='pyw';
 box.style.cssText='border:3px solid var(--ink);border-radius:8px;background:var(--mint2);padding:.7rem .9rem;margin:.8rem 0;text-align:left';
 const el=(t,txt,css)=>{const e=document.createElement(t);if(txt)e.textContent=txt;if(css)e.style.cssText=css;return e};
 box.append(el('h2','Change the yarn','font-size:1.15rem;margin:0 0 .4rem'));
 const lab=el('label','Yarn weight ','display:flex;flex-direction:column;gap:.25rem;font-weight:600;max-width:420px'),sel=document.createElement('select');sel.style.cssText='border:2.5px solid var(--ink);background:#fff;border-radius:6px;padding:.35rem .5rem;font:inherit';
 YARN_W.forEach(y=>{const o=document.createElement('option');o.value=y.w;o.textContent=`${y.n} / UK ${y.uk.replace(/ \(for cotton, rayon etc\.\)/,'')}${y.w==p.w?' (this pattern)':''}`;sel.append(o)});sel.value=w;lab.append(sel);box.append(lab);
 sel.onchange=()=>{try{const v=JSON.parse(localStorage.getItem('ms-yweight')||'{}');v[p.id]=+sel.value;localStorage.setItem('ms-yweight',JSON.stringify(v))}catch(e){}const y=scrollY;showPattern(p.id);scrollTo(0,y)};
 const pct=Math.round((s-1)*100),tool=p.c=='crochet'?yarnW(w).hk+' crochet hook':yarnW(w).nd+' needles';
 const ul=el('ul','','margin:.5rem 0 0;padding-left:1.3rem');
 if(w==p.w)ul.append(el('li','This is the yarn weight the pattern is written for, so the stitch counts, size and yarn amount are as written.'));
 else{ul.append(el('li',`Suggested ${p.c=='crochet'?'hook':'needles'} for ${yarnW(w).n}: ${p.c=='crochet'?yarnW(w).hkt:yarnW(w).ndt} mm (usual range ${p.c=='crochet'?yarnW(w).hk:yarnW(w).nd}). Check your tension with a swatch.`));
  if(PAT_SCALE[p.id])ul.append(el('li','The stitch and row counts in the instructions below have been changed so the finished piece stays the same size in this yarn.'));
  else ul.append(el('li',`This pattern follows a chart, so the stitch counts stay the same and it comes out about ${Math.abs(pct)}% ${pct>0?'bigger':'smaller'}${p.dims&&p.dims.length?': '+p.dims.map(d=>`${d[0].toLowerCase()} about ${Math.round(d[1]*s)} cm (was ${d[1]} cm)`).join(', '):''}.`));
  ul.append(el('li',PAT_SCALE[p.id]?`The yarn amount and cost below are for the same size of piece in ${yarnW(w).n}. ${w>p.w?'Thicker yarn has fewer yards in each 100 g, so the piece needs fewer yards but more grams and usually more skeins.':'Thinner yarn has more yards in each 100 g, so the piece needs more yards but fewer grams.'}`:`The yarn amount and cost below are rough estimates for ${yarnW(w).n}.`))}
 box.append(ul);return box}
function publishedPatternRecord(p){
 const steps=patSteps(p).map(sec=>({title:sec.h,instructions:sec.s.map(part=>{
  if(typeof part=='string')return part;
  const chart=p.charts.find(item=>item.id==part.chart);return chart?[chart.cap,...chartRowTexts(chart)].join('\n'):''
 }).filter(Boolean).join('\n')}));
 const source=p.charts.length?CHART(p.charts[0].ref):null;
 return{id:'published-'+p.id,createdAt:Date.now(),updatedAt:Date.now(),title:p.n,
  fields:{craft:CRAFTS[p.c||'knit'].n,level:p.l,description:p.d||'',yarn:p.yarn||'',tools:patTool(p)||'',gauge:p.gauge||'',sizes:p.size||'',finished:p.finished||'',notions:p.notions||'',notes:''},
  steps,chart:source?{name:p.charts[0].cap||source.n,grid:toGrid(source)}:null,photos:[]}
}
function savedPatternPhotos(record){
 const stored=Array.isArray(record.photos)?record.photos:[],published=PAT.find(p=>'published-'+p.id==record.id);
 if(!published)return stored;
 const sources=[...(published.img?[{src:published.img,alt:published.imgAlt}]:[]),...(published.more||[]).filter(photo=>photo.src)];
 return sources.map((source,index)=>{const photo=stored[index]||{};return{...photo,name:photo.name||published.n,alt:photo.alt||source.alt||published.n,src:photo.src||source.src}}).concat(stored.slice(sources.length))
}
async function savePublishedPattern(p,button,status){
 button.disabled=true;status.textContent='Saving to My Patterns…';
 try{
  const id='published-'+p.id,existing=await getSavedPattern(id);
  if(existing){const photos=savedPatternPhotos(existing);if(photos.some((photo,index)=>photo.src&&!((existing.photos||[])[index]||{}).src))await putSavedPattern({...existing,photos});button.textContent='In My Patterns ✓';status.textContent='This published pattern is already saved in My Patterns.';return}
  const record=publishedPatternRecord(p),photoErrors=[];
  record.photos=savedPatternPhotos({...record,photos:[]});
  for(const photo of record.photos){try{const response=await fetch(photo.src);if(!response.ok)throw new Error(`HTTP ${response.status}`);const blob=await response.blob();photo.type=blob.type;photo.blob=blob}catch(e){photoErrors.push(`${photo.src}: ${e.message||'could not load image'}`)}}
  await putSavedPattern(record);button.textContent='Saved to My Patterns ✓';
  status.textContent=photoErrors.length?`Pattern saved. Some photos will load from their original files and could not be copied for offline use: ${photoErrors.join('; ')}`:'Pattern saved to My Patterns on this device.'
 }catch(e){button.disabled=false;status.textContent=`Could not save this pattern: ${e.message||'browser storage error'}`}
}
/* ---------- US / UK terms toggle for patterns ---------- */
var termsMode=(()=>{try{const v=localStorage.getItem('molls-terms');if(v=='us'||v=='uk')return v}catch(e){}return /^en-US/i.test(navigator.language||'')?'us':'uk'})();
const TERMS_BOTH_UK={'bind off':'cast off','binding off':'casting off','stockinette stitch':'stocking stitch','stockinette':'stocking stitch','seed stitch':'moss stitch','gauge':'tension','color':'colour','colors':'colours','colored':'coloured','colorwork':'colourwork','gray':'grey','us crochet terms':'UK crochet terms'};
const TERMS_CRO_UK={'half double crochet':'half treble crochet','double crochet':'treble crochet','single crochet':'double crochet','treble crochet':'double treble crochet','skip':'miss','yarn over':'yarn round hook','sc':'dc','hdc':'htr','dc':'tr','tr':'dtr','dtr':'trtr','yo':'yrh'};
const TERMS_BOTH_US={'cast off':'bind off','casting off':'binding off','stocking stitch':'stockinette stitch','moss stitch':'seed stitch','colour':'color','colours':'colors','coloured':'colored','colourwork':'colorwork','grey':'gray','uk crochet terms':'US crochet terms'};
const termsRx={};
function termsConv(t,mode,craft){const k=mode+(craft=='crochet'?'c':'k');
 const dict=mode=='uk'?{...TERMS_BOTH_UK,...(craft=='crochet'?TERMS_CRO_UK:{})}:{...TERMS_BOTH_US};
 if(!termsRx[k])termsRx[k]=new RegExp('\\b('+Object.keys(dict).sort((a,b)=>b.length-a.length).map(x=>x.replace(/[.*+?^${}()|[\]\\]/g,'\\$&')).join('|')+')\\b','gi');
 let out=String(t).replace(termsRx[k],m=>{const v=dict[m.toLowerCase()];if(!v)return m;if(m.length>1&&m==m.toUpperCase()&&/[A-Z]/.test(m))return v.toUpperCase();return m[0]==m[0].toUpperCase()&&m[0]!=m[0].toLowerCase()?v[0].toUpperCase()+v.slice(1):v});
 if(mode=='us')out=out.replace(/^Tension\b/,'Gauge').replace(/\btension (swatch|square)/gi,'gauge $1');
 return out}
function termsApply(scope,craft,restore){if(!scope)return;const mode=termsMode,W=document.createTreeWalker(scope,NodeFilter.SHOW_TEXT,{acceptNode:n=>n.parentElement&&n.parentElement.closest('textarea,script,style,.termsbar')?NodeFilter.FILTER_REJECT:NodeFilter.FILTER_ACCEPT});let n;
 while(n=W.nextNode()){let v=n.nodeValue;if(n._c!==undefined&&v===n._c)v=n._o;else n._o=v;const out=restore?n._o:termsConv(v,mode,craft);if(out!==n.nodeValue){n._c=out;n.nodeValue=out}else if(n._c!==undefined&&out===n._o)n._c=undefined}}
function termsMount(scope,craft,after){if(!scope)return;scope.dataset.craft=craft;
 let bar=scope.querySelector(':scope > .termsbar');if(!bar){bar=document.createElement('div');bar.className='termsbar';bar.setAttribute('role','group');bar.setAttribute('aria-label','Choose US or UK terms');
  const lb=document.createElement('span');lb.textContent='Terms:';bar.append(lb);
  ['us','uk'].forEach(m=>{const b=document.createElement('button');b.type='button';b.dataset.m=m;b.textContent=m=='us'?'US terms':'UK terms';b.onclick=()=>{termsMode=m;try{localStorage.setItem('molls-terms',m)}catch(e){}document.querySelectorAll('.termsbar').forEach(x=>x.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',y.dataset.m==m)));document.querySelectorAll('[data-craft]').forEach(sc=>{if(sc.querySelector(':scope > .termsbar'))termsApply(sc,sc.dataset.craft)})};bar.append(b)});
  const hint=document.createElement('small');hint.textContent=craft=='crochet'?'Changes the stitch names and spellings below (US: sc, dc… UK: dc, tr…).':'Changes words like bind off / cast off, stockinette / stocking stitch and colour / color.';bar.append(hint);
  if(after&&after.parentNode==scope)scope.insertBefore(bar,after.nextSibling);else scope.prepend(bar)}
 bar.querySelectorAll('button').forEach(y=>y.setAttribute('aria-pressed',y.dataset.m==termsMode));
 termsApply(scope,craft);
 if(!scope._tobs){let t=0;scope._tobs=new MutationObserver(()=>{clearTimeout(t);t=setTimeout(()=>termsApply(scope,scope.dataset.craft),30)});scope._tobs.observe(scope,{childList:true,subtree:true})}}
function showPattern(id){const p=PAT.find(x=>x.id==id),el=$('#pattern');if(!p){location.hash='#patterns';return}
 el.innerHTML='';const bk=document.createElement('button');bk.textContent='← All patterns';bk.onclick=()=>{location.hash='#'+(p.c||'knit')+'-'+p.g};el.append(bk);
 const win=document.createElement('div');win.className='win pat';win.style.marginTop='1rem';win.innerHTML=`<div class="tb"><span>${patCats(p)}</span><i class="dots"><b></b><b></b><b></b></i></div>`;
 const bd=document.createElement('div');bd.className='bd';bd.style.paddingTop='1rem';win.append(bd);
 const h1=document.createElement('h1');h1.textContent=p.n;h1.style.fontSize='clamp(2rem,5vw,3rem)';bd.append(h1);
 const m=document.createElement('p');m.className='meta';m.textContent=`${CRAFTS[p.c||'knit'].n}, ${p.l.toLowerCase()}, ${p.price||'free'}`;bd.append(m);if(p.sample){const sn=document.createElement('p');sn.className='sample';sn.textContent='SAMPLE PATTERN: placeholder content, to be replaced or deleted.';bd.insertBefore(sn,m)}
 const top=document.createElement('div');top.className='ptop';const tc=patThumb(p,220);if(!p.img)tc.setAttribute('aria-label','Preview of the chart used in this pattern');const dd=document.createElement('p');dd.className='lead';dd.textContent=p.d;top.append(tc,dd);bd.append(top);let tpr=typeof projGet=='function'?projGet('maker-published-'+p.id)||projGet('site-'+p.id):null;if(tpr&&tpr.src=='site')tpr=projKeep(tpr,sitePatSecs(p),false);if(typeof patTrackPanel=='function')bd.append(patTrackPanel(p,tpr));
 const dl=document.createElement('dl');dl.className='facts';[['Yarn',p.yarn],['Yarn amount',patYarnText(p)],[p.c=='crochet'?'Hook':'Needles',patTool(p)],['Gauge',p.gauge],['Size',p.size],['Finished size',p.finished],['You will also need',p.notions]].filter(x=>x[1]).forEach(([a,b])=>{const t=document.createElement('dt'),v=document.createElement('dd');if(a=='Yarn'||a=='Hook'||a=='Needles'||a=='You will also need')v.className='mat';t.textContent=a;v.textContent=b;dl.append(t,v)});bd.append(dl);{const yp=patYarnPanel(p);if(yp)bd.append(yp)}bd.append(patCostBlock(p));
 const ab=document.createElement('p');ab.className='meta';ab.textContent=p.c=='crochet'?'Abbreviations (US crochet terms): ch = chain, sl st = slip stitch, sc = single crochet, hdc = half double crochet, dc = double crochet, inc = increase (2 stitches in the same stitch), rnd = round, st(s) = stitch(es).':'Abbreviations: k = knit, p = purl, st(s) = stitch(es), rnd(s) = round(s), RS/WS = right/wrong side, k2tog = knit 2 together, ssk = slip, slip, knit, m1 = make 1 (lift the strand between sts and knit into the back of it), pm = place marker, sm = slip marker, C4F = cable 4 front.';bd.append(ab);
 if(p.charts.some(c=>KINDS[CHART(c.ref).t].knit)){const cn=document.createElement('p');cn.className='meta';cn.textContent='Colours: '+[...new Set(p.charts.flatMap(c=>CHART(c.ref).cols.map((hx,i)=>`Colour ${LET(i)} = ${NAMES[hx]||hx}`)))].join(', ')+'.';bd.append(cn)}
 let tsi=-1+(tpr&&tpr.secs[0]&&tpr.secs[0].m?1:0),tii=0;patSteps(p).forEach(sec=>{const h=document.createElement('h2');h.className='ph2';h.textContent=sec.h;bd.append(h);let ol=null,n=0;
  sec.s.forEach(t=>{if(typeof t=='string'){n++;if(!ol){tsi++;tii=0;ol=document.createElement('ol');ol.className='stp';ol.start=n;bd.append(ol)}const li=document.createElement('li');li.textContent=t;if(projIsRow(t))li.classList.add('isrow');if(tpr)patTick(li,tpr,tsi,tii);tii++;ol.append(li)}else{ol=null;tsi++;const chp=p.charts.find(c=>c.id==t.chart),cbk=chartBlock(p,chp);cbk.dataset.rows=CHART(chp.ref).rows.length;bd.append(cbk);if(tpr)bd.append(patRowTicks(tpr,tsi,chp))}})});
 if(p.more&&p.more.length){const mr=document.createElement('div');mr.style.cssText='display:flex;flex-wrap:wrap;gap:.8rem;margin:1.4rem 0 0';p.more.forEach(m=>{const i=new Image();i.src=m.src;i.alt=m.alt||p.n;i.loading='lazy';i.onerror=()=>i.remove();i.style.cssText='width:220px;max-width:100%;height:auto;border:3px solid var(--ink)';mr.append(i)});bd.append(mr)}const row=document.createElement('div');row.className='row';row.style.marginTop='1.4rem';const dlb=document.createElement('button');dlb.className='pri';dlb.textContent='Download pattern as PDF';dlb.onclick=()=>savePatternPDF(p);row.append(dlb);const saveBtn=document.createElement('button');saveBtn.type='button';saveBtn.textContent='Save to My Patterns';saveBtn.onclick=()=>savePublishedPattern(p,saveBtn,mg);row.append(saveBtn);{const tl=document.createElement('label');tl.className='trk-opt';const tcb=document.createElement('input');tcb.type='checkbox';tcb.id='pdf-trk';tl.append(tcb,' Add tick boxes to the PDF (tracker)');row.append(tl)}bd.append(row);
 const mg=document.createElement('p');mg.className='hint';mg.id='pmsg';mg.setAttribute('role','status');bd.append(mg);getSavedPattern('published-'+p.id).then(record=>{if(record){saveBtn.textContent='In My Patterns ✓';saveBtn.disabled=true}}).catch(e=>{mg.textContent=`Saved patterns could not be checked: ${e.message||'storage error'}`});
 el.append(win);termsMount(bd,p.c||'knit',m)}
function patternText(p){const L=[p.n.toUpperCase(),...(p.sample?['SAMPLE PATTERN']:[]),`${patCats(p)}, ${p.l.toLowerCase()}`,'',p.d,'',...[['Yarn',p.yarn],['Yarn amount',patYarnText(p)],[p.c=='crochet'?'Hook':'Needles',patTool(p)],['Gauge',p.gauge],['Size',p.size],['Finished size',p.finished],['You will also need',p.notions]].filter(x=>x[1]).map(x=>x[0]+': '+x[1]),''];
 const cc=p.charts.find(c=>KINDS[CHART(c.ref).t].knit);if(cc)L.push('Colours: '+CHART(cc.ref).cols.map((hx,i)=>`Colour ${LET(i)} = ${NAMES[hx]||hx}`).join(', '),'');
 patSteps(p).forEach(sec=>{L.push(sec.h.toUpperCase());let n=0;sec.s.forEach(t=>{if(typeof t=='string')L.push(`${++n}. ${t}`);else{const ch=p.charts.find(c=>c.id==t.chart),c=CHART(ch.ref);L.push('',ch.cap+(ch.rnd?' (read every rnd from right to left, rnd 1 at the bottom)':' (row 1 at the bottom)'));
   const rws=c.rows.slice().reverse();rws.forEach((r,i)=>{L.push(`  ${ch.rnd?'Rnd':'Row'} ${i+1}: `+collapseCab([...r].reverse()).map(x=>/\d/.test(x)?LET(+x):x=='k'?'k':x=='p'?'p':x=='o'?'yo':x=='/'?'k2tog':x=='\\'?'ssk':x=='f'?'C4F':x=='b'?'C4B':x=='F'?'C2F':x=='B'?'C2B':x=='g'?'C3F':x=='h'?'C3B':x).join(' '))});
   if(!KINDS[c.t].knit)L.push('  (Symbols as seen from the right side. On wrong-side rows work k as p and p as k.)');L.push('')}});L.push('')});
 return termsConv(L.join('\n'),termsMode,p.c||'knit')}
async function savePatternPDF(p){const m=$('#pmsg'),src=$('#pattern .win');
 if(!window.htmlToImage||!src)return savePatternPDFPlain(p);
 m.textContent='Preparing your PDF…';
 const W=860,PAD=28,R=2,wrap=document.createElement('div');
 wrap.style.cssText=`position:fixed;left:-10000px;top:0;width:${W}px;padding:${PAD}px;box-sizing:border-box;background:#38b6ff`;
 const clone=src.cloneNode(true);clone.querySelectorAll('.bd > .row,#pmsg,button,.pcost,.pyw,.termsbar').forEach(x=>x.remove());const trk=!!($('#pdf-trk')&&$('#pdf-trk').checked);clone.querySelectorAll('.ptrack,.prows,.ptk').forEach(x=>x.remove());clone.querySelectorAll('.pdone,.ptked').forEach(x=>x.classList.remove('pdone','ptked'));wrap.id='pdfwrap';if(trk)wrap.classList.add('trk');const st=document.createElement('style');st.textContent=(trk?'#pdfwrap.trk .stp li.isrow{position:relative;padding-left:2.2rem}#pdfwrap.trk .stp li.isrow::before,#pdfwrap.trk .facts dd.mat::before{content:"";position:absolute;left:.1rem;top:.28em;width:1.15rem;height:1.15rem;border:3px solid #1b1022;background:#fff;border-radius:3px}#pdfwrap .prt{margin:.8rem 0 1rem;padding:.6rem .8rem;border:3px solid #1b1022;background:#fff;border-radius:6px}#pdfwrap .prt b{display:block;margin-bottom:.4rem}#pdfwrap .prg{display:flex;flex-wrap:wrap;gap:.35rem .7rem}#pdfwrap .prg span{display:inline-flex;align-items:center;gap:.25rem;font:600 .85rem sans-serif}#pdfwrap .prg i{width:1rem;height:1rem;border:2.5px solid #1b1022;background:#fff;border-radius:2px;display:inline-block}#pdfwrap .pnote{margin:1rem 0;padding:.6rem .8rem;border:3px solid #1b1022;background:#fff}#pdfwrap .pnote div{border-bottom:2px solid #1b1022;height:1.9rem}':'')+'#pdfwrap h1{filter:none!important;line-height:1.18!important;margin-bottom:.6rem!important;overflow:visible}#pdfwrap .ph2{line-height:1.25!important;margin-top:1.6rem!important}#pdfwrap .stp li,#pdfwrap dd,#pdfwrap dt,#pdfwrap p{line-height:1.55!important}#pdfwrap .facts{align-items:start}#pdfwrap canvas{max-height:620px;width:auto!important;max-width:100%}';wrap.append(st);clone.querySelectorAll('img').forEach(i=>{i.loading='eager'});
 if(trk){const bdx=clone.querySelector('.bd'),pr0=document.createElement('p');pr0.className='meta';pr0.textContent='My progress: Started ____________  Finished ____________. Tick each row and each material as you go.';const fx=bdx.querySelector('.facts');if(fx)fx.after(pr0);clone.querySelectorAll('.cbox[data-rows]').forEach(cb=>{const n=+cb.dataset.rows,d=document.createElement('div');d.className='prt';d.innerHTML='<b>Row tracker (tick each row)</b><div class="prg">'+Array.from({length:n},(_,i)=>`<span><i></i>${i+1}</span>`).join('')+'</div>';cb.after(d)});const nt=document.createElement('div');nt.className='pnote';nt.innerHTML='<b>My notes</b>'+'<div></div>'.repeat(5);bdx.append(nt)}
 const oc=src.querySelectorAll('canvas'),nc=clone.querySelectorAll('canvas');nc.forEach((c,i)=>{const o=oc[i];if(o){c.width=o.width;c.height=o.height;c.getContext('2d').drawImage(o,0,0)}});
 wrap.append(clone);document.body.append(wrap);
 try{
  if(document.fonts)await document.fonts.ready;
  await Promise.all([...clone.querySelectorAll('img')].map(i=>i.complete?1:new Promise(r=>{i.onload=i.onerror=r})));
  const top=wrap.getBoundingClientRect().top,cuts=[...clone.querySelectorAll('.bd > *:not(.ph2),.stp li')].map(e=>(e.getBoundingClientRect().bottom-top)*R).sort((a,b)=>a-b);
  let big,noPhotos=false;
  try{big=await htmlToImage.toCanvas(wrap,{pixelRatio:R,backgroundColor:'#38b6ff',style:{position:'static',left:'0',top:'0'}})}
  catch(e){noPhotos=true;big=await htmlToImage.toCanvas(wrap,{pixelRatio:R,backgroundColor:'#38b6ff',style:{position:'static',left:'0',top:'0'},filter:n=>n.tagName!=='IMG'})}
  const pw=W*R,ph=Math.round(pw*1.4142),F=96,ch=ph-F,pages=[];let y0=0;
  while(y0<big.height-2){
   let end=y0+ch;if(end<big.height){const c=cuts.filter(v=>v>y0+ch*.4&&v<=end);if(c.length)end=c[c.length-1]}else end=big.height;
   const cv=document.createElement('canvas');cv.width=pw;cv.height=ph;const x=cv.getContext('2d');
   x.fillStyle='#38b6ff';x.fillRect(0,0,pw,ph);x.drawImage(big,0,y0,pw,end-y0,0,0,pw,end-y0);
   x.fillStyle='#1b1022';x.fillRect(0,ph-F,pw,F);x.fillStyle='#ffa0d6';x.fillRect(0,ph-F,pw,4);
   x.fillStyle='#ffa0d6';x.font='900 44px sans-serif';x.textBaseline='middle';x.fillText('✦',PAD*R,ph-F/2);
   x.fillStyle='#fff';x.font='700 30px "Fredoka",sans-serif';x.fillText('Moll’s Studio',PAD*R+64,ph-F/2-16);
   x.fillStyle='#c4ff2e';x.font='600 26px "Fredoka",sans-serif';const t='Create your own pattern today @ Moll’s Studio.com',tw=x.measureText(t).width;x.fillText(t,PAD*R+64,ph-F/2+20);x.fillRect(PAD*R+64,ph-F/2+34,tw,2);
   pages.push({canvas:cv,links:[{x1:PAD*R+64,y1:ph-F/2+6,x2:PAD*R+64+tw,y2:ph-F/2+38,url:PATTERN_SITE_URL}]});y0=end
  }
  downloadFile(`${patternFilename(p.n)}.pdf`,await pdfFromPages(pages),'application/pdf');
  m.textContent=noPhotos?'PDF saved without photos (the browser blocked them when opened from a local file). On the live website they will be included.':'PDF saved. Check your downloads.'
 }catch(e){await savePatternPDFPlain(p)}
 finally{wrap.remove()}}
async function savePatternPDFPlain(p){const m=$('#pmsg');m.textContent='Preparing your PDF…';
 const ab=p.c=='crochet'?'ch = chain, sl st = slip stitch, sc = single crochet, hdc = half double crochet, dc = double crochet, inc = increase (2 stitches in the same stitch), rnd = round, st(s) = stitch(es).':'k = knit, p = purl, st(s) = stitch(es), rnd(s) = round(s), RS/WS = right/wrong side.';
 const cc=p.charts.length?p.charts[0]:null,ch=cc?CHART(cc.ref):null;
 const tc=x=>termsConv(x,termsMode,p.c||'knit'),steps=patSteps(p).map(sec=>{let n=0;return{title:tc(sec.h),instructions:tc(sec.s.filter(t=>typeof t=='string').map(t=>`${++n}. ${t}`).join('\n'))}});
 steps.push({title:tc(p.c=='crochet'?'Abbreviations (US crochet terms)':'Abbreviations'),instructions:tc(ab)});
 const data={title:p.n,fields:{craft:CRAFTS[p.c||'knit'].n,level:p.l,description:p.d||'',yarn:p.yarn||'',tools:p.needles||'',gauge:p.gauge||'',sizes:p.size||'',finished:p.finished||'',notions:p.notions||'',notes:''},steps,chart:ch?{name:ch.n,grid:toGrid(ch)}:null,tracker:!!($('#pdf-trk')&&$('#pdf-trk').checked)};
 const srcs=[p.img,...(p.more||[]).map(x=>x.src)].filter(Boolean);
 const save=async photos=>{const pages=await renderPatternPages(data,photos),blob=await pdfFromPages(pages);downloadFile(`${patternFilename(p.n)}.pdf`,blob,'application/pdf')};
 try{await save(srcs.map(u=>({url:u,name:p.n})));m.textContent='PDF saved. Check your downloads.'}
 catch(e){try{await save([]);m.textContent='PDF saved without photos (the browser blocked them when opened from a local file). On the live website they will be included.'}catch(e2){m.textContent='The PDF didn’t work here. Try again in a moment.'}}}
function library(el,lim,craft,cat){el.innerHTML='';const L=PAT.filter(p=>(!craft||(p.c||'knit')==craft)&&(!cat||p.g==cat)).slice(0,lim||99);
 if(!L.length){el.innerHTML='<p class="lead">'+(cat?`No ${CATN[cat].toLowerCase()} patterns yet. They’re on their way ✿`:'Nothing here yet. New patterns are on their way ✿')+'</p>';return}
 L.forEach((p,i)=>{const a=document.createElement('article'),t=document.createElement('div'),b=document.createElement('button');
  t.innerHTML=`<h3></h3><p class="meta"></p><p></p>`;t.children[0].textContent=p.n;t.children[1].textContent=`${p.sample?'Sample pattern, ':CRAFTS[p.c||'knit'].n+', '}${patCats(p)}, ${p.l.toLowerCase()}, ${p.price||'free'}`;t.children[2].textContent=p.d;
  b.textContent='View pattern';b.className='pri';b.onclick=()=>{location.hash='#pattern-'+p.id};t.append(b);
  if(p.price){const x=document.createElement(p.buy?'a':'button');x.textContent=p.buy?`Buy pattern, ${p.price}`:'Pattern shop opens soon';if(p.buy){x.href=p.buy;x.target='_blank';x.rel='noopener';x.className='btn pri'}else x.disabled=true;t.append(' ',x)}
  const pp=document.createElement('div');pp.className='paper t'+(i%3);pp.append(patThumb(p,150),t);a.className='note n'+(i%4);a.append(pp);el.append(a)})}
const BUILTIN_NON_COLOUR_CHARTS=P.filter(chart=>chart.t!='colourwork');P.splice(0,P.length);
const CHART_CATEGORIES=[{id:'animal-print',label:'Animal print',kind:'colourwork'}],CHART_PAGE_SIZE=48;
const PUBLISHED_CHARTS_KEY='molls-studio-published-charts';
let publishedChartsLoadError='',publishedChartNotice='',publishDraft=null,publishEditId='',pendingPublicationEditId='',publishedChartState={charts:[],deleted:[]},publishedChartRecords=[];
function chartKindName(kind){return kind=='colourwork'?'Colour':kind=='textured'?'Texture':KINDS[kind].n}
function validPublishedChart(chart){
 const grid=chart&&chart.grid;
 if(!chart||typeof chart.id!='string'||typeof chart.n!='string'||!KINDS[chart.t]||chart.cat&&typeof chart.cat!='string'||chart.catName&&typeof chart.catName!='string')return false;
 if(grid)return Number.isInteger(grid.w)&&Number.isInteger(grid.h)&&grid.w>=2&&grid.w<=200&&grid.h>=2&&grid.h<=200&&Array.isArray(grid.col)&&Array.isArray(grid.sym)&&grid.col.length==grid.w*grid.h&&grid.sym.length==grid.w*grid.h&&grid.col.every(c=>typeof c=='string'&&/^#[0-9a-f]{6}$/i.test(c))&&grid.sym.every(s=>typeof s=='string');
 const rows=chart.rows,cols=chart.cols;
 return chart.t=='colourwork'&&Array.isArray(rows)&&rows.length>=2&&rows.length<=200&&Array.isArray(cols)&&cols.length>0&&cols.every(c=>typeof c=='string'&&/^#[0-9a-f]{6}$/i.test(c))&&rows.every(row=>typeof row=='string'&&row.length>=2&&row.length<=200&&row.length==rows[0].length&&[...row].every(ch=>/\d/.test(ch)&&+ch<cols.length));
}
function validPublishedCategory(category){return !!(category&&typeof category.id=='string'&&typeof category.label=='string'&&KINDS[category.kind])}
function readPublishedChartState(){
 const raw=JSON.parse(localStorage.getItem(PUBLISHED_CHARTS_KEY)||'[]'),state=Array.isArray(raw)?{charts:raw,deleted:[]}:raw;
 if(!state||!Array.isArray(state.charts)||state.charts.some(chart=>!validPublishedChart(chart))||!Array.isArray(state.deleted||[])||(state.deleted||[]).some(id=>typeof id!='string'))throw new Error('Saved publication data is invalid.');
 if(new Set(state.charts.map(chart=>chart.id)).size!=state.charts.length)throw new Error('Saved publications contain duplicate IDs.');
 return{charts:state.charts,deleted:state.deleted||[]}
}
function refreshPublishedChartData(){
 const source=window.MOLLS_PUBLISHED_CHARTS||[],deleted=new Set(publishedChartState.deleted),byId=new Map();
 source.forEach(chart=>byId.set(chart.id,chart));
 publishedChartState.charts.forEach(chart=>byId.set(chart.id,chart));
 deleted.forEach(id=>byId.delete(id));
 publishedChartRecords=[...byId.values()];
 P.splice(0,P.length,...publishedChartRecords,...BUILTIN_NON_COLOUR_CHARTS);
 CHART_CATEGORIES.splice(1);
 const categories=[...(window.MOLLS_PUBLISHED_CATEGORIES||[]),...publishedChartRecords.filter(chart=>chart.cat&&chart.catName).map(chart=>({id:chart.cat,label:chart.catName,kind:chart.t}))];
 categories.forEach(category=>{if(validPublishedCategory(category)&&!CHART_CATEGORIES.some(item=>item.id==category.id&&item.kind==category.kind))CHART_CATEGORIES.push(category)})
}
function loadPublishedCharts(){
 try{
  const source=window.MOLLS_PUBLISHED_CHARTS||[],categories=window.MOLLS_PUBLISHED_CATEGORIES||[];
  if(!Array.isArray(source)||source.some(chart=>!validPublishedChart(chart))||new Set(source.map(chart=>chart.id)).size!=source.length)throw new Error('Website chart data is invalid.');
  if(!Array.isArray(categories)||categories.some(category=>!validPublishedCategory(category)))throw new Error('Website chart categories are invalid.');
  publishedChartState=readPublishedChartState();
 }catch(e){publishedChartsLoadError=`Could not load publication data: ${e.message||'storage error'}`;console.error(publishedChartsLoadError,e);publishedChartState={charts:[],deleted:[]}}
 refreshPublishedChartData()
}
loadPublishedCharts();
function persistPublishedChartState(next){
 localStorage.setItem(PUBLISHED_CHARTS_KEY,JSON.stringify(next));publishedChartState=next;refreshPublishedChartData()
}
function chartCategoryName(chart){if(chart.catName)return chart.catName;const category=CHART_CATEGORIES.find(item=>item.id==chart.cat&&item.kind==chart.t);return category?category.label:''}
function refreshChartCategoryMenu(){
 const submenu=$('#menuC .dd2 .sub');if(!submenu)return;
 submenu.replaceChildren(...CHART_CATEGORIES.filter(item=>item.kind=='colourwork').sort((a,b)=>a.label.localeCompare(b.label)).map(item=>{const button=document.createElement('button');button.dataset.v=`charts-colour-${item.id}`;button.textContent=item.label;return button}));
 const dropdown=$('nav [data-k="charts"]'),trigger=dropdown.firstElementChild;
 submenu.querySelectorAll('button[data-v]').forEach(button=>button.onclick=()=>{dropdown.classList.remove('open');dropdown.classList.add('shut');trigger.setAttribute('aria-expanded',false);button.blur();if(document.activeElement&&dropdown.contains(document.activeElement))document.activeElement.blur();location.hash='#'+button.dataset.v})
}
function renderChartPublications(){
 const list=$('#chart-publications-list'),status=$('#chart-publications-status');
 list.replaceChildren();status.textContent=publishedChartsLoadError;
 const sourceIds=new Set((window.MOLLS_PUBLISHED_CHARTS||[]).map(chart=>chart.id));
 if(!publishedChartRecords.length){const empty=document.createElement('p');empty.className='lead';empty.textContent='No charts have been published yet.';list.append(empty);return}
 publishedChartRecords.forEach((chart,index)=>{
  const article=document.createElement('article'),paper=document.createElement('div'),content=document.createElement('div'),title=document.createElement('h3'),meta=document.createElement('p'),description=document.createElement('p'),actions=document.createElement('div'),edit=document.createElement('button'),remove=document.createElement('button');
  article.className='note n'+(index%4);paper.className='paper t'+(index%3);title.textContent=chart.n;meta.className='meta';meta.textContent=[KINDS[chart.t].n,chartCategoryName(chart),sourceIds.has(chart.id)?'Website source':'Browser publication'].filter(Boolean).join(' · ');description.textContent=chart.d||'';
  edit.type='button';edit.className='pri';edit.textContent='Edit chart';edit.onclick=()=>editPublishedChart(chart.id);
  remove.type='button';sureBtn(remove,()=>deletePublishedChart(chart.id),'Delete');
  actions.className='row';actions.append(edit,remove);content.append(title,meta,description,actions);paper.append(thumb(chart,150),content);article.append(paper);list.append(article)
 })
}
function editPublishedChart(id){
 const chart=publishedChartRecords.find(item=>item.id==id);if(!chart){$('#chart-publications-status').textContent='That publication is no longer available. Refresh the list and try again.';return}
 pendingPublicationEditId=id;pend=chart;location.hash='#'+chart.t
}
/* every Delete button asks first: Delete -> Sure? Yes (press again within a few seconds to confirm) */
function sureBtn(b,fn,label){label=label||b.textContent||'Delete';b.textContent=label;let t=0;b.onclick=e=>{if(!t){b.textContent='Sure? Yes';b.classList.add('sure');b.setAttribute('aria-label','Sure? Yes, '+label.toLowerCase());t=setTimeout(()=>{t=0;b.textContent=label;b.classList.remove('sure');b.removeAttribute('aria-label')},4000);return}clearTimeout(t);t=0;b.textContent=label;b.classList.remove('sure');b.removeAttribute('aria-label');return fn(e)};return b}
function deletePublishedChart(id){
 const chart=publishedChartRecords.find(item=>item.id==id);if(!chart)return;
 try{
  const next={charts:publishedChartState.charts.filter(item=>item.id!=id),deleted:[...new Set([...publishedChartState.deleted,id])]};
  persistPublishedChartState(next);refreshChartCategoryMenu();renderChartPublications();
  try{downloadFile('published-charts.js',publishedChartSource(),'text/javascript');$('#chart-publications-status').textContent='Publication deleted. Replace published-charts.js in your project with the downloaded file, then deploy the updated project.'}
  catch(error){$('#chart-publications-status').textContent=`Publication deleted in this browser, but updated website data could not be downloaded: ${error.message||'download failed'}`}
 }catch(error){$('#chart-publications-status').textContent=`Could not delete this publication: ${error.message||'browser storage error'}`}
}
function publishedChartSource(){
 const categories=CHART_CATEGORIES.filter(category=>category.id!='animal-print');
 return`window.MOLLS_PUBLISHED_CHARTS = ${JSON.stringify(publishedChartRecords,null,2)};\nwindow.MOLLS_PUBLISHED_CATEGORIES = ${JSON.stringify(categories,null,2)};\n`
}
function exportPublishedCharts(){
 const status=$('#chart-publications-status');
 if(publishedChartsLoadError){status.textContent=`Fix the publication data issue before exporting. ${publishedChartsLoadError}`;return}
 try{downloadFile('published-charts.js',publishedChartSource(),'text/javascript');status.textContent='Website chart data downloaded. Replace published-charts.js in your project with this file, then deploy the updated project.'}
 catch(error){status.textContent=`Could not export website chart data: ${error.message||'download failed'}`}
}
if($('#chart-publications-export'))$('#chart-publications-export').addEventListener('click',exportPublishedCharts);
function chartsPage(filter){
 let kind=filter||'',category='';
 if(kind=='colour'||kind.startsWith('colour-')){category=kind=='colour'?'':kind.slice(7);kind='colourwork'}
 else{
  const match=Object.keys(KINDS).sort((a,b)=>b.length-a.length).find(key=>kind.startsWith(key+'-'));
  if(match){category=kind.slice(match.length+1);kind=match}
 }
 if(!KINDS[kind])kind='';
 if(category&&!CHART_CATEGORIES.some(item=>item.id==category&&item.kind==kind))category='';
 const el=$('#clib'),chips=$('#cchips'),search=$('#chart-search'),count=$('#chart-count'),more=$('#chart-load-more');
 $('#chh').textContent=category?`Charts: ${chartKindName(kind)}: ${chartCategoryName({cat:category,t:kind})} ★`:kind?`Charts: ${chartKindName(kind)} ★`:'Charts ★';
 chips.replaceChildren();
 [['','All charts'],['colour','Colour'],['cable','Cable'],['lace','Lace'],['textured','Textured stitch']].forEach(([value,label])=>{const b=document.createElement('button');b.textContent=label;b.setAttribute('aria-pressed',value==(kind=='colourwork'?'colour':kind));b.onclick=()=>{location.hash='#charts'+(value?'-'+value:'')};chips.append(b)});
 if(kind){
  const categories=CHART_CATEGORIES.filter(item=>item.kind==kind&&P.some(chart=>chart.t==kind&&chart.cat==item.id));
  if(categories.length||kind=='colourwork'){
   const label=document.createElement('span');label.className='chart-subnav-label';label.textContent=`${chartKindName(kind)} categories`;chips.append(label);
   [['',`All ${chartKindName(kind).toLowerCase()}`],...categories.map(item=>[item.id,item.label])].forEach(([value,title])=>{const b=document.createElement('button');b.textContent=title;b.setAttribute('aria-pressed',value==category);b.onclick=()=>{location.hash='#charts-'+(kind=='colourwork'?'colour':kind)+(value?'-'+value:'')};chips.append(b)})
  }
 }
 let limit=CHART_PAGE_SIZE;
 function render(){
  const query=search.value.trim().toLowerCase(),matches=P.filter(chart=>{
   if(kind&&chart.t!=kind)return false;
   if(category&&chart.cat!=category)return false;
   const terms=[chart.n,chart.d,chart.g,chart.t=='colourwork'?'colour':KINDS[chart.t].n,chartCategoryName(chart)].join(' ').toLowerCase();
   return !query||terms.includes(query)
  });
  const visible=matches.slice(0,limit);el.replaceChildren();
  count.textContent=matches.length?`Showing ${visible.length} of ${matches.length} chart${matches.length==1?'':'s'}`:'No charts found. Try another search or category.';
  if(publishedChartsLoadError)count.textContent+=` ${publishedChartsLoadError}`;
  if(publishedChartNotice){count.textContent+=` ${publishedChartNotice}`;publishedChartNotice=''}
  more.hidden=visible.length>=matches.length;more.textContent=`Load more charts (${matches.length-visible.length} remaining)`;
  visible.forEach((chart,i)=>{const g=toGrid(chart),a=document.createElement('article'),t=document.createElement('div'),b=document.createElement('button');
   t.innerHTML='<h3></h3><p class="meta"></p><p></p>';t.children[0].textContent=chart.n;t.children[1].textContent=[KINDS[chart.t].n,chartCategoryName(chart),`${g.w} × ${g.h} stitches`].filter(Boolean).join(' · ');t.children[2].textContent=chart.d;
   b.textContent='Open in chart maker';b.className='pri';b.onclick=()=>openPattern(chart);t.append(b);
   const paper=document.createElement('div');paper.className='paper t'+(i%3);paper.append(thumb(chart,150),t);a.className='note n'+(i%4);a.append(paper);el.append(a)
  })
 }
 search.oninput=()=>{limit=CHART_PAGE_SIZE;render()};
 more.onclick=()=>{limit+=CHART_PAGE_SIZE;render()};
 render()
}
function hideChartPublish(){
 $('#chart-publish-panel').hidden=true;$('#chart-studio').hidden=false;publishDraft=null
}
function openChartPublish(){
 if(!kind||!S)return;
 publishDraft={t:kind,grid:{w:S.w,h:S.h,col:S.col.slice(),sym:S.sym.slice()},repeat:!!S.tile};
 const existing=publishEditId?publishedChartRecords.find(chart=>chart.id==publishEditId):null,group=chartKindName(kind),select=$('#chart-publish-category');
 $('#chart-publish-name').value=(existing?existing.n:($('#nm').value||'')).trim().slice(0,80);
 $('#chart-publish-description').value=existing?existing.d||'':'';
 $('#chart-publish-kind').textContent=group;
 $('#chart-publish-repeat').checked=existing?!!existing.repeat:!!S.tile;
 $('#chart-publish-export-code').checked=true;
 $('#chart-publish-status').textContent='';
 $('#chart-new-category-row').hidden=true;$('#chart-new-category').value='';
 select.replaceChildren(new Option(`No ${group.toLowerCase()} subcategory`,''),...CHART_CATEGORIES.filter(item=>item.kind==kind).sort((a,b)=>a.label.localeCompare(b.label)).map(item=>new Option(item.label,item.id)),new Option('＋ Add a new category…','__new'));
 if(existing&&existing.cat)select.value=existing.cat;
 $('#chart-publish-title').textContent=existing?'Edit published chart':'Review your chart before publishing';
 $('#chart-publish-form button[type="submit"]').textContent=existing?'Save publication changes':'Publish chart';
 const preview={n:$('#chart-publish-name').value,t:kind,grid:publishDraft.grid};
 $('#chart-publish-preview').replaceChildren(thumb(preview,220));
 $('#chart-studio').hidden=true;$('#chart-publish-panel').hidden=false;$('#chart-publish-name').focus()
}
if($('#chart-publish-open')){
$('#chart-publish-open').addEventListener('click',openChartPublish);
$('#chart-publish-cancel').addEventListener('click',hideChartPublish);
$('#chart-publish-category').addEventListener('change',()=>{
 const add=$('#chart-publish-category').value=='__new';
 $('#chart-new-category-row').hidden=!add;
 if(add)$('#chart-new-category').focus()
});
$('#chart-publish-form').addEventListener('submit',e=>{
 e.preventDefault();
 const status=$('#chart-publish-status'),name=$('#chart-publish-name').value.trim(),description=$('#chart-publish-description').value.trim(),selection=$('#chart-publish-category').value;
 if(!publishDraft){status.textContent='Open Publish from the chart maker and try again.';return}
 if(!name){status.textContent='Give your chart a name before publishing.';$('#chart-publish-name').focus();return}
 let category=null;
 if(selection=='__new'){
  const label=$('#chart-new-category').value.trim();
  if(!label){status.textContent='Enter a name for the new category.';$('#chart-new-category').focus();return}
  category=CHART_CATEGORIES.find(item=>item.kind==publishDraft.t&&item.label.toLowerCase()==label.toLowerCase())||null;
  if(!category){
   let id=label.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
   if(!id){status.textContent='Use letters or numbers for the category name.';$('#chart-new-category').focus();return}
   const base=id;let suffix=2;
   while(CHART_CATEGORIES.some(item=>item.kind==publishDraft.t&&item.id==id))id=`${base}-${suffix++}`;
   category={id,label,kind:publishDraft.t}
  }
 }else if(selection)category=CHART_CATEGORIES.find(item=>item.kind==publishDraft.t&&item.id==selection)||null;
 if(selection&&selection!='__new'&&!category){status.textContent='That category is no longer available. Choose another category.';return}
 const record={
  id:publishEditId||`local-${Date.now().toString(36)}-${Math.random().toString(36).slice(2,8)}`,
  n:name,d:description||`${chartKindName(publishDraft.t)} chart published by a maker.`,
  t:publishDraft.t,g:category?category.label:chartKindName(publishDraft.t),
  cat:category?category.id:'',catName:category?category.label:'',
  l:'Beginner',repeat:$('#chart-publish-repeat').checked,
  grid:{w:publishDraft.grid.w,h:publishDraft.grid.h,col:publishDraft.grid.col.slice(),sym:publishDraft.grid.sym.slice()}
 };
 try{
  const saved=readPublishedChartState();
  saved.charts=saved.charts.filter(chart=>chart.id!=record.id);saved.charts.push(record);
  saved.deleted=saved.deleted.filter(id=>id!=record.id);
  persistPublishedChartState(saved)
 }catch(error){status.textContent=`Could not publish this chart: ${error.message||'browser storage error'}`;return}
 if(publishEditId)publishEditId='';
 if(category&&category.kind=='colourwork')refreshChartCategoryMenu();
 if($('#chart-publish-export-code').checked){
  try{downloadFile('published-charts.js',publishedChartSource(),'text/javascript');publishedChartNotice='The updated website chart data was downloaded. Replace published-charts.js in your project with it, then deploy to publish for everyone.'}
  catch(error){publishedChartNotice=`Saved in this browser, but the website source file could not be downloaded: ${error.message||'download failed'}`}
 }else publishedChartNotice='Saved in this browser only. Use All publications to download website chart data before deploying.';
 const routeKind=publishDraft.t=='colourwork'?'colour':publishDraft.t;
 const routeCategory=category?`-${category.id}`:'';
 hideChartPublish();dirty=false;$('#chart-search').value='';location.hash=`#charts-${routeKind}${routeCategory}`
});
}
function chips(craft,cat){const c=$('#chips');c.innerHTML='';c.hidden=craft=='crossstitch';[['','All'],...CATS].forEach(([k,n])=>{const b=document.createElement('button');b.textContent=n;b.setAttribute('aria-pressed',k==(cat||''));b.onclick=()=>{location.hash='#'+(craft||'patterns')+(k?'-'+k:'')};c.append(b)})}
function home(){const rep={colourwork:2,cable:6,lace:7,textured:9};$('#tiles').innerHTML='';Object.keys(KINDS).forEach(k=>{const b=document.createElement('button');b.className='tile';b.append(thumb(DECOR[rep[k]],150));b.insertAdjacentHTML('beforeend',`<b>${KINDS[k].n}</b><span>${KINDS[k].d}</span>`);b.onclick=()=>{location.hash='#'+k};$('#tiles').append(b)});
 const g=toGrid(CHART('Cherries')),h=$('#hero'),sw=22,sh=sw*.88,dpr=devicePixelRatio||1;h.width=g.w*sw*dpr;h.height=g.h*sh*dpr;h.style.width='100%';h.style.height='auto';const x=h.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);drawKnit(x,g,sw,sh);
 library($('#feat'),3,'knit');postCards($('#latest'),2)}
function applyPattern(p){const g=toGrid(p);undo=[];redo=[];S.name=p.n;$('#nm').value=p.n;if(p.cols){pal=[...new Set([BASE,...p.cols,...pal])].slice(0,12);color=p.cols[p.cols.length>1?1:0];swatches()}load(g);if(p.repeat)S.tile={w:g.w,h:g.h,col:g.col.slice(),sym:g.sym.slice()};draft();msg(`Opened “${p.n}”. Change anything you like.`+(p.repeat?' Make the chart bigger and the pattern keeps repeating, so the panels still match.':''))}
function openPattern(p){pend=p;const h='#'+p.t;if(location.hash==h)route();else location.hash=h}

/* ---------- posts and my designs ---------- */
const fmt=d=>new Date(d).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'});
const PATTERN_DB='molls-studio-patterns';
let patternDBPromise=null,patternThumbUrls=[];
function openPatternDB(){
 if(!window.indexedDB)return Promise.reject(new Error('This browser does not support local pattern storage.'));
 if(!patternDBPromise)patternDBPromise=new Promise((resolve,reject)=>{
  let request;
  try{request=indexedDB.open(PATTERN_DB,1)}catch(e){patternDBPromise=null;reject(e);return}
  request.onupgradeneeded=()=>{const db=request.result;if(!db.objectStoreNames.contains('patterns'))db.createObjectStore('patterns',{keyPath:'id'})};
  request.onsuccess=()=>resolve(request.result);
  request.onerror=()=>{patternDBPromise=null;reject(request.error||new Error('Could not open pattern storage.'))};
  request.onblocked=()=>{patternDBPromise=null;reject(new Error('Pattern storage is busy in another tab. Close other Moll’s Studio tabs and try again.'))}
 });
 return patternDBPromise
}
function patternDBRequest(mode,action){
 return openPatternDB().then(db=>new Promise((resolve,reject)=>{
  let tx,request,result;
  try{tx=db.transaction('patterns',mode);request=action(tx.objectStore('patterns'))}catch(e){reject(e);return}
  if(request)request.onsuccess=()=>{result=request.result};
  const fail=()=>reject(tx.error||request&&request.error||new Error('Could not access saved patterns.'));
  tx.oncomplete=()=>resolve(result);tx.onerror=fail;tx.onabort=fail
 }))
}
const allSavedPatterns=()=>patternDBRequest('readonly',store=>store.getAll());
const getSavedPattern=id=>patternDBRequest('readonly',store=>store.get(id));
const putSavedPattern=record=>patternDBRequest('readwrite',store=>store.put(record));
const removeSavedPattern=id=>patternDBRequest('readwrite',store=>store.delete(id));
function postCards(el,lim,craft){el.innerHTML='';const PL=POSTS.filter(p=>!craft||p.c==craft);if(!PL.length){el.innerHTML=`<p class="lead">No ${CRAFTS[craft].n.toLowerCase()} posts yet. They’re on their way ✿</p>`;return}PL.slice(0,lim||99).forEach((p,i)=>{const a=document.createElement('article'),t=document.createElement('div'),b=document.createElement('button');t.innerHTML=`<h3>${p.t}</h3><p class="meta">${fmt(p.date)}, ${p.tag}${p.sample?', sample post':''}</p><p>${p.body[0]}</p>`;b.textContent='Read post';b.onclick=()=>{location.hash='#post-'+p.id};t.append(b);const pp=document.createElement('div');pp.className='paper t'+(i%3);pp.append(t);a.className='note n'+((i+1)%4);a.append(pp);el.append(a)})}
function savedPatternCard(record,index){
 const article=document.createElement('article'),paper=document.createElement('div'),content=document.createElement('div');
 article.className='note pm-saved-card n'+(index%4);paper.className='paper t'+(index%3);
 const first=savedPatternPhotos(record)[0];let photoUrl='';
 if(first){if(first.blob instanceof Blob){photoUrl=URL.createObjectURL(first.blob);patternThumbUrls.push(photoUrl)}
  if(!photoUrl&&first.src)photoUrl=first.src}
 if(photoUrl){const img=document.createElement('img');img.className='pm-saved-thumb';img.src=photoUrl;img.alt=first.alt||`Photo for ${record.title||'saved pattern'}`;img.onerror=()=>{const empty=document.createElement('div');empty.className='pm-saved-placeholder';empty.textContent='✦';img.replaceWith(empty)};paper.append(img)}
 else{const empty=document.createElement('div');empty.className='pm-saved-placeholder';empty.textContent='✦';paper.append(empty)}
 const heading=document.createElement('h3');heading.textContent=record.title||'Untitled pattern';
 const meta=document.createElement('p');meta.className='meta';meta.textContent=`Pattern · ${record.fields&&record.fields.craft||'Craft not set'} · ${record.fields&&record.fields.level||'Level not set'} · Updated ${fmt(record.updatedAt||record.createdAt||Date.now())}`;
 const actions=document.createElement('div');actions.className='pm-saved-actions';
 const status=document.createElement('p');status.className='pm-saved-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const open=document.createElement('button');open.type='button';open.textContent='Open / edit';open.onclick=async()=>{open.disabled=true;try{await openSavedPattern(record.id)}catch(e){status.textContent=`Could not open this pattern: ${e.message||'storage error'}`}finally{open.disabled=false}};
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Export PDF';exportButton.onclick=async()=>{exportButton.disabled=true;status.textContent='Preparing PDF…';try{await exportSavedPatternPDF(record);status.textContent='PDF downloaded.'}catch(e){status.textContent=`PDF export failed: ${e.message||'could not create the file'}`}finally{exportButton.disabled=false}};
 const remove=document.createElement('button');remove.type='button';sureBtn(remove,async()=>{remove.disabled=true;try{await removeSavedPattern(record.id);renderSavedPatterns()}catch(e){remove.disabled=false;status.textContent=`Could not delete this pattern: ${e.message||'storage error'}`}},'Delete');
 const trkPdf=document.createElement('button');trkPdf.type='button';trkPdf.textContent='PDF with tick boxes';trkPdf.onclick=async()=>{trkPdf.disabled=true;status.textContent='Preparing PDF…';try{await exportSavedPatternPDF(record,true);status.textContent='Tracker PDF downloaded.'}catch(e){status.textContent=`PDF export failed: ${e.message||'could not create the file'}`}finally{trkPdf.disabled=false}};
 const trackBtn=document.createElement('button');trackBtn.type='button';trackBtn.textContent=projGet('maker-'+record.id)?'View in Project journal':'Track progress';trackBtn.onclick=()=>{try{const project=addSavedPatternToJournal(record);location.hash='#journal-project?id='+encodeURIComponent(project.id)}catch(e){status.textContent=`Could not add this pattern to the journal: ${e.message||'storage error'}`}};
 const viewBtn=document.createElement('button');viewBtn.type='button';viewBtn.textContent='View';viewBtn.onclick=()=>{location.hash='#bagpattern?id='+encodeURIComponent(record.id)};
 content.append(heading,meta,actions,status);const gBtn=document.createElement('button');gBtn.type='button';gBtn.textContent='Edit garment design';gBtn.onclick=()=>{if(!garmOpen(record.garmentId))status.textContent='That garment design is no longer saved in My garments.'};
 content.append(heading,meta,actions,status);actions.append(...(record.bag?[viewBtn]:[]),...(record.garmentId&&garmRead()[record.garmentId]?[gBtn]:[]),open,trackBtn,exportButton,trkPdf,remove);paper.append(content);article.append(paper);return article
}
function savedChartCard(kind,name,chart,index){
 const article=document.createElement('article'),paper=document.createElement('div'),content=document.createElement('div');
 article.className='note pm-saved-card n'+(index%4);paper.className='paper t'+(index%3);
 const grid={w:chart.w,h:chart.h,col:chart.col,sym:chart.sym};
 paper.append(gridThumb(grid,!!KINDS[kind].knit,170));
 const heading=document.createElement('h3');heading.textContent=name;
 const meta=document.createElement('p');meta.className='meta';meta.textContent=`${KINDS[kind].n}, ${chart.w} × ${chart.h} stitches`;
 const actions=document.createElement('div');actions.className='pm-saved-actions';
 const status=document.createElement('p');status.className='pm-saved-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 const open=document.createElement('button');open.type='button';open.textContent='Open / edit';open.onclick=()=>{pendProj={n:name,g:chart};location.hash='#'+kind};
 const exportButton=document.createElement('button');exportButton.type='button';exportButton.textContent='Export PDF';exportButton.onclick=async()=>{exportButton.disabled=true;status.textContent='Preparing PDF…';try{const canvas=sheet('chart',{...chart,name},kind),blob=await pdf(canvas);downloadFile(`${patternFilename(name)}.pdf`,blob,'application/pdf');status.textContent='PDF downloaded.'}catch(e){status.textContent=`PDF export failed: ${e.message||'could not create the file'}`}finally{exportButton.disabled=false}};
 const remove=document.createElement('button');remove.type='button';sureBtn(remove,()=>{try{const saved=JSON.parse(localStorage.getItem(Kp(kind))||'{}');delete saved[name];localStorage.setItem(Kp(kind),JSON.stringify(saved));renderSavedCharts()}catch(e){status.textContent=`Could not delete this chart: ${e.message||'browser storage error'}`}},'Delete');
 content.append(heading,meta,actions,status);actions.append(open,exportButton,remove);paper.append(content);article.append(paper);return article
}
const shopPrice=value=>new Intl.NumberFormat('en-GB',{style:'currency',currency:'GBP'}).format(value);
let shopSort='newest';
function shopArtwork(item){
 const art=document.createElement('div');art.className='shop-art';art.style.background=`linear-gradient(140deg,${item.colors[0]},${item.colors[1]})`;
 const icon=document.createElement('span');icon.textContent=item.icon;icon.setAttribute('aria-hidden','true');art.append(icon);return art
}
function shopImage(item){
 if(!item.image)return shopArtwork(item);
 const img=document.createElement('img');img.className='shop-photo';img.src=item.image;img.alt=item.title;img.loading='lazy';
 img.addEventListener('error',()=>img.replaceWith(shopArtwork(item)),{once:true});return img
}
function shopCard(item,index){
 const card=document.createElement('article');card.className=`shop-card shop-card-${index%3}`;
 const preview=document.createElement('button');preview.type='button';preview.className='shop-card-preview';preview.setAttribute('aria-label',`View listing: ${item.title}`);preview.append(shopImage(item));
 const badge=document.createElement('span');badge.className=`shop-badge${item.status==='sold'?' sold':''}`;badge.textContent=item.status==='sold'?'Sold':'Sample listing';preview.append(badge);
 preview.onclick=()=>{location.hash='#shop-'+item.id};
 const body=document.createElement('div');body.className='shop-card-body';
 const title=document.createElement('button');title.type='button';title.className='shop-card-title';title.textContent=item.title;title.onclick=preview.onclick;
 const category=document.createElement('p');category.className='meta';category.textContent=item.category;
 const desc=document.createElement('p');desc.textContent=item.description;
 const footer=document.createElement('div');footer.className='shop-card-footer';
 const price=document.createElement('strong');price.textContent=shopPrice(item.price);
 const date=document.createElement('span');date.className='meta';date.textContent=item.status==='sold'?`Sold ${fmt(item.soldAt)}`:`Added ${fmt(item.added)}`;
 const view=document.createElement('button');view.type='button';view.className='pri';view.textContent=item.status==='sold'?'View sold listing':'View listing';view.onclick=preview.onclick;
 footer.append(price,date);body.append(title,category,desc,footer,view);card.append(preview,body);return card
}
function renderShopListings(){
 const available=SHOP_LISTINGS.filter(item=>item.status==='available'),sold=SHOP_LISTINGS.filter(item=>item.status==='sold');
 const sorters={
  newest:(a,b)=>b.added.localeCompare(a.added),
  'price-low':(a,b)=>a.price-b.price||b.added.localeCompare(a.added),
  'price-high':(a,b)=>b.price-a.price||b.added.localeCompare(a.added)
 };
 available.sort(sorters[shopSort]||sorters.newest);
 sold.sort((a,b)=>(b.soldAt||b.added).localeCompare(a.soldAt||a.added));
 const availableEl=$('#shop-available'),soldEl=$('#shop-sold');
 availableEl.replaceChildren(...available.map(shopCard));
 soldEl.replaceChildren(...sold.map((item,index)=>shopCard(item,index)));
 $('#shop-count').textContent=`${available.length} available ${available.length===1?'listing':'listings'} · ${sold.length} sold`;
 if(!available.length){const empty=document.createElement('p');empty.className='meta';empty.textContent='No listings are available right now.';availableEl.append(empty)}
 if(!sold.length){const empty=document.createElement('p');empty.className='meta';empty.textContent='No sold listings to show yet.';soldEl.append(empty)}
}
function showShopListing(id){
 const item=SHOP_LISTINGS.find(listing=>listing.id===id);if(!item){location.hash='#shop';return}
 const view=$('#shop-detail-view');view.replaceChildren();
 const back=document.createElement('button');back.type='button';back.textContent='← Back to shop';back.onclick=()=>{location.hash='#shop'};view.append(back);
 const panel=document.createElement('article');panel.className='shop-detail';
 const media=document.createElement('div');media.className='shop-detail-media';media.append(shopImage(item));
 const content=document.createElement('div');content.className='shop-detail-content';
 const badge=document.createElement('span');badge.className=`shop-badge${item.status==='sold'?' sold':''}`;badge.textContent=item.status==='sold'?'Sold':'Sample listing';
 const title=document.createElement('h2');title.textContent=item.title;
 const category=document.createElement('p');category.className='meta';category.textContent=item.category;
 const price=document.createElement('p');price.className='shop-detail-price';price.textContent=shopPrice(item.price);
 const description=document.createElement('p');description.textContent=item.description;
 const details=document.createElement('p');details.textContent=item.details;
 const added=document.createElement('p');added.className='meta';added.textContent=`Added ${fmt(item.added)}${item.soldAt?` · Sold ${fmt(item.soldAt)}`:''}`;
 const buy=document.createElement('button');buy.type='button';buy.className='pri shop-buy';buy.textContent=item.status==='sold'?'Sold':'Buy — coming soon';buy.disabled=item.status==='sold';
 const status=document.createElement('p');status.className='shop-buy-status';status.setAttribute('role','status');status.setAttribute('aria-live','polite');
 if(item.status==='available')buy.addEventListener('click',()=>{status.textContent='Checkout is coming soon. This sample listing cannot be purchased yet.'});
 content.append(badge,title,category,price,description,details,added,buy,status);if(item.pattern&&PAT.some(p=>p.id==item.pattern)){const pl=document.createElement('button');pl.type='button';pl.textContent='See the pattern';pl.onclick=()=>{location.hash='#pattern-'+item.pattern};content.append(pl)}panel.append(media,content);view.append(panel)
}
function renderShop(id=''){
 const listingView=$('#shop-list-view'),detailView=$('#shop-detail-view');
 listingView.hidden=!!id;detailView.hidden=!id;
 if(id)showShopListing(id);else renderShopListings()
}
function showPost(id){const p=POSTS.find(x=>x.id==id),el=$('#post');if(!p){location.hash='#posts';return}
 el.innerHTML=`<button id="bk">← All posts</button><div class="win" style="margin-top:1rem"><div class="tb"><span>${p.tag}</span><i class="dots"><b></b><b></b><b></b></i></div><div class="bd" style="padding-top:1rem;max-width:70ch"><h1 style="font-size:clamp(2rem,5vw,3rem)">${p.t}</h1><p class="meta">${fmt(p.date)}${p.sample?', sample post':''}</p>${p.body.map(x=>`<p>${x}</p>`).join('')}${p.go?`<button class="pri" id="pg">Try the ${KINDS[p.go].n.toLowerCase()} chart maker</button>`:''}</div></div>`;
 $('#bk').onclick=()=>{location.hash='#posts'};if(p.go)$('#pg').onclick=()=>{location.hash='#'+p.go}}
function renderSavedPatterns(){
 const el=$('#my-pattern-list');if(!el)return;
 patternThumbUrls.forEach(url=>URL.revokeObjectURL(url));patternThumbUrls=[];el.replaceChildren();
 const loading=document.createElement('p');loading.className='mine-loading';loading.textContent='Loading saved patterns…';el.append(loading);
 allSavedPatterns().then(records=>{
  loading.remove();records.sort((a,b)=>(b.updatedAt||0)-(a.updatedAt||0));
  if(records.length)records.forEach(record=>el.append(savedPatternCard(record,el.querySelectorAll('.pm-saved-card').length)));
  else{const empty=document.createElement('p');empty.className='lead';empty.textContent='No patterns saved yet. Make a pattern, then save it here.';el.append(empty)}
 }).catch(e=>{loading.remove();const warning=document.createElement('p');warning.className='lead';warning.setAttribute('role','alert');warning.textContent=`Saved patterns could not be loaded: ${e.message||'storage error'}`;el.append(warning)})
}
function renderSavedCharts(){
 const el=$('#my-chart-list');if(!el)return;el.replaceChildren();let any=0;
 Object.keys(KINDS).forEach(k=>{
  try{
   const saved=JSON.parse(localStorage.getItem(Kp(k))||'{}');
   Object.keys(saved).forEach(name=>{any=1;el.append(savedChartCard(k,name,saved[name],el.querySelectorAll('.pm-saved-card').length))})
  }catch(e){const warning=document.createElement('p');warning.className='lead';warning.setAttribute('role','alert');warning.textContent=`Saved charts could not be loaded: ${e.message||'browser storage error'}`;el.append(warning)}
 });
 if(!any&&!el.querySelector('[role="alert"]')){const empty=document.createElement('p');empty.className='lead';empty.textContent='No charts saved yet. Make a chart, then save it here.';el.append(empty)}
}

/* ---------- written instructions ---------- */
function written(){const w=S.w,h=S.h,K=KINDS[kind],cn0=x=>NAMES[x]||'colour '+x,out={head:[],rows:[],foot:[]},runs=a=>{const o=[];a.forEach(v=>{if(o.length&&o[o.length-1][0]==v)o[o.length-1][1]++;else o.push([v,1])});return o};
 const order=[];if(K.knit)for(let n=1;n<=h;n++){const r=h-n,ix=Array.from({length:w},(_,c)=>r*w+c);if(n%2)ix.reverse();ix.forEach(i=>{if(!order.includes(S.col[i]))order.push(S.col[i])})}
 const L=i=>String.fromCharCode(65+i),cn=x=>K.knit?'Colour '+L(order.indexOf(x)):cn0(x);
 out.head.push(`${K.n} chart: ${w} stitches wide and ${h} rows high.`);
 if(K.knit){out.head.push('Colours: '+order.map((c,i)=>`Colour ${L(i)} = ${cn0(c)}`).join('; ')+'.');out.head.push(`Cast on: the chart is ${w} stitches wide, so cast on a multiple of ${w} stitches: ${w} for one repeat of the chart, ${w*2} for two, ${w*3} for three, ${w*4} for four, and so on. Repeat the chart across each row. If you are knitting flat and sewing a seam, cast on 2 extra stitches for the seam edges.`)}
 else{out.head.push(`Cast on: the chart is ${w} stitches wide, so cast on a multiple of ${w} stitches: ${w} for one repeat of the chart, ${w*2} for two, ${w*3} for three, ${w*4} for four, and so on. Repeat the chart across each row. If you are knitting flat and sewing a seam, cast on 2 extra stitches for the seam edges. For a plain border at each side of the piece, add those stitches to your cast on as well.`);const u=[...new Set(S.sym.map(s=>s||'k'))];out.head.push('Abbreviations: '+u.map(s=>`${ABBR[s]} = ${SYMS[s].toLowerCase()}`).join('; ')+'.')}
 for(let n=1;n<=h;n++){const r=h-n,rs=n%2==1,idx=Array.from({length:w},(_,c)=>r*w+c);if(rs)idx.reverse();let t;
  if(K.knit)t=runs(idx.map(i=>S.col[i])).map(([v,k])=>`${rs?'knit':'purl'} ${k} in ${cn(v).replace('Colour ','Colour ')}`).join(', ');
  else t=runs(collapseCab(idx.map(i=>{const s=S.sym[i]||'k';return rs?s:s=='k'?'p':s=='p'?'k':s}))).map(([v,k])=>v=='k'||v=='p'?v+k:ABBR[v]+(k>1?' ×'+k:'')).join(', ');
  out.rows.push(`Row ${n} (${rs?'right side, read right to left':'wrong side, read left to right'}): ${t}.`)}
 out.foot.push('Written for flat knitting. Row 1 is the bottom row of the chart. For knitting in the round, read every row from right to left and work every stitch as shown on the right side.');
 if(!K.knit)out.foot.push('Blank squares are knit stitches. On wrong-side rows, work knit symbols as purl and purl symbols as knit.');
 else out.foot.push(`Work the ${w} stitches of the chart across the row, repeating them to the end of the row (one repeat, then another, until you reach the number of stitches you cast on). Carry the colour not in use loosely across the back of the work.`);return out}
function renderText(){const w=written(),el=$('#wi');el.innerHTML='';const h=document.createElement('h3');h.textContent=S.name||'Untitled chart';el.append(h);
 w.head.forEach(t=>{const p=document.createElement('p');p.textContent=t;el.append(p)});const ul=document.createElement('ul');w.rows.forEach(t=>{const li=document.createElement('li');li.textContent=t;ul.append(li)});el.append(ul);
 w.foot.forEach(t=>{const p=document.createElement('p');p.className='meta';p.textContent=t;el.append(p)})}
const textExport=()=>{const w=written();return[S.name||'Untitled chart','',...w.head,'',...w.rows,'',...w.foot].join('\n')};

/* ---------- designer ---------- */
const cv=$('#cv'),cs=()=>Math.max(10,Math.min(32,Math.floor(720/S.w)));
let curN=10;
function fitN(both){
 const W=document.querySelector('.wrap').clientWidth-16,narrow=innerWidth<=760,knit=view=='knit';
 if(both){
  const tl=document.querySelector('.tool'),st=document.querySelector('.stage'),
   avail=innerHeight-(tl.querySelector('.tb').offsetHeight+8)-(st.offsetHeight-cv.offsetHeight-($('#pb2').offsetHeight+14))-6,
   byW=(W-36)/S.w,byH=narrow?99:Math.floor((avail-14)/S.h);
  return Math.min(44,byW,Math.max(.25,byH))
 }
 const player=document.querySelector('#music-player'),playerH=player?player.getBoundingClientRect().height:0,
  availableH=Math.max(100,innerHeight-playerH-24),
  byW=(W-(knit?0:36))/S.w,byH=(availableH-(knit?0:24))/(S.h*(knit?.88:1));
 return Math.min(44,byW,byH)
}
addEventListener('resize',()=>{if(kind&&!$('#design').hidden)render()});
(()=>{const b=$('#tbmin'),body=$('#tbbody');const set=m=>{body.hidden=m;b.textContent=m?'Open tool box ▼':'Minimise ▲';b.setAttribute('aria-expanded',!m);try{localStorage.setItem('mollsstudio:tbmin',m?'1':'')}catch(e){}if(kind)render()};
 b.onclick=()=>set(!body.hidden);$('#moretools').ontoggle=()=>{if(kind)render()};try{if(localStorage.getItem('mollsstudio:tbmin'))set(true)}catch(e){}})();
let refit=0;
function render(){if(!kind)return;{const t=$('#ftxt'),t2=$('#fsel');if(t)t.hidden=!KINDS[kind].knit;if(t2)t2.hidden=!KINDS[kind].knit}if(view=='garment'&&!KINDS[kind].knit)view='chart';{const gv=view=='garment';$('#gar').hidden=!gv;if(gv){$('#pair').hidden=true;$('#wi').hidden=true;document.querySelector('.wrap').classList.remove('fit');GS.setChart({w:S.w,h:S.h,col:S.col});GS.render();$('#hint').textContent='Your chart on a garment. Drag the chart to place it. Go back to the Chart tab to keep editing.';return}}const txt=view=='text',both=view=='both',showC=view=='chart'||both,showK=view=='knit'||both;$('#pb1').hidden=txt;$('#pb2').hidden=txt||!both;$('#pair').classList.toggle('two',both);$('#pair').hidden=txt;document.querySelector('.wrap').classList.toggle('fit',both);$('#pb1 .pt').hidden=!both;$('#wi').hidden=!txt;$('#edr').hidden=txt||view=='knit';
 if(txt){renderText();$('#hint').textContent='Written instructions update as you edit your chart.';return}
 const dpr=devicePixelRatio||1,ink=getComputedStyle(document.documentElement).getPropertyValue('--ink'),n=fitN(both);curN=n;
 const size=(c,W,H)=>{c.width=W*dpr;c.height=H*dpr;c.style.width=W+'px';c.style.height=H+'px';const x=c.getContext('2d');x.setTransform(dpr,0,0,dpr,0,0);return x};
 if(selCell&&(selCell[0]>=S.w||selCell[1]>=S.h))selCell=null;
 if(showC){const ctx=size(cv,S.w*n+(KINDS[kind].knit?68:36),S.h*n+24);drawChart(ctx,S,n,ink,false,KINDS[kind].knit);{const sr=mdrag?rectOf(mdrag[0],mdrag[1],mdrag[2],mdrag[3],S):msel;if(mfl){ctx.globalAlpha=.85;for(let j=0;j<mfl.b.h;j++)for(let i=0;i<mfl.b.w;i++){const x=mfl.x+i,y=mfl.y+j;if(x<0||y<0||x>=S.w||y>=S.h)continue;ctx.fillStyle=mfl.b.col[j*mfl.b.w+i];ctx.fillRect(x*n,y*n,n,n)}ctx.globalAlpha=1}
  if(tool=='paste'&&mainGhost&&CLIP){ctx.globalAlpha=.6;for(let j=0;j<CLIP.h;j++)for(let i=0;i<CLIP.w;i++){const x=mainGhost[0]+i,y=mainGhost[1]+j;if(x<0||y<0||x>=S.w||y>=S.h)continue;ctx.fillStyle=CLIP.col[j*CLIP.w+i];ctx.fillRect(x*n,y*n,n,n)}ctx.globalAlpha=1}
  const R=mfl?{x:mfl.x,y:mfl.y,w:mfl.b.w,h:mfl.b.h}:sr;if(R){ctx.setLineDash([6,4]);ctx.strokeStyle='#2563eb';ctx.lineWidth=2.5;ctx.fillStyle='rgba(37,99,235,.10)';ctx.fillRect(R.x*n,R.y*n,R.w*n,R.h*n);ctx.strokeRect(R.x*n+1,R.y*n+1,R.w*n-2,R.h*n-2);ctx.setLineDash([])}}
 if(tool=='text'&&mainGhost){const m=mainTextBlock(mainGhost[0]);if(m){ctx.globalAlpha=.6;ctx.fillStyle=color;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++)if(m.on[j*m.w+i]&&mainGhost[0]+i<S.w&&mainGhost[1]+j<S.h)ctx.fillRect((mainGhost[0]+i)*n,(mainGhost[1]+j)*n,n,n);ctx.globalAlpha=1}}if(selCell&&$('#frc').open){const[sc,sr]=selCell;ctx.fillStyle='rgba(37,99,235,.13)';ctx.fillRect(0,sr*n,S.w*n,n);ctx.fillRect(sc*n,0,n,S.h*n);ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.strokeRect(sc*n+1.5,sr*n+1.5,n-3,n-3)}if(rect){const[a,b,c,d]=rect;ctx.setLineDash([5,4]);ctx.strokeStyle='#e11d48';ctx.lineWidth=2;ctx.strokeRect(Math.min(a,c)*n,Math.min(b,d)*n,(Math.abs(c-a)+1)*n,(Math.abs(d-b)+1)*n);ctx.setLineDash([])}}
 if(showK){const c=both?$('#cv2'):cv,ctx=size(c,S.w*n,Math.round(S.h*n*.88));drawKnit(ctx,S,n,n*.88)}
 if(!refit&&view!='text'){refit=1;const m=fitN(both);if(m!==n)render();refit=0}
 {const e=$('#rcsel');if(e)e.textContent=selCell?`Selected: row ${S.h-selCell[1]} (counting from the bottom), column ${S.w-selCell[0]} (counting from the right). Rows and columns are numbered as on the chart.`:'Click a square on the chart to choose where to add or delete. Row 1 is the bottom row.'}
 $('#hint').textContent=view=='knit'?'Knitted preview. Switch back to the chart to keep editing.':KINDS[kind].hint+' Row 1 is at the bottom. Read right-side rows from right to left.'+(both?' The knitted preview fills in as you draw.':'')}
function clearCab(c,r){const g=cabGroup(S.sym,S.w,c,r);if(g)for(let x=g[0];x<=g[1];x++)S.sym[r*S.w+x]=''}
function put(c,r){if(c<0||r<0||c>=S.w||r>=S.h)return;const i=r*S.w+c;if(tool=='paint')S.col[i]=color;
 else if(tool=='symbol'){if(ISCAB(sym)){const W=CABW[sym];if(S.w<W)return;const st=Math.min(c,S.w-W);for(let x=st;x<st+W;x++)clearCab(x,r);for(let x=st;x<st+W;x++)S.sym[r*S.w+x]=sym}else{clearCab(c,r);S.sym[i]=sym}}
 else if(tool=='erase'){clearCab(c,r);S.col[i]=BASE;S.sym[i]=''}}
function flood(c,r){if(c<0||r<0||c>=S.w||r>=S.h)return;const t=S.col[r*S.w+c];if(t==color)return;const st=[[c,r]];while(st.length){const[x,y]=st.pop();if(x<0||y<0||x>=S.w||y>=S.h)continue;const i=y*S.w+x;if(S.col[i]!=t)continue;S.col[i]=color;st.push([x+1,y],[x-1,y],[x,y+1],[x,y-1])}}
const pos=e=>{const b=cv.getBoundingClientRect(),n=curN;return[Math.floor((e.clientX-b.left)/n),Math.floor((e.clientY-b.top)/n)]};
let drag=false,before='';
cv.onpointerdown=e=>{if(view!='chart'&&view!='both')return;e.preventDefault();cv.setPointerCapture(e.pointerId);drag=true;before=snap();const[c,r]=pos(e);if(c>=0&&r>=0&&c<S.w&&r<S.h)selCell=[c,r];if(tool=='select'){if(msel&&c>=msel.x&&c<msel.x+msel.w&&r>=msel.y&&r<msel.y+msel.h){mfl={b:blkGet(S,msel),ox:c-msel.x,oy:r-msel.y,x:msel.x,y:msel.y};blkClear(S,msel)}else{msel=null;mdrag=[Math.max(0,Math.min(S.w-1,c)),Math.max(0,Math.min(S.h-1,r))];mdrag[2]=mdrag[0];mdrag[3]=mdrag[1]}}else if(tool=='paste'){if(CLIP){blkPut(S,CLIP,c,r);msel=rectClamp({x:c,y:r,w:CLIP.w,h:CLIP.h},S)}}else if(tool=='fill')flood(c,r);else if(tool=='area')rect=[c,r,c,r];else if(tool=='text')mainText(c,r);else put(c,r);render()};
cv.onpointermove=e=>{if(!drag){if((tool=='text'||tool=='paste')&&(view=='chart'||view=='both')){const[c,r]=pos(e);if(!mainGhost||mainGhost[0]!=c||mainGhost[1]!=r){mainGhost=[c,r];render()}}return}const[c,r]=pos(e);if(tool=='select'){if(mfl){mfl.x=c-mfl.ox;mfl.y=r-mfl.oy}else if(mdrag){mdrag[2]=Math.max(0,Math.min(S.w-1,c));mdrag[3]=Math.max(0,Math.min(S.h-1,r))}}else if(tool=='area')rect[2]=c,rect[3]=r;else if(tool!='fill'&&tool!='text'&&tool!='paste'&&!(tool=='symbol'&&ISCAB(sym)))put(c,r);render()};
cv.onpointerleave=()=>{if(mainGhost){mainGhost=null;render()}};
var mainGhost=null,msel=null,mfl=null,mdrag=null;
function mainTextBlock(c){return textBlock($('#mtxt').value,$('#mfont').value,+$('#mth').value||7,Math.max(S.w-c,12))}
function mainText(c,r){const m=mainTextBlock(c);if(!m){msg('Type some words in Add text first.');return}for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.on[j*m.w+i])continue;const x=c+i,y=r+j;if(x<0||y<0||x>=S.w||y>=S.h)continue;S.col[y*S.w+x]=color}}
cv.onpointerup=cv.onpointercancel=()=>{if(!drag)return;drag=false;if(mfl){blkPut(S,mfl.b,mfl.x,mfl.y);msel=rectClamp({x:mfl.x,y:mfl.y,w:mfl.b.w,h:mfl.b.h},S);mfl=null}else if(mdrag){msel=rectOf(mdrag[0],mdrag[1],mdrag[2],mdrag[3],S);mdrag=null}if(rect){const[a,b,c,d]=rect;for(let r=Math.max(0,Math.min(b,d));r<=Math.min(S.h-1,Math.max(b,d));r++)for(let x=Math.max(0,Math.min(a,c));x<=Math.min(S.w-1,Math.max(a,c));x++){clearCab(x,r);S.col[r*S.w+x]=BASE;S.sym[r*S.w+x]=''}rect=null}commit(before);render()};

/* add or delete rows and columns, next to the square you clicked on the chart */
var selCell=null;
function fixCables(){for(let r=0;r<S.h;r++){let c=0;while(c<S.w){const s=S.sym[r*S.w+c];if(!ISCAB(s)){c++;continue}let e=c;while(e<S.w&&S.sym[r*S.w+e]==s)e++;const W=CABW[s],L=Math.floor((e-c)/W)*W;for(let x=c+L;x<e;x++)S.sym[r*S.w+x]='';c=e}}}
function rcDo(op,n){
 if(!selCell){msg('Click a square on the chart first, then choose where to add or delete.');return}
 const[c,r]=selCell,w=S.w,h=S.h;n=Math.max(1,Math.min(50,Math.round(+n)||1));
 const rowNo=i=>h-i,colNo=i=>w-i,pl=(k,t)=>`${k} ${t}${k==1?'':'s'}`;
 const kind0=op.split('-')[0],what=op.split('-')[1];let out='';
 const rowsC=Array.from({length:h},(_,y)=>S.col.slice(y*w,(y+1)*w)),rowsS=Array.from({length:h},(_,y)=>S.sym.slice(y*w,(y+1)*w));let ns=selCell.slice();
 if(kind0=='add'){
  const vert=what=='above'||what=='below';if((vert?h:w)+n>200){msg(`Charts can be up to 200 ${vert?'rows high':'stitches wide'}.`);return}
  if(vert){const at=what=='above'?r:r+1;for(let i=0;i<n;i++){rowsC.splice(at,0,Array(w).fill(BASE));rowsS.splice(at,0,Array(w).fill(''))}if(what=='above')ns[1]=r+n;out=`Added ${pl(n,'row')} ${what} row ${rowNo(r)}.`}
  else{const at=what=='left'?c:c+1;rowsC.forEach(a=>a.splice(at,0,...Array(n).fill(BASE)));rowsS.forEach(a=>a.splice(at,0,...Array(n).fill('')));if(what=='left')ns[0]=c+n;out=`Added ${pl(n,'column')} on the ${what} of column ${colNo(c)}.`}}
 else{
  let a,k;
  if(what=='row'){a=r;k=1}else if(what=='above'){k=Math.min(n,r);a=r-k}else if(what=='below'){k=Math.min(n,h-1-r);a=r+1}
  else if(what=='col'){a=c;k=1}else if(what=='left'){k=Math.min(n,c);a=c-k}else{k=Math.min(n,w-1-c);a=c+1}
  const vert=what=='row'||what=='above'||what=='below';
  if(k<1){msg(`There is no ${vert?'row':'column'} ${what=='above'?'above':what=='below'?'below':what=='left'?'to the left of':'to the right of'} that square.`);return}
  if((vert?h:w)-k<2){msg(`Keep at least 2 ${vert?'rows':'columns'} in the chart.`);return}
  if(vert){rowsC.splice(a,k);rowsS.splice(a,k);if(what=='above')ns[1]=r-k;else if(what=='row')ns[1]=Math.min(r,h-k-1);out=what=='row'?`Deleted row ${rowNo(r)}.`:`Deleted ${pl(k,'row')} ${what} row ${rowNo(r)}.`}
  else{rowsC.forEach(x=>x.splice(a,k));rowsS.forEach(x=>x.splice(a,k));if(what=='left')ns[0]=c-k;else if(what=='col')ns[0]=Math.min(c,w-k-1);out=what=='col'?`Deleted column ${colNo(c)}.`:`Deleted ${pl(k,'column')} on the ${what} of column ${colNo(c)}.`}
  if(k<n&&what!='row'&&what!='col')out+=` (That was all there was.)`}
 act(()=>{S.h=rowsC.length;S.w=rowsC[0].length;S.col=rowsC.flat();S.sym=rowsS.flat();S.tile=null;fixCables()});
 selCell=ns;$('#gw').value=S.w;$('#gh').value=S.h;if(window.syncMirrors)syncMirrors();render();
 msg(`${out} The chart is now ${S.w} wide and ${S.h} high.`)}

function mSelOp(op){
 if(op=='all'){msel={x:0,y:0,w:S.w,h:S.h};setTool('select');render();return}
 if(op=='none'){msel=null;render();return}
 if(op=='paste'){if(!CLIP){msg('Copy or cut something first, then paste it.');return}setTool('paste');msg('Click the chart where the pasted piece should go. Click again to paste more copies.');render();return}
 if(!msel){msg('Choose the Select area tool and drag over part of the chart first.');return}
 if(op=='copy'){CLIP=blkGet(S,msel);msg(`Copied ${msel.w} × ${msel.h} stitches. Press Paste, then click the chart.`);return}
 act(()=>{if(op=='cut'){CLIP=blkGet(S,msel);blkClear(S,msel)}else if(op=='del')blkClear(S,msel);else{const g={w:S.w,h:S.h,col:S.col},nr=selTurn(g,msel,op);if(nr&&nr.whole){S.w=g.w;S.h=g.h;S.col=g.col;S.sym=Array(g.w*g.h).fill('');S.tile=null;$('#gw').value=S.w;$('#gh').value=S.h}msel=nr}});
 if(op=='cut')msg('Cut. Press Paste, then click the chart.')}
$$('[data-sel]').forEach(b=>b.onclick=()=>mSelOp(b.dataset.sel));
{const b=$('#mtool');if(b)b.onclick=()=>setTool('text')}
$$('[data-rc]').forEach(b=>b.onclick=()=>rcDo(b.dataset.rc,$('#rcn').value));
{const d=$('#frc');if(d)d.addEventListener('toggle',()=>{if(kind)render()})}

/* ---------- select an area: rotate, flip, move, copy, cut and paste ---------- */
var CLIP=null;
const blkGet=(g,r)=>{const col=[];for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)col.push(g.col[(r.y+y)*g.w+r.x+x]);return{w:r.w,h:r.h,col}},
 blkClear=(g,r)=>{for(let y=0;y<r.h;y++)for(let x=0;x<r.w;x++)g.col[(r.y+y)*g.w+r.x+x]=BASE},
 blkPut=(g,b,x0,y0)=>{for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++){const gx=x0+x,gy=y0+y;if(gx<0||gy<0||gx>=g.w||gy>=g.h)continue;g.col[gy*g.w+gx]=b.col[y*b.w+x]}},
 blkTurn=(b,op)=>{const{w,h,col}=b;if(op=='fh'||op=='fv'){const o=[];for(let y=0;y<h;y++)for(let x=0;x<w;x++)o.push(op=='fh'?col[y*w+(w-1-x)]:col[(h-1-y)*w+x]);return{w,h,col:o}}
  const nw=h,nh=w,o=new Array(w*h);for(let y=0;y<h;y++)for(let x=0;x<w;x++){const nx=op=='cw'?h-1-y:y,ny=op=='cw'?x:w-1-x;o[ny*nw+nx]=col[y*w+x]}return{w:nw,h:nh,col:o}},
 rectClamp=(r,g)=>{const x=Math.max(0,r.x),y=Math.max(0,r.y),x2=Math.min(g.w,r.x+r.w),y2=Math.min(g.h,r.y+r.h);return x2>x&&y2>y?{x,y,w:x2-x,h:y2-y}:null},
 rectOf=(a,b,c,d,g)=>{const x0=Math.max(0,Math.min(a,c)),x1=Math.min(g.w-1,Math.max(a,c)),y0=Math.max(0,Math.min(b,d)),y1=Math.min(g.h-1,Math.max(b,d));return{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}};
/* turn or flip the selected part of a grid in place. Returns the new selection (and may change the grid's own size when the whole grid is turned) */
function selTurn(g,r,op){
 if((op=='cw'||op=='ccw')&&r.w==g.w&&r.h==g.h){const nb=blkTurn(blkGet(g,r),op);g.w=nb.w;g.h=nb.h;g.col=nb.col;return{x:0,y:0,w:nb.w,h:nb.h,whole:true}}
 const b=blkGet(g,r);blkClear(g,r);const nb=blkTurn(b,op),t=op=='cw'||op=='ccw',nx=t?r.x+Math.round((r.w-nb.w)/2):r.x,ny=t?r.y+Math.round((r.h-nb.h)/2):r.y;blkPut(g,nb,nx,ny);return rectClamp({x:nx,y:ny,w:nb.w,h:nb.h},g)}
/* ---------- what would this look like on a garment ---------- */
const GARMENTS=[{id:'tote',n:'Tote bag',noun:'bag',img:(window.GARMENT_IMAGES&&GARMENT_IMAGES.tote)||'images/garments/tote-bag.jpg',back:null,w:1024,h:661,area:{x:292,y:236,w:438,h:377},st:[46,50],mc:'#d9c6a3',mcName:'natural oat'},
 {id:'beanie',n:'Beanie',noun:'beanie',hat:true,img:(window.GARMENT_IMAGES&&GARMENT_IMAGES.beanie)||'images/garments/beanie.jpg',mask:(window.GARMENT_IMAGES&&GARMENT_IMAGES.beanieMask)||'images/garments/beanie-mask.png',back:null,w:1024,h:661,area:{x:267,y:235,w:495,h:188},st:[51,25],crop:3,mc:'#f1ece0',mcName:'natural white'}];
const GK=2,garLum=hx=>{const n=parseInt(hx.slice(1),16);return .299*(n>>16)+.587*((n>>8)&255)+.114*(n&255)};
/* the garment stage: one photo plus any number of charts you can drag around. Used in the chart maker tab (one chart) and on the "Add your chart to a garment" page (several) */
/* text for charts: turn words into stitches (a 5x7 pixel font, plus a few system fonts) */
const PIX5={A:[14,17,17,31,17,17,17],B:[30,17,17,30,17,17,30],C:[14,17,16,16,16,17,14],D:[30,17,17,17,17,17,30],E:[31,16,16,30,16,16,31],F:[31,16,16,30,16,16,16],G:[14,17,16,23,17,17,15],H:[17,17,17,31,17,17,17],I:[14,4,4,4,4,4,14],J:[7,2,2,2,2,18,12],K:[17,18,20,24,20,18,17],L:[16,16,16,16,16,16,31],M:[17,27,21,21,17,17,17],N:[17,17,25,21,19,17,17],O:[14,17,17,17,17,17,14],P:[30,17,17,30,16,16,16],Q:[14,17,17,17,21,18,13],R:[30,17,17,30,20,18,17],S:[15,16,16,14,1,1,30],T:[31,4,4,4,4,4,4],U:[17,17,17,17,17,17,14],V:[17,17,17,17,17,10,4],W:[17,17,17,21,21,21,10],X:[17,17,10,4,10,17,17],Y:[17,17,17,10,4,4,4],Z:[31,1,2,4,8,16,31],0:[14,17,19,21,25,17,14],1:[4,12,4,4,4,4,14],2:[14,17,1,2,4,8,31],3:[31,2,4,2,1,17,14],4:[2,6,10,18,31,2,2],5:[31,16,30,1,1,17,14],6:[6,8,16,30,17,17,14],7:[31,1,2,4,8,8,8],8:[14,17,17,14,17,17,14],9:[14,17,17,15,1,2,12],'!':[4,4,4,4,4,0,4],'?':[14,17,1,2,4,0,4],'.':[0,0,0,0,0,12,12],',':[0,0,0,0,12,4,8],'-':[0,0,0,31,0,0,0],'+':[0,4,4,31,4,4,0],"'":[12,4,8,0,0,0,0],'&':[12,18,20,8,21,18,13],':':[0,12,12,0,12,12,0],'*':[10,31,31,31,14,4,0],'♥':[10,31,31,31,14,4,0],' ':[0,0,0,0,0,0,0],'<':[2,4,8,16,8,4,2],'>':[8,4,2,1,2,4,8],'(':[2,4,8,8,8,4,2],')':[8,4,2,2,2,4,8],'/':[1,1,2,4,8,16,16],'_':[0,0,0,0,0,0,31],'=':[0,0,31,0,31,0,0],'#':[10,10,31,10,31,10,10],'@':[14,17,23,21,23,16,14],'%':[24,25,2,4,8,19,3]};
const T3={A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'110101101101101',O:'010101101101010',P:'110101110100100',Q:'010101101110011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111','0':'111101101101111','1':'010110010010111','2':'110001010100111','3':'110001010001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010',',':'000000000010100','!':'010010010000010','?':'110001010000010','-':'000000111000000',"'":'010010000000000',':':'000010000010000','♥':'101111111010010','&':'010101010101011','+':'000010111010000','/':'001001010100100'};
const GFONTS=[['pixel','Pixel (stitchy)'],['sans','Sans'],['serif','Serif'],['mono','Typewriter'],['round','Rounded'],['block','Narrow'],['script','Script']];
function textMask(str,font,h){
 str=String(str||'').replace(/<3/g,'♥').slice(0,60);h=Math.max(font=='pixel'?7:font=='round'?8:font=='mono'?9:11,Math.min(60,Math.round(h)||7));if(!str.trim())return null;
 if(font=='tiny'){
  const chars=[...str.toUpperCase()],cols=[];chars.forEach((ch,i)=>{const g=T3[ch]||T3['?'],w=ch==' '?2:3;for(let x=0;x<w;x++)cols.push(Array.from({length:5},(_,y)=>ch==' '?0:+g[y*3+x]));if(i<chars.length-1)cols.push(Array(5).fill(0))});
  const sc=Math.max(1,Math.round(h/5)),H=5*sc,W=cols.length*sc,on=new Uint8Array(W*H);
  for(let y=0;y<H;y++)for(let x=0;x<W;x++)on[y*W+x]=cols[Math.floor(x/sc)][Math.floor(y/sc)];
  return{w:W,h:H,on}}
 if(font=='pixel'){
  const chars=[...str.toUpperCase()],cols=[];chars.forEach((ch,i)=>{const g=PIX5[ch]||PIX5['?'],w=ch==' '?3:5;for(let x=0;x<w;x++)cols.push(g.map(r=>(r>>(4-x))&1));if(i<chars.length-1)cols.push(Array(7).fill(0))});
  const sw=cols.length,sc=Math.max(1,Math.round(h/7)),W=sw*sc,on=new Uint8Array(W*7*sc);h=7*sc;
  for(let y=0;y<h;y++)for(let x=0;x<W;x++)on[y*W+x]=cols[Math.min(sw-1,Math.floor(x/sc))][Math.min(6,Math.floor(y/sc))];
  return{w:W,h,on}}
 const fam={sans:"200 PX 'Helvetica Neue', 'Segoe UI Light', 'Segoe UI', Arial, sans-serif",serif:"300 PX Georgia, 'Times New Roman', serif",mono:"300 PX 'Courier New', Courier, monospace",round:"200 PX 'Trebuchet MS', 'Avenir Next', 'Segoe UI Light', sans-serif",block:"200 PX 'Arial Narrow', 'Helvetica Neue', 'Segoe UI Light', Arial, sans-serif",script:"italic 300 PX 'Brush Script MT', 'Segoe Script', cursive"}[font]||"200 PX sans-serif",
  S=4,px=Math.round(h/.72)*S,f=fam.replace('PX',px+'px'),cv=document.createElement('canvas'),x=cv.getContext('2d');x.font=f;const w=Math.ceil(x.measureText(str).width)+S*6;cv.width=w;cv.height=Math.ceil(px*1.5);
  x.font=f;x.textBaseline='alphabetic';x.fillStyle='#000';x.fillText(str,S*3,px*1.05);
  const d=x.getImageData(0,0,cv.width,cv.height).data;let x0=1e9,x1=-1,y0=1e9,y1=-1;
  for(let j=0;j<cv.height;j++)for(let i=0;i<cv.width;i++)if(d[(j*cv.width+i)*4+3]>60){if(i<x0)x0=i;if(i>x1)x1=i;if(j<y0)y0=j;if(j>y1)y1=j}
  if(x1<0)return null;x0=Math.floor(x0/S);x1=Math.floor(x1/S);y0=Math.floor(y0/S);y1=Math.floor(y1/S);
  const W=x1-x0+1,H=y1-y0+1,on=new Uint8Array(W*H);
  for(let j=0;j<H;j++)for(let i=0;i<W;i++){let sum=0;for(let v=0;v<S;v++)for(let u=0;u<S;u++){const X=(x0+i)*S+u,Y=(y0+j)*S+v;if(X<cv.width&&Y<cv.height)sum+=d[(Y*cv.width+X)*4+3]}on[j*W+i]=sum/(S*S*255)>=.3?1:0}
  return{w:W,h:H,on}}
function textBlock(str,font,h,maxW){
 const lines=[];String(str||'').split(/\n/).forEach(par=>{const words=par.trim().split(/\s+/).filter(Boolean);let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w,m=textMask(t,font,h);if(cur&&m&&m.w>(maxW||999)){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur)});
 const ms=lines.map(l=>textMask(l,font,h)).filter(Boolean);if(!ms.length)return null;
 const gap=Math.max(1,Math.round(h*.3)),W=Math.max(...ms.map(m=>m.w)),H=ms.reduce((a,m)=>a+m.h,0)+gap*(ms.length-1),on=new Uint8Array(W*H);let y=0;
 ms.forEach(m=>{for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++)on[(y+j)*W+i]=m.on[j*m.w+i];y+=m.h+gap});return{w:W,h:H,on}}
function garHTML(multi,extra){return `<p class="ginfo hint"></p>
 <div class="gwrap">
 <div class="gcentre">${multi?'<div class="gsides"><span class="gtabs" role="group" aria-label="Which side of the garment"><button type="button" data-side="front" aria-pressed="true">Front</button><button type="button" data-side="back" aria-pressed="false">Back</button></span><span class="gsidetools"><button type="button" class="gcpfb" title="Make the back match the front">Copy front → back</button><button type="button" class="gcpbf" title="Make the front match the back">Copy back → front</button><label><input type="checkbox" class="gsame"> Same on both sides</label></span></div>':''}<div class="gstage"><canvas class="gcv" tabindex="0" aria-label="Your chart on a garment. Drag a chart, or use the arrow keys, to move it."></canvas></div>
  <div class="gbelow">${extra||''}${multi?'':'<label class="garselw">Garment <select class="garsel"></select></label>'}</div></div>
 <button type="button" class="gtab" aria-label="Show options" title="Show options">‹</button>
 <aside class="gside" aria-label="Garment options">
  <div class="ghead"><button type="button" class="gfs" title="View the garment full screen">Full</button><button type="button" class="gzoom" aria-pressed="false" title="Zoom in on the front of the garment">Zoom</button><button type="button" class="gsave" title="Save a picture">Save</button><button type="button" class="gmin" aria-label="Hide options" title="Hide options">›</button></div>
  <div class="gsec"><span class="gmode" role="group" aria-label="What the mouse does"><button type="button" data-m="move" aria-pressed="true">Move</button><button type="button" data-m="draw" aria-pressed="false">Draw</button><button type="button" data-m="erase" aria-pressed="false">Erase</button><button type="button" data-m="text" aria-pressed="false">Text</button><button type="button" data-m="select" aria-pressed="false">Select</button></span>
   <span class="gselr" hidden><span class="gtip">Drag over part of a chart (or the bag). Drag inside it to move it.</span><span class="gselb"><button type="button" data-g="all">All</button><button type="button" data-g="none">None</button><button type="button" data-g="ccw" title="Rotate left">↺</button><button type="button" data-g="cw" title="Rotate right">↻</button><button type="button" data-g="fh" title="Flip left-right">⇆</button><button type="button" data-g="fv" title="Flip up-down">⇅</button><button type="button" data-g="copy">Copy</button><button type="button" data-g="cut">Cut</button><button type="button" data-g="paste">Paste</button><button type="button" data-g="del">Delete</button></span></span>
   <span class="gtxr" hidden><input type="text" class="gtxt" maxlength="40" placeholder="Type your words" aria-label="Text to add"><span class="gtxr2"><select class="gfont" aria-label="Font">${GFONTS.map(([k,n])=>`<option value="${k}">${n}</option>`).join('')}</select><label>Tall <input type="number" class="gth" min="7" max="60" value="7" aria-label="Text height in stitches"></label></span><span class="gtip">Then click on the bag or a chart to place it. Use the colour below.</span></span>
   <span class="gbrs" role="group" aria-label="Brush size">Brush <button type="button" data-b="1" aria-pressed="true">1</button><button type="button" data-b="2" aria-pressed="false">2</button><button type="button" data-b="3" aria-pressed="false">3</button></span>
   <span class="gpal" role="group" aria-label="Colours to draw with"></span>
   <span class="gnewr"><input type="color" class="gnew" value="#ff3d9a" aria-label="New colour"><button type="button" class="gaddc" title="Add this colour">+ Colour</button></span>
   <button type="button" class="gbag">Draw on the whole bag</button></div>
  ${multi?'<details class="gbox" open><summary>Charts</summary><div class="gaddrow"><select class="gaddsel" aria-label="Add a chart"></select><button type="button" class="gaddbtn">+ Add</button></div><div class="glayers" aria-label="Charts on the garment"></div></details>':''}
  <details class="gbox"><summary>Place and size</summary><div class="gin">
   <button type="button" class="gfit pri" title="Make the chart as big as it can be while still fitting inside the bag">Fit chart to bag</button>
   <span class="gpos" role="group" aria-label="Place the chart on the garment">${[['tl','Top left','↖'],['tc','Top centre','↑'],['tr','Top right','↗'],['ml','Middle left','←'],['mc','Centre','●'],['mr','Middle right','→'],['bl','Bottom left','↙'],['bc','Bottom centre','↓'],['br','Bottom right','↘']].map(([k,t,a])=>`<button type="button" data-p="${k}" title="${t}" aria-label="${t}">${a}</button>`).join('')}</span>
   <span class="gwh"><label>W <input type="number" class="gw" min="1" max="200"></label><label>H <input type="number" class="gh" min="1" max="200"></label></span>
   <span class="gsz2"><label><input type="checkbox" class="gkeep" checked> Keep shape</label><button type="button" class="grs">Original</button></span>
   <span class="gtip">Or drag the pink corner square.</span></div></details>
  <details class="gbox" open><summary>Hide colours</summary><div class="gin"><div class="gsws"><span>Click a colour to hide or show it on the garment.</span><span class="garsw"></span><button type="button" class="gshow">Show all colours</button></div></div></details>
  <details class="gbox"><summary>How it looks</summary><div class="gin">
   <div class="gbagc"><span>Bag colour</span><span class="gbagsw"></span></div>
   <label><input type="checkbox" class="gon" checked> Hide light colours</label>
   <label class="gsl">Cut-off <input type="range" class="glt" min="120" max="250" value="205"></label>
   <label class="gsl">See-through <input type="range" class="gop" min="30" max="100" value="80"></label>
</div></details>
 </aside></div>`}
function garStage(root,o){
 o=o||{};const q=s=>root.querySelector(s),cv=q('.gcv'),st={id:'tote',layers:[],sel:0,hid:{},op:80,light:205,on:true,imgs:{},mode:'move',color:'',pal:[],brush:1,zoom:false,ghost:null,txt:'',font:'pixel',th:7,gsel:null,gfl:null,bagCol:'',tint:{}};let drag=null;st.sides={front:st.layers,back:[]};st.selS={front:0,back:0};st.side='front';st.same=false;
 const G=()=>GARMENTS.find(g=>g.id==st.id)||GARMENTS[0],hidden=hx=>hx in st.hid?st.hid[hx]:(st.on&&garLum(hx)>=st.light),
  clamp=L=>{const[sw,sh]=G().st;L.pos[0]=Math.max(-(L.g.w-1),Math.min(sw-1,L.pos[0]));L.pos[1]=Math.max(-(L.g.h-1),Math.min(sh-1,L.pos[1]))},
  centre=L=>{const[sw,sh]=G().st;if(L.bag){L.pos=[0,0];return}L.pos=[Math.max(0,Math.round((sw-L.g.w)/2)),Math.max(0,Math.round((sh-L.g.h)/2))];clamp(L)},
  cur=()=>st.layers[st.sel],
  view=()=>{const g=G();if(!st.zoom)return{x:0,y:0,w:g.w,h:g.h};const A=g.area,m=24,x=Math.max(0,A.x-m),y=Math.max(0,A.y-m),x2=Math.min(g.w,A.x+A.w+m),y2=Math.min(g.h,A.y+A.h+m);return{x,y,w:x2-x,h:y2-y}},
  handle=L=>{const g=G(),A=g.area,[cw,ch]=cell();return[Math.min(g.w*GK-16,A.x*GK+(L.pos[0]+L.g.w)*cw),Math.min(g.h*GK-16,A.y*GK+(L.pos[1]+L.g.h)*ch)]},
  cell=()=>{const g=G(),A=g.area;return[A.w/g.st[0]*GK,A.h/g.st[1]*GK]},
  build=L=>{const[cw,ch]=cell(),cols=[...new Set(L.g.col)],key=[L.g.w,L.g.h,L.g.col.join(),cols.map(hidden).join(),st.id].join('|');
   if(!L.ov||L.key!=key){L.key=key;const c=document.createElement('canvas');c.width=Math.ceil(L.g.w*cw);c.height=Math.ceil(L.g.h*ch);drawKnit(c.getContext('2d'),L.g,cw,ch,hidden);L.ov=c}};
 const setMode=m=>{st.mode=m;cv.style.cursor=m=='move'?'':'crosshair'},
  cellAt=(L,x,y)=>{const A=G().area,[cw,ch]=cell();return[Math.floor((x-A.x*GK)/cw-L.pos[0]),Math.floor((y-A.y*GK)/ch-L.pos[1])]},
  stamp=(L,x0,y0)=>{const m=textBlock(st.txt,st.font,st.th,Math.max(L.pos[0]+L.g.w-x0,12));if(!m)return false;let ch=false;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++){if(!m.on[j*m.w+i])continue;const x=x0-L.pos[0]+i,y=y0-L.pos[1]+j;if(x<0||y<0||x>=L.g.w||y>=L.g.h)continue;const k=y*L.g.w+x;if(L.g.col[k]!=st.color){L.g.col[k]=st.color;ch=true}}return ch},
  dab=(L,cx,cy)=>{const b=st.brush,x0=cx-Math.floor((b-1)/2),y0=cy-Math.floor((b-1)/2),hex=st.mode=='erase'?BASE:st.color;let ch=false;for(let y=y0;y<y0+b;y++)for(let x=x0;x<x0+b;x++){if(x<0||y<0||x>=L.g.w||y>=L.g.h)continue;const i=y*L.g.w+x;if(L.g.col[i]!=hex){L.g.col[i]=hex;ch=true}}return ch};
 st.handle=()=>handle(cur());
 st.addBag=()=>{let L=st.layers.find(l=>l.bag);if(!L){const[sw,sh]=G().st,g={w:sw,h:sh,col:Array(sw*sh).fill(BASE)};L={src:g,g,name:'Whole bag',pos:[0,0],bag:true};st.layers.unshift(L)}st.sel=st.layers.indexOf(L);setMode('draw');return L};
 st.removeBag=()=>{const i=st.layers.findIndex(l=>l.bag);if(i<0)return;st.layers.splice(i,1);st.sel=Math.max(0,Math.min(st.sel,st.layers.length-1))};
 st.hasBag=()=>st.layers.some(l=>l.bag);
 const serL=l=>({name:l.name,pos:l.pos.slice(),bag:!!l.bag,g:{w:l.g.w,h:l.g.h,col:l.g.col.slice()},src:l.src===l.g?null:{w:l.src.w,h:l.src.h,col:l.src.col.slice()}}),
  desL=o=>{const g={w:o.g.w,h:o.g.h,col:o.g.col.slice()},src=o.src?{w:o.src.w,h:o.src.h,col:o.src.col.slice()}:g;return{src,g,name:o.name,pos:o.pos.slice(),bag:o.bag||undefined,ov:null,key:''}},
  sideList=side=>st.same?(st.side=='front'?st.layers:st.sides.front):(side==st.side?st.layers:st.sides[side]);
 st.exportDesign=()=>({garment:st.id,same:st.same,bagCol:st.bagCol,sides:{front:sideList('front').map(serL),back:(st.same?[]:sideList('back')).map(serL)}});
 st.importDesign=d=>{st.reset();st.id=d.garment||'tote';st.bagCol=d.bagCol||'';st.tint={};st.sides.front=(d.sides.front||[]).map(desL);st.sides.back=(d.sides.back||[]).map(desL);st.layers=st.sides.front;st.same=!!d.same;st.sel=Math.max(0,st.layers.length-1)};
 st.mainHex=()=>st.bagCol||G().mc||'#d9c6a3';
 st.loc=()=>{const nn=G().noun||'bag',W=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while(n=W.nextNode()){let v=n.nodeValue;if(n._n!==undefined&&v===n._n)v=n._o;else n._o=v;const out=nn=='bag'?v:v.replace(/whole-bag/g,'whole-'+nn).replace(/\bbag\b/g,nn).replace(/\bBag\b/g,nn[0].toUpperCase()+nn.slice(1));if(out!==n.nodeValue){n._n=out;n.nodeValue=out}else if(nn=='bag')n._n=undefined}};
 {let lt=0;new MutationObserver(()=>{clearTimeout(lt);lt=setTimeout(st.loc,0)}).observe(root,{subtree:true,childList:true,characterData:true})}
 st.panel=side=>{const[sw,sh]=G().st,L=st.same?st.layers:(side==st.side?st.layers:st.sides[side]),col=[];
  for(let y=0;y<sh;y++)for(let x=0;x<sw;x++){let v=null;for(let i=L.length-1;i>=0;i--){const l=L[i],lx=x-l.pos[0],ly=y-l.pos[1];if(lx<0||ly<0||lx>=l.g.w||ly>=l.g.h)continue;const k=l.g.col[ly*l.g.w+lx];if(hidden(k))continue;v=k;break}col.push(v)}
  return{w:sw,h:sh,col}};
 st.pic=side=>{if(st.same)side='front';const was=st.side,z=st.zoom,sg=st.gsel;if(was!=side)st.setSide(side);st.zoom=false;st.gsel=null;const hold=st.layers[st.sel];st.render();st.paint(false);let u='';try{u=cv.toDataURL('image/jpeg',.92)}catch(e){}
  if(!u){try{const P=st.panel(side),MC=st.mainHex(),g={w:P.w,h:P.h,col:P.col.map(v=>v||MC)},sw=12,sh=10,c2=document.createElement('canvas');c2.width=g.w*sw+24;c2.height=g.h*sh+24;const x2=c2.getContext('2d');x2.fillStyle='#f4f1ea';x2.fillRect(0,0,c2.width,c2.height);x2.save();x2.translate(12,12);drawKnit(x2,g,sw,sh);x2.restore();u=c2.toDataURL('image/jpeg',.92)}catch(e){u=''}}
  st.zoom=z;if(was!=side)st.setSide(was);st.gsel=sg;st.render();return u};
 st.add=(g,name)=>{const L={src:g,g,name:name||'Chart',pos:[0,0]};centre(L);const n=st.layers.length;if(n){L.pos[0]+=n*2;L.pos[1]+=n*2;clamp(L)}st.layers.push(L);st.sel=st.layers.length-1;return L};
 st.setChart=g=>{const L=st.layers.find(l=>!l.bag),sig=g.w+'x'+g.h+':'+g.col.join('');if(L){if(L.sig!=sig){L.src=g;L.g=g;L.sig=sig}if(st.sel>=st.layers.length)st.sel=0}else{st.add(g,'Your chart').sig=sig}};
 const resize=(L,w,h)=>{w=Math.max(1,Math.min(200,Math.round(w)||1));h=Math.max(1,Math.min(200,Math.round(h)||1));const s=L.src;if(w==s.w&&h==s.h){L.g=s;return}const col=[];for(let y=0;y<h;y++){const sy=Math.min(s.h-1,Math.floor(y*s.h/h));for(let x=0;x<w;x++)col.push(s.col[sy*s.w+Math.min(s.w-1,Math.floor(x*s.w/w))])}L.g={w,h,col}},
  place=(L,k)=>{if(L.bag)return;const[sw,sh]=G().st,c=k[1],r=k[0];L.pos=[c=='l'?0:c=='r'?sw-L.g.w:Math.round((sw-L.g.w)/2),r=='t'?0:r=='b'?sh-L.g.h:Math.round((sh-L.g.h)/2)];clamp(L)};
 const cloneLayers=a=>a.map(l=>{const g={w:l.g.w,h:l.g.h,col:l.g.col.slice()};return{src:g,g,name:l.name,pos:l.pos.slice(),bag:l.bag,ov:null,key:''}}),
  url=()=>st.side=='back'&&G().back?G().back:G().img;
 st.count=()=>st.sides.front.length+(st.same?0:st.sides.back.length);
 st.setSide=side=>{if(side==st.side)return;st.selS[st.side]=st.sel;if(!(st.same&&st.side=='back'))st.sides[st.side]=st.layers;st.side=side;st.layers=(st.same&&side=='back')?st.sides.front:st.sides[side];st.sel=Math.min(st.selS[side]||0,Math.max(0,st.layers.length-1));st.gsel=null;st.gfl=null;st.ghost=null};
 st.copySide=to=>{if(st.same)return;const from=to=='back'?'front':'back',src=st.side==from?st.layers:st.sides[from],dst=st.side==to?st.layers:st.sides[to],cp=cloneLayers(src);dst.length=0;cp.forEach(l=>dst.push(l));if(st.side==to)st.sel=Math.min(st.sel,Math.max(0,dst.length-1));st.gsel=null};
 st.setSame=on=>{if(on==st.same)return;if(on){st.same=true;if(st.side=='back'){st.selS.back=st.sel;st.layers=st.sides.front;st.sel=Math.min(st.selS.front||0,Math.max(0,st.layers.length-1))}}else{st.sides.back=cloneLayers(st.sides.front);st.same=false;if(st.side=='back')st.layers=st.sides.back}st.gsel=null};
 st.reset=()=>{st.layers=[];st.sides={front:st.layers,back:[]};st.selS={front:0,back:0};st.side='front';st.same=false;st.sel=0;st.gsel=null;st.gfl=null};
 const BAGCOLS=['#ffffff','#f7c6dc','#ff5cad','#c8102e','#f4a261','#ffe552','#8cf5b4','#2fbf71','#9ec5ff','#2563eb','#b9a3ff','#8a8a8a','#1b1022'],
  tinted=(im,hex)=>{const key=url()+hex;if(st.tint[key]!==undefined)return st.tint[key];let out=null;
   try{const c=document.createElement('canvas');c.width=im.naturalWidth;c.height=im.naturalHeight;const x=c.getContext('2d');x.drawImage(im,0,0);const d=x.getImageData(0,0,c.width,c.height),p=d.data,n=parseInt(hex.slice(1),16),T=[n>>16,(n>>8)&255,n&255],br=p[0],bg=p[1],bb=p[2];
    const ms=new Float32Array(c.width*c.height);let sum=0,cnt=0;
    for(let i=0;i<ms.length;i++){const dr=p[i*4]-br,dg=p[i*4+1]-bg,db=p[i*4+2]-bb,dist=Math.sqrt(dr*dr+dg*dg+db*db),t=Math.max(0,Math.min(1,(dist-14)/26));ms[i]=t*t*(3-2*t);if(ms[i]>.95){sum+=(.299*p[i*4]+.587*p[i*4+1]+.114*p[i*4+2])/255;cnt++}}
    {const mi=G().mask&&st.imgs[G().mask];if(G().mask&&!(mi&&mi.naturalWidth))return null;
     if(mi){const mc2=document.createElement('canvas');mc2.width=c.width;mc2.height=c.height;const mx=mc2.getContext('2d');mx.drawImage(mi,0,0,c.width,c.height);const mp=mx.getImageData(0,0,c.width,c.height).data;sum=0;cnt=0;for(let i=0;i<ms.length;i++){ms[i]=mp[i*4+3]/255;if(ms[i]>.95){sum+=(.299*p[i*4]+.587*p[i*4+1]+.114*p[i*4+2])/255;cnt++}}}}
    const ref=cnt?sum/cnt:.75;
    for(let i=0;i<ms.length;i++){const m=ms[i];if(!m)continue;const lum=(.299*p[i*4]+.587*p[i*4+1]+.114*p[i*4+2])/255,f=lum/ref;for(let k=0;k<3;k++){const v=Math.max(0,Math.min(255,T[k]*f+(f-1)*14));p[i*4+k]=p[i*4+k]*(1-m)+v*m}}
    x.putImageData(d,0,0);out=c}catch(e){out=null}
   st.tint[key]=out;return out};
 st.paint=guides=>{const g=G(),A=g.area,im=st.imgs[url()];if(!im||!im.naturalWidth)return;const[cw,ch]=cell(),ctx=cv.getContext('2d');
  const V=view();ctx.setTransform(1,0,0,1,-V.x*GK,-V.y*GK);ctx.clearRect(0,0,g.w*GK,g.h*GK);{const tc=st.bagCol?tinted(im,st.bagCol):null;ctx.drawImage(tc||im,0,0,g.w*GK,g.h*GK);if(st.bagCol&&!tc){ctx.save();ctx.globalCompositeOperation='multiply';ctx.fillStyle=st.bagCol;ctx.fillRect(A.x*GK,A.y*GK,A.w*GK,A.h*GK);ctx.restore()}}
  ctx.save();ctx.beginPath();ctx.rect(A.x*GK,A.y*GK,A.w*GK,A.h*GK);ctx.clip();
  {const sc=st.comp||(st.comp=document.createElement('canvas'));if(sc.width!=Math.ceil(A.w*GK)||sc.height!=Math.ceil(A.h*GK)){sc.width=Math.ceil(A.w*GK);sc.height=Math.ceil(A.h*GK)}const c2=sc.getContext('2d');c2.clearRect(0,0,sc.width,sc.height);
   st.layers.forEach(L=>{if(L.ov)c2.drawImage(L.ov,L.pos[0]*cw,L.pos[1]*ch)});ctx.globalAlpha=st.op/100;ctx.drawImage(sc,A.x*GK,A.y*GK);ctx.globalAlpha=1}
  st.layers.forEach((L,i)=>{const px=A.x*GK+L.pos[0]*cw,py=A.y*GK+L.pos[1]*ch;
   if(guides&&i==st.sel&&!L.bag){ctx.setLineDash([10,8]);ctx.strokeStyle='#e11d48';ctx.lineWidth=3;ctx.strokeRect(px,py,L.g.w*cw,L.g.h*ch);ctx.setLineDash([])}});
  if(guides){const sr=drag&&drag.gsel?{L:drag.L,...rectOf(drag.x0,drag.y0,drag.x1,drag.y1,drag.L.g)}:st.gsel,F=st.gfl;
   if(F){ctx.globalAlpha=.9;for(let j=0;j<F.b.h;j++)for(let i=0;i<F.b.w;i++){const x=F.x+i,y=F.y+j;if(x<0||y<0||x>=F.L.g.w||y>=F.L.g.h)continue;ctx.fillStyle=F.b.col[j*F.b.w+i];ctx.fillRect(A.x*GK+(F.L.pos[0]+x)*cw,A.y*GK+(F.L.pos[1]+y)*ch,cw,ch)}ctx.globalAlpha=1}
   if(st.mode=='paste'&&st.ghost&&CLIP){ctx.globalAlpha=.6;for(let j=0;j<CLIP.h;j++)for(let i=0;i<CLIP.w;i++){ctx.fillStyle=CLIP.col[j*CLIP.w+i];ctx.fillRect(A.x*GK+(st.ghost[0]+i)*cw,A.y*GK+(st.ghost[1]+j)*ch,cw,ch)}ctx.globalAlpha=1}
   const R=F?{L:F.L,x:F.x,y:F.y,w:F.b.w,h:F.b.h}:sr;if(R&&st.layers.includes(R.L)){const px=A.x*GK+(R.L.pos[0]+R.x)*cw,py=A.y*GK+(R.L.pos[1]+R.y)*ch;ctx.fillStyle='rgba(37,99,235,.12)';ctx.fillRect(px,py,R.w*cw,R.h*ch);ctx.setLineDash([10,6]);ctx.strokeStyle='#2563eb';ctx.lineWidth=3;ctx.strokeRect(px,py,R.w*cw,R.h*ch);ctx.setLineDash([])}}
  if(guides&&st.mode=='text'&&st.ghost){const m=textBlock(st.txt,st.font,st.th,Math.max(g.st[0]-st.ghost[0],12));if(m){ctx.globalAlpha=.65;ctx.fillStyle=st.color;for(let j=0;j<m.h;j++)for(let i=0;i<m.w;i++)if(m.on[j*m.w+i])ctx.fillRect(A.x*GK+(st.ghost[0]+i)*cw,A.y*GK+(st.ghost[1]+j)*ch,cw,ch);ctx.globalAlpha=1}}
  ctx.restore();
  const L=cur();if(guides&&L&&!L.bag){const hp=handle(L);ctx.fillStyle='#ff3d9a';ctx.strokeStyle='#111';ctx.lineWidth=3;ctx.fillRect(hp[0]-14,hp[1]-14,28,28);ctx.strokeRect(hp[0]-14,hp[1]-14,28,28)}};
 st.render=()=>{const g=G(),[sw,sh]=g.st;
  if(!st.imgs[url()]){const im=new Image();im.onload=()=>st.render();im.src=url();st.imgs[url()]=im}
  if(g.mask&&!st.imgs[g.mask]){const mi=new Image();mi.onload=()=>{st.tint={};st.render()};mi.src=g.mask;st.imgs[g.mask]=mi}
  if(!st.imgs[url()].naturalWidth)return;
  st.layers.forEach(clamp);st.layers.forEach(build);
  const cols=[...new Set(st.layers.flatMap(L=>L.g.col))],sw_=q('.garsw');sw_.innerHTML='';
  cols.forEach(hx=>{const b=document.createElement('button'),hid=hidden(hx);b.type='button';b.className='gsw'+(hid?' off':'');b.style.background=hx;b.setAttribute('aria-pressed',!hid);b.title=hid?'Hidden on the garment. Click to show it.':'Shown on the garment. Click to hide it.';b.onclick=()=>{st.hid[hx]=!hidden(hx);st.render()};sw_.append(b)});
  {const V=view();cv.width=V.w*GK;cv.height=V.h*GK;cv.style.setProperty('--ar',V.w/V.h)}st.paint(true);
  const L=cur();
  {const base=o.palette?o.palette().slice():st.pal.slice();cols.forEach(h=>{if(!base.includes(h))base.push(h)});if(st.color&&!base.includes(st.color))base.push(st.color);st.pal=base;
   if(!st.color)st.color=base.find(h=>garLum(h)<200)||base[0]||'#ff3d9a';
   const pe=q('.gpal');pe.innerHTML='';base.forEach(h=>{const b=document.createElement('button');b.type='button';b.className='gsw'+(h==st.color?' pick':'');b.style.background=h;b.title=NAMES[h]||h;b.setAttribute('aria-label','Draw with '+(NAMES[h]||h));b.setAttribute('aria-pressed',h==st.color);b.onclick=()=>{st.color=h;if(st.mode=='move'||st.mode=='erase')setMode('draw');st.render()};pe.append(b)});
   root.querySelectorAll('.gmode button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.m==st.mode));q('.gtxr').hidden=st.mode!='text';q('.gselr').hidden=st.mode!='select'&&st.mode!='paste';if(st.gsel&&!st.layers.includes(st.gsel.L))st.gsel=null;cv.style.cursor=st.mode=='move'?'':'crosshair'}
  if(o.multi){root.querySelectorAll('[data-side]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.side==st.side));q('.gsame').checked=st.same;q('.gcpfb').disabled=st.same;q('.gcpbf').disabled=st.same}
  if(o.multi){const box=q('.glayers');box.innerHTML='';
   for(let i=st.layers.length-1;i>=0;i--){const l=st.layers[i],row=document.createElement('div');row.className='gl'+(i==st.sel?' on':'');
    const nm=document.createElement('button');nm.type='button';nm.className='gln';nm.setAttribute('aria-pressed',i==st.sel);nm.textContent=l.bag?'Whole bag':`${l.name} ${l.g.w}×${l.g.h}`;nm.title=nm.textContent;nm.onclick=()=>{st.sel=i;st.render()};
    const mk=(t,f,lbl)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.setAttribute('aria-label',lbl+' '+l.name);b.title=lbl;b.onclick=f;return b};
    const rm=mk('✕',()=>{st.layers.splice(i,1);st.sel=Math.max(0,Math.min(st.sel,st.layers.length-1));st.render();if(o.onChange)o.onChange()},'Remove');
    if(l.bag)row.append(nm,rm);else row.append(nm,mk('⧉',()=>{const c={g:l.g,name:l.name,pos:[l.pos[0]+l.g.w+1,l.pos[1]]};clamp(c);if(c.pos[0]<=l.pos[0])c.pos=[l.pos[0]+1,l.pos[1]+1];clamp(c);st.layers.push(c);st.sel=st.layers.length-1;st.render()},'Copy'),mk('↑',()=>{const j=i+1;if(j<st.layers.length){[st.layers[i],st.layers[j]]=[st.layers[j],st.layers[i]];st.sel=j}st.render()},'Move up a layer (on top of the one above)'),mk('↓',()=>{const j=i-1;if(j>=0&&!st.layers[j].bag){[st.layers[i],st.layers[j]]=[st.layers[j],st.layers[i]];st.sel=j}st.render()},'Move down a layer'),rm);box.append(row)}
   if(!st.layers.length)box.textContent='No charts on the garment yet.';else{const n=document.createElement('small');n.className='gtip';n.textContent='Top of the list = on top. Overlaps show the chart that is higher up.';box.prepend(n)}}
  const nch=st.layers.filter(l=>!l.bag).length,bg=st.hasBag();q('.gbag').textContent=bg?'Remove whole-bag drawing':'Draw on the whole bag';
  q('.ginfo').textContent=!L?'':o.multi?`${nch} chart${nch==1?'':'s'}${bg?' and a drawing on the whole bag':''} on the ${st.side} of the ${g.n.toLowerCase()}${st.same?' (both sides match)':''}. Drag a chart to move it, click one to pick it, or drag the pink corner square to resize it. The garment fits about ${sw} stitches by ${sh} rows, and anything past the edge is cropped.`:`Your chart is ${L.g.w} stitches wide and ${L.g.h} rows high. The ${g.n.toLowerCase()} fits about ${sw} stitches by ${sh} rows${L.g.w>sw||L.g.h>sh?', so anything past that edge is cropped.':'. Drag the chart across to see where you like it, or drag the pink corner square to resize it.'}`;
  q('.gop').value=st.op;q('.glt').value=st.light;q('.gon').checked=st.on;if(L){q('.gw').value=L.g.w;q('.gh').value=L.g.h;['.gw','.gh','.grs','.gkeep','.gfit'].forEach(k=>q(k).disabled=!!L.bag);root.querySelectorAll('.gpos button').forEach(b=>b.disabled=!!L.bag)}};
 const at=e=>{const r=cv.getBoundingClientRect(),V=view();return[(e.clientX-r.left)*cv.width/r.width+V.x*GK,(e.clientY-r.top)*cv.height/r.height+V.y*GK]};
 cv.onpointerdown=e=>{if(!st.layers.length&&!(o.multi&&st.mode=='text'))return;e.preventDefault();cv.setPointerCapture(e.pointerId);const[x,y]=at(e),A=G().area,[cw,ch]=cell(),gx=(x-A.x*GK)/cw,gy=(y-A.y*GK)/ch;
  if(st.mode=='select'||st.mode=='paste'){
   const hit=()=>{for(let i=st.layers.length-1;i>=0;i--){const L=st.layers[i];if(gx>=L.pos[0]&&gx<L.pos[0]+L.g.w&&gy>=L.pos[1]&&gy<L.pos[1]+L.g.h)return i}return -1},blocked=L=>{if(o.canDraw&&!o.canDraw(L)){q('.ginfo').textContent='Press Original size first: this works at the chart\'s own size.';return true}return false};
   if(st.mode=='paste'){const li=hit();if(li<0||!CLIP){q('.ginfo').textContent=CLIP?'Click on a chart, or switch on Draw on the whole bag, to paste onto.':'Copy or cut something first.';return}const L=st.layers[li];if(blocked(L))return;
    const tok=o.begin?o.begin():null,[cx,cy]=cellAt(L,x,y);blkPut(L.g,CLIP,cx,cy);L.src=L.g;L.sig='';L.key='';if(o.end)o.end(tok);st.sel=li;const r=rectClamp({x:cx,y:cy,w:CLIP.w,h:CLIP.h},L.g);st.gsel=r?{L,...r}:null;st.render();return}
   const S0=st.gsel;
   if(S0&&st.layers.includes(S0.L)){const[cx,cy]=cellAt(S0.L,x,y);if(cx>=S0.x&&cx<S0.x+S0.w&&cy>=S0.y&&cy<S0.y+S0.h){if(blocked(S0.L))return;const tok=o.begin?o.begin():null;st.gfl={L:S0.L,b:blkGet(S0.L.g,S0),ox:cx-S0.x,oy:cy-S0.y,x:S0.x,y:S0.y,tok};blkClear(S0.L.g,S0);S0.L.key='';build(S0.L);drag={gmove:1};st.paint(true);return}}
   const li=hit();if(li<0)return;const L=st.layers[li];st.sel=li;st.gsel=null;const[cx,cy]=cellAt(L,x,y);drag={gsel:1,L,x0:cx,y0:cy,x1:cx,y1:cy};st.render();return}
  if(st.mode=='text'){let li=-1;for(let i=st.layers.length-1;i>=0;i--){const L=st.layers[i];if(gx>=L.pos[0]&&gx<L.pos[0]+L.g.w&&gy>=L.pos[1]&&gy<L.pos[1]+L.g.h){li=i;break}}
   if(li<0&&o.multi&&textBlock(st.txt,st.font,st.th,99)){st.addBag();setMode('text');li=st.layers.findIndex(l=>l.bag)}
   if(li<0){q('.ginfo').textContent=st.txt.trim()?'Click on a chart to put the text on it.':'Type some words first.';return}
   const L=st.layers[li];if(o.canDraw&&!o.canDraw(L)){q('.ginfo').textContent='Press Original size first: drawing works at the chart\'s own size.';return}
   if(!textBlock(st.txt,st.font,st.th,99)){q('.ginfo').textContent='Type some words first.';return}
   const tok=o.begin?o.begin():null,ch=stamp(L,Math.floor(gx),Math.floor(gy));L.src=L.g;L.sig='';L.key='';if(ch&&o.end)o.end(tok);st.sel=li;st.ghost=null;setMode('move');st.render();q('.ginfo').textContent='Text added. Press Text again to add more, or drag charts as before.';return}
  if(st.mode!='move'){let li=-1;if(o.multi||st.layers.length>1){for(let i=st.layers.length-1;i>=0;i--){const L=st.layers[i];if(gx>=L.pos[0]&&gx<L.pos[0]+L.g.w&&gy>=L.pos[1]&&gy<L.pos[1]+L.g.h){li=i;break}}}else{const L=cur();if(gx>=L.pos[0]&&gx<L.pos[0]+L.g.w&&gy>=L.pos[1]&&gy<L.pos[1]+L.g.h)li=st.sel}
   if(li<0)return;const L=st.layers[li];if(o.canDraw&&!o.canDraw(L)){q('.ginfo').textContent='Press Original size first: drawing works at the chart\'s own size.';return}
   if(st.sel!=li){st.sel=li}
   drag={paint:1,L,tok:o.begin?o.begin():null,last:null,changed:false,raf:0};const[cx,cy]=cellAt(L,x,y);if(dab(L,cx,cy))drag.changed=true;drag.last=[cx,cy];L.key='';build(L);st.paint(true);return}
  if(!cur().bag){const hp=handle(cur());if(Math.abs(x-hp[0])<=24&&Math.abs(y-hp[1])<=24){drag={size:1,raf:0};cv.focus();return}}
  if(o.multi||st.layers.length>1){for(let i=st.layers.length-1;i>=0;i--){const L=st.layers[i];if(gx>=L.pos[0]&&gx<L.pos[0]+L.g.w&&gy>=L.pos[1]&&gy<L.pos[1]+L.g.h){if(st.sel!=i){st.sel=i;st.render()}break}}}
  drag={x,y,o:cur().pos.slice()};cv.classList.add('grab');cv.focus()};
 cv.onpointermove=e=>{const[x,y]=at(e),[cw,ch]=cell(),L=cur();
  if(!drag&&(st.mode=='text'||st.mode=='paste')){const A=G().area;st.ghost=[Math.floor((x-A.x*GK)/cw),Math.floor((y-A.y*GK)/ch)];st.paint(true);return}
  if(!drag){if(L&&!L.bag&&st.mode=='move'){const hp=handle(L);cv.style.cursor=Math.abs(x-hp[0])<=24&&Math.abs(y-hp[1])<=24?'nwse-resize':''}return}
  if(drag.gsel){const[cx,cy]=cellAt(drag.L,x,y);drag.x1=Math.max(0,Math.min(drag.L.g.w-1,cx));drag.y1=Math.max(0,Math.min(drag.L.g.h-1,cy));st.paint(true);return}
  if(drag.gmove){const F=st.gfl,[cx,cy]=cellAt(F.L,x,y);F.x=cx-F.ox;F.y=cy-F.oy;st.paint(true);return}
  if(drag.paint){const D=drag,[cx,cy]=cellAt(D.L,x,y);if(D.last&&(cx!=D.last[0]||cy!=D.last[1])){let[ax,ay]=D.last;const n=Math.max(Math.abs(cx-ax),Math.abs(cy-ay));for(let k=1;k<=n;k++){if(dab(D.L,Math.round(ax+(cx-ax)*k/n),Math.round(ay+(cy-ay)*k/n)))D.changed=true}D.last=[cx,cy];if(!D.raf)D.raf=requestAnimationFrame(()=>{D.raf=0;D.L.key='';build(D.L);st.paint(true)})}return}
  if(drag.size){const A=G().area,w=Math.max(1,Math.round((x-A.x*GK)/cw-L.pos[0])),h=q('.gkeep').checked?w*L.src.h/L.src.w:(y-A.y*GK)/ch-L.pos[1];resize(L,w,h);if(!drag.raf)drag.raf=requestAnimationFrame(()=>{if(drag)drag.raf=0;build(L);q('.gw').value=L.g.w;q('.gh').value=L.g.h;st.paint(true)});return}
  L.pos=[drag.o[0]+Math.round((x-drag.x)/cw),drag.o[1]+Math.round((y-drag.y)/ch)];clamp(L);st.paint(true)};
 cv.onpointerleave=()=>{if(st.ghost){st.ghost=null;st.paint(true)}};
 cv.onpointerup=cv.onpointercancel=()=>{const d=drag,was=d&&d.size;drag=null;cv.classList.remove('grab');if(was){clamp(cur());st.render()}if(d&&d.gsel){const r=rectOf(d.x0,d.y0,d.x1,d.y1,d.L.g);st.gsel={L:d.L,...r};st.render()}
  if(d&&d.gmove){const F=st.gfl;blkPut(F.L.g,F.b,F.x,F.y);F.L.src=F.L.g;F.L.sig='';F.L.key='';const r=rectClamp({x:F.x,y:F.y,w:F.b.w,h:F.b.h},F.L.g);st.gsel=r?{L:F.L,...r}:null;if(o.end)o.end(F.tok);st.gfl=null;st.render()}
  if(d&&d.paint){d.L.src=d.L.g;d.L.sig='';if(d.changed&&o.end)o.end(d.tok);d.L.key='';build(d.L);st.render()}};
 cv.onkeydown=e=>{const d={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key],L=cur();if(!d||!L)return;e.preventDefault();L.pos[0]+=d[0];L.pos[1]+=d[1];clamp(L);st.paint(true)};
 q('.gop').oninput=e=>{st.op=+e.target.value;st.paint(true)};
 if(o.multi){const sel=q('.gaddsel'),fill=()=>{const sv=garSavedCharts(),rd=garReady();sel.innerHTML='';[['My saved charts',sv],['Ready-made charts',rd]].forEach(([n,l])=>{if(!l.length)return;const og=document.createElement('optgroup');og.label=n;l.forEach((it,k)=>{const op=document.createElement('option');op.textContent=`${it.name} ${it.g.w}×${it.g.h}`;op._it=it;og.append(op)});sel.append(og)})};fill();sel.onmousedown=sel.onfocus=fill;q('.gaddbtn').onclick=()=>{const op=sel.selectedOptions[0];if(!op||!op._it)return;const it=op._it;st.add({w:it.g.w,h:it.g.h,col:it.g.col.slice()},it.name);st.render();if(o.onChange)o.onChange()}}
 {const box=q('.gbagsw'),mkb=(h,t)=>{const b=document.createElement('button');b.type='button';b.className='gsw'+(h?'':' gorig');b.style.background=h||'repeating-linear-gradient(45deg,#e8dcc5 0 4px,#fff 4px 8px)';b.title=t;b.setAttribute('aria-label','Bag colour: '+t);b.onclick=()=>{st.bagCol=h;box.querySelectorAll('button').forEach(x=>x.classList.toggle('pick',x===b));st.paint(true)};if(!h)b.classList.add('pick');box.append(b)};mkb('','Original bag colour');BAGCOLS.forEach(h=>mkb(h,h));const inp=document.createElement('input');inp.type='color';inp.value='#f7c6dc';inp.title='Pick any bag colour';inp.setAttribute('aria-label','Pick any bag colour');inp.oninput=()=>{st.bagCol=inp.value;box.querySelectorAll('button').forEach(x=>x.classList.remove('pick'));st.paint(true)};box.append(inp)}
 q('.gshow').onclick=()=>{st.hid={};st.on=false;q('.gon').checked=false;st.render()};
 q('.glt').oninput=e=>{st.light=+e.target.value;st.hid={};st.render()};
 q('.gon').onchange=e=>{st.on=e.target.checked;st.hid={};st.render()};
 root.querySelectorAll('.gpos button').forEach(b=>b.onclick=()=>{const L=cur();if(L){place(L,b.dataset.p);st.paint(true)}});

 const gSelOp=op=>{const info=t=>{q('.ginfo').textContent=t};
  if(op=='all'){const L=cur();if(!L){return}st.gsel={L,x:0,y:0,w:L.g.w,h:L.g.h};setMode('select');st.render();return}
  if(op=='none'){st.gsel=null;st.render();return}
  if(op=='paste'){if(!CLIP){info('Copy or cut something first, then paste it.');return}setMode('paste');st.render();info('Click on the bag or a chart where the piece should go. Click again for more copies.');return}
  const S0=st.gsel;if(!S0||!st.layers.includes(S0.L)){info('Choose Select, then drag over part of a chart or the bag first.');return}
  const L=S0.L;if(op=='copy'){CLIP=blkGet(L.g,S0);info(`Copied ${S0.w} × ${S0.h} stitches. Press Paste, then click where it should go.`);return}
  if(o.canDraw&&!o.canDraw(L)){info('Press Original size first: this works at the chart\'s own size.');return}
  const turn=op=='cw'||op=='ccw',whole=S0.w==L.g.w&&S0.h==L.g.h;
  if(turn&&whole&&(L.bag||o.single)){info(L.bag?'The whole-bag drawing cannot be turned as one piece. Select part of it first.':'Turn the whole chart in the chart maker. Select part of it here.');return}
  const tok=o.begin?o.begin():null;let nr=S0;
  if(op=='cut'){CLIP=blkGet(L.g,S0);blkClear(L.g,S0)}else if(op=='del')blkClear(L.g,S0);
  else{const ow=L.g.w,oh=L.g.h;nr=selTurn(L.g,S0,op);if(nr&&nr.whole){L.pos[0]+=Math.round((ow-L.g.w)/2);L.pos[1]+=Math.round((oh-L.g.h)/2)}}
  L.src=L.g;L.sig='';L.key='';st.gsel=nr?{L,x:nr.x,y:nr.y,w:nr.w,h:nr.h}:null;if(o.end)o.end(tok);st.render()};
 root.querySelectorAll('[data-g]').forEach(b=>b.onclick=()=>gSelOp(b.dataset.g));
 root.querySelectorAll('.gmode button').forEach(b=>b.onclick=()=>{setMode(b.dataset.m);st.render()});
 q('.gbag').onclick=()=>{if(st.hasBag())st.removeBag();else st.addBag();st.render()};
 q('.gtxt').oninput=e=>{st.txt=e.target.value;st.paint(true)};q('.gfont').onchange=e=>{st.font=e.target.value;const mn=st.font=='pixel'?7:st.font=='round'?8:st.font=='mono'?9:11;q('.gth').min=mn;if(st.th<mn){st.th=mn;q('.gth').value=mn}st.paint(true)};q('.gth').onchange=e=>{st.th=Math.max(7,Math.min(60,+e.target.value||7));e.target.value=st.th;st.paint(true)};
 root.querySelectorAll('.gbrs button').forEach(b=>b.onclick=()=>{st.brush=+b.dataset.b;root.querySelectorAll('.gbrs button').forEach(x=>x.setAttribute('aria-pressed',x==b))});
 const wrap=q('.gwrap'),setFull=on=>{if(on){st.zbefore=st.zoom;st.zoom=!G().hat}else if(st.zbefore!==undefined){st.zoom=st.zbefore;st.zbefore=undefined}q('.gzoom').setAttribute('aria-pressed',st.zoom);wrap.classList.toggle('full',on);document.body.classList.toggle('gfull-on',on);q('.gfs').textContent=on?'Exit':'Full';st.render()};
 q('.gfs').onclick=()=>setFull(!wrap.classList.contains('full'));
 q('.gzoom').onclick=()=>{st.zoom=!st.zoom;q('.gzoom').setAttribute('aria-pressed',st.zoom);st.render()};
 q('.gmin').onclick=()=>wrap.classList.add('pmin');q('.gtab').onclick=()=>wrap.classList.remove('pmin');
 addEventListener('keydown',e=>{if(e.key=='Escape'&&wrap.classList.contains('full'))setFull(false)});
 q('.gaddc').onclick=()=>{const h=q('.gnew').value.toLowerCase();if(!st.pal.includes(h)){st.pal.push(h);if(o.addColour)o.addColour(h)}st.color=h;if(st.mode=='move')setMode('draw');st.render()};
 const sz=which=>{const L=cur();if(!L)return;let w=+q('.gw').value,h=+q('.gh').value;if(q('.gkeep').checked){if(which=='w')h=w*L.src.h/L.src.w;else w=h*L.src.w/L.src.h}resize(L,w,h);clamp(L);st.render()};
 q('.gfit').onclick=()=>{const L=cur();if(!L||L.bag)return;const[sw,sh]=G().st,k=Math.min(sw/L.src.w,sh/L.src.h),w=Math.max(1,Math.min(sw,Math.floor(L.src.w*k+1e-9))),h=Math.max(1,Math.min(sh,Math.floor(L.src.h*k+1e-9)));resize(L,w,h);L.pos=[Math.floor((sw-L.g.w)/2),Math.floor((sh-L.g.h)/2)];q('.gkeep').checked=true;st.render();q('.ginfo').textContent=`Fitted to the bag: ${L.g.w} × ${L.g.h} stitches.`};
 q('.gw').onchange=()=>sz('w');q('.gh').onchange=()=>sz('h');q('.grs').onclick=()=>{const L=cur();if(L){L.g=L.src;clamp(L);st.render()}};
 if(o.multi){root.querySelectorAll('[data-side]').forEach(b=>b.onclick=()=>{st.setSide(b.dataset.side);st.render()});q('.gcpfb').onclick=()=>{st.copySide('back');st.render()};q('.gcpbf').onclick=()=>{st.copySide('front');st.render()};q('.gsame').onchange=e=>{st.setSame(e.target.checked);st.render()}}
 root.querySelectorAll('.gsave').forEach(b=>b.onclick=()=>{st.paint(false);cv.toBlob(b=>{const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download='my-chart-on-'+st.id+(o.multi?'-'+st.side:'')+'.png';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),2000);st.paint(true)})});
 const sel=q('.garsel');if(sel){GARMENTS.forEach(g=>sel.append(new Option(g.n,g.id)));sel.onchange=()=>{st.id=sel.value;st.layers.forEach(centre);st.render()};if(GARMENTS.length<2)q('.garselw').hidden=true}
 st.setGarment=id=>{st.id=id;st.layers.forEach(clamp);const nz=!!G().hat;if(nz)st.zoom=false;const zb=q('.gzoom');if(zb){zb.hidden=nz;zb.setAttribute('aria-pressed',st.zoom)}};
 return st}
var GS=null;
{const el=$('#gar');el.innerHTML=garHTML(false);GS=garStage(el,{single:true,palette:()=>pal,begin:()=>snap(),end:b=>{commit(b);swatches()},canDraw:L=>L.g===L.src,addColour:h=>{if(!pal.includes(h)){pal.push(h);swatches()}}})}
/* the "Add your chart to a garment" page under Tools: pick a garment, pick a chart, add as many charts as you like */
var GP=null;
function garSavedCharts(){let out=[];try{const o=JSON.parse(localStorage.getItem(Kp('colourwork'))||'{}');Object.keys(o).forEach(n=>{const c=o[n];if(c&&c.w&&c.col)out.push({name:n,g:{w:c.w,h:c.h,col:c.col.slice(),sym:(c.sym||[]).slice()}})})}catch(e){}return out}
var GREADY=null;
function garReady(){return GREADY||(GREADY=P.filter(p=>p.t=='colourwork'&&(p.rows||p.grid)).map(p=>({name:p.n,g:toGrid(p)})))}
function garPage(){
 const root=$('#garment');
 if(!GP){
  GP={step:1,src:'saved',stage:null};if(window.__garmPending){GP.pending=window.__garmPending;window.__garmPending=null}
  $('#gp3').innerHTML=garHTML(true,'<div class="gp-actions"><button type="button" id="gp-add" class="pri">+ Add another chart</button><button type="button" id="gp-change">← Change garment</button><button type="button" id="gp-clear">Start again</button><button type="button" id="gp-pat" class="pri">Write pattern for my bag</button></div><div class="gp-savebox"><label>Name this garment design <input type="text" id="gsv-name" maxlength="60" placeholder="e.g. Cherry tote"></label><button type="button" id="gsv-save" class="pri">Save to My garments</button><button type="button" id="gsv-view" hidden>Open My garments</button><span id="gsv-msg" class="hint" role="status"></span></div>');
  GP.stage=garStage($('#gp3'),{multi:true});
  const g1=$('#gp1-list');GARMENTS.forEach(g=>{const b=document.createElement('button');b.type='button';b.className='gp-card';const im=document.createElement('img');im.src=g.img;im.alt='';const t=document.createElement('b');t.textContent=g.n;const d=document.createElement('small');d.textContent=`About ${g.st[0]} stitches × ${g.st[1]} rows`;b.append(im,t,d);b.onclick=()=>{if(GP.stage.id!=g.id){GP.pat=null;GP.src2=null}GP.stage.setGarment(g.id);garGo(GP.stage.count()?3:2)};g1.append(b)});
  [['Sweater']].forEach(([n])=>{const b=document.createElement('div');b.className='gp-card soon';const t=document.createElement('b');t.textContent=n;const d=document.createElement('small');d.textContent='Coming soon';b.append(t,d);g1.append(b)});
  $$('#gp-src button').forEach(b=>b.onclick=()=>{GP.src=b.dataset.s;garPicker()});
  $('#gp-add').onclick=()=>garGo(2);$('#gp4-back').onclick=()=>garGo(3);$('#gp4-go').onclick=()=>garGo(5);$('#gp5-back').onclick=()=>garGo(garHat()?3:4);try{GP.build=localStorage.getItem('molls-garment-build')||''}catch(e){}$('#gp-pat').onclick=()=>garGo(garHat()?5:4);$('#gp-change').onclick=()=>garGo(1);$('#gp-clear').onclick=()=>{GP.stage.reset();GP.garmentId='';$('#gsv-name').value='';$('#gsv-msg').textContent='';garGo(2)};$('#gsv-save').onclick=gpSaveGarment;$('#gsv-view').onclick=()=>{location.hash='#my-garments'};
  $('#gp-skip').onclick=()=>garGo(3);
  $('#gp-bag').onclick=()=>{GP.stage.addBag();garGo(3)};
  $$('#gp-steps button').forEach(b=>b.onclick=()=>{const n=+b.dataset.n;if(n>=3&&!GP.stage.count()||n==5&&!GBUILDS.find(x=>x.id==GP.build)&&!garHat())return;garGo(n)});
 }
 if(GP.pending){const d=GP.pending;GP.pending=null;GP.stage.importDesign(d.design);GP.savedSig=garSig();GP.garmentId=d.id;GP.src=GP.src||'saved';$('#gsv-name').value=d.name;$('#gsv-msg').textContent='Loaded “'+d.name+'”. Edit it and press Save to update.';GP.step=3;GP.pat=null;GP.out=null}
 garGo(GP.step)}
function garHat(){const g=GP&&GP.stage&&GARMENTS.find(x=>x.id==GP.stage.id);return !!(g&&g.hat)}
function garGo(n){
 GP.step=n;[1,2,3,4,5].forEach(i=>{$('#gp'+i).hidden=i!=n;if(i==1)$('#gp1-list').parentElement.hidden=n!=1});
 $$('#gp-steps button').forEach(b=>{b.setAttribute('aria-current',+b.dataset.n==n?'step':'false');b.disabled=+b.dataset.n>=3&&!GP.stage.count()||+b.dataset.n==5&&!GBUILDS.find(x=>x.id==GP.build)&&!garHat()});
 {const hat=garHat(),g0=GARMENTS.find(x=>x.id==GP.stage.id)||GARMENTS[0];const b4=$('#gp-steps [data-n="4"]'),b5=$('#gp-steps [data-n="5"]');if(b4)b4.hidden=hat;if(b5)b5.textContent=hat?'4 · Your pattern':'5 · Your pattern';const pb=$('#gp-pat');if(pb)pb.textContent='Write pattern for my '+(g0.noun||'garment')}
 if(n==2)garPicker();if(n==4){garBuild();scrollTo({top:0});return}if(n==5){garPattern(true);scrollTo({top:0});return}
 if(n==3){GP.stage.render();requestAnimationFrame(()=>{const r=$('#gp3 .gstage').getBoundingClientRect();scrollTo({top:Math.max(0,scrollY+r.top-130),behavior:'smooth'})});return}
 scrollTo({top:0})}
function garPicker(){
 $$('#gp-src button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.s==GP.src));
 const list=GP.src=='saved'?garSavedCharts():garReady(),box=$('#gp2-list');box.innerHTML='';
 $('#gp-skip').hidden=!GP.stage.count();$('#gp-bag').hidden=GP.stage.hasBag();
 $('#gp2-note').textContent=GP.src=='saved'?(list.length?'These are the colour charts you saved in the colour chart maker.':'You have not saved any colour charts yet. Make one in the colour chart maker and press Save, or pick one from the ready-made charts.'):'Ready-made colourwork charts from the site.';
 const token=GP.tok=(GP.tok||0)+1,todo=[];GP.pick=[];const mb=$('#gp-multi'),ab=$('#gp-addsel'),upd=()=>{mb.setAttribute('aria-pressed',!!GP.multi);mb.textContent=GP.multi?'Selecting several: tap charts':'Select multiple';ab.hidden=!GP.multi;ab.disabled=!GP.pick.length;ab.textContent=`Add ${GP.pick.length||''} selected chart${GP.pick.length==1?'':'s'} →`.replace('Add  ','Add ')};
 mb.onclick=()=>{GP.multi=!GP.multi;GP.pick=[];box.querySelectorAll('.gp-card.picked').forEach(c=>c.classList.remove('picked'));upd()};
 ab.onclick=()=>{GP.pick.forEach(it=>GP.stage.add({w:it.g.w,h:it.g.h,col:it.g.col.slice()},it.name));GP.pick=[];garGo(3)};upd();
 list.forEach(it=>{const b=document.createElement('button');b.type='button';b.className='gp-card';const ph=document.createElement('span');ph.className='gp-ph';b.append(ph);todo.push(()=>{if(ph.isConnected)ph.replaceWith(gridThumb(it.g,false,150))});const t=document.createElement('b');t.textContent=it.name;const d=document.createElement('small');d.textContent=`${it.g.w} × ${it.g.h} stitches`;b.append(t,d);b.onclick=()=>{if(GP.multi){const i=GP.pick.indexOf(it);if(i<0)GP.pick.push(it);else GP.pick.splice(i,1);b.classList.toggle('picked',i<0);upd();return}GP.stage.add({w:it.g.w,h:it.g.h,col:it.g.col.slice()},it.name);garGo(3)};box.append(b)});
 const run=()=>{if(token!=GP.tok)return;todo.splice(0,4).forEach(f=>f());if(todo.length)requestAnimationFrame(run)};requestAnimationFrame(run)}
function swatches(){const el=$('#sw');el.innerHTML='';{const c=$('#chc');if(c&&!chS&&/^#[0-9a-f]{6}$/i.test(color))c.value=color.toLowerCase()}pal.forEach(h=>{const b=document.createElement('button');b.style.background=h;b.title=NAMES[h]||h;b.setAttribute('aria-label','Colour '+(NAMES[h]||h));b.setAttribute('aria-pressed',h==color);b.onclick=()=>{color=h;if(tool=='erase')setTool('paint');swatches()};el.append(b)})}
function setTool(t){tool=t;$$('#tools button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.t==t))}
function syms(){const el=$('#sy');el.innerHTML='';const list=KINDS[kind].sym;if(!list.includes(sym))sym=list[0];list.forEach(k=>{const b=document.createElement('button'),c=document.createElement('canvas'),wide=ISCAB(k),cw=wide?CABW[k]*22:22;c.width=cw*2;c.height=44;c.style.width=cw+'px';c.style.height='22px';const x=c.getContext('2d');x.scale(2,2);x.fillStyle=BASE;x.fillRect(0,0,cw,22);if(wide)cableWide(x,k,0,0,22,INK);else glyph(x,k,0,0,22,INK);b.append(c,SYMS[k]);b.setAttribute('aria-pressed',k==sym);b.onclick=()=>{sym=k;$$('#sy button').forEach(z=>z.setAttribute('aria-pressed',z==b));setTool('symbol')};el.append(b)})}
function syncViews(){$('#views [data-w=garment]').hidden=!KINDS[kind].knit;$('#views [data-w=knit]').hidden=!KINDS[kind].knit;$('#views [data-w=both]').hidden=!KINDS[kind].knit;$$('#views button').forEach(x=>x.setAttribute('aria-pressed',x.dataset.w==view))}
function setup(){const K=KINDS[kind];$('#ttl').textContent=K.n+' chart maker';$('#fc').hidden=!K.knit;$('#fimg').hidden=!K.knit;$('#intro').textContent=K.knit?'Pick a colour and draw your own pattern, one square at a time, or upload a picture and turn it into a chart.':'Pick a stitch and draw your own pattern on the grid, one square at a time.';$('#fpst').hidden=!K.knit;$('#fs').hidden=!!K.knit;
 $('#tools').innerHTML=K.tools.map(t=>`<button data-t="${t}">${TOOLS[t]}</button>`).join('');$$('#tools button').forEach(b=>b.onclick=()=>setTool(b.dataset.t));
 if(!K.tools.includes(tool))tool=K.tools[0];setTool(tool);if(K.knit)swatches();else syms();syncViews()}
function enter(k){if(GS)GS.reset();docs={};dirty=false;kind=k;if(window.resetPictures)resetPictures();({S,undo,redo,pal,color,sym,tool}=docs[k]||newDoc(k));view='chart';rect=null;setup();$('#nm').value=S.name||'';$('#gw').value=S.w;$('#gh').value=S.h;list();msg('')}
function act(f){const b=snap();f();commit(b);render()}
function go(a,b){if(!a.length)return;b.push(snap());load(JSON.parse(a.pop()));if(KINDS[kind]&&KINDS[kind].knit)swatches();draft();render()}
const clamp=v=>Math.max(2,Math.min(200,Math.round(+v)||16));
$('#rs').onclick=()=>{const w=clamp($('#gw').value),h=clamp($('#gh').value);act(()=>{const c=Array(w*h).fill(BASE),s=Array(w*h).fill('');for(let r=0;r<Math.min(h,S.h);r++)for(let x=0;x<Math.min(w,S.w);x++){c[r*w+x]=S.col[r*S.w+x];s[r*w+x]=S.sym[r*S.w+x]}if(S.tile){const T=S.tile;for(let r=0;r<h;r++)for(let x=0;x<w;x++)if(r>=S.h||x>=S.w){const i=(r%T.h)*T.w+(x%T.w);c[r*w+x]=T.col[i];s[r*w+x]=T.sym[i]}}S.w=w;S.h=h;S.col=c;S.sym=s});$('#gw').value=w;$('#gh').value=h};
/* ---------- picture to chart ---------- */
let IMG=null;
(()=>{
const hx=(r,g,b)=>'#'+[r,g,b].map(v=>Math.max(0,Math.min(255,Math.round(v))).toString(16).padStart(2,'0')).join('');
const rgb=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]};
const d2=(a,b)=>{const x=a[0]-b[0],y=a[1]-b[1],z=a[2]-b[2];return x*x+y*y+z*z};
const THEME=['#ff5cad','#ff9acb','#ffd3ea','#8cf5b4','#2fbf71','#ffe552','#1b1022',BASE];
/* choosing the colours: done in Lab (how the eye sees differences), counting each colour by how many squares use it.
   The colours picked must each differ clearly from every other one: the fewer colours asked for, the further apart they have to be. */
const lin=v=>{v/=255;return v<=.04045?v/12.92:Math.pow((v+.055)/1.055,2.4)};
const lab=p=>{const r=lin(p[0]),g=lin(p[1]),b=lin(p[2]),f=t=>t>.008856?Math.cbrt(t):7.787*t+16/116,X=f((.4124*r+.3576*g+.1805*b)/.95047),Y=f(.2126*r+.7152*g+.0722*b),Z=f((.0193*r+.1192*g+.9505*b)/1.08883);return[116*Y-16,500*(X-Y),200*(Y-Z)]};
const dl=(a,b)=>Math.sqrt((a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2);
const minDist=k=>k<=3?36:k<=4?32:k<=5?30:k<=6?27:k<=8?23:k<=10?19:k<=12?16:k<=16?12:k<=24?8:k<=64?5:3;
function quant(px,k,minD){
 const bins=new Map();px.forEach(p=>{const key=(p[0]>>3)<<10|(p[1]>>3)<<5|(p[2]>>3);let b=bins.get(key);if(!b){b=[0,0,0,0];bins.set(key,b)}b[0]+=p[0];b[1]+=p[1];b[2]+=p[2];b[3]++});
 const pts=[...bins.values()].map(b=>{const rgb=[b[0]/b[3],b[1]/b[3],b[2]/b[3]];return{rgb,lab:lab(rgb),n:b[3]}}).sort((a,b)=>b.n-a.n);
 const N=px.length,minN=Math.max(1,N*.0006);let cen=[pts[0].lab.slice()],md=pts.map(p=>dl(p.lab,cen[0]));
 const remd=()=>{md=pts.map(p=>Math.min(...cen.map(c=>dl(p.lab,c))))};
 const seed=()=>{ // the colour that is furthest from every chosen colour, counting how many squares use it
  let bi=-1,bs=0;pts.forEach((p,i)=>{if(p.n<minN||md[i]<minD)return;const sc=md[i]*Math.sqrt(p.n);if(sc>bs){bs=sc;bi=i}});
  if(bi<0)return false;const c=pts[bi].lab.slice();cen.push(c);pts.forEach((p,i)=>{const e=dl(p.lab,c);if(e<md[i])md[i]=e});return true};
 while(cen.length<k&&seed());
 const lloyd=it=>{for(let t=0;t<it;t++){const sum=cen.map(()=>[0,0,0,0]);
  pts.forEach(p=>{let b=0,bd=1e9;cen.forEach((c,i)=>{const e=(p.lab[0]-c[0])**2+(p.lab[1]-c[1])**2+(p.lab[2]-c[2])**2;if(e<bd){bd=e;b=i}});p.c=b;const s=sum[b];s[0]+=p.lab[0]*p.n;s[1]+=p.lab[1]*p.n;s[2]+=p.lab[2]*p.n;s[3]+=p.n});
  cen=cen.map((c,i)=>sum[i][3]?[sum[i][0]/sum[i][3],sum[i][1]/sum[i][3],sum[i][2]/sum[i][3]]:c)}};
 lloyd(k>64?3:10);
 /* if the averaging pulled two colours close together, drop the less used one and look for a clearly different colour instead */
 for(let round=0;round<8;round++){let bi=-1,bj=-1,bd=1e9;for(let i=0;i<cen.length;i++)for(let j=i+1;j<cen.length;j++){const d=dl(cen[i],cen[j]);if(d<bd){bd=d;bi=i;bj=j}}
  if(bd>=minD*.9)break;const w=cen.map(()=>0);pts.forEach(p=>{w[p.c]+=p.n});cen.splice(w[bi]<w[bj]?bi:bj,1);remd();
  while(cen.length<k&&seed());lloyd(6)}
 lloyd(1);
 /* the colour shown for each group: the average of its typical squares, so odd stray squares do not muddy it */
 return cen.map((c,i)=>{let s=[0,0,0,0],all=[0,0,0,0];pts.forEach(p=>{if(p.c!==i)return;all[0]+=p.rgb[0]*p.n;all[1]+=p.rgb[1]*p.n;all[2]+=p.rgb[2]*p.n;all[3]+=p.n;if(dl(p.lab,c)<=Math.max(8,minD*.5)){s[0]+=p.rgb[0]*p.n;s[1]+=p.rgb[1]*p.n;s[2]+=p.rgb[2]*p.n;s[3]+=p.n}});
  const t=s[3]?s:all;return t[3]?[t[0]/t[3],t[1]/t[3],t[2]/t[3]]:[128,128,128]})}
function make(){
 if(!IMG||!kind||!KINDS[kind].knit)return;
 if($('#imz').checked){
  const aw=64,ah=Math.max(2,Math.round(64*IMG.naturalHeight/IMG.naturalWidth)),ac=document.createElement('canvas');ac.width=aw;ac.height=ah;const ax=ac.getContext('2d',{willReadFrequently:true});ax.imageSmoothingQuality='high';ax.drawImage(IMG,0,0,aw,ah);
  const ad=ax.getImageData(0,0,aw,ah).data,L=i=>.299*ad[i*4]+.587*ad[i*4+1]+.114*ad[i*4+2];let g=0,gn=0;const bk={};
  for(let y=0;y<ah;y++)for(let x=0;x<aw;x++){const i=y*aw+x;if(x>0){g+=Math.abs(L(i)-L(i-1));gn++}if(y>0){g+=Math.abs(L(i)-L(i-aw));gn++}const key=[ad[i*4]>>5,ad[i*4+1]>>5,ad[i*4+2]>>5].join();bk[key]=(bk[key]||0)+1}
  const det=g/gn,long=Math.round(Math.max(30,Math.min(120,28+det*5))),sig=Object.values(bk).filter(v=>v>=aw*ah*.006).length,r=IMG.naturalHeight/IMG.naturalWidth;
  const gw=r<=1?long:Math.max(2,Math.round(long/r)),gh=r<=1?Math.max(2,Math.round(long*r)):long;
  $('#gw').value=gw;$('#gh').value=gh;$('#imc').value=Math.max(4,Math.min(16,sig));$('#ima').checked=false}
 const w=Math.max(2,Math.min(200,+$('#gw').value||S.w)),h=Math.max(2,Math.min(200,+$('#gh').value||S.h)),k=Math.max(2,Math.min(64,+$('#imc').value||6));
 const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d',{willReadFrequently:true});
 x.fillStyle=BASE;x.fillRect(0,0,w,h);x.imageSmoothingQuality='high';x.drawImage(IMG,0,0,w,h);
 const d=x.getImageData(0,0,w,h).data,px=[];for(let i=0;i<w*h;i++)px.push([d[i*4],d[i*4+1],d[i*4+2]]);
 let cen;const ALL=$('#ima').checked;
 if($('#imm').value=='theme')cen=THEME.map(rgb);
 else if(ALL&&new Set(px.map(p=>p.join())).size<=256)cen=[...new Set(px.map(p=>p.join()))].map(t=>t.split(',').map(Number));
 else{const kk=ALL?256:k;cen=quant(px,kk,ALL?3:minDist(kk))}
 const cl=cen.map(lab),memo=new Map(),near=p=>{const key=p[0]<<16|p[1]<<8|p[2];let r=memo.get(key);if(r!==undefined)return r;const l=lab(p);let b=0,bd=1e9;cl.forEach((q,i)=>{const e=(l[0]-q[0])**2+(l[1]-q[1])**2+(l[2]-q[2])**2;if(e<bd){bd=e;b=i}});memo.set(key,b);return b};
 const hexes=cen.map(q=>hx(...q)),idx=px.map(near);
 const used=[...new Set(idx)].sort((a,b)=>(cen[b][0]+cen[b][1]+cen[b][2])-(cen[a][0]+cen[a][1]+cen[a][2]));
 act(()=>{S.w=w;S.h=h;S.col=idx.map(i=>hexes[i]);S.sym=Array(w*h).fill('');pal=used.map(i=>hexes[i]);color=pal[pal.length>1?1:0]});
 $('#gw').value=w;$('#gh').value=h;window.__made=IMG;if(window.setUpd)setUpd(false);if(window.syncMirrors)syncMirrors();swatches();msg(`Made a ${w} × ${h} chart with ${used.length} colours. Tweak the width or colours and press “Make chart” again, or colour in by hand.`);
}
const loadPic=f=>{if(!f)return;$('#imm').value='pic';const u=URL.createObjectURL(f),im=new Image();
 im.onload=()=>{IMG=im;setUpd(false);$('#imgo').disabled=false;$('#pi').src=u;$('#pzt').style.display='none';$('#pbin').hidden=false;$('#pi').style.display='block';$('#pz').title='Paste or drop another picture here to replace it';$('#imh').textContent='Picture ready.';msg('Picture ready. Press “Make chart” when you are happy with the settings.')};im.onerror=()=>msg('Sorry, that picture could not be opened. Try a JPG or PNG.');im.src=u};
$('#imf').onchange=e=>loadPic(e.target.files[0]);
const fromItems=items=>{for(const it of items||[]){const f=it.getAsFile?it.getAsFile():it;if(f&&/^image\//.test(f.type)){loadPic(f);return true}}return false};
document.addEventListener('paste',e=>{if(!kind||$('#design').hidden||!KINDS[kind].knit)return;const t=e.target;if(t&&/^(INPUT|TEXTAREA)$/.test(t.tagName)&&t.type!='file'&&t.type!='checkbox')return;if(fromItems(e.clipboardData&&e.clipboardData.items)){e.preventDefault();$('#fpst').open=true}});
const pz=$('#pz');pz.onclick=()=>pz.focus();
$('#pbin').onclick=e=>{e.stopPropagation();IMG=null;const i=$('#pi');i.removeAttribute('src');i.style.display='none';$('#pzt').style.display='';$('#pzt').innerHTML='📋 Click here, then press Ctrl+V (⌘V on a Mac) to paste a picture<br><span style="font-weight:400">or drop a picture onto this box</span>';$('#pbin').hidden=true;$('#imf').value='';$('#imgo').disabled=true;$('#imh').textContent='Choose or paste a picture first.';pz.title='';msg('Picture deleted.')};
pz.addEventListener('dragover',e=>{e.preventDefault();pz.style.background='var(--pink3)'});pz.addEventListener('dragleave',()=>{pz.style.background='#fff'});
pz.addEventListener('drop',e=>{e.preventDefault();pz.style.background='#fff';const f=[...(e.dataTransfer.files||[])].find(x=>/^image\//.test(x.type));if(f)loadPic(f);else msg('That was not a picture. Try a JPG or PNG.')});
pz.addEventListener('focus',()=>{pz.style.outline='3px solid var(--pink)'});pz.addEventListener('blur',()=>{pz.style.outline=''});
$('#imgo').onclick=make;$('#imgo2').onclick=()=>$('#imgo').click();new MutationObserver(()=>{$('#imgo2').disabled=$('#imgo').disabled}).observe($('#imgo'),{attributes:true,attributeFilter:['disabled']});
})();

/* mirrored picture options */
const MIR=[['ppw','gw'],['pph','gh'],['ppc','imc'],['ppa','ima'],['ppz','imz'],['ppm','imm']];
window.syncMirrors=syncMirrors;function syncMirrors(){MIR.forEach(([m,o])=>{const a=$('#'+m),b=$('#'+o);if(!a||!b)return;if(a.type=='checkbox')a.checked=b.checked;else a.value=b.value})}
MIR.slice(0,6).forEach(([m,o])=>{const a=$('#'+m),b=$('#'+o);const push=()=>{if(a.type=='checkbox')b.checked=a.checked;else b.value=a.value;b.dispatchEvent(new Event(a.type=='checkbox'||a.tagName=='SELECT'?'change':'input',{bubbles:true}));syncMirrors()};a.addEventListener('input',push);a.addEventListener('change',push);b.addEventListener('input',syncMirrors);b.addEventListener('change',syncMirrors)});
syncMirrors();

/* change a colour everywhere: pick a new colour for the selected swatch and every square that used it changes too.
   If the new colour is one already in the palette, the two are joined into one. One undo step for the whole change. */
var chS=null;
{const chc=$('#chc');if(chc){
 const apply=()=>{const to=chc.value.toLowerCase(),b=JSON.parse(chS.snap),from=chS.from;
  S.col=b.col.map(c=>String(c).toLowerCase()==from?to:c);
  const p=chS.pal.slice(),i=p.findIndex(c=>c.toLowerCase()==from),j=p.findIndex((c,q)=>q!=i&&c.toLowerCase()==to);
  if(i>=0){if(j>=0)p.splice(i,1);else p[i]=to}else if(!p.some(c=>c.toLowerCase()==to))p.push(to);
  pal=p;color=to;swatches();render()};
 chc.addEventListener('input',()=>{if(!kind||!KINDS[kind].knit)return;if(!chS)chS={from:color.toLowerCase(),snap:snap(),pal:pal.slice()};apply()});
 chc.addEventListener('change',()=>{if(!chS)return;apply();const b=JSON.parse(chS.snap),n=b.col.filter(c=>String(c).toLowerCase()==chS.from).length,from=chS.from,to=chc.value.toLowerCase();commit(chS.snap);
  msg(from==to?'Colour left as it was.':`Changed ${NAMES[from]||from} to ${NAMES[to]||to} in ${n} square${n==1?'':'s'}.`+(chS.pal.some(c=>c.toLowerCase()==to)&&from!=to?' It matched a colour already in the palette, so the two are now one.':''));chS=null;swatches()})}}

/* remove a colour from the palette */
$('#rmc').onclick=()=>{
 if(pal.length<=2){msg('Keep at least two colours in the palette.');return}
 const rm=color,rest=pal.filter(c=>c!==rm),rg=h=>{const n=parseInt(h.slice(1),16);return[n>>16,(n>>8)&255,n&255]},a=rg(rm);
 let to=rest[0],bd=1e9;rest.forEach(c=>{const b=rg(c),e=(a[0]-b[0])**2+(a[1]-b[1])**2+(a[2]-b[2])**2;if(e<bd){bd=e;to=c}});
 const used=S.col.filter(c=>c===rm).length;
 if(used)act(()=>{S.col=S.col.map(c=>c===rm?to:c)});
 pal=rest;color=to;swatches();draft();
 msg(`Removed ${NAMES[rm]||rm}.`+(used?` ${used} square${used==1?'':'s'} that used it now use ${NAMES[to]||to}, its closest colour.`:''));
};

/* "Update chart" appears when settings change after a chart was made from the picture */
function setUpd(on){['imgo','imgo2'].forEach(id=>{const b=$('#'+id);if(!b)return;b.textContent=on?'Update chart':'Make chart';b.style.background=on?'var(--mint)':'';b.style.outline=on?'3px solid var(--pink)':''});if(on)msg('Settings changed. Press “Update chart” to redo the chart from your picture.')}
window.setUpd=setUpd;
['gw','gh','imc','ima','imz','imm','ppw','pph','ppc','ppa','ppz','ppm'].forEach(id=>{const e=$('#'+id);if(!e)return;const f=()=>{if(window.__made&&window.__made===IMG)setUpd(true)};e.addEventListener('input',f);e.addEventListener('change',f)});

/* clear pictures when a chart page is left */
function resetPictures(){
 IMG=null;window.__made=null;
 const i=$('#pi');i.removeAttribute('src');i.style.display='none';$('#pzt').style.display='';$('#pzt').innerHTML='📋 Click here, then press Ctrl+V (⌘V on a Mac) to paste a picture<br><span style="font-weight:400">or drop a picture onto this box</span>';$('#pbin').hidden=true;$('#pz').title='';
 $('#imf').value='';$('#imgo').disabled=true;$('#imh').textContent='Choose or paste a picture first.';
 if(window.setUpd)setUpd(false)}
window.resetPictures=resetPictures;

['#gw','#gh'].forEach(i=>$(i).addEventListener('input',()=>{const w=+$('#gw').value,h=+$('#gh').value;if(w>=2&&h>=2&&w<=200&&h<=200&&(w!==S.w||h!==S.h))$('#rs').click()}));
$('#un').onclick=()=>go(undo,redo);$('#re').onclick=()=>go(redo,undo);
$('#cl').onclick=()=>act(()=>{S.col.fill(BASE);S.sym.fill('')});
$('#cc').onchange=e=>{const v=e.target.value;if(!pal.includes(v)){pal.length>=14?pal[13]=v:pal.push(v)}color=v;setTool('paint');swatches()};
$('#nm').oninput=e=>{S.name=e.target.value;draft()};
$$('#views button').forEach(b=>b.onclick=()=>{view=b.dataset.w;syncViews();render();if(view!='text')document.querySelector('.tool').scrollIntoView()});
document.addEventListener('keydown',e=>{if(!kind||$('#design').hidden||!(e.ctrlKey||e.metaKey)||/INPUT|SELECT/.test(document.activeElement.tagName))return;if(e.key=='z'){e.preventDefault();go(undo,redo)}if(e.key=='y'){e.preventDefault();go(redo,undo)}});
const store=()=>{try{return JSON.parse(localStorage.getItem(Kp(kind))||'{}')}catch(e){return{}}};
function list(sel){const o=store(),el=$('#sv');el.innerHTML='';const ks=Object.keys(o);if(!ks.length)el.innerHTML='<option value="">No saved projects yet</option>';ks.forEach(k=>{const op=document.createElement('option');op.value=op.textContent=k;el.append(op)});if(sel)el.value=sel}
$('#sa').onclick=()=>{const n=(S.name||'').trim();if(!n){msg('Give your project a name first, then save.');$('#nm').focus();return}const o=store();o[n]={...JSON.parse(snap()),pal,t:Date.now()};try{localStorage.setItem(Kp(kind),JSON.stringify(o));dirty=false;list(n);msg(`Saved “${n}”. Open it from the list any time.`)}catch(e){msg('Saving isn’t available in this browser. Export your chart to keep it.')}};
$('#op').onclick=()=>{const n=$('#sv').value,o=store()[n];if(!o){msg('Choose a saved project to open.');return}undo=[];redo=[];S.name=n;$('#nm').value=n;load(o);if(KINDS[kind].knit)swatches();render();msg(`Opened “${n}”.`)};
sureBtn($('#dl'),()=>{const n=$('#sv').value,o=store();if(!o[n])return;delete o[n];try{localStorage.setItem(Kp(kind),JSON.stringify(o))}catch(e){}list();msg(`Deleted “${n}”.`)},'Delete');

/* ---------- export: chart, written instructions or both ---------- */
function downloadFile(filename,data,type='application/octet-stream'){
 const blob=data instanceof Blob?data:new Blob([data],{type}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000)
}
function sheet(mode,project=S,projectKind=kind){const chart=mode!='text',txt=mode!='chart',g=project,chartType=projectKind,cell=Math.max(16,Math.min(40,Math.floor(1300/g.w))),pad=40,uc=chart&&KINDS[chartType].knit?[...new Set(g.col)]:[],us=chart?[...new Set(g.sym.filter(Boolean))]:[],items=uc.length+us.length,
 W=chart?Math.max(g.w*cell+pad*2+36,600):720,per=Math.max(1,Math.floor((W-pad*2)/190)),kh=chart?Math.ceil(items/per)*30+30:0,LH=22;
 const tc=document.createElement('canvas').getContext('2d');tc.font='15px sans-serif';let tl=[];
 if(txt){const w=written();[...w.head,'',...w.rows,'',...w.foot].forEach(p=>{if(!p){tl.push('');return}let line='';p.split(' ').forEach(wd=>{const t=line?line+' '+wd:wd;if(tc.measureText(t).width>W-pad*2&&line){tl.push(line);line=wd}else line=t});tl.push(line)})}
 const head=76,H=head+(chart?g.h*cell+24+kh:0)+(txt?(chart?30:0)+tl.length*LH+10:0)+pad,c=document.createElement('canvas');c.width=W;c.height=H;const x=c.getContext('2d');
 x.fillStyle='#fff';x.fillRect(0,0,W,H);x.fillStyle='#111';x.font='700 26px sans-serif';x.fillText(g.name||'Untitled chart',pad,pad+8);x.font='14px sans-serif';x.fillStyle='#555';x.fillText(`${KINDS[chartType].n} chart, ${g.w} stitches wide, ${g.h} rows high.`,pad,pad+32);
 let y=head;
 if(chart){x.save();x.translate(pad,y);drawChart(x,g,cell,'#222',false,KINDS[chartType].knit);x.restore();let i=0;const ky=y+g.h*cell+44,slot=()=>[pad+(i%per)*190,ky+Math.floor(i/per)*30];
  uc.forEach(h=>{const[X,Y]=slot();x.fillStyle=h;x.fillRect(X,Y,22,22);x.strokeStyle='#444';x.lineWidth=1;x.strokeRect(X,Y,22,22);x.fillStyle='#222';x.font='14px sans-serif';x.fillText(NAMES[h]||h,X+30,Y+16);i++});
  us.forEach(s=>{const[X,Y]=slot();x.fillStyle='#fff';x.fillRect(X,Y,22,22);x.strokeStyle='#444';x.lineWidth=1;x.strokeRect(X,Y,22,22);glyph(x,s,X,Y,22,INK);x.fillStyle='#222';x.font='14px sans-serif';x.fillText(SYMS[s],X+30,Y+16);i++});y+=g.h*cell+24+kh+30}
 if(txt){x.fillStyle='#222';x.font='15px sans-serif';tl.forEach((t,i)=>x.fillText(t,pad,y+14+i*LH))}return c}
async function pdf(c){const W=c.width,H=c.height,sc=555/W,ph=Math.floor(801/sc),n=Math.ceil(H/ph),enc=new TextEncoder(),parts=[],offs=[];let len=0;
 const add=b=>{if(typeof b=='string')b=enc.encode(b);parts.push(b);len+=b.length},obj=(k,b)=>{offs[k]=len;add(`${k} 0 obj\n${b}\nendobj\n`)};
 add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,`<</Type/Pages/Kids[${Array.from({length:n},(_,i)=>`${3+3*i} 0 R`).join(' ')}]/Count ${n}>>`);
 for(let i=0;i<n;i++){const sh=Math.min(ph,H-i*ph),s=document.createElement('canvas');s.width=W;s.height=sh;s.getContext('2d').drawImage(c,0,-i*ph);const jd=new Uint8Array(await (await new Promise(r=>s.toBlob(r,'image/jpeg',.92))).arrayBuffer()),pg=3+3*i,iw=W*sc,ih=sh*sc,cs2=`q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${((595.28-iw)/2).toFixed(2)} ${(841.89-20-ih).toFixed(2)} cm /Im0 Do Q`;
  obj(pg,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 ${pg+1} 0 R>>>>/Contents ${pg+2} 0 R>>`);
  offs[pg+1]=len;add(`${pg+1} 0 obj\n<</Type/XObject/Subtype/Image/Width ${W}/Height ${sh}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jd.length}>>\nstream\n`);add(jd);add('\nendstream\nendobj\n');obj(pg+2,`<</Length ${cs2.length}>>\nstream\n${cs2}\nendstream`)}
 const N=3+3*n,xr=len;let t=`xref\n0 ${N}\n0000000000 65535 f \n`;for(let k=1;k<N;k++)t+=String(offs[k]).padStart(10,'0')+' 00000 n \n';add(t+`trailer\n<</Size ${N}/Root 1 0 R>>\nstartxref\n${xr}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})}
async function exp(k){const mode=$('#em').value,n=((S.name||'chart').replace(/[^\w -]+/g,'').trim())||'chart';
 try{let d;if(k=='txt')d=textExport();else{const c=sheet(mode);d=k=='png'?await new Promise(r=>c.toBlob(r,'image/png')):await pdf(c);if(!d)throw new Error('Could not create export file')}downloadFile(`${n}.${k}`,d,k=='txt'?'text/plain;charset=utf-8':'application/octet-stream');msg('Exported. Check your downloads.')}catch(e){msg('Export didn’t work here. Try again in a moment.')}}
$('#ep').onclick=()=>exp('png');$('#ed').onclick=()=>exp('pdf');$('#et').onclick=()=>exp('txt');
$('#em').onchange=()=>{$('#et').disabled=$('#em').value=='chart'};

/* ---------- pattern maker: local drafts and direct file exports ---------- */
const PATTERN_PHOTO_LIMIT=6,PATTERN_PHOTO_SIZE=5*1024*1024;
const PM_PAGE_W=1120,PM_PAGE_H=1617,PM_MARGIN=64,PM_CONTENT_BOTTOM=1430,PM_BG=['#fff3a8','#ffd3ea','#c6fbd9'];
let patternPhotos=[],patternChart=null,editingPatternId=null,editingPatternCreatedAt=null;
function patternValue(id){return $(`#${id}`).value.trim()}
function patternText(parent,tag,text,className){
 if(!text)return null;const el=document.createElement(tag);if(className)el.className=className;el.textContent=text;parent.append(el);return el
}
function updatePatternStepLabels(){
 const steps=$$('#pm-steps .pm-step');
 steps.forEach((step,i)=>{step.querySelector('legend').textContent=`Instruction section ${i+1}`;step.querySelector('.pm-remove').disabled=steps.length===1})
}
function addPatternStep(title='',instructions=''){
 const steps=$$('#pm-steps .pm-step');
 if(steps.length>=20){$('#pm-status').textContent='You can add up to 20 instruction sections.';return}
 const fieldset=document.createElement('fieldset');fieldset.className='pm-step';
 const legend=document.createElement('legend');fieldset.append(legend);
 const top=document.createElement('div');top.className='pm-step-title';
 const titleLabel=document.createElement('label');titleLabel.className='pm-field';titleLabel.textContent='Section title';
 const titleInput=document.createElement('input');titleInput.type='text';titleInput.maxLength=100;titleInput.placeholder='e.g. Cuff';titleInput.value=title;titleLabel.append(titleInput);
 const remove=document.createElement('button');remove.type='button';remove.className='pm-remove';remove.textContent='Remove';remove.setAttribute('aria-label','Remove instruction section');
 top.append(titleLabel,remove);
 const textLabel=document.createElement('label');textLabel.className='pm-field';textLabel.textContent='Instructions';
 const textInput=document.createElement('textarea');textInput.rows=5;textInput.maxLength=6000;textInput.placeholder='Write each step clearly. Use a new line for each instruction.';textInput.value=instructions;textLabel.append(textInput);
 fieldset.append(top,textLabel);
 remove.addEventListener('click',()=>{fieldset.remove();updatePatternStepLabels();renderPatternPreview()});
 $('#pm-steps').append(fieldset);updatePatternStepLabels();renderPatternPreview()
}
function renderPatternPhotos(){
 const list=$('#pm-photo-list');list.replaceChildren();
 patternPhotos.forEach((photo,index)=>{
  const card=document.createElement('div');card.className='pm-photo-card';
  const img=document.createElement('img');img.src=photo.url;img.alt=`Finished design photo ${index+1}`;
  const remove=document.createElement('button');remove.type='button';remove.textContent='Remove photo';remove.setAttribute('aria-label',`Remove photo ${index+1}`);
  remove.addEventListener('click',()=>{URL.revokeObjectURL(photo.url);patternPhotos.splice(index,1);renderPatternPhotos();renderPatternPreview()});
  card.append(img,remove);list.append(card)
 })
}
function renderPatternPreview(){
 const sheet=document.createElement('article');sheet.className='pattern-sheet';
 if(patternPhotos.length){
  const photos=document.createElement('div');photos.className='pm-print-photos';
  patternPhotos.forEach((photo,index)=>{const img=document.createElement('img');img.src=photo.url;img.alt=`Finished design photo ${index+1}`;photos.append(img)});
  sheet.append(photos)
 }
 const title=patternValue('pm-title');patternText(sheet,'h1',title||'Your pattern title');
 patternText(sheet,'p',`${$('#pm-craft').value} · ${$('#pm-level').value}`,'pm-print-meta');
 patternText(sheet,'p',patternValue('pm-description'),'pm-print-description');
 const facts=[
  ['Yarn or materials',patternValue('pm-yarn')],['Tools',patternValue('pm-tools')],['Gauge',patternValue('pm-gauge')],
  ['Sizes',patternValue('pm-sizes')],['Finished dimensions',patternValue('pm-finished')],['Notions and other supplies',patternValue('pm-notions')]
 ].filter(([,value])=>value);
 if(facts.length){const dl=document.createElement('dl');dl.className='pm-print-facts';facts.forEach(([label,value])=>{patternText(dl,'dt',label);patternText(dl,'dd',value)});sheet.append(dl)}
 if(patternChart){
  const chart=document.createElement('section');chart.className='pm-print-chart';
  patternText(chart,'h2',`Colour chart: ${patternChart.name}`);
  const meta=document.createElement('p');meta.className='pm-chart-meta';meta.textContent=`${patternChart.grid.w} × ${patternChart.grid.h} stitches`;chart.append(meta);
  chart.append(gridThumb(patternChart.grid,false,600));sheet.append(chart)
 }
 const steps=$$('#pm-steps .pm-step').map(step=>({
  title:step.querySelector('.pm-step-title input').value.trim(),
  instructions:step.querySelector('.pm-step textarea').value.trim()
 })).filter(step=>step.title||step.instructions);
 steps.forEach((step,index)=>{
  const section=document.createElement('section');section.className=`pm-print-section pm-box-${index%3}`;
  patternText(section,'h2',step.title||`Instructions ${index+1}`);
  patternText(section,'p',step.instructions);sheet.append(section)
 });
 patternText(sheet,'p',patternValue('pm-notes'),'pm-print-notes');
 $('#pattern-preview').replaceChildren(sheet)
}
function handlePatternPhotos(){
 const input=$('#pm-photos'),message=$('#pm-photo-message'),chosen=[...input.files];input.value='';
 const errors=[];
 chosen.forEach(file=>{
  if(!['image/jpeg','image/png','image/webp'].includes(file.type)){errors.push(`${file.name}: choose a JPG, PNG or WebP image.`);return}
  if(file.size>PATTERN_PHOTO_SIZE){errors.push(`${file.name}: each photo must be 5 MB or smaller.`);return}
  if(patternPhotos.length>=PATTERN_PHOTO_LIMIT){errors.push(`You can add up to ${PATTERN_PHOTO_LIMIT} photos.`);return}
  try{patternPhotos.push({file,blob:file,name:file.name,type:file.type,url:URL.createObjectURL(file)})}catch(e){errors.push(`${file.name}: the photo could not be loaded.`)}
 });
 message.textContent=errors.join(' ');
 renderPatternPhotos();renderPatternPreview()
}
const PM_FORM_FIELDS={craft:'pm-craft',level:'pm-level',description:'pm-description',yarn:'pm-yarn',tools:'pm-tools',gauge:'pm-gauge',sizes:'pm-sizes',finished:'pm-finished',notions:'pm-notions',notes:'pm-notes'};
function readPatternForm(){
 const fields={};Object.keys(PM_FORM_FIELDS).forEach(key=>{fields[key]=$(`#${PM_FORM_FIELDS[key]}`).value});
 const steps=$$('#pm-steps .pm-step').map(step=>({title:step.querySelector('.pm-step-title input').value.trim(),instructions:step.querySelector('.pm-step textarea').value.trim()}));
 return{title:patternValue('pm-title'),fields,steps,chart:patternChart?{name:patternChart.name,grid:{...patternChart.grid,col:[...patternChart.grid.col],sym:[...patternChart.grid.sym]}}:null}
}
function listSavedColourCharts(){
 const select=$('#pm-chart');select.replaceChildren();
 const empty=document.createElement('option');empty.value='';empty.textContent='No chart selected';select.append(empty);
 let saved;
 try{saved=JSON.parse(localStorage.getItem(Kp('colourwork'))||'{}')}catch(e){throw new Error('Saved colour charts could not be read from this browser.')}
 Object.keys(saved).sort((a,b)=>a.localeCompare(b)).forEach(name=>{
  const chart=saved[name],g=chart&&{w:chart.w,h:chart.h,col:chart.col,sym:chart.sym};
  if(!g||!Number.isInteger(g.w)||!Number.isInteger(g.h)||g.w<2||g.h<2||g.w>200||g.h>200||!Array.isArray(g.col)||!Array.isArray(g.sym)||g.col.length!==g.w*g.h||g.sym.length!==g.w*g.h)return;
  const option=document.createElement('option');option.value=name;option.textContent=`${name} (${g.w} × ${g.h})`;select.append(option)
 })
 $('#pm-add-chart').disabled=select.options.length===1;
 return saved
}
function attachSavedColourChart(){
 const message=$('#pm-chart-message'),name=$('#pm-chart').value;
 if(!name){message.textContent='Choose a saved colour chart first.';return}
 try{
  const saved=listSavedColourCharts(),chart=saved[name];
  if(!chart){message.textContent='That saved chart is no longer available. Refresh the list and try again.';return}
  patternChart={name,grid:{w:chart.w,h:chart.h,col:chart.col.slice(),sym:chart.sym.slice()}};
  $('#pm-remove-chart').hidden=false;message.textContent=`“${name}” has been added to this pattern.`;renderPatternPreview()
 }catch(e){message.textContent=e.message}
}
function patternFilename(title){return(title||'pattern').replace(/[\\/:*?"<>|]+/g,'-').trim().slice(0,100)||'pattern'}
function requirePatternTitle(){
 if(patternValue('pm-title'))return true;
 $('#pm-status').textContent='Add a pattern title before saving or exporting.';$('#pm-title').focus();return false
}
async function savePattern(){
 if(!requirePatternTitle())return;
 const status=$('#pm-status'),data=readPatternForm(),now=Date.now();
 const record={id:editingPatternId||`pattern-${now.toString(36)}-${Math.random().toString(36).slice(2,10)}`,createdAt:editingPatternCreatedAt||now,updatedAt:now,...data,
  photos:patternPhotos.map(photo=>{const blob=photo.blob||photo.file;return{name:photo.name||(photo.file&&photo.file.name)||'Finished design',type:photo.type||(blob&&blob.type)||'',...(blob?{blob}:{}),...(photo.src?{src:photo.src}:{})}})};
 try{await putSavedPattern(record);editingPatternId=record.id;editingPatternCreatedAt=record.createdAt;$('#pm-view-saved').hidden=false;status.textContent='Pattern saved to My Patterns on this device.'}
 catch(e){status.textContent=`Pattern could not be saved: ${e.message||'browser storage is unavailable'}`}
}
function clearPatternMaker(){
 const form=$('#pattern-form');form.reset();patternPhotos.forEach(photo=>URL.revokeObjectURL(photo.url));patternPhotos=[];editingPatternId=null;editingPatternCreatedAt=null;
 patternChart=null;$('#pm-steps').replaceChildren();addPatternStep('Getting started','');$('#pm-photo-list').replaceChildren();$('#pm-photo-message').textContent='';$('#pm-chart-message').textContent='';try{listSavedColourCharts()}catch(e){$('#pm-chart-message').textContent=e.message}$('#pm-remove-chart').hidden=true;$('#pm-view-saved').hidden=true;$('#pm-status').textContent='Save to keep this pattern in My Patterns on this device.';renderPatternPreview()
}
async function openSavedPattern(id){
 const record=await getSavedPattern(id);if(!record)throw new Error('This pattern no longer exists in My Patterns.');
 const form=$('#pattern-form');form.reset();$('#pm-title').value=record.title||'';
 Object.keys(PM_FORM_FIELDS).forEach(key=>{const field=record.fields&&record.fields[key];if(field!==undefined)$(`#${PM_FORM_FIELDS[key]}`).value=field});
 patternChart=record.chart&&record.chart.grid?{name:record.chart.name||'Saved colour chart',grid:{...record.chart.grid,col:[...record.chart.grid.col],sym:[...record.chart.grid.sym]}}:null;
 try{listSavedColourCharts()}catch(e){$('#pm-chart-message').textContent=e.message}
 if(patternChart){$('#pm-chart').value=patternChart.name;$('#pm-remove-chart').hidden=false;$('#pm-chart-message').textContent=`“${patternChart.name}” is included in this pattern.`}else $('#pm-remove-chart').hidden=true;
 $('#pm-steps').replaceChildren();(record.steps&&record.steps.length?record.steps:[{title:'Getting started',instructions:''}]).forEach(step=>addPatternStep(step.title,step.instructions));
 patternPhotos.forEach(photo=>URL.revokeObjectURL(photo.url));patternPhotos=[];
 try{patternPhotos=savedPatternPhotos(record).map(photo=>{const blob=photo.blob instanceof Blob?photo.blob:null,src=photo.src||'';if(!blob&&!src)throw new Error(`Saved photo “${photo.name||'image'}” is unavailable.`);return{file:blob,blob,src,name:photo.name||'Finished design',type:photo.type||(blob&&blob.type)||'',url:blob?URL.createObjectURL(blob):src}})}
 catch(e){patternPhotos.forEach(photo=>URL.revokeObjectURL(photo.url));patternPhotos=[];throw e}
 editingPatternId=record.id;editingPatternCreatedAt=record.createdAt||Date.now();$('#pm-view-saved').hidden=false;$('#pm-photo-message').textContent='';$('#pm-status').textContent='Pattern loaded. Save your changes when you are ready.';
 renderPatternPhotos();renderPatternPreview();location.hash='#pattern-maker'
}
function pmWrap(ctx,text,maxWidth){
 const lines=[];
 String(text||'').replace(/\r/g,'').split('\n').forEach(paragraph=>{
  if(!paragraph){lines.push('');return}
  let line='';
  paragraph.split(/\s+/).forEach(word=>{
   if(ctx.measureText(word).width>maxWidth){
    if(line){lines.push(line);line=''}
    let part='';for(const character of word){if(part&&ctx.measureText(part+character).width>maxWidth){lines.push(part);part=character}else part+=character}line=part;return
   }
   const next=line?line+' '+word:word;if(line&&ctx.measureText(next).width>maxWidth){lines.push(line);line=word}else line=next
  });
  if(line)lines.push(line)
 });return lines
}
function pmNewPage(pages){
 const canvas=document.createElement('canvas');canvas.width=PM_PAGE_W;canvas.height=PM_PAGE_H;
 const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas export is not available in this browser.');
 ctx.fillStyle='#fff';ctx.fillRect(0,0,PM_PAGE_W,PM_PAGE_H);ctx.strokeStyle='#1b1022';ctx.lineWidth=3;ctx.strokeRect(32,32,PM_PAGE_W-64,PM_PAGE_H-64);
 const page={canvas,ctx,y:PM_MARGIN,links:[]};ctx.fillStyle='#1b1022';ctx.fillRect(PM_MARGIN,1472,48,48);ctx.fillStyle='#ff5cad';ctx.font='900 34px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('✦',PM_MARGIN+24,1496);
 ctx.textAlign='left';ctx.textBaseline='alphabetic';ctx.fillStyle='#161616';ctx.font='900 28px sans-serif';ctx.fillText('Moll’s Studio',PM_MARGIN+62,1497);
 const labels=[['Create your own pattern today @ Moll’s Studio.com',PATTERN_SITE_URL,1528]];
 labels.forEach(([text,url,y])=>{ctx.font='700 18px sans-serif';ctx.fillStyle='#174c89';ctx.fillText(text,PM_MARGIN+62,y);const width=Math.min(ctx.measureText(text).width,PM_PAGE_W-PM_MARGIN*2-62);ctx.fillRect(PM_MARGIN+62,y+3,width,1);page.links.push({x1:PM_MARGIN+62,y1:y-18,x2:PM_MARGIN+62+width,y2:y+5,url})});
 ctx.strokeStyle='#1b1022';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(PM_MARGIN,1456);ctx.lineTo(PM_PAGE_W-PM_MARGIN,1456);ctx.stroke();
 pages.push(page);return page
}
function pmDrawCard(state,title,text,variant=0){
 const maxWidth=PM_PAGE_W-PM_MARGIN*2-48,ctx=state.page.ctx,titleLine=40,bodyLine=30,bodyFont='500 19px "Fredoka", sans-serif';
 ctx.font=bodyFont;const bodyLines=pmWrap(ctx,text,maxWidth-36);
 let offset=0,first=true;
 do{
  const shownTitle=first?title:`${title} (continued)`,ctxTitle='800 28px "Baloo 2", "Fredoka", sans-serif';
  ctx.font=ctxTitle;const head=pmWrap(ctx,shownTitle,maxWidth-84),capacityLimit=PM_CONTENT_BOTTOM-state.page.y-54-head.length*titleLine;
  let capacity=Math.floor(capacityLimit/bodyLine);
  if(capacity<1&&state.page.y>PM_MARGIN){state.page=pmNewPage(state.pages);continue}
  capacity=Math.max(1,capacity);const chunk=bodyLines.slice(offset,offset+capacity),height=18+head.length*titleLine+8+chunk.length*bodyLine+18;
  if(state.page.y+height>PM_CONTENT_BOTTOM&&state.page.y>PM_MARGIN){state.page=pmNewPage(state.pages);continue}
  const {ctx:pageCtx}=state.page,x=PM_MARGIN,y=state.page.y,w=PM_PAGE_W-PM_MARGIN*2;
  pageCtx.fillStyle=PM_BG[variant%PM_BG.length];pageCtx.fillRect(x+5,y+5,w,height);pageCtx.fillStyle='#fff';pageCtx.fillRect(x,y,w,height);pageCtx.strokeStyle='#1b1022';pageCtx.lineWidth=3;pageCtx.strokeRect(x,y,w,height);
  pageCtx.fillStyle='#ff5cad';pageCtx.fillRect(x+w-42,y-10,32,32);pageCtx.strokeStyle='#1b1022';pageCtx.strokeRect(x+w-42,y-10,32,32);pageCtx.fillStyle='#1b1022';pageCtx.font='900 22px sans-serif';pageCtx.textAlign='center';pageCtx.textBaseline='middle';pageCtx.fillText('✦',x+w-26,y+6);
  pageCtx.textAlign='left';pageCtx.textBaseline='top';pageCtx.fillStyle='#161616';pageCtx.font=ctxTitle;head.forEach((line,i)=>pageCtx.fillText(line,x+18,y+18+i*titleLine,maxWidth-84));
  pageCtx.font=bodyFont;pageCtx.fillStyle='#242124';chunk.forEach((line,i)=>pageCtx.fillText(line,x+18,y+18+head.length*titleLine+8+i*bodyLine,maxWidth-36));
  state.page.y=y+height+22;offset+=chunk.length;first=false
 }while(offset<bodyLines.length||first)
}
function pmTextHeading(state,text){
 let ctx=state.page.ctx;ctx.font='800 48px "Baloo 2", "Fredoka", sans-serif';const lines=pmWrap(ctx,text,PM_PAGE_W-PM_MARGIN*2);
 if(state.page.y+lines.length*58+20>PM_CONTENT_BOTTOM)state.page=pmNewPage(state.pages);
 ctx=state.page.ctx;ctx.font='800 48px "Baloo 2", "Fredoka", sans-serif';ctx.fillStyle='#161616';ctx.textBaseline='top';lines.forEach((line,i)=>ctx.fillText(line,PM_MARGIN,state.page.y+i*58,PM_PAGE_W-PM_MARGIN*2));state.page.y+=lines.length*58+12
}
function pmDrawChart(state,chart){
 const maxWidth=PM_PAGE_W-PM_MARGIN*2-36,title=`Colour chart: ${String(chart.name||'Saved chart').slice(0,120)}`;
 let ctx=state.page.ctx;ctx.font='800 28px "Baloo 2", "Fredoka", sans-serif';
 let titleLines=pmWrap(ctx,title,maxWidth-56),titleHeight=titleLines.length*38,available=PM_CONTENT_BOTTOM-state.page.y-46-titleHeight;
 if(available<chart.grid.h*2&&state.page.y>PM_MARGIN){
  state.page=pmNewPage(state.pages);ctx=state.page.ctx;ctx.font='800 28px "Baloo 2", "Fredoka", sans-serif';
  titleLines=pmWrap(ctx,title,maxWidth-56);titleHeight=titleLines.length*38;available=PM_CONTENT_BOTTOM-state.page.y-46-titleHeight
 }
 const cell=Math.max(2,Math.floor(Math.min(18,maxWidth/chart.grid.w,available/chart.grid.h))),chartW=chart.grid.w*cell,chartH=chart.grid.h*cell,boxHeight=46+titleHeight+chartH;
 const page=state.page,x=PM_MARGIN,y=page.y,w=PM_PAGE_W-PM_MARGIN*2;
 page.ctx.fillStyle='#fff3a8';page.ctx.fillRect(x+5,y+5,w,boxHeight);page.ctx.fillStyle='#fff';page.ctx.fillRect(x,y,w,boxHeight);page.ctx.strokeStyle='#1b1022';page.ctx.lineWidth=3;page.ctx.strokeRect(x,y,w,boxHeight);
 page.ctx.textBaseline='top';page.ctx.textAlign='left';page.ctx.fillStyle='#161616';page.ctx.font='800 28px "Baloo 2", "Fredoka", sans-serif';titleLines.forEach((line,i)=>page.ctx.fillText(line,x+18,y+18+i*38,maxWidth-56));
 page.ctx.save();page.ctx.translate(x+(w-chartW)/2,y+18+titleHeight+10);drawChart(page.ctx,chart.grid,cell,'#222',true);page.ctx.restore();
 page.y=y+boxHeight+22
}
function pmDrawChartPage(state,chart){
 if(state.page.y>PM_MARGIN)state.page=pmNewPage(state.pages);
 const ctx=state.page.ctx,x=PM_MARGIN,w=PM_PAGE_W-PM_MARGIN*2,g=chart.grid;
 ctx.font='800 40px "Baloo 2", "Fredoka", sans-serif';ctx.fillStyle='#161616';ctx.textBaseline='top';ctx.textAlign='left';ctx.fillText(`Colour chart: ${String(chart.name||'Chart').slice(0,70)}`,x,state.page.y,w);
 const top=state.page.y+68,note=62,avail=PM_CONTENT_BOTTOM-top-46-note,cell=Math.max(4,Math.floor(Math.min((w-104)/g.w,avail/g.h)));
 ctx.save();ctx.translate(x,top);drawChart(ctx,g,cell,'#222',false,true,Math.max(16,Math.min(24,cell)));ctx.restore();
 ctx.fillStyle='#444';ctx.font='500 20px "Fredoka", sans-serif';ctx.textBaseline='top';ctx.textAlign='left';
 pmWrap(ctx,g.hsplit?'Row 1 is the bottom row. This bag is knitted as one long piece. Above the pink line is the front, right way up. Below it is the back, upside down, which is knitted first. Rows marked with a left arrow and k are right side rows, read from right to left. Rows marked with a right arrow and p are wrong side rows, read from left to right.':g.round?'Round 1 is the bottom row. This project is knitted in the round, so every round is a knit round, read from right to left: first the front (right half of the chart), then the back (left half, after the pink line). Numbers along the bottom count from the right edge.':'Row 1 is the bottom row. Rows marked with a left arrow and k are right side rows, read from right to left. Rows marked with a right arrow and p are wrong side rows, read from left to right. Numbers along the bottom count from the right edge.',w).forEach((l,i)=>ctx.fillText(l,x,top+g.h*cell+52+i*26,w));
 state.page.y=PM_CONTENT_BOTTOM}
async function renderPatternPages(data=readPatternForm(),photos=patternPhotos){
 if(document.fonts){await document.fonts.ready;await Promise.all([document.fonts.load('800 28px "Baloo 2"'),document.fonts.load('500 19px "Fredoka"')])}
 const pages=[],state={pages,page:null};state.page=pmNewPage(pages);
 const images=await Promise.all(photos.map(photo=>new Promise((resolve,reject)=>{const image=new Image();image.onload=()=>resolve(image);image.onerror=()=>reject(new Error(`Could not load photo “${photo.name||'image'}” for export.`));image.src=photo.url;if(image.complete&&image.naturalWidth)resolve(image)})));
 if(images.length){
  pmTextHeading(state,'Finished design');
  for(let i=0;i<images.length;i+=2){
   const row=images.slice(i,i+2),rowH=350;if(state.page.y+rowH>PM_CONTENT_BOTTOM)state.page=pmNewPage(pages);
   const ctx=state.page.ctx,colW=(PM_PAGE_W-PM_MARGIN*2-20)/row.length;
   row.forEach((image,j)=>{const x=PM_MARGIN+j*(colW+20),y=state.page.y;ctx.fillStyle='#fff4bb';ctx.fillRect(x+5,y+5,colW,rowH);ctx.fillStyle='#fff';ctx.fillRect(x,y,colW,rowH);ctx.strokeStyle='#1b1022';ctx.lineWidth=3;ctx.strokeRect(x,y,colW,rowH);const scale=Math.min((colW-28)/image.naturalWidth,(rowH-28)/image.naturalHeight);const w=image.naturalWidth*scale,h=image.naturalHeight*scale;ctx.drawImage(image,x+(colW-w)/2,y+(rowH-h)/2,w,h)});
   state.page.y+=rowH+24
  }
 }
 const fields=data.fields||{};
 pmTextHeading(state,data.title||'Your pattern');
 pmDrawCard(state,`${fields.craft} · ${fields.level}`,'Pattern details',0);
 if(fields.description)pmDrawCard(state,'About this pattern',fields.description,1);
 const facts=[['Yarn or materials',fields.yarn],['Tools',fields.tools],['Gauge',fields.gauge],['Sizes',fields.sizes],['Finished dimensions',fields.finished],['Notions and other supplies',fields.notions]].filter(([,value])=>value.trim());
 facts.forEach(([label,value],index)=>{if(data.tracker&&/^(Yarn or materials|Tools|Notions and other supplies)$/.test(label)){const its=String(value).split(/\r?\n/).map(t=>t.trim()).filter(Boolean).map(t=>({t,d:0}));if(its.length){pmDrawChecklist(state,label,its,index%3);return}}pmDrawCard(state,label,value,index%3)});
 if(data.chart){
  const {w,h}=data.chart.grid;
  pmDrawChart(state,data.chart);if(data.tracker)pmDrawRowBoxes(state,h);
  pmDrawCard(state,'Colour chart repeats',`This chart is ${w} stitches wide and ${h} rows high. Work across multiples of ${w} stitches (for example, ${w}, ${w*2} or ${w*3} stitches). One complete chart repeat is ${h} rows: work rows 1–${h}, then repeat those rows as needed.`,1)
 }
 if(data.tracker)pmDrawCard(state,'My progress','Started: ______________    Finished: ______________    Tick each row and each material as you go.',1);
 data.steps.filter(step=>step.title||step.instructions||(step.items&&step.items.length)).forEach((step,index)=>{const ttl=step.title||`Instructions ${index+1}`;
  if(data.charts&&data.charts.length&&/^Charts?$/.test(step.title)){data.charts.forEach(c=>pmDrawChartPage(state,c));return}
  if(data.sections&&state.page.y>PM_MARGIN)state.page=pmNewPage(pages);
  if(data.tracker){const mat=projIsMat(ttl),items=(step.items||String(step.instructions||'').split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({t,d:0}))).map(it=>it.nb===undefined?{...it,nb:!(mat||projIsRow(it.t))}:it);if(items.length){pmDrawChecklist(state,ttl,items,index%3);return}}
  pmDrawCard(state,ttl,step.instructions,index%3)});
 if(fields.notes)pmDrawCard(state,'Finishing, tips or credits',fields.notes,2);
 if(data.tracker)pmDrawNoteLines(state);
 return pages
}
async function pdfFromPages(pages){
 const W=pages[0].canvas.width,H=pages[0].canvas.height,sc=555/W,enc=new TextEncoder(),parts=[],offs=[];let len=0;
 const add=b=>{if(typeof b=='string')b=enc.encode(b);parts.push(b);len+=b.length},obj=(k,b)=>{offs[k]=len;add(`${k} 0 obj\n${b}\nendobj\n`)};
 add('%PDF-1.4\n');obj(1,'<</Type/Catalog/Pages 2 0 R>>');obj(2,`<</Type/Pages/Kids[${pages.map((_,i)=>`${3+3*i} 0 R`).join(' ')}]/Count ${pages.length}>>`);
 let annotationId=3+3*pages.length;
 for(let i=0;i<pages.length;i++){
  const {canvas,links=[]}=pages[i],pg=3+3*i,iw=W*sc,ih=H*sc,cs=`q ${iw.toFixed(2)} 0 0 ${ih.toFixed(2)} ${((595.28-iw)/2).toFixed(2)} ${(841.89-20-ih).toFixed(2)} cm /Im0 Do Q`;
  const annots=links.map(link=>annotationId++),annotsRef=annots.length?`/Annots[${annots.map(id=>`${id} 0 R`).join(' ')}]`:'';
  obj(pg,`<</Type/Page/Parent 2 0 R/MediaBox[0 0 595.28 841.89]/Resources<</XObject<</Im0 ${pg+1} 0 R>>>>/Contents ${pg+2} 0 R${annotsRef}>>`);
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/jpeg',.92));if(!blob)throw new Error('Could not encode a PDF page image.');
  const jpg=new Uint8Array(await blob.arrayBuffer());offs[pg+1]=len;add(`${pg+1} 0 obj\n<</Type/XObject/Subtype/Image/Width ${W}/Height ${H}/ColorSpace/DeviceRGB/BitsPerComponent 8/Filter/DCTDecode/Length ${jpg.length}>>\nstream\n`);add(jpg);add('\nendstream\nendobj\n');obj(pg+2,`<</Length ${cs.length}>>\nstream\n${cs}\nendstream`);
  links.forEach((link,index)=>{const x0=(595.28-iw)/2,y0=841.89-20-ih,x1=x0+link.x1*sc,x2=x0+link.x2*sc,y1=y0+(H-link.y2)*sc,y2=y0+(H-link.y1)*sc,uri=link.url.replace(/\\/g,'\\\\').replace(/\(/g,'\\(').replace(/\)/g,'\\)');obj(annots[index],`<</Type/Annot/Subtype/Link/Rect[${x1.toFixed(2)} ${y1.toFixed(2)} ${x2.toFixed(2)} ${y2.toFixed(2)}]/Border[0 0 0]/A<</S/URI/URI(${uri})>>>>`)})
 }
 const count=annotationId,xref=len;let table=`xref\n0 ${count}\n0000000000 65535 f \n`;for(let i=1;i<count;i++)table+=String(offs[i]).padStart(10,'0')+' 00000 n \n';
 add(table+`trailer\n<</Size ${count}/Root 1 0 R>>\nstartxref\n${xref}\n%%EOF`);return new Blob(parts,{type:'application/pdf'})
}
async function exportSavedPatternPDF(record,tracker){
 const photos=[];
 try{
  savedPatternPhotos(record).forEach(photo=>{
   if(photo.blob instanceof Blob)photos.push({url:URL.createObjectURL(photo.blob),name:photo.name||'Finished design'});
   else if(photo.src)photos.push({url:photo.src,name:photo.name||'Finished design'});
   else throw new Error(`Saved photo “${photo.name||'image'}” is unavailable.`)
  });
  const data={title:record.title||'Untitled pattern',fields:record.fields||{},steps:record.steps||[],chart:record.charts?null:(record.chart||null),charts:record.charts||null,sections:!!record.sections,tracker:!!tracker};
  const pages=await renderPatternPages(data,photos),blob=await pdfFromPages(pages);
  downloadFile(`${patternFilename(data.title)}.pdf`,blob,'application/pdf')
 }finally{photos.forEach(photo=>URL.revokeObjectURL(photo.url))}
}
async function exportPatternPDF(){
 if(!requirePatternTitle())return;const status=$('#pm-status');status.textContent='Preparing your PDF…';
 try{renderPatternPreview();const pages=await renderPatternPages({...readPatternForm(),tracker:!!($('#pm-trk')&&$('#pm-trk').checked)}),blob=await pdfFromPages(pages);downloadFile(`${patternFilename(patternValue('pm-title'))}.pdf`,blob,'application/pdf');status.textContent='PDF downloaded. Each page includes the Moll’s Studio logo and clickable website links.'}
 catch(e){status.textContent=`PDF export failed: ${e.message||'could not create the file'}`}
}
async function exportPatternPNG(){
 if(!requirePatternTitle())return;const status=$('#pm-status');status.textContent='Preparing your PNG…';
 try{
  renderPatternPreview();const pages=await renderPatternPages(),height=pages.length*PM_PAGE_H;
  if(height>32767||PM_PAGE_W*height>268000000)throw new Error('This pattern is too long for one PNG. Export it as a PDF instead.');
  const canvas=document.createElement('canvas');canvas.width=PM_PAGE_W;canvas.height=height;const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas export is not available in this browser.');
  pages.forEach((page,index)=>ctx.drawImage(page.canvas,0,index*PM_PAGE_H));
  const blob=await new Promise(resolve=>canvas.toBlob(resolve,'image/png'));if(!blob)throw new Error('Could not encode the PNG image.');
  downloadFile(`${patternFilename(patternValue('pm-title'))}.png`,blob,'image/png');status.textContent='PNG downloaded. Check your downloads.'
 }catch(e){status.textContent=`PNG export failed: ${e.message||'could not create the file'}`}
}
function setupPatternMaker(){
 const form=$('#pattern-form');if(!form)return;
 addPatternStep('Getting started','');
 try{listSavedColourCharts()}catch(e){$('#pm-chart-message').textContent=e.message}
 form.addEventListener('input',renderPatternPreview);
 form.addEventListener('change',renderPatternPreview);
 $('#pm-add-step').addEventListener('click',()=>addPatternStep());
 $('#pm-add-chart').addEventListener('click',attachSavedColourChart);
 $('#pm-remove-chart').addEventListener('click',()=>{patternChart=null;$('#pm-remove-chart').hidden=true;$('#pm-chart').value='';$('#pm-chart-message').textContent='Colour chart removed from this pattern.';renderPatternPreview()});
 $('#pm-photos').addEventListener('change',handlePatternPhotos);
 $('#pm-save').addEventListener('click',savePattern);
 $('#pm-export-png').addEventListener('click',exportPatternPNG);
 $('#pm-export-pdf').addEventListener('click',exportPatternPDF);
 $('#pm-new').addEventListener('click',clearPatternMaker);
 renderPatternPhotos();renderPatternPreview()
}

/* ransom-note lettering: wraps each letter of [data-rn] in its own cut-out */
function ransom(){let k=0;$$('[data-rn]').forEach(el=>{if(el.dataset.done)return;const t=el.textContent;if(/^H/.test(el.tagName))el.setAttribute('aria-label',t);else el.setAttribute('aria-hidden','true');el.textContent='';el.classList.add('rn');
 t.split(' ').forEach((w,wi)=>{if(wi)el.append(' ');const b=document.createElement('b');b.className='rw';[...w].forEach(ch=>{const sp=document.createElement('span');sp.className='r'+(k++%6);sp.textContent=ch;sp.setAttribute('aria-hidden','true');b.append(sp)});el.append(b)});el.dataset.done=1})}
/* ---------- menu, routing, start-up ---------- */
$('#menuP').innerHTML='<button data-v="patterns"><b>All patterns</b><small>Everything in one place</small></button><div class="mh">Browse by craft</div>'+['knit','crochet'].map(c=>`<div class="dd2"><button data-v="${c}"><b>${CRAFTS[c].n} ▾</b><small>${c=='knit'?'Jumpers, hats, bags and more':'Coming soon'}</small></button><div class="sub">${CATS.map(([k,n])=>`<button data-v="${c}-${k}">${n}</button>`).join('')}</div></div>`).join('')+'<button disabled><b>More crafts</b><small>Added over time</small></button>';
$('#menuM').innerHTML='<button data-v="mine"><b>My stuff</b><small>Open your My stuff home page</small></button><button data-v="my-patterns"><b>My patterns</b><small>Open your saved patterns</small></button><button data-v="my-charts"><b>My charts</b><small>Open your saved charts</small></button><button data-v="my-garments"><b>My garments</b><small>Open your saved garment designs</small></button><button data-v="journal"><b>Project journal</b><small>Track your projects and progress</small></button>';
$('#menuC').innerHTML='<button data-v="charts"><b>All charts</b><small>Browse every ready-made chart</small></button><div class="dd2"><button type="button" class="dd2b" aria-expanded="false"><b>Colour ▾</b></button><div class="sub"></div></div>'+[['lace','Lace'],['cable','Cable'],['textured','Texture']].map(([key,label])=>`<button data-v="charts-${key}"><b>${label}</b></button>`).join('');
refreshChartCategoryMenu();
var TOOL_GROUP_NAMES={patterns:'Pattern tools',charts:'Chart makers',calculators:'Calculators',trackers:'Trackers'};
var TOOL_GROUPS=()=>[
 ['patterns','Patterns','Make your own patterns, or let the generator work one out for you.',[['pattern-maker','Pattern maker','Write your own pattern with project details, instructions and photos, then save it and export a PDF.'],['beanie','Pattern generator','Pick a size, crown and colour, add your yarn or gauge, and get a beanie pattern with the stitch counts worked out.']]],
 ['charts','Charts','A chart maker for each kind of knitting, with the right tools for the job.',[...Object.keys(KINDS).map(k=>[k,KINDS[k].n+' chart',KINDS[k].d]),['charts','Ready-made charts','Cherries, hearts, leopard print, smileys and more. Open one in the chart maker and make it yours.'],['garment','Add your chart to a garment','Pick a garment, then pick one of your saved charts, or a few, and drag them into place to see how they look.']]],
 ['calculators','Calculators','Let the maths be done for you.',[['gauge','Gauge calculator','Work out how many stitches and rows you need for any measurement.'],['costs','Materials cost calculator','Add up how much yarn and other supplies to buy, and what a garment will cost to make.'],['evenly','Increase or decrease evenly','Space your increases or decreases evenly across a row, with the instruction written for you.']]],
 ['trackers','Trackers','Keep track of where you are in each project.',[['journal','Project journal','Tick off the rows and materials of any pattern as you go, and keep every project, with notes and progress, in one place. Saved in your browser.'],['counters','Row and stitch counter','Count rows and stitches for each project and pick up where you left off. Saved in your browser.']]]];
$('#menuT').innerHTML='<button data-v="alltools"><b>All tools</b><small>Everything in one place</small></button><div class="mh">Browse by type</div>'+
 TOOL_GROUPS().map(([k,n,d,items])=>`<div class="dd2"><button type="button" class="dd2b" aria-expanded="false"><b>${n} ▾</b><small>${items.length} ${items.length==1?'tool':'tools'}</small></button><div class="sub"><button data-v="tools-${k}" class="all">All ${n.toLowerCase()} →</button>${items.map(([v,t])=>`<button data-v="${v}">${t}</button>`).join('')}</div></div>`).join('');
$$('#menuT .dd2b').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=b.parentElement,o=!d.classList.contains('open2');$$('#menuT .dd2').forEach(x=>{x.classList.remove('open2');x.firstElementChild.setAttribute('aria-expanded',false)});if(o){d.classList.add('open2');b.setAttribute('aria-expanded',true)}});
$$('#menuC .dd2b').forEach(b=>b.onclick=e=>{e.stopPropagation();const d=b.parentElement,o=!d.classList.contains('open2');$$('#menuC .dd2').forEach(x=>{x.classList.remove('open2');x.firstElementChild.setAttribute('aria-expanded',false)});if(o){d.classList.add('open2');b.setAttribute('aria-expanded',true)}});
$('#cc-kinds').replaceChildren(...Object.keys(KINDS).map(k=>{const b=document.createElement('button');b.className='pri';b.textContent=KINDS[k].n;b.onclick=()=>{location.hash='#'+k};return b}));
$$('.dd').forEach(dd=>{const b=dd.firstElementChild;b.onclick=()=>b.setAttribute('aria-expanded',dd.classList.toggle('open'));dd.onmouseenter=()=>dd.classList.remove('shut');dd.addEventListener('focusin',e=>{if(!dd.contains(e.relatedTarget)&&e.target===b)dd.classList.remove('shut')});
 dd.querySelectorAll('.menu button[data-v]').forEach(m=>m.onclick=()=>{dd.classList.remove('open');dd.classList.add('shut');b.setAttribute('aria-expanded',false);m.blur();if(document.activeElement&&dd.contains(document.activeElement))document.activeElement.blur();location.hash='#'+m.dataset.v})});
document.addEventListener('click',e=>$$('.dd').forEach(dd=>{if(!dd.contains(e.target)){dd.classList.remove('open');dd.firstElementChild.setAttribute('aria-expanded',false)}}));

/* ---------- log in / sign up (browser-only demo accounts) ---------- */
const AC={users:()=>{try{return JSON.parse(localStorage.getItem('ms-users')||'{}')}catch(e){return{}}},save:u=>localStorage.setItem('ms-users',JSON.stringify(u)),cur:()=>{try{return localStorage.getItem('ms-session')||''}catch(e){return''}}};
async function acHash(pw,salt){const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(salt+':'+pw));return Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,'0')).join('')}
function acNav(){const u=AC.users()[AC.cur()];$('#navacct').textContent=u?u.name.split(' ')[0]+' ☺':'Log in'}
function acctView(){const e=AC.cur(),u=AC.users()[e];$('#acct-forms').hidden=!!u;$('#acct-in').hidden=!u;$('#acct-h').textContent=u?'Hello, '+u.name+' ☺':'Log in or sign up ☺';
 $('#acct-lead').textContent=u?'You’re logged in on this device.':'Join the studio to keep your name on your designs. For now, accounts live on this device only, so nothing is sent anywhere.';
 if(u){$('#acct-hi').textContent='Logged in as '+e;$('#acct-since').textContent='Joined '+new Date(u.created).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})+(u.news?' · on the mailing list':'')}}
$('#su-form').onsubmit=async ev=>{ev.preventDefault();const m=$('#su-msg'),n=$('#su-name').value.trim(),e=$('#su-email').value.trim().toLowerCase(),p=$('#su-pass').value;
 if(!n)return m.textContent='Please add your name.';if(!/^\S+@\S+\.\S+$/.test(e))return m.textContent='That email doesn’t look right.';if(p.length<8)return m.textContent='Use at least 8 characters for your password.';if(p!==$('#su-pass2').value)return m.textContent='The two passwords don’t match.';
 try{const us=AC.users();if(us[e])return m.textContent='There’s already an account with that email. Try logging in.';const salt=crypto.getRandomValues(new Uint32Array(4)).join('-');us[e]={name:n,salt,hash:await acHash(p,salt),created:Date.now(),news:$('#su-news').checked};AC.save(us);localStorage.setItem('ms-session',e);ev.target.reset();m.textContent='';acNav();acctView()}catch(x){m.textContent='Sorry, this browser wouldn’t save the account.'}};
$('#li-form').onsubmit=async ev=>{ev.preventDefault();const m=$('#li-msg'),e=$('#li-email').value.trim().toLowerCase(),u=AC.users()[e];
 try{if(!u||await acHash($('#li-pass').value,u.salt)!==u.hash)return m.textContent='That email and password don’t match.';localStorage.setItem('ms-session',e);ev.target.reset();m.textContent='';acNav();acctView()}catch(x){m.textContent='Sorry, log in isn’t available in this browser.'}};
$('#acct-out').onclick=()=>{try{localStorage.removeItem('ms-session')}catch(e){}acNav();acctView()};
acNav();
$$('nav>button,#navacct').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.v});
$$('[data-go]').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.go});
function hasWork(){return !!(kind&&S&&dirty&&(S.col.some(c=>c!==BASE)||S.sym.some(x=>x)))}
function leaveBox(onGo){
 let box=$('#lvb');if(!box){box=document.createElement('div');box.id='lvb';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','lvt');
  box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(27,16,34,.55);display:flex;align-items:center;justify-content:center;padding:1rem';
  box.innerHTML='<div style="background:var(--paper);border:3px solid var(--ink);border-radius:16px;box-shadow:6px 6px 0 var(--ink);max-width:420px;width:100%;padding:1.2rem"><h3 id="lvt" style="margin:0 0 .4rem">Save your chart before you leave?</h3><p style="margin:.2rem 0 .8rem">If you leave this page your chart will disappear and you will start again with a blank one.</p><label style="display:block;margin-bottom:.4rem;font-weight:700">Name your chart <input id="lvn" type="text" style="width:100%;box-sizing:border-box;margin-top:.25rem" placeholder="e.g. Cherry scarf"></label><p id="lvm" role="status" style="min-height:1.2em;margin:.2rem 0 .6rem;color:#b3261e;font-weight:700"></p><div class="row"><button id="lvs">Save and leave</button><button id="lvd">Leave without saving</button><button id="lvc">Stay here</button></div></div>';document.body.append(box)}
 box.hidden=false;const n=$('#lvn');n.value=(S.name||'').trim();$('#lvm').textContent='';setTimeout(()=>n.focus(),30);
 const close=()=>{box.hidden=true;document.removeEventListener('keydown',esc)},esc=e=>{if(e.key=='Escape')close()};document.addEventListener('keydown',esc);
 $('#lvc').onclick=close;
 $('#lvd').onclick=()=>{close();onGo()};
 $('#lvs').onclick=()=>{const name=n.value.trim();if(!name){$('#lvm').textContent='Please give your chart a name first.';n.focus();return}S.name=name;$('#nm').value=name;$('#sa').click();let ok=false;try{ok=!!store()[name]}catch(e){}if(!ok){$('#lvm').textContent='Saving is not available in this browser. You can leave without saving, or stay and export your chart.';return}close();onGo()}}
addEventListener('beforeunload',e=>{if(hasWork()){e.preventDefault();e.returnValue=''}});
function route(){
 if(skipRoute){skipRoute=false;return}
 const nh=location.hash.slice(1);
 if(nh!==kind&&$('#chart-publish-panel')&&!$('#chart-publish-panel').hidden){hideChartPublish();publishEditId=''}
 if(kind&&nh!==kind){
  if(hasWork()){const go=nh,back=lastHash;skipRoute=true;location.hash=back;leaveBox(()=>{dirty=false;kind='';docs={};resetPictures();location.hash=go});return}
  kind='';docs={};resetPictures()}
 if(GP&&/^#garment(\?|$)/.test(lastHash)&&!/^garment(\?|$)/.test(nh)){
  if(garDirty()){const go=nh,back=lastHash;skipRoute=true;location.hash=back;garLeaveBox(()=>{garReset();location.hash=go});return}
  garReset()}
 if(/^#costs(\?|$)/.test(lastHash)&&!/^costs(\?|$)/.test(nh)){if(typeof costsReady!='undefined'&&costsReady&&costsSLunsaved()){const go=nh,back=lastHash;skipRoute=true;location.hash=back;costsLeaveBox(()=>{costsReset();location.hash=go});return}costsReset()}
 lastHash=location.hash;
 const rawHash=location.hash.slice(1),h=rawHash.replace(/\?.*$/,''),journalProjectId=h=='journal-project'?new URLSearchParams(rawHash.split('?')[1]||'').get('id'):'',d=!!KINDS[h],pid=h.startsWith('post-')?h.slice(5):'',pp=h.startsWith('pattern-')?h.slice(8):'',shopId=h.startsWith('shop-')?h.slice(5):'',pm=h.match(/^(knit|crochet|crossstitch)(?:-(\w+))?$/),patternCategory=h.match(/^patterns-(\w+)$/),ps=h.match(/^posts-(knit|crochet|crossstitch)$/),pt=h=='patterns'||!!pm||!!(patternCategory&&CATN[patternCategory[1]]),cm=h.match(/^charts(?:-([a-z0-9-]+))?$/),v=d?'design':cm?'charts':h=='chart-publications'&&$('#chart-publications')?'chart-publications':pid?'post':shopId?'shop':h=='pattern-maker'?'pattern-maker':pp?'pattern':pt?'patterns':ps?'posts':/^tools-(patterns|charts|calculators|trackers)$/.test(h)?'alltools':['posts','shop','mine','my-patterns','my-charts','journal','journal-project','community','spin','account','gauge','counters','creations','beanie','costs','alltools','evenly','garment','bagpattern','my-garments'].includes(h)?h:'home';
 ['home','posts','post','pattern','patterns','pattern-maker','charts','chart-publications','shop','mine','my-patterns','my-charts','journal','journal-project','community','spin','account','design','gauge','counters','creations','beanie','costs','alltools','evenly','garment','bagpattern','my-garments'].forEach(id=>{const section=$('#'+id);if(section)section.hidden=id!=v});
 document.body.dataset.t=v=='my-garments'||v=='bagpattern'||v=='my-patterns'||v=='my-charts'||v=='journal'||v=='journal-project'?'mine':v=='post'||v=='pattern'||v=='pattern-maker'?'patterns':v;
 $('#infs').textContent=d?KINDS[h].n+' chart maker':({home:'Home',posts:'Posts',post:'Posts',shop:'Shop',pattern:'Patterns',patterns:'Patterns','pattern-maker':'Create your own pattern',mine:'My stuff','my-patterns':'My patterns','my-charts':'My charts',journal:'Project journal','journal-project':'Project journal','chart-publications':'All publications',community:'Community',spin:'Inspire me',gauge:'Gauge calculator',counters:'Row and stitch counter',beanie:'Beanie generator',costs:'Materials cost calculator',evenly:'Increase or decrease evenly',garment:'Add your chart to a garment',bagpattern:'My patterns','my-garments':'My garments',alltools:((window.TOOL_GROUP_NAMES||{})[h.slice(6)]||'All tools'),creations:'Moll’s creations',charts:'Charts',account:'Log in'})[v];
 if(cm)chartsPage(cm[1]||'');if(v=='garment')garPage();if(v=='my-garments')renderGarments();if(v=='bagpattern')gpView(new URLSearchParams(rawHash.split('?')[1]||'').get('id')||'');
 const key=v=='gauge'||v=='counters'||v=='beanie'||v=='costs'||v=='evenly'||v=='garment'||v=='alltools'||v=='pattern-maker'||d?'tools':cm||v=='chart-publications'?'charts':pid||['posts','creations'].includes(v)?'community':(pt||pp)?'patterns':['my-patterns','my-charts','journal','journal-project','bagpattern','my-garments'].includes(v)?'mine':v;
 $$('nav>button,#navacct').forEach(b=>b.setAttribute('aria-current',b.dataset.v==key));$$('.dd').forEach(x=>x.firstElementChild.setAttribute('aria-current',x.dataset.k==key));
 if(v=='posts'){const pc=ps?ps[1]:'';postCards($('#plist'),0,pc);$('#pstl').textContent=pc?`${CRAFTS[pc].n} posts: works in progress, finished makes and tips.`:'Works in progress, finished makes and crafty tips from the studio.'}if(v=='post')showPost(pid);if(v=='shop')renderShop(shopId);if(v=='pattern')showPattern(pp);if(v=='my-patterns')renderSavedPatterns();if(v=='my-charts')renderSavedCharts();if(v=='journal')journal();if(v=='journal-project')showJournalProject(journalProjectId);if(v=='chart-publications'&&$('#chart-publications-list'))renderChartPublications();if(v=='account')acctView();if(v=='pattern-maker'){try{listSavedColourCharts();if(patternChart)$('#pm-chart').value=patternChart.name}catch(e){$('#pm-chart-message').textContent=e.message}}
 if(pt){const c=pm?pm[1]:'',g=patternCategory&&CATN[patternCategory[1]]?patternCategory[1]:pm&&CATN[pm[2]]?pm[2]:'';$('#ph').textContent=(c?CRAFTS[c].n+' ':'')+(g?CATN[g]:'patterns')+' ♥';$('#uc')&&($('#uc').hidden=!(c&&c!='knit'));$('#pl').textContent=c&&c!='knit'&&!PAT.some(p=>(p.c||'knit')==c)?CRAFTS[c].n+' patterns are on their way. More crafts will join over time.':'Full patterns with step-by-step instructions. Any chart a pattern uses is shown right inside it.';chips(c,g);library($('#lib'),0,c,g)}
 if(d){if(kind!=h){enter(h);publishEditId=pendingPublicationEditId;pendingPublicationEditId=''}if(pend){applyPattern(pend);pend=null}if(pendProj){const{n,g}=pendProj;undo=[];redo=[];S.name=n;$('#nm').value=n;load(g);if(KINDS[kind].knit)swatches();msg(`Opened “${n}”.`);pendProj=null}render()}

 if(['community','posts','creations','shop'].includes(v))$$('[data-ctabs]').forEach(bx=>{bx.replaceChildren();[['community','Community'],['posts','Posts'],['creations','Moll’s creations'],['shop','Shop']].forEach(([k,n])=>{const b=document.createElement('button');b.textContent=n;b.setAttribute('aria-pressed',k==v);b.onclick=()=>{location.hash='#'+k};bx.append(b)})});
 if(v=='community')postCards($('#cplist'),3);
 if(v=='creations')creationsVisit();
 if(v=='beanie'&&typeof beanieShow=='function')beanieShow();
 if(v=='costs'&&typeof costsShow=='function')costsShow();
 if(v=='alltools'&&typeof toolsPage=='function')toolsPage(h);
}
$$('nav>button').forEach(b=>b.onclick=()=>{location.hash='#'+b.dataset.v});
/* leaving "Add your chart to a garment": warn about unsaved work, then start the tool fresh next time */
function garSig(){try{return GP&&GP.stage&&GP.stage.count()?JSON.stringify(GP.stage.exportDesign()):''}catch(e){return''}}
function garDirty(){const sg=garSig();return !!sg&&sg!==(GP.savedSig||'')}
addEventListener('beforeunload',e=>{if(/^#garment\b/.test(location.hash)&&GP&&garDirty()){e.preventDefault();e.returnValue=''}});
function garReset(){GP=null;const g3=document.getElementById('gp3');if(g3)g3.innerHTML='';const o=document.getElementById('gp5-out');if(o)o.innerHTML=''}
function costsLeaveBox(onGo){
 let box=$('#clvb');if(!box){box=document.createElement('div');box.id='clvb';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','clvt');
  box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(27,16,34,.55);display:flex;align-items:center;justify-content:center;padding:1rem';
  box.innerHTML='<div style="background:var(--paper);border:3px solid var(--ink);border-radius:16px;box-shadow:6px 6px 0 var(--ink);max-width:420px;width:100%;padding:1.2rem"><h3 id="clvt" style="margin:0 0 .4rem">Save your shopping list before you leave?</h3><p style="margin:.2rem 0 .8rem">If you leave this page it will refresh, and your shopping list will disappear unless you download it as a PDF first.</p><p id="clvm" role="status" style="min-height:1.2em;margin:.2rem 0 .6rem;color:#b3261e;font-weight:700"></p><div class="row"><button id="clvs">Download PDF and leave</button><button id="clvd">Leave without saving</button><button id="clvc">Stay here</button></div></div>';document.body.append(box)}
 box.hidden=false;$('#clvm').textContent='';setTimeout(()=>$('#clvs').focus(),30);
 const close=()=>{box.hidden=true;document.removeEventListener('keydown',esc)},esc=e=>{if(e.key=='Escape')close()};document.addEventListener('keydown',esc);
 $('#clvc').onclick=close;
 $('#clvd').onclick=()=>{close();onGo()};
 $('#clvs').onclick=async()=>{const ok=await costsSLpdf();if(!ok){$('#clvm').textContent='The PDF could not be made. You can stay and try again, or leave without saving.';return}close();onGo()}}
addEventListener('beforeunload',e=>{if(/^#costs\b/.test(location.hash)&&typeof costsReady!='undefined'&&costsReady&&costsSLunsaved()){e.preventDefault();e.returnValue=''}});
function garLeaveBox(onGo){
 let box=$('#glvb');if(!box){box=document.createElement('div');box.id='glvb';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.setAttribute('aria-labelledby','glvt');
  box.style.cssText='position:fixed;inset:0;z-index:99999;background:rgba(27,16,34,.55);display:flex;align-items:center;justify-content:center;padding:1rem';
  box.innerHTML='<div style="background:var(--paper);border:3px solid var(--ink);border-radius:16px;box-shadow:6px 6px 0 var(--ink);max-width:420px;width:100%;padding:1.2rem"><h3 id="glvt" style="margin:0 0 .4rem">Save your garment before you leave?</h3><p style="margin:.2rem 0 .8rem">If you leave this page it will refresh, and your garment design and its colour work will disappear unless you save it.</p><label style="display:block;margin-bottom:.4rem;font-weight:700">Name your garment <input id="glvn" type="text" maxlength="60" style="width:100%;box-sizing:border-box;margin-top:.25rem" placeholder="e.g. Cherry tote"></label><p id="glvm" role="status" style="min-height:1.2em;margin:.2rem 0 .6rem;color:#b3261e;font-weight:700"></p><div class="row"><button id="glvs">Save and leave</button><button id="glvd">Leave without saving</button><button id="glvc">Stay here</button></div></div>';document.body.append(box)}
 box.hidden=false;const n=$('#glvn'),nm=$('#gsv-name');n.value=((nm&&nm.value)||'').trim();$('#glvm').textContent='';setTimeout(()=>n.focus(),30);
 const close=()=>{box.hidden=true;document.removeEventListener('keydown',esc)},esc=e=>{if(e.key=='Escape')close()};document.addEventListener('keydown',esc);
 $('#glvc').onclick=close;
 $('#glvd').onclick=()=>{close();onGo()};
 $('#glvs').onclick=async()=>{const name=n.value.trim();if(!name){$('#glvm').textContent='Please give your garment a name first.';n.focus();return}if(nm)nm.value=name;const id=await gpSaveGarment();if(!id){$('#glvm').textContent=($('#gsv-msg')&&$('#gsv-msg').textContent)||'Saving is not available in this browser. You can leave without saving, or stay and save your picture with SAVE.';return}close();onGo()}}
addEventListener('hashchange',route);
{const t0=Date.now(),tc=$('#tc');setInterval(()=>{const s=Math.floor((Date.now()-t0)/1000),p=n=>String(n).padStart(2,'0');tc.textContent=Math.floor(s/3600)+':'+p(Math.floor(s/60)%60)+':'+p(s%60)},1000)}
/* ---------- inspiration wheel ---------- */
let wrot=0,spinning=false;const WC=['#ff9bd0','#7df9ff','#fff23a','#ffd3ea','#c4ff2e','#fff9a6'];
const pool=()=>PAT.filter(p=>{const f=$('#sf').value;return f=='All'||p.g==f});
function drawWheel(){const c=$('#wheel'),x=c.getContext('2d'),L=pool(),n=L.length,R=230;x.clearRect(0,0,460,460);x.save();x.translate(R,R);x.rotate(wrot);
 L.forEach((p,i)=>{const a0=i*2*Math.PI/n,a1=(i+1)*2*Math.PI/n;x.beginPath();x.moveTo(0,0);x.arc(0,0,R,a0,a1);x.closePath();x.fillStyle=WC[i%WC.length];x.fill();x.strokeStyle='#1b1022';x.lineWidth=2;x.stroke();
  x.save();x.rotate((a0+a1)/2);x.fillStyle='#1b1022';x.font='bold 15px Verdana,sans-serif';x.textAlign='right';x.textBaseline='middle';let t=p.n;if(t.length>22)t=t.slice(0,21)+'…';x.fillText(t,R-16,0);x.restore()});
 x.restore();x.beginPath();x.arc(R,R,26,0,7);x.fillStyle='#fff';x.fill();x.lineWidth=3;x.strokeStyle='#1b1022';x.stroke();x.fillStyle='#d81b82';x.font='24px sans-serif';x.textAlign='center';x.textBaseline='middle';x.fillText('♥',R,R+1)}
function showSpin(p){const el=$('#spinres');el.innerHTML='';const h=document.createElement('h3');h.textContent=p.n;const m=document.createElement('p');m.className='meta';m.textContent=`${p.sample?'Sample pattern, ':CRAFTS[p.c||'knit'].n+', '}${CATN[p.g]}, ${p.l.toLowerCase()}`;const d=document.createElement('p');d.textContent=p.d;const b=document.createElement('button');b.className='pri';b.textContent='View pattern ♥';b.onclick=()=>{location.hash='#pattern-'+p.id};el.append(h,patThumb(p,160),m,d,b)}
function spin(){if(spinning)return;const L=pool(),n=L.length,k=Math.floor(Math.random()*n),seg=2*Math.PI/n,target=-(k+.5)*seg+Math.PI*2*(5+Math.floor(Math.random()*3)),from=wrot%(Math.PI*2),total=target-from+(Math.random()-.5)*seg*.7,reduce=matchMedia('(prefers-reduced-motion:reduce)').matches,dur=reduce?1:4200,t0=performance.now();spinning=true;$('#spinb').disabled=true;
 const step=t=>{const q=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-q,3);wrot=from+total*e;drawWheel();if(q<1)requestAnimationFrame(step);else{spinning=false;$('#spinb').disabled=false;showSpin(L[k])}};requestAnimationFrame(step)}
$('#spinb').onclick=spin;$('#sf').onchange=()=>{wrot=0;drawWheel();$('#spinres').innerHTML='<p class="lead" style="margin:0">Your pattern will land here.</p>'};
$('#surp').onclick=()=>{if(spinning)return;const L=pool();showSpin(L[Math.floor(Math.random()*L.length)])};
function initMusicPlayer(){
 const audio=$('#music-audio'),title=$('#music-title'),status=$('#music-status'),play=$('#music-play'),prev=$('#music-prev'),next=$('#music-next'),seek=$('#music-seek'),current=$('#music-current'),duration=$('#music-duration'),volume=$('#music-volume');
 const player=$('#music-player'),collapse=$('#music-collapse'),collapseIcon=$('#music-collapse-icon');
 let trackIndex=0;
 const clock=value=>{if(!Number.isFinite(value)||value<0)return'0:00';const mins=Math.floor(value/60),secs=Math.floor(value%60);return mins+':'+String(secs).padStart(2,'0')};
 const updatePlay=()=>{play.textContent=audio.paused?'▶':'Ⅱ';play.setAttribute('aria-label',audio.paused?'Play':'Pause')};
 collapse.addEventListener('click',()=>{const minimized=player.classList.toggle('is-minimized');collapse.setAttribute('aria-expanded',String(!minimized));collapse.setAttribute('aria-label',minimized?'Expand music player':'Minimise music player');collapseIcon.textContent=minimized?'↑':'⌄';document.body.classList.toggle('music-player-minimized',minimized)});
 audio.volume=Number(volume.value);
 volume.addEventListener('input',()=>{audio.volume=Number(volume.value)});
 const loadTrack=(index,autoplay)=>{
  trackIndex=(index+MUSIC_TRACKS.length)%MUSIC_TRACKS.length;
  const track=MUSIC_TRACKS[trackIndex];
  title.textContent=track.title;
  status.textContent='Loading track…';
  seek.value=0;current.textContent='0:00';duration.textContent='0:00';
  audio.src=track.src;audio.load();
  if(autoplay)audio.play().catch(()=>{if(!audio.error)status.textContent='Tap play to start playback'});
 };
 if(!MUSIC_TRACKS.length)return;
 play.disabled=prev.disabled=next.disabled=seek.disabled=false;
 loadTrack(0,true);
 play.addEventListener('click',()=>{if(audio.paused)audio.play().catch(()=>{status.textContent='Playback could not start. Check the audio file and try again.'});else audio.pause()});
 prev.addEventListener('click',()=>loadTrack(trackIndex-1,!audio.paused));
 next.addEventListener('click',()=>loadTrack(trackIndex+1,!audio.paused));
 audio.addEventListener('play',()=>{updatePlay();status.textContent='Now playing'});
 audio.addEventListener('pause',()=>{updatePlay();if(!audio.ended&&audio.currentTime>0)status.textContent='Paused'});
 audio.addEventListener('ended',()=>loadTrack(trackIndex+1,true));
 audio.addEventListener('loadedmetadata',()=>{duration.textContent=clock(audio.duration)});
 audio.addEventListener('timeupdate',()=>{current.textContent=clock(audio.currentTime);if(Number.isFinite(audio.duration)&&audio.duration>0)seek.value=String(Math.round(audio.currentTime/audio.duration*1000))});
 audio.addEventListener('error',()=>{status.textContent='Could not load this track. Check its file path and format.'});
 seek.addEventListener('input',()=>{if(Number.isFinite(audio.duration)&&audio.duration>0)audio.currentTime=Number(seek.value)/1000*audio.duration});
}
$('#shop-sort').addEventListener('change',()=>{shopSort=$('#shop-sort').value;renderShopListings()});
ransom();home();setupPatternMaker();route();drawWheel();
initMusicPlayer();

/* =====================================================================
   AUDIO HOOKS. Everything the rave plays or changes is in these three
   functions, so the sound can be swapped or removed here without touching
   the visuals:
     onRaveDoorsOpen()  the club doors screen (outside the club) appears
     onRaveEnterFull()  the ticket is torn: the music opens up as you walk in
     onRaveExit()       the rave is closed (Not now, Stop the rave, Esc)
   ===================================================================== */
var RV_AUDIO={ra:null,ctx:null,f1:null,f2:null,gain:null,siteWas:false};
function rvTrack(){return MUSIC_TRACKS.find(t=>/hardgroove/i.test(t.title+t.src))||{src:'music/HARDGROOVE%201%20MASTER.wav',title:'HARDGROOVE 1'}}
function onRaveDoorsOpen(){ // pause the website player; Hardgroove 1 starts at 0:45, muffled, as if heard through the club doors
 const A=RV_AUDIO,sa=$('#music-audio');A.siteWas=!!sa&&!sa.paused;if(sa)sa.pause();
 const RV_START=40; // seconds into the song when the poster appears
 const ra=A.ra=new Audio(rvTrack().src+'#t='+RV_START);ra.loop=true;ra.preload='auto';
 ra.addEventListener('loadedmetadata',()=>{try{if(ra.currentTime<RV_START-1&&ra.duration>RV_START)ra.currentTime=RV_START}catch(e){}},{once:true});
 if(/^https?:$/.test(location.protocol)&&(window.AudioContext||window.webkitAudioContext)){ // real "heard through a box" filter when the site runs on a server
  try{const c=A.ctx=new (window.AudioContext||window.webkitAudioContext)(),src=c.createMediaElementSource(ra);A.f1=c.createBiquadFilter();A.f1.type='lowpass';A.f1.frequency.value=170;A.f1.Q.value=.9;A.f2=c.createBiquadFilter();A.f2.type='lowpass';A.f2.frequency.value=230;A.f2.Q.value=.7;A.gain=c.createGain();A.gain.gain.value=.55;src.connect(A.f1);A.f1.connect(A.f2);A.f2.connect(A.gain);A.gain.connect(c.destination);c.resume&&c.resume()}catch(e){A.ctx=A.f1=A.f2=A.gain=null}}
 if(!A.f1)ra.volume=.14; // opened straight from the folder: just quieter
 ra.play().catch(()=>{})}
function onRaveEnterFull(){ // the ticket is torn and you walk in: the song keeps playing and opens up gradually, from muffled to full and loud
 const A=RV_AUDIO,ra=A.ra,ms=2600;if(!ra)return;
 if(A.f1&&A.ctx){const t=A.ctx.currentTime,end=t+ms/1000;
  [A.f1,A.f2].forEach(f=>{f.frequency.cancelScheduledValues(t);f.frequency.setValueAtTime(f.frequency.value,t);f.frequency.exponentialRampToValueAtTime(900,t+ms/1000*.45);f.frequency.exponentialRampToValueAtTime(20000,end)});
  A.f1.Q.setTargetAtTime(.7,t,ms/3000);A.gain.gain.cancelScheduledValues(t);A.gain.gain.setValueAtTime(A.gain.gain.value,t);A.gain.gain.linearRampToValueAtTime(1,end)}
 else{const from=ra.volume,t0=performance.now(),id=setInterval(()=>{const k=Math.min(1,(performance.now()-t0)/ms);ra.volume=from+(1-from)*k*k;if(k>=1)clearInterval(id)},40)}}
function onRaveExit(){ // fade out Hardgroove 1 and give the website player back
 const A=RV_AUDIO,a=A.ra;A.ra=null;
 if(a){let v=a.volume;const id=setInterval(()=>{v-=.1;if(v<=0){clearInterval(id);a.pause();try{A.ctx&&A.ctx.close()}catch(e){}A.ctx=A.f1=A.f2=A.gain=null}else a.volume=Math.max(0,v)},40);if(A.gain)try{A.gain.gain.setTargetAtTime(0,A.ctx.currentTime,.1)}catch(e){}}
 const sa=$('#music-audio');if(sa&&A.siteWas)sa.play().catch(()=>{})}

/* ---------- enter splash: doors open onto the home page and the music starts ---------- */
function initSplash(){
 const sp=$('#splash');if(!sp)return;
 let seen=false;try{seen=sessionStorage.getItem('ms-entered')=='1'}catch(e){}
 if(seen){sp.remove();return}
 const star=(s,st)=>`<svg class="sd-star" aria-hidden="true" viewBox="0 0 100 100" style="${s}"><path d="M50 4C55 34 66 45 96 50 66 55 55 66 50 96 45 66 34 55 4 50 34 45 45 34 50 4Z" ${st} stroke-width="6" stroke-linejoin="round"/></svg>`;
 const smile=d=>`<svg aria-hidden="true" viewBox="0 0 100 100" style="width:42px;height:42px;flex:none;margin:0 2px;animation:sdbob 1.6s ease-in-out ${d} infinite"><circle cx="50" cy="50" r="44" fill="#c4ff2e" stroke="#0e0b12" stroke-width="9"/><ellipse cx="35" cy="40" rx="6" ry="10" fill="#0e0b12"/><ellipse cx="65" cy="40" rx="6" ry="10" fill="#0e0b12"/><path d="M26 58C34 78 66 78 74 58" fill="none" stroke="#0e0b12" stroke-width="8" stroke-linecap="round"/></svg>`;
 const word='display:flex;align-items:baseline;gap:3px;font-size:52px;line-height:1;-webkit-text-stroke:12px #0e0b12;paint-order:stroke fill';
 const badge=id=>`<div class="sd-badge" aria-hidden="true"><div style="color:#ff3fa4"><svg viewBox="0 0 420 420" style="position:absolute;left:0;top:0;width:428px;height:428px"><defs><path id="ring-${id}" d="M210 210m-163 0a163 163 0 1 1 326 0a163 163 0 1 1-326 0"/></defs><circle cx="210" cy="210" r="202" fill="#ff3fa4" stroke="#c4ff2e" stroke-width="8"/><circle cx="210" cy="210" r="134" fill="#0e0b12"/><text font-family="'Zen Dots','Arial Black',sans-serif" font-size="22" fill="#0e0b12" textLength="1000" lengthAdjust="spacing" style="transform-origin:210px 210px;animation:sdspin 26s linear infinite"><textPath href="#ring-${id}">A STUDIO FOR ALL THINGS HANDMADE ✦</textPath></text><g fill="none" stroke="#c4ff2e" stroke-width="3.2" transform="rotate(-14 210 210)"><circle cx="210" cy="210" r="120"/><ellipse cx="210" cy="210" rx="120" ry="40"/><ellipse cx="210" cy="210" rx="120" ry="82"/><ellipse cx="210" cy="210" rx="40" ry="120"><animate attributeName="rx" values="1;120;1" dur="7s" repeatCount="indefinite"/></ellipse><ellipse cx="210" cy="210" rx="82" ry="120"><animate attributeName="rx" values="1;120;1" dur="7s" begin="-1.75s" repeatCount="indefinite"/></ellipse><ellipse cx="210" cy="210" rx="110" ry="120"><animate attributeName="rx" values="1;120;1" dur="7s" begin="-3.5s" repeatCount="indefinite"/></ellipse><ellipse cx="210" cy="210" rx="60" ry="120"><animate attributeName="rx" values="1;120;1" dur="7s" begin="-5.25s" repeatCount="indefinite"/></ellipse><path d="M90 210H330"/></g></svg><div style="position:absolute;left:0;top:0;width:428px;height:428px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:6px;transform:rotate(-6deg)"><div style="${word}"><span>M</span>${smile('0s')}<span>LL'S</span></div><div style="${word}"><span>STUDI</span>${smile('-.8s')}</div></div></div></div>`;
 const side=(cls,id,stars)=>{const d=sp.querySelector('.'+cls);d.innerHTML=`<div class="sd-in">${badge(id)}${stars}</div>`};
 side('sd-l','l',star('left:12%;top:20%;transform:rotate(-10deg)','fill="#ff3fa4" stroke="#0e0b12"')+star('left:22%;bottom:16%;width:50px;height:50px;animation-delay:-1.3s','fill="none" stroke="#0e0b12"'));
 side('sd-r','r',star('right:12%;bottom:24%;width:90px;height:90px;transform:rotate(12deg);animation-delay:-.9s','fill="#ff3fa4" stroke="#0e0b12"')+star('right:20%;top:16%;width:50px;height:50px;animation-delay:-.4s','fill="none" stroke="#0e0b12"'));
 const fit=()=>sp.style.setProperty('--k',Math.max(.45,Math.min(1.05,innerHeight*.62/428,innerWidth*.92/428)).toFixed(3));
 fit();addEventListener('resize',fit);
 document.documentElement.classList.add('splash-on');sp.hidden=false;
 const btn=$('#splash-enter');btn.focus({preventScroll:true});
 let done=false;
 const enter=()=>{if(done)return;done=true;
  try{sessionStorage.setItem('ms-entered','1')}catch(e){}
  const a=$('#music-audio');if(a&&MUSIC_TRACKS.length){const p=a.play();if(p&&p.catch)p.catch(()=>{})}
  sp.classList.add('open');
  const fin=()=>{sp.remove();document.documentElement.classList.remove('splash-on');removeEventListener('resize',fit)};
  setTimeout(fin,1400)};
 btn.addEventListener('click',enter);
 sp.addEventListener('click',enter);
}
initSplash();

/* ---------- gauge calculator ---------- */
function gaugeInit(){
 const K='ms-gauge',el={w:$('#g-w'),s:$('#g-s'),h:$('#g-h'),r:$('#g-r'),u:$('#g-unit'),rd:$('#g-round'),rep:$('#g-rep'),ext:$('#g-ext'),bs:$('#g-bs'),br:$('#g-br')},list=$('#g-list');
 let rows=[{l:'Front panel width',k:'across',v:40},{l:'Body length',k:'down',v:55}];
 const num=e=>{const n=parseFloat(e.value);return isFinite(n)&&n>0?n:NaN},fmt=n=>String(Math.round(n*100)/100),unit=()=>el.u.value=='in'?'in':'cm';
 const save=()=>{try{localStorage.setItem(K,JSON.stringify({u:el.u.value,w:el.w.value,s:el.s.value,h:el.h.value,r:el.r.value,rd:el.rd.value,rep:el.rep.value,ext:el.ext.value,bs:el.bs.value,br:el.br.value,rows}))}catch(e){}};
 try{const o=JSON.parse(localStorage.getItem(K)||'null');if(o){['u','w','s','h','r','rd','rep','ext','bs','br'].forEach(k=>{if(o[k]!=null&&el[k])el[k].value=o[k]});if(Array.isArray(o.rows)&&o.rows.length)rows=o.rows.filter(x=>x&&typeof x.l=='string').slice(0,30)}}catch(e){}
 const round=(x,kind)=>{const m=el.rd.value;if(m=='up')return Math.ceil(x-1e-9);if(m=='down')return Math.floor(x+1e-9);if(m=='multiple'&&kind=='across'){const n=Math.max(1,Math.round(parseFloat(el.rep.value)||1));return Math.max(n,Math.round(x/n)*n)}return Math.round(x)};
 const calc=()=>{const u=unit(),w=num(el.w),s=num(el.s),h=num(el.h),r=num(el.r);
  document.querySelectorAll('#gauge .gu').forEach(x=>x.textContent=u);$('#g-repl').hidden=el.rd.value!='multiple';
  const ok=w&&s&&h&&r,spu=ok?s/w:0,rpu=ok?r/h:0,ex=Math.max(0,Math.round(parseFloat(el.ext.value)||0)),out=[];
  $('#g-sum').textContent=ok?`Your gauge is ${fmt(spu)} stitches and ${fmt(rpu)} rows per ${u}. That is ${fmt(spu*(u=='cm'?10:4))} stitches and ${fmt(rpu*(u=='cm'?10:4))} rows over ${u=='cm'?'10 cm':'4 inches'}.`:'Enter your swatch measurements above. All four need to be more than zero.';
  [...list.children].forEach((li,i)=>{const row=rows[i],v=parseFloat(row.v),res=li.querySelector('.res');
   if(!ok||!(v>0)){res.textContent=ok?'Enter a measurement':'Fill in your gauge first';return}
   const down=row.k=='down',exact=v*(down?rpu:spu),n=round(exact,row.k),tot=down?n:n+ex;
   res.textContent='';const b=document.createElement('span');b.textContent=`${tot} ${down?'rows':'stitches'}`;const sm=document.createElement('small');sm.textContent=`${fmt(exact)} exactly${!down&&ex?`, rounded to ${n}, plus ${ex} extra`:n!=exact?`, rounded to ${n}`:''}`;res.append(b,sm);
   out.push(`${row.l||'Measurement'}: ${fmt(v)} ${u} ${down?'down':'across'} = ${tot} ${down?'rows':'stitches'}`)});
  const bs=parseFloat(el.bs.value),br=parseFloat(el.br.value);
  $('#g-big').textContent=ok?`${bs>0?`${fmt(bs)} stitches is ${fmt(bs/spu)} ${u} wide`:'Enter a stitch count'}${br>0?`${bs>0?' and ':''}${fmt(br)} rows is ${fmt(br/rpu)} ${u} high`:''}.`:'';
  gaugeText=ok?[`Gauge: ${el.s.value} stitches and ${el.r.value} rows over ${el.w.value} x ${el.h.value} ${u}`,...out].join('\n'):'';save()};
 let gaugeText='';
 const draw=()=>{list.replaceChildren();rows.forEach((row,i)=>{const li=document.createElement('div');li.className='gl';
  const l=document.createElement('input');l.type='text';l.maxLength=60;l.value=row.l;l.placeholder='Name (e.g. sleeve length)';l.setAttribute('aria-label','Measurement name');l.oninput=()=>{row.l=l.value;calc()};
  const k=document.createElement('select');k.setAttribute('aria-label','Direction');[['across','Across (stitches)'],['down','Down (rows)']].forEach(([a,b])=>{const o=document.createElement('option');o.value=a;o.textContent=b;if(a==row.k)o.selected=true;k.append(o)});k.onchange=()=>{row.k=k.value;calc()};
  const v=document.createElement('input');v.type='number';v.min='0';v.step='any';v.inputMode='decimal';v.value=row.v;v.setAttribute('aria-label','Measurement');v.oninput=()=>{row.v=v.value;calc()};
  const r=document.createElement('div');r.className='res';r.setAttribute('role','status');
  const x=document.createElement('button');x.textContent='Remove';x.setAttribute('aria-label','Remove '+(row.l||'measurement'));x.onclick=()=>{rows.splice(i,1);draw()};
  li.append(l,k,v,r,x);list.append(li)});calc()};
 let prev=unit();
 el.u.onchange=()=>{const to=unit();if(to!=prev){const f=to=='in'?1/2.54:2.54;[el.w,el.h].forEach(e=>{const n=parseFloat(e.value);if(n>0)e.value=Math.round(n*f*1000)/1000});rows.forEach(r=>{const n=parseFloat(r.v);if(n>0)r.v=Math.round(n*f*1000)/1000});prev=to;draw()}};
 ['w','s','h','r','rd','rep','ext','bs','br'].forEach(k=>el[k].addEventListener('input',calc));el.rd.addEventListener('change',calc);
 $('#g-add').onclick=()=>{if(rows.length>=30){$('#g-msg').textContent='That is the most you can add.';return}rows.push({l:'',k:'across',v:''});draw();const ins=list.querySelectorAll('.gl input[type=text]');ins[ins.length-1].focus()};
 $('#g-copy').onclick=async()=>{const m=$('#g-msg');if(!gaugeText){m.textContent='Fill in your gauge first.';return}try{await navigator.clipboard.writeText(gaugeText);m.textContent='Copied. Paste it into your notes.'}catch(e){m.textContent='Copying didn’t work here. Select the results and copy them by hand.'}};
 prev=unit();draw()}
gaugeInit();

/* ---------- Moll's creations board ----------
   To add a picture: save it in the images folder, then add a line to CREATIONS.
   src = file path, c = 'crochet' or 'knit', p = pattern id (optional, adds a "See the pattern" button), t = short description for screen readers (optional, not shown on the board). */
const CREATIONS=[
 {src:'images/cow-print-bag.jpg',t:'Cow print shoulder bag',c:'crochet',p:'cow-print-shoulder-bag'},
 {src:'images/stripy-scarf.jpg',t:'Stripy scarf',c:'knit',p:'stripy-scarf'},
 {src:'images/cat-hat-pink.jpg',t:'Fluffy cat hat',c:'crochet',p:'cat-hat'},
 {src:'images/granny-square-scarf.jpg',t:'Granny square scarf',c:'crochet',p:'granny-square-scarf'},
 {src:'images/checkerboard-hat-front.jpg',t:'Checkerboard hat',c:'crochet',p:'checkerboard-hat'},
 {src:'images/cat-hat.jpg',t:'Purple and black cat hat',c:'crochet',p:'cat-hat'},
 {src:'images/checkerboard-hat-top.jpg',t:'Checkerboard hat from above',c:'crochet',p:'checkerboard-hat'}
];
const STAR_FILES=['black-yellow','blue-3d','blue-glitter-a','blue-glitter-b','blue-outlines','blue-small','brown-glitter','chrome-big','dark-small','denim-big','diamond','doing-my-best','glass-small','gold-glitter','green-lines','green-smiley','leopard-black','leopard-dark','navy-gold','navy-small','orange-sketch','pink-3d','pink-button','pink-fabric','pink-glitter','pink-glow','red-glitter','red-pink-glitter','starfish','tan-black','yellow-orange','yellow-small','zebra'];
const CR_PAGE=12; // how many pictures show before the "Load more" button
function creationsInit(){
 const board=$('#cr-board'),chips=$('#cr-chips'),box=$('#cr-box'),more=$('#cr-more');let filter='',list=[],cur=0,shown=CR_PAGE;
 const show=i=>{cur=(i+list.length)%list.length;const it=list[cur];$('#cr-img').src=it.src;$('#cr-img').alt=it.t||'A creation';const a=$('#cr-link');if(it.p&&PAT.some(x=>x.id==it.p)){a.hidden=false;a.href='#pattern-'+it.p}else a.hidden=true;$('#cr-prev').hidden=$('#cr-next').hidden=list.length<2;if(!box.open)box.showModal()};
 const sticker=(n)=>{const im=new Image(),k=STAR_FILES[(n*7+3)%STAR_FILES.length],pos=['tl','tr','br','bl'][(n*5+1)%4];im.src='images/stars/'+k+'.png';im.alt='';im.className='crs crs-'+pos;im.style.setProperty('--r',((n*37)%50-25)+'deg');im.setAttribute('aria-hidden','true');im.onload=()=>{im.style.width=Math.min(im.naturalWidth,n%3==0?72:58)+'px'};return im};
 let ncol=0;const draw=()=>{board.replaceChildren();ncol=Math.max(1,Math.min(5,Math.floor((board.clientWidth||900)/235)));const cols=Array.from({length:ncol},()=>{const d=document.createElement('div');d.className='cc';board.append(d);return d});list=CREATIONS.filter(x=>!filter||x.c==filter);list.slice(0,shown).forEach((it,i)=>{const f=document.createElement('figure');f.tabIndex=0;f.dataset.i=i;f.setAttribute('role','button');f.setAttribute('aria-label','View picture'+(it.t?': '+it.t:''));const im=new Image();im.src=it.src;im.alt=it.t||'A creation made by Moll';im.loading='lazy';f.append(im);if(i%4!=3)f.append(sticker(i));f.onclick=()=>show(i);f.onkeydown=e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();show(i)}};cols[i%ncol].append(f)});
  $('#cr-empty').hidden=list.length>0;more.hidden=shown>=list.length;more.textContent=`Load more pictures (${list.length-shown} left)`};
 chips.replaceChildren();[['','All'],['crochet','Crochet'],['knit','Knit']].forEach(([k,n])=>{if(k&&!CREATIONS.some(x=>x.c==k))return;const b=document.createElement('button');b.textContent=n;b.setAttribute('aria-pressed',k==filter);b.onclick=()=>{filter=k;shown=CR_PAGE;[...chips.children].forEach(x=>x.setAttribute('aria-pressed',x===b));draw()};chips.append(b)});
 more.onclick=()=>{const first=shown;shown+=CR_PAGE;draw();const f=[...board.querySelectorAll('figure')].sort((a,b)=>0);const t=[...board.querySelectorAll('figure')].find(x=>x.dataset.i==first);if(t)t.focus()};addEventListener('resize',()=>{if(!$('#creations').hidden){const n=Math.max(1,Math.min(5,Math.floor((board.clientWidth||900)/235)));if(n!==ncol)draw()}});
 $('#cr-x').onclick=()=>box.close();$('#cr-prev').onclick=()=>show(cur-1);$('#cr-next').onclick=()=>show(cur+1);
 box.addEventListener('click',e=>{if(e.target===box)box.close()});$('#cr-link').addEventListener('click',()=>box.close());
 box.addEventListener('keydown',e=>{if(e.key=='ArrowLeft')show(cur-1);if(e.key=='ArrowRight')show(cur+1)});
 draw()}
creationsInit();
/* Auto-add: any pictures saved in images/creations named 1, 2, 3... (jpg, jpeg, png or webp) are found and shown on the board, newest (highest number) first. */
let creationsScanP=null;
function creationsScan(){
 if(creationsScanP)return creationsScanP;
 return creationsScanP=(async()=>{
  const ex=['jpg','jpeg','png','webp','JPG','JPEG','PNG','WEBP'],probe=base=>new Promise(res=>{let done=0,hit='';ex.forEach(e=>{const im=new Image();im.onload=()=>{if(!hit)hit=base+'.'+e;if(++done==ex.length)res(hit)};im.onerror=()=>{if(++done==ex.length)res(hit)};im.src=base+'.'+e})});
  const found=[];let miss=0;for(let n=1;n<=300&&miss<4;n++){const f=await probe('images/creations/'+n);if(f){found.push(f);miss=0}else miss++}
  CREATIONS.unshift(...found.map(src=>({src,c:'',t:''})))
 })()
}
/* Every visit to the page shows the pictures in a new random order. */
var creationsReady=false;
async function creationsVisit(){
 if(!creationsReady)return; // the page was opened directly; the line at the bottom of this section runs it once everything has loaded
 const bd=$('#cr-board');bd.style.visibility='hidden';
 try{
  try{await creationsScan()}catch(e){}
  for(let i=CREATIONS.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[CREATIONS[i],CREATIONS[j]]=[CREATIONS[j],CREATIONS[i]]}
  creationsInit()
 }finally{bd.style.visibility=''}
}
creationsReady=true;if(location.hash=='#creations')creationsVisit();


/* ---------- beanie pattern generator ----------
   Based on Moll's "Classic Folded Cuff Beanie" (2x1 rib cuff, stockinette body, six-section crown).
   All numbers come from beanieCalc() below: plain maths and written templates, no AI.
   Sizes, yarns and heights are in BEANIE_SIZES and BEANIE_YARNS if you want to change them.
   The photo is images/classic-beanie.png (also stored as text in images/beanie-photo.js). */
var BEANIE_SIZES={s:{n:'Small',head:52,body:[6,7],len:17},m:{n:'Medium',head:55,body:[6,8],len:18},l:{n:'Large',head:58,body:[7,9],len:19},xl:{n:'X-Large',head:61,body:[8,10],len:20}};
var BEANIE_YARNS=[ // typical stockinette gauge per 10 cm. Always check the ball band and knit a swatch.
 {id:'fing-merino',n:'Merino fingering / 4-ply',w:'Fingering',gs:28,gr:38,nd:'2.5-3.25 mm'},
 {id:'fing-sock',n:'Sock yarn (wool and nylon)',w:'Fingering',gs:30,gr:40,nd:'2.5-3 mm'},
 {id:'sport-wool',n:'Wool sport / 5-ply',w:'Sport',gs:24,gr:32,nd:'3.5-3.75 mm'},
 {id:'dk-merino',n:'Merino DK',w:'DK',gs:23,gr:31,nd:'3.75 mm'},
 {id:'dk-cotton',n:'Cotton DK',w:'DK',gs:21,gr:28,nd:'3.75-4.5 mm'},
 {id:'dk-acrylic',n:'Acrylic DK',w:'DK',gs:22,gr:30,nd:'3.75-4.5 mm'},
 {id:'wor-wool',n:'Wool worsted',w:'Worsted',gs:18,gr:24,nd:'4.5-5.5 mm'},
 {id:'wor-merino',n:'Merino worsted',w:'Worsted',gs:19,gr:26,nd:'4.5-5 mm'},
 {id:'wor-acrylic',n:'Acrylic worsted',w:'Worsted',gs:18,gr:24,nd:'4.5-5.5 mm'},
 {id:'wor-cotton',n:'Cotton worsted',w:'Worsted',gs:18,gr:24,nd:'4.5-5.5 mm'},
 {id:'aran-alpaca',n:'Alpaca blend aran',w:'Aran',gs:17,gr:22,nd:'5-5.5 mm'},
 {id:'chunky-wool',n:'Chunky wool',w:'Chunky',gs:13,gr:18,nd:'6-8 mm'},
 {id:'chunky-acrylic',n:'Chunky acrylic',w:'Chunky',gs:13,gr:17,nd:'6-8 mm'},
 {id:'super-chunky',n:'Super chunky wool',w:'Super chunky',gs:9,gr:12,nd:'8-12 mm'}];
var BEANIE_OPT={crown:{t:'Crown',o:{'1':['Quick crown','Two stitches lost per section, short crown'],'2':['Gradual crown','One stitch lost per section, longer crown']}},size:{t:'Size',o:{s:['Small','52 cm head'],m:['Medium','55 cm head'],l:['Large','58 cm head'],xl:['X-Large','61 cm head']}}};
var BEANIE_ORIG={'1':'#d9d9d9','2':'#d9d9d9'}; // roughly the blue of the photo, shown in the colour picker until you change it
var BEANIE_DEF={crown:'1',size:'m',color:'',yarn:'dk-merino',gs:23,gr:31,u:'cm'};
var beanieS=Object.assign({},BEANIE_DEF),beanieStep=1,beanieReady=false,beanieImgs={};

function beanieCalc(o){
 const z=BEANIE_SIZES[o.size],k=o.u=='in'?10.16:10,spc=o.gs/k,rpc=o.gr/k,circ=z.head*0.76,c2=o.crown=='2'; // the rib stretches, so the hat is much smaller than the head
 const mult=c2?6:12,sts=Math.max(48,Math.round(circ*spc/mult)*mult),sec=sts/6,rounds=[];let r=1,left=sts,n=sec;
 if(c2){const decN=Math.max(1,sec-2),plainN=Math.round(decN*7/15); // 7 of the 15 decrease rounds (Medium) are followed by a plain round
  for(let i=0;i<decN;i++){left-=6;rounds.push({r,n,sts:left,dec:true});r++;n--;if(i<plainN){rounds.push({r,plain:true});r++}}}
 else{const D=sts/12-1;for(let i=0;i<D;i++){left-=12;rounds.push({r,n:i+1,sts:left,dec:true});r++}}
 const crownRounds=c2?r:2*(sts/12-1)-1,cuffCm=16,foldCm=8,bodyLo=z.body[0],bodyHi=z.body[1],bodyCm=(bodyLo+bodyHi)/2,bodyTxt=`${bodyLo}-${bodyHi} cm`;
 const crownCm=crownRounds/rpc,finishedCirc=Math.round(sts/spc*10)/10,height=Math.round(foldCm+bodyCm+crownCm);
 const area=finishedCirc*(cuffCm+bodyCm)+.5*finishedCirc*crownCm,metres=Math.ceil(area*rpc*5.8*1.1/100/10)*10,yards=Math.ceil(metres*1.0936/10)*10;
 return{z,spc,rpc,sts,sec,rounds,c2,crownRounds,cuffCm,foldCm,bodyCm,bodyTxt,finishedCirc,height,metres,yards,cuffRounds:Math.round(cuffCm*rpc),bodyRounds:Math.round(bodyCm*rpc),finalRound:r}}

function beanieDoc(o){
 const c=beanieCalc(o),y=BEANIE_YARNS.find(x=>x.id==o.yarn),custom=!y||o.yarn=='custom',u=o.u=='in'?'4 in (10 cm)':'10 cm',yn=custom?'Your own yarn':y.n;
 const nb=custom?null:parseFloat(y.nd),bodyN=nb?`${nb} mm`:'the size that gives you your gauge',cuffN=nb?`${Math.round((nb-.5)*100)/100} mm`:'0.5 mm smaller than the body needle';
 const secs=[];
 secs.push({t:'About this pattern',l:[`Classic Folded Cuff Beanie, ${c.z.n.toLowerCase()} size, with ${c.c2?'a gradual, longer crown (one decrease in each section every round or every other round)':'a quick crown (two stitches lost in each section on every decrease round)'}. Knitted in the round, bottom up. Cuff: 2x1 rib. Body: stockinette stitch. Crown: six-section symmetrical decreases using alternating SSK and K2tog.`]});
 secs.push({t:'1. Materials',ul:[`${yn}, about ${c.metres} m (${c.yards} yd). This is an estimate, so buy a little extra.`,`${cuffN} circular needles (40 cm) for the cuff`,`${bodyN} circular needles (40 cm) for the body`,`${bodyN} double-pointed needles, or a long circular needle for magic loop, for the crown`,'6 stitch markers','Tapestry needle']});
 secs.push({t:'2. Finished measurements',ul:[`Head circumference: ${c.z.head-1}-${c.z.head+1} cm (the hat stretches to fit; unstretched it is about ${c.finishedCirc} cm round)`,`Ribbed cuff: ${c.foldCm} cm when folded (${c.cuffCm} cm as knitted)`,`Stockinette body: ${c.bodyTxt} before the crown decreases start`,`Total height: about ${c.height} cm`]});
 secs.push({t:'3. Tension (gauge)',l:[`${o.gs} stitches and ${o.gr} rounds = ${u} in stockinette stitch in the round${nb?', using '+bodyN+' needles':''}.`,'Check your tension before starting. The finished circumference will depend on your actual gauge.']});
 secs.push({t:'4. Abbreviations',ul:['CO: cast on','K: knit','P: purl','K2tog: knit two together','SSK: slip, slip, knit','BOR: beginning of round','SM: slip marker','St(s): stitch(es)']});
 secs.push({t:'Step 1: Ribbed folded cuff',l:[`Using ${cuffN} circular needles:`,`Cast on ${c.sts} stitches.`,'Join in the round, taking care not to twist the stitches. Place a marker for BOR.','Work 2x1 ribbing.','Every round: *K2, P1*, repeat to end.',`Continue until the ribbing measures ${c.cuffCm} cm (about ${c.cuffRounds} rounds).`,`This creates an ${c.foldCm} cm folded cuff with double thickness.`]});
 secs.push({t:'Step 2: Stockinette body',l:[`Change to ${bodyN} circular needles.`,'Knit every round.',`Continue until the stockinette body measures ${c.bodyTxt} from the fold line of the cuff (the top of the ribbing), about ${c.bodyRounds} rounds. Stop sooner for a snug, shorter hat or go longer for a slouchier one.`]});
 secs.push({t:'Step 3: Six-section crown',l:[`The crown is worked in six equal sections of ${c.sec} stitches each.`,`Place six markers evenly around the round, dividing the ${c.sts} stitches into six sections. The BOR marker counts as one of them.`,'The crown uses alternating SSK and K2tog decreases to create six symmetrical sections.']});
 if(!c.c2){
  secs.push({t:'Decrease round',l:['Work the following sequence in each section.'],ul:['Section A: SSK. Knit until 2 stitches remain before the next marker. K2tog.','Section B: K2tog. Knit until 2 stitches remain before the next marker. SSK.','Continue alternating Sections A and B around the entire round.','Each section loses 2 stitches, giving 12 decreases per decrease round.']});
  secs.push({t:'Plain round',l:['Knit every stitch, slipping markers as you reach them.',`Repeat one decrease round followed by one plain knit round until 12 stitches remain (${c.rounds.length} decrease rounds in all; there is no plain round after the last one).`]});
  secs.push({t:'Decrease progression',ul:[`Start: ${c.sts} stitches`,...c.rounds.map((x,i)=>`Decrease round ${i+1}: ${x.sts} stitches remaining`)]});
  secs.push({t:'Step 4: Close the crown',ol:['When 12 stitches remain, knit 2 together around, leaving 6 stitches.','Cut the yarn, leaving about 20 cm.','Thread the yarn through the remaining stitches.','Pull firmly to close the crown.','Secure the yarn on the inside.']})}
 else{
  const A=n=>n-3>0?`K${n-3}, SSK, K1`:'SSK, K1',B=n=>n-3>0?`K${n-3}, K2tog, K1`:'K2tog, K1',lines=['Alternate SSK and K2tog decreases around the hat, leaving one knitted stitch after each decrease. Sections 1, 3 and 5 use SSK, and sections 2, 4 and 6 use K2tog.'];let noPlain=false;
  c.rounds.forEach((x,i)=>{if(x.dec){if(!noPlain&&i>0&&!c.rounds.slice(i+1).some(y=>y.plain)){noPlain=true;lines.push('From this point, work decrease rounds without plain rounds between them.')}
   lines.push(`Round ${x.r}: *${A(x.n)}; ${B(x.n)}; repeat from * twice more. (${x.sts} stitches remain)`)}else lines.push(`Round ${x.r}: Knit all stitches.`)});
  secs.push({t:'Decrease rounds',ul:lines});
  secs.push({t:'Step 4: Final round',ol:[`Round ${c.finalRound}: Work six decreases around the hat, alternating SSK and K2tog (*SSK; K2tog; repeat from * twice more). 6 stitches remain.`,'Cut the yarn, leaving a tail of about 20 cm.','Thread the yarn through the remaining six stitches and pull firmly to close the crown.','Secure the yarn on the inside.']})}
 secs.push({t:'Step 5: Finishing',ul:['Weave in all loose ends.',`Fold the ribbed cuff upwards by ${c.foldCm} cm.`,'Arrange the fold evenly around the hat.','Lightly shape the crown and block if necessary, following the yarn manufacturer’s instructions.']});
 secs.push({t:'Finished design',ul:['Deep folded 2x1 rib cuff.','Dense, smooth stockinette body.','Six-section crown with alternating SSK and K2tog decreases meeting neatly at the top.','Clean, classic beanie silhouette without a pom-pom.']});
 return{title:`Classic Folded Cuff Beanie (${c.z.n})`,secs,c}}

function beanieHat(o,px){ // the photo for the chosen style, tinted with the chosen colour (null until the picture has loaded)
 const img=beanieImgs[o.crown||'1'];if(!img||!img.complete||!img.naturalWidth)return null;
 const w=px,h=Math.round(px*img.naturalHeight/img.naturalWidth),cv=document.createElement('canvas');cv.width=w;cv.height=h;const cx=cv.getContext('2d');cx.drawImage(img,0,0,w,h);
 if(o.color){cx.globalCompositeOperation='multiply';cx.fillStyle=o.color;cx.fillRect(0,0,w,h);cx.globalCompositeOperation='destination-in';cx.drawImage(img,0,0,w,h)} // tint, then put the see-through background back
 return cv}

function beanieQuery(){const o=beanieS;return new URLSearchParams({crown:o.crown,size:o.size,...(o.color?{color:o.color}:{}),yarn:o.yarn,gs:o.gs,gr:o.gr,u:o.u,step:beanieStep}).toString()}
function beanieSync(){try{history.replaceState(null,'','#beanie?'+beanieQuery())}catch(e){}}
function beanieRead(){
 const q=new URLSearchParams((location.hash.split('?')[1]||'')),o=beanieS=Object.assign({},BEANIE_DEF),pick=(k,m)=>{const v=q.get(k);if(v&&m[v])o[k]=v};
 pick('crown',BEANIE_OPT.crown.o);pick('size',BEANIE_SIZES);
 const c=q.get('color');if(c&&/^#[0-9a-f]{6}$/i.test(c))o.color=c;
 const yid=q.get('yarn');if(yid&&(yid=='custom'||BEANIE_YARNS.some(y=>y.id==yid)))o.yarn=yid;
 const y=BEANIE_YARNS.find(v=>v.id==o.yarn);if(y){o.gs=y.gs;o.gr=y.gr}
 const gs=parseFloat(q.get('gs')),gr=parseFloat(q.get('gr'));if(gs>=5&&gs<=60)o.gs=gs;if(gr>=5&&gr<=80)o.gr=gr;
 if(q.get('u')=='in')o.u='in';
 const s=parseInt(q.get('step'));beanieStep=s>=1&&s<=3?s:1}

function beanieDraw(){
 const o=beanieS,pv=$('#b-prev');pv.replaceChildren();const hc=beanieHat(o,520);if(hc){hc.style.cssText='width:100%;max-width:380px;height:auto;display:block;filter:drop-shadow(0 6px 6px rgba(0,0,0,.25))';hc.setAttribute('aria-hidden','true');pv.append(hc)}
 $$('#b-opts button[data-k]').forEach(b=>b.setAttribute('aria-pressed',beanieS[b.dataset.k]==b.dataset.v));
 $('#b-col').value=o.color||BEANIE_ORIG[o.crown];
 $$('#b-yarns button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.id==o.yarn));
 const gs=$('#b-gs'),gr=$('#b-gr');if(document.activeElement!=gs)gs.value=o.gs;if(document.activeElement!=gr)gr.value=o.gr;$('#b-u').value=o.u;
 const y=BEANIE_YARNS.find(v=>v.id==o.yarn);
 $('#b-gsum').textContent=`${y?y.n+': ':'Custom gauge: '}${o.gs} stitches and ${o.gr} rows over ${o.u=='in'?'4 inches':'10 cm'}.${y?' Recommended needles: '+y.nd+'.':''}`;
 $$('#beanie .bp').forEach((p,i)=>p.hidden=i+1!=beanieStep);
 $$('#b-steps button').forEach(b=>b.setAttribute('aria-current',+b.dataset.s==beanieStep));
 $('#b-back').hidden=beanieStep==1;$('#b-next').hidden=beanieStep==3;
 if(beanieStep==3)beanieOut();
 beanieSync()}

function beanieOut(){
 const d=beanieDoc(beanieS),out=$('#b-out');out.replaceChildren();
 const wrap=document.createElement('div');wrap.style.cssText='display:flex;gap:1.2rem;flex-wrap:wrap;align-items:flex-start';
 const pv=document.createElement('div');pv.style.cssText='flex:0 0 200px;max-width:100%';{const hc=beanieHat(beanieS,420);if(hc){hc.style.cssText='width:100%;height:auto;filter:drop-shadow(0 4px 4px rgba(0,0,0,.25))';pv.append(hc)}}
 const h=document.createElement('h2');h.textContent=d.title;const hd=document.createElement('div');hd.style.cssText='flex:1 1 260px';hd.append(h);wrap.append(pv,hd);out.append(wrap);
 d.secs.forEach(s=>{const h3=document.createElement('h3');h3.textContent=s.t;hd.append(h3);
  (s.l||[]).forEach(t=>{const p=document.createElement('p');p.textContent=t;p.style.margin='.2rem 0';hd.append(p)});
  ['ul','ol'].forEach(k=>{if(s[k]){const e=document.createElement(k);s[k].forEach(t=>{const li=document.createElement('li');li.textContent=t;e.append(li)});hd.append(e)}})});
 const w=document.createElement('p');w.className='bwarn';w.textContent='The numbers are worked out by the maths in this page, but please knit a gauge swatch first and check the pattern on a small test hat before you share it. Yarn amount is an estimate.';out.append(w)}

function beanieWrap(ctx,text,maxW){const words=String(text).split(/\s+/),lines=[];let cur='';words.forEach(w=>{const t=cur?cur+' '+w:w;if(ctx.measureText(t).width>maxW&&cur){lines.push(cur);cur=w}else cur=t});if(cur)lines.push(cur);return lines}
async function beanieBuildPdf(){
 const d=beanieDoc(beanieS),W=1110,H=1560,M=70,body='"Fredoka","Baloo 2",system-ui,sans-serif',pages=[];let cv,cx,y;
 try{await document.fonts.ready}catch(e){}
 const hat=beanieHat(beanieS,800);
 const newPage=()=>{cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');cx.fillStyle='#fffdf7';cx.fillRect(0,0,W,H);cx.strokeStyle='#1b1022';cx.lineWidth=5;cx.strokeRect(24,24,W-48,H-48);cx.textBaseline='alphabetic';y=M+20;pages.push({canvas:cv,links:[]})};
 const foot=()=>{cx.font='500 22px '+body;cx.fillStyle='#5d4a68';cx.textAlign='center';cx.fillText('Moll’s Studio · '+PATTERN_SITE_URL.replace(/^file:.*/,'molls-studio').replace(/^https?:\/\//,''),W/2,H-48);cx.textAlign='left';
  pages[pages.length-1].links.push({x1:W/2-260,x2:W/2+260,y1:H-76,y2:H-40,url:PATTERN_SITE_URL})};
 const need=h=>{if(y+h>H-M-30){foot();newPage()}};
 const text=(t,size,weight,color,gap,indent=0,heading=false)=>{cx.font=`${weight} ${size}px ${heading?'"Baloo 2","Fredoka",system-ui,sans-serif':body}`;cx.fillStyle=color;beanieWrap(cx,t,W-2*M-indent).forEach(l=>{need(size*1.4);y+=size*1.2;cx.fillText(l,M+indent,y);y+=size*.25});y+=gap};
 newPage();
 cx.fillStyle='#ff9bd0';cx.fillRect(24,24,W-48,300);cx.strokeRect(24,24,W-48,300);
 cx.font='800 66px "Baloo 2","Fredoka",system-ui,sans-serif';cx.fillStyle='#1b1022';beanieWrap(cx,d.title,W-2*M-300).forEach((l,i)=>cx.fillText(l,M,130+i*72));
 cx.font='500 28px '+body;cx.fillText(`Knit in the round · ${d.c.sts} stitches to cast on`,M,260);
 if(hat){const hh=250,hw=Math.round(hh*hat.width/hat.height);cx.drawImage(hat,W-M-hw,40,hw,hh)}
 y=350;
 d.secs.forEach(s=>{
  need(70);text(s.t,38,800,'#ff3fa4',4,0,true);
  (s.l||[]).forEach(t=>text(t,27,400,'#1b1022',8));
  ['ul','ol'].forEach(k=>{(s[k]||[]).forEach((t,i)=>text((k=='ol'?`${i+1}.  `:'•  ')+t,27,400,'#1b1022',8,k=='ol'?0:10))});y+=12});
 y+=10;need(90);cx.font='500 22px '+body;cx.fillStyle='#5d4a68';beanieWrap(cx,'Please knit a gauge swatch first. Yarn amount is an estimate, so buy a little extra.',W-2*M).forEach(l=>{y+=28;cx.fillText(l,M,y)});
 foot();
 return pages}
async function beaniePdf(){
 const m=$('#b-msg');m.textContent='Preparing your PDF…';
 try{const pages=await beanieBuildPdf(),blob=await pdfFromPages(pages),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='moll-s-studio-beanie.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);m.textContent='Your PDF has been downloaded.'}
 catch(e){m.textContent='Sorry, the PDF could not be made: '+e.message}}

function beanieYarns(){
 const q=$('#b-q').value.trim().toLowerCase(),box=$('#b-yarns');box.replaceChildren();
 const list=BEANIE_YARNS.filter(y=>!q||(y.n+' '+y.w+' '+y.nd).toLowerCase().includes(q));
 list.forEach(y=>{const b=document.createElement('button');b.dataset.id=y.id;b.setAttribute('aria-pressed',beanieS.yarn==y.id);b.innerHTML='<span></span><small></small>';b.firstChild.textContent=y.n;b.lastChild.textContent=`${y.w} · ${y.gs} sts and ${y.gr} rows · ${y.nd}`;
  b.onclick=()=>{beanieS.yarn=y.id;beanieS.gs=y.gs;beanieS.gr=y.gr;beanieS.u='cm';beanieDraw()};box.append(b)});
 if(!list.length){const p=document.createElement('p');p.className='meta';p.textContent='No yarns match that. Enter your own gauge below instead.';box.append(p)}}

function beanieInit(){
 const opts=$('#b-opts');
 Object.keys(BEANIE_OPT).forEach(k=>{const h=document.createElement('h3');h.textContent=BEANIE_OPT[k].t;const g=document.createElement('div');g.className='bo';g.setAttribute('role','group');g.setAttribute('aria-label',BEANIE_OPT[k].t);
  Object.entries(BEANIE_OPT[k].o).forEach(([v,[n,s]])=>{const b=document.createElement('button');b.dataset.k=k;b.dataset.v=v;b.innerHTML='<span></span><small></small>';b.firstChild.textContent=n;b.lastChild.textContent=s;b.onclick=()=>{beanieS[k]=v;beanieDraw()};g.append(b)});opts.append(h,g)});
 const h=document.createElement('h3');h.textContent='Colour';const lab=document.createElement('label');lab.className='bl';lab.textContent='Pick a colour for the preview ';const ci=document.createElement('input');ci.type='color';ci.id='b-col';ci.oninput=()=>{beanieS.color=ci.value;beanieDraw()};lab.append(ci);const rb=document.createElement('button');rb.textContent='Use the photo’s original colour';rb.style.marginTop='.6rem';rb.onclick=()=>{beanieS.color='';beanieDraw()};opts.append(h,lab,rb);
 $('#b-q').oninput=beanieYarns;
 const custom=()=>{const s=parseFloat($('#b-gs').value),r=parseFloat($('#b-gr').value);if(s>=5&&s<=60)beanieS.gs=s;if(r>=5&&r<=80)beanieS.gr=r;beanieS.yarn='custom';beanieDraw()};
 $('#b-gs').oninput=custom;$('#b-gr').oninput=custom;
 $('#b-u').onchange=()=>{const to=$('#b-u').value;if(to!=beanieS.u){const f=to=='in'?10.16/10:10/10.16;beanieS.gs=Math.round(beanieS.gs*f*10)/10;beanieS.gr=Math.round(beanieS.gr*f*10)/10;beanieS.u=to;beanieDraw()}};
 $$('#b-steps button').forEach(b=>b.onclick=()=>{beanieStep=+b.dataset.s;beanieDraw();scrollTo(0,0)});
 $('#b-back').onclick=()=>{beanieStep=Math.max(1,beanieStep-1);beanieDraw();scrollTo(0,0)};
 $('#b-next').onclick=()=>{beanieStep=Math.min(3,beanieStep+1);beanieDraw();scrollTo(0,0)};
 $('#b-pdf').onclick=beaniePdf;
 $('#b-cost').onclick=()=>{const d=beanieDoc(beanieS);location.hash='#costs?'+new URLSearchParams({name:d.title,yarn:d.c.metres}).toString()};
 $('#b-link').onclick=async()=>{const m=$('#b-msg');beanieSync();try{await navigator.clipboard.writeText(location.href);m.textContent='Link copied. Anyone who opens it sees your design.'}catch(e){m.textContent='Copying didn’t work here. Copy the address from your browser instead.'}};
 beanieYarns();beanieReady=true;[['1',typeof BEANIE_PHOTO=='string'&&BEANIE_PHOTO],['2',typeof BEANIE_PHOTO2=='string'&&BEANIE_PHOTO2]].forEach(([k,src])=>{if(!src)return;const im=new Image();im.onload=()=>{if(location.hash.startsWith('#beanie'))beanieDraw()};im.src=src;beanieImgs[k]=im})}
function beanieShow(){if(!beanieReady)return;beanieRead();beanieYarns();beanieDraw()}
beanieInit();if(location.hash.startsWith('#beanie'))beanieShow();

/* ---------- materials cost calculator ----------
   Everything is calculated in costsCalc(). Entries are remembered in this browser only. */
var costsReady=false,costsS={name:'',qty:1,cur:'£',extra:10,other:'',rows:[],pid:''};
var COSTS_UNITS={m:'metres',yd:'yards',g:'grams',cm:'cm',pcs:'pieces'},COSTS_EXTRA={m:1,yd:1,g:1,cm:1};
var COSTS_PRESETS=[['Yarn',{n:'Yarn',u:'m',k:'yarn'}],['Needles or hook',{n:'Needles or hook',u:'pcs',q:'1',ps:'1'}],['Buttons',{n:'Buttons',u:'pcs'}],['Zip',{n:'Zip',u:'pcs',q:'1',ps:'1'}],['Fabric or lining',{n:'Fabric or lining',u:'cm'}],['Stitch markers',{n:'Stitch markers',u:'pcs'}],['Other',{n:'',u:'pcs'}]];
function costsCalc(S0){
 const S=S0||costsS,qty=Math.max(1,parseFloat(S.qty)||1),ex=Math.max(0,parseFloat(S.extra)||0),out=[];let total=0;
 S.rows.forEach(r=>{const per=parseFloat(r.q),ps=parseFloat(r.ps),pr=parseFloat(r.pr)||0,have=parseFloat(r.have)||0;
  if(!(per>0)){out.push({r,state:'empty'});return}
  const need=Math.round(per*qty*(COSTS_EXTRA[r.u]?1+ex/100:1)*1000)/1000,short=Math.max(0,need-have);
  if(!(ps>0)){out.push({r,need,state:'nopack'});return}
  const packs=Math.ceil(short/ps-1e-9),cost=Math.round(packs*pr*100)/100,left=Math.round((packs*ps+have-need)*1000)/1000;total+=cost;
  out.push({r,need,packs,cost,left,state:packs?'buy':'enough'})});
 const other=parseFloat(S.other)||0,grand=Math.round((total+other)*100)/100;
 return{out,total:Math.round(total*100)/100,other,grand,qty,perGarment:Math.round(grand/qty*100)/100}}
function costsFmt(n){return Number.isInteger(n)?String(n):String(Math.round(n*100)/100)}
function costsUnit(r){return r.u=='pcs'?'pcs':r.u}
function costsRender(save){
 const S=costsS,cur=S.cur,m=v=>cur+(Math.round(v*100)/100).toFixed(2),calc=costsCalc(),list=$('#c-list');
 if(list.dataset.v!=String(S.rows.length)||list.children.length!=S.rows.length){list.replaceChildren();
  S.rows.forEach((r,i)=>{const row=document.createElement('div');row.className='cr';
   const mk=(label,el,cls)=>{const l=document.createElement('label');if(cls)l.className=cls;l.append(label,el);return l};
   const inp=(k,type,ph)=>{const e=document.createElement('input');e.type=type;if(type=='number'){e.min='0';e.step='any';e.inputMode='decimal'}if(ph)e.placeholder=ph;e.value=r[k]||'';e.oninput=()=>{r[k]=e.value;costsRender(true)};return e};
   const sel=document.createElement('select');Object.entries(COSTS_UNITS).forEach(([v,n])=>{const o=document.createElement('option');o.value=v;o.textContent=n;sel.append(o)});sel.value=r.u;sel.onchange=()=>{r.u=sel.value;costsRender(true)};
   const need=document.createElement('span');need.className='two';need.append(inp('q','number','0'),sel);
   const pack=document.createElement('span');pack.className='two';pack.append(inp('ps','number','e.g. 200'));const pu=document.createElement('b');pu.className='cu';pack.append(pu);
   const nm=inp('n','text','Material');nm.setAttribute('aria-label','Material name');
   const x=document.createElement('button');x.textContent='Remove';x.setAttribute('aria-label','Remove '+(r.n||'material'));x.onclick=()=>{S.rows.splice(i,1);list.dataset.v='';costsRender(true)};
   const res=document.createElement('div');res.className='res';res.setAttribute('role','status');
   const pl=mk('Price per pack',inp('pr','number','0.00'));pl.className='pp';
   row.append(mk('Material',nm,'nm'),mk('Needed for one garment',need),mk('One pack contains',pack),pl,mk('Already have',inp('have','number','0')),x,res);list.append(row)});
  list.dataset.v=String(S.rows.length)}
 [...list.children].forEach((row,i)=>{const r=S.rows[i],o=calc.out[i],u=costsUnit(r),res=row.querySelector('.res');
  row.querySelectorAll('.cu').forEach(e=>e.textContent=u);row.querySelector('.pp').firstChild.textContent='Price per pack ('+cur+')';
  res.replaceChildren();const b=document.createElement('span'),sm=document.createElement('small');
  if(o.state=='empty')b.textContent='Enter how much one garment needs.';
  else if(o.state=='nopack')b.textContent='Enter what one pack contains to see how many to buy.';
  else if(o.state=='enough')b.textContent='You already have enough.';
  else b.textContent=`Buy ${o.packs} × ${costsFmt(parseFloat(r.ps))} ${u} = ${m(o.cost)}`;
  if(r.note)b.title=r.note;if(o.need!=null)sm.textContent=`Total needed: ${costsFmt(o.need)} ${u}${COSTS_EXTRA[r.u]&&parseFloat(S.extra)>0?' (including '+costsFmt(parseFloat(S.extra))+'% extra)':''}${o.state=='buy'||o.state=='enough'?'. Left over: '+costsFmt(Math.max(0,o.left))+' '+u:''}`;
  res.append(b,sm);if(r.note){const nt=document.createElement('small');nt.textContent='From the pattern: '+r.note;res.append(nt)}});
 $('#c-total').textContent=calc.out.some(o=>o.state=='buy')||calc.other>0?`To buy: ${m(calc.grand)}`:'Add your materials above to see the cost.';
 $('#c-per').textContent=calc.grand>0&&calc.qty>1?`That is ${m(calc.perGarment)} per garment for ${calc.qty} garments.`:calc.grand>0?'For one garment.':'';
 const shop=$('#c-shop');shop.replaceChildren();const buy=calc.out.filter(o=>o.state=='buy');
 if(buy.length){const h=document.createElement('h3');h.textContent='Shopping list';h.style.margin='1rem 0 0';const ul=document.createElement('ul');buy.forEach(o=>{const li=document.createElement('li');li.textContent=`${o.r.n||'Material'}: ${o.packs} × ${costsFmt(parseFloat(o.r.ps))} ${costsUnit(o.r)} (${m(o.cost)})`;ul.append(li)});shop.append(h,ul)}
 if(save)try{localStorage.setItem('ms-costs',JSON.stringify(S));costsPatSave(calc)}catch(e){}}
function costsPatSave(calc){ // remember the cost for the pattern the materials came from, so the pattern page can show it
 if(!costsS.pid)return;const buy=calc.out.filter(o=>o.state=='buy');if(!buy.length)return;
 const v=JSON.parse(localStorage.getItem('ms-patcost')||'{}');v[costsS.pid]={name:costsS.name||'My project',cur:costsS.cur,qty:calc.qty,grand:calc.grand,per:calc.perGarment,items:buy.map(o=>({n:o.r.n||'Material',txt:`${o.packs} × ${costsFmt(parseFloat(o.r.ps))} ${costsUnit(o.r)}`,cost:o.cost})),state:JSON.parse(JSON.stringify(costsS))};localStorage.setItem('ms-patcost',JSON.stringify(v))}
function costsText(){const calc=costsCalc(),m=v=>costsS.cur+v.toFixed(2),buy=calc.out.filter(o=>o.state=='buy');if(!buy.length)return '';
 return [`Shopping list${costsS.name?': '+costsS.name:''}${calc.qty>1?' ('+calc.qty+' garments)':''}`,...buy.map(o=>`- ${o.r.n||'Material'}: ${o.packs} × ${costsFmt(parseFloat(o.r.ps))} ${costsUnit(o.r)} (${m(o.cost)})`),...(calc.other>0?[`- Other costs: ${m(calc.other)}`]:[]),`Total: ${m(calc.grand)}`].join('\n')}
function costsDefaults(){return[{n:'Yarn',u:'m',q:'',ps:'',pr:'',have:''},{n:'Needles or hook',u:'pcs',q:'1',ps:'1',pr:'',have:''}]}
function costsLoad(){try{const v=JSON.parse(localStorage.getItem('ms-costs')||'null');if(v&&Array.isArray(v.rows))costsS=Object.assign(costsS,v)}catch(e){}
 if(!costsS.rows.length)costsS.rows=costsDefaults()}
function costsSync(){$('#c-name').value=costsS.name||'';$('#c-qty').value=costsS.qty;$('#c-cur').value=costsS.cur;$('#c-extra').value=costsS.extra;$('#c-other').value=costsS.other||''}
function costsShow(){if(!costsReady)return;
 const q=new URLSearchParams(location.hash.split('?')[1]||'');
 if(q.has('pattern')){const id=q.get('pattern'),rec=patCostRec(id);if(rec&&rec.state){costsS=Object.assign({name:'',qty:1,cur:'£',extra:10,other:'',rows:[],pid:''},rec.state,{pid:id})}else{costsS=Object.assign({},costsS,{name:'',qty:1,other:'',rows:[],pid:id});costsAddPattern(id)}$('#c-skein').value=costsSkein()||'';try{history.replaceState(null,'','#costs')}catch(e){}costsSLload();costsSLrender();$('#c-patmsg').textContent=rec&&rec.state?'Opened your saved prices for this pattern.':$('#c-patmsg').textContent}
 else if(q.has('yarn')){const y=parseFloat(q.get('yarn')),rows=costsDefaults();rows[0].q=y>0?String(y):'';costsS=Object.assign({},costsS,{name:(q.get('name')||'').slice(0,60),qty:1,other:'',rows,pid:''});try{history.replaceState(null,'','#costs')}catch(e){}}
 costsSync();costsSLload();costsSLrender();$('#c-list').dataset.v='';costsRender(true)}
function costsInit(){
 costsLoad();
 $('#c-skein').value=costsSkein()||'';
 $('#c-skein').addEventListener('input',()=>{const v=$('#c-skein').value;try{localStorage.setItem('ms-skein',v)}catch(e){}costsS.rows.forEach(r=>{if(r.k=='yarn')r.pr=v});$('#c-list').dataset.v='';costsRender(true)});
 const P=$('#c-presets');COSTS_PRESETS.forEach(([n,v])=>{const b=document.createElement('button');b.textContent='+ '+n;b.onclick=()=>{if(costsS.rows.length>=30)return;costsS.rows.push(Object.assign({n:'',u:'pcs',q:'',ps:'',pr:'',have:''},v));$('#c-list').dataset.v='';costsRender(true)};P.append(b)});
 [['c-name','name'],['c-qty','qty'],['c-cur','cur'],['c-extra','extra'],['c-other','other']].forEach(([id,k])=>{const e=$('#'+id);const f=()=>{costsS[k]=e.value;costsRender(true)};e.addEventListener('input',f);e.addEventListener('change',f)});
 $('#c-copy').onclick=async()=>{const m=$('#c-msg'),t=costsText();if(!t){m.textContent='Nothing to buy yet.';return}try{await navigator.clipboard.writeText(t);m.textContent='Copied. Paste it into your notes.'}catch(e){m.textContent='Copying didn’t work here. Select the shopping list and copy it by hand.'}};
 $('#c-clear').onclick=()=>{costsS={name:'',qty:1,cur:costsS.cur,extra:10,other:'',rows:costsDefaults()};costsSync();$('#c-list').dataset.v='';costsRender(true);$('#c-msg').textContent='Cleared.'};
 costsSync();costsRender(false);costsReady=true;if(location.hash.startsWith('#costs'))costsShow()}
/* leaving the Materials cost calculator wipes it, so it is fresh next time */
function costsReset(){if(!costsReady)return;try{localStorage.removeItem('ms-costs')}catch(e){}
 try{localStorage.removeItem('ms-shoplist')}catch(e){}costsSL=[];costsSLsaved='';if(typeof costsSLrender=='function'&&$('#c-sl'))costsSLrender();
 costsS={name:'',qty:1,cur:'£',extra:10,other:'',rows:costsDefaults(),pid:''};costsSync();$('#c-skein').value=costsSkein()||'';$('#c-list').dataset.v='';costsRender(true);const m=$('#c-msg');if(m)m.textContent='';const pm=$('#c-patmsg');if(pm)pm.textContent=''}
costsInit();

/* ---------- tools pages: All tools, or one group (Patterns, Charts, Calculators, Trackers) from the Tools menu ---------- */
function toolsPage(h){
 if(typeof TOOL_GROUPS!='function'||!$('#tp-nav'))return; // the page is still loading: this runs again once the lists below exist
 const g=(h||'').replace(/^tools-/,''),groups=TOOL_GROUPS(),one=groups.find(x=>x[0]==g),box=$('#tp-list');
 $('#alltools>h1').textContent=one?TOOL_GROUP_NAMES[g]+' ✦':'Tools ✦';
 if(!$('#alltools').hidden)$('#infs').textContent=one?TOOL_GROUP_NAMES[g]:'All tools';
 $('#alltools>p.lead').textContent=one?one[2]:'Everything you can use to design, plan and price your makes, all in one place.';
 // buttons to hop between the groups
 const nav=$('#tp-nav');nav.replaceChildren();
 [['','All tools'],...groups.map(x=>[x[0],x[1]])].forEach(([k,n])=>{const b=document.createElement('button');b.type='button';b.textContent=n;b.setAttribute('aria-pressed',k==(one?g:''));b.onclick=()=>{location.hash=k?'#tools-'+k:'#alltools'};nav.append(b)});
 box.replaceChildren();
 (one?[one]:groups).forEach(([k,t,d,items])=>{
  if(!one){const h2=document.createElement('h2');h2.textContent=t;box.append(h2)}
  const grid=document.createElement('div');grid.className='tgrid';
  items.forEach(([v,n,dd],i)=>{const a=document.createElement('section'),p=document.createElement('div'),h3=document.createElement('h3'),pp=document.createElement('p'),b=document.createElement('button');
   a.className='note n'+(i%4);p.className='paper t'+(i%3);h3.textContent=n;pp.textContent=dd;b.className='pri';b.textContent='Open ✦';b.setAttribute('aria-label','Open '+n);b.onclick=()=>{location.hash='#'+v};p.append(h3,pp,b);a.append(p);grid.append(a)});
  box.append(grid)})
}
toolsPage(location.hash.slice(1).replace(/\?.*$/,''));

/* ---------- cost calculator: patterns from the website and the saved shopping list ---------- */
var costsSL=[],costsSLsaved='';
function costsSLsig(){return JSON.stringify(costsSL.map(i=>[i.n,i.txt,i.cost,i.proj]))}
function costsSLunsaved(){try{costsSLload()}catch(e){}return costsSL.length>0&&costsSLsig()!==costsSLsaved}
function costsPatRows(p,price){ // rows for the calculator: yarn from the pattern's usage figures, everything else assumed to be owned already
 const pr=price>0?String(price):'',rows=[];
 if(p.use&&p.use.length)patUse(p).forEach((u,i)=>rows.push({n:u.n,k:'yarn',u:u.u,q:String(Math.round(u.q)),ps:String(u.g?Math.round(patSkeinM(p)):p.use[i].pack),pr,have:'',note:(u.est?'Estimated amount. ':'')+(p.use[i].g?`Skein assumed: 100 g of ${yarnW(patWeight(p)).n} yarn (UK ${yarnW(patWeight(p)).uk}) (about ${Math.round(patSkeinM(p)*1.0936)} yd)`:'Typical skein size assumed')}));
 else rows.push({n:'Yarn',k:'yarn',u:'m',q:'',ps:'',pr,have:'',note:p.yarn||''});
 rows.push({n:p.c=='crochet'?'Crochet hook':'Needles',u:'pcs',q:'1',ps:'1',pr:'',have:'1',note:(p.needles||'')+' (assumed you already own one)'});
 if(p.notions)rows.push({n:'Notions',u:'pcs',q:'1',ps:'1',pr:'',have:'1',note:p.notions+' (assumed you already own these)'});
 return rows}
function costsSkein(){try{return parseFloat(localStorage.getItem('ms-skein'))||0}catch(e){return 0}}
function costsAddPattern(id){
 const m=$('#c-patmsg'),S=costsS;
 if(id=='beanie'){const d=beanieDoc(beanieS);if(!S.name)S.name=d.title;
  S.rows.push({n:'Yarn',u:'m',q:String(d.c.metres),ps:'',pr:'',have:'',note:'Estimated by the pattern generator for your current settings'},{n:'Needles',u:'pcs',q:'1',ps:'1',pr:'',have:'',note:'Cuff and body needles, see the pattern'},{n:'Stitch markers',u:'pcs',q:'6',ps:'',pr:'',have:''},{n:'Tapestry needle',u:'pcs',q:'1',ps:'1',pr:'',have:''});
  m.textContent=`Added the materials for ${d.title}. Fill in what one pack contains and its price.`}
 else{const p=PAT.find(x=>x.id==id);if(!p)return;if(!S.name)S.name=p.n;S.pid=id;
  S.rows.push(...costsPatRows(p,costsSkein()));m.textContent=p.use&&p.use.length?`Added the materials for ${p.n}. The yarn amounts are filled in, so you only need to type the price of a skein.`:`Added the materials for ${p.n}. This pattern has no yarn amount yet, so fill in how much you need, what one pack contains and its price.`}
 S.rows=S.rows.slice(0,30);costsSync();$('#c-list').dataset.v='';costsRender(true)}
function costsSLload(){try{const v=JSON.parse(localStorage.getItem('ms-shoplist')||'[]');costsSL=Array.isArray(v)?v:[]}catch(e){costsSL=[]}}
function costsSLsave(){try{localStorage.setItem('ms-shoplist',JSON.stringify(costsSL))}catch(e){}}
function costsSLmoney(v){return costsS.cur+(Math.round(v*100)/100).toFixed(2)}
function costsSLrender(){
 const box=$('#c-sl');box.replaceChildren();
 if(!costsSL.length){const p=document.createElement('p');p.className='meta';p.textContent='Your shopping list is empty. Work out a project above, then press “Add to my shopping list”.';box.append(p);$('#c-sltot').textContent='';return}
 const ul=document.createElement('ul');
 costsSL.forEach((it,i)=>{const li=document.createElement('li');if(it.done)li.className='done';const cb=document.createElement('input');cb.type='checkbox';cb.checked=!!it.done;cb.setAttribute('aria-label','Bought: '+it.n);cb.onchange=()=>{it.done=cb.checked;costsSLsave();costsSLrender()};
  const t=document.createElement('span');t.className='t';const b=document.createElement('b'),sm=document.createElement('small');b.textContent=it.n;sm.textContent=(it.proj?it.proj+' · ':'')+it.txt;t.append(b,sm);
  const pr=document.createElement('span');pr.textContent=it.cost>0?costsSLmoney(it.cost):'';const x=document.createElement('button');x.textContent='Remove';x.setAttribute('aria-label','Remove '+it.n);x.onclick=()=>{costsSL.splice(i,1);costsSLsave();costsSLrender()};
  li.append(cb,t,pr,x);ul.append(li)});box.append(ul);
 const all=costsSL.reduce((a,i)=>a+(i.cost||0),0),left=costsSL.filter(i=>!i.done).reduce((a,i)=>a+(i.cost||0),0);
 $('#c-sltot').textContent=`Total: ${costsSLmoney(all)}${costsSL.some(i=>i.done)?` (${costsSLmoney(left)} still to buy)`:''}`}
function costsSLtext(){if(!costsSL.length)return '';return ['Shopping list',...costsSL.map(i=>`${i.done?'[x]':'[ ]'} ${i.n}: ${i.txt}${i.cost>0?' ('+costsSLmoney(i.cost)+')':''}${i.proj?' - '+i.proj:''}`),`Total: ${costsSLmoney(costsSL.reduce((a,i)=>a+(i.cost||0),0))}`].join('\n')}
async function costsSLpdf(){
 const m=$('#c-slmsg');if(!costsSL.length){m.textContent='Your shopping list is empty.';return}
 m.textContent='Preparing your PDF…';
 try{try{await document.fonts.ready}catch(e){}
  const W=1110,H=1560,M=70,body='"Fredoka","Baloo 2",system-ui,sans-serif',head='"Baloo 2","Fredoka",system-ui,sans-serif',pages=[];let cv,cx,y;
  const np=()=>{cv=document.createElement('canvas');cv.width=W;cv.height=H;cx=cv.getContext('2d');cx.fillStyle='#fffdf7';cx.fillRect(0,0,W,H);cx.strokeStyle='#1b1022';cx.lineWidth=5;cx.strokeRect(24,24,W-48,H-48);pages.push({canvas:cv,links:[]});y=M+10};
  const foot=()=>{cx.font='500 22px '+body;cx.fillStyle='#5d4a68';cx.textAlign='center';cx.fillText('Moll’s Studio',W/2,H-48);cx.textAlign='left'};
  np();cx.fillStyle='#ff9bd0';cx.fillRect(24,24,W-48,150);cx.strokeRect(24,24,W-48,150);cx.fillStyle='#1b1022';cx.font='800 66px '+head;cx.fillText('Shopping list',M,120);y=230;
  const wrap=(t,max)=>{const w=String(t).split(/\s+/),ls=[];let cur='';w.forEach(x=>{const tt=cur?cur+' '+x:x;if(cx.measureText(tt).width>max&&cur){ls.push(cur);cur=x}else cur=tt});if(cur)ls.push(cur);return ls};
  let lastProj=null;
  for(const it of costsSL){cx.font='700 30px '+body;const l1=wrap(it.n+': '+it.txt,W-2*M-230);const need=(it.proj!==lastProj&&it.proj?60:0)+l1.length*38+24;
   if(y+need>H-M-40){foot();np()}
   if(it.proj!==lastProj&&it.proj){cx.font='800 36px '+head;cx.fillStyle='#ff3fa4';cx.fillText(it.proj,M,y+30);y+=60;cx.fillStyle='#1b1022'}lastProj=it.proj;
   cx.lineWidth=4;cx.strokeStyle='#1b1022';cx.strokeRect(M,y+4,30,30);if(it.done){cx.beginPath();cx.moveTo(M+6,y+20);cx.lineTo(M+14,y+29);cx.lineTo(M+26,y+9);cx.stroke()}
   cx.font='600 30px '+body;cx.fillStyle=it.done?'#8a7a94':'#1b1022';l1.forEach((l,k)=>cx.fillText(l,M+50,y+30+k*38));
   if(it.cost>0){cx.textAlign='right';cx.fillText(costsSLmoney(it.cost),W-M,y+30);cx.textAlign='left'}
   y+=l1.length*38+16;cx.strokeStyle='#e9a9cd';cx.lineWidth=2;cx.setLineDash([8,8]);cx.beginPath();cx.moveTo(M,y);cx.lineTo(W-M,y);cx.stroke();cx.setLineDash([]);y+=14}
  if(y+80>H-M-40){foot();np()}
  cx.font='800 40px '+head;cx.fillStyle='#1b1022';cx.textAlign='right';cx.fillText('Total: '+costsSLmoney(costsSL.reduce((a,i)=>a+(i.cost||0),0)),W-M,y+50);cx.textAlign='left';foot();
  const blob=await pdfFromPages(pages),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='shopping-list.pdf';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(a.href),4000);costsSLsaved=costsSLsig();m.textContent='Your PDF has been downloaded. You can print it from there.';return true}
 catch(e){m.textContent='Sorry, the PDF could not be made: '+e.message;return false}}
(function(){
 const sel=$('#c-pat'),o0=document.createElement('option');o0.value='beanie';o0.textContent='Beanie (from the pattern generator, current settings)';sel.append(o0);
 PAT.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.n;sel.append(o)});
 $('#c-patadd').onclick=()=>{if(!sel.value){$('#c-patmsg').textContent='Choose a pattern first.';return}costsAddPattern(sel.value)};
 $('#c-add').onclick=()=>{const m=$('#c-msg'),calc=costsCalc(),buy=calc.out.filter(o=>o.state=='buy');if(!buy.length){m.textContent='Nothing to buy yet. Fill in the materials above first.';return}
  const proj=(costsS.name||'My project')+(calc.qty>1?` (x${calc.qty})`:'');costsSL=costsSL.filter(i=>i.proj!==proj);
  buy.forEach(o=>costsSL.push({n:o.r.n||'Material',txt:`${o.packs} × ${costsFmt(parseFloat(o.r.ps))} ${costsUnit(o.r)}`,cost:o.cost,proj,done:false}));
  if(calc.other>0)costsSL.push({n:'Other costs',txt:'postage or extras',cost:calc.other,proj,done:false});
  costsSLsave();costsSLrender();m.textContent='Added to your shopping list below.'};
 $('#c-slpdf').onclick=costsSLpdf;
 $('#c-slcopy').onclick=async()=>{const m=$('#c-slmsg'),t=costsSLtext();if(!t){m.textContent='Your shopping list is empty.';return}try{await navigator.clipboard.writeText(t);m.textContent='Copied.'}catch(e){m.textContent='Copying didn’t work here.'}};
 $('#c-sldone').onclick=()=>{costsSL=costsSL.filter(i=>!i.done);costsSLsave();costsSLrender()};
 {let armed=null;const cb=$('#c-slclear'),label=cb.textContent;cb.onclick=()=>{const m=$('#c-slmsg');if(!costsSL.length){m.textContent='Your shopping list is already empty.';return}
  if(!armed){cb.textContent='Press again to clear everything';m.textContent='This removes every item from your shopping list.';armed=setTimeout(()=>{armed=null;cb.textContent=label;m.textContent=''},4000);return}
  clearTimeout(armed);armed=null;cb.textContent=label;costsSL=[];costsSLsave();costsSLrender();m.textContent='Your shopping list has been cleared.'}}
 costsSLload();costsSLrender()})();

/* ---------- row and stitch counter ---------- */
(function(){
 const K='ms-counters',list=$('#ct-list');let C=[];
 const load=()=>{try{const a=JSON.parse(localStorage.getItem(K));C=Array.isArray(a)?a:[]}catch(e){C=[]}};
 const save=()=>{try{localStorage.setItem(K,JSON.stringify(C))}catch(e){}};
 const num=v=>{const n=parseInt(v,10);return n>0?n:0};
 function mk(t,cls,txt){const e=document.createElement(t);if(cls)e.className=cls;if(txt!=null)e.textContent=txt;return e}
 function btn(txt,fn,cls,label){const b=mk('button',cls,txt);b.type='button';if(label)b.setAttribute('aria-label',label);b.onclick=fn;return b}
 function render(){
  list.replaceChildren();
  if(!C.length){list.append(mk('p','meta','No counters yet. Add your first project above.'));return}
  C.forEach(c=>{
   const card=mk('div','ctc'),upd=()=>{save();render()};
   card.append(mk('h2',null,c.name||'My project'));
   const pair=mk('div','ctpair'),rb=mk('div','ctbox'),sb=mk('div','ctbox');
   rb.append(mk('b',null,'Rows'),mk('div','ctn',String(c.rows)),mk('div','ctof',c.rt?`of ${c.rt}`:''));
   sb.append(mk('b',null,'Stitches'),mk('div','ctn',String(c.sts)),mk('div','ctof',c.st?`of ${c.st} in this row`:''));
   pair.append(rb,sb);card.append(pair);
   const done=mk('div','ctdone',c.rt&&c.rows>=c.rt?'All rows done! 🎉':'');card.append(done);
   const rrow=mk('div','ctbtn');
   rrow.append(btn('−',()=>{c.rows=Math.max(0,c.rows-1);upd()},'',`Remove a row from ${c.name}`),btn('+ Row',()=>{c.rows++;if(c.auto)c.sts=0;upd()},'big',`Add a row to ${c.name}`));
   const srow=mk('div','ctbtn');
   srow.append(btn('−',()=>{c.sts=Math.max(0,c.sts-1);upd()},'',`Remove a stitch from ${c.name}`),btn('+ Stitch',()=>{c.sts++;if(c.st&&c.sts>=c.st&&c.auto){c.rows++;c.sts=0}upd()},'big',`Add a stitch to ${c.name}`),btn('+10',()=>{c.sts+=10;upd()},'',`Add 10 stitches to ${c.name}`));
   card.append(mk('div','meta','Rows'),rrow,mk('div','meta','Stitches'),srow);
   const lab=mk('label','ctchk'),cb=mk('input');cb.type='checkbox';cb.checked=!!c.auto;cb.onchange=()=>{c.auto=cb.checked;save()};
   lab.append(cb,document.createTextNode(' A new row starts the stitches again from 0'));card.append(lab);
   const note=mk('textarea');note.rows=2;note.placeholder='Notes, like “increase on row 12”';note.value=c.note||'';note.setAttribute('aria-label',`Notes for ${c.name}`);note.oninput=()=>{c.note=note.value;save()};card.append(note);
   const tools=mk('div','ctrow2');
   tools.append(btn('Reset stitches',()=>{c.sts=0;upd()}),btn('Reset all',()=>{c.rows=0;c.sts=0;upd()}),
    btn('Edit targets',()=>{const r=prompt('Total rows (leave empty for none):',c.rt||''),s=r===null?null:prompt('Stitches per row (leave empty for none):',c.st||'');if(r===null||s===null)return;c.rt=num(r);c.st=num(s);upd()}));
   {const d=btn('Delete',()=>{});sureBtn(d,()=>{C=C.filter(x=>x!==c);save();render()},'Delete');tools.append(d)}
   card.append(tools);list.append(card)})}
 $('#ct-add').onclick=()=>{const m=$('#ct-msg'),n=$('#ct-name').value.trim();
  if(!n){m.textContent='Give your project a name first.';return}
  C.unshift({id:Date.now().toString(36),name:n,rows:0,sts:0,rt:num($('#ct-rt').value),st:num($('#ct-st').value),auto:true,note:''});
  save();$('#ct-name').value='';$('#ct-rt').value='';$('#ct-st').value='';m.textContent='Counter added.';render()};
 $('#ct-name').onkeydown=e=>{if(e.key=='Enter')$('#ct-add').click()};
 load();render();
 window.countersShow=()=>{load();render()};
})();

/* ---------- yarn weight table on the cost calculator ---------- */
(function(){const s=$('#costs');if(!s)return;const d=document.createElement('div');d.className='win';d.style.marginTop='1.4rem';
 d.innerHTML='<div class="tb"><span>yards in 100 g of yarn</span><i class="dots"><b></b><b></b><b></b></i></div><div class="bd" style="padding-top:.8rem"><p class="meta" style="margin-top:0">Thicker yarn has fewer yards in each 100 g, so a project needs more skeins. Yarn is named differently in the US and UK, so both names are shown (guide from doradoes.co.uk). Pattern pages use this table to work out yardage and skeins.</p><table class="ywt" style="width:100%;border-collapse:collapse;text-align:left">'+'<tr><th style="padding:.3rem .5rem;text-align:left">US name</th><th style="padding:.3rem .5rem;text-align:left">UK name / also known as</th><th style="padding:.3rem .5rem;text-align:left">Yards in 100 g</th></tr>'+YARN_W.map(y=>`<tr><td style="padding:.3rem .5rem;border-bottom:2px dashed var(--line);font-weight:600">${y.n}</td><td style="padding:.3rem .5rem;border-bottom:2px dashed var(--line)">${y.uk}</td><td style="padding:.3rem .5rem;border-bottom:2px dashed var(--line)">${y.lo} - ${y.hi} yards</td></tr>`).join('')+'</table></div>';s.append(d)})();

/* ---------- wavy page headings: each letter bobs a little, one after the other ---------- */
(function(){
 const sel='main>section>h1:not(.rn):not(.hx),h1.home-title';
 function wave(h){ // turns a heading into waving letters; a smiley picture (img.o-spin) already in the heading is kept as a letter
  const toks=[];h.childNodes.forEach(n=>{if(n.nodeType==3)[...n.textContent].forEach(c=>toks.push(c));else if(n.nodeName=='IMG')toks.push(n)});
  const t=toks.map(x=>typeof x=='string'?x:'o').join(''),key=t+'|'+toks.filter(x=>typeof x!='string').length;
  if(h._wk===key||!t.trim())return;h._wk=key;h.dataset.wv=t;h.setAttribute('aria-label',t);h.replaceChildren();let i=0,word=null;
  const open=()=>{word=document.createElement('span');word.className='wv';word.setAttribute('aria-hidden','true');h.append(word)};
  toks.forEach(x=>{if(typeof x=='string'&&/\s/.test(x)){word=null;h.append(document.createTextNode(' '));return}
   if(!word)open();const s=document.createElement('span');if(typeof x=='string')s.textContent=x;else s.append(x);s.style.setProperty('--i',i++);word.append(s)})}
 const mo=new MutationObserver(ms=>ms.forEach(m=>{const h=m.target.nodeType==1?m.target:m.target.parentElement;if(h&&h.matches&&h.matches(sel))wave(h)}));
 document.querySelectorAll(sel).forEach(h=>{wave(h);mo.observe(h,{childList:true,characterData:true})});
 // random glitch bursts: each heading glitches at its own random times, with a random strength, direction and sometimes a quick second burst
 const calm=matchMedia('(prefers-reduced-motion: reduce)'),r=(a,b)=>a+Math.random()*(b-a);
 function burst(h,again){if(calm.matches)return;if(h.offsetParent){h.style.setProperty('--gx',r(.06,.22).toFixed(3)+'em');h.style.setProperty('--gy',r(-.04,.04).toFixed(3)+'em');h.style.setProperty('--sk',r(-8,8).toFixed(1)+'deg');
   h.classList.remove('gl');void h.offsetWidth;h.classList.add('gl');setTimeout(()=>h.classList.remove('gl'),360)}
  if(!again&&Math.random()<.4)setTimeout(()=>burst(h,true),r(150,500))}
 function loop(h){setTimeout(()=>{burst(h);loop(h)},r(900,5200))}
 document.querySelectorAll(sel).forEach(h=>setTimeout(()=>loop(h),r(300,2500)))})();

/* ---------- home heading glitch: two coloured copies of each word (letters and smileys), so the glitch only covers the words ---------- */
(function(){
 const h=document.querySelector('h1.home-title');if(!h)return;
 function copies(){h.querySelectorAll(':scope>.wv').forEach(w=>{if(w.querySelector(':scope>.gc'))return;
  ['a','b'].forEach(k=>{const c=document.createElement('i');c.className='gc '+k;c.setAttribute('aria-hidden','true');
   w.querySelectorAll(':scope>span').forEach(s=>c.append(s.cloneNode(true)));w.append(c)})})}
 copies();new MutationObserver(copies).observe(h,{childList:true})})();

/* ---------- increase or decrease evenly: spaces increases or decreases evenly across a row and writes the instruction ---------- */
(function(){
 const sec=$('#evenly');if(!sec)return;
 const KEY='molls-evenly',st={craft:'knit',mode:'inc',style:'easy'};
 try{Object.assign(st,JSON.parse(localStorage.getItem(KEY)||'{}'))}catch(e){}
 const N=$('#ev-n'),C=$('#ev-c'),W=$('#ev-way'),K=$('#ev-kind'),R=$('#ev-rows'),G=$('#ev-gap');
 if(st.n)N.value=st.n;if(st.c!=null)C.value=st.c;if(st.way)W.value=st.way;if(st.kind)K.value=st.kind;if(st.rows)R.value=st.rows;if(st.gap)G.value=st.gap;
 // split `total` plain stitches into `gaps` groups as evenly as possible (the bigger groups spread out across the row)
 const spread=(total,gaps)=>{const b=Math.floor(total/gaps),r=total%gaps,o=[];for(let i=0;i<gaps;i++)o.push(b+(Math.floor((i+1)*r/gaps)>Math.floor(i*r/gaps)?1:0));return o};
 // join repeated steps: [['k7','M1'],['k7','M1']] -> "(k7, M1) twice"
 const words=(units)=>{const out=[];let i=0;while(i<units.length){let j=i;const key=units[i].join(', ');while(j+1<units.length&&units[j+1].join(', ')==key)j++;const n=j-i+1;
   out.push(n>1?`(${key}) ${n==2?'twice':n+' times'}`:key);i=j+1}return out.join(', ')};
 const cap=s=>s.charAt(0).toUpperCase()+s.slice(1);
 // one row: n stitches, c increases or decreases (decreases: at most half the stitches, each one works 2 stitches together)
 function oneRow(n,c,o){
  const {knit,inc,round,kind}=o;
  const plain=g=>!g?null:knit?'k'+g:(g==1?'1 st in next st':'1 st in each of next '+g+' sts');
  const usesSt=!inc||!knit||kind=='kfb';
  const act=inc?(knit?(kind=='kfb'?'kfb':'M1'):'2 sts in next st'):(knit?'k2tog':'work 2 sts together');
  const per=inc?(usesSt?1:0):2,plainTotal=n-c*per;
  if(plainTotal<0)return null;
  const gaps=round?c:c+1,g=spread(plainTotal,gaps);
  let even;
  if(round)even=g.map(x=>[plain(x),act].filter(Boolean));
  else{const s=g.slice().sort((a,b)=>a-b),first=s[0],last=s[1],mid=g.slice();mid.splice(mid.indexOf(first),1);mid.splice(mid.indexOf(last),1);
   even=[[plain(first)].filter(Boolean)];mid.forEach(x=>even.push([act,plain(x)].filter(Boolean)));even.push([act,plain(last)].filter(Boolean));even=even.filter(u=>u.length);g.splice(0,g.length,first,...mid,last)}
  let easy;
  if(round){const s=g.slice().sort((a,b)=>b-a);easy=s.map(x=>[plain(x),act].filter(Boolean))}
  else{const first=g[0],last=g[g.length-1],mid=g.slice(1,-1).sort((a,b)=>b-a);easy=[[plain(first)].filter(Boolean),...mid.map(x=>[act,plain(x)].filter(Boolean)),[act,plain(last)].filter(Boolean)].filter(u=>u.length)}
  return{n,c,g,per,act,out:n+(inc?c:-c),easy:words(easy),even:words(even)}
 }
 // everything in a single row by working bigger groups together (k3tog, k4tog...): n stitches down to f
 function bigGroups(n,f,knit){
  const sizes=spread(n,f).sort((a,b)=>b-a);
  const name=s=>s==1?(knit?'k1':'1 st in next st'):knit?`k${s}tog`:`work ${s} sts together`;
  return{sizes,text:words(sizes.map(s=>[name(s)]))}
 }
 function calc(){
  const n=Math.max(0,Math.floor(+N.value||0)),c=Math.max(0,Math.floor(+C.value||0)),round=W.value=='round',knit=st.craft=='knit',inc=st.mode=='inc',kind=K.value;
  const msg=$('#ev-msg');msg.textContent='';
  if(!n){msg.textContent='Enter how many stitches you have now.';return null}
  if(!c){msg.textContent='Enter how many stitches to '+(inc?'add':'take away')+'.';return null}
  const o={knit,inc,round,kind},rw=round?'rounds':'rows',want=Math.floor(+R.value||0);
  if(!inc&&c>=n){msg.textContent=`You need at least 1 stitch left at the end, so you can take away ${n-1} at most.`;return null}
  // the fewest rows it can be done in: increases fit in one row; decreases can take away at most half the stitches in a row (like a hat crown)
  const fewest=[];if(inc)fewest.push(c);else{let cur=n,rem=c;while(rem>0){const d=Math.min(Math.floor(cur/2),rem);fewest.push(d);cur-=d;rem-=d}}
  let counts=fewest;
  if(want){
   if(want>c){msg.textContent=`You can only spread ${c} ${inc?'increases':'decreases'} over ${c} ${rw} at most (one per ${round?'round':'row'}).`;return null}
   if(want<fewest.length){msg.textContent=`Taking away ${c} needs at least ${fewest.length} ${rw}, because each ${round?'round':'row'} can take away at most half its stitches.`;return null}
   if(inc)counts=spread(c,want).sort((a,b)=>b-a); // the same amount each row
   else{ // as close to the same amount each row as possible, taking a few more early on while there are more stitches, so every row stays possible
    const canLose=(m,k)=>m-Math.ceil(m/Math.pow(2,k)); // the most k rows can take away from m stitches
    counts=[];let cur=n,rem=c;
    for(let k=want;k>0;k--){let d=Math.ceil(rem/k);while(d<Math.floor(cur/2)&&rem-d>canLose(cur-d,k-1))d++;d=Math.min(d,Math.floor(cur/2),rem);counts.push(d);cur-=d;rem-=d}
    if(rem>0||counts.some(d=>d<1)){msg.textContent=`That doesn’t work in ${want} ${rw}. Try ${fewest.length} or more.`;return null}}
  }
  const plan=[];let cur=n;
  for(const d of counts){const r=oneRow(cur,d,o);if(!r){msg.textContent=knit?`You can’t kfb into more stitches than you have (${cur} at most in one ${round?'round':'row'}). Spread them over more ${rw}, or use M1.`:`You can’t increase into more stitches than you have (${cur} at most in one ${round?'round':'row'}). Spread them over more ${rw}.`;return null}plan.push(r);cur=r.out}
  const one=!inc&&fewest.length>1?bigGroups(n,n-c,knit):null;
  return{...plan[0],out:inc?n+c:n-c,plan,one,knit,inc,round}
 }
 function draw(){
  st.n=N.value;st.c=C.value;st.way=W.value;st.kind=K.value;st.rows=R.value;st.gap=G.value;try{localStorage.setItem(KEY,JSON.stringify(st))}catch(e){}
  $$('[data-ev-craft]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.evCraft==st.craft));
  $$('[data-ev-mode]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.evMode==st.mode));
  $$('[data-ev-style]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.evStyle==st.style));
  $('#ev-cl').textContent=st.mode=='inc'?'Stitches to add':'Stitches to take away';
  {const rr=W.value=='round';$('#ev-rl').textContent='Over how many '+(rr?'rounds':'rows');$('#ev-pl').textContent='Plain '+(rr?'rounds':'rows')+' in between';[...G.options].forEach((op,i)=>op.textContent=i==0?'None, shape every '+(rr?'round':'row'):i+' (shape every '+(i==1?'other':(i+1)+(i==2?'rd':'th'))+' '+(rr?'round':'row')+')')}
  $('#ev-kl').hidden=!(st.craft=='knit'&&st.mode=='inc');$('#ev-what').textContent=st.mode=='inc'?'increase':'decrease';
  const r=calc(),out=$('#ev-out'),tot=$('#ev-total'),strip=$('#ev-strip'),key=$('#ev-key'),note=$('#ev-plan');
  if(!r){out.textContent='';tot.textContent='';strip.innerHTML='';key.textContent='';note.hidden=true;return}
  const word=r.round?'Round':'Row',rw=r.round?'rounds':'rows',pick=x=>cap(st.style=='easy'?x.easy:x.even),gap=r.plan.length>1?+G.value:0;
  const sts=x=>x+' st'+(x==1?'':'s'),plainRow=x=>r.knit?(r.round?`Knit all ${x} sts.`:`Work all ${x} sts plain (knit or purl, as your pattern says).`):`1 st in each st (${x} sts).`;
  const totalRows=r.plan.length+gap*(r.plan.length-1);
  tot.innerHTML=`${r.n} → <b>${r.out}</b> stitch${r.out==1?'':'es'}<small>${r.plan.length} ${r.plan.length==1?word.toLowerCase():rw} of shaping${gap?`, ${totalRows} ${rw} in total`:''}</small>`;
  const lines=[];let num=1;
  r.plan.forEach((x,i)=>{lines.push(`${word} ${num}: ${pick(x)}. (${sts(x.out)})`);num++;
   if(i<r.plan.length-1)for(let p=0;p<gap;p++){lines.push(`${word} ${num}: ${plainRow(x.out)}`);num++}});
  out.textContent=lines.join('\n');
  const hat=!r.inc&&r.out<=8?` To finish a hat: cut the yarn, thread it through the last ${r.out==1?'stitch':r.out+' stitches'} and pull tight.`:'';
  const notes=[];
  if(r.plan.length>1)notes.push(`Spread over <b>${r.plan.length} ${rw}</b> of shaping${gap?` with ${gap} plain ${gap==1?word.toLowerCase():rw} between each, <b>${totalRows} ${rw} in total</b>`:''}. Change “Over how many ${rw}” to use more or fewer.`);
  if(r.one)notes.push(`<b>Or all in one ${r.round?'round':'row'}:</b> ${cap(r.one.text)}. (${sts(r.out)})`+(r.one.sizes[0]>3?' This works lots of stitches together at once, so the plan above is usually neater.':''));
  if(hat)notes.push(hat.trim());
  note.hidden=!notes.length;note.innerHTML=notes.join('<br>');
  const k=r.knit?{M1:'M1 = make 1: pick up the bar between stitches and knit into the back of it.',kfb:'kfb = knit into the front and then the back of the same stitch.',k2tog:'k2tog = knit 2 stitches together.'}:{};
  key.textContent=r.knit?['k = knit',k[r.act]].filter(Boolean).join(' · '):`Use the stitch your pattern uses (for example double crochet). “2 sts in next st” is an increase; “work 2 sts together” is a decrease.`;
  // the strip: every stitch of the current row, with increases (pink) and decreases (green) marked (for a plan, this is row 1)
  const parts=[];const pushK=x=>{for(let i=0;i<x;i++)parts.push('<i class="k"></i>')};
  const actEl=r.inc?(r.per?'<i class="u"></i>':'<b></b>'):'<i class="d"></i><i class="d"></i>';
  if(r.round)r.g.forEach(x=>{pushK(x);parts.push(actEl)});
  else{pushK(r.g[0]);r.g.slice(1).forEach(x=>{parts.push(actEl);pushK(x)})}
  $('#ev-sl').textContent=r.plan.length>1?` This is ${r.round?'round':'row'} 1 of the plan.`:'';
  strip.innerHTML=r.n>400?'<span class="meta">That’s a lot of stitches! The instruction above has everything you need.</span>':parts.join('');
 }
 $$('[data-ev-craft]').forEach(b=>b.onclick=()=>{st.craft=b.dataset.evCraft;draw()});
 $$('[data-ev-mode]').forEach(b=>b.onclick=()=>{st.mode=b.dataset.evMode;draw()});
 $$('[data-ev-style]').forEach(b=>b.onclick=()=>{st.style=b.dataset.evStyle;draw()});
 [N,C,W,K,R,G].forEach(el=>el.addEventListener('input',draw));
 $('#ev-copy').onclick=()=>{const t=$('#ev-out').textContent;if(!t)return;const done=()=>{const b=$('#ev-copy');b.textContent='Copied ✓';setTimeout(()=>b.textContent='Copy instruction',1400)};
  if(navigator.clipboard)navigator.clipboard.writeText(t).then(done,()=>{});else{const a=document.createElement('textarea');a.value=t;document.body.append(a);a.select();document.execCommand('copy');a.remove();done()}};
 draw();
})();

/* ---------- home page: Moll's vision, everything that's free, beginners and the honesty jar ---------- */
// Put your real links here (between the quotes) and the support buttons will open them. While they are empty, the buttons show a "coming soon" note.
const SUPPORT_LINKS={coffee:'',patreon:''};
(function(){
 if(!$('#hm-tools'))return;
 // the numbers: free tools, patterns and ready-made charts (worked out from the site, so they stay right when you add more)
 $('#hm-n-tools').textContent=$$('#hm-tools .hm-tool').length;
 if(typeof PAT!='undefined')$('#hm-n-pat').textContent=PAT.filter(p=>!p.sample).length;
 if(typeof P!='undefined')$('#hm-n-chart').textContent=P.length;
 // the little chart previews at the top of the cards
 $$('#hm-tools .fm[data-mini]').forEach(el=>{try{const [k,v]=el.dataset.mini.split(':');const ch=k=='chart'?DECOR[+v]:(CHART(v)||P[0]);if(ch)el.append(thumb(ch,170))}catch(e){}});
 // "See everything that's free" and "I'm a beginner" scroll down the home page
 $$('[data-scroll]').forEach(b=>b.onclick=()=>{const t=$('#'+b.dataset.scroll);if(t)t.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'})});
 // the honesty jar
 const note=$('#hm-paynote');
 [['#hm-coffee','coffee'],['#hm-patreon','patreon']].forEach(([id,k])=>{const a=$(id);if(!a)return;const url=SUPPORT_LINKS[k];
  if(url)a.href=url;else a.onclick=e=>{e.preventDefault();note.hidden=false}});
})();

/* ---------- THE RAVE: click a disco ball. A: a rave poster on a wall. B: tear off the free ticket and fall into the poster. C: inside the rave ---------- */
(function(){
 const balls=[...document.querySelectorAll('svg.stk')].filter(s=>s.querySelector('use[href="#s-disco"]'));
 let rv=null,prev=null,timers=[],started=false;
 const mk=(t,c,x)=>{const e=document.createElement(t);if(c)e.className=c;if(x!=null)e.textContent=x;return e};
 const later=(f,ms)=>{const t=setTimeout(()=>{if(rv)f()},ms);timers.push(t)};
 const calm=()=>matchMedia('(prefers-reduced-motion: reduce)').matches;
 const SM='<img src="images/smiley.png" alt="" onerror="this.style.visibility=\'hidden\'">';
 function openRave(){
  if(rv)return;started=false;prev=document.activeElement;
  rv=mk('div','rv a');rv.setAttribute('role','dialog');rv.setAttribute('aria-modal','true');rv.setAttribute('aria-label','Rave poster');
  const wall=mk('div','rv-wall');rv._wall=wall;
  // the ticket shows today's date and the start of the current hour, e.g. Sun 15 Nov 2026, doors 16:00
  const now=new Date();now.setMinutes(0,0,0);
  const day=now.toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short',year:'numeric'}).replace(/,/g,''),doors=now.toLocaleTimeString('en-GB',{hour:'2-digit',minute:'2-digit'});
  const STAR='<path d="M50 4C55 34 66 45 96 50 66 55 55 66 50 96 45 66 34 55 4 50 34 45 45 34 50 4Z"/>';
  const globe='<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="rim" cx="50" cy="50" r="46"/>'+
   [-60,-30,0,30,60].map(a=>{const r=a*Math.PI/180,y=50+46*Math.sin(r),h=46*Math.cos(r);return `<line x1="${(50-h).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(50+h).toFixed(1)}" y2="${y.toFixed(1)}"/>`}).join('')+
   [0,1,2,3].map(k=>`<ellipse cx="50" cy="50" rx="46" ry="46"><animate attributeName="rx" values="46;0;46" dur="6s" begin="${(-k*1.5).toFixed(1)}s" repeatCount="indefinite"/></ellipse>`).join('')+'</svg>';
  let tun='<svg class="grid" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">';
  for(let x=0;x<=160;x+=20)tun+=`<line x1="${x}" y1="100" x2="80" y2="50"/><line x1="${x}" y1="0" x2="80" y2="50"/>`;
  for(let y=0;y<=100;y+=20)tun+=`<line x1="0" y1="${y}" x2="80" y2="50"/><line x1="160" y1="${y}" x2="80" y2="50"/>`;
  for(let i=0;i<6;i++)tun+=`<rect class="fr" x="0" y="0" width="160" height="100" style="animation-delay:${(-i*.4).toFixed(1)}s"/>`;
  tun+='</svg>';
  let wav='<svg viewBox="0 0 100 200" preserveAspectRatio="none" aria-hidden="true">';
  for(let i=0;i<7;i++){let d='';for(let y=0;y<=200;y+=4){const x=7+i*14+6*Math.sin(y*Math.PI*2/50+i*.8)+3*Math.sin(y*Math.PI*2/25+i*1.7);d+=(y?'L':'M')+x.toFixed(1)+' '+y}wav+=`<path d="${d}" stroke-width="${(6+(i%3)*1.5).toFixed(1)}"/>`}
  wav+='</svg>';
  let con='<svg class="rp-contour" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true">';
  [[5,-5,40,30,10,60,48,90],[60,0,90,20,70,40,105,55],[30,105,45,80,75,95,90,70]].forEach(p=>{con+=`<path d="M${p[0]} ${p[1]}C${p[2]} ${p[3]} ${p[4]} ${p[5]} ${p[6]} ${p[7]}"/>`});con+='</svg>';
  const po=mk('div','rv-poster');
  po.innerHTML='<div class="rp-art">'+con+
   '<div class="rp-head"><div class="rp-headl"><h2 class="rp-title" aria-label="The rave"><span class="s">THE RAVE</span><span class="o" aria-hidden="true">THE RAVE</span><span class="o" aria-hidden="true">THE RAVE</span></h2></div>'+
    '<div class="rp-headr"><p>Moll’s Studio presents</p><p class="pk">'+day+' · doors '+doors+'</p></div></div>'+
   '<div class="rp-mid"><div class="rp-globe"><div class="rp-gbox">'+globe+'<div class="rp-smile">'+SM+'</div></div>'+
     '<p class="rp-glab"><i></i>Location: Moll’s Studio<br><i></i>Dress code: handmade<b>♥</b></p></div>'+
    '<div class="rp-words"><p class="rp-line">Dance <b>♥</b> Knit <b>♥</b> Crochet</p>'+
     '<p class="rp-copy">Moll’s Studio’s very first rave. Bring your needles. Dance till the last row. Hardgroove all night long, free entry. <b>Knit. Dance. Crochet. Repeat.</b></p>'+
     '<div class="rp-tunnel">'+tun+'<div class="rp-tcrowd"></div><div class="rp-tball"><img src="images/disco-ball.gif" alt="" onerror="this.onerror=null;this.src=\'images/disco-ball.png\'"></div></div></div>'+
    '<div class="rp-waves">'+wav+'</div></div>'+
   '<div class="rp-foot"><div class="rp-warn"><span class="big">!</span><div class="txt"><span class="hd">Warning<svg viewBox="0 0 60 26" aria-hidden="true"><ellipse cx="22" cy="13" rx="18" ry="10"/><ellipse cx="38" cy="13" rx="18" ry="10"/></svg></span><span>Flashing lights and colours inside</span><span>Knitters, crocheters and dancers of all ages welcome</span></div></div>'+
    '<div class="rp-tnw"><p class="rp-tn" aria-label="Tonight!"><span class="s">TONIGHT!</span><span class="o" aria-hidden="true">TONIGHT!</span><span class="o" aria-hidden="true">TONIGHT!</span></p></div>'+
    '<div class="rp-icons"><div class="rp-stars" aria-hidden="true">'+('<svg viewBox="0 0 100 100">'+STAR+'</svg>').repeat(3)+('<svg class="ol" viewBox="0 0 100 100">'+STAR+'</svg>').repeat(3)+'</div>'+
     '<svg class="rp-coil" viewBox="0 0 110 100" aria-hidden="true"><g>'+[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${28+i*9}" cy="50" rx="24" ry="44"/>`).join('')+'</g></svg>'+
     '<p class="rp-hifi"><b>HI-FI</b>STEREO</p></div></div></div>';
  const tc=po.querySelector('.rp-tcrowd');[1,3,4].forEach(i=>tc.append(dancer(i)));
  const tk=mk('button','rp-ticket');tk.type='button';tk.setAttribute('aria-label','Tear off your free ticket for '+day+', doors '+doors+', and enter the rave');
  tk.innerHTML='<span class="rp-cut">✂ tear off to enter</span><span class="rp-free" aria-hidden="true"><span class="s">FREE TICKET</span><span class="o">FREE TICKET</span><span class="o">FREE TICKET</span></span>'+
   '<span class="rp-when"><b>'+day+'</b>Doors '+doors+' · till late<br>Admit one</span><i class="rp-code"></i><span class="rp-no">Nº 000'+(1+Math.floor(Math.random()*9))+'</span>';
  tk.onclick=enter;po.append(tk);rv._tk=tk;rv._day=day;rv._doors=doors;
  const no=mk('button','rv-no','Not now');no.type='button';no.onclick=close;
  po.querySelector('.rp-headr').append(no);
  wall.append(po);rv.append(wall,mk('div','rv-grain'));
  document.body.append(rv);document.body.style.overflow='hidden';tk.focus({preventScroll:true});
  fitPoster();if(document.fonts)document.fonts.ready.then(fitPoster);
  onRaveDoorsOpen()}                                     // the poster is on screen: muffled music starts
 // shrink any poster text that is too wide for its space (for small screens, or before the fonts load)
 function fitPoster(){if(!rv||!rv._wall)return;rv._wall.querySelectorAll('.rp-title,.rp-line,.rp-tn').forEach(el=>{el.style.fontSize='';const box=el.parentElement,cs=getComputedStyle(box),room=box.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0);
  const w=el.scrollWidth;if(w>room&&room>0)el.style.fontSize=(parseFloat(getComputedStyle(el).fontSize)*room/w*.97)+'px'})}
 addEventListener('resize',()=>{if(rv&&!started)fitPoster()});
 function enter(){
  if(!rv||started)return;started=true;const quick=calm();
  rv._tk.classList.add('rip');onRaveEnterFull();                // the door opens: the music starts getting louder                           // the ticket tears away from the poster
  // dive into the rave scene on the poster (the pink tunnel): it moves to the middle and grows past the edges of the screen, then fades into the rave
  const W=rv._wall,tn=W.querySelector('.rp-tunnel'),r=tn&&tn.offsetParent?tn.getBoundingClientRect():null;
  later(()=>{buildInside();
   if(r&&!quick){const cx=r.left+r.width/2,cy=r.top+r.height/2,s=Math.max(innerWidth/r.width,innerHeight/r.height)*1.7;
    W.style.transformOrigin=cx+'px '+cy+'px';W.style.transition='transform 1.6s cubic-bezier(.55,0,.85,.45),opacity .6s 1.05s';
    W.style.transform=`translate(${innerWidth/2-cx}px,${innerHeight/2-cy}px) scale(${s.toFixed(2)})`}
   W.classList.add('zoom')},quick?200:750);          // fall into the tunnel
  later(()=>{rv.classList.remove('a');rv.classList.add('c');rv.setAttribute('aria-label','The rave')},quick?400:1350);
  later(()=>{rv._wall.remove();rv._stop&&rv._stop.focus()},quick?900:2400)}
 // one dancing silhouette. arms: [left from,to, left forearm from,to, right from,to, right forearm from,to] in degrees
 const MOVES=[[140,168,-25,25,-140,-168,25,-25],[95,150,-10,-45,-150,-95,45,10],[25,45,60,80,-160,-118,0,-20],[45,-25,70,95,25,-45,-95,-70],[150,170,-60,-20,-30,-50,-70,-95]];
 const HAIR=['','<circle cx="60" cy="11" r="8"/>','<circle cx="60" cy="27" r="20"/>','<path d="M72 22q16 6 12 34q-8-10-14-14z"/>'];
 function dancer(i){
  const m=MOVES[i%MOVES.length],beat=.44,d=(beat*(i%2?4:2)).toFixed(2),lag=(-Math.random()*2).toFixed(2);
  const arm=(x,ex,ey,hx,hy,a0,a1,f0,f1)=>`<g class="dz-arm" style="transform-origin:${x}px 56px;--a0:${a0}deg;--a1:${a1}deg"><path d="M${x} 56L${ex} ${ey}"/><g class="dz-fore" style="transform-origin:${ex}px ${ey}px;--a0:${f0}deg;--a1:${f1}deg"><path d="M${ex} ${ey}L${hx} ${hy}"/></g></g>`;
  const w=mk('div','rv-dancer');w.style.cssText=`--h:${34+((i*37)%5)*4.5}vh;--d:${d}s;--b:${beat}s;--l:${lag}s;--c:${['#ff3fb4','#3ff0ff','#ffe13f','#8dff3f','#b46bff'][i%5]}`;
  w.innerHTML=`<svg viewBox="-30 -20 180 240" aria-hidden="true"><g class="dz-sway"><g class="dz-bob">
   <g class="dz-leg" style="transform-origin:52px 122px;--a0:7deg;--a1:-5deg"><path d="M52 122L47 166L45 214"/></g>
   <g class="dz-leg" style="transform-origin:68px 122px;--a0:5deg;--a1:-7deg"><path d="M68 122L73 166L75 214"/></g>
   <path class="dz-fill" d="M43 55Q60 45 77 55L72 126Q60 132 48 126Z"/><g class="dz-fill">${HAIR[i%HAIR.length]}<circle cx="60" cy="29" r="14"/></g>
   ${arm(48,36,82,32,110,m[0],m[1],m[2],m[3])}${arm(72,84,82,88,110,m[4],m[5],m[6],m[7])}
  </g></g></svg>`;return w}
 function buildInside(){
  const m=mk('div','rv-int');
  // the wireframe room: lines from the edges to the vanishing point, and frames rushing out on the beat
  let room='<svg class="rv-room" viewBox="0 0 160 100" preserveAspectRatio="none" aria-hidden="true">';
  for(let x=-160;x<=320;x+=16)room+=`<line x1="${x}" y1="100" x2="80" y2="46"/><line x1="${x}" y1="0" x2="80" y2="46"/>`;
  for(let y=0;y<=100;y+=12.5)room+=`<line x1="0" y1="${y}" x2="80" y2="46"/><line x1="160" y1="${y}" x2="80" y2="46"/>`;
  for(let i=0;i<8;i++)room+=`<rect class="fr${i%4==0?' a':''}" x="0" y="0" width="160" height="100" style="animation-delay:${(-i*.22).toFixed(2)}s"/>`;
  room+='<line class="hz" x1="0" y1="46" x2="160" y2="46"/></svg>';
  m.insertAdjacentHTML('beforeend',room);
  // big stacked words
  const w=mk('div','rv-words');w.setAttribute('aria-hidden','true');
  w.innerHTML='<p class="rv-stack l"><span class="s">DANCE</span><span class="o">DANCE</span><span class="o">DANCE</span></p>'+
   '<p class="rv-stack r"><span class="s">KNIT ♥ CROCHET</span><span class="o">KNIT ♥ CROCHET</span><span class="o">KNIT ♥ CROCHET</span></p>';
  m.append(w);
  // flat laser beams fanning out from the disco ball
  const lz=mk('div','rv-lasers'),cols=['#c4ff2e','#ff3fa4','#7df9ff'];
  for(let k=0;k<12;k++){const b=mk('i','rv-lz'),a=-80+k*14.5;b.style.cssText=`--a:${a.toFixed(1)}deg;--b:${(a+(k%2?30:-30)).toFixed(1)}deg;--col:${cols[k%3]};--d:${(1.76*(1+(k%3))).toFixed(2)}s;--l:${(-k*.37).toFixed(2)}s`;if(k%4==1)b.classList.add('blink');lz.append(b)}
  m.append(lz,mk('div','rv-flash'));
  // the disco ball inside a spinning wireframe globe
  // the disco ball is the animated gif (images/disco-ball.gif, with its own chain); if it is missing the old picture is used, then a drawn ball
  const ball=mk('div','rv-ball');const bw=mk('div','rv-ballw'),bi=mk('img');bi.src='images/disco-ball.gif';bi.alt='';bi.onerror=()=>{if(!bi.classList.contains('png')){bi.classList.add('png');bi.src='images/disco-ball.png'}else{bi.remove();bw.classList.add('nophoto')}};
  bw.append(bi);bw.insertAdjacentHTML('beforeend','<svg viewBox="0 0 100 100" aria-hidden="true"><circle class="rim" cx="50" cy="50" r="48"/>'+
   [-55,-25,0,25,55].map(a=>{const r=a*Math.PI/180,y=50+48*Math.sin(r),h=48*Math.cos(r);return `<line x1="${(50-h).toFixed(1)}" y1="${y.toFixed(1)}" x2="${(50+h).toFixed(1)}" y2="${y.toFixed(1)}"/>`}).join('')+
   [0,1,2,3].map(k=>`<ellipse cx="50" cy="50" rx="48" ry="48"><animate attributeName="rx" values="48;0;48" dur="3.52s" begin="${(-k*.88).toFixed(2)}s" repeatCount="indefinite"/></ellipse>`).join('')+'</svg>');
  ball.append(bw);m.append(ball);
  // stars, coils and smileys floating about
  const STAR='<svg viewBox="0 0 100 100"><path d="M50 4C55 34 66 45 96 50 66 55 55 66 50 96 45 66 34 55 4 50 34 45 45 34 50 4Z"/></svg>';
  const FX=[['star',6,40,5,'#c4ff2e'],['star ol',20,26,4,'#ff3fa4'],['smile',30,52,7],['coil',70,58,9],['star',78,30,5,'#7df9ff'],['star ol',88,48,4,'#c4ff2e'],['smile',62,24,6],['star',44,60,3.5,'#ff3fa4'],
   ['smile',12,22,6],['smile',22,44,4.5],['smile',38,32,5],['smile',54,40,4],['smile',72,14,5],['smile',84,62,6.5],['smile',92,22,4.5],['smile',4,58,5],['smile',48,8,4],['smile',66,48,5.5],['smile',36,64,4.5],['smile',80,40,4]];
  FX.forEach(([t,x,y,s,c],i)=>{const f=mk('span','rv-fx '+t);f.setAttribute('aria-hidden','true');f.style.cssText=`--x:${x}%;--y:${y}%;--s:calc(var(--u)*${s});--d:${(4+i%3).toFixed(1)}s;--l:${(-i*.7).toFixed(1)}s${c?';--c:'+c:''}`;
   f.innerHTML=t=='smile'?SM:t=='coil'?'<svg viewBox="0 0 110 100"><g>'+[0,1,2,3,4,5,6].map(i=>`<ellipse cx="${28+i*9}" cy="50" rx="24" ry="44"/>`).join('')+'</g></svg>':STAR;m.append(f)});
  const crowd=mk('div','rv-crowd');for(let i=0;i<8;i++)crowd.append(dancer(i));m.append(crowd);
  // VHS readout
  const tl=mk('p','rv-hud tl');tl.innerHTML='▶ PLAY<br><span class="rec"><i></i>REC <b class="t">00:00:00</b></span>';
  const bl=mk('p','rv-hud bl');bl.innerHTML='▢ Now playing: <span class="pk">Hardgroove 1</span><br>▢ Location: Moll’s Studio';
  const br=mk('p','rv-hud br');br.innerHTML=(rv._day||'')+'<br><span class="pk">Doors '+(rv._doors||'')+' · till late</span>';
  [tl,bl,br].forEach(e=>e.setAttribute('aria-hidden','true'));m.append(tl,bl,br);
  const t0=Date.now(),clock=tl.querySelector('.t'),tick=setInterval(()=>{if(!rv){clearInterval(tick);return}const s=Math.floor((Date.now()-t0)/1000);clock.textContent=[s/3600,s/60%60,s%60].map(n=>String(Math.floor(n)).padStart(2,'0')).join(':')},1000);timers.push(tick);
  const fly=mk('div','rv-flyer'),sp=mk('span');for(let i=0;i<16;i++)sp.append(mk('b',null,['DANCE ♥','KNIT ♥','CROCHET ♥','REPEAT ♥'][i%4]));fly.append(sp);fly.setAttribute('aria-hidden','true');m.append(fly);
  const stop=mk('button','rv-stop','Stop the rave');stop.type='button';stop.onclick=close;m.append(stop);rv._stop=stop;
  rv.insertBefore(m,rv._wall)}
 function close(){if(!rv)return;const r=rv;rv=null;timers.forEach(clearTimeout);timers=[];r.classList.add('fade');setTimeout(()=>r.remove(),600);document.body.style.overflow='';
  onRaveExit();if(prev&&prev.focus)prev.focus()}
 document.addEventListener('keydown',e=>{if(!rv)return;if(e.key=='Escape'){e.preventDefault();close()}else if(e.key=='Tab'&&rv._stop){e.preventDefault();rv._stop.focus()}});
 balls.forEach(b=>{b.classList.add('disco');b.setAttribute('role','button');b.setAttribute('tabindex','0');b.setAttribute('aria-label','Disco ball: go to the rave');b.removeAttribute('aria-hidden');const t=document.createElementNS('http://www.w3.org/2000/svg','title');t.textContent='Click for a rave!';b.prepend(t);
  b.addEventListener('click',openRave);b.addEventListener('keydown',e=>{if(e.key=='Enter'||e.key==' '){e.preventDefault();openRave()}})});
})();

/* ---------- progress tracking and the project journal ---------- */
/* A "project" = a pattern being made, with every step and chart row as a tick box. Saved in this browser
   (localStorage 'molls-projects'): {id, src:'site'|'maker'|'own', ref, name, craft, status:'doing'|'done'|'hold',
   created, updated, finished, note, secs:[{h, chart?, items:[{t, d}]}]}. Functions only (no top-level consts),
   because route() can run before this part of the file is reached. */
function projAll(){try{const v=JSON.parse(localStorage.getItem('molls-projects')||'[]');return Array.isArray(v)?v:[]}catch(e){return[]}}
function projStore(a){try{localStorage.setItem('molls-projects',JSON.stringify(a));return true}catch(e){return false}}
function projGet(id){return projAll().find(x=>x.id==id)||null}
function projPut(pr){const a=projAll(),i=a.findIndex(x=>x.id==pr.id);pr.updated=Date.now();if(i<0)a.unshift(pr);else a[i]=pr;projStore(a);return pr}
function projDel(id){projStore(projAll().filter(x=>x.id!=id))}
/* only rows and materials can be ticked (your own projects tick everything you typed) */
function projIsRow(t){return /^(?:crown |chart |ribbing |plain )?(rows?|rounds?|rnds?)\s*\d/i.test(String(t||'').trim())}
function projIsMat(h){return /^(materials|colour chart|chart rows)/i.test(String(h||'').trim())||/materials|supplies/i.test(String(h||''))}
function projTk(pr,s,it){if(pr&&pr.src=='own')return true;if(s&&(s.chart||s.m||projIsMat(s.h)))return true;return projIsRow(it&&it.t)}
function projCount(pr){let n=0,d=0;pr.secs.forEach(s=>s.items.forEach(i=>{if(!projTk(pr,s,i))return;n++;if(i.d)d++}));return{n,d,pct:n?Math.round(d*100/n):0}}
function projWhen(t){const m=Math.round((Date.now()-t)/60000);return m<1?'just now':m<60?m+' min ago':m<1440?Math.round(m/60)+' h ago':new Date(t).toLocaleDateString('en-GB',{day:'numeric',month:'short',year:'numeric'})}
/* re-read a pattern's steps and keep the ticks (by position for site patterns, by wording for patterns from the maker) */
function projKeep(pr,secs,byText){
 const had=new Set();if(byText)pr.secs.forEach(s=>s.items.forEach(i=>{if(i.d)had.add(i.t)}));
 let changed=pr.secs.length!=secs.length||!!(secs[0]&&secs[0].m&&!(pr.secs[0]&&pr.secs[0].m));
 const sh=secs[0]&&secs[0].m&&!(pr.secs[0]&&pr.secs[0].m)?1:0;
 const out=secs.map((s,si)=>{const old=pr.secs[si-sh];return{...s,items:s.items.map((it,ii)=>{const o=old&&old.items[ii],d=byText?(had.has(it.t)?1:0):(o&&o.d?1:0);if(!o||o.t!=it.t||!!o.d!=!!d)changed=true;return{t:it.t,d}})}});
 if(changed){pr.secs=out;projPut(pr)}return pr}
function chartRowTexts(ch){const c=CHART(ch.ref),rws=c.rows.slice().reverse();return rws.map((r,i)=>`${ch.rnd?'Round':'Row'} ${i+1}: `+collapseCab([...r].reverse()).map(x=>/\d/.test(x)?LET(+x):x=='k'?'k':x=='p'?'p':x=='o'?'yo':x=='/'?'k2tog':x=='\\'?'ssk':x=='f'?'C4F':x=='b'?'C4B':x=='F'?'C2F':x=='B'?'C2B':x=='g'?'C3F':x=='h'?'C3B':x).join(' '))}
function sitePatSecs(p){const out=[],mats=[p.yarn,patTool(p),p.notions].filter(Boolean).map(t=>({t,d:0}));if(mats.length)out.push({h:'Materials',m:1,items:mats});patSteps(p).forEach(sec=>{let run=null;sec.s.forEach(t=>{if(typeof t=='string'){if(!run){run={h:sec.h,items:[]};out.push(run)}run.items.push({t,d:0})}else{run=null;const ch=p.charts.find(c=>c.id==t.chart);out.push({h:sec.h+': '+ch.cap,chart:ch.id,items:chartRowTexts(ch).map(x=>({t:x,d:0}))})}})});return out}
function makerSecs(steps,chart){const out=[];if(chart&&chart.grid)out.push({h:'Colour chart: '+chart.name,items:Array.from({length:chart.grid.h},(_,i)=>({t:`Row ${i+1} of ${chart.grid.h}`,d:0}))});
 (steps||[]).forEach(s=>{const items=String(s.instructions||'').split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({t,d:0}));if(items.length)out.push({h:s.title||'Instructions',items})});return out}
function makerTrack(recId,name,craft,steps,chart){const id='maker-'+recId,secs=makerSecs(steps,chart);let pr=projGet(id);
 if(!pr)pr=projPut({id,src:'maker',ref:recId,name:name||'Untitled pattern',craft:craft||'',status:'doing',created:Date.now(),finished:0,note:'',secs});
 else{pr.name=name||pr.name;pr.craft=craft||pr.craft;pr=projKeep(pr,secs,true);projPut(pr)}return pr}
function savedPatternJournalSections(record){
 const fields=record.fields||{},out=[];
 const materials=[['Yarn or materials',fields.yarn],['Tools',fields.tools],['Notions and other supplies',fields.notions]].flatMap(([label,value])=>String(value||'').split(/\r?\n/).map(x=>x.trim()).filter(Boolean).map(t=>({t:`${label}: ${t}`,d:0})));
 if(materials.length)out.push({h:'Materials and supplies',m:1,items:materials});
 if(record.chart&&record.chart.grid&&!record.bag){const h=record.chart.grid.h;out.push({h:'Colour chart: '+record.chart.name,chart:'saved',items:Array.from({length:h},(_,i)=>({t:`Row ${i+1} of ${h}`,d:0}))})}
 (record.steps||[]).forEach(step=>{const items=String(step.instructions||'').split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({t,d:0}));if(items.length)out.push({h:step.title||'Instructions',items})});
 if(record.bag&&record.bag.build=='hat'){const bp=record.bag.P||{},rn=Math.max(1,Math.round((bp.rl||16)/10*(bp.gr||30))),mk=(w,n)=>Array.from({length:n},(_,i)=>({t:`${w} round ${i+1} of ${n}`,d:0}));
  out.forEach(sec=>{if(/^cast on and ribbing/i.test(sec.h)&&sec.items.length>1)sec.items.splice(1,sec.items.length-1,...mk('Ribbing',rn));
   else if(/^body$/i.test(sec.h)&&bp.pb)sec.items.push(...mk('Plain',bp.pb));
   else if(/^colour chart rounds/i.test(sec.h)&&bp.pa)sec.items.push(...mk('Plain',bp.pa))})}
 if(!out.length)out.push({h:'Pattern',items:[{t:'Review pattern',d:0}]});
 return out
}
function journalSave(pr){projPut(pr);const saved=projGet(pr.id);if(!saved||saved.updated!==pr.updated)throw new Error('The project could not be saved in this browser.');return saved}
function addSavedPatternToJournal(record){
 const id='maker-'+record.id,secs=savedPatternJournalSections(record),fields={...(record.fields||{})};
 const chart=record.chart?{name:record.chart.name,grid:{...record.chart.grid,col:[...record.chart.grid.col],sym:[...record.chart.grid.sym]}}:null;
 const patternData={fields,steps:(record.steps||[]).map(step=>({...step})),chart,photos:savedPatternPhotos(record).map((photo,index)=>({name:photo.name||`Photo ${index+1}`,alt:photo.alt||'',src:photo.src||''}))};
 let pr=projGet(id);
 if(pr){pr.name=record.title||'Untitled pattern';pr.craft=fields.craft||pr.craft;pr.src='maker';pr.ref=record.id;pr.patternData=patternData;pr=projKeep(pr,secs,true);pr.patternData=patternData;journalSave(pr)}
 else journalSave({id,src:'maker',ref:record.id,name:record.title||'Untitled pattern',craft:fields.craft||'',status:'doing',created:Date.now(),finished:0,note:'',secs,patternData});
 return projGet(id)
}
function addSavedChartToJournal(kind,name,chart){
 const id='chart-'+encodeURIComponent(kind)+'-'+encodeURIComponent(name),secs=[{h:'Chart rows',chart:'saved',items:Array.from({length:chart.h},(_,i)=>({t:`Row ${i+1}`,d:0}))}],chartData={kind,name,chart:{...chart,col:[...chart.col],sym:[...chart.sym]}};
 let pr=projGet(id);
 if(pr){pr.name=name;pr.craft=KINDS[kind].n;pr.src='chart';pr.chartData=chartData;pr=projKeep(pr,secs,true);pr.chartData=chartData;journalSave(pr)}
 else journalSave({id,src:'chart',ref:'',name,craft:KINDS[kind].n,status:'doing',created:Date.now(),finished:0,note:'',secs,chartData});
 return projGet(id)
}
function journalSources(){
 const patternSelect=$('#jr-pattern-source'),chartSelect=$('#jr-chart-source'),sourceStatus=$('#jr-source-status');if(!patternSelect||!chartSelect)return;
 const option=(value,label)=>{const item=document.createElement('option');item.value=value;item.textContent=label;return item};
 patternSelect.replaceChildren(option('','Choose a saved pattern'));patternSelect.disabled=true;
 chartSelect.replaceChildren(option('','Choose a saved chart'));chartSelect.disabled=true;
 jrChartChoices={};const errors=[];
 Object.keys(KINDS).forEach(kind=>{try{
  const saved=JSON.parse(localStorage.getItem(Kp(kind))||'{}');
  Object.keys(saved).forEach(name=>{const key=encodeURIComponent(JSON.stringify([kind,name]));jrChartChoices[key]=saved[name];chartSelect.append(option(key,`${name} · ${KINDS[kind].n}`))})
 }catch(e){errors.push(`Saved ${KINDS[kind].n.toLowerCase()} charts could not be loaded: ${e.message||'browser storage error'}`)}});
 chartSelect.disabled=chartSelect.options.length===1;
 allSavedPatterns().then(records=>{
  records.sort((a,b)=>(a.title||'').localeCompare(b.title||''));
  records.forEach(record=>patternSelect.append(option(record.id,record.title||'Untitled pattern')));
  patternSelect.disabled=patternSelect.options.length===1;
  sourceStatus.textContent=errors.join(' ')||(!records.length&&!Object.keys(jrChartChoices).length?'No saved patterns or charts yet. Save one in My stuff first.':'');
  sourceStatus.setAttribute('role',errors.length?'alert':'status')
 }).catch(e=>{errors.push(`Saved patterns could not be loaded: ${e.message||'storage error'}`);sourceStatus.textContent=errors.join(' ');sourceStatus.setAttribute('role','alert')})
}
function projSetTick(id,si,ii,val){const pr=projGet(id);if(!pr||!pr.secs[si]||!pr.secs[si].items[ii]||!projTk(pr,pr.secs[si],pr.secs[si].items[ii]))return null;pr.secs[si].items[ii].d=val?1:0;const c=projCount(pr);
 if(c.n&&c.d==c.n){pr.status='done';pr.finished=pr.finished||Date.now()}else if(pr.status=='done'){pr.status='doing';pr.finished=0}projPut(pr);return pr}
function projPaint(id){const pr=projGet(id);if(!pr)return;const c=projCount(pr);document.querySelectorAll('[data-pbar="'+id+'"]').forEach(b=>{b.querySelector('i').style.width=c.pct+'%';b.setAttribute('aria-valuenow',c.pct);const t=b.nextElementSibling;if(t&&t.classList.contains('pcount'))t.textContent=c.d+' of '+c.n+' done · '+c.pct+'%'+(c.n&&c.d==c.n?' ★ finished!':'')});
 document.querySelectorAll('[data-pstat="'+id+'"]').forEach(s=>{s.value=pr.status})}
function projBar(id,pr){const c=projCount(pr),w=document.createElement('div'),b=document.createElement('div'),f=document.createElement('i'),t=document.createElement('p');b.className='pbar';b.dataset.pbar=id;b.setAttribute('role','progressbar');b.setAttribute('aria-label','Progress');b.setAttribute('aria-valuemin',0);b.setAttribute('aria-valuemax',100);b.setAttribute('aria-valuenow',c.pct);f.style.width=c.pct+'%';b.append(f);
 t.className='pcount';t.textContent=c.d+' of '+c.n+' done · '+c.pct+'%'+(c.n&&c.d==c.n?' ★ finished!':'');w.append(b,t);return w}
/* a tick box (used on the pattern page, in the rows list and in the journal) */
function projBox(id,si,ii,item,label){const l=document.createElement('label'),cb=document.createElement('input');cb.type='checkbox';cb.className='ptick';cb.checked=!!item.d;cb.setAttribute('aria-label',label||'Done');
 cb.onchange=()=>{projSetTick(id,si,ii,cb.checked);l.classList.toggle('pdone',cb.checked);const li=l.closest('li');if(li)li.classList.toggle('pdone',cb.checked);projPaint(id)};l.className='ptk'+(item.d?' pdone':'');l.append(cb);return[l,cb]}
function patTick(li,pr,si,ii){const it=pr.secs[si]&&pr.secs[si].items[ii];if(!it||!projTk(pr,pr.secs[si],it))return;const[l,cb]=projBox(pr.id,si,ii,it,'Mark this step as done');li.classList.add('ptked');if(it.d)li.classList.add('pdone');li.prepend(l)}
function patRowTicks(pr,si,ch){const sec=pr.secs[si],d=document.createElement('details');d.className='prows';if(!sec)return d;const s=document.createElement('summary');s.textContent='Tick off the '+(ch.rnd?'rounds':'rows')+' of this chart ('+sec.items.length+')';d.append(s);
 const g=document.createElement('div');g.className='prg2';sec.items.forEach((it,ii)=>{const[l,cb]=projBox(pr.id,si,ii,it,'Mark '+(ch.rnd?'round ':'row ')+(ii+1)+' as done');l.append(' '+(ii+1));l.title=it.t;g.append(l)});d.append(g);return d}
function patTrackPanel(p,pr){const box=document.createElement('section');box.className='ptrack';box.setAttribute('aria-label','Track your progress');
 const h=document.createElement('h2');h.textContent='Track your progress ✓';box.append(h);
 const row=document.createElement('div');row.className='row';row.style.marginTop='.5rem';
 const btn=(t,f,pri)=>{const b=document.createElement('button');b.type='button';b.textContent=t;if(pri)b.className='pri';b.onclick=f;row.append(b);return b};
 const redo=()=>{const y=scrollY;showPattern(p.id);scrollTo(0,y)};
 if(!pr){const t=document.createElement('p');t.textContent='Tick off your materials and each row as you make this, and keep it in your Project journal (under My stuff) so you can pick it up again any time. Saved on this device.';box.append(t);
  btn('Start tracking this project ✓',()=>{projPut({id:'site-'+p.id,src:'site',ref:p.id,name:p.n,craft:CRAFTS[p.c||'knit'].n,status:'doing',created:Date.now(),finished:0,note:'',secs:sitePatSecs(p)});redo()},true)}
 else{box.append(projBar(pr.id,pr));{const mi=pr.secs.findIndex(x=>x.m);if(mi>=0){const md=document.createElement('div');md.className='pmats';const mh=document.createElement('b');mh.textContent='Tick off your materials';md.append(mh);pr.secs[mi].items.forEach((it,ii)=>{const[l]=projBox(pr.id,mi,ii,it,'Got it: '+it.t);const sp=document.createElement('span');sp.textContent=' '+it.t;l.append(sp);l.classList.add('pmat');md.append(l)});box.append(md)}}
  btn('View in Project journal',()=>{location.hash='#journal-project?id='+encodeURIComponent(pr.id)},true);
  btn('Start again',()=>{const x=projGet(pr.id);if(!x)return;x.secs.forEach(s=>s.items.forEach(i=>i.d=0));x.status='doing';x.finished=0;projPut(x);redo()});
  const st=btn('Stop tracking',()=>{});sureBtn(st,()=>{projDel(pr.id);redo()},'Stop tracking')}
 box.append(row);return box}

/* ---------- Project journal ---------- */
function journal(){const list=$('#jr-list');if(!list)return;if(!Array.isArray(jrPhotoUrls))jrPhotoUrls=[];jrPhotoUrls.forEach(url=>URL.revokeObjectURL(url));jrPhotoUrls=[];journalSources();list.replaceChildren();const all=projAll();
 if(!all.length){const e=document.createElement('p');e.className='lead jr-empty';e.textContent='No projects yet. Open any pattern and press “Start tracking this project”, track a pattern you wrote in the pattern maker, or add your own project above.';list.append(e);return}
 const order={doing:0,hold:1,done:2};all.slice().sort((a,b)=>(order[a.status]-order[b.status])||(b.updated-a.updated)).forEach((pr,i)=>list.append(journalListCard(pr,i)))}
function journalListCard(pr,i){const a=document.createElement('article'),paper=document.createElement('div'),c=document.createElement('div'),id=pr.id;
 a.className='note jr-card n'+(i%4);paper.className='paper t'+(i%3);
 const h=document.createElement('h3');h.textContent=pr.name;
 const meta=document.createElement('p');meta.className='meta';meta.textContent=[pr.craft,pr.src=='site'?'Pattern on the site':pr.src=='maker'?'My saved pattern':pr.src=='chart'?'My saved chart':'My own project','Started '+projWhen(pr.created)].filter(Boolean).join(' · ');
 const status=document.createElement('p');status.className='jr-project-status';status.textContent=({doing:'In progress',hold:'On hold',done:'Finished'})[pr.status]||'In progress';
 const open=document.createElement('button');open.type='button';open.className='pri jr-open-tracker';open.textContent='Open tracker →';open.setAttribute('aria-label','Open tracker for '+pr.name);open.onclick=()=>{location.hash='#journal-project?id='+encodeURIComponent(id)};
 c.append(h,meta,status,projBar(id,pr),open);paper.append(c);a.append(paper);return a}
function showJournalProject(id){const content=$('#jr-project-content');if(!content)return;if(!Array.isArray(jrPhotoUrls))jrPhotoUrls=[];jrPhotoUrls.forEach(url=>URL.revokeObjectURL(url));jrPhotoUrls=[];content.replaceChildren();
 const back=document.createElement('button');back.type='button';back.textContent='← Project journal';back.onclick=()=>{location.hash='#journal'};content.append(back);
 const pr=id&&projGet(id);
 if(!pr){const h=document.createElement('h1'),msg=document.createElement('p');h.textContent='Project tracker';msg.className='lead';msg.textContent='This project could not be found in your journal.';content.append(h,msg);return}
 const h=document.createElement('h1');h.textContent='Project tracker ✎';content.append(h,journalCard(pr,0))}
function journalCard(pr,i){const a=document.createElement('article'),paper=document.createElement('div'),c=document.createElement('div'),id=pr.id;
 a.className='note jr-card n'+(i%4);paper.className='paper t'+(i%3);
 const h=document.createElement('h3');h.textContent=pr.name;
 const meta=document.createElement('p');meta.className='meta';meta.textContent=[pr.craft,pr.src=='site'?'Pattern on the site':pr.src=='maker'?'My saved pattern':pr.src=='chart'?'My saved chart':'My own project','Started '+projWhen(pr.created),'last worked on '+projWhen(pr.updated)].filter(Boolean).join(' · ');
 const lab=document.createElement('label');lab.className='jr-stat';lab.append('Status ');const sel=document.createElement('select');sel.dataset.pstat=id;[['doing','In progress'],['hold','On hold'],['done','Finished']].forEach(([v,t])=>{const o=document.createElement('option');o.value=v;o.textContent=t;sel.append(o)});sel.value=pr.status;
 sel.onchange=()=>{const x=projGet(id);if(!x)return;x.status=sel.value;if(x.status=='done'&&!x.finished)x.finished=Date.now();projPut(x);projPaint(id)};lab.append(sel);
 const act=document.createElement('div');act.className='pm-saved-actions';const msg=document.createElement('p');msg.className='pm-saved-status';msg.setAttribute('role','status');
 const bt=(t,f)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=f;act.append(b);return b};
 const det=document.createElement('div');det.className='jr-list';buildJr(det,pr);
 if(pr.src=='site')bt('Open pattern',()=>{location.hash='#pattern-'+pr.ref});
 if(pr.src=='maker')bt('Open pattern',async()=>{try{await openSavedPattern(pr.ref)}catch(e){msg.textContent='That pattern is no longer saved in My Patterns.'}});
 if(pr.src=='chart'&&pr.chartData)bt('Open chart',()=>{pendProj={n:pr.chartData.name,g:pr.chartData.chart};location.hash='#'+pr.chartData.kind});
 bt('Tracker PDF',async()=>{msg.textContent='Preparing PDF…';try{const x=projGet(id)||pr,data={title:x.name,fields:{craft:x.craft||'',level:'Project tracker',description:'',yarn:'',tools:'',gauge:'',sizes:'',finished:'',notions:'',notes:x.note||''},steps:x.secs.map(s=>({title:s.h,items:s.items.map(i=>({...i,nb:!projTk(x,s,i)}))})),chart:null,tracker:true};
  const pages=await renderPatternPages(data,[]);downloadFile(`${patternFilename(x.name)} tracker.pdf`,await pdfFromPages(pages),'application/pdf');msg.textContent='PDF downloaded. Ticks you have made are shown ticked.'}catch(e){msg.textContent='The PDF could not be made: '+(e.message||'error')}});
 bt('Start again',()=>{const x=projGet(id);if(!x)return;x.secs.forEach(s=>s.items.forEach(i=>i.d=0));x.status='doing';x.finished=0;projPut(x);showJournalProject(id)});
 const del=bt('Delete',()=>{});sureBtn(del,()=>{projDel(id);location.hash='#journal'},'Delete');
 c.append(h,meta,projBar(id,pr),lab,act,msg,det);paper.append(c);a.append(paper);return a}
/* the chart picture in the tracker: click a row to tick it, ticked rows are shaded, the next row is outlined */
function jrRowTrack(id,pr,rt,cbm){const g=rt.g,map={};
 pr.secs.forEach((s,si)=>s.items.forEach((it,ii)=>{const m=/^(?:chart )?(?:round|row)\s+(\d+)/i.exec(String(it.t||'').trim());if(!m)return;const n=+m[1];if(n<1||n>g.h)return;if(s.chart||/^(colour )?chart/i.test(s.h||'')||/^chart round/i.test(it.t)||(g.round&&/^round/i.test(it.t)))if(!map[n])map[n]={si,ii}}));
 if(Object.keys(map).length<2){rt.box.append(rt.cv);return}
 const hint=document.createElement('p');hint.className='meta jr-rowhint';hint.textContent='Click a row on the chart to tick it off. Ticked rows are shaded pink and your next row has a bold outline. Row 1 is the bottom row.';
 const wrap=document.createElement('div'),ov=document.createElement('div');wrap.className='jr-rowtrack';ov.className='jr-rowov';wrap.append(rt.cv,ov);rt.box.append(hint,wrap);
 const bands={};for(let r=1;r<=g.h;r++){if(!map[r])continue;const b=document.createElement('button');b.type='button';b.className='jr-rowband';b.style.top=((g.h-r)/g.h*100)+'%';b.style.height=(100/g.h)+'%';b.title=(g.round?'Round ':'Row ')+r;b.setAttribute('aria-label',(g.round?'Round ':'Row ')+r+', tick off');b.setAttribute('aria-pressed','false');
  b.onclick=()=>{const x=projGet(id),it=x&&x.secs[map[r].si]&&x.secs[map[r].si].items[map[r].ii];if(!it)return;const v=!it.d;projSetTick(id,map[r].si,map[r].ii,v);const cb=cbm[map[r].si+'_'+map[r].ii];if(cb){cb.checked=v;const l=cb.closest('label'),li=cb.closest('li');if(l)l.classList.toggle('pdone',v);if(li)li.classList.toggle('pdone',v)}projPaint(id);paint()};ov.append(b);bands[r]=b}
 const paint=()=>{const x=projGet(id)||pr;let next=0;for(let r=1;r<=g.h;r++){const b=bands[r];if(!b)continue;const d=!!(x.secs[map[r].si]&&x.secs[map[r].si].items[map[r].ii]&&x.secs[map[r].si].items[map[r].ii].d);b.classList.toggle('done',d);b.setAttribute('aria-pressed',d);if(!d&&!next)next=r;b.classList.remove('next')}if(next&&bands[next])bands[next].classList.add('next')};
 Object.values(cbm).forEach(cb=>cb.addEventListener('change',paint));paint()}
function buildJr(det,pr){const id=pr.id;let last='',rowTrk=null;const cbm={};
 if(pr.patternData){
  const info=pr.patternData,fields=info.fields||{},content=document.createElement('section');content.className='jr-pattern-content';
  const title=document.createElement('h4');title.textContent=info.title||pr.name;content.append(title);
  [['Craft',fields.craft],['Level',fields.level],['Description',fields.description],['Gauge',fields.gauge],['Sizes',fields.sizes],['Finished dimensions',fields.finished],['Pattern notes',fields.notes]].forEach(([label,value])=>{if(!String(value||'').trim())return;const p=document.createElement('p'),b=document.createElement('b');b.textContent=label+': ';p.append(b,document.createTextNode(value));content.append(p)});
  if(info.chart&&info.chart.grid){const ch=document.createElement('div'),head=document.createElement('h4'),meta=document.createElement('p');ch.className='jr-pattern-chart';head.textContent='Colour chart: '+info.chart.name;meta.className='meta';meta.textContent=`${info.chart.grid.w} × ${info.chart.grid.h} stitches`;rowTrk={g:info.chart.grid,cv:gridThumb(info.chart.grid,false,600),box:ch};ch.append(head,meta);content.append(ch)}
  if(info.photos&&info.photos.length){const photos=document.createElement('div'),head=document.createElement('h4');photos.className='jr-pattern-photos';head.textContent='Pattern photos';content.append(head,photos);
   getSavedPattern(pr.ref).then(record=>{if(!det.isConnected)return;const found=record?savedPatternPhotos(record).filter(photo=>photo&&(photo.blob instanceof Blob||photo.src)):[];if(!found.length){const p=document.createElement('p');p.className='meta';p.textContent='Pattern photos are no longer available from My Patterns.';photos.append(p);return}
    found.forEach((photo,index)=>{try{const url=photo.blob instanceof Blob?URL.createObjectURL(photo.blob):photo.src,img=document.createElement('img');if(photo.blob instanceof Blob)jrPhotoUrls.push(url);img.src=url;img.alt=photo.alt||info.photos[index]&&info.photos[index].alt||photo.name||`Pattern photo ${index+1}`;photos.append(img)}catch(e){const warning=document.createElement('p');warning.className='meta';warning.textContent=`A pattern photo could not be displayed: ${e.message||'image error'}`;photos.append(warning)}})
   }).catch(e=>{if(!det.isConnected)return;const warning=document.createElement('p');warning.className='meta';warning.setAttribute('role','alert');warning.textContent=`Pattern photos could not be loaded: ${e.message||'storage error'}`;photos.append(warning)})}
  det.append(content)
 }else if(pr.src=='chart'&&pr.chartData){
  const chart=pr.chartData.chart,head=document.createElement('h4'),meta=document.createElement('p');head.textContent=pr.chartData.name;meta.className='meta';meta.textContent=`${KINDS[pr.chartData.kind].n} · ${chart.w} × ${chart.h} stitches`;const cb0=document.createElement('div');det.append(head,meta,cb0);rowTrk={g:{w:chart.w,h:chart.h},cv:gridThumb({w:chart.w,h:chart.h,col:chart.col,sym:chart.sym},!!KINDS[pr.chartData.kind].knit,600),box:cb0,own:1}
 }
 pr.secs.forEach((s,si)=>{if(s.h!=last||s.chart){const h=document.createElement('h4');h.textContent=s.h;det.append(h);last=s.h}
  const ul=document.createElement('ul');ul.className='jr-items';s.items.forEach((it,ii)=>{const li=document.createElement('li'),sp=document.createElement('span');sp.textContent=it.t;if(projTk(pr,s,it)){const[l,cb]=projBox(id,si,ii,it,'Done: '+it.t);cbm[si+'_'+ii]=cb;li.classList.toggle('pdone',!!it.d);l.append(sp);li.append(l)}else{li.classList.add('pnobox');li.append(sp)}ul.append(li)});det.append(ul)});
 if(rowTrk)jrRowTrack(id,pr,rowTrk,cbm);
 const nl=document.createElement('label');nl.className='jr-note';nl.append('Notes (yarn used, mods, what to remember)');const ta=document.createElement('textarea');ta.rows=3;ta.maxLength=3000;ta.value=pr.note||'';ta.placeholder='e.g. Used 2 skeins of the green. Made the brim 2 rows longer.';
 ta.oninput=()=>{const x=projGet(id);if(!x)return;x.note=ta.value;projPut(x)};nl.append(ta);det.append(nl)}
function journalInit(){const f=$('#jr-add');if(!f||f.dataset.on)return;f.dataset.on=1;
 f.onsubmit=e=>{e.preventDefault();const n=$('#jr-name').value.trim(),m=$('#jr-msg');if(!n){m.textContent='Give your project a name first.';return}
  const items=$('#jr-steps').value.split('\n').map(x=>x.trim()).filter(Boolean).map(t=>({t,d:0}));if(!items.length)items.push({t:'Finished!',d:0});
  projPut({id:'own-'+Date.now().toString(36),src:'own',ref:'',name:n,craft:$('#jr-craft').value,status:'doing',created:Date.now(),finished:0,note:'',secs:[{h:'Steps',items}]});f.reset();m.textContent='Added.';journal()};
 const addPattern=$('#jr-add-pattern'),addChart=$('#jr-add-chart'),importMsg=$('#jr-import-msg');
 addPattern.addEventListener('click',async()=>{const id=$('#jr-pattern-source').value;if(!id){importMsg.textContent='Choose a saved pattern first.';return}addPattern.disabled=true;importMsg.textContent='Adding pattern…';try{const record=await getSavedPattern(id);if(!record)throw new Error('That saved pattern is no longer available.');addSavedPatternToJournal(record);journal();importMsg.textContent='Pattern added to the journal with materials, chart rows and instructions ready to tick off.'}catch(e){importMsg.textContent=`Could not add the pattern: ${e.message||'storage error'}`}finally{addPattern.disabled=false}});
 addChart.addEventListener('click',()=>{const key=$('#jr-chart-source').value,chart=jrChartChoices[key];if(!key||!chart){importMsg.textContent='Choose a saved chart first.';return}addChart.disabled=true;importMsg.textContent='Adding chart…';try{const[kind,name]=JSON.parse(decodeURIComponent(key));addSavedChartToJournal(kind,name,chart);journal();importMsg.textContent='Chart added to the journal with its rows ready to tick off.'}catch(e){importMsg.textContent=`Could not add the chart: ${e.message||'storage error'}`}finally{addChart.disabled=false}})
}
journalInit();
/* the pattern maker: tracker option for the PDF and a Track progress button */
{const b=$('#pm-track');if(b&&!b.dataset.on){b.dataset.on=1;b.addEventListener('click',async()=>{if(!requirePatternTitle())return;await savePattern();if(!editingPatternId)return;try{const record=await getSavedPattern(editingPatternId);if(!record)throw new Error('The saved pattern could not be found.');const project=addSavedPatternToJournal(record);location.hash='#journal-project?id='+encodeURIComponent(project.id)}catch(e){$('#pm-status').textContent=`Could not add this pattern to the journal: ${e.message||'storage error'}`}})}}
/* progress tracking: row-by-row boxes and checklists for the PDF */
function pmCardFrame(state,x,y,w,height,variant){const c=state.page.ctx;c.fillStyle=PM_BG[variant%PM_BG.length];c.fillRect(x+5,y+5,w,height);c.fillStyle='#fff';c.fillRect(x,y,w,height);c.strokeStyle='#1b1022';c.lineWidth=3;c.strokeRect(x,y,w,height)}
function pmDrawBox(c,x,y,s,done){c.fillStyle='#fff';c.fillRect(x,y,s,s);c.strokeStyle='#1b1022';c.lineWidth=3;c.strokeRect(x,y,s,s);if(done){c.strokeStyle='#ff2d95';c.lineWidth=4;c.lineCap='round';c.lineJoin='round';c.beginPath();c.moveTo(x+4,y+s*.55);c.lineTo(x+s*.42,y+s-4);c.lineTo(x+s-3,y+2);c.stroke();c.lineCap='butt'}}
function pmDrawChecklist(state,title,items,variant=0){
 const maxWidth=PM_PAGE_W-PM_MARGIN*2-48,titleLine=40,bodyLine=30,bodyFont='500 19px "Fredoka", sans-serif',tf='800 28px "Baloo 2", "Fredoka", sans-serif',BOX=22,IND=40,GAP=10;
 let ctx=state.page.ctx;ctx.font=bodyFont;const rows=items.map(it=>({d:it.d,nb:it.nb,lines:pmWrap(ctx,it.t,maxWidth-36-IND)}));let i=0,first=true;
 while(i<rows.length){
  ctx=state.page.ctx;ctx.font=tf;const head=pmWrap(ctx,first?title:`${title} (continued)`,maxWidth-84),avail=PM_CONTENT_BOTTOM-state.page.y-18-head.length*titleLine-8-10;
  let used=0,j=i;while(j<rows.length){const hh=rows[j].lines.length*bodyLine+GAP;if(used+hh>avail)break;used+=hh;j++}
  if(j==i){if(state.page.y>PM_MARGIN){state.page=pmNewPage(state.pages);continue}j=i+1;used=rows[i].lines.length*bodyLine+GAP}
  const height=18+head.length*titleLine+8+used+10,x=PM_MARGIN,y=state.page.y,w=PM_PAGE_W-PM_MARGIN*2;pmCardFrame(state,x,y,w,height,variant);const c=state.page.ctx;
  c.fillStyle='#ff5cad';c.fillRect(x+w-42,y-10,32,32);c.strokeStyle='#1b1022';c.lineWidth=3;c.strokeRect(x+w-42,y-10,32,32);c.fillStyle='#1b1022';c.font='900 22px sans-serif';c.textAlign='center';c.textBaseline='middle';c.fillText('✦',x+w-26,y+6);
  c.textAlign='left';c.textBaseline='top';c.fillStyle='#161616';c.font=tf;head.forEach((l,k)=>c.fillText(l,x+18,y+18+k*titleLine,maxWidth-84));
  let ty=y+18+head.length*titleLine+8;rows.slice(i,j).forEach(r=>{if(!r.nb)pmDrawBox(c,x+18,ty+3,BOX,r.d);c.fillStyle='#242124';c.font=bodyFont;c.textBaseline='top';r.lines.forEach((l,k)=>c.fillText(l,x+18+IND,ty+k*bodyLine,maxWidth-36-IND));ty+=r.lines.length*bodyLine+GAP});
  state.page.y=y+height+22;i=j;first=false}}
function pmDrawRowBoxes(state,n){
 const w=PM_PAGE_W-PM_MARGIN*2,cell=76,cols=Math.max(1,Math.floor((w-36)/cell)),rws=Math.ceil(n/cols),height=18+40+8+rws*42+12;
 if(state.page.y+height>PM_CONTENT_BOTTOM&&state.page.y>PM_MARGIN)state.page=pmNewPage(state.pages);
 const x=PM_MARGIN,y=state.page.y;pmCardFrame(state,x,y,w,Math.min(height,PM_CONTENT_BOTTOM-y),2);const c=state.page.ctx;
 c.textAlign='left';c.textBaseline='top';c.fillStyle='#161616';c.font='800 28px "Baloo 2", "Fredoka", sans-serif';c.fillText('Row tracker (tick each row)',x+18,y+16);
 c.font='600 17px "Fredoka", sans-serif';for(let k=0;k<n;k++){const cx=x+18+(k%cols)*cell,cy=y+18+40+8+Math.floor(k/cols)*42;if(cy+30>PM_CONTENT_BOTTOM)break;pmDrawBox(c,cx,cy+2,22,false);c.fillStyle='#242124';c.fillText(String(k+1),cx+28,cy+2)}
 state.page.y=y+Math.min(height,PM_CONTENT_BOTTOM-y)+22}
function pmDrawNoteLines(state){
 const w=PM_PAGE_W-PM_MARGIN*2,height=18+40+8+6*44+10;if(state.page.y+height>PM_CONTENT_BOTTOM&&state.page.y>PM_MARGIN)state.page=pmNewPage(state.pages);
 const x=PM_MARGIN,y=state.page.y;pmCardFrame(state,x,y,w,height,0);const c=state.page.ctx;c.textAlign='left';c.textBaseline='top';c.fillStyle='#161616';c.font='800 28px "Baloo 2", "Fredoka", sans-serif';c.fillText('My notes',x+18,y+16);
 c.strokeStyle='#1b1022';c.lineWidth=2;for(let k=1;k<=6;k++){const ly=y+18+40+8+k*44-8;c.beginPath();c.moveTo(x+18,ly);c.lineTo(x+w-18,ly);c.stroke()}state.page.y=y+height+22}
$$('[data-jump]').forEach(b=>b.onclick=()=>{const e=document.getElementById(b.dataset.jump);if(e)e.scrollIntoView({behavior:'smooth',block:'start'})});

/* text height: every font except the pixel one reads best from 11 stitches tall */
(()=>{const f=document.getElementById('mfont'),t=document.getElementById('mth');if(!f||!t)return;const sync=()=>{const mn=f.value=='pixel'?7:f.value=='round'?8:f.value=='mono'?9:11;t.min=mn;if(+t.value<mn)t.value=mn};f.addEventListener('change',sync);t.addEventListener('change',sync);sync()})();

/* ---------- write a pattern for the garment: step 4, how will it be knitted ---------- */
const GBUILDS=[
 {id:'flat',t:'Two flat panels',d:'Knit a front and a back panel flat, back and forth, then sew them together along the sides and bottom.',tag:'Front and back panels, sewn up'},
 {id:'round',t:'In the round (magic loop)',d:'Cast on with Judy\'s magic cast on and knit the bag as a seamless tube on a long circular needle. The cast on closes the bottom, so there are no seams at all.',tag:'Seamless tube, no seams'},
 {id:'long',t:'One long piece',d:'Knit one long vertical panel: cast on one panel width, knit the back upside down, then the front right way up above it. Fold it in half and sew up the sides. The fold is the bottom of the bag.',tag:'One long panel, folded and sewn at the sides'}];
function garBuild(){
 const g=GARMENTS.find(x=>x.id==GP.stage.id)||GARMENTS[0],noun=g.noun||g.n.toLowerCase(),box=$('#gp4-list');
 $('#gp4-q').textContent=`How will you knit your ${noun}?`;
 box.innerHTML='';
 GBUILDS.forEach(o=>{const b=document.createElement('button');b.type='button';b.className='gp-card gp-build'+(GP.build==o.id?' picked':'');b.setAttribute('aria-pressed',GP.build==o.id);const t=document.createElement('b'),d=document.createElement('small');t.textContent=o.t;d.textContent=o.d;b.append(t,d);b.onclick=()=>{GP.build=o.id;try{localStorage.setItem('molls-garment-build',o.id)}catch(e){}garBuild()};box.append(b)});
 const o=GBUILDS.find(x=>x.id==GP.build);$('#gp4-note').textContent=o?`You chose: ${o.t}. ${o.tag}.`:'Pick one to carry on.';const okB=!!GBUILDS.find(x=>x.id==GP.build);$('#gp4-go').hidden=!okB;$$('#gp-steps [data-n="5"]').forEach(b=>b.disabled=!okB||!GP.stage.count());
}

/* ---------- the written pattern: two flat panels ---------- */
const GCOLNAMES=[['#000000','Black'],['#ffffff','White'],['#808080','Grey'],['#c0c0c0','Light grey'],['#ff0000','Red'],['#b23a48','Madder red'],['#ff5cad','Hot pink'],['#ff9acb','Pink'],['#f7c6dc','Pale pink'],['#ffa500','Orange'],['#ffe552','Yellow'],['#d9a21b','Mustard'],['#2fbf71','Green'],['#5f7a3b','Moss green'],['#8cf5b4','Mint'],['#2563eb','Blue'],['#9ec5ff','Light blue'],['#26335b','Navy'],['#7fb2d6','Sky blue'],['#b9a3ff','Lilac'],['#8a7ca8','Heather purple'],['#800080','Purple'],['#8b4513','Brown'],['#7d634c','Brown'],['#ccb187','Tan'],['#d9c6a3','Natural oat'],['#f4f1ea','Oat'],['#1b1022','Near black']];
const gcn=hx=>{if(NAMES[hx])return NAMES[hx];const n=parseInt(hx.slice(1),16),r=n>>16,g=(n>>8)&255,b=n&255;let best='Colour',bd=1e9;GCOLNAMES.forEach(([k,v])=>{const m=parseInt(k.slice(1),16),d=(r-(m>>16))**2+(g-((m>>8)&255))**2+(b-(m&255))**2;if(d<bd){bd=d;best=v}});return best};
const gtext=hx=>{const n=parseInt(hx.slice(1),16),l=((n>>16)*.299+((n>>8)&255)*.587+(n&255)*.114);return l>150?'#111':'#fff'};
const gesc=t=>String(t).replace(/[&<>"]/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[m]));
function gpChart(panel,letter,hexOf,flip,rnd,hs){ // one chart picture: row 1 at the bottom, RS rows read right to left
 const{w,h}=panel,cell=rnd?Math.max(10,Math.min(20,Math.floor(900/w))):Math.max(12,Math.min(20,Math.floor(760/w))),mL=58,mR=58,mT=rnd||hs?24:8,mB=hs?44:24,cv=document.createElement('canvas'),dpr=2;
 cv.width=(w*cell+mL+mR)*dpr;cv.height=(h*cell+mT+mB)*dpr;cv.style.width=(w*cell+mL+mR)+'px';const x=cv.getContext('2d');x.scale(dpr,dpr);x.fillStyle='#fff';x.fillRect(0,0,cv.width,cv.height);
 x.font=`${Math.round(cell*.62)}px monospace`;x.textAlign='center';x.textBaseline='middle';
 for(let r=0;r<h;r++)for(let c=0;c<w;c++){const hx=hexOf(panel.col[r*w+c]),px=mL+c*cell,py=mT+r*cell;
  x.fillStyle=hx;x.fillRect(px,py,cell,cell);x.fillStyle=gtext(hx);x.fillText(letter[hx],px+cell/2,py+cell/2+1)}
 x.strokeStyle='rgba(0,0,0,.25)';x.lineWidth=1;for(let i=0;i<=w;i++){x.beginPath();x.moveTo(mL+i*cell+.5,mT);x.lineTo(mL+i*cell+.5,mT+h*cell);x.stroke()}for(let j=0;j<=h;j++){x.beginPath();x.moveTo(mL,mT+j*cell+.5);x.lineTo(mL+w*cell,mT+j*cell+.5);x.stroke()}
 if(rnd){x.strokeStyle='#e0007a';x.lineWidth=4;x.beginPath();x.moveTo(mL+rnd*cell,mT-4);x.lineTo(mL+rnd*cell,mT+h*cell);x.stroke()}
 if(hs){x.strokeStyle='#e0007a';x.lineWidth=4;x.beginPath();x.moveTo(mL-4,mT+(h-hs)*cell);x.lineTo(mL+w*cell+4,mT+(h-hs)*cell);x.stroke()}
 x.strokeStyle='#000';x.lineWidth=2;for(let i=w%5;i<=w;i+=5){x.beginPath();x.moveTo(mL+i*cell,mT);x.lineTo(mL+i*cell,mT+h*cell);x.stroke()}for(let j=h%5;j<=h;j+=5){x.beginPath();x.moveTo(mL,mT+j*cell);x.lineTo(mL+w*cell,mT+j*cell);x.stroke()}
 x.fillStyle='#111';x.font=`${Math.round(cell*.6)}px monospace`;
 for(let r=1;r<=h;r++){const py=mT+(h-r)*cell+cell/2;const rs=rnd||r%2;x.textAlign=rs?'left':'right';x.fillText(rs?`← k ${r}`:`→ p ${r}`,rs?mL+w*cell+4:mL-4,py)}
 if(hs){x.font=`bold ${Math.round(cell*.7)+2}px monospace`;x.textAlign='center';x.fillStyle='#111';x.fillText('FRONT (right way up)',mL+w*cell/2,10);x.fillText('BACK (upside down)',mL+w*cell/2,mT+h*cell+34)}
 if(rnd){x.font=`bold ${Math.round(cell*.7)+2}px monospace`;x.textAlign='center';x.fillText('BACK',mL+rnd*cell/2,10);x.fillText('FRONT',mL+rnd*cell+(w-rnd)*cell/2,10)}
 x.textAlign='center';for(let c=0;c<w;c++){const n=w-c;if(n==1||n%5==0)x.fillText(n,mL+c*cell+cell/2,mT+h*cell+13)}
 return cv}
function gpRows(panel,letter,hexOf){const{w,h}=panel,out=[];
 for(let r=1;r<=h;r++){const y=h-r,rs=r%2==1,row=[];for(let i=0;i<w;i++){const x=rs?w-1-i:i;row.push(letter[hexOf(panel.col[y*w+x])])}
  const runs=[];row.forEach(l=>{if(runs.length&&runs[runs.length-1][0]==l)runs[runs.length-1][1]++;else runs.push([l,1])});
  out.push(`<b>Row ${r} (${rs?'RS':'WS'}):</b> ${runs.map(([l,n])=>`${rs?'k':'p'}${n} ${l}`).join(', ')}.`)}
 return out}
function gpRoundRows(front,back,letter,label){label=label||'Round';const out=[],runsOf=(p,y)=>{const row=[];for(let i=0;i<p.w;i++)row.push(letter[p.col[y*p.w+(p.w-1-i)]]);const runs=[];row.forEach(l=>{if(runs.length&&runs[runs.length-1][0]==l)runs[runs.length-1][1]++;else runs.push([l,1])});return runs.map(([l,n])=>`k${n} ${l}`).join(', ')};
 for(let r=1;r<=front.h;r++){const y=front.h-r,yb=Math.min(y,back.h-1);out.push(`<b>${label} ${r}:</b> <i>Front</i> ${runsOf(front,y)}. <i>Back</i> ${runsOf(back,yb)}.`)}return out}
function gpSrcFromStage(){
 const st=GP.stage,g=GARMENTS.find(x=>x.id==st.id)||GARMENTS[0],P=GP.pat=GP.pat||(g.hat?{gs:22,gr:30,nd:3.5,yarn:'DK yarn (wool or a wool blend)',rl:16,pb:4,pa:8}:{gs:22,gr:28,nd:4,yarn:'DK or light worsted yarn (cotton or wool)',hl:45,hw:8}),MC=st.mainHex(),cropL=p=>{const c=g.crop||0;if(!c)return p;const w=p.w-c,col=[];for(let y=0;y<p.h;y++)for(let x=c;x<p.w;x++)col.push(p.col[y*p.w+x]);return{...p,w,col}},fr=cropL(st.panel('front')),bk=st.same?fr:cropL(st.panel('back')),fc=fr.col.map(v=>v||MC),bc=bk.col.map(v=>v||MC),same=fc.every((v,i)=>v===bc[i]);
 return{build:g.hat?'hat':GP.build=='round'||GP.build=='long'?GP.build:'flat',gn:g.n,noun:g.noun||g.n.toLowerCase(),front:{w:fr.w,h:fr.h,col:fc},back:{w:bk.w,h:bk.h,col:bc},same,MC,mcName:st.bagCol?gcn(st.bagCol):(g.mcName||'natural oat'),imgF:st.pic('front'),imgB:same?'':st.pic('back'),P}}
function garPattern(fresh){if(fresh||!GP.src)GP.src=gpSrcFromStage();gpRender($('#gp5-out'),GP.src,fresh,null)}
function gpRender(box,src,fresh,savedId){gpRender0(box,src,fresh,savedId);const b=box.querySelector('.gp5-body');if(b)termsMount(b,'knit')}
function gpRender0(box,src,fresh,savedId){
 const g={n:src.gn},noun=src.noun,P=src.P;
 if(fresh){const saveBtns=savedId?`<button type="button" class="gps-pat pri">Save changes</button><button type="button" class="gps-view">Back to My Patterns</button>`:`<button type="button" class="gps-charts">Save colour charts</button><button type="button" class="gps-pat pri">Save pattern to My Patterns</button><button type="button" class="gps-view" hidden>View My Patterns</button>`;
  box.innerHTML=`<div class="gpat-save"><label>Name your ${noun} <input type="text" class="gps-name" maxlength="60" value="${gesc(P.name||'')}" placeholder="e.g. Cherry tote"></label><label class="gps-chk"><input type="checkbox" class="gps-inc" ${P.inc===false?'':'checked'}> Include the colour chart in the pattern</label><div class="gps-btns">${saveBtns}</div><p class="hint gps-msg" role="status"></p></div><div class="gpat-form"><label>Stitches in 10 cm <input type="number" min="8" max="40" data-k="gs" value="${P.gs}"></label><label>${src.build=='round'||src.build=='hat'?'Rounds':'Rows'} in 10 cm <input type="number" min="10" max="60" data-k="gr" value="${P.gr}"></label><label>Needles (mm) <input type="number" min="2" max="12" step=".25" data-k="nd" value="${P.nd}"></label>${src.build=='hat'?`<label>Ribbing length (cm) <input type="number" min="4" max="30" data-k="rl" value="${P.rl}"></label><label>Plain rounds before the chart <input type="number" min="0" max="30" data-k="pb" value="${P.pb}"></label><label>Plain rounds after the chart <input type="number" min="0" max="40" data-k="pa" value="${P.pa}"></label>`:`<label>Handle length (cm) <input type="number" min="15" max="120" data-k="hl" value="${P.hl}"></label><label>Handle width (stitches) <input type="number" min="4" max="20" data-k="hw" value="${P.hw}"></label>`}<label class="wide">Yarn <input type="text" data-k="yarn" value="${gesc(P.yarn)}"></label></div><div class="gpat-sheet gp5-body"></div>`;
  gpSaveWire(box,src,savedId);box.querySelectorAll('input[data-k]').forEach(i=>i.oninput=()=>{const k=i.dataset.k;P[k]=i.type=='number'?(+i.value||P[k]):i.value;gpRender(box,src,false,savedId)})}
 const body=box.querySelector('.gp5-body'),front=src.front,back=src.same?src.front:src.back,same=src.same,MC=src.MC;
 const hexOf=v=>v,cnt={};[front,same?null:back].forEach(p=>{if(!p)return;p.col.forEach(v=>{const k=hexOf(v);cnt[k]=(cnt[k]||0)+1})});cnt[MC]=cnt[MC]||0;
 const others=Object.keys(cnt).filter(k=>k!=MC).sort((a,b)=>cnt[b]-cnt[a]),letter={};letter[MC]='MC';others.forEach((k,i)=>letter[k]='ABCDEFGHIJKLMNOPQRSTUVWXYZ'[i]||('C'+(i+1)));
 const cm=n=>Math.round(n*10)/10,W=front.w,H=front.h,wcm=cm(W/P.gs*10),hcm=cm(H/P.gr*10),per=p=>{const o={};p.col.forEach(v=>{const k=hexOf(v);o[k]=(o[k]||0)+1});return o},pf=per(front);
 const mcName=src.mcName,imgF=src.imgF,imgB=src.imgB;
 const hx=h=>`<span class="gsw-d" style="background:${h}"></span>`,pl=(n,w)=>n==1?w:w+'s';
 const colRows=[MC,...others].map(k=>`<tr><td>${hx(k)}</td><td><b>${letter[k]}</b></td><td>${k==MC?gesc(mcName)+' (main colour: the bag itself)':gesc(gcn(k))}</td><td>${pf[k]||0}${same?'':' / '+(per(back)[k]||0)}</td></tr>`).join('');
 const hl=P.hl,sIn=6,hw=P.hw,Wb0=back.w,hs1=sIn+1,hs2=sIn+hw,he1=W-sIn-hw+1,he2=W-sIn;
 const frontRows=gpRows(front,letter,hexOf),backRows=same?null:gpRows(back,letter,hexOf);
 const Wb=back.w,TOT=W+Wb,rcm=cm(TOT/P.gs*10),isR=src.build=='round';
 const isL=src.build=='long',T=H*2,comb2=isL?(()=>{const c={w:W,h:T,col:[]};for(let y=0;y<H;y++)for(let x=0;x<W;x++)c.col.push(front.col[y*W+x]);for(let y=0;y<H;y++){const sy=Math.min(back.h-1,H-1-y);for(let x=0;x<W;x++)c.col.push(back.col[sy*back.w+Math.min(back.w-1,W-1-x)])}return c})():null,longRows=isL?gpRows(comb2,letter,hexOf):[],tcm=cm(T/P.gr*10);
 const roundRows=isR?gpRoundRows(front,back,letter):[],bs=Wb,hsB=he1;
 const roundHTML=isR?`<h1>${gesc(g.n)} with colourwork: knitted in the round (magic loop)</h1>
 <p class="gp-sub">A written pattern and charts made from your bag design. No side seams and no bottom seam.</p>
 <div class="gpat-pics gpat-main"><figure><img src="${imgF}" alt="Your ${noun}, front"><figcaption>Front of the ${noun}${same?' (the back is the same design)':''}</figcaption></figure></div>
 <h2>At a glance</h2><ul><li><b>Finished size:</b> about ${wcm} cm wide and ${hcm} cm tall (${W} stitches across the front, ${Wb} across the back, ${H} rounds), before handles. The tube measures about ${rcm} cm all the way round. This changes with your gauge.</li><li><b>Gauge:</b> ${P.gs} stitches and ${P.gr} rounds to 10 cm in stocking stitch colourwork, on ${P.nd} mm needles. Knit your swatch in the round, because flat and round swatches often come out a different size. Change needle size to match.</li><li><b>Yarn:</b> ${gesc(P.yarn)}.</li><li><b>You need:</b> a ${P.nd} mm circular needle with a long cable (80 cm or more, 100 cm is easiest) for magic loop, 2 stitch markers (one for the start of each round, one for the halfway point between front and back), a tapestry needle, scissors and pins.</li></ul>
 <h2>Colours</h2><table class="gpat-t"><thead><tr><th></th><th>Letter</th><th>Colour</th><th>Stitches ${same?'per side':'front / back'}</th></tr></thead><tbody>${colRows}</tbody></table>
 <p>Stitch counts are for the coloured stitches on each side, so you can judge how much of each yarn you need. Buy a little more of every colour than you think, and more of MC, because the handles and the plain areas all use it.</p>
 <h2>Notes</h2><ul><li>This bag is worked in the round, in stocking stitch: <b>every round is knit</b>. You never purl.</li><li>The two charts sit side by side as one chart: the <b>back is on the left and the front is on the right</b>. Each round reads the front first, then the back, always from right to left.</li><li>Charts are read from the bottom up. Round 1 is the bottom row, and every round is read from right to left.</li><li>Work coloured stitches in stranded colourwork. Carry the colour you are not using loosely across the inside, and twist it round the working yarn every 4 or 5 stitches so the floats do not get long. Intarsia cannot be worked in the round, so for a big block of one colour, knit it in that colour and let the other colour float, catching it every 4 or 5 stitches.</li><li>Stocking stitch curls at the top edge. This is expected, and blocking helps it lie flat.</li></ul>
 <h2>Abbreviations</h2><p>k: knit. MC: main colour. st(s): stitch(es). ${others.map(k=>`${letter[k]}: ${gesc(gcn(k))}`).join(', ')}.</p>
 <h2>Chart</h2><p class="gp-key">Key:${[MC,...others].map(k=>` ${hx(k)} ${letter[k]} = ${k==MC?'main colour':gesc(gcn(k))}`).join(' ·')}</p>
 <div class="gpat-chart" id="gpc-r"><h3>Colour chart: back on the left, front on the right</h3></div>
 <h2>Cast on</h2>
 <p>With MC and your ${P.nd} mm circular needle, cast on <b>${TOT}</b> stitches using Judy's magic cast on: <b>${W}</b> stitches on the front needle and <b>${Wb}</b> stitches on the back needle (${TOT} in all).</p>
 <p>Pull the cable through so you can work magic loop: the front stitches are on the needle nearest you and the back stitches are on the other needle. The cast on edge is the bottom of the ${noun}, and it is already closed, so there is no bottom seam to sew.</p>
 <p><b>Use stitch markers at the start of each round.</b> Place a marker at the start of the round, at the right edge of the front, and slip it every round so you always know where Round 1 begins and where each new round starts. Place a second marker after the ${W}th stitch, between the front and the back, so you can see where to change from the front chart to the back chart. The front stitches are the first ${W} stitches of every round, and the back stitches are the last ${Wb}.</p>
 <h2>Body</h2>
 <p>Join to work in the round, with the start-of-round marker in place. Work Rounds 1 to ${H} in stocking stitch (knit every round), reading the chart from the bottom up. On each round, work the front chart from right to left across the ${W} front stitches, then slip the halfway marker and work the back chart from right to left across the ${Wb} back stitches. Slip the start-of-round marker when you reach it, and a new round begins. You can follow the chart, or the written rounds below.</p>
 <p>When the first few rounds are done, pull the cast on tail to close any small gap at the two bottom corners, and weave it in.</p>
 <ol class="gpat-rows">${roundRows.map(r=>`<li>${r}</li>`).join('')}</ol>
 <p>You now have ${TOT} stitches on your needle. This is the end of the colour chart.</p>
 <h2>Top edge</h2><p>Knit one more round in MC, then bind off all ${TOT} stitches loosely in MC, knitwise. Break the yarn and fasten off.</p>
 <h2>Straps (make 2)</h2><p>The bag has two straps, one for the front panel and one for the back panel. Make both the same. With MC, cast on <b>${hw}</b> stitches. Knit every row (garter stitch) until the strap measures about <b>${hl} cm</b>, or the length you like. This is the length of the loop you will carry the bag with, plus about 6 cm to sew into the bag. Each strap is sewn to one panel only. Bind off loosely. For a rounder strap, you can instead work a ${Math.min(5,Math.max(3,Math.round(hw/2)))}-stitch i-cord to the same length.</p>
 <h2>Finishing</h2><ol><li><b>Weave in ends.</b> Weave in all the loose ends on the inside, going along stitches of the same colour so they do not show on the front.</li><li><b>Block.</b> Pin the bag out flat to ${wcm} cm wide and ${hcm} cm tall, then spray lightly with water or steam it gently. Let it dry flat. Do not press hard on the colourwork.</li><li><b>No seams.</b> Because you cast on with Judy's magic cast on and worked in the round, the bag has no side seams and no bottom seam. If you see a small hole at a bottom corner, close it with the cast on tail.</li><li><b>Attach the straps.</b> The bag has two straps. Each strap is sewn onto <b>one panel only</b>: strap 1 on the front, strap 2 on the back. The front of the bag is ${W} stitches wide. Put one end of strap 1 on the inside of the front's top edge, covering stitches ${hs1} to ${hs2} (counting from the left side edge), and overlap about 3 cm. Pin it. Put the other end on the same panel, on stitches ${he1} to ${he2}, so the strap forms a loop. Sew each end down with small stitches in MC, going round the edges of the strap. Sew a few rows over the top as well for strength. Now do the same with strap 2 on the inside of the back's top edge, covering stitches ${sIn+1} to ${sIn+hw} and ${Wb0-sIn-hw+1} to ${Wb0-sIn}, so the back strap sits directly behind the front strap. Do not sew either strap to the other panel.</li><li><b>Finish.</b> Weave in the last ends. If you like, sew a fabric lining into the bag to keep its shape and stop things poking through.</li></ol>
 <p class="gp-foot">Pattern made with Moll's Studio. Always check your gauge before you start.</p>`:'';
 const longHTML=isL?`<h1>${gesc(g.n)} with colourwork: knitted as one long piece</h1>
 <p class="gp-sub">A written pattern and charts made from your bag design. One panel, no bottom seam.</p>
 <div class="gpat-pics gpat-main"><figure><img src="${imgF}" alt="Your ${noun}, front"><figcaption>Front of the ${noun}${same?' (the back is the same design)':''}</figcaption></figure></div>
 <h2>At a glance</h2><ul><li><b>Finished size:</b> about ${wcm} cm wide and ${hcm} cm tall (${W} stitches and ${H} rows for each side), before straps. This changes with your gauge.</li><li><b>The piece as you knit it:</b> one long vertical panel, ${W} stitches wide and ${T} rows long, about ${wcm} cm wide and ${tcm} cm long. It is folded in half to make the bag.</li><li><b>Gauge:</b> ${P.gs} stitches and ${P.gr} rows to 10 cm in stocking stitch colourwork, on ${P.nd} mm needles. Knit a swatch in the colourwork first and change needle size to match.</li><li><b>Yarn:</b> ${gesc(P.yarn)}.</li><li><b>You need:</b> ${P.nd} mm needles that hold ${W} stitches (straight needles or a circular needle used flat), 2 stitch markers or scraps of yarn to mark the fold, a tapestry needle, scissors, pins, and bobbins if you use intarsia for any large blocks of colour.</li></ul>
 <h2>Colours</h2><table class="gpat-t"><thead><tr><th></th><th>Letter</th><th>Colour</th><th>Stitches ${same?'per side':'front / back'}</th></tr></thead><tbody>${colRows}</tbody></table>
 <p>Stitch counts are for the coloured stitches on each side, so you can judge how much of each yarn you need. Buy a little more of every colour than you think, and more of MC, because the straps and the plain areas all use it.</p>
 <h2>Notes</h2><ul><li>You are knitting one long vertical panel. <b>The back is knitted first, upside down.</b> The front is then knitted right way up, straight on from the back, so the two charts are joined into one. When you fold the piece in half, both sides end up right way up.</li><li>Everything is worked in stocking stitch: knit on right side (RS) rows, purl on wrong side (WS) rows. Never turn the chart upside down yourself: the chart below already shows the back upside down, exactly as it is knitted.</li><li>The chart is read from the bottom up. Row 1 is the bottom row. RS rows (odd numbers, numbers on the right) are read from right to left, WS rows (even numbers, numbers on the left) are read from left to right.</li><li>Work coloured stitches in stranded colourwork. Carry the colour you are not using loosely across the back, and twist it round the working yarn every 4 or 5 stitches so the floats do not get long. Where a colour covers a block wider than 5 stitches, use intarsia (a separate bobbin for each block) instead.</li><li>Stocking stitch curls at the edges. This is expected: the side edges are sewn together, and blocking helps the piece lie flat.</li></ul>
 <h2>Abbreviations</h2><p>k: knit. p: purl. RS: right side. WS: wrong side. MC: main colour. st(s): stitch(es). ${others.map(k=>`${letter[k]}: ${gesc(gcn(k))}`).join(', ')}.</p>
 <h2>Chart</h2><p class="gp-key">Key:${[MC,...others].map(k=>` ${hx(k)} ${letter[k]} = ${k==MC?'main colour':gesc(gcn(k))}`).join(' ·')}</p>
 <div class="gpat-chart" id="gpc-l"><h3>Colour chart for the whole long piece: front (right way up) above the pink line, back (upside down) below it</h3></div>
 <h2>Cast on</h2><p>With MC and ${P.nd} mm needles, cast on <b>${W}</b> stitches using a long-tail cast on. This edge is the top edge of the back panel, because the back is knitted upside down.</p>
 <h2>Part 1: back panel (upside down), Rows 1 to ${H}</h2>
 <p>Work Rows 1 to ${H} from the bottom section of the chart, in stocking stitch. Row 1 is a right side row. The back design looks upside down while you knit it. This is correct.</p>
 <ol class="gpat-rows">${longRows.slice(0,H).map(r=>`<li>${r}</li>`).join('')}</ol>
 <p><b>Mark the fold.</b> You have now finished the back panel. Tie a scrap of yarn to each side edge, or place a stitch marker on each edge, so you can find this row later. This is where you will fold the piece, and it becomes the bottom of the ${noun}.</p>
 <h2>Part 2: front panel (right way up), Rows ${H+1} to ${T}</h2>
 <p>Do not break the yarn. Carry straight on in stocking stitch and work Rows ${H+1} to ${T} from the top section of the chart. Row ${H+1} is ${(H+1)%2?'a right side (knit)':'a wrong side (purl)'} row.</p>
 <ol class="gpat-rows" start="${H+1}">${longRows.slice(H).map(r=>`<li>${r}</li>`).join('')}</ol>
 <p>Bind off all ${W} stitches loosely in MC. Break the yarn and fasten off. This edge is the top edge of the front panel.</p>
 <h2>Straps (make 2)</h2><p>The bag has two straps, one for the front panel and one for the back panel. Make both the same. With MC, cast on <b>${hw}</b> stitches. Knit every row (garter stitch) until the strap measures about <b>${hl} cm</b>, or the length you like. This is the length of the loop you will carry the bag with, plus about 6 cm to sew into the bag. Each strap is sewn to one panel only. Bind off loosely. For a rounder strap, you can instead work a ${Math.min(5,Math.max(3,Math.round(hw/2)))}-stitch i-cord to the same length.</p>
 <h2>Finishing</h2><ol><li><b>Weave in ends.</b> Weave in all the loose ends on the wrong side, going along stitches of the same colour so they do not show on the front.</li><li><b>Block.</b> Pin the whole long piece flat to ${wcm} cm wide and ${tcm} cm long, then spray lightly with water or steam it gently. Let it dry flat. Do not press hard on the colourwork.</li><li><b>Fold.</b> Lay the piece flat with the colourwork side (the right side) facing up. Fold it in half at the markers or scraps of yarn, with the right side on the outside, so the cast on edge and the bind off edge meet at the top. The back panel is now right way up behind the front panel. The fold is the bottom of the ${noun}, so there is no bottom seam to sew.</li><li><b>Sew the sides.</b> Starting at the fold, join each side edge with mattress stitch in MC, working one whole stitch in from the edge so the sewn stitches match the rest. Pull the seam closed every few stitches. Stop at the top edge. Match the rows on the front and back as you go, using the colourwork to line them up.</li><li><b>Attach the straps.</b> The bag has two straps. Each strap is sewn onto <b>one panel only</b>: strap 1 on the front, strap 2 on the back. The bag is ${W} stitches wide. Put one end of strap 1 on the inside of the front panel's top edge, covering stitches ${hs1} to ${hs2} (counting from the left side edge), and overlap about 3 cm. Pin it. Put the other end on the same panel, on stitches ${he1} to ${he2}, so the strap forms a loop. Sew each end down with small stitches in MC, going round the edges of the strap. Sew a few rows over the top as well for strength. Now do the same with strap 2 on the inside of the back panel's top edge, covering stitches ${hs1} to ${hs2} and ${he1} to ${he2}, so the back strap sits directly behind the front strap. Do not sew either strap to the other panel.</li><li><b>Finish.</b> Weave in the last ends. If you like, sew a fabric lining into the bag to keep its shape and stop things poking through.</li></ol>
 <p class="gp-foot">Pattern made with Moll's Studio. Always check your gauge before you start.</p>`:'';
 const isH=src.build=='hat',n0=TOT/4,ribRounds=Math.round((P.rl||16)/10*P.gr),htall=cm((P.rl||16)/2+((P.pb||0)+H+(P.pa||0)+16)/P.gr*10),
  hCrown=isH?(()=>{const crown=[],ns=TOT/2,seq=[];let n=ns,tot=TOT;for(let j=0;j<5;j++)seq.push('D','P');for(let j=0;j<6;j++)seq.push('D');
   seq.forEach((t,j)=>{const r=j+1;if(t=='P'){crown.push(`<b>Crown round ${r}:</b> knit every stitch (${tot} sts).`);return}tot-=8;
    let body;if(n>=12){const a=(n-12)/4;body=`${a?'k'+a+', ':''}ssk, k2, k2tog, ${a?'k'+2*a+', ':''}k2tog, k2, ssk${a?', k'+a:''}`}else body='ssk, k2tog, k2tog, ssk';
    crown.push(`<b>Crown round ${r}:</b> *${body}, slip marker; repeat from * once more (${tot} sts).`);n-=4});
   return{crown,end:tot}})():null,hatRows=isH?gpRoundRows(front,back,letter,'Chart round'):[];
 const hatHTML=isH?`<h1>${gesc(g.n)} with colourwork: knitted in the round</h1>
 <p class="gp-sub">A written pattern and charts made from your beanie design.</p>
 <div class="gpat-pics gpat-main"><figure><img src="${imgF}" alt="Your beanie, front"><figcaption>Front of the beanie${same?' (the back is the same design)':''}</figcaption></figure></div>
 <h2>At a glance</h2><ul><li><b>Size:</b> ${TOT} stitches round, about ${rcm} cm around, and about ${htall} cm tall with the cuff folded. The ribbing stretches to fit most adult heads. This changes with your gauge.</li><li><b>Gauge:</b> ${P.gs} stitches and ${P.gr} rounds to 10 cm in stocking stitch colourwork, on ${P.nd} mm needles. Knit your swatch in the round and change needle size to match.</li><li><b>Yarn:</b> ${gesc(P.yarn)}.</li><li><b>You need:</b> a ${P.nd} mm circular needle, 40 cm (16 in) long, and double-pointed needles or a long circular needle (for magic loop) for the crown, 2 stitch markers (make one a different colour to mark the start of the round), a tapestry needle and scissors.</li></ul>
 <h2>Colours</h2><table class="gpat-t"><thead><tr><th></th><th>Letter</th><th>Colour</th><th>Stitches ${same?'per side':'front / back'}</th></tr></thead><tbody>${colRows}</tbody></table>
 <p>Stitch counts are for the coloured stitches on each side, so you can judge how much of each yarn you need. Buy a little more of every colour than you think, and more of MC, because the ribbing, the plain rounds and the crown all use it.</p>
 <h2>Notes</h2><ul><li>The beanie is worked in the round from the cuff up. The colourwork sits on the body, between the ribbing and the crown: ${W} stitches across the front and ${Wb} across the back, ${H} rounds high.</li><li>Every round of the body and crown is knit (stocking stitch in the round). You never purl, except in the 1x1 ribbing.</li><li>The two charts sit side by side as one chart: the <b>back is on the left and the front is on the right</b>. Each round reads the front first, then the back, always from right to left.</li><li>Charts are read from the bottom up. Chart round 1 is the bottom row, and every round is read from right to left.</li><li>Work coloured stitches in stranded colourwork. Carry the colour you are not using loosely across the inside, and twist it round the working yarn every 4 or 5 stitches so the floats do not get long.</li><li>The ribbing is folded in half to make the cuff, so it is long. Fold it up when you try the beanie on.</li></ul>
 <h2>Abbreviations</h2><p>k: knit. p: purl. ssk: slip, slip, knit (slip 2 stitches knitwise one at a time, then knit them together through the back loops). k2tog: knit 2 together. MC: main colour. st(s): stitch(es). ${others.map(k=>`${letter[k]}: ${gesc(gcn(k))}`).join(', ')}.</p>
 <h2>Chart</h2><p class="gp-key">Key:${[MC,...others].map(k=>` ${hx(k)} ${letter[k]} = ${k==MC?'main colour':gesc(gcn(k))}`).join(' ·')}</p>
 <div class="gpat-chart" id="gpc-h"><h3>Colour chart: back on the left, front on the right</h3></div>
 <h2>Cast on and ribbing</h2>
 <p>With MC and your ${P.nd} mm circular needle, cast on <b>${TOT}</b> stitches using a stretchy long-tail cast on. Join to work in the round, taking care not to twist the stitches, and place the marker for the start of the round.</p>
 <p>Work 1x1 ribbing: *k1, p1; repeat from * to the end of every round. Keep working this round until the ribbing measures <b>${P.rl} cm</b> (about ${ribRounds} rounds at your gauge).</p>
 <h2>Body</h2>
 <p>Change to stocking stitch: knit every round.${P.pb?` Work ${P.pb} plain round${P.pb==1?'':'s'} in MC.`:''} Then work the colour chart, as follows.</p>
 <h2>Colour chart rounds</h2>
 <p>Work Chart rounds 1 to ${H}. On each round, work the front chart from right to left across the ${W} front stitches, then work the back chart from right to left across the ${Wb} back stitches. You can follow the chart or the written rounds below.</p>
 <ol class="gpat-rows">${hatRows.map(r=>`<li>${r}</li>`).join('')}</ol>
 <p>You now have ${TOT} stitches. This is the end of the colour chart.${P.pa?` Work ${P.pa} plain round${P.pa==1?'':'s'} in MC (knit every round).`:''}</p>
 <h2>Crown</h2>
 <p>The crown is worked in 2 sections. In each section there are two decrease groups. The first is ssk, k2, k2tog, and the second is its mirror: k2tog, k2, ssk. Alternating the two this way makes the decreases lean both ways, so the crown lies flat. This makes 8 decreases on every decrease round.</p>
 <p>Place a marker halfway round, so there are ${TOT/2} stitches in each of the 2 sections (the start-of-round marker is the other one). Each section reads: knit the first stretch, ssk, k2, k2tog, knit across the middle, k2tog, k2, ssk, knit the last stretch. The two knit stretches at the ends join across the marker, so in the first decrease round the gaps between the 4 decrease groups are all the same (18 stitches). In the first rounds you decrease on every other round, then on every round. When the stitches no longer fit comfortably round your circular needle (when about 48 stitches are left), change to double-pointed needles or magic loop, and keep going.</p>
 <ol class="gpat-rows">${hCrown.crown.map(r=>`<li>${r}</li>`).join('')}</ol>
 <p>You have ${hCrown.end} stitches left after ${hCrown.crown.length} crown rounds.</p>
 <h2>Finishing</h2><ol><li><b>Gather the top.</b> Break the yarn, leaving a tail of about 25 cm. Thread the tail onto a tapestry needle and slip it through all ${hCrown.end} remaining stitches, taking them off the needle as you go. Go through them a second time, pull tight to close the top, and pass the tail to the inside. Fasten off.</li><li><b>Weave in ends.</b> Weave in all the loose ends on the inside, going along stitches of the same colour so they do not show.</li><li><b>Block.</b> Wash gently or steam, and lay the beanie flat to dry, shaping it as it dries. Do not press hard on the ribbing or the colourwork.</li><li><b>Fold the cuff.</b> Fold the ribbing up in half to make the cuff.</li></ol>
 <p class="gp-foot">Pattern made with Moll's Studio. Always check your gauge before you start.</p>`:'';
 body.innerHTML=isR?roundHTML:isL?longHTML:isH?hatHTML:`<h1>${gesc(g.n)} with colourwork: two flat panels</h1>
 <p class="gp-sub">A written pattern and charts made from your bag design.</p>
 <div class="gpat-pics gpat-main"><figure><img src="${imgF}" alt="Your ${noun}, front"><figcaption>Front of the ${noun}${same?' (the back is the same design)':''}</figcaption></figure></div>
 <h2>At a glance</h2><ul><li><b>Finished size:</b> about ${wcm} cm wide and ${hcm} cm tall (${W} stitches and ${H} rows), before handles. This changes with your gauge.</li><li><b>Gauge:</b> ${P.gs} stitches and ${P.gr} rows to 10 cm in stocking stitch colourwork, on ${P.nd} mm needles. Knit a swatch in the colourwork first and change needle size to match.</li><li><b>Yarn:</b> ${gesc(P.yarn)}.</li><li><b>You need:</b> ${P.nd} mm straight needles, a tapestry needle, scissors, pins, and bobbins if you use intarsia for any large blocks of colour.</li></ul>
 <h2>Colours</h2><table class="gpat-t"><thead><tr><th></th><th>Letter</th><th>Colour</th><th>Stitches${same?' per panel':' front / back'}</th></tr></thead><tbody>${colRows}</tbody></table>
 <p>Stitch counts are for the coloured stitches on each panel, so you can judge how much of each yarn you need. Buy a little more of every colour than you think, and more of MC, because the handles, the seams and the plain areas all use it.</p>
 <h2>Notes</h2><ul><li>Everything is worked in stocking stitch: knit on right side (RS) rows, purl on wrong side (WS) rows.</li><li>Charts are read from the bottom up. Row 1 is the bottom row. RS rows (odd numbers, numbers on the right) are read from right to left, WS rows (even numbers, numbers on the left) are read from left to right.</li><li>Work coloured stitches in stranded colourwork. Carry the colour you are not using loosely across the back, and twist it round the working yarn every 4 or 5 stitches so the floats do not get long. Where a colour covers a block wider than 5 stitches, use intarsia (a separate bobbin for each block) instead.</li><li>Stocking stitch curls at the edges. This is expected: it sits on the inside of the bag when sewn, and blocking helps it lie flat.</li></ul>
 <h2>Abbreviations</h2><p>k: knit. p: purl. RS: right side. WS: wrong side. MC: main colour. st(s): stitch(es). ${others.map(k=>`${letter[k]}: ${gesc(gcn(k))}`).join(', ')}.</p>
 <h2>Chart${same?'':'s'}</h2><p class="gp-key">Key:${[MC,...others].map(k=>` ${hx(k)} ${letter[k]} = ${k==MC?'main colour':gesc(gcn(k))}`).join(' ·')}</p>
 <div class="gpat-chart" id="gpc-f"><h3>${same?'Chart for the front and the back panel':'Front panel chart'}</h3></div>${same?'':'<div class="gpat-chart" id="gpc-b"><h3>Back panel chart</h3></div>'}
 <h2>${same?'Front panel and back panel (make 2)':'Front panel'}</h2>
 <p>With MC and ${P.nd} mm needles, cast on <b>${W}</b> stitches using a long-tail cast on.</p>
 <p><b>Set-up:</b> Row 1 is the first chart row. Work Rows 1 to ${H} from the chart, using the written rows below if you prefer.</p>
 <ol class="gpat-rows">${frontRows.map(r=>`<li>${r}</li>`).join('')}</ol>
 <p>Bind off all ${W} stitches loosely in MC, knitwise. Break the yarn and fasten off. ${same?'Make a second panel exactly the same for the back.':''}</p>
 ${same?'':`<h2>Back panel</h2>${imgB?`<div class="gpat-pics gpat-main"><figure><img src="${imgB}" alt="Your ${noun}, back"><figcaption>Back of the ${noun}</figcaption></figure></div>`:''}<p>With MC and ${P.nd} mm needles, cast on <b>${W}</b> stitches using a long-tail cast on. Work Rows 1 to ${H} from the back chart.</p><ol class="gpat-rows">${backRows.map(r=>`<li>${r}</li>`).join('')}</ol><p>Bind off all ${W} stitches loosely in MC, knitwise.</p>`}
 <h2>Straps (make 2)</h2><p>The bag has two straps, one for the front panel and one for the back panel. Make both the same. With MC, cast on <b>${hw}</b> stitches. Knit every row (garter stitch) until the strap measures about <b>${hl} cm</b>, or the length you like. This is the length of the loop you will carry the bag with, plus about 6 cm to sew into the bag. Each strap is sewn to one panel only. Bind off loosely. For a rounder strap, you can instead work a ${Math.min(5,Math.max(3,Math.round(hw/2)))}-stitch i-cord to the same length.</p>
 <h2>Finishing</h2><ol><li><b>Weave in ends.</b> Weave in all the loose ends on the wrong side, going along stitches of the same colour so they do not show on the front.</li><li><b>Block.</b> Pin each panel to ${wcm} cm wide and ${hcm} cm tall, then spray lightly with water or steam it gently. Let it dry flat. Do not press hard on the colourwork.</li><li><b>Sew the bottom.</b> Lay the two panels side by side with the right sides facing you and the cast-on edges touching. With MC and a tapestry needle, join the bottom using mattress stitch, going into the half stitch of the cast-on edge, one stitch from the corner to the other corner. Pull the seam closed every few stitches.</li><li><b>Sew the sides.</b> Fold the bag in half along the seam you just sewed, so the right sides are on the outside and the top edges meet. Starting at the bottom corner, join each side edge with mattress stitch in MC, working one whole stitch in from the edge so the sewn stitches match the rest. Pull the seam closed every few stitches. Stop at the top edge.</li><li><b>Attach the straps.</b> The bag has two straps. Each strap is sewn onto <b>one panel only</b>: strap 1 on the front, strap 2 on the back. The bag is ${W} stitches wide. Put one end of strap 1 on the inside of the front panel's top edge, covering stitches ${hs1} to ${hs2} (counting from the left side edge), and overlap about 3 cm. Pin it. Put the other end on the same panel, on stitches ${he1} to ${he2}, so the strap forms a loop. Sew each end down with small stitches in MC, going round the edges of the strap. Sew a few rows over the top as well for strength. Now do the same with strap 2 on the inside of the back panel's top edge, covering stitches ${sIn+1} to ${sIn+hw} and ${Wb0-sIn-hw+1} to ${Wb0-sIn}, so the back strap sits directly behind the front strap. Do not sew either strap to the other panel.</li><li><b>Finish.</b> Weave in the last ends. If you like, sew a fabric lining into the bag to keep its shape and stop things poking through.</li></ol>
 <p class="gp-foot">Pattern made with Moll's Studio. Always check your gauge before you start.</p>`;
 box._O={front,back,same,hexOf,MC,letter,W,H,wcm,hcm,imgF,imgB,noun,g,P,others,src,build:isR?'round':isL?'long':isH?'hat':'flat',rcm,htall};
 if(isL){box._O.comb=comb2;body.querySelector('#gpc-l').append(gpChart(comb2,letter,hexOf,null,0,H));return}
 if(isR||isH){const comb={w:Wb+W,h:H,col:[]};for(let r=0;r<H;r++){for(let c=0;c<Wb;c++)comb.col.push(back.col[Math.min(r,back.h-1)*Wb+c]);for(let c=0;c<W;c++)comb.col.push(front.col[r*W+c])}box._O.comb=comb;body.querySelector(isH?'#gpc-h':'#gpc-r').append(gpChart(comb,letter,hexOf,null,Wb));return}
 const fc=body.querySelector('#gpc-f');fc.append(gpChart(front,letter,hexOf));const bc=body.querySelector('#gpc-b');if(bc)bc.append(gpChart(back,letter,hexOf));
}

/* ---------- saving: the two colour charts and the pattern ---------- */
function gpSteps(body){const steps=[];let cur=null;
 [...body.children].forEach(el=>{if(el.tagName=='H2'){cur={title:el.textContent.trim(),lines:[]};steps.push(cur);return}
  if(!cur||el.classList.contains('gp-key')||el.tagName=='H3')return;
  if(el.classList.contains('gpat-chart')||el.classList.contains('gpat-pics'))return;
  if(el.tagName=='UL'||el.tagName=='OL'){const rows=el.classList.contains('gpat-rows');el.querySelectorAll(':scope > li').forEach((li,i)=>cur.lines.push((rows?'':el.tagName=='OL'?(i+1)+'. ':'• ')+li.textContent.trim()))}
  else if(el.tagName=='TABLE')el.querySelectorAll('tbody tr').forEach(tr=>cur.lines.push('• '+[...tr.children].slice(1).map(td=>td.textContent.trim()).join(', ')));
  else cur.lines.push(el.textContent.trim())});
 return steps.map(x=>({title:x.title,instructions:x.lines.join('\n')}))}
function gpGrid(panel,hexOf){return{w:panel.w,h:panel.h,col:panel.col.map(hexOf),sym:Array(panel.w*panel.h).fill('')}}
function gpRecord(n,inc,box,old){const O=box._O;
  const gb=box.querySelector('.gp5-body');termsApply(gb,'knit',true);const steps0=gpSteps(gb);termsApply(gb,'knit');
  const steps=steps0.filter(x=>!/^Charts?$/.test(x.title)||inc);
  if(inc){const ci=steps.findIndex(x=>/^Charts?$/.test(x.title));if(ci>=0)steps[ci].instructions=(box._O.build=='hat'?'The colour chart is attached to this pattern, with the back on the left and the front on the right. Read it from the bottom up, every round from right to left.':box._O.build=='long'?'The colour chart is attached to this pattern as one long chart: the front (right way up) above the pink line and the back (upside down) below it. Read it from the bottom up: right to left on RS rows and left to right on WS rows.':box._O.build=='round'?'The colour chart is attached to this pattern, with the back on the left and the front on the right. Read it from the bottom up, every round from right to left.':'The front and back panel colour charts are attached to this pattern. Read them from the bottom up: right to left on RS rows and left to right on WS rows.')}
  const colours=[O.MC,...O.others],now=Date.now(),rec={id:old?old.id:`pattern-${now.toString(36)}-${Math.random().toString(36).slice(2,10)}`,createdAt:old?old.createdAt:now,updatedAt:now,title:`${n} (${O.g.n.toLowerCase()})`,
   fields:{craft:'knit',level:'Intermediate',description:O.build=='hat'?`A beanie knitted in the round with colourwork, ${O.W+O.src.back.w} stitches round, 1x1 ribbing cuff, colourwork body and a decreased crown.`:O.build=='long'?`A ${O.g.n.toLowerCase()} knitted as one long vertical panel with colourwork, ${O.W} stitches wide and ${O.H*2} rows long, folded in half and sewn up the sides.`:O.build=='round'?`A ${O.g.n.toLowerCase()} knitted in the round on a magic loop with colourwork, cast on with Judy's magic cast on, ${O.W+O.src.back.w} stitches round and ${O.H} rounds tall. No seams.`:`A ${O.g.n.toLowerCase()} knitted as two flat panels with colourwork, ${O.W} stitches wide and ${O.H} rows tall.`,yarn:`${O.P.yarn}. Colours: ${colours.map(k=>O.letter[k]+' = '+(k==O.MC?'main colour':gcn(k))).join(', ')}.`,tools:O.build=='hat'?`${O.P.nd} mm circular needle (40 cm) and double-pointed needles or magic loop, 2 stitch markers, tapestry needle`:O.build=='long'?`${O.P.nd} mm needles (straight, or circular used flat), 2 stitch markers or scraps of yarn, tapestry needle, pins`:O.build=='round'?`${O.P.nd} mm circular needle with a long cable (magic loop), 2 stitch markers, tapestry needle`:`${O.P.nd} mm straight needles, tapestry needle, pins`,gauge:`${O.P.gs} stitches and ${O.P.gr} ${O.build=='round'||O.build=='hat'?'rounds':'rows'} to 10 cm in stocking stitch colourwork`,sizes:'One size',finished:O.build=='hat'?`About ${O.rcm} cm around and ${O.htall} cm tall with the cuff folded`:`About ${O.wcm} cm wide and ${O.hcm} cm tall, before handles`,notions:O.build=='hat'?'Stitch markers':O.build=='round'?'Lining fabric (optional)':'Bobbins for intarsia (optional), lining fabric (optional)',notes:''},
   garmentId:old?old.garmentId:(GP.garmentId||''),steps,sections:true,chart:inc?(O.build=='hat'?{name:`${n} (back left, front right)`,grid:{...gpGrid(O.comb,O.hexOf),round:true,split:O.src.back.w}}:O.build=='long'?{name:`${n} (front above, back upside down below)`,grid:{...gpGrid(O.comb,O.hexOf),hsplit:O.H}}:O.build=='round'?{name:`${n} (back left, front right)`,grid:{...gpGrid(O.comb,O.hexOf),round:true,split:O.src.back.w}}:{name:`${n} front`,grid:gpGrid(O.front,O.hexOf)}):null,charts:inc?(O.build=='hat'?[{name:`${n} (back left, front right)`,grid:{...gpGrid(O.comb,O.hexOf),round:true,split:O.src.back.w}}]:O.build=='long'?[{name:`${n} (front above, back upside down below)`,grid:{...gpGrid(O.comb,O.hexOf),hsplit:O.H}}]:O.build=='round'?[{name:`${n} (back left, front right)`,grid:{...gpGrid(O.comb,O.hexOf),round:true,split:O.src.back.w}}]:[{name:`${n} front`,grid:gpGrid(O.front,O.hexOf)},{name:`${n} back`,grid:gpGrid(O.back,O.hexOf)}]):null,photos:[O.imgF&&{name:`${n} front`,type:'image/jpeg',src:O.imgF},O.imgB&&{name:`${n} back`,type:'image/jpeg',src:O.imgB}].filter(Boolean),
   bag:{gn:O.g.n,noun:O.noun,front:{w:O.src.front.w,h:O.src.front.h,col:O.src.front.col},back:{w:O.src.back.w,h:O.src.back.h,col:O.src.back.col},same:O.same,MC:O.MC,mcName:O.src.mcName,imgF:O.imgF,imgB:O.imgB,P:{...O.P,name:n,inc},build:O.build}};
  return rec}
function gpSaveWire(box,src,savedId){
 const q=x=>box.querySelector(x),P=src.P,msg=t=>{q('.gps-msg').textContent=t},nm=()=>{const n=q('.gps-name').value.trim();P.name=q('.gps-name').value;return n};
 q('.gps-name').oninput=()=>{P.name=q('.gps-name').value};q('.gps-inc').onchange=()=>{P.inc=q('.gps-inc').checked};
 const ch=q('.gps-charts');if(ch)ch.onclick=()=>{const n=nm(),O=box._O;if(!n){msg('Give your '+src.noun+' a name first. The charts are saved as “name front” and “name back”.');q('.gps-name').focus();return}if(!O)return;
  try{const all=JSON.parse(localStorage.getItem(Kp('colourwork'))||'{}'),now=Date.now();
   [['front',O.front],['back',O.back]].forEach(([side,p])=>{const g=gpGrid(p,O.hexOf);all[`${n} ${side}`]={w:g.w,h:g.h,col:g.col,sym:g.sym,pal:[...new Set([O.MC,...g.col])],t:now}});
   localStorage.setItem(Kp('colourwork'),JSON.stringify(all));msg(`Saved two colour charts: “${n} front” and “${n} back”. You will find them in the colour chart maker and in My charts.`)}
  catch(e){msg('The charts could not be saved: browser storage is unavailable.')}};
 q('.gps-pat').onclick=async()=>{const n=nm(),O=box._O;if(!n){msg('Give your '+src.noun+' a name first, then save the pattern.');q('.gps-name').focus();return}if(!O)return;
  const inc=q('.gps-inc').checked;
  try{const old=savedId?await getSavedPattern(savedId):null;let linked=false;
   if(!savedId&&!GP.garmentId&&GP.stage&&GP.stage.count()){const nm0=$('#gsv-name');if(nm0&&!nm0.value.trim())nm0.value=n;const gid=await gpSaveGarment();if(gid)linked=true}
   const rec=gpRecord(n,inc,box,old);await putSavedPattern(rec);if(!savedId&&rec.garmentId)await garmLinkPattern(rec.garmentId,rec.id);
   msg(savedId?'Changes saved.':`Pattern saved to My Patterns${inc?', with the colour chart included':''}${rec.garmentId?(linked?'. The garment design was saved to My garments and linked to this pattern':'. It is linked to your garment design'):''}.`);q('.gps-view').hidden=false}catch(e){msg('The pattern could not be saved: '+(e.message||'browser storage is unavailable'))}};
 q('.gps-view').onclick=()=>{location.hash='#my-patterns'}}
async function gpView(id){
 const out=$('#gpv-out'),back=$('#gpv-back');if(back)back.onclick=()=>{location.hash='#my-patterns'};
 out.innerHTML='<p class="hint">Opening your pattern…</p>';
 try{const rec=await getSavedPattern(id);if(!rec||!rec.bag){out.innerHTML='<p class="hint">This pattern can only be viewed here if it was made with “Write pattern for my bag”. Use Open / edit for other patterns.</p>';return}
  const b=rec.bag,src={build:b.build||'flat',gn:b.gn,noun:b.noun,front:b.front,back:b.back,same:b.same,MC:b.MC,mcName:b.mcName,imgF:b.imgF,imgB:b.imgB,P:{...b.P}};gpRender(out,src,true,id)}
 catch(e){out.innerHTML='<p class="hint">This pattern could not be opened: '+gesc(e.message||'storage is unavailable')+'</p>'}}


/* ---------- My garments: save a colourwork garment design, edit it later, link it to a pattern ---------- */
const GARM_KEY='molls-garments';
const garmRead=()=>{try{return JSON.parse(localStorage.getItem(GARM_KEY)||'{}')}catch(e){return{}}};
const garmWrite=o=>localStorage.setItem(GARM_KEY,JSON.stringify(o));
function garmThumb(dataUrl){return new Promise(res=>{if(!dataUrl)return res('');const im=new Image();im.onload=()=>{const w=360,h=Math.round(w*im.naturalHeight/im.naturalWidth),c=document.createElement('canvas');c.width=w;c.height=h;c.getContext('2d').drawImage(im,0,0,w,h);try{res(c.toDataURL('image/jpeg',.8))}catch(e){res('')}};im.onerror=()=>res('');im.src=dataUrl})}
async function gpSaveGarment(opts){
 const m=$('#gsv-msg'),name=$('#gsv-name').value.trim(),st=GP.stage;
 if(!name){m.textContent='Give your garment design a name first.';$('#gsv-name').focus();return null}
 if(!st.count()){m.textContent='Add a chart to the garment first.';return null}
 try{const all=garmRead(),id=GP.garmentId&&all[GP.garmentId]?GP.garmentId:'garment-'+Date.now().toString(36)+Math.random().toString(36).slice(2,7),old=all[id],thumb=await garmThumb(st.pic('front'));
  all[id]={id,name,created:old?old.created:Date.now(),updated:Date.now(),patternId:old?old.patternId||'':'',thumb,design:st.exportDesign()};garmWrite(all);GP.garmentId=id;GP.savedSig=garSig();
  m.textContent=old?`Updated “${name}” in My garments.`:`Saved “${name}” to My garments. You can open it from My stuff and keep editing the chart.`;$('#gsv-view').hidden=false;return id}
 catch(e){m.textContent='It could not be saved: browser storage is full or unavailable. Try deleting a garment you no longer need.';return null}}
async function garmLinkPattern(gid,pid){
 const all=garmRead();if(!all[gid])return;
 const prev=all[gid].patternId;all[gid].patternId=pid||'';garmWrite(all);
 try{if(prev&&prev!=pid){const r=await getSavedPattern(prev);if(r&&r.garmentId==gid){delete r.garmentId;await putSavedPattern(r)}}
  if(pid){const r=await getSavedPattern(pid);if(r){r.garmentId=gid;await putSavedPattern(r)}}}catch(e){}}
function garmOpen(id){const g=garmRead()[id];if(!g)return false;GP&&(GP.pending={id,name:g.name,design:g.design});if(!GP){window.__garmPending={id,name:g.name,design:g.design}}location.hash='#garment';return true}
async function renderGarments(){
 const el=$('#my-garment-list');if(!el)return;el.replaceChildren();const all=garmRead(),ids=Object.keys(all).sort((a,b)=>all[b].updated-all[a].updated);
 if(!ids.length){const p=document.createElement('p');p.className='lead';p.textContent='No garment designs saved yet. Open Tools, Add your chart to a garment, design your garment and press Save to My garments.';el.append(p);return}
 let pats=[];try{pats=await allSavedPatterns()}catch(e){}
 ids.forEach((id,i)=>{const g=all[id],a=document.createElement('article'),paper=document.createElement('div'),box=document.createElement('div');a.className='note pm-saved-card n'+(i%4);paper.className='paper t'+(i%3);
  if(g.thumb){const im=document.createElement('img');im.className='pm-saved-thumb';im.src=g.thumb;im.alt=g.name;paper.append(im)}
  const hd=document.createElement('h3');hd.textContent=g.name;const meta=document.createElement('p');meta.className='meta';const gm=GARMENTS.find(x=>x.id==g.design.garment)||GARMENTS[0];meta.textContent=`${gm.n} with colourwork · saved ${new Date(g.updated).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric'})}`;
  const lab=document.createElement('label');lab.className='gm-link';lab.append('Linked pattern ');const sel=document.createElement('select');sel.setAttribute('aria-label','Pattern linked to '+g.name);
  const none=document.createElement('option');none.value='';none.textContent='Not linked to a pattern';sel.append(none);pats.forEach(p=>{const o=document.createElement('option');o.value=p.id;o.textContent=p.title||'Untitled pattern';sel.append(o)});sel.value=pats.some(p=>p.id==g.patternId)?g.patternId:'';lab.append(sel);
  const st=document.createElement('p');st.className='pm-saved-status';st.setAttribute('role','status');
  sel.onchange=async()=>{await garmLinkPattern(id,sel.value);st.textContent=sel.value?'Linked. The pattern now has an “Edit garment design” button.':'Unlinked.';vp.hidden=!sel.value};
  const act=document.createElement('div');act.className='pm-saved-actions';
  const bt=(t,f)=>{const b=document.createElement('button');b.type='button';b.textContent=t;b.onclick=f;act.append(b);return b};
  bt('Open / edit chart',()=>garmOpen(id));
  const vp=bt('View pattern',()=>{const p=pats.find(x=>x.id==(garmRead()[id]||{}).patternId);if(!p){st.textContent='Pick a pattern to link first.';return}location.hash=p.bag?'#bagpattern?id='+encodeURIComponent(p.id):'#my-patterns'});vp.hidden=!sel.value;
  sureBtn(bt('Delete',()=>{}),()=>{const o=garmRead();delete o[id];garmWrite(o);renderGarments()},'Delete');
  box.append(hd,meta,lab,act,st);paper.append(box);a.append(paper);el.append(a)})}


/* spinning smiley in the browser tab (favicon): the smiley picture (embedded, so it also works when the site is opened from a file) is drawn turned a little further every frame */
(function(){
 const mk=()=>{const l=document.createElement('link');l.rel='icon';l.type='image/png';return l};
 let link=document.querySelector('link[rel="icon"]')||mk();
 const im=new Image(),S=64,c=document.createElement('canvas');c.width=c.height=S;const x=c.getContext('2d');let a=0,timer=0;
 const frame=()=>{try{x.clearRect(0,0,S,S);x.save();x.translate(S/2,S/2);x.rotate(a);x.drawImage(im,-S/2,-S/2,S,S);x.restore();const n=mk();n.href=c.toDataURL('image/png');link.replaceWith(n);link=n}catch(e){stop()}a+=Math.PI/10};
 const stop=()=>{clearInterval(timer);timer=0},go=()=>{if(timer||document.hidden||matchMedia('(prefers-reduced-motion:reduce)').matches)return;timer=setInterval(frame,100)};
 im.onload=()=>{go();document.addEventListener('visibilitychange',()=>document.hidden?stop():go())};
 im.src='data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAEAAAABACAYAAACqaXHeAAAaLklEQVR42sWbeZTdVZXvP/uc3+/Ot4akKlNVBgIUBgiBhiAiGBXEEHC1ymw729Dd2LbTw25dqN39UOzXLa3v2a4nD2lw6BYHBBkEp5bWBHAABANJIAEyVGWqurfu/JvOfn/cW0UlqYyA/rJ+K2vVXfees/fZ0/e79xFe2sd03njyD8Zw5nln9m/eNDwkzgzFUX2RBm5erVrr9XwvZ4wnYRC1cllb9nL5EUnJZnGNDfMWDa7/9QNPbEsSN/X3PcB13pfkkZdQcAESAFW1g8cOLq9XmufGoa6o1+MTNApnAbYtg3R0FAL+Xl/XtpxWRnM57ynPyppMLvXj0y88fc3dN97dmG69P6YCpLOZRASWLVt87PbtrbdVmtWLGjW3lETBGBYszLHkaI9jFvtucGFW58xpSj6vWF/wrCEMhGYz0R07jQxvM2x6JjIbngnZtKlFEIVATDaX2pTJenfO7un6xvpNmx9RnVQEL8YiXowCbFtwYejEoaU7h0sfajSCS4Nmo2Alx/JTc7pqVSpZ8ZoeGVoybmbOaIqfUjCt9sE5BZUXRJAJeXziyKNcyejGTVl9aA163701WfPL2FQaVYyPFrrMPcVC9w3Dm4f/S9uasB0l6B9CAdJ53bJlxw7sHK1cO7ar9p4gsOn+GRkuujgfX36Fb047NTT5YoUkrhE0HXGS4JwgpNv7FEW1/T/6wr6NglUwviWdcxi/SNTq5amnnfvut637z/+se89srIK19Pamv1fIpj+9ZcuWtVNcw/EyPqYd2ITZ8xe+u9DTPQwZndHTq9d89Oj46aeOc5r0aRxktVqyWtnla3V3RqtjWa2VslorpbU27mm1nNJqOaWVckor5bRWyhmtlDM6Pp7WSjmttVL7s/HRgpZ2+1oZ9TRqpFW1R3cMH6Nf/MKSePFR/Q5S6mV7an1z+j551VVX+VMs82WxAAskZ5x33oxNj6/9t12j1cs1Mlx+WV987bUpe8KJOyRsjNNqCBiDMTLFIvUIjU0nDc45cM7hZ0LyhW62D8/iS/8WJ//6hYptNCK6u/3/zvcWrxp+7rn1E3t9KRVggeT4ZctPHtm2/Zul3buPX7Agn3zuf80zl19UFQ2fp94wYLKIbYD6R+KOh7RNh0NjSzatpAo9/OqhHv3IR6vJ6gd3etmCHe3unvnO7du23dtJmfGhCHawxwOSBUND5+zYsfOH46O75r/hnDnxt2+f473mrI1SL+8kjFJoSjBqXybPkykxwkO8hMhZmo06ixaNy2VX9Jh6pTtZvbqZd5Jc0TOzZ1ejWvtVRz59MQrwgHjx0OLzx3bvvqM6FhT+4i/nJV+7OeX15p6lWg2wXhpEERWQ5CUsLfani7ZbCA5jPIKWYCjxp29Nm+6+HvfDu2uisbmwd2auWq811hxMCfZgZr9gaOicsV2jd1ZKZP/umlnuhi8GNqoPE0dgPNnrt19m4fdYQwCHsQ5VodWo89rXiixePIc77iy5KLAre/sLo41a8+EpFeQhK8AAbumppy7dPrz7vmqpVvj4/xh01/9z09RKwzhSYAU5oHVJJ35ZEDd5coeWYQUVi6BMnPf0Sm6vLwJYQ1BpsvxViRx1zIDc8Z2ycy68oDiz8Hiz1nxyf5Zg97eLs846q+fpDZvvr5R2DVx15YLk8/+7buulnSApjCiyh0JlmhdQAy4E9TDitxVxIPHFICLtVx2a2E4iUETMHkLvvW5b14ZmrcXy02Pp6evjB3eMY0RXzeiddXe9XtnROVg9mAKsMcY1w/DWsV2jK847b278tVs8L2luJSGDmVaIfU/WOcVPC7lCL6mMEMStduV3QAW0P1eFDBa/O4+XymNcSOLc5OcHLFSMJaw1OHtFQeq1fvfAz3dnxSZnLj3xxK+PjIzEB7MACyTzBgffuXtX5drBgXz8ndsHvN78eqIgg3jJQdObAIlCJgvD247mQ38D658u8Oqz0mjUQEUQcdMoTRBRnPpYL6DeHOT978/zza9ZXn12Hz3du0mcILK3S+yjejBZotYo55zbZR55OBc/uW58XjNuZFuN5v17u4Ldy+/1+OOXz9mxe/v3w4Zk/++NC+WsV2+SeiVBfD301G4camfzzstibr97Jz/92TgLBwc446waQUPB6DRCdBRARK6ri098LM9XvrqNdRsqjGxJcfFlBeJ4DCGNyIFjj4jDqSWVGmP5GfPkW99uukYrPKOvf9H99erYlqlKMHtFLR0tb/v7+nij/4orevXSi0dNbXQcY80hC++cUixkuOeePD96YIxcV4yYgBu+NEqp1Ifvt2PCdE/ihGxK2bCun1u/uQsvFZDJxXz/riq/fjhLPpfCJaDqDhpMjREaNY8lx2+Rj398LkENW63t/OdPf1r3iANmatRfsmzxCeVS9T293d3uE58oGG1uB3JTgNbBtaAoIlnuujNCpI4GKTybYd2GMo89kiaTV5xz0/i/4pzFzxb56Y8M5UoLYzycQhTX+PGPwPgF1LlOQJSDlNCK50G93OLKqwK77LRC0qyFZ3/5yzPf3BHITlWAIOj2keo1QdOl3ve+gjvhxG3SaMVoqnXolbuCtUJ1LMNjv6ugKsQaYTyHRjGPPNpCbAF1Om36MyZE1eOhB4N2Juj8A+XhXydEcR5rQQ+p3mgjTYl8urKjfPyaWULitNFs/R2XTMJnmaCwktOXDh1VG29eMntGTv/yyrQN6lUwaUySOiywmE4rW0c8tmyLMNafkrksT21wODzMPjWJdtKP0qxleHpjiKpFVTvKMmzcXGd83GJtfNBsoqqdF8RLqFXHedPKmjnjlTO00ZDlvQ92ndtZ1EwogK27G++IgmbuLZd0JUcfV5JW0yAmPmxQ43vKyG5HtRJhjE75dsLWrSEutmD3zQKqgrWGai3Fzt1Bmy5TUDUgEeVyQL0mWKuHtaPEOBLnkyuWuPLKbqdONa5lrpzIuAZIfvOb3/ilevUy38tz2RXWxNE4YgQOE9yoKpgUO3daNLZ4xrT9QttmHjQcLrT7dV8xjkYrolGP2plkIu6YFI2ao1kzWOvtQaAcfFOCFUurXuP8VYlduDAnzUrtjScdc+wA4Aygf3r5Rae2asnxp5yS1dNODU2rGXbw/GGid3Wg4GIfiFGJ96jdkyThQOcnIsRxRBzFnfpWJj4giSFxRw4fghbMmVuSVauySeyksK1SWjkZBOvl6nmaxFy4MpsUCg1czBHheREDxiETqFASXijWQ9S3GDHIftOYYjwfY3xQ9wIhog4/bfBTitMjQZyKiIcmTS68AER8rVZbb+zQ9oYklrOt8VmxIi9RUgKyRw7WnKXYpQgpUH9K+SoUCx6+nXCtfRXsYiGTSpHN+uCmCJkIxaJHIa+4pKPPwz0cIwTNgJNPypiBAU/CVrz8zDPPLJpVq87uq9fDEwYGUxy3pGqiZtsXj8wChCRO6J+n5HJCHJspVZvlqMEUeA2cmukriFjpKkT0zZRJw2kL6+jv8ykWI5LYdJDl4fmAmJgwsvTPbchJS/Ooc4PPb3v+BPP4k88e56J41vHHpZk5I5A4FoyJ9ygoDpkoFogDx+DskP5ZQpK4dhTv1OjHHWPBhPut4ROnFPIxRy32QVKI2A46jDn26DyFQhMXT7DIenguoIImgu81WLbMd2C9KIiWGTEyBGqPWpRyXjo5hDLzQGpQoghm9ytLjksjKMYYkgR8L8+fLBc0ThCZPrs4TSF+jeWvzIO2YTEiqOY562xFTKvjGUfKNyq4mFcMWQWh0WgtMS6JjwKfgfk5RYJOZjzyBRwWL1Xl3PMzqFq8lJDEMScuzXDSKS0adRAbT2+mVkhaTV73hohMxqCquMTR1aWce44haiUY6x8SLJ6uRMdYiCMGBwIRscQJR5uwEc4Fx7x5TVCHYlDMIbA2+9beAFYsjUaNSy62LF44g3pFUfV4/1/NoFhoEDnZC4NNjSGORjPm1GUB77hsLkHLEYUe73r3bF6xpEpQb6+j09YBsn9iZgIgkeAS6JnpyPgGgXles9bqhZhCwckkHXWI1fb00TYibmWYO2c7N950DJ/6JLz+9Tn+7O11apUy1qYRN9FAlmloNEvUKPOPn00TxwvJ5EP+56cNrcYunG8RYkTNETmo0O7IpTJGUp5SaYZFz/dtDmL8tN0PbSiTQUoxk0VYG6zodHQExsYEFceKs5/hJz/rJu3tImhU220xpxM4ZNpAKFiiOKTYtZWbbukCIsJGgyjJ4KGo7l1MCeo6PyuKiGAmXUT3UYGSkE47vHSMCf20N1HyCdrh7CZSoJkUX1WIUTwbkfHaUDSKEhJ8hARRO2VTApogkqLVCFCzk6RlMTJBZLgD1YKTOTuJDLVgHLBY6yMm7EhpJ4WzCIlxpLMxKZsBlDhKqAcRonk8iTurvcBea6cn6zoa8aJWqwWWaNIida/y1mJ8R0+hi1olw5ZnM4iBWQsihBJEoOKmILS28pzE7Wjf0aUjRg41vKpgBLBeB9YmiJqOMDqJPJUYpMBTT/ezeZ3F85osOMZw/HERUThCFJo2Kz2hBFFElCgwRLGHc1HgZbLpcqUhtBqhTo/vE2q1uVz3Gcu3bqtSrZYplyNOPrmbu+7oobdrJ0HiYfZuxSkvWIVOZ5CH2hucwD57HYwTbFbYsrGPc19TZnepDGQQT1h1Xj83fWk+PTM3EyV2snJUJxirRKHROLBi/aRuvHx2BBw7duYF8Sc4ncmF0xlh/docN944Sv9AkUq1wZvfvIB3/VkG6yeohljdn3h6GMXU4X1XjBKHMGvOGN/9Xp5vf2sJ/b3CmafPIm7C6LiH59lJ5Cid0lKspTzqCKMY33o7POu5zeDYsllBLUbbgYgOW9BqCH9y2lae2ZCn3kpx7CLLeecHXPne3ZTKdZIkBxL/gbpCe2X2xOB5dVa8rs7GTT6lcZ+rPwBvuzygXt5FM0wQY6aEWMVYn+HtKXUKittkHNEGMPr8s02TOLAqGJ3qjg7VkFxmB92ZgBn9eR5c0yRJfIzzSUyME+WP8YiBxFnixPH4Yy1ipyzsd8TN3cSJbQOyF4rhdoAXn2eeU4GETNquMwsXL1gnhrH1TweUxvNqUorKlL6+KiqGeuCRm1Fl6cnCr34FGqQwXhMkRvbD8r7cPUI1gnWKZwusWZ0hX4g59hUeURx3qk3ds0ZVgSjHo79rGQg1n00/blb/+JGRXNau3/Rsk40bi5rKKi5J79VLjNrzb9Jk5bldPLW2xMZNadKpFJqkwQR/BAW085mxHs0wx333j/Oq5T3MnFMnigSzd7WpBusllMopXftYBLA9nzdPGBFR32d1EAb64Gqc9XtQDfctI63QakasXKmItXz/ex6pTK5Tlto/igvgHKlCwKOPFPn92jpXXJrCmipuGr5BnZLKWn6/NuWef7aOn7aPbtgwsrs985MyP0as3H9v2UStImKSKdy7INoui8IWHHvcOOe/fgZf+ep2auM9pGyCc3Y/GOFlOHeRyTdyDt/v4ub/16CnK8uqCwxBI8DYfSf5lBiT6uLH98WEsSFXTP1kkhJbdd6iNX4uveXB1YlZ97S6TNaibjphYiQJ+fBHczy3JeLW/7Dkuroh3ovD+0McfiIUcsLa3/dzyy01rvqLHubMH6PVaou7t7d4nlCu+HrPPXWLuDBfKN47oQDvG994vJ7NebePN6rcfpt1qUx2n+6NqmLFElQbrDinzPkXzuYfPlVm67Z5pHMOdYIY3S/Se0kHJEQQCfFTs/nEJwJ6ehL+5mpLo17GyL7m75ySK2T4xc963KNrK5rJJqtHnh9ZP9EXcACze8wtni/J178Z2u3DvWrTEU6SzhzABEo0RGJIglH+5bNdVCsB11xTxc8NgIaoysF6Fi/68Z2ShBFdvT3cdHMvP7hrhM99bpCBhbuIWrZD502OMoIxJDYhTvq46aYQVZFst7upA6nNhLpMqdQYKfRkztg+Ehw7ONDtXrMiNK3axKnKHrxfGDjmH1VnZv8A//RPz5PNLuKcN4S0qiHGuJfPEwSaiWNGV5Zf/mohF1/8HJe8dYDPXFenPj6K8ew+AxQuMeSLhjVrZrl/+PsdxvNSm4q56gdrNWKmdD4MoP2zi1tq9fjdT6+HSy+ZIYXcLmL195HHWkuzGXLmWcrozjlc/7lnmDc4nzPPVlrNKqJ+h7jUFxEXpqDLDqKKo4QZMzM8sW4RF5w/zFFHpbntO1msjuB0upUEcS3S/jw+9EF1a9ePm1yPu3Z0Z/jgxNyQnQrhKuXmc109hVNGhhtL0qlC8sZVvmnUaxjjtTl+mUQJIJYkaLHygjzPPtPN9ddvoqd3kBWv9QiTEknoY4054uEpFQE8RDycGkQDuvq6efCXi3jjqs30zkhx9w/66Ot/mlYAdp8RGouLHcVun9vvnO8+c/1mkyqyofvorqtrI7VkwvXt3mB8zqxZv2sm8ft++3Boz339TFm0qCqtlmCMTuFVABOTuDTCGG96S4Gx3f185jPPMTI8kxXnzmZGT42wEZKoYMyR8Iw+jhjnYrryDj83j6/eOMhbL36GoaFu7v7BXOYPbqDZiPGMP4WcMaApFIfnK+OVhbz7XaVkdDyy+aL7893PlH4/dabY7mVzdnx8fGdvX0bKpcY5T621ySVv6zVWxtAOSyuTA4sWtRES+aRciQvfkqG3dzafvX6Y228LGVw0nxNOglwuIg4TkkRoj1ZNDDyZDkPzQvpUFZwTnFOMJOSLkMv388QTi3jvn7e44QvP845LB/jGbT6zZjxPs+bwPEGcPzmj2B60ciRJSLFrHn/7MS+55/6dXqHH+05ld/26g43RCmC/ctVVfld33xpI619fvShWN6jlXWkdL2e1Wkp33pxWSmmtlX2tldI6XrKqyaCuXrNUl5+xQMHXs141W7/3vSEdLx2jqj2qLqVRI6uNck5rJV+rJaPVsZTWSkbrZV9bdU9dnFLVogatBbrmwSF91zuPUcjrzN6Z+u83LVUXzdVGxer4aFFrpaxWS5nOm9ZqKaO1ck7Lu1Kq2q03f/XExJB2mULXcN+CvrlT7jcccLLRAG5w8PhjxsY3P9yoBr2f/8Kx+pEP1k1192bES+8V3GQSPDkXUCxmaYZz+e53fa6/bpz1TzcZnJ/iwlVpznt9nhNOCJk3p0U2J23CRxR1QtDIsnPMsn5TxOpfCHfeVeexR0OK3cIH3j+Tqz8AA3NGqIw1EfHbrXfVvWaDhDhydM/0+OkDg/qWN+1yQZyYQs6uHBsb+9F0py8HmhLtmzOwql6v3x001N367/PN29+xU8Z3l/F822mgdEy3E/FFDIkDzwn5Hku9MYMHfpbh69+s89P/itm1KwCE/llCf3+aXC6HiBJHIWOjLYaHE6LYkckKpy/PccXlXbz5zQFz5pZpNhqETQ9rmcIo66TgCESho7vX8OgTC/XCleVk52jdKxRT14yXRv9lf8PTcrA54f458/6qPu6+nLhactPNR5u3v21YaqOjqMl1usDJHry8iiIKLnEYm5AvZhCbo7Qzy7qn0jzyuLBuvWPb1oByJUGdIV9Q+malOW7IsuxEy4knOgYHqxivTlhr0QoUkTRikj0YZRUFTSOStBsovR6/fWwxF7312XjrVs/LFzL/WimPfORAk+NyKGPys+bM+XCt0rohDnGf/2I/f311aGrlYVziYya7PNMMS+LhnAIt/BRk02mM7wHpNomqcXtvpg25262rhKgZ0Aq0zfuaCfp935pCpU3Tq2vRPWMmP3tglr79su3Jjl3Oy/eEX66ONd5/sOs09hCqEVuv1dbMmJ0bjaPwgh/cUZJGbXZyzjldxk+Ntqe17STptpd6E4xRjPioGsLQ0Wo6okZE2GzRjFpErRZRMyBsxARNRxgmnbtWdq9LF1N+W9pDXkmc4PmOYvdCbrm1x73j7cOUK7EtdPk3VEuVD04ZjdUXc19AAa9eaT3U1dfzOyOs+vnPt2d/++tsfNoZc82CRSFRKyZxFk/b7XDdwynaqdOoYGnT3WIUMWAw7VEc0748Jca1QeUBAYXgEh+I6O71KVUX8bFrUvEnr33OqhUKhdzfVsq7Pn0owh/O/RoH2Gat/lRPf98PfeuftvbJ8uBt32lq2s5zpyzPmmJ3QDOs4ZL2FMg+UwwydeZhau/OTPO3aegvFVTBaUKu25BODfLdOwbde95Z1h/et8Om83ZbPp+6vDy269Ypk6D6UtwY2cMSGtXqyHFDx/xHgEvXas1X3nvPqP3JT03S1TPA0FBRursTXNIkitqzASLSGY2dEHWqL+s+Y/QC7csXxrWLJKdokmC9mGJXmlR6Bqt/Md996CORu+66Z+3uMZVir9yW64kvGhsZf/Rw7gsd6Q2HyTJy7tyhs2rB9n+sjsevIzGc9cpu954ru/QNKwMzOFAWcQ1azZgw9HCuc9tDLFZdh7RwuClEilNAXVsJRvCMI5tJQTpLqVTUNf9dcDfd3ODeu3bZUAOyXam1Kc9+anyscvvkMOJh3iY94ibw5I1RI/TMmHlpGDY/XK/IGQALF+a4YFU2uWCV4eST0qZ/XgXfawkaQxTgNCZx7T4E2h6TFaNYY9vtMOtDXGRszOqTT2XdfffHevc9Le93j48Dhkw2Wp9Ky/85/hVLb37ooYeah+rvL8fV2cmFRYS+geLKVi3z3nqt9kYX0wWG+YNplp5Y5KRTPDc0ZHXBQCC9vZZ0VsRPRwgJSeATBqLjZWV4xNdnNiby6BOR+f0TERs31YijAMjE2Zx7IF0Ibsna6PaRERpTU/Uf+/L05CYEWLhozsJaEJ5bGW+eFwcsd0kyHzwP2jEh7VlSvpJKRzijRKElCgxh7Dp1gwKRgmz30+axXNH+JJuT+3Zsrj2pe67peJH3815q7mYi+k4SiqeffnrX1h1bTwiawUlBK1qSJBytzs0Lo6Ro8NKIiHNR4HnSsH5qu2iyKZP11/l5//HZ3ax9/PEdO6dxPfdSXUz8/y7Y+WuOUjMjAAAAAElFTkSuQmCC';
})();
