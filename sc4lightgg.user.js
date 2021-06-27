// ==UserScript==
// @name                Simplified Chinese for light.gg
// @name:zh             light.gg 简体中文支持
// @name:zh-CN          light.gg 简体中文支持
// @namespace           https://github.com/HZDeluxe
// @version             0.2.1
// @description         Add Simplified Chinese weapons and perks display for light.gg
// @description:zh      为light.gg添加简体中文武器和特性支持
// @description:zh-CN   为light.gg添加简体中文武器和特性支持
// @author              HZDeluxe
// @match               https://www.light.gg/*
// ==/UserScript==

(function() {
    'use strict';
    var page = null;
    var getItemDataOnce = wrapOnce(getItemData);
    var modifyPerksRequestOnce = wrapOnce(modifyPerksRequest);
    var lgg = {
        data: {
            item: { ready: false }
        },
        common: {
            navbar: { 
                selector: '#navbar-collapse', 
                ontranslate: translNavbar 
            }
        },
        pages: {
            index: {
                path: /^\/$/i,
                elms: {}
            },
            item: {
                path: /\/items\/(\d+)\//i,
                elms: {
                    itemHeader: { 
                        selector: '#main-column > .item-header', 
                        ontranslate:  translItemHeader 
                    },
                    itemKeyPerks: { 
                        selector: '#special-perks', 
                        pretranslate: getItemDataOnce,
                        ontranslate: translKeyPerks 
                    },
                    itemStats: { 
                        selector: '#stat-container',
                        ontranslate: translItemStats
                    },
                    itemPerks: { 
                        selector: '#socket-container > .perks',
                        pretranslate: modifyPerksRequestOnce,
                        ontranslate: translItemPerks
                    },
                    itemYourRollsTitle: {
                        selector: '#my-rolls > h4',
                        ontranslate: function(elm) {
                            if(elm.translated) {
                                elm.translated.childNodes[0].textContent = '你的 Roll';
                            }
                            elm.translDone = true;
                        }
                    },
                    itemYourRolls: { 
                        selector: '#my-rolls', 
                        dynamic: true, 
                        pretranslate: modifyPerksRequestOnce,
                        ontranslate: function() {
                            var myRolls = document.querySelector('#my-rolls');
                            if(myRolls) {
                                // get vue instance and modify UpdateComputedRolls function
                                var vm2 = myRolls.__vue__;
                                var realUpdateRolls = vm2.UpdateComputedRolls;
                                vm2.UpdateComputedRolls = function() {
                                    realUpdateRolls();
                                    if(localStorage.getItem('lang') === 'chs') {
                                        vm2.$nextTick(function(){
                                            lgg.utils.addChsSuffix(vm2.$el);
                                        });
                                    } else {
                                        vm2.$nextTick(function(){
                                            lgg.utils.removeChsSuffix(vm2.$el);
                                        });
                                    }
                                };
                            }
                        },
                        ontoggle: function() {
                            document.body.dispatchEvent(new Event("doneRefreshing"));
                        }
                    },
                    itemRelatedCollectible: { 
                        selector: '#related-collectible', 
                        pretranslate: getItemDataOnce,
                        ontranslate: translRelatedCollectible 
                    },
                    itemLoreTitle: {
                        selector: '#main-column > h3',
                        ontranslate: function(elm) {
                            if(elm.translated) {
                                elm.translated.innerText = '传奇故事';
                            }
                            elm.translDone = true;
                        }
                    },
                    itemLoreContent: { 
                        selector: '#lore-content',
                        ontranslate: translLoreContent
                    },
                    itemSidebar: { 
                        selector: '#sidebar-container',
                        ontranslate: translItemSidebar
                    },
                    itemTabbedContent: { 
                        selector: '#tabbed-content-container',
                        ontranslate: translTabbedContent
                    },
                }
            }
        },
        utils: {
            getCurrentPage: function() {
                var p = { elms: {} };
                for (var propPage in lgg.pages) {
                    var path = lgg.pages[propPage].path;
                    if(path.test(location.pathname)) {
                        p = lgg.pages[propPage];
                        break;
                    }
                }
                for (var propCommon in lgg.common) {
                    p.elms[propCommon] = lgg.common[propCommon];
                }
                return p;
            },
            getItemId: function() {
                var matches = location.pathname.match(/\/items\/(\d+)\//i);
                return matches[1];
            },
            isTranslDone: function() {
                for (var prop in page.elms) {
                    var elm = page.elms[prop];
                    if(!elm.dynamic && !elm.translDone) {
                        return false;
                    }
                }
                return true;
            },
            addChsSuffix: function(elm) {
                var itemsWithDataId = elm.querySelectorAll('.show-hover[data-id]');
                itemsWithDataId.forEach(function(item) {
                    item.setAttribute('data-id', item.dataset.id.replace('-chs', '') + '-chs');
                });
            },
            removeChsSuffix: function(elm) {
                var itemsWithDataId = elm.querySelectorAll('.show-hover[data-id]');
                itemsWithDataId.forEach(function(item) {
                    item.setAttribute('data-id', item.dataset.id.replace('-chs', ''));
                });
            },
            translateTree: function(elm) {
                if(!elm) {
                    return;
                }
                var treeWalker = document.createTreeWalker(
                    elm,
                    NodeFilter.SHOW_TEXT
                );
                var currentNode = treeWalker.currentNode;
                while(currentNode) {
                    var text = currentNode.textContent.trim();
                    var translatedText = dict[text];
                    if(translatedText) {
                       currentNode.textContent = translatedText; 
                    }
                    currentNode = treeWalker.nextNode();
                }
            }
        }
    };

    var dict = {
        "Splicer": "永夜",
        "Chosen": "天选",
        "Beyond Light": "凌光之刻",
        "Trials": "试炼",
        "Raids": "突袭",
        "Lore": "传奇故事",
        "Exotic Gear": "异域装备",
        "Gambit": "智谋",
        "Vanguard": "先锋",
        "Crucible": "熔炉",
        "The Crucible": "熔炉",
        "Iron Banner": "铁旗",
        "Emblems": "徽标",
        "Checklists": "清单",
        "Eververse": "永恒之诗",
        "Season 14": "14赛季",
        "Override Gear": "超控装备",
        "Vault of Glass Gear": "玻璃宝库装备",
        "New Exotics": "新增异域装备",
        "New Armor": "新增护甲",
        "New Weapons": "新增武器",
        "New Cosmetics": "新增装饰",
        "New Quests": "新增任务",
        "Trials Gear": "试炼装备",
        "All Seasons": "所有赛季",
        "Exotics": "异域装备",
        "Weapons": "武器",
        "All Armor": "所有护甲",
        "Titan Gear": "泰坦装备",
        "Hunter Gear": "猎人装备",
        "Warlock Gear": "术士装备",
        "Cosmetics": "装饰",
        "Inventory Items": "物品栏",
        "Quests": "任务",
        "Bounties": "悬赏",
        "Legend": "传说",
        "Collections": "收藏品",
        "Triumphs": "成就",
        "Badges": "证章",
        "Seals": "印章",
        "Vendors": "商人",
        "God Roll Hub": "God Roll 中心",
        "God Roll Finder": "God Roll 查找",
        "Roll Appraiser": "Roll 评估",
        "Tooltip Builder": "Tooltip 构建",
        "Season Pass Tracker": "季票进度追踪",
        "The Director": "导航器",
        "API Update Tracker": "API 更新追踪",
        "Item Comparer": "装备对比",

        // navbar
        "Database": "数据库",
        "God Rolls": "God Rolls",
        "Tools": "工具",
        "Collection": "收藏",
        "Leaderboard": "排行榜",

        // item page
        "Weapon Stats": "武器属性",
        "Hidden Stats": "隐藏属性",
        "Perks": "特性",
        "Curated Roll": "官 Roll",
        "Not all curated rolls actually drop in-game.": "不是所有的官 Roll都能在游戏里掉落。",
        "Random Rolls": "随机 Roll",
        "Item is eligible for random rolls.": "该道具掉落时可以获得随机特性。",
        "Item has recommended perks from the community.": "该道具具有社区推荐的特性。",
        "Community Average Roll": "社区最常用 Roll",
        "Related Collectible": "相关收集品",
        "Contained In": "产出于",
        "Reward From": "奖励于",
        "Related Vendors": "相关商人",
        "Name": "名称",
        "Class": "职业",
        "Titan": "泰坦",
        "Hunter": "猎人",
        "Warlock": "术士",
        "Rarity": "稀有度",
        "Common": "普通",
        "Uncommon": "罕见",
        "Rare": "稀有",
        "Legendary": "传说",
        "Exotic": "异域",
        "Slot": "槽位",
        "Kinetic": "动能",
        "Energy": "能量",
        "Power": "威能",
        "Type": "类别",
        "Triumph": "成就",
        "Share": "分享",
        "Compare": "对比",
        "View 3D": "查看 3D",
        "Screenshots": "屏幕截图",
        "Details": "详情",
        "Deals": "产生 ",
        "KINETIC": "动能",
        "SOLAR": "烈日",
        "VOID": "虚空",
        "ARC": "电弧",
        "STASIS": "冰影",
        "damage": " 伤害",
        "Uses": "使用 ",
        "PRIMARY": "主武器",
        "SPECIAL": "特殊武器",
        "HEAVY": "重武器",
        "ammo": " 弹药",
        "Introduced in": "加入于",
        "Kinetic Weapon": "动能武器",
        "Energy Weapon": "能量武器",
        "Power Weapon": "威能武器",
        "Instance Item": "可实例化道具",
        "Equippable": "可装备",
        "Community Rarity": "社区稀有度",
        "Version History": "版本历史",
        "MODIFIED": "修改于",
        "ADDED": "添加于",
        "Tags": "标签",
        "Other Languages": "其他语言",

        // weapon stats
        "Swing Speed": "挥舞速度",
        "Efficiency": "防御效率",
        "Defense": "防御抗性",
        "Charge Rate": "充能效率",
        "Charge Time": "充能时间",
        "Ammo Capacity": "弹药容量",
        "Blast Radius": "爆炸范围",
        "Velocity": "弹头速度",
        "Impact": "伤害",
        "Range": "射程",
        "Accuracy": "精度",
        "Stability": "稳定性",
        "Handling": "操控性",
        "Reload Speed": "填装速度",
        "Rounds Per Minute": "每分钟发射数",
        "Magazine": "弹匣",
        "Draw Time": "蓄力时间",
        "Aim Assistance": "辅助瞄准",
        "Inventory Size": "物品栏空间",
        "Zoom": "变焦",
        "Recoil": "后坐力",
        "Bounce Intensity": "回弹强度",
        "Bounce Direction": "回弹方向",
        "Tends Vertical": "垂直",
        "Tends Left": "偏左",
        "Tends Right": "偏右"
    };

    init();

    function init() {
        // init language setting
        if (!localStorage.getItem('lang')) {
            localStorage.setItem('lang', 'chs');
        }

        // fix weird "文言", Traditional Chinese should be "繁体中文"
        var chtModalLink = document.querySelector('#localemodal .modal-body a[href^="/db/zh-cht/"]');
        if(chtModalLink) {
            chtModalLink.lastChild.textContent = ' 繁体中文';
        }
        var chtSidebarImg = document.querySelector('#sidebar-locales img[title="文言"]');
        if(chtSidebarImg) {
            chtSidebarImg.title = '繁体中文';
        }

        // set current page
        page = lgg.utils.getCurrentPage();
        if(!page) {
            return;
        }

        translateElms();
        createToggleButton();
        toggleTranslation(localStorage.getItem('lang') === 'chs');
    }

    /* function defines */ 
    // save and translate DOM elements in memory
    function translateElms() {
        function translateSingleElm(elm) {
            var sel = elm.selector;
            if(sel) {
                if(elm.pretranslate) {
                    elm.pretranslate();
                }
                if(!elm.dynamic) {
                    var domElm = document.querySelector(sel);
                    if(domElm) {
                        elm.original = domElm.cloneNode(true);
                        elm.translated = domElm.cloneNode(true);
                    }
                }
                if(elm.ontranslate) {
                    elm.ontranslate(elm);
                }
            }
        }
        for (var prop in page.elms) {
            translateSingleElm(page.elms[prop]);
        }
    }

    // create a toggle button
    function createToggleButton() {
        var btnChs = document.createElement('button');
        btnChs.classList.add('btn', 'btn-orange');
        btnChs.style.fontSize = '20px';
        btnChs.style.position = 'fixed';
        btnChs.style.right = '20px';
        btnChs.style.top = '20px';
        btnChs.style.zIndex = '5000';

        function toggleButton(lang) {
            if(lang === 'chs') {
                btnChs.innerText = '简';
                btnChs.style.backgroundColor = '#f70';
            } else {
                btnChs.innerText = '原';
                btnChs.style.backgroundColor = 'gray';
            }
        }

        btnChs.onclick = function() {
            var lang = localStorage.getItem('lang');
            lang = lang === 'chs' ? 'others' : 'chs';
            localStorage.setItem('lang', lang);
            toggleButton(lang);
            toggleTranslation(lang === 'chs');
        };

        toggleButton(localStorage.getItem('lang'));
        document.body.append(btnChs);
    }

    // switch language by replacing html
    function toggleTranslation(chs) {
        // wait until translation done
        if(chs && !lgg.utils.isTranslDone()) {
            setTimeout(function() {
                toggleTranslation(chs);
            }, 500);
            return;
        }

        function toggleSingleElm(elm) {
            var sel = elm.selector;
            if(sel) {
                if(!elm.dynamic) {
                    var domElm = document.querySelector(sel);
                    if(domElm) {
                        domElm.innerHTML = chs ? elm.translated.innerHTML : elm.original.innerHTML;
                    }
                }
                if(elm.ontoggle) {
                    elm.ontoggle(elm, chs);
                }
            }
        }
        for (var prop in page.elms) {
            toggleSingleElm(page.elms[prop]);
        }
    }

    // produce function that can only be called once
    function wrapOnce(fn) {
        var done = false;
        return function () {
            if (!done) {
                done = true;
                fn();
            }
        }
    }

    // request Simplified Chinese weapon data 
    // and use it to replace the original text
    function getItemData() {
        var item = lgg.data.item;
        item.id = lgg.utils.getItemId();
        var xhr = new XMLHttpRequest();
        xhr.open('GET', '/db/items/hover/' + item.id + '?lang=zh-chs');
        xhr.send();
        xhr.onload = function() {
            if (xhr.responseText) {
                var parser = new DOMParser();
                var doc = parser.parseFromString(xhr.responseText, "text/html");
    
                item.name = doc.querySelector('.hover-item-header h2').innerText.trim();
                item.source = doc.querySelector('.collectible-hint .inner-description-container').lastChild.textContent;
                item.intrinsicPerk = doc.querySelector('.hover-item-intrinsic-perk h4').innerHTML;
                item.intrinsicPerkDesc = doc.querySelector('.hover-item-intrinsic-perk h4 + div').innerHTML;
                item.traitPerk = doc.querySelector('.hover-item-trait-perk h4').innerText;
                item.traitPerkDesc = doc.querySelector('.hover-item-trait-perk h4 + div').innerText;
                item.ready = true;
            }
        };
    }
    
    // modified the perks request to get Simplified Chinese data
    function modifyPerksRequest() {
        function doModifyPerksRequest() {
            var realOpen = window.XMLHttpRequest.prototype.open;
            window.XMLHttpRequest.prototype.open = function() {
                var url = arguments['1'];
                if (url.startsWith('/db/items/hover/')
                    && url.includes('-chs?lang=')) {
                    url = url.replace('-chs', ''); // remove added -chs suffix
                    var splits = url.split('=');
                    url = splits[0] + '=zh-chs';
                }
                arguments['1'] = url;
                return realOpen.apply(this, arguments);
            };
        }
        var script = document.createElement("script");
        script.textContent = "(" + doModifyPerksRequest.toString() + ")();";
        document.body.appendChild(script);
    }

    /* actual translation functions */
    // translate navbar
    function translNavbar(navbar) {
        lgg.utils.translateTree(navbar.translated);
        navbar.translDone = true;
    }
    
    // translate item header
    function translItemHeader(ih) {
        var v3d = ih.translated.querySelector('#preview-3d-modal-opener-2 > a');
        if(v3d) {
            v3d.childNodes[1].textContent = '查看 3D 模型';
        }
        var slots = {
            "1498876634": "动能武器",
            "2465295065": "能量武器",
            "953998645": "威能武器"
        };
        var classes = ["泰坦", "猎人", "术士", ""];
        var item = {};
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.bungie.net/Platform/Destiny2/Manifest/DestinyInventoryItemDefinition/' + lgg.utils.getItemId() + '/?lc=zh-chs');
        xhr.setRequestHeader('X-API-Key', 'd4ea1e95b5394ffdb46908af0275f324');
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send();
        xhr.onload = function() {
            if (xhr.responseText) {
                var response = JSON.parse(xhr.responseText).Response;
                item.name = response.displayProperties.name;
                item.slot = slots[response.equippingBlock.equipmentSlotTypeHash];
                item.tier = response.inventory.tierTypeName;
                item.type = response.itemTypeDisplayName;
                item.class = classes[response.classType];
                item.flavor = response.flavorText;
                item.source = response.displaySource;
                
                ih.translated.querySelector('.item-name h2').childNodes[0].textContent = item.name;
                ih.translated.querySelector('.weapon-type').innerText = 
                    item.tier + ' / ' + (item.class ? item.class + ' / ' : '') +
                    item.slot + ' / ' + item.type;
                var flavors = ih.translated.querySelectorAll('.flavor-text > h4');
                flavors[0].innerText = item.flavor;
                if(flavors[1]) {
                    flavors[1].innerText = item.source;
                }
                ih.translDone = true;
            }
        };
    }

    // translate key perks
    function translKeyPerks(kp) {
        var item = lgg.data.item;
        if(!item.ready) {
            setTimeout(function () {
                translKeyPerks(kp);
            }, 500);
            return;
        }
        var keyPerks = kp.translated.querySelectorAll('.key-perk');
        keyPerks[0].querySelector('h4').innerHTML = item.intrinsicPerk;
        keyPerks[0].querySelector('h4 + div').innerHTML = item.intrinsicPerkDesc;
        keyPerks[1].querySelector('h4').innerHTML = item.traitPerk;
        keyPerks[1].querySelector('h4 + div').innerHTML = item.traitPerkDesc;
        kp.translDone = true;
    }

    // translate item stats
    function translItemStats(is) {
        lgg.utils.translateTree(is.translated);
        is.translDone = true;
    }

    // translate item perks
    function translItemPerks(ip) {
        lgg.utils.addChsSuffix(ip.translated);
        lgg.utils.translateTree(ip.translated);

        // translate community average roll description
        var descLink = ip.translated.querySelector('a[data-target="#community-roll-modal"]');
        if(descLink) {
            var desc = descLink.parentElement.childNodes[0];
            var matches = desc.textContent.match(/on (.+) copies/i);
            desc.textContent = '下面是基于 ' + matches[1] + ' 份该武器统计出的最常装备的特性。';
        }
        
        ip.translDone = true;
    }

    // translate related collectible
    function translRelatedCollectible(rc) {
        var item = lgg.data.item;
        if(!item.ready) {
            setTimeout(function () {
                translRelatedCollectible(rc);
            }, 500);
            return;
        }
        rc.translated.querySelector('.item-header .item-name h2').childNodes[0].textContent = item.name;
        rc.translated.querySelector('.source-line').innerText = item.source;
        lgg.utils.translateTree(rc.translated);
        rc.translDone = true;
    }

    // translate lore content
    function translLoreContent(lc) {
        var lore = {};
        var xhr = new XMLHttpRequest();
        xhr.open('GET', 'https://www.bungie.net/Platform/Destiny2/Manifest/DestinyLoreDefinition/' + lgg.utils.getItemId() + '/?lc=zh-chs');
        xhr.setRequestHeader('X-API-Key', 'd4ea1e95b5394ffdb46908af0275f324');
        xhr.setRequestHeader('content-type', 'application/json');
        xhr.send();
        xhr.onload = function() {
            if (xhr.responseText) {
                var response = JSON.parse(xhr.responseText).Response;
                if (response) {
                    lore.name = response.displayProperties.name;
                    lore.subtitle = response.subtitle;
                    lore.description = response.displayProperties.description;
    
                    lc.translated.querySelector('h2 > i').nextSibling.textContent = lore.name;
                    lc.translated.querySelector('p > em').innerText = lore.subtitle;
                    lc.translated.querySelector('p.lore-desc').innerText = lore.description;
                }
                lc.translDone = true;
            }
        }
    }

    // translate item sidebar
    function translItemSidebar(is) {
        lgg.utils.translateTree(is.translated);

        // translate community rarity description
        var rarityDesc = is.translated.querySelector('#community-rarity > div > span');
        var percent = rarityDesc.childNodes[1].innerText;
        rarityDesc.innerHTML = '被 <strong>' + percent + '</strong> 的light.gg <br> 守护者发现过';

        is.translDone = true;
    }

    function translTabbedContent(tc) {
        lgg.utils.addChsSuffix(tc.translated);
        lgg.utils.translateTree(tc.translated);

        // translate reviews (num)
        var reviewTab = tc.translated.querySelector('#review-tab');
        if(reviewTab) {
            var matches = reviewTab.innerText.match(/\(\d+\)/i);
            reviewTab.innerText = '评价 ' + matches[0];
        }
        
        tc.translDone = true;
    }
})();
