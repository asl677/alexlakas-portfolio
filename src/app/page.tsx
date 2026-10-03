"use client";

import { Languages, MailOpen, PenLine, Star } from "lucide-react";
import ThemeSwitch from "../components/ThemeSwitch";
import { ArticleTabs, ContentsScrollSpy, HoverPortrait, IntroSequence, MobileSearchSheet, PageSearch, SeamlessVideo, SmoothAnchorScroll, WikiSection } from "../components/WikiClient";

const references = [
  { label: "Alex Lakas featured in UX designer portfolios worth studying", href: "https://www.uxpin.com/studio/blog/ux-portfolio-examples/", source: "UXPin" },
  { label: "Fiveonefour announces $17M raise", href: "https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html", source: "PR Newswire" },
  { label: "Alex Lakas portfolio", href: "https://craftwork.design/curated/website/alex-lakas", source: "Craftwork" },
  { label: "Podcast: Building a side hustle remotely while working a 9-to-5", href: "https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-", source: "As Told By Nomads" },
  { label: "Insured Nomads acquires Peanut", href: "https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension", source: "ITIJ" },
  { label: "Designing LinkedIn Home and Sharing Experience", href: "https://www.casestudy.club/case-studies/designing-a-simpler-more-inclusive-linkedin-home-sharing-experience", source: "Case Study Club" },
  { label: "Do I need a COVID test to travel? And other summer travel questions", href: "https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/", source: "Forbes" },
  { label: "LinkedIn adds polls and live video-based events", href: "https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/", source: "TechCrunch" },
  { label: "U.S. design patents", links: [{ label: "D893,509", href: "https://uspto.report/patent/grant/D893%2C509" }, { label: "D892,816", href: "https://patentimages.storage.googleapis.com/94/19/e7/9f1b746a0a9912/USD892816.pdf" }, { label: "D869,501", href: "https://patents.justia.com/patent/D869501" }], source: "Patents" },
  { label: "Google adds salon and spa bookings through Maps and Search", href: "https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/", source: "TechCrunch" },
  { label: "Google Live Popular Times featured on The Tonight Show Starring Jimmy Fallon", href: "https://www.youtube.com/watch?v=QIbPZgH1zRY", source: "YouTube" },
  { label: "LinkedIn is gearing up for a redesign", href: "https://techcrunch.com/2012/07/10/linkedin-is-gearing-up-for-a-redesign-bigger-pictures-anchored-menu-and-a-life-less-tweeted/", source: "TechCrunch" },
  { label: "Alex Lakas featured in 10 UX design portfolio examples", href: "https://www.shutterstock.com/blog/ux-design-portfolios", source: "Shutterstock" },
  { label: "Alex Lakas featured in 30 UX designer portfolio examples", href: "https://www.founderjar.com/inspiration/ux-designer-portfolio-examples/", source: "FounderJar" },
  { label: "Alex Lakas featured in product-designer portfolio case studies", href: "https://blog.designpeeps.net/blog/product-design-portfolios/?p=403", source: "DesignPeeps" },
  { label: "Google Maps redesign case study crediting Alex Lakas", href: "https://www.simonfungcreative.com/google-maps.html", source: "Simon Fung Creative" },
  { label: "Alex Lakas portfolio and product-design archive", href: "https://dribbble.com/alex2pt0", source: "Dribbble" },
  { label: "Alex Lakas product-design portfolio", href: "https://www.behance.net/alexlakas?locale=en_US", source: "Behance" },
  { label: "Google Business Profile help: popular times, wait times, and visit duration", href: "https://support.google.com/business/answer/6263531?hl=en", source: "Google" },
  { label: "Alex's design portfolio archive", href: "https://thecreativefinder.com/export-portfolio.php?username=asl677", source: "The Creative Finder" },
];

const articles = [
  { title: "Designing Area Code", date: "Fiveonefour", dek: "Fast analytics apps and a starter kit for modern developer workflows.", href: "https://alexslakas.medium.com/designing-area-code-a-starter-kit-for-modern-analytics-apps-ed421767d667", image: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*Jju41LNCrQ95PzA6hxR1LA.jpeg" },
  { title: "Prototyping AI with AI", date: "Fiveonefour", dek: "How AI tools can help turn early product ideas into useful prototypes.", href: "https://alexslakas.medium.com/prototyping-ai-with-ai-f3b8a40e07d9", image: "https://miro.medium.com/v2/resize:fill:320:214/1*VEYmGjbbTYVI3ufEStNGsg.png" },
  { title: "Designing a simpler, more inclusive LinkedIn Home & Sharing", date: "LinkedIn", dek: "Behind-the-scenes thinking on a reimagined social network.", href: "https://alexslakas.medium.com/designing-a-simpler-more-inclusive-linked-in-home-sharing-315c81109177", image: "https://miro.medium.com/v2/resize:fit:640/format:webp/1*2fUEA_2VQcdnZ6JBWo2D0Q.png" },
  { title: "Know before you go with Google's Live Popular Times", date: "Google", dek: "A case study on real-time local information for Google Maps and Search.", href: "https://alexslakas.medium.com/know-before-you-go-with-googles-live-popular-times-bcfc7320ecaa", image: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*tvnPllmUzgIvJVdPxyPVPg.png" },
  { title: "Search faster on Google Maps", date: "Google", dek: "Designing local discovery flows that reduce the need to type.", href: "https://alexslakas.medium.com/search-faster-on-google-maps-d6b8597c4a07", image: "https://miro.medium.com/v2/resize:fill:320:214/1*AMLLrIjOr9igNelp0fGGmg.jpeg" },
  { title: "Reservations made easy with Google", date: "Google", dek: "A booking experience for local services and places.", href: "https://alexslakas.medium.com/reservations-made-easy-with-google-7b7d35888ad9", image: "https://miro.medium.com/v2/resize:fill:320:214/1*GvbV2bdeQMN2a5rXXA34Fw.jpeg" },
  { title: "Why we built Peanut", date: "Peanut", dek: "The story behind building a better travel-planning experience.", href: "https://alexslakas.medium.com/why-we-built-peanut-6cac9182d1f8", image: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*_8brVFCI957xxa_Tc2BLlA.jpeg" },
  { title: "A Journey Into Type", date: "Dec 2023", dek: "Building a logo font from zero in 72 hours.", href: "https://alexslakas.medium.com/a-journey-into-type-73d56899b172", image: "https://miro.medium.com/v2/resize:fill:320:214/1*7NKBidFv3IA6XTLrtFUwlA.png" },
  { title: "Data With Depth: Designing 514", date: "Dec 2023", dek: "A humanized approach to data-intensive apps.", href: "https://alexslakas.medium.com/data-with-depth-designing-514-44698c3e5390", image: "https://miro.medium.com/v2/resize:fill:320:214/1*hS--7nKr8dUW7yeKvlYzuQ.png" },
  { title: "Designing a simpler, more inclusive LinkedIn Home & Sharing", date: "Jul 2021", dek: "Behind-the-scenes thinking on a reimagined social network.", href: "https://alexslakas.medium.com/designing-a-simpler-more-inclusive-linked-in-home-sharing-315c81109177", image: "https://miro.medium.com/v2/resize:fill:320:214/1*J9oOQMv0N12QmSq7vbCiCQ.png" },
];

function Ref({ n }: { n: number }) {
  const referenceNumber = ({ 1: 8, 2: 8, 3: 8, 4: 8, 5: 13, 6: 15, 7: 8, 8: 11, 9: 7, 10: 18, 11: 6, 12: 16, 13: 17, 14: 2, 15: 1, 16: 14, 17: 10, 18: 5, 20: 4 } as Record<number, number>)[n] ?? n;
  return (
    <sup id={"cite-" + n} className="reference">
      <a href={"#ref-" + referenceNumber}>[{referenceNumber}]</a>
    </sup>
  );
}

export default function Home() {

  return (
    <main className="wiki-shell is-loading">
      <div className="wiki-loader" aria-hidden="true"><span className="wiki-loader-counter" suppressHydrationWarning>0</span></div>
      <IntroSequence />
      <SmoothAnchorScroll />
      <ContentsScrollSpy />
      <div className="wiki-page" id="top">
        <header className="wiki-topbar" data-lenis-prevent>
          <div className="wiki-brand">
            <a href="#top" className="wiki-wordmark" aria-label="Alex | Designer">
              <span className="wiki-wordmark-text" aria-hidden="true" data-nosnippet>Designer</span>
            </a>
          </div>
          <PageSearch />
          <nav>
            <MobileSearchSheet />
            <a href="https://www.linkedin.com/in/latenights/" target="_blank" rel="noreferrer" aria-label="Contact me" title="Contact me"><MailOpen size={20} strokeWidth={2} /></a>
            <ThemeSwitch />
          </nav>
        </header>

        <div className="wiki-layout">
          <aside className="wiki-contents" aria-label="Contents">
            <details open>
              <summary><strong>Contents</strong><span className="contents-toggle" aria-hidden="true" /></summary>
              <a className="contents-top" href="#top">Top</a>
              <nav>
                <a href="#early-life">Early life and education</a>
                <a href="#career">Career</a>
                <a href="#style">Style</a>
                <a href="#media">In the media</a>
                <a href="#publications">Articles</a>
                <a href="#stack">Stack</a>
                <a href="#references">References</a>
                <a href="#external-links">External links</a>
              </nav>
            </details>
          </aside>

          <article className="wiki-article">
            <header className="wiki-article-header" data-lenis-prevent>
              <div className="wiki-title-row">
                <h1 className="wiki-article-title">Alex</h1>
                <h1 className="wiki-talk-title">Talk: Alex</h1>
                <div className="wiki-scroll-actions">
                  <div className="wiki-scroll-search"><PageSearch inputId="sticky-page-search" /></div>
                </div>
                <div className="wiki-title-action">
                  <div className="wiki-language">So many languages</div>
                  <div className="wiki-sticky-actions">
                    <a href="https://www.linkedin.com/in/latenights/" target="_blank" rel="noreferrer" aria-label="Contact me" title="Contact me"><MailOpen size={20} strokeWidth={2} /></a>
                    <ThemeSwitch />
                  </div>
                </div>
              </div>
              <ArticleTabs />
              <div className="wiki-mobile-tools" aria-label="Article tools">
                <button type="button" aria-label="Languages"><Languages size={24} strokeWidth={2} /></button>
                <button type="button" aria-label="Add to watchlist"><Star size={24} strokeWidth={2} /></button>
                <button type="button" aria-label="Edit article"><PenLine size={24} strokeWidth={2} /></button>
              </div>
            </header>

            <section className="wiki-talk-page" aria-label="Talk page">
              <p className="wiki-talk-latest">Latest comment: <a href="#start-discussion">1 year ago</a> in topic <a href="#start-discussion">Information on the page not publicly verifiable and does not follow neutral pov</a></p>
              <div className="wiki-talk-notice">
                <p>This article must adhere to the <a href="#start-discussion">biographies of living persons</a> policy. Contentious material about living people that is unsourced or poorly sourced should be removed promptly from the article and its talk page.</p>
                <p>If you are the subject of this article, or are acting on behalf of one, use this page to raise a specific concern or propose a sourced change.</p>
              </div>
              <div className="wiki-talk-status">
                <div className="wiki-talk-rating"><span aria-hidden="true" className="wiki-talk-rating-mark">A</span><span>This article is rated <strong>A-class</strong> on this page&apos;s content assessment scale.</span><a href="#start-discussion">[hide]</a></div>
                <div><strong>Biography: Arts and Entertainment</strong><a href="#start-discussion">[show]</a></div>
                <div><strong>Graphic design</strong><span className="wiki-talk-priority">Insane-importance</span><a href="#start-discussion">[show]</a></div>
                <div><strong>United States</strong><a href="#start-discussion">[show]</a></div>
              </div>
              <section className="wiki-talk-thread" id="start-discussion">
                <h2>Information on the page not publicly verifiable and does not follow neutral pov <span>[edit]</span></h2>
                <p className="wiki-talk-meta">Latest comment: <a href="#start-discussion">1 year ago</a> <span>|</span> 1 comment <span>|</span> 1 person in discussion</p>
                <p>Unsourced material and subjective characterizations should be replaced with verifiable references. Discussion here should focus on specific claims, reliable sources, and neutral language.</p>
              </section>
            </section>
            <div className="wiki-article-body">

            <aside className="infobox">
              <h2>Alex</h2>
              <HoverPortrait />
              <p className="caption">Elementary school yearbook</p>
              <dl>
                <dt>Born</dt><dd>United States</dd>
                <dt>Based in</dt><dd>Los Angeles, California</dd>
                <dt>Occupation</dt><dd>Sr. staff designer, art director, product designer</dd>
                <dt>Known for</dt><dd>&ldquo;Incredibly talented designer&rdquo;, &ldquo;Simple, clear aesthetic&rdquo;, &ldquo;Good people&rdquo;</dd>
                <dt>LinkedIn</dt><dd><a href="https://www.linkedin.com/in/latenights" target="_blank" rel="noreferrer">linkedin.com/in/latenights</a></dd>
                <dt>Interests</dt><dd>Cars, design, engineering, comedy, AI, systems</dd>
              </dl>
            </aside>

            <p className="lead"><b>Alexander Stephanos Lakas</b> is a Los Angeles-based designer and art director whose work spans product and interaction design, identity, prototyping, and generative AI. He has designed local discovery and booking at <a href="https://support.google.com/business/answer/6263531?hl=en" target="_blank" rel="noreferrer">Google</a>, home and sharing at <a href="https://www.casestudy.club/case-studies/designing-a-simpler-more-inclusive-linkedin-home-sharing-experience" target="_blank" rel="noreferrer">LinkedIn</a>, and data infrastructure products at <a href="https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html" target="_blank" rel="noreferrer">Fiveonefour</a>, with work featured in <a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Forbes</a>, <a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">TechCrunch</a>, and on The Tonight Show.<Ref n={1} /><Ref n={2} /><Ref n={5} /><Ref n={10} /><Ref n={16} /></p>

            <nav className="toc article-toc" aria-label="Table of contents">
              <h2>Contents</h2>
              <ol>
                <li><a href="#early-life">Early life and education</a></li>
                <li><a href="#career">Career</a></li>
                <li><a href="#style">Style</a></li>
                <li><a href="#media">In the media</a></li>
                <li><a href="#publications">Articles</a></li>
                <li><a href="#stack">Stack</a></li>
                <li><a href="#references">References</a></li>
                <li><a href="#external-links">External links</a></li>
              </ol>
            </nav>

            <WikiSection id="early-life" title="Early life and education"><p>Alex grew up on the East Coast and got into design through illustration, animation, and the web. He studied art and computer science at the University of Maryland, College Park, under <a href="https://www.jamesthorpedesign.com/about" target="_blank" rel="noreferrer">James Thorpe</a>, <a href="https://www.coplanar.org/" target="_blank" rel="noreferrer">Brandon Morse</a>, and <a href="https://design.ncsu.edu/people/hsarmstr/" target="_blank" rel="noreferrer">Helen Armstrong</a>. He later moved to the Bay Area to join the tech movement, then to Los Angeles to freelance and live by the beach.<Ref n={1} /><Ref n={8} /></p></WikiSection>

            <WikiSection id="career" title="Career">
              <p>Alex has held design roles across agency, startup, and large technology company contexts. Public profile summaries list early agency and ecommerce work followed by roles at Google, LinkedIn, Peanut Travel, Culprit Creative, and Fiveonefour.<Ref n={1} /><Ref n={3} /></p>
              <div id="social-games-and-ecommerce" className="career-feature">
                <h3>Social games and ecommerce</h3>
                <p>Beginning in 2009, Alex worked with Cubix Labs and Virid on digital experiences spanning social games and ecommerce. The work combined product thinking, interaction design, and campaign systems at a time when social platforms were becoming a primary place for brands to meet people.</p>
                <p>That period included work connected to Zippo and Nintendo, translating established brands into playful, participatory web experiences. It established an early interest in designing systems that balance clear utility with character, motion, and a strong visual point of view.<Ref n={1} /></p>
              </div>
              <div id="branching-out" className="career-feature career-feature--right career-feature--portrait">
                <h3>Branching out</h3>
                <figure>
                  <img src="https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/648e113182964bd201887b14_alex-lakas-pCibATCkQxo-unsplash%20(3).webp" alt="Alex Lakas" />
                  <figcaption>Alex, early 2010s</figcaption>
                </figure>
                <p>Before joining larger product teams, Alex worked across independent web, identity, and interactive projects. That early practice established the editorial systems, motion studies, and direct visual language that later carried into product work.<Ref n={1} /></p>
                <p>These projects treated websites and prototypes as complete experiences rather than static portfolios: each combined narrative, interface, and behavior. The work formed the foundation for Alex&apos;s later focus on clear systems and useful digital tools.</p>
              </div>
              <div id="local-search-for-merchants-and-consumers" className="career-feature career-feature--left career-feature--landscape">
                <h3>Local search for merchants and consumers</h3>
                <figure>
                  <img src="https://miro.medium.com/v2/resize:fill:320:214/1*J9oOQMv0N12QmSq7vbCiCQ.png" alt="A product design project" />
                  <figcaption>Local discovery and booking work at Google</figcaption>
                </figure>
                <p>At <a href="https://support.google.com/business/answer/6263531?hl=en" target="_blank" rel="noreferrer">Google</a>, Alex worked across Google My Business, Local Search, and Maps. His work helped shape local discovery, Live Popular Times, visit-duration information, and booking flows that connect people with nearby businesses and services.<Ref n={1} /><Ref n={8} /><Ref n={9} /></p>
                <p>Those experiences turned complex local data into timely signals people could act on: whether a place was busy, when to visit, and how to make a reservation without leaving Search or Maps. For small businesses, the same tools made practical information and conversion paths easier to maintain and find. The role also gave him the chance to work with agencies such as Ueno and Method on a range of projects.</p>
              </div>
              <div id="modernizing-social-media-for-professionals" className="career-feature career-feature--right career-feature--square career-feature--team">
                <h3>Modernizing social media for professionals</h3>
                <figure>
                  <img src="https://miro.medium.com/v2/resize:fit:700/1*nacLVsr2ifTQvHN_qQknYw.png" alt="Alex with the LinkedIn Sharing team" />
                  <figcaption>The Sharing Team: I&apos;m the one in the hat</figcaption>
                </figure>
                <p>As a Senior Product Designer at <a href="https://www.casestudy.club/case-studies/designing-a-simpler-more-inclusive-linkedin-home-sharing-experience" target="_blank" rel="noreferrer">LinkedIn</a>, Alex worked on the home experience and sharing tools, then helped develop polls and live video features as the platform expanded how professional communities could participate and connect. The work spanned design systems, product design, and prototyping.<Ref n={3} /><Ref n={6} /><Ref n={10} /></p>
                <p>The goal was to make professional participation feel less formal and more immediate. Streamlined sharing, lightweight polls, and live formats gave members more ways to contribute, while preserving the context and utility people expect from a professional network.</p>
              </div>
              <div id="freelance-and-0-1" className="career-feature career-feature--left career-feature--wide career-feature--peanut">
                <h3>Freelance and 0-1</h3>
                <figure>
                  <div className="peanut-still">
                    <img src="/peanut-travel-on.png" alt="Peanut Travel: Travel on." />
                  </div>
                  <figcaption>Peanut Travel</figcaption>
                </figure>
                <p>Alex co-founded <a href="https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension" target="_blank" rel="noreferrer">Peanut Travel</a>, a browser-based travel-planning product that partnered with Insured Nomads, a travel-insurance company, before it was acquired by the company. His work there spanned design systems, product design, and prototyping. He then served as Design Director at Culprit Creative, extending his work across brand, social, and product experiences.<Ref n={1} /><Ref n={11} /></p>
                <p>Built by a lean founding team, Peanut delivered booking-time travel intelligence for thousands of destinations across Expedia, Booking.com, and Google Flights. At Peanut, the product brought useful travel choices into the browsing moment, reducing the distance between research and action. At Culprit, Alex applied the same product thinking to creative direction, building systems that could carry a clear point of view across platforms and campaigns.<Ref n={7} /></p>
              </div>
              <div id="new-territory-ai-data-infra" className="career-feature career-feature--right career-feature--landscape">
                <h3>New territory — AI Data Infra at 514</h3>
                <figure>
                  <SeamlessVideo />
                  <figcaption>Data Infra AI Agents</figcaption>
                </figure>
                <p>As Head of Design at <a href="https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html" target="_blank" rel="noreferrer">Fiveonefour</a>, Alex shaped data-infrastructure products and design systems through 2026, including work for F45 and District Cannabis.<Ref n={5} /></p>
                <p>The work focused on making technical systems easier to understand and operate: interfaces that reveal what data is doing, workflows that support faster decisions, and a shared design language that can scale across a growing product. The team also built AI agents that ingest, stream, and transform data in just a few clicks. The F45 and District Cannabis projects carried that discipline into consumer-facing experiences.</p>
              </div>
            </WikiSection>

            <WikiSection id="style" title="Style"><p>Alex describes himself as a generalist with a focus on visual design and prototyping. His published work often uses restrained typography, black-and-white palettes, kinetic transitions, image-led case studies, and direct editorial writing. LinkedIn recommendations describe a collaborator who brings clarity to complex problems, pairs a strong visual point of view with practical product judgment, and makes teams feel heard throughout the process. His Dribbble profile describes his practice as art direction and design.<Ref n={2} /><Ref n={3} /></p></WikiSection>
            <WikiSection id="media" title="In the media">
              <p>Alex&apos;s work has appeared in coverage of independent product, travel, and technology projects. <a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Forbes</a> featured Peanut Travel in reporting on travel planning, while <a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">TechCrunch</a> covered LinkedIn work involving polls and live video-based events, as well as the modernization of LinkedIn&apos;s homepage and sharing experience.<Ref n={10} /><Ref n={12} /><Ref n={14} /></p>
              <p>His Google Live Popular Times work was featured on <a href="https://www.youtube.com/watch?v=QIbPZgH1zRY" target="_blank" rel="noreferrer">The Tonight Show Starring Jimmy Fallon</a>, alongside publication coverage of Fiveonefour&apos;s data-infrastructure practice and other independent creative projects.<Ref n={16} /></p>
              <p>In 2022 he appeared on the <a href="https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-" target="_blank" rel="noreferrer">As Told By Nomads</a> podcast with Brady Simpson, discussing building a side business remotely while working a full-time job.<Ref n={20} /></p>
              <ul className="wiki-link-list media-links">
                <li><a href="https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html" target="_blank" rel="noreferrer">Fiveonefour announces its $17M raise</a>. <i>PR Newswire</i>.</li>
                <li><a href="https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-" target="_blank" rel="noreferrer">Podcast: Building a side hustle remotely while working a 9-to-5</a>. <i>As Told By Nomads</i>.</li>
                <li><a href="https://www.casestudy.club/case-studies/designing-a-simpler-more-inclusive-linkedin-home-sharing-experience" target="_blank" rel="noreferrer">Designing a simpler, more inclusive LinkedIn Home and Sharing experience</a>. <i>Case Study Club</i>.</li>
                <li><a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Do I need a COVID test to travel? And other summer travel questions</a>. <i>Forbes</i>.</li>
                <li><a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">LinkedIn adds polls and live video-based events</a>. <i>TechCrunch</i>.</li>
                <li><a href="https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/" target="_blank" rel="noreferrer">Google adds salon and spa bookings through Maps and Search</a>. <i>TechCrunch</i>.</li>
                <li><a href="https://www.youtube.com/watch?v=QIbPZgH1zRY" target="_blank" rel="noreferrer">Google Live Popular Times featured on The Tonight Show</a>. <i>YouTube</i>.</li>
                <li><a href="https://techcrunch.com/2012/07/10/linkedin-is-gearing-up-for-a-redesign-bigger-pictures-anchored-menu-and-a-life-less-tweeted/" target="_blank" rel="noreferrer">LinkedIn is gearing up for a redesign</a>. <i>TechCrunch</i>.</li>
              </ul>
            </WikiSection>
            <WikiSection id="publications" title="Articles">
              <div className="article-list">
                {articles.slice(0, 7).map((article) => (
                  <article id={`publication-${article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="article-list-item" key={article.href}>
                    <a className="article-list-image" href={article.href} target="_blank" rel="noreferrer" aria-label={`Read ${article.title}`}>
                      <img src={article.image} alt="" />
                    </a>
                    <div>
                      <p className="article-list-meta">{article.date}</p>
                      <h3><a href={article.href} target="_blank" rel="noreferrer">{article.title}</a></h3>
                      <p>{article.dek}</p>
                    </div>
                  </article>
                ))}
              </div>
              <p><a className="external-link" href="https://alexslakas.medium.com/" target="_blank" rel="noreferrer">More on Medium</a></p>
            </WikiSection>
            <WikiSection id="stack" title="Stack"><ul className="stack-tags"><li>Claude</li><li>Codex</li><li>Hermes</li><li>Vercel</li><li>GitHub</li><li>Figma</li><li>Midjourney</li><li>shadcn/ui</li><li>Three.js</li><li>WebGL</li><li>Webflow</li><li>React</li><li>GSAP</li><li>IXD</li><li>Visual design</li><li>UXD</li><li>Mixed Methods Research</li><li>Strategy</li><li>Leadership</li><li>Gen AI</li><li>Rapid prototyping</li><li>Brand</li><li>Presentations</li><li>Basic ass design principles</li><li>Grids</li><li>Minimalism</li></ul></WikiSection>
            <WikiSection id="references" title="References"><ol className="references">{references.map((reference, index) => {
              const patentLinks = reference.links ?? [];
              return <li id={"ref-" + (index + 1)} key={reference.label}><a className="reference-backlink" href={"#cite-" + (index + 1)} aria-label={`Back to citation ${index + 1}`}>^</a>{patentLinks.length ? <><span>{reference.label}: </span>{patentLinks.map((patent, patentIndex) => <span key={patent.href}><a href={patent.href}>{patent.label}</a>{patentIndex < patentLinks.length - 1 ? ", " : ""}</span>)}</> : <a href={reference.href ?? "#references"}>{reference.label}</a>}. <i>{reference.source}</i>.</li>;
            })}</ol></WikiSection>
            <WikiSection id="external-links" title="External links"><ul className="wiki-link-list"><li><a className="external-link" href="https://dribbble.com/alex2pt0" target="_blank" rel="noreferrer">Alex on Dribbble</a></li><li><a className="external-link" href="https://x.com/axlakas" target="_blank" rel="noreferrer">Alex on X</a></li><li><a className="external-link" href="https://www.linkedin.com/in/latenights" target="_blank" rel="noreferrer">Alex on LinkedIn</a></li><li><a className="external-link" href="https://alexslakas.medium.com/" target="_blank" rel="noreferrer">Alex on Medium</a></li></ul></WikiSection>
            <nav className="wiki-categories" aria-label="Categories">
              <span>Categories:</span>
              <a href="#top">American designers</a>
              <a href="#career">Art directors</a>
              <a href="#work">Product designers</a>
              <a href="#google">Interaction designers</a>
              <a href="#top">People from Los Angeles</a>
              <a href="#top">Living people</a>
            </nav>
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}
