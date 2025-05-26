// schema.js
const ldJson = {
    "@context": "https://schema.org",
    "@graph": [
        {
            "@type": "WebSite",
            "@id": "https://krizdingus.com/#site",
            "url": "https://krizdingus.com/",
            "name": "Krizdingus",
            "description": "Hardware hacks and chaotic code, served fresh",
            "publisher": { "@id": "https://krizdingus.com/#person" }
        },
        {
            "@type": "Person",
            "@id": "https://krizdingus.com/#person",
            "name": "Kris Williams",
            "url": "https://krizdingus.com/",
            "jobTitle": "Web Developer & Maker",
            "description": "Web developer by trade, maker by impulse. Building tools, toys, and quirks in equal measure.",
            "sameAs": [
                "https://github.com/krizdingus",
                "https://www.instagram.com/krizdingus/",
                "https://kwilliams.me"
            ]
        },
        {
            "@type": "Organization",
            "@id": "https://krizdingus.com/#organization",
            "name": "Krizdingus",
            "url": "https://krizdingus.com/",
            "logo": "https://krizdingus.com/assets/images/dingus_opengraph.png",
            "sameAs": [
                "https://github.com/krizdingus",
                "https://www.instagram.com/krizdingus/",
                "https://kwilliams.me"
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
                    "keywords": ["3D Printing", "MagSafe", "Hardware", "Design"]
                },
                {
                    "@type": "CreativeWork",
                    "position": 2,
                    "url": "https://github.com/krizdingus/gb-rom-database-bot",
                    "name": "GB ROM Database Bot",
                    "description": "Because remembering 7,000 Game Boy titles is above my pay grade.",
                    "creator": { "@id": "https://krizdingus.com/#person" },
                    "datePublished": "2024-03-19",
                    "keywords": ["Game Boy", "Database", "Bot", "JavaScript"]
                }
            ]
        }
    ]
};

const s = document.createElement('script');
s.type = 'application/ld+json';
s.textContent = JSON.stringify(ldJson);
document.head.appendChild(s); 