-- ============================================================
-- Ghars dev seed — 7 days of missions + reflections
-- Auto-creates a test user if none exists, then seeds sample data.
-- ============================================================

DO $$
DECLARE
  v_user_id   uuid;
  v_today     date := current_date;

  -- mission ids (generated upfront so reflections can reference them)
  m7 uuid := gen_random_uuid();
  m6 uuid := gen_random_uuid();
  m5 uuid := gen_random_uuid();
  m4 uuid := gen_random_uuid();  -- missed day (no reflection)
  m3 uuid := gen_random_uuid();
  m2 uuid := gen_random_uuid();
  m1 uuid := gen_random_uuid();  -- yesterday (completed)
  m0 uuid := gen_random_uuid();  -- today (not yet completed)

BEGIN
  -- ── 0. Create or get test user ──────────────────────────────
  INSERT INTO users (qf_sub, email, display_name)
  VALUES ('test-user-seed', 'ahmaddzafranmohamadbustaman@gmail.com', 'Test User')
  ON CONFLICT (qf_sub) DO NOTHING;

  SELECT id INTO v_user_id FROM users WHERE qf_sub = 'test-user-seed' LIMIT 1;

  -- ── 1. Missions (one per day, oldest first) ─────────────────
  INSERT INTO daily_missions
    (id, user_id, local_date, verse_key, verse_arabic, verse_translation, mission_text, focus_area)
  VALUES
    -- 7 days ago
    (m7, v_user_id, v_today - 7,
     '2:286',
     'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
     'Allah does not burden a soul beyond that it can bear.',
     'Do one task you have been avoiding. Remind yourself: you have the capacity.',
     'patience'),

    -- 6 days ago
    (m6, v_user_id, v_today - 6,
     '14:7',
     'لَئِن شَكَرْتُمْ لَأَزِيدَنَّكُمْ',
     'If you are grateful, I will surely increase you in favour.',
     'Write down 3 specific things you are grateful for today, then thank someone for one of them.',
     'gratitude'),

    -- 5 days ago
    (m5, v_user_id, v_today - 5,
     '3:134',
     'وَالْكَاظِمِينَ الْغَيْظَ وَالْعَافِينَ عَنِ النَّاسِ',
     'Those who restrain anger and pardon people.',
     'The next time you feel irritated today, pause for 5 seconds before responding.',
     'kindness'),

    -- 4 days ago — intentionally missed (mission exists, no reflection)
    (m4, v_user_id, v_today - 4,
     '93:5',
     'وَلَسَوْفَ يُعْطِيكَ رَبُّكَ فَتَرْضَىٰ',
     'And your Lord is going to give you, and you will be satisfied.',
     'Spend 5 minutes in quiet reflection on something you are waiting for. Trust the timeline.',
     'patience'),

    -- 3 days ago
    (m3, v_user_id, v_today - 3,
     '17:80',
     'رَّبِّ أَدْخِلْنِي مُدْخَلَ صِدْقٍ وَأَخْرِجْنِي مُخْرَجَ صِدْقٍ',
     'My Lord, cause me to enter a sound entrance and to exit a sound exit.',
     'Before starting your most important task today, say Bismillah and set a clear intention.',
     'dhikr'),

    -- 2 days ago
    (m2, v_user_id, v_today - 2,
     '49:12',
     'وَلَا يَغْتَب بَّعْضُكُم بَعْضًا',
     'And do not backbite one another.',
     'Guard your speech today. Before speaking about someone, ask: is this kind, true, and necessary?',
     'honesty'),

    -- yesterday
    (m1, v_user_id, v_today - 1,
     '2:45',
     'وَاسْتَعِينُوا بِالصَّبْرِ وَالصَّلَاةِ',
     'Seek help through patience and prayer.',
     'When you face a difficulty today, pause and offer 2 raka''ah before acting.',
     'patience'),

    -- today (not completed — the app will pick this up as the current mission)
    (m0, v_user_id, v_today,
     '55:13',
     'فَبِأَيِّ آلَاءِ رَبِّكُمَا تُكَذِّبَانِ',
     'So which of the favours of your Lord would you deny?',
     'List 5 small favours you experienced today that you normally overlook.',
     'gratitude')

  ON CONFLICT (user_id, local_date) DO NOTHING;

  -- ── 2. Reflections (accepted missions with depth scores) ────
  --
  -- Points formula: depth_score + 1 (streak bonus, if streak > 1)
  -- Running totals:
  --   day -7: depth=3, streak=1  → +3,  total=3
  --   day -6: depth=4, streak=2  → +5,  total=8
  --   day -5: depth=4, streak=3  → +5,  total=13
  --   day -4: MISSED             → streak resets to 0
  --   day -3: depth=5, streak=1  → +5,  total=18
  --   day -2: depth=4, streak=2  → +5,  total=23
  --   day -1: depth=5, streak=3  → +6,  total=29   (Flowering stage, 25-49 pts)

  INSERT INTO reflections
    (mission_id, user_id, text, llm_verdict, llm_feedback, depth_score)
  VALUES
    (m7, v_user_id,
     'I finally sent that email I had been postponing for weeks. It felt like a weight lifted. The verse reminded me that avoidance is its own burden.',
     'accepted',
     'Excellent — you connected the verse to a concrete act of courage. +3 growth.',
     3),

    (m6, v_user_id,
     'I texted my mum to thank her for always cooking when I visit. She called back immediately and we talked for an hour. Shukr opens doors I forget exist.',
     'accepted',
     'Beautiful — gratitude expressed to another person, not just written down. +4 growth.',
     4),

    (m5, v_user_id,
     'My colleague interrupted me mid-sentence three times. I counted to five each time instead of snapping. By the third time it genuinely stopped bothering me. Subhanallah.',
     'accepted',
     'Deep reflection — you noticed an internal shift, not just an external action. +4 growth.',
     4),

    -- day -4 is intentionally missing (no reflection row = missed day)

    (m3, v_user_id,
     'Said Bismillah before my work presentation. Felt grounded in a way I usually do not. I realised most of my anxiety comes from feeling alone in what I am doing.',
     'accepted',
     'Profound insight connecting intention to inner state. +5 growth.',
     5),

    (m2, v_user_id,
     'Caught myself starting a sentence about a friend and stopped. Chose to talk about something else. Small but it felt significant.',
     'accepted',
     'Good self-awareness — restraint is the hardest form of honesty. +4 growth.',
     4),

    (m1, v_user_id,
     'Had a stressful morning and prayed Duha before replying to work messages. The clarity afterwards was real — I wrote calmer, better emails than I would have otherwise.',
     'accepted',
     'You used the verse as a practical tool under pressure. Excellent depth. +5 growth.',
     5)

  ON CONFLICT (mission_id) DO NOTHING;

  -- ── 3. Garden state ─────────────────────────────────────────
  --
  -- Final state after all reflections above:
  --   growth_points : 29  (Flowering stage, 36% toward Fruiting)
  --   current_streak: 3   (days -3, -2, -1 consecutive)
  --   longest_streak: 3   (streak of 3 pre-miss was also 3)
  --   last_completed: yesterday
  --   wilting        : false (completed yesterday)

  INSERT INTO gardens
    (user_id, growth_points, current_streak, longest_streak, last_completed_date, wilting)
  VALUES
    (v_user_id, 29, 3, 3, v_today - 1, false)
  ON CONFLICT (user_id) DO UPDATE
    SET growth_points       = 29,
        current_streak      = 3,
        longest_streak      = 3,
        last_completed_date = v_today - 1,
        wilting             = false,
        updated_at          = now();

END $$;
