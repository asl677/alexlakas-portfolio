"use client";

import { Flag, Languages, MailOpen, PenTool, Search, Star, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import ThemeSwitch from "../components/ThemeSwitch";
import { ArticleTabs, ContentsScrollSpy, HoverCards, Lightbox, Person, RelatedLinks, HoverPortrait, LanguageMenu, IntroSequence, MobileSearchSheet, PageSearch, SeamlessVideo, SmoothAnchorScroll, WikiSection } from "../components/WikiClient";

const references = [
  { label: "Best UX portfolio examples", href: "https://www.uxpin.com/studio/blog/ux-portfolio-examples/", source: "UXPin" },
  { label: "Fiveonefour raises $17M", href: "https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html", source: "PR Newswire" },
  { label: "Alex Lakas — Portfolio Website Design Inspiration", href: "https://craftwork.design/curated/website/alex-lakas", source: "Craftwork" },
  { label: "Building Peanut remotely", href: "https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-", source: "As Told By Nomads" },
  { label: "Insured Nomads acquires Peanut", href: "https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension", source: "ITIJ" },
  { label: "Redesigning LinkedIn Home and Sharing", href: "https://www.casestudy.club/case-studies/designing-a-simpler-more-inclusive-linkedin-home-sharing-experience", source: "Case Study Club" },
  { label: "COVID testing and summer travel questions", href: "https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/", source: "Forbes" },
  { label: "LinkedIn adds polls and live video-based events", href: "https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/", source: "TechCrunch" },
  { label: "U.S. design patents", links: [{ label: "D893,509", href: "https://uspto.report/patent/grant/D893%2C509" }, { label: "D892,816", href: "https://patentimages.storage.googleapis.com/94/19/e7/9f1b746a0a9912/USD892816.pdf" }, { label: "D869,501", href: "https://patents.justia.com/patent/D869501" }], source: "Patents" },
  { label: "Google adds salon and spa bookings", href: "https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/", source: "TechCrunch" },
  { label: "Live Popular Times on The Tonight Show", href: "https://www.youtube.com/watch?v=QIbPZgH1zRY", source: "YouTube" },
  { label: "A new look for LinkedIn", href: "https://www.linkedin.com/blog/member/product/a-new-look-for-linkedin-from-the-inside-out", source: "LinkedIn" },
  { label: "UX design portfolio examples", href: "https://www.shutterstock.com/blog/ux-design-portfolios", source: "Shutterstock" },
  { label: "The 30 Best UX Designer Portfolio Examples", href: "https://www.founderjar.com/inspiration/ux-designer-portfolio-examples/", source: "FounderJar" },
  { label: "Product design portfolio examples", href: "https://blog.designpeeps.net/blog/product-design-portfolios/?p=403", source: "DesignPeeps" },
  { label: "Google Maps", href: "https://www.simonfungcreative.com/google-maps.html", source: "Portfolio" },
  { label: "Alex Lakas on Dribbble", href: "https://dribbble.com/alex2pt0", source: "Dribbble" },
  { label: "Alex Lakas – Product Designer", href: "https://www.behance.net/alexlakas?locale=en_US", source: "Behance" },
  { label: "About popular times and wait times", href: "https://support.google.com/business/answer/6263531?hl=en", source: "Google" },
  { label: "Air National Guard", href: "https://www.airforce.com/", source: "U.S. Air Force" },
  { label: "Meet the UX Designers: UI8 Team", href: "https://blog.adobe.com/en/publish/2017/08/29/meet-the-ux-designers-dash-ponce-de-leon-and-the-ui8-team", source: "Adobe" },
];

const articles = [
  { title: "Designing Area Code", date: "Fiveonefour", dek: "A starter kit for analytics.", href: "https://alexslakas.medium.com/designing-area-code-a-starter-kit-for-modern-analytics-apps-ed421767d667", image: "https://miro.medium.com/v2/1*Jju41LNCrQ95PzA6hxR1LA.jpeg" },
  { title: "Agentic UX is the new black", date: "Fiveonefour", dek: "Open your mind (to AI).", href: "https://alexslakas.medium.com/agentic-ux-is-the-new-black-2fbc62cdba91", image: "https://miro.medium.com/v2/resize:fit:1100/format:webp/1*L9l8mtSBtjG7wiWsTT_zEg.png" },
  { title: "Designing a simpler, more inclusive LinkedIn Home & Sharing", date: "LinkedIn", dek: "Reimagining a professional network.", href: "https://alexslakas.medium.com/designing-a-simpler-more-inclusive-linked-in-home-sharing-315c81109177", image: "https://miro.medium.com/v2/1*2fUEA_2VQcdnZ6JBWo2D0Q.png" },
  { title: "Know before you go with Google's Live Popular Times", date: "Google", dek: "Real-time crowds in Maps.", href: "https://alexslakas.medium.com/know-before-you-go-with-googles-live-popular-times-bcfc7320ecaa", image: "https://miro.medium.com/v2/resize:fit:720/format:webp/1*EWw-R4_n2YGAKue63JwDLw.png" },
  { title: "Search faster on Google Maps", date: "Google", dek: "Local discovery with less typing.", href: "https://alexslakas.medium.com/search-faster-on-google-maps-d6b8597c4a07", image: "https://miro.medium.com/v2/1*AMLLrIjOr9igNelp0fGGmg.jpeg" },
  { title: "Reservations made easy with Google", date: "Google", dek: "Booking local services in Search.", href: "https://alexslakas.medium.com/reservations-made-easy-with-google-7b7d35888ad9", image: "https://miro.medium.com/v2/1*GvbV2bdeQMN2a5rXXA34Fw.jpeg" },
  { title: "Why we built Peanut", date: "Peanut", dek: "Building a better travel tool.", href: "https://alexslakas.medium.com/why-we-built-peanut-6cac9182d1f8", image: "https://miro.medium.com/v2/1*_8brVFCI957xxa_Tc2BLlA.jpeg" },
  { title: "A Journey Into Type", date: "Dec 2023", dek: "Logo font in 72 hours.", href: "https://alexslakas.medium.com/a-journey-into-type-73d56899b172", image: "https://miro.medium.com/v2/1*7NKBidFv3IA6XTLrtFUwlA.png" },
  { title: "Data With Depth: Designing 514", date: "Dec 2023", dek: "Humanizing data-intensive apps.", href: "https://alexslakas.medium.com/data-with-depth-designing-514-44698c3e5390", image: "https://miro.medium.com/v2/1*hS--7nKr8dUW7yeKvlYzuQ.png" },
  { title: "Designing a simpler, more inclusive LinkedIn Home & Sharing", date: "Jul 2021", dek: "Reimagining a professional network.", href: "https://alexslakas.medium.com/designing-a-simpler-more-inclusive-linked-in-home-sharing-315c81109177", image: "https://miro.medium.com/v2/1*J9oOQMv0N12QmSq7vbCiCQ.png" },
];

function Ref({ n }: { n: number }) {
  const referenceNumber = ({ 1: 8, 2: 8, 3: 8, 4: 8, 5: 13, 6: 15, 7: 8, 8: 11, 9: 7, 10: 18, 11: 6, 12: 16, 13: 17, 14: 2, 15: 1, 16: 14, 17: 10, 18: 5, 20: 4, 24: 20, 25: 21 } as Record<number, number>)[n] ?? n;
  return (
    <sup id={"cite-" + n} className="reference">
      <a href={"#ref-" + referenceNumber}>[{referenceNumber}]</a>
    </sup>
  );
}

// Languages, contact and theme: one shared set, used in the top bar and the scrolled header.
function HeaderIcons() {
  return (
    <>
      <LanguageMenu icon={<Languages size={20} strokeWidth={2} />} />
      <a href="https://www.linkedin.com/in/latenights/" target="_blank" rel="noreferrer" aria-label="Contact me" title="Contact me"><MailOpen size={20} strokeWidth={2} /></a>
      <ThemeSwitch />
    </>
  );
}

export default function Home() {

  return (
    <main className="wiki-shell is-loading">
      <div className="wiki-loader" aria-hidden="true">{/* The head script types into this span before hydration; innerHTML keeps React from diffing its text. */}<span className="wiki-loader-counter" suppressHydrationWarning dangerouslySetInnerHTML={{ __html: "" }} /></div>
      <IntroSequence />
      <SmoothAnchorScroll />
      <HoverCards />
      <Lightbox />
      <ContentsScrollSpy />
      <div className="wiki-page" id="top">
        <header className="wiki-topbar" data-lenis-prevent>
          <div className="wiki-brand">
            <a href="#top" className="wiki-wordmark" aria-label="Alex, Designer">
              <span className="wiki-wordmark-text" aria-hidden="true" data-nosnippet>Designer</span>
            </a>
          </div>
          <PageSearch />
          <nav>
            <MobileSearchSheet />
            <HeaderIcons />
          </nav>
        </header>

        <div className="wiki-layout">
          <aside className="wiki-contents" aria-label="Contents" data-nosnippet>
            <details open>
              <summary><strong><span className="wiki-wipe"><span className="wiki-wipe-content">Contents</span></span></strong><span className="contents-toggle" aria-hidden="true" /></summary>
              <a className="contents-top" href="#top">Top</a>
              <nav>
                <a href="#early-life">Early life</a>
                <a href="#career">Career</a>
                <a href="#style">Style</a>
                <a href="#media">Press</a>
                <a href="#publications">Cases</a>
                <a href="#stack">Stack</a>
                <a href="#references">References</a>
                <a href="#external-links">External</a>
              </nav>
            </details>
          </aside>

          <article className="wiki-article">
            <header className="wiki-article-header" data-lenis-prevent>
              <div className="wiki-title-row">
                <h1 className="wiki-article-title"><span className="wiki-wipe"><span className="wiki-wipe-content">Alex</span></span></h1>
                <h1 className="wiki-talk-title">Talk: Alex</h1>
                <div className="wiki-scroll-actions">
                  <div className="wiki-scroll-search"><PageSearch inputId="sticky-page-search" /></div>
                </div>
                <div className="wiki-title-action">
                  <div className="wiki-sticky-actions">
                    {/* Mobile: opens the same search sheet as the top bar icon. */}
                    <button type="button" className="wiki-sticky-search" aria-label="Search" title="Search" onClick={() => document.querySelector<HTMLButtonElement>(".wiki-topbar .wiki-nav-search")?.click()}><Search size={20} strokeWidth={2} /></button>
                    <HeaderIcons />
                  </div>
                </div>
              </div>
              <ArticleTabs />
              <div className="wiki-mobile-tools" aria-label="Article tools">
                <button type="button" aria-label="Languages"><Languages size={24} strokeWidth={2} /></button>
                <button type="button" aria-label="Add to watchlist"><Star size={24} strokeWidth={2} /></button>
              </div>
            </header>

            <section className="wiki-talk-page" aria-label="Talk page" data-nosnippet>
              <p className="wiki-talk-latest">Latest update: <a href="#start-discussion"><TimeAgo /></a> in topic <a href="#start-discussion">{process.env.LAST_UPDATE_TOPIC}</a></p>
              <div className="wiki-talk-notice">
                <p>This article must adhere to the <a href="#start-discussion">biographies of living persons</a> policy. Contentious material about living people that is unsourced or poorly sourced should be removed promptly from the article and its talk page.</p>
                <p>If you are the subject of this article, or are acting on behalf of one, use this page to raise a specific concern or propose a sourced change.</p>
              </div>
              <div className="wiki-talk-status">
                <div className="wiki-talk-rating"><span aria-hidden="true" className="wiki-talk-rating-mark">A</span><span>This article is rated <strong>A-class</strong> on this page&apos;s content assessment scale.</span></div>
                <div><span className="wiki-talk-icon" aria-hidden="true"><UserRound size={18} strokeWidth={1.75} /></span><strong>Biography: Arts and Entertainment</strong></div>
                <div><span className="wiki-talk-icon" aria-hidden="true"><PenTool size={18} strokeWidth={1.75} /></span><strong>Graphic design</strong><span className="wiki-talk-priority">Insane-importance</span></div>
                <div><span className="wiki-talk-icon" aria-hidden="true"><Flag size={18} strokeWidth={1.75} /></span><strong>United States</strong></div>
              </div>
              <section className="wiki-talk-thread" id="start-discussion">
                <h2>Info on this page is verifiable by the author and public records</h2>
                <p className="wiki-talk-meta">Latest comment: <a href="#start-discussion">1 year ago</a> <span>|</span> 1 comment <span>|</span> 1 person in discussion</p>
                <p>Unsourced material and subjective characterizations should be replaced with verifiable references. Discussion here should focus on specific claims, reliable sources, and neutral language.</p>
              </section>
            </section>
            <div className="wiki-article-body">

            <aside className="infobox" data-nosnippet>
              <h2><span className="wiki-wipe"><span className="wiki-wipe-content">Alex</span></span></h2>
              <HoverPortrait />
              <dl>
                <dt>Born</dt><dd className="infobox-born"><span>Alexander Lakas</span><span><a href="https://en.wikipedia.org/wiki/Washington,_D.C." target="_blank" rel="noreferrer">Washington, D.C.</a>, U.S.</span></dd>
                <dt>Based in</dt><dd>Los Angeles, CA</dd>
                <dt>Occupation</dt><dd>Designer</dd>
                <dt>Known for</dt><dd>&lsquo;talented&rsquo;, &lsquo;good people&rsquo;</dd>
                <dt>LinkedIn</dt><dd><a href="https://www.linkedin.com/in/latenights" target="_blank" rel="noreferrer" translate="no">/latenights</a></dd>
                <dt>Interests</dt><dd>Cars, design, AI, systems</dd>
              </dl>
            </aside>

            <p className="lead" data-nosnippet><b>Alexander Stephanos Lakas</b> is a Los Angeles-based designer and art director with over 15 years of experience whose work spans product and interaction design, identity, prototyping, and generative AI. He&rsquo;s collaborated on small and large scale projects with folks like <span style={{ whiteSpace: "nowrap" }}><a href="https://about.google/" target="_blank" rel="noreferrer">Google</a>,</span> <span style={{ whiteSpace: "nowrap" }}><a href="https://www.ueno.co/" target="_blank" rel="noreferrer">Ueno</a>,</span> <span style={{ whiteSpace: "nowrap" }}><a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>,</span> Zippo, Nintendo and more. His work has been featured in <span style={{ whiteSpace: "nowrap" }}><a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Forbes</a>,</span> <span style={{ whiteSpace: "nowrap" }}><a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">TechCrunch</a>,</span> and on The Tonight Show.<Ref n={1} /><Ref n={5} /><Ref n={10} /><Ref n={16} /></p>

            <nav className="toc article-toc" aria-label="Table of contents" data-nosnippet>
              <h2><span className="wiki-wipe"><span className="wiki-wipe-content">Contents</span></span></h2>
              <ol>
                <li><a href="#early-life">Early life</a></li>
                <li><a href="#career">Career</a></li>
                <li><a href="#style">Style</a></li>
                <li><a href="#media">Press</a></li>
                <li><a href="#publications">Cases</a></li>
                <li><a href="#stack">Stack</a></li>
                <li><a href="#references">References</a></li>
                <li><a href="#external-links">External</a></li>
              </ol>
            </nav>

            <WikiSection id="early-life" title="Early life">
              <div className="career-feature">
                <p>Born in <a href="https://en.wikipedia.org/wiki/Washington,_D.C." target="_blank" rel="noreferrer">Washington, D.C.</a>, Alex grew up on the East Coast and got into design through illustration, animation, and the web. He studied art and computer science at the University of Maryland, College Park, under <Person id="james-thorpe" />, <Person id="brandon-morse" />, and <Person id="helen-armstrong" />. Fueled by software and creativity, Alex has spent years understanding theory, trends and research sitting atop a background in studio work. He later moved to the Bay Area to join the tech movement, then to <a href="https://en.wikipedia.org/wiki/Los_Angeles" target="_blank" rel="noreferrer">Los Angeles</a> to freelance and live by the beach.<Ref n={1} /><Ref n={8} /></p>
              </div></WikiSection>

            <WikiSection id="career" title="Career">
              <div className="career-feature career-feature--right career-feature--thumb">
                <figure>
                  <video src="/career-landing.mp4" poster="/career-landing.png" autoPlay muted loop playsInline preload="metadata" aria-label="Landing page design" />
                </figure>
                <p>Alex has held design roles across agency, startup, and large technology company contexts. Public profile summaries list early agency and ecommerce work for 0-1 startups, etailers and FAANG companies, including roles at Cubix Labs (2009–2011), Virid (2011–2012), Darwin (2012–2013), Google (2013–2018), LinkedIn (2018–2021), Peanut (2021–2022), Culprit (2022–2023), and Fiveonefour (2023–2026).<Ref n={1} /></p>
              </div>
              <div id="social-games-and-ecommerce" className="career-feature">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">Social games and ecommerce</span></span></h3>
                <p>Beginning in 2009, Alex worked with <a href="https://www.cubix.co/" target="_blank" rel="noreferrer">Cubix Labs</a> on social games, then from 2011 with <a href="https://virid.com/" target="_blank" rel="noreferrer">Virid</a> on ecommerce. The work combined product thinking, interaction design, and campaign systems at a time when social platforms were becoming a primary place for brands to meet people. That period included work connected to Converse, Nintendo, Journeys and Zippo, translating established brands into playful, participatory web experiences. It established an early interest in designing systems that balance clear utility with character, motion, and a strong visual point of view.<Ref n={1} /></p>
              
              </div>
              <div id="branching-out" className="career-feature career-feature--right career-feature--thumb">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">Branching out</span></span></h3>
                <figure>
                  <img src="https://cdn.prod.website-files.com/63bce9e077c37c0d1b6de8f6/648e113182964bd201887b14_alex-lakas-pCibATCkQxo-unsplash%20(3).webp" alt="Alex Lakas" />
                </figure>
                <p>Before joining larger product teams, Alex worked across independent web, identity, and interactive projects. Around 2012, he joined <Person id="vlad-lokshin" /> and <Person id="andy-tiffany" /> to form Darwin, a small 0-1 dev shop based in San Francisco, CA. This focused on agency style work that funded their own ideas. Clients included the <a href="https://www.airforce.com/" target="_blank" rel="noreferrer">Air National Guard</a><Ref n={24} /> and <Person id="creative-dash" />.<Ref n={25} /></p>
                <p>These projects treated websites and prototypes as complete experiences rather than static portfolios: each combined narrative, interface, and behavior. The work formed the foundation for Alex&apos;s later focus on clear systems and useful digital tools.</p>
              </div>
              <div id="local-search-for-merchants-and-consumers" className="career-feature career-feature--right career-feature--landscape career-feature--thumb">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">Local search for merchants and consumers</span></span></h3>
                <figure>
                  <img src="https://miro.medium.com/v2/resize:fit:720/1*tvnPllmUzgIvJVdPxyPVPg.png" alt="Google Maps Live Popular Times on a laptop" />
                </figure>
                <p>At <a href="https://about.google/" target="_blank" rel="noreferrer">Google</a>, Alex worked across Google My Business, Local Search, and Maps. His visual design, prototyping and systems thinking helped shape place listing management, local discovery, Live Popular Times, wait times, visit-duration information, and booking flows that connect people with nearby businesses and services.<Ref n={1} /><Ref n={8} /><Ref n={9} /></p>
                <p>Those experiences turned complex local data into timely signals people could act on: whether a place was busy, when to visit, and how to make a reservation without leaving Search or Maps - collaborating with folks like <span data-nosnippet>YC Alum</span>, <Person id="abhishek-poddar" />, <Person id="jason-morrow" />, <Person id="marcel-uekermann" />, <Person id="daniel-balgley" />, <Person id="simon-fung" />, <Person id="michael-hintze" />, and <Person id="eden-gwyn" />. For small businesses, the same tools made practical information and conversion paths easier to maintain and find. The role also gave him the chance to work with agencies such as <a href="https://www.ueno.co/" target="_blank" rel="noreferrer">Ueno</a> and <a href="https://www.method.com/" target="_blank" rel="noreferrer">Method</a> on a range of projects.</p>
              </div>
              <div id="modernizing-social-media-for-professionals" className="career-feature career-feature--thumb career-feature--right career-feature--square career-feature--team">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">Modernizing social media for professionals</span></span></h3>
                <figure>
                  <img src="https://miro.medium.com/v2/1*nacLVsr2ifTQvHN_qQknYw.png" alt="Alex with the LinkedIn Sharing team" />
                </figure>
                <p>As a Senior Product Designer at <a href="https://www.linkedin.com/" target="_blank" rel="noreferrer">LinkedIn</a>, Alex worked with product and systems designers like <Person id="oscar-gonzalez" /> and <Person id="diya-sharma" /> to re-shape and design the home experience and sharing tools, including polls, posting, comment controls, a modernization overhaul, and more, as the platform expanded how professional communities could participate and connect. The work spanned design systems, product design, and prototyping.<Ref n={3} /><Ref n={6} /><Ref n={10} /></p>
                <p>The goal was to make professional participation feel less formal and more immediate. Streamlined sharing, lightweight polls, and live formats gave members more ways to contribute, while preserving the context and utility people expect from a professional network.</p>
              </div>
              <div id="freelance-and-0-1" className="career-feature career-feature--right career-feature--wide career-feature--peanut career-feature--thumb">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">Freelance, 0-1, Gen AI</span></span></h3>
                <figure>
                  <div className="peanut-still">
                    {/* Peanut's Product Hunt launch video (saved locally: no YouTube player controls). */}
                    <SeamlessVideo src="/peanut-launch.mp4" poster="/peanut-travel-on.png" label="Peanut: Travel on." className="" start={0} end={47.8} />
                  </div>
                </figure>
                <p>In 2021, during the Covid pandemic, Alex and <Person id="brady-simpson" /> co-founded <a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Peanut</a>, a Chrome extension that surfaced travel info during online booking, later acquired by Insured Nomads. Peanut was featured in <a href="https://www.producthunt.com/products/peanut-for-chrome?launch=peanut-for-chrome" target="_blank" rel="noreferrer">Best of Product Hunt</a> in 2021. He then served as Design Director at <a href="https://www.youtube.com/watch?v=0OScZ_93-_0" target="_blank" rel="noreferrer">Culprit</a> on a stealth social media app spanning VFX, design, and product, working with <Person id="david-dinetz" />, <Person id="andre-cabral" />, <Person id="jo-murayama" />, and <a href="https://povio.com/" target="_blank" rel="noreferrer">Povio</a>.<Ref n={1} /><Ref n={11} /></p>
                <figure className="career-video">
                  <video src="/out-of-touch.mp4" poster="/out-of-touch.jpg" autoPlay muted loop playsInline preload="metadata" aria-label="AI video gen" />
                </figure>
                <p>Peanut delivered booking-time travel intelligence for thousands of destinations across Expedia, Booking.com, and Google Flights. At Culprit, Alex carried the same product thinking into creative direction.<Ref n={7} /></p>
                <p className="career-ai-note">This later led to conceptual and public work using AI, video and motion to explore new mediums, including Midjourney, Claude and MCPs.</p>
                            </div>
              <div id="new-territory-ai-data-infra" className="career-feature career-feature--right career-feature--landscape career-feature--thumb">
                <h3><span className="wiki-wipe"><span className="wiki-wipe-content">New territory — Data Infra &amp; AI</span></span></h3>
                <figure>
                  <SeamlessVideo />
                </figure>
                <p>As Head of Design at <a href="https://www.514.ax/" target="_blank" rel="noreferrer">Fiveonefour</a>, Alex joined another 0-1 team, shaping a Vercel-inspired data-infra suite built on shadcn-style components and AI agents, used by F45 and District Cannabis.<Ref n={5} /> Fiveonefour has raised nearly $17M from firms including <Person id="stage-2-capital" /> and <Person id="dimension" />.<Ref n={14} /></p>
                <p>The work focused on making data systems easier to understand and operate: interfaces that reveal what data is doing, workflows that support faster decisions, and a shared design language that can scale across a growing product. The team focused on ClickHouse, Redpanda, and Temporal tooling that made data easy to translate and monitor, helping companies like <a href="https://f45training.com/" target="_blank" rel="noreferrer">F45</a> and <a href="https://districtcannabis.us/" target="_blank" rel="noreferrer">District Cannabis</a> reimagine their data in a fraction of the time and cost.</p>
              </div>
            </WikiSection>

            <WikiSection id="style" title="Style"><p>Alex describes himself as a generalist with a focus on visual design and prototyping. His published work often uses restrained typography, black-and-white palettes, kinetic transitions, image-led case studies, and direct editorial writing. LinkedIn recommendations describe a collaborator who brings clarity to complex problems, pairs a strong visual point of view with practical product judgment, and makes teams feel heard throughout the process. His Dribbble profile describes his practice as art direction and design.<Ref n={2} /></p></WikiSection>
            <WikiSection id="media" title="Press">
              <p>Alex&apos;s work has been covered across product, travel, and technology. <a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">Forbes</a> featured Peanut in its travel-planning reporting, <a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">TechCrunch</a> covered his LinkedIn work on polls and live video-based events, <a href="https://www.linkedin.com/blog/member/product/a-new-look-for-linkedin-from-the-inside-out" target="_blank" rel="noreferrer">LinkedIn</a> detailed its modernized homepage and sharing experience, and <a href="https://www.youtube.com/watch?v=QIbPZgH1zRY" target="_blank" rel="noreferrer">The Tonight Show Starring Jimmy Fallon</a> featured his Google Live Popular Times work.<Ref n={10} /><Ref n={12} /><Ref n={14} /> Publications also covered Fiveonefour&apos;s data-infrastructure practice and other independent creative projects.<Ref n={16} /></p>
              <p>In 2022, after Peanut was acquired, he and <Person id="brady-simpson-2" /> appeared on <Person id="tayo-rockson" />&apos;s <a href="https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-" target="_blank" rel="noreferrer">As Told By Nomads</a> podcast to discuss building it remotely as a side business while working full time.<Ref n={20} /></p>
              <ul className="wiki-link-list media-links">
                <li><a href="https://www.prnewswire.com/news-releases/fiveonefour-raises-17m-to-redefine-the-developer-experience-by-connecting-data-infrastructure-and-ai-innovation-302546414.html" target="_blank" rel="noreferrer">Fiveonefour raises $17M</a>. <i>PR Newswire</i>.</li>
                <li><a href="https://shows.acast.com/astoldbynomads/episodes/building-a-side-hustle-business-remotely-while-working-your-" target="_blank" rel="noreferrer">Building Peanut remotely</a>. <i>As Told By Nomads</i>.</li>
                <li><a href="https://www.itij.com/latest/news/insured-nomads-acquires-peanut-browser-extension" target="_blank" rel="noreferrer">Insured Nomads acquires Peanut</a>. <i>ITIJ</i>.</li>
                <li><a href="https://www.forbes.com/sites/christopherelliott/2021/05/22/do-i-need-a-covid-test-to-travel-and-other-summer-travel-questions/" target="_blank" rel="noreferrer">COVID testing and summer travel questions</a>. <i>Forbes</i>.</li>
                <li><a href="https://techcrunch.com/2020/05/12/linkedin-ads-polls-and-live-video-based-events-in-a-focus-on-more-virtual-engagement/" target="_blank" rel="noreferrer">LinkedIn adds polls and live video-based events</a>. <i>TechCrunch</i>.</li>
                <li><a href="https://techcrunch.com/2017/07/13/google-adds-salon-and-spa-bookings-through-maps-and-search/" target="_blank" rel="noreferrer">Google adds salon and spa bookings</a>. <i>TechCrunch</i>.</li>
                <li><a href="https://www.youtube.com/watch?v=QIbPZgH1zRY" target="_blank" rel="noreferrer">Live Popular Times on The Tonight Show</a>. <i>YouTube</i>.</li>
                <li><a href="https://www.linkedin.com/blog/member/product/a-new-look-for-linkedin-from-the-inside-out" target="_blank" rel="noreferrer">A new look for LinkedIn</a>. <i>LinkedIn</i>.</li>
              </ul>
            </WikiSection>
            <WikiSection id="publications" title="Cases">
              <div className="article-list">
                {articles.slice(0, 7).map((article) => (
                  <article id={`publication-${article.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "")}`} className="article-list-item" key={article.href}>
                    <a className="article-list-image" href={article.href} target="_blank" rel="noreferrer" aria-label={`Read ${article.title}`}>
                      {/* Medium serves 2000px originals; a 12x downscale aliases badly. Request sizes near display size. */}<img src={article.image.includes("resize:") ? article.image : article.image.replace("/v2/", "/v2/resize:fit:480/")} srcSet={article.image.includes("resize:") ? undefined : `${article.image.replace("/v2/", "/v2/resize:fit:320/")} 1x, ${article.image.replace("/v2/", "/v2/resize:fit:480/")} 2x, ${article.image.replace("/v2/", "/v2/resize:fit:720/")} 3x`} alt="" />
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
            <WikiSection id="stack" title="Stack"><ul className="stack-tags"><li>Claude</li><li>Codex</li><li>Hermes</li><li>Vercel</li><li>GitHub</li><li>Linear</li><li>Figma</li><li>Midjourney</li><li>shadcn/ui</li><li>Tailwind</li><li>Three.js</li><li>WebGL</li><li>Webflow</li><li>React</li><li>GSAP</li><li>IXD</li><li>Visual design</li><li>UXD</li><li>Web</li><li>iOS</li><li>Android</li><li>Mixed Methods Research</li><li>Strategy</li><li>Leadership</li><li>Gen AI</li><li>Rapid prototyping</li><li>Brand</li><li>Presentations</li><li>Weird stuff</li><li>Grids</li><li>Minimalism</li></ul></WikiSection>
            <WikiSection id="references" title="References"><ol className="references" data-nosnippet>{references.map((reference, index) => {
              const patentLinks = reference.links ?? [];
              return <li id={"ref-" + (index + 1)} key={reference.label}><span className="reference-number">{index + 1}.</span><a className="reference-backlink" href={"#cite-" + (index + 1)} aria-label={`Back to citation ${index + 1}`}>^</a>{patentLinks.length ? <><span>{reference.label}: </span>{patentLinks.map((patent, patentIndex) => <span key={patent.href}><a href={patent.href} target="_blank" rel="noreferrer">{patent.label}</a>{patentIndex < patentLinks.length - 1 ? ", " : ""}</span>)}</> : <a href={reference.href ?? "#references"} target={reference.href ? "_blank" : undefined} rel={reference.href ? "noreferrer" : undefined}>{reference.label}</a>}. <i data-nosnippet>{reference.source}</i>.</li>;
            })}</ol></WikiSection>
            <WikiSection id="external-links" title="External"><ul className="wiki-link-list"><li><a className="external-link" href="https://dribbble.com/alex2pt0" target="_blank" rel="noreferrer">Alex on Dribbble</a></li><li><a className="external-link" href="https://x.com/axlakas" target="_blank" rel="noreferrer">Alex on X</a></li><li><a className="external-link" href="https://www.linkedin.com/in/latenights" target="_blank" rel="noreferrer">Alex on LinkedIn</a></li><li><a className="external-link" href="https://alexslakas.medium.com/" target="_blank" rel="noreferrer">Alex on Medium</a></li></ul></WikiSection>
            <RelatedLinks />
            </div>
          </article>
        </div>
      </div>
    </main>
  );
}

// "1 day ago" from the build timestamp; computed after mount so server and client markup match.
function TimeAgo() {
  const [label, setLabel] = useState("today");
  useEffect(() => {
    const days = Math.floor((Date.now() - Number(process.env.BUILD_TIME)) / 86400000);
    if (days >= 365) setLabel(`${Math.floor(days / 365)} year${days >= 730 ? "s" : ""} ago`);
    else if (days >= 30) setLabel(`${Math.floor(days / 30)} month${days >= 60 ? "s" : ""} ago`);
    else if (days >= 1) setLabel(`${days} day${days > 1 ? "s" : ""} ago`);
    else setLabel("today");
  }, []);
  return <>{label}</>;
}
