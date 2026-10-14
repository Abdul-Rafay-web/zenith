export interface TaskGuide {
  steps: string[]
  timing: string
  proTip: string
  commonPitfall: string
}

export const TASK_GUIDES: Record<string, TaskGuide> = {
  // Shared Foundation Levers
  "foundation-sleep": {
    steps: [
      "Select a consistent 8-hour sleep window (e.g. 10:30 PM – 6:30 AM) and adhere to it within ±30 minutes every single day, including weekends.",
      "Lower room temperature to 65–68°F (18–20°C). Core body temperature must drop 1–2°F to initiate and sustain deep delta sleep.",
      "Eliminate all ambient light using blackout curtains or an eye mask. Pitch black is required for maximal melatonin secretion.",
      "Cease heavy caloric intake 2–3 hours before bed so metabolic digestion doesn't spike heart rate during slow-wave sleep.",
    ],
    timing: "Nightly at your scheduled bedtime",
    proTip: "Your wake-up time is your master anchor. Locking your wake time to the exact same minute makes falling asleep effortless at night.",
    commonPitfall: "Sleeping in late on weekends creates 'social jetlag', which dysregulates your circadian rhythm and crashes Monday morning vitality.",
  },
  "foundation-light": {
    steps: [
      "Step outdoors within 30–60 minutes of waking. Do not stay behind a glass window, which filters out critical blue/lux wavelengths.",
      "Face toward the eastern sky without sunglasses (prescription eyeglasses or contacts are fine).",
      "Get 10–15 minutes on bright sunny days, 20–30 minutes on cloudy or overcast mornings.",
      "If you wake before dawn, turn on bright indoor overhead lights immediately, then step outside once the sun rises.",
    ],
    timing: "Within 30–60 minutes of waking",
    proTip: "Morning sunlight triggers a healthy cortisol pulse that sets your alertness timer and starts a 14-hour countdown to natural melatonin release.",
    commonPitfall: "Wearing polarized sunglasses or sitting inside behind double-paned windows cancels 85%+ of circadian melanopsin activation.",
  },
  "foundation-caffeine": {
    steps: [
      "Delay your first cup of coffee or caffeine 90–120 minutes after waking to allow natural adenosine clearance.",
      "Set a strict cutoff time 8–10 hours before your scheduled bedtime (e.g., no caffeine after 1:00 PM if sleeping at 10:30 PM).",
      "Switch to water, herbal tea, or decaf beverages for afternoon and evening hydration.",
    ],
    timing: "Cease all caffeine 8–10 hours before bed",
    proTip: "Delaying caffeine by 90 minutes post-waking clears accumulated sleep pressure naturally, completely preventing the dreaded 2:00 PM crash.",
    commonPitfall: "Drinking espresso at 4:00 PM. Caffeine has a 5–7 hour elimination half-life; a quarter of it remains in your brain at midnight, destroying deep delta sleep.",
  },
  "foundation-move": {
    steps: [
      "Choose a conversational cardio modality: brisk incline walking, outdoor cycling, rowing, or light jogging.",
      "Maintain a steady pace where you can comfortably speak full sentences but cannot sing (Zone 2, ~60–70% of max heart rate).",
      "Breathe through your nose throughout the session to reinforce aerobic efficiency and carbon dioxide tolerance.",
      "Accumulate 30–45 minutes per session, 3–4 times per week to achieve the 150-minute weekly foundation.",
    ],
    timing: "Morning or afternoon",
    proTip: "Zone-2 cardio expands mitochondrial density in muscle tissue and triggers sustained BDNF release in the hippocampus without raising cortisol.",
    commonPitfall: "Pushing too hard into Zone 3 or 4. If you have to gasp through your mouth, you've crossed the aerobic threshold into anaerobic glycolysis.",
  },
  "foundation-lift": {
    steps: [
      "Warm up dynamically for 5 minutes (arm circles, hip hinges, light bodyweight squats).",
      "Perform compound multi-joint movements: Squats, Deadlifts, Overhead Press, Pull-ups/Rows, or Bench Press.",
      "Work in the 6–10 repetition range, leaving 1–2 repetitions in reserve before complete muscular failure (1–2 RIR).",
      "Take full 2–3 minute rests between heavy compound sets to allow ATP-CP and central nervous system replenishment.",
    ],
    timing: "3x weekly with 48 hours recovery between sessions",
    proTip: "Progressive mechanical tension on large motor units maximizes androgen receptor density in muscle tissue and stimulates growth hormone.",
    commonPitfall: "Rushing from set to set with only 30-second rests. Short rests produce metabolic pump but blunt heavy motor unit recruitment and endocrine signaling.",
  },
  "foundation-screens-off": {
    steps: [
      "Set an automatic phone alarm for 60 minutes before your target bedtime.",
      "Plug your phone and tablet into a charging station located outside the bedroom (hallway or kitchen).",
      "Turn off harsh overhead ceiling lights and switch to low-level warm incandescent or red lamps.",
      "Spend the final 60 minutes reading physical books, light stretching, journaling, or meditating.",
    ],
    timing: "60 minutes prior to sleep",
    proTip: "Use an inexpensive standalone digital or analog clock on your nightstand so you never need your phone in the bedroom for alarms.",
    commonPitfall: "Taking your phone to bed in 'dark mode'. Algorithmic scrolling stimulates dopaminergic search loops and keeps the prefrontal cortex in high arousal.",
  },
  "foundation-alcohol": {
    steps: [
      "Designate 5–7 alcohol-free days per week, reserving consumption to occasional social milestones (target ≤2 drinks/week).",
      "When socializing, substitute with sparkling mineral water with lime in a rock glass.",
      "Notice your sleep tracking and resting heart rate on alcohol-free nights: your heart rate will be 8–12 bpm lower.",
    ],
    timing: "Daily habit",
    proTip: "Zero alcohol preserves REM dream cycles and prevents ethanol-induced Leydig cell apoptosis, keeping free testosterone high.",
    commonPitfall: "Using alcohol as a 'nightcap' to fall asleep. Alcohol acts as a sedative that knocks out consciousness but completely fragments sleep architecture.",
  },
  "foundation-protein": {
    steps: [
      "Aim for 1.6 to 2.2 grams of protein per kilogram of body weight spread evenly across 3–4 meals.",
      "Anchor each meal with 30–40g of complete protein (eggs, wild fish, chicken breast, grass-fed beef, Greek yogurt, or pea/rice blend).",
      "Consume a protein-rich meal within 2 hours of compound resistance training to initiate muscle protein synthesis via mTOR/leucine.",
    ],
    timing: "Every meal",
    proTip: "Protein provides the essential amino acid precursors for neurotransmitters: L-tyrosine for dopamine and L-tryptophan for serotonin.",
    commonPitfall: "Eating low-protein breakfasts (pastries or cereals) that cause rapid blood glucose crashes and mid-morning brain fog.",
  },

  // Sharper Mind Track Tasks
  "mind-deep-learning": {
    steps: [
      "Select one conceptually demanding domain: system architecture, advanced mathematics, software engineering, or dense non-fiction.",
      "Clear your environment: phone in another room on silent, full-screen single window, close all unrelated tabs.",
      "Start the Zenith timer (25 min in Phase 1, 45 min in Phase 2, 90 min in Phase 3) and engage with zero context switching.",
      "Work right at the edge of your cognitive capacity where struggle is felt; that struggle is the physical sensation of neuroplastic reorganization.",
      "After the timer rings, take 5 minutes of quiet eyes-closed diffuse rest without checking any digital inputs.",
    ],
    timing: "Morning peak cognitive window (2–4h after waking)",
    proTip: "The 5-minute quiet period immediately after intense focus allows the hippocampus to replay neural firing patterns at 10x speed, cementing retention.",
    commonPitfall: "Listening to music with lyrics or keeping chat apps open. Attention residue from micro-distractions reduces processing speed by up to 40%.",
  },
  "mind-retrieval": {
    steps: [
      "After reading or learning a concept, close the source completely.",
      "Take a blank piece of paper or blank document and write down everything you can recall from memory: core concepts, models, edge cases.",
      "Push past the first pause where you think you're done; spend an extra 2 minutes digging deeper into your memory stores.",
      "Re-open your source and compare your recall notes against the text, identifying exact omissions and inaccuracies.",
    ],
    timing: "Daily review session (10 min)",
    proTip: "Active retrieval produces up to 50% stronger long-term retention compared to passive re-reading or highlighting.",
    commonPitfall: "Looking back at the notes before writing. You must experience the genuine effort of retrieval for synaptic pathways to strengthen.",
  },
  "mind-reading": {
    steps: [
      "Select a physical book or deep peer-reviewed paper (avoid social feeds, blogs, or clickbait articles).",
      "Sit in a well-lit chair away from digital screens and set a 30-minute timer.",
      "Read linearly from front to back, pausing at the end of each chapter or section to summarize the thesis in your own words.",
    ],
    timing: "Evening wind-down",
    proTip: "Linear reading trains deep syntax processing and counteracts the fragmented 'scanning' habits induced by social media feeds.",
    commonPitfall: "Skimming or speed-reading. The goal is deep conceptual comprehension and crystallized vocabulary building, not page speed.",
  },
  "mind-nutrition": {
    steps: [
      "Include 2–3 whole pasture-raised eggs daily for bioavailable choline (the precursor to acetylcholine for focus and memory).",
      "Consume fatty fish 2–3x weekly (salmon, sardines, mackerel) or take high-quality Omega-3 delivering ≥1,000mg DHA daily.",
      "Include colorful berries (blueberries, blackberries) rich in anthocyanins that cross the blood-brain barrier to protect neural synapses.",
    ],
    timing: "Daily meals",
    proTip: "DHA comprises 30% of the structural lipid content of the cerebral cortex; adequate intake maintains synaptic membrane fluidity.",
    commonPitfall: "Throwing away egg yolks. The yolk contains 100% of the choline, lutein, and fat-soluble vitamins essential for brain health.",
  },
  "mind-deficiency-check": {
    steps: [
      "Schedule a routine comprehensive blood panel with your physician or lab.",
      "Request specific tests: Serum Vitamin B12, Ferritin (stored iron), 25(OH) Vitamin D, and TSH/Free T4 (thyroid).",
      "Upload your lab results PDF directly to this track in Zenith to track your biological baseline.",
      "If values are in the lower tertile, work with your healthcare provider to correct them with targeted whole foods or supplementation.",
    ],
    timing: "Once at baseline (Week 1)",
    proTip: "Subclinical B12 or ferritin deficiency is the single most common biological cause of persistent brain fog and memory sluggishness in healthy adults.",
    commonPitfall: "Assuming 'within lab reference range' means optimal. Reference ranges represent illness absence, not peak cognitive performance.",
  },
  "mind-teach-back": {
    steps: [
      "Pick a complex topic you learned recently.",
      "Imagine you are explaining it to a 12-year-old with no technical background.",
      "Explain the concept out loud or on paper using plain, jargon-free analogies.",
      "Whenever you find yourself relying on complex buzzwords, pause—that marks the exact boundary of your understanding.",
    ],
    timing: "Evening reflection (5 min)",
    proTip: "The Feynman Technique ruthlessly exposes the 'illusion of explanatory competence' and turns fragile knowledge into permanent wisdom.",
    commonPitfall: "Using technical jargon to gloss over parts you don't fully understand.",
  },
  "mind-dual-nback": {
    steps: [
      "Open a Dual N-Back application or browser tool.",
      "Track two simultaneous sequences: a spatial square on a 3x3 grid and an auditory letter spoken through headphones.",
      "Press the matching button when the current position or letter matches the one shown N steps back.",
      "Complete 20 blocks (approx. 15 minutes) 4–5 days per week, allowing the difficulty to advance automatically as your accuracy exceeds 80%.",
    ],
    timing: "Morning focus session",
    proTip: "Dual N-Back forces your prefrontal cortex to simultaneously maintain, update, and discard working memory representations under strict time limits.",
    commonPitfall: "Using visual mnemonics or spatial grouping tricks instead of raw working memory holding.",
  },
  "mind-strategy-reasoning": {
    steps: [
      "Engage in 15 minutes of strategic games: Chess tactics, Go puzzles, or deductive logic grid problems.",
      "Before moving, calculate at least 2–3 moves ahead and formulate an explicit counter-response.",
      "Analyze your losses or errors immediately to identify cognitive blind spots and hasty decision-making.",
    ],
    timing: "Afternoon break",
    proTip: "Forward-projection puzzles build working memory capacity and train the brain to prune unpromising decision trees under uncertainty.",
    commonPitfall: "Playing fast blitz games by intuition without calculating depth. Quality of calculation is what builds synaptic plasticity.",
  },
  "mind-meditation": {
    steps: [
      "Sit upright in a quiet space with your eyes closed and spine straight.",
      "Anchor your attentional beam on the physical sensation of air passing through your nostrils or the rise of your belly.",
      "Count each exhale from 1 to 10. When your mind inevitably wanders, notice the distraction without self-judgment.",
      "Gently release the thought and bring your attentional beam right back to breath count 1.",
    ],
    timing: "Upon waking or before deep work",
    proTip: "The 'rep' in meditation is NOT keeping your mind perfectly blank; the rep is the exact moment you catch your mind wandering and return to breath.",
    commonPitfall: "Feeling frustrated when thoughts arise. Mind wandering is the stimulus; noticing it is the mental bicep curl that builds prefrontal control.",
  },
  "mind-hiit-bdnf": {
    steps: [
      "Perform a 5-minute dynamic warm-up on an assault bike, rower, or running track.",
      "Sprint with 100% maximal effort for 30 seconds.",
      "Rest actively for 90 seconds at a very slow recovery pace.",
      "Repeat for 4 to 6 rounds total (total workout is under 15 minutes).",
    ],
    timing: "2x weekly (with 48h recovery between sessions)",
    proTip: "High-intensity sprint intervals generate a dramatic acute surge of Brain-Derived Neurotrophic Factor (BDNF) that primes neurons for new learning.",
    commonPitfall: "Holding back effort. HIIT requires true all-out anaerobic intensity for the peripheral BDNF cascade to cross the blood-brain barrier.",
  },
  "mind-novelty": {
    steps: [
      "Pick one novel skill outside your comfort zone: learning guitar chords, sketching perspective, conversational phrases in a new language, or 3D modeling.",
      "Dedicate 45 minutes to beginner practice where you feel clumsy and uncoordinated.",
      "Embrace the awkward friction—unfamiliar sensory-motor coordination stimulates widespread dendritic arborization.",
    ],
    timing: "Weekly dedicated session",
    proTip: "True cognitive novelty stimulates neurogenesis and creates novel synaptic connections across previously disconnected cortical regions.",
    commonPitfall: "Sticking strictly to things you are already good at. Mastery reinforces existing paths; novelty builds brand new neural highways.",
  },

  // Testosterone & Vitality Track Tasks
  "t-compound-session": {
    steps: [
      "Warm up dynamically with mobility drills and 2 warm-up sets per exercise.",
      "Execute heavy compound multi-joint movements: Barbell Back Squats or Front Squats, Conventional Deadlifts or RDLs, Standing Overhead Press, Weighted Dips or Pull-ups.",
      "Perform 3–4 working sets of 6–8 reps per movement with heavy weight, stopping 1–2 reps before complete failure.",
      "Rest 2.5–3 minutes between sets to maintain maximum mechanical tension without excessive metabolic exhaustion.",
    ],
    timing: "3x weekly with at least 48h rest",
    proTip: "Heavy compound loading recruits the largest motor unit pools, signaling the endocrine axis to upregulate androgen receptor density and free testosterone.",
    commonPitfall: "Doing high-rep circuit training with light weights. While great for conditioning, it raises cortisol rather than maximizing androgenic mechanical stimulus.",
  },
  "t-daily-steps": {
    steps: [
      "Target 8,000 to 10,000 steps daily through intentional walking.",
      "Take a 10–15 minute walk immediately after meals (breakfast, lunch, dinner) to blunt postprandial glucose spikes.",
      "Use walking meetings, take stairs, or park farther away to accumulate non-exercise activity thermogenesis (NEAT).",
    ],
    timing: "Throughout the day",
    proTip: "Post-meal walks activate GLUT4 glucose transporters in muscle without requiring insulin, significantly improving insulin sensitivity.",
    commonPitfall: "Sitting continuously for 8 hours and trying to make up for it with a single 30-minute workout. Constant low-grade movement prevents metabolic slowdown.",
  },
  "t-whole-food-plate": {
    steps: [
      "Build your meals around unrefined whole foods: pasture-raised eggs, beef, wild fish, olive oil, avocados, butter, nuts, potatoes, and vegetables.",
      "Include 2–3 whole eggs daily. The cholesterol in egg yolks is the direct precursor molecule for pregnenolone, the master steroid hormone.",
      "Ensure total fat comprises 30–40% of your daily caloric intake from monounsaturated and saturated sources.",
    ],
    timing: "Every meal",
    proTip: "Clinical trials consistently prove that men placed on low-fat diets (<20% fat) experience an immediate 10–15% decline in total testosterone.",
    commonPitfall: "Consuming industrial seed oils (canola, soybean, corn oil) high in oxidized omega-6 linoleic acid, which promotes systemic inflammation.",
  },
  "t-midday-sunlight": {
    steps: [
      "Step outside between 11:00 AM and 2:00 PM when solar UV-B rays are strongest.",
      "Expose as much skin as socially appropriate (torso, arms, legs) for 15–20 minutes without sunscreen.",
      "Do NOT stay out long enough to burn or redden your skin; brief intense exposure is all that is required for cutaneous cholecalciferol synthesis.",
    ],
    timing: "Midday (11 AM – 2 PM)",
    proTip: "Vitamin D functions biologically as a secosteroid hormone with direct nuclear receptors in Leydig cells, supporting testicular testosterone production.",
    commonPitfall: "Relying on morning or late afternoon sunlight for Vitamin D. UV-B rays only penetrate the atmosphere when the sun is at a high solar angle.",
  },
  "t-waist-measurement": {
    steps: [
      "Take a flexible measuring tape on Sunday morning immediately after using the bathroom and before breakfast.",
      "Measure your waist circumference horizontally at the exact level of your navel in a relaxed state (do not suck in your stomach).",
      "Calculate your waist-to-height ratio: Waist (in inches or cm) divided by Height. Your target is <0.50.",
    ],
    timing: "Weekly on Sunday morning",
    proTip: "Visceral adipose tissue produces the aromatase enzyme, which converts circulating testosterone into estradiol. Reducing visceral fat directly rescues free testosterone.",
    commonPitfall: "Relying strictly on the scale. Weight can remain constant while body composition shifts favorably toward more muscle and less visceral fat.",
  },
  "t-stress-buffer": {
    steps: [
      "When experiencing acute frustration or autonomic tension, pause immediately.",
      "Execute 5 minutes of cyclic sighing: two deep nasal inhales followed by one long, slow mouth exhale.",
      "Take a 10-minute walk outside or lie down flat on your back with legs elevated.",
    ],
    timing: "Midday or afternoon stress spikes",
    proTip: "Cortisol and testosterone share the same precursor pathways (the 'pregnenolone steal'). Lowering sympathetic stress directly frees up endocrine synthesis.",
    commonPitfall: "Powering through chronic stress with excess stimulants, which keeps the adrenal cortex in constant hyper-cortisolemic overdrive.",
  },
  "t-zinc-magnesium": {
    steps: [
      "Include zinc-rich foods: oysters, grass-fed red meat, pumpkin seeds, and eggs.",
      "Take 200–400mg of elemental Magnesium (glycinate, malate, or threonate) 30–60 minutes before bed with a glass of water.",
      "Ensure adequate dietary zinc (15–30mg/day) to prevent 5-alpha reductase and aromatase imbalances.",
    ],
    timing: "Evening before bed",
    proTip: "Magnesium binds to and frees sex-hormone binding globulin (SHBG), increasing the fraction of bioavailable free testosterone.",
    commonPitfall: "Taking cheap magnesium oxide, which has under 4% bioavailability and acts primarily as a laxative rather than an intracellular nutrient.",
  },
  "t-sprint-intervals": {
    steps: [
      "Warm up thoroughly with dynamic lunges, high knees, and easy jogging for 8 minutes.",
      "Perform 5 to 6 all-out maximal 10-second sprints (hill sprint, track sprint, or stationary bike).",
      "Rest for 90 to 120 seconds between sprints to allow complete recovery.",
    ],
    timing: "Weekly on non-lifting day",
    proTip: "Maximal anaerobic sprints trigger an immediate acute surge in luteinizing hormone (LH) and growth hormone.",
    commonPitfall: "Sprint training while already exhausted or sore, which elevates cortisol and increases hamstring strain risk.",
  },

  // Attention Reset & Dopamine Fast Track Tasks
  "attn-friction-rules": {
    steps: [
      "Identify the 2 apps or websites that consume most of your unconscious screen time (social media, short-form video, news).",
      "Delete them from your phone home screen or set a 20-character randomized password stored in an external password manager.",
      "Turn your phone display to Grayscale (Settings → Accessibility → Display → Color Filters) to remove addictive visual dopamine triggers.",
      "Establish an 'unconscious check' rule: whenever you touch your phone, state your specific intention out loud before unlocking it.",
    ],
    timing: "Set up once, enforce daily",
    proTip: "Friction beats willpower 100% of the time. Adding even 5 seconds of friction breaks the automatic dopamine-seeking loop.",
    commonPitfall: "Believing you can keep tempting apps on your home screen and simply 'use willpower' not to check them.",
  },
  "attn-monotasking": {
    steps: [
      "Select your single most important project task.",
      "Close all other tabs, mute phone notifications, and enter full-screen mode.",
      "Work exclusively on this one task for a protected 45-minute block. If an unrelated thought or task arises, jot it down on a physical scrap paper and return to your focus immediately.",
    ],
    timing: "Morning or early afternoon",
    proTip: "Every task switch incurs 'attention residue' that degrades IQ by up to 10 points for up to 20 minutes.",
    commonPitfall: "Keeping email or messaging clients open in the background 'just in case' someone needs you.",
  },
  "attn-urge-surfing": {
    steps: [
      "The instant you feel a compulsive itch to check your phone, open social media, or seek novelty, pause.",
      "Do NOT give in and do NOT forcefully fight the thought. Name it calmly: 'I am experiencing a dopamine craving.'",
      "Focus your attention on your body: notice where the tension sits (chest, throat, fingers).",
      "Breathe slowly and picture the craving as a wave peaking in intensity, knowing it will break and dissipate within 7–10 minutes.",
    ],
    timing: "Whenever a compulsive craving strikes",
    proTip: "Dopamine cravings are temporary neurochemical surges. Surfing the wave without indulging re-sensitizes D2 dopamine receptors.",
    commonPitfall: "Engaging in self-criticism or moralizing the craving. The craving is biological; observing it objectively strips away its power.",
  },
  "attn-boredom-tolerance": {
    steps: [
      "Choose a routine daily queue: waiting in line at a grocery store, waiting for an elevator, or commuting on transit.",
      "Leave your phone in your pocket completely untouched.",
      "Look around at the physical architecture, people, or simply observe your breath for 5–10 minutes.",
      "Allow your brain to experience mild boredom without rushing to extinguish it with algorithmic stimulation.",
    ],
    timing: "Daily transitional moments (5–10 min)",
    proTip: "Boredom is the necessary biological silence required for internal motivation, spontaneous creativity, and self-reflection to emerge.",
    commonPitfall: "Immediately pulling out your phone the microsecond you stop moving or waiting.",
  },
  "attn-implementation-intention": {
    steps: [
      "Identify your most common failure mode (e.g., opening social feeds when hitting a difficult problem in code).",
      "Formulate a precise conditional rule: 'If [specific trigger occurs], then I will [immediate replacement action].'",
      "Example: 'If I feel stuck on a difficult paragraph, then I will stand up and drink a full glass of water instead of opening Twitter.'",
      "Write this rule on an index card and keep it beside your keyboard.",
    ],
    timing: "Set up in Phase 1, review weekly",
    proTip: "Implementation intentions bypass executive deliberation by pre-programming the basal ganglia with an automated motor response.",
    commonPitfall: "Vague intentions like 'I will try to be less distracted'. Only specific 'If X, then Y' formulas succeed.",
  },
  "attn-full-reset-day": {
    steps: [
      "Choose one weekend day (e.g. Saturday or Sunday).",
      "Turn off all personal computers, tablets, and smartphones for a full 24 hours (or store phone in a drawer on emergency-calls-only mode).",
      "Spend the day engaging in analog living: hiking in nature, cooking from scratch, reading physical books, talking with friends in person.",
      "Notice how your attention span, baseline calm, and creative enthusiasm return by Sunday evening.",
    ],
    timing: "Once monthly on a weekend",
    proTip: "A 24-hour fast from high-density digital stimulation downregulates dopamine transporter density, resensitizing your reward threshold.",
    commonPitfall: "Cheating with 'just one quick video' or checking notifications. The detox requires full cognitive disconnection.",
  },

  // Skin & Hair Track Tasks
  "skin-sunscreen": {
    steps: [
      "Every morning after cleansing, apply a nickel-sized dollop (approx. 1/4 teaspoon for face and neck) of broad-spectrum SPF 30+ or SPF 50 sunscreen.",
      "Distribute evenly across forehead, cheeks, nose, neck, and the tops of your ears.",
      "Allow 2 minutes for the formula to absorb before stepping outside.",
    ],
    timing: "Every morning as the final step of your skincare routine",
    proTip: "Ultraviolet A (UV-A) radiation penetrates cloud cover and window glass year-round, degrading collagen fibers and causing 80% of visible skin aging.",
    commonPitfall: "Applying sunscreen only when going to the beach. Daily incidental exposure accounts for the vast majority of cumulative dermal photoaging.",
  },
  "skin-gentle-cleanse": {
    steps: [
      "In the evening, wash your face with lukewarm (never hot) water and a mild, fragrance-free hydrating cleanser.",
      "Massage gently in circular motions for 30–45 seconds with your fingertips.",
      "Rinse thoroughly and gently pat dry with a clean cotton towel (do NOT vigorously scrub or rub).",
    ],
    timing: "Evening before bed",
    proTip: "Hot water strips natural sebum and damages the stratum corneum lipid matrix, causing transepidermal water loss and irritation.",
    commonPitfall: "Washing face with harsh body bar soaps with high alkaline pH, which destroys the skin's protective acid mantle.",
  },
  "skin-moisturize": {
    steps: [
      "Within 60 seconds of washing and patting dry (while skin is still slightly damp), apply a ceramide and hyaluronic acid moisturizer.",
      "Smooth gently across your face and neck to seal in surface hydration.",
      "If using a retinoid or active serum (Phase 2), apply the moisturizer either before or after according to your skin's tolerance.",
    ],
    timing: "Nightly before sleep",
    proTip: "Applying moisturizer to damp skin locks in hydration and accelerates nighttime epidermal barrier repair.",
    commonPitfall: "Waiting until skin is completely dry and tight before applying moisturizer.",
  },
  "hair-scalp-massage": {
    steps: [
      "While showering or in the evening, use the pads of your fingertips (not fingernails) to massage your scalp.",
      "Apply firm, circular pressure for 3–4 minutes, working from the hairline to the crown and back of the head.",
      "Finish with cool water over your scalp to soothe the microvasculature.",
    ],
    timing: "Daily (morning or evening)",
    proTip: "Mechanical scalp tension increases subcutaneous microcirculation and delivers vital nutrients directly to hair follicle dermal papilla cells.",
    commonPitfall: "Scratched-scalp scrubbing with fingernails, which causes micro-tears and follicle inflammation.",
  },
  "hair-micronutrients": {
    steps: [
      "Ensure adequate dietary intake of sulfur-rich amino acids (cysteine and methionine from eggs, poultry, and fish) to supply keratin building blocks.",
      "Include foods rich in iron (ferritin), zinc, and biotin (spinach, pumpkin seeds, lentils, whole eggs).",
      "Drink at least 2 liters of clean water throughout the day for cellular hydration.",
    ],
    timing: "Daily nutrition",
    proTip: "Hair is non-essential tissue; if your body is deficient in iron or protein, it diverts nutrients away from follicles to vital organs first.",
    commonPitfall: "Severely restricting calories or protein, which triggers telogen effluvium (premature hair shedding).",
  },

  // Neurochemical Balance Track Tasks
  "neuro-cyclic-sighing": {
    steps: [
      "Sit upright in a comfortable chair with shoulders relaxed.",
      "Inhale deeply through your nose until your lungs are about 80% full.",
      "Immediately take a second sharp 'sip' of air through your nose to maximally inflate the alveoli.",
      "Exhale slowly and smoothly through your mouth with relaxed lips for 5–6 seconds until completely empty.",
      "Repeat this rhythmic breathing continuously for 5 full minutes.",
    ],
    timing: "Daily (midday or before bed)",
    proTip: "Balban et al. (2023, Cell Reports Medicine) demonstrated that 5 minutes of cyclic sighing produces greater mood enhancement and anxiety reduction than mindfulness meditation.",
    commonPitfall: "Breathing too fast. The secret to vagal nerve activation is an exhale that is at least twice as long as the inhale.",
  },
  "neuro-cold-exposure": {
    steps: [
      "At the end of your standard warm shower, turn the temperature dial fully to cold.",
      "Step directly under the stream, letting it hit your chest and back of your neck.",
      "Suppress the impulse to gasp; take slow, steady, controlled breaths through your nose.",
      "Maintain exposure for 1 to 2 minutes before stepping out and drying off vigorously.",
    ],
    timing: "Morning shower",
    proTip: "Cold water immersion stimulates locus coeruleus norepinephrine and elevates baseline dopamine by 250% for several hours without a crash.",
    commonPitfall: "Doing cold showers in the late evening, which triggers adrenaline that interferes with nighttime sleep onset.",
  },
}

export function getTaskGuide(taskId: string, title?: string, why?: string): TaskGuide {
  if (TASK_GUIDES[taskId]) {
    return TASK_GUIDES[taskId]
  }

  // Fallback smart guide generator based on title and context
  return {
    steps: [
      `Review your protocol target for "${title || "this task"}" and set up your environment to remove friction.`,
      "Eliminate distractions: set your phone aside, prepare necessary materials, and focus on deliberate execution.",
      "Engage fully with consistent form or focus for the specified duration or target.",
      "Log your completion in Zenith to maintain your adherence and advance your 12-week protocol.",
    ],
    timing: "Daily or as scheduled in your track",
    proTip: "Consistent execution at 70%+ adherence over 14 days unlocks the next phase of structural biological adaptation.",
    commonPitfall: "Skipping two days in a row. Remember the 'never miss twice' rule to keep your neurochemical momentum alive.",
  }
}
