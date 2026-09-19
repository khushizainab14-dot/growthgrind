insert into public.admissions_test_intelligence (test_name, course_area, university, registration_deadline, test_date, official_resource_url, topics, last_checked_at)
values
('TMUA', 'Mathematics, Economics, Computer Science', 'UAT-UK institutions', null, '2026-10-12', 'https://esat-tmua.ac.uk/about-the-tests/tmua-test/', '["mathematical thinking","algebra","logic and proof","problem solving"]'::jsonb, now()),
('ESAT', 'Engineering, Natural Sciences, Computing', 'UAT-UK institutions', null, '2026-10-12', 'https://esat-tmua.ac.uk/', '["mathematics","physics","chemistry","biology"]'::jsonb, now()),
('UCAT', 'Medicine, Dentistry', 'UCAT Consortium universities', '2026-09-16', '2026-07-13', 'https://www.ucat.ac.uk/about-ucat/ucat-test-dates/', '["verbal reasoning","decision making","quantitative reasoning","situational judgement"]'::jsonb, now()),
('LNAT', 'Law', 'LNAT universities', null, null, 'https://lnat.ac.uk/', '["multiple-choice reasoning","essay writing","critical thinking"]'::jsonb, now()),
('STEP', 'Mathematics', 'Cambridge, Warwick, Imperial and others', null, null, 'https://ocr-live-prd95.cambridgeassessment.org.uk/students/step-mathematics/preparing-for-step/', '["pure mathematics","mechanics","probability and statistics","advanced problem solving"]'::jsonb, now())
on conflict (test_name, university, course_area) do update set
registration_deadline = excluded.registration_deadline, test_date = excluded.test_date,
official_resource_url = excluded.official_resource_url, topics = excluded.topics, last_checked_at = now();
