// ==UserScript==
// @name         ChatIQ
// @namespace    samara.ChatIQ
// @version      0.1.14
// @description  Custom manual chat shortcuts for TornPDA and desktop. ChatIQ Settings appear on your profile after BuyIQ.
// @author       _samara_ [3979390]
// @copyright    Original Enhanced Chat Buttons concept/code: Callz [2188704], Weav3r [1853324]
// @match        https://www.torn.com/*
// @match        https://torn.com/*
// @run-at       document-idle
// @grant        GM_setClipboard
// @homepageURL  https://github.com/swilliams9114-collab/ChatIQ
// @downloadURL  https://raw.githubusercontent.com/swilliams9114-collab/ChatIQ/main/ChatIQ.user.js
// @updateURL    https://raw.githubusercontent.com/swilliams9114-collab/ChatIQ/main/ChatIQ.user.js
// ==/UserScript==

(() => {
    'use strict';
    if (document.getElementById('ecb-fix-style')) return;
    const VERSION = '0.1.14';
    // Keep legacy storage keys so existing custom shortcuts remain available.
    const CONFIG_KEY = 'chatButtonConfig';
    const OWN = '[data-ecb-owned]';
    const CHANNELS = {TradeChat:'Trade', HospitalChat:'Hospital', FactionChat:'Faction', CompanyChat:'Company', GlobalChat:'Global', UserChat:'Private'};
    const TITLE = '[class*="chat-box-header__name"], [class*="header"] [class*="title"], [class*="header"] [class*="name"], [class*="title___"]';
    const ROOT = '[id^="public_"], [id^="faction-"], [id^="faction_"], [id^="company-"], [id^="company_"], [id^="private-"], [id^="private_"]';
    const INPUT = 'textarea, [contenteditable="true"][role="textbox"], [contenteditable="true"][class*="textarea"]';
    const rendered = new WeakMap();

    // EntranceIQ: integrated royal entrance generator; manual send only.
    const royalLines = {
      sam: {
        clean:['🏛️ _samara_ enters. Olympus called; apparently the mortals need supervision.','✨ The Greek goddess has arrived. Try to act like you deserve this blessing.','👑 _samara_ walks in, steals the spotlight, and leaves your dignity on the floor.'],
        adult:['🔥 _samara_ has entered. Kneel, bitches; the goddess is feeling generous.','💋 Olympus sent its finest troublemaker. You lucky bastards are welcome.','⚡ _samara_ arrives. Behave yourselves—or at least make your bullshit entertaining.'],
        roast:['👑 _samara_ enters. Oce, darling, your ego needs its own fucking postcode.','🏛️ The goddess arrives. Oce is still polishing his imaginary crown.','💋 _samara_ appears. Somebody tell Oce that being loud is not a royal qualification.']
      },
      oce: {
        clean:['👑 King Oceileachair arrives! The peasants may now resume breathing.','⚔️ Hear ye! Oce enters, and modesty immediately leaves the kingdom.','🏰 Make way for King Oce! His ego required a separate carriage.',"🍷 King Oce enters with a fine vintage and a song he wrote for _samara_.","🎶 The king arrives humming a ballad and inviting the kingdom to dance."],
        adult:['👑 King Oce has arrived, you magnificent bastards. Bow or be mildly inconvenienced.','⚔️ Oce storms in. His royal decree: less whining, more worshipping, fuckers.','🏰 The king enters. Yes, his ego is bigger than this entire damn faction.',"🍷 Oce raises his goblet: 'To good wine, loud music, and you magnificent bastards!'","🎤 The king is three songs deep and does not give a damn who requested an encore."],
        roast:['👑 Oce enters. _samara_, darling, Olympus called: they want their attitude back.','⚔️ The king arrives. _samara_ may be a goddess, but she still steals my spotlight.','🏰 Oce proclaims: _samara_ is welcome, provided she stops rearranging my throne.',"🎶 Oce sings a love song for _samara_; she says the wine deserves most of the credit.","🍷 The king insists he can sing. _samara_ generously calls it enthusiasm."]
      }
    };
    // Scene pieces create one continuous arrival, not repeated entrances.
    const royalScenes={
      sam:{
        opening:['⚡ The skies split as _samara_ descends from Olympus, looking divine and dangerously unimpressed.','🏛️ The doors swing wide and _samara_ steps through, bringing the full wrath of Olympus.','💋 A hush falls over the kingdom as _samara_ arrives, all charm, trouble, and divine confidence.',"🌩️ Zeus hides: _samara_ has entered the chat.","🍷 _samara_ sweeps in from Olympus with a goblet, a smirk, and no patience.","🔥 A golden chariot screeches to a halt. _samara_ demands better company."],
        buildup:['The mortals scramble to look useful while the gods quietly take notes.','Crowns tilt, egos wobble, and the entire room remembers who actually runs this show.','Every head turns; even the thunder pauses to admire the spectacle.',"The cherubs lose their cue cards and the peasants pretend this was rehearsed.","The room suddenly smells like expensive perfume and impending consequences.","The gods exchange nervous glances; somebody broke a divine rule."],
        roast:['Oce tries to look important, but his ego already filled the room.','Somebody remind Oce that a shiny crown is not a personality.','Oce clutches his throne like _samara_ is here to repossess it.',"Oce insists this is his kingdom. _samara_ asks whether he kept the receipt.","Oce's ego arrives on horseback three minutes before the rest of him.","Oce tries to issue a decree; _samara_ uses it as a cocktail napkin."],
        finale:['Now bow, darlings. Your favorite goddess has arrived.','Let the chaos begin; Olympus is officially off duty.','Behave yourselves. Or at least make your mistakes entertaining.',"Consider yourselves blessed, mildly threatened, and thoroughly entertained.","The goddess has spoken. Compliments and offerings go to the front of the line.","And that, mortals, is how you make an entrance."],
        adult:['Oce can keep his fucking crown; _samara_ owns the spotlight.','The peasants can stop their bullshit and start applauding.','Kneel, bitches. Divine trouble has officially arrived.',"She takes one look at the chaos and declares it a spectacular fucking mess.","Oce's royal bullshit is officially beneath her divine pay grade.","One smirk later, every poor bastard in the room forgets how to behave."]
      },
      oce:{
        opening:['👑 Trumpets blare as King Oceileachair strides through the castle gates, radiating entirely too much confidence.','⚔️ The royal doors burst open and Oce arrives like the kingdom has been waiting all century.','🏰 A procession of questionable grandeur announces the arrival of King Oce.',"🎺 Twelve trumpeters announce King Oce. Eleven are just there for his ego.","🦚 Oce struts through the gates like a peacock that inherited a castle.","🏰 Oce rides in atop a magnificent steed. The horse requests hazard pay.","🍷 Oce sweeps into the great hall with a goblet in hand and a song on his lips.","🎶 The royal musicians strike up a tune as Oce enters, already singing along.","🌹 Oce arrives with a bottle of wine and a love ballad for his favorite goddess."],
        buildup:['The peasants gasp, the banners flutter, and his reflection demands an encore.','Servants rush for the throne while his ego requests a larger castle.','The kingdom holds its breath, unsure whether to cheer or seek shelter.',"The royal mirror is polished, the throne elevated, and humility nowhere to be found.","A choir sings his praises. He insists they start over with more feeling.","His cape gets caught in the doorway; the king declares it a dramatic pause.","The wine flows freely, and the whole court joins the chorus.","He invites _samara_ to dance as the orchestra finds its rhythm.","His favorite melody fills the hall, followed by laughter and raised glasses."],
        roast:['_samara_ rolls her eyes so hard Olympus feels the tremor.','Somewhere, _samara_ is preparing a devastating review of his entrance.','_samara_ threatens to replace his crown with a decorative flowerpot.',"_samara_ takes one look at the parade and asks if the circus is hiring.","_samara_ offers to polish his crown with the last shred of his dignity.","_samara_ watches the royal spectacle and requests a refund."],
        finale:['Bow respectfully. The king is feeling almost generous today.','Let the royal nonsense commence. Long live the king!','His majesty has spoken. Applause is strongly encouraged.',"Long live the king. And whoever keeps him away from the mirrors.","His majesty accepts applause, tribute, and flattering portraits.","Let history record this as the kingdom's loudest entrance.","To wine, song, and _samara_—the finest treasures a king could ask for!","The king lifts his goblet and dedicates the final verse to his goddess.","Let the music play until sunrise and the wine last until the last dance."],
        adult:['The king has arrived, you magnificent bastards.','Anyone objecting may take their bullshit to the dungeon.','Bow, fuckers. Royal chaos is now in session.',"Oce surveys his subjects: 'What a magnificent bunch of fuckups.'","Anyone questioning his greatness can piss off to the moat.","Even _samara_ cannot stop this glorious shitshow, and she has tried.","Oce raises his glass: 'Here's to love, music, and a damn good night!'","The king belts out a gloriously off-key chorus, and nobody dares stop him."]
      }
    };
    const royalLove={
      sam:{
        short:[
          '❤️ _samara_ arrives, and even Olympus knows her heart belongs to Oce.',
          '💋 Your goddess is here. Oce, save me a place beside your throne.',
          '💕 _samara_ enters. Her favorite king is still her favorite trouble.',
          '👑 She could rule Olympus, but _samara_ chooses to stand beside Oce.',
          '✨ _samara_ arrives with a smile reserved for one ridiculous king.'
        ],
        opening:[
          '❤️ The doors of Olympus open as _samara_ enters, searching the crowd for her beloved Oce.',
          '🌹 _samara_ steps into the kingdom with divine grace and a smile meant only for her king.',
          '💋 A goddess crosses the heavens, not for glory, but to find the king who holds her heart.'
        ],
        buildup:[
          'The noise fades when their eyes meet, and suddenly the whole kingdom feels a little warmer.',
          'For all their teasing and royal chaos, the two of them always find their way back to each other.',
          'Even the gods fall silent, because this kind of devotion needs no grand announcement.'
        ],
        finale:[
          'Oce, my love, even eternity would be sweeter with you beside me. ❤️',
          'The throne means nothing without her favorite king holding her hand.',
          'Let the kingdom watch: this goddess chose her king, and she chooses him again every day.'
        ]
      },
      oce:{
        short:[
          '❤️ King Oce arrives, but his crown means nothing without _samara_.',
          '🌹 Oce enters. His greatest treasure is the goddess who stole his heart.',
          '👑 The king has one royal weakness: his beautiful _samara_.',
          '💕 Oce arrives to remind his goddess that she is his favorite forever.',
          '💋 All hail the king—and the goddess who makes him a better man.'
        ],
        opening:[
          '👑 King Oce enters with all his usual grandeur, but his eyes seek only _samara_.',
          '🌹 The castle gates open for Oce, a king whose greatest pride is the goddess beside him.',
          '❤️ Oce returns from a thousand battles, carrying one promise for his beloved _samara_.'
        ],
        buildup:[
          'The trumpets fade as he reaches for her hand, suddenly forgetting the audience entirely.',
          'His crown may be gold, but her love is the one treasure he would never trade.',
          'For once, even his legendary ego makes room for something greater than himself.'
        ],
        finale:[
          '_samara_, my queen, every kingdom is home when you are beside me. ❤️',
          'Long live their love, their laughter, and the beautiful chaos they create together.',
          'He would surrender a thousand thrones before surrendering the hand of his goddess.'
        ]
      }
    };
    const royalCouple = {
    "opening": [
        "👑 The castle doors open as _samara_ and Oce enter together: one divine goddess, one spectacularly confident king.",
        "❤️ Olympus meets the royal court when _samara_ takes Oce by the hand.",
        "⚡ Thunder rolls, trumpets blare, and the kingdom braces itself: _samara_ and Oce have arrived."
    ],
    "buildup": [
        "He offers her his throne; she reminds him it was hers the moment she walked in.",
        "The crowd bows, though nobody is sure which of them demanded it.",
        "He adjusts his crown, she adjusts his attitude, and somehow they still look hopelessly in love."
    ],
    "clean": [
        "Together they rule with affection, mischief, and questionable judgment.",
        "Oce brings the fanfare; _samara_ brings the thunder. The kingdom gets both."
    ],
    "adult": [
        "Oce announces he is in charge. _samara_ laughs: 'That is adorable as fuck, darling.'",
        "The kingdom is officially screwed, and these two are enjoying every second."
    ],
    "roast": [
        "_samara_ asks Oce whether his crown came with instructions for that enormous ego.",
        "Oce calls himself the greatest king alive; _samara_ politely asks for evidence."
    ],
    "love": [
        "For all their teasing, he is her home and she is his favorite miracle.",
        "Their hands find each other without thinking; some promises never need words."
    ],
    "finale": [
        "Long live the goddess, the king, and the glorious chaos they call love.",
        "Together, they are trouble with a crown—and neither would have it any other way."
    ],
    "short": [
        "❤️ _samara_ and Oce arrive together: one heart, two crowns, unlimited chaos.",
        "👑 The goddess and her king have entered. Romance and trouble are now in session.",
        "💋 Oce brings the crown, _samara_ brings the thunder, and together they steal the show."
    ]
};
    const royalCoupleScenarios={"argument":[["⚔️ Oce declares the banquet his greatest achievement.","_samara_ reminds him she arranged the wine and hired the musicians.","He surrenders with a song and a kiss.","The court agrees they argue like royalty and love like legends."],["🍷 Oce demands another goblet before performing his royal ballad.","_samara_ says he must remember the lyrics first.","He improvises a verse about his goddess and makes her laugh.","They toast their beautiful, ridiculous kingdom."]],"power":[["🎶 Trumpets announce _samara_ and Oce arriving arm in arm.","She commands the thunder; he commands the orchestra.","They lead the entire court in a toast and a triumphant song.","Tonight, their love and laughter rule the kingdom."],["👑 The goddess and her king stride into the feast together.","Oce pours the wine while _samara_ starts the dancing.","Their guests abandon protocol and join the celebration.","Even Olympus wishes it had received an invitation."]],"love":[["🌹 Oce waits beneath the balcony singing a song for _samara_.","She descends from Olympus before the final verse.","They share a slow dance as the castle lights turn golden.","For once, neither needs a crown to feel like royalty."],["❤️ _samara_ finds Oce with two glasses of wine and a melody written for her.","He admits he practiced all afternoon and forgot the middle verse.","She kisses his cheek and hums the missing notes.","The song becomes theirs, imperfect and beautiful."]],"flirty":[["💋 _samara_ catches Oce singing a suspiciously romantic tune over his wine.","He claims it is a royal anthem; every verse is about her.","She promises him a private encore if he dances with her.","The musicians suddenly remember they have somewhere else to be."],["🍷 Oce offers his goddess wine and an outrageously theatrical bow.","_samara_ asks if he plans to charm her or embarrass himself.","He replies, 'Why not both?' and pulls her into a dance.","She laughs, kisses him, and calls it a draw."]],"disaster":[["🍷 Oce's grand entrance begins with spilled wine and a trumpet playing the wrong song.","_samara_ catches his crown before it rolls under the table.","He declares the chaos an intentional comedy performance.","She kisses his forehead and orders another round."],["🎤 The king attempts a serenade, but the orchestra starts three verses early.","_samara_ tries to help and trips over his royal cape.","They collapse into laughter as the court cheers.","It is a disaster, a duet, and their best night yet."]],"twist":[["🎶 The court expects another speech from Oce, but he picks up a lute.","_samara_ joins him with a verse nobody knew she wrote.","The musicians stop playing and let the couple take over.","By the final chorus, the whole kingdom sings along."],["🍷 _samara_ announces that Oce must surrender his crown.","The king gasps until she replaces it with a wreath of roses.","He declares her queen of every love song ever written.","They toast the new reign and dance into the night."]]};
    const royalRecent=new Map();
    function royalChoose(key,items){const old=royalRecent.get(key)||[];const pool=items.filter(x=>!old.includes(x));const pick=(pool.length?pool:items)[Math.floor(Math.random()*(pool.length||items.length))];royalRecent.set(key,[...old,pick].slice(-Math.max(1,items.length-1)));return pick;}
    const royalBotLines=[
      '🤖 BEEP BOOP. King Oce online. Wine reserves: critically low. Love for _samara_: infinite.',
      '🤖 Beep boop. Royal protocol activated. Please insert wine and select a song.',
      '🎶 BEEP BOOP. OceBot has detected _samara_. Switching from king mode to hopeless romantic.',
      '🍷 Beep boop. Error 404: sober king not found. Initiating royal karaoke.',
      '🤖 OceBot reporting for duty. Current tasks: adore _samara_, refill goblet, sing badly.',
      '👑 BEEP BOOP. Throne secured. Music queued. Goddess detected. Happiness.exe running.'
    ];
    const royalMemberRoasts=[
      name=>`👑 ${name} has entered the royal court. The musicians request hazard pay.`,
      name=>`🍷 A toast to ${name}: proof that even royal guests can be spectacularly chaotic.`,
      name=>`🤖 BEEP BOOP. Scanning ${name}... Results inconclusive. Recommend more wine.`,
      name=>`⚡ Olympus reviewed ${name}'s behavior and has politely declined responsibility.`,
      name=>`🎶 Oce wrote ${name} a song. _samara_ says the chorus needs fewer bad decisions.`,
      name=>`🏰 The royal herald announces ${name}. The court immediately hides the good wine.`
    ];
    const royalSavageRoasts=[
      name=>`🔥 ${name} arrived with the confidence of a legend and the decision-making of a drunk pigeon. _samara_ requests a refund.`,
      name=>`👑 ${name} has the royal court in stitches. Not because they're funny—because their life choices are a fucking comedy.`,
      name=>`🍷 Oce raises a glass to ${name}: the only guest who can turn a simple entrance into a full-blown royal investigation.`,
      name=>`⚡ Olympus examined ${name}'s latest disaster and unanimously voted to pretend they never met.`,
      name=>`🤖 BEEP BOOP. Scanning ${name}. Common sense: offline. Chaos: maximum. Wine: strongly recommended.`,
      name=>`🏰 ${name} walked into the castle like a champion. Even the court jester whispered, 'Well, shit. I've been replaced.'`
    ];
    const royalWildRoasts=[
      name=>`🔥 ${name} entered the royal hall and somehow lowered the average IQ of the furniture. Oce nearly choked on his wine.`,
      name=>`🤖 BEEP BOOP. ${name} detected. Error 404: dignity not found. _samara_ has ordered the castle gates locked for everyone's safety.`,
      name=>`🍷 Oce wrote a ballad about ${name}'s bullshit. It has seventeen verses and not one redeeming character arc.`,
      name=>`⚡ Zeus threw a thunderbolt at ${name}, missed on purpose, and said, 'Even I have standards.'`,
      name=>`👑 ${name} requested royal treatment. _samara_ offered a court-appointed babysitter and a fucking instruction manual.`,
      name=>`🎶 The orchestra composed a theme song for ${name}: three minutes of circus music followed by an emergency evacuation.`
    ];
    let royalLast = '';
    function openRoyal(box,input) {
      document.getElementById('chatiq-royal-panel')?.remove();
      const panel=el('div',undefined,'chatiq-royal-panel');panel.id='chatiq-royal-panel';
      const header=el('div','👑 Royal Entrance · EntranceIQ');header.style.fontWeight='bold';
      const character=el('select');for(const [value,label] of [['sam','_samara_ — Greek Goddess'],['oce','Oceileachair — King Oce'],['couple','_samara_ + Oce — Royal Couple ❤️']]){const o=el('option',label);o.value=value;character.append(o);}
      const rating=el('select');for(const [value,label] of [['mixed','Mixed Chaos 🎲'],['clean','PG-13'],['adult','Adults Only 🔥'],['roast','Royal Roasts'],['love','Loving / Romantic ❤️']]){const o=el('option',label);o.value=value;rating.append(o);}
      const scenario=el('select');for(const [v,label] of [['surprise','Surprise Me 🎲'],['argument','Royal Argument ⚔️'],['power','Power Couple 👑'],['love','Hopelessly in Love ❤️'],['flirty','Flirty Chaos 💋'],['disaster','Royal Disaster 🍷'],['twist','Unexpected Plot Twist 🎶']]){const o=el('option',label);o.value=v;scenario.append(o);}const updateScenario=()=>{scenario.style.display=character.value==='couple'?'':'none';};character.addEventListener('change',updateScenario);updateScenario();
      const length=el('select');for(const [value,label] of [['short','Short'],['medium','Medium'],['long','Long'],['epic','Epic']]){const o=el('option',label);o.value=value;length.append(o);}
      const target=el('input');target.type='text';target.maxLength=32;target.placeholder='Faction member to roast (optional)';target.style.cssText='display:block;width:100%;box-sizing:border-box;min-width:0;padding:10px 12px;border-radius:6px;font:inherit;background:#302a38;color:#fff;border:1px solid #786888';
      const memberLabel=el('div','🎯 Faction member to roast (optional)');memberLabel.style.cssText='font-size:12px;font-weight:bold;margin-top:6px';
      const personality=el('select');for(const [v,label] of [['balanced','Personality: Balanced 🎭'],['wine','Wine & Song 🍷🎶'],['bot','OceBot 🤖 Beep Boop'],['romantic','Extra Romantic ❤️'],['savage','Extra Savage 🔥']]){const o=el('option',label);o.value=v;personality.append(o);}
      const intensity=el('select');for(const [v,label] of [['light','Humor: Light'],['medium','Humor: Medium'],['wild','Humor: Wild']]){const o=el('option',label);o.value=v;intensity.append(o);}
      const saved=(()=>{try{return JSON.parse(localStorage.getItem('chatiq_royal_preferences_v1')||'{}')}catch(_){return {}}})();
      if(saved.personality&&[...personality.options].some(o=>o.value===saved.personality))personality.value=saved.personality;
      if(saved.intensity&&[...intensity.options].some(o=>o.value===saved.intensity))intensity.value=saved.intensity;
      const savePrefs=()=>{try{localStorage.setItem('chatiq_royal_preferences_v1',JSON.stringify({personality:personality.value,intensity:intensity.value}))}catch(_){}};
      personality.addEventListener('change',savePrefs);intensity.addEventListener('change',savePrefs);
      const preview=el('textarea');preview.rows=5;
      const counter=el('div');counter.style.cssText='font-size:12px;text-align:right;color:#d5c5eb;margin:3px 0';
      const limit=input.maxLength>0?input.maxLength:null;
      const count=()=>{counter.textContent=preview.value.length+' characters'+(limit?' / '+limit+' reported by chat':' (chat limit unknown)');counter.style.color=limit&&preview.value.length>limit?'#ff8080':'#d5c5eb';};
      preview.addEventListener('input',count);
      const note=el('div','Editable preview · never sends automatically');note.style.fontSize='11px';
      const generate=()=>{
        const pickRoyal=arr=>arr[Math.floor(Math.random()*arr.length)];
        const member=target.value.trim().replace(/[\r\n<>]/g,'').slice(0,32);
        if(member){
          const roastPool=personality.value==='savage'&&intensity.value==='wild'?royalWildRoasts:personality.value==='savage'||intensity.value==='wild'?royalSavageRoasts:royalMemberRoasts;
          const joke=pickRoyal(roastPool)(member);
          const spicy=roastPool!==royalMemberRoasts;
          const additions=spicy?{short:[],medium:['The entire court loses its shit.'],long:['The royal musicians play circus music.','Oce raises his wine while _samara_ laughs herself breathless.'],epic:['The royal musicians play circus music.','Oce raises his wine while _samara_ laughs herself breathless.','BEEP BOOP. Roast complete. Dignity not recoverable.']}:{short:[],medium:['The court applauds with cautious optimism.'],long:['The royal musicians play a suspiciously dramatic tune.','_samara_ and Oce exchange an amused glance.'],epic:['The royal musicians play a suspiciously dramatic tune.','Oce raises his goblet while _samara_ tries not to laugh.','BEEP BOOP. Royal mischief confirmed.']};
          preview.value=[joke,...(additions[length.value]||[])].join(' ');count();return;
        }
        if(personality.value==='bot'&&character.value!=='sam'){
          const intro=pickRoyal(royalBotLines);
          const more={short:[],medium:['Awaiting further instructions... beep boop.'],long:['Royal diagnostics complete: wine, song, and goddess all detected.','Initiating celebratory dance protocol.'],epic:['Royal diagnostics complete: wine, song, and goddess all detected.','Initiating celebratory dance protocol.','WARNING: _samara_ has overridden the royal operating system.']};
          preview.value=[intro,...(more[length.value]||[])].join(' ');count();return;
        }
        if(character.value==='couple'){
          const types=Object.keys(royalCoupleScenarios);
          const type=scenario.value==='surprise'?royalChoose('couple-types',types):scenario.value;
          const stories=royalCoupleScenarios[type];
          const index=royalChoose('couple-'+type,stories.map((_,i)=>i));
          const story=stories[index].slice();
          if(rating.value==='adult')story[2]+=' Their flirting is getting damn shameless.';
          else if(rating.value==='roast')story[2]+=' They never miss a chance to tease each other.';
          else if(rating.value==='love')story[2]+=' Their love needs no royal decree.';
          else if(rating.value==='mixed'&&Math.random()<0.5)story[2]+=' The court knows these two are trouble.';
          if(personality.value==='wine')story[1]='🍷 Oce calls for another round while the musicians launch into a wildly enthusiastic love song.';
          if(personality.value==='romantic')story[2]='❤️ Through all their mischief, they choose each other, every single day.';
          if(personality.value==='savage')story[2]='🔥 The couple trades such spectacular insults that the court applauds the chemistry.';
          if(intensity.value==='wild'&&rating.value!=='love')story[2]+=' The royal chaos has officially escaped containment.';
          preview.value=story.slice(0,({short:1,medium:2,long:3,epic:4}[length.value]||1)).join(' ');count();return;
        }
        const lines=royalLines[character.value];const loving=rating.value==='love';const pool=loving?royalLove[character.value].short:(rating.value==='mixed'?[...lines.clean,...lines.adult,...lines.roast]:lines[rating.value]);
        const choices=pool.filter(x=>x!==royalLast);royalLast=(choices.length?choices:pool)[Math.floor(Math.random()*(choices.length||pool.length))];
        if(personality.value==='wine'&&character.value==='oce')royalLast=pickRoyal(['🍷 Oce enters with a goblet raised and a song dedicated to _samara_.','🎶 The king bursts into song, invites his goddess to dance, and orders more wine.']);
        if(personality.value==='romantic')royalLast=pickRoyal(royalLove[character.value].short);
        if(personality.value==='savage')royalLast=pickRoyal(lines.roast);
        if(length.value==='short'){preview.value=royalLast;count();return;}
        const scene=loving?royalLove[character.value]:royalScenes[character.value];
        const pickScene=arr=>arr[Math.floor(Math.random()*arr.length)];
        const adult=rating.value==='adult'||(rating.value==='mixed'&&Math.random()<0.4);
        const roast=rating.value==='roast'||(rating.value==='mixed'&&Math.random()<0.5);
        if(loving){
          const parts=[pickScene(scene.opening),pickScene(scene.buildup)];
          if(length.value==='long'||length.value==='epic')parts.push(pickScene(scene.finale));
          if(length.value==='epic')parts.push(pickScene(scene.buildup.filter(x=>x!==parts[1])));
          if(length.value==='medium'||length.value==='epic')parts.push(pickScene(scene.finale.filter(x=>!parts.includes(x))));
          preview.value=parts.join(' ');count();return;
        }
        const parts=[pickScene(scene.opening),pickScene(scene.buildup)];
        if(length.value==='long'||length.value==='epic'){
          if(roast)parts.push(pickScene(scene.roast));
          else parts.push(pickScene(scene.buildup.filter(x=>x!==parts[1])));
        }
        if(length.value==='epic')parts.push(adult?pickScene(scene.adult):pickScene(scene.buildup.filter(x=>x!==parts[1])));
        parts.push(adult&&length.value==='medium'?pickScene(scene.adult):pickScene(scene.finale));
        if(personality.value==='wine'&&character.value==='oce')parts[1]='The wine flows, the musicians strike up a tune, and Oce sings for his goddess.';
        if(personality.value==='romantic')parts[1]='His heart belongs to _samara_, and the whole court can see it.';
        if(personality.value==='savage'&&rating.value!=='love')parts[1]='The court braces itself for a merciless royal roast.';
        if(intensity.value==='wild'&&rating.value!=='love')parts.push('The kingdom may never recover from this glorious nonsense.');
        preview.value=parts.join(' ');count();
      };
      const regen=button('🎲 Regenerate',generate);
      const use=button('Insert into chat',()=>{const message=preview.value.trim();if(!message)return;if(limit&&message.length>limit){notice('Chat reports a '+limit+' character limit; shorten the entrance.');return;}const existing=input.isContentEditable?input.textContent:input.value;if(existing?.trim()&&!confirm('Replace the existing chat message?'))return;try{insert(input,message,use,box);panel.remove();}catch(err){notice(err.message||String(err));}});
      const close=button('Close',()=>panel.remove());
      panel.append(header,character,rating,scenario,length,personality,intensity,memberLabel,target,preview,counter,note,regen,use,close);
      document.body.append(panel);generate();
    }

    const companyTypes = ['','Hair Salon','Law Firm','Flower Shop','Car Dealership','Clothing Store','Gun Shop','Game Shop','Candle Shop','Toy Shop','Adult Novelties','Cyber Cafe','Grocery Store','Theater','Sweet Shop','Cruise Line','Television Network','','Zoo','Firework Stand','Property Broker','Furniture Store','Gas Station','Music Store','Nightclub','Pub','Gents Strip Club','Restaurant','Oil Rig','Fitness Center','Mechanic Shop','Amusement Park','Lingerie Store','Meat Warehouse','Farm','Software Corporation','Ladies Strip Club','Private Security Firm','Mining Corporation','Detective Agency','Logistics Management'];
    let timer;
    function readJSON(key, fallback) {
        try { return JSON.parse(localStorage.getItem(key)) ?? fallback; } catch { return fallback; }
    }
    function configs() {
        const c = readJSON(CONFIG_KEY, {buttons:[]});
        return c && Array.isArray(c.buttons) ? c : {buttons:[]};
    }
    function notice(text) {
        document.getElementById('ecb-notice')?.remove();
        const n = el('div', text); n.id = 'ecb-notice'; document.body.append(n);
        setTimeout(() => n.remove(), 3500);
    }
    function write(key, value) {
        try { localStorage.setItem(key, value); return true; }
        catch { notice('Unable to save: device storage is unavailable or full.'); return false; }
    }
    function save(c) { const ok = write(CONFIG_KEY, JSON.stringify(c)); if (ok) refresh(); return ok; }
    function el(tag, text, className) {
        const e = document.createElement(tag); if (text !== undefined) e.textContent = text;
        if (className) e.className = className; e.dataset.ecbOwned = '1'; return e;
    }
    function button(text, action) {
        const b = el('button', text); b.type = 'button'; b.addEventListener('click', action); return b;
    }
    function title(box) { return box.querySelector(TITLE)?.textContent.trim() || ''; }
    function channel(box) {
        const id = box.id || '';
        for (const [prefix, kind] of [['public_trade','TradeChat'],['public_hospital','HospitalChat'],['public_global','GlobalChat'],['faction','FactionChat'],['company','CompanyChat'],['private','UserChat']]) {
            if (id === prefix || id.startsWith(prefix + '-') || id.startsWith(prefix + '_')) return kind;
        }
        const name = title(box).toLowerCase();
        for (const [kind, label] of Object.entries(CHANNELS)) if (kind !== 'UserChat' && name === label.toLowerCase()) return kind;
        // A titled chat containing its own composer can be a private conversation.
        if (name && !/^(global|trade|hospital|faction|company|new players|help|staff|messages|chat)$/.test(name)) return 'UserChat';
        return null;
    }
    function chatFor(input) {
        const identified = input.closest(ROOT);
        if (identified && (identified.querySelectorAll(INPUT).length === 1)) return identified;
        for (let p = input.parentElement; p && p !== document.body; p = p.parentElement) {
            if (p.id === 'chatRoot') break;
            if (p.querySelectorAll(INPUT).length !== 1) break;
            const cls = typeof p.className === 'string' ? p.className : '';
            if ((/chat[-_]?box/i.test(cls) || p.closest('#chatRoot')) && p.querySelector(TITLE) && channel(p)) return p;
        }
        return null;
    }
    function chats() {
        const result = [];
        document.querySelectorAll(INPUT).forEach(input => {
            if (input.closest(OWN)) return;
            const box = chatFor(input);
            if (box && !result.some(x => x.box === box)) result.push({box,input});
        });
        return result;
    }
    function refresh() {
        mountProfile();
        const c = configs(); const signature = JSON.stringify(c.buttons);
        for (const {box,input} of chats()) {
            const kind = channel(box); const stamp = signature + '|' + kind;
            const old = rendered.get(box);
            if (old?.stamp === stamp && old.input === input && old.bar.isConnected) continue;
            box.querySelectorAll('.ecb-shortcuts').forEach(n => n.remove());
            const bar = el('div', undefined, 'ecb-shortcuts');
            c.buttons.forEach((cfg,index) => {
                if (!cfg || cfg.condition !== kind) return;
                const b = button(String(cfg.buttonText || 'Shortcut'), async () => {
                    if (b.disabled) return; b.disabled = true;
                    try { const message = await expand(String(cfg.text || ''), box, input); if (input.isConnected) insert(input, message, b, box); }
                    catch (error) { notice(error.message || 'Unable to prepare message.'); }
                    finally { b.disabled = false; }
                });
                b.className = 'ecb-shortcut custom-chat-button'; b.dataset.configIndex = String(index);
                b.dataset.buttonText = String(cfg.buttonText || ''); b.style.backgroundColor = cfg.backgroundColor || '#007bff';
                bar.append(b);
            });
            if (kind === 'FactionChat') {
                const royal=button('👑 Royal Entrance',()=>openRoyal(box,input));
                royal.className='chatiq-royal-trigger';
                bar.append(royal);
            }
            if (!bar.children.length) continue;
            // Use the composer wrapper only if it does not also contain the chat header/history.
            const parent = input.parentElement;
            const anchor = parent && parent !== box && !parent.querySelector(TITLE) && !parent.querySelector('[class*="messages"]') ? parent : input;
            anchor.before(bar); rendered.set(box, {stamp,input,bar});
        }
        const recent = readJSON('recentButtonInfo', null);
        for (const {box} of chats()) for (const b of box.querySelectorAll('.ecb-shortcut')) {
            b.classList.toggle('recent', Boolean(recent && recent.chatBoxName === (title(box) || box.id) && recent.buttonText === b.dataset.buttonText));
        }
    }
    function insert(input, message, b, box) {
        const limit = input.maxLength > 0 ? input.maxLength : (channel(box)==='FactionChat' ? Infinity : 125);
        if (message.length > limit) throw new Error(`Message has ${message.length} characters; this chat allows ${limit}. Shorten the template.`);
        input.focus();
        if (input instanceof HTMLTextAreaElement || input instanceof HTMLInputElement) {
            const proto = input instanceof HTMLTextAreaElement ? HTMLTextAreaElement.prototype : HTMLInputElement.prototype;
            const setter = Object.getOwnPropertyDescriptor(proto, 'value')?.set;
            if (setter) setter.call(input, message); else input.value = message;
            input.dispatchEvent(new Event('input', {bubbles:true}));
            input.setSelectionRange(message.length, message.length);
        } else {
            const selection = window.getSelection(); const range = document.createRange();
            range.selectNodeContents(input); selection.removeAllRanges(); selection.addRange(range);
            // Editing through the browser preserves contenteditable editor state where supported.
            if (!document.execCommand('insertText', false, message)) {
                input.textContent = message;
                input.dispatchEvent(new InputEvent('input', {bubbles:true, inputType:'insertText', data:message}));
            }
        }
        document.querySelectorAll('.ecb-shortcut.recent').forEach(n => n.classList.remove('recent'));
        b.classList.add('recent'); write('recentButtonInfo', JSON.stringify({buttonText:b.dataset.buttonText,chatBoxName:title(box) || box.id}));
        // Clipboard support is optional; a denied permission cannot block insertion.
        copy(message).catch(() => {});
    }
    async function copy(text) {
        if (typeof GM_setClipboard === 'function') { GM_setClipboard(text, 'text'); return; }
        if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text);
        throw new Error('Clipboard unavailable');
    }
    async function api(path, selections, cacheKey, ttl) {
        const key = (localStorage.getItem('apiKey') || '').trim();
        if (!key) throw new Error('Set your API key in ChatIQ settings for this placeholder.');
        const cached = readJSON(cacheKey, null);
        if (cached?.data && Date.now() - cached.timestamp < ttl) return cached.data;
        const url = new URL(`https://api.torn.com/${path}/`); url.searchParams.set('selections', selections); url.searchParams.set('key', key);
        const response = await fetch(url, {signal:AbortSignal.timeout(15000)});
        if (!response.ok) throw new Error(`Torn API returned HTTP ${response.status}.`);
        const data = await response.json(); if (data.error) throw new Error(data.error.error || 'Torn API rejected this request.');
        write(cacheKey, JSON.stringify({timestamp:Date.now(),data})); return data;
    }
    const DAY = 86400000;
    function fit(names, room) {
        const out = []; for (const name of names) { if ([...out,name].join(', ').length > room) continue; out.push(name); } return out.join(', ');
    }
    async function expand(template, box, input) {
        let message = template.replaceAll('{name}', title(box) || 'User');
        if (message.includes('{company}')) {
            const data = await api('company','profile','companyCache',DAY); const c = data.company || data;
            if (c.rating === undefined || c.company_type === undefined) throw new Error('Company information was not returned.');
            message = message.replaceAll('{company}', `${c.rating}* ${companyTypes[c.company_type] || 'Company'}`);
        }
        if (message.includes('{faction}')) {
            const f = await api('faction','basic','factionCache',DAY);
            if (!f.name || f.respect === undefined) throw new Error('Faction information was not returned.');
            const r = Number(f.respect); const respect = r >= 1000000 ? (r/1000000).toFixed(1)+'m' : (r/1000).toFixed(1)+'k';
            message = message.replaceAll('{faction}', `${f.name}, ${f.rank?.name || 'Unranked'} Ranked ${respect} Respect`);
        }
        const max = input.maxLength > 0 ? input.maxLength : 125;
        let bazaarNames = [];
        if (message.includes('{bazaar}')) {
            const data = await api('user','bazaar','bazaarCache',600000);
            if (!Array.isArray(data.bazaar)) throw new Error('Bazaar information was not returned.');
            const grouped = new Map(); const aliases = {'Donator Pack':'DPs','Erotic DVD':'eDVD','Xanax':'Xan','Feathery Hotel Coupon':'FHC','Six-Pack of Energy Drink':'6pack edrinks','Six-Pack of Alcohol':'6pack alcohol'};
            for (const item of data.bazaar) {
                const category = aliases[item.name] || (/ Cache$/.test(item.name) ? 'RW cache' : ['Flower','Plushie'].includes(item.type) ? 'Flushies' : item.type === 'Energy Drink' ? 'edrinks' : ['Melee','Primary','Secondary','Temporary','Clothing','Jewelry','Defensive','Special','Miscellaneous','Enhancer','Tools','Cars'].includes(item.type) ? 'Misc' : item.type || item.name);
                grouped.set(category, (grouped.get(category)||0) + Number(item.price)*Number(item.quantity));
            }
            const total = [...grouped.values()].reduce((a,b)=>a+b,0);
            bazaarNames = [...grouped].filter(([,v])=>v >= total*.01 && v > 0).sort((a,b)=>a[0]==='Misc'?1:b[0]==='Misc'?-1:b[1]-a[1]).map(([name])=>name);
            if (!bazaarNames.length) bazaarNames = ['Empty bazaar'];
        }
        for (const token of ['{bazaar}','{buy}']) {
            if (!message.includes(token)) continue;
            const count = message.split(token).length - 1;
            const base = message.replaceAll(token,'').replaceAll('{buy}','').replaceAll('{bazaar}','');
            const room = Math.max(0, Math.floor((max - base.length)/count));
            let names = bazaarNames;
            if (token === '{buy}') {
                names = (localStorage.getItem('buyItems') || '').split(',').map(x=>x.trim()).filter(Boolean);
                if (names.length) {
                    const stored = Number(localStorage.getItem('lastBuyItemIndex')); const start = Number.isInteger(stored) && stored >= 0 ? stored % names.length : 0;
                    names = [...names.slice(start),...names.slice(0,start)];
                    const value = fit(names, room); const used = value ? value.split(', ').length : 0;
                    write('lastBuyItemIndex', String((start+used)%names.length)); message = message.replaceAll(token,value); continue;
                }
                names = ['No buy items set'];
            }
            message = message.replaceAll(token,fit(names,room));
        }
        return message;
    }
    function diagnostic() {
        const rows = [...document.querySelectorAll(INPUT)].filter(n=>!n.closest(OWN)).map(input=>{
            const ancestors = []; for(let p=input,d=0;p && d<9;p=p.parentElement,d++) ancestors.push({tag:p.tagName,id:p.id,class:typeof p.className==='string'?p.className:''});
            const box = chatFor(input); return {detected:Boolean(box),channel:box?channel(box):null,ancestors};
        });
        return JSON.stringify({version:VERSION,savedButtons:configs().buttons.length,chatRoot:Boolean(document.querySelector('#chatRoot')),inputs:rows},null,2);
    }
    function openPanel(host) {
        if (!host?.isConnected) return;
        if (document.getElementById('ecb-panel')) return;
        const panel = el('div'); panel.id='ecb-panel'; panel.setAttribute('role','region'); panel.setAttribute('aria-label','ChatIQ settings');
        panel.innerHTML = `<h3>ChatIQ</h3><div class="ecb-tabs"><button type="button" data-tab="list">Buttons</button><button type="button" data-tab="edit">Create / Edit</button><button type="button" data-tab="settings">Settings</button></div><section data-section="list"><input id="ecb-search" placeholder="Search buttons"><div id="ecb-list"></div></section><section data-section="edit" hidden><label>Button text<input id="ecb-text"></label><label>Color<input type="color" id="ecb-color" value="#007bff"></label><label>Chat<select id="ecb-condition"></select></label><label>Message<textarea id="ecb-message" rows="4"></textarea></label><small>Placeholders: {name}, {company}, {faction}, {bazaar}, {buy}. Messages are prepared for you to send manually.</small><div id="ecb-count"></div><button type="button" id="ecb-save">Add Button</button><button type="button" id="ecb-new">New Button</button></section><section data-section="settings" hidden><label>API key<input type="password" id="ecb-api" autocomplete="off"></label><label>Items to buy (comma separated)<input id="ecb-buy"></label><button type="button" id="ecb-settings-save">Save Settings</button><button type="button" id="ecb-export">Export Config</button><button type="button" id="ecb-import">Import Config</button><button type="button" id="ecb-cache">Clear API Cache</button><button type="button" id="ecb-diagnostic">Chat Diagnostics</button><textarea id="ecb-diagnostic-output" readonly hidden rows="8"></textarea></section><button type="button" id="ecb-close">Close</button>`;
        host.append(panel); const q = s=>panel.querySelector(s); let editIndex = null;
        function tab(name) { panel.querySelectorAll('[data-section]').forEach(s=>s.hidden=s.dataset.section!==name); }
        panel.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>tab(b.dataset.tab));
        for(const [kind,label] of Object.entries(CHANNELS)) { const o=el('option',label); o.value=kind; q('#ecb-condition').append(o); }
        q('#ecb-api').value=localStorage.getItem('apiKey')||''; q('#ecb-buy').value=localStorage.getItem('buyItems')||'';
        function reset() { editIndex=null; q('#ecb-text').value=''; q('#ecb-message').value=''; q('#ecb-color').value='#007bff'; q('#ecb-save').textContent='Add Button'; count(); }
        function count() { q('#ecb-count').textContent=`${q('#ecb-message').value.length} template characters`; }
        function list() {
            const container=q('#ecb-list'); container.replaceChildren(); const search=q('#ecb-search').value.toLowerCase();
            const c=configs(); if (!c.buttons.length) container.append(el('p','No saved buttons. Tap Create / Edit to add one.'));
            c.buttons.forEach((cfg,index)=>{
                if (!cfg || ![cfg.buttonText,cfg.text,cfg.condition].join(' ').toLowerCase().includes(search)) return;
                const card=el('div',undefined,'ecb-card'); card.append(el('strong',`${cfg.buttonText} — ${CHANNELS[cfg.condition]||cfg.condition}`),el('p',cfg.text));
                card.append(button('Edit',()=>{editIndex=index;q('#ecb-text').value=cfg.buttonText||'';q('#ecb-message').value=cfg.text||'';q('#ecb-color').value=/^#[0-9a-f]{6}$/i.test(cfg.backgroundColor)?cfg.backgroundColor:'#007bff';q('#ecb-condition').value=cfg.condition;q('#ecb-save').textContent='Save Button';count();tab('edit');}));
                card.append(button('Delete',()=>{if(!confirm(`Delete ${cfg.buttonText}?`))return;const next=configs();next.buttons.splice(index,1);if(save(next)){reset();list();}}));
                for (const [label,delta] of [['Up',-1],['Down',1]]) card.append(button(label,()=>{const next=configs();const target=index+delta;if(target<0||target>=next.buttons.length)return;[next.buttons[index],next.buttons[target]]=[next.buttons[target],next.buttons[index]];if(save(next)){reset();list();}}));
                container.append(card);
            });
        }
        q('#ecb-search').oninput=list; q('#ecb-message').oninput=count; q('#ecb-new').onclick=reset;
        q('#ecb-save').onclick=()=>{
            const cfg={buttonText:q('#ecb-text').value.trim(),backgroundColor:q('#ecb-color').value,condition:q('#ecb-condition').value,text:q('#ecb-message').value};
            if(!cfg.buttonText||!cfg.text.trim()){notice('Enter both button text and a message.');return;}
            const c=configs();if(editIndex===null)c.buttons.push(cfg);else c.buttons[editIndex]=cfg;
            if(save(c)){reset();list();tab('list');notice('Button saved.');}
        };
        q('#ecb-settings-save').onclick=()=>{const key=q('#ecb-api').value.trim();const changed=key!==(localStorage.getItem('apiKey')||'');if(write('apiKey',key)&&write('buyItems',q('#ecb-buy').value)){if(changed)clearCache();notice('Settings saved.');}};
        q('#ecb-cache').onclick=()=>{clearCache();notice('API cache cleared.');};
        q('#ecb-export').onclick=()=>{const blob=new Blob([JSON.stringify({...configs(),buyItems:localStorage.getItem('buyItems')||''},null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=el('a');a.href=url;a.download='chatButtonConfig.json';panel.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);};
        q('#ecb-import').onclick=()=>{const f=el('input');f.type='file';f.accept='.json';f.onchange=async()=>{try{const file=f.files[0];if(!file)return;const c=JSON.parse(await file.text());if(!Array.isArray(c.buttons)||!c.buttons.every(b=>b&&typeof b.buttonText==='string'&&typeof b.text==='string'&&Object.hasOwn(CHANNELS,b.condition)))throw new Error('Invalid button configuration.');if(!confirm('Replace your current buttons with this configuration?'))return;if(save({buttons:c.buttons})){if(typeof c.buyItems==='string'){write('buyItems',c.buyItems);q('#ecb-buy').value=c.buyItems;}reset();list();tab('list');notice('Configuration imported.');}}catch(e){notice(e.message||'Unable to import configuration.');}};f.click();};
        q('#ecb-diagnostic').onclick=()=>{const out=q('#ecb-diagnostic-output');out.hidden=false;out.value=diagnostic();copy(out.value).then(()=>notice('Diagnostics copied.')).catch(()=>{out.focus();out.select();notice('Select and copy the diagnostics below.');});};
        q('#ecb-close').onclick=()=>{panel.remove();const details=host.closest('details');if(details)details.open=false;}; list();count();
    }
    function clearCache(){for(const key of ['companyCache','factionCache','bazaarCache'])localStorage.removeItem(key);}
    function mountProfile() {
        let profile = document.getElementById('chatiq-profile');
        if (location.pathname !== '/profiles.php') { profile?.remove(); return; }
        // Match the existing BuyIQ / WarIQ profile sections, including late mounts.
        const buy = document.getElementById('buyiq-profile') ||
            [...document.querySelectorAll('details')].find(d => /^BuyIQ Settings\b/i.test(d.querySelector('summary')?.textContent.trim() || ''));
        const anchor = buy || document.getElementById('wartargetiq-profile') ||
            document.querySelector('ff-settings-panel') || document.querySelector('.profile-wrapper');
        if (!anchor?.parentNode) return;
        if (!profile) {
            profile = el('details'); profile.id = 'chatiq-profile'; profile.className = 'cont-gray border-round';
            const summary = el('summary', `ChatIQ Settings · v${VERSION}`);
            const body = el('div'); body.className = 'chatiq-profile-body';
            profile.append(summary, body);
            profile.addEventListener('toggle', () => { if (profile.open) openPanel(body); });
        }
        if (anchor.nextElementSibling !== profile) anchor.parentNode.insertBefore(profile, anchor.nextSibling);
    }
    function schedule(){clearTimeout(timer);timer=setTimeout(refresh,120);}
    function start() {
        const style=el('style');style.id='ecb-fix-style';style.textContent=`
        .chatiq-royal-trigger{background:#69418a!important;color:white!important;border:1px solid #bda1db!important}
        #chatiq-royal-panel{position:fixed;bottom:12px;left:10px;right:10px;max-width:420px;margin:auto;z-index:2147483647;background:#25202f;color:white;border:1px solid #ae91cc;border-radius:10px;padding:12px;box-shadow:0 3px 18px #0009;font:14px Arial,sans-serif}
        #chatiq-royal-panel select,#chatiq-royal-panel textarea{display:block;box-sizing:border-box;width:100%;margin:8px 0;padding:8px;background:#17141e;color:white;border:1px solid #777;border-radius:5px;font:16px Arial,sans-serif}
        #chatiq-royal-panel button{margin:4px 5px 0 0;padding:8px;background:#69418a;color:white;border:0;border-radius:5px}
        .ecb-shortcuts{display:flex;flex-wrap:wrap;gap:4px;padding:4px;box-sizing:border-box;max-width:100%}
        .ecb-shortcuts button{border:0;border-radius:5px;padding:5px 8px;background:#455364;color:white;font-size:12px;cursor:pointer;touch-action:manipulation;max-width:100%;overflow:hidden;text-overflow:ellipsis}
        .ecb-shortcuts .recent{outline:2px solid #ffd700;outline-offset:-2px}.ecb-shortcuts button:disabled{opacity:.5}
        #chatiq-profile{clear:both;margin:12px 0;border:1px solid #777;border-radius:6px;background:var(--default-bg-panel-color,#242424);color:var(--default-color,#eee);font:12px Arial,sans-serif}#chatiq-profile>summary{padding:12px;cursor:pointer}#ecb-panel{position:static;width:100%;box-sizing:border-box;padding:0 12px 12px;color:inherit;font:14px Arial,sans-serif}
        #ecb-panel *{box-sizing:border-box}#ecb-panel [hidden]{display:none!important}#ecb-panel h3{margin:0 0 10px}#ecb-panel label{display:block;margin-top:8px}#ecb-panel input:not([type=color]),#ecb-panel textarea,#ecb-panel select{width:100%;padding:8px;margin:5px 0;background:#151515;color:#eee;border:1px solid #777;border-radius:4px;font-size:16px}#ecb-panel button{padding:7px 9px;margin:4px 4px 4px 0;background:#245b91;color:white;border:0;border-radius:5px;cursor:pointer}#ecb-panel .ecb-tabs{display:flex;flex-wrap:wrap}#ecb-panel .ecb-card{background:var(--default-bg-panel-color,#242424);border:1px solid #777;border-radius:6px;padding:9px;margin-top:8px}#ecb-panel .ecb-card p{white-space:pre-wrap;overflow-wrap:anywhere;margin:6px 0}#ecb-panel small{display:block;line-height:1.5;opacity:.85}#ecb-notice{position:fixed;bottom:115px;left:10px;right:10px;z-index:2147483647;background:#222;color:white;border-radius:6px;padding:10px;font:13px sans-serif}
        `;document.head.append(style);
        new MutationObserver(records=>{if(records.some(r=>!r.target.closest?.(OWN)))schedule();}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['id','class','contenteditable']});
        window.addEventListener('popstate',schedule);
        window.addEventListener('hashchange',schedule);
        window.addEventListener('storage',e=>{if(e.key===CONFIG_KEY)schedule();});
        refresh();setInterval(refresh,3000);
    }
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
