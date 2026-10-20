// ==UserScript==
// @name         ChatIQ
// @namespace    samara.ChatIQ
// @version      0.1.36
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
    const VERSION = '0.1.36';
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
    Object.assign(royalCoupleScenarios,{"soap":[["🎭 The royal court gasps as _samara_ storms into the hall: 'OCE! WHO IS LADY MERLOT?!'","Oce drops his goblet. 'DARLING, THAT IS THE NAME OF THE WINE!'","A violin shrieks. _samara_ announces she is leaving for Olympus forever; Oce collapses onto a chaise lounge.","Five minutes later they are slow-dancing. The narrator whispers: 'But for how long?'"],["📺 Previously on THE CROWN AND THE GODDESS: Oce forgot their anniversary.","_samara_ produces a thundercloud and a twelve-page list of grievances. Oce cries, 'I WROTE YOU A SONG!'","He begins singing; she dramatically turns away, only to reveal she knows every word.","They embrace as the camera zooms in on a servant who has been listening the entire time."],["🍷 _samara_ slams a goblet onto the royal table. 'You chose the tavern over ME?'","Oce gasps. 'It was karaoke night! The kingdom needed my voice!'","She threatens to ban music. He threatens to move into the wine cellar. The orchestra plays a tragic chord.","Then Oce whispers 'beep boop, apology.exe loaded,' and she bursts out laughing."],["⚡ Thunder crashes as Oce declares, 'I have something to confess.'","_samara_ clutches her pearls. The court leans in. Oce whispers, 'I drank the last bottle of wine.'","She screams, the chandeliers shake, and a royal guard faints into the curtains.","The episode ends with _samara_ ordering two new cases and Oce promising to share."]],"tavern":[["🍻 Oce and _samara_ burst into the tavern demanding the best table and the loudest band.","The bartender recognizes them and quietly removes the fragile glasses.","Oce leads a raucous chorus while _samara_ turns a spilled drink into a sparkling fountain.","By midnight the entire tavern is singing their names."],["🎶 The king challenges his goddess to a tavern sing-off.","Oce opens with a booming ballad; _samara_ answers with a divine chorus.","The patrons cheer so loudly the chandeliers rattle.","They call it a tie and celebrate with wine."]],"olympus":[["⚡ _samara_ brings Oce to Olympus for a formal introduction to the gods.","Oce offers Zeus a glass of wine and asks whether heaven has a karaoke room.","Athena sighs; _samara_ tries not to laugh.","By sunset the gods are dancing and Zeus has requested an encore."],["🏛️ The goddess arrives with her king at a feast atop Mount Olympus.","Oce attempts to impress the immortals with a song about _samara_.","Even Apollo admits the chorus is catchy.","The couple leave with divine blessings and an alarming amount of wine."]],"wedding":[["💍 The royal bells ring as Oce waits for _samara_ beneath an arch of roses.","She appears in a blaze of divine light; he forgets every line of his carefully prepared vows.","He finally says, 'I choose you, in every kingdom and every lifetime.'","She kisses him while the orchestra plays their song."],["👑 A grand royal wedding rehearsal begins with Oce losing the rings.","_samara_ discovers them at the bottom of his wine goblet.","He insists it was an elaborate treasure hunt.","They laugh, exchange vows anyway, and dance through the night."]],"karaoke":[["🎤 Oce grabs the microphone and dedicates a love ballad to _samara_.","He forgets the lyrics and replaces them with a long series of dramatic beep boops.","_samara_ joins in, somehow making the nonsense sound romantic.","The crowd demands an encore; the bartender demands earplugs."],["🍷 The king announces a karaoke championship with _samara_ as the judge.","Oce performs three songs, two dances, and one accidental robot impression.","She awards him first place for enthusiasm and last place for pitch.","He celebrates both rankings with another glass of wine."]],"bot":[["🤖 BEEP BOOP. OceBot activates during the royal banquet. Primary directive: impress _samara_.","He offers her wine and begins a robotic serenade. 'LOVE.EXE HAS STOPPED RESPONDING.'","_samara_ taps his crown and says, 'Have you tried turning your ego off and on?'","System restored. The king requests a kiss and a software update."],["⚙️ Oce declares himself an advanced royal automaton and starts narrating his every move.","_samara_ tests him: 'Locate the last bottle of wine.' He responds, 'BEEP BOOP. CLASSIFIED.'","She threatens to unplug the royal throne. He immediately produces the bottle.","The kingdom celebrates the first successful OceBot negotiation."]]});
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
      const scenario=el('select');for(const [v,label] of [['surprise','Surprise Me 🎲'],['argument','Royal Argument ⚔️'],['power','Power Couple 👑'],['love','Hopelessly in Love ❤️'],['flirty','Flirty Chaos 💋'],['disaster','Royal Disaster 🍷'],['twist','Unexpected Plot Twist 🎶'],['soap','Royal Soap Opera 🎭'],['tavern','Tavern Night 🍻'],['olympus','Olympus Visits ⚡'],['wedding','Royal Wedding 💍'],['karaoke','Drunken Karaoke 🎤'],['bot','Bot Malfunction 🤖']]){const o=el('option',label);o.value=v;scenario.append(o);}const updateScenario=()=>{scenario.style.display=character.value==='couple'?'':'none';};character.addEventListener('change',updateScenario);updateScenario();
      const dialogue=el('label');dialogue.style.cssText='display:flex;gap:6px;font-size:12px';const dialogueCheck=el('input');dialogueCheck.type='checkbox';dialogue.append(dialogueCheck,document.createTextNode('🎭 Dialogue Mode'));const showDialogue=()=>{dialogue.style.display=character.value==='couple'?'flex':'none'};character.addEventListener('change',showDialogue);showDialogue();
      const dramaTopic=el('select');for(const [v,label] of [['surprise','Drama: Surprise Me 🎲'],['jealousy','Drama: Jealousy 💚'],['wine','Drama: Wine 🍷'],['singing','Drama: Bad Singing 🎤'],['money','Drama: Money 💰'],['flirting','Drama: Flirting 💋'],['misunderstanding','Drama: Misunderstandings 🤦']]){const o=el('option',label);o.value=v;dramaTopic.append(o);}
      const dramaLevel=el('select');for(const [v,label] of [['playful','Drama Level: Playful'],['heated','Drama Level: Heated'],['meltdown','Drama Level: Full Meltdown'],['unhinged','Drama Level: Unhinged 🔥']]){const o=el('option',label);o.value=v;dramaLevel.append(o);}
      const showDrama=()=>{const visible=character.value==='couple'&&(scenario.value==='soap'||scenario.value==='argument'||dialogueCheck.checked);dramaTopic.style.display=visible?'block':'none';dramaLevel.style.display=visible?'block':'none'};character.addEventListener('change',showDrama);scenario.addEventListener('change',showDrama);dialogueCheck.addEventListener('change',showDrama);showDrama();
      const length=el('select');for(const [value,label] of [['short','Short'],['medium','Medium'],['long','Long'],['epic','Epic']]){const o=el('option',label);o.value=value;length.append(o);}
      const partner=el('label');partner.style.cssText='display:flex;align-items:center;gap:8px;font-size:12px;margin:5px 0';const partnerCheck=el('input');partnerCheck.type='checkbox';partnerCheck.checked=false;partner.append(partnerCheck,document.createTextNode('❤️ Include partner in solo entrances (optional)'));
      const updatePartner=()=>{partner.style.display=character.value==='couple'?'none':'flex';};character.addEventListener('change',updatePartner);updatePartner();
      const target=el('input');target.type='text';target.maxLength=32;target.placeholder='Faction member to roast (optional)';target.style.cssText='display:block;width:100%;box-sizing:border-box;min-width:0;padding:10px 12px;border-radius:6px;font:inherit;background:#302a38;color:#fff;border:1px solid #786888';
      const memberLabel=el('div','🎯 Faction member to roast (optional)');memberLabel.style.cssText='font-size:12px;font-weight:bold;margin-top:6px';
      const cameoRole=el('select');for(const [v,label] of [['roast','Role: Royal Roast (original)'],['fool','Role: Royal Fool 🤡'],['advisor','Role: Suspicious Advisor 📜'],['villain','Role: Royal Villain 🦹'],['bystander','Role: Innocent Bystander 😇'],['victim','Role: Unfortunate Victim 💥']]){const o=el('option',label);o.value=v;cameoRole.append(o);}
      const showCameo=()=>{cameoRole.style.display=target.value.trim()?'block':'none';};target.addEventListener('input',showCameo);showCameo();
      const personality=el('select');for(const [v,label] of [['balanced','Personality: Balanced 🎭'],['wine','Wine & Song 🍷🎶'],['bot','OceBot 🤖 Beep Boop'],['romantic','Extra Romantic ❤️'],['savage','Extra Savage 🔥']]){const o=el('option',label);o.value=v;personality.append(o);}
      const intensity=el('select');for(const [v,label] of [['light','Humor: Light'],['medium','Humor: Medium'],['wild','Humor: Wild']]){const o=el('option',label);o.value=v;intensity.append(o);}
      const legacyPrefs=(()=>{try{return JSON.parse(localStorage.getItem('chatiq_royal_preferences_v1')||'{}')}catch(_){return {}}})();
      const characterPrefsKey='chatiq_royal_character_prefs_v1';
      const readCharacterPrefs=()=>{try{const data=JSON.parse(localStorage.getItem(characterPrefsKey)||'{}');return data&&typeof data==='object'?data:{}}catch(_){return {}}};
      const defaults={rating:'mixed',scenario:'surprise',length:'medium',personality:'balanced',intensity:'medium',dramaTopic:'surprise',dramaLevel:'playful',dialogue:false,partner:false};
      const fields={rating,scenario,length,personality,intensity,dramaTopic,dramaLevel};
      let activeCharacter=character.value;
      const saveCharacterPrefs=()=>{
        const all=readCharacterPrefs();const record={};
        for(const [key,control] of Object.entries(fields))record[key]=control.value;
        record.dialogue=dialogueCheck.checked;record.partner=partnerCheck.checked;
        all[activeCharacter]=record;
        try{localStorage.setItem(characterPrefsKey,JSON.stringify(all))}catch(_){}
      };
      const loadCharacterPrefs=(who)=>{
        const all=readCharacterPrefs();
        const prefs=all[who]||((who==='sam')?{...defaults,personality:legacyPrefs.personality||'balanced',intensity:legacyPrefs.intensity||'medium'}:defaults);
        for(const [key,control] of Object.entries(fields)){
          const value=prefs[key]??defaults[key];
          if([...control.options].some(option=>option.value===value))control.value=value;
        }
        dialogueCheck.checked=!!prefs.dialogue;
        partnerCheck.checked=!!prefs.partner;
        activeCharacter=who;
        updateScenario();showDialogue();showDrama();updatePartner();
      };
      character.addEventListener('change',()=>{saveCharacterPrefs();loadCharacterPrefs(character.value)});
      for(const control of Object.values(fields))control.addEventListener('change',saveCharacterPrefs);
      dialogueCheck.addEventListener('change',saveCharacterPrefs);
      partnerCheck.addEventListener('change',saveCharacterPrefs);
      loadCharacterPrefs(activeCharacter);
      const profileNote=el('div','⚙️ Entrance settings saved separately for each character on this device.');
      profileNote.style.cssText='font-size:11px;color:#c9b8d9;margin:3px 0';
      const preview=el('textarea');preview.rows=5;
      const counter=el('div');counter.style.cssText='font-size:12px;text-align:right;color:#d5c5eb;margin:3px 0';
      const limit=input.maxLength>0?input.maxLength:null;
      const count=()=>{counter.textContent=preview.value.length+' characters'+(limit?' / '+limit+' reported by chat':' (chat limit unknown)');counter.style.color=limit&&preview.value.length>limit?'#ff8080':'#d5c5eb';};
      preview.addEventListener('input',count);
      const note=el('div','Editable preview · never sends automatically');note.style.fontSize='11px';
      const recentKey='chatiq_royal_recent_v1';const recent=(()=>{try{return JSON.parse(localStorage.getItem(recentKey)||'[]').slice(-80)}catch(_){return []}})();const remember=message=>{recent.push(message);if(recent.length>80)recent.shift();try{localStorage.setItem(recentKey,JSON.stringify(recent))}catch(_){}};const plotKey='chatiq_royal_plot_history_v1';const plotHistory=(()=>{try{return JSON.parse(localStorage.getItem(plotKey)||'[]').slice(-24)}catch(_){return []}})();const rememberPlot=id=>{plotHistory.push(id);if(plotHistory.length>24)plotHistory.shift();try{localStorage.setItem(plotKey,JSON.stringify(plotHistory))}catch(_){}};
      const dialogueScenes=[["_samara_: Oce, where is the royal wine?","Oce: I was conducting a taste test.","_samara_: On every bottle?","Oce: Beep boop. No further questions."],["_samara_: Why are you singing at midnight?","Oce: The kingdom demanded an encore.","_samara_: The kingdom was asleep!","Oce: Then I shall perform more quietly."],["_samara_: Did you forget our anniversary?","Oce: I wrote a song!","_samara_: You rhymed love with glove.","Oce: And it came from the heart."]];
      const dramaLines={"jealousy":[["_samara_: Who sent you thirteen heart emojis?","Oce: The baker! They were shaped like bread!","_samara_: And why did you send fourteen back?","Oce: I was ordering extra rolls."],["_samara_: Why is a mysterious woman calling you Your Majesty?","Oce: She's the tax collector.","_samara_: You sent her roses!","Oce: I was hoping she'd forget the audit."],["_samara_: Whose lipstick is on your collar?","Oce: It's raspberry jam!","_samara_: Why is it shaped like a kiss?","Oce: The toast was very affectionate."]],"wine":[["_samara_: Where did the wedding wine go?","Oce: I rescued it from going stale.","_samara_: All forty bottles?","Oce: I'm a very dedicated husband."],["_samara_: Why is there a wine fountain in our bedroom?","Oce: You said we needed better plumbing.","_samara_: I meant the bathroom sink!","Oce: The grapes disagree."],["_samara_: You named the royal horse Cabernet?","Oce: He has a refined palate.","_samara_: He ate the tax records!","Oce: Finally, a horse who understands me."]],"singing":[["_samara_: Why are the guards wearing earplugs?","Oce: I'm rehearsing my new ballad.","_samara_: The windows cracked during the chorus!","Oce: That's called reaching the high notes."],["_samara_: Did you serenade the royal accountant?","Oce: He looked stressed.","_samara_: He resigned halfway through!","Oce: Tough crowd. Beep boop."],["_samara_: The orchestra is on strike.","Oce: Over my beautiful voice?","_samara_: Over your twelve-hour encore.","Oce: I was just getting warmed up."]],"money":[["_samara_: You spent the treasury on a singing throne?","Oce: It has surround sound.","_samara_: We can't afford dinner!","Oce: The throne sings about dinner."],["_samara_: Why does the budget say emergency glitter?","Oce: A king must sparkle.","_samara_: It cost more than the castle roof!","Oce: Then we shall glitter indoors."],["_samara_: Did you buy another royal yacht?","Oce: Technically it's a floating tavern.","_samara_: WITH OUR TAX MONEY?","Oce: The citizens get happy hour."]],"flirting":[["_samara_: You winked at the tavern keeper!","Oce: I had wine in my eye.","_samara_: BOTH eyes?","Oce: It was a generous pour."],["_samara_: Why did you call the barmaid an angel?","Oce: She found my lost wallet.","_samara_: You wrote her a sonnet!","Oce: It was a very grateful receipt."],["_samara_: You promised someone a moonlit dance?","Oce: Yes. You.","_samara_: Oh.","Oce: I accept apologies in kisses."]],"misunderstanding":[["_samara_: Why is the castle listed for sale?","Oce: I listed the spare castle-shaped cake.","_samara_: The real estate agent is downstairs!","Oce: Does he want a slice?"],["_samara_: Why did you announce our divorce?","Oce: I announced a horse!","_samara_: Everyone sent sympathy flowers!","Oce: Our horse is very popular."],["_samara_: Why is Zeus demanding an apology?","Oce: I said his thunder was loud.","_samara_: You called him a broken drum!","Oce: It was constructive criticism."]]};
      const dramaEnding={
        playful:["The couple crack up laughing. The court applauds.","Oce offers a kiss. _samara_ pretends to consider it."],
        heated:["The royal orchestra stops mid-note. Nobody dares blink.","A servant quietly removes the breakable goblets."],
        meltdown:["THUNDER CRASHES. Three courtiers faint and someone yells CUT TO COMMERCIAL!","The castle doors slam. A dramatic violin plays from nowhere."],
        unhinged:["THE CHANDELIER EXPLODES INTO CONFETTI. Oce yells BEEP BOOP and flees on a mechanical horse!","The narrator screams: NEXT TIME ON THE CROWN AND THE GODDESS! The entire kingdom demands a sequel."]
      };
      const samaraScenes={"light":[["👑 _samara_ steps into the throne room and finds the royal council arguing over who gets the best chair.","She calmly claims the throne, reminding everyone that divine seating arrangements are not up for debate.","The council bows, and the goddess rewards their sudden good sense with a smile."],["✨ The goddess arrives to discover someone has scheduled a meeting before her morning coffee.","_samara_ reschedules it for a more civilized hour and asks the servants for pastries.","Peace returns to Olympus, mostly because everyone knows better than to interrupt breakfast."],["⚡ _samara_ catches a courtier polishing her crown with a dishcloth.","She hands him the proper velvet and offers a surprisingly patient lesson in royal etiquette.","The crown sparkles, the courtier survives, and the kingdom calls it a successful day."],["👑 _samara_ arrives at court to find the royal gardener has planted roses in the throne room.","She admires the flowers but politely points out that the throne needs somewhere to stand.","The gardener moves the roses outside, and the goddess names the new garden after him."],["✨ The royal cook presents _samara_ with a cake shaped like Mount Olympus.","She asks for a slice, but the cook insists the cake is too beautiful to cut.","The goddess takes the first bite herself and declares that delicious things should never be wasted."]],"medium":[["👑 _samara_ enters the royal council and hears another brilliant plan to fix a problem nobody has.","She asks whether the council has considered thinking before speaking. The room goes wonderfully quiet.","The minutes record her proposal as 'unexpectedly effective leadership.'"],["⚡ A messenger tells _samara_ that Zeus has demanded an explanation for her latest decree.","She sends back a note: 'Try reading it slowly this time.'","Olympus calls an emergency meeting to discuss the goddess's attitude. She declines the invitation."],["✨ _samara_ discovers the court has organized a competition to crown the most dramatic royal.","She enters without saying a word, raises one eyebrow, and wins unanimously.","The losing contestants demand a recount. She awards them a consolation tissue."],["⚡ The council asks _samara_ to approve a twenty-page policy on how to ring the dinner bell.","She reads the first sentence, rings the bell herself, and announces that the policy is now complete.","The council spends the afternoon debating whether efficiency is allowed."],["👑 A courtier claims his new crown is brighter than _samara_'s.","She suggests he stand outside during the next thunderstorm and test that theory.","The courtier immediately discovers a lifelong appreciation for modest jewelry."]],"wild":[["👑 _samara_ storms into the throne room to find the council arguing about the official color of royal napkins.","She declares the entire debate a colossal waste of fucking time and appoints a goat as chairperson.","The goat makes its first decision in seconds. The council has never looked more replaceable."],["⚡ Zeus sends _samara_ a formal complaint about her language.","She sends it back corrected in red ink, with 'mind your own damn business' written across the top.","Olympus erupts in outrage. The goddess calls it free entertainment."],["🔥 _samara_ catches the royal jester telling everyone he could run the kingdom better.","She hands him the crown and a stack of unpaid bills. He lasts eleven minutes before begging for mercy.","The goddess takes her throne back and announces that bullshit is now taxed at double rate."],["🔥 _samara_ learns the council has spent the treasury on a giant golden spoon.","She asks which genius plans to eat soup with it, then bills the council for wasting her damn time.","The spoon is melted into coins, and the goddess names the budget committee 'The Idiot Parade.'"],["⚡ A messenger announces that the royal jester has challenged _samara_ to a battle of insults.","She asks if he brought a second brain, because the first one clearly isn't doing shit.","The jester bows, admits defeat, and retires to a quieter profession."]]};
      const epicStories={"sam":[["👑 _samara_ arrives to discover the royal council has voted to replace her throne with a folding chair.","The council claims it is a cost-saving measure. She asks whether they have also budgeted for their own funerals.","A nervous treasurer admits the chair was Oce's idea after an especially enthusiastic wine tasting.","_samara_ makes the council sit on folding chairs for a full week while she reclaims her throne.","By sunset, the kingdom has passed a new law: never let the wine committee handle furniture."],["⚡ A thunderstorm rolls over Olympus just as _samara_ receives a complaint from Zeus about her attitude.","She sends a messenger back with a list of Zeus's own embarrassing decisions, neatly numbered.","Zeus arrives in person, furious, but discovers the entire court is selling tickets to the argument.","_samara_ offers to split the ticket profits if he agrees to stop acting like a dramatic bastard.","Zeus accepts. The goddess pockets the proceeds and calls it diplomacy."],["🔥 _samara_ walks into the palace to find a banner declaring 'ROYAL HUMILITY WEEK.'","The royal jester announces that everyone must compliment the council instead of the goddess.","_samara_ asks the jester to demonstrate humility by wearing a potato sack and apologizing to a turnip.","The court erupts in laughter as the council quietly takes down the banner.","The jester requests a transfer. The turnip is promoted to royal advisor."],["👑 _samara_ receives an invitation to judge the kingdom's first Royal Genius Contest.","The council presents a self-opening door, a waterproof umbrella, and a spoon with two handles.","She asks the inventors to demonstrate their creations; the door traps its maker and the umbrella leaks.","The goddess awards first place to the stablehand who brought a perfectly ordinary bucket.","The council protests until _samara_ reminds them that useful beats expensive bullshit every time."]],"oce":[["🍷 King Oce announces a magnificent concert to celebrate the kingdom's finest wine.","He arrives with a lute, a goblet, and absolutely no understanding of musical timing.","Halfway through his first song, the orchestra abandons him and a nearby horse begins howling in sympathy.","Oce activates BEEP BOOP performance mode and insists the horse is his new duet partner.","_samara_ applauds once, orders the wine rescued, and declares the horse the better singer."],["🤖 Oce decides the kingdom needs a robot king to improve efficiency.","He builds a cardboard helmet, says BEEP BOOP, and announces that all meetings now begin with wine.","The treasurer asks for a budget; Oce's robot voice declares ERROR: FUNDS NOT FOUND.","_samara_ unplugs his imaginary battery by confiscating the royal goblet.","The robot king immediately reboots when someone whispers 'happy hour.'"],["❤️ Oce plans a surprise romantic evening for _samara_ beneath the stars.","He recruits the royal choir, decorates the balcony, and prepares a speech he swears is not a song.","A gust of wind sends the decorations flying and the choir accidentally starts singing the tax anthem.","Oce laughs, takes _samara_'s hand, and admits that the evening is a spectacular disaster.","She kisses him anyway. The choir is permanently banned from romantic surprises."],["🍷 Oce announces that the royal wine cellar will host a prestigious tasting competition.","He appoints himself judge, musician, and official inspector of every bottle.","By the third round, he accidentally awards first prize to a jug of grape juice.","_samara_ discovers the mistake and asks whether the king can still tell his own shoes apart.","Oce bows grandly, declares the juice exquisite, and requests another glass of water."]],"couple":[["🎭 _samara_ discovers Oce has declared the palace wine cellar an independent kingdom.","Oce appoints himself emperor of the grapes and demands diplomatic recognition from his wife.","_samara_ responds by imposing a royal tax on every sip, sparking a dramatic treaty negotiation.","The two argue across a banquet table while the court watches like it's the season finale.","They sign a peace agreement over dinner. Oce pays the tax in kisses and one very expensive bottle."],["👑 The Royal Couple hosts a banquet to prove they can run one peaceful evening together.","Oce volunteers to handle music while _samara_ organizes the guests and the seating.","Oce begins an unscheduled solo; _samara_ threatens to have the orchestra arrest him for crimes against melody.","A guest mistakes their argument for live theater and the entire hall gives a standing ovation.","The couple takes a bow, sells tickets to the encore, and quietly agrees never to host a normal dinner again."],["⚡ Zeus invites _samara_ and Oce to Olympus for a supposedly civilized royal summit.","Oce brings wine as a peace offering. _samara_ brings a list of complaints and a dangerously sharp pen.","Zeus insults Oce's singing; Oce challenges him to karaoke while _samara_ demands a judging panel.","Oce belts out a ballad so terrible that Zeus accidentally throws a thunderbolt into his own throne.","_samara_ declares Oce the winner by technical knockout. The couple leaves before anyone asks for a rematch."],["🎭 _samara_ and Oce agree to spend one whole evening without arguing.","Oce prepares a romantic dinner, but accidentally invites the royal jester to provide commentary.","The jester narrates every glance and every sip of wine like a championship sporting event.","_samara_ and Oce unite to throw him out, only to realize they've successfully worked together.","They celebrate their victory with a kiss and immediately argue about who deserves the credit."]]};
      // Hand-written long-form material only: no changes to chat detection or UI.
      epicStories.sam.push(
        [
          "⚡ The clouds above Olympus turn violet as _samara_ arrives to find the palace gates locked from the inside.",
          "A trembling guard informs her that the council has declared an emergency and banned all divine visitors.",
          "The goddess asks whether they remember who owns the palace, the gates, and most of the thunder.",
          "No one answers, which is wise.",
          "Inside, the treasurer is proudly unveiling a new budget that replaces the royal throne with an office chair.",
          "He calls it a bold modernization initiative.",
          "_samara_ calls it the final mistake of his administrative career.",
          "She strides through the hall, her footsteps echoing like distant storms.",
          "The council attempts to hide behind a stack of paperwork, but a gust of wind sends every page flying.",
          "One document reveals that the treasurer has also billed the kingdom for a golden footrest.",
          "The goddess lifts the footrest with one finger and asks if it comes with a refund.",
          "A clerk whispers that the refund policy expired yesterday.",
          "For one dreadful moment, even the statues look nervous.",
          "Then _samara_ sits on the ridiculous office chair and declares it her temporary judgment seat.",
          "She orders the treasurer to spend the next month explaining the budget to angry peasants.",
          "The court erupts in applause as the goddess restores the throne and announces that Olympus is once again under competent management."
        ],
        [
          "👑 _samara_ enters the grand banquet hall to discover that someone has organized a competition to find a more impressive ruler.",
          "The contestants include a knight, a merchant, a bard, and one suspiciously confident goose.",
          "The goddess studies the sign-up sheet and asks who approved this insult to common sense.",
          "The royal herald admits the goose was the only applicant who paid the entry fee.",
          "The knight boasts about his sword while the merchant lists his fortune.",
          "The bard attempts a heroic song and forgets the words before the chorus.",
          "The goose bites the knight, steals the merchant's purse, and knocks over the bard's instrument.",
          "_samara_ watches the destruction unfold with the expression of a woman reconsidering the entire institution of monarchy.",
          "The judges award the goose perfect marks for initiative.",
          "The goddess raises one eyebrow and demands a final challenge: govern the kingdom for five minutes.",
          "The goose immediately declares war on the palace fountain.",
          "The knight flees, the merchant requests a refund, and the bard starts writing a tragedy.",
          "With a flick of her wrist, _samara_ restores order and silences the feathered revolutionary.",
          "She announces that the throne is not a prize for whoever honks the loudest.",
          "The judges unanimously reverse their decision.",
          "The goddess reclaims her seat, and the goose is appointed Minister of Unnecessary Drama."
        ]
      );
      epicStories.oce.push(
        [
          "🍷 The royal trumpets announce King Oce, but he arrives singing his own introduction three verses ahead of the orchestra.",
          "His cape catches on the doorway, forcing the entire procession to stop.",
          "Oce declares the delay a dramatic pause and orders everyone to applaud.",
          "A servant brings him wine, which he accepts as proof that the kingdom still understands greatness.",
          "He has gathered the court to unveil a magnificent love song dedicated to _samara_.",
          "Unfortunately, the royal musicians have been given three completely different versions of the sheet music.",
          "The drummer begins a battle march while the harpist plays a lullaby.",
          "Oce insists the clash of styles is deliberate and calls it experimental romance.",
          "He takes a heroic breath and sings a note that causes two pigeons to abandon the rafters.",
          "The court applauds nervously.",
          "A messenger arrives with a letter from the goddess asking whether the palace is under attack.",
          "Oce clutches his heart and announces that even her concern is poetry.",
          "He attempts a second verse, but the conductor quietly begs for mercy.",
          "BEEP BOOP, says the king, pretending his royal voice requires a system reboot.",
          "He finally abandons the performance and sends _samara_ a single rose with a handwritten apology.",
          "The evening ends with Oce raising his goblet to love, music, and the blessed silence after his final note."
        ],
        [
          "🎶 King Oce strides into the throne room with a grand plan to host the most romantic feast in royal history.",
          "He has ordered candles, roses, velvet banners, and enough wine to alarm the treasury.",
          "The staff exchange worried glances when he announces that he will personally supervise every detail.",
          "His first instruction places the orchestra inside the kitchen.",
          "His second requires the chef to present each dish while singing.",
          "By sunset, the palace smells of burnt pastry and frightened ambition.",
          "Oce insists that perfection takes courage and another glass of wine.",
          "Then the centerpiece collapses, sending a tower of sugared fruit across the royal table.",
          "A courtier slips on a pear and lands in the decorative fountain.",
          "The king pauses, considers the wreckage, and calls it an immersive theatrical experience.",
          "A servant gently reminds him that _samara_ was expecting a quiet dinner.",
          "For once, Oce stops singing.",
          "He sends the orchestra home, clears the table himself, and saves two simple plates beside the fire.",
          "When the goddess arrives, he offers her a rose and admits that he may have overdone things.",
          "She laughs, and the king realizes that her smile was the only grand spectacle he needed.",
          "He lifts his goblet and whispers a toast to his favorite person, promising to keep the next surprise below the level of a national emergency."
        ]
      );
      epicStories.couple.push(
        [
          "👑 The palace bells ring as _samara_ and Oce arrive for the annual Royal Harmony Celebration.",
          "The goddess has prepared a dignified address, while the king has secretly booked a forty-piece orchestra.",
          "They exchange a loving smile that lasts precisely until the first trumpet sounds.",
          "_samara_ asks why there are musicians hiding behind the throne.",
          "Oce claims the instruments are purely decorative.",
          "A cymbal crashes, exposing the lie with spectacular timing.",
          "The goddess reminds him that they agreed on a quiet ceremony.",
          "He replies that forty musicians is quiet compared with the hundred he originally wanted.",
          "The royal council begins placing bets on who will win the argument.",
          "A mischievous page announces the betting totals aloud.",
          "_samara_ turns her gaze on the council, and every wager suddenly becomes a charitable donation.",
          "Oce, sensing danger, offers his wife a rose and an improvised apology in song.",
          "The melody is dreadful, but his sincerity is impossible to miss.",
          "The goddess tries to remain stern, then laughs despite herself.",
          "She takes his hand and announces that harmony does not require silence, only someone worth listening to.",
          "Oce kisses her hand, the orchestra finally plays in tune, and the court celebrates the most gloriously chaotic marriage in Olympus."
        ],
        [
          "⚡ _samara_ and Oce enter the royal hall to discover a mysterious proclamation declaring them the kingdom's Most Dramatic Couple.",
          "The goddess suspects a conspiracy; the king suspects a well-deserved award.",
          "They summon the herald, who nervously explains that the title was decided by popular vote.",
          "Oce asks whether there is a trophy.",
          "_samara_ asks whether the voters have ever witnessed actual divine wrath.",
          "The herald reveals that the trophy is a golden goblet engraved with both their names.",
          "Oce falls instantly in love with it.",
          "The goddess points out that the goblet is shaped like a screaming face.",
          "The king calls it an artistic representation of passion.",
          "They begin arguing over where to display it, drawing an eager crowd of courtiers.",
          "Someone starts selling snacks.",
          "Oce suggests placing the trophy beside his wine collection; _samara_ insists it belongs in the hall of cautionary tales.",
          "Their debate grows so theatrical that the herald begins taking notes for next year's ceremony.",
          "At last, the goddess declares that the goblet will be used to collect fines for unnecessary royal drama.",
          "Oce immediately drops a coin inside and asks whether serenades count.",
          "She kisses his cheek, says only the terrible ones, and the entire court erupts in laughter."
        ]
      );
      // Additional distinct, self-contained twenty-sentence epics for each established profile.
      epicStories.sam.push([
        "⚡ A silver storm gathers above Olympus as _samara_ arrives at a banquet being held in her honor.",
        "The entire court bows, except for one pompous ambassador who claims he has never bowed to anyone.",
        "The goddess pauses on the staircase and asks whether his knees are broken or merely his judgment.",
        "He replies that his kingdom recognizes no divine authority.",
        "She smiles, and the chandeliers flicker as though the building itself knows what comes next.",
        "The ambassador presents a scroll listing seventeen demands for special treatment.",
        "_samara_ reads the first, then asks a servant for a red pen.",
        "By the seventh demand, the pen is smoking.",
        "By the twelfth, the ambassador has begun sweating through his ceremonial robes.",
        "The final demand insists that all guests applaud whenever he enters a room.",
        "The goddess turns to the crowd and asks if anyone has ever heard anything so tragically desperate.",
        "A single courtier coughs, and the sound echoes like a cannon.",
        "She offers the ambassador a simple bargain: one honest apology in exchange for a peaceful evening.",
        "He tries to negotiate for a smaller apology.",
        "The thunder answers before she can.",
        "The ambassador drops to one knee so quickly that the marble floor seems offended.",
        "_samara_ accepts his apology with the graciousness of someone who knows she has already won.",
        "She orders the banquet to continue and has his seventeen demands framed as a warning to future visitors.",
        "The musicians begin playing, and even the ambassador joins the applause.",
        "The goddess takes her throne, proving once again that true power never needs to beg for attention."
      ]);
      epicStories.oce.push([
        "🍷 King Oce arrives at the royal theater beneath a shower of rose petals he personally ordered.",
        "Tonight, he has promised _samara_ the greatest love ballad ever performed by a living monarch.",
        "The royal orchestra waits nervously as the king adjusts his cape for the ninth time.",
        "He announces that his voice is a gift to the kingdom, though the kingdom has not been consulted.",
        "The curtain rises, revealing a stage crowded with candles and a mechanical moon.",
        "Oce begins his song with surprising tenderness.",
        "For one beautiful moment, the entire theater falls silent.",
        "Then the mechanical moon breaks free and rolls across the stage.",
        "The drummer dives out of its path, striking a cymbal with his forehead.",
        "Oce refuses to stop singing because, as he explains between verses, true romance fears no machinery.",
        "A stagehand attempts to catch the moon and accidentally releases a flock of decorative doves.",
        "The doves settle on the king's crown as if claiming a new nesting site.",
        "Oce raises his goblet, declares them his backup singers, and continues the chorus.",
        "Somewhere in the audience, a courtier whispers that the performance has become a national emergency.",
        "BEEP BOOP, Oce announces, claiming his royal charm system has entered emergency mode.",
        "He finally spots _samara_ laughing so hard that she has tears in her eyes.",
        "The king abandons the elaborate finale and steps to the edge of the stage.",
        "He tells her, softly and without an orchestra, that every ridiculous thing he does is an attempt to make her smile.",
        "The goddess blows him a kiss, and the audience erupts in genuine applause.",
        "Oce bows beneath his feathered crown, raises his wine, and declares the evening a spectacular romantic success."
      ]);
      epicStories.couple.push([
        "👑 _samara_ and Oce arrive at the Palace of a Thousand Mirrors for what was supposed to be a peaceful royal holiday.",
        "The goddess has packed a book and requested silence; the king has packed wine and hired a traveling choir.",
        "Their carriage stops beneath a golden archway, where a nervous steward greets them with a suspiciously long rulebook.",
        "Rule one forbids singing after sunset.",
        "Oce looks personally wounded.",
        "Rule two forbids thunderstorms inside the building.",
        "_samara_ asks whether that rule was written specifically for her.",
        "The steward wisely refuses to answer.",
        "By dinner, the king has discovered an acoustic hallway that makes his voice sound like an entire opera company.",
        "He sings a love song so loudly that every mirror in the corridor begins to tremble.",
        "The goddess appears behind him and asks whether he is trying to serenade her or declare war on the furniture.",
        "Oce insists that romance requires commitment and excellent acoustics.",
        "She responds that romance also requires knowing when to shut up.",
        "The king bows theatrically and promises one full minute of silence.",
        "Thirty seconds later, a mirror crashes in the next room and the steward runs in blaming the royal guests.",
        "_samara_ discovers that the actual culprit is a mischievous palace cat chasing its reflection.",
        "Oce offers to write the cat a song; the goddess threatens to book him a separate room.",
        "They exchange a look, burst into laughter, and agree to spend the rest of the evening together by the fire.",
        "He pours the wine while she rests her head against his shoulder, their argument already becoming a favorite memory.",
        "Outside, the choir begins singing without permission, and the royal couple shout in perfect unison: NOT ANOTHER NOTE."
      ]);
      // Each entry is a complete, separately tagged narrative; tags prevent plot/ending repeats.
      const variedEpics={
        sam:[
          {id:'torn-war-medic',theme:'torn',ending:'quiet-rescue',lines:[
            "⚡ _samara_ arrives in Torn City to find her faction's war room in complete disarray.",
            "Three members are arguing over targets, someone has misplaced the medical supplies, and the attack list is upside down.",
            "She demands a little order, which is brave considering the company she keeps.",
            "A rookie admits they have no energy left and are worried they've let everyone down.",
            "Instead of roasting them, the goddess quietly hands over supplies and explains how to prepare for the next push.",
            "Then she turns to the veterans and asks why the rookie has more sense than the entire leadership table.",
            "The room goes silent.",
            "She rewrites the plan, assigns everyone a job, and gives the rookie the easiest target.",
            "The next wave lands perfectly, and the rookie gets the final hit.",
            "The goddess claims she planned every second of it.",
            "A faction member points out that she accidentally wrote 'hospital' as 'hopsital' on the whiteboard.",
            "_samara_ erases the evidence before anyone can take a screenshot.",
            "For once, nobody gets roasted for the mistake; the rookie gets the credit and the faction gets the win."
          ]},
          {id:'myth-underworld-lease',theme:'myth',ending:'bureaucratic-twist',lines:[
            "🏛️ _samara_ descends into the Underworld after receiving a notice that her name has appeared on Hades' tenant register.",
            "She has never rented anything from Hades, especially not a damp cave with questionable plumbing.",
            "The ferryman demands two coins for passage; she gives him one and a lecture on fraudulent service fees.",
            "Hades greets her with a stack of contracts taller than Cerberus.",
            "Apparently, someone forged her signature on a lease for the entire River Styx.",
            "She checks the signature and discovers that the forger misspelled her name.",
            "The goddess begins an investigation with the enthusiasm of someone who loves order and lives for scandal.",
            "Cerberus leads her to a terrified minor god hiding behind a filing cabinet.",
            "He confesses that he wanted to open a luxury riverside resort.",
            "She makes him refund every guest and repair the riverbanks.",
            "Hades asks whether she intends to punish the criminal with lightning.",
            "She smiles and hands the culprit a thousand-page compliance manual instead.",
            "By morning, the Underworld has its first functioning complaints department, and Hades is begging her to leave."
          ]},
          {id:'torn-bazaar-bungle',theme:'torn',ending:'self-own',lines:[
            "🛒 _samara_ opens her Torn bazaar for a quiet afternoon of business and immediately catches someone trying to haggle over a one-dollar item.",
            "She politely explains that the price is already lower than their dignity.",
            "The customer sends a five-paragraph argument.",
            "She replies with a single question mark.",
            "Half the faction joins chat to watch the negotiation collapse.",
            "Determined to demonstrate professional customer service, the goddess drafts a beautifully organized sales announcement.",
            "She adds sparkles, a discount code, and a final line telling everyone to 'come grab my massive socks.'",
            "She meant stocks.",
            "Oce spots the typo first but says nothing.",
            "Within minutes, the bazaar has more visitors than ever before.",
            "She checks the message, stares at the screen, and mutters something deeply unfit for Olympus.",
            "Then she doubles down and announces a limited-time sock sale.",
            "The faction buys out her inventory just to keep the joke alive.",
            "The goddess pockets the profit and decides that chaos is an acceptable marketing strategy."
          ]}
        ],
        oce:[
          {id:'torn-newbie-help',theme:'torn',ending:'warm-without-speech',lines:[
            "🩹 King Oce notices a new faction member sitting in the Torn hospital with no supplies and a string of failed attacks.",
            "The rookie jokes that they might as well quit.",
            "Oce doesn't laugh.",
            "He sends a message asking what happened, then patiently walks them through a better way to prepare.",
            "The rookie admits they're embarrassed to ask for help.",
            "Oce tells them that everyone starts somewhere, even kings who occasionally make spectacularly stupid decisions.",
            "He shares what he can spare and waits while they recover.",
            "A faction member interrupts to mock the rookie's battle stats.",
            "Oce's reply is so sharp that the chat goes quiet.",
            "Then he goes straight back to helping, as though nothing happened.",
            "The rookie finally wins a fight and sends him a delighted message.",
            "Oce responds with one word: 'Proud.'",
            "A minute later he sends another message asking whether 'proud' has one u or two.",
            "The rookie laughs for the first time all day."
          ]},
          {id:'myth-minotaur-map',theme:'myth',ending:'accidental-genius',lines:[
            "🐂 King Oce is sent into the Minotaur's labyrinth carrying a map, a torch, and absolutely no confidence in the mapmaker.",
            "At the first junction he discovers the map is upside down.",
            "At the second, he finds a note reading 'definately turn left.'",
            "He spends ten minutes insulting the spelling before realizing the note is a trap.",
            "The Minotaur charges from the darkness.",
            "Oce ducks behind a pillar and shouts that the creature has terrible timing.",
            "He notices every corridor echoes differently and begins tapping the walls to find an exit.",
            "The monster follows the noise while Oce circles behind it.",
            "Soon the king has guided the Minotaur into a dead end without drawing his sword.",
            "He locks the gate and calmly asks whether anyone else needs directions.",
            "The gods arrive expecting to rescue him.",
            "Instead, they find Oce charging admission to his newly opened labyrinth tour.",
            "He has even corrected all the spelling on the signs."
          ]},
          {id:'torn-race-last',theme:'torn',ending:'unbothered-defeat',lines:[
            "🏎️ King Oce announces that his latest Torn race will be a masterclass in speed.",
            "He has practiced his victory speech longer than he's practiced the track.",
            "At the starting line he notices a faction member has entered in a car held together by hope and spare parts.",
            "He offers them some friendly advice and a thoroughly unnecessary lecture about tire pressure.",
            "The race begins, and Oce takes the first corner beautifully.",
            "The second corner is less beautiful.",
            "By lap three he is behind the car held together by hope.",
            "He tries an ambitious overtake and ends up admiring the scenery from the wrong direction.",
            "The faction chat fills with laughing emojis.",
            "Oce crosses the finish line last, parks carefully, and asks the winner if they want help upgrading their car.",
            "Someone calls him a sore loser.",
            "He replies that he lost the race, not his manners.",
            "Then he points out that the heckler spelled 'loser' with two o's.",
            "The argument lasts longer than the race."
          ]}
        ],
        couple:[
          {id:'torn-faction-roast',theme:'torn',ending:'third-party-wins',lines:[
            "📱 _samara_ and King Oce log into faction chat at the same time and immediately argue over who is more useful in a ranked war.",
            "Oce claims experience; _samara_ asks whether he means experience from the Bronze Age.",
            "He points out that her latest attack plan contains four spelling mistakes and a suspicious drawing of a chicken.",
            "She says the chicken is his tactical portrait.",
            "Two faction members start taking bets on which one will rage quit first.",
            "The couple decide to settle the dispute with a competition: whoever helps the most members before the next chain wins.",
            "Oce quietly supplies meds while _samara_ organizes targets and encourages the rookies.",
            "They keep interrupting each other to announce imaginary score updates.",
            "By the end of the chain, everyone has been helped and both claim victory.",
            "A rookie posts a spreadsheet showing the biggest contribution came from a third member who ignored the competition entirely.",
            "Oce requests a recount.",
            "_samara_ calls the spreadsheet an act of treason.",
            "The rookie replies, 'You two are exhausting.'",
            "The faction votes that the rookie has won."
          ]},
          {id:'myth-cerberus-sitting',theme:'myth',ending:'unexpected-pet',lines:[
            "🐕 Hades asks _samara_ and King Oce to watch Cerberus for one afternoon while he attends a meeting.",
            "_samara_ agrees on the condition that Oce follows the feeding schedule exactly.",
            "Oce points out that the instructions contain the phrase 'three heads, one appetite' and asks who proofread them.",
            "The first head wants meat, the second wants attention, and the third wants to eat the furniture.",
            "The goddess arranges three bowls in perfect order.",
            "Oce names the heads Trouble, More Trouble, and Steve.",
            "Steve promptly steals his boot.",
            "A chase breaks out through the Underworld, scattering paperwork and frightening a visiting prophet.",
            "_samara_ is furious until she discovers that Cerberus will sit perfectly still for a belly rub.",
            "Oce accuses her of spoiling the beast.",
            "She points out that he has spent the last hour talking to Steve in a baby voice.",
            "Hades returns to find the three-headed monster asleep between them.",
            "He asks how they managed it.",
            "The couple answer at once: 'We're keeping him.'",
            "Hades spends the next week negotiating visitation rights."
          ]},
          {id:'torn-oc-misread',theme:'torn',ending:'competent-chaos',lines:[
            "💼 _samara_ and King Oce volunteer to coordinate an organized crime with several faction members.",
            "The goddess creates a checklist so detailed that it has its own table of contents.",
            "Oce reads the instructions and asks why 'disguise' is spelled three different ways.",
            "She tells him to stop proofreading and start preparing.",
            "One teammate shows up dressed as a pizza delivery driver.",
            "Another has brought an actual pizza.",
            "Oce argues that the pizza is the most sensible part of the operation.",
            "The original plan falls apart when their lookout mistakes the target for a tourist bus.",
            "_samara_ improvises a diversion while Oce calmly gets everyone out of the wrong place.",
            "They regroup, abandon the bad plan, and agree not to gamble the team's safety on a misunderstanding.",
            "The faction member with the pizza asks whether this means the mission is cancelled.",
            "Oce says yes, then offers to pay for dinner.",
            "_samara_ sighs at the ruined schedule but admits the team handled the chaos well.",
            "The pizza arrives with her name misspelled on the box.",
            "Oce takes a photo before she can confiscate it."
          ]}
        ]
      };
      const cameoScenes={
        fool:[
          n=>[`🤡 ${n} arrives at the royal court wearing a crown made of kitchen utensils.`,`_samara_ asks whether ${n} has mistaken the throne room for a cooking competition.`,`Oce appoints ${n} royal jester on the spot, provided no one touches his wine.`,`By dinner, ${n} has accidentally entertained the entire kingdom. The goddess admits the fool has potential.`],
          n=>[`👑 ${n} declares a new royal holiday in honor of their own brilliance.`,`_samara_ demands proof of this alleged brilliance; ${n} presents a potato wearing a tiny crown.`,`Oce laughs so hard he spills his wine and names the potato Duke Spud.`,`The holiday is approved, but only the potato gets a parade.`]
        ],
        advisor:[
          n=>[`📜 Advisor ${n} presents a confidential plan to improve the royal treasury.`,`_samara_ notices the plan includes a suspiciously large budget for 'consulting snacks.'`,`Oce asks whether those snacks include wine. ${n} suddenly becomes very nervous.`,`The goddess approves one biscuit and orders a full audit. ${n} calls it a hostile work environment.`],
          n=>[`🔍 ${n}, the royal advisor, warns that someone has been stealing palace secrets.`,`_samara_ asks why the secret reports all have ${n}'s handwriting on them.`,`Oce quietly hides behind his wine glass as the advisor attempts a complicated explanation.`,`The investigation concludes when ${n} admits the 'secrets' were just the dinner menu.`]
        ],
        villain:[
          n=>[`🦹 The notorious ${n} storms the palace and announces a plan to steal the royal crown.`,`_samara_ asks whether ${n} has considered the consequences of annoying a goddess.`,`Oce offers the villain a glass of wine to buy time while the guards circle around.`,`${n} surrenders after realizing the crown is heavier than expected. The kingdom calls it the shortest rebellion in history.`],
          n=>[`⚡ ${n} arrives at Olympus with an outrageous demand: surrender the throne by sunset.`,`_samara_ responds by scheduling ${n}'s defeat for noon, because she has plans later.`,`Oce provides dramatic battle music, though the guards beg him to stop singing.`,`By lunchtime, ${n} has retreated and the goddess is back on her throne with a snack.`]
        ],
        bystander:[
          n=>[`😇 ${n} visits the palace hoping for a peaceful afternoon.`,`Unfortunately, Oce is rehearsing a royal love song and _samara_ is reviewing the noise complaints.`,`${n} tries to slip out quietly but gets appointed judge of the singing contest.`,`The verdict is 'please stop.' The goddess rewards ${n} for bravery.`],
          n=>[`🍷 ${n} sits down for a quiet drink in the royal tavern.`,`Oce declares an impromptu karaoke tournament and _samara_ insists on keeping score.`,`${n} gets dragged onstage despite protesting that they only came for a drink.`,`The audience cheers. ${n} escapes with a free bottle and a story nobody will believe.`]
        ],
        victim:[
          n=>[`💥 ${n} volunteers to test the palace's brand-new ceremonial throne.`,`_samara_ warns that Oce assembled it after three bottles of wine.`,`The throne spins in a circle while Oce insists the feature is intentional.`,`${n} staggers off unharmed and demands hazard pay. The goddess doubles it and bans Oce from furniture design.`],
          n=>[`🎭 ${n} agrees to help Oce rehearse a surprise performance for _samara_.`,`Oce assigns ${n} the role of a dragon, complete with a ridiculous cardboard costume.`,`_samara_ walks in early and mistakes the rehearsal for a very strange royal emergency.`,`${n} receives a medal for surviving the performance. Oce is politely asked to retire from directing.`]
        ]
      };
      const generate=()=>{
        const pickRoyal=arr=>arr[Math.floor(Math.random()*arr.length)];
        const member=target.value.trim().replace(/[\r\n<>]/g,'').slice(0,32);
        const who=character.value;
        const includePartner=who==='couple'||partnerCheck.checked;
        const soloFilter=(message)=>{
          if(includePartner)return message;
          if(who==='sam')return message.replace(/\bOceileachair\b|\bOceBot\b|\bOce\b/gi,'the royal court').replace(/\bking\b/gi,'courtier');
          return message.replace(/_samara_/g,'the royal court').replace(/\bgoddess\b/gi,'queen');
        };
        const finishRoyal=(message)=>{preview.value=soloFilter(message);remember(preview.value);count();};
        const finishSolo=(message)=>finishRoyal(message);
        // Honor character, rating, scenario and length before selecting a story.
        // Epic stories are a distinct option, never a blanket override of all categories.
        if(!member&&length.value==='epic'&&rating.value==='mixed'&&personality.value==='balanced'&&
           (who!=='couple'||(scenario.value==='surprise'&&!dialogueCheck.checked))){
          const varied=variedEpics[who]||[];
          const available=varied.filter(story=>!plotHistory.includes(story.id));
          if(available.length){
            const themeCounts={};
            for(const story of varied)themeCounts[story.theme]=plotHistory.filter(id=>varied.some(item=>item.id===id&&item.theme===story.theme)).length;
            const min=Math.min(...available.map(story=>themeCounts[story.theme]||0));
            const balanced=available.filter(story=>(themeCounts[story.theme]||0)===min);
            const selected=pickRoyal(balanced);
            rememberPlot(selected.id);finishRoyal(selected.lines.join(' '));return;
          }
          // Once every new plot has been shown, clear its rotation without touching saved buttons.
          if(varied.length){const selected=pickRoyal(varied);rememberPlot(selected.id);finishRoyal(selected.lines.join(' '));return;}
          const stories=epicStories[who]||[];
          const fresh=stories.filter(parts=>!recent.some(entry=>entry.includes(parts[0])));
          if(stories.length){finishRoyal(pickRoyal(fresh.length?fresh:stories).join(' '));return;}
        }
        // The coherent goddess scenes apply only to mixed-chaos medium/long entrances.
        // Other ratings and personalities keep their own dedicated pools.
        if(who==='sam'&&!member&&rating.value==='mixed'&&personality.value==='balanced'&&
           (length.value==='medium'||length.value==='long')){
          const pool=samaraScenes[intensity.value]||samaraScenes.medium;
          const fresh=pool.filter(parts=>!recent.some(entry=>entry.includes(parts[0])));
          const story=pickRoyal(fresh.length?fresh:pool);
          finishRoyal(story.slice(0,length.value==='medium'?2:3).join(' '));return;
        }
        if(member&&cameoRole.value!=='roast'){
          const options=cameoScenes[cameoRole.value]||cameoScenes.fool;
          const candidates=options.map(fn=>fn(member));
          const fresh=candidates.filter(parts=>!recent.some(entry=>entry.includes(parts[0])));
          const scene=pickRoyal(fresh.length?fresh:candidates);
          const amount=({short:1,medium:2,long:3,epic:4}[length.value]||2);
          finishRoyal(scene.slice(0,amount).join(' '));return;
        }
        if(member){
          const roastPool=personality.value==='savage'&&intensity.value==='wild'?royalWildRoasts:personality.value==='savage'||intensity.value==='wild'?royalSavageRoasts:royalMemberRoasts;
          let joke=pickRoyal(roastPool)(member);
          if(who==='sam')joke=joke.replace(/Oce wrote [^.!?]+[.!?]/g,'The goddess wrote a song about this chaos.');
          if(who==='oce')joke=joke.replace(/Olympus/g,'the royal council');
          const spicy=roastPool!==royalMemberRoasts;
          const additions=spicy?{short:[],medium:['The entire court loses its shit.'],long:['The royal musicians play circus music.','Oce raises his wine while _samara_ laughs herself breathless.'],epic:['The royal musicians play circus music.','Oce raises his wine while _samara_ laughs herself breathless.','BEEP BOOP. Roast complete. Dignity not recoverable.']}:{short:[],medium:['The court applauds with cautious optimism.'],long:['The royal musicians play a suspiciously dramatic tune.','_samara_ and Oce exchange an amused glance.'],epic:['The royal musicians play a suspiciously dramatic tune.','Oce raises his goblet while _samara_ tries not to laugh.','BEEP BOOP. Royal mischief confirmed.']};
          finishRoyal([joke,...(additions[length.value]||[])].join(' '));return;
        }
        if(personality.value==='bot'&&character.value==='oce'){
          const intro=pickRoyal(royalBotLines);
          const more={short:[],medium:['Awaiting further instructions... beep boop.'],long:['Royal diagnostics complete: wine, song, and goddess all detected.','Initiating celebratory dance protocol.'],epic:['Royal diagnostics complete: wine, song, and goddess all detected.','Initiating celebratory dance protocol.','WARNING: _samara_ has overridden the royal operating system.']};
          finishRoyal([intro,...(more[length.value]||[])].join(' '));return;
        }
        if(character.value==='couple'&&(scenario.value==='soap'||scenario.value==='argument'||dialogueCheck.checked)){
          const topics=Object.keys(dramaLines);
          const topic=dramaTopic.value==='surprise'?pickRoyal(topics):dramaTopic.value;
          const candidates=dramaLines[topic];
          const available=candidates.filter(x=>!recent.some(r=>r.includes(x[0])));
          const lines=pickRoyal(available.length?available:candidates).slice();
          const level=dramaLevel.value;
          const humor=intensity.value;
          const reactions={
            light:["Oce: Darling, this is a perfectly innocent misunderstanding.","_samara_: I am going to need a very convincing explanation."],
            medium:["Oce: For the record, my lawyer is a very nervous bard.","_samara_: Even the royal jester thinks your excuse is ridiculous."],
            wild:["Oce: BEEP BOOP. COMMON SENSE HAS LEFT THE FUCKING KINGDOM.","_samara_: Even Zeus thinks this bullshit deserves its own disaster warning!"]
          };
          const reaction=pickRoyal(reactions[humor]||reactions.medium);
          if(level==='heated')lines[2]='⚡ '+lines[2];
          if(level==='meltdown')lines[2]='⚡ '+lines[2].toUpperCase();
          if(level==='unhinged'){lines[0]='🎭 '+lines[0].toUpperCase();lines[2]='⚡ '+lines[2].toUpperCase();}
          if(humor==='wild'&&level==='unhinged')lines[1]=lines[1]+' BEEP BOOP. SHITSHOW PROTOCOL ACTIVATED.';
          const ending=pickRoyal(dramaEnding[level]);
          const amount=({short:1,medium:2,long:3,epic:4}[length.value]||4);
          const result=lines.slice(0,amount);
          if(amount>=2)result[amount-1]+=' '+reaction;
          if(amount>=3)result[amount-1]+=' '+ending;
          finishRoyal(result.join(' '));return;
        }
        if(character.value==='couple'&&dialogueCheck.checked){const fresh=dialogueScenes.filter(x=>!recent.includes(x.join(' ')));const story=(fresh.length?fresh:dialogueScenes)[Math.floor(Math.random()*(fresh.length||dialogueScenes.length))];finishRoyal(story.slice(0,({short:1,medium:2,long:3,epic:4}[length.value]||4)).join(' '));return;}
        if(character.value==='couple'){
          const types=Object.keys(royalCoupleScenarios);
          const type=scenario.value==='surprise'?royalChoose('couple-types',types):scenario.value;
          const stories=royalCoupleScenarios[type];
          const fresh=stories.map((_,i)=>i).filter(i=>!recent.some(r=>r.startsWith(stories[i][0])));const index=royalChoose('couple-'+type,fresh.length?fresh:stories.map((_,i)=>i));
          const story=stories[index].slice();
          if(rating.value==='adult')story[2]+=' Their flirting is getting damn shameless.';
          else if(rating.value==='roast')story[2]+=' They never miss a chance to tease each other.';
          else if(rating.value==='love')story[2]+=' Their love needs no royal decree.';
          else if(rating.value==='mixed'&&Math.random()<0.5)story[2]+=' The court knows these two are trouble.';
          if(personality.value==='wine')story[1]='🍷 Oce calls for another round while the musicians launch into a wildly enthusiastic love song.';
          if(personality.value==='romantic')story[2]='❤️ Through all their mischief, they choose each other, every single day.';
          if(personality.value==='savage')story[2]='🔥 The couple trades such spectacular insults that the court applauds the chemistry.';
          if(intensity.value==='wild'&&rating.value!=='love')story[2]+=' The royal chaos has officially escaped containment.';
          if(scenario.value==='soap'||scenario.value==='argument')story[3]+=' '+pickRoyal(dramaEnding[dramaLevel.value]);
          finishRoyal(story.slice(0,({short:1,medium:2,long:3,epic:4}[length.value]||1)).join(' '));return;
        }
        const lines=royalLines[character.value];const loving=rating.value==='love';const pool=loving?royalLove[character.value].short:(rating.value==='mixed'?[...lines.clean,...lines.adult,...lines.roast]:lines[rating.value]);
        const choices=pool.filter(x=>x!==royalLast);royalLast=(choices.length?choices:pool)[Math.floor(Math.random()*(choices.length||pool.length))];
        if(personality.value==='wine'&&character.value==='oce')royalLast=pickRoyal(['🍷 Oce enters with a goblet raised and a song dedicated to _samara_.','🎶 The king bursts into song, invites his goddess to dance, and orders more wine.']);
        if(personality.value==='romantic')royalLast=pickRoyal(royalLove[character.value].short);
        if(personality.value==='savage')royalLast=pickRoyal(lines.roast);
        if(length.value==='short'){finishSolo(royalLast);return;}
        const scene=loving?royalLove[character.value]:royalScenes[character.value];
        const pickScene=arr=>arr[Math.floor(Math.random()*arr.length)];
        const adult=rating.value==='adult'||(rating.value==='mixed'&&Math.random()<0.4);
        const roast=rating.value==='roast'||(rating.value==='mixed'&&Math.random()<0.5);
        if(loving){
          const parts=[pickScene(scene.opening),pickScene(scene.buildup)];
          if(length.value==='long'||length.value==='epic')parts.push(pickScene(scene.finale));
          if(length.value==='epic')parts.push(pickScene(scene.buildup.filter(x=>x!==parts[1])));
          if(length.value==='medium'||length.value==='epic')parts.push(pickScene(scene.finale.filter(x=>!parts.includes(x))));
          finishSolo(parts.join(' '));return;
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
        finishSolo(parts.join(' '));
      };
      const favKey='chatiq_royal_favorites_v1';
      const getFavorites=()=>{try{const a=JSON.parse(localStorage.getItem(favKey)||'[]');return Array.isArray(a)?a.filter(x=>x&&typeof x.text==='string').slice(0,50):[]}catch(_){return []}};
      const favArea=el('div');favArea.style.cssText='display:none;border:1px solid #786888;border-radius:6px;padding:6px;margin-top:5px;max-height:170px;overflow-y:auto';
      const favToggle=button('⭐ Favorites (0)',()=>{favArea.style.display=favArea.style.display==='none'?'block':'none';renderFavorites()});
      const renderFavorites=()=>{
        const favorites=getFavorites();favToggle.textContent='⭐ Favorites ('+favorites.length+')';favArea.replaceChildren();
        if(!favorites.length){favArea.append(el('div','No favorites saved yet.'));return;}
        favorites.forEach((item,index)=>{
          const row=el('div');row.style.cssText='padding:5px 0;border-bottom:1px solid #53475c';
          const label=el('div',item.name);label.style.cssText='font-weight:bold;overflow-wrap:anywhere';
          const load=button('Load',()=>{preview.value=item.text;count();});
          const remove=button('Delete',()=>{if(!confirm('Delete this favorite?'))return;const items=getFavorites();items.splice(index,1);localStorage.setItem(favKey,JSON.stringify(items));renderFavorites()});
          row.append(label,load,remove);favArea.append(row);
        });
      };
      const favSave=button('☆ Save favorite',()=>{
        const message=preview.value.trim();if(!message){notice('Generate or enter a message first.');return;}
        const items=getFavorites();if(items.length>=50){notice('Favorites full (50). Delete one to save another.');return;}
        const name=prompt('Name this favorite:','Royal entrance '+(items.length+1));if(name===null)return;
        const title=name.trim().slice(0,60)||'Royal entrance '+(items.length+1);
        items.unshift({name:title,text:message});
        try{localStorage.setItem(favKey,JSON.stringify(items));renderFavorites();notice('Favorite saved!')}catch(_){notice('Unable to save favorite on this device.')}
      });
      renderFavorites();
      const regen=button('🎲 Regenerate',generate);
      const use=button('Insert into chat',()=>{const message=preview.value.trim();if(!message)return;if(limit&&message.length>limit){notice('Chat reports a '+limit+' character limit; shorten the entrance.');return;}const existing=input.isContentEditable?input.textContent:input.value;if(existing?.trim()&&!confirm('Replace the existing chat message?'))return;try{insert(input,message,use,box);panel.remove();}catch(err){notice(err.message||String(err));}});
      const close=button('Close',()=>panel.remove());
      panel.append(header,character,profileNote,rating,scenario,dialogue,dramaTopic,dramaLevel,length,partner,personality,intensity,memberLabel,target,cameoRole,preview,counter,note,favSave,favToggle,favArea,regen,use,close);
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
        // The chatFor() wrapper can be an inner titled element rather than the channel root.
        // Prefer the actual ancestor ID before falling back to its displayed title.
        const factionRoot = box.closest('#faction, [id^="faction-"], [id^="faction_"]');
        if (factionRoot && factionRoot.closest('#chatRoot')) return 'FactionChat';
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
        #chatiq-royal-panel{position:fixed;bottom:6px;left:6px;right:6px;max-width:420px;max-height:calc(100dvh - 90px);max-height:calc(100vh - 90px);overflow-y:auto;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;margin:auto;z-index:2147483647;background:#25202f;color:white;border:1px solid #ae91cc;border-radius:10px;padding:9px;box-shadow:0 3px 18px #0009;font:13px Arial,sans-serif}
        #chatiq-royal-panel select,#chatiq-royal-panel textarea{display:block;box-sizing:border-box;width:100%;margin:4px 0;padding:5px 7px;background:#17141e;color:white;border:1px solid #777;border-radius:5px;font:14px Arial,sans-serif;min-height:32px}#chatiq-royal-panel textarea{height:92px;min-height:70px;resize:vertical}#chatiq-royal-panel input[type=text]{padding:6px 8px!important;min-height:32px!important;font-size:14px!important}#chatiq-royal-panel button{font-size:13px}
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
