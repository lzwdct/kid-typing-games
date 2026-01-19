import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL('https://kids-typing-game.pages.dev'),
  title: "Kids English Typing Game | Fun Typing Games for Children Ages 7-12",
  description: "Free educational typing games for kids! Learn English spelling and improve typing skills through fun games like Acid Rain, Spelling Bloom, Story Time, Letter Pop, and Word Race. Perfect for children ages 7-12.",
  keywords: [
    "kids typing game",
    "children typing practice",
    "learn typing for kids",
    "english spelling games",
    "educational games",
    "typing tutor for children",
    "free typing games",
    "typing practice",
    "spelling practice",
    "learn english typing",
    "kids learning games",
    "typing skills for kids",
  ],
  authors: [{ name: "Kids Typing Adventure" }],
  creator: "Kids Typing Adventure",
  publisher: "Kids Typing Adventure",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://kids-typing-game.pages.dev",
    siteName: "Kids English Typing Adventure",
    title: "Kids English Typing Game | Fun Learning for Children",
    description: "Free educational typing games for kids! Learn English spelling and improve typing skills through 5 exciting games. Perfect for ages 7-12.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Kids English Typing Adventure - Fun Learning Games",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Kids English Typing Game | Fun Learning for Children",
    description: "Free educational typing games for kids! Learn English spelling and improve typing skills. Perfect for ages 7-12.",
    images: ["/og-image.png"],
    creator: "@typingadventure",
  },
  alternates: {
    canonical: "https://kids-typing-game.pages.dev",
  },
  category: "education",
  verification: {
    google: "ImZgoKi18AckS1ks3Qs6dE5ZAaawUyLRU2ELDtXIdME",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const analyticsToken = process.env.NEXT_PUBLIC_CLOUDFLARE_ANALYTICS_TOKEN;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebApplication",
        "name": "Kids English Typing Adventure",
        "description": "Free educational typing games for kids to learn English spelling and improve typing skills",
        "url": "https://kids-typing-game.pages.dev",
        "applicationCategory": "EducationalApplication",
        "operatingSystem": "Web Browser",
        "offers": {
          "@type": "Offer",
          "price": "0",
          "priceCurrency": "USD",
        },
        "audience": {
          "@type": "EducationalAudience",
          "educationalRole": "student",
          "audienceType": "children ages 7-12",
        }
      },
      {
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": "https://kids-typing-game.pages.dev"
          }
        ]
      }
    ]
  };

  return (
    <html lang="en">
      <head>
        {/* Cloudflare Web Analytics */}
        {analyticsToken && (
          <Script
            defer
            src="https://static.cloudflareinsights.com/beacon.min.js"
            data-cf-beacon={JSON.stringify({ token: analyticsToken })}
            strategy="afterInteractive"
          />
        )}
        {/* JSON-LD Structured Data */}
        <Script
          id="json-ld"
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
          strategy="beforeInteractive"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
