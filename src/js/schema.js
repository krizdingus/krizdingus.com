// schema.js
const ldJson = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": "https://krizdingus.com/#site",
            "url": "https://krizdingus.com/",
            "name": "Krizdingus",
            "description": "Web developer. Tinkerer. Occasional menace. Projects include Discord bots, bootleg cartridge labels, and things that probably shouldn't exist.",
            "publisher": { "@id": "https://krizdingus.com/#person" }
        },
        {
            "@type": "Person",
            "@id": "https://krizdingus.com/#person",
            "name": "Kris Williams",
            "url": "https://krizdingus.com/",
            "jobTitle": "Web Developer & Maker",
            "description": "Web developer. Tinkerer. Occasional menace. Projects include Discord bots, bootleg cartridge labels, and things that probably shouldn't exist.",
            "sameAs": [
                "https://github.com/krizdingus",
                "https://www.instagram.com/krizdingus/",
                "https://makerworld.com/en/@krizdingus"
            ]
        },
        {
            "@type": "Organization",
            "@id": "https://krizdingus.com/#organization",
            "name": "Krizdingus",
            "url": "https://krizdingus.com/",
            "logo": "https://krizdingus.com/assets/images/krizdingus-opengraph.png",
            "sameAs": [
                "https://github.com/krizdingus",
                "https://www.instagram.com/krizdingus/",
                "https://makerworld.com/en/@krizdingus"
            ]
        },
        {
            "@type": "BreadcrumbList",
            "@id": "https://krizdingus.com/#breadcrumb",
            "itemListElement": [
                {
                    "@type": "ListItem",
                    "position": 1,
                    "name": "Home",
                    "item": "https://krizdingus.com/"
                }
            ]
        },
        {
            "@type": "ItemList",
            "@id": "https://krizdingus.com/#projects",
            "itemListOrder": "https://schema.org/ItemListOrderAscending",
            "numberOfItems": 8,
            "itemListElement": [
                {
                    "@type": "CreativeWork",
                    "position": 1,
                    "url": "https://makerworld.com/en/models/715832-mini-magsafe-zyn-container",
                    "name": "Mini MagSafe Zyn Container",
                    "description": "A magnetic pouch dock so I never lose a Zyn mid-panic-coding session.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Shapr3D", "ABS FDM", "3D Print"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 2,
                    "url": "https://github.com/krizdingus/gb-rom-database-bot",
                    "name": "GB Rom Database Bot",
                    "description": "Because we absolutely needed another database of nearly 5000 Game Boy games to search through (but this one has filtering!).",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["JavaScript", "Node.js"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 3,
                    "url": "https://github.com/krizdingus/gameboy-cartridge-labels",
                    "name": "Game Boy Cartridge Labels",
                    "description": "Custom labels for homebrew and flash cartridges.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Design", "Print"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 4,
                    "url": "https://github.com/krizdingus/mouse-bite-labs-cartridge-labels",
                    "name": "Mouse Bite Labels Flash Cartridge Labels",
                    "description": "Professional labels for Mouse Bite Labs cartridges.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Design", "Web"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 5,
                    "url": "https://makerworld.com/en/models/623660-game-boy-game-pak-discreet-display-stand",
                    "name": "Game Boy Game Pak Discreet Display Stand",
                    "description": "Look, Ma! No stands! Show of your games, not the displays.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["3D Design", "Print"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 6,
                    "url": "https://makerworld.com/en/models/640269-cassette-style-case-for-game-boy-games",
                    "name": "Cassette-Style Case for Game Boy Games",
                    "description": "Retro storage solution for Game Boy games.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["3D Design", "Retro"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 7,
                    "url": "https://www.thingiverse.com/thing:6240141",
                    "name": "Gamecube Power Port USB-C Adapter",
                    "description": "Modern power solution for vintage gaming.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Hardware", "Mod"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 8,
                    "url": "https://makerworld.com/en/models/1293032-printable-poopin-stool",
                    "name": "Printable Poopin' Stool",
                    "description": "Practical solutions for everyday problems.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Practical", "3D Print"]
                }
            ]
        }
    ]
};

const s = document.createElement('script');
s.type = 'application/ld+json';
s.textContent = JSON.stringify(ldJson);
document.head.appendChild(s); 