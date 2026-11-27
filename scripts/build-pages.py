"""Generate the condition and procedure pages (conditions/*.html, procedures/*.html).

Each page is written for patients searching for one condition or procedure.
The Vite build picks the pages up automatically and adds them to the sitemap;
the canonical address and FAQ structured data are added at build time.
Run: python3 scripts/build-pages.py
"""
import json
import pathlib

ROOT = pathlib.Path(__file__).resolve().parents[1]
PHONE, PHONE_TEL = '+91 70872 22235', '+917087222235'
WA = 'https://wa.me/917087222235?text=Hello%2C%20I%20would%20like%20to%20book%20a%20consultation%20with%20Dr%20Hemanth%20Chinthala.'
ROLE = 'Consultant gastroenterologist, hepatologist and interventional endoscopist'

PAGES = [
    # ------------------------------------------------------------------ procedures
    dict(kind='procedures', slug='ercp', name='ERCP', schema='MedicalProcedure',
         title='ERCP in Hyderabad | Dr Hemanth Chinthala, Gastroenterologist',
         desc='ERCP treats bile duct stones, blockages and jaundice without open surgery. Dr Hemanth Chinthala performs ERCP at Medicover Hospital, Financial District, Hyderabad.',
         h1='ERCP: treating the bile and pancreatic ducts without surgery',
         lede='ERCP (endoscopic retrograde cholangiopancreatography) uses a flexible scope passed through the mouth to reach the opening of the bile and pancreatic ducts in the duodenum. Through it, blockages can be cleared, stones removed and stents placed, usually without any cut.',
         body='''
<h2>When ERCP is needed</h2>
<ul>
<li><strong>Stones in the bile duct</strong>, which often slip down from the gallbladder and can cause pain, jaundice or infection.</li>
<li><strong>Jaundice from a blocked duct</strong>, when the yellowing of the eyes and skin comes from a narrowing or a growth.</li>
<li><strong>Narrowing of the ducts (strictures)</strong>, which may need a stent to keep bile flowing.</li>
<li><strong>Bile leaks</strong> after gallbladder surgery.</li>
<li><strong>Some problems of the pancreatic duct</strong>, such as stones or narrowing in chronic pancreatitis.</li>
</ul>
<p class="note">ERCP is now used mainly to treat. If the only question is what is causing the problem, an MRCP scan or endoscopic ultrasound can usually answer it without the risks of ERCP.</p>

<h2>How it is done</h2>
<p>You are given sedation or anaesthesia, so you are comfortable and usually do not remember the procedure. The scope is passed through the mouth to the duodenum. A thin tube is guided into the bile or pancreatic duct, and dye is injected so the ducts show on X-ray.</p>
<p>A small cut in the duct opening (a sphincterotomy) widens it. Stones are then pulled out with a balloon or basket, and a stent, a small tube, can be left across a narrowing. ERCP usually takes 30 to 90 minutes.</p>

<h2>Before the procedure</h2>
<ul>
<li>Nothing to eat for about six hours before, unless you are told otherwise.</li>
<li>Tell the team about blood thinners, diabetes medicines and any allergy, especially to contrast dye or iodine.</li>
<li>You will need recent blood tests, and someone to take you home.</li>
</ul>

<h2>Risks</h2>
<p>In experienced hands ERCP is safe, but it is more involved than a routine endoscopy. The most common complication is pancreatitis, an inflammation of the pancreas, which happens in a small number of patients and usually settles with treatment. Less common are bleeding, infection and a tear in the gut wall. Dr Chinthala will explain which risks apply to you and how they are kept low.</p>

<h2>After ERCP</h2>
<p>You are watched for a few hours. Many people go home the same day or the next morning. A sore throat and some bloating are common. Contact the hospital at once if you have severe belly pain, fever, repeated vomiting or black stools.</p>
''',
         faq=[('Is ERCP painful?', 'You are given sedation or anaesthesia, so most people feel nothing during the procedure. Afterwards you may have a sore throat or mild bloating for a day.'),
              ('How long will I stay in hospital?', 'Often only a few hours, or one night. You may stay longer if ERCP was done for an infection or if a complication needs watching.'),
              ('Will I need my gallbladder removed?', 'If the stones came from the gallbladder, removing it is often advised so they do not come back. Dr Chinthala and the surgeon will advise you on the timing.'),
              ('What is a stent, and is it permanent?', 'A stent is a small plastic or metal tube that keeps a duct open. Plastic stents are usually changed or removed within a few months. Some metal stents are left in place.')],
         related=['eus', 'pancreatitis', 'endoscopy']),

    dict(kind='procedures', slug='eus', name='Endoscopic ultrasound (EUS)', schema='MedicalProcedure',
         title='Endoscopic Ultrasound (EUS) in Hyderabad | Dr Hemanth Chinthala',
         desc='Endoscopic ultrasound gives close, detailed views of the pancreas, bile duct and gut wall, and allows needle biopsies without surgery. At Medicover Hospital, Financial District, Hyderabad.',
         h1='Endoscopic ultrasound (EUS)',
         lede='EUS combines endoscopy and ultrasound. A small ultrasound probe at the tip of the scope sits right next to the pancreas, bile duct and the wall of the gut, so it gives some of the most detailed pictures available, and it can take samples through a fine needle.',
         body='''
<h2>When EUS is used</h2>
<ul>
<li><strong>Cysts or lumps in the pancreas</strong> found on a CT or MRI scan.</li>
<li><strong>Small stones in the bile duct</strong> when other scans are unclear.</li>
<li><strong>Staging cancers</strong> of the food pipe, stomach, pancreas and rectum, to see how deep they go and plan treatment.</li>
<li><strong>Lumps under the lining of the gut</strong>, which ordinary endoscopy cannot see into.</li>
<li><strong>Needle biopsies</strong> (EUS-FNA or FNB) to get a diagnosis without surgery.</li>
<li><strong>Some treatments</strong>, such as draining fluid collections after severe pancreatitis.</li>
</ul>

<h2>How it is done</h2>
<p>EUS is done under sedation. The scope is passed through the mouth, or through the back passage to look at the rectum. A scan usually takes 20 to 60 minutes, a little longer if samples are taken. Taking a sample with the needle is not painful.</p>

<h2>Before the procedure</h2>
<ul>
<li>Nothing to eat for about six hours before.</li>
<li>Tell the team about blood thinners and diabetes medicines; some may need to be paused before a biopsy.</li>
<li>Bring your earlier scans and reports, and someone to take you home.</li>
</ul>

<h2>Risks</h2>
<p>A diagnostic EUS is very safe; a sore throat is the most common after-effect. When a needle sample is taken there is a small risk of bleeding, infection or pancreatitis. Dr Chinthala will discuss this with you.</p>
''',
         faq=[('How is EUS different from a CT or MRI scan?', 'CT and MRI look from outside the body. EUS looks from inside the stomach and duodenum, right next to the pancreas and bile duct, so it can show smaller details and take samples.'),
              ('Will I be awake?', 'You are given sedation, so you are comfortable and usually remember little of it.'),
              ('When will I get biopsy results?', 'Usually within a few working days. Dr Chinthala will go through them with you and explain the next steps.')],
         related=['ercp', 'pancreatitis', 'endoscopy']),

    dict(kind='procedures', slug='endoscopy', name='Upper GI endoscopy', schema='MedicalProcedure',
         title='Upper GI Endoscopy (Gastroscopy) in Hyderabad | Dr Hemanth Chinthala',
         desc='Upper GI endoscopy examines the food pipe, stomach and duodenum to find the cause of acidity, pain, bleeding or swallowing problems. At Medicover Hospital, Financial District, Hyderabad.',
         h1='Upper GI endoscopy (gastroscopy)',
         lede='A thin, flexible tube with a camera is passed through the mouth to look at the food pipe, the stomach and the first part of the small intestine (the duodenum). It is the most direct way to find the cause of many upper digestive symptoms.',
         body='''
<h2>When it is advised</h2>
<ul>
<li>Acidity or heartburn that keeps coming back or does not settle with treatment.</li>
<li>Difficulty or pain when swallowing.</li>
<li>Vomiting blood, or black, tar-like stools.</li>
<li>Iron-deficiency anaemia or weight loss without a clear reason.</li>
<li>Ongoing pain in the upper abdomen.</li>
<li>Checking for varices (enlarged veins) in people with cirrhosis.</li>
<li>Biopsies, for example to test for <em>H. pylori</em> infection or coeliac disease.</li>
</ul>
<p>Endoscopy can also treat: stopping bleeding, banding varices, removing polyps and stretching narrowings.</p>

<h2>How it is done</h2>
<p>Your throat is numbed with a spray, and you can also have sedation. The examination itself usually takes 5 to 15 minutes. Biopsies, tiny samples of the lining, are painless.</p>

<h2>Before and after</h2>
<ul>
<li>Nothing to eat for about six hours before. Follow the hospital's advice about water.</li>
<li>Tell the team about blood thinners and diabetes medicines.</li>
<li>If you have sedation, do not drive for the rest of the day and bring someone with you.</li>
<li>You can eat once the numbness in your throat has worn off, usually after about an hour.</li>
</ul>

<h2>Risks</h2>
<p>Diagnostic endoscopy is very safe. Bleeding or a tear in the gut wall are rare, and slightly more likely when a treatment is done during the procedure.</p>
''',
         faq=[('Will it hurt?', 'Most people feel some pressure and the urge to gag for a moment, but not pain. Sedation makes it more comfortable if you are anxious.'),
              ('When will I know the results?', 'Dr Chinthala can usually tell you what he saw straight after the test. Biopsy results take a few working days.'),
              ('Do I need an endoscopy for acidity?', 'Not always. Many people improve with lifestyle changes and a short course of medicine. Endoscopy is advised when symptoms persist or when there are warning signs such as difficulty swallowing, bleeding or weight loss.')],
         related=['acidity-reflux', 'colonoscopy', 'eus']),

    dict(kind='procedures', slug='colonoscopy', name='Colonoscopy', schema='MedicalProcedure',
         title='Colonoscopy and Polyp Removal in Hyderabad | Dr Hemanth Chinthala',
         desc='Colonoscopy examines the whole large bowel and removes polyps before they can turn into cancer. Preparation, what to expect and when to have one. Medicover Hospital, Financial District, Hyderabad.',
         h1='Colonoscopy',
         lede='A colonoscopy examines the whole large bowel, the colon and rectum, with a flexible camera. It finds the cause of symptoms such as bleeding or a change in bowel habit, and polyps can be removed during the same test.',
         body='''
<h2>When it is advised</h2>
<ul>
<li>Blood in the stool.</li>
<li>A change in bowel habit lasting more than a few weeks.</li>
<li>Iron-deficiency anaemia or weight loss without a clear reason.</li>
<li>Long-standing diarrhoea.</li>
<li>Diagnosing and monitoring Crohn's disease and ulcerative colitis.</li>
<li>Follow-up after polyps have been removed.</li>
<li>Screening for bowel cancer.</li>
</ul>
<p class="note">Most bowel cancers start as small growths called polyps. Removing them during a colonoscopy stops them turning into cancer.</p>

<h2>Preparing your bowel</h2>
<p>The bowel must be completely empty so nothing is missed. You will get written instructions; usually:</p>
<ul>
<li>A low-fibre diet for a day or two before.</li>
<li>A laxative drink the evening before and, often, early on the morning of the test. Stay near a toilet.</li>
<li>Only clear fluids after the laxative.</li>
<li>Iron tablets are often stopped a few days before. Discuss blood thinners and diabetes medicines with the team.</li>
</ul>

<h2>How it is done</h2>
<p>You are given sedation. The test usually takes 20 to 45 minutes. Air or carbon dioxide gently opens the bowel so the lining can be seen. Biopsies and polyp removal are painless.</p>

<h2>After the test</h2>
<p>You may feel bloated for a few hours. Do not drive for the rest of the day. Dr Chinthala will tell you what he found; biopsy results take a few working days.</p>

<h2>Risks</h2>
<p>Colonoscopy is safe. There is a small risk of bleeding after a polyp is removed, and, rarely, of a tear in the bowel wall.</p>
''',
         faq=[('Is the preparation difficult?', 'Drinking the laxative is the least pleasant part, but it is essential. Following the instructions closely means you are less likely to need the test repeated.'),
              ('Will it hurt?', 'With sedation most people are comfortable and remember little. You may feel some cramping or bloating, which passes quickly.'),
              ('When should I have a screening colonoscopy?', 'Screening is usually considered from about 45 to 50, and earlier if a close relative had bowel cancer or polyps. Ask Dr Chinthala whether it is right for you.')],
         related=['ibd', 'endoscopy', 'acidity-reflux']),

    # ------------------------------------------------------------------ conditions
    dict(kind='conditions', slug='fatty-liver', name='Fatty liver', schema='MedicalCondition',
         image=('/img/liver/fatty-780.webp', 780, 566, 'Illustration of a fatty liver: enlarged and pale yellow'),
         title='Fatty Liver Treatment in Hyderabad | Dr Hemanth Chinthala, Hepatologist',
         desc='Fatty liver is very common and often silent, but caught early it can usually be reversed. Causes, tests including FibroScan, and treatment with hepatologist Dr Hemanth Chinthala in Hyderabad.',
         h1='Fatty liver',
         lede='In fatty liver, fat builds up inside the liver cells. It is very common in India, often causes no symptoms, and is usually found on an ultrasound or a blood test. Caught early, it can usually be reversed.',
         body='''
<h2>The two main types</h2>
<ul>
<li><strong>MASLD</strong> (metabolic dysfunction-associated steatotic liver disease, previously called NAFLD) is linked with excess weight, especially around the waist, diabetes, high cholesterol and high blood pressure. It also occurs in people who are not overweight, and is common in Indians.</li>
<li><strong>Alcohol-related fatty liver</strong> is caused by regular drinking. Some people have both.</li>
</ul>

<h2>Why it matters</h2>
<p>For many people the fat does no lasting harm. In some, it causes inflammation (steatohepatitis) and scarring (fibrosis), which over years can lead to cirrhosis. Fatty liver is also linked with a higher risk of heart disease and diabetes, so it is a signal to look after your overall health.</p>

<h2>Symptoms</h2>
<p>Usually none. Some people feel tired or have a dull discomfort under the right ribs.</p>

<h2>Tests</h2>
<ul>
<li>Blood tests: liver tests, blood sugar and cholesterol.</li>
<li>Ultrasound of the abdomen.</li>
<li><strong>FibroScan</strong>, a quick, painless scan that measures liver stiffness, to check for scarring.</li>
<li>Rarely, a liver biopsy.</li>
</ul>

<h2>Treatment</h2>
<ul>
<li><strong>Weight loss</strong>: losing 5% of your body weight reduces liver fat; losing 7 to 10% can reduce inflammation and scarring.</li>
<li><strong>Diet</strong>: less sugar, sweet drinks, refined carbohydrates and fried food; more vegetables, pulses and whole grains.</li>
<li><strong>Exercise</strong>: at least 150 minutes a week of brisk walking or similar.</li>
<li><strong>Stop alcohol</strong>, especially if there is any scarring.</li>
<li>Good control of diabetes, cholesterol and blood pressure.</li>
<li>Medicines for selected patients, and regular checks of liver scarring.</li>
</ul>
''',
         faq=[('Can fatty liver be cured?', 'In its early stages, yes, it can usually be reversed with weight loss, diet, exercise and stopping alcohol. Scarring can also improve, though more slowly.'),
              ('I am not overweight. Can I still have fatty liver?', 'Yes. Fatty liver in people of normal weight is common in India, often linked with fat around the waist, diabetes or high cholesterol.'),
              ('Do I need to stop alcohol completely?', 'It is strongly advised, and essential if there is any scarring in the liver.')],
         related=['pancreatitis', 'ibd', 'endoscopy']),

    dict(kind='conditions', slug='ibd', name="Crohn's disease and ulcerative colitis", schema='MedicalCondition',
         image=('/img/ibd/inflamed-780.webp', 780, 613, 'Illustration of the colon lining during a flare of inflammatory bowel disease'),
         title="Crohn's Disease and Ulcerative Colitis Specialist in Hyderabad | Dr Hemanth Chinthala",
         desc="Inflammatory bowel disease (IBD) care in Hyderabad: diagnosis of Crohn's disease and ulcerative colitis, telling Crohn's from intestinal TB, and treatment aimed at healing the gut lining.",
         h1="Crohn's disease and ulcerative colitis",
         lede="Crohn's disease and ulcerative colitis are the two main forms of inflammatory bowel disease (IBD): long-term inflammation of the gut that tends to come and go in flares. IBD is a focus of Dr Chinthala's clinical work and research.",
         body='''
<h2>How they differ</h2>
<ul>
<li><strong>Ulcerative colitis</strong> affects only the large bowel. The inflammation starts in the rectum and spreads upwards in one continuous stretch, in the lining of the bowel.</li>
<li><strong>Crohn's disease</strong> can affect any part of the gut, from mouth to anus, most often the end of the small intestine. It is often patchy and can go through the whole bowel wall, which can lead to narrowings (strictures) and fistulas.</li>
</ul>

<h2>Symptoms</h2>
<ul>
<li>Diarrhoea, often with blood or mucus, and an urgent need to go.</li>
<li>Belly pain and cramping.</li>
<li>Weight loss, tiredness, fever and anaemia.</li>
<li>Sometimes mouth ulcers, joint pain, or eye and skin problems.</li>
</ul>

<h2>Diagnosis</h2>
<p>Blood tests and a stool test called calprotectin, colonoscopy with biopsies, and imaging such as MRI. Intestinal ultrasound checks bowel inflammation without radiation or sedation, and capsule endoscopy can look at the small intestine.</p>
<p class="note">In India, Crohn's disease and intestinal tuberculosis can look almost the same. Telling them apart matters, because the treatments are very different. This is part of Dr Chinthala's research.</p>

<h2>Treatment</h2>
<p>Treatment is planned for each person. It may include anti-inflammatory medicines (such as mesalamine in ulcerative colitis), short courses of steroids for flares, immune-modifying medicines, biologics and newer targeted tablets, nutrition support, and surgery for some. The aim is not only to feel better but to heal the lining of the gut, which lowers the chance of flares, complications and surgery.</p>

<h2>Living with IBD</h2>
<p>Regular follow-up, vaccinations, attention to anaemia and bone health, and planning ahead for pregnancy all help. Most people with IBD lead full, active lives.</p>
''',
         faq=[('Can IBD be cured?', 'There is no cure yet, but most people control it well with treatment and have long periods without symptoms.'),
              ('Can diet cure IBD?', 'No single diet cures it, but good nutrition matters, and some changes can ease symptoms during a flare.'),
              ('Could it be tuberculosis?', "Intestinal TB can look very like Crohn's disease. Biopsies, scans and other tests help tell them apart before treatment is started.")],
         related=['colonoscopy', 'fatty-liver', 'endoscopy']),

    dict(kind='conditions', slug='pancreatitis', name='Pancreatitis', schema='MedicalCondition',
         title='Pancreatitis Treatment in Hyderabad | Dr Hemanth Chinthala',
         desc='Acute and chronic pancreatitis: causes such as gallstones and alcohol, warning signs, and treatment including ERCP and EUS, with Dr Hemanth Chinthala at Medicover Hospital, Hyderabad.',
         h1='Pancreatitis',
         lede='Pancreatitis is inflammation of the pancreas, the gland behind the stomach that makes digestive enzymes and insulin. It can be sudden (acute) or long-lasting (chronic).',
         body='''
<h2>Acute pancreatitis</h2>
<p>It usually causes severe pain in the upper abdomen, often spreading to the back, with vomiting. <strong>This needs urgent hospital care.</strong></p>
<p>The most common causes are gallstones and alcohol. Others include very high triglycerides (a blood fat), some medicines and, occasionally, a procedure such as ERCP.</p>
<p>Treatment is with fluids, pain relief and nutrition, and by treating the cause: for example ERCP for a stone blocking the bile duct, and removal of the gallbladder after gallstone pancreatitis. Most people recover within a week. Severe attacks may need intensive care, and fluid collections that form later can sometimes be drained with EUS.</p>

<h2>Chronic pancreatitis</h2>
<p>Repeated or long-term inflammation slowly damages the pancreas. It can cause:</p>
<ul>
<li>Repeated or constant belly pain.</li>
<li>Weight loss and oily, foul-smelling stools, because food is not digested properly.</li>
<li>Diabetes.</li>
</ul>
<p>Causes include alcohol, smoking and genetic factors. A form seen in South India in people who do not drink, called tropical or idiopathic chronic pancreatitis, is also common.</p>
<p>Treatment includes stopping alcohol and smoking, enzyme capsules taken with meals, diabetes care, pain management, and endoscopic treatment (ERCP) for stones or narrowings in the pancreatic duct. Some people need surgery.</p>
''',
         faq=[('Is pancreatitis an emergency?', 'Acute pancreatitis is. Severe upper belly pain with vomiting needs hospital care the same day.'),
              ('Can I drink alcohol after pancreatitis?', 'No. Alcohol can trigger new attacks and speed up damage to the pancreas.'),
              ('Why do I need enzyme capsules?', 'A damaged pancreas makes too few digestive enzymes. The capsules, taken with meals, help you digest food, gain weight and reduce oily stools.')],
         related=['ercp', 'eus', 'fatty-liver']),

    dict(kind='conditions', slug='acidity-reflux', name='Acidity and acid reflux (GERD)', schema='MedicalCondition',
         title='Acidity and Acid Reflux (GERD) Treatment in Hyderabad | Dr Hemanth Chinthala',
         desc='Frequent acidity or heartburn may be GERD. Triggers, warning signs, tests such as endoscopy and 24-hour pH study, and treatment with gastroenterologist Dr Hemanth Chinthala in Hyderabad.',
         h1='Acidity and acid reflux (GERD)',
         lede='Acid reflux is when stomach acid flows back up into the food pipe, causing a burning feeling in the chest and a sour taste. Most people have it now and then. When it happens often, it is called gastro-oesophageal reflux disease, or GERD.',
         body='''
<h2>Symptoms</h2>
<ul>
<li>Heartburn: burning behind the breastbone, often after meals or at night.</li>
<li>Food or sour liquid coming back up, and sour belching.</li>
<li>Cough, a hoarse voice or a feeling of a lump in the throat.</li>
</ul>
<p class="note">Chest pain with sweating, breathlessness or pain spreading to the arm or jaw can be a heart problem. Call 108 or go to an emergency department.</p>

<h2>Common triggers</h2>
<p>A weak valve at the bottom of the food pipe, a hiatus hernia, excess weight, large or late meals, spicy, fried and fatty food, tea, coffee, alcohol, smoking and some medicines, such as painkillers.</p>

<h2>When to see a gastroenterologist</h2>
<ul>
<li>Symptoms more than twice a week, or not helped by antacids.</li>
<li>Difficulty or pain when swallowing.</li>
<li>Vomiting blood, or black stools.</li>
<li>Weight loss, or new symptoms after the age of 50.</li>
<li>Taking acid tablets for months without a review.</li>
</ul>

<h2>Tests</h2>
<p>Upper GI endoscopy looks at the food pipe and stomach. A 24-hour pH study measures how much acid comes up, and high-resolution manometry checks how the food pipe moves, for example before surgery or when swallowing is difficult. Dr Chinthala performs these tests.</p>

<h2>Treatment</h2>
<ul>
<li>Smaller meals, and dinner at least three hours before bed.</li>
<li>Raising the head end of the bed.</li>
<li>Losing excess weight and stopping smoking.</li>
<li>Acid-reducing medicines for a set course, with a plan to step down.</li>
<li>Endoscopic or surgical treatment for selected patients.</li>
</ul>
''',
         faq=[('Is it safe to take acid tablets for years?', 'They are safe for many people, but long-term use should be reviewed. Often the dose can be reduced or stopped once the cause is treated.'),
              ('Could my acidity be a heart problem?', 'Sometimes heart pain feels like acidity. Chest pain with sweating, breathlessness or pain in the arm or jaw needs emergency care.'),
              ('Does spicy food cause ulcers?', 'No. Most ulcers come from H. pylori infection or painkillers. Spicy food can make reflux symptoms worse, though.')],
         related=['endoscopy', 'ibd', 'fatty-liver']),
]
BY_SLUG = {p['slug']: p for p in PAGES}


def link(slug):
    p = BY_SLUG[slug]
    return f'../{p["kind"]}/{slug}'


def render(p):
    section_name = 'Procedures' if p['kind'] == 'procedures' else 'Conditions'
    section_anchor = '#procedures' if p['kind'] == 'procedures' else '#care'
    ld = [
        {'@context': 'https://schema.org', '@type': 'MedicalWebPage', 'name': p['title'], 'description': p['desc'], 'inLanguage': 'en-IN',
         'about': {'@type': p['schema'], 'name': p['name']},
         'publisher': {'@type': 'Physician', 'name': 'Dr Hemanth Chinthala', 'url': '%SITE%'}},
        {'@context': 'https://schema.org', '@type': 'BreadcrumbList', 'itemListElement': [
            {'@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': '%SITE%'},
            {'@type': 'ListItem', 'position': 2, 'name': section_name, 'item': f'%SITE%{section_anchor}'},
            {'@type': 'ListItem', 'position': 3, 'name': p['name'], 'item': f'%SITE%{p["kind"]}/{p["slug"]}'}]},
    ]
    ld_html = ''.join(f'\n  <script type="application/ld+json">{json.dumps(x, ensure_ascii=False)}</script>' for x in ld)
    faq = ''.join(f'''
          <details class="qa">
            <summary>{q}</summary>
            <div class="qa__a"><p>{a}</p></div>
          </details>''' for q, a in p['faq'])
    related = ''.join(f'<li><a href="{link(s)}">{BY_SLUG[s]["name"]}</a></li>' for s in p['related'])
    img = ''
    if p.get('image'):
        src, w, h, alt = p['image']
        img = f'\n        <figure class="p-figure"><img src="{src}" width="{w}" height="{h}" alt="{alt}" decoding="async" /><figcaption class="caption">Illustration made with Google Gemini. Simplified, not to scale.</figcaption></figure>'
    return f'''<!doctype html>
<html lang="en-IN">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
  <title>{p['title']}</title>
  <meta name="description" content="{p['desc']}" />
  <meta name="theme-color" content="#f2eee6" />
  <link rel="icon" href="/favicon.ico" sizes="48x48" />
  <link rel="icon" href="/icons/favicon-32.png" type="image/png" sizes="32x32" />
  <link rel="apple-touch-icon" href="/icons/apple-touch-icon.png" />
  <meta property="og:type" content="article" />
  <meta property="og:title" content="{p['title']}" />
  <meta property="og:description" content="{p['desc']}" />
  <meta property="og:image" content="/img/og.jpg" />
  <meta name="twitter:card" content="summary_large_image" />
  <link rel="preload" as="font" type="font/woff2" href="/fonts/newsreader-normal.woff2" crossorigin />{ld_html}
  <script type="module" src="/src/page.js"></script>
</head>
<body class="p-body">
  <a class="skip" href="#main">Skip to content</a>
  <header class="phead">
    <div class="wrap phead__in">
      <a class="brand" href="../">
        <img class="brand__mark" src="/img/brand/mark-88.webp" srcset="/img/brand/mark-44.webp 1x, /img/brand/mark-88.webp 2x, /img/brand/mark-132.webp 3x" width="40" height="44" alt="" decoding="async" />
        <span class="brand__name">Dr Hemanth Chinthala</span>
        <span class="brand__meta">The Gut Doctor</span>
      </a>
      <nav class="phead__links" aria-label="Primary">
        <a href="../#care">Conditions</a>
        <a href="../#procedures">Procedures</a>
        <a class="btn" href="../#book">Book a visit</a>
      </nav>
    </div>
  </header>

  <main id="main" class="wrap">
    <nav class="crumbs" aria-label="Breadcrumb"><a href="../">Home</a> <span aria-hidden="true">/</span> <a href="../{section_anchor}">{section_name}</a> <span aria-hidden="true">/</span> <span aria-current="page">{p['name']}</span></nav>
    <div class="p-grid">
      <article class="p-article">
        <h1 class="p-title">{p['h1']}</h1>
        <p class="p-lede">{p['lede']}</p>{img}
        <div class="prose">{p['body']}</div>

        <section class="p-faq" aria-labelledby="faq-h">
          <h2 id="faq-h" class="p-h2">Common questions</h2>
          <div class="faq__list">{faq}
          </div>
        </section>

        <p class="p-disclaimer">This page gives general information and does not replace a consultation. Treatment is always planned for each patient.</p>
      </article>

      <aside class="p-aside" aria-label="Book a consultation">
        <div class="p-card">
          <p class="p-card__name">Dr Hemanth Chinthala</p>
          <p class="p-card__role">{ROLE}, Medicover Hospital, Financial District, Hyderabad</p>
          <p class="p-card__hours">Monday to Saturday, 9 am to 4 pm</p>
          <a class="btn btn--light btn--full" href="../#book">Book a consultation</a>
          <p class="p-card__alt"><a href="tel:{PHONE_TEL}">Call {PHONE}</a> <a href="{WA}" target="_blank" rel="noopener">WhatsApp</a></p>
        </div>
        <div class="p-related">
          <p class="label">Related</p>
          <ul role="list">{related}</ul>
        </div>
      </aside>
    </div>
  </main>

  <footer class="footer">
    <div class="wrap footer__grid">
      <p class="footer__mark">Dr Hemanth Chinthala</p>
      <p class="footer__caption">The Gut Doctor</p>
      <p class="footer__line">Consultant gastroenterologist, hepatologist and interventional endoscopist at Medicover Hospital, Financial District, Hyderabad.</p>
      <nav class="footer__nav" aria-label="Footer">
        <a href="../">Home</a>
        <a href="../#care">Conditions</a>
        <a href="../#procedures">Procedures</a>
        <a href="../#book">Book</a>
      </nav>
      <p class="footer__legal">In an emergency, call <a href="tel:108">108</a>. This website gives general information and does not replace a consultation.</p>
    </div>
  </footer>
  <a class="wa is-visible" href="{WA}" target="_blank" rel="noopener" aria-label="Chat on WhatsApp"><svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16.04 3C9 3 3.3 8.66 3.3 15.65c0 2.23.59 4.41 1.71 6.33L3.2 28.8l7.03-1.83a12.8 12.8 0 0 0 5.8 1.39h.01c7.03 0 12.76-5.66 12.76-12.65C28.8 8.66 23.07 3 16.04 3Zm0 23.2h-.01a10.6 10.6 0 0 1-5.39-1.47l-.39-.23-4.17 1.09 1.11-4.04-.25-.41a10.42 10.42 0 0 1-1.62-5.6c0-5.8 4.75-10.52 10.6-10.52 2.83 0 5.49 1.1 7.49 3.09a10.43 10.43 0 0 1 3.1 7.44c0 5.81-4.75 10.53-10.47 10.53Zm5.8-7.87c-.32-.16-1.88-.92-2.17-1.03-.29-.1-.5-.16-.71.16-.21.31-.82 1.03-1 1.24-.19.21-.37.24-.69.08-.32-.16-1.34-.49-2.56-1.57a9.54 9.54 0 0 1-1.77-2.19c-.18-.32-.02-.49.14-.65.14-.14.32-.37.48-.55.16-.18.21-.31.32-.52.1-.21.05-.4-.03-.55-.08-.16-.71-1.71-.98-2.34-.26-.62-.52-.53-.71-.54h-.61c-.21 0-.55.08-.84.39-.29.31-1.1 1.07-1.1 2.62 0 1.54 1.13 3.04 1.29 3.25.16.21 2.22 3.37 5.38 4.72.75.32 1.34.52 1.8.66.76.24 1.44.2 1.99.12.61-.09 1.88-.76 2.14-1.5.27-.74.27-1.37.19-1.5-.08-.13-.29-.21-.61-.37Z"/></svg></a>
</body>
</html>
'''


def main():
    for p in PAGES:
        d = ROOT / p['kind']
        d.mkdir(exist_ok=True)
        (d / f'{p["slug"]}.html').write_text(render(p), encoding='utf-8')
    print(f'{len(PAGES)} pages written')


if __name__ == '__main__':
    main()
