"use client";
import { motion } from "framer-motion";

export default function Home() {
  const cardAnimation = {
    initial: { opacity: 0, rotateX: 15, y: 60, scale: 0.95 },
    whileInView: { opacity: 1, rotateX: 0, y: 0, scale: 1 },
    viewport: { once: true, margin: "-100px" },
    transition: { duration: 0.8, ease: "easeOut" }
  };

  const featureAnimation = {
    initial: { opacity: 0, x: 50 },
    whileInView: { opacity: 1, x: 0 },
    viewport: { once: true, margin: "-100px" },
  };

  return (
    <>
      <nav className="fixed top-0 w-full z-50 bg-[#000000]/80 backdrop-blur-xl border-b border-white/5 transition-opacity duration-300">
        <div className="flex justify-between items-center px-8 lg:px-32 h-20 max-w-full">
          <div className="text-2xl font-black italic text-primary tracking-tighter font-headline">
            Dire Marketplace
          </div>
          <div className="hidden md:flex items-center space-x-12">
            <a
              className="text-primary border-b-2 border-primary pb-1 font-headline font-bold tracking-tight"
              href="#"
            >
              Explore
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-headline font-bold tracking-tight"
              href="#"
            >
              Services
            </a>
            <a
              className="text-on-surface-variant hover:text-primary transition-colors font-headline font-bold tracking-tight"
              href="#"
            >
              Post Task
            </a>
          </div>
          <div className="flex items-center space-x-6">
            <button className="text-on-surface-variant hover:text-primary transition-colors font-headline font-bold tracking-tight">
              Login
            </button>
            <button className="bg-primary text-on-primary px-8 py-2.5 rounded-full font-headline font-bold tracking-tight active:scale-95 transition-transform duration-200">
              Register
            </button>
          </div>
        </div>
      </nav>
      <main className="flex-grow pt-20 overflow-hidden">
        <section className="relative min-h-[90vh] flex items-center px-8 lg:px-32">
          <div className="absolute inset-0 z-0">
            <img
              alt="Background texture"
              className="w-full h-full object-cover opacity-20 grayscale"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuAi9vZLdIrW8uePmibbs_WJo4Djr6Ifz3RrXMXsCORagQjNkTSy1b4R-ens3GnVjcYrFGciDj8pOlwfxz5LYTeKvsvfAr10W1B3Y6AZ2N4DD-DwzIlFGPTH0libyZ9M8ltVqiRl6_ZV_V7L39J5sEOPZkrZU2GaKNTcy317KnjHFnZvKeQl3uFlVPj6iwH65Km-4R1VzKEcwAp8iDEJK902ONlCnWQHQ_MPl05qkWCxkKeCceCndiLlDSy2rcjnm06fZw1rO1n_2XMG"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent"></div>
          </div>
          <div className="relative z-10 w-full grid grid-cols-1 lg:grid-cols-12 items-center gap-12 lg:gap-24">
            <motion.div 
              className="lg:col-span-7"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-6xl md:text-8xl font-headline font-extrabold tracking-tighter text-on-surface mb-6 leading-[0.9]">
                Find Trusted <span className="text-primary italic">Workers</span> in Dire Dawa
              </h1>
              <p className="text-xl md:text-2xl text-on-surface-variant font-light mb-12 max-w-xl">
                Hire electricians, plumbers &amp; more with the speed of digital curation and the trust of community roots.
              </p>
              <div className="flex flex-col md:flex-row gap-4 max-w-2xl">
                <div className="relative flex-grow">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant">
                    search
                  </span>
                  <input
                    className="w-full bg-surface-container-high border border-white/5 rounded-full py-5 pl-14 pr-6 focus:ring-2 focus:ring-primary text-on-surface placeholder:text-outline transition-all"
                    placeholder="What service do you need?"
                    type="text"
                  />
                </div>
                <button className="bg-primary text-on-primary px-10 py-5 rounded-full font-headline font-extrabold tracking-tight active:scale-95 transition-transform duration-200">
                  Get Started
                </button>
              </div>
            </motion.div>
            <motion.div 
              className="hidden lg:flex lg:col-span-5 justify-center relative"
              initial={{ opacity: 0, scale: 0.9, rotateY: -15 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: "easeOut" }}
            >
              <div className="w-full max-w-md rounded-lg border border-white/10 shadow-2xl animate-float relative z-20 overflow-hidden group aspect-[4/5]" style={{ perspective: "1000px" }}>
                <img
                  alt="Dire Dawa city view"
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  src="https://lh3.googleusercontent.com/aida-public/AB6AXuACpr1IK_a-iKEt7Mzju6uMMRnZRiAGJGxPneP96GV6NuxALaVJV9DRDKOqnd9SEsm-OuEPnVjFJ0u6VwDLfB8DiRCiJfWn-64UYXmkzJtg93BCmQ-VlK6mfr7lB5DKHyOVV_5TGH6v_W15k7k51v-fgJme7x6MBKRVYCsO9DldJe6Vp44nPpzB7fDSgDsWUBytqcRh7ipA-nuRGl7JODFuZrE1YKssNEqeV3gviiCEF-2g6oY3_2CUS7-mPp0Yhy7pHyKSZw9IDMhM"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-black/60"></div>
                <div className="relative z-10 p-8 h-full flex flex-col justify-between">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-primary shadow-lg bg-surface-container-high">
                        <img
                          alt="Worker profile"
                          className="w-full h-full object-cover"
                          src="https://lh3.googleusercontent.com/aida-public/AB6AXuCHX-8XmP_H2nB6_5WnK9yvP_H5j_7m-O_H_J-U_H_J-U_H_J-U_H_J-U"
                        />
                      </div>
                      <div>
                        <h4 className="text-xl font-headline font-bold text-white">
                          Ahmed Mohammed
                        </h4>
                        <p className="text-primary text-sm font-label font-bold tracking-wide">
                          Master Electrician
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className="material-symbols-outlined text-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.8)]"
                        style={{ fontVariationSettings: "'FILL' 1" }}
                      >
                        verified
                      </span>
                    </div>
                  </div>
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                          Jobs
                        </p>
                        <p className="text-xl font-headline font-black text-white">
                          240+
                        </p>
                      </div>
                      <div className="text-center p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                          Rating
                        </p>
                        <p className="text-xl font-headline font-black text-white">
                          4.9
                        </p>
                      </div>
                      <div className="text-center p-3 bg-black/60 backdrop-blur-md rounded-lg border border-white/10">
                        <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">
                          Exp.
                        </p>
                        <p className="text-xl font-headline font-black text-white">
                          8y
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="flex-1 bg-primary text-on-primary py-4 rounded-full font-headline font-extrabold text-sm shadow-xl shadow-primary/30">
                        Hire Now
                      </button>
                      <button className="px-5 border border-white/20 bg-black/40 backdrop-blur-md rounded-full text-white hover:bg-white/10 transition-colors">
                        <span className="material-symbols-outlined">chat_bubble</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              <div className="absolute -top-10 -right-10 w-64 h-64 bg-primary/10 blur-[120px] rounded-full"></div>
            </motion.div>
          </div>
        </section>
        
        <section className="px-8 lg:px-32 py-32 bg-background" style={{ perspective: "1500px" }}>
          <motion.div 
            className="mb-20"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tight mb-6">
              Core Ecosystem
            </h2>
            <p className="text-on-surface-variant max-w-lg text-xl font-light">
              High-fidelity digital tools connecting skilled local expertise with radical trust.
            </p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 lg:gap-8">
            <motion.div 
              {...cardAnimation}
              className="col-span-12 md:col-span-7 bg-surface-container-high rounded-lg overflow-hidden relative group border border-white/10 min-h-[350px] md:h-[400px]"
            >
              <img
                alt="Identity Verification"
                className="absolute inset-0 w-full h-full object-cover opacity-30 grayscale group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAxgJaHlG_u08BEyDwW49cWwyjidZ3pZrayD5R-fn1SyF8udYQkg1Uo4rMu18P2wvIRbYtRK9_VZlbu6vocuc9TaXiUCbOltXbDEPMCa7Ky3yhpya-JZtAYYPnYTdh4R3o9HGWYWyMxPur2t2QLpvPS0UUFRG4XDitAtZtOim8f_dI_QDnqP58boGaWUVdXEB3nnPNwGMsopknMYoZFFNnByoN_iTLW0EUW-LCDmjKDK7ktTCEV0Tc1IDDuAIcdH89tsiG9pp3ycO8L"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              <div className="absolute inset-0 feature-glow-primary pointer-events-none"></div>
              <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
                <div>
                  <span className="text-primary font-headline text-sm uppercase tracking-[0.3em] font-extrabold mb-4 block editorial-shadow">
                    Identity First
                  </span>
                  <h3 className="text-4xl md:text-5xl font-headline font-black tracking-tighter mb-6 max-w-md leading-none editorial-shadow">
                    Verified via Fayda ID
                  </h3>
                  <p className="text-on-surface text-base max-w-sm font-medium leading-relaxed opacity-90">
                    Every professional is authenticated using Ethiopia's national digital ID systems for absolute security and accountability.
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary/10 backdrop-blur-xl border border-primary/20 flex items-center justify-center">
                    <span className="material-symbols-outlined text-primary text-3xl">
                      fingerprint
                    </span>
                  </div>
                  <span className="text-xs font-headline uppercase text-on-surface font-black tracking-[0.2em]">
                    Verified Identity Guarantee
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              {...cardAnimation}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="col-span-12 md:col-span-5 bg-surface-container-high rounded-lg overflow-hidden relative group border border-white/10 min-h-[350px] md:h-[400px]"
            >
              <img
                alt="Community Ratings"
                className="absolute inset-0 w-full h-full object-cover opacity-20 grayscale group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAp85Uv2j45SqW8JZb48LyVY4JE0AoGYo0w7P93H4m9DPQbPmFnqpIfkchsWyK6yH74bvzXcn1_wh0pZLXBODO6p-UC6JQ21DMFpaQkZrGP_aUomgDpJtBoV_Z3XCLNImKWN64iBpSMAH9p-6YGtIRxAVtNDRvfiDsqeqz0I_KFO99p2lGbbmIPGVo_teyQI4EDa2WgVE08hClfla13KvNZtYixs_pHLR2wEfJ-5J-DBPCIU1NeEZAnS9P1f0_FUA9O5B41yZaIsH0L"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              <div className="absolute inset-0 feature-glow-secondary pointer-events-none"></div>
              <div className="p-8 md:p-12 h-full flex flex-col justify-between relative z-10">
                <div>
                  <span className="text-secondary font-headline text-sm uppercase tracking-[0.3em] font-extrabold mb-4 block editorial-shadow">
                    Quality Loop
                  </span>
                  <h3 className="text-3xl md:text-4xl font-headline font-black tracking-tighter mb-4 leading-none editorial-shadow">
                    Community Ratings
                  </h3>
                  <p className="text-on-surface text-base max-w-xs font-medium leading-relaxed opacity-90">
                    Transparent feedback loops that drive service quality and reward the district's best talent.
                  </p>
                </div>
                <div className="flex items-end gap-2">
                  <span className="text-6xl font-headline font-black italic tracking-tighter text-secondary group-hover:scale-110 transition-transform origin-left">
                    4.9
                  </span>
                  <span className="text-secondary/60 text-xl font-black mb-2 italic">
                    / 5.0
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              {...cardAnimation}
              className="col-span-12 md:col-span-6 bg-surface-container-high rounded-lg overflow-hidden relative group border border-white/10 min-h-[300px] md:h-[350px]"
            >
              <img
                alt="Smart Contracts"
                className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDVuMhh1BC-20qcGlnt6-pEd4052UQ0Saw04NcZU1wIoEPI8iFXd0SGO1kjJe9Ux9NXWEIRte0Ym0O1csVXfM2xhSlKiJX3IB7qcb4Mu5lBPpeRjfwXQ5PmjSbKacfGvv0y-lSuXg-Ly6alg2yqGbI62TwHC5KHJpVygUxUqK020ySoM0cPhLiZfpQyBQg9ydIZi4G_ANGnVuUcSlw7g_JYA6TH5cdWaQjbg_vFE-JxO7uyVkS86MMtYHcxylmv7bZ2qoCUhlsFOzNR"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              <div className="absolute inset-0 feature-glow-primary pointer-events-none opacity-50"></div>
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div>
                  <span className="text-primary font-headline text-xs uppercase tracking-[0.3em] font-extrabold mb-4 block">
                    Agreements
                  </span>
                  <h3 className="text-3xl font-headline font-black tracking-tighter mb-4 editorial-shadow">
                    Smart Contracts
                  </h3>
                  <p className="text-on-surface text-sm max-w-sm font-medium leading-relaxed opacity-80">
                    Formalize local work instantly with digital documents that protect scope and timelines for both parties.
                  </p>
                </div>
                <div className="w-12 h-12 bg-surface-container-highest/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-primary text-2xl">
                    history_edu
                  </span>
                </div>
              </div>
            </motion.div>
            <motion.div 
              {...cardAnimation}
              transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              className="col-span-12 md:col-span-6 bg-surface-container-high rounded-lg overflow-hidden relative group border border-white/10 min-h-[300px] md:h-[350px]"
            >
              <img
                alt="Escrowed Pay"
                className="absolute inset-0 w-full h-full object-cover opacity-25 grayscale group-hover:scale-105 transition-transform duration-700"
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuAY3cUbqg3Uq7wnOtlz_a8O_2bW1RpiYuB62xZng3guDvBzUlvizGCAeWv3Vzunk_7Ja95hD4o0f3C-BBNPgHWEAVrsDUrvmtaxv_DJ7V9sKROmgWm5_WTitBVhb6SevlsUGJxazqIIH72_lzX41E-RoZp6HiR7s58Pe2btzzX0cv3rs-UlPdRMW6-OtH1EMOWFpYjB0w_aJrPkTm-DhA7STokHPVQZzN7AAiRZS94lY9eQtNjJlpGhYgrxqXk6d4mqJDAVX1I6fbVV"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent"></div>
              <div className="absolute inset-0 feature-glow-secondary pointer-events-none opacity-50"></div>
              <div className="p-8 h-full flex flex-col justify-between relative z-10">
                <div>
                  <span className="text-secondary font-headline text-xs uppercase tracking-[0.3em] font-extrabold mb-4 block">
                    Security
                  </span>
                  <h3 className="text-3xl font-headline font-black tracking-tighter mb-4 editorial-shadow">
                    Escrowed Pay
                  </h3>
                  <p className="text-on-surface text-sm max-w-sm font-medium leading-relaxed opacity-80">
                    Payment is secured in a digital vault and released only when the job milestones are met and verified.
                  </p>
                </div>
                <div className="w-12 h-12 bg-surface-container-highest/50 backdrop-blur-md rounded-full flex items-center justify-center border border-white/10">
                  <span className="material-symbols-outlined text-secondary text-2xl">
                    payments
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        </section>
        
        <section className="px-8 lg:px-32 py-32 bg-background overflow-hidden relative">
          <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-20">
            <motion.div 
              className="flex-1"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-7xl md:text-9xl font-headline font-extrabold tracking-tighter text-on-surface leading-[0.8] mb-12">
                The <span className="text-primary">Dire</span> Edge.
              </h2>
              <p className="text-2xl text-on-surface-variant font-light max-w-lg">
                We are not just a marketplace; we are a digital curator for the local economy.
              </p>
            </motion.div>
            <div className="flex-1 space-y-20 lg:pt-12">
              <motion.div {...featureAnimation} transition={{ duration: 0.6, delay: 0.1 }} className="flex gap-8 group">
                <div className="text-primary group-hover:translate-x-2 transition-transform shrink-0">
                  <span
                    className="material-symbols-outlined text-5xl md:text-6xl"
                    style={{ fontVariationSettings: "'wght' 200" }}
                  >
                    speed
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-headline font-bold mb-4 tracking-tight">
                    Hyper-Local Speed
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    Find a worker within your immediate neighborhood in under 15 minutes. Our routing engine is tuned for the specific geography of Dire Dawa.
                  </p>
                </div>
              </motion.div>
              <motion.div {...featureAnimation} transition={{ duration: 0.6, delay: 0.3 }} className="flex gap-8 group">
                <div className="text-secondary group-hover:translate-x-2 transition-transform shrink-0">
                  <span
                    className="material-symbols-outlined text-5xl md:text-6xl"
                    style={{ fontVariationSettings: "'wght' 200" }}
                  >
                    workspace_premium
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-headline font-bold mb-4 tracking-tight">
                    Curated Talent
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    We don't list everyone. Our curation team manually reviews high-stakes service providers to ensure the "Dire Standard" is met.
                  </p>
                </div>
              </motion.div>
              <motion.div {...featureAnimation} transition={{ duration: 0.6, delay: 0.5 }} className="flex gap-8 group">
                <div className="text-primary group-hover:translate-x-2 transition-transform shrink-0">
                  <span
                    className="material-symbols-outlined text-5xl md:text-6xl"
                    style={{ fontVariationSettings: "'wght' 200" }}
                  >
                    shield_person
                  </span>
                </div>
                <div>
                  <h4 className="text-2xl md:text-3xl font-headline font-bold mb-4 tracking-tight">
                    Radical Trust
                  </h4>
                  <p className="text-on-surface-variant leading-relaxed text-sm md:text-base">
                    By integrating with the Fayda digital ID, we eliminate the anonymity that often plagues open marketplaces.
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </section>
        
        <motion.section 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="h-[500px] md:h-[600px] relative overflow-hidden"
        >
          <img
            alt="Elevating standard of work"
            className="w-full h-full object-cover grayscale brightness-50"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuACpr1IK_a-iKEt7Mzju6uMMRnZRiAGJGxPneP96GV6NuxALaVJV9DRDKOqnd9SEsm-OuEPnVjFJ0u6VwDLfB8DiRCiJfWn-64UYXmkzJtg93BCmQ-VlK6mfr7lB5DKHyOVV_5TGH6v_W15k7k51v-fgJme7x6MBKRVYCsO9DldJe6Vp44nPpzB7fDSgDsWUBytqcRh7ipA-nuRGl7JODFuZrE1YKssNEqeV3gviiCEF-2g6oY3_2CUS7-mPp0Yhy7pHyKSZw9IDMhM"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-8 lg:px-32">
              <h2 className="text-5xl md:text-7xl font-headline font-extrabold tracking-tighter mb-12 max-w-4xl">
                Elevating the standard of work across every district.
              </h2>
              <button className="bg-transparent border-2 border-primary text-primary px-16 py-5 rounded-full font-headline font-bold hover:bg-primary hover:text-on-primary transition-all active:scale-95 text-lg">
                Browse Service Directory
              </button>
            </div>
          </div>
        </motion.section>
      </main>
      
      <footer className="bg-black w-full py-16 px-8 lg:px-32 border-t border-white/5 mt-auto">
        <div className="flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="text-2xl font-black text-primary font-headline italic tracking-tighter">
            Dire Marketplace
          </div>
          <div className="flex flex-wrap justify-center gap-8">
            <a
              className="text-xs uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
              href="#"
            >
              Terms of Service
            </a>
            <a
              className="text-xs uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
              href="#"
            >
              Privacy Policy
            </a>
            <a
              className="text-xs uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
              href="#"
            >
              Contact Support
            </a>
            <a
              className="text-xs uppercase font-bold text-on-surface-variant hover:text-primary transition-colors tracking-widest"
              href="#"
            >
              About Us
            </a>
          </div>
          <div className="text-[10px] uppercase font-bold text-on-surface-variant/40 text-center lg:text-right tracking-[0.2em]">
            © 2024 DIRE MARKETPLACE. THE DIGITAL CURATOR EDITION.
          </div>
        </div>
      </footer>
    </>
  );
}
