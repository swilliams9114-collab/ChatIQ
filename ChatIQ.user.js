// ==UserScript==
// @name         ChatIQ
// @namespace    samara.ChatIQ
// @version      0.1.4
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
    const VERSION = '0.1.4';
    // Keep legacy storage keys so existing custom shortcuts remain available.
    const CONFIG_KEY = 'chatButtonConfig';
    const OWN = '[data-ecb-owned]';
    const CHANNELS = {TradeChat:'Trade', HospitalChat:'Hospital', FactionChat:'Faction', CompanyChat:'Company', GlobalChat:'Global', UserChat:'Private'};
    const TITLE = '[class*="chat-box-header__name"], [class*="header"] [class*="title"], [class*="header"] [class*="name"], [class*="title___"]';
    const ROOT = '[id^="public_"], [id^="faction-"], [id^="faction_"], [id^="company-"], [id^="company_"], [id^="private-"], [id^="private_"]';
    const INPUT = 'textarea, [contenteditable="true"][role="textbox"], [contenteditable="true"][class*="textarea"]';
    const rendered = new WeakMap();

    // EntranceIQ: integrated, manual-send royal entrance generator.
    const ROYAL_KEY='chatiq-royal-options-v2';
    const royalDefaults={character:'sam',mode:'mixed',mood:'random',roasts:true};
    let royalSettings;
    try{royalSettings={...royalDefaults,...JSON.parse(localStorage.getItem(ROYAL_KEY)||'{}')}}catch{royalSettings={...royalDefaults}}
    const saveRoyal=()=>{try{localStorage.setItem(ROYAL_KEY,JSON.stringify(royalSettings))}catch{}};
    const royalLines={
      sam:{
        dramatic:[
          '🏛️ _samara_ descends from Olympus. Mortals, try not to embarrass yourselves.',
          '⚡ Thunder rolls. _samara_ arrives. The gods have officially lost control.',
          '👑 Bow, peasants. Your favorite Greek goddess has entered the chaos.',
          '✨ The heavens part for _samara_. Someone fetch her throne and a cocktail.',
          '🏛️ Olympus is missing a goddess. Torn is about to find out why.'
        ],
        sexy:[
          '💋 _samara_ enters. Hearts race, crowns slip, and bad decisions follow.',
          '🔥 The goddess has arrived. Try not to fall in love; the line is long.',
          '✨ _samara_ walks in looking like temptation with excellent timing.',
          '💄 One wink from _samara_ and the entire kingdom forgets its manners.'
        ],
        savage:[
          '⚡ _samara_ has arrived. The standards were low; somehow you ducked.',
          '👑 Your goddess is here. I see the circus still has no ringmaster.',
          '🏛️ _samara_ enters. Some of you are living proof that gods make mistakes.',
          '💅 I came, I saw, I judged. You are all underwhelming.'
        ],
        sarcastic:[
          '✨ Oh good, the peasants are still unsupervised. _samara_ is here.',
          '🏛️ _samara_ enters. Please contain your excitement. Or do not. Whatever.',
          '👑 Your goddess has arrived. I assume the welcome parade got lost.',
          '💋 I leave for five minutes and civilization collapses. Typical.'
        ],
        unhinged:[
          '⚡ _samara_ kicked open Olympus, stole Zeus’s thunder, and came for snacks.',
          '👑 The goddess arrives riding a flaming chariot of questionable decisions.',
          '🏛️ _samara_ enters. Hide the wine, release the chaos, blame Oce.',
          '🔥 Olympus issued a warning. _samara_ took it as an invitation.'
        ],
        roast:[
          '👑 _samara_ arrives. Oce, your ego has requested its own private island.',
          '💋 Oce, darling, your crown is lovely. Did it come with a personality?',
          '🏛️ The goddess enters. Oce is still auditioning to be important.',
          '⚡ _samara_ arrives. Someone tell Oce his throne is a folding chair.'
        ],
        adult:[
          '🔥 _samara_ has entered. Kneel, bitches; Olympus sent its finest disaster.',
          '💋 Your goddess is here. Try to keep your filthy thoughts organized.',
          '👑 _samara_ arrives. I brought divine chaos and zero fucks to give.',
          '⚡ The goddess has spoken: behave, you magnificent little assholes.'
        ],
        adultRoast:[
          '👑 _samara_ enters. Oce, your ego is bigger than your damn kingdom.',
          '💋 Oce, sweetheart, that crown cannot hide your royal bullshit.',
          '🔥 _samara_ arrives. Oce can kiss the ring once he finds his dignity.',
          '🏛️ Oce calls himself king. That is adorable as fuck.'
        ]
      },
      oce:{
        dramatic:[
          '👑 Hear ye! King Oceileachair arrives. The kingdom may now begin.',
          '⚔️ The gates swing open. Oce enters with an army of unnecessary trumpets.',
          '🏰 Behold King Oce! His majesty has graciously allowed your presence.',
          '👑 The throne was lonely. Oce has returned to restore its magnificence.',
          '⚔️ A royal decree: Oce has arrived. Let the peasants rejoice.'
        ],
        sexy:[
          '👑 King Oce enters, handsome as ever and humble as absolutely never.',
          '💋 Oce has arrived. Please form an orderly queue for royal admiration.',
          '🏰 The king walks in. Hearts flutter; his reflection applauds.',
          '⚔️ Oce arrives dressed like trouble and smelling faintly of victory.'
        ],
        savage:[
          '👑 Oce arrives. The peasants are still disappointing, but he persists.',
          '⚔️ Your king is here. Some of you have the strategic depth of a spoon.',
          '🏰 Oce enters. Intelligence remains optional in this kingdom.',
          '👑 Bow before Oce. Yes, even those of you with terrible opinions.'
        ],
        sarcastic:[
          '👑 Oh look, the kingdom survived without Oce. Barely. You are welcome.',
          '🏰 Oce has arrived. No need to applaud; actually, yes, please do.',
          '⚔️ The king enters. I see nobody cleaned the royal mess. Shocking.',
          '👑 Oce returns. Apparently excellence cannot take a day off.'
        ],
        unhinged:[
          '👑 Oce rides in on a golden goose, declares war on chairs, and wins.',
          '⚔️ The king has arrived. Release the dragons and hide the accountants.',
          '🏰 Oce enters with seventeen trumpets and a dangerously large ego.',
          '👑 The crown is on. The brain is optional. The royal chaos begins.'
        ],
        roast:[
          '👑 Oce arrives. _samara_, Olympus called: they want their attitude back.',
          '⚔️ The king enters. _samara_ has once again stolen the royal spotlight.',
          '🏰 Oce declares _samara_ a menace to crowns and public order.',
          '👑 _samara_ may be divine, but Oce still owns the bigger mirror.'
        ],
        adult:[
          '👑 King Oce is here, you glorious bastards. Let the royal bullshit begin.',
          '⚔️ Oce storms in. Bow, fuckers. His majesty has had a long day.',
          '🏰 The king arrives with a crown, an ego, and absolutely no fucks.',
          '👑 Oce enters. Your complaints can kiss the royal backside.'
        ],
        adultRoast:[
          '👑 Oce arrives. _samara_, quit stealing my damn thunder, goddess.',
          '⚔️ _samara_ is divine, but her attitude is a royal pain in my ass.',
          '🏰 Oce enters. Someone tell _samara_ this is my fucking throne.',
          '👑 _samara_ can keep Olympus. I rule this glorious shitshow.'
        ]
      }
    };
    let royalLast='';
    function openRoyal(box,input){
      document.getElementById('chatiq-royal-panel')?.remove();
      const panel=el('div',undefined,'chatiq-royal-panel');panel.id='chatiq-royal-panel';
      const header=el('div','👑 Royal Entrance · EntranceIQ');header.style.fontWeight='bold';
      const makeSelect=(options,value)=>{const select=el('select');for(const [id,label] of options){const opt=el('option',label);opt.value=id;select.append(opt)}select.value=value;return select};
      const character=makeSelect([['sam','_samara_ — Greek Goddess'],['oce','Oceileachair — King Oce']],royalSettings.character);
      const mode=makeSelect([['mixed','Mixed Chaos (default)'],['adult','Adults Only 🔥'],['clean','PG-13 Only']],royalSettings.mode);
      const mood=makeSelect([['random','Surprise Me 🎲'],['dramatic','Dramatic'],['sexy','Sexy / Flirty'],['savage','Savage'],['sarcastic','Sarcastic'],['unhinged','Unhinged']],royalSettings.mood);
      const roastLabel=el('label');roastLabel.style.cssText='display:flex;gap:8px;align-items:center;margin:8px 0';
      const roasts=el('input');roasts.type='checkbox';roasts.checked=royalSettings.roasts;roasts.style.width='auto';roastLabel.append(roasts,document.createTextNode('Include Royal Roasts in surprise mode'));
      const preview=el('textarea');preview.rows=5;const chatLimit=input.maxLength>0?input.maxLength:null;
      const count=el('div');count.style.cssText='font-size:12px;text-align:right;margin-bottom:6px';
      const note=el('div','Editable · never sends automatically');note.style.fontSize='11px';
      const updateCount=()=>{const n=preview.value.length;count.textContent=n+(chatLimit?' / '+chatLimit+' characters':' characters · chat limit not exposed');count.style.color=chatLimit&&n>chatLimit?'#ff8b8b':'#cbbce0'};
      const saveOptions=()=>{royalSettings={character:character.value,mode:mode.value,mood:mood.value,roasts:roasts.checked};saveRoyal()};
      const generate=()=>{
        saveOptions();
        const types=mood.value==='random'?['dramatic','sexy','savage','sarcastic','unhinged',...(roasts.checked?['roast']:[])]:[mood.value];
        const options=[];
        for(const type of types){
          if(mode.value==='adult'){
            options.push(...royalLines[character.value][type]);
            if(type==='roast')options.push(...royalLines[character.value].adultRoast);
            else options.push(...royalLines[character.value].adult);
          }else options.push(...royalLines[character.value][type]);
        }
        const pool=options.filter(line=>line!==royalLast);
        const candidates=pool.length?pool:options;
        royalLast=candidates[Math.floor(Math.random()*candidates.length)];
        preview.value=royalLast;updateCount();
      };
      const regen=button('🎲 Regenerate',generate);
      const use=button('Insert into chat',()=>{
        const message=preview.value.trim();if(!message)return;
        if(chatLimit&&message.length>chatLimit){notice('This chat input allows '+chatLimit+' characters. Your entrance has '+message.length+'.');return}
        const existing=input.isContentEditable?input.textContent:input.value;
        if(existing?.trim()&&!confirm('Replace the existing chat message?'))return;
        try{insert(input,message,use,box);panel.remove()}catch(err){notice(err.message||String(err))}
      });
      const close=button('Close',()=>panel.remove());
      preview.addEventListener('input',updateCount);
      for(const control of [character,mode,mood,roasts])control.addEventListener('change',generate);
      panel.append(header,character,mode,mood,roastLabel,preview,count,note,regen,use,close);
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
        const limit = input.maxLength > 0 ? input.maxLength : Infinity;
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
